// 版本级聚合：把兄弟节点上「同一部片」的条目收进本节点条目的 MediaSources，
// 列表里只留本节点那一条，多版本选择交给客户端的版本选择器。
//
// 与列表级聚合的区别：列表级是「同一部片出现 N 条」（每条属于一台服务器），
// 版本级是「一条片带 N 个源」。
//
// 归并键：每个条目给出一组候选身份（tmdb id、名称 + 年份），两边取交集非空即配对。
//   - tmdb id —— 跨服最稳，Emby 的 ProviderIds.Tmdb 是刮削结果，不受改名影响；
//   - 名称 + 年份 —— 条目没有 ProviderIds 时的兜底，年份参与比较，避免同名重制版合并。
// 用集合而不是「按强度挑一个」：客户端没请求 Fields=ProviderIds 时本节点条目没有
// ProviderIds、而 peer 条目有，单一最强键会永远配不上，功能静默失效。
//
// 片源 Id 自包含：`n<base64url(节点名)>.<base64url(JSON [peer 条目 Id, peer 片源 Id])>`。
// 前缀段沿用列表级聚合的 n<节点名>.<原 Id> 形状，所以现有解码逻辑不用改；
// 第二段自己再解一次，PlaybackInfo / 直连播放就能同时找回「哪个节点、哪条条目、
// 哪个片源」，不需要任何 KV 索引或跨请求状态。
//
// 本文件所有函数都写时复制：入参 payload / Items / MediaSources 一律不改。

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

// 一个条目可能同时给出多种可匹配的身份，两边按「交集非空」配对。
//
// 为什么要多个键而不是一个「最强键」：客户端没请求 Fields=ProviderIds 时，本节点
// 条目上没有 ProviderIds，而 peer 条目（由 peer 的 Emby 生成）可能有。单一最强键
// 在这种不对称情况下永远配不上，等于功能静默失效。改成候选键集合后，
// 本节点给 {name:...}、peer 给 {tmdb:..., name:...}，取交集仍能命中。
export function buildPeerAggregationMatchKeys(item) {
  const keys = new Set();
  if (!isPlainObject(item)) return keys;
  const providerIds = isPlainObject(item.ProviderIds) ? item.ProviderIds : null;
  if (providerIds) {
    // Emby 的大小写不固定：Tmdb / tmdb / TMDB 都出现过。
    for (const [name, value] of Object.entries(providerIds)) {
      if (String(name).toLowerCase() !== "tmdb") continue;
      const tmdbId = String(value ?? "").trim();
      if (tmdbId) keys.add(`tmdb:${tmdbId}`);
    }
  }
  const name = String(item.Name ?? "")
    .trim()
    .toLowerCase();
  if (name) {
    const year = String(item.ProductionYear ?? "").trim();
    // 年份是名称键的一部分：同名不同年（重制版、不同剪辑）不能被合并。
    keys.add(year ? `name:${name}:${year}` : `name:${name}:`);
  }
  return keys;
}

// 把 peer 的条目转成「可挂进本节点条目的版本」。
// 只处理带 MediaSources 的条目：没有 MediaSources 的条目属于列表级聚合的范畴。
export function collectPeerAggregationVersions(peerPayload, peerName, encodeMediaSourceId) {
  const versions = [];
  if (!isPlainObject(peerPayload) || !Array.isArray(peerPayload.Items)) return versions;
  for (const item of peerPayload.Items) {
    if (!isPlainObject(item) || !Array.isArray(item.MediaSources)) continue;
    const matchKeys = buildPeerAggregationMatchKeys(item);
    if (!matchKeys.size) continue;
    const peerItemId = String(item.Id ?? "").trim();
    if (!peerItemId) continue;
    const mediaSources = [];
    for (const mediaSource of item.MediaSources) {
      if (!isPlainObject(mediaSource)) continue;
      // 没有 Id 的 MediaSource 无法被客户端回传选中，用条目 Id 兜底，保证每个版本都可寻址。
      const ownSourceId = String(mediaSource.Id ?? "").trim() || peerItemId;
      mediaSources.push({
        ...mediaSource,
        Id: encodeMediaSourceId(peerName, peerItemId, ownSourceId),
      });
    }
    if (!mediaSources.length) continue;
    // sourceItemId 用 peer 名做命名空间：不同 peer 的条目 Id 可能撞车。
    versions.push({
      matchKeys,
      peerName,
      mediaSources,
      sourceItemId: `${peerName}\u0000${peerItemId}`,
    });
  }
  return versions;
}

// 合并：本节点条目保持不变，同键的 peer 版本追加到它的 MediaSources 后面。
// 返回新的 payload 与统计；一个都没加上时返回 null，调用方按原响应继续。
export function mergePeerAggregationMediaSources(ownPayload, versions) {
  if (!isPlainObject(ownPayload) || !Array.isArray(ownPayload.Items)) return null;
  if (!Array.isArray(versions) || !versions.length) return null;

  // 同一部片在本节点也可能有多条（多线路/多库），全部挂上，避免漏掉某一台服务器。
  // 一个 peer 条目可能挂多个键，所以同一个版本会在多个桶里出现，用 Set 去重。
  const versionsByKey = new Map();
  for (const version of versions) {
    for (const key of version.matchKeys) {
      const bucket = versionsByKey.get(key);
      if (bucket) bucket.push(version);
      else versionsByKey.set(key, [version]);
    }
  }

  let addedVersionCount = 0;
  // 记录「哪个 peer 的哪条条目已被收进本节点条目」，调用方据此跳过重复条目。
  const mergedKeys = new Set();
  const mergedItems = ownPayload.Items.map((item) => {
    const itemKeys = buildPeerAggregationMatchKeys(item);
    if (!itemKeys.size) return item;
    const matched = [];
    const seenVersions = new Set();
    for (const key of itemKeys) {
      for (const version of versionsByKey.get(key) || []) {
        if (seenVersions.has(version)) continue;
        seenVersions.add(version);
        matched.push(version);
      }
    }
    if (!matched.length) return item;

    const ownSources = Array.isArray(item.MediaSources) ? item.MediaSources : [];
    // MediaSource.Id 在同一个条目内必须唯一，否则客户端版本选择器会串版本。
    const seenSourceIds = new Set(
      ownSources.map((source) => String(source?.Id ?? "").trim()).filter(Boolean),
    );
    const nextSources = [...ownSources];
    for (const version of matched) {
      let taken = 0;
      for (const mediaSource of version.mediaSources) {
        const sourceId = String(mediaSource.Id ?? "").trim();
        if (!sourceId || seenSourceIds.has(sourceId)) continue;
        seenSourceIds.add(sourceId);
        nextSources.push(mediaSource);
        addedVersionCount += 1;
        taken += 1;
      }
      // 只要这个 peer 条目有片源被收下，它自己就不该再作为独立条目出现。
      // sourceItemId 里的条目 Id 已 trim，调用方拼跳过键时也要 trim（见 buildPeerAggregationMergedResponse）。
      if (taken) mergedKeys.add(version.sourceItemId);
    }
    if (nextSources.length === ownSources.length) return item;
    // 本节点原本没有 MediaSources 时也补上：客户端只有看到数组才会渲染版本选择器。
    return { ...item, MediaSources: nextSources };
  });

  if (!addedVersionCount) return null;
  return {
    payload: { ...ownPayload, Items: mergedItems },
    addedVersionCount,
    mergedKeys,
  };
}

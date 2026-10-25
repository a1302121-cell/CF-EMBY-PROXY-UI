// 跨节点 PlaybackInfo 版本聚合：把兄弟节点上同一部片的 MediaSources 追加进本节点的
// PlaybackInfo 响应，让客户端的版本选择器看到多个源。
//
// 为什么挂在这里而不是 /Items：实测真实 Emby 客户端（Hills 1.10.1）的流程是
//   点播放 → PlaybackInfo（不带 MediaSourceId）→ 拿 MediaSources → 弹版本选择器
//   → 带 MediaSourceId 再请求一次 PlaybackInfo
// /Items 里的 MediaSources 只是列表元数据，客户端不拿它渲染版本选择器。而且客户端的
// Fields 列表里通常不含 MediaSources，peer 的 /Items 根本不会返回该字段。
//
// 本文件所有函数写时复制：PlaybackInfoCacheStore 会共享表示层的 payload 对象
// （见 playback/rewrite.js 顶部不变量注释），禁止原地修改入参。

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

// 一个条目可能同时给出多种可匹配的身份，两边按「交集非空」配对。
//
// 三种身份，按可靠性排序：
//   tmdb:<id>                         电影最稳，ProviderIds 是刮削结果，不受改名影响
//   episode:<剧名>:<季>:<集>          剧集唯一可靠的跨节点身份。Episode 自身通常没有
//                                     ProviderIds，Name 是「第 3 集」这类会随刮削语言
//                                     变化的值，只有「所属剧 + 季号 + 集号」跨节点稳定
//   name:<名称>:<年份>                兜底。同名同年的不同影片会被错误合并，这是已知代价
export function buildPlaybackVersionMatchKeys(item) {
  const keys = new Set();
  if (!isPlainObject(item)) return keys;
  const providerIds = isPlainObject(item.ProviderIds) ? item.ProviderIds : null;
  if (providerIds) {
    for (const [name, value] of Object.entries(providerIds)) {
      if (String(name).toLowerCase() !== "tmdb") continue;
      const tmdbId = String(value ?? "").trim();
      if (tmdbId) keys.add(`tmdb:${tmdbId}`);
    }
  }
  const episodeKey = buildEpisodeMatchKey(item);
  if (episodeKey) {
    // 剧集只用剧集键，不能再加名称键：Episode 的 Name 是「第 3 集」这类值，
    // 不同剧的第 3 集会因此被错误合并成同一部。
    keys.add(episodeKey);
    return keys;
  }
  const name = String(item.Name ?? "")
    .trim()
    .toLowerCase();
  if (name) {
    const year = String(item.ProductionYear ?? "").trim();
    keys.add(year ? `name:${name}:${year}` : `name:${name}:`);
  }
  return keys;
}

// 剧集身份：`episode:<所属剧名>:<季号>:<集号>`。
//
// 必须带剧名：不同剧的第 1 季第 1 集是两部不同的东西。
// 剧名用 SeriesName（Emby 在 Episode 上直接给出），没有就退回 ParentId —— 但 ParentId
// 是各节点自己的编号，跨节点对不上，所以那种情况下返回空，让上层退回名称匹配。
export function buildEpisodeMatchKey(item) {
  if (!isPlainObject(item)) return "";
  // IndexNumber 缺失（0 或空）说明这不是剧集，或刮削不全。
  const indexNumber = String(item.IndexNumber ?? "").trim();
  if (!indexNumber || indexNumber === "0") return "";
  const parentIndexNumber = String(item.ParentIndexNumber ?? "").trim() || "0";
  const seriesName = String(item.SeriesName ?? "")
    .trim()
    .toLowerCase();
  if (!seriesName) return "";
  return `episode:${seriesName}:${parentIndexNumber}:${indexNumber}`;
}

// 把 peer 的 PlaybackInfo 转成「可挂进本节点响应的版本」。
//
// peer 的 MediaSources 里 Path / DirectStreamUrl 指向 peer 自己的上游，必须换成经由
// 本 Worker 的绝对代理 URL，否则客户端会直接连 peer 的上游（绕开鉴权与配额），
// 或者在跨域下直接失败。
export function collectPeerPlaybackVersions(peerPayload, peerName, peerItemId, buildPeerMediaUrl) {
  const versions = [];
  if (!isPlainObject(peerPayload) || !Array.isArray(peerPayload.MediaSources)) return versions;
  const safePeerItemId = String(peerItemId ?? "").trim();
  if (!safePeerItemId) return versions;
  const mediaSources = [];
  for (const mediaSource of peerPayload.MediaSources) {
    if (!isPlainObject(mediaSource)) continue;
    const ownSourceId = String(mediaSource.Id ?? "").trim();
    // 没有 Id 的 MediaSource 客户端无法回传选中结果，无法寻址。
    if (!ownSourceId) continue;
    const candidateUrl = String(mediaSource.DirectStreamUrl || mediaSource.Path || "").trim();
    const proxiedUrl = candidateUrl ? buildPeerMediaUrl(peerName, candidateUrl) : "";
    if (!proxiedUrl) continue;
    mediaSources.push({
      ...mediaSource,
      // 片源 Id 里同时编进 peer 条目 Id 与片源 Id：回程改道既要换节点，也要把
      // 路径里的条目 Id 换回 peer 自己的编号（peer 不认识本节点的条目 Id）。
      Id: buildPeerMediaSourceId(peerName, peerItemId, ownSourceId),
      Path: proxiedUrl,
      DirectStreamUrl: proxiedUrl,
      // peer 的直连模式与本节点不同，统一按代理方式交付。
      IsRemote: false,
      Protocol: "Http",
      SupportsTranscoding: false,
      TranscodingUrl: "",
    });
  }
  if (!mediaSources.length) return versions;
  versions.push({ peerName, mediaSources });
  return versions;
}

// 片源 Id 编码：`n<base64url(节点名)>.<base64url(JSON [peer 条目 Id, peer 片源 Id])>`。
// 前缀段与列表级聚合的条目 Id 同形，回程解码复用同一套逻辑。
// 第二段必须同时带条目 Id：客户端回传的路径里是本节点的条目 Id，peer 不认识它。
export function buildPeerMediaSourceId(peerName, peerItemId, peerMediaSourceId) {
  const payload = JSON.stringify([String(peerItemId ?? ""), String(peerMediaSourceId ?? "")]);
  return `n${encodeBase64Url(peerName)}.${encodeBase64Url(payload)}`;
}

// 合并：本节点的 MediaSources 保持不变，peer 版本追加在后。
// 返回新的 payload 与统计；一个都没加上时返回 null，调用方按原响应继续。
export function mergePlaybackInfoMediaSources(ownPayload, versions) {
  if (!isPlainObject(ownPayload) || !Array.isArray(ownPayload.MediaSources)) return null;
  if (!Array.isArray(versions) || !versions.length) return null;

  const ownSources = ownPayload.MediaSources;
  // MediaSource.Id 在同一个响应内必须唯一，否则客户端版本选择器会串版本。
  const seenSourceIds = new Set(
    ownSources.map((source) => String(source?.Id ?? "").trim()).filter(Boolean),
  );
  const nextSources = [...ownSources];
  let addedVersionCount = 0;
  for (const version of versions) {
    for (const mediaSource of version.mediaSources) {
      const sourceId = String(mediaSource.Id ?? "").trim();
      if (!sourceId || seenSourceIds.has(sourceId)) continue;
      seenSourceIds.add(sourceId);
      nextSources.push(mediaSource);
      addedVersionCount += 1;
    }
  }
  if (!addedVersionCount) return null;
  return {
    payload: { ...ownPayload, MediaSources: nextSources },
    addedVersionCount,
  };
}

// base64url 编码：与 application-facades.js 里的 encodeBase64UrlUtf8 等价。
// 单独实现一份，避免这个模块反向依赖 facade。
function encodeBase64Url(value) {
  const bytes = new TextEncoder().encode(String(value ?? ""));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

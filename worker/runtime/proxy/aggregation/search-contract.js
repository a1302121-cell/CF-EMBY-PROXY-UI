// Shared contracts for list searches and peer metadata lookups. Credentials never
// travel in peer query strings, and node-local scope IDs must be translated.
const AUTH_HEADERS = [
  "authorization",
  "x-emby-authorization",
  "x-mediabrowser-authorization",
  "x-emby-token",
  "x-mediabrowser-token",
  "x-emby-auth-token",
  "x-mediabrowser-auth-token",
];
const AUTH_QUERY = /^(?:api_?key|token|access_token|authorization|x-emby.*|x-mediabrowser.*)$/i;

export function queryValue(params, name) {
  const lowerName = name.toLowerCase();
  for (const [key, value] of params || []) if (key.toLowerCase() === lowerName) return value;
  return null;
}

export function deleteQuery(params, name) {
  const lowerName = name.toLowerCase();
  // Snapshot the keys: deleting from a live URLSearchParams iterator skips entries.
  for (const key of Array.from(params.keys()))
    if (key.toLowerCase() === lowerName) params.delete(key);
}

export function stripAggregationQueryAuth(url) {
  for (const key of Array.from(url.searchParams.keys()))
    if (AUTH_QUERY.test(key)) url.searchParams.delete(key);
  return url;
}

export function aggregationHeaders(request, node, peer = false) {
  const configured = new Headers(node?.headers || {});
  const hasConfiguredAuth = AUTH_HEADERS.some((key) => configured.get(key)?.trim());
  // A token presented to one server is not a credential for an unrelated server.
  if (peer && !hasConfiguredAuth) return null;
  const headers = new Headers({ accept: "application/json" });
  if (!peer && !hasConfiguredAuth) {
    for (const key of AUTH_HEADERS) {
      const value = request?.headers?.get(key);
      if (value) headers.set(key, value);
    }
    const params = new URL(request.url).searchParams;
    const token =
      queryValue(params, "api_key") ||
      queryValue(params, "ApiKey") ||
      queryValue(params, "X-Emby-Token");
    if (token && !headers.has("X-Emby-Token")) headers.set("X-Emby-Token", token);
  }
  for (const [key, value] of configured) {
    if (/^(?:host|content-length|connection|transfer-encoding|cookie)$/i.test(key)) continue;
    headers.set(key, value);
  }
  return headers;
}

export function isEmptyFirstSearchPage(url, payload) {
  const start = Number(queryValue(url.searchParams, "StartIndex") || 0);
  const limit = queryValue(url.searchParams, "Limit");
  return (
    start === 0 &&
    (limit === null || Number(limit) > 0) &&
    Array.isArray(payload?.Items) &&
    payload.Items.length === 0 &&
    (payload.TotalRecordCount == null || Number(payload.TotalRecordCount) === 0)
  );
}

// Cancel only this wait, not a shared single-flight metadata lookup.
export function awaitAggregation(promise, signal) {
  if (!signal) return promise;
  return new Promise((resolve, reject) => {
    const abort = () => reject(new Error("aggregation_aborted"));
    const cleanup = () => signal.removeEventListener("abort", abort);
    signal.addEventListener("abort", abort, { once: true });
    Promise.resolve(promise).then(
      (value) => {
        cleanup();
        resolve(value);
      },
      (error) => {
        cleanup();
        reject(error);
      },
    );
    if (signal.aborted) {
      cleanup();
      abort();
    }
  });
}

export function aggregationBudget(requestSignal, timeoutMs) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timer = setTimeout(abort, timeoutMs);
  requestSignal?.addEventListener("abort", abort, { once: true });
  if (requestSignal?.aborted) abort();
  return {
    signal: controller.signal,
    dispose() {
      clearTimeout(timer);
      requestSignal?.removeEventListener("abort", abort);
    },
  };
}

function providerIds(item) {
  return new Map(
    Object.entries(item?.ProviderIds || {})
      .filter(([, value]) => String(value || "").trim())
      .map(([key, value]) => [key.toLowerCase(), String(value)]),
  );
}

function sameIdentity(own, peer, ownProviders) {
  if (!own?.Type || own.Type !== peer?.Type) return false;
  const peerProviders = providerIds(peer);
  let matched = false;
  for (const [key, value] of ownProviders) {
    if (!peerProviders.has(key)) continue;
    if (peerProviders.get(key) !== value) return false;
    matched = true;
  }
  if (matched) return true;
  // Folder names and season/episode titles are not cross-server identities.
  return (
    /^(Movie|Series)$/.test(own.Type) &&
    !!own.ProductionYear &&
    Number(own.ProductionYear) === Number(peer.ProductionYear) &&
    String(own.Name || "")
      .trim()
      .toLowerCase() ===
      String(peer.Name || "")
        .trim()
        .toLowerCase()
  );
}

export async function translatePeerSearchScope({
  rawUrl,
  proxyPath,
  ownTarget,
  peerTarget,
  ownHeaders,
  peerHeaders,
  buildUrl,
  readJson,
}) {
  const url = buildUrl(peerTarget, proxyPath);
  url.search = rawUrl.search;
  stripAggregationQueryAuth(url);
  const ownUser =
    queryValue(rawUrl.searchParams, "UserId") ||
    /^\/(?:emby\/|mediabrowser\/)?users\/([^/]+)\/items/i.exec(proxyPath)?.[1];
  let peerUser = "";
  if (ownUser) {
    const auth = peerHeaders.get("Authorization") || peerHeaders.get("X-Emby-Authorization") || "";
    const configuredUser = /\bUserId\s*=\s*"([^"\r\n]+)"/i.exec(auth)?.[1];
    const user = await readJson(
      buildUrl(
        peerTarget,
        configuredUser ? `/Users/${encodeURIComponent(configuredUser)}` : "/Users/Me",
      ),
      peerHeaders,
    );
    peerUser = String(user?.Id || "").trim();
    if (!peerUser || (configuredUser && peerUser !== configuredUser))
      throw new Error("unmapped_user");
    deleteQuery(url.searchParams, "UserId");
    url.searchParams.set("UserId", peerUser);
    url.pathname = url.pathname.replace(
      /(\/users\/)[^/]+(\/items)/i,
      `$1${encodeURIComponent(peerUser)}$2`,
    );
  }
  const withUser = (targetUrl, user) => {
    if (user) targetUrl.searchParams.set("UserId", user);
    return targetUrl;
  };
  const mapped = new Map();
  async function mapId(id, depth = 0) {
    if (mapped.has(id)) return mapped.get(id);
    if (!id || !ownTarget || depth > 2) throw new Error("unmapped_scope");
    const ownUrl = withUser(buildUrl(ownTarget, `/Items/${encodeURIComponent(id)}`), ownUser);
    ownUrl.searchParams.set(
      "Fields",
      "ProviderIds,ProductionYear,SeriesId,IndexNumber,CollectionType",
    );
    const own = await readJson(ownUrl, ownHeaders);
    if (!own?.Type) throw new Error("unmapped_scope");
    let candidates = [],
      match;
    if (own.Type === "Season" && own.SeriesId && Number.isInteger(own.IndexNumber)) {
      const seriesId = await mapId(String(own.SeriesId), depth + 1);
      const seasons = await readJson(
        withUser(buildUrl(peerTarget, `/Shows/${encodeURIComponent(seriesId)}/Seasons`), peerUser),
        peerHeaders,
      );
      candidates = seasons?.Items || [];
      match = (item) => item.Type === "Season" && item.IndexNumber === own.IndexNumber;
    } else if (own.Type === "CollectionFolder" && own.CollectionType && peerUser) {
      const views = await readJson(
        buildUrl(peerTarget, `/Users/${encodeURIComponent(peerUser)}/Views`),
        peerHeaders,
      );
      candidates = views?.Items || [];
      match = (item) =>
        item.Type === own.Type &&
        item.CollectionType === own.CollectionType &&
        item.Name === own.Name;
    } else {
      const search = withUser(buildUrl(peerTarget, "/Items"), peerUser);
      search.searchParams.set("IncludeItemTypes", own.Type);
      search.searchParams.set("Recursive", "true");
      search.searchParams.set("Fields", "ProviderIds,ProductionYear");
      search.searchParams.set("Limit", "50");
      const providers = providerIds(own);
      if (providers.size)
        search.searchParams.set(
          "AnyProviderIdEquals",
          [...providers].map(([key, value]) => `${key}.${value}`).join(","),
        );
      else if (/^(Movie|Series)$/.test(own.Type) && own.Name && own.ProductionYear)
        search.searchParams.set("SearchTerm", own.Name);
      else throw new Error("unmapped_scope");
      const result = await readJson(search, peerHeaders);
      if (Number(result?.TotalRecordCount) > 50) throw new Error("ambiguous_scope");
      candidates = result?.Items || [];
      match = (item) => sameIdentity(own, item, providers);
    }
    let matched;
    for (const item of Array.isArray(candidates) ? candidates : []) {
      if (!item?.Id || !match(item)) continue;
      if (matched) throw new Error("unmapped_scope");
      matched = item;
    }
    if (!matched) throw new Error("unmapped_scope");
    const peerId = String(matched.Id);
    mapped.set(id, peerId);
    return peerId;
  }
  const episodes = /^\/(?:emby\/|mediabrowser\/)?shows\/([^/]+)\/episodes$/i.exec(proxyPath);
  if (episodes)
    url.pathname = url.pathname.replace(
      /(\/shows\/)[^/]+(\/episodes)$/i,
      `$1${encodeURIComponent(await mapId(decodeURIComponent(episodes[1])))}$2`,
    );
  for (const [key, value] of Array.from(url.searchParams)) {
    if (/^(parentid|seasonid|seriesid|ids)$/i.test(key)) {
      const ids = value.split(",").filter(Boolean);
      if (!ids.length || ids.length > 8) throw new Error("unmapped_scope");
      const peerIds = [];
      for (const id of ids) peerIds.push(await mapId(id));
      url.searchParams.set(key, peerIds.join(","));
    } else if (/ids?$/i.test(key) && !/^(userid|deviceid)$/i.test(key)) {
      throw new Error("unsupported_scope");
    }
  }
  return url;
}

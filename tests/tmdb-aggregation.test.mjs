import assert from "node:assert/strict";
import test from "node:test";
import { createTestApplication, resetIsolateState } from "../worker/testing/hooks.js";
import {
  aggregationBudget,
  awaitAggregation,
} from "../worker/runtime/proxy/aggregation/search-contract.js";
import { readResponseBytesWithLimit } from "../worker/core/http-body.js";
import { convertTmdbRequestFromUrl } from "../worker/runtime/application-facades.js";
import {
  createAggregationLookupState,
  readAggregationLookup,
} from "../worker/runtime/proxy/aggregation/lookup-cache.js";

const json = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", ETag: '"origin"' },
  });
const empty = { Items: [], TotalRecordCount: 0 };
const own = { Items: [{ Id: "a1", Name: "Own" }], TotalRecordCount: 1 };
const peer = { Items: [{ Id: "b1", Name: "Peer" }], TotalRecordCount: 1 };
const providerQuery = "/Items?AnyProviderIdEquals=tmdb.555&IncludeItemTypes=Movie";

test("metadata cache deduplicates cold work, expires misses, and keeps hot entries under its bound", async () => {
  const state = createAggregationLookupState(),
    cache = state.TmdbLookupCache;
  let time = 0,
    loads = 0;
  const read = (key, value = key) =>
    readAggregationLookup(
      state,
      cache,
      key,
      100_000,
      async () => {
        loads++;
        return value;
      },
      () => time,
    );
  assert.deepEqual(
    await Promise.all(Array.from({ length: 20 }, () => read("hot"))),
    Array(20).fill("hot"),
  );
  assert.equal(loads, 1);
  await read("miss", null);
  time = 59_999;
  assert.equal(await read("miss", "found"), null);
  time = 60_000;
  assert.equal(await read("miss", "found"), "found");
  time = 100_000;
  assert.equal(await read("hot", "updated"), "updated");
  for (let i = 0; i < 4094; i++) await read(`item-${i}`);
  await read("hot");
  await read("new");
  assert.equal(cache.size, 4096);
  assert.equal(cache.has("hot"), true);
  assert.equal(cache.has("miss"), false);
  assert.equal(state.flights.size, 0);
});

test("bounded flights retain existing waiters, release failures, and isolate cancellation", async () => {
  const state = createAggregationLookupState(),
    cache = state.TmdbLookupCache;
  const gate = Promise.withResolvers();
  const flights = Array.from({ length: 128 }, (_, i) =>
    readAggregationLookup(state, cache, String(i), 1000, () => gate.promise),
  );
  let overflowCalls = 0;
  assert.equal(
    await readAggregationLookup(state, cache, "overflow", 1000, () => {
      overflowCalls++;
    }),
    null,
  );
  assert.equal(overflowCalls, 0);
  const duplicate = readAggregationLookup(state, cache, "0", 1000, () =>
    assert.fail("duplicate flight"),
  );
  assert.equal(duplicate, flights[0]);
  const controller = new AbortController();
  const cancelled = awaitAggregation(duplicate, controller.signal);
  controller.abort();
  await assert.rejects(cancelled, /aggregation_aborted/);
  gate.resolve("ok");
  assert.equal(await duplicate, "ok");
  await Promise.all(flights);
  assert.equal(state.flights.size, 0);
  await assert.rejects(
    readAggregationLookup(state, cache, "failure", 1000, () => {
      throw new Error("test failure");
    }),
    /test failure/,
  );
  assert.equal(state.flights.size, 0);
  assert.equal(
    await readAggregationLookup(state, cache, "failure", 1000, () => "retried"),
    "retried",
  );
});

test("TMDB and todb conversions single-flight across callers and return independent URLs", async (t) => {
  for (const mode of ["tmdb", "emos"]) {
    resetIsolateState();
    let requests = 0;
    const started = Promise.withResolvers(),
      release = Promise.withResolvers();
    const fetchMock = t.mock.method(globalThis, "fetch", async () => {
      requests++;
      started.resolve();
      await release.promise;
      return json(mode === "tmdb" ? { title: "Shared", release_date: "2020" } : { video_id: 42 });
    });
    const env = { ENI_KV: {}, TMDB_API_READ_TOKEN: "fake-token", TODB_API_KEY: "fake-key" };
    const pending = Array.from({ length: 12 }, (_, i) =>
      convertTmdbRequestFromUrl(
        new URL(`https://source.test${providerQuery}&StartIndex=${i}`),
        env,
        {},
        mode,
      ),
    );
    await started.promise;
    assert.equal(requests, 1);
    release.resolve();
    const results = await Promise.all(pending);
    results.forEach((url, i) => assert.equal(url.searchParams.get("StartIndex"), String(i)));
    results[0].searchParams.set("StartIndex", "modified");
    assert.equal(results[1].searchParams.get("StartIndex"), "1");
    await convertTmdbRequestFromUrl(new URL(`https://source.test${providerQuery}`), env, {}, mode);
    assert.equal(requests, 1);
    fetchMock.mock.restore();
  }
});

test("metadata caches isolate credentials, bindings, namespaces, language and media type", async (t) => {
  for (const mode of ["tmdb", "emos"]) {
    resetIsolateState();
    let requests = 0;
    const fetchMock = t.mock.method(globalThis, "fetch", async (_url, init) => {
      requests++;
      if (new Headers(init.headers).get("Authorization") === "Bearer rejected")
        return json({}, 401);
      return json(mode === "tmdb" ? { title: "Movie", name: "Series" } : { video_id: 42 });
    });
    const env = { ENI_KV: {}, TMDB_API_READ_TOKEN: "rejected", TODB_API_KEY: "rejected" };
    const url = new URL(`https://source.test${providerQuery}`);
    assert.equal(await convertTmdbRequestFromUrl(url, env, {}, mode), null);
    assert.equal(await convertTmdbRequestFromUrl(url, env, {}, mode), null);
    assert.equal(requests, 1);
    const config = { tmdbApiReadToken: "accepted", todbApiKey: "accepted" };
    assert.ok(await convertTmdbRequestFromUrl(url, env, config, mode));
    await convertTmdbRequestFromUrl(url, env, config, mode);
    assert.equal(requests, 2);
    await convertTmdbRequestFromUrl(url, { ...env, ENI_KV: {} }, config, mode);
    await convertTmdbRequestFromUrl(
      url,
      { ...env, __CONFIG_CACHE_NAMESPACE: "other" },
      config,
      mode,
    );
    assert.equal(requests, 4);
    if (mode === "tmdb") {
      await convertTmdbRequestFromUrl(url, env, { ...config, tmdbLanguage: "en-US" }, mode);
      url.searchParams.set("IncludeItemTypes", "Series");
      const series = await convertTmdbRequestFromUrl(url, env, config, mode);
      assert.equal(series.searchParams.get("SearchTerm"), "Series");
      assert.equal(requests, 6);
    }
    fetchMock.mock.restore();
  }
});

test("concurrent metadata lookups with different credentials do not share a flight", async (t) => {
  resetIsolateState();
  const gate = Promise.withResolvers(),
    started = Promise.withResolvers();
  let requests = 0;
  t.mock.method(globalThis, "fetch", async (_url, init) => {
    if (++requests === 2) started.resolve();
    await gate.promise;
    const token = new Headers(init.headers).get("Authorization");
    return json({ title: token === "Bearer first" ? "First" : "Second" });
  });
  const url = new URL(`https://source.test${providerQuery}`),
    binding = {};
  const pending = ["first", "second"].map((token) =>
    convertTmdbRequestFromUrl(url, { ENI_KV: binding, TMDB_API_READ_TOKEN: token }, {}, "tmdb"),
  );
  await started.promise;
  gate.resolve();
  assert.deepEqual(
    (await Promise.all(pending)).map((result) => result.searchParams.get("SearchTerm")),
    ["First", "Second"],
  );
});

test("oversized metadata responses are cancelled and negative-cached", async (t) => {
  for (const mode of ["tmdb", "emos"]) {
    resetIsolateState();
    let requests = 0,
      cancelled = 0;
    const fetchMock = t.mock.method(globalThis, "fetch", async () => {
      requests++;
      return new Response(
        new ReadableStream({
          cancel() {
            cancelled++;
          },
        }),
        {
          headers: { "Content-Length": String(512 * 1024 + 1) },
        },
      );
    });
    const env = { TMDB_API_READ_TOKEN: "fake", TODB_API_KEY: "fake" };
    const url = new URL(`https://source.test${providerQuery}`);
    assert.equal(await convertTmdbRequestFromUrl(url, env, {}, mode), null);
    assert.equal(await convertTmdbRequestFromUrl(url, env, {}, mode), null);
    assert.equal(requests, 1);
    assert.equal(cancelled, 1);
    fetchMock.mock.restore();
  }
});

test("metadata flight timeouts settle even when fetch ignores cancellation", async (t) => {
  const timeout = globalThis.setTimeout;
  t.mock.method(globalThis, "setTimeout", (fn, ms, ...args) =>
    timeout(fn, ms === 5000 || ms === 8000 ? 5 : ms, ...args),
  );
  for (const mode of ["tmdb", "emos"]) {
    resetIsolateState();
    let requests = 0;
    const fetchMock = t.mock.method(globalThis, "fetch", async () => {
      if (++requests === 1) return new Promise(() => {});
      return json(mode === "tmdb" ? { title: "Recovered" } : { video_id: 42 });
    });
    const url = new URL(`https://source.test${providerQuery}`);
    const env = { TMDB_API_READ_TOKEN: "fake", TODB_API_KEY: "fake" };
    assert.equal(await convertTmdbRequestFromUrl(url, env, {}, mode), null);
    assert.ok(
      await convertTmdbRequestFromUrl(
        url,
        env,
        { tmdbApiReadToken: "rotated", todbApiKey: "rotated" },
        mode,
      ),
    );
    assert.equal(requests, 2);
    fetchMock.mock.restore();
  }
});

async function fixture({
  path = providerQuery,
  sourceMode = "auto",
  peerMode = "auto",
  peerHeaders = { "X-Emby-Token": "peer-test-token" },
  sourceHeaders,
  handle,
  env: extraEnv = {},
  requestHeaders,
  signal,
  extraPeers = [],
  exercise,
} = {}) {
  resetIsolateState();
  const nodes = [
    {
      name: "alpha",
      target: "https://alpha.example",
      tmdbAggregationEnabled: true,
      aggregationMode: sourceMode,
      headers: sourceHeaders,
    },
    {
      name: "beta",
      target: "https://beta.example",
      tmdbAggregationEnabled: true,
      aggregationMode: peerMode,
      headers: peerHeaders,
    },
    ...extraPeers,
  ];
  const data = new Map(nodes.map((node) => [`node:${node.name}`, JSON.stringify(node)]));
  data.set("sys:nodes_index_full:v2", JSON.stringify(nodes));
  const kvReads = [];
  const kv = {
    async get(key, options = {}) {
      kvReads.push(key);
      const value = data.get(key);
      return value == null ? null : options.type === "json" ? JSON.parse(value) : value;
    },
    async put(key, value) {
      data.set(key, String(value));
    },
    async delete(key) {
      data.delete(key);
    },
    async list() {
      return { keys: [...data.keys()].map((name) => ({ name })), list_complete: true };
    },
  };
  const calls = [],
    logs = [];
  const originalFetch = globalThis.fetch,
    originalLog = console.log;
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(String(input)),
      headers = new Headers(init.headers);
    calls.push({ url, headers, init });
    const response = await handle?.(url, headers, init);
    if (response) return response;
    if (url.hostname === "api.themoviedb.org")
      return json({ title: "Fixture", release_date: "2020-01-01" });
    if (url.hostname === "api.theotherdb.org") return json({ video_id: 9988 });
    return json(empty);
  };
  console.log = (...args) => logs.push(args);
  try {
    const { workerHandler, testPlatform } = createTestApplication();
    const env = {
      ENI_KV: kv,
      TMDB_API_READ_TOKEN: "fixture-tmdb-token",
      TODB_API_KEY: "fixture-todb-key",
      ...extraEnv,
    };
    const request = async (overrides = {}) => {
      const response = await workerHandler.fetch(
        new Request(`https://worker.test/alpha${overrides.path || path}`, {
          headers: overrides.headers || requestHeaders || { "X-Emby-Token": "source-test-token" },
          signal: overrides.signal || signal,
        }),
        { ...env, ...overrides.env },
        { waitUntil() {} },
      );
      return {
        status: response.status,
        headers: response.headers,
        payload: await response.json(),
        calls,
        logs,
      };
    };
    return exercise
      ? await exercise({ request, env, kv, data, testPlatform, calls, logs, kvReads })
      : await request();
  } finally {
    globalThis.fetch = originalFetch;
    console.log = originalLog;
  }
}

test("each peer uses its own aggregation mode starting from the original provider filter", async () => {
  for (const [sourceMode, peerMode] of [
    ["tmdb", "emos"],
    ["emos", "tmdb"],
  ]) {
    const result = await fixture({
      sourceMode,
      peerMode,
      handle(url) {
        if (url.hostname === "beta.example") {
          assert.equal(url.searchParams.has("todbvs"), peerMode === "emos");
          assert.equal(url.searchParams.has("SearchTerm"), peerMode === "tmdb");
          return json(peer);
        }
      },
    });
    assert.equal(result.payload.Items.length, 1);
    assert.match(result.payload.Items[0].Id, /^n/);
  }
});

test("eight peers read the source scope once per request and keep mapped results separate", async () => {
  const extraPeers = Array.from({ length: 7 }, (_, i) => ({
    name: `peer${i}`,
    target: `https://peer${i}.example`,
    tmdbAggregationEnabled: true,
    headers: { "X-Emby-Token": `fake-peer-${i}` },
    aggregationMode: "tmdb",
  }));
  const result = await fixture({
    path: "/Items?ParentId=source-parent&SearchTerm=Episode",
    extraPeers,
    handle(url) {
      if (url.hostname === "alpha.example")
        return json(
          url.pathname === "/Items/source-parent"
            ? { Id: "source-parent", Type: "Series", Name: "Fixture", ProviderIds: { Tmdb: "555" } }
            : own,
        );
      if (url.hostname.endsWith(".example")) {
        const id = `${url.hostname}-series`;
        if (!url.searchParams.has("ParentId"))
          return json({ Items: [{ Id: id, Type: "Series", ProviderIds: { Tmdb: "555" } }] });
        assert.equal(url.searchParams.get("ParentId"), id);
        return json(peer);
      }
    },
  });
  assert.equal(result.payload.Items.length, 9);
  assert.equal(new Set(result.payload.Items.map((item) => item.Id)).size, 9);
  assert.equal(
    result.calls.filter(
      ({ url }) => url.hostname === "alpha.example" && url.pathname === "/Items/source-parent",
    ).length,
    1,
  );
  assert.equal(result.calls.filter(({ url }) => url.hostname === "api.themoviedb.org").length, 1);
});

test("fallback and merge decode each own response once", async (t) => {
  const parse = JSON.parse,
    decodes = new Map();
  t.mock.method(JSON, "parse", (text, ...args) => {
    const value = parse(text, ...args);
    if (value?._parseProbe && value.Items.length < 2)
      decodes.set(value._parseProbe, (decodes.get(value._parseProbe) || 0) + 1);
    return value;
  });
  for (const fallback of [false, true]) {
    decodes.clear();
    const result = await fixture({
      handle(url) {
        if (url.hostname === "alpha.example")
          return json({
            ...(fallback && !url.searchParams.has("todbvs") ? empty : own),
            _parseProbe: url.searchParams.has("todbvs") ? "fallback" : "original",
          });
        if (url.hostname === "beta.example") return json(peer);
      },
    });
    assert.equal(result.payload.Items.length, 2);
    assert.equal(decodes.get("original"), 1);
    if (fallback) assert.equal(decodes.get("fallback"), 1);
  }
});

test("peer node cache is reused and invalidated for credential and enabled changes", async () => {
  await fixture({
    path: "/Items?SearchTerm=Fixture",
    handle(url) {
      if (url.hostname.endsWith(".example")) return json(own);
    },
    async exercise({ request, calls, kvReads, data, kv, testPlatform }) {
      await request();
      const coldReads = kvReads.filter((key) => key === "node:beta").length;
      await request();
      assert.equal(kvReads.filter((key) => key === "node:beta").length, coldReads);
      const node = JSON.parse(data.get("node:beta"));
      node.headers = { "X-Emby-Token": "rotated-test-token" };
      data.set("node:beta", JSON.stringify(node));
      testPlatform.kv.invalidateNodeCaches(["beta"], { kv, invalidateList: true });
      await request();
      assert.equal(
        calls
          .filter(({ url }) => url.hostname === "beta.example")
          .at(-1)
          .headers.get("X-Emby-Token"),
        "rotated-test-token",
      );
      assert.equal(kvReads.filter((key) => key === "node:beta").length, coldReads + 1);
      node.tmdbAggregationEnabled = false;
      data.set("node:beta", JSON.stringify(node));
      testPlatform.kv.invalidateNodeCaches(["beta"], { kv, invalidateList: true });
      const before = calls.filter(({ url }) => url.hostname === "beta.example").length;
      const result = await request();
      assert.equal(calls.filter(({ url }) => url.hostname === "beta.example").length, before);
      assert.deepEqual(result.payload, own);
    },
  });
});

test("JSON flights share only matching binding, namespace, URL and headers; cancelled waiters are independent", async (t) => {
  resetIsolateState();
  const service = createTestApplication().testPlatform.fetch.proxyService;
  const gate = Promise.withResolvers();
  let requests = 0;
  t.mock.method(globalThis, "fetch", async (_url, init) => {
    requests++;
    await gate.promise;
    assert.equal(init.signal.aborted, false);
    return json(peer);
  });
  const url = new URL("https://peer.example/Items?UserId=user-a&StartIndex=0");
  const headers = new Headers({ "X-Emby-Token": "fake-a" });
  const env = { ENI_KV: {} },
    controller = new AbortController();
  const read = (u = url, h = headers, e = env, signal) =>
    service.readAggregationJsonUrl(u, h, signal, "beta", e);
  const first = read(url, headers, env, controller.signal);
  const duplicate = read();
  const variants = [
    read(new URL("https://peer.example/Items?UserId=user-b&StartIndex=0")),
    read(new URL("https://peer.example/Items?UserId=user-a&StartIndex=20")),
    read(url, new Headers({ "X-Emby-Token": "fake-b" })),
    read(url, headers, { ENI_KV: {} }),
    read(url, headers, { ...env, __CONFIG_CACHE_NAMESPACE: "other" }),
  ];
  await new Promise(setImmediate);
  assert.equal(requests, 6);
  controller.abort();
  await assert.rejects(first, /aggregation_aborted/);
  gate.resolve();
  assert.deepEqual(await duplicate, peer);
  await Promise.all(variants);
  await read();
  assert.equal(requests, 7, "completed personalized results must not be cached");
});

test("failed JSON flights are released and the next request retries", async (t) => {
  resetIsolateState();
  const service = createTestApplication().testPlatform.fetch.proxyService;
  let requests = 0;
  t.mock.method(globalThis, "fetch", async () =>
    json(++requests === 1 ? {} : peer, requests === 1 ? 503 : 200),
  );
  const read = () =>
    service.readAggregationJsonUrl(new URL("https://peer.example/Items"), new Headers(), null);
  assert.equal(await read(), null);
  assert.deepEqual(await read(), peer);
  assert.equal(requests, 2);
});

test("auto retries an empty title search once through todb on both source and peer", async () => {
  const result = await fixture({
    handle(url) {
      if (url.hostname.endsWith(".example"))
        return json(
          url.searchParams.has("todbvs") ? (url.hostname.startsWith("alpha") ? own : peer) : empty,
        );
    },
  });
  assert.equal(result.payload.Items.length, 2);
  for (const host of ["alpha.example", "beta.example"]) {
    const requests = result.calls.filter(({ url }) => url.hostname === host);
    assert.equal(requests.length, 2);
    assert.equal(requests[0].url.searchParams.get("SearchTerm"), "Fixture");
    assert.equal(requests[1].url.searchParams.get("todbvs"), "9988");
  }
  assert.equal(result.calls.filter(({ url }) => url.hostname === "api.theotherdb.org").length, 1);
  assert.equal(result.headers.get("ETag"), null);
  assert.equal(result.headers.get("Cache-Control"), "no-store");
});

test("empty later pages, count requests, and nonzero totals do not trigger a second search", async () => {
  for (const [suffix, body] of [
    ["&StartIndex=20", empty],
    ["&Limit=0", empty],
    ["", { Items: [], TotalRecordCount: 10 }],
  ]) {
    const result = await fixture({
      path: providerQuery + suffix,
      handle(url) {
        if (url.hostname.endsWith(".example")) return json(body);
      },
    });
    assert.equal(
      result.calls.some(({ url }) => url.hostname === "api.theotherdb.org"),
      false,
    );
  }
});

test("peer credentials replace all source auth forms without leaking query credentials or cookies", async () => {
  const result = await fixture({
    path: "/Items?SearchTerm=Fixture&api_key=source-query-secret&X-Emby-Token=other-source-secret",
    requestHeaders: {
      Authorization: "Bearer source-secret",
      "X-Emby-Token": "source-secret",
      Cookie: "session=source-secret",
    },
    peerHeaders: { Authorization: "Bearer peer-only-secret" },
    handle(url, headers, init) {
      if (url.hostname === "alpha.example") return json(own);
      if (url.hostname === "beta.example") {
        assert.match(headers.get("Authorization"), /peer-only-secret/);
        assert.equal(headers.get("X-Emby-Token"), null);
        assert.equal(headers.get("Cookie"), null);
        assert.equal(url.searchParams.has("api_key"), false);
        assert.equal(url.searchParams.has("X-Emby-Token"), false);
        assert.equal(init.redirect, "manual");
        return json(peer);
      }
    },
  });
  assert.equal(result.payload.Items.length, 2);
  assert.doesNotMatch(
    JSON.stringify(result.logs),
    /source-secret|peer-only-secret|source-query-secret/,
  );
});

test("peers without explicit credentials are skipped and node headers override conflicting client tokens", async () => {
  const result = await fixture({
    path: "/Items?api_key=client-query",
    peerHeaders: {},
    sourceHeaders: { Authorization: "Bearer own-configured" },
    handle(url, headers) {
      if (url.hostname === "alpha.example") {
        assert.match(headers.get("Authorization"), /own-configured/);
        assert.equal(headers.get("X-Emby-Token"), null);
        assert.equal(url.searchParams.has("api_key"), false);
        return json(own);
      }
    },
  });
  assert.deepEqual(result.payload, own);
  assert.equal(
    result.calls.some(({ url }) => url.hostname === "beta.example"),
    false,
  );
  assert.match(JSON.stringify(result.logs), /missing_peer_credentials/);
});

test("peer auth and network failures preserve own results and log status without credentials", async () => {
  for (const status of [401, 403, 530, 302]) {
    const result = await fixture({
      path: "/Items?api_key=private-client-token",
      handle(url) {
        if (url.hostname === "alpha.example") return json(own);
        if (url.hostname === "beta.example") return json({}, status);
      },
    });
    assert.deepEqual(result.payload, own);
    assert.ok(result.logs.some(([, detail]) => detail?.status === status));
    assert.doesNotMatch(JSON.stringify(result.logs), /private-client-token|peer-test-token/);
  }
});

test("user scoped searches resolve the peer user instead of forwarding a source user id", async () => {
  const result = await fixture({
    path: "/Users/source-user/Items?UserId=source-user&SearchTerm=Fixture",
    handle(url, headers) {
      if (url.hostname === "alpha.example") return json(own);
      if (url.pathname === "/Users/Me") {
        assert.equal(headers.get("X-Emby-Token"), "peer-test-token");
        return json({ Id: "peer-user" });
      }
      if (url.hostname === "beta.example") {
        assert.equal(url.pathname, "/Users/peer-user/Items");
        assert.equal(url.searchParams.get("UserId"), "peer-user");
        return json(peer);
      }
    },
  });
  assert.equal(result.payload.Items.length, 2);
});

test("unresolvable peer users do not turn a user scoped query into an unrestricted query", async () => {
  const result = await fixture({
    path: "/Users/source-user/Items?SearchTerm=Fixture",
    handle(url) {
      if (url.hostname === "alpha.example") return json(own);
      if (url.pathname === "/Users/Me") return json({}, 404);
    },
  });
  assert.deepEqual(result.payload, own);
  assert.equal(result.calls.filter(({ url }) => url.hostname === "beta.example").length, 1);
  assert.match(JSON.stringify(result.logs), /unmapped_user/);
});

test("series and season scopes map by identity and season number while preserving the filter", async () => {
  const result = await fixture({
    path: "/Shows/source-series/Episodes?SeasonId=source-season&UserId=source-user",
    handle(url, headers) {
      if (url.hostname === "alpha.example") {
        assert.equal(headers.get("X-Emby-Token"), "source-test-token");
        if (url.pathname === "/Items/source-series")
          return json({
            Id: "source-series",
            Type: "Series",
            Name: "Series",
            ProviderIds: { Tmdb: "88" },
          });
        if (url.pathname === "/Items/source-season")
          return json({
            Id: "source-season",
            Type: "Season",
            SeriesId: "source-series",
            IndexNumber: 2,
          });
        return json(own);
      }
      if (url.hostname === "beta.example") {
        assert.equal(headers.get("X-Emby-Token"), "peer-test-token");
        if (url.pathname === "/Users/Me") return json({ Id: "peer-user" });
        if (url.pathname === "/Items")
          return json({
            Items: [{ Id: "peer-series", Type: "Series", ProviderIds: { Tmdb: "88" } }],
            TotalRecordCount: 1,
          });
        if (url.pathname === "/Shows/peer-series/Seasons")
          return json({ Items: [{ Id: "peer-season", Type: "Season", IndexNumber: 2 }] });
        assert.equal(url.pathname, "/Shows/peer-series/Episodes");
        assert.equal(url.searchParams.get("SeasonId"), "peer-season");
        assert.equal(url.searchParams.get("UserId"), "peer-user");
        return json(peer);
      }
    },
  });
  assert.equal(result.payload.Items.length, 2);
  assert.equal(
    result.calls.some(({ url }) => url.hostname === "beta.example" && /source-/.test(url.href)),
    false,
  );
});

test("ambiguous parents and unknown folder identities skip peers without dropping the scope", async () => {
  for (const folder of [true, false]) {
    const result = await fixture({
      path: "/Items?ParentId=source-parent&SearchTerm=Fixture",
      handle(url) {
        if (url.hostname === "alpha.example" && url.pathname === "/Items/source-parent")
          return json(
            folder
              ? { Id: "source-parent", Type: "Folder", Name: "Movies" }
              : { Id: "source-parent", Type: "Series", Name: "Series", ProductionYear: 2020 },
          );
        if (url.hostname === "alpha.example") return json(own);
        if (url.hostname === "beta.example")
          return json({
            Items: [1, 2].map((i) => ({
              Id: `peer-${i}`,
              Type: "Series",
              Name: "Series",
              ProductionYear: 2020,
            })),
            TotalRecordCount: 2,
          });
      },
    });
    assert.deepEqual(result.payload, own);
    assert.match(JSON.stringify(result.logs), /unmapped_scope/);
    assert.equal(
      result.calls.some(
        ({ url }) =>
          url.hostname === "beta.example" && url.searchParams.get("SearchTerm") === "Fixture",
      ),
      false,
    );
  }
});

test("aggregation budgets stop stalled waits and honor client cancellation", async () => {
  const budget = aggregationBudget(undefined, 10);
  try {
    await assert.rejects(
      awaitAggregation(new Promise(() => {}), budget.signal),
      /aggregation_aborted/,
    );
  } finally {
    budget.dispose();
  }
  const controller = new AbortController();
  const cancelled = aggregationBudget(controller.signal, 1000);
  controller.abort();
  try {
    await assert.rejects(
      awaitAggregation(Promise.resolve(null), cancelled.signal),
      /aggregation_aborted/,
    );
  } finally {
    cancelled.dispose();
  }
});

test("an unsuccessful empty-result retry leaves the original response readable", async () => {
  const result = await fixture({
    peerHeaders: {},
    handle(url) {
      if (url.hostname === "alpha.example")
        return url.searchParams.has("todbvs") ? json({ error: "denied" }, 403) : json(empty);
    },
  });
  assert.equal(result.status, 200);
  assert.deepEqual(result.payload, empty);
  assert.equal(result.calls.filter(({ url }) => url.hostname === "alpha.example").length, 2);
});

test("case insensitive provider filters are removed without duplicate search or year parameters", async () => {
  const result = await fixture({
    path: "/Items?anyprovideridequals=TMDB.555&includeitemtypes=Movie&searchterm=old&years=1990",
    sourceMode: "tmdb",
    peerMode: "tmdb",
    handle(url) {
      if (url.hostname.endsWith(".example")) {
        assert.equal(url.searchParams.has("anyprovideridequals"), false);
        assert.equal(url.searchParams.has("searchterm"), false);
        assert.equal(url.searchParams.has("years"), false);
        assert.equal(url.searchParams.get("SearchTerm"), "Fixture");
        assert.equal(url.searchParams.get("Years"), "2020");
        return json(url.hostname.startsWith("alpha") ? own : peer);
      }
    },
  });
  assert.equal(result.payload.Items.length, 2);
});

test("an explicitly configured peer user is verified when Users Me is unavailable", async () => {
  const result = await fixture({
    path: "/Users/source-user/Items?SearchTerm=Fixture",
    peerHeaders: { Authorization: 'MediaBrowser UserId="peer-user", Token="peer-fixture-token"' },
    handle(url) {
      if (url.hostname === "alpha.example") return json(own);
      if (url.pathname === "/Users/peer-user") return json({ Id: "peer-user" });
      if (url.hostname === "beta.example") {
        assert.equal(url.pathname, "/Users/peer-user/Items");
        return json(peer);
      }
    },
  });
  assert.equal(result.payload.Items.length, 2);
  assert.equal(
    result.calls.some(({ url }) => url.pathname === "/Users/Me"),
    false,
  );
});

test("the total peer budget bounds even a fetch that does not respond to abort", async () => {
  const originalTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (callback, ms, ...args) =>
    originalTimeout(callback, ms === 12000 ? 20 : ms, ...args);
  try {
    const result = await fixture({
      path: "/Items?SearchTerm=Fixture",
      handle(url) {
        if (url.hostname === "alpha.example") return json(own);
        if (url.hostname === "beta.example") return new Promise(() => {});
      },
    });
    assert.deepEqual(result.payload, own);
    assert.match(JSON.stringify(result.logs), /timeout_or_cancelled/);
  } finally {
    globalThis.setTimeout = originalTimeout;
  }
});

test("aborted bounded response reads cancel the stream and release the reader", async () => {
  let cancelled = false;
  const response = new Response(
    new ReadableStream({
      cancel() {
        cancelled = true;
      },
    }),
  );
  const controller = new AbortController();
  const reading = readResponseBytesWithLimit(response, 1024, controller.signal);
  controller.abort();
  const result = await reading;
  assert.equal(result.exceeded, true);
  assert.equal(cancelled, true);
  assert.equal(response.body.locked, false);
});

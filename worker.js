function An(o) {
  const e = String(o || "").trim();
  if (!/^\d+$/.test(e)) return null;
  const t = Number(e);
  return Number.isFinite(t) ? t : null;
}
function Tn(o) {
  if (o == null) return "";
  try {
    return o instanceof ArrayBuffer ? new TextDecoder().decode(new Uint8Array(o)) : ArrayBuffer.isView(o) ? new TextDecoder().decode(o) : String(o || "");
  } catch {
    return "";
  }
}
async function nn(o, e, t) {
  const r = Math.max(0, Math.floor(Number(e) || 0)), a = An(o?.headers?.get?.("Content-Length"));
  if (Number.isFinite(a) && a > r) {
    try {
      Promise.resolve(o?.body?.cancel?.()).catch(() => {
      });
    } catch {
    }
    return {
      bodyBytes: /* @__PURE__ */ new Uint8Array(0),
      bytes: a,
      exceeded: !0
    };
  }
  if (!o?.body) return {
    bodyBytes: /* @__PURE__ */ new Uint8Array(0),
    bytes: 0,
    exceeded: !1
  };
  const n = o.body.getReader(), s = () => {
    try {
      Promise.resolve(n.cancel()).catch(() => {
      });
    } catch {
    }
  };
  t?.addEventListener("abort", s, { once: !0 }), t?.aborted && s();
  const i = [];
  let c = 0;
  try {
    for (; ; ) {
      const { done: d, value: f } = await n.read();
      if (t?.aborted) return {
        bodyBytes: /* @__PURE__ */ new Uint8Array(0),
        bytes: c,
        exceeded: !0
      };
      if (d) break;
      const m = f instanceof Uint8Array ? f : new Uint8Array(f || 0);
      if (c + m.byteLength > r) {
        try {
          Promise.resolve(n.cancel()).catch(() => {
          });
        } catch {
        }
        return {
          bodyBytes: /* @__PURE__ */ new Uint8Array(0),
          bytes: c + m.byteLength,
          exceeded: !0
        };
      }
      i.push(m), c += m.byteLength;
    }
  } catch {
    return {
      bodyBytes: /* @__PURE__ */ new Uint8Array(0),
      bytes: c,
      exceeded: !0
    };
  } finally {
    t?.removeEventListener("abort", s);
    try {
      n.releaseLock();
    } catch {
    }
  }
  const l = new Uint8Array(c);
  let u = 0;
  for (const d of i)
    l.set(d, u), u += d.byteLength;
  return {
    bodyBytes: l,
    bytes: c,
    exceeded: !1
  };
}
async function Me(o, e) {
  const t = await nn(o, e);
  return {
    text: t.exceeded ? "" : new TextDecoder().decode(t.bodyBytes),
    bytes: t.bytes,
    exceeded: t.exceeded
  };
}
function Fa(o) {
  let e = /* @__PURE__ */ new WeakMap(), t = o(), r = t;
  return {
    get(a = null) {
      if (!a || typeof a != "object" && typeof a != "function") return t;
      let n = e.get(a);
      return n || (n = o(), e.set(a, n)), r = n, n;
    },
    current() {
      return r;
    },
    reset() {
      e = /* @__PURE__ */ new WeakMap(), t = o(), r = t;
    }
  };
}
function Xl(o, e = 8192) {
  const t = Math.max(2, Math.floor(Number(e) || 8192)), r = Math.max(1, Math.min(32, Math.floor(t / 256))), a = Math.max(16, Math.min(512, Math.floor(t / Math.max(4, r * 2)))), n = 4, s = Math.max(8, Math.min(256, Math.floor(t / 32))), i = /* @__PURE__ */ new WeakSet();
  let c = 0, l = !1;
  const u = (f, m = 0) => {
    if (f == null) return f;
    if (typeof f == "string")
      return f.length <= a ? f : (l = !0, `${f.slice(0, a)}...`);
    if (typeof f == "number" || typeof f == "boolean") return f;
    if (typeof f == "bigint" || typeof f != "object") return String(f);
    if (i.has(f)) return "[Circular]";
    if (m >= n || c >= s)
      return l = !0, "[Truncated]";
    c += 1, i.add(f);
    try {
      if (Array.isArray(f)) {
        const g = [];
        for (let y = 0; y < f.length && y < r; y += 1) g.push(u(f[y], m + 1));
        return f.length > r && (l = !0, g.push("[Truncated]")), g;
      }
      const p = {};
      let h = 0;
      for (const g in f) {
        if (!Object.prototype.hasOwnProperty.call(f, g)) continue;
        if (h >= r) {
          l = !0, p._truncated = !0;
          break;
        }
        const y = g.length > a ? `${g.slice(0, a)}...` : g;
        p[y] = u(f[g], m + 1), h += 1;
      }
      return p;
    } finally {
      i.delete(f);
    }
  };
  try {
    const f = JSON.stringify(u(o));
    if (!l && f && f.length <= t) return f;
  } catch {
  }
  const d = JSON.stringify({ truncated: !0 });
  return d.length <= t ? d : "{}";
}
var on = "19.9";
function ie(o = "") {
  const e = String(o || "");
  let t = 2166136261;
  for (let r = 0; r < e.length; r += 1)
    t ^= e.charCodeAt(r), t = Math.imul(t, 16777619);
  return (t >>> 0).toString(36);
}
function Es(o = []) {
  const e = Array.isArray(o) ? o : [o];
  let t = 2166136261;
  const r = (a) => {
    for (let n = 0; n < 32; n += 8)
      t ^= a >>> n & 255, t = Math.imul(t, 16777619);
  };
  r(e.length);
  for (const a of e) {
    const n = String(a ?? "");
    r(n.length);
    for (let s = 0; s < n.length; s += 1)
      t ^= n.charCodeAt(s), t = Math.imul(t, 16777619);
  }
  return (t >>> 0).toString(36);
}
function Hn(o = "") {
  const e = new TextEncoder().encode(String(o || ""));
  let t = 14695981039346656037n;
  const r = 1099511628211n;
  for (const a of e)
    t ^= BigInt(a), t = BigInt.asUintN(64, t * r);
  return t.toString(16).padStart(16, "0");
}
async function ro(o = "") {
  const e = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(o || "")));
  return [...new Uint8Array(e)].map((t) => t.toString(16).padStart(2, "0")).join("");
}
function Et(o) {
  const e = Array.isArray(o) ? o : String(o || "").split(/[\\r\\n,，;；|]+/), t = /* @__PURE__ */ new Set(), r = [];
  for (const a of e) {
    const n = String(a || "").trim();
    if (!n) continue;
    const s = n.toLowerCase();
    t.has(s) || (t.add(s), r.push(n));
  }
  return r;
}
function Fo(o) {
  const e = String(o || "").trim().toLowerCase();
  if (!e) return null;
  const t = e.includes("*"), r = e.replace(/^\*\./, "").replace(/^\*+/, "").replace(/\*+$/g, "").replace(/^\.+|\.+$/g, "");
  return r ? {
    hostname: r,
    wildcard: t
  } : null;
}
function ne(o) {
  return Fo(o)?.hostname || "";
}
function ir(o = []) {
  const e = Array.isArray(o) ? o : [o], t = [], r = /* @__PURE__ */ new Set();
  for (const a of e) {
    const n = String(a || "").trim();
    !n || r.has(n) || (r.add(n), t.push(n));
  }
  return t;
}
function H(o) {
  return !!o && typeof o == "object" && !Array.isArray(o);
}
function fe(o, e, t, r) {
  let a;
  if (typeof o == "number") a = o;
  else if (typeof o == "string") {
    const n = o.trim();
    if (!/^-?\d+$/.test(n)) return e;
    a = Number(n);
  } else return e;
  return Number.isFinite(a) ? Math.min(r, Math.max(t, Math.floor(a))) : e;
}
function Yl(o, e, t, r) {
  const a = Number(o);
  return Number.isFinite(a) ? Math.min(r, Math.max(t, a)) : e;
}
function Ta(o, e) {
  return !!o && typeof o == "object" && Object.prototype.hasOwnProperty.call(o, e);
}
function Ga(o) {
  return String(o || "").replace(/[\\%_]/g, "\\$&");
}
function Jl(o) {
  const e = String(o || "").trim();
  return e ? /^(?:\d{1,3}\.){3}\d{1,3}$/.test(e) ? !0 : /^[0-9a-f:]+$/i.test(e) && e.includes(":") : !1;
}
function As(o) {
  const e = String(o || "").trim();
  return e ? /^[a-z]{3,4}$/i.test(e) : !1;
}
function Ql() {
  return {
    phase: 0,
    lastRunAt: 0,
    iterators: {
      node: null,
      playbackRoute: null,
      crypto: null,
      rate: null,
      log: null,
      playbackInfo: null,
      failover: null,
      progress: null,
      monthlyTraffic: null
    }
  };
}
function Zl() {
  const o = Fa(() => ({ namespaces: /* @__PURE__ */ new Map() }));
  let e = "default";
  const t = (r, a = "default") => {
    const n = String(a || "default").trim() || "default";
    let s = r.namespaces.get(n);
    return s || (s = {
      ConfigCache: null,
      RuntimeConfigCacheGeneration: 0,
      SingleFlightTasks: /* @__PURE__ */ new Map()
    }, r.namespaces.set(n, s)), e = n, s;
  };
  return {
    get(r = null, a = "default") {
      return t(o.get(r), a);
    },
    current() {
      return t(o.current(), e);
    },
    reset() {
      o.reset(), e = "default";
    }
  };
}
function eu() {
  const o = Fa(() => ({
    KvDataMutationChain: Promise.resolve(),
    KvTidyMutationChain: Promise.resolve()
  }));
  return {
    get(e = null) {
      return o.get(e);
    },
    current() {
      return o.current();
    },
    reset() {
      o.reset();
    }
  };
}
function yr(o = globalThis) {
  try {
    return o?.caches?.default ?? null;
  } catch {
    return null;
  }
}
function ao(o = globalThis) {
  return o.crypto.subtle;
}
function Ts(o) {
  return String(o || "").trim();
}
function tu(o = [], e = {}) {
  const t = /* @__PURE__ */ Object.create(null), r = /* @__PURE__ */ new Map();
  for (const s of o) {
    const i = Ts(s?.name) || "anonymous", c = s?.handlers && typeof s.handlers == "object" ? s.handlers : s;
    for (const [l, u] of Object.entries(c || {})) {
      if (typeof u != "function") throw new TypeError(`Admin action ${l} from ${i} is not a function`);
      if (t[l]) throw new Error(`Duplicate admin action ${l}: ${r.get(l)} and ${i}`);
      t[l] = u, r.set(l, i);
    }
  }
  const a = Object.freeze({ ...e.aliases });
  for (const [s, i] of Object.entries(a)) if (!t[i]) throw new Error(`Admin action alias ${s} targets missing action ${i}`);
  for (const s of e.requiredActions || []) if (!t[s]) throw new Error(`Missing required admin action ${s}`);
  const n = Object.freeze({ ...t });
  return Object.freeze({
    handlers: n,
    names: Object.freeze(Object.keys(n).sort()),
    resolve(s) {
      const i = Ts(s);
      return n[a[i] || i] || null;
    }
  });
}
function ru(o) {
  function e(r, a = null) {
    if (typeof r != "function") {
      const i = r;
      return (c) => e(c, i);
    }
    const n = o.get(a), s = n.KvDataMutationChain.catch(() => null).then(() => r());
    return n.KvDataMutationChain = s.catch(() => null), s;
  }
  function t(r, a = null) {
    if (typeof r != "function") {
      const i = r;
      return (c) => t(c, i);
    }
    const n = o.get(a), s = n.KvTidyMutationChain.catch(() => null).then(() => e(r, a));
    return n.KvTidyMutationChain = s.catch(() => null), s;
  }
  return Object.freeze({
    runDataMutation: e,
    runTidyMutation: t
  });
}
function au() {
  return Fa(() => ({
    LogQueue: [],
    LogDedupe: /* @__PURE__ */ new Map(),
    LogFlushPending: !1,
    LogFlushTask: null,
    LogClearEpochMs: 0,
    LogLastFlushAt: 0,
    runtimeConfig: null
  }));
}
function Sr(o = "") {
  return String(o || "").trim().toLowerCase().split(";", 1)[0].trim();
}
function Ua(o = "") {
  const e = Sr(o);
  return e === "application/json" || e === "text/json" || /^application\/[a-z0-9!#$&^_.+-]+\+json$/i.test(e);
}
function Ni(o = "") {
  const e = Sr(o);
  return e === "text/html" || e === "application/xhtml+xml";
}
function nu(o = "", e = "text/html") {
  const t = Sr(e);
  if (!Ni(t)) return !1;
  const [r, a] = t.split("/", 2);
  let n = -1, s = 0;
  for (const i of String(o || "").split(",")) {
    const [c, ...l] = i.split(";"), [u, d] = Sr(c).split("/", 2);
    let f = -1;
    if (u === r && d === a ? f = 2 : u === r && d === "*" ? f = 1 : u === "*" && d === "*" && (f = 0), f < n || f < 0) continue;
    let m = 1;
    for (const p of l) {
      const [h, g] = p.split("=", 2);
      if (String(h || "").trim().toLowerCase() !== "q") continue;
      const y = String(g || "").trim();
      m = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(y) ? Number(y) : 0;
      break;
    }
    f > n && (n = f, s = m);
  }
  return s > 0;
}
var ou = Object.freeze({
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  408: "Request Timeout",
  409: "Conflict",
  429: "Too Many Requests",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout"
});
function no(o, e, t = {}) {
  const r = e?.response, a = Math.max(400, Number(t.status) || 502), n = String(t.statusText || ou[a] || "Error").trim(), s = new Headers(r?.headers || {});
  [
    "Accept-Ranges",
    "Content-Disposition",
    "Content-Encoding",
    "Content-Length",
    "Content-MD5",
    "Content-Range",
    "Digest",
    "ETag",
    "Last-Modified",
    "Location",
    "Refresh",
    "Set-Cookie",
    "Transfer-Encoding"
  ].forEach((u) => s.delete(u)), s.set("Content-Type", "application/json; charset=utf-8"), s.set("Cache-Control", "no-store"), s.delete("X-Proxy-Mime-Guard"), s.delete("X-Proxy-Contract-Guard");
  const i = String(t.guardHeader || "").trim(), c = String(t.guardValue || "").trim();
  i && c && s.set(i, c);
  const l = {
    error: String(t.error || n || "Error"),
    code: a,
    message: String(t.message || "The API response did not satisfy the proxy contract."),
    ...t.details && typeof t.details == "object" && !Array.isArray(t.details) ? { details: t.details } : {}
  };
  try {
    Promise.resolve(r?.body?.cancel?.()).catch(() => {
    });
  } catch {
  }
  return o && typeof o == "object" && (o.proxyGuardState = c), {
    ...e,
    response: new Response(o?.requestMethod === "HEAD" ? null : JSON.stringify(l), {
      status: a,
      statusText: n,
      headers: s
    })
  };
}
function su(o, e, t = {}) {
  const r = e?.response;
  if (!r || o?.requestTraits?.isApiRequest !== !0 || r.status === 101 || r.status === 204 || r.status === 205 || r.status === 304) return e;
  const a = typeof t.sanitizePath == "function" ? t.sanitizePath : (l) => String(l || "/"), n = r.headers.get("Content-Type");
  if ((o?.requestMethod === "GET" || o?.requestMethod === "HEAD") && a(o?.proxyPath || "/") === "/" && nu(o?.request?.headers?.get("Accept"), n) || !Ni(n)) return e;
  const s = typeof t.buildErrorState == "function" ? t.buildErrorState : no, i = Number(r.status) || 0, c = i >= 400;
  return s(o, e, {
    status: c ? i : void 0,
    statusText: c && String(r.statusText || "").trim() || void 0,
    message: "Upstream API returned an HTML document instead of API data.",
    guardHeader: "X-Proxy-Mime-Guard",
    guardValue: "html-document",
    details: {
      upstreamStatus: r.status,
      contentType: Sr(n) || "missing"
    }
  });
}
var iu = "playback-info", Ii = /* @__PURE__ */ new WeakSet();
function Uo(o) {
  if (!o || typeof o != "object" || Array.isArray(o)) return !1;
  const e = Object.getPrototypeOf(o);
  return e === Object.prototype || e === null;
}
function ko(o = "") {
  let e;
  try {
    e = JSON.parse(String(o || ""));
  } catch {
    return null;
  }
  return Uo(e) ? e : null;
}
function Rn({ response: o, bodyText: e, bodyBytes: t, payload: r }) {
  if (!o || !Uo(r)) return null;
  const a = Object.freeze({
    contract: iu,
    response: o,
    bodyText: String(e || ""),
    bodyBytes: Math.max(0, Number(t) || 0),
    payload: r
  });
  return Ii.add(a), a;
}
function xt(o) {
  return Ii.has(o) && o?.contract === "playback-info" && !!o.response && typeof o.bodyText == "string" && Number.isFinite(o.bodyBytes) && o.bodyBytes >= 0 && Uo(o.payload);
}
function $n(o, e) {
  return Object.freeze({
    kind: "invalid",
    reason: e,
    details: Object.freeze({
      reason: e,
      upstreamStatus: Number(o?.status) || 0,
      contentType: Sr(o?.headers?.get?.("Content-Type")) || "missing"
    })
  });
}
var cu = 256 * 1024;
async function lu(o, e = {}) {
  const t = String(e.requestMethod || "GET").toUpperCase();
  if (!o || !(o.status >= 200 && o.status < 300) || t === "HEAD" || o.status === 204 || o.status === 205 || !o.body) return Object.freeze({ kind: "skip" });
  if (!Ua(o.headers.get("Content-Type"))) return $n(o, "unsupported_content_type");
  const r = Number(e.maxBytes), a = Number.isFinite(r) && r > 0 ? Math.floor(r) : cu, n = await Me(o.clone(), a);
  if (n.exceeded) return $n(o, Number(n.bytes) > a ? "body_too_large" : "body_read_failed");
  const s = ko(n.text);
  return s ? Object.freeze({
    kind: "valid",
    representation: Rn({
      response: o,
      bodyText: n.text,
      bodyBytes: n.bytes,
      payload: s
    })
  }) : $n(o, "invalid_root_object");
}
function Gr(o) {
  if (!o || typeof o != "object" || Array.isArray(o)) return !1;
  const e = Object.getPrototypeOf(o);
  return e === Object.prototype || e === null;
}
function Bn(o) {
  const e = /* @__PURE__ */ new Set();
  if (!Gr(o)) return e;
  const t = Gr(o.ProviderIds) ? o.ProviderIds : null;
  if (t) for (const [n, s] of Object.entries(t)) {
    if (String(n).toLowerCase() !== "tmdb") continue;
    const i = String(s ?? "").trim();
    i && e.add(`tmdb:${i}`);
  }
  const r = uu(o);
  if (r)
    return e.add(r), e;
  const a = String(o.Name ?? "").trim().toLowerCase();
  if (a) {
    const n = String(o.ProductionYear ?? "").trim();
    e.add(n ? `name:${a}:${n}` : `name:${a}:`);
  }
  return e;
}
function uu(o) {
  if (!Gr(o)) return "";
  const e = String(o.IndexNumber ?? "").trim();
  if (!e || e === "0") return "";
  const t = String(o.ParentIndexNumber ?? "").trim() || "0", r = String(o.SeriesName ?? "").trim().toLowerCase();
  return r ? `episode:${r}:${t}:${e}` : "";
}
function du(o, e, t, r) {
  const a = [];
  if (!Gr(o) || !Array.isArray(o.MediaSources) || !String(t ?? "").trim()) return a;
  const n = [];
  for (const s of o.MediaSources) {
    if (!Gr(s)) continue;
    const i = String(s.Id ?? "").trim();
    if (!i) continue;
    const c = String(s.DirectStreamUrl || s.Path || "").trim(), l = c ? r(e, c) : "";
    l && n.push({
      ...s,
      Id: fu(e, t, i),
      Path: l,
      DirectStreamUrl: l,
      IsRemote: !1,
      Protocol: "Http",
      SupportsTranscoding: !1,
      TranscodingUrl: ""
    });
  }
  return n.length && a.push({
    peerName: e,
    mediaSources: n
  }), a;
}
function fu(o, e, t) {
  const r = JSON.stringify([String(e ?? ""), String(t ?? "")]);
  return `n${Rs(o)}.${Rs(r)}`;
}
function mu(o, e) {
  if (!Gr(o) || !Array.isArray(o.MediaSources) || !Array.isArray(e) || !e.length) return null;
  const t = o.MediaSources, r = new Set(t.map((s) => String(s?.Id ?? "").trim()).filter(Boolean)), a = [...t];
  let n = 0;
  for (const s of e) for (const i of s.mediaSources) {
    const c = String(i.Id ?? "").trim();
    !c || r.has(c) || (r.add(c), a.push(i), n += 1);
  }
  return n ? {
    payload: {
      ...o,
      MediaSources: a
    },
    addedVersionCount: n
  } : null;
}
function Rs(o) {
  const e = new TextEncoder().encode(String(o ?? ""));
  let t = "";
  for (const r of e) t += String.fromCharCode(r);
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
var Cs = [
  "authorization",
  "x-emby-authorization",
  "x-mediabrowser-authorization",
  "x-emby-token",
  "x-mediabrowser-token",
  "x-emby-auth-token",
  "x-mediabrowser-auth-token"
], pu = /^(?:api_?key|token|access_token|authorization|x-emby.*|x-mediabrowser.*)$/i;
function Ke(o, e) {
  const t = e.toLowerCase();
  for (const [r, a] of o || []) if (r.toLowerCase() === t) return a;
  return null;
}
function vr(o, e) {
  const t = e.toLowerCase();
  for (const r of Array.from(o.keys())) r.toLowerCase() === t && o.delete(r);
}
function Di(o) {
  for (const e of Array.from(o.searchParams.keys())) pu.test(e) && o.searchParams.delete(e);
  return o;
}
function Mi(o, e, t = !1) {
  const r = new Headers(e?.headers || {}), a = Cs.some((s) => r.get(s)?.trim());
  if (t && !a) return null;
  const n = new Headers({ accept: "application/json" });
  if (!t && !a) {
    for (const c of Cs) {
      const l = o?.headers?.get(c);
      l && n.set(c, l);
    }
    const s = new URL(o.url).searchParams, i = Ke(s, "api_key") || Ke(s, "ApiKey") || Ke(s, "X-Emby-Token");
    i && !n.has("X-Emby-Token") && n.set("X-Emby-Token", i);
  }
  for (const [s, i] of r)
    /^(?:host|content-length|connection|transfer-encoding|cookie)$/i.test(s) || n.set(s, i);
  return n;
}
function ws(o, e) {
  const t = Number(Ke(o.searchParams, "StartIndex") || 0), r = Ke(o.searchParams, "Limit");
  return t === 0 && (r === null || Number(r) > 0) && Array.isArray(e?.Items) && e.Items.length === 0 && (e.TotalRecordCount == null || Number(e.TotalRecordCount) === 0);
}
function It(o, e) {
  return e ? new Promise((t, r) => {
    const a = () => r(/* @__PURE__ */ new Error("aggregation_aborted")), n = () => e.removeEventListener("abort", a);
    e.addEventListener("abort", a, { once: !0 }), Promise.resolve(o).then((s) => {
      n(), t(s);
    }, (s) => {
      n(), r(s);
    }), e.aborted && (n(), a());
  }) : o;
}
function Va(o, e) {
  const t = new AbortController(), r = () => t.abort(), a = setTimeout(r, e);
  return o?.addEventListener("abort", r, { once: !0 }), o?.aborted && r(), {
    signal: t.signal,
    dispose() {
      clearTimeout(a), o?.removeEventListener("abort", r);
    }
  };
}
function Pi(o) {
  return new Map(Object.entries(o?.ProviderIds || {}).filter(([, e]) => String(e || "").trim()).map(([e, t]) => [e.toLowerCase(), String(t)]));
}
function gu(o, e, t) {
  if (!o?.Type || o.Type !== e?.Type) return !1;
  const r = Pi(e);
  let a = !1;
  for (const [n, s] of t)
    if (r.has(n)) {
      if (r.get(n) !== s) return !1;
      a = !0;
    }
  return a ? !0 : /^(Movie|Series)$/.test(o.Type) && !!o.ProductionYear && Number(o.ProductionYear) === Number(e.ProductionYear) && String(o.Name || "").trim().toLowerCase() === String(e.Name || "").trim().toLowerCase();
}
async function Ls({ rawUrl: o, proxyPath: e, ownTarget: t, peerTarget: r, ownHeaders: a, peerHeaders: n, buildUrl: s, readJson: i }) {
  const c = s(r, e);
  c.search = o.search, Di(c);
  const l = Ke(o.searchParams, "UserId") || /^\/(?:emby\/|mediabrowser\/)?users\/([^/]+)\/items/i.exec(e)?.[1];
  let u = "";
  if (l) {
    const h = n.get("Authorization") || n.get("X-Emby-Authorization") || "", g = /\bUserId\s*=\s*"([^"\r\n]+)"/i.exec(h)?.[1], y = await i(s(r, g ? `/Users/${encodeURIComponent(g)}` : "/Users/Me"), n);
    if (u = String(y?.Id || "").trim(), !u || g && u !== g) throw new Error("unmapped_user");
    vr(c.searchParams, "UserId"), c.searchParams.set("UserId", u), c.pathname = c.pathname.replace(/(\/users\/)[^/]+(\/items)/i, `$1${encodeURIComponent(u)}$2`);
  }
  const d = (h, g) => (g && h.searchParams.set("UserId", g), h), f = /* @__PURE__ */ new Map();
  async function m(h, g = 0) {
    if (f.has(h)) return f.get(h);
    if (!h || !t || g > 2) throw new Error("unmapped_scope");
    const y = d(s(t, `/Items/${encodeURIComponent(h)}`), l);
    y.searchParams.set("Fields", "ProviderIds,ProductionYear,SeriesId,IndexNumber,CollectionType");
    const _ = await i(y, a);
    if (!_?.Type) throw new Error("unmapped_scope");
    let S = [], E;
    if (_.Type === "Season" && _.SeriesId && Number.isInteger(_.IndexNumber)) {
      const C = await m(String(_.SeriesId), g + 1);
      S = (await i(d(s(r, `/Shows/${encodeURIComponent(C)}/Seasons`), u), n))?.Items || [], E = (L) => L.Type === "Season" && L.IndexNumber === _.IndexNumber;
    } else if (_.Type === "CollectionFolder" && _.CollectionType && u)
      S = (await i(s(r, `/Users/${encodeURIComponent(u)}/Views`), n))?.Items || [], E = (C) => C.Type === _.Type && C.CollectionType === _.CollectionType && C.Name === _.Name;
    else {
      const C = d(s(r, "/Items"), u);
      C.searchParams.set("IncludeItemTypes", _.Type), C.searchParams.set("Recursive", "true"), C.searchParams.set("Fields", "ProviderIds,ProductionYear"), C.searchParams.set("Limit", "50");
      const L = Pi(_);
      if (L.size) C.searchParams.set("AnyProviderIdEquals", [...L].map(([A, w]) => `${A}.${w}`).join(","));
      else if (/^(Movie|Series)$/.test(_.Type) && _.Name && _.ProductionYear) C.searchParams.set("SearchTerm", _.Name);
      else throw new Error("unmapped_scope");
      const P = await i(C, n);
      if (Number(P?.TotalRecordCount) > 50) throw new Error("ambiguous_scope");
      S = P?.Items || [], E = (A) => gu(_, A, L);
    }
    let b;
    for (const C of Array.isArray(S) ? S : [])
      if (!(!C?.Id || !E(C))) {
        if (b) throw new Error("unmapped_scope");
        b = C;
      }
    if (!b) throw new Error("unmapped_scope");
    const T = String(b.Id);
    return f.set(h, T), T;
  }
  const p = /^\/(?:emby\/|mediabrowser\/)?shows\/([^/]+)\/episodes$/i.exec(e);
  p && (c.pathname = c.pathname.replace(/(\/shows\/)[^/]+(\/episodes)$/i, `$1${encodeURIComponent(await m(decodeURIComponent(p[1])))}$2`));
  for (const [h, g] of Array.from(c.searchParams)) if (/^(parentid|seasonid|seriesid|ids)$/i.test(h)) {
    const y = g.split(",").filter(Boolean);
    if (!y.length || y.length > 8) throw new Error("unmapped_scope");
    const _ = [];
    for (const S of y) _.push(await m(S));
    c.searchParams.set(h, _.join(","));
  } else if (/ids?$/i.test(h) && !/^(userid|deviceid)$/i.test(h)) throw new Error("unsupported_scope");
  return c;
}
function Cn(o) {
  const e = o instanceof Headers ? new Headers(o) : new Headers(o || {});
  return [
    "Content-Encoding",
    "Content-Length",
    "Content-MD5",
    "Digest",
    "ETag",
    "Transfer-Encoding"
  ].forEach((t) => e.delete(t)), e.set("Content-Type", "application/json; charset=utf-8"), e;
}
function sn(o) {
  if (typeof o != "string") return o;
  const e = o.trim();
  if (!e || !e.startsWith("{") && !e.startsWith("[")) return o;
  try {
    return JSON.parse(e);
  } catch {
    return o;
  }
}
function Ho(o) {
  const e = sn(o);
  if (!Array.isArray(e)) return {
    items: [],
    changed: !0
  };
  let t = e !== o;
  const r = [];
  for (const a of e) {
    const n = sn(a);
    if (!n || typeof n != "object" || Array.isArray(n)) {
      t = !0;
      continue;
    }
    n !== a && (t = !0), r.push(n);
  }
  return {
    items: r,
    changed: t
  };
}
function xi(o) {
  let e = o, t = !1;
  const r = (a, n) => {
    e === o && (e = { ...o }), e[a] = n, t = !0;
  };
  for (const a of ["MediaStreams", "MediaAttachments"]) {
    if (!Object.prototype.hasOwnProperty.call(o, a)) continue;
    const n = Ho(o[a]);
    n.changed && r(a, n.items);
  }
  if (Object.prototype.hasOwnProperty.call(o, "RequiredHttpHeaders")) {
    const a = sn(o.RequiredHttpHeaders);
    !a || typeof a != "object" || Array.isArray(a) ? r("RequiredHttpHeaders", {}) : a !== o.RequiredHttpHeaders && r("RequiredHttpHeaders", a);
  }
  return {
    mediaSource: e,
    changed: t
  };
}
function $o(o) {
  if (!o || typeof o != "object" || Array.isArray(o) || !Object.prototype.hasOwnProperty.call(o, "MediaSources")) return {
    payload: o,
    rewriteState: "not_needed"
  };
  const e = Ho(o.MediaSources);
  let t = e.changed;
  const r = e.items.map((a) => {
    const n = xi(a);
    return n.changed && (t = !0), n.mediaSource;
  });
  return t ? {
    payload: {
      ...o,
      MediaSources: r
    },
    rewriteState: "applied"
  } : {
    payload: o,
    rewriteState: "not_needed"
  };
}
function Oi(o, e = {}) {
  const t = $o(o), r = t.payload;
  if (!r || typeof r != "object" || Array.isArray(r) || !Array.isArray(r.MediaSources)) return {
    payload: o,
    rewriteState: "not_needed"
  };
  const a = typeof e.buildProxyUrl == "function" ? e.buildProxyUrl : () => "";
  let n = t.rewriteState === "applied";
  const s = r.MediaSources.map((i) => {
    let c = i;
    const l = (p, h, g = {}) => {
      const y = Object.prototype.hasOwnProperty.call(c, p);
      g.onlyIfPresent === !0 && !y || c[p] === h && !(g.ensurePresent === !0 && !y) || (c === i && (c = { ...i }), c[p] = h, n = !0);
    }, u = String(i.DirectStreamUrl || "").trim(), d = String(i.Path || "").trim(), f = u || d, m = f ? a(f) : "";
    return m ? (l("DirectStreamUrl", m, { ensurePresent: !0 }), l("Path", m, { ensurePresent: !0 })) : l("Path", "", { ensurePresent: !0 }), l("IsRemote", !1, { ensurePresent: !0 }), l("Protocol", "Http", { ensurePresent: !0 }), l("SupportsTranscoding", !1, { ensurePresent: !0 }), l("TranscodingUrl", "", { ensurePresent: !0 }), l("TranscodingSubProtocol", "", { onlyIfPresent: !0 }), l("TranscodingContainer", "", { onlyIfPresent: !0 }), l("TranscodingType", "", { onlyIfPresent: !0 }), c;
  });
  return n ? {
    payload: {
      ...r,
      MediaSources: s
    },
    rewriteState: "applied"
  } : {
    payload: o,
    rewriteState: "not_needed"
  };
}
function hu(o, e = {}) {
  if (!xt(o)) return {
    kind: "invalid",
    reason: "invalid_representation"
  };
  const t = e.rewriteEnabled === !0 ? Oi(o.payload, { buildProxyUrl: e.buildProxyUrl }) : $o(o.payload);
  if (t.rewriteState !== "applied") return {
    kind: "valid",
    representation: o,
    rewriteState: e.rewriteEnabled === !0 ? "not_needed" : "passthrough"
  };
  const r = JSON.stringify(t.payload), a = new TextEncoder().encode(r).byteLength, n = o.response;
  try {
    Promise.resolve(n.body?.cancel?.()).catch(() => {
    });
  } catch {
  }
  return {
    kind: "valid",
    representation: Rn({
      response: new Response(r, {
        status: n.status,
        statusText: n.statusText,
        headers: Cn(n.headers)
      }),
      bodyText: r,
      bodyBytes: a,
      payload: t.payload
    }),
    rewriteState: "applied"
  };
}
var yu = new TextEncoder();
function oo(o) {
  return yu.encode(String(o || "")).byteLength;
}
function Su(o, e) {
  const t = Number(o?.status);
  if (!(t >= 200 && t < 300) || t === 204 || t === 205) return null;
  let r;
  try {
    r = new Headers(Array.isArray(o?.headers) ? o.headers : []);
  } catch {
    return null;
  }
  if (!Ua(r.get("Content-Type"))) return null;
  const a = String(o.bodyText || ""), n = oo(a), s = Number(e);
  if (Number.isFinite(s) && s > 0 && n > s) return null;
  const i = ko(a);
  return i ? {
    headers: r,
    bodyText: a,
    bodyBytes: n,
    payload: i
  } : null;
}
var _u = class {
  constructor(o = {}) {
    if (!(o.entries instanceof Map)) throw new TypeError("PlaybackInfoCacheStore requires a Map");
    this.entries = o.entries, this.now = typeof o.now == "function" ? o.now : Date.now, this.maxEntries = Math.max(1, Number(o.maxEntries) || 1), this.maxEntryBytes = Math.max(1, Number(o.maxEntryBytes) || 1), this.maxTotalBytes = Math.max(1, Number(o.maxTotalBytes) || 1);
  }
  cleanup(o = this.now()) {
    for (const [t, r] of this.entries) {
      const a = Number(r?.expiresAt) || 0;
      a > 0 && a <= o && this.entries.delete(t);
    }
    for (; this.entries.size > this.maxEntries; ) {
      const t = this.entries.keys().next().value;
      if (!t) break;
      this.entries.delete(t);
    }
    let e = 0;
    for (const t of this.entries.values()) {
      const r = Number(t?.bodyBytes), a = Number.isFinite(r) && r > 0 ? r : oo(t?.bodyText);
      t.bodyBytes = a, e += a;
    }
    for (; this.entries.size > 0 && e > this.maxTotalBytes; ) {
      const t = this.entries.keys().next().value;
      if (!t) break;
      const r = this.entries.get(t);
      e -= Number(r?.bodyBytes) || 0, this.entries.delete(t);
    }
  }
  set(o, e, t = {}) {
    if (!o || !xt(e)) return !1;
    const r = e.response;
    if (!(r.status >= 200 && r.status < 300) || r.status === 204 || r.status === 205 || !Ua(r.headers.get("Content-Type"))) return !1;
    const a = Number(e.bodyBytes), n = Math.max(Number.isFinite(a) && a > 0 ? a : 0, oo(e.bodyText)), s = e.payload;
    if (n > this.maxEntryBytes || !s) return !1;
    const i = Math.max(0, Number(t.ttlMs) || 0);
    if (i <= 0) return !1;
    const c = Cn(r.headers);
    c.delete("Set-Cookie");
    const l = this.now();
    return this.entries.delete(o), this.entries.set(o, {
      nodeName: String(t.nodeName || "").trim().toLowerCase(),
      nodeRevision: String(t.nodeRevision || "").trim(),
      playbackInfoRewrite: String(t.playbackInfoRewrite || "").trim(),
      status: r.status,
      statusText: r.statusText,
      headers: [...c.entries()],
      bodyText: e.bodyText,
      bodyBytes: n,
      payload: s,
      storedAt: l,
      expiresAt: l + i
    }), this.cleanup(l), !0;
  }
  get(o) {
    if (!o) return null;
    const e = this.entries.get(o);
    if (!e) return null;
    const t = Number(e.expiresAt) || 0;
    if (t > 0 && t <= this.now())
      return this.entries.delete(o), null;
    let r;
    try {
      r = new Response(e.bodyText, {
        status: Number(e.status) || 200,
        statusText: String(e.statusText || ""),
        headers: new Headers(Array.isArray(e.headers) ? e.headers : [])
      });
    } catch {
      return this.entries.delete(o), null;
    }
    const a = Rn({
      response: r,
      bodyText: e.bodyText,
      bodyBytes: e.bodyBytes,
      payload: e.payload
    });
    return a ? (this.entries.delete(o), this.entries.set(o, e), {
      representation: a,
      metadata: e
    }) : (this.entries.delete(o), null);
  }
};
function bu() {
  return {
    TmdbLookupCache: /* @__PURE__ */ new Map(),
    TodbVideoIdCache: /* @__PURE__ */ new Map(),
    flights: /* @__PURE__ */ new Map(),
    jsonFlights: /* @__PURE__ */ new Map()
  };
}
function vi(o, e, t, r, a, n = Date.now) {
  const s = e.get(t);
  return s && s.expiresAt > n() ? (e.delete(t), e.set(t, s), Promise.resolve(s.value)) : (e.delete(t), Fi(o.flights, t, async () => {
    const i = await a();
    return e.set(t, {
      value: i,
      expiresAt: n() + (i == null ? 6e4 : r)
    }), e.size > 4096 && e.delete(e.keys().next().value), i;
  }));
}
function Fi(o, e, t) {
  const r = o.get(e);
  if (r) return r;
  if (o.size >= 128) return Promise.resolve(null);
  const a = Promise.resolve().then(t).finally(() => {
    o.get(e) === a && o.delete(e);
  });
  return o.set(e, a), a;
}
function Eu() {
  return {
    NodeCache: /* @__PURE__ */ new Map(),
    PlaybackRouteHotCache: /* @__PURE__ */ new Map(),
    NodesListCache: null,
    NodesRevisionCache: null,
    NodesIndexCache: null,
    NodesRevisionCacheGeneration: 0,
    NodeCacheResetGeneration: 0,
    NodeCacheGenerationNonce: 0,
    NodeCacheGenerationEvictionEpoch: 0,
    NodeCacheGenerations: /* @__PURE__ */ new Map(),
    SingleFlightTasks: /* @__PURE__ */ new Map(),
    NodeIndexMutationChain: Promise.resolve(),
    CleanupIterators: {
      node: null,
      playbackRoute: null
    },
    CleanupState: Ql()
  };
}
var At = Fa(Eu), Bo = Fa(bu), be = (o = null) => At.get(o), ur = au(), cn = Zl(), so = eu(), { runDataMutation: cr, runTidyMutation: Au } = ru(so), oe = {
  ProxyFailoverStateCache: /* @__PURE__ */ new Map(),
  CryptoKeyCache: /* @__PURE__ */ new Map(),
  PlaybackInfoResponseCache: /* @__PURE__ */ new Map(),
  PlaybackProgressRelay: /* @__PURE__ */ new Map(),
  MetadataPrewarmTasks: /* @__PURE__ */ new Map(),
  MedbItemsCountsCache: /* @__PURE__ */ new Map(),
  DashboardMonthlyTrafficCache: /* @__PURE__ */ new Map(),
  SingleFlightTasks: /* @__PURE__ */ new Map(),
  AdminRemoteShellCacheMutationChains: /* @__PURE__ */ new Map(),
  LogsReadinessProbeCache: /* @__PURE__ */ new WeakMap(),
  ProxyAccessRuleProfileCache: /* @__PURE__ */ new WeakMap()
};
for (const o of [
  "NodeCache",
  "PlaybackRouteHotCache",
  "NodesListCache",
  "NodesRevisionCache",
  "NodesIndexCache",
  "NodesRevisionCacheGeneration",
  "NodeCacheResetGeneration",
  "NodeCacheGenerationNonce",
  "NodeCacheGenerationEvictionEpoch",
  "NodeCacheGenerations"
]) Object.defineProperty(oe, o, {
  enumerable: !0,
  configurable: !1,
  get: () => At.current()[o],
  set: (e) => {
    At.current()[o] = e;
  }
});
for (const o of ["ConfigCache", "RuntimeConfigCacheGeneration"]) Object.defineProperty(oe, o, {
  enumerable: !0,
  configurable: !1,
  get: () => cn.current()[o],
  set: (e) => {
    cn.current()[o] = e;
  }
});
var je = {
  LogQueue: [],
  LogDedupe: /* @__PURE__ */ new Map(),
  RateLimitCache: /* @__PURE__ */ new Map(),
  LogFlushPending: !1,
  LogFlushTask: null,
  LogClearEpochMs: 0,
  LogLastFlushAt: 0,
  OpsStatusWriteChain: Promise.resolve(),
  NodeIndexMutationChain: Promise.resolve(),
  InitCheckWarnedFingerprints: /* @__PURE__ */ new Set(),
  TmdbCredentialOverrideWarned: !1
};
for (const o of ["CleanupState"]) Object.defineProperty(je, o, {
  enumerable: !0,
  configurable: !1,
  get: () => At.current()[o],
  set: (e) => {
    At.current()[o] = e;
  }
});
for (const o of ["KvDataMutationChain", "KvTidyMutationChain"]) Object.defineProperty(je, o, {
  enumerable: !0,
  configurable: !1,
  get: () => so.current()[o],
  set: (e) => {
    so.current()[o] = e;
  }
});
var ee = {
  D1SchemaReadyState: /* @__PURE__ */ new WeakMap(),
  D1DatabaseInitReady: /* @__PURE__ */ new WeakMap(),
  LogsBaseDbReady: /* @__PURE__ */ new WeakMap(),
  StatsHourlyDbReady: /* @__PURE__ */ new WeakMap(),
  DnsIpWorkspaceDbReady: /* @__PURE__ */ new WeakMap(),
  OpsStatusDbReady: /* @__PURE__ */ new WeakMap(),
  OpsStatusShadowCache: /* @__PURE__ */ new WeakMap(),
  AdminShellStatusWriteState: /* @__PURE__ */ new WeakMap(),
  ScheduledLeaseDbReady: /* @__PURE__ */ new WeakMap(),
  AuthFailuresDbReady: /* @__PURE__ */ new WeakMap(),
  CfDashboardCacheDbReady: /* @__PURE__ */ new WeakMap(),
  CfRuntimeCacheDbReady: /* @__PURE__ */ new WeakMap()
};
function Tu(o) {
  const e = {}, t = {};
  for (const r of o) for (const a of Object.keys(r)) t[a] = {
    enumerable: !0,
    configurable: !1,
    get: () => r[a],
    set: (n) => {
      r[a] = n;
    }
  };
  return Object.defineProperties(e, t);
}
var Ru = Tu([
  oe,
  je,
  ee
]);
function ue(o, e = "unknown_error") {
  const t = String(o?.message || "").trim();
  return t || String(o || "").trim() || e;
}
function Pe(o, e = 500) {
  const t = Number(o);
  if (Number.isFinite(t) && t >= 400 && t <= 599) return Math.floor(t);
  const r = Number(e);
  return Number.isFinite(r) && r >= 400 && r <= 599 ? Math.floor(r) : 500;
}
function wn(o) {
  if (!o || typeof o != "object") return !1;
  const e = String(o?.code || "").trim(), t = Number(o?.status);
  return !!e || Number.isFinite(t) && t >= 400 && t <= 599;
}
function Cu(o, e = {}) {
  const t = Pe(e?.status, 500), r = String(e?.code || "INTERNAL_ERROR").trim().toUpperCase() || "INTERNAL_ERROR", a = String(e?.message || "Server Error").trim() || "Server Error", n = wn(o);
  return {
    status: n ? Pe(o?.status, t) : t,
    code: n && String(o?.code || r).trim().toUpperCase() || r,
    message: n && String(o?.message || a).trim() || a,
    details: n && o?.details !== void 0 ? o.details : e?.details !== void 0 ? e.details : null
  };
}
function Ui(o = "get", e = {}, t = "unknown_error") {
  const r = H(e) ? e : {}, a = {
    dependency: "KV",
    operation: String(o || "").trim().toLowerCase() === "list" ? "list" : "get",
    reason: String(t || "unknown_error").trim() || "unknown_error"
  }, n = String(r.key || "").trim(), s = String(r.prefix || "").trim();
  return n && (a.key = n), s && (a.prefix = s), Ie("KV_READ_FAILED", "KV 读取异常", 503, a);
}
function Ko(o) {
  return wn(o) && String(o?.code || "").trim().toUpperCase() === "KV_READ_FAILED" && String(o?.details?.dependency || "").trim().toUpperCase() === "KV";
}
function wu(o, e = "INTERNAL_ERROR", t = "Server Error", r = "admin.read.kv_read_failed") {
  if (!Ko(o)) return o;
  const a = Ie(e, t, 503, { ...H(o?.details) ? o.details : {} });
  return Le(r, a, a.details), a;
}
function Mt(o, e, t, r = "admin.read") {
  if (!Ko(o)) return o;
  const a = String(o?.details?.operation || "").trim().toLowerCase() === "list" ? "list" : "get";
  return wu(o, e, t, `${String(r || "admin.read").trim() || "admin.read"}.kv_${a}_failed`);
}
function Le(o, e, t = null, r = "warn") {
  const a = r === "error" ? "error" : "warn", n = String(o || "runtime_failure").trim() || "runtime_failure", s = H(t) ? { ...t } : {}, i = String(e?.code || "").trim(), c = Number(e?.status);
  i && (s.errorCode = i), Number.isFinite(c) && (s.errorStatus = Math.floor(c)), Object.keys(s).length > 0 ? console[a](`[${n}] ${ue(e)}`, s) : console[a](`[${n}] ${ue(e)}`);
}
async function ge(o, e, t = null, r = null) {
  try {
    return await o;
  } catch (a) {
    return Le(e, a, t), r;
  }
}
function Ie(o = "CONFIG_INVALID", e = "配置无效", t = 400, r = null) {
  const a = new Error(String(e || "配置无效"));
  return a.code = String(o || "CONFIG_INVALID"), a.status = Pe(t, 400), r != null && (a.details = r), a;
}
function Vt(o) {
  return o ? o.name === "AbortError" ? !0 : String(o.message || "").toLowerCase().includes("abort") : !1;
}
var ki = 4 * 1024 * 1024, Ln = 64 * 1024, Hi = Object.freeze({
  "Referrer-Policy": "origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=15552000; preload",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block"
}), ya = Object.freeze({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Emby-Authorization, X-Emby-Token, X-Emby-Client, X-Emby-Device-Id, X-Emby-Device-Name, X-Emby-Client-Version, X-MediaBrowser-Authorization, X-MediaBrowser-Token"
});
function Vr(o, e) {
  const t = o.get("Vary");
  if (!t) {
    o.set("Vary", e);
    return;
  }
  const r = t.split(",").map((a) => a.trim()).filter(Boolean);
  r.includes(e) || r.push(e), o.set("Vary", r.join(", "));
}
function Ne(o) {
  return Object.entries(Hi).forEach(([e, t]) => o.set(e, t)), o;
}
function re(o) {
  return Array.isArray(o) || H(o) ? JSON.stringify(o) : o === void 0 ? "" : JSON.stringify(o);
}
var B = () => Date.now(), $i = (o) => new Promise((e) => setTimeout(e, Math.max(0, Number(o) || 0)));
function Lu(o) {
  let e = !1, t = () => {
  };
  const r = setTimeout(() => {
    e || (e = !0, t(!0));
  }, Math.max(0, Number(o) || 0));
  return {
    promise: new Promise((a) => {
      t = a;
    }),
    cancel() {
      return e ? !1 : (e = !0, clearTimeout(r), t(!1), !0);
    }
  };
}
var Nu = Object.freeze({
  JwtExpiry: 3600 * 24 * 30,
  LoginLockDuration: 900,
  MaxLoginAttempts: 5
}), Ut = Object.freeze({
  CacheTTL: 6e4,
  NodeMissCacheTtlMs: 1e3,
  CryptoKeyCacheTTL: 86400,
  CryptoKeyCacheMax: 100,
  NodeCacheMax: 512,
  PlaybackRouteHotCacheTtlMs: 86400 * 1e3,
  PlaybackRouteHotCacheMax: 256,
  NodesRevisionCacheTtlMs: 1e3,
  NodesReadConcurrency: 12,
  CacheTtlImagesDays: 30,
  PingCacheMinutes: 10,
  PlaybackInfoCacheTtlSec: 60,
  PlaybackInfoCacheMax: 64,
  PlaybackInfoCacheEntryMaxBytes: 256 * 1024,
  PlaybackInfoCacheTotalMaxBytes: 4 * 1024 * 1024,
  VideoProgressForwardIntervalSec: 3,
  VideoProgressForwardSessionMax: 128,
  VideoProgressSnapshotMaxBytes: 32 * 1024,
  RateLimitCacheMax: 4096,
  D1SchemaReadyTtlMs: 600 * 1e3,
  OpsStatusReadCacheTtlMs: 15 * 1e3,
  AdminShellStatusStableWriteIntervalMs: 300 * 1e3,
  CleanupBudgetMs: 1,
  CleanupChunkSize: 64,
  CleanupMinIntervalMs: 1e3
}), Iu = Object.freeze({
  EnableHostPrefixProxy: !1,
  MultiLinkCopyPanelEnabled: !1,
  DashboardShowD1WriteHotspot: !1,
  DashboardShowKvD1Status: !1,
  UiRadiusPx: 10,
  AdminUiSkin: "classic",
  NodePanelPingAutoSort: !1
}), Du = Object.freeze({
  LogRetentionDays: 7,
  LogRetentionDaysMax: 365,
  LogFlushDelayMinutes: 20,
  LogFlushCountThreshold: 100,
  LogBatchChunkSize: 50,
  LogBatchRetryCount: 2,
  LogBatchRetryBackoffMs: 75,
  LogQueryDefaultDays: 1,
  LogKeywordMaxWindowDays: 3,
  LogSearchMode: "fts",
  LogWriteMode: "info",
  LogVacuumMinIntervalMs: 10080 * 60 * 1e3,
  LogFtsRebuildMinIntervalMs: 10080 * 60 * 1e3,
  KvTidyIntervalMs: 3600 * 1e3,
  TgAlertDroppedBatchThreshold: 0,
  TgAlertFlushRetryThreshold: 0,
  TgAlertCooldownMinutes: 30,
  TgAlertOnScheduledFailure: !1,
  TgAlertKvUsageEnabled: !1,
  TgAlertKvUsageThresholdPercent: 80,
  TgAlertD1UsageEnabled: !1,
  TgAlertD1UsageThresholdPercent: 80,
  LogQueueMax: 512,
  LogQueueOverflowDropCount: 256,
  LogDedupeMax: 2048,
  LogDedupeTrimTarget: 1024
}), Mu = Object.freeze({
  ScheduledLeaseMinMs: 30 * 1e3,
  ScheduledLeaseMs: 300 * 1e3,
  ScheduleUtcOffsetMinutes: 480,
  TgDailyReportSummaryEnabled: !1,
  TgDailyReportKvEnabled: !1,
  TgDailyReportD1Enabled: !1,
  TgDailyReportClockTimes: ["09:00"]
}), Ge = Object.freeze({
  PingTimeoutMs: 1e4,
  HedgeFailoverEnabled: !1,
  HedgeProbePreferGet: !0,
  HedgeProbePath: "/emby/system/ping",
  HedgeProbeTimeoutMs: 2500,
  HedgeProbeParallelism: 2,
  HedgeWaitTimeoutMs: 3e3,
  HedgeLockTtlMs: 5e3,
  HedgePreferredTtlSec: 300,
  HedgeFailureCooldownSec: 30,
  HedgeWakeJitterMs: 200,
  UpstreamTimeoutMs: 8e3,
  UpstreamRetryAttempts: 0,
  ProxyStreamIdleTimeoutMs: 15e3,
  ProxyPlaylistIdleTimeoutMs: 12e3,
  BufferedRetryBodyMaxBytes: 256 * 1024,
  PrewarmCacheTtl: 120,
  MetadataPrewarmTimeoutMs: 3e3,
  PrewarmPrefetchBytes: 4 * 1024 * 1024,
  DefaultPlaybackInfoMode: "passthrough",
  DefaultRealClientIpMode: "forward",
  DefaultMediaAuthMode: "auto"
}), Pu = Object.freeze({
  DnsHistoryLimit: 5,
  DnsIpProbeCacheTtlSec: 600,
  DnsIpProbeTimeoutMs: 2500,
  DnsIpProbeConcurrency: 4,
  DnsIpWorkspaceSyncProbeLimit: 2,
  DnsIpSourceConcurrency: 4,
  DnsIpSourceFetchMaxBytes: 2 * 1024 * 1024,
  DnsIpSourceIpLimit: 5
}), xu = Object.freeze({
  CfQuotaPlanCacheMinutes: 60,
  CfQuotaPlanOverride: ""
}), Ou = Object.freeze({
  AssetHash: `v${on}`,
  Version: on
}), vu = Object.freeze({
  ...Nu,
  ...Ut,
  ...Iu,
  ...Du,
  ...Mu,
  ...Ge,
  ...Pu,
  ...xu,
  ...Ou
}), $ = Object.freeze({ Defaults: vu });
function Fe(o) {
  return fe(o, $.Defaults.ScheduleUtcOffsetMinutes, -720, 840);
}
function Ra(o = "", e = "00:00") {
  const t = String(e || "00:00").trim() || "00:00", r = String(o || "").trim().match(/^(\d{1,2}):(\d{1,2})$/);
  if (!r) return t;
  const a = Number(r[1]), n = Number(r[2]);
  return !Number.isInteger(a) || a < 0 || a > 23 || !Number.isInteger(n) || n < 0 || n > 59 ? t : `${String(a).padStart(2, "0")}:${String(n).padStart(2, "0")}`;
}
function Ot(o = [], e = []) {
  const t = Array.isArray(o) ? o : String(o || "").split(/[\r\n,]+/), r = [], a = /* @__PURE__ */ new Set();
  for (const n of t) {
    const s = Ra(n, "");
    !s || a.has(s) || (a.add(s), r.push(s));
  }
  return r.sort((n, s) => Or(n) - Or(s)), r.length ? r : [...new Set((Array.isArray(e) ? e : [e]).map((n) => Ra(n, "")).filter(Boolean))].sort((n, s) => Or(n) - Or(s));
}
function Or(o = "") {
  const e = Ra(o, "");
  if (!e) return -1;
  const [t, r] = e.split(":");
  return (Number(t) || 0) * 60 + (Number(r) || 0);
}
function Fu(o = "") {
  const e = String(o || "").trim().match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/);
  return e ? {
    dateKey: e[1],
    clockTime: Ra(e[2], "")
  } : {
    dateKey: "",
    clockTime: ""
  };
}
function Uu(o, e = $.Defaults.ScheduleUtcOffsetMinutes) {
  const t = Fe(e), r = o.getUTCFullYear(), a = String(o.getUTCMonth() + 1).padStart(2, "0"), n = String(o.getUTCDate()).padStart(2, "0"), s = String(o.getUTCHours()).padStart(2, "0"), i = String(o.getUTCMinutes()).padStart(2, "0"), c = String(o.getUTCSeconds()).padStart(2, "0"), l = String(o.getUTCMilliseconds()).padStart(3, "0"), u = t >= 0 ? "+" : "-", d = Math.abs(t);
  return `${r}-${a}-${n}T${s}:${i}:${c}.${l}${u}${String(Math.floor(d / 60)).padStart(2, "0")}:${String(d % 60).padStart(2, "0")}`;
}
function ka(o = /* @__PURE__ */ new Date(), e = $.Defaults.ScheduleUtcOffsetMinutes) {
  const t = Fe(e), r = t * 60 * 1e3, a = o instanceof Date ? new Date(o.getTime()) : new Date(o), n = a.getTime() + r, s = new Date(n), i = s.getUTCFullYear(), c = String(s.getUTCMonth() + 1).padStart(2, "0"), l = String(s.getUTCDate()).padStart(2, "0"), u = String(s.getUTCHours()).padStart(2, "0"), d = String(s.getUTCMinutes()).padStart(2, "0"), f = String(s.getUTCSeconds()).padStart(2, "0"), m = String(s.getUTCMilliseconds()).padStart(3, "0"), p = Number(u), h = Number(d);
  return {
    now: a,
    shiftedDate: s,
    utcOffsetMinutes: t,
    offsetLabel: zo(t),
    dateKey: `${i}-${c}-${l}`,
    clockTime: `${u}:${d}`,
    hour: p,
    minute: h,
    second: Number(f),
    millisecond: Number(m),
    minuteOfDay: p * 60 + h,
    localIso: Uu(s, t)
  };
}
function Ns(o = /* @__PURE__ */ new Date(), e = $.Defaults.ScheduleUtcOffsetMinutes) {
  return ka(o, e).localIso;
}
function ut(o = /* @__PURE__ */ new Date(), e = $.Defaults.ScheduleUtcOffsetMinutes) {
  return ka(o, e);
}
function dt(o = /* @__PURE__ */ new Date(), e = $.Defaults.ScheduleUtcOffsetMinutes, t = "") {
  const r = ka(o, e), a = Ra(t || r.clockTime, r.clockTime), n = Or(a), s = Date.UTC(r.shiftedDate.getUTCFullYear(), r.shiftedDate.getUTCMonth(), r.shiftedDate.getUTCDate()) - r.utcOffsetMinutes * 60 * 1e3, i = s + 1440 * 60 * 1e3 - 1, c = s + Math.max(0, n) * 60 * 1e3;
  return {
    ...r,
    normalizedClockTime: a,
    plannedMinuteOfDay: n,
    plannedTs: c,
    plannedSlotKey: `${r.dateKey} ${a}`,
    startTs: s,
    endTs: i
  };
}
function ku(o = /* @__PURE__ */ new Date(), e = $.Defaults.ScheduleUtcOffsetMinutes) {
  const t = ut(o, e);
  return {
    ...t,
    slotKey: `${t.dateKey} ${t.clockTime}`
  };
}
function zo(o = $.Defaults.ScheduleUtcOffsetMinutes) {
  const e = Fe(o), t = e >= 0 ? "+" : "-", r = Math.abs(e);
  return `UTC${t}${String(Math.floor(r / 60)).padStart(2, "0")}:${String(r % 60).padStart(2, "0")}`;
}
function Hu(o = {}, e = "") {
  const t = o?.fixedQueue && typeof o.fixedQueue == "object" ? o.fixedQueue : {};
  let r = String(t.localDateKey || "").trim(), a = Ot(t.executedSlots || [], []);
  if (!r) {
    const n = Fu(o?.lastPlannedSlot || "");
    n.dateKey && n.dateKey === e && (r = n.dateKey, a = Ot([...a, n.clockTime], []));
  }
  return !e || r !== e ? {
    localDateKey: e,
    executedSlots: []
  } : {
    localDateKey: r,
    executedSlots: a
  };
}
function $u(o = {}, e = [], t = $.Defaults.ScheduleUtcOffsetMinutes, r = /* @__PURE__ */ new Date()) {
  const a = ka(r, t), n = Ot(e, []), s = Hu(o, a.dateKey);
  if (!n.length) return {
    due: !1,
    context: a,
    normalizedClockTimes: n,
    fixedQueue: s,
    dueSlots: [],
    reason: "no_clock_times_configured"
  };
  const i = new Set(Ot(s.executedSlots || [], [])), c = n.filter((u) => Or(u) <= a.minuteOfDay), l = c.filter((u) => !i.has(u));
  return l.length ? {
    due: !0,
    context: a,
    normalizedClockTimes: n,
    fixedQueue: s,
    dueSlots: l,
    reason: "clock_slots_due"
  } : {
    due: !1,
    context: a,
    normalizedClockTimes: n,
    fixedQueue: s,
    dueSlots: [],
    reason: c.length ? "slot_already_processed" : "time_not_matched"
  };
}
function jt(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "emby" ? "emby" : e === "jellyfin" ? "jellyfin" : e === "passthrough" ? "passthrough" : "auto";
}
function Fr(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "forward" ? "forward" : e === "strip" ? "strip" : e === "disable" || e === "none" ? "disable" : "forward";
}
function Ur(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "rewrite" ? "rewrite" : e === "passthrough" ? "passthrough" : "inherit";
}
function dr(o = "") {
  return String(o || "").trim().toLowerCase() === "host_prefix" ? "host_prefix" : "kv_route";
}
function tt(o = "") {
  return dr(o) === "host_prefix";
}
function Bi(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "emby" ? "emby" : e === "jellyfin" ? "jellyfin" : e === "passthrough" ? "passthrough" : "auto";
}
function Qt(o = "") {
  return String(o || "").trim().toLowerCase() === "rewrite" ? "rewrite" : $.Defaults.DefaultPlaybackInfoMode;
}
function Wo(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "strip" ? "strip" : e === "disable" || e === "none" ? "disable" : "forward";
}
function jr(o) {
  return fe(o, $.Defaults.DnsIpSourceIpLimit, 1, 1e3);
}
function Nn(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "direct" ? "direct" : e === "proxy" ? "proxy" : "inherit";
}
function qt(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "emos" ? "emos" : e === "tmdb" ? "tmdb" : "auto";
}
function qr(o = {}) {
  return Nn(o?.mainVideoStreamMode ?? o?.wangpanDirectMode ?? o?.wangpanMode);
}
function Xr(o = [], e = "") {
  const t = Array.isArray(o) ? o : String(o || "").split(/[,，\r\n]+/), r = [], a = /* @__PURE__ */ new Set();
  for (const n of [...t, e]) {
    const s = String(n || "").trim().slice(0, 24), i = s.toLowerCase();
    if (!(!s || a.has(i)) && (a.add(i), r.push(s), r.length >= 20))
      break;
  }
  return r;
}
var io = /\b(?:(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)|[0-9a-f:]{2,})\b/gi, Ki = {
  AKL: {
    cityName: "Auckland",
    countryCode: "NZ",
    countryName: "新西兰"
  },
  AMS: {
    cityName: "Amsterdam",
    countryCode: "NL",
    countryName: "荷兰"
  },
  ARN: {
    cityName: "Stockholm",
    countryCode: "SE",
    countryName: "瑞典"
  },
  ATL: {
    cityName: "Atlanta",
    countryCode: "US",
    countryName: "美国"
  },
  BKK: {
    cityName: "Bangkok",
    countryCode: "TH",
    countryName: "泰国"
  },
  BOM: {
    cityName: "Mumbai",
    countryCode: "IN",
    countryName: "印度"
  },
  CDG: {
    cityName: "Paris",
    countryCode: "FR",
    countryName: "法国"
  },
  CGK: {
    cityName: "Jakarta",
    countryCode: "ID",
    countryName: "印度尼西亚"
  },
  CPH: {
    cityName: "Copenhagen",
    countryCode: "DK",
    countryName: "丹麦"
  },
  DEL: {
    cityName: "Delhi",
    countryCode: "IN",
    countryName: "印度"
  },
  DFW: {
    cityName: "Dallas",
    countryCode: "US",
    countryName: "美国"
  },
  DOH: {
    cityName: "Doha",
    countryCode: "QA",
    countryName: "卡塔尔"
  },
  DXB: {
    cityName: "Dubai",
    countryCode: "AE",
    countryName: "阿联酋"
  },
  EWR: {
    cityName: "Newark",
    countryCode: "US",
    countryName: "美国"
  },
  FRA: {
    cityName: "Frankfurt",
    countryCode: "DE",
    countryName: "德国"
  },
  GRU: {
    cityName: "Sao Paulo",
    countryCode: "BR",
    countryName: "巴西"
  },
  HKG: {
    cityName: "Hong Kong",
    countryCode: "HK",
    countryName: "中国香港"
  },
  HND: {
    cityName: "Tokyo",
    countryCode: "JP",
    countryName: "日本"
  },
  IAD: {
    cityName: "Ashburn",
    countryCode: "US",
    countryName: "美国"
  },
  ICN: {
    cityName: "Seoul",
    countryCode: "KR",
    countryName: "韩国"
  },
  JNB: {
    cityName: "Johannesburg",
    countryCode: "ZA",
    countryName: "南非"
  },
  KIX: {
    cityName: "Osaka",
    countryCode: "JP",
    countryName: "日本"
  },
  KUL: {
    cityName: "Kuala Lumpur",
    countryCode: "MY",
    countryName: "马来西亚"
  },
  LAX: {
    cityName: "Los Angeles",
    countryCode: "US",
    countryName: "美国"
  },
  LHR: {
    cityName: "London",
    countryCode: "GB",
    countryName: "英国"
  },
  MAD: {
    cityName: "Madrid",
    countryCode: "ES",
    countryName: "西班牙"
  },
  MEL: {
    cityName: "Melbourne",
    countryCode: "AU",
    countryName: "澳大利亚"
  },
  MIA: {
    cityName: "Miami",
    countryCode: "US",
    countryName: "美国"
  },
  MNL: {
    cityName: "Manila",
    countryCode: "PH",
    countryName: "菲律宾"
  },
  MXP: {
    cityName: "Milan",
    countryCode: "IT",
    countryName: "意大利"
  },
  NRT: {
    cityName: "Tokyo",
    countryCode: "JP",
    countryName: "日本"
  },
  ORD: {
    cityName: "Chicago",
    countryCode: "US",
    countryName: "美国"
  },
  OSL: {
    cityName: "Oslo",
    countryCode: "NO",
    countryName: "挪威"
  },
  PHX: {
    cityName: "Phoenix",
    countryCode: "US",
    countryName: "美国"
  },
  PRG: {
    cityName: "Prague",
    countryCode: "CZ",
    countryName: "捷克"
  },
  SAN: {
    cityName: "San Diego",
    countryCode: "US",
    countryName: "美国"
  },
  SCL: {
    cityName: "Santiago",
    countryCode: "CL",
    countryName: "智利"
  },
  SEA: {
    cityName: "Seattle",
    countryCode: "US",
    countryName: "美国"
  },
  SFO: {
    cityName: "San Francisco",
    countryCode: "US",
    countryName: "美国"
  },
  SIN: {
    cityName: "Singapore",
    countryCode: "SG",
    countryName: "新加坡"
  },
  SJC: {
    cityName: "San Jose",
    countryCode: "US",
    countryName: "美国"
  },
  SYD: {
    cityName: "Sydney",
    countryCode: "AU",
    countryName: "澳大利亚"
  },
  TPE: {
    cityName: "Taipei",
    countryCode: "TW",
    countryName: "中国台湾"
  },
  VIE: {
    cityName: "Vienna",
    countryCode: "AT",
    countryName: "奥地利"
  },
  WAW: {
    cityName: "Warsaw",
    countryCode: "PL",
    countryName: "波兰"
  },
  YUL: {
    cityName: "Montreal",
    countryCode: "CA",
    countryName: "加拿大"
  },
  YVR: {
    cityName: "Vancouver",
    countryCode: "CA",
    countryName: "加拿大"
  },
  YYZ: {
    cityName: "Toronto",
    countryCode: "CA",
    countryName: "加拿大"
  }
}, Is = Object.freeze((() => {
  const o = {};
  for (const e of Object.values(Ki)) {
    const t = String(e?.countryCode || "").trim().toUpperCase(), r = String(e?.countryName || "").trim();
    !t || !r || o[t] || (o[t] = r);
  }
  return o.CN = o.CN || "中国", o.HK = o.HK || "中国香港", o.MO = o.MO || "中国澳门", o.TW = o.TW || "中国台湾", o;
})()), da = null;
function Ha(o = "") {
  const e = String(o || "").trim();
  if (!e || !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(e)) return !1;
  const t = e.split(".");
  return t.length === 4 && t.every((r) => {
    const a = Number(r);
    return Number.isInteger(a) && a >= 0 && a <= 255;
  });
}
function Bu(o = "") {
  if (!Ha(o)) return !1;
  const [e = 0, t = 0] = String(o || "").trim().split(".").map((r) => Number(r));
  return e === 10 || e === 127 || e === 169 && t === 254 || e === 172 && t >= 16 && t <= 31 ? !0 : e === 192 && t === 168;
}
function In(o = "") {
  const e = String(o || "").trim();
  if (!e || !e.includes(":") || /\s/.test(e)) return !1;
  try {
    return new URL(`http://[${e}]/`), !0;
  } catch {
    return !1;
  }
}
function zi(o = "") {
  return String(o || "").trim().toUpperCase() === "IPV6" ? "IPv6" : "IPv4";
}
function Qe(o = "") {
  return In(o) ? "IPv6" : Ha(o) ? "IPv4" : "";
}
function Go(o = "", e = {}) {
  const t = String(o || ""), r = /* @__PURE__ */ new Set(), a = [], n = Number(e?.limit), s = Number.isFinite(n) && n > 0 ? Math.max(1, Math.floor(n)) : Number.POSITIVE_INFINITY, i = (l) => {
    const u = String(l || "").trim();
    if (!u) return !1;
    const d = Qe(u);
    if (!d) return !1;
    const f = u.toLowerCase();
    return r.has(f) ? !1 : (r.add(f), a.push({
      ip: u,
      ipType: d
    }), a.length >= s);
  };
  io.lastIndex = 0;
  let c = null;
  for (; (c = io.exec(t)) !== null && !i(c[0]); ) ;
  return a;
}
function Ku(o = null) {
  const e = Array.isArray(o?.Answer) ? o.Answer : [], t = /* @__PURE__ */ new Set(), r = [];
  for (const a of e) {
    const n = String(a?.data || "").trim(), s = Qe(n);
    if (!s) continue;
    const i = n.toLowerCase();
    t.has(i) || (t.add(i), r.push({
      ip: n,
      ipType: s
    }));
  }
  return r;
}
function Kn(o = "") {
  return String(o || "").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
}
function zu(o = "") {
  const e = /* @__PURE__ */ new Map(), t = String(o || ""), r = t.match(/\[[0-9a-f:]{2,}\]/gi) || [];
  for (const n of r) {
    const s = String(n || "").replace(/^\[|\]$/g, "").trim();
    Qe(s) && e.set(s.toLowerCase(), s);
  }
  const a = t.match(io) || [];
  for (const n of a) {
    const s = String(n || "").trim();
    Qe(s) && e.set(s.toLowerCase(), s);
  }
  return [...e.values()];
}
function Wu(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "联通" ? "联通" : e === "电信" ? "电信" : e === "移动" ? "移动" : e === "多线" ? "多线" : e === "ipv6" ? "ipv6" : "";
}
function Ds(o = "", e = "") {
  const t = Wu(e);
  return t ? String(o || "").trim().toLowerCase() === t.toLowerCase() : !0;
}
function Gu(o = "", e = "") {
  const t = /* @__PURE__ */ new Map(), r = (s, i = "") => {
    const c = String(s || "").trim(), l = Qe(c);
    if (!l || Bu(c)) return;
    const u = c.toLowerCase(), d = Yr(i), f = t.get(u);
    if (!f) {
      t.set(u, {
        ip: c,
        ipType: l,
        lineLabel: d
      });
      return;
    }
    !Yr(f?.lineLabel) && d && t.set(u, {
      ...f,
      lineLabel: d
    });
  }, a = String(o || ""), n = a.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];
  for (const s of n) {
    const i = s.match(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
    if (i.length < 3) continue;
    const c = Kn(String(i[1] || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    if (!Ds(c, e)) continue;
    const l = zu(Kn(String(i[2] || "").replace(/<[^>]+>/g, " "))).find((u) => Qe(u)) || "";
    l && r(l, c);
  }
  if (!t.size) {
    const s = Kn(a.replace(/<[^>]+>/g, `
`)), i = /(?:^|\n)\s*(?:\d+\s+)?(电信|联通|移动|多线|ipv6)\s+((?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-f0-9]{1,4}:){2,}[a-f0-9:]{1,39})/gi;
    let c = null;
    for (; (c = i.exec(s)) !== null; )
      Ds(c[1], e) && r(c[2], c[1]);
  }
  return [...t.values()];
}
function Vu(o = "", e = {}) {
  return Go(o, e);
}
function ju(o = "") {
  const e = String(o || "").trim().toUpperCase(), t = Ki[e];
  return e ? t ? {
    coloCode: e,
    cityName: String(t.cityName || e),
    countryCode: String(t.countryCode || "UNKNOWN"),
    countryName: String(t.countryName || "未知")
  } : {
    coloCode: e,
    cityName: e,
    countryCode: "UNKNOWN",
    countryName: "未知"
  } : {
    coloCode: "",
    cityName: "",
    countryCode: "UNKNOWN",
    countryName: "未知"
  };
}
function qu(o = "") {
  const e = String(o || "").trim().toUpperCase();
  if (!e || e === "UNKNOWN") return "未知";
  if (Is[e]) return Is[e];
  try {
    if (da === null && (da = typeof Intl?.DisplayNames == "function" ? new Intl.DisplayNames(["zh-CN"], { type: "region" }) : !1), da && typeof da.of == "function") {
      const t = String(da.of(e) || "").trim();
      if (t) return t;
    }
  } catch {
  }
  return e;
}
function Wi(o = "") {
  const e = String(o || "").trim();
  if (!e) return "";
  const t = e.match(/-([A-Za-z]{3,4})$/);
  return t ? String(t[1] || "").trim().toUpperCase() : "";
}
function Xu(o = "") {
  return `dns-ip-source-${ie(o || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)}`;
}
function Rt(o = "") {
  return String(o || "").trim().toLowerCase() === "domain" ? "domain" : "url";
}
var Gi = Object.freeze([Object.freeze({
  id: "all",
  label: "麒麟优选",
  sourceType: "url",
  url: "https://api.uouin.com/cloudflare.html"
}), Object.freeze({
  id: "preferred",
  label: "CF-SPEED-DNS优选",
  sourceType: "url",
  url: "https://raw.githubusercontent.com/ZhiXuanWang/cf-speed-dns/refs/heads/main/ipTop10.html"
})]), Vi = Object.freeze([
  Object.freeze({
    id: "wetest_ipv4",
    label: "Wetest IPv4 API",
    sourceType: "url",
    url: "https://www.wetest.vip/api/cf2dns/get_cloudflare_ip?key=o1zrmHAF&type=v4"
  }),
  Object.freeze({
    id: "wetest_ipv6",
    label: "Wetest IPv6 API",
    sourceType: "url",
    url: "https://www.wetest.vip/api/cf2dns/get_cloudflare_ip?key=o1zrmHAF&type=v6"
  }),
  Object.freeze({
    id: "vps789_ip_api",
    label: "VPS789 优选IP API",
    sourceType: "url",
    url: "https://hhhhh.eu.org/vps789.txt"
  }),
  Object.freeze({
    id: "164746_source",
    label: "164746源",
    sourceType: "url",
    url: "https://ip.164746.xyz/"
  }),
  Object.freeze({
    id: "haogege_source",
    label: "haogege源",
    sourceType: "url",
    url: "https://hhhhh.eu.org/haogege.txt"
  }),
  Object.freeze({
    id: "bestcf_source",
    label: "bestcf源",
    sourceType: "url",
    url: "https://raw.githubusercontent.com/hubbylei/bestcf/main/bestcf.txt"
  })
]), Yu = Object.freeze([
  Object.freeze({
    label: "CM优选域名集合",
    url: "https://cf.090227.xyz/"
  }),
  Object.freeze({
    label: "NB优选",
    url: "https://www.byoip.top/"
  }),
  Object.freeze({
    label: "VPS789 域名优选",
    url: "https://vps789.com/cfip/?remarks=domain"
  })
]), Ju = Object.freeze([Object.freeze({
  label: "VPS789 优选IP",
  url: "https://vps789.com/cfip/"
}), Object.freeze({
  label: "Wetest IPv4 优选",
  url: "https://www.wetest.vip/page/cloudflare/address_v4.html"
})]);
function Qu(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "builtin" ? "builtin" : e === "preset" ? "preset" : "custom";
}
function ji(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "preferred" ? "preferred" : e === "all" ? "all" : "";
}
function Zu(o = "") {
  return String(o || "").trim().toLowerCase().replace(/[^a-z0-9_:-]+/g, "_");
}
function ed(o = "") {
  const e = ji(o);
  return Gi.find((t) => t.id === e) || null;
}
function td(o = "") {
  const e = Zu(o);
  return e && Vi.find((t) => t.id === e) || null;
}
function Cr() {
  return {
    builtInSourceOptions: Gi.map((o) => ({
      id: o.id,
      label: o.label,
      sourceType: o.sourceType,
      value: "domain" in o ? o.domain : o.url
    })),
    presetList: Vi.map((o) => ({
      id: o.id,
      label: o.label,
      sourceType: o.sourceType,
      value: "domain" in o ? o.domain : o.url
    })),
    preferredDomainLinks: Yu.map((o) => ({ ...o })),
    preferredIpLinks: Ju.map((o) => ({ ...o }))
  };
}
function Yr(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e.includes("联通") ? "联通" : e.includes("电信") ? "电信" : e.includes("移动") ? "移动" : e.includes("多线") ? "多线" : e.includes("ipv6") ? "ipv6" : "";
}
function qi(o = {}) {
  const e = Qu(o?.sourceKind || o?.source_kind || ""), t = e === "builtin" ? ed(o?.builtinId || o?.builtin_id || o?.presetId || o?.preset_id || o?.name) : null, r = e === "preset" ? td(o?.presetId || o?.preset_id || o?.builtinId || o?.builtin_id || o?.name) : null, a = t || r || null, n = Rt(a?.sourceType || o?.sourceType || o?.source_type || ""), s = a && "url" in a ? a.url : "", i = a && "domain" in a ? a.domain : "", c = String(s || o?.url || "").trim(), l = ne(i || o?.domain || ""), u = String(o?.name || a?.label || "").trim();
  return {
    sourceKind: e,
    builtinId: t?.id || "",
    presetId: r?.id || "",
    name: u,
    sourceType: n,
    url: c,
    domain: l,
    resolvedLabel: String(a?.label || "").trim()
  };
}
function Xi(o = {}) {
  const e = qi(o);
  return Rt(e.sourceType) === "domain" ? ne(e.domain || "") : String(e.url || "").trim();
}
function fr(o = {}) {
  return !!Xi(o);
}
function _r(o = {}, e = {}) {
  const t = String(o?.ip || o?.content || "").trim(), r = Qe(t);
  if (!t || !r) return null;
  const a = String(e.updatedAt || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()), n = String(o?.sourceKind || o?.source_kind || e.sourceKind || "manual").trim().toLowerCase() || "manual", s = String(o?.sourceLabel || o?.source_label || e.sourceLabel || "").trim(), i = Yr(o?.lineLabel || o?.line_label || e.lineLabel || ""), c = String(o?.remark || "").trim();
  return {
    id: String(o?.id || `dns-ip-${ie(t.toLowerCase())}`),
    ip: t,
    ipType: r,
    sourceKind: n,
    sourceLabel: s,
    lineLabel: i,
    remark: c,
    createdAt: String(o?.createdAt || o?.created_at || e.createdAt || a),
    updatedAt: a
  };
}
function vt(o = {}, e = 0) {
  const t = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), r = qi(o), a = r.sourceKind, n = Rt(r.sourceType), s = String(r.builtinId || o?.builtinId || o?.builtin_id || "").trim(), i = String(r.presetId || o?.presetId || o?.preset_id || "").trim(), c = String(r.resolvedLabel || "").trim(), l = String(r.url || "").trim(), u = ne(r.domain || ""), d = n === "domain" ? u : l, f = String(o?.name || c || "").trim(), m = o?.enabled, p = m == null ? !0 : !(m === !1 || m === 0 || String(m).trim() === "0");
  return {
    id: String(o?.id || Xu(`${a}|${s}|${i}|${n}|${d}|${e}`)),
    name: f || c || `抓取源 ${Number(e) + 1}`,
    url: l,
    domain: u,
    sourceType: n,
    sourceKind: a,
    presetId: i,
    builtinId: s,
    enabled: p,
    sortOrder: Math.max(0, Number.parseInt(String(o?.sortOrder ?? o?.sort_order ?? e), 10) || 0),
    ipLimit: jr(o?.ipLimit ?? o?.ip_limit),
    lastFetchAt: String(o?.lastFetchAt || o?.last_fetch_at || ""),
    lastFetchStatus: String(o?.lastFetchStatus || o?.last_fetch_status || ""),
    lastFetchCount: Math.max(0, Number(o?.lastFetchCount ?? o?.last_fetch_count) || 0),
    createdAt: String(o?.createdAt || o?.created_at || t),
    updatedAt: String(o?.updatedAt || o?.updated_at || t)
  };
}
function br(o = []) {
  const e = [], t = /* @__PURE__ */ new Map();
  for (const r of Array.isArray(o) ? o : []) {
    const a = _r(r);
    if (!a) continue;
    const n = String(a.ip || "").trim().toLowerCase();
    if (!n) continue;
    const s = t.get(n);
    if (s === void 0) {
      t.set(n, e.length), e.push(a);
      continue;
    }
    const i = e[s];
    i && !Yr(i.lineLabel) && Yr(a.lineLabel) && (e[s] = {
      ...i,
      lineLabel: a.lineLabel
    });
  }
  return e;
}
function rd(o = {}) {
  const e = _r(o);
  return e ? {
    ...e,
    probeStatus: "pending",
    latencyMs: null,
    cfRay: "",
    coloCode: "",
    cityName: "",
    countryCode: "UNKNOWN",
    countryName: "未知",
    probedAt: ""
  } : null;
}
function Vo(o = []) {
  return br(o).map((e) => rd(e)).filter(Boolean);
}
function Dn(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "success" ? "success" : e === "failed" ? "failed" : "empty";
}
function Yi(o = {}, e = {}) {
  const t = vt(e), r = br(o?.items || []).slice(0, jr(t?.ipLimit)), a = Dn(o?.status || (r.length ? "success" : "empty"));
  return {
    id: String(o?.id || t?.id || ""),
    name: String(o?.name || t?.name || ""),
    sourceType: Rt(o?.sourceType || t?.sourceType || ""),
    status: a,
    count: Math.max(0, Number(o?.count) || r.length),
    items: r,
    error: a === "failed" ? String(o?.error || "") : "",
    lastFetchAt: String(o?.lastFetchAt || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString())
  };
}
function Ji(o = []) {
  return (Array.isArray(o) ? o : []).map((e) => {
    const t = Yi(e, e), r = Vo(t?.items || []);
    return {
      id: String(t?.id || ""),
      name: String(t?.name || ""),
      sourceType: Rt(t?.sourceType || ""),
      status: Dn(t?.status),
      count: Math.max(0, Number(t?.count) || r.length),
      items: r,
      error: String(t?.error || ""),
      lastFetchAt: String(t?.lastFetchAt || "")
    };
  });
}
function ad(o = []) {
  const e = Array.isArray(o) ? o : [];
  return e.length ? e.some((t) => Dn(t?.status) !== "failed") : !0;
}
function ln(o) {
  const e = Number(o) || 0;
  return !Number.isFinite(e) || e <= 0 ? "" : new Date(e).toISOString();
}
function Ja(o = [], e = $.Defaults.DnsIpSourceFetchMaxBytes) {
  return ie(re({
    maxBytes: fe(e, $.Defaults.DnsIpSourceFetchMaxBytes, 1024, 8 * 1024 * 1024),
    enabledSources: (Array.isArray(o) ? o : []).map((t, r) => vt(t, r)).filter((t) => t.enabled === !0 && fr(t)).map((t) => ({
      id: String(t.id || ""),
      name: String(t.name || ""),
      sourceType: Rt(t.sourceType),
      target: Xi(t),
      ipLimit: jr(t.ipLimit),
      enabled: t.enabled !== !1
    }))
  }));
}
function nd(o = "") {
  return String(o || "").trim().toLowerCase() === "shared_snapshot" ? "shared_snapshot" : "local_pool";
}
function Qi(o = []) {
  const e = [], t = /* @__PURE__ */ new Set();
  for (const r of Array.isArray(o) ? o : []) {
    const a = String(r?.ip || r || "").trim();
    if (!Qe(a)) continue;
    const n = a.toLowerCase();
    t.has(n) || (t.add(n), e.push(a));
  }
  return {
    normalizedIps: e,
    deleteKeySet: t
  };
}
function Ms(o = [], e = /* @__PURE__ */ new Set()) {
  const t = [], r = [];
  for (const a of br(o)) {
    const n = String(a?.ip || "").trim();
    if (n) {
      if (e.has(n.toLowerCase())) {
        r.push(a);
        continue;
      }
      t.push(a);
    }
  }
  return {
    keptItems: t,
    removedItems: r
  };
}
function od(o = {}, e = []) {
  const { deleteKeySet: t } = Qi(e), r = br(o?.items || []), a = Array.isArray(o?.sourceResults) ? o.sourceResults : [];
  if (!t.size) return {
    deletedCount: 0,
    deletedIps: [],
    items: r,
    sourceResults: a
  };
  const { keptItems: n, removedItems: s } = Ms(r, t), i = new Set(s.map((l) => String(l?.ip || "").trim().toLowerCase()).filter(Boolean)), c = a.map((l) => {
    const { keptItems: u } = Ms(l?.items || [], i), d = Dn(l?.status) === "failed" ? "failed" : u.length ? "success" : "empty";
    return {
      id: String(l?.id || ""),
      name: String(l?.name || ""),
      sourceType: Rt(l?.sourceType || l?.source_type || ""),
      status: d,
      count: u.length,
      items: u,
      error: d === "failed" ? String(l?.error || "") : "",
      lastFetchAt: String(l?.lastFetchAt || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString())
    };
  });
  return {
    deletedCount: s.length,
    deletedIps: s.map((l) => String(l?.ip || "").trim()).filter(Boolean),
    items: n,
    sourceResults: c
  };
}
function Qa(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "ok" ? "ok" : e === "pending" ? "pending" : e === "cf_header_missing" ? "cf_header_missing" : e === "non_cloudflare" ? "non_cloudflare" : e === "timeout" ? "timeout" : "network_error";
}
function zn(o = []) {
  const e = Array.isArray(o) ? o : [], t = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
  let a = 0, n = 0;
  for (const s of e) {
    zi(s?.ipType || s?.ip_type || s?.type || "") === "IPv6" ? n += 1 : a += 1;
    const i = String(s?.countryCode || s?.country_code || "").trim().toUpperCase(), c = String(s?.coloCode || s?.colo_code || "").trim().toUpperCase();
    i && t.add(i), c && r.add(c);
  }
  return {
    ipCount: e.length,
    ipv4Count: a,
    ipv6Count: n,
    countryCount: t.size,
    coloCount: r.size
  };
}
function sd(o = [], e = []) {
  const t = Array.isArray(o) ? o : [], r = Array.isArray(e) ? e : [];
  return {
    currentHost: zn(t),
    sharedPool: zn(r),
    combined: zn([...t, ...r])
  };
}
function id(o = "") {
  const e = String(o || "").trim().toLowerCase();
  if (!e) return "";
  const t = e.endsWith(".") ? e.slice(0, -1) : e;
  return !t || t.length > 253 || t.endsWith(".") || /\s|[:/@*?#\\]/.test(t) || Ha(t) || In(t) || t.split(".").some((r) => !$a(r)) ? "" : t;
}
function Ve(o) {
  return id(o?.HOST);
}
function Jr(o) {
  return ne(o?.LEGACY_HOST);
}
function cd(o) {
  const e = Ve(o), t = Jr(o), r = jo(t, e);
  return r?.prefix ? {
    name: String(r.prefix || "").trim().toLowerCase(),
    reservedBy: t,
    reason: "legacy_host",
    legacyHost: t,
    host: e
  } : null;
}
function Ca(o, e) {
  const t = ne(o), r = ne(e);
  return !t || !r ? !1 : t === r || t.endsWith(`.${r}`);
}
function $a(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return !e || e.length > 63 ? !1 : /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(e);
}
function Zt(o = "") {
  const e = String(o || "").trim().toLowerCase().replace(/\.+$/, "");
  return !e || e.length > 253 || /\s|[:/@*]/.test(e) || Ha(e) || In(e) || e.split(".").some((t) => !$a(t)) ? "" : e;
}
function Zi(o = "") {
  const e = String(o || "").trim();
  return !e || Zt(e) ? "" : "CNAME 指向必须是合法主机名，不能包含协议、端口、路径、通配符、空格或 IP 地址";
}
function ld(o = "", e = "defaultHostPrefixCnameTarget") {
  const t = Zi(o);
  if (t)
    throw Ie("HOST_PREFIX_CNAME_TARGET_INVALID", t, 400, {
      field: e,
      value: String(o || "").trim()
    });
}
function un(o = null, e = {}, t = "") {
  return Zt(o?.hostPrefixCnameTarget) || Zt(e?.defaultHostPrefixCnameTarget) || ne(t);
}
function jo(o = "", e = "") {
  const t = ne(o), r = ne(e);
  if (!t || !r || t === r) return null;
  const a = `.${r}`;
  if (!t.endsWith(a)) return null;
  const n = t.slice(0, -a.length);
  return !n || n.includes(".") || !$a(n) ? null : {
    hostname: t,
    host: r,
    prefix: n
  };
}
function ec(o) {
  const e = String(o || "").trim();
  if (!e) return null;
  const t = e.indexOf("/"), r = t === -1 ? e : e.slice(0, t), a = t === -1 ? "" : e.slice(t), n = Fo(r);
  return n ? {
    ...n,
    path: a,
    pattern: e
  } : null;
}
function qo(o, e = {}) {
  const t = String(e.path || "");
  let r = 0;
  return e.wildcard || (r += 100), o.includes(".workers.dev") && (r -= 20), t === "/" || t === "/*" ? r += 20 : t.endsWith("*") ? r += 10 : t && (r += 4), r += o.split(".").length * 4, r -= Math.min(t.length, 30), r;
}
var ud = "https://admin-local-index.invalid", dd = "local-", fd = "sys:admin_index_upload:v1:", md = "sys:admin_index_active:v2";
function kr(o = "") {
  const e = String(o || "").trim();
  if (!e) return "";
  try {
    const t = new URL(e);
    return ["http:", "https:"].includes(t.protocol) ? t.toString() : "";
  } catch {
    return "";
  }
}
function pd(o = "") {
  const e = String(o || "").trim();
  return !(!e || /[\x00-\x20~^:?*[\\\]]/.test(e) || e.includes("..") || e.includes("@{") || e.includes("//") || e.startsWith("/") || e.endsWith("/") || e.endsWith(".") || e.endsWith(".lock"));
}
function St(o = "") {
  const e = String(o || "").trim();
  return pd(e) ? e : "";
}
function Pt(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(e) ? e : "";
}
function Qr(o = "") {
  const e = Pt(o);
  return e ? `${ud}/${e}/index.html` : "";
}
function rt(o = "") {
  const e = kr(o);
  if (!e) return "";
  try {
    const t = new URL(e);
    return t.origin !== "https://admin-local-index.invalid" || t.search || t.hash ? "" : Pt(t.pathname.match(/^\/([a-f0-9]{64})\/index\.html$/i)?.[1] || "");
  } catch {
    return "";
  }
}
function Xo(o = "") {
  const e = Pt(o);
  return e ? `${dd}${e}` : "";
}
function gd(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e.startsWith("local-") ? Pt(e.slice(6)) : "";
}
function _t(o = null, e = {}) {
  const t = kr((H(e) ? e : {}).indexUrl), r = rt(t), a = !!r, n = a ? Qr(r) : "";
  return {
    effectiveRef: r,
    effectiveRefType: a ? "local_upload" : "",
    configIndexUrl: t,
    envIndexUrl: "",
    indexUrl: n,
    persistedIndexUrl: n,
    indexUrlSource: a ? "local_upload" : "unset",
    isLocalUpload: a,
    localUploadRevision: r,
    assetRevision: a ? Xo(r) : "",
    hasGithubRelease: !1,
    hasLocalUpload: a,
    hasDerivedIndexUrl: !1,
    gateState: n ? "shell_ready" : "setup_required"
  };
}
function hd(o = {}) {
  const e = String(H(o) && o.indexUrl || "").trim();
  if (!(!e || rt(e)))
    throw Ie("ADMIN_INDEX_SOURCE_UPLOAD_ONLY", "管理台 HTML 仅支持本地上传，请通过启动门或 Worker 和 HTML 更新面板提交 index.html", 400, { field: "indexUrl" });
}
function tc(o = {}, e = null) {
  const t = String(e?.HOST || "").trim(), r = Ve(e), a = String(o?.cfZoneId || "").trim(), n = String(o?.cfApiToken || "").trim(), s = [], i = [];
  return t ? r || i.push("HOST") : s.push("HOST"), a || s.push("cfZoneId"), n || s.push("cfApiToken"), {
    host: r,
    cfZoneId: a,
    cfApiToken: n,
    missingFields: s,
    invalidFields: i
  };
}
function rc(o = {}) {
  if (!(!Array.isArray(o?.invalidFields) || !o.invalidFields.includes("HOST")))
    throw Ie("HOST_PREFIX_HOST_INVALID", "HOST 必须是合法 DNS 主机名，不能包含协议、用户信息、端口、路径、通配符、下划线、空标签或 IP 地址", 400, {
      field: "HOST",
      reason: "invalid_hostname"
    });
}
function yd(o = {}, e = null) {
  if (o?.enableHostPrefixProxy !== !0) return;
  const t = tc(o, e);
  if (rc(t), !(t.missingFields.length <= 0))
    throw Ie("HOST_PREFIX_PROXY_CONFIG_REQUIRED", "启用域名前缀代理前，必须先配置 HOST、Cloudflare Zone ID 和 API 令牌", 400, {
      missingFields: t.missingFields,
      host: t.host
    });
}
function Sa(o = {}, e = null) {
  const t = tc(o, e);
  if (rc(t), t.missingFields.length <= 0) return t;
  throw Ie("HOST_PREFIX_DNS_CONFIG_REQUIRED", "保存域名前缀节点前，必须先配置 HOST、Cloudflare Zone ID 和 API 令牌", 400, {
    missingFields: t.missingFields,
    host: t.host
  });
}
function Wn(o = [], e = {}, t = null) {
  return (Array.isArray(o) ? o : [o]).some((r) => tt(r?.nextNode?.entryMode)) ? Sa(e, t) : null;
}
var Sd = Ge.PingTimeoutMs, _d = Ge.UpstreamTimeoutMs, co = Ge.UpstreamRetryAttempts, ac = Ge.HedgeProbePath, Ps = "/emby/system/info/public", bd = "/emby/system/ping", Ed = "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7", lo = "Hills/1.10.0 (android; 16)";
function Ad(o = "") {
  return String(o || "").trim() || lo;
}
function Yo(o = "") {
  return {
    Accept: "*/*",
    "Accept-Language": Ed,
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    "User-Agent": Ad(o)
  };
}
var Td = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36", Jo = Ge.HedgeProbeTimeoutMs, nc = Ge.HedgeProbeParallelism, oc = Ge.HedgeWaitTimeoutMs, sc = Ge.HedgeLockTtlMs, ga = Ge.HedgePreferredTtlSec, ic = Ge.HedgeFailureCooldownSec, cc = Ge.HedgeWakeJitterMs, lc = Ge.BufferedRetryBodyMaxBytes, Rd = Ge.MetadataPrewarmTimeoutMs, Cd = Ge.PrewarmCacheTtl, wd = Ut.PlaybackInfoCacheTtlSec, Qo = Ut.PlaybackInfoCacheEntryMaxBytes, Ld = Ut.PlaybackInfoCacheTotalMaxBytes, uc = Ut.VideoProgressForwardIntervalSec, Nd = Ut.VideoProgressSnapshotMaxBytes, dc = Ut.CacheTtlImagesDays, Id = Ut.PlaybackRouteHotCacheTtlMs, mr = Ut.PlaybackRouteHotCacheMax, fc = 12 * 1024 * 1024, Dd = fc - 64 * 1024, Md = 2e6, er = 19e5, xs = 50, mc = 512 * 1024, Pd = 4, Zo = 8 * 1024 * 1024, Gn = 256 * 1024, uo = 32, Os = 64, vs = 64 * 1024, Fs = 128, Us = 8 * 1024, wr = 4 * 1024, xd = Object.freeze([
  "displayName",
  "remark",
  "tag",
  "tagColor",
  "remarkColor",
  "secret",
  "hostPrefixCnameTarget",
  "hedgeProbePath"
]), ks = 500, ja = 1e4, Hr = 25e3, qa = 1e4, Od = 1e4, Vn = 1e4, vd = 600 * 1e3, Fd = 120 * 1e3, ct = 2, Xa = 2;
function jn(o = "") {
  const e = String(o || "").trim().toUpperCase();
  return e.includes("INT") ? "INTEGER" : e.includes("CHAR") || e.includes("CLOB") || e.includes("TEXT") ? "TEXT" : e.includes("REAL") || e.includes("FLOA") || e.includes("DOUB") ? "REAL" : !e || e.includes("BLOB") ? "BLOB" : "NUMERIC";
}
var Zr = /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i, Ud = /\.(?:js|css|woff2?|ttf|otf|map|webmanifest)$/i, Er = /\.(?:srt|ass|vtt|sub)$/i, ea = /(?:\/Images\/|\/Icons\/|\/Branding\/|\/emby\/covers\/)/i, Tt = /\.(?:m3u8|mpd)$/i, pc = /\.(?:ts|m4s)$/i, kd = /\.(?:mp4|m4v|m4a|ogv|webm|mkv|mov|avi|wmv|flv)$/i, fo = /* @__PURE__ */ new Set([
  "host",
  "x-real-ip",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "forwarded",
  "connection",
  "upgrade",
  "transfer-encoding",
  "te",
  "keep-alive",
  "proxy-authorization",
  "proxy-authenticate",
  "trailer",
  "expect"
]), Hd = /* @__PURE__ */ new Set([
  "cf-connecting-ip",
  "cf-connecting-ipv6",
  "cf-ipcountry",
  "cf-region",
  "cf-region-code",
  "cf-city",
  "cf-latitude",
  "cf-longitude",
  "cf-postal-code",
  "cf-subdivision",
  "cf-metro-code",
  "cf-timezone",
  "true-client-ip",
  "x-client-ip",
  "x-original-forwarded-for",
  "x-forwarded",
  "cdn-loop",
  "cf-visitor",
  "cf-ray",
  "cf-pseudo-ipv4"
]), $d = /* @__PURE__ */ new Set([
  "access-control-allow-origin",
  "access-control-allow-methods",
  "access-control-allow-headers",
  "access-control-allow-credentials",
  "x-frame-options",
  "strict-transport-security",
  "x-content-type-options",
  "x-xss-protection",
  "referrer-policy",
  "x-powered-by",
  "server"
]), es = "legacy_proxy_ctx", Bd = 86400, wa = [es, "emby_web_bypass"], Kd = /* @__PURE__ */ new Set([
  "users",
  "items",
  "videos",
  "audio",
  "livetv",
  "sessions",
  "system"
]);
function sa(o, e, t = null) {
  const r = e.headers.get("Origin"), a = e.headers.get("Access-Control-Request-Headers") || ya["Access-Control-Allow-Headers"];
  return {
    "Access-Control-Allow-Origin": t || r || ya["Access-Control-Allow-Origin"],
    "Access-Control-Allow-Methods": ya["Access-Control-Allow-Methods"],
    "Access-Control-Allow-Headers": a,
    "Access-Control-Expose-Headers": "Content-Length, Content-Range",
    "Access-Control-Max-Age": "86400"
  };
}
function nt(o = "") {
  if (!o) return "";
  try {
    return decodeURIComponent(o);
  } catch {
    return o;
  }
}
function Z(o) {
  let e = typeof o == "string" ? o : "/";
  return e ? (e.startsWith("/") || (e = "/" + e), e = e.replace(/^\/+/, "/"), e) : "/";
}
function La(o = "") {
  let e = Z(o);
  for (let a = 0; a < 4 && e.includes("%"); a += 1) {
    const n = e.replace(/%([0-9a-f]{2})/gi, (s, i) => {
      const c = Number.parseInt(i, 16);
      return c <= 127 ? String.fromCharCode(c) : s;
    });
    if (n === e) break;
    e = n;
  }
  const t = [];
  for (const a of e.replace(/\\/g, "/").toLowerCase().split("/"))
    !a || a === "." || (a === ".." ? t.pop() : t.push(a));
  const r = `/${t.join("/")}`;
  return r === "/web" || r.startsWith("/web/");
}
function ta(o = "") {
  const e = String(o || ""), t = new TextEncoder().encode(e);
  let r = "";
  for (const a of t) r += String.fromCharCode(a);
  return btoa(r).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function tr(o = "") {
  const e = String(o || "").trim().replace(/-/g, "+").replace(/_/g, "/");
  if (!e) return "";
  const t = e.length % 4, r = e + (t ? "=".repeat(4 - t) : ""), a = atob(r), n = Uint8Array.from(a, (s) => s.charCodeAt(0));
  return new TextDecoder().decode(n);
}
function gc(o) {
  const e = "/admin", t = String(o || "").trim();
  if (!t) return e;
  let r = Z(t);
  return r = r.replace(/\/{2,}/g, "/"), r.length > 1 && (r = r.replace(/\/+$/, "")), !r || r === "/" || r.toLowerCase().startsWith("/api") ? e : r;
}
function hc(o, e) {
  const t = Z(o || "/"), r = Z(e || "/");
  return t === r || t.startsWith(r + "/");
}
function Dr(o, e) {
  const t = Z(o || "/"), r = Z(e || "/");
  return !r || r === "/" ? t === r : t === r || t === `${r}/`;
}
function ft(o) {
  return gc(o?.ADMIN_PATH);
}
function Mn(o = "/admin") {
  const e = gc(o);
  return e === "/" ? "/login" : `${e}/login`;
}
function ts(o) {
  return Mn(ft(o));
}
function zd(o) {
  const e = ft(o), t = Z(e).toLowerCase(), r = [], a = t.split("/").filter(Boolean).map((n) => nt(n).toLowerCase());
  return a.length === 1 && a[0] && r.push({
    name: a[0],
    reservedBy: e,
    reason: "admin_path"
  }), t === "/admin" && r.push({
    name: "api",
    reservedBy: "/api/auth/login",
    reason: "legacy_admin_login"
  }), r;
}
function Wd(o, e) {
  const t = String(o || "").trim().toLowerCase();
  return t && zd(e).find((r) => r.name === t) || null;
}
function yc(o = {}) {
  return String(o?.name || "").trim() ? String(o?.target || "").trim() ? !0 : Array.isArray(o?.lines) && o.lines.length > 0 : !1;
}
function Hs(o, e) {
  const t = Array.isArray(o) ? o : [o];
  for (const r of t) {
    if (!yc(r) || tt(r?.entryMode)) continue;
    const a = Wd(r?.name, e);
    if (a)
      return {
        ...a,
        name: String(r?.name || "").trim().toLowerCase()
      };
  }
  return null;
}
function Gd(o = {}, e = null) {
  if (!tt(o?.entryMode)) return null;
  const t = String(o?.name || "").trim().toLowerCase();
  if (!t) return {
    code: "HOST_PREFIX_REQUIRED",
    message: "域名前缀不能为空",
    name: t
  };
  if (!$a(t)) return {
    code: "HOST_PREFIX_INVALID",
    message: "域名前缀仅支持小写字母、数字、连字符，且不能以下划线、点或连字符结尾",
    name: t
  };
  const r = cd(e);
  if (r && r.name === t) return {
    code: "HOST_PREFIX_RESERVED_BY_LEGACY_HOST",
    message: "该域名前缀已被旧部署子域兼容入口保留，请更换后重试",
    name: t,
    reservedBy: r.reservedBy,
    reason: r.reason,
    legacyHost: r.legacyHost,
    host: r.host
  };
  const a = Zi(o?.hostPrefixCnameTarget);
  return a ? {
    code: "HOST_PREFIX_CNAME_TARGET_INVALID",
    message: a,
    field: "hostPrefixCnameTarget",
    value: String(o?.hostPrefixCnameTarget || "").trim(),
    name: t
  } : null;
}
function $s(o, e = null) {
  const t = Array.isArray(o) ? o : [o];
  for (const r of t) {
    if (!yc(r)) continue;
    const a = Gd(r, e);
    if (a) return a;
  }
  return null;
}
function Vd(o) {
  const e = ft(o);
  return e === "/" ? "/" : e;
}
function Ce(o) {
  return String(o ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function ra(o) {
  return JSON.stringify(o).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
function ze(o, e = null) {
  const t = [];
  o?.JWT_SECRET || t.push("JWT_SECRET"), o?.ADMIN_PASS || t.push("ADMIN_PASS");
  const r = typeof e?.adminPath == "string" ? e.adminPath : ft(o), a = typeof e?.loginPath == "string" ? e.loginPath : Mn(r);
  return {
    ok: t.length === 0,
    missing: t,
    adminPath: r,
    loginPath: a,
    message: t.length ? `系统未初始化：缺少 ${t.join("、")}。` : "系统初始化检查通过。"
  };
}
function Sc(o, e = null) {
  const t = ze(o, e);
  if (t.ok) return t;
  const r = t.missing.join("|") || "unknown";
  return je.InitCheckWarnedFingerprints.has(r) || (je.InitCheckWarnedFingerprints.size >= 32 && je.InitCheckWarnedFingerprints.clear(), je.InitCheckWarnedFingerprints.add(r), console.warn(`[Init Check] ${t.message} 管理入口: ${t.adminPath}`)), t;
}
function mo(o) {
  if (!o || o.ok) return "";
  const e = Array.isArray(o.missing) && o.missing.length ? o.missing.map((t) => `<code class="rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">${Ce(t)}</code>`).join(" ") : '<code class="rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">UNKNOWN</code>';
  return `<div id="init-health-banner" class="mx-4 mt-4 rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-900 shadow-sm"><div class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between"><div class="font-semibold">系统未初始化</div><div class="text-xs text-amber-700">管理入口：${Ce(o.adminPath || "/admin")}</div></div><p class="mt-2 leading-6">检测到关键环境变量缺失：${e}</p><p class="mt-1 text-xs leading-5 text-amber-700">请先在 Cloudflare Worker 环境变量中补齐后再使用管理台登录与敏感操作。</p></div>`;
}
function ha(o) {
  return String(o?.cf?.colo || "").trim().toUpperCase() || "UNKNOWN";
}
function dn(o) {
  return Wi(String(o?.headers?.get?.("CF-RAY") || o?.headers?.get?.("cf-ray") || "").trim());
}
function jd(o) {
  return String(o?.cf?.country || "").trim().toUpperCase() || "UNKNOWN";
}
function qd(o) {
  const e = jd(o);
  return {
    countryCode: e,
    countryName: qu(e)
  };
}
function Xd(o = {}, e = {}) {
  const { statusPort: t } = o, r = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><link rel="icon" href="/favicon.ico" sizes="any"><title>Emby Proxy Admin Shell</title><script id="admin-bootstrap" type="application/json">__ADMIN_BOOTSTRAP_JSON__<\/script><style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at top,#0f172a 0,#020617 44%,#020617 100%);color:#e2e8f0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:inherit;text-decoration:none}.admin-fallback-shell{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 18px}.admin-fallback-card{width:min(100%,980px);border:1px solid rgba(51,65,85,.92);border-radius:30px;background:rgba(15,23,42,.94);box-shadow:0 32px 96px rgba(2,6,23,.52);padding:28px;backdrop-filter:blur(20px)}.admin-fallback-pill{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:8px 14px;background:rgba(59,130,246,.12);border:1px solid rgba(96,165,250,.32);color:#bfdbfe;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}.admin-fallback-title{margin:20px 0 0;font-size:clamp(1.9rem,4vw,3rem);line-height:1.08;color:#fff}.admin-fallback-copy{margin:14px 0 0;max-width:54rem;color:#cbd5e1;font-size:15px;line-height:1.8}.admin-fallback-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:24px}.admin-fallback-stat{border:1px solid rgba(51,65,85,.9);border-radius:22px;background:rgba(2,6,23,.48);padding:16px}.admin-fallback-k{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b}.admin-fallback-v{margin-top:10px;font-size:15px;line-height:1.7;color:#f8fafc;word-break:break-word}.admin-fallback-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}.admin-fallback-btn{display:inline-flex;align-items:center;justify-content:center;border-radius:16px;padding:12px 18px;font-size:14px;font-weight:700;transition:transform .18s ease,background-color .18s ease,border-color .18s ease}.admin-fallback-btn:hover{transform:translateY(-1px)}.admin-fallback-btn-primary{background:#2563eb;color:#fff;border:1px solid rgba(147,197,253,.7);box-shadow:0 12px 28px rgba(37,99,235,.24)}.admin-fallback-btn-primary:hover{background:#1d4ed8;border-color:#93c5fd}.admin-fallback-btn-secondary{background:rgba(15,23,42,.5);color:#e2e8f0;border:1px solid rgba(51,65,85,.95)}.admin-fallback-btn-secondary:hover{background:rgba(30,41,59,.85)}.admin-fallback-panel{margin-top:24px;border:1px solid rgba(51,65,85,.9);border-radius:24px;background:rgba(2,6,23,.4);padding:20px}.admin-fallback-panel h2{margin:0;font-size:15px;color:#fff}.admin-fallback-panel p{margin:10px 0 0;font-size:14px;line-height:1.7;color:#cbd5e1}.admin-fallback-panel details{margin-top:16px}.admin-fallback-panel summary{cursor:pointer;color:#93c5fd;font-weight:700}.admin-fallback-panel pre{overflow:auto;margin:12px 0 0;padding:14px;border-radius:18px;background:#020617;color:#cbd5e1;font-size:12px;line-height:1.6}.admin-fallback-note{margin-top:16px;color:#94a3b8;font-size:13px;line-height:1.7}@media (max-width:640px){.admin-fallback-shell{padding:18px 12px}.admin-fallback-card,.admin-fallback-stat,.admin-fallback-panel{border-radius:22px}.admin-fallback-card{padding:22px}.admin-fallback-actions{flex-direction:column}.admin-fallback-btn{width:100%}}</style></head><body><main class="admin-fallback-shell"><section class="admin-fallback-card"><div class="admin-fallback-pill">Admin Shell</div><h1 class="admin-fallback-title">管理台壳层正在处理中</h1><p class="admin-fallback-copy">Worker 继续负责管理台壳、登录与统一后台 API；页面主体会根据当前状态注入设置页、远端壳或错误态内容。</p>__INIT_HEALTH_BANNER____ADMIN_APP_ROOT__</section></main></body></html>';
  let a = -1;
  const n = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="media-favicon-bg" x1="18%" y1="12%" x2="84%" y2="88%">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#4f46e5"/>
        </linearGradient>
        <radialGradient id="media-favicon-highlight" cx="28%" cy="20%" r="72%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.34"/>
          <stop offset="55%" stop-color="#ffffff" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="15" fill="url(#media-favicon-bg)"/>
      <rect x="4" y="4" width="56" height="56" rx="15" fill="url(#media-favicon-highlight)"/>
      <rect x="4.75" y="4.75" width="54.5" height="54.5" rx="14.25" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1.5"/>
      <path d="M24 18h8v28h-8zM24 18h18v6H24zM24 29h14v6H24zM24 40h18v6H24z" fill="#ffffff"/>
    </svg>`, s = '<style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at top,#0f172a 0,#020617 48%,#020617 100%);color:#e2e8f0;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:inherit;text-decoration:none}.landing-shell{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:48px 24px}.landing-card{width:min(100%,1100px);border:1px solid rgba(51,65,85,.9);border-radius:32px;background:rgba(15,23,42,.94);box-shadow:0 28px 90px rgba(2,6,23,.48);overflow:hidden}.landing-grid{display:grid;gap:0}.landing-primary,.landing-side{padding:32px}.landing-primary{text-align:left}.landing-side{border-top:1px solid rgba(51,65,85,.9);background:rgba(2,6,23,.55)}.landing-pill{display:inline-flex;align-items:center;border:1px solid rgba(59,130,246,.3);border-radius:999px;background:rgba(59,130,246,.1);padding:6px 12px;color:#93c5fd;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}.landing-title{margin:20px 0 0;font-size:clamp(2rem,4vw,3.25rem);line-height:1.1;color:#fff}.landing-text{margin:16px 0 0;font-size:15px;line-height:1.8;color:#cbd5e1}.landing-text-muted{color:#94a3b8}.landing-highlight{font-weight:700;color:#fff}.landing-actions{display:flex;flex-direction:column;gap:12px;margin-top:32px}.landing-btn{display:inline-flex;align-items:center;justify-content:center;border-radius:18px;padding:14px 20px;font-size:14px;font-weight:700;transition:background-color .18s ease,border-color .18s ease,transform .18s ease}.landing-btn:hover{transform:translateY(-1px)}.landing-btn-primary{border:1px solid rgba(147,197,253,.7);background:#2563eb;color:#fff;box-shadow:0 12px 28px rgba(37,99,235,.25)}.landing-btn-primary:hover{border-color:#93c5fd;background:#1d4ed8}.landing-btn-secondary{border:1px solid rgba(51,65,85,.95);background:rgba(15,23,42,.45);color:#e2e8f0}.landing-btn-secondary:hover{background:rgba(30,41,59,.8)}.landing-notes{border:1px solid rgba(51,65,85,.9);border-radius:24px;background:rgba(15,23,42,.72);padding:24px}.landing-notes-title{font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#64748b}.landing-note-list{margin:16px 0 0;padding-left:18px;color:#cbd5e1;font-size:14px;line-height:1.75}.landing-note-list li+li{margin-top:12px}.landing-banner{margin-bottom:16px;border:1px solid rgba(252,211,77,.32);border-radius:18px;background:rgba(245,158,11,.12);padding:14px 16px;color:#fef3c7}.landing-banner-title{font-size:14px;font-weight:700;color:#fef3c7}.landing-banner-text{margin-top:6px;font-size:12px;line-height:1.6;color:rgba(254,243,199,.92)}@media (min-width:900px){.landing-grid{grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr)}.landing-primary,.landing-side{padding:40px}.landing-side{border-top:0;border-left:1px solid rgba(51,65,85,.9)}}@media (min-width:640px){.landing-actions{flex-direction:row}}@media (max-width:639px){.landing-shell{padding:24px 16px}.landing-card,.landing-notes{border-radius:24px}.landing-primary,.landing-side{padding:24px}.landing-btn{width:100%}}</style>';
  function i(K = "GET") {
    const G = new Headers({
      "Content-Type": "image/svg+xml;charset=UTF-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable"
    });
    return Ne(G), new Response(K === "HEAD" ? null : n, { headers: G });
  }
  const c = Object.freeze([
    "__ADMIN_BOOTSTRAP_JSON__",
    "__INIT_HEALTH_BANNER__",
    "__ADMIN_APP_ROOT__"
  ]), l = "embedded-fallback-v1", u = m(r), d = "minimal-split-parts", f = !0;
  function m(K = "") {
    const G = String(K || ""), Y = [];
    let W = 0;
    for (const te of c) {
      const le = G.indexOf(te, W);
      if (le < 0) throw new Error(`missing admin html placeholder: ${te}`);
      Y.push(G.slice(W, le)), W = le + te.length;
    }
    return Y.push(G.slice(W)), Y;
  }
  function p(K = [], G = {}) {
    let Y = String(K[0] || "");
    for (let W = 0; W < c.length; W += 1) {
      const te = c[W];
      Y += String(G[te] || ""), Y += String(K[W + 1] || "");
    }
    return Y;
  }
  const h = "__ADMIN_BOOTSTRAP_JSON__", g = "__INIT_HEALTH_BANNER__", y = "__ADMIN_APP_ROOT__", _ = "", S = "https://admin-shell-cache.invalid", E = "private, no-store, max-age=0", b = "public, max-age=31536000, immutable", T = 300 * 1e3, C = 2 * 1024 * 1024, L = "bootstrap-tailwind-assets-v3-active-index", P = "X-Admin-Shell-Cached-At", A = "X-Admin-Shell-Source-Etag", w = "X-Admin-Shell-Source-Last-Modified", R = "X-Admin-Shell-Source-Hash", I = "__release", x = "vendor", N = "__warm", F = "https://admin-release-vendor-cache.invalid", D = "https://admin-release-vendor-manifest.invalid", U = "public, max-age=31536000, immutable", V = "no-store, max-age=0", X = 8 * 1024 * 1024, v = 3, O = "X-Admin-Release-Vendor-Cached-At", M = "X-Admin-Release-Vendor-Source-Hash", k = Object.freeze([
    "dashboard",
    "nodes",
    "logs",
    "dns",
    "settings"
  ]), j = Object.freeze([
    "系统 UI",
    "代理与网络",
    "静态资源策略",
    "安全防护",
    "日志设置",
    "监控告警",
    "账号设置",
    "备份与恢复"
  ]), q = Object.freeze([
    "ui",
    "proxy",
    "security",
    "logs",
    "account"
  ]);
  function J() {
    return {
      truthSources: {
        primaryUi: "frontend/",
        templateHtml: "frontend/index.html",
        contractDoc: "worker.md"
      },
      bootstrapActions: {
        default: "getAdminBootstrap",
        settings: "getSettingsBootstrap"
      },
      primaryViews: [...k],
      settings: {
        visualSections: [...j],
        saveGroups: [...q]
      }
    };
  }
  function Q(K, G = ze(K), Y = {}) {
    return {
      adminPath: ft(K),
      loginPath: ts(K),
      initHealth: G,
      adminUiSkin: $c(Y?.adminUiSkin),
      hostDomain: Ve(K),
      contract: J(),
      shell: Ue(K, G, Y)
    };
  }
  function se() {
    if (a >= 0) return a;
    if (!Array.isArray(u) || u.length !== c.length + 1)
      return a = 0, 0;
    const K = new TextEncoder();
    let G = 0;
    for (let Y = 0; Y < u.length; Y += 1)
      G += K.encode(String(u[Y] || "")).length, Y < c.length && (G += K.encode(c[Y]).length);
    return a = G, a;
  }
  function pe(K = !1, G = "") {
    const Y = String(G || "").trim().toLowerCase();
    return K ? "remote_ready" : Y === "setup_required" ? "setup_required" : "embedded_only";
  }
  function _e(K = !1, G = f) {
    return K ? G ? "embedded_fallback_retained" : "legacy_inline_shell_active" : "embedded_fallback_missing";
  }
  function ye(K = "embedded", G = "") {
    return String(K || "").trim().toLowerCase() === "gate" || String(G || "").trim() === "setup_gate" ? "setup_gate" : String(K || "").trim().toLowerCase() === "remote" ? "remote_shell" : String(G || "").trim() === "embedded_fallback" ? "embedded_fallback" : "embedded_shell";
  }
  function Te(K = !1, G = "") {
    return K ? String(G || "").trim() === "embedded_fallback" ? "active" : "retained" : "missing";
  }
  function Ue(K, G = ze(K), Y = {}) {
    const W = _t(K, Y), te = W.indexUrl, le = se(), he = !!te, et = !!(K?.ASSETS && typeof K.ASSETS.fetch == "function"), ht = !he && et ? "shell_ready" : W.gateState, qe = le > 0;
    let Nt = "";
    if (te) try {
      Nt = new URL(te).origin;
    } catch {
      Nt = "";
    }
    return {
      mode: he ? "remote-preferred" : et ? "embedded" : "setup_required",
      lifecycleState: pe(he, ht),
      embeddedFallbackState: qe ? "retained" : "missing",
      retirementState: _e(qe),
      gateState: ht,
      indexUrl: W.indexUrl,
      indexUrlSource: W.indexUrlSource,
      effectiveRef: W.effectiveRef,
      remoteShellConfigured: he,
      remoteShellIndexUrl: te,
      remoteShellOrigin: Nt,
      bundledShellAvailable: et,
      bundledShellSource: et ? "frontend/dist/index.html" : "",
      initHealthOk: G?.ok === !0,
      embeddedFallbackAvailable: qe,
      embeddedTemplateSource: d,
      embeddedTemplateMode: d,
      embeddedTemplateBytes: le,
      finalUiHtmlRetired: f
    };
  }
  function kt(K, G = {}) {
    return _t(K, G).indexUrl;
  }
  function De(K = {}) {
    const G = H(K.shellState) ? K.shellState : {}, Y = H(K.initHealth) ? K.initHealth : {}, W = H(K.indexState) ? K.indexState : {}, te = String(K.remoteShellIndexUrl || G.remoteShellIndexUrl || W.indexUrl || "").trim(), le = String(K.mode || "").trim().toLowerCase(), he = le === "remote" ? "remote" : le === "gate" ? "gate" : "embedded", et = G.remoteShellConfigured === !0 || !!te, ht = G.embeddedFallbackAvailable === !0, qe = G.finalUiHtmlRetired !== !1, Nt = String(K.routeState || "").trim() || (he === "remote" ? "remote_active" : he === "gate" ? "setup_gate" : "embedded_active"), ua = String(K.lifecycleState || G.lifecycleState || "").trim() || pe(et, K.gateState || G.gateState || W.gateState || ""), zt = String(K.embeddedFallbackState || G.embeddedFallbackState || "").trim() || Te(ht, Nt), Vl = String(K.retirementState || G.retirementState || "").trim() || _e(ht, qe), jl = String(K.gateState || G.gateState || W.gateState || (te ? "shell_ready" : "setup_required")).trim() || "setup_required";
    return {
      ...G,
      mode: he,
      effectiveMode: ye(he, Nt),
      gateState: jl,
      lifecycleState: ua,
      embeddedFallbackState: zt,
      retirementState: Vl,
      sourceType: String(K.sourceType || "").trim().toLowerCase() || (he === "remote" ? "remote_fetch" : he === "gate" ? "setup_gate" : "embedded_local"),
      routeState: Nt,
      indexUrl: String(K.indexUrl || G.indexUrl || W.indexUrl || te).trim(),
      indexUrlSource: String(K.indexUrlSource || G.indexUrlSource || W.indexUrlSource || "").trim(),
      effectiveRef: String(K.effectiveRef || G.effectiveRef || W.effectiveRef || "").trim(),
      effectiveRefType: String(K.effectiveRefType || G.effectiveRefType || W.effectiveRefType || "").trim(),
      remoteShellIndexUrl: te,
      remoteShellOrigin: String(G.remoteShellOrigin || "").trim(),
      remoteCacheState: String(K.remoteCacheState || "").trim().toLowerCase(),
      revalidateDue: K.revalidateDue === !0,
      lastFetchStatus: String(K.lastFetchStatus || "").trim().toLowerCase(),
      reason: String(K.reason || "").trim(),
      requestPath: String(K.requestPath || "").trim(),
      initHealthOk: Y.ok === !0,
      initHealthMissing: [...new Set((Array.isArray(Y.missing) ? Y.missing : []).map((ql) => String(ql || "").trim()).filter(Boolean))],
      fallbackRetained: ht,
      templateMode: String(G.embeddedTemplateMode || G.embeddedTemplateSource || "").trim() || d,
      finalUiHtmlRetired: qe,
      updatedAt: String(K.updatedAt || "").trim() || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async function ca(K, G = {}, Y = null) {
    const W = H(G.shellState) ? G.shellState : Ue(K, G.initHealth, G.config || {}), te = De({
      ...G,
      shellState: W
    }), le = t.resolveOpsStatusStores(K).db, { updatedAt: he, ...et } = te, ht = ie(re(et)), qe = le ? ee.AdminShellStatusWriteState.get(le) : null, Nt = Math.max(1e3, Number($.Defaults.AdminShellStatusStableWriteIntervalMs) || 1e3);
    if (G.throttleStableWrites === !0 && qe?.fingerprint === ht) {
      if (qe.writePromise) return qe.writePromise;
      if (B() - (Number(qe.writtenAt) || 0) < Nt) return null;
    }
    const ua = ge(Promise.resolve(t.patchOpsStatus(K, { adminShell: te }, Y)).then((zt) => ({
      ok: !0,
      result: zt
    })), "admin.shell_status_patch", {
      requestPath: te.requestPath,
      mode: te.mode,
      sourceType: te.sourceType
    }, {
      ok: !1,
      result: null
    }).then((zt) => (!le || ee.AdminShellStatusWriteState.get(le)?.writePromise !== ua || (zt?.ok === !0 ? ee.AdminShellStatusWriteState.set(le, {
      fingerprint: ht,
      writtenAt: B(),
      writePromise: null
    }) : qe ? ee.AdminShellStatusWriteState.set(le, qe) : ee.AdminShellStatusWriteState.delete(le)), zt?.result ?? null));
    return le && ee.AdminShellStatusWriteState.set(le, {
      fingerprint: ht,
      writtenAt: 0,
      writePromise: ua
    }), ua;
  }
  function st(K = {}, G, Y = {}, W = ze(G)) {
    const te = H(K) ? K : {}, le = _t(G, Y), he = Ue(G, W, Y);
    return {
      ...te,
      adminShell: De({
        ...H(te.adminShell) ? te.adminShell : {},
        shellState: he,
        initHealth: W,
        indexState: le,
        remoteShellIndexUrl: le.indexUrl,
        gateState: le.gateState,
        indexUrl: le.indexUrl,
        indexUrlSource: le.indexUrlSource,
        effectiveRef: le.effectiveRef,
        effectiveRefType: le.effectiveRefType,
        mode: H(te.adminShell) && String(te.adminShell.mode || "").trim() ? te.adminShell.mode : le.indexUrl ? "remote" : "gate",
        routeState: H(te.adminShell) && String(te.adminShell.routeState || "").trim() ? te.adminShell.routeState : le.indexUrl ? "remote_ready_idle" : "setup_gate",
        sourceType: H(te.adminShell) && String(te.adminShell.sourceType || "").trim() ? te.adminShell.sourceType : le.indexUrl ? "runtime_status" : "setup_gate"
      })
    };
  }
  function it(K = "") {
    const G = String(K || "").trim();
    if (!G) return "已上传的管理台 HTML 暂时不可用，请重新上传。";
    if (G.startsWith("remote_shell_render_failed")) {
      const Y = G.replace(/^remote_shell_render_failed:\s*/i, "").trim();
      return Y ? `Worker 读取 index.html 失败：${Y}` : "Worker 读取 index.html 失败。";
    }
    return G;
  }
  function Tr(K = {}, G = {}, Y = {}, W = {}) {
    const te = String(K.adminPath || "/admin").trim() || "/admin", le = String(W.remoteShellIndexUrl || G.remoteShellIndexUrl || "").trim(), he = it(W.reason || ""), et = `${te}?setup=1`;
    return `<style>
        .admin-remote-error-shell{max-width:920px;margin:0 auto;padding:44px 20px 56px;color:#0f172a}
        .admin-remote-error-card{background:rgba(255,255,255,.96);border:1px solid rgba(248,113,113,.22);border-radius:28px;box-shadow:0 24px 80px rgba(15,23,42,.12);overflow:hidden}
        .dark .admin-remote-error-card{background:rgba(15,23,42,.94);border-color:rgba(248,113,113,.32);color:#e2e8f0}
        .admin-remote-error-head{padding:30px 30px 22px;border-bottom:1px solid rgba(248,113,113,.14)}
        .admin-remote-error-kicker{display:inline-flex;align-items:center;padding:7px 12px;border-radius:999px;background:rgba(239,68,68,.1);color:#b91c1c;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
        .dark .admin-remote-error-kicker{background:rgba(248,113,113,.16);color:#fecaca}
        .admin-remote-error-title{margin:16px 0 10px;font-size:clamp(28px,4.8vw,40px);line-height:1.05}
        .admin-remote-error-desc{margin:0;color:#475569;line-height:1.8}
        .dark .admin-remote-error-desc{color:#cbd5e1}
        .admin-remote-error-body{padding:26px 30px 30px}
        .admin-remote-error-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:22px}
        .admin-remote-error-stat{padding:15px 16px;border-radius:18px;background:#f8fafc;border:1px solid rgba(148,163,184,.16)}
        .dark .admin-remote-error-stat{background:#111827;border-color:rgba(71,85,105,.5)}
        .admin-remote-error-k{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#64748b}
        .admin-remote-error-v{margin-top:8px;font-size:14px;line-height:1.7;color:#0f172a;word-break:break-word}
        .dark .admin-remote-error-v{color:#f8fafc}
        .admin-remote-error-actions{display:flex;flex-wrap:wrap;gap:12px;margin:22px 0 20px}
        .admin-remote-error-btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:14px;font-weight:700;text-decoration:none}
        .admin-remote-error-btn-primary{background:#0f172a;color:#fff}
        .dark .admin-remote-error-btn-primary{background:#e2e8f0;color:#0f172a}
        .admin-remote-error-btn-secondary{background:#fff;border:1px solid rgba(148,163,184,.22);color:#334155}
        .dark .admin-remote-error-btn-secondary{background:#0f172a;border-color:rgba(71,85,105,.6);color:#e2e8f0}
        .admin-remote-error-note{margin:0;color:#64748b;line-height:1.8}
        .dark .admin-remote-error-note{color:#94a3b8}
        .admin-remote-error-debug{margin-top:18px}
        .admin-remote-error-debug pre{margin:12px 0 0;padding:16px;border-radius:18px;background:#0f172a;color:#e2e8f0;overflow:auto;font-size:12px;line-height:1.6}
        @media (max-width: 820px){
          .admin-remote-error-grid{grid-template-columns:1fr}
          .admin-remote-error-head,.admin-remote-error-body{padding:22px}
        }
      </style>
      <div class="admin-remote-error-shell">
        <section class="admin-remote-error-card">
          <div class="admin-remote-error-head">
            <div class="admin-remote-error-kicker">HTML Error</div>
            <h1 class="admin-remote-error-title">管理台 HTML 暂时不可用</h1>
            <p class="admin-remote-error-desc">${Ce(he)}</p>
          </div>
          <div class="admin-remote-error-body">
            <div class="admin-remote-error-grid">
              <article class="admin-remote-error-stat"><div class="admin-remote-error-k">错误原因</div><div class="admin-remote-error-v">${Ce(he)}</div></article>
              <article class="admin-remote-error-stat"><div class="admin-remote-error-k">本地版本标识</div><div class="admin-remote-error-v">${Ce(le || "未找到本地 HTML 版本")}</div></article>
            </div>
            <div class="admin-remote-error-actions">
              <a href="${Ce(te)}" class="admin-remote-error-btn admin-remote-error-btn-primary">刷新 /admin</a>
              <a href="${Ce(et)}" class="admin-remote-error-btn admin-remote-error-btn-secondary">重新上传 index.html</a>
            </div>
            <p class="admin-remote-error-note">如果这里继续报错，请重新上传与当前 Worker 匹配的 index.html。</p>
          </div>
        </section>
      </div>`;
  }
  function la(K = {}, G = {}, Y = {}, W = {}, te = {}) {
    const le = String(K.adminPath || "/admin").trim() || "/admin", he = te?.isLocalUpload === !0, et = ra({ adminPath: le });
    return `<style>
        .admin-gate-shell{max-width:720px;margin:0 auto;padding:48px 20px 64px;color:#0f172a}
        .admin-gate-card{background:#fff;border:1px solid #dbe3ee;border-radius:8px;box-shadow:0 18px 50px rgba(15,23,42,.1);overflow:hidden}
        .dark .admin-gate-card{background:#0f172a;border-color:#334155;color:#e2e8f0}
        .admin-gate-head{padding:24px 24px 18px;border-bottom:1px solid #e2e8f0}
        .dark .admin-gate-head{border-color:#334155}
        .admin-gate-kicker{margin:0 0 8px;color:#0369a1;font-size:12px;font-weight:700;text-transform:uppercase}
        .dark .admin-gate-kicker{color:#7dd3fc}
        .admin-gate-title{margin:0;font-size:24px;line-height:1.3}
        .admin-gate-body{padding:24px;display:grid;gap:18px}
        .admin-gate-field{display:grid;gap:8px;min-width:0}
        .admin-gate-label{font-size:13px;font-weight:700;color:#475569}
        .dark .admin-gate-label{color:#cbd5e1}
        .admin-gate-input{width:100%;min-width:0;padding:12px;border-radius:6px;border:1px solid #cbd5e1;background:#fff;color:#0f172a;font-size:14px;outline:none}
        .dark .admin-gate-input{background:#020617;color:#e2e8f0;border-color:#475569}
        .admin-gate-input:focus{border-color:#0284c7;box-shadow:0 0 0 3px rgba(2,132,199,.14)}
        .admin-gate-hint{font-size:12px;line-height:1.6;color:#64748b;overflow-wrap:anywhere}
        .dark .admin-gate-hint{color:#94a3b8}
        .admin-gate-status{min-height:44px;padding:11px 12px;border-radius:6px;background:#f8fafc;border:1px solid #e2e8f0;color:#475569;line-height:1.6;overflow-wrap:anywhere}
        .dark .admin-gate-status{background:#111827;border-color:#334155;color:#cbd5e1}
        .admin-gate-status.is-error{background:#fff1f2;border-color:#fecdd3;color:#be123c}
        .dark .admin-gate-status.is-error{background:#4c0519;border-color:#881337;color:#fecdd3}
        .admin-gate-status.is-success{background:#ecfdf5;border-color:#a7f3d0;color:#166534}
        .dark .admin-gate-status.is-success{background:#052e16;border-color:#166534;color:#bbf7d0}
        .admin-gate-actions{display:flex;justify-content:flex-end}
        .admin-gate-btn{min-height:42px;padding:10px 16px;border:0;border-radius:6px;background:#0369a1;color:#fff;font-size:14px;font-weight:700;cursor:pointer}
        .admin-gate-btn:hover{background:#075985}
        .admin-gate-btn:disabled{cursor:wait;opacity:.65}
        @media (max-width:640px){.admin-gate-shell{padding:24px 12px 40px}.admin-gate-head,.admin-gate-body{padding:18px}.admin-gate-actions,.admin-gate-btn{width:100%}}
      </style>
      <div class="admin-gate-shell">
        <section class="admin-gate-card">
          <header class="admin-gate-head">
            <p class="admin-gate-kicker">Index Source</p>
            <h1 class="admin-gate-title">上传 index.html</h1>
          </header>
          <form id="admin-index-gate-form" class="admin-gate-body" novalidate>
            <label class="admin-gate-field">
              <span class="admin-gate-label">index.html</span>
              <input id="admin-gate-local-file" class="admin-gate-input" type="file" accept=".html,text/html" required />
              <span id="admin-gate-local-hint" class="admin-gate-hint">文件上限 2 MiB</span>
            </label>
            <div id="admin-gate-status" class="admin-gate-status${he ? " is-success" : ""}" role="status" aria-live="polite">${he ? "当前已有 HTML 版本，可上传新文件替换。" : "请选择 index.html。"}</div>
            <div class="admin-gate-actions">
              <button id="admin-gate-submit" type="submit" class="admin-gate-btn">上传并进入管理台</button>
            </div>
          </form>
        </section>
      </div>
      <script>
        const ADMIN_INDEX_GATE_RUNTIME = ${et};
        const gateForm = document.getElementById("admin-index-gate-form");
        const localFileInput = document.getElementById("admin-gate-local-file");
        const localFileHint = document.getElementById("admin-gate-local-hint");
        const submitButton = document.getElementById("admin-gate-submit");
        const gateStatus = document.getElementById("admin-gate-status");
        function setGateStatus(message, tone) {
          if (!gateStatus) return;
          gateStatus.textContent = message || "";
          gateStatus.classList.remove("is-error", "is-success");
          if (tone === "error") gateStatus.classList.add("is-error");
          if (tone === "success") gateStatus.classList.add("is-success");
        }
        function formatFileSize(bytes) {
          const value = Number(bytes) || 0;
          return value >= 1024 * 1024
            ? (value / (1024 * 1024)).toFixed(2) + " MiB"
            : Math.max(0, Math.round(value / 1024)) + " KiB";
        }
        function validateFile(file) {
          if (!file) return "请选择 index.html。";
          if (String(file.name || "").trim().toLowerCase() !== "index.html") return "文件名必须是 index.html。";
          if (file.size > 2 * 1024 * 1024) return "文件超过 2 MiB 上限。";
          return "";
        }
        localFileInput?.addEventListener("change", () => {
          const file = localFileInput.files?.[0];
          const error = validateFile(file);
          if (localFileHint) localFileHint.textContent = file ? file.name + " · " + formatFileSize(file.size) : "文件上限 2 MiB";
          setGateStatus(error || ("已选择 " + file.name + "。"), error ? "error" : "success");
        });
        gateForm?.addEventListener("submit", async (event) => {
          event.preventDefault();
          const file = localFileInput?.files?.[0];
          const validationError = validateFile(file);
          if (validationError) {
            setGateStatus(validationError, "error");
            localFileInput?.focus();
            return;
          }
          if (submitButton) submitButton.disabled = true;
          if (localFileInput) localFileInput.disabled = true;
          setGateStatus("正在上传并校验 index.html...", "");
          let redirecting = false;
          try {
            const response = await fetch(ADMIN_INDEX_GATE_RUNTIME.adminPath || "/admin", {
              method: "POST",
              credentials: "same-origin",
              headers: { "Content-Type": "application/json", "Accept": "application/json" },
              body: JSON.stringify({
                action: "uploadAdminIndex",
                fileName: file.name,
                indexHtml: await file.text()
              })
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
              const message = payload?.message || payload?.error?.message || payload?.error || ("上传失败（HTTP " + response.status + "）");
              throw new Error(String(message || "上传失败"));
            }
            redirecting = true;
            setGateStatus("index.html 已更新，正在进入管理台...", "success");
            window.location.assign(ADMIN_INDEX_GATE_RUNTIME.adminPath || "/admin");
          } catch (error) {
            setGateStatus(error?.message ? "上传失败：" + error.message : "上传失败，请稍后重试。", "error");
          } finally {
            if (!redirecting) {
              if (submitButton) submitButton.disabled = false;
              if (localFileInput) localFileInput.disabled = false;
            }
          }
        });
      <\/script>`;
  }
  function $e(K = "{}", G = "", Y = _) {
    return !Array.isArray(u) || u.length !== c.length + 1 ? "" : p(u, {
      [h]: String(K || "{}"),
      [g]: String(G || ""),
      [y]: String(Y || _)
    });
  }
  function ar(K = {}, G = null, Y = _) {
    const W = H(K) ? K : {}, te = H(G) ? G : H(W.initHealth) ? W.initHealth : {}, le = {
      templateRevision: String(l).trim() || "admin-shell",
      adminPath: String(W.adminPath || "").trim(),
      loginPath: String(W.loginPath || "").trim(),
      hostDomain: ne(W.hostDomain),
      contractHash: ie(re(W.contract || J())),
      initHealthOk: te.ok === !0,
      initHealthMissing: [...new Set((Array.isArray(te.missing) ? te.missing : []).map((he) => String(he || "").trim()).filter(Boolean))],
      appRootHash: ie(String(Y || _))
    };
    return `${le.templateRevision}-${ie(re(le))}`;
  }
  function pt(K = "") {
    return `"${String(K || "").trim()}"`;
  }
  function gt(K = "") {
    return String(K || "").trim().replace(/^W\//i, "").replace(/^"(.*)"$/, "$1");
  }
  function Ht(K, G = "") {
    const Y = String(K?.headers?.get?.("If-None-Match") || "").trim(), W = gt(G);
    return !Y || !W ? !1 : Y.split(",").some((te) => {
      const le = gt(te);
      return le === "*" || le === W;
    });
  }
  function wt(K, G = "") {
    const Y = K instanceof Request ? new URL(K.url) : new URL(String(K || ""), S), W = new URL(Y.pathname, S);
    return W.searchParams.set("remote", ie(String(G || "").trim())), new Request(W.toString(), { method: "GET" });
  }
  function $t(K, G = "", Y = {}) {
    const W = wt(K, G), te = new URL(W.url);
    return te.searchParams.set("transform", L), te.searchParams.set("bootstrap", ie(re(H(Y) ? Y : {}))), new Request(te.toString(), { method: "GET" });
  }
  function nr(K = "", G = "no-store, max-age=0") {
    const Y = new Headers({
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": String(G || "no-store, max-age=0")
    });
    return Ne(Y), K && Y.set("ETag", pt(K)), Y;
  }
  function Lt(K = "") {
    const G = String(K || "").trim();
    if (!G) return "";
    const Y = Date.parse(G);
    return Number.isFinite(Y) ? new Date(Y).toUTCString() : "";
  }
  function Rr(K, G = "") {
    const Y = String(K?.headers?.get?.("If-Modified-Since") || "").trim(), W = Lt(G);
    if (!Y || !W) return !1;
    const te = Date.parse(Y), le = Date.parse(W);
    return !Number.isFinite(te) || !Number.isFinite(le) ? !1 : te >= le;
  }
  function Bt(K, G) {
    return String(K?.headers?.get?.("If-None-Match") || "").trim() ? Ht(K, G?.headers?.get?.("ETag") || "") : Rr(K, G?.headers?.get?.("Last-Modified") || "");
  }
  function Kt(K, G = "no-store, max-age=0") {
    const Y = new Headers({ "Cache-Control": String(G || "no-store, max-age=0") }), W = gt(K?.headers?.get?.("ETag") || ""), te = Lt(K?.headers?.get?.("Last-Modified") || "");
    W && Y.set("ETag", pt(W)), te && Y.set("Last-Modified", te);
    const le = String(K?.headers?.get?.("X-Admin-Shell-Revision") || "").trim();
    return le && Y.set("X-Admin-Shell-Revision", le), Ne(Y), new Response(null, {
      status: 304,
      headers: Y
    });
  }
  return {
    ADMIN_FALLBACK_HTML_TEMPLATE: r,
    cachedAdminTemplateBytes: a,
    SITE_FAVICON_SVG: n,
    LANDING_PAGE_STYLE_HTML: s,
    renderFaviconResponse: i,
    ADMIN_HTML_DYNAMIC_PLACEHOLDERS: c,
    ADMIN_HTML_VARIANT_ETAG: l,
    ADMIN_HTML_PARTS_PLAIN: u,
    ADMIN_EMBEDDED_TEMPLATE_MODE: d,
    ADMIN_FINAL_UI_HTML_RETIRED: f,
    splitAdminHtmlTemplate: m,
    renderAdminHtmlTemplate: p,
    ADMIN_BOOTSTRAP_PLACEHOLDER: h,
    ADMIN_INIT_HEALTH_BANNER_PLACEHOLDER: g,
    ADMIN_APP_ROOT_PLACEHOLDER: y,
    ADMIN_APP_ROOT_HTML: _,
    ADMIN_HTML_CACHE_KEY_ORIGIN: S,
    ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL: E,
    ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL: b,
    ADMIN_REMOTE_SHELL_REVALIDATE_MS: T,
    ADMIN_REMOTE_SHELL_MAX_BYTES: C,
    ADMIN_REMOTE_SHELL_TRANSFORM_REVISION: L,
    ADMIN_REMOTE_SHELL_CACHED_AT_HEADER: P,
    ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER: A,
    ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER: w,
    ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER: R,
    ADMIN_RELEASE_PROXY_PATH_SEGMENT: I,
    ADMIN_RELEASE_VENDOR_PATH_SEGMENT: x,
    ADMIN_WARM_PATH_SEGMENT: N,
    ADMIN_RELEASE_VENDOR_CACHE_KEY_ORIGIN: F,
    ADMIN_RELEASE_VENDOR_MANIFEST_CACHE_KEY_ORIGIN: D,
    ADMIN_RELEASE_VENDOR_CACHE_CONTROL: U,
    ADMIN_RELEASE_VENDOR_MUTABLE_CACHE_CONTROL: V,
    ADMIN_RELEASE_VENDOR_MAX_BYTES: X,
    ADMIN_WARM_VENDOR_CONCURRENCY: v,
    ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER: O,
    ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER: M,
    ADMIN_PRIMARY_VIEWS: k,
    ADMIN_SETTINGS_VISUAL_SECTIONS: j,
    ADMIN_SETTINGS_SAVE_GROUPS: q,
    buildAdminUiContract: J,
    buildAdminBootstrapPayload: Q,
    measureAdminShellTemplateBytes: se,
    buildAdminShellLifecycleState: pe,
    buildAdminShellRetirementState: _e,
    buildAdminShellEffectiveMode: ye,
    buildAdminEmbeddedFallbackRuntimeState: Te,
    buildAdminShellState: Ue,
    resolveAdminShellIndexUrl: kt,
    normalizeAdminShellRuntimeStatus: De,
    patchAdminShellRuntimeStatus: ca,
    withAdminShellRuntimeStatus: st,
    describeAdminRemoteShellFailureReason: it,
    buildAdminRemoteShellErrorContent: Tr,
    buildAdminIndexSetupContent: la,
    renderAdminHtmlShell: $e,
    buildAdminHtmlVariantEtag: ar,
    formatAdminHtmlEtag: pt,
    normalizeEtagToken: gt,
    requestHasMatchingEtag: Ht,
    buildAdminRemoteShellLegacyCacheKeyRequest: wt,
    buildAdminRemoteShellCacheKeyRequest: $t,
    buildAdminHtmlResponseHeaders: nr,
    normalizeAdminHttpDateHeader: Lt,
    requestHasMatchingLastModified: Rr,
    requestMatchesAdminHtmlResponse: Bt,
    buildConditionalNotModifiedResponseFromStoredResponse: Kt
  };
}
function Yd(o = {}, e = {}) {
  function t(v = "{}") {
    return `${s(v)}${r}`;
  }
  const r = '<script id="admin-bootstrap-loader">try{window.__ADMIN_BOOTSTRAP__=JSON.parse(document.getElementById("admin-bootstrap")?.textContent||"{}")}catch(_){window.__ADMIN_BOOTSTRAP__=window.__ADMIN_BOOTSTRAP__||{},window.__ADMIN_UI_BOOT_ERROR__=window.__ADMIN_UI_BOOT_ERROR__||"admin bootstrap parse failed: "+(_?.message||String(_||"unknown_error"))}<\/script>', a = '<script id="admin-tailwind-prelude">window.tailwind=window.tailwind||{};<\/script>', n = /* @__PURE__ */ new Set([
    "script",
    "style",
    "template",
    "textarea",
    "title",
    "noscript"
  ]);
  function s(v = "{}") {
    return `<script id="admin-bootstrap" type="application/json">${String(v || "{}")}<\/script>`;
  }
  function i(v = "") {
    return v === " " || v === "	" || v === `
` || v === "\f" || v === "\r";
  }
  function c(v, O) {
    let M = "";
    for (let k = O; k < v.length; k += 1) {
      const j = v[k];
      if (M)
        j === M && (M = "");
      else if (j === '"' || j === "'") M = j;
      else if (j === ">") return k;
    }
    return -1;
  }
  function l(v, O) {
    let M = O + 1;
    if (!/[A-Za-z]/.test(v[M] || "")) return null;
    const k = c(v, M);
    if (k < 0) return null;
    const j = M;
    for (; M < k && !i(v[M]) && v[M] !== "/"; ) M += 1;
    const q = v.slice(j, M).toLowerCase(), J = /* @__PURE__ */ new Map();
    for (; M < k; ) {
      for (; M < k && i(v[M]); ) M += 1;
      if (M >= k) break;
      if (v[M] === "/") {
        M += 1;
        continue;
      }
      const Q = M;
      for (; M < k && !i(v[M]) && v[M] !== "=" && v[M] !== "/"; ) M += 1;
      if (M === Q) {
        M += 1;
        continue;
      }
      const se = v.slice(Q, M).toLowerCase();
      for (; M < k && i(v[M]); ) M += 1;
      let pe = "", _e = !1, ye = -1, Te = -1;
      if (v[M] === "=") {
        for (M += 1; M < k && i(v[M]); ) M += 1;
        const Ue = v[M];
        if (Ue === '"' || Ue === "'") {
          for (_e = !0, M += 1, ye = M; M < k && v[M] !== Ue; ) M += 1;
          Te = M, pe = v.slice(ye, Te), M < k && (M += 1);
        } else {
          for (ye = M; M < k && !i(v[M]); ) M += 1;
          Te = M, pe = v.slice(ye, Te);
        }
      }
      J.has(se) || J.set(se, {
        value: pe,
        quoted: _e,
        valueStart: ye,
        valueEnd: Te
      });
    }
    return {
      tagName: q,
      attributes: J,
      start: O,
      tagEnd: k
    };
  }
  const u = /* @__PURE__ */ new Map();
  function d(v) {
    let O = u.get(v);
    return O || (O = new RegExp(`</${T(v)}(?=[ \\t\\n\\f\\r/>]|$)`, "gi"), u.set(v, O)), O.lastIndex = 0, O;
  }
  function f(v, O, M) {
    const k = d(O);
    k.lastIndex = M;
    const j = k.exec(v);
    if (!j) return null;
    const q = c(v, j.index + j[0].length);
    return q < 0 ? null : {
      start: j.index,
      tagEnd: q
    };
  }
  function* m(v = "") {
    const O = String(v || "");
    let M = 0;
    for (; M < O.length; ) {
      const k = O.indexOf("<", M);
      if (k < 0) return;
      if (O.startsWith("<!--", k)) {
        const pe = O.indexOf("-->", k + 4);
        M = pe < 0 ? O.length : pe + 3;
        continue;
      }
      const j = O[k + 1] || "";
      if (j === "!" || j === "?" || j === "/") {
        const pe = c(O, k + 2);
        if (pe < 0) return;
        M = pe + 1;
        continue;
      }
      const q = l(O, k);
      if (!q) {
        if (/[A-Za-z]/.test(j)) return;
        M = k + 1;
        continue;
      }
      const J = q.tagEnd + 1, Q = n.has(q.tagName) ? f(O, q.tagName, J) : null, se = Q ? Q.start : J;
      if (M = Q ? Q.tagEnd + 1 : J, yield {
        ...q,
        contentStart: J,
        contentEnd: Q || !n.has(q.tagName) ? se : O.length,
        contentTagEnd: Q ? Q.tagEnd : -1,
        contentClosed: !!Q || !n.has(q.tagName)
      }, n.has(q.tagName) && !Q) return;
    }
  }
  function p(v = "", O = "") {
    const M = String(v || ""), k = String(O || "");
    if (!M || !k) return M;
    let j = -1;
    for (const q of m(M)) {
      if (q.tagName === "head") {
        const J = q.tagEnd + 1;
        return `${M.slice(0, J)}${k}${M.slice(J)}`;
      }
      q.tagName === "body" && j < 0 && (j = q.tagEnd + 1);
    }
    return j >= 0 ? `${M.slice(0, j)}${k}${M.slice(j)}` : `${k}${M}`;
  }
  function h(v = "") {
    const O = String(v || "");
    if (!O) return O;
    let M = -1;
    for (const k of m(O)) {
      if (k.tagName !== "script" || !k.contentClosed) continue;
      if (k.attributes.get("id")?.value === "admin-tailwind-prelude") return O;
      if (M >= 0 || k.attributes.has("src")) continue;
      const j = O.slice(k.contentStart, k.contentEnd);
      /\btailwind\s*\.\s*config\s*=/i.test(j) && (M = k.start);
    }
    return M < 0 ? O : `${O.slice(0, M)}${a}${O.slice(M)}`;
  }
  function g(v = "", O = "{}") {
    const M = h(String(v || ""));
    if (!M) return M;
    const k = s(O);
    let j = null, q = null;
    for (const J of m(M)) {
      if (J.tagName !== "script" || !J.contentClosed) continue;
      const Q = String(J.attributes.get("id")?.value || "").trim();
      Q === "admin-bootstrap" && String(J.attributes.get("type")?.value || "").trim().toLowerCase() === "application/json" ? j = J : Q === "admin-bootstrap-loader" && (q = J);
    }
    if (j && j.contentTagEnd >= j.tagEnd) {
      const J = M.slice(0, j.start), Q = M.slice(j.contentTagEnd + 1);
      return `${J}${k}${q ? "" : r}${Q}`;
    }
    return q ? `${M.slice(0, q.start)}${k}${M.slice(q.start)}` : p(M, t(O));
  }
  function y(v) {
    const O = String(v?.tagName || "").trim().toLowerCase();
    let M = "", k = "";
    if (O === "script" && v.attributes?.has("src"))
      M = "src", k = "script";
    else if (O === "link" && v.attributes?.has("href")) {
      const Q = new Set(String(v.attributes.get("rel")?.value || "").trim().toLowerCase().split(/\s+/).filter(Boolean)), se = String(v.attributes.get("as")?.value || "").trim().toLowerCase();
      Q.has("stylesheet") ? k = "css" : Q.has("modulepreload") ? k = "script" : (Q.has("preload") || Q.has("prefetch")) && se === "style" ? k = "css" : (Q.has("preload") || Q.has("prefetch")) && se === "script" && (k = "script"), k && (M = "href");
    }
    if (!M || !k) return null;
    const j = v.attributes.get(M), q = Number(j?.valueStart), J = Number(j?.valueEnd);
    return !Number.isInteger(q) || !Number.isInteger(J) || q < 0 || J < q ? null : {
      rawValue: String(j?.value || ""),
      assetKind: k,
      valueStart: q,
      valueEnd: J
    };
  }
  function _(v = "") {
    const O = [];
    for (const M of m(v)) {
      const k = y(M);
      k && O.push(k);
    }
    return O;
  }
  function S(v = "") {
    for (const O of m(v))
      if (O.tagName === "script" && String(O.attributes.get("type")?.value || "").trim().toLowerCase() === "importmap")
        return !0;
    return !1;
  }
  function E(v = "", O = "") {
    const M = String(v || "");
    if (!M) return [];
    let k = null;
    try {
      k = new URL(String(O || "").trim());
    } catch {
      k = null;
    }
    const j = [];
    for (const q of _(M)) {
      const J = String(q.rawValue || "").trim();
      if (!(!J || /^data:/i.test(J) || /^javascript:/i.test(J)))
        try {
          const Q = k ? new URL(J, k).toString() : new URL(J).toString();
          j.push({
            rawValue: J,
            normalizedUrl: Q,
            assetKind: q.assetKind
          });
        } catch {
          continue;
        }
    }
    return j.filter((q, J, Q) => Q.findIndex((se) => se.normalizedUrl === q.normalizedUrl) === J);
  }
  function b(v = "", O = "") {
    return E(v, O).map((M) => M.normalizedUrl);
  }
  function T(v = "") {
    return String(v || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function C(v = "", O = "") {
    const M = String(v || "").trim(), k = String(O || "").trim().toLowerCase() === "css" ? "css" : "js";
    return M ? `${ie(M)}.${k}` : "";
  }
  function L(v = "/admin", O = "", M = "") {
    const k = Z(v || "/admin").replace(/\/+$/, "") || "/admin", j = St(O), q = String(M || "").trim();
    return !j || !q ? "" : `${k}/${e.ADMIN_RELEASE_PROXY_PATH_SEGMENT}/${encodeURIComponent(j)}/${e.ADMIN_RELEASE_VENDOR_PATH_SEGMENT}/${encodeURIComponent(q)}`;
  }
  function P(v = "", O = {}) {
    const M = E(v, O.baseUrl || O.sourceUrl || "").map((k) => ({
      assetKey: C(k.normalizedUrl, k.assetKind),
      assetKind: k.assetKind,
      upstreamUrl: k.normalizedUrl
    })).filter((k) => k.assetKey && k.upstreamUrl).filter((k, j, q) => q.findIndex((J) => J.assetKey === k.assetKey) === j);
    return {
      version: 1,
      releaseTag: St(O.releaseTag),
      sourceUrl: kr(O.sourceUrl || O.baseUrl || ""),
      entries: M
    };
  }
  function A(v = "", O = {}, M = {}) {
    const k = String(v || "");
    if (!k) return k;
    const j = String(M.adminPath || "/admin").trim() || "/admin", q = St(M.releaseTag), J = new Map((Array.isArray(O?.entries) ? O.entries : []).map((_e) => [String(_e?.upstreamUrl || "").trim(), String(_e?.assetKey || "").trim()]));
    if (!q || J.size === 0) return k;
    let Q = null;
    try {
      Q = new URL(String(M.baseUrl || M.sourceUrl || "").trim());
    } catch {
      Q = null;
    }
    const se = [];
    for (const _e of _(k)) {
      const ye = String(_e.rawValue || "").trim();
      if (!(!ye || /^data:/i.test(ye) || /^javascript:/i.test(ye)))
        try {
          const Te = Q ? new URL(ye, Q).toString() : new URL(ye).toString(), Ue = J.get(Te), kt = L(j, q, Ue);
          if (!Ue || !kt) continue;
          se.push({
            start: _e.valueStart,
            end: _e.valueEnd,
            value: kt
          });
        } catch {
          continue;
        }
    }
    let pe = k;
    for (const _e of se.sort((ye, Te) => Te.start - ye.start)) pe = `${pe.slice(0, _e.start)}${_e.value}${pe.slice(_e.end)}`;
    return pe;
  }
  function w(v = {}) {
    const O = H(v) ? v : {};
    return {
      version: Number(O.version) || 1,
      releaseTag: St(O.releaseTag),
      sourceUrl: kr(O.sourceUrl),
      entries: (Array.isArray(O.entries) ? O.entries : []).map((M) => ({
        assetKey: String(M?.assetKey || "").trim(),
        assetKind: String(M?.assetKind || "").trim().toLowerCase() === "css" ? "css" : "script",
        upstreamUrl: kr(M?.upstreamUrl)
      })).filter((M) => M.assetKey && M.upstreamUrl)
    };
  }
  function R(v = "") {
    let O = null;
    try {
      O = new URL(String(v || "").trim());
    } catch {
      return !1;
    }
    const M = O.hostname.replace(/\.+$/, "");
    if (!/(^|\.)jsdelivr\.net$/i.test(M) || !/^\/gh\/[^/]+\/[^/]+\//i.test(O.pathname)) return !1;
    const k = O.pathname.match(/^\/gh\/[^/]+\/[^@/]+@([^/]+)\//i);
    if (!k) return !0;
    const j = decodeURIComponent(String(k[1] || "").trim());
    return j ? !(/^[0-9a-f]{7,40}$/i.test(j) || /^v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/i.test(j)) : !0;
  }
  function I(v = "") {
    const O = String(v || ""), M = [], k = (J = "") => /[A-Za-z0-9_$]/.test(J), j = (J) => {
      let Q = J;
      for (; Q < O.length; ) {
        if (/\s/.test(O[Q])) {
          Q += 1;
          continue;
        }
        if (O.startsWith("//", Q)) {
          const se = O.indexOf(`
`, Q + 2);
          Q = se < 0 ? O.length : se + 1;
          continue;
        }
        if (O.startsWith("/*", Q)) {
          const se = O.indexOf("*/", Q + 2);
          Q = se < 0 ? O.length : se + 2;
          continue;
        }
        break;
      }
      return Q;
    };
    let q = O.indexOf("import");
    for (; q >= 0; ) {
      if (!k(O[q - 1]) && !k(O[q + 6])) {
        let J = q - 1;
        for (; J >= 0 && /\s/.test(O[J]); ) J -= 1;
        const Q = j(q + 6);
        O[J] !== "." && O[Q] === "(" && M.push({
          index: q,
          reference: O.slice(q, Q + 1)
        });
      }
      q = O.indexOf("import", q + 6);
    }
    return M;
  }
  function x(v = "") {
    const O = String(v || "");
    for (const M of m(O)) {
      if (M.tagName !== "script" || !M.contentClosed || M.attributes.get("src")?.value) continue;
      const k = String(M.attributes.get("type")?.value || "").trim().toLowerCase().split(";")[0];
      if (!(k && ![
        "module",
        "text/javascript",
        "application/javascript",
        "text/ecmascript",
        "application/ecmascript"
      ].includes(k)) && I(O.slice(M.contentStart, M.contentEnd)).length > 0)
        return !0;
    }
    return !1;
  }
  function N(v = "", O = "") {
    const M = E(v, O), k = [];
    S(v) && k.push("远端 index.html 不允许 importmap；所有运行时依赖必须通过显式 script/link 标签交付"), x(v) && k.push("index.html 不允许 inline 动态 import()；所有运行时依赖必须通过显式 script/link 标签交付");
    for (const j of M) {
      const q = String(j?.rawValue || "").trim(), J = String(j?.normalizedUrl || "").trim();
      let Q = "", se = "";
      try {
        const pe = new URL(J);
        Q = pe.hostname.replace(/\.+$/, "").toLowerCase(), se = pe.pathname;
      } catch {
      }
      if (!/^(?:https?:)?\/\//i.test(q)) {
        k.push(`远端 index.html 不允许相对或本地 bundle 资源：${q}`);
        continue;
      }
      if (Q === "esm.sh" || Q.endsWith(".esm.sh")) {
        k.push(`esm.sh 资产不再允许：${J}`);
        continue;
      }
      if (Q === "raw.githubusercontent.com") {
        k.push(`raw.githubusercontent.com 资产不再允许：${J}`);
        continue;
      }
      if (Q === "github.com" && /^\/[^/]+\/[^/]+\/releases\/download\//i.test(se)) {
        k.push(`浏览器直连 GitHub Release 资产不再允许：${J}`);
        continue;
      }
    }
    return k;
  }
  function F(v = "") {
    for (const O of m(v)) {
      if (n.has(O.tagName)) continue;
      const M = O.attributes.get("id");
      if (M?.quoted && M.value === "app") return !0;
    }
    return !1;
  }
  function D(v = "") {
    let O = !1, M = !1;
    for (const k of m(v))
      if (k.attributes.has("data-admin-runtime-enhancements") && (k.tagName === "style" ? O = !0 : k.tagName === "script" && (M = !0), O && M))
        return !0;
    return !1;
  }
  function U(v = "") {
    const O = String(v || "").trim();
    return O ? /<!doctype\s+html\b/i.test(O) || /<html\b/i.test(O) : !1;
  }
  function V(v = "", O = !1) {
    const M = String(v || "").trim().toLowerCase();
    return !M || M.includes("text/html") || M.includes("application/xhtml+xml") ? !0 : O ? M.startsWith("text/plain") || M.startsWith("application/octet-stream") : !1;
  }
  function X(v = {}) {
    const O = H(v.bootstrap) ? v.bootstrap : {}, M = H(v.initHealth) ? v.initHealth : H(O.initHealth) ? O.initHealth : {};
    return `admin-remote-shell-${ie(re({
      templateRevision: "admin-remote-shell",
      sourceHash: ie(String(v.sourceUrl || "").trim()),
      originEtag: e.normalizeEtagToken(v.originEtag || ""),
      originLastModified: e.normalizeAdminHttpDateHeader(v.originLastModified || ""),
      htmlHash: ie(String(v.html || "")),
      variantSeed: e.buildAdminHtmlVariantEtag(O, M, "remote-admin-shell")
    }))}`;
  }
  return {
    buildAdminRemoteBootstrapMarkup: t,
    ADMIN_REMOTE_BOOTSTRAP_LOADER_HTML: r,
    ADMIN_REMOTE_TAILWIND_PRELUDE_HTML: a,
    ADMIN_HTML_SKIPPED_CONTENT_TAGS: n,
    buildAdminRemoteBootstrapScriptMarkup: s,
    isAdminHtmlSpace: i,
    findAdminHtmlTagEnd: c,
    parseAdminHtmlOpeningTag: l,
    findAdminHtmlClosingTag: f,
    iterateAdminHtmlOpeningTags: m,
    injectMarkupIntoHtmlDocument: p,
    ensureAdminRemoteTailwindConfigGlobal: h,
    applyAdminRemoteBootstrapMarkup: g,
    getAdminRemoteShellAssetReference: y,
    collectAdminRemoteShellAssetReferences: _,
    hasAdminRemoteShellImportMap: S,
    extractAdminRemoteShellAssetDescriptors: E,
    extractAdminRemoteShellAssetUrls: b,
    escapeRegexForRoute: T,
    buildAdminReleaseVendorAssetKey: C,
    buildAdminReleaseVendorProxyPath: L,
    buildAdminReleaseVendorManifest: P,
    rewriteAdminRemoteShellAssetUrlsToProxy: A,
    normalizeAdminReleaseVendorManifestRecord: w,
    isMutableJsdelivrGithubAssetUrl: R,
    collectAdminInlineDynamicImports: I,
    hasAdminRemoteShellInlineDynamicImport: x,
    getAdminRemoteShellAssetPolicyViolations: N,
    hasAdminRemoteShellAppRoot: F,
    hasAdminRemoteShellRuntimeEnhancements: D,
    hasAdminRemoteShellHtmlDocument: U,
    isAcceptedAdminHtmlDocumentContentType: V,
    buildAdminRemoteShellVariantEtag: X
  };
}
function We(o, e) {
  return fetch(o, e);
}
function _c(o = {}) {
  const e = {};
  if (!o || typeof o != "object" || Array.isArray(o)) return e;
  for (const [t, r] of Object.entries(o)) {
    const a = String(t || "").trim().toLowerCase();
    !a || e[a] !== void 0 || (e[a] = r);
  }
  return e;
}
function Bs(o = {}, e = []) {
  const t = _c(o);
  for (const r of Array.isArray(e) ? e : [e]) {
    const a = String(r || "").trim().toLowerCase();
    if (!a) continue;
    const n = t[a];
    if (!(n == null || n === ""))
      return n;
  }
  return "";
}
function mt(o = []) {
  return (Array.isArray(o) ? o : [o]).map((e) => String(e ?? "").trim()).filter(Boolean).join(":");
}
async function Xt(o, e) {
  return await Pn(oe.SingleFlightTasks, o, e);
}
async function Pn(o, e, t) {
  const r = String(e || "").trim();
  if (!r) return await t();
  const a = o.get(r);
  if (a) return await a;
  const n = Promise.resolve().then(() => t()).finally(() => {
    o.get(r) === n && o.delete(r);
  });
  return o.set(r, n), await n;
}
function ia(o) {
  return String(o?.__CONFIG_CACHE_NAMESPACE || o?.__WORKER_CACHE_SCOPE || "default").trim() || "default";
}
function xn(o) {
  return cn.get(Ft(o), ia(o));
}
function po(o) {
  return xn(o).ConfigCache?.data || null;
}
function fn(o) {
  if (arguments.length === 0) {
    cn.reset();
    return;
  }
  const e = xn(o);
  e.RuntimeConfigCacheGeneration += 1, e.ConfigCache = null;
}
function Jd(o, e) {
  const t = xn(o);
  t.RuntimeConfigCacheGeneration += 1, t.ConfigCache = {
    data: e,
    exp: Date.now() + $.Defaults.CacheTTL,
    namespace: ia(o)
  };
}
async function go(o, e) {
  const t = String(o), r = (oe.AdminRemoteShellCacheMutationChains.get(t) || Promise.resolve()).catch(() => null).then(() => e()).finally(() => {
    oe.AdminRemoteShellCacheMutationChains.get(t) === r && oe.AdminRemoteShellCacheMutationChains.delete(t);
  });
  return oe.AdminRemoteShellCacheMutationChains.set(t, r), await r;
}
function Qd(o = {}, e = {}) {
  function t(A = "", w = {}) {
    const R = e.buildAdminHtmlResponseHeaders(w.variantEtag || "", e.ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL), I = Number.parseInt(String(w.cachedAt || ""), 10);
    R.set(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER, String(Number.isFinite(I) && I > 0 ? I : B()));
    const x = e.normalizeEtagToken(w.originEtag || "");
    x && R.set(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER, x);
    const N = e.normalizeAdminHttpDateHeader(w.originLastModified || "");
    N && R.set(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER, N);
    const F = ie(String(w.sourceUrl || "").trim());
    F && R.set(e.ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER, F);
    const D = Pt(w.shellRevision || rt(w.sourceUrl));
    return D && R.set("X-Admin-Shell-Revision", D), new Response(String(A || ""), {
      status: 200,
      headers: R
    });
  }
  async function r(A) {
    if (!A) return null;
    try {
      const w = await Me(A, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
      if (w.exceeded) return null;
      const R = new Headers(A.headers || {});
      return R.delete("Content-Length"), new Response(w.text, {
        status: Number(A.status) || 200,
        statusText: String(A.statusText || ""),
        headers: R
      });
    } catch {
      return null;
    }
  }
  async function a(A, w, R, I) {
    const x = await Me(A, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
    if (x.exceeded) throw new Error("legacy remote admin shell too large");
    const N = x.text, F = e.applyAdminRemoteBootstrapMarkup(N, ra(R)), D = A.headers.get(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER) || "", U = e.normalizeAdminHttpDateHeader(A.headers.get(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER) || ""), V = e.normalizeAdminHttpDateHeader(A.headers.get("Last-Modified") || "") || U;
    return t(F, {
      variantEtag: e.buildAdminRemoteShellVariantEtag({
        html: F,
        bootstrap: R,
        initHealth: I,
        sourceUrl: w,
        originEtag: D,
        originLastModified: U || V
      }),
      lastModified: V,
      originEtag: D,
      originLastModified: U || V,
      sourceUrl: w,
      cachedAt: _(A)
    });
  }
  function n(A, w = "GET") {
    if (!A) return new Response("Remote admin shell unavailable", { status: 502 });
    const R = new Headers(A.headers || {});
    return R.set("Content-Type", "text/html;charset=UTF-8"), R.set("Cache-Control", e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL), R.delete(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER), R.delete(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER), R.delete(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER), R.delete(e.ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER), Ne(R), new Response(w === "HEAD" ? null : A.body, {
      status: A.status,
      statusText: A.statusText,
      headers: R
    });
  }
  function s(A = "", w = "") {
    const R = new URL(`/${encodeURIComponent(St(A) || "release")}`, e.ADMIN_RELEASE_VENDOR_MANIFEST_CACHE_KEY_ORIGIN);
    return R.searchParams.set("source", ie(String(w || "").trim())), new Request(R.toString(), { method: "GET" });
  }
  function i(A = "", w = "", R = "") {
    const I = new URL(`/${encodeURIComponent(St(A) || "release")}/${encodeURIComponent(String(w || "").trim())}`, e.ADMIN_RELEASE_VENDOR_CACHE_KEY_ORIGIN);
    return I.searchParams.set("source", ie(String(R || "").trim())), I.searchParams.set("schema", "2"), new Request(I.toString(), { method: "GET" });
  }
  function c(A = {}, w = "") {
    const R = new Headers({
      "Content-Type": "application/json;charset=UTF-8",
      "Cache-Control": e.ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL
    }), I = String(w || A?.sourceUrl || "").trim();
    return R.set(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER, String(B())), I && R.set(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER, ie(I)), new Response(JSON.stringify(A), {
      status: 200,
      headers: R
    });
  }
  function l(A = "", w = "script") {
    const R = String(A || "").trim().toLowerCase(), I = String(w || "").trim().toLowerCase() === "css" ? "css" : "script";
    return R ? I === "css" ? R.includes("text/css") || R.includes("application/css") || R.startsWith("text/plain") : R.includes("javascript") || R.includes("ecmascript") || R.startsWith("text/plain") || R.startsWith("application/octet-stream") : !0;
  }
  function u(A, w = "GET") {
    const R = new Headers(A.headers);
    return R.set("Cache-Control", String(A.headers.get("Cache-Control") || e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL).trim() || e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL), R.delete(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER), R.delete(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER), Ne(R), new Response(w === "HEAD" ? null : A.body, {
      status: A.status,
      statusText: A.statusText,
      headers: R
    });
  }
  async function d(A, w = "", R = "") {
    if (!A || typeof A.match != "function") return null;
    const I = await A.match(s(w, R));
    if (!I) return null;
    try {
      const x = await Me(I, mc);
      return x.exceeded ? null : e.normalizeAdminReleaseVendorManifestRecord(JSON.parse(x.text));
    } catch {
      return null;
    }
  }
  async function f(A = "", w = "") {
    const R = St(A), I = kr(w);
    if (!R || !I) return null;
    const x = await We(I, { method: "GET" });
    if (!x.ok) throw new Error(`release index fetch failed: HTTP ${x.status}`);
    const N = String(x.headers.get("Content-Type") || "").trim().toLowerCase(), F = Number.parseInt(String(x.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(F) && F > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`release index too large: ${F} bytes`);
    const D = await Me(x, e.ADMIN_REMOTE_SHELL_MAX_BYTES), U = D.text, V = D.bytes;
    if (D.exceeded || !U || V > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`release index payload invalid: ${V} bytes`);
    const X = e.hasAdminRemoteShellHtmlDocument(U);
    if (!e.isAcceptedAdminHtmlDocumentContentType(N, X)) throw new Error(`release index content-type invalid: ${N}`);
    if (!X) throw new Error("release index payload invalid: html document expected");
    if (!e.hasAdminRemoteShellAppRoot(U)) throw new Error("release index missing #app root");
    const v = e.getAdminRemoteShellAssetPolicyViolations(U, I);
    if (v.length > 0) throw new Error(`release index asset policy invalid: ${v.slice(0, 3).join(" | ")}`);
    return e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(U, {
      releaseTag: R,
      sourceUrl: I
    }));
  }
  async function m(A, w = {}, R = null) {
    const I = e.normalizeAdminReleaseVendorManifestRecord(w);
    if (!A || typeof A.put != "function" || !I.releaseTag || !I.sourceUrl) return I;
    const x = ge(A.put(s(I.releaseTag, I.sourceUrl), c(I, I.sourceUrl)), "admin.release_vendor_manifest_cache_write", { releaseTag: I.releaseTag }, null);
    return R && typeof R.waitUntil == "function" ? R.waitUntil(x) : await x, I;
  }
  async function p(A, w = "", R = "", I = null) {
    const x = await d(A, w, R);
    if (x?.entries?.length) return x;
    const N = await f(w, R);
    return N ? (await m(A, N, I), N) : null;
  }
  function h(A = {}, w = "") {
    const R = String(w || "").trim();
    return R && (Array.isArray(A?.entries) ? A.entries : []).find((I) => String(I?.assetKey || "").trim() === R) || null;
  }
  function g(A = "", w = "/admin") {
    const R = Z(w || "/admin").replace(/\/+$/, "") || "/admin", I = Z(A || "/"), x = new RegExp(`^${e.escapeRegexForRoute(R)}/${e.ADMIN_RELEASE_PROXY_PATH_SEGMENT}/([^/]+)/${e.ADMIN_RELEASE_VENDOR_PATH_SEGMENT}/([^/]+)/*$`, "i"), N = I.match(x);
    if (!N) return null;
    try {
      return {
        releaseTag: St(decodeURIComponent(String(N[1] || ""))),
        assetKey: String(decodeURIComponent(String(N[2] || "")) || "").trim()
      };
    } catch {
      return null;
    }
  }
  function y(A = "", w = "/admin") {
    const R = Z(w || "/admin").replace(/\/+$/, "") || "/admin";
    return (Z(A || "/").replace(/\/+$/, "") || "/").toLowerCase() === `${R}/${e.ADMIN_WARM_PATH_SEGMENT}`.toLowerCase();
  }
  function _(A) {
    const w = Number.parseInt(String(A?.headers?.get?.(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER) || ""), 10);
    return Number.isFinite(w) && w > 0 ? w : 0;
  }
  function S(A) {
    const w = _(A);
    return w ? B() - w >= e.ADMIN_REMOTE_SHELL_REVALIDATE_MS : !0;
  }
  function E(A = "", w = "", R = {}) {
    const I = String(A || ""), x = String(R.sourceLabel || "admin shell").trim() || "admin shell", N = String(R.contentType || "").trim().toLowerCase(), F = new TextEncoder().encode(I).length;
    if (!I || F > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`${x} payload invalid: ${F} bytes`);
    const D = e.hasAdminRemoteShellHtmlDocument(I);
    if (!e.isAcceptedAdminHtmlDocumentContentType(N, D)) throw new Error(`${x} content-type invalid: ${N}`);
    if (!D) throw new Error(`${x} payload invalid: html document expected`);
    if (!e.hasAdminRemoteShellAppRoot(I)) throw new Error(`${x} missing #app root`);
    if (!e.hasAdminRemoteShellRuntimeEnhancements(I)) throw new Error(`${x} missing runtime enhancements`);
    const U = e.getAdminRemoteShellAssetPolicyViolations(I, w);
    if (U.length > 0) throw new Error(`${x} asset policy invalid: ${U.slice(0, 3).join(" | ")}`);
    return {
      html: I,
      bytes: F
    };
  }
  function b(A = "", w = {}, R = {}, I = "", x = {}) {
    const N = E(A, I, x), F = St(x.assetRevision || x.releaseTag), D = F ? e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(N.html, {
      releaseTag: F,
      sourceUrl: I
    })) : null, U = D?.entries?.length ? e.rewriteAdminRemoteShellAssetUrlsToProxy(N.html, D, {
      adminPath: String(x.adminPath || w?.adminPath || "/admin").trim() || "/admin",
      releaseTag: F,
      sourceUrl: I
    }) : N.html, V = e.applyAdminRemoteBootstrapMarkup(U, ra(w)), X = e.normalizeAdminHttpDateHeader(x.lastModified || "") || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toUTCString(), v = String(x.originEtag || "").trim();
    return {
      storedResponse: t(V, {
        variantEtag: e.buildAdminRemoteShellVariantEtag({
          html: V,
          bootstrap: w,
          initHealth: R,
          sourceUrl: I,
          originEtag: v,
          originLastModified: X
        }),
        lastModified: X,
        originEtag: v,
        originLastModified: X,
        sourceUrl: I,
        shellRevision: rt(I)
      }),
      vendorManifest: D
    };
  }
  async function T(A = "", w = "index.html") {
    const R = String(A || ""), I = await ro(R), x = Qr(I);
    let N;
    try {
      N = E(R, x, {
        sourceLabel: "local admin index",
        contentType: "text/html"
      });
    } catch (U) {
      throw U && typeof U == "object" && (U.code = String(U.code || "ADMIN_INDEX_UPLOAD_INVALID"), U.status = Pe(U.status, 400)), U;
    }
    const F = Xo(I), D = e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(N.html, {
      releaseTag: F,
      sourceUrl: x
    }));
    return {
      version: 1,
      revision: I,
      assetRevision: F,
      sourceUrl: x,
      fileName: (String(w || "index.html").trim().replace(/^.*[\\/]/, "") || "index.html").slice(0, 180),
      uploadedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
      bytes: N.bytes,
      html: N.html,
      manifest: D
    };
  }
  async function C(A, w, R, I = null, x = {}) {
    if (rt(A)) {
      const j = typeof x.loadLocalIndexRecord == "function" ? await x.loadLocalIndexRecord() : null;
      if (!j?.html) throw new Error("local admin index upload is missing");
      return b(j.html, w, R, A, {
        sourceLabel: "local admin index",
        contentType: "text/html",
        adminPath: x.adminPath,
        assetRevision: x.assetRevision || j.assetRevision,
        lastModified: j.uploadedAt
      });
    }
    const N = new Headers(), F = e.normalizeEtagToken(I?.headers?.get?.(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER) || ""), D = e.normalizeAdminHttpDateHeader(I?.headers?.get?.(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER) || "");
    F && N.set("If-None-Match", F), D && N.set("If-Modified-Since", D);
    const U = await We(A, {
      method: "GET",
      headers: N
    });
    if (U.status === 304 && I) {
      const j = await Me(I, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
      if (j.exceeded) throw new Error("cached remote admin shell too large");
      const q = j.text;
      return {
        storedResponse: t(q, {
          variantEtag: e.normalizeEtagToken(I.headers.get("ETag") || ""),
          lastModified: e.normalizeAdminHttpDateHeader(I.headers.get("Last-Modified") || ""),
          originEtag: F,
          originLastModified: D,
          sourceUrl: A
        }),
        vendorManifest: null
      };
    }
    if (!U.ok) throw new Error(`remote admin shell fetch failed: HTTP ${U.status}`);
    const V = String(U.headers.get("Content-Type") || "").trim().toLowerCase(), X = Number.parseInt(String(U.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(X) && X > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`remote admin shell too large: ${X} bytes`);
    const v = await Me(U, e.ADMIN_REMOTE_SHELL_MAX_BYTES), O = v.text, M = v.bytes;
    if (v.exceeded || !O || M > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`remote admin shell payload invalid: ${M} bytes`);
    const k = e.normalizeAdminHttpDateHeader(U.headers.get("Last-Modified") || "") || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toUTCString();
    return b(O, w, R, A, {
      sourceLabel: "remote admin shell",
      contentType: V,
      adminPath: x.adminPath,
      assetRevision: x.assetRevision || x.releaseTag,
      lastModified: k,
      originEtag: U.headers.get("ETag") || ""
    });
  }
  async function L(A, w, R, I, x, N, F, D = {}, U = null) {
    if (!w || typeof w.put != "function") return null;
    const V = await C(I, x, N, F, D), X = V?.storedResponse || null;
    return X ? (await w.put(R, X.clone()), V?.vendorManifest?.entries?.length && await m(w, V.vendorManifest, U), X) : null;
  }
  async function P(A, w, R, I, x, N = {}) {
    return Xt(mt(["admin_remote_shell_cold_load", w.url]), () => go(w.url, async () => {
      if (A && typeof A.match == "function") {
        const U = await A.match(w);
        if (U) {
          const V = await e.materializeAdminRemoteShellCachedResponse(U);
          if (V) return {
            storedResponse: V,
            vendorManifest: null,
            loadedFromCache: !0
          };
        }
      }
      const F = await C(R, I, x, null, N), D = F?.storedResponse || null;
      return D ? (A && typeof A.put == "function" && (await A.put(w, D.clone()), F?.vendorManifest?.entries?.length && await m(A, F.vendorManifest, null)), {
        ...F,
        loadedFromCache: !1
      }) : F;
    }));
  }
  return {
    buildAdminRemoteShellStoredResponse: t,
    materializeAdminRemoteShellCachedResponse: r,
    migrateLegacyAdminRemoteShellStoredResponse: a,
    buildAdminRemoteShellClientResponse: n,
    buildAdminReleaseVendorManifestCacheKeyRequest: s,
    buildAdminReleaseVendorAssetCacheKeyRequest: i,
    buildAdminReleaseVendorManifestResponse: c,
    isAcceptedAdminReleaseVendorContentType: l,
    buildAdminReleaseVendorClientResponse: u,
    readAdminReleaseVendorManifestFromCache: d,
    buildAdminReleaseVendorManifestFromSource: f,
    cacheAdminReleaseVendorManifest: m,
    getOrCreateAdminReleaseVendorManifest: p,
    resolveAdminReleaseVendorManifestEntry: h,
    resolveAdminReleaseVendorRouteMatch: g,
    isAdminWarmRoute: y,
    getAdminRemoteShellCachedAt: _,
    shouldRevalidateAdminRemoteShell: S,
    validateAdminShellHtmlSource: E,
    buildAdminShellStoredPayloadFromHtml: b,
    buildAdminLocalIndexUploadRecord: T,
    fetchAdminRemoteShellStoredResponse: C,
    revalidateAdminRemoteShellCache: L,
    loadAdminRemoteShellColdCache: P
  };
}
function Zd(o = {}, e = {}) {
  const { indexRepository: t } = o;
  function r(g = "") {
    const y = String(g || "");
    return y ? `bundled-${ie(y)}` : "";
  }
  async function a(g, y, _, S = ze(y), E = {}) {
    const b = y?.ASSETS;
    if (!b || typeof b.fetch != "function") return null;
    const T = new URL("/index.html", g.url), C = await b.fetch(new Request(T, {
      method: "GET",
      headers: { Accept: "text/html" }
    }));
    if (!C?.ok) throw new Error(`bundled admin shell fetch failed: HTTP ${Number(C?.status) || 0}`);
    const L = Number.parseInt(String(C.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(L) && L > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`bundled admin shell too large: ${L} bytes`);
    const P = await Me(C, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
    if (P.exceeded || !P.text) throw new Error(`bundled admin shell payload invalid: ${P.bytes} bytes`);
    const A = e.buildAdminShellState(y, S, E), w = e.buildAdminBootstrapPayload(y, S, E), R = _t(y, E), I = T.toString(), x = e.buildAdminShellStoredPayloadFromHtml(P.text, w, S, I, {
      sourceLabel: "bundled admin shell",
      contentType: C.headers.get("Content-Type") || "text/html",
      adminPath: w.adminPath,
      assetRevision: r(P.text),
      lastModified: C.headers.get("Last-Modified") || "Thu, 01 Jan 1970 00:00:00 GMT",
      originEtag: C.headers.get("ETag") || ""
    })?.storedResponse || null;
    if (!x) throw new Error("bundled admin shell response is unavailable");
    return await e.patchAdminShellRuntimeStatus(y, {
      shellState: A,
      initHealth: S,
      indexState: R,
      mode: "embedded",
      sourceType: "static_assets",
      routeState: "embedded_active",
      gateState: "shell_ready",
      lifecycleState: "embedded_only",
      embeddedFallbackState: "active",
      remoteCacheState: "bypassed",
      lastFetchStatus: "loaded",
      reason: "served_bundled_admin_shell",
      requestPath: new URL(g.url).pathname,
      indexUrl: I,
      indexUrlSource: "worker_assets",
      effectiveRef: "frontend/dist/index.html",
      effectiveRefType: "static_assets"
    }, _), e.requestMatchesAdminHtmlResponse(g, x) ? e.buildConditionalNotModifiedResponseFromStoredResponse(x, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(x, g.method);
  }
  async function n(g, y, _, S = ze(y), E = {}, b = "index_url_not_configured") {
    const T = _t(y, E), C = e.buildAdminShellState(y, S, E), L = e.buildAdminBootstrapPayload(y, S, E), P = ra(L), A = mo(S), w = new URL(g.url).pathname;
    await e.patchAdminShellRuntimeStatus(y, {
      shellState: C,
      initHealth: S,
      indexState: T,
      remoteShellIndexUrl: T.indexUrl,
      mode: "gate",
      sourceType: "setup_gate",
      routeState: "setup_gate",
      remoteCacheState: "bypassed",
      lastFetchStatus: "skipped",
      reason: b,
      requestPath: w
    }, _);
    const R = e.buildAdminIndexSetupContent(L, C, S, E, T), I = e.renderAdminHtmlShell(P, A, R);
    return new Response(g.method === "HEAD" ? null : I, { headers: e.buildAdminHtmlResponseHeaders("", "no-store, max-age=0") });
  }
  function s(g) {
    const y = String(new URL(g.url).searchParams.get("setup") || "").trim().toLowerCase();
    return y === "1" || y === "true";
  }
  async function i(g, y, _, S = ze(y), E = {}, b = {}) {
    const T = e.buildAdminShellState(y, S, b), C = e.buildAdminBootstrapPayload(y, S, b), L = _t(y, b), P = ra(C), A = mo(S), w = new URL(g.url).pathname, R = {
      ...E,
      shellState: T,
      initHealth: S,
      indexState: L,
      remoteShellIndexUrl: E.remoteShellIndexUrl || T.remoteShellIndexUrl || L.indexUrl || "",
      mode: "remote_error",
      sourceType: E.sourceType || "remote_error",
      routeState: E.routeState || "remote_error",
      remoteCacheState: E.remoteCacheState || "bypassed",
      lastFetchStatus: E.lastFetchStatus || "failed",
      reason: E.reason || "remote_shell_render_failed",
      requestPath: w
    }, I = e.buildAdminRemoteShellErrorContent(C, T, S, R);
    await e.patchAdminShellRuntimeStatus(y, R, _);
    const x = e.renderAdminHtmlShell(P, A, I);
    return new Response(g.method === "HEAD" ? null : x, { headers: e.buildAdminHtmlResponseHeaders("", "no-store, max-age=0") });
  }
  async function c(g, y, _, S = ze(y), E = e.resolveAdminShellIndexUrl(y), b = {}) {
    const T = yr(), C = e.buildAdminShellState(y, S, b), L = e.buildAdminBootstrapPayload(y, S, b), P = _t(y, b), A = {
      releaseTag: P.assetRevision || P.releaseTag,
      assetRevision: P.assetRevision || P.releaseTag,
      adminPath: L.adminPath,
      ...P.isLocalUpload ? { loadLocalIndexRecord: () => t.getAdminIndexUploadRecord(t.getKV(y), P.localUploadRevision) } : {}
    }, w = e.buildAdminRemoteShellCacheKeyRequest(g, E, L), R = e.buildAdminRemoteShellLegacyCacheKeyRequest(g, E), I = new URL(g.url).pathname;
    if (T && typeof T.match == "function") {
      const D = await Xt(mt(["admin_remote_shell_cache_read", w.url]), async () => {
        const X = await T.match(w);
        if (X) {
          const M = await e.materializeAdminRemoteShellCachedResponse(X);
          if (M) return {
            storedResponse: M,
            legacyCacheMigrated: !1
          };
        }
        const v = await T.match(R);
        if (!v) return null;
        const O = await ge(e.migrateLegacyAdminRemoteShellStoredResponse(v, E, L, S), "admin.remote_shell_legacy_cache_read", {
          path: I,
          remoteShellIndexUrl: E
        }, null);
        return O ? await go(w.url, async () => {
          const M = await T.match(w);
          if (M) {
            const k = await e.materializeAdminRemoteShellCachedResponse(M);
            if (k) return {
              storedResponse: k,
              legacyCacheMigrated: !1
            };
          }
          return typeof T.put == "function" && await ge(T.put(w, O.clone()), "admin.remote_shell_legacy_cache_migrate", {
            path: I,
            remoteShellIndexUrl: E
          }, null), {
            storedResponse: O,
            legacyCacheMigrated: !0
          };
        }) : null;
      }), U = D === null ? null : D.storedResponse.clone(), V = D !== null && D.legacyCacheMigrated;
      if (U) {
        const X = e.shouldRevalidateAdminRemoteShell(U);
        let v = null;
        if (X) {
          const k = U.clone();
          v = Xt(mt(["admin_remote_shell_revalidate", w.url]), async () => ge(go(w.url, () => e.revalidateAdminRemoteShellCache(g, T, w, E, L, S, k, A, _)), "admin.remote_shell_revalidate", {
            path: I,
            remoteShellIndexUrl: E
          }, null));
        }
        const O = e.patchAdminShellRuntimeStatus(y, {
          shellState: C,
          initHealth: S,
          indexState: P,
          remoteShellIndexUrl: E,
          mode: "remote",
          sourceType: V ? "remote_legacy_cache" : "remote_cache",
          routeState: "remote_active",
          remoteCacheState: V ? X ? "legacy_stale_hit" : "legacy_hit" : X ? "stale_hit" : "hit",
          revalidateDue: X,
          lastFetchStatus: "cached",
          reason: V ? X ? "migrated_legacy_remote_shell_and_scheduled_revalidate" : "migrated_legacy_remote_shell" : X ? "served_cached_remote_shell_and_scheduled_revalidate" : "served_cached_remote_shell",
          requestPath: I,
          throttleStableWrites: !0
        }, null), M = v ? Promise.all([v, O]) : O;
        return _ && typeof _.waitUntil == "function" && _.waitUntil(M), e.requestMatchesAdminHtmlResponse(g, U) ? e.buildConditionalNotModifiedResponseFromStoredResponse(U, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(U, g.method);
      }
    }
    const x = await e.loadAdminRemoteShellColdCache(T, w, E, L, S, A), N = (x?.storedResponse ? {
      ...x,
      storedResponse: x.storedResponse.clone()
    } : x)?.storedResponse || null;
    if (!N) throw new Error("remote admin shell payload missing");
    const F = Xt(mt(["admin_remote_shell_cold_status", w.url]), () => e.patchAdminShellRuntimeStatus(y, {
      shellState: C,
      initHealth: S,
      indexState: P,
      remoteShellIndexUrl: E,
      mode: "remote",
      sourceType: x?.loadedFromCache ? "remote_cache" : "remote_fetch",
      routeState: "remote_active",
      remoteCacheState: x?.loadedFromCache ? "filled_while_waiting" : "miss",
      lastFetchStatus: x?.loadedFromCache ? "cached" : "fetched",
      reason: x?.loadedFromCache ? "served_cache_filled_while_waiting" : "fetched_remote_shell_index",
      requestPath: I
    }, null));
    return _ && typeof _.waitUntil == "function" ? _.waitUntil(F) : await F, e.requestMatchesAdminHtmlResponse(g, N) ? e.buildConditionalNotModifiedResponseFromStoredResponse(N, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(N, g.method);
  }
  function l(g = "Release vendor asset unavailable", y = 502) {
    const _ = new Headers({
      "Content-Type": "text/plain;charset=UTF-8",
      "Cache-Control": "no-store, max-age=0"
    });
    return Ne(_), new Response(String(g || "Release vendor asset unavailable"), {
      status: y,
      headers: _
    });
  }
  var u = /(?:\/\/[#@]\s*sourceMappingURL=[^\r\n]*|\/\*[#@]\s*sourceMappingURL=[^*]*\*\/)\s*$/;
  function d(g) {
    const y = new TextDecoder().decode(g);
    if (!y.includes("sourceMappingURL")) return g;
    const _ = y.replace(u, "");
    return _ === y ? g : new TextEncoder().encode(_);
  }
  const f = "/vendor", m = /^[a-z0-9]+\.(?:js|css)$/i;
  async function p(g, y, _ = "") {
    const S = String(_ || "").trim();
    if (!m.test(S)) return null;
    const E = g?.ASSETS;
    if (!E || typeof E.fetch != "function") return null;
    let b = null;
    try {
      b = new URL(`${f}/${S}`, y.url);
    } catch {
      return null;
    }
    let T = null;
    try {
      T = await E.fetch(new Request(b, {
        method: "GET",
        headers: { Accept: "*/*" }
      }));
    } catch {
      return null;
    }
    if (!T?.ok) return null;
    const C = await nn(T, e.ADMIN_RELEASE_VENDOR_MAX_BYTES);
    if (C.exceeded || !C.bytes) return null;
    const L = new Headers({
      "Content-Type": S.toLowerCase().endsWith(".css") ? "text/css; charset=utf-8" : "text/javascript; charset=utf-8",
      "Cache-Control": e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL,
      ETag: e.formatAdminHtmlEtag(S),
      [e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER]: ie(`local:${S}`)
    });
    return new Response(d(C.bodyBytes), {
      status: 200,
      headers: L
    });
  }
  async function h(g, y, _, S = null, E = {}) {
    const b = St(S?.releaseTag), T = String(S?.assetKey || "").trim();
    if (!b || !T) return l("Release vendor asset not found", 404);
    const C = await p(y, g, T);
    if (C)
      return e.requestMatchesAdminHtmlResponse(g, C) ? e.buildConditionalNotModifiedResponseFromStoredResponse(C, e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL) : e.buildAdminReleaseVendorClientResponse(C, g.method);
    const L = yr(), P = gd(b);
    if (!P) return l("Local index vendor asset not found", 404);
    const A = P ? await t.getAdminIndexUploadRecord(t.getKV(y), P) : null;
    if (P && !A) return l("Local index vendor asset not found", 404);
    const w = A?.sourceUrl || "";
    if (!w) return l("Release vendor asset not found", 404);
    let R = null;
    A?.manifest ? (R = await e.readAdminReleaseVendorManifestFromCache(L, b, w), R || (R = await e.cacheAdminReleaseVendorManifest(L, A.manifest, _))) : R = await e.getOrCreateAdminReleaseVendorManifest(L, b, w, _);
    const I = e.resolveAdminReleaseVendorManifestEntry(R, T);
    if (!I?.upstreamUrl) return l("Release vendor asset not found", 404);
    const x = e.isMutableJsdelivrGithubAssetUrl(I.upstreamUrl), N = x ? e.ADMIN_RELEASE_VENDOR_MUTABLE_CACHE_CONTROL : e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL, F = e.buildAdminReleaseVendorAssetCacheKeyRequest(b, T, I.upstreamUrl);
    if (!x && L && typeof L.match == "function") {
      const q = await L.match(F);
      if (q)
        return e.requestMatchesAdminHtmlResponse(g, q) ? e.buildConditionalNotModifiedResponseFromStoredResponse(q, N) : e.buildAdminReleaseVendorClientResponse(q, g.method);
    }
    let D = null;
    try {
      D = await We(I.upstreamUrl, {
        method: "GET",
        headers: { Accept: I.assetKind === "css" ? "text/css, text/plain;q=0.9, */*;q=0.1" : "application/javascript, text/javascript, text/plain;q=0.9, */*;q=0.1" }
      });
    } catch (q) {
      return l(`Release vendor asset fetch failed: ${String(q?.message || q || "unknown_error").trim() || "unknown_error"}`, 502);
    }
    if (!D.ok) return l(D.status === 404 ? "Release vendor asset not found" : `Release vendor asset fetch failed (HTTP ${D.status})`, D.status === 404 ? 404 : 502);
    const U = String(D.headers.get("Content-Type") || "").trim();
    if (!e.isAcceptedAdminReleaseVendorContentType(U, I.assetKind)) return l(`Release vendor asset content-type invalid: ${U || "unknown"}`, 502);
    const V = Number.parseInt(String(D.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(V) && V > e.ADMIN_RELEASE_VENDOR_MAX_BYTES) return l(`Release vendor asset too large: ${V} bytes`, 502);
    const X = await nn(D, e.ADMIN_RELEASE_VENDOR_MAX_BYTES), v = X.bytes;
    if (X.exceeded || !v || v > e.ADMIN_RELEASE_VENDOR_MAX_BYTES) return l(`Release vendor asset payload invalid: ${v} bytes`, 502);
    const O = new Headers({ "Cache-Control": N }), M = e.normalizeEtagToken(D.headers.get("ETag") || ""), k = e.normalizeAdminHttpDateHeader(D.headers.get("Last-Modified") || "");
    U && O.set("Content-Type", U), M && O.set("ETag", e.formatAdminHtmlEtag(M)), k && O.set("Last-Modified", k), O.set(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER, String(B())), O.set(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER, ie(I.upstreamUrl));
    const j = new Response(d(X.bodyBytes), {
      status: 200,
      headers: O
    });
    if (!x && L && typeof L.put == "function") {
      const q = ge(L.put(F, j.clone()), "admin.release_vendor_cache_write", {
        releaseTag: b,
        assetKey: T
      }, null);
      _ && typeof _.waitUntil == "function" ? _.waitUntil(q) : await q;
    }
    return e.requestMatchesAdminHtmlResponse(g, j) ? e.buildConditionalNotModifiedResponseFromStoredResponse(j, N) : e.buildAdminReleaseVendorClientResponse(j, g.method);
  }
  return {
    renderBundledAdminPage: a,
    renderAdminIndexSetupPage: n,
    isAdminIndexSetupForced: s,
    renderAdminRemoteShellErrorPage: i,
    renderRemoteAdminPage: c,
    buildAdminReleaseVendorErrorResponse: l,
    renderAdminReleaseVendorAsset: h
  };
}
function bc(o = {}) {
  return {
    ...Hi,
    ...ya,
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    ...o
  };
}
function ae(o, e = 200, t = {}) {
  return new Response(JSON.stringify(o), {
    status: e,
    headers: bc(t)
  });
}
function z(o, e, t = 400, r = null, a = {}) {
  const n = {
    ok: !1,
    error: {
      code: o,
      message: e
    }
  };
  return r != null && (n.error.details = r), ae(n, t, a);
}
async function ef(o) {
  const e = new Headers(o.headers || {});
  if (e.set("Content-Type", "application/json; charset=utf-8"), e.set("Cache-Control", "no-store, max-age=0"), Object.entries(ya).forEach(([c, l]) => e.set(c, l)), Ne(e), o.ok) return new Response(o.body, {
    status: o.status,
    headers: e
  });
  const t = await Me(o, Ln);
  let r = null;
  const a = t.text;
  try {
    r = JSON.parse(a);
  } catch {
  }
  const n = r?.error?.code || (typeof r?.error == "string" ? r.error.toUpperCase() : `HTTP_${o.status}`), s = r?.error?.message || r?.message || (typeof r?.error == "string" ? r.error : a || o.statusText || "request_failed"), i = r?.error?.details ?? r?.details ?? null;
  return z(n, s, o.status || 500, i);
}
function $r(o = "") {
  return String(o || "").trim().toLowerCase() === "simplified" ? "simplified" : "legacy";
}
function Ec(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "balanced" ? "balanced" : e === "aggressive" ? "aggressive" : "compat";
}
function rs(o = {}) {
  const e = o?.enableH2 === !0, t = o?.enableH3 === !0;
  return !e && !t ? "compat" : o?.peakDowngrade === !1 ? "aggressive" : "balanced";
}
var Ac = Object.freeze([
  {
    kind: "summary",
    configKey: "tgDailyReportSummaryEnabled"
  },
  {
    kind: "kv",
    configKey: "tgDailyReportKvEnabled"
  },
  {
    kind: "d1",
    configKey: "tgDailyReportD1Enabled"
  }
]);
function Tc(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "summary" || e === "kv" || e === "d1" ? e : "";
}
function tf(o = []) {
  const e = [], t = /* @__PURE__ */ new Set();
  for (const r of Array.isArray(o) ? o : [o]) {
    const a = Tc(r);
    !a || t.has(a) || (t.add(a), e.push(a));
  }
  return e;
}
function rf(o = {}) {
  return Ac.some(({ configKey: e }) => Ta(o, e));
}
function Rc(o = {}, e = o) {
  const t = o && typeof o == "object" ? o : {}, r = e && typeof e == "object" ? e : {};
  return t.tgDailyReportEnabled === !0 && !rf(r);
}
function af(o = {}, e = {}) {
  const t = o && typeof o == "object" ? o : {};
  return Rc(t, e && typeof e == "object" ? e : {}) ? (t.tgDailyReportSummaryEnabled = !0, t.tgDailyReportKvEnabled = !1, t.tgDailyReportD1Enabled = !1, t) : (t.tgDailyReportSummaryEnabled = t.tgDailyReportSummaryEnabled === !0, t.tgDailyReportKvEnabled = t.tgDailyReportKvEnabled === !0, t.tgDailyReportD1Enabled = t.tgDailyReportD1Enabled === !0, t);
}
function Cc(o = {}, e = o, t = {}) {
  const r = o && typeof o == "object" ? o : {}, a = tf(t?.reportKinds);
  if (a.length > 0) return a;
  const n = Ac.filter(({ configKey: s }) => r[s] === !0).map(({ kind: s }) => s);
  return n.length > 0 ? n : t?.fallbackAllWhenLegacy === !0 && Rc(r, e) ? ["summary"] : [];
}
function nf(o = {}) {
  return $r(o?.routingDecisionMode);
}
function Br(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "legacy" || e === "simplified" ? e : "inherit";
}
function of(o = {}, e = {}) {
  const t = Br(o?.routingDecisionMode);
  return t === "inherit" ? nf(e) : t;
}
function pr(o) {
  const e = String(o ?? "").trim();
  if (!e) return "";
  if (!/^\d{1,5}$/.test(e)) return null;
  const t = Number(e);
  return !Number.isInteger(t) || t < 1 || t > 65535 ? null : String(t);
}
function sf(o) {
  return o === "http:" ? "80" : o === "https:" ? "443" : "";
}
function cf(o) {
  const e = String(o?.username || ""), t = String(o?.password || "");
  return !e && !t ? "" : `${e}${t ? `:${t}` : ""}@`;
}
function lf(o, e = "") {
  if (!(o instanceof URL)) return "";
  const t = String(o.protocol || "").trim().toLowerCase();
  if (!["http:", "https:"].includes(t)) return "";
  const r = pr(e);
  if (r === null) return "";
  const a = String(o.hostname || "").trim();
  if (!a) return "";
  const n = String(o.pathname || "/") || "/", s = String(o.search || ""), i = String(o.hash || "");
  return `${t}//${cf(o)}${a}${r ? `:${r}` : ""}${n}${s}${i}`.replace(/\/$/, "");
}
function Ks(o, e = "", t = "") {
  const r = String(o || "").trim();
  if (!r) return null;
  try {
    const a = new URL(r);
    if (!["http:", "https:"].includes(a.protocol)) return null;
    const n = pr(a.port), s = pr(e), i = pr(t);
    return n === null || s === null || i === null ? null : lf(a, n || s || i || sf(a.protocol)) || null;
  } catch {
    return null;
  }
}
function uf(o = "") {
  const e = String(o || "").trim();
  if (!e) return !1;
  try {
    const t = new URL(e);
    if (!["http:", "https:"].includes(t.protocol)) return !1;
    const r = e.match(/^[a-z][a-z0-9+.-]*:\/\/([^/?#]*)/i);
    if (!r) return !1;
    let a = String(r[1] || "");
    const n = a.lastIndexOf("@");
    if (n >= 0 && (a = a.slice(n + 1)), !a) return !1;
    if (a.startsWith("[")) {
      const s = a.indexOf("]");
      return s < 0 ? !1 : /^:\d+$/.test(a.slice(s + 1));
    }
    return /:\d+$/.test(a);
  } catch {
    return !1;
  }
}
function zs(o = "") {
  const e = String(o || "").trim();
  if (!e) return !1;
  try {
    const t = new URL(e);
    return ["http:", "https:"].includes(t.protocol) ? !uf(e) : !1;
  } catch {
    return !1;
  }
}
function Ee(o) {
  return JSON.stringify(String(o ?? ""));
}
function Ct(o = "/") {
  const e = Z(o || "/");
  return e === "/" ? "" : e.replace(/\/+$/, "");
}
function Ba(o) {
  try {
    const e = o instanceof URL ? o : new URL(String(o || ""));
    if (!["http:", "https:"].includes(e.protocol)) return null;
    const t = String(e.origin || "").trim();
    if (!t) return null;
    const r = Ct(e.pathname);
    return {
      targetUrl: e,
      originText: t,
      normalizedBasePath: r,
      absoluteBasePrefix: `${t}${r}`
    };
  } catch {
    return null;
  }
}
function Xe(o) {
  return Ze(o) ? String(o.absoluteBasePrefix || o.originText || "").trim() : "";
}
function df(o = []) {
  return ie(re((Array.isArray(o) ? o : []).map((e) => Xe(e)).filter(Boolean)));
}
function ff(o = []) {
  return new Set((Array.isArray(o) ? o : []).map((e) => Xe(e)).filter(Boolean)).size;
}
function Ka(o = "", e = $.Defaults.HedgeProbePath) {
  const t = String(o || e || "").trim() || String(e || "/emby/system/ping").trim() || "/emby/system/ping";
  try {
    return Z(new URL(t, "https://hedge-probe.invalid").pathname || "/");
  } catch {
    return Z(t);
  }
}
function _a(o = "") {
  const e = String(o || "").trim();
  return e ? Ka(e, $.Defaults.HedgeProbePath) : "";
}
function Ze(o) {
  return !!o && typeof o == "object" && o.targetUrl instanceof URL && typeof o.originText == "string" && typeof o.normalizedBasePath == "string" && typeof o.absoluteBasePrefix == "string";
}
function Ws(o = "") {
  const e = String(o || "");
  return e ? e.startsWith("?") ? e : `?${e}` : "";
}
function mf(o = "GET", e = {}, t = {}) {
  const r = String(o || "GET").toUpperCase();
  return !(r !== "GET" && r !== "HEAD" || e?.isSegment !== !0 || e?.isWsUpgrade === !0 || t.playbackRelayTargetUrl instanceof URL || t.protocolFallbackRetry === !0 || t.isExternalRedirect === !0);
}
var as = ["proxyMode", "mode"], ns = [
  "direct",
  "sourceDirect",
  "directSource",
  "direct2xx"
], pf = [
  "wangpanMode",
  "videoThrottling",
  "interceptMs"
], wc = "__playback-relay", Lc = "__pb_target", ho = "__pb_abs", yo = Object.freeze({
  main: "",
  proxy_a: "__proxy-a",
  proxy_b: "__proxy-b"
});
function gf(o = {}) {
  const e = o && typeof o == "object" && !Array.isArray(o) ? o : {}, t = [];
  let r = !1;
  const a = pr(e.port), n = Array.isArray(e.lines) ? e.lines.reduce((i, c) => i + (pr(c?.port) ? 1 : 0), 0) : 0, s = Array.isArray(e.lines) && e.lines.length ? e.lines.reduce((i, c) => pr(c?.port) || a ? i : i + (zs(c?.target) ? 1 : 0), 0) : a ? 0 : String(e.target || "").split(",").map((i) => i.trim()).filter(Boolean).reduce((i, c) => i + (zs(c) ? 1 : 0), 0);
  for (const i of as) {
    if (!Object.prototype.hasOwnProperty.call(e, i)) continue;
    t.push(i);
    const c = String(e[i] || "").trim().toLowerCase();
    [
      "direct",
      "source-direct",
      "origin-direct",
      "node-direct"
    ].includes(c) && (r = !0);
  }
  for (const i of ns)
    Object.prototype.hasOwnProperty.call(e, i) && (t.push(i), e[i] === !0 && (r = !0));
  for (const i of pf)
    Object.prototype.hasOwnProperty.call(e, i) && t.push(i);
  return {
    legacyKeysPresent: ir(t),
    shouldAddToSourceDirectNodes: r,
    topLevelPortPresent: a !== null && a !== "",
    linePortCount: n,
    defaultPortNodePresent: s > 0,
    defaultPortLineCount: s
  };
}
function hf(o, e = {}) {
  const t = qr(o);
  return {
    mode: t,
    forceVideoDirect: t === "direct",
    forceVideoProxy: t === "proxy"
  };
}
function yf(o = {}) {
  return Bi(o?.defaultMediaAuthMode);
}
function mn(o = {}) {
  return Ta(o, "defaultPlaybackInfoMode") ? Qt(o?.defaultPlaybackInfoMode) : Reflect.get(o, "playbackInfoAutoProxy") !== void 0 ? Reflect.get(o, "playbackInfoAutoProxy") !== !1 ? "rewrite" : "passthrough" : Reflect.get(o, "playbackInfoBlockWangpanProxy") !== void 0 ? "rewrite" : $.Defaults.DefaultPlaybackInfoMode;
}
function Sf(o = {}) {
  return Qt(mn(o));
}
function _f(o = {}) {
  return Wo(o?.defaultRealClientIpMode);
}
function bf(o = {}, e = {}) {
  const t = o || {}, r = o && typeof o == "object" && Object.prototype.hasOwnProperty.call(o, "mediaAuthMode") ? jt(t.mediaAuthMode) : "auto";
  return r === "inherit" ? yf(e) : r;
}
function Ef(o = {}, e = {}) {
  const t = o || {}, r = o && typeof o == "object" && Object.prototype.hasOwnProperty.call(o, "playbackInfoMode") ? Ur(t.playbackInfoMode) : "inherit";
  return r === "inherit" ? Sf(e) : r;
}
function Af(o = {}, e = {}) {
  const t = o || {}, r = o && typeof o == "object" && Object.prototype.hasOwnProperty.call(o, "realClientIpMode") ? Fr(t.realClientIpMode) : "forward";
  return r === "inherit" ? _f(e) : r;
}
function Tf(o = {}, e = {}) {
  const t = o || {};
  return (o && typeof o == "object" && Object.prototype.hasOwnProperty.call(o, "hedgeProbePath") ? _a(t.hedgeProbePath) : "") || Ka(e?.hedgeProbePath, $.Defaults.HedgeProbePath);
}
function Rf(o) {
  const e = Wo(typeof o == "string" ? o : o?.realClientIpMode);
  return e === "forward" ? "full" : e === "strip" ? "real-ip-only" : e === "disable" ? "none" : "full";
}
function Nc(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "proxy_a" || e === "__proxy-a" ? "proxy_a" : e === "proxy_b" || e === "__proxy-b" ? "proxy_b" : "main";
}
function Cf(o = "main") {
  return yo[Nc(o)] || "";
}
function Ic(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e ? e === yo.proxy_a ? "proxy_a" : e === yo.proxy_b ? "proxy_b" : "main" : "main";
}
function Mr(o = "") {
  const e = String(o || "");
  if (!e) return {
    linkVariant: "main",
    remaining: "",
    needsTrailingSlashRedirect: !1
  };
  const t = e.startsWith("/") ? e : "/" + e, r = t.split("/"), a = Ic(nt(r[1] || ""));
  return a === "main" ? {
    linkVariant: a,
    remaining: Z(t),
    needsTrailingSlashRedirect: !1
  } : {
    linkVariant: a,
    remaining: Z("/" + r.slice(2).join("/")),
    needsTrailingSlashRedirect: r.length === 2 && !t.endsWith("/")
  };
}
function Ft(o = {}) {
  return o.ENI_KV || o.KV || o.EMBY_KV || o.EMBY_PROXY || null;
}
function wf(o = {}) {
  return o.DB || o.D1 || o.PROXY_LOGS || null;
}
var Lf = 16 * 1024;
async function bt(o, e) {
  const t = new TextEncoder(), r = Date.now();
  let a = oe.CryptoKeyCache.get(o);
  for ((!a || a.exp <= r) && (a = {
    key: await ao().importKey("raw", t.encode(o), {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["sign"]),
    exp: r + $.Defaults.CryptoKeyCacheTTL * 1e3
  }), oe.CryptoKeyCache.has(o) && oe.CryptoKeyCache.delete(o), oe.CryptoKeyCache.set(o, a); oe.CryptoKeyCache.size > $.Defaults.CryptoKeyCacheMax; ) {
    const s = oe.CryptoKeyCache.keys().next().value;
    if (s === void 0) break;
    oe.CryptoKeyCache.delete(s);
  }
  const n = await ao().sign("HMAC", a.key, t.encode(e));
  return btoa(String.fromCharCode(...new Uint8Array(n))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
var Nf = class {
  constructor({ actionHandlers: o, bindingService: e, configReader: t, repository: r, requestModel: a, shellService: n }) {
    this.actionHandlers = Object.freeze({ ...o }), this.bindingService = e, this.configReader = t, this.repository = r, this.requestModel = a, this.shellService = n, this.actionAliases = Object.freeze({
      import: "saveOrImport",
      save: "saveOrImport"
    }), this.#t();
  }
  async handle(o, e, t) {
    const r = this.#c(o, e), { requestHost: a, configuredHost: n, configuredLegacyHost: s } = r, i = o.method, c = i === "GET" || i === "HEAD";
    if (c && r.pathnameLower === "/favicon.ico") return this.#_(i);
    const l = await this.configReader.getRuntimeConfig(e), u = !!(s && s !== n && a === s), d = l.enableHostPrefixProxy === !0 && !!n && !u, f = d ? jo(a, n) : null, m = !!(d && a !== n && a.endsWith(`.${n}`));
    if (f || m) return null;
    if (i === "GET" && r.normalizedPathname === "/") return this.#m(e, r.initHealth);
    const p = c ? this.#b(r.normalizedPathname, r.adminPath) : null;
    if (p)
      return await this.#a(o, e) ? this.#y(o, e, t, p, l) : this.#A("Unauthorized", 401);
    if (c && this.#E(r.normalizedPathname, r.adminPath))
      return await this.#a(o, e) ? this.#S(o, e, r.initHealth, l) : this.#g(o, r.adminLoginPath);
    if (c && Dr(r.pathnameLower, r.adminLoginPathLower))
      return await this.#a(o, e) ? this.#g(o, r.adminPath) : this.#p(o, e, r.initHealth);
    if (c && Dr(r.pathnameLower, r.adminPathLower))
      return await this.#a(o, e) ? this.#h(o, e, t, r.initHealth) : this.#g(o, r.adminLoginPath);
    if (i === "OPTIONS" && this.#r(r)) return this.#i(o, e, null);
    if (i === "POST" && (Dr(r.pathnameLower, r.adminLoginPathLower) || this.#n(r))) return this.#u(o, e);
    if (i !== "POST" || !Dr(r.pathnameLower, r.adminPathLower)) return null;
    if (!await this.#a(o, e)) return z("UNAUTHORIZED", "未授权", 401);
    try {
      return await ef(await this.#s(o, e, t));
    } catch (h) {
      const g = Cu(h, {
        code: "INTERNAL_ERROR",
        message: "Server Error",
        status: 500
      });
      return Le("admin_api.unhandled_error", h, {
        path: r.pathnameLower,
        method: i,
        responseCode: g.code,
        responseStatus: g.status
      }, "error"), z(g.code, g.message, g.status, g.details);
    }
  }
  #t() {
    for (const [o, e] of Object.entries(this.actionHandlers)) {
      if (!this.#e(o)) throw new TypeError("Admin action names cannot be empty");
      if (typeof e != "function") throw new TypeError(`Admin action ${o} is not a function`);
    }
    for (const [o, e] of Object.entries(this.actionAliases)) if (!this.actionHandlers[e]) throw new Error(`Admin action alias ${o} targets missing action ${e}`);
  }
  #e(o) {
    return String(o || "").trim();
  }
  #o(o) {
    const e = this.#e(o), t = this.actionAliases[e] || e;
    return this.actionHandlers[t] || null;
  }
  async #s(o, e, t) {
    const r = this.bindingService.getKV(e);
    if (!r) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
    let a;
    try {
      const i = await Me(o, fc);
      if (i.exceeded) return z("REQUEST_TOO_LARGE", "请求体过大", 413);
      a = JSON.parse(i.text || "");
    } catch {
      return z("INVALID_JSON", "请求 JSON 无效", 400);
    }
    const n = this.requestModel.normalizeAdminActionRequest(a);
    if (!n) return z("INVALID_REQUEST", "请求体必须是 JSON 对象", 400);
    const s = this.#o(n.action);
    return s ? s(n.data, {
      action: n.action,
      meta: n.meta,
      request: o,
      env: e,
      ctx: t,
      kv: r,
      db: this.bindingService.getDB(e)
    }) : z("INVALID_ACTION", "未知的管理动作", 400, { action: n.action || null });
  }
  #n(o) {
    return o.adminPathLower === "/admin" && o.pathnameLower === "/api/auth/login" && o.root === "api" && o.segments[1] === "auth" && o.segments[2] === "login";
  }
  #r(o) {
    return hc(o.pathnameLower, o.adminPathLower) || Dr(o.pathnameLower, o.adminLoginPathLower) || this.#n(o);
  }
  #i(o, e, t, r = 200) {
    return this.shellService.buildEdgeCorsResponse(sa(e, o), t, r, { mergeOriginVary: !0 });
  }
  #c(o, e) {
    const t = new URL(o.url), r = ne(t.hostname), a = Z(t.pathname), n = a.toLowerCase(), s = ft(e), i = s.toLowerCase(), c = Mn(s), l = c.toLowerCase(), u = Sc(e, {
      adminPath: s,
      loginPath: c
    }), d = a.split("/").filter(Boolean), f = d[0] || "", m = nt(f).toLowerCase();
    return {
      initHealth: u,
      requestUrl: t,
      requestHost: r,
      configuredHost: Ve(e),
      configuredLegacyHost: Jr(e),
      normalizedPathname: a,
      pathnameLower: n,
      adminPath: s,
      adminPathLower: i,
      adminLoginPath: c,
      adminLoginPathLower: l,
      segments: d,
      rootRaw: f,
      root: m
    };
  }
  async #u(o, e) {
    const t = o.headers.get("cf-connecting-ip") || "unknown", r = this.repository.getDB(e), a = Vd(e), n = await this.configReader.getRuntimeConfig(e), s = Math.max(1, parseInt(n.jwtExpiryDays) || 30) * 86400;
    try {
      const i = await ge(this.repository.getAuthFailureEntry(r, t), "auth.login.read_auth_failure", { ip: t }, null), c = Math.max(0, Number(i?.failCount) || 0);
      if (c >= $.Defaults.MaxLoginAttempts) return z("TOO_MANY_ATTEMPTS", "账户已锁定，请稍后再试", 429);
      let l = "";
      if ((o.headers.get("content-type") || "").includes("application/json")) {
        const d = await Me(o, Lf);
        if (d.exceeded) return z("REQUEST_TOO_LARGE", "请求体过大", 413);
        const f = JSON.parse(d.text || "{}");
        l = typeof f.password == "string" ? f.password : "";
      }
      if (!e.JWT_SECRET) return z("SERVER_MISCONFIGURED", "JWT_SECRET 未配置", 503);
      if (!e.ADMIN_PASS) return z("SERVER_MISCONFIGURED", "ADMIN_PASS 未配置", 503);
      if (l && l === e.ADMIN_PASS) {
        i && await ge(this.repository.deleteAuthFailureEntry(r, t), "auth.login.clear_auth_failure", { ip: t }, !1);
        const d = await this.#d(e.JWT_SECRET, s);
        return ae({
          ok: !0,
          expiresIn: s
        }, 200, { "Set-Cookie": `auth_token=${d}; Path=${a}; Max-Age=${s}; HttpOnly; Secure; SameSite=Strict` });
      }
      const u = c + 1;
      return await ge(this.repository.upsertAuthFailureEntry(r, t, {
        failCount: u,
        expiresAt: B() + $.Defaults.LoginLockDuration * 1e3
      }), "auth.login.write_auth_failure", {
        ip: t,
        nextFailCount: u
      }, null), ae({
        ok: !1,
        error: {
          code: "INVALID_PASSWORD",
          message: "密码错误"
        },
        remain: Math.max(0, $.Defaults.MaxLoginAttempts - u)
      }, 401);
    } catch (i) {
      return z("INVALID_REQUEST", "请求无效", 400, { reason: i.message });
    }
  }
  async #a(o, e) {
    try {
      const t = e.JWT_SECRET;
      if (!t) return !1;
      const r = o.headers.get("Authorization") || "";
      let a = r.startsWith("Bearer ") ? r.slice(7) : null;
      if (!a) {
        const n = (o.headers.get("Cookie") || "").match(/(?:^|;\s*)auth_token=([^;]+)/);
        a = n ? n[1] : null;
      }
      return a ? await this.#f(a, t) : !1;
    } catch {
      return !1;
    }
  }
  async #d(o, e) {
    const t = btoa(JSON.stringify({
      alg: "HS256",
      typ: "JWT"
    })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""), r = btoa(JSON.stringify({
      sub: "admin",
      exp: Math.floor(Date.now() / 1e3) + e
    })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return `${t}.${r}.${await this.#l(o, `${t}.${r}`)}`;
  }
  async #f(o, e) {
    const t = o.split(".");
    if (t.length !== 3 || t[2] !== await this.#l(e, `${t[0]}.${t[1]}`)) return !1;
    try {
      return JSON.parse(atob(t[1].replace(/-/g, "+").replace(/_/g, "/"))).exp > Math.floor(Date.now() / 1e3);
    } catch {
      return !1;
    }
  }
  async #l(o, e) {
    return bt(o, e);
  }
  #m(o, e) {
    return this.shellService.renderLandingPage(o, e);
  }
  #p(o, e, t) {
    return this.shellService.renderAdminLoginPage(o, e, t);
  }
  #h(o, e, t, r) {
    return this.shellService.renderAdminPage(o, e, t, r);
  }
  #y(o, e, t, r, a) {
    return this.shellService.renderAdminReleaseVendorAsset(o, e, t, r, a);
  }
  #S(o, e, t, r) {
    return this.shellService.renderAdminWarmResponse(o, e, t, r);
  }
  #_(o) {
    return this.shellService.renderFaviconResponse(o);
  }
  #b(o, e) {
    return this.shellService.resolveAdminReleaseVendorRouteMatch(o, e);
  }
  #E(o, e) {
    return this.shellService.isAdminWarmRoute(o, e);
  }
  #g(o, e) {
    return this.shellService.buildRequestPathRedirectResponse(o, e);
  }
  #A(...o) {
    return this.shellService.buildAdminReleaseVendorErrorResponse(...o);
  }
};
function Dc(o = "", e = "") {
  const t = String(o || "").trim().toLowerCase(), r = String(e || "").trim().toLowerCase();
  return r === "image" || t.includes("/images/") || t.includes("/emby/covers/") || /\.(jpe?g|png|webp|gif)(?:$|[?#])/.test(t) ? "image_poster" : t.includes("/sessions/playing") || t.includes("/playbackinfo") ? "playback_info" : t.includes("/users/authenticate") ? "auth" : t.includes("/items/") || t.includes("/shows/") || t.includes("/movies/") || t.includes("/users/") ? "media_metadata" : r || "api";
}
function Mc(o = {}, e = {}, t = {}) {
  if (e.requestMethod === "OPTIONS") return !1;
  const r = Dc(e.requestPath, e.category);
  if (r === "image_poster" && o?.logWriteImagePoster !== !0 || r === "media_metadata" && o?.logWriteMediaMetadata !== !0) return !1;
  if (t.statusFinal === !1) return !0;
  const a = Number(e.statusCode) || 0;
  return !(os(o?.logWriteMode) === "error" && (a < 400 || a >= 600));
}
function If(o = "", e = "") {
  return Dc(o, e) === "playback_info";
}
function Df(o = "", e = "") {
  const t = String(o || "").trim().toLowerCase(), r = String(e || "").trim().toLowerCase();
  return r === "stream" || r === "segment" || r === "manifest" ? !0 : /\/stream(?:$|[/?])/.test(t) || t.includes("/master.m3u8") || /\/videos\/[^/]+\/(?:original|download|file)(?:$|[/?])/.test(t) || /\/items\/[^/]+\/download(?:$|[/?])/.test(t) || t.includes("static=true") || t.includes("download=true");
}
function Pc(o) {
  return String(o || "").trim().toLowerCase().replace(/[\s-]+/g, "_") === "poster_manifest" ? "poster_manifest" : "poster";
}
function xc(o) {
  const e = String(o || "").trim().toLowerCase();
  return e === "fts" ? "fts" : e === "like" ? "like" : $.Defaults.LogSearchMode;
}
function os(o) {
  return String(o || "").trim().toLowerCase() === "error" ? "error" : $.Defaults.LogWriteMode;
}
function Mf(o) {
  const e = String(o || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "playback" || e === "playback_info" ? "playback_info" : e === "image" ? "image" : e === "api" ? "api" : e === "auth" ? "auth" : "";
}
function Pf(o) {
  const e = String(o || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "4xx" || e === "status_4xx" ? "4xx" : e === "5xx" || e === "status_5xx" ? "5xx" : "";
}
function Gs(o) {
  const e = String(o || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "direct" ? "direct" : e === "proxy" || e === "proxied" ? "proxy" : "";
}
function xf(o = "") {
  const e = String(o || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "connect_timeout" ? "connect_timeout" : e === "idle_timeout" ? "idle_timeout" : e === "tls_handshake_failed" ? "tls_handshake_failed" : e === "http_version_fallback" ? "http_version_fallback" : e === "redirect_loop" ? "redirect_loop" : e === "redirect_limit_exceeded" ? "redirect_limit_exceeded" : e === "range_unsatisfied" ? "range_unsatisfied" : e === "upstream_4xx" ? "upstream_4xx" : e === "upstream_5xx" ? "upstream_5xx" : e === "unknown_fetch_error" ? "unknown_fetch_error" : "";
}
var Of = Object.freeze({
  400: Object.freeze({
    code: "bad_request",
    text: "请求格式无效或参数不符合上游要求"
  }),
  401: Object.freeze({
    code: "unauthorized",
    text: "请求缺少有效身份凭证，或当前登录态已失效"
  }),
  403: Object.freeze({
    code: "forbidden",
    text: "请求已被识别，但当前账号、策略或源站规则拒绝访问"
  }),
  404: Object.freeze({
    code: "not_found",
    text: "请求路径或目标资源不存在"
  }),
  405: Object.freeze({
    code: "method_not_allowed",
    text: "当前请求方法不被目标接口允许"
  }),
  429: Object.freeze({
    code: "too_many_requests",
    text: "请求频率超过当前限流阈值，服务暂时拒绝继续处理"
  }),
  500: Object.freeze({
    code: "internal_server_error",
    text: "源站或代理在处理请求时发生内部错误"
  }),
  501: Object.freeze({
    code: "not_implemented",
    text: "源站或上游链路尚未实现当前请求所需能力"
  }),
  502: Object.freeze({
    code: "bad_gateway",
    text: "网关无法从上游获得有效响应，或源站当前不可达"
  }),
  503: Object.freeze({
    code: "service_unavailable",
    text: "源站暂时不可用，可能处于维护、重启或过载状态"
  }),
  504: Object.freeze({
    code: "gateway_timeout",
    text: "网关等待上游响应超时"
  }),
  505: Object.freeze({
    code: "http_version_not_supported",
    text: "目标链路不支持当前请求所使用的 HTTP 版本"
  }),
  520: Object.freeze({
    code: "cf_unknown_origin_error",
    text: "Cloudflare 已到达源站，但源站返回了无法归类的异常响应"
  }),
  521: Object.freeze({
    code: "cf_web_server_down",
    text: "Cloudflare 已到达源站网络，但源站拒绝连接或未监听目标端口"
  }),
  522: Object.freeze({
    code: "cf_connection_timed_out",
    text: "Cloudflare 与源站建立连接超时"
  }),
  523: Object.freeze({
    code: "cf_origin_unreachable",
    text: "Cloudflare 无法路由到源站网络，或源站 DNS/网络不可达"
  }),
  524: Object.freeze({
    code: "cf_origin_timeout",
    text: "Cloudflare 已与源站建立连接，但源站在超时窗口内未返回完整响应"
  }),
  525: Object.freeze({
    code: "cf_ssl_handshake_failed",
    text: "Cloudflare 与源站的 TLS 握手失败"
  }),
  526: Object.freeze({
    code: "cf_invalid_ssl_certificate",
    text: "Cloudflare 校验源站证书时判定该证书无效"
  }),
  530: Object.freeze({
    code: "cf_origin_dns_error",
    text: "源站 DNS 解析或 Cloudflare 到源站的访问链路存在致命错误"
  })
});
function vf(o) {
  const e = Math.trunc(Number(o) || 0);
  if (!Number.isFinite(e) || e <= 0) return {
    code: null,
    text: null
  };
  const t = Of[e];
  return t ? {
    code: t.code,
    text: t.text
  } : {
    code: null,
    text: null
  };
}
function Ff(o) {
  const e = String(o || "").trim();
  return e ? /\b(?:AND|OR|NOT|NEAR)\b/i.test(e) || /(?:^|\s)(?:node_name|request_path|user_agent|error_detail)\s*:/i.test(e) || /(?:^|\s)[^\s"]+\*/.test(e) ? !0 : /^"(?:[^"]|"")+"$/.test(e) : !1;
}
function Oc(o) {
  return `"${String(o || "").replace(/"/g, '""')}"`;
}
function Uf(o) {
  return `${Oc(o)}*`;
}
function kf(o) {
  return String(o || "").replace(/(^|\s)((?:node_name|request_path|user_agent|error_detail)\s*:\s*)([^"\s()]+)(?=\s|$)/gi, (e, t, r, a) => `${t}${r}${Oc(a)}`);
}
function Hf(o) {
  const e = String(o || "").trim();
  return e ? Ff(e) ? kf(e) : e.split(/\s+/).filter(Boolean).map((t) => Uf(t)).join(" AND ") : "";
}
function vc(o = null) {
  if (!o || typeof o != "object") return null;
  const e = Math.floor(Number(o.timestamp)), t = Math.floor(Number(o.id));
  return !Number.isFinite(e) || !Number.isFinite(t) || e < 0 || t < 0 ? null : {
    timestamp: e,
    id: t
  };
}
function $f(o = null) {
  return vc({
    timestamp: Number(o?.timestamp),
    id: Number(o?.id)
  });
}
function de(o) {
  return `"${String(o || "").replace(/"/g, '""')}"`;
}
function Pr(o) {
  return String(o || "").toLowerCase().replace(/["`[\]]/g, "").replace(/\s+/g, " ").trim();
}
function ss(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "paid" ? "paid" : e === "free" ? "free" : "";
}
function Ar(o = "") {
  const e = String(o || "").trim().toUpperCase();
  return e === "A" || e === "AAAA" || e === "CNAME";
}
function Za(o, e, t = {}) {
  const r = String(o || "").trim().toUpperCase(), a = String(e || "").trim(), n = t.allowCname !== !1;
  if (!Ar(r)) return "Type 仅允许 A / AAAA / CNAME";
  if (!n && r === "CNAME") return "A 模式仅允许 A / AAAA";
  if (!a) return "Content 不能为空";
  if (r === "A" && !Ha(a)) return "A 记录 Content 必须是合法 IPv4 地址";
  if (r === "AAAA" && !In(a)) return "AAAA 记录 Content 必须是合法 IPv6 地址";
  if (r === "CNAME") {
    if (/\s/.test(a)) return "CNAME 记录 Content 不能包含空格";
    if (a.length > 255) return "CNAME 记录 Content 过长";
  }
  return "";
}
function Bf(o = "") {
  const e = String(o || "").trim();
  return e ? Za("CNAME", e) ? "" : e : "";
}
var Kf = [
  "logIncludeClientIp",
  "logIncludeColo",
  "logIncludeUa"
], zf = [
  "playbackInfoAutoProxy",
  "playbackInfoBlockWangpanProxy",
  "sameOriginRedirectProxy",
  "externalRedirectProxy",
  "clientVisibleSameOriginRedirects",
  "clientVisibleExternalRedirects",
  "clientVisibleRedirects",
  "enableWangpanDirect",
  "wangpandirect",
  "tgDailyReportTime"
], Fc = ["directSourceNodes", "nodeDirectList"], Wf = ["sourceSameOriginProxy", "forceExternalProxy"], Uc = [
  "enableH2",
  "enableH3",
  "peakDowngrade"
], Vs = [
  ...Kf,
  ...zf,
  ...Fc,
  ...Wf,
  ...Uc
], kc = {
  allowedFields: [
    "uiRadiusPx",
    "adminUiSkin",
    "settingsExperienceMode",
    "indexUrl",
    "cfQuotaPlanOverride",
    "protocolStrategy",
    "protocolFallback",
    "enableHostPrefixProxy",
    "enablePrewarm",
    "prewarmDepth",
    "prewarmCacheTtl",
    "prewarmPrefetchBytes",
    "disablePrewarmPrefetch",
    "routingDecisionMode",
    "playbackInfoCacheEnabled",
    "playbackInfoCacheTtlSec",
    "videoProgressForwardEnabled",
    "videoProgressForwardIntervalSec",
    "defaultPlaybackInfoMode",
    "defaultRealClientIpMode",
    "defaultMediaAuthMode",
    "directStaticAssets",
    "directHlsDash",
    "multiLinkCopyPanelEnabled",
    "dashboardShowD1WriteHotspot",
    "dashboardShowKvD1Status",
    "sourceDirectNodes",
    "dnsDefaultFallbackCname",
    "defaultHostPrefixCnameTarget",
    "pingTimeout",
    "pingCacheMinutes",
    "hedgeFailoverEnabled",
    "hedgeProbePreferGet",
    "hedgeProbePath",
    "hedgeProbeTimeoutMs",
    "hedgeProbeParallelism",
    "hedgeWaitTimeoutMs",
    "hedgeLockTtlMs",
    "hedgePreferredTtlSec",
    "hedgeFailureCooldownSec",
    "hedgeWakeJitterMs",
    "upstreamTimeoutMs",
    "upstreamRetryAttempts",
    "geoAllowlist",
    "geoBlocklist",
    "ipBlacklist",
    "rateLimitRpm",
    "cacheTtlImages",
    "corsOrigins",
    "logEnabled",
    "logSearchMode",
    "logWriteMode",
    "logWriteClientIp",
    "logWriteColo",
    "logWriteUa",
    "logDisplayClientIp",
    "logDisplayColo",
    "logDisplayUa",
    "logWriteImagePoster",
    "logWriteMediaMetadata",
    "logRetentionDays",
    "logWriteDelayMinutes",
    "logFlushCountThreshold",
    "logBatchChunkSize",
    "logBatchRetryCount",
    "logBatchRetryBackoffMs",
    "scheduledLeaseMs",
    "scheduleUtcOffsetMinutes",
    "tgDailyReportEnabled",
    "tgDailyReportSummaryEnabled",
    "tgDailyReportKvEnabled",
    "tgDailyReportD1Enabled",
    "tgDailyReportClockTimes",
    "tgBotToken",
    "tgChatId",
    "tgAlertDroppedBatchThreshold",
    "tgAlertFlushRetryThreshold",
    "tgAlertOnScheduledFailure",
    "tgAlertKvUsageEnabled",
    "tgAlertKvUsageThresholdPercent",
    "tgAlertD1UsageEnabled",
    "tgAlertD1UsageThresholdPercent",
    "tgAlertCooldownMinutes",
    "jwtExpiryDays",
    "cfAccountId",
    "cfZoneId",
    "cfApiToken",
    "cfKvNamespaceId",
    "cfD1DatabaseId",
    "cfQuotaPlanCacheMinutes",
    "tmdbApiReadToken",
    "tmdbApiV3Key",
    "tmdbLanguage",
    "todbApiKey"
  ],
  aliasFields: {},
  trimFields: [
    "tgBotToken",
    "tgChatId",
    "cfAccountId",
    "cfZoneId",
    "cfApiToken",
    "cfKvNamespaceId",
    "cfD1DatabaseId",
    "tmdbApiReadToken",
    "tmdbApiV3Key",
    "tmdbLanguage",
    "todbApiKey",
    "indexUrl",
    "cfQuotaPlanOverride",
    "corsOrigins",
    "geoAllowlist",
    "geoBlocklist",
    "ipBlacklist",
    "dnsDefaultFallbackCname",
    "defaultHostPrefixCnameTarget",
    "prewarmDepth",
    "hedgeProbePath",
    "logSearchMode",
    "logWriteMode",
    "routingDecisionMode",
    "protocolStrategy",
    "defaultPlaybackInfoMode",
    "defaultRealClientIpMode",
    "defaultMediaAuthMode"
  ],
  arrayNormalizers: { sourceDirectNodes: "nodeNameList" },
  integerFields: {
    logRetentionDays: {
      fallback: $.Defaults.LogRetentionDays,
      min: 1,
      max: $.Defaults.LogRetentionDaysMax
    },
    logFlushCountThreshold: {
      fallback: $.Defaults.LogFlushCountThreshold,
      min: 1,
      max: 5e3
    },
    logBatchChunkSize: {
      fallback: $.Defaults.LogBatchChunkSize,
      min: 1,
      max: 100
    },
    logBatchRetryCount: {
      fallback: $.Defaults.LogBatchRetryCount,
      min: 0,
      max: 5
    },
    logBatchRetryBackoffMs: {
      fallback: $.Defaults.LogBatchRetryBackoffMs,
      min: 0,
      max: 5e3
    },
    scheduledLeaseMs: {
      fallback: $.Defaults.ScheduledLeaseMs,
      min: $.Defaults.ScheduledLeaseMinMs,
      max: 900 * 1e3
    },
    uiRadiusPx: {
      fallback: $.Defaults.UiRadiusPx,
      min: 0,
      max: 48
    },
    tgAlertDroppedBatchThreshold: {
      fallback: $.Defaults.TgAlertDroppedBatchThreshold,
      min: 0,
      max: 5e3
    },
    tgAlertFlushRetryThreshold: {
      fallback: $.Defaults.TgAlertFlushRetryThreshold,
      min: 0,
      max: 10
    },
    tgAlertKvUsageThresholdPercent: {
      fallback: $.Defaults.TgAlertKvUsageThresholdPercent,
      min: 1,
      max: 100
    },
    tgAlertD1UsageThresholdPercent: {
      fallback: $.Defaults.TgAlertD1UsageThresholdPercent,
      min: 1,
      max: 100
    },
    tgAlertCooldownMinutes: {
      fallback: $.Defaults.TgAlertCooldownMinutes,
      min: 1,
      max: 1440
    },
    cacheTtlImages: {
      fallback: $.Defaults.CacheTtlImagesDays,
      min: 0,
      max: 365
    },
    pingTimeout: {
      fallback: $.Defaults.PingTimeoutMs,
      min: 1e3,
      max: 18e4
    },
    pingCacheMinutes: {
      fallback: $.Defaults.PingCacheMinutes,
      min: 0,
      max: 1440
    },
    hedgeProbeTimeoutMs: {
      fallback: $.Defaults.HedgeProbeTimeoutMs,
      min: 250,
      max: 1e4
    },
    hedgeProbeParallelism: {
      fallback: $.Defaults.HedgeProbeParallelism,
      min: 1,
      max: 2
    },
    hedgeWaitTimeoutMs: {
      fallback: $.Defaults.HedgeWaitTimeoutMs,
      min: 250,
      max: 1e4
    },
    hedgeLockTtlMs: {
      fallback: $.Defaults.HedgeLockTtlMs,
      min: 1e3,
      max: 1e4
    },
    hedgePreferredTtlSec: {
      fallback: $.Defaults.HedgePreferredTtlSec,
      min: 30,
      max: 3600
    },
    hedgeFailureCooldownSec: {
      fallback: $.Defaults.HedgeFailureCooldownSec,
      min: 1,
      max: 300
    },
    hedgeWakeJitterMs: {
      fallback: $.Defaults.HedgeWakeJitterMs,
      min: 0,
      max: 1e3
    },
    cfQuotaPlanCacheMinutes: {
      fallback: $.Defaults.CfQuotaPlanCacheMinutes,
      min: 1,
      max: 1440
    },
    upstreamTimeoutMs: {
      fallback: $.Defaults.UpstreamTimeoutMs,
      min: 0,
      max: 18e4
    },
    upstreamRetryAttempts: {
      fallback: $.Defaults.UpstreamRetryAttempts,
      min: 0,
      max: 3
    },
    prewarmCacheTtl: {
      fallback: $.Defaults.PrewarmCacheTtl,
      min: 0,
      max: 3600
    },
    prewarmPrefetchBytes: {
      fallback: $.Defaults.PrewarmPrefetchBytes,
      min: 0,
      max: Zo
    },
    playbackInfoCacheTtlSec: {
      fallback: $.Defaults.PlaybackInfoCacheTtlSec,
      min: 0,
      max: 60
    },
    videoProgressForwardIntervalSec: {
      fallback: $.Defaults.VideoProgressForwardIntervalSec,
      min: 0,
      max: 60
    },
    scheduleUtcOffsetMinutes: {
      fallback: $.Defaults.ScheduleUtcOffsetMinutes,
      min: -720,
      max: 840
    }
  },
  numberFields: { logWriteDelayMinutes: {
    fallback: $.Defaults.LogFlushDelayMinutes,
    min: 0,
    max: 1440
  } },
  booleanTrueFields: [
    "protocolFallback",
    "enablePrewarm",
    "playbackInfoCacheEnabled",
    "videoProgressForwardEnabled",
    "hedgeProbePreferGet",
    "logEnabled",
    "logWriteClientIp",
    "logWriteColo",
    "logWriteUa",
    "logDisplayClientIp",
    "logDisplayColo",
    "logDisplayUa"
  ],
  booleanFalseFields: [
    "tgAlertOnScheduledFailure",
    "tgAlertKvUsageEnabled",
    "tgAlertD1UsageEnabled",
    "tgDailyReportEnabled",
    "tgDailyReportSummaryEnabled",
    "tgDailyReportKvEnabled",
    "tgDailyReportD1Enabled",
    "directStaticAssets",
    "directHlsDash",
    "multiLinkCopyPanelEnabled",
    "dashboardShowD1WriteHotspot",
    "dashboardShowKvD1Status",
    "enableHostPrefixProxy",
    "hedgeFailoverEnabled",
    "disablePrewarmPrefetch",
    "logWriteImagePoster",
    "logWriteMediaMetadata"
  ]
};
function Gf(o = {}, e = {}) {
  for (const [t, r] of Object.entries(e.aliasFields || {}))
    if (!(o[t] !== void 0 && o[t] !== null) && Array.isArray(r)) {
      for (const a of r)
        if (!(o[a] === void 0 || o[a] === null)) {
          o[t] = o[a];
          break;
        }
    }
  return o;
}
function Vf(o = {}, e = {}) {
  const t = Array.isArray(e.allowedFields) ? e.allowedFields : [];
  if (!t.length) return o;
  const r = {};
  for (const a of t)
    Object.prototype.hasOwnProperty.call(o, a) && (r[a] = o[a]);
  return r;
}
function jf(o = {}, e = kc, t = {}) {
  let r = o && typeof o == "object" && !Array.isArray(o) ? { ...o } : {};
  r = Gf(r, e);
  for (const a of e.trimFields || [])
    r[a] === void 0 || r[a] === null || (r[a] = String(r[a]).trim());
  for (const [a, n] of Object.entries(e.arrayNormalizers || {}))
    Array.isArray(r[a]) && n === "nodeNameList" && typeof t.normalizeNodeNameList == "function" && (r[a] = t.normalizeNodeNameList(r[a]));
  for (const [a, n] of Object.entries(e.integerFields || {})) r[a] = fe(r[a], n.fallback, n.min, n.max);
  for (const [a, n] of Object.entries(e.numberFields || {})) r[a] = Yl(r[a], n.fallback, n.min, n.max);
  for (const a of e.booleanTrueFields || []) r[a] = r[a] !== !1;
  for (const a of e.booleanFalseFields || []) r[a] = r[a] === !0;
  return Vf(r, e);
}
function Hc(o = {}) {
  const e = o && typeof o == "object" && !Array.isArray(o) ? o : {}, t = { ...e };
  let r = !1;
  const a = [], n = [], s = {};
  for (const c of Vs)
    Object.prototype.hasOwnProperty.call(e, c) && a.push(c);
  const i = (c, l) => {
    const u = String(c || "").trim(), d = String(l || "").trim();
    !u || !d || (n.push(d), s[u] || (s[u] = []), s[u].push(d));
  };
  if (!Object.prototype.hasOwnProperty.call(t, "sourceDirectNodes")) {
    for (const c of Fc)
      if (Object.prototype.hasOwnProperty.call(e, c)) {
        t.sourceDirectNodes = Et(e[c]), r = !0, i(c, "sourceDirectNodes");
        break;
      }
  }
  if (!Object.prototype.hasOwnProperty.call(t, "logWriteClientIp") && Reflect.get(e, "logIncludeClientIp") !== void 0 && (t.logWriteClientIp = e.logIncludeClientIp !== !1, r = !0, i("logIncludeClientIp", "logWriteClientIp")), !Object.prototype.hasOwnProperty.call(t, "logDisplayClientIp") && Reflect.get(e, "logIncludeClientIp") !== void 0 && (t.logDisplayClientIp = e.logIncludeClientIp !== !1, r = !0, i("logIncludeClientIp", "logDisplayClientIp")), !Object.prototype.hasOwnProperty.call(t, "logWriteColo") && Reflect.get(e, "logIncludeColo") !== void 0 && (t.logWriteColo = e.logIncludeColo !== !1, r = !0, i("logIncludeColo", "logWriteColo")), !Object.prototype.hasOwnProperty.call(t, "logDisplayColo") && Reflect.get(e, "logIncludeColo") !== void 0 && (t.logDisplayColo = e.logIncludeColo !== !1, r = !0, i("logIncludeColo", "logDisplayColo")), !Object.prototype.hasOwnProperty.call(t, "logWriteUa") && Reflect.get(e, "logIncludeUa") !== void 0 && (t.logWriteUa = e.logIncludeUa !== !1, r = !0, i("logIncludeUa", "logWriteUa")), !Object.prototype.hasOwnProperty.call(t, "logDisplayUa") && Reflect.get(e, "logIncludeUa") !== void 0 && (t.logDisplayUa = e.logIncludeUa !== !1, r = !0, i("logIncludeUa", "logDisplayUa")), !Object.prototype.hasOwnProperty.call(t, "protocolStrategy")) {
    let c = !1;
    for (const l of Uc)
      Object.prototype.hasOwnProperty.call(e, l) && (i(l, "protocolStrategy"), c = !0);
    c && (t.protocolStrategy = rs(e), r = !0);
  }
  Object.prototype.hasOwnProperty.call(t, "defaultPlaybackInfoMode") || (Reflect.get(e, "playbackInfoAutoProxy") !== void 0 ? (t.defaultPlaybackInfoMode = mn(e), r = !0, i("playbackInfoAutoProxy", "defaultPlaybackInfoMode")) : Reflect.get(e, "playbackInfoBlockWangpanProxy") !== void 0 && (t.defaultPlaybackInfoMode = mn(e), r = !0, i("playbackInfoBlockWangpanProxy", "defaultPlaybackInfoMode"))), Object.prototype.hasOwnProperty.call(t, "tgDailyReportClockTimes") || (t.tgDailyReportClockTimes = Ot(Object.prototype.hasOwnProperty.call(e, "tgDailyReportTime") ? e.tgDailyReportTime : e.tgDailyReportClockTimes, $.Defaults.TgDailyReportClockTimes), Object.prototype.hasOwnProperty.call(e, "tgDailyReportTime") && (r = !0, i("tgDailyReportTime", "tgDailyReportClockTimes")));
  for (const c of Vs)
    Object.prototype.hasOwnProperty.call(t, c) && (delete t[c], r = !0);
  return {
    config: t,
    migrated: r,
    legacyKeysPresent: ir(a),
    deletedLegacyFieldCount: ir(a).length,
    migratedConfigKeys: ir(n),
    migratedKeyMap: Object.fromEntries(Object.entries(s).map(([c, l]) => [c, ir(l)]))
  };
}
function $c(o = "") {
  return String(o || "").trim().toLowerCase() === "claude" ? "claude" : $.Defaults.AdminUiSkin;
}
function ce(o = {}) {
  const { config: e } = Hc(o && typeof o == "object" && !Array.isArray(o) ? o : {});
  return Bc(e);
}
function Bc(o = {}) {
  const e = jf({
    ...o,
    defaultPlaybackInfoMode: Ta(o, "defaultPlaybackInfoMode") ? Reflect.get(o, "defaultPlaybackInfoMode") : mn(o),
    protocolStrategy: Ta(o, "protocolStrategy") ? Reflect.get(o, "protocolStrategy") : rs(o)
  }, kc, { normalizeNodeNameList: Et });
  e.prewarmDepth = Pc(e.prewarmDepth), e.hedgeProbePath = Ka(e.hedgeProbePath, $.Defaults.HedgeProbePath), e.dnsDefaultFallbackCname = Bf(e.dnsDefaultFallbackCname), e.defaultHostPrefixCnameTarget = Zt(e.defaultHostPrefixCnameTarget), e.settingsExperienceMode = String(e.settingsExperienceMode || "").trim().toLowerCase() === "expert" ? "expert" : "novice", Object.prototype.hasOwnProperty.call(e, "adminUiSkin") && (e.adminUiSkin = $c(e.adminUiSkin)), e.cfQuotaPlanOverride = ss(e.cfQuotaPlanOverride), e.logSearchMode = xc(e.logSearchMode), e.logWriteMode = os(e.logWriteMode), e.routingDecisionMode = $r(e.routingDecisionMode), e.protocolStrategy = Ec(e.protocolStrategy), e.defaultPlaybackInfoMode = Qt(e.defaultPlaybackInfoMode), e.defaultRealClientIpMode = Wo(e.defaultRealClientIpMode), e.defaultMediaAuthMode = Bi(e.defaultMediaAuthMode), e.scheduleUtcOffsetMinutes = Fe(e.scheduleUtcOffsetMinutes), e.tgDailyReportClockTimes = Ot(e.tgDailyReportClockTimes, $.Defaults.TgDailyReportClockTimes);
  const t = rt(e.indexUrl);
  return e.indexUrl = t ? Qr(t) : "", af(e, o), e;
}
var Kc = [
  "cfApiToken",
  "tgBotToken",
  "tmdbApiReadToken",
  "tmdbApiV3Key",
  "todbApiKey"
];
function js(o = {}) {
  const e = ce(o);
  for (const t of Kc) delete e[t];
  return e;
}
function Dt(o = {}) {
  return ce(o);
}
function zc(o = {}, e = {}) {
  const t = H(o) ? { ...o } : {}, r = ce(e);
  for (const a of Kc)
    Object.prototype.hasOwnProperty.call(t, a) || String(r[a] || "").length > 0 && (t[a] = r[a]);
  return !Object.prototype.hasOwnProperty.call(t, "adminUiSkin") && r.adminUiSkin && (t.adminUiSkin = r.adminUiSkin), t;
}
function qn(o = {}, e = {}) {
  const t = zc(o, e), r = rt(ce(e).indexUrl);
  return t.indexUrl = r ? Qr(r) : "", t;
}
function qf(o = "", e = {}) {
  const t = String(o || "").trim();
  if (!t) return;
  const r = t.split(".").pop() || "", a = ie(re(ce(e)));
  if (r !== a)
    throw Ie("CONFIG_REVISION_CONFLICT", "配置版本已变化，请刷新设置后重新提交", 409, {
      expectedRevision: t,
      currentHash: a
    });
}
function Xf(o = {}) {
  const e = Hc(o);
  return {
    cleanedConfig: Bc(e.config),
    legacyKeysPresent: e.legacyKeysPresent,
    deletedLegacyFieldCount: e.deletedLegacyFieldCount,
    migratedConfigKeys: e.migratedConfigKeys,
    migratedKeyMap: e.migratedKeyMap
  };
}
function Gt(o = "", e = "") {
  const t = String(o || "").trim() || "empty";
  return `${String(e || "").trim() || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()}.${t}`;
}
function So(o, e = {}) {
  const t = ie(re(o)), r = String(e.updatedAt || "").trim() || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString();
  return {
    ...e,
    hash: t,
    updatedAt: r,
    revision: Gt(t, r)
  };
}
function Yf(o = {}, e = {}) {
  const t = ce(o), r = ce(e), a = [.../* @__PURE__ */ new Set([...Object.keys(t), ...Object.keys(r)])].sort(), n = [];
  for (const s of a)
    re(t[s]) !== re(r[s]) && n.push({
      key: s,
      previousValue: t[s],
      nextValue: r[s]
    });
  return n;
}
function Jf(o = [], e = 20) {
  const t = Math.max(1, Number(e) || 20);
  return [...new Set((Array.isArray(o) ? o : [o]).map((r) => String(r ?? "").trim()).filter(Boolean))].slice(0, t);
}
function yt(o = "", e = "", t = [], r = {}) {
  const a = Jf(t, r.limit), n = Number(r.count), s = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : a.length, i = String(r.note || "").trim();
  return {
    key: String(o || "").trim(),
    label: String(e || "").trim(),
    count: s,
    countIsLowerBound: r.countIsLowerBound === !0,
    samples: a,
    truncated: s > a.length,
    note: i
  };
}
function Ae(o, e, t = "", r = "", a = [], n = 0, s = "") {
  return e && o.push(yt(t, r, a, {
    count: n,
    note: s
  })), o;
}
function Qf(o = {}) {
  const e = [], t = ir(o.configFieldTargets || []);
  if (t.length > 0) {
    const i = [];
    o.sourceDirectNodesFromLegacyNodes === !0 && i.push("包含节点遗留直连标记折叠进 sourceDirectNodes"), e.push(yt("config_current_fields", "全局设置当前字段", t, {
      count: t.length,
      note: i.join("；") || "会把旧版配置别名收敛到当前 schema。"
    }));
  }
  const r = Math.max(0, Math.floor(Number(o.migratedTopLevelPortNodeCount) || 0)), a = Math.max(0, Math.floor(Number(o.migratedLinePortCount) || 0)), n = Math.max(0, Math.floor(Number(o.migratedDefaultPortNodeCount) || 0)), s = Math.max(0, Math.floor(Number(o.migratedDefaultPortLineCount) || 0));
  if (r > 0 || a > 0 || n > 0 || s > 0) {
    const i = [];
    r > 0 && i.push(`旧版顶层 node.port 节点 ${r} 个`), a > 0 && i.push(`旧版 lines[].port 线路 ${a} 条`), n > 0 && i.push(`隐式默认端口节点 ${n} 个`), s > 0 && i.push(`按协议补齐默认端口线路 ${s} 条`), e.push(yt("node_current_fields", "节点当前字段", ["lines[].target"], {
      count: 1,
      note: `会把端口统一收敛到当前字段。${i.join("，")}。`
    }));
  }
  return e;
}
function Zf(o = []) {
  return (Array.isArray(o) ? o : []).map((e) => e?.name || e?.id);
}
async function Oe(o, e, t = {}) {
  if (!o) return null;
  const r = String(e || "").trim(), a = H(t) ? t : {};
  try {
    return Object.prototype.hasOwnProperty.call(a, "type") ? await o.get(r, { type: a.type }) : await o.get(r);
  } catch (n) {
    throw Ui("get", { key: r }, ue(n));
  }
}
async function em(o, e = {}) {
  if (!o || typeof o.list != "function") return {
    keys: [],
    list_complete: !0,
    cursor: ""
  };
  const t = H(e) ? e : {}, r = String(t.prefix || "").trim(), a = String(t.cursor || "").trim();
  try {
    return a ? await o.list({
      prefix: r,
      cursor: a
    }) : await o.list({ prefix: r });
  } catch (n) {
    throw Ui("list", { prefix: r }, ue(n));
  }
}
var tm = "sys:theme";
function Wc(o, e = {}) {
  const t = String(o || "").trim(), r = t.toLowerCase(), a = String(e.zoneId || "").trim(), n = {
    status: "CF 查询失败",
    hint: "Cloudflare 查询失败，请检查 Zone ID、API 令牌与资源范围",
    detail: t || (a ? `当前查询的 Zone ID: ${a}` : "")
  };
  return t ? r.includes("unknown field") || r.includes("unknown enum") || r.includes("error parsing args") ? {
    status: "Schema 不兼容",
    hint: "当前账号可用的 GraphQL schema 与脚本查询字段不一致",
    detail: t
  } : r.includes("cf_graphql_http_429") || r.includes("rate limit") || r.includes("too many requests") ? {
    status: "请求过于频繁",
    hint: "Cloudflare GraphQL 已限流，请稍后再试",
    detail: t
  } : r.includes("invalid token") || r.includes("authentication") || r.includes("cf_graphql_http_401") ? {
    status: "令牌无效",
    hint: "Cloudflare API 令牌无效，或未启用 GraphQL Analytics 访问",
    detail: t
  } : r.includes("not authorized") || r.includes("permission") || r.includes("forbidden") || r.includes("unauthorized") || r.includes("cf_graphql_http_403") ? {
    status: "权限或范围不匹配",
    hint: "令牌权限不足，或 Account / Zone Resources 未覆盖当前查询",
    detail: t + (a ? ` | Zone ID: ${a}` : "")
  } : r.includes("zone") && (r.includes("not found") || r.includes("invalid") || r.includes("unknown")) ? {
    status: "Zone ID 无效",
    hint: "Zone ID 无效，或当前令牌无法访问这个 Zone",
    detail: t + (a ? ` | Zone ID: ${a}` : "")
  } : r.includes("cf_graphql_http_400") ? {
    status: "请求参数无效",
    hint: "GraphQL 请求参数无效，请检查 Zone ID 与筛选条件",
    detail: t + (a ? ` | Zone ID: ${a}` : "")
  } : n : n;
}
async function Gc(o) {
  return ce(await o.get("sys:theme", { type: "json" }) || {});
}
async function we(o) {
  const e = Ft(o);
  if (!e) return {};
  const t = ia(o), r = xn(o), a = r.ConfigCache;
  if (a?.exp > B() && a.data) return a.data;
  const n = r.RuntimeConfigCacheGeneration;
  return await Pn(r.SingleFlightTasks, mt([
    "runtime_config",
    t,
    n
  ]), async () => {
    const s = r.ConfigCache;
    if (s?.exp > B() && s.data) return s.data;
    const i = s?.data && typeof s.data == "object" ? s.data : a?.data && typeof a.data == "object" ? a.data : null;
    let c = i || {};
    try {
      c = await Gc(e);
    } catch (l) {
      const u = i && typeof i == "object";
      Le("runtime_config.load_failed", l, {
        cacheNamespace: t,
        configKey: tm,
        usedCachedConfig: u === !0
      }), c = u ? i : ce({});
    }
    return r.RuntimeConfigCacheGeneration === n && (r.ConfigCache = {
      data: c,
      exp: B() + $.Defaults.CacheTTL,
      namespace: t
    }), c;
  });
}
async function me(o) {
  const e = Ft(o);
  return e ? await Gc(e) : {};
}
function rm(o = {}, e = {}) {
  const { indexRepository: t } = o;
  async function r(f, m, p, h = ze(m), g = null) {
    const y = H(g) ? ce(g) : ce(await me(m)), _ = await t.getAdminActiveIndexRecord(t.getKV(m)), S = _ ? ce({
      ...y,
      indexUrl: _.sourceUrl
    }) : y;
    if (e.isAdminIndexSetupForced(f)) return e.renderAdminIndexSetupPage(f, m, p, h, S, "manual_setup_requested");
    const E = _t(m, S);
    if (!E.indexUrl) {
      try {
        const T = await e.renderBundledAdminPage(f, m, p, h, S);
        if (T) return T;
      } catch (T) {
        return Le("admin.bundled_shell_render", T, { path: new URL(f.url).pathname }), e.renderAdminIndexSetupPage(f, m, p, h, S, "bundled_shell_render_failed");
      }
      return e.renderAdminIndexSetupPage(f, m, p, h, S);
    }
    const b = E.indexUrl;
    if (b) try {
      const T = await e.renderRemoteAdminPage(f, m, p, h, b, S);
      if (T) return T;
    } catch (T) {
      return Le("admin.remote_shell_render", T, {
        path: new URL(f.url).pathname,
        remoteShellIndexUrl: b
      }), e.renderAdminRemoteShellErrorPage(f, m, p, h, {
        indexState: E,
        remoteShellIndexUrl: b,
        sourceType: "remote_error",
        routeState: "remote_error",
        remoteCacheState: "bypassed",
        lastFetchStatus: "failed",
        reason: `remote_shell_render_failed: ${String(T?.message || T || "unknown_error").trim()}`
      }, S);
    }
    return e.renderAdminIndexSetupPage(f, m, p, h, S, "index_url_not_configured");
  }
  async function a(f = [], m) {
    const p = Array.isArray(f) ? f : [];
    if (typeof m != "function" || p.length === 0) return [];
    const h = Array.from({ length: p.length });
    let g = 0;
    const y = async () => {
      for (; g < p.length; ) {
        const _ = g;
        g += 1, h[_] = await m(p[_], _);
      }
    };
    return await Promise.all(Array.from({ length: Math.min(e.ADMIN_WARM_VENDOR_CONCURRENCY, p.length) }, () => y())), h;
  }
  function n(f) {
    return new Request(f, {
      method: "HEAD",
      headers: { Accept: "*/*" },
      cache: "no-store"
    });
  }
  function s(f) {
    return f?.ok === !0 || Number(f?.status) === 304;
  }
  async function i(f, m, p = ze(m), h = null) {
    const g = H(h) ? ce(h) : ce(await me(m)), y = _t(m, g);
    if (!y.indexUrl) return z("ADMIN_INDEX_NOT_CONFIGURED", "管理台 index.html 尚未配置", 409);
    const _ = [], S = { waitUntil(D) {
      _.push(Promise.resolve(D));
    } }, E = ft(m), b = new URL(f.url);
    b.pathname = E, b.search = "";
    const T = await e.renderRemoteAdminPage(n(b), m, S, p, y.indexUrl, g);
    await Promise.all(_.splice(0));
    const C = yr(), L = y.assetRevision || y.releaseTag, P = y.isLocalUpload ? await t.getAdminIndexUploadRecord(t.getKV(m), y.localUploadRevision) : null;
    let A = null;
    P?.manifest ? (A = await e.readAdminReleaseVendorManifestFromCache(C, L, y.indexUrl), A || (A = await e.cacheAdminReleaseVendorManifest(C, P.manifest, S))) : A = await e.getOrCreateAdminReleaseVendorManifest(C, L, y.indexUrl, S);
    const w = (Array.isArray(A?.entries) ? A.entries : []).filter((D) => D?.assetKey && !e.isMutableJsdelivrGithubAssetUrl(D.upstreamUrl)), R = await a(w, async (D) => {
      const U = e.buildAdminReleaseVendorProxyPath(E, L, D.assetKey), V = new URL(f.url);
      return V.pathname = U, V.search = "", e.renderAdminReleaseVendorAsset(n(V), m, S, {
        releaseTag: L,
        assetKey: D.assetKey
      }, g);
    });
    await Promise.all(_.splice(0));
    const I = R.filter((D) => !s(D)).length, x = s(T), N = JSON.stringify({
      ok: x && I === 0,
      shellStatus: Number(T?.status) || 0,
      warmedAssetCount: w.length - I,
      failedAssetCount: I
    }), F = new Headers({
      "Content-Type": "application/json;charset=UTF-8",
      "Cache-Control": "no-store, max-age=0"
    });
    return Ne(F), new Response(f.method === "HEAD" ? null : N, {
      status: x && I === 0 ? 200 : 502,
      headers: F
    });
  }
  function c(f, m = ze(f)) {
    const p = ft(f), h = m.ok ? "" : `<div class="landing-banner"><div class="landing-banner-title">系统未初始化</div><div class="landing-banner-text">缺少关键环境变量：${m.missing.map((_) => Ce(_)).join("、")}</div></div>`, g = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="/favicon.ico" sizes="any"><title>Emby Proxy V${on}</title>${e.LANDING_PAGE_STYLE_HTML}</head><body><main class="landing-shell"><section class="landing-card"><div class="landing-grid"><div class="landing-primary">${h}<div class="landing-pill">Headless Edge Relay</div><h1 class="landing-title">Emby Proxy V${on}</h1><p class="landing-text">为了极致优化视频代理性能，根路径默认只保留无头中继与说明壳；真正的管理台入口固定收口到 <span class="landing-highlight">${Ce(p)}</span>，并由 Worker 读取随部署发布或已上传的 <code>index.html</code> 返回。</p><div class="landing-actions"><a href="${Ce(p)}" class="landing-btn landing-btn-primary">访问 ${Ce(p)}</a><a href="https://github.com/axuitomo/CF-EMBY-PROXY-UI" target="_blank" rel="noopener noreferrer" class="landing-btn landing-btn-secondary">查看项目说明</a></div></div><div class="landing-side"><div class="landing-notes"><div class="landing-notes-title">Routing Notes</div><ul class="landing-note-list"><li>根路径仅提供静态说明页，不承载实时配置数据。</li><li><code>${Ce(p)}</code> 只负责返回管理台壳与 bootstrap，动态数据继续走 <code>POST ${Ce(p)}</code> API。</li><li>正式真相源固定为 <code>frontend/</code>、<code>worker.js</code> 与 <code>worker.md</code>。</li><li>媒体代理、日志与 KV / D1 逻辑保持原 Worker 主链路不变。</li></ul></div></div></div></section></main></body></html>`, y = new Headers({
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    });
    return Ne(y), y.set("X-Frame-Options", "DENY"), new Response(g, { headers: y });
  }
  function l(f, m = "/", p = 302) {
    const h = new URL(f.url);
    h.pathname = Z(m || "/"), h.search = "", h.hash = "";
    const g = new Headers({
      Location: h.toString(),
      "Cache-Control": "no-store, max-age=0"
    });
    return Ne(g), new Response(null, {
      status: p,
      headers: g
    });
  }
  async function u(f, m, p = ze(m)) {
    const h = ft(m), g = ts(m), y = mo(p), _ = ra({
      adminPath: h,
      loginPath: g,
      initHealth: p,
      contract: e.buildAdminUiContract()
    }), S = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="/favicon.ico" sizes="any"><title>Worker 管理台登录</title><style>
        :root {
          color-scheme: light;
          font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
          --bg-a: #091428;
          --bg-b: #123055;
          --panel: rgba(8, 20, 38, 0.88);
          --panel-border: rgba(148, 163, 184, 0.24);
          --text-main: #e5eefc;
          --text-muted: rgba(226, 232, 240, 0.8);
          --accent: #6ee7f9;
          --accent-strong: #2dd4bf;
          --danger-bg: rgba(248, 113, 113, 0.14);
          --danger-border: rgba(248, 113, 113, 0.3);
          --danger-text: #fecaca;
          --success-bg: rgba(74, 222, 128, 0.12);
          --success-border: rgba(74, 222, 128, 0.28);
          --success-text: #bbf7d0;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          min-height: 100vh;
          color: var(--text-main);
          background:
            radial-gradient(circle at top left, rgba(96, 165, 250, 0.32), transparent 38%),
            radial-gradient(circle at 85% 15%, rgba(45, 212, 191, 0.2), transparent 22%),
            linear-gradient(135deg, var(--bg-a), var(--bg-b));
        }
        a { color: inherit; }
        .login-shell {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 32px 20px;
        }
        .login-card {
          width: min(100%, 960px);
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid var(--panel-border);
          background: var(--panel);
          box-shadow: 0 28px 120px rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(22px);
        }
        .login-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.12fr) minmax(320px, 420px);
        }
        .login-hero {
          padding: 42px 42px 36px;
          border-right: 1px solid rgba(148, 163, 184, 0.18);
        }
        .login-form {
          padding: 42px 32px 36px;
          background: rgba(2, 6, 23, 0.18);
        }
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(229, 238, 252, 0.78);
          background: rgba(15, 23, 42, 0.36);
          border: 1px solid rgba(148, 163, 184, 0.18);
        }
        .title {
          margin: 18px 0 12px;
          font-size: clamp(32px, 5vw, 52px);
          line-height: 1.05;
        }
        .subtitle, .hint, .meta-item, .status {
          color: var(--text-muted);
          line-height: 1.7;
        }
        .meta-grid {
          margin-top: 26px;
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .meta-card {
          padding: 16px 18px;
          border-radius: 20px;
          background: rgba(15, 23, 42, 0.32);
          border: 1px solid rgba(148, 163, 184, 0.14);
        }
        .meta-label {
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(148, 163, 184, 0.88);
        }
        .meta-value {
          margin-top: 8px;
          font-size: 15px;
          color: var(--text-main);
          word-break: break-all;
        }
        .actions {
          margin-top: 26px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .action-link, .submit-btn {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.22);
          text-decoration: none;
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 600;
          transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
        }
        .action-link:hover, .submit-btn:hover { transform: translateY(-1px); }
        .action-link.primary, .submit-btn {
          background: linear-gradient(135deg, var(--accent-strong), var(--accent));
          color: #082032;
          border-color: transparent;
        }
        .action-link.secondary {
          background: rgba(15, 23, 42, 0.38);
          color: var(--text-main);
        }
        .form-panel {
          display: grid;
          gap: 18px;
        }
        .form-title {
          margin: 0;
          font-size: 24px;
          line-height: 1.2;
        }
        .field {
          display: grid;
          gap: 10px;
        }
        .field-label {
          font-size: 13px;
          color: rgba(226, 232, 240, 0.82);
        }
        .field-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          background: rgba(15, 23, 42, 0.58);
          color: var(--text-main);
          font-size: 15px;
          outline: none;
        }
        .field-input:focus {
          border-color: rgba(110, 231, 249, 0.72);
          box-shadow: 0 0 0 4px rgba(110, 231, 249, 0.14);
        }
        .submit-btn {
          width: 100%;
          cursor: pointer;
        }
        .submit-btn[disabled] {
          cursor: wait;
          opacity: 0.72;
          transform: none;
        }
        .status {
          min-height: 48px;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          background: rgba(15, 23, 42, 0.36);
          font-size: 14px;
        }
        .status.is-error {
          color: var(--danger-text);
          background: var(--danger-bg);
          border-color: var(--danger-border);
        }
        .status.is-success {
          color: var(--success-text);
          background: var(--success-bg);
          border-color: var(--success-border);
        }
        .hint {
          font-size: 13px;
          margin: 0;
        }
        .noscript {
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid var(--danger-border);
          background: var(--danger-bg);
          color: var(--danger-text);
          font-size: 13px;
          line-height: 1.7;
        }
        @media (max-width: 860px) {
          .login-grid { grid-template-columns: 1fr; }
          .login-hero { border-right: none; border-bottom: 1px solid rgba(148, 163, 184, 0.18); padding: 34px 24px 24px; }
          .login-form { padding: 28px 24px 30px; }
          .meta-grid { grid-template-columns: 1fr; }
        }
      </style></head><body><main class="login-shell"><section class="login-card"><div>${y}</div><div class="login-grid"><section class="login-hero"><div class="eyebrow">Worker Admin Access</div><h1 class="title">登录管理台壳层</h1><p class="subtitle">这个入口只负责建立 Worker 的同源登录态。登录成功后会直接返回主控制台，后续的节点治理、日志诊断、DNS/IP 池与发布操作继续复用同一份 Cookie。</p><div class="meta-grid"><article class="meta-card"><div class="meta-label">Admin Path</div><div class="meta-value">${Ce(h)}</div></article><article class="meta-card"><div class="meta-label">Login Endpoint</div><div class="meta-value">POST ${Ce(g)}</div></article><article class="meta-card"><div class="meta-label">Init Health</div><div class="meta-value">${p.ok ? "已通过" : `未通过：${Ce((Array.isArray(p.missing) ? p.missing : []).join(" / ") || "请检查环境变量")}`}</div></article><article class="meta-card"><div class="meta-label">Current Mode</div><div class="meta-value">独立登录壳，不再复用 /admin 远端 shell</div></article></div><div class="actions"><a href="${Ce(h)}" class="action-link secondary">返回管理台</a><a href="/" class="action-link primary">回到根路径说明页</a></div></section><section class="login-form"><form id="admin-login-form" class="form-panel" action="${Ce(g)}" method="post" novalidate><div><p class="form-title">输入管理密码</p><p class="hint">页面会继续调用已有的 <code>POST ${Ce(g)}</code> JSON 登录接口，不会新增第二套鉴权协议。</p></div><label class="field" for="admin-login-password"><span class="field-label">管理密码</span><input id="admin-login-password" name="password" type="password" class="field-input" autocomplete="current-password" placeholder="请输入 ADMIN_PASS" required /></label><button id="admin-login-submit" type="submit" class="submit-btn">登录并进入控制台</button><div id="admin-login-status" class="status" role="status" aria-live="polite">等待输入密码。登录成功后会跳转到 ${Ce(h)}。</div></form><noscript><div class="noscript">当前登录壳需要浏览器启用 JavaScript，因为 Worker 现阶段继续复用原有 JSON 登录接口来写入 Cookie。</div></noscript></section></div></section></main><script>
        const ADMIN_LOGIN_RUNTIME = ${_};
        const form = document.getElementById("admin-login-form");
        const passwordInput = document.getElementById("admin-login-password");
        const submitButton = document.getElementById("admin-login-submit");
        const statusNode = document.getElementById("admin-login-status");

        function updateStatus(message, tone) {
          if (!statusNode) return;
          statusNode.textContent = message || "";
          statusNode.classList.remove("is-error", "is-success");
          if (tone === "error") statusNode.classList.add("is-error");
          if (tone === "success") statusNode.classList.add("is-success");
        }

        form?.addEventListener("submit", async (event) => {
          event.preventDefault();
          const password = String(passwordInput?.value || "");
          if (!password) {
            updateStatus("请输入管理密码。", "error");
            passwordInput?.focus();
            return;
          }
          if (submitButton) submitButton.disabled = true;
          updateStatus("正在验证密码并建立 Cookie 会话...", "");
          try {
            const response = await fetch(ADMIN_LOGIN_RUNTIME.loginPath, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              credentials: "same-origin",
              body: JSON.stringify({ password })
            });
            const payload = await response.json().catch(() => ({}));
            if (response.ok && payload && payload.ok === true) {
              updateStatus("登录成功，正在进入控制台...", "success");
              void fetch((ADMIN_LOGIN_RUNTIME.adminPath || "/admin").replace(/\\/+$/, "") + "/__warm", {
                method: "HEAD",
                credentials: "same-origin",
                cache: "no-store",
                keepalive: true
              }).catch(() => null);
              window.location.assign(ADMIN_LOGIN_RUNTIME.adminPath || "/admin");
              return;
            }
            const baseErrorMessage = payload?.error?.message || payload?.message || (response.status ? ("登录失败（HTTP " + response.status + "）") : "登录失败");
            const remainingAttempts = Number.isFinite(Number(payload?.remain))
              ? Math.max(0, Number(payload.remain))
              : null;
            const errorMessage = remainingAttempts === null
              ? baseErrorMessage
              : remainingAttempts > 0
                ? baseErrorMessage + "，还可尝试 " + remainingAttempts + " 次。"
                : baseErrorMessage + "，已达到失败次数上限，请稍后重试。";
            updateStatus(errorMessage, "error");
          } catch (error) {
            updateStatus(error?.message ? ("登录请求失败：" + error.message) : "登录请求失败，请稍后重试。", "error");
          } finally {
            if (submitButton) submitButton.disabled = false;
          }
        });

        passwordInput?.focus();
      <\/script></body></html>`;
    return new Response(f?.method === "HEAD" ? null : S, { headers: e.buildAdminHtmlResponseHeaders("", "no-store, max-age=0") });
  }
  function d(f, m, p = 200, h = {}) {
    const g = new Headers(f);
    return Ne(g), h.mergeOriginVary === !0 && g.get("Access-Control-Allow-Origin") !== "*" && Vr(g, "Origin"), new Response(m, {
      status: p,
      headers: g
    });
  }
  return {
    renderAdminPage: r,
    warmAdminReleaseVendorEntries: a,
    buildAdminWarmSubrequest: n,
    isAdminWarmResponseSuccessful: s,
    renderAdminWarmResponse: i,
    renderLandingPage: c,
    buildRequestPathRedirectResponse: l,
    renderAdminLoginPage: u,
    buildEdgeCorsResponse: d
  };
}
function is(o = "") {
  return /(?:^|\/)smartstrm(?:$|[/?])/i.test(String(o || ""));
}
function Na(o = "") {
  return pn(o) || /\/audio\/[^/]+(?:\/|$)/i.test(String(o || "")) || /\/livetv\/[^/]+(?:\/|$)/i.test(String(o || "")) || is(o);
}
function am(o = "") {
  const e = String(o || "").trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(e) || e.startsWith("//");
}
function Vc(o = "") {
  return /\/playbackinfo(?:$|[/?])/i.test(String(o || ""));
}
function pn(o = "") {
  const e = Z(o);
  return Vc(e) || is(e) || Tt.test(e) || pc.test(e) ? !0 : /\/videos\/[^/]+\/(?:stream|original|download|file)\b/i.test(e) || /\/items\/[^/]+\/download\b/i.test(e);
}
function jc(o = "") {
  return /\/sessions\/playing\/progress(?:$|[/?])/i.test(String(o || ""));
}
function qc(o = "") {
  return /\/sessions\/playing\/stopped(?:$|[/?])/i.test(String(o || ""));
}
function nm(o = "") {
  return /\/sessions\/playing\/ping(?:$|[/?])/i.test(String(o || ""));
}
function om(o = "") {
  const e = String(o || "");
  return jc(e) || qc(e) || nm(e) ? !1 : /\/sessions\/playing(?:\/started)?(?:$|[/?])/i.test(e);
}
function sm(o = {}, e = {}) {
  function t(r, a) {
    let n = a;
    const s = nt(r[n]);
    let i = Ic(s) === "main" ? "/" + s : "";
    for (n += 1; n < r.length; n += 1) i += "/" + nt(r[n]);
    return pn(i || "/");
  }
  return { isPlaybackCriticalSegments: t };
}
function im(o = {}) {
  const e = {};
  for (const [t, r] of Object.entries(Xd(o, e))) e[t] = r;
  for (const [t, r] of Object.entries(Yd(o, e))) e[t] = r;
  for (const [t, r] of Object.entries(Qd(o, e))) e[t] = r;
  for (const [t, r] of Object.entries(Zd(o, e))) e[t] = r;
  for (const [t, r] of Object.entries(rm(o, e))) e[t] = r;
  for (const [t, r] of Object.entries(sm(o, e))) e[t] = r;
  return e;
}
function gn(o) {
  if (!o || o === 0) return "0 B";
  const e = 1024, t = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB"
  ], r = Math.floor(Math.log(o) / Math.log(e));
  return parseFloat((o / Math.pow(e, r)).toFixed(2)) + " " + t[r];
}
var Xc = 1024 * 1024 * 1024, cm = 500 * 1024 * 1024, lm = 10 * 1024 * 1024 * 1024, cs = Object.freeze({
  planClass: "free",
  planLabel: "FREE",
  periodLabel: "今日",
  kv: {
    read: 1e5,
    write: 1e3,
    delete: 1e3,
    list: 1e3,
    storageBytes: Xc
  },
  d1: {
    rowsRead: 5e6,
    rowsWritten: 1e5,
    storageBytes: cm
  }
}), Yc = Object.freeze({
  planClass: "paid",
  planLabel: "PAID",
  periodLabel: "本月",
  kv: {
    read: 1e7,
    write: 1e6,
    delete: 1e6,
    list: 1e6,
    storageBytes: Xc
  },
  d1: {
    rowsRead: 25e9,
    rowsWritten: 5e7,
    storageBytes: lm
  }
}), um = Object.freeze({
  free: cs,
  paid: Yc
});
function Se(o) {
  const e = Number(o);
  return Number.isFinite(e) ? Math.max(0, Math.round(e)).toLocaleString("en-US") : "0";
}
function Ia(o) {
  const e = Number(o);
  return !Number.isFinite(e) || e <= 0 ? 0 : e >= 100 ? 100 : Math.max(0, Math.round(e * 10) / 10);
}
function dm(o = 0) {
  const e = Number(o);
  return !Number.isFinite(e) || e <= 0 ? "slate" : e >= 90 ? "danger" : e >= 70 ? "warning" : "success";
}
function Da(o = "") {
  return String(o || "").trim().toLowerCase() || "bundled";
}
function Jc(o = "") {
  const e = Da(o);
  return e === "standard" || e === "unbound" ? {
    ...Yc,
    usageModel: e
  } : {
    ...cs,
    usageModel: e
  };
}
function _o(o = {}) {
  const e = ss(o?.override);
  return e ? {
    ...Ma(e),
    usageModel: Da(o?.usageModel),
    override: e
  } : {
    ...Jc(o?.usageModel),
    override: ""
  };
}
function Ma(o = "free") {
  return um[String(o || "").trim().toLowerCase() === "paid" ? "paid" : "free"] || cs;
}
async function fm(o = {}) {
  const e = ce(H(o) ? o : {}), t = ss(e.cfQuotaPlanOverride);
  if (t) return _o({ override: t });
  const r = String(e.cfAccountId || "").trim(), a = String(e.cfApiToken || "").trim();
  if (!r || !a) return {
    ...Ma("free"),
    usageModel: Da("bundled"),
    override: ""
  };
  try {
    return _o({ usageModel: await rl(r, a) });
  } catch {
    return {
      ...Ma("free"),
      usageModel: Da("bundled"),
      override: ""
    };
  }
}
function mm(o = {}) {
  const e = H(o) ? o : {}, t = Math.max(1, Math.floor(Number(e.writeLimit) || 0)), r = Math.max(0, Math.floor(Number(e.estimatedPutCount) || 0)), a = Math.max(0, Math.floor(Number(e.estimatedRollbackWriteCount) || 0)), n = Math.max(0, Math.floor(Number(e.estimatedWorstCaseWriteCount) || 0)), s = Math.max(0, n - t), i = String(e.planLabel || "").trim() || "FREE", c = String(e.periodLabel || "").trim() || "今日";
  return n <= t ? "" : `KV 整理已拦截：当前 ${i} 计划 · ${c} 写入上限为 ${Se(t)}，本次预计写入 ${Se(r)} 次，最坏回滚写回 ${Se(a)} 次，最坏共 ${Se(n)} 次，超出 ${Se(s)} 次。`;
}
function pm(o = {}) {
  const e = H(o) ? o : {}, t = String(e.planLabel || "").trim() || "FREE", r = String(e.periodLabel || "").trim() || "今日", a = Math.max(1, Math.floor(Number(e.writeLimit) || 0)), n = Math.max(0, Math.floor(Number(e.estimatedPutCount) || 0)), s = Math.max(0, Math.floor(Number(e.estimatedDeleteCount) || 0)), i = Math.max(0, Math.floor(Number(e.estimatedRollbackWriteCount) || 0)), c = Math.max(0, Math.floor(Number(e.estimatedWorstCaseWriteCount) || 0));
  return `KV 配额预算：${t} 计划 · ${r}，预计 put ${Se(n)} 次，delete ${Se(s)} 次，最坏回滚写回 ${Se(i)} 次，最坏写入 ${Se(c)} / ${Se(a)}。`;
}
function gm(o = "free", e = /* @__PURE__ */ new Date()) {
  const t = String(o || "").trim().toLowerCase() === "paid" ? "paid" : "free", r = e instanceof Date ? new Date(e.getTime()) : new Date(e || Date.now()), a = r.toISOString();
  if (t === "paid") {
    const i = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth(), 1, 0, 0, 0, 0)), c = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 1, 0, 0, 0, 0));
    return {
      planClass: t,
      periodLabel: "本月",
      startIso: i.toISOString(),
      endIso: a,
      resetAtIso: c.toISOString(),
      cacheBucketKey: `${r.getUTCFullYear()}-${String(r.getUTCMonth() + 1).padStart(2, "0")}`
    };
  }
  const n = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth(), r.getUTCDate(), 0, 0, 0, 0)), s = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth(), r.getUTCDate() + 1, 0, 0, 0, 0));
  return {
    planClass: t,
    periodLabel: "今日",
    startIso: n.toISOString(),
    endIso: a,
    resetAtIso: s.toISOString(),
    cacheBucketKey: n.toISOString().slice(0, 10)
  };
}
function Wt(o, e = "cloudflare_runtime_error") {
  return String(o?.message || o || e).trim().replace(/\s+/g, " ").slice(0, 240) || e;
}
function qs(o, e = "count") {
  return e === "bytes" ? gn(Math.max(0, Number(o) || 0)) : Se(o);
}
function Xs(o = 0, e = B()) {
  const t = Math.max(0, Number(o) || 0), r = Math.max(t, Number(e) || B());
  if (t <= 0) return "";
  const a = Math.max(0, r - t);
  return a < 60 * 1e3 ? "缓存年龄：不到 1 分钟" : a < 3600 * 1e3 ? `缓存年龄：${Math.max(1, Math.round(a / (60 * 1e3)))} 分钟` : `缓存年龄：${Math.max(1, Math.round(a / (3600 * 1e3)))} 小时`;
}
function Lr({ key: o = "", label: e = "", used: t = 0, limit: r = 0, kind: a = "count" } = {}) {
  const n = Math.max(0, Number(t) || 0), s = Math.max(0, Number(r) || 0), i = s > 0 ? n / s * 100 : 0, c = Ia(i);
  return {
    key: String(o || "").trim(),
    label: String(e || "").trim(),
    usedValue: n,
    limitValue: s,
    usedText: qs(n, a),
    limitText: qs(s, a),
    percent: c,
    percentText: `${c % 1 === 0 ? Math.round(c) : c}%`,
    tone: dm(i),
    rawPercent: i
  };
}
function Ys(o = []) {
  return (Array.isArray(o) ? o : []).filter((e) => Number(e?.rawPercent) > 100).map((e) => String(e?.label || "").trim()).filter(Boolean);
}
function hn(o = {}, e = {}) {
  const t = (Array.isArray(o.metrics) ? o.metrics : []).map((r) => ({
    key: String(r?.key || "").trim(),
    label: String(r?.label || "").trim(),
    usedText: String(r?.usedText || "").trim(),
    limitText: String(r?.limitText || "").trim(),
    percent: Ia(r?.percent),
    percentText: String(r?.percentText || `${Ia(r?.percent)}%`).trim(),
    tone: String(r?.tone || "slate").trim() || "slate"
  })).filter((r) => r.key && r.label);
  return {
    title: String(o.title || e.title || "Cloudflare").trim() || "Cloudflare",
    status: String(o.status || e.status || "idle").trim() || "idle",
    summary: String(o.summary || e.summary || "暂无运行记录").trim() || "暂无运行记录",
    detail: String(o.detail || e.detail || "").trim(),
    lines: (Array.isArray(o.lines) ? o.lines : Array.isArray(e.lines) ? e.lines : []).map((r) => String(r || "").trim()).filter(Boolean),
    planLabel: String(o.planLabel || e.planLabel || "").trim(),
    periodLabel: String(o.periodLabel || e.periodLabel || "").trim(),
    resourceLabel: String(o.resourceLabel || e.resourceLabel || "").trim(),
    metrics: t
  };
}
function Nr(o = "", e = "", t = "") {
  return hn({
    title: o,
    status: "skipped",
    summary: e,
    detail: t
  });
}
function Ir(o = "", e = "", t = "") {
  return hn({
    title: o,
    status: "failed",
    summary: e,
    detail: t
  });
}
function hm(o = "", e = {}, t = 0, r = []) {
  const a = Math.max(1, Math.min(100, Math.round(Number(t) || 0))), n = e && typeof e == "object" ? e : {}, s = (Array.isArray(r) ? r : []).map((p) => ({
    label: String(p?.label || "").trim(),
    percentText: String(p?.percentText || `${Ia(p?.percent)}%`).trim()
  })).filter((p) => p.label), i = String(n.resourceLabel || "").trim() || String(o || "").trim(), c = String(n.planLabel || "").trim(), l = String(n.periodLabel || "").trim(), u = [i], d = [c, l].filter(Boolean);
  d.length > 0 && u.push(`（${d.join(" / ")}）`);
  const f = s.map((p) => `${p.label} ${p.percentText}`).join("、"), m = String(n.status || "").trim().toLowerCase() === "partial_failure" ? "（使用缓存数据）" : "";
  return `${String(o || "Cloudflare").trim() || "Cloudflare"} 使用量达到阈值：${u.join("")}，${f}（阈值 ${a}%）${m}`;
}
function Xn(o = [], e = []) {
  const t = new Set((Array.isArray(e) ? e : [e]).map((r) => String(r || "").trim()).filter(Boolean));
  for (const r of Array.isArray(o) ? o : []) {
    const a = String(r?.key || "").trim();
    if (!t.has(a)) continue;
    const n = String(r?.percentText || "").trim();
    if (n) return n;
    if (r?.percent !== void 0 && r?.percent !== null) return `${Ia(r.percent)}%`;
  }
  return "暂不可用";
}
function ym(o = {}, e = {}) {
  const t = o && typeof o == "object" ? o : {}, r = e && typeof e == "object" ? e : {}, a = String(t.requestCountDisplay || "").trim() || (t.todayRequests === null || t.todayRequests === void 0 ? "暂不可用" : String(Number(t.todayRequests) || 0)), n = String(t.todayTraffic || "").trim() || "暂不可用", s = String(t.monthlyTraffic || "").trim() || "暂不可用", i = Math.max(0, Number(t.playCount) || 0), c = Math.max(0, Number(t.infoCount) || 0);
  return [
    `📊 EMBY-PROXY每日报表${r.dateKey ? ` (${r.dateKey})` : ""}`,
    "",
    `请求数: ${a}`,
    `视频流量 (CF 总计): ${n}`,
    `本月流量 (CF 总计): ${s}`,
    `请求: 播放请求 ${Se(i)} 次 | 获取播放信息 ${Se(c)} 次`,
    "#Cloudflare #Emby #日报"
  ].map((l) => String(l || "").trim()).filter((l, u, d) => !(l === "" && (u === 0 || d[u - 1] === ""))).join(`
`);
}
function Sm(o = "", e = {}, t = {}) {
  const r = Tc(o);
  if (r === "summary") return ym(e, t);
  const a = r === "d1" ? "d1" : "kv", n = e && typeof e == "object" ? e : {}, s = t && typeof t == "object" ? t : {}, i = a === "d1" ? "D1 数据库每日消耗报告" : "KV 数据库每日消耗报告", c = a === "d1" ? "#D1" : "#KV", l = Array.isArray(n.metrics) ? n.metrics : [], u = s.dateKey ? ` (${s.dateKey})` : "", d = String(n.planLabel || "").trim(), f = String(n.periodLabel || "").trim(), m = d || f ? `${d || "未知"} 计划 X ${f || "当前"}配额` : String(n.summary || "").trim() || "暂不可用", p = Xn(l, a === "d1" ? ["rowsRead", "read"] : ["read", "rowsRead"]), h = Xn(l, a === "d1" ? ["rowsWritten", "write"] : ["write", "rowsWritten"]), g = Xn(l, ["storage"]);
  return [
    `📊 ${i}${u}`,
    `配额口径：${m}`,
    `读取使用率：${p}`,
    `写入使用率：${h}`,
    `存储使用率：${g}`,
    `#Cloudflare ${c} #日报`
  ].map((y) => String(y || "").trim()).filter((y, _, S) => !(y === "" && (_ === 0 || S[_ - 1] === ""))).join(`
`);
}
function Js(o = null, e = "") {
  const t = (Array.isArray(o?.errors) ? o.errors : []).map((a) => {
    const n = String(a?.code || "").trim(), s = String(a?.message || "").trim();
    return n && s ? `${n}: ${s}` : s || n;
  }).filter(Boolean);
  if (t.length > 0) return t.join("; ");
  const r = String(e || "").trim();
  return r ? r.replace(/\s+/g, " ").slice(0, 300) : "";
}
async function Re(o, e, t = {}) {
  const r = t && typeof t == "object" ? t : {};
  let a = {};
  const n = r?.headers;
  n && (n instanceof Headers ? a = Object.fromEntries(n.entries()) : typeof n == "object" && (a = n));
  const s = typeof FormData < "u" && r?.body instanceof FormData, i = await We(o, {
    ...r,
    headers: {
      Authorization: `Bearer ${e}`,
      ...s ? {} : { "Content-Type": "application/json" },
      ...a
    }
  }), c = await Me(i, ki);
  if (c.exceeded) throw new Error("cf_api_response_too_large");
  const l = c.text;
  let u = null;
  if (l) try {
    u = JSON.parse(l);
  } catch {
  }
  if (!i.ok) {
    const d = Number(i.status) || 0, f = Js(u, l), m = /* @__PURE__ */ new Error(f ? `cf_api_http_${d}: ${f}` : `cf_api_http_${d}`);
    throw m.status = d, m;
  }
  if (!u || typeof u != "object") return {};
  if (u?.success === !1) {
    const d = Js(u, l);
    throw new Error(d || "cf_api_error");
  }
  return u;
}
async function Qc(o, e, t) {
  const r = t && typeof t == "object" ? {
    query: e,
    variables: t
  } : { query: e }, a = await We("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${o}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(r)
  });
  if (!a.ok) throw new Error(`cf_graphql_http_${a.status}`);
  const n = await Me(a, ki);
  if (n.exceeded) throw new Error("cf_graphql_response_too_large");
  const s = JSON.parse(n.text);
  if (Array.isArray(s?.errors) && s.errors.length) throw new Error(s.errors.map((i) => i?.message).filter(Boolean).join("; ") || "cf_graphql_error");
  return s;
}
async function Zc(o, e, t, r) {
  return (await Qc(e, t, r))?.data?.viewer?.zones?.[0] || null;
}
async function Qs(o, e, t, r) {
  const a = await Zc(o, e, `
            query {
              viewer {
                zones(filter: { zoneTag: ${Ee(o)} }) {
                  series: httpRequestsAdaptiveGroups(limit: 10000, filter: { datetime_geq: ${Ee(new Date(t).toISOString())}, datetime_leq: ${Ee(new Date(r).toISOString())} }) {
                    sum { edgeResponseBytes }
                  }
                }
              }
            }`);
  if (!a) throw new Error("cf_graphql_empty_zone");
  return (Array.isArray(a.series) ? a.series : []).reduce((n, s) => n + Math.max(0, Number(s?.sum?.edgeResponseBytes) || 0), 0);
}
async function On(o, e, t, r) {
  return (await Qc(e, t, r))?.data?.viewer?.accounts?.[0] || null;
}
async function el(o, e) {
  return !o || !e ? null : (await Re(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(o).trim())}`, e))?.result || null;
}
async function tl(o, e, t = {}) {
  const r = String(o || "").trim();
  return await ge(el(r, e), String(t?.scope || "cloudflare.zone_lookup"), {
    zoneId: r,
    ...H(t?.context) ? t.context : {}
  }, null);
}
async function ls(o, e, t = {}) {
  const r = await el(o, e), a = String(r?.name || "").trim();
  if (r && a) return r;
  const n = /* @__PURE__ */ new Error("cf_zone_context_missing");
  throw n.code = "CF_ZONE_CONTEXT_MISSING", n.status = 400, n.details = {
    zoneId: String(o || "").trim(),
    scope: String(t?.scope || "").trim()
  }, n;
}
async function rl(o, e) {
  const t = String(o || "").trim(), r = String(e || "").trim();
  return !t || !r ? "" : Da((await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(t)}/workers/account-settings`, r))?.result?.default_usage_model);
}
async function _m(o, e, t) {
  const r = String(o || "").trim(), a = String(e || "").trim(), n = String(t || "").trim();
  return !r || !a || !n ? null : (await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(r)}/storage/kv/namespaces/${encodeURIComponent(a)}`, n))?.result || null;
}
async function Zs(o, e, t) {
  const r = String(o || "").trim(), a = String(e || "").trim(), n = String(t || "").trim();
  return !r || !a || !n ? null : (await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(r)}/d1/database/${encodeURIComponent(a)}`, n))?.result || null;
}
async function bm({ accountId: o, apiToken: e, namespaceId: t, startIso: r, endIso: a }) {
  const n = String(o || "").trim(), s = String(e || "").trim(), i = String(t || "").trim();
  if (!n || !s || !i) return null;
  const c = await On(n, s, `
    query {
      viewer {
        accounts(filter: { accountTag: ${Ee(n)} }) {
          kvOperationsAdaptiveGroups(
            limit: 1000
            filter: {
              namespaceId: ${Ee(i)}
              datetime_geq: ${Ee(String(r || "").trim())}
              datetime_leq: ${Ee(String(a || "").trim())}
            }
          ) {
            dimensions { actionType }
            sum { requests }
          }
          kvStorageAdaptiveGroups(
            limit: 1000
            filter: {
              namespaceId: ${Ee(i)}
              datetime_geq: ${Ee(String(r || "").trim())}
              datetime_leq: ${Ee(String(a || "").trim())}
            }
          ) {
            max { byteCount }
          }
        }
      }
    }`);
  if (!c) throw new Error("cf_graphql_empty_account");
  const l = Array.isArray(c?.kvOperationsAdaptiveGroups) ? c.kvOperationsAdaptiveGroups : [], u = Array.isArray(c?.kvStorageAdaptiveGroups) ? c.kvStorageAdaptiveGroups : [], d = {
    readCount: 0,
    writeCount: 0,
    deleteCount: 0,
    listCount: 0,
    storageBytes: 0
  };
  for (const f of l) {
    const m = String(f?.dimensions?.actionType || "").trim().toLowerCase(), p = Math.max(0, Number(f?.sum?.requests) || 0);
    m === "read" ? d.readCount += p : m === "write" ? d.writeCount += p : m === "delete" ? d.deleteCount += p : m === "list" && (d.listCount += p);
  }
  for (const f of u) d.storageBytes = Math.max(d.storageBytes, Math.max(0, Number(f?.max?.byteCount) || 0));
  return d;
}
async function Em({ accountId: o, apiToken: e, databaseId: t, startIso: r, endIso: a }) {
  const n = String(o || "").trim(), s = String(e || "").trim(), i = String(t || "").trim();
  if (!n || !s || !i) return null;
  const c = await On(n, s, `
    query {
      viewer {
        accounts(filter: { accountTag: ${Ee(n)} }) {
          d1AnalyticsAdaptiveGroups(
            limit: 1000
            filter: {
              databaseId: ${Ee(i)}
              datetime_geq: ${Ee(String(r || "").trim())}
              datetime_leq: ${Ee(String(a || "").trim())}
            }
          ) {
            sum { rowsRead rowsWritten readQueries writeQueries }
          }
        }
      }
    }`);
  if (!c) throw new Error("cf_graphql_empty_account");
  return (Array.isArray(c?.d1AnalyticsAdaptiveGroups) ? c.d1AnalyticsAdaptiveGroups : []).reduce((l, u) => ({
    rowsRead: l.rowsRead + Math.max(0, Number(u?.sum?.rowsRead) || 0),
    rowsWritten: l.rowsWritten + Math.max(0, Number(u?.sum?.rowsWritten) || 0),
    readQueries: l.readQueries + Math.max(0, Number(u?.sum?.readQueries) || 0),
    writeQueries: l.writeQueries + Math.max(0, Number(u?.sum?.writeQueries) || 0)
  }), {
    rowsRead: 0,
    rowsWritten: 0,
    readQueries: 0,
    writeQueries: 0
  });
}
async function Am({ accountId: o, apiToken: e, databaseId: t, startIso: r, endIso: a, utcOffsetMinutes: n = $.Defaults.ScheduleUtcOffsetMinutes }) {
  const s = String(o || "").trim(), i = String(e || "").trim(), c = String(t || "").trim();
  if (!s || !i || !c) return [];
  const l = await On(s, i, `
    query {
      viewer {
        accounts(filter: { accountTag: ${Ee(s)} }) {
          d1AnalyticsAdaptiveGroups(
            limit: 10000
            filter: {
              databaseId: ${Ee(c)}
              datetime_geq: ${Ee(String(r || "").trim())}
              datetime_leq: ${Ee(String(a || "").trim())}
            }
          ) {
            dimensions { datetimeHour }
            sum { rowsWritten writeQueries }
          }
        }
      }
    }`);
  if (!l) throw new Error("cf_graphql_empty_account");
  const u = Array.isArray(l?.d1AnalyticsAdaptiveGroups) ? l.d1AnalyticsAdaptiveGroups : [], d = /* @__PURE__ */ new Map();
  for (const f of u) {
    const m = String(f?.dimensions?.datetimeHour || "").trim();
    if (!m) continue;
    const p = Date.parse(m);
    if (!Number.isFinite(p)) continue;
    const h = ut(new Date(p), n), g = `${h.dateKey}:${h.hour}`, y = d.get(g) || {
      dateKey: h.dateKey,
      hour: h.hour,
      rowsWritten: 0,
      writeQueries: 0
    };
    y.rowsWritten += Math.max(0, Number(f?.sum?.rowsWritten) || 0), y.writeQueries += Math.max(0, Number(f?.sum?.writeQueries) || 0), d.set(g, y);
  }
  return [...d.values()].sort((f, m) => f.dateKey !== m.dateKey ? String(f.dateKey).localeCompare(String(m.dateKey)) : Number(f.hour) - Number(m.hour));
}
async function Tm({ cfAccountId: o, cfZoneId: e, cfApiToken: t, startIso: r, endIso: a, utcOffsetMinutes: n = $.Defaults.ScheduleUtcOffsetMinutes }) {
  if (!o || !t) return null;
  const s = await On(o, t, `
  query {
    viewer {
      accounts(filter: { accountTag: ${Ee(o)} }) {
        workersInvocationsAdaptive(limit: 10000, filter: { datetime_geq: ${Ee(r)}, datetime_leq: ${Ee(a)} }) {
          dimensions { datetime scriptName status }
          sum { requests }
        }
      }
    }
  }`), i = Array.isArray(s?.workersInvocationsAdaptive) ? s.workersInvocationsAdaptive : [], c = Array.from({ length: 24 }, (u, d) => ({
    label: String(d).padStart(2, "0") + ":00",
    total: 0
  }));
  let l = 0;
  for (const u of i) {
    const d = Number(u?.sum?.requests) || 0;
    l += d;
    const f = u?.dimensions?.datetime;
    if (!f) continue;
    const m = new Date(f);
    if (Number.isNaN(m.getTime())) continue;
    const p = ut(m, n).hour;
    c[p] && (c[p].total += d);
  }
  return {
    totalRequests: l,
    hourlySeries: c
  };
}
async function Rm({ cfAccountId: o, cfZoneId: e, cfApiToken: t, zoneNameFallback: r = "" }) {
  const a = [], n = (s, i = {}) => {
    const c = Fo(s);
    if (!c) return;
    const l = i.wildcard === !0 || c.wildcard === !0;
    a.push({
      hostname: c.hostname,
      path: String(i.path || ""),
      wildcard: l,
      score: qo(c.hostname, {
        wildcard: l,
        path: i.path || ""
      })
    });
  };
  if (o && e) try {
    const s = await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(o).trim())}/workers/domains?zone_id=${encodeURIComponent(String(e).trim())}`, t);
    for (const i of s?.result || []) n(i?.hostname);
  } catch (s) {
    console.log("CF Workers domains lookup failed, will try routes", s);
  }
  if (!a.length && e) try {
    let s = 1, i = 1;
    do {
      const c = await Re(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(e).trim())}/workers/routes?page=${s}&per_page=100`, t);
      i = Number(c?.result_info?.total_pages || c?.result_info?.totalPages || 1);
      for (const l of c?.result || []) {
        const u = ec(l?.pattern);
        u && n(u.hostname, {
          wildcard: u.wildcard,
          path: u.path
        });
      }
      s += 1;
    } while (s <= i && s <= 5);
  } catch (s) {
    console.log("CF Workers routes lookup failed", s);
  }
  return a.length ? (a.sort((s, i) => i.score - s.score || s.hostname.length - i.hostname.length || s.hostname.localeCompare(i.hostname)), a[0].hostname) : r || "未知域名 (请配置 CF 联动)";
}
function rr(o = "") {
  const e = String(o || "").trim();
  return /^[a-z0-9_][a-z0-9-_]*$/i.test(e) ? e : "";
}
function vn(o) {
  if (o !== void 0)
    try {
      return JSON.parse(JSON.stringify(o));
    } catch {
      return null;
    }
}
function Be(o, e = [], t = {}) {
  if (typeof o == "string") return String(o).trim();
  if (!o || typeof o != "object") return "";
  const r = Array.isArray(e) ? e : [], a = [
    "id",
    "value",
    "name",
    "region",
    "provider",
    "providerId",
    "hostname",
    "host"
  ], n = r.length ? r : a, s = t?.allowFallback !== !1, i = [n];
  s && r.length && i.push(a);
  const c = /* @__PURE__ */ new Set();
  for (const l of i) for (const u of l) {
    if (c.has(u)) continue;
    c.add(u);
    const d = o?.[u];
    if (typeof d == "string" && d.trim()) return d.trim();
    if (!(!d || typeof d != "object"))
      for (const f of l) {
        const m = d?.[f];
        if (typeof m == "string" && m.trim()) return m.trim();
      }
  }
  return "";
}
function Cm(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e ? e === "aws" ? "AWS" : e === "gcp" || e === "google" ? "GCP" : e === "azure" ? "Azure" : e.toUpperCase() : "";
}
function wm(o = "", e = "") {
  const t = String(o || "").trim().toLowerCase().replace(/_/g, "-"), r = String(e || "").trim().toLowerCase(), a = `${r}:${t}`;
  if (!t && !r) return {
    key: "other",
    label: "其他",
    sortOrder: 9
  };
  const n = (s = []) => s.some((i) => a.includes(String(i || "").trim().toLowerCase()));
  return n([
    "wnam",
    "enam",
    "americas",
    "latam",
    "northamerica",
    "southamerica",
    "canada",
    "brazil",
    "mexico",
    "chile",
    "argentina",
    "eastus",
    "westus",
    "centralus",
    "northcentralus",
    "southcentralus",
    "us-east",
    "us-west",
    "us-central",
    "us-south",
    "ca-central",
    "ca-east",
    "sa-east",
    "na-",
    "sa-",
    "us-",
    "ca-"
  ]) ? {
    key: "americas",
    label: "美洲",
    sortOrder: 0
  } : n([
    "apac",
    "asia",
    "ap-",
    "australia",
    "japan",
    "korea",
    "singapore",
    "taiwan",
    "hongkong",
    "india",
    "jakarta",
    "sydney",
    "melbourne",
    "tokyo",
    "osaka",
    "seoul",
    "mumbai",
    "delhi",
    "perth",
    "newzealand"
  ]) ? {
    key: "asia-pacific",
    label: "亚太",
    sortOrder: 1
  } : n([
    "weur",
    "eeur",
    "europe",
    "eu-",
    "france",
    "germany",
    "italy",
    "spain",
    "poland",
    "sweden",
    "norway",
    "switzerland",
    "netherlands",
    "belgium",
    "ireland",
    "westeurope",
    "northeurope",
    "finland",
    "uk",
    "london"
  ]) ? {
    key: "europe",
    label: "欧洲",
    sortOrder: 2
  } : n([
    "mea",
    "middleeast",
    "me-",
    "af-",
    "africa",
    "uae",
    "qatar",
    "saudi",
    "israel",
    "bahrain",
    "kuwait",
    "southafrica",
    "johannesburg",
    "capetown",
    "doha",
    "telaviv"
  ]) ? {
    key: "middle-east-africa",
    label: "中东与非洲",
    sortOrder: 3
  } : {
    key: "other",
    label: "其他",
    sortOrder: 9
  };
}
function Lm(o) {
  return Array.isArray(o) ? o : o && typeof o == "object" ? [o] : typeof o == "string" && o.trim() ? [{ value: o }] : [];
}
function Nm(o = []) {
  const e = [], t = /* @__PURE__ */ new Set();
  for (const r of Array.isArray(o) ? o : []) {
    const a = String(r?.id || r?.provider || r?.providerId || "").trim().toLowerCase();
    if (!a) continue;
    const n = Cm(a);
    for (const s of Array.isArray(r?.regions) ? r.regions : []) {
      const i = String(s?.id || s?.region || s?.value || "").trim();
      if (!i) continue;
      const c = `${a}:${i}`;
      if (t.has(c)) continue;
      t.add(c);
      const l = wm(i, a);
      e.push({
        provider: a,
        region: i,
        value: c,
        providerLabel: n,
        regionLabel: i,
        geoKey: l.key,
        geoLabel: l.label,
        geoSortOrder: l.sortOrder
      });
    }
  }
  return e.sort((r, a) => String(r.providerLabel || r.provider || "").localeCompare(String(a.providerLabel || a.provider || "")) || Number(r.geoSortOrder || 0) - Number(a.geoSortOrder || 0) || String(r.regionLabel || r.region || "").localeCompare(String(a.regionLabel || a.region || "")) || String(r.value || "").localeCompare(String(a.value || "")));
}
function Kr(o, e = "", t = []) {
  const r = Be(o, [
    "region",
    "value",
    "id"
  ]);
  if (!r) return "";
  if (r.includes(":")) return r;
  const a = Be(e, [
    "provider",
    "providerId",
    "id",
    "value"
  ]).toLowerCase();
  if (a) return `${a}:${r}`;
  const n = (Array.isArray(t) ? t : []).filter((s) => String(s?.region || "").trim() === r || String(s?.value || "").trim() === r);
  return n.length === 1 ? String(n[0]?.value || "").trim() : r;
}
function Pa(o = {}, e = []) {
  const t = o && typeof o == "object" ? o : {}, r = String(t?.mode || "").trim().toLowerCase(), a = Lm(t?.target), n = Kr(t?.region, t?.provider || t?.providerId || "", e), s = a.find((_) => !!Kr(Be(_, [
    "region",
    "value",
    "id"
  ]), Be(_, ["provider", "providerId"]), e)), i = s ? Kr(Be(s, [
    "region",
    "value",
    "id"
  ]), Be(s, ["provider", "providerId"]), e) : "", c = Be(t?.hostname, ["hostname"], { allowFallback: !1 }) || Be(t, ["hostname"], { allowFallback: !1 }), l = Be(a.find((_) => Be(_, ["hostname"], { allowFallback: !1 })), ["hostname"], { allowFallback: !1 }), u = Be(t?.host, ["host"], { allowFallback: !1 }) || Be(t, ["host"], { allowFallback: !1 }), d = Be(a.find((_) => Be(_, ["host"], { allowFallback: !1 })), ["host"], { allowFallback: !1 }), f = Be(a[0], ["value", "id"]);
  let m = "default", p = "__default__", h = "", g = "default", y = "";
  return r === "smart" ? (m = "smart", p = "__smart__", g = "smart") : r === "targeted" ? c || l ? (m = "hostname", p = "", h = c || l, g = "") : u || d ? (m = "host", p = "", h = u || d, g = "") : (m = "targeted", p = i || n || "", h = p || f || "", g = "") : n ? (m = "region", p = n, g = "region", y = n) : c ? (m = "hostname", p = "", h = c, g = "") : u ? (m = "host", p = "", h = u, g = "") : (i || a.length > 0) && (m = "targeted", p = i || "", h = p || f || "", g = ""), {
    currentMode: m,
    currentValue: p,
    currentTarget: h,
    selectedMode: g,
    selectedRegion: y,
    isTargetedOverride: m === "hostname" || m === "host" || m === "targeted"
  };
}
function al(o = []) {
  return (Array.isArray(o) ? o : []).filter((e) => e && typeof e == "object").map((e) => {
    const t = String(e.scope || "").trim(), r = String(e.permission || "").trim(), a = String(e.alternative || "").trim(), n = String(e.note || "").trim(), s = [];
    return t && s.push(`${t}级`), r && s.push(`"${r}"`), a && s.push(`（若当前令牌仅授予写权限，可改用 "${a}"）`), n && s.push(`：${n}`), s.join("");
  }).filter(Boolean);
}
function nl(o = "", e = {}) {
  const t = String(o || "").trim().toLowerCase();
  if (t === "discovery") {
    const r = e?.includeRouteFallback !== !1, a = [{
      scope: "账号",
      permission: "Workers Scripts Read",
      alternative: "Workers Scripts Write",
      note: "用于读取 Workers Domains，按当前 host 自动识别脚本"
    }];
    return r && a.push({
      scope: "Zone",
      permission: "Workers Routes Read",
      alternative: "Workers Routes Write",
      note: "当 Domains 未命中时，允许继续从 Workers Routes 回退识别脚本"
    }), a;
  }
  return t === "settings_read" ? [{
    scope: "账号",
    permission: "Workers Scripts Read",
    alternative: "Workers Scripts Write",
    note: "用于读取 Worker Settings"
  }] : t === "regions_read" ? [{
    scope: "账号",
    permission: "Workers Scripts Read",
    alternative: "Workers Scripts Write",
    note: "用于读取 Placement 区域列表"
  }] : t === "settings_write" ? [{
    scope: "账号",
    permission: "Workers Scripts Write",
    alternative: "",
    note: "用于写入 Worker Settings / Placement"
  }] : [];
}
function Im(o = "", e = "读取", t = {}) {
  const r = al(nl(o, t));
  return r.length <= 0 ? `Cloudflare Worker 放置${e}失败：API Token 权限不足` : `Cloudflare Worker 放置${e}失败：API Token 权限不足。至少需要：${r.join("；")}`;
}
function Fn(o = "WORKER_PLACEMENT_FORBIDDEN", e = "", t = "读取", r = {}) {
  return Ie(o, Im(e, t, r), 403, {
    permissionKind: String(e || "").trim(),
    requiredPermissions: nl(e, r)
  });
}
function bo(o = {}) {
  const e = o && typeof o == "object" && !Array.isArray(o) ? o : {}, t = Object.prototype.hasOwnProperty.call(e, "currentValue"), r = Object.prototype.hasOwnProperty.call(e, "selectedMode");
  return {
    configured: e.configured === !0,
    scriptName: String(e.scriptName || "").trim(),
    requestHost: ne(e.requestHost || ""),
    currentMode: String(e.currentMode || "default").trim().toLowerCase() || "default",
    currentValue: t ? String(e.currentValue ?? "").trim() : "__default__",
    currentTarget: String(e.currentTarget || "").trim(),
    selectedMode: r ? String(e.selectedMode ?? "").trim().toLowerCase() : "default",
    selectedRegion: String(e.selectedRegion || "").trim(),
    options: Array.isArray(e.options) ? e.options : [],
    warning: String(e.warning || "").trim(),
    error: String(e.error || "").trim()
  };
}
function Dm(o = "", e = "", t = !1) {
  const r = ne(o), a = ne(e);
  return !r || !a ? !1 : t ? r === a || r.endsWith(`.${a}`) : r === a;
}
function Mm(o = "", e = "/") {
  const t = String(o || "").trim(), r = String(e || "/").trim() || "/";
  return !t || t === "/" || t === "/*" ? !0 : t.endsWith("*") ? r.startsWith(t.slice(0, -1)) : r === t;
}
function Pm(o = {}) {
  const e = ne(o?.hostname || ""), t = rr(o?.service || o?.script || o?.name || "");
  return !e || !t ? null : {
    source: "domains",
    hostname: e,
    wildcard: !1,
    path: "/",
    scriptName: t,
    score: qo(e, {
      wildcard: !1,
      path: "/"
    })
  };
}
function xm(o = {}) {
  const e = ec(o?.pattern), t = rr(o?.script || o?.service || o?.name || "");
  return !e || !t ? null : {
    source: "routes",
    hostname: e.hostname,
    wildcard: e.wildcard === !0,
    path: e.path || "/",
    pattern: e.pattern,
    scriptName: t,
    score: qo(e.hostname, {
      wildcard: e.wildcard === !0,
      path: e.path || "/"
    })
  };
}
function ei(o = [], e = "", t = "/") {
  const r = ne(e), a = String(t || "/").trim() || "/", n = [];
  for (const s of Array.isArray(o) ? o : [])
    !s?.scriptName || !s?.hostname || Dm(r, s.hostname, s.wildcard === !0) && Mm(s.path || "/", a) && n.push({
      ...s,
      exactHostname: r === ne(s.hostname),
      exactPath: String(s.path || "/") === a
    });
  return n.length > 0 ? (n.sort((s, i) => Number(i.exactHostname) - Number(s.exactHostname) || Number(i.exactPath) - Number(s.exactPath) || Number(i.score || 0) - Number(s.score || 0) || String(s.hostname || "").length - String(i.hostname || "").length || String(s.scriptName || "").localeCompare(String(i.scriptName || ""))), n[0]) : null;
}
async function ol(o, e) {
  const t = String(o || "").trim(), r = String(e || "").trim();
  if (!t || !r) return [];
  let a = null;
  try {
    a = await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(t)}/workers/placement/regions`, r);
  } catch (n) {
    throw Number(n?.status) === 403 ? Fn("WORKER_PLACEMENT_REGIONS_FORBIDDEN", "regions_read", "读取") : n;
  }
  return Nm(a?.result?.providers);
}
async function Om(o, e, t = {}) {
  const r = String(o || "").trim(), a = String(e || "").trim();
  if (!r || !a) return [];
  const n = new URL(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(r)}/workers/domains`), s = String(t?.zoneId || "").trim(), i = ne(t?.hostname || ""), c = rr(t?.service || "");
  s && n.searchParams.set("zone_id", s), i && n.searchParams.set("hostname", i), c && n.searchParams.set("service", c);
  const l = await Re(n.toString(), a);
  return Array.isArray(l?.result) ? l.result : [];
}
async function vm(o, e) {
  const t = String(o || "").trim(), r = String(e || "").trim();
  if (!t || !r) return [];
  const a = [];
  let n = 1, s = 1;
  do {
    const i = await Re(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(t)}/workers/routes?page=${n}&per_page=100`, r);
    Array.isArray(i?.result) && a.push(...i.result), s = Number(i?.result_info?.total_pages || i?.result_info?.totalPages || 1), n += 1;
  } while (n <= s && n <= 10);
  return a;
}
async function us({ cfAccountId: o, cfZoneId: e, cfApiToken: t, request: r }) {
  const a = new URL(r?.url || "https://invalid.local/"), n = ne(a.hostname), s = String(a.pathname || "/").trim() || "/";
  if (!n) throw Ie("WORKER_PLACEMENT_HOST_INVALID", "当前请求 host 无效，无法识别 Worker 脚本", 400);
  const i = [], c = /* @__PURE__ */ new Set();
  let l = null, u = !1, d = !1;
  const f = [{
    zoneId: e,
    hostname: n
  }, { hostname: n }];
  for (const m of f) {
    const p = JSON.stringify({
      zoneId: String(m?.zoneId || "").trim(),
      hostname: ne(m?.hostname || "")
    });
    if (!c.has(`query:${p}`)) {
      c.add(`query:${p}`);
      try {
        const h = await Om(o, t, m);
        for (const y of h) {
          const _ = Pm(y);
          if (!_) continue;
          const S = `${_.source}|${_.scriptName}|${_.hostname}|${_.path}`;
          c.has(S) || (c.add(S), i.push(_));
        }
        const g = ei(i, n, s);
        if (g?.scriptName) return {
          requestHost: n,
          requestPath: s,
          scriptName: g.scriptName,
          resolvedBy: g.source
        };
      } catch (h) {
        l = h, Number(h?.status) === 403 && (u = !0), console.warn("[worker_placement.resolve_script.domains_failed]", {
          requestHost: n,
          zoneId: String(m?.zoneId || "").trim(),
          hostname: ne(m?.hostname || ""),
          reason: ue(h)
        });
      }
    }
  }
  try {
    const m = ei(await vm(e, t).then((p) => p.map((h) => xm(h)).filter(Boolean)), n, s);
    if (m?.scriptName) return {
      requestHost: n,
      requestPath: s,
      scriptName: m.scriptName,
      resolvedBy: m.source
    };
  } catch (m) {
    l = m, Number(m?.status) === 403 && (d = !0), console.warn("[worker_placement.resolve_script.routes_failed]", {
      requestHost: n,
      zoneId: String(e || "").trim(),
      reason: ue(m)
    });
  }
  throw u || d ? Fn("WORKER_PLACEMENT_SCRIPT_DISCOVERY_FORBIDDEN", "discovery", "读取", { includeRouteFallback: d }) : l || Ie("WORKER_PLACEMENT_SCRIPT_UNRESOLVED", "未能根据当前站点自动识别 Worker 脚本，请确认当前 host 已绑定到该 Zone 的 Workers Domain 或 Workers Route", 400, { requestHost: n });
}
async function yn(o, e, t) {
  let r = null;
  try {
    r = await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(o || "").trim())}/workers/scripts/${encodeURIComponent(String(e || "").trim())}/settings`, String(t || "").trim());
  } catch (a) {
    throw Number(a?.status) === 403 ? Fn("WORKER_PLACEMENT_SETTINGS_READ_FORBIDDEN", "settings_read", "读取") : a;
  }
  return H(r?.result) ? r.result : {};
}
async function aa(o, e, t, r = {}) {
  const a = new FormData();
  a.append("settings", new Blob([JSON.stringify(r && typeof r == "object" ? r : {})], { type: "application/json" }), "settings.json");
  let n = null;
  try {
    n = await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(o || "").trim())}/workers/scripts/${encodeURIComponent(String(e || "").trim())}/settings`, String(t || "").trim(), {
      method: "PATCH",
      body: a
    });
  } catch (s) {
    throw Number(s?.status) === 403 ? Fn("WORKER_PLACEMENT_SETTINGS_WRITE_FORBIDDEN", "settings_write", "保存") : s;
  }
  return H(n?.result) ? n.result : {};
}
function Sn(o, e = "read") {
  const t = e === "write" ? "保存" : e === "default" ? "恢复默认" : "读取", r = String(o?.message || o || "").trim() || `Worker 放置${t}失败`, a = Number(o?.status) || Number(/cf_api_http_(\d+)/i.exec(r)?.[1] || 0), n = String(o?.code || "").trim().toUpperCase();
  return n.startsWith("WORKER_PLACEMENT_") && String(o?.message || "").trim() ? o.message : a === 401 ? `Cloudflare Worker 放置${t}失败：API Token 无效` : a === 403 ? `Cloudflare Worker 放置${t}失败：API Token 权限不足` : a === 404 && e !== "read" ? "Cloudflare Worker 放置保存失败：未找到目标 Worker 脚本" : a === 404 ? "Cloudflare Worker 放置读取失败：未找到目标 Worker 脚本" : n === "WORKER_PLACEMENT_SCRIPT_UNRESOLVED" || n === "WORKER_PLACEMENT_HOST_INVALID" || n === "WORKER_PLACEMENT_CONFIG_REQUIRED" ? o.message : r;
}
function ds(o = {}) {
  const e = String(o?.cfAccountId || "").trim(), t = String(o?.cfZoneId || "").trim(), r = String(o?.cfApiToken || "").trim(), a = [];
  if (e || a.push("cfAccountId"), t || a.push("cfZoneId"), r || a.push("cfApiToken"), a.length <= 0) return {
    cfAccountId: e,
    cfZoneId: t,
    cfApiToken: r
  };
  throw Ie("WORKER_PLACEMENT_CONFIG_REQUIRED", "请先在账号设置中填写并保存 Cloudflare Account ID、Zone ID 与 API Token", 400, { missingFields: a });
}
function fs(o = "") {
  const e = rr(o);
  return e ? `sys:worker_placement_region:v1:${e}` : "";
}
function Yt(o = "WORKER_PLACEMENT_KV_FAILED", e = "Worker 放置 KV 持久化失败", t = null) {
  return Ie(o, e, 503, t);
}
function Fm(o) {
  return wn(o) && String(o?.code || "").trim().toUpperCase().startsWith("WORKER_PLACEMENT_") && String(o?.details?.dependency || "").trim().toUpperCase() === "KV";
}
function sl(o = {}, e = "") {
  const t = rr(e);
  if (!t || !H(o)) return null;
  const r = Kr(o?.region, o?.provider || o?.providerId || "", []);
  return r ? {
    scriptName: t,
    region: r,
    updatedAt: String(o?.updatedAt || "").trim()
  } : null;
}
async function il(o, e = "") {
  if (!o) return null;
  const t = fs(e);
  return t ? sl(await Oe(o, t, { type: "json" }), e) : null;
}
async function cl(o, e = "", t = "") {
  if (!o) throw Yt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：KV 未配置", {
    dependency: "KV",
    operation: "put",
    reason: "kv_not_configured"
  });
  const r = fs(e), a = rr(e), n = Kr(t, "", []);
  if (!r || !a || !n) throw Yt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：Region 数据无效", {
    dependency: "KV",
    operation: "put",
    key: r,
    scriptName: a,
    region: n,
    reason: "invalid_region_override"
  });
  const s = {
    scriptName: a,
    region: n,
    updatedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    await o.put(r, JSON.stringify(s));
  } catch (i) {
    throw Yt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：KV 写入异常", {
      dependency: "KV",
      operation: "put",
      key: r,
      scriptName: a,
      region: n,
      reason: ue(i)
    });
  }
  return s;
}
async function ti(o, e = "") {
  if (!o) throw Yt("WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", "Worker 放置 Region 清理失败：KV 未配置", {
    dependency: "KV",
    operation: "delete",
    reason: "kv_not_configured"
  });
  const t = fs(e), r = rr(e);
  if (!t || !r) return !1;
  try {
    await o.delete(t);
  } catch (a) {
    throw Yt("WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", "Worker 放置 Region 清理失败：KV 删除异常", {
      dependency: "KV",
      operation: "delete",
      key: t,
      scriptName: r,
      reason: ue(a)
    });
  }
  return !0;
}
function Um(o = "") {
  const e = String(o || "").trim();
  return e ? `当前已保存的 Worker Placement Region（${e}）已不在 Cloudflare 可选区域列表中，请重新选择并保存` : "当前已保存的 Worker Placement Region 已不在 Cloudflare 可选区域列表中，请重新选择并保存";
}
function ri(o = "", e = "", t = "", r = [], a = {}) {
  const n = Kr(t, "", r), s = Array.isArray(r) ? r : [], i = s.find((u) => String(u?.value || "").trim() === n) || null, c = a?.regionError || null;
  let l = String(a?.error || "").trim();
  return !l && c ? l = Sn(c, "read") : !l && n && s.length > 0 && !i && (l = Um(n)), bo({
    configured: a?.configured !== !1,
    scriptName: o,
    requestHost: e,
    currentMode: "region",
    currentValue: n,
    currentTarget: "",
    selectedMode: "region",
    selectedRegion: n,
    options: s,
    warning: "",
    error: l
  });
}
async function Yn(o, e, t, r = {}) {
  let a = !1, n = !1, s = "";
  try {
    const i = sl(r?.previousOverride, e), c = r?.originalState && typeof r.originalState == "object" ? r.originalState : Pa(r?.originalPlacement, r?.regionOptions);
    if (i?.region)
      return a = !0, await aa(o, e, t, { placement: { region: i.region } }), n = !0, {
        rollbackAttempted: a,
        rollbackSucceeded: n,
        rollbackError: s
      };
    a = !0, String(c?.currentMode || "").trim().toLowerCase() === "default" ? await ll(o, e, t, r?.regionOptions) : await aa(o, e, t, { placement: vn(r?.originalPlacement) }), n = !0;
  } catch (i) {
    n = !1, s = ue(i);
  }
  return {
    rollbackAttempted: a,
    rollbackSucceeded: n,
    rollbackError: s
  };
}
async function ai(o = {}, e, t = {}) {
  let r = "", a = "";
  try {
    const n = ds(o), s = await us({
      ...n,
      request: e
    });
    r = s.scriptName, a = s.requestHost;
    const i = await il(t?.kv, s.scriptName);
    let c = [], l = null;
    try {
      c = await ol(n.cfAccountId, n.cfApiToken);
    } catch (d) {
      l = d;
    }
    if (i?.region) return ri(s.scriptName, s.requestHost, i.region, c, {
      configured: !l,
      regionError: l
    });
    const u = Pa(vn((await yn(n.cfAccountId, s.scriptName, n.cfApiToken))?.placement), c);
    return u.currentMode === "region" && u.currentValue ? (await cl(t?.kv, s.scriptName, u.currentValue), ri(s.scriptName, s.requestHost, u.currentValue, c, {
      configured: !l,
      regionError: l
    })) : bo({
      configured: !l,
      scriptName: s.scriptName,
      requestHost: s.requestHost,
      currentMode: u.currentMode,
      currentValue: u.currentValue,
      currentTarget: u.currentTarget,
      selectedMode: u.selectedMode,
      selectedRegion: u.selectedRegion,
      options: c,
      warning: "",
      error: l ? Sn(l, "read") : ""
    });
  } catch (n) {
    if (Ko(n) || Fm(n) || t?.softFail !== !0) throw n;
    return bo({
      configured: !1,
      scriptName: r,
      requestHost: a,
      selectedMode: "",
      currentMode: "default",
      currentValue: "__default__",
      error: Sn(n, "read")
    });
  }
}
async function ll(o, e, t, r = []) {
  const a = await yn(o, e, t), n = vn(a?.placement), s = Pa(n, r);
  if (s.currentMode === "default") return {
    settings: a,
    placementState: s,
    clearedBy: "already_default"
  };
  for (const u of [{
    tag: "empty_object",
    patch: { placement: {} }
  }, {
    tag: "null",
    patch: { placement: null }
  }]) {
    await aa(o, e, t, u.patch);
    const d = await yn(o, e, t), f = Pa(d?.placement, r);
    if (f.currentMode === "default") return {
      settings: d,
      placementState: f,
      clearedBy: u.tag
    };
  }
  let i = !1, c = !1, l = "";
  if (n !== void 0) {
    i = !0;
    try {
      await aa(o, e, t, { placement: n }), c = !0;
    } catch (u) {
      c = !1, l = ue(u);
    }
  }
  throw Ie("WORKER_PLACEMENT_DEFAULT_BLOCKED", "Cloudflare 当前接口未验证出可安全恢复 Default Placement；本次已停止，未使用近似映射", 409, {
    scriptName: e,
    rollbackAttempted: i,
    rollbackSucceeded: c,
    rollbackError: l
  });
}
function km(o = {}, e = {}) {
  const { kernel: t } = o, { CacheManager: r, buildAdminShellState: a, buildAdminUiContract: n, withAdminShellRuntimeStatus: s } = o;
  return {
    async getDashboardSnapshot(i, { env: c, ctx: l, kv: u, db: d }) {
      const f = await me(c);
      return ae(await t.getDashboardSnapshotPayload(c, {
        ctx: l,
        kv: u,
        db: d,
        config: f,
        forceRefresh: i?.forceRefresh === !0
      }));
    },
    async getDashboardStats(i, { env: c, ctx: l, kv: u, db: d }) {
      const f = await me(c), m = await t.getDashboardSnapshotPayload(c, {
        ctx: l,
        kv: u,
        db: d,
        config: f,
        forceRefresh: i?.forceRefresh === !0
      });
      return ae({
        ...m?.stats && typeof m.stats == "object" ? m.stats : {},
        cacheMeta: m?.cacheMeta && typeof m.cacheMeta == "object" ? m.cacheMeta : {}
      });
    },
    async getMonthlyTrafficStats(i, { env: c, ctx: l }) {
      const u = await me(c);
      return ae(await t.getDashboardMonthlyTrafficPayload(c, {
        ctx: l,
        config: u,
        forceRefresh: i?.forceRefresh === !0
      }));
    },
    async getRuntimeStatus(i, { env: c, db: l }) {
      const u = await me(c), d = await t.getRuntimeStatusPayload(c, {
        db: l,
        config: u,
        forceRefresh: i?.forceRefresh === !0
      });
      return ae({
        status: d?.status && typeof d.status == "object" ? d.status : {},
        cacheMeta: d?.cacheMeta && typeof d.cacheMeta == "object" ? d.cacheMeta : {}
      });
    },
    async getAdminBootstrap(i, { env: c, ctx: l, kv: u, db: d }) {
      try {
        const f = await me(c), m = ze(c), [p, h] = await Promise.all([r.getNodesListStrict(c, l), t.getRuntimeStatusPayload(c, {
          ctx: l,
          kv: u,
          db: d,
          config: f
        })]), g = await t.getAdminRevisionsForRead({
          env: c,
          kv: u,
          db: d
        }, {
          ctx: l,
          config: f,
          nodes: p
        });
        return ae({
          adminPath: ft(c),
          loginPath: ts(c),
          initHealth: m,
          config: Dt(f),
          hostDomain: Ve(c),
          legacyHost: Jr(c),
          contract: n(),
          nodes: p,
          shell: a(c, m, f),
          runtimeStatus: h?.status && typeof h.status == "object" ? h.status : s({}, c, f, m),
          revisions: g,
          generatedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (f) {
        throw Mt(f, "ADMIN_BOOTSTRAP_READ_FAILED", "管理台启动数据加载失败：KV 读取异常", "admin.read.bootstrap");
      }
    },
    async getSettingsBootstrap(i, { env: c, ctx: l, kv: u, db: d }) {
      let f;
      try {
        f = await me(c);
      } catch (g) {
        throw Mt(g, "SETTINGS_BOOTSTRAP_READ_FAILED", "设置页加载失败：KV 读取异常", "admin.read.settings_bootstrap");
      }
      let m = [], p = {}, h = {};
      try {
        m = await r.getNodesListStrict(c, l);
      } catch (g) {
        console.warn("[settings_bootstrap.nodes_degraded]", ue(g));
      }
      try {
        const g = await t.getRuntimeStatusPayload(c, {
          ctx: l,
          kv: u,
          db: d,
          config: f
        });
        p = g?.status && typeof g.status == "object" ? g.status : {};
      } catch (g) {
        console.warn("[settings_bootstrap.runtime_status_degraded]", ue(g));
      }
      try {
        h = await t.getAdminRevisionsForRead({
          env: c,
          kv: u,
          db: d
        }, {
          ctx: l,
          config: f,
          nodes: m
        });
      } catch (g) {
        console.warn("[settings_bootstrap.revisions_degraded]", ue(g));
      }
      return ae({
        config: Dt(f),
        hostDomain: Ve(c),
        legacyHost: Jr(c),
        contract: n(),
        nodes: m,
        runtimeStatus: s(p, c, f, ze(c)),
        revisions: h,
        generatedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    async getWorkerPlacementStatus(i, { env: c, request: l, kv: u }) {
      try {
        return ae(await ai(await me(c), l, {
          softFail: !0,
          kv: u
        }));
      } catch (d) {
        throw Mt(d, "WORKER_PLACEMENT_READ_FAILED", "Worker 放置状态读取失败：KV 读取异常", "admin.read.worker_placement");
      }
    },
    async saveWorkerPlacement(i, { env: c, request: l, kv: u }) {
      let d;
      try {
        d = await me(c);
      } catch (m) {
        throw Mt(m, "WORKER_PLACEMENT_SAVE_FAILED", "Worker 放置保存失败：KV 读取异常", "admin.write.worker_placement");
      }
      const f = String(i?.mode || "").trim().toLowerCase();
      if (f !== "default" && f !== "smart" && f !== "region") return z("WORKER_PLACEMENT_MODE_INVALID", "请选择有效的 Worker 放置模式");
      try {
        const m = ds(d), p = await us({
          ...m,
          request: l
        }), h = await il(u, p.scriptName), g = await ol(m.cfAccountId, m.cfApiToken), y = vn((await yn(m.cfAccountId, p.scriptName, m.cfApiToken))?.placement), _ = Pa(y, g);
        if (f === "region") {
          const S = String(i?.region || "").trim(), E = g.find((b) => String(b?.value || "").trim() === S);
          if (!E) return z("WORKER_PLACEMENT_REGION_INVALID", "所选 Placement 区域已失效，请刷新后重试");
          await aa(m.cfAccountId, p.scriptName, m.cfApiToken, { placement: { region: E.value } });
          try {
            await cl(u, p.scriptName, E.value);
          } catch (b) {
            const T = await Yn(m.cfAccountId, p.scriptName, m.cfApiToken, {
              previousOverride: h,
              originalPlacement: y,
              originalState: _,
              regionOptions: g
            });
            throw Yt(b?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", String(b?.message || "Worker 放置 Region 持久化失败：KV 写入异常"), {
              ...H(b?.details) ? b.details : {},
              requestedMode: f,
              dependency: "KV",
              region: E.value,
              rollbackAttempted: T.rollbackAttempted,
              rollbackSucceeded: T.rollbackSucceeded,
              rollbackError: T.rollbackError
            });
          }
        } else if (f === "smart") {
          if (await aa(m.cfAccountId, p.scriptName, m.cfApiToken, { placement: { mode: "smart" } }), h) try {
            await ti(u, p.scriptName);
          } catch (S) {
            const E = await Yn(m.cfAccountId, p.scriptName, m.cfApiToken, {
              previousOverride: h,
              originalPlacement: y,
              originalState: _,
              regionOptions: g
            });
            throw Yt(S?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", String(S?.message || "Worker 放置 Region 清理失败：KV 删除异常"), {
              ...H(S?.details) ? S.details : {},
              requestedMode: f,
              dependency: "KV",
              rollbackAttempted: E.rollbackAttempted,
              rollbackSucceeded: E.rollbackSucceeded,
              rollbackError: E.rollbackError
            });
          }
        } else if (await ll(m.cfAccountId, p.scriptName, m.cfApiToken, g), h) try {
          await ti(u, p.scriptName);
        } catch (S) {
          const E = await Yn(m.cfAccountId, p.scriptName, m.cfApiToken, {
            previousOverride: h,
            originalPlacement: y,
            originalState: _,
            regionOptions: g
          });
          throw Yt(S?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", String(S?.message || "Worker 放置 Region 清理失败：KV 删除异常"), {
            ...H(S?.details) ? S.details : {},
            requestedMode: f,
            dependency: "KV",
            rollbackAttempted: E.rollbackAttempted,
            rollbackSucceeded: E.rollbackSucceeded,
            rollbackError: E.rollbackError
          });
        }
        return ae(await ai(d, l, {
          softFail: !1,
          kv: u
        }));
      } catch (m) {
        return z("WORKER_PLACEMENT_SAVE_FAILED", Sn(m, f === "default" ? "default" : "write"), Pe(m?.status, f === "default" ? 409 : 400), H(m?.details) ? m.details : null);
      }
    }
  };
}
var ul = 600 * 1e3, Hm = ul;
function lt(o = "", e = "manual") {
  const t = String(e || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", r = String(o || "").trim().toLowerCase();
  return t !== "manual" ? "smart" : r === "full" ? "full" : "smart";
}
function $m(o = "", e = "manual") {
  return lt(o, e) === "full";
}
function ms(o = "worker.js") {
  const e = String(o || "").trim().split(/[\\/]+/).pop() || "";
  return e && /\.js$/i.test(e) ? e : "";
}
function dl(o = "") {
  const e = String(o || "");
  return e && (/(^|\n)\s*export\s+/m.test(e) || /(^|\n)\s*import\s+(?:[\w*{]|["'])/m.test(e)) ? "module" : "service-worker";
}
function Bm(o = "", e = "worker.js") {
  const t = ms(e);
  if (t.toLowerCase() !== "worker.js") throw Ie("WORKER_UPLOAD_FILE_NAME_INVALID", "Worker 文件名必须是 worker.js", 400, { fileName: t || String(e || "").trim() });
  const r = String(o || ""), a = new TextEncoder().encode(r).length;
  if (!r.trim()) throw Ie("WORKER_UPLOAD_EMPTY", "worker.js 不能为空", 400);
  if (a > 3145728) throw Ie("WORKER_UPLOAD_TOO_LARGE", `worker.js 体积超过限制（${a} bytes）`, 400, {
    contentLength: a,
    maxBytes: Vm
  });
  return {
    fileName: t,
    scriptContent: r,
    contentLength: a,
    syntax: dl(r)
  };
}
function Km(o = "", e = "module") {
  const t = ms(o) || "worker.js";
  return e === "module" ? { main_module: t } : { body_part: t };
}
function zm(o = "module") {
  return o === "module" ? "application/javascript+module" : "application/javascript";
}
function fl() {
  return [{
    scope: "账号",
    permission: "Workers Scripts Write",
    alternative: "",
    note: "这是账号级 Worker 脚本编辑权限，用于上传 .js 文件并仅更新脚本代码，不修改 bindings 或 settings"
  }];
}
function ml(o = "更新") {
  const e = al(fl());
  return e.length > 0 ? `Cloudflare Worker 脚本${o}失败：API Token 权限不足。至少需要：${e.join("；")}` : `Cloudflare Worker 脚本${o}失败：API Token 权限不足`;
}
function Wm(o = "WORKER_SCRIPT_UPDATE_FORBIDDEN", e = "更新") {
  return Ie(o, ml(e), 403, { requiredPermissions: fl() });
}
async function Gm(o, e, t, r, a = {}) {
  const n = String(o || "").trim(), s = rr(e), i = String(t || "").trim(), c = ms(a?.fileName) || "worker.js", l = String(r || ""), u = dl(l), d = new FormData();
  d.append("metadata", new Blob([JSON.stringify(Km(c, u))], { type: "application/json" }), "metadata.json"), d.append("files", new Blob([l], { type: zm(u) }), c);
  let f = null;
  try {
    f = await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(n)}/workers/scripts/${encodeURIComponent(s)}/content`, i, {
      method: "PUT",
      body: d
    });
  } catch (m) {
    throw Number(m?.status) === 403 ? Wm("WORKER_SCRIPT_UPDATE_FORBIDDEN", "更新") : m;
  }
  return {
    syntax: u,
    fileName: c,
    result: H(f?.result) ? f.result : {}
  };
}
function ni(o) {
  const e = String(o?.message || o || "").trim() || "Worker 脚本更新失败", t = Number(o?.status) || Number(/cf_api_http_(\d+)/i.exec(e)?.[1] || 0), r = String(o?.code || "").trim().toUpperCase();
  return r === "WORKER_SCRIPT_UPDATE_FORBIDDEN" && String(o?.message || "").trim() ? o.message : r === "WORKER_PLACEMENT_SCRIPT_DISCOVERY_FORBIDDEN" ? String(o?.message || "").replace("Cloudflare Worker 放置读取失败", "Cloudflare Worker 脚本定位失败").trim() : r === "WORKER_PLACEMENT_SCRIPT_UNRESOLVED" || r === "WORKER_PLACEMENT_HOST_INVALID" || r === "WORKER_PLACEMENT_CONFIG_REQUIRED" ? e : t === 401 ? "Cloudflare Worker 和 HTML 更新失败：API Token 无效" : t === 403 ? ml("更新") : t === 404 ? "Cloudflare Worker 和 HTML 更新失败：未找到目标 Worker 脚本" : e;
}
var Vm = 3 * 1024 * 1024;
function jm(o = {}, e = {}) {
  const { kernel: t } = o, { buildAdminLocalIndexUploadRecord: r } = o;
  return {
    async loadConfig(a, { env: n, kv: s, db: i, ctx: c }) {
      try {
        const l = await me(n), u = await t.getAdminRevisionsForRead({
          env: n,
          kv: s,
          db: i
        }, {
          ctx: c,
          config: l
        });
        return ae({
          config: Dt(l),
          revisions: u
        });
      } catch (l) {
        throw Mt(l, "CONFIG_READ_FAILED", "设置读取失败：KV 读取异常", "admin.read.config");
      }
    },
    async previewConfig(a, { env: n, kv: s, ctx: i }) {
      const c = a?.config && typeof a.config == "object" && !Array.isArray(a.config) ? a.config : {};
      if (!s) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const l = await me(n), u = await t.prepareRuntimeConfigPersistence(qn(c, l), {
        env: n,
        kv: s,
        ctx: i
      });
      return ae({
        config: Dt(u.nextConfig),
        hostPrefixDnsSyncCount: u.dnsPlans.length
      });
    },
    async previewTidyData(a, { env: n, kv: s, db: i }) {
      const c = String(a?.scope || "kv").trim().toLowerCase() === "d1" ? "d1" : "kv";
      try {
        if (c === "d1") {
          if (!i) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
          const d = await t.buildD1TidyPlan(n, {
            db: i,
            kv: s,
            maintenanceMode: lt(a?.maintenanceMode, "manual")
          }), f = d.schemaStatus?.schemaReady !== !0, m = f ? "" : await t.createD1TidyPlanToken(n, d);
          return ae({
            success: !0,
            scope: "d1",
            planHash: f ? "" : d.planHash,
            planToken: m,
            planExpiresAt: m ? new Date(B() + Hm).toISOString() : "",
            requiresSchemaInitialization: f,
            summary: d.summary,
            ...d.preview
          });
        }
        if (!s) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace");
        const l = await t.buildKvTidyPlan(n, {
          kv: s,
          db: i
        }), u = await t.createKvTidyPlanToken(n, l);
        return ae({
          success: !0,
          scope: "kv",
          planHash: l.planHash,
          planToken: u,
          planExpiresAt: new Date(B() + ul).toISOString(),
          summary: l.summary,
          ...l.preview
        });
      } catch (l) {
        const u = l?.message || String(l);
        return z(String(l?.code || "TIDY_PREVIEW_FAILED"), u, Pe(l?.status, 500), {
          scope: c,
          ...H(l?.details) ? l.details : {}
        });
      }
    },
    async updateWorkerAndAdminIndex(a, { env: n, request: s, kv: i, ctx: c }) {
      if (!i) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      let l;
      try {
        l = await me(n);
      } catch (S) {
        throw Mt(S, "WORKER_HTML_UPDATE_FAILED", "Worker 和 HTML 更新失败：KV 读取异常", "admin.write.worker_html");
      }
      const u = typeof a?.workerScriptContent == "string" ? a.workerScriptContent : "", d = typeof a?.indexHtml == "string" ? a.indexHtml : "";
      if (!u.trim() || !d.trim()) return z("WORKER_HTML_FILES_REQUIRED", "必须同时上传 worker.js 和 index.html，缺一不可", 400, {
        workerFileProvided: !!u.trim(),
        indexFileProvided: !!d.trim()
      });
      let f, m;
      try {
        f = Bm(u, a?.workerFileName);
        const S = String(a?.indexFileName || "").trim().split(/[\\/]+/).pop() || "";
        if (S.toLowerCase() !== "index.html") return z("ADMIN_INDEX_UPLOAD_FILE_NAME_INVALID", "HTML 文件名必须是 index.html", 400, { fileName: S || String(a?.indexFileName || "").trim() });
        m = await r(d, S);
      } catch (S) {
        return z(String(S?.code || "WORKER_HTML_VALIDATION_FAILED"), ue(S, "Worker 或 HTML 文件校验失败"), Pe(S?.status, 400), H(S?.details) ? S.details : null);
      }
      let p, h;
      try {
        p = ds(l), h = await us({
          ...p,
          request: s
        });
      } catch (S) {
        return z(String(S?.code || "WORKER_SCRIPT_CONTEXT_FAILED"), ni(S), Pe(S?.status, 400), H(S?.details) ? S.details : null);
      }
      let g;
      try {
        g = await t.persistAdminIndexUpload(m, {
          env: n,
          kv: i,
          ctx: c
        });
      } catch (S) {
        return z(String(S?.code || "ADMIN_INDEX_UPLOAD_FAILED"), ue(S, "index.html 激活失败"), Pe(S?.status, 500), H(S?.details) ? S.details : null);
      }
      let y;
      try {
        y = await Gm(p.cfAccountId, h.scriptName, p.cfApiToken, f.scriptContent, { fileName: f.fileName });
      } catch (S) {
        let E = !1, b = !1, T = "", C = "";
        try {
          const L = await t.rollbackAdminIndexUploadActivation(g.previousConfig, g.config, {
            env: n,
            kv: i,
            ctx: c
          });
          E = !0, b = L.skipped === !0, T = String(L.reason || "").trim();
        } catch (L) {
          C = ue(L, "rollback_failed");
        }
        return z(String(S?.code || "WORKER_HTML_UPDATE_FAILED"), ni(S), Pe(S?.status, 400), {
          ...H(S?.details) ? S.details : {},
          htmlRollbackAttempted: !0,
          htmlRollbackSucceeded: E,
          htmlRollbackSkipped: b,
          htmlRollbackReason: T,
          htmlRollbackError: C
        });
      }
      const _ = y.result;
      return ae({
        success: !0,
        scriptName: h.scriptName,
        requestHost: h.requestHost,
        worker: {
          fileName: y.fileName,
          bytes: f.contentLength,
          syntax: y.syntax,
          modifiedOn: String(_?.modified_on || _?.modifiedOn || "").trim(),
          etag: String(_?.etag || "").trim(),
          handlers: Array.isArray(_?.handlers) ? _.handlers : [],
          hasModules: _?.has_modules === !0 || _?.hasModules === !0
        },
        html: {
          fileName: g.record.fileName,
          bytes: g.record.bytes,
          revision: g.record.revision,
          uploadedAt: g.record.uploadedAt
        },
        config: Dt(g.config),
        revisions: await t.getAdminRevisions(n, {
          ctx: c,
          config: g.config
        })
      });
    },
    async saveConfig(a, { env: n, ctx: s, kv: i }) {
      if (!i) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const c = await me(n), l = a.config ? await t.persistRuntimeConfig(qn(a.config, c), {
        env: n,
        kv: i,
        ctx: s,
        expectedConfigRevision: a?.expectedConfigRevision,
        mutationId: a?.mutationId,
        forceKvCommit: !0
      }) : c, u = await t.getAdminRevisions(n, {
        ctx: s,
        config: l
      });
      return ae({
        success: !0,
        committed: !0,
        config: Dt(l),
        revision: String(u.configRevision || ""),
        revisions: u
      });
    },
    async uploadAdminIndex(a, { env: n, ctx: s, kv: i }) {
      if (!i) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      try {
        const c = String(a?.fileName || "").trim().split(/[\\/]+/).pop() || "";
        if (c.toLowerCase() !== "index.html") return z("ADMIN_INDEX_UPLOAD_FILE_NAME_INVALID", "HTML 文件名必须是 index.html", 400, { fileName: c || String(a?.fileName || "").trim() });
        const l = await r(a?.indexHtml, c), u = await t.persistAdminIndexUpload(l, {
          env: n,
          kv: i,
          ctx: s
        });
        return ae({
          success: !0,
          source: "local_upload",
          revision: u.record.revision,
          assetRevision: u.record.assetRevision,
          sourceUrl: u.record.sourceUrl,
          fileName: u.record.fileName,
          bytes: u.record.bytes,
          uploadedAt: u.record.uploadedAt,
          config: Dt(u.config),
          revisions: await t.getAdminRevisions(n, {
            ctx: s,
            config: u.config
          })
        });
      } catch (c) {
        return z(String(c?.code || "ADMIN_INDEX_UPLOAD_FAILED"), ue(c, "本地 index.html 上传失败"), Pe(c?.status, 500), H(c?.details) ? c.details : null);
      }
    },
    async exportConfig(a, { env: n, ctx: s, request: i }) {
      const c = t.getKV(n), l = a?.includeSecrets === !0;
      if (l && String(i.headers.get("X-Admin-Confirm") || "").trim() !== "exportConfig") return z("CONFIRMATION_REQUIRED", "Exporting secrets requires explicit confirmation", 428);
      const u = await me(n), d = _t(n, u), f = c && d.localUploadRevision ? await t.getAdminIndexUploadRecord(c, d.localUploadRevision) : null, m = c ? (await t.loadAllNodeEntitiesFromKvStrict(c, { ctx: s })).filter(Boolean) : [], p = {
        version: $.Defaults.Version,
        exportTime: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
        nodes: m,
        config: l ? u : js(u),
        adminIndexUpload: f ? {
          version: f.version,
          revision: f.revision,
          fileName: f.fileName,
          uploadedAt: f.uploadedAt,
          bytes: f.bytes,
          html: f.html
        } : null,
        secretsRedacted: l !== !0,
        containsSecrets: l === !0
      }, h = JSON.stringify(p), g = ve(h) + 23 - 1;
      return g > 12517376 ? z("FULL_BACKUP_TOO_LARGE", "完整备份超过安全回导上限，请先分别导出节点与设置并精简超大节点字段", 413, {
        importRequestBytes: g,
        maxBytes: Dd,
        nodeCount: p.nodes.length,
        adminIndexBytes: Number(f?.bytes) || 0
      }) : new Response(h, { headers: bc() });
    },
    async exportSettings(a, { env: n, request: s }) {
      const i = a?.includeSecrets === !0;
      if (i && String(s.headers.get("X-Admin-Confirm") || "").trim() !== "exportSettings") return z("CONFIRMATION_REQUIRED", "导出完整密钥需要显式确认", 428);
      const c = await me(n);
      return ae({
        version: $.Defaults.Version,
        type: "settings-only",
        exportTime: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
        config: i ? c : js(c),
        secretsRedacted: i !== !0,
        containsSecrets: i === !0
      });
    },
    async importSettings(a, { env: n, ctx: s, kv: i }) {
      if (!i) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const c = a?.config && typeof a.config == "object" && !Array.isArray(a.config) ? a.config : a?.settings && typeof a.settings == "object" && !Array.isArray(a.settings) ? a.settings : null;
      if (!c) return z("INVALID_SETTINGS_BACKUP", "设置备份文件无效，缺少 config/settings 对象");
      const l = await me(n), u = await t.persistRuntimeConfig(qn(c, l), {
        env: n,
        kv: i,
        ctx: s,
        forceKvCommit: !0
      }), d = await t.getAdminRevisions(n, {
        ctx: s,
        config: u
      });
      return ae({
        success: !0,
        config: Dt(u),
        revisions: d,
        generatedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  };
}
function qm(o = {}, e = {}) {
  const { kernel: t } = o, { CacheManager: r } = o;
  return {
    async list(a, { env: n, ctx: s, kv: i, db: c }) {
      try {
        const l = await r.getNodesListStrict(n, s);
        return ae({
          nodes: l,
          revisions: await t.getAdminRevisionsForRead({
            env: n,
            kv: i,
            db: c
          }, {
            ctx: s,
            nodes: l
          })
        });
      } catch (l) {
        throw Mt(l, "NODE_LIST_READ_FAILED", "节点列表读取失败：KV 读取异常", "admin.read.nodes");
      }
    },
    async getDashboardD1WriteHotspot(a, { env: n, ctx: s }) {
      const i = await me(n);
      return ae(await t.buildDashboardD1WriteHotspotPayload(n, {
        config: i,
        nowMs: B()
      }));
    },
    async getDashboardCoreStats(a, { env: n, ctx: s, kv: i, db: c }) {
      const l = await me(n);
      return ae(await t.buildDashboardStatsPayload(n, {
        ctx: s,
        kv: i,
        db: c,
        config: l,
        skipD1WriteHotspot: !0
      }));
    },
    async getDashboardCachedSnapshot(a, { env: n, db: s }) {
      const i = await me(n);
      return ae({ snapshot: await t.getDashboardCachedSnapshotPayload(n, {
        db: s,
        config: i
      }) });
    },
    async getNode(a, { env: n, ctx: s, kv: i, db: c }) {
      const l = String(a?.name || "").trim();
      if (!l) return z("NODE_NAME_REQUIRED", "请提供节点路径");
      const u = await t.getNodeForRead(l, n);
      if (!u) return z("NODE_NOT_FOUND", "节点不存在", 404);
      const d = {
        name: l.toLowerCase(),
        ...u
      }, f = Wp(l, u);
      return ae({
        success: !0,
        node: d,
        warnings: f ? [f] : [],
        revisions: await t.getAdminRevisionsForRead({
          env: n,
          kv: i,
          db: c
        }, { ctx: s })
      });
    }
  };
}
function Eo(o = [], e = {}) {
  const t = e.renameMap instanceof Map ? e.renameMap : new Map(Object.entries(e.renameMap && typeof e.renameMap == "object" ? e.renameMap : {})), r = /* @__PURE__ */ new Map();
  for (const [l, u] of t.entries()) {
    const d = String(l || "").trim().toLowerCase(), f = String(u || "").trim();
    !d || !f || r.set(d, f);
  }
  const a = new Set(Et(e.removedNames || []).map((l) => String(l || "").trim().toLowerCase()).filter(Boolean)), n = e.allowedNames === void 0 ? null : Et(e.allowedNames || []).map((l) => [String(l || "").trim().toLowerCase(), String(l || "").trim()]).filter(([l, u]) => l && u), s = n ? new Map(n) : null, i = [], c = /* @__PURE__ */ new Set();
  for (const l of Et(o)) {
    const u = String(l || "").trim().toLowerCase();
    if (!u || a.has(u)) continue;
    const d = r.get(u) || String(l || "").trim(), f = d.toLowerCase();
    !f || a.has(f) || s && !s.has(f) || c.has(f) || (c.add(f), i.push(s?.get(f) || d));
  }
  return i;
}
function Xm(o, e = null, t = "") {
  const r = String(o?.proxyMode || o?.mode || "").trim().toLowerCase();
  if ([
    "direct",
    "source-direct",
    "origin-direct",
    "node-direct"
  ].includes(r) || o?.direct === !0 || o?.sourceDirect === !0 || o?.directSource === !0 || o?.direct2xx === !0) return !0;
  const a = `${Xr(o?.tags, o?.tag).join(" ")} ${o?.remark || ""}`;
  return /(?:^|[\s[(【])(?:直连|source-direct|origin-direct|node-direct)(?:$|[\s\])】])/i.test(a);
}
function Ym(o, e = null, t = "") {
  const r = qr(o);
  return r === "direct" ? !0 : r === "proxy" ? !1 : Xm(o, e, t);
}
function xa(o, e) {
  if (!o) return null;
  try {
    const t = new URL(o, e instanceof URL ? e : String(e || ""));
    return ["http:", "https:"].includes(t.protocol) ? t : null;
  } catch {
    return null;
  }
}
function pl(o) {
  return o === 301 || o === 302 || o === 303 || o === 307 || o === 308;
}
function Jm(o, e) {
  if (!o || !/^https?:\/\//i.test(o)) return !1;
  try {
    const t = new URL(o);
    return !e || t.origin !== e;
  } catch {
    return !1;
  }
}
function oi(o, e = null) {
  if (!/^https?:\/\//i.test(o)) return o;
  const t = e instanceof URL ? e : null;
  try {
    const r = new URL(o);
    return !r.username && !r.password || t && r.origin === t.origin && r.username === t.username && r.password === t.password ? o : (r.username = "", r.password = "", r.toString());
  } catch {
    return o;
  }
}
function Qm(o, e) {
  const t = o?.requestTraits || {};
  if (t.isPlaybackCriticalRequest !== !0 && t.isImage !== !0 && t.isSubtitle !== !0) return null;
  const r = e?.clientRedirectAuthPolicy || oa(e?.newHeaders || o.request.headers);
  return e && typeof e == "object" && (e.clientRedirectAuthPolicy = r), {
    policy: r,
    mode: o.effectiveMediaAuthMode,
    canDirect: r.canDirect === !0
  };
}
function Zm(o, e = "GET") {
  const t = String(e || "GET").toUpperCase();
  return o === 303 && t !== "GET" && t !== "HEAD" || (o === 301 || o === 302) && t === "POST" ? "GET" : t;
}
function ep(o = {}, e = {}) {
  const t = Ec(Ta(o, "protocolStrategy") ? o?.protocolStrategy : rs(o)), r = Number.isFinite(Number(e.hourUtc8)) ? Number(e.hourUtc8) : (/* @__PURE__ */ (/* @__PURE__ */ new Date()).getUTCHours() + 8) % 24, a = r >= 20 && r < 24;
  return t === "aggressive" ? {
    strategy: t,
    enableH2: !0,
    enableH3: !0,
    peakDowngrade: !1,
    forceH1: !1,
    isPeakHour: a
  } : t === "balanced" ? {
    strategy: t,
    enableH2: !0,
    enableH3: !0,
    peakDowngrade: !0,
    forceH1: a,
    isPeakHour: a
  } : {
    strategy: "compat",
    enableH2: !1,
    enableH3: !1,
    peakDowngrade: !0,
    forceH1: !0,
    isPeakHour: a
  };
}
function tp(o = {}, e = {}) {
  const { kernel: t } = o, { CacheManager: r, buildAdminLocalIndexUploadRecord: a } = o;
  return {
    async saveOrImport(n, { action: s, ctx: i, kv: c, env: l }) {
      const u = s === "save" ? [n] : n.nodes, d = Hs(u, l);
      if (d) return z("NODE_NAME_RESERVED", "节点路径与系统保留路由冲突，请更换后重试", 409, d);
      const f = $s(u, l);
      return f ? z(f.code, f.message, 400, f) : await cr(c)(async () => {
        const m = [], p = /* @__PURE__ */ new Map(), h = [], g = Ve(l), y = await me(l);
        for (const b of u) {
          if (!b.name || !b.target && !(Array.isArray(b.lines) && b.lines.length)) continue;
          const T = String(b.name).toLowerCase(), C = b.originalName ? String(b.originalName).toLowerCase() : null, L = !!(C && C !== T);
          if (s === "save" && (!C || C !== T) && await c.get(`${t.PREFIX}${T}`, { type: "json" }))
            return z("NODE_NAME_CONFLICT", "节点路径已存在，请更换后重试", 409, { name: T });
          let P = {};
          L ? P = await c.get(`${t.PREFIX}${C}`, { type: "json" }) || {} : P = await c.get(`${t.PREFIX}${T}`, { type: "json" }) || {};
          const A = t.buildPreparedNodeMutation(b, P, {
            previousName: C || T,
            nextName: T
          });
          if (!A) continue;
          const w = at(T, A.nextNode);
          if (w) return z("NODE_RESOURCE_LIMIT_EXCEEDED", "节点配置超过 Worker 资源限制", 400, w);
          A.dnsPlan = t.buildHostPrefixDnsSyncPlan(A.previousName, A.previousNode, A.nextName, A.nextNode, g, {
            config: y,
            forceUpsert: !0
          }), h.push(A), A.isRename && p.set(A.previousName, A.nextName), m.push(T);
        }
        if (s === "save" && m.length === 0) return z("INVALID_TARGET", "目标源站必须是有效的 http/https URL");
        Wn(h, y, l);
        const _ = m.length > 0 || p.size > 0;
        let S = !1, E = null;
        try {
          await t.applyPreparedNodeMutations(h, {
            env: l,
            kv: c,
            ctx: i,
            requestHost: g
          }), S = h.some((A) => A?.nodeChanged === !0);
          const b = _ ? await t.rebuildNodeIndexesFromKv(c, {
            ctx: i,
            syncLegacyIndex: s === "import"
          }) : null, T = Array.isArray(b?.summaries) ? b.summaries : await r.getNodesList(l, i), C = new Map((Array.isArray(T) ? T : []).map((A) => [String(A?.name || "").toLowerCase().trim(), A])), L = m.map((A) => C.get(String(A || "").toLowerCase().trim()) || null).filter(Boolean), P = Array.isArray(b?.index) ? b.index : Array.isArray(T) ? T.map((A) => A?.name) : [];
          if ((p.size > 0 || s === "save" && L.length === 1) && (E = await t.captureRuntimeConfigRollbackState(l, c), p.size > 0 && await t.commitSourceDirectNodesConfigWithinMutation(l, c, i, {
            renameMap: p,
            allowedNames: P,
            source: s === "import" ? "node_import" : "node_save",
            note: [...p.entries()].map(([A, w]) => `${A}->${w}`).join(",")
          }), s === "save" && L.length === 1)) {
            const A = L[0];
            await t.commitSingleNodeMainVideoStreamShortcutShadowWithinMutation(l, c, i, {
              originalName: n.originalName,
              nodeName: A?.name,
              mode: A?.mainVideoStreamMode,
              source: "node_save",
              note: String(A?.name || "").trim()
            });
          }
          return ae({
            success: !0,
            node: s === "save" ? L[0] : void 0,
            nodes: T,
            importedNodes: s === "import" ? L : void 0,
            revisions: await t.getAdminRevisions(l, {
              ctx: i,
              nodes: T
            })
          });
        } catch (b) {
          let T = "", C = "";
          if (E) try {
            await t.restoreCapturedRuntimeConfigState(E, {
              env: l,
              kv: c,
              ctx: i
            });
          } catch (L) {
            T = ue(L, "config_restore_failed");
          }
          if (S) try {
            await t.rollbackPreparedNodeMutations(h, {
              env: l,
              kv: c,
              ctx: i,
              requestHost: g,
              rebuildIndexes: !0
            });
          } catch (L) {
            C = ue(L, "rollback_failed");
          }
          throw b && typeof b == "object" && (String(b.code || "").trim() || (b.code = "NODE_MUTATION_FAILED"), b.status = Pe(b.status, 500), (E || S) && (b.details = {
            ...H(b.details) ? b.details : {},
            rollbackAttempted: !0,
            configRollbackError: T,
            nodeRollbackError: C
          })), b;
        }
      });
    },
    async saveMainVideoStreamPolicyShortcuts(n, { env: s, ctx: i, kv: c }) {
      return c ? await cr(c)(async () => {
        const l = await t.loadAllNodeEntitiesFromKvStrict(c, { ctx: i }), u = Array.isArray(l) ? l.map((T) => T?.name) : [], d = Eo(n?.selectedNodeNames || [], { allowedNames: u }), f = new Set(d.map((T) => String(T || "").trim().toLowerCase()).filter(Boolean));
        let m = 0;
        const p = Ve(s), h = await me(s), g = [];
        for (const T of Array.isArray(l) ? l : []) {
          if (!H(T)) continue;
          const C = String(T.name || "").trim().toLowerCase();
          if (!C) continue;
          const L = qr(T);
          let P = L;
          if (f.has(C) ? P = "direct" : L === "direct" && (P = "inherit"), P !== L) {
            const { name: A, ...w } = T, R = {
              name: C,
              ...w,
              mainVideoStreamMode: P
            }, I = t.buildPreparedNodeMutation(R, T, {
              previousName: C,
              nextName: C
            });
            if (!I) continue;
            I.nextNode = t.normalizeNode(C, I.nextNode || R, { dropLegacyDirectRouting: !0 }).data, I.dnsPlan = t.buildHostPrefixDnsSyncPlan(I.previousName, I.previousNode, I.nextName, I.nextNode, p, {
              config: h,
              forceUpsert: !0
            }), g.push(I), m += 1;
          }
        }
        Wn(g, h, s);
        const y = re(h.sourceDirectNodes || []) !== re(d), _ = m > 0 || y ? await t.captureRuntimeConfigRollbackState(s, c) : null;
        let S = null, E = h;
        try {
          m > 0 && (await t.applyPreparedNodeMutations(g, {
            env: s,
            kv: c,
            ctx: i,
            requestHost: p
          }), S = await t.rebuildNodeIndexesFromKv(c, { ctx: i })), y && (E = await t.commitRuntimeConfig({
            ...h,
            sourceDirectNodes: d
          }, {
            env: s,
            kv: c,
            ctx: i
          }));
        } catch (T) {
          let C = "", L = "";
          if (_) try {
            await t.restoreCapturedRuntimeConfigState(_, {
              env: s,
              kv: c,
              ctx: i
            });
          } catch (P) {
            C = ue(P, "config_restore_failed");
          }
          if (m > 0) try {
            await t.rollbackPreparedNodeMutations(g, {
              env: s,
              kv: c,
              ctx: i,
              requestHost: p,
              rebuildIndexes: !0
            });
          } catch (P) {
            L = ue(P, "rollback_failed");
          }
          throw T && typeof T == "object" && (String(T.code || "").trim() || (T.code = "NODE_MUTATION_FAILED"), T.status = Pe(T.status, 500), T.details = {
            ...H(T.details) ? T.details : {},
            rollbackAttempted: !0,
            configRollbackError: C,
            nodeRollbackError: L
          }), T;
        }
        const b = Array.isArray(S?.summaries) ? S.summaries : await r.getNodesList(s, i);
        return ae({
          success: !0,
          selectedNodeNames: d,
          updatedNodeCount: m,
          config: Dt(E),
          nodes: b,
          revisions: await t.getAdminRevisions(s, {
            ctx: i,
            config: E,
            nodes: b
          })
        });
      }) : z("KV_UNAVAILABLE", "KV 未绑定或不可用", 500);
    },
    async importFull(n, { env: s, ctx: i, kv: c }) {
      const l = Hs(n?.nodes, s);
      if (l) return z("NODE_NAME_RESERVED", "节点路径与系统保留路由冲突，请更换后重试", 409, l);
      const u = $s(n?.nodes, s);
      if (u) return z(u.code, u.message, 400, u);
      const d = rt(n?.config?.indexUrl || "");
      let f = null;
      if (H(n?.adminIndexUpload)) {
        const m = String(n.adminIndexUpload.fileName || "").trim().split(/[\\/]+/).pop() || "";
        if (m.toLowerCase() !== "index.html") return z("ADMIN_INDEX_BACKUP_INVALID", "完整备份中的 HTML 文件名必须是 index.html", 400);
        try {
          f = await a(n.adminIndexUpload.html, m);
        } catch (p) {
          return z(String(p?.code || "ADMIN_INDEX_BACKUP_INVALID"), ue(p, "完整备份中的 index.html 无效"), Pe(p?.status, 400), H(p?.details) ? p.details : null);
        }
        if (d && f.revision !== d) return z("ADMIN_INDEX_BACKUP_REVISION_MISMATCH", "完整备份中的 index.html 与配置版本不一致", 400, {
          expectedRevision: d,
          actualRevision: f.revision
        });
      }
      return d && !f && !await t.getAdminIndexUploadRecord(c, d) ? z("ADMIN_INDEX_BACKUP_MISSING", "完整备份缺少当前配置引用的 index.html", 400, { revision: d }) : await cr(c)(async () => {
        const m = await me(s), p = n.config ? await t.captureRuntimeConfigRollbackState(s, c) : null, h = n.config ? zc(n.config, m) : null, g = h ? ce(h) : m, y = Ve(s), _ = f ? t.buildAdminIndexUploadKey(f.revision) : "", S = _ ? await c.get(_) : null, E = n.config ? await c.get(t.ADMIN_ACTIVE_INDEX_KEY) : null, b = d ? f || await t.getAdminIndexUploadRecord(c, d) : null, T = [];
        if (Array.isArray(n.nodes)) for (const w of n.nodes) {
          if (!w.name || !w.target && !(Array.isArray(w.lines) && w.lines.length)) continue;
          const R = String(w.name).toLowerCase(), I = await c.get(`${t.PREFIX}${R}`, { type: "json" }) || {}, x = t.buildPreparedNodeMutation(w, I, {
            previousName: R,
            nextName: R
          });
          x && (x.dnsPlan = t.buildHostPrefixDnsSyncPlan(x.previousName, x.previousNode, x.nextName, x.nextNode, y, {
            previousConfig: m,
            nextConfig: g,
            forceUpsert: !0
          }), T.push(x));
        }
        Wn(T, g, s);
        let C = null, L = !1;
        try {
          _ && await c.put(_, JSON.stringify(f)), h && (b ? await c.put(t.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(b)) : await c.delete(t.ADMIN_ACTIVE_INDEX_KEY)), h && (C = await t.commitRuntimeConfig(h, {
            env: s,
            kv: c,
            ctx: i
          })), T.length > 0 && (await t.applyPreparedNodeMutations(T, {
            env: s,
            kv: c,
            ctx: i,
            requestHost: y
          }), L = !0, await t.rebuildNodeIndexesFromKv(c, {
            ctx: i,
            syncLegacyIndex: !0
          }));
        } catch (w) {
          let R = "", I = "", x = "";
          if (L) try {
            await t.rollbackPreparedNodeMutations(T, {
              env: s,
              kv: c,
              ctx: i,
              requestHost: y,
              rebuildIndexes: !0
            });
          } catch (N) {
            I = ue(N, "rollback_failed");
          }
          if (p) try {
            await t.restoreCapturedRuntimeConfigAndDnsState(p, {
              env: s,
              kv: c,
              ctx: i
            });
          } catch (N) {
            R = ue(N, "config_restore_failed");
          }
          if (_) try {
            S === null ? await c.delete(_) : await c.put(_, S);
          } catch (N) {
            x = ue(N, "admin_index_restore_failed");
          }
          if (n.config) try {
            E === null ? await c.delete(t.ADMIN_ACTIVE_INDEX_KEY) : await c.put(t.ADMIN_ACTIVE_INDEX_KEY, E);
          } catch (N) {
            x = [x, ue(N, "active_admin_index_restore_failed")].filter(Boolean).join("; ");
          }
          throw w && typeof w == "object" && (String(w.code || "").trim() || (w.code = "IMPORT_FULL_FAILED"), w.status = Pe(w.status, 500), w.details = {
            ...H(w.details) ? w.details : {},
            rollbackAttempted: !!p || L || !!_,
            configRollbackError: R,
            nodeRollbackError: I,
            adminIndexRollbackError: x
          }), w;
        }
        const P = C || await we(s), A = await r.getNodesList(s, i);
        return ae({
          success: !0,
          config: P,
          nodes: A,
          adminIndexUpload: f ? {
            revision: f.revision,
            fileName: f.fileName,
            bytes: f.bytes
          } : null,
          revisions: await t.getAdminRevisions(s, {
            ctx: i,
            config: P,
            nodes: A
          })
        });
      });
    },
    async delete(n, { ctx: s, kv: i, env: c }) {
      return await cr(i)(async () => {
        if (n.name) {
          const l = String(n.name).toLowerCase(), u = await me(c), d = await i.get(`${t.PREFIX}${l}`, { type: "json" }) || null, f = d ? t.normalizeNode(l, d || {}).data : null, m = {
            previousName: l,
            previousNode: f,
            nextName: l,
            nextNode: null,
            isRename: !1,
            nodeChanged: !!f,
            isSemanticNoop: !f,
            dnsPlan: t.buildHostPrefixDnsSyncPlan(l, f, "", null, Ve(c), { config: u })
          }, p = Ve(c);
          let h = !1, g = null;
          try {
            await t.applyPreparedNodeMutations([m], {
              env: c,
              kv: i,
              ctx: s,
              requestHost: p
            }), h = m.nodeChanged === !0;
            const y = await t.rebuildNodeIndexesFromKv(i, { ctx: s });
            g = await t.captureRuntimeConfigRollbackState(c, i), await t.commitSourceDirectNodesConfigWithinMutation(c, i, s, {
              removedNames: [l],
              allowedNames: Array.isArray(y?.index) ? y.index : [],
              source: "node_delete",
              note: l
            });
          } catch (y) {
            let _ = "", S = "";
            if (g) try {
              await t.restoreCapturedRuntimeConfigState(g, {
                env: c,
                kv: i,
                ctx: s
              });
            } catch (E) {
              _ = ue(E, "config_restore_failed");
            }
            if (h) try {
              await t.rollbackPreparedNodeMutations([m], {
                env: c,
                kv: i,
                ctx: s,
                requestHost: p,
                rebuildIndexes: !0
              });
            } catch (E) {
              S = ue(E, "rollback_failed");
            }
            throw y && typeof y == "object" && (String(y.code || "").trim() || (y.code = "NODE_DELETE_FAILED"), y.status = Pe(y.status, 500), (g || h) && (y.details = {
              ...H(y.details) ? y.details : {},
              rollbackAttempted: !0,
              configRollbackError: _,
              nodeRollbackError: S
            })), y;
          }
        }
        return ae({
          success: !0,
          revisions: await t.getAdminRevisions(c, { ctx: s })
        });
      });
    },
    async purgeCache(n, { kv: s, request: i }) {
      if (i.headers.get("X-Admin-Confirm") !== "purgeCache") return z("CONFIRMATION_REQUIRED", "敏感操作需要显式确认头", 428);
      const c = await s.get(t.CONFIG_KEY, { type: "json" }) || {};
      if (!c.cfZoneId || !c.cfApiToken) return z("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        return (await We(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(c.cfZoneId).trim())}/purge_cache`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${c.cfApiToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ purge_everything: !0 })
        })).ok ? ae({ success: !0 }) : z("PURGE_FAILED", "清理失败，请检查密钥权限");
      } catch (l) {
        return z("PURGE_ERROR", l.message);
      }
    }
  };
}
function rp(o = {}, e = {}) {
  const { kernel: t } = o;
  return {
    async tidyKvData(r, { env: a, ctx: n, kv: s, db: i }) {
      if (!s) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace");
      try {
        const c = await t.tidyKvData(a, {
          kv: s,
          db: i,
          ctx: n,
          planToken: String(r?.planToken || "").trim()
        }), l = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString();
        return await ge(t.patchOpsStatus(a, { scheduled: { kvTidy: {
          status: "success",
          lastSuccessAt: l,
          lastTriggeredBy: "manual",
          summary: c.summary
        } } }), "manual.tidy_kv.patch_success_status", null, null), ae({
          success: !0,
          ...c
        });
      } catch (c) {
        const l = c?.message || String(c);
        return await ge(t.patchOpsStatus(a, { scheduled: { kvTidy: {
          status: "failed",
          lastErrorAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          lastError: l,
          lastTriggeredBy: "manual"
        } } }), "manual.tidy_kv.patch_failed_status", { message: l }, null), z(String(c?.code || "KV_TIDY_FAILED"), l, Pe(c?.status, 500), H(c?.details) ? c.details : null);
      }
    },
    async tidyD1Data(r, { env: a, ctx: n, kv: s, db: i }) {
      if (!i) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
      try {
        const c = lt(r?.maintenanceMode, "manual"), l = await t.tidyD1Data(a, {
          db: i,
          kv: s,
          ctx: n,
          maintenanceMode: c,
          planToken: String(r?.planToken || "").trim()
        }), u = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), d = t.buildD1TidyStatusPayload(l.summary, {
          mode: "manual",
          maintenanceMode: c,
          triggeredBy: "manual",
          timestamp: u
        });
        return await ge(t.patchOpsStatus({
          kv: s,
          db: i
        }, { scheduled: { ...d } }), "manual.tidy_d1.patch_success_status", null, null), ae({
          success: !0,
          ...l
        });
      } catch (c) {
        const l = c?.message || String(c), u = t.buildD1TidyStatusPayload({
          status: "failed",
          lastError: l,
          maintenanceMode: lt(r?.maintenanceMode, "manual")
        }, {
          mode: "manual",
          maintenanceMode: lt(r?.maintenanceMode, "manual"),
          triggeredBy: "manual",
          timestamp: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
        });
        return await ge(t.patchOpsStatus({
          kv: s,
          db: i
        }, { scheduled: { ...u } }), "manual.tidy_d1.patch_failed_status", { message: l }, null), z("D1_TIDY_FAILED", l, 500);
      }
    }
  };
}
function ap(o = "") {
  return String(o || "").trim().toLowerCase() === "a" ? "a" : "cname";
}
function Jt(o = {}) {
  return {
    id: String(o?.id || "").trim(),
    type: String(o?.type || "").trim().toUpperCase(),
    name: ne(o?.name),
    content: String(o?.content || "").trim(),
    ttl: Number(o?.ttl) || 1,
    proxied: o?.proxied === !0,
    comment: typeof o?.comment == "string" ? o.comment : void 0,
    tags: Array.isArray(o?.tags) ? o.tags.map((e) => String(e)) : void 0
  };
}
async function zr(o, e, t = {}) {
  const r = [];
  let a = 1, n = 1;
  const s = 100, i = ne(t?.nameExact || "");
  do {
    const c = new URL(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(o)}/dns_records`);
    c.searchParams.set("page", String(a)), c.searchParams.set("per_page", String(s)), i && c.searchParams.set("name.exact", i);
    const l = await Re(c.toString(), e);
    Array.isArray(l?.result) && r.push(...l.result.map((u) => Jt(u)).filter((u) => u.id && u.name)), n = Number(l?.result_info?.total_pages || l?.result_info?.totalPages || 1), a += 1;
  } while (a <= n && a <= 20);
  return r;
}
function ba(o = {}, e = {}) {
  const t = {
    type: String(e.type || o?.type || "A").trim().toUpperCase(),
    name: ne(e.host || o?.name),
    content: String(e.content || "").trim(),
    ttl: Number(o?.ttl) || 1,
    proxied: o?.proxied === !0
  };
  return typeof o?.comment == "string" && (t.comment = o.comment), Array.isArray(o?.tags) && (t.tags = o.tags.map((r) => String(r))), t;
}
function np(o = "", e = "") {
  const t = String(o || "").trim().toUpperCase(), r = String(e || "").trim();
  return r ? t === "A" ? r : r.toLowerCase() : "";
}
function Wr(o = "", e = "") {
  const t = String(o || "").trim().toUpperCase(), r = np(t, e);
  return !t || !r ? "" : `${t}|${r}`;
}
function op(o = []) {
  const e = [], t = /* @__PURE__ */ new Set();
  let r = 0;
  for (const a of Array.isArray(o) ? o : []) {
    const n = String(a?.type || "").trim().toUpperCase(), s = String(a?.content || "").trim(), i = Wr(n, s);
    if (i) {
      if (t.has(i)) {
        r += 1;
        continue;
      }
      t.add(i), e.push({
        type: n,
        content: s,
        ttl: Number(a?.ttl) || 1,
        proxied: a?.proxied === !0,
        comment: typeof a?.comment == "string" ? a.comment : void 0,
        tags: Array.isArray(a?.tags) ? a.tags.map((c) => String(c)) : void 0
      });
    }
  }
  return {
    records: e,
    duplicateCount: r
  };
}
function si(o = "", e = 0) {
  return {
    type: String(o || "").trim().toUpperCase(),
    desiredCount: Math.max(0, Number(e) || 0),
    identicalCount: 0,
    updatedCount: 0,
    createdCount: 0,
    deletedCount: 0
  };
}
function sp(o = "a", e = {}, t = {}) {
  const r = {};
  let a = 0, n = 0, s = 0, i = 0, c = 0;
  for (const u of [
    "A",
    "AAAA",
    "CNAME"
  ]) {
    const d = e?.[u];
    !d || typeof d != "object" || (r[u] = {
      type: u,
      desiredCount: Math.max(0, Number(d.desiredCount) || 0),
      identicalCount: Math.max(0, Number(d.identicalCount) || 0),
      updatedCount: Math.max(0, Number(d.updatedCount) || 0),
      createdCount: Math.max(0, Number(d.createdCount) || 0),
      deletedCount: Math.max(0, Number(d.deletedCount) || 0)
    }, a += r[u].desiredCount, n += r[u].identicalCount, s += r[u].updatedCount, i += r[u].createdCount, c += r[u].deletedCount);
  }
  const l = s + i + c;
  return {
    mode: String(o || "a").trim().toLowerCase(),
    desiredCount: a,
    identicalCount: n,
    updatedCount: s,
    createdCount: i,
    deletedCount: c,
    changedCount: l,
    dedupedDesiredCount: Math.max(0, Number(t?.dedupedDesiredCount) || 0),
    familySummaries: r,
    unchangedOnly: l === 0 && n > 0
  };
}
async function ip(o = {}, e) {
  const t = String(o?.cfZoneId || "").trim(), r = String(o?.cfApiToken || "").trim();
  if (!t || !r) throw new Error("cf_api_missing");
  const a = ne(new URL(e.url).hostname), n = await tl(t, r, {
    scope: "dns.resolve_admin_context.zone_lookup",
    context: { requestHost: a }
  }), s = await zr(t, r), i = String(n?.name || "").trim() || "", c = i || ne(s[0]?.name || "");
  let l = a;
  Ca(l, c || i) || (l = ne(await Rm({
    cfAccountId: o.cfAccountId,
    cfZoneId: t,
    cfApiToken: r,
    zoneNameFallback: c || i || a
  })));
  const u = s.filter((f) => Ar(f.type)), d = l ? u.filter((f) => ne(f.name) === l) : u;
  return {
    cfZoneId: t,
    cfApiToken: r,
    zone: n,
    zoneName: i,
    currentHost: l,
    requestHost: a,
    totalRecords: s.length,
    editableRecords: u,
    currentHostRecords: d
  };
}
function cp(o = {}) {
  const e = ce(o), t = String(e.cfZoneId || "").trim(), r = String(e.cfApiToken || "").trim();
  if (!t || !r) {
    const a = /* @__PURE__ */ new Error("请在账号设置中完善 Zone ID 和 API 令牌");
    throw a.code = "CF_API_ERROR", a.status = 400, a;
  }
  return {
    cfZoneId: t,
    cfApiToken: r
  };
}
function lp(o = []) {
  return {
    A: si("A", o.filter((e) => e.type === "A").length),
    AAAA: si("AAAA", o.filter((e) => e.type === "AAAA").length)
  };
}
function up(o = "", e = [], t = []) {
  const r = /* @__PURE__ */ new Map(), a = [];
  let n = 0;
  for (const i of e) {
    const c = Wr(o, i?.content);
    c && r.set(c, (r.get(c) || 0) + 1);
  }
  for (const i of t) {
    const c = Wr(o, i?.content), l = r.get(c) || 0;
    if (l > 0) {
      n += 1, r.set(c, l - 1);
      continue;
    }
    a.push(i);
  }
  const s = [];
  for (const i of e) {
    const c = Wr(o, i?.content), l = r.get(c) || 0;
    l <= 0 || (s.push(i), r.set(c, l - 1));
  }
  return {
    identicalCount: n,
    reusableCurrentRecords: a,
    pendingDesiredRecords: s
  };
}
function gl(o = "", e = "", t = "", r = "", a = {}) {
  const n = async () => (await zr(o, e, { nameExact: t })).filter((s) => ne(s.name) === t && Ar(s.type));
  return {
    async deleteRecord(s) {
      s?.id && await Re(`${r}/${encodeURIComponent(s.id)}`, e, { method: "DELETE" });
    },
    async updateRecord(s, i, c) {
      const l = ba(s, {
        host: t,
        type: i,
        content: c
      });
      return Jt((await Re(`${r}/${encodeURIComponent(s.id)}`, e, {
        method: "PUT",
        body: JSON.stringify(l)
      }))?.result || {
        id: s.id,
        ...l
      });
    },
    async createRecord(s, i, c = a) {
      const l = ba(c, {
        host: t,
        type: s,
        content: i
      });
      try {
        return {
          record: Jt((await Re(r, e, {
            method: "POST",
            body: JSON.stringify(l)
          }))?.result || l),
          reusedExisting: !1
        };
      } catch (u) {
        if (String(u?.message || u || "").includes("81058")) {
          const d = (await n()).find((f) => ne(f?.name) === t && String(f?.type || "").toUpperCase() === String(s || "").trim().toUpperCase() && Wr(f?.type, f?.content) === Wr(s, i));
          if (d) return {
            record: Jt(d),
            reusedExisting: !0
          };
        }
        throw u;
      }
    },
    async listCurrentHostRecords() {
      return await n();
    }
  };
}
async function ii(o = "", e = [], t = [], r = {}, a = {}) {
  const n = up(o, e, t);
  r.identicalCount += n.identicalCount;
  const { reusableCurrentRecords: s, pendingDesiredRecords: i } = n;
  for (let c = 0; c < i.length; c += 1) {
    const l = i[c], u = s[c];
    if (u) {
      await a.updateRecord(u, o, l.content), r.updatedCount += 1;
      continue;
    }
    (await a.createRecord(o, l.content, t[0]))?.reusedExisting === !0 ? r.identicalCount += 1 : r.createdCount += 1;
  }
  for (let c = i.length; c < s.length; c += 1)
    await a.deleteRecord(s[c]), r.deletedCount += 1;
}
async function dp({ env: o, kv: e, dnsHistoryRepository: t, config: r, host: a, mode: n = "a", desiredRecords: s = [], requestHost: i = "", skipHistory: c = !1, includeAllRecords: l = !0, includeHistory: u = !0 }) {
  const { cfZoneId: d, cfApiToken: f } = cp(r || await we(o));
  let m = !1, p = !1, h = "";
  const g = op(s), y = g.records, _ = lp(y);
  try {
    const S = await ls(d, f, { scope: "dns.persist_records.zone_lookup" }), E = String(S?.name || "").trim() || "";
    if (E && !Ca(a, E)) {
      const D = /* @__PURE__ */ new Error("当前站点不在该 Zone 下");
      throw D.code = "INVALID_HOST", D.status = 400, D;
    }
    const b = (await zr(d, f, { nameExact: a })).filter((D) => ne(D.name) === a && Ar(D.type)), T = {
      baseRecord: b[0] || {
        name: a,
        ttl: 1,
        proxied: !1
      },
      zoneRecordsUrl: `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(d)}/dns_records`
    }, C = gl(d, f, a, T.zoneRecordsUrl, T.baseRecord), L = b.map((D) => Jt(D));
    let P = !1;
    const A = {
      ...C,
      async deleteRecord(D) {
        return P = !0, await C.deleteRecord(D);
      },
      async updateRecord(D, U, V) {
        return P = !0, await C.updateRecord(D, U, V);
      },
      async createRecord(D, U, V) {
        return P = !0, await C.createRecord(D, U, V);
      }
    };
    let w = [], R = null;
    try {
      if (n === "cname") {
        const D = b.filter((M) => M.type === "CNAME"), U = b.filter((M) => M.type === "A" || M.type === "AAAA");
        for (const M of U) await A.deleteRecord(M);
        for (let M = 1; M < D.length; M += 1) await A.deleteRecord(D[M]);
        const V = D[0] || null, X = y[0], v = Number(X?.ttl) || 1, O = X?.proxied === !0;
        if (V) {
          const M = String(V.content || "").trim() !== X.content, k = Number(V.ttl) !== v, j = V.proxied === !0 !== O;
          (M || k || j) && await A.updateRecord({
            ...V,
            ttl: v,
            proxied: O
          }, "CNAME", X.content);
        } else await A.createRecord("CNAME", X.content, {
          ...T.baseRecord,
          ttl: v,
          proxied: O
        });
        w = await zr(d, f, { nameExact: a }), c || (R = await t.recordDnsHostHistory(e, d, a, {
          name: a,
          type: "CNAME",
          content: X.content,
          actor: "admin",
          source: "ui",
          requestHost: i,
          savedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
        }));
      } else {
        const D = b.filter((U) => U.type === "CNAME");
        for (const U of D) await A.deleteRecord(U);
        await ii("A", y.filter((U) => U.type === "A"), b.filter((U) => U.type === "A"), _.A, A), await ii("AAAA", y.filter((U) => U.type === "AAAA"), b.filter((U) => U.type === "AAAA"), _.AAAA, A), w = await zr(d, f, { nameExact: a });
      }
    } catch (D) {
      if (P) {
        m = !0;
        try {
          const U = await C.listCurrentHostRecords();
          for (const V of U) await C.deleteRecord(V);
          for (const V of L) await C.createRecord(V.type, V.content, V);
          p = !0;
        } catch (U) {
          p = !1, h = String(U?.message || U || "unknown_rollback_error");
        }
      }
      throw D;
    }
    const I = w.filter((D) => Ar(D.type)), x = I.filter((D) => ne(D.name) === a), N = u === !0 ? R || await t.getDnsHostHistory(e, d, a) : [], F = n === "a" ? sp(n, _, { dedupedDesiredCount: g.duplicateCount }) : null;
    return {
      ok: !0,
      zoneId: d,
      zoneName: E,
      currentHost: a,
      totalRecords: w.length,
      editableRecordCount: I.length,
      filteredCount: x.length,
      records: x,
      ...l === !0 ? { allRecords: I } : {},
      allRecordsIncluded: l === !0,
      history: N,
      mode: n,
      syncSummary: F,
      rollbackAttempted: m,
      rollbackSucceeded: p,
      rollbackError: h
    };
  } catch (S) {
    throw S.details = {
      ...S?.details && typeof S.details == "object" ? S.details : {},
      rollbackAttempted: m,
      rollbackSucceeded: p,
      rollbackError: h
    }, S;
  }
}
function fp(o = {}, e = {}) {
  const { kernel: t } = o, { persistCloudflareDnsRecordsForHost: r } = o;
  return {
    async listDnsRecords(a, { env: n, kv: s, request: i }) {
      const c = ce(await we(n)), l = String(c.cfZoneId || "").trim(), u = String(c.cfApiToken || "").trim(), d = a?.includeAllRecords !== !1;
      if (!l || !u) return z("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        const f = await ip(c, i), m = f.currentHostRecords, p = f.currentHost ? await t.getDnsHostHistory(s, l, f.currentHost) : [];
        return ae({
          ok: !0,
          zoneId: l,
          zoneName: f.zoneName,
          currentHost: f.currentHost,
          totalRecords: f.totalRecords,
          editableRecordCount: f.editableRecords.length,
          filteredCount: m.length,
          records: m,
          ...d === !0 ? { allRecords: f.editableRecords } : {},
          allRecordsIncluded: d === !0,
          history: p
        });
      } catch (f) {
        const m = String(f?.message || f || "unknown_error");
        return z("CF_DNS_LIST_FAILED", m.includes("cf_api_http_403") ? "Cloudflare DNS 读取失败：API 令牌权限不足（需要 Zone.DNS:Read）" : m.includes("cf_api_http_401") ? "Cloudflare DNS 读取失败：API 令牌无效" : "Cloudflare DNS 读取失败", 400, { reason: m });
      }
    },
    async setDnsHistoryFallback(a, { env: n, kv: s }) {
      const i = ne(a?.host || ""), c = String(a?.entryId || "").trim(), l = a?.enabled !== !1;
      if (!i) return z("MISSING_PARAMS", "host 不能为空");
      if (l && !c) return z("MISSING_PARAMS", "entryId 不能为空");
      const u = ce(await we(n)), d = String(u.cfZoneId || "").trim();
      if (!d) return z("CF_API_ERROR", "请先在账号设置中保存 Zone ID");
      try {
        return ae({
          ok: !0,
          history: await t.setDnsHostHistoryPreferredFallback(s, d, i, c, l)
        });
      } catch (f) {
        const m = String(f?.message || f || "unknown_error");
        return m.includes("dns_history_entry_not_found") ? z("DNS_HISTORY_ENTRY_NOT_FOUND", "指定的 DNS 历史记录不存在", 404) : z("DNS_HISTORY_FALLBACK_UPDATE_FAILED", "设置 DNS 默认回退值失败", 400, { reason: m });
      }
    },
    async createDnsRecord(a, n) {
      return e.updateDnsRecord(a, n);
    },
    async updateDnsRecord(a, { env: n, kv: s, request: i }) {
      const c = String(i.headers.get("X-Admin-Confirm") || "").trim();
      if (c !== "updateDnsRecord" && c !== "createDnsRecord") return z("CONFIRMATION_REQUIRED", "敏感 DNS 操作需要显式确认头", 428);
      const l = String(a?.recordId || a?.id || "").trim(), u = ne(a?.host || a?.name || ""), d = String(a?.type || "").trim().toUpperCase(), f = String(a?.content || "").trim(), m = a?.skipHistory === !0;
      if (!Ar(d)) return z("INVALID_TYPE", "Type 仅允许 A / AAAA / CNAME");
      const p = Za(d, f);
      if (p) return z("INVALID_CONTENT", p);
      if (!l && !u) return z("MISSING_PARAMS", "host 不能为空");
      const h = ce(await we(n)), g = String(h.cfZoneId || "").trim(), y = String(h.cfApiToken || "").trim();
      if (!g || !y) return z("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      let _ = null, S = !1, E = !1, b = "";
      try {
        const T = await ls(g, y, { scope: "dns.update_record.zone_lookup" }), C = String(T?.name || "").trim(), L = ne(new URL(i.url).hostname);
        let P = null;
        if (l) {
          const w = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(g)}/dns_records/${encodeURIComponent(l)}`, R = Jt((await Re(w, y))?.result || null);
          if (!R?.id) return z("NOT_FOUND", "DNS 记录不存在", 404);
          const I = String(R?.type || "").toUpperCase();
          if (!Ar(I)) return z("UNSUPPORTED_RECORD_TYPE", "该 DNS 记录类型不支持编辑", 400, { currentType: I });
          const x = u || R.name;
          if (!x) return z("MISSING_PARAMS", "host 不能为空");
          if (C && !Ca(x, C)) return z("INVALID_HOST", "记录名称必须位于当前 Zone 下");
          const N = ba(R, {
            host: x,
            type: d,
            content: f
          });
          P = Jt((await Re(w, y, {
            method: "PUT",
            body: JSON.stringify(N)
          }))?.result || {
            id: l,
            ...N
          }), _ = async () => {
            const F = ba(R, {
              host: R.name,
              type: R.type,
              content: R.content
            });
            await Re(w, y, {
              method: "PUT",
              body: JSON.stringify(F)
            });
          };
        } else {
          if (C && !Ca(u, C)) return z("INVALID_HOST", "记录名称必须位于当前 Zone 下");
          const w = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(g)}/dns_records`, R = ba({
            name: u,
            ttl: 1,
            proxied: !1
          }, {
            host: u,
            type: d,
            content: f
          });
          P = Jt((await Re(w, y, {
            method: "POST",
            body: JSON.stringify(R)
          }))?.result || R), _ = async () => {
            if (!P?.id) throw new Error("created_dns_record_id_missing");
            await Re(`${w}/${encodeURIComponent(P.id)}`, y, { method: "DELETE" });
          };
        }
        let A;
        try {
          A = P.type === "CNAME" && !m ? await t.recordDnsHostHistory(s, g, P.name, {
            name: P.name,
            type: P.type,
            content: P.content,
            actor: "admin",
            source: "ui",
            requestHost: L,
            savedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
          }) : await t.getDnsHostHistory(s, g, P.name);
        } catch (w) {
          if (S = typeof _ == "function", S) try {
            await _(), E = !0;
          } catch (R) {
            b = ue(R, "dns_rollback_failed");
          }
          throw w;
        }
        return ae({
          ok: !0,
          record: P,
          history: A
        });
      } catch (T) {
        const C = String(T?.message || T || "unknown_error");
        return z("CF_DNS_UPDATE_FAILED", C.includes("cf_api_http_403") ? "Cloudflare DNS 更新失败：API 令牌权限不足（需要 Zone.DNS:Edit）" : C.includes("cf_api_http_401") ? "Cloudflare DNS 更新失败：API 令牌无效" : "Cloudflare DNS 更新失败", 400, {
          reason: C,
          rollbackAttempted: S,
          rollbackSucceeded: E,
          rollbackError: b
        });
      }
    },
    async saveDnsRecords(a, { env: n, kv: s, request: i }) {
      if (i.headers.get("X-Admin-Confirm") !== "saveDnsRecords") return z("CONFIRMATION_REQUIRED", "敏感 DNS 操作需要显式确认头", 428);
      const c = ap(a?.mode), l = ne(a?.host || ""), u = a?.includeAllRecords === !0, d = Array.isArray(a?.records) ? a.records : [];
      if (!l) return z("MISSING_PARAMS", "host 不能为空");
      const f = [];
      if (c === "cname") {
        const g = String(d[0]?.content || "").trim(), y = Za("CNAME", g);
        if (y) return z("INVALID_CONTENT", y);
        f.push({
          type: "CNAME",
          content: g
        });
      } else {
        const g = d.map((y) => ({
          type: String(y?.type || "").trim().toUpperCase(),
          content: String(y?.content || "").trim()
        })).filter((y) => y.type || y.content);
        if (!g.length) return z("INVALID_CONTENT", "A 模式至少保留 1 条 A / AAAA 记录");
        for (const y of g) {
          if (!["A", "AAAA"].includes(y.type)) return z("INVALID_TYPE", "A 模式仅允许 A / AAAA");
          const _ = Za(y.type, y.content, { allowCname: !1 });
          if (_) return z("INVALID_CONTENT", _);
          f.push(y);
        }
      }
      const m = ce(await we(n)), p = String(m.cfZoneId || "").trim(), h = String(m.cfApiToken || "").trim();
      if (!p || !h) return z("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        const g = ne(new URL(i.url).hostname);
        return ae(await r({
          env: n,
          kv: s,
          config: m,
          host: l,
          mode: c,
          desiredRecords: f,
          requestHost: g,
          skipHistory: !1,
          includeAllRecords: u
        }));
      } catch (g) {
        const y = String(g?.message || g || "unknown_error");
        return z("CF_DNS_SAVE_FAILED", y.includes("cf_api_http_403") ? "Cloudflare DNS 保存失败：API 令牌权限不足（需要 Zone.DNS:Edit）" : y.includes("cf_api_http_401") ? "Cloudflare DNS 保存失败：API 令牌无效" : "Cloudflare DNS 保存失败", 400, {
          reason: y,
          rollbackAttempted: g?.details?.rollbackAttempted === !0,
          rollbackSucceeded: g?.details?.rollbackSucceeded === !0,
          rollbackError: String(g?.details?.rollbackError || "")
        });
      }
    }
  };
}
async function na(o, e, t) {
  const r = Array.isArray(o) ? o : [];
  if (r.length === 0) return [];
  if (typeof t != "function") throw new TypeError("worker must be a function");
  const a = Number(e), n = Number.isFinite(a) && a > 0 ? Math.min(r.length, Math.max(1, Math.floor(a))) : 1, s = Array.from({ length: r.length });
  let i = 0;
  const c = Array.from({ length: n }, async () => {
    for (; i < r.length; ) {
      const l = i;
      i += 1;
      const u = Promise.resolve().then(() => t(r[l]));
      s[l] = u, await u.catch(() => {
      });
    }
  });
  return await Promise.all(c), Promise.all(s);
}
var mp = Object.freeze([{
  id: "cloudflare",
  label: "Cloudflare",
  endpoint: "https://cloudflare-dns.com/dns-query"
}]), hl = 30 * 1e3, pp = hl, gp = "emby-proxy-ui-dns-probe/1.0", hp = 2400 * 1e3, yp = 35 * 1e3, Sp = "dns_ip_pool_fetch_lock:", _p = "sys:dns_ip_pool_fetch_lock:v1:";
function bp(o = {}, e = [], t = {}) {
  const r = /* @__PURE__ */ new Set(), a = [];
  for (const s of Array.isArray(e) ? e : []) {
    const i = _r(s);
    if (!i) continue;
    const c = String(i.ip || "").trim().toLowerCase();
    !c || r.has(c) || (r.add(c), a.push(i));
  }
  const n = a.slice(0, jr(o?.ipLimit));
  return {
    id: String(o?.id || ""),
    name: String(o?.name || ""),
    sourceType: Rt(o?.sourceType || o?.source_type || ""),
    status: n.length > 0 ? "success" : "empty",
    count: n.length,
    items: n,
    lastFetchAt: String(t.lastFetchAt || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString())
  };
}
async function Ep(o = {}, e = $.Defaults.DnsIpSourceFetchMaxBytes) {
  const t = String(o?.url || "").trim();
  if (!t) throw new Error("empty_source_url");
  const r = new AbortController(), a = setTimeout(() => r.abort(), hl);
  try {
    const n = await We(t, {
      headers: { "User-Agent": Td },
      redirect: "follow",
      signal: r.signal
    });
    if (!n.ok) throw new Error(`HTTP_${n.status}`);
    const s = await Me(n, e);
    if (s.exceeded) throw new Error("SOURCE_TOO_LARGE");
    const i = s.text, c = ji(o?.builtinId || o?.builtin_id || "");
    return (c === "all" ? Gu(i) : c === "preferred" ? Vu(i, { limit: jr(o?.ipLimit) }) : Go(i, { limit: jr(o?.ipLimit) })).map((l) => ({
      ...l,
      sourceKind: "api",
      sourceLabel: o?.name || t
    }));
  } catch (n) {
    throw Vt(n) ? new Error("FETCH_TIMEOUT") : n;
  } finally {
    clearTimeout(a);
  }
}
function Ap(o = {}, e = "", t = "A") {
  const r = new URL(String(o?.endpoint || ""));
  return r.searchParams.set("name", ne(e)), r.searchParams.set("type", String(t || "A").toUpperCase()), r;
}
async function Tp(o = {}, e = "", t = "A") {
  const r = new AbortController(), a = setTimeout(() => r.abort(), pp);
  try {
    const n = await We(Ap(o, e, t).toString(), {
      headers: { accept: "application/dns-json" },
      redirect: "follow",
      signal: r.signal
    });
    if (!n.ok) throw new Error(`DOH_HTTP_${n.status}`);
    const s = await Me(n, Ln);
    return Ku(s.exceeded ? null : JSON.parse(s.text || "null")).map((i) => ({
      ...i,
      sourceKind: "domain",
      sourceLabel: String(e || "").trim()
    }));
  } catch (n) {
    throw Vt(n) ? new Error("DOH_TIMEOUT") : n;
  } finally {
    clearTimeout(a);
  }
}
function Rp(o = []) {
  const e = (Array.isArray(o) ? o : []).map((n) => Array.isArray(n) ? [...n] : []).filter((n) => n.length > 0), t = [], r = /* @__PURE__ */ new Set();
  let a = e.length > 0;
  for (; a; ) {
    a = !1;
    for (const n of e) {
      for (; n.length; ) {
        const s = n.shift(), i = String(s?.ip || "").trim().toLowerCase();
        if (!(!i || r.has(i))) {
          r.add(i), t.push(s);
          break;
        }
      }
      n.length && (a = !0);
    }
  }
  return t;
}
async function Cp(o = {}) {
  const e = ne(o?.domain || "");
  if (!e) throw new Error("empty_source_domain");
  const t = [], r = [], a = [];
  for (const i of ["A", "AAAA"]) for (const c of mp) a.push({
    resolver: c,
    recordType: i
  });
  const n = await na(a, Math.min(2, Math.max(1, a.length)), async ({ resolver: i, recordType: c }) => {
    try {
      return {
        resolver: i,
        recordType: c,
        items: await Tp(i, e, c),
        error: ""
      };
    } catch (l) {
      return {
        resolver: i,
        recordType: c,
        items: [],
        error: String(l?.message || l || "unknown_doh_error")
      };
    }
  });
  for (const i of n) {
    const c = Array.isArray(i?.items) ? i.items : [];
    if (c.length) {
      t.push(c);
      continue;
    }
    String(i?.error || "").trim() && r.push(`${String(i?.resolver?.id || "resolver")}:${String(i?.recordType || "A")}=${String(i?.error || "unknown_doh_error")}`);
  }
  const s = Rp(t);
  if (!s.length && n.length > 0 && r.length === n.length) {
    const i = r.every((c) => String(c || "").includes("DOH_TIMEOUT"));
    throw new Error(i ? "DOH_TIMEOUT" : r.join("; "));
  }
  return s.map((i) => ({
    ...i,
    sourceKind: "domain",
    sourceLabel: o?.name || e
  }));
}
async function wp(o = {}, e = $.Defaults.DnsIpSourceFetchMaxBytes) {
  const t = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), r = vt(o);
  try {
    return bp(r, r.sourceType === "domain" ? await Cp(r) : await Ep(r, e), { lastFetchAt: t });
  } catch (a) {
    return {
      id: String(r?.id || ""),
      name: String(r?.name || ""),
      sourceType: Rt(r?.sourceType || r?.source_type || ""),
      status: "failed",
      count: 0,
      items: [],
      error: String(a?.message || a || "unknown_error"),
      lastFetchAt: t
    };
  }
}
async function ci(o, e = "", t = "UNKNOWN", r = {}) {
  const { probeRepository: a } = r, n = String(e || "").trim(), s = Qe(n), i = String(t || "UNKNOWN").trim().toUpperCase() || "UNKNOWN";
  if (!n || !s) return {
    ip: n,
    entryColo: i,
    probeStatus: "network_error",
    latencyMs: null,
    cfRay: "",
    coloCode: "",
    cityName: "",
    countryCode: "UNKNOWN",
    countryName: "未知",
    probedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt: B()
  };
  if (o && r.forceRefresh !== !0 && r.skipCacheRead !== !0) {
    const m = await a.getDnsIpProbeCacheEntry(o, n, i);
    if (m) return m;
  }
  const c = new AbortController(), l = setTimeout(() => c.abort(), fe(r.probeTimeoutMs ?? r.timeoutMs, $.Defaults.DnsIpProbeTimeoutMs, 250, 3e4)), u = B(), d = s === "IPv6" ? `http://[${n}]/` : `http://${n}/`, f = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString();
  try {
    const m = await We(d, {
      headers: Yo(gp),
      method: "HEAD",
      redirect: "manual",
      signal: c.signal
    }), p = Math.max(0, B() - u), h = String(m.headers.get("CF-RAY") || m.headers.get("cf-ray") || "").trim(), g = String(m.headers.get("Server") || m.headers.get("server") || "").trim(), y = Wi(h), _ = y ? "ok" : /cloudflare/i.test(g) ? "cf_header_missing" : "non_cloudflare", S = ju(y), E = {
      ip: n,
      entryColo: i,
      probeStatus: _,
      latencyMs: p,
      cfRay: h,
      coloCode: S.coloCode,
      cityName: S.cityName,
      countryCode: S.countryCode,
      countryName: S.countryName,
      probedAt: f,
      expiresAt: B() + $.Defaults.DnsIpProbeCacheTtlSec * 1e3
    };
    return o && r.skipCacheWrite !== !0 && await a.upsertDnsIpProbeCacheEntry(o, E), E;
  } catch (m) {
    const p = {
      ip: n,
      entryColo: i,
      probeStatus: Vt(m) ? "timeout" : "network_error",
      latencyMs: null,
      cfRay: "",
      coloCode: "",
      cityName: "",
      countryCode: "UNKNOWN",
      countryName: "未知",
      probedAt: f,
      expiresAt: B() + $.Defaults.DnsIpProbeCacheTtlSec * 1e3
    };
    return o && r.skipCacheWrite !== !0 && await a.upsertDnsIpProbeCacheEntry(o, p), p;
  } finally {
    clearTimeout(l);
  }
}
async function yl(o = [], e, t = "UNKNOWN", r = {}) {
  const a = [], n = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set(), i = String(t || "UNKNOWN").trim().toUpperCase() || "UNKNOWN";
  for (const S of Array.isArray(o) ? o : []) {
    const E = String(S?.ip || S?.content || "").trim(), b = Qe(E) || zi(S?.ipType || S?.ip_type || S?.type || "");
    if (!E || !b) continue;
    const T = {
      id: String(S?.id || S?.recordId || `${r.scope || "dns"}-${ie(`${E}|${S?.sourceKind || S?.source_kind || ""}`)}`),
      ip: E,
      ipType: b,
      recordId: String(S?.recordId || S?.id || ""),
      host: String(S?.host || S?.name || r.host || ""),
      sourceKind: String(S?.sourceKind || S?.source_kind || r.scope || "shared_pool"),
      sourceLabel: String(S?.sourceLabel || S?.source_label || r.sourceLabel || ""),
      lineLabel: Yr(S?.lineLabel || S?.line_label || ""),
      remark: String(S?.remark || ""),
      createdAt: String(S?.createdAt || S?.created_at || ""),
      updatedAt: String(S?.updatedAt || S?.updated_at || ""),
      probeStatus: Qa(S?.probeStatus || S?.probe_status || ""),
      latencyMs: Number.isFinite(Number(S?.latencyMs ?? S?.latency_ms)) ? Math.max(0, Math.round(Number(S?.latencyMs ?? S?.latency_ms))) : null,
      cfRay: String(S?.cfRay || S?.cf_ray || ""),
      coloCode: String(S?.coloCode || S?.colo_code || "").trim().toUpperCase(),
      cityName: String(S?.cityName || S?.city_name || ""),
      countryCode: String(S?.countryCode || S?.country_code || "").trim().toUpperCase() || "UNKNOWN",
      countryName: String(S?.countryName || S?.country_name || "") || "未知",
      probedAt: String(S?.probedAt || S?.probed_at || "")
    };
    a.push(T), n.set(E.toLowerCase(), E);
  }
  if (!a.length) return {
    items: [],
    probeEntryColo: i,
    probeDataSource: "cache"
  };
  const c = /* @__PURE__ */ new Map(), l = [], u = [...n.values()], d = e ? await r.probeRepository.getDnsIpProbeCacheEntries(e, u, i) : [];
  for (const S of Array.isArray(d) ? d : []) {
    const E = String(S?.ip || "").trim().toLowerCase();
    E && c.set(E, S);
  }
  for (const S of u)
    c.has(String(S || "").toLowerCase()) && r.forceRefresh !== !0 || l.push(S);
  const f = r.deferProbe === !0 && !!r.ctx?.waitUntil, m = fe(r.syncProbeLimit, $.Defaults.DnsIpWorkspaceSyncProbeLimit, 0, 64), p = f && l.length > m ? l.slice(0, m) : l, h = f && l.length > m ? l.slice(m) : [], g = fe(r.probeConcurrency, $.Defaults.DnsIpProbeConcurrency, 1, 4);
  let y = "cache";
  p.length > 0 && (y = "live_sync"), h.length > 0 && (y = "live_deferred");
  const _ = await na(p, g, async (S) => {
    const E = await ci(e, S, t, {
      ...r,
      skipCacheRead: !0,
      skipCacheWrite: !0
    });
    return c.set(String(S || "").toLowerCase(), E), E;
  });
  return e && _.length && await r.probeRepository.upsertDnsIpProbeCacheEntries(e, _), h.length && (h.forEach((S) => s.add(String(S || "").toLowerCase())), r.ctx.waitUntil((async () => {
    const S = await na(h, g, (E) => ci(e, E, t, {
      ...r,
      skipCacheRead: !0,
      skipCacheWrite: !0
    }));
    e && S.length && await r.probeRepository.upsertDnsIpProbeCacheEntries(e, S);
  })().catch((S) => {
    console.warn("[DNS IP Workspace] Deferred probe failed:", S?.message || S);
  }))), {
    items: a.map((S) => {
      const E = c.get(S.ip.toLowerCase());
      return E ? {
        ...S,
        probeStatus: E.probeStatus,
        latencyMs: E.latencyMs,
        cfRay: E.cfRay,
        coloCode: E.coloCode,
        cityName: E.cityName,
        countryCode: E.countryCode,
        countryName: E.countryName,
        probedAt: E.probedAt
      } : S;
    }).map((S) => !s.has(String(S.ip || "").toLowerCase()) || String(S.probedAt || "").trim() ? S : {
      ...S,
      probeStatus: "pending"
    }),
    probeEntryColo: i,
    probeDataSource: Ao(y)
  };
}
function Lp(o = {}) {
  const e = Vo(o?.items || []);
  return {
    sourceResults: Ji(o?.sourceResults || []),
    importedCount: Math.max(0, Number(o?.importedCount) || e.length),
    items: e,
    enabledSourceCount: Math.max(0, Number(o?.enabledSourceCount) || 0),
    cachedAt: ln(o?.cachedAtMs),
    expiresAt: ln(o?.expiresAtMs)
  };
}
async function Np(o = [], e, t = "UNKNOWN", r = null, a = {}) {
  const n = r && typeof r.waitUntil == "function" ? r : { waitUntil() {
  } }, s = await yl(o, e, t, {
    probeRepository: a.probeRepository,
    forceRefresh: !1,
    scope: "shared_pool",
    ctx: n,
    deferProbe: !0,
    syncProbeLimit: fe(a?.syncProbeLimit, 0, 0, 64),
    probeTimeoutMs: fe(a?.probeTimeoutMs, 500, 250, 3e4)
  });
  return Array.isArray(s?.items) ? s.items : [];
}
function Ao(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "live_deferred" ? "live_deferred" : e === "live_sync" ? "live_sync" : "cache";
}
function Ip(o = "", e = "") {
  const t = Ao(o), r = Ao(e), a = {
    cache: 0,
    live_sync: 1,
    live_deferred: 2
  };
  return (a[r] || 0) > (a[t] || 0) ? r : t;
}
function Dp(o = {}) {
  const e = [];
  Array.isArray(o?.localPoolItems) && e.push(...o.localPoolItems), Array.isArray(o?.poolItems) && e.push(...o.poolItems), Array.isArray(o?.sharedPoolItems) && e.push(...o.sharedPoolItems);
  const t = [], r = /* @__PURE__ */ new Set();
  for (const a of e) {
    const n = _r(a);
    if (!n) continue;
    const s = String(n.ip || "").trim().toLowerCase();
    !s || r.has(s) || (r.add(s), t.push({
      ...a,
      ...n
    }));
  }
  return t;
}
function Mp(o = [], e = []) {
  const t = /* @__PURE__ */ new Map(), r = (a) => {
    for (const n of Array.isArray(a) ? a : []) {
      const s = _r(n);
      s && t.set(String(s.ip || "").trim().toLowerCase(), {
        ...n,
        ...s
      });
    }
  };
  return r(o), r(e), [...t.values()];
}
function Pp(o = "") {
  return `${Sp}${String(o || "").trim()}`;
}
async function xp({ kv: o = null, db: e = null, leaseRepository: t = null } = {}, r = "") {
  const a = Pp(r);
  if (!a || a === "dns_ip_pool_fetch_lock:") return {
    acquired: !1,
    reason: "empty_signature"
  };
  const n = `${B()}-${Math.random().toString(36).slice(2, 10)}`;
  return e ? {
    ...await t.tryAcquireScheduledLeaseWithDb(e, {
      scope: a,
      token: n,
      owner: "dns_ip_pool_fetch",
      leaseMs: yp
    }),
    token: n,
    key: a
  } : {
    acquired: !1,
    reason: "db_unavailable",
    backend: "d1",
    token: n,
    key: a
  };
}
async function Op({ kv: o = null, db: e = null, leaseRepository: t = null } = {}, r = null) {
  if (!r?.token) return !1;
  const a = String(r?.key || "").trim();
  return e && a ? await t.releaseScheduledLeaseWithDb(e, r.token, { scope: a }) : !1;
}
async function vp({ kv: o = null, db: e = null, ctx: t = null, sourceList: r = [], maxBytes: a = $.Defaults.DnsIpSourceFetchMaxBytes, poolRepository: n = null } = {}) {
  const s = (Array.isArray(r) ? r : []).map((S, E) => vt(S, E)), i = s.filter((S) => S.enabled === !0 && fr(S)), c = fe($.Defaults.DnsIpSourceConcurrency, $.Defaults.DnsIpSourceConcurrency, 1, 4), l = await na(i, i.some((S) => Rt(S?.sourceType) === "domain") ? Math.min(c, 2) : c, async (S) => wp(S, a)), u = [], d = /* @__PURE__ */ new Map();
  for (const S of l)
    d.set(String(S?.id || ""), S), Array.isArray(S?.items) && u.push(...S.items);
  const f = s.map((S, E) => {
    const b = d.get(String(S?.id || ""));
    return vt(b ? {
      ...S,
      lastFetchAt: b.lastFetchAt,
      lastFetchStatus: b.status,
      lastFetchCount: b.count
    } : S, E);
  }), m = await ge(n.persistDnsIpPoolSources({
    kv: o,
    db: e
  }, f, null), "dns_ip_pool.refresh.persist_source_state", {
    sourceCount: f.length,
    enabledSourceCount: i.length
  }, f), p = br(u), h = Vo(p), g = Ji(l);
  let y = "", _ = "";
  if (e) {
    const S = Ja(s, a);
    if (S && ad(l)) {
      const E = B(), b = E + hp, T = await n.upsertDnsIpPoolFetchCacheEntry(e, {
        signature: S,
        items: p,
        sourceResults: l,
        importedCount: h.length,
        enabledSourceCount: i.length,
        cachedAtMs: E,
        expiresAtMs: b,
        createdAt: new Date(E).toISOString(),
        updatedAt: new Date(E).toISOString()
      });
      y = ln(T?.cachedAtMs), _ = ln(T?.expiresAtMs);
    }
  }
  return i.length && await ge(n.bumpDnsIpPoolRevision({
    kv: o,
    db: e
  }, {
    lastFetchAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
    lastFetchSourceCount: i.length,
    lastFetchImportedCount: h.length
  }, null), "dns_ip_pool.refresh.bump_revision", {
    enabledSourceCount: i.length,
    importedCount: h.length
  }, null), {
    sourceList: m,
    sourceResults: g,
    importedCount: h.length,
    items: h,
    enabledSourceCount: i.length,
    cachedAt: y,
    expiresAt: _
  };
}
function Fp(o = {}, e = {}) {
  const { kernel: t } = o, { buildDnsIpPoolWorkspacePreviewItems: r, buildDnsIpWorkspaceItems: a, releaseDnsIpPoolFetchRefreshLock: n, runDnsIpPoolSourcesLiveRefresh: s, tryAcquireDnsIpPoolFetchRefreshLock: i } = o;
  return {
    async getDnsIpWorkspace(c, { env: l, kv: u, db: d, request: f, ctx: m }) {
      try {
        const p = c?.forceRefresh === !0;
        d && await t.ensureDnsIpWorkspaceSchema(d);
        const h = await me(l), g = ha(f), y = qd(f);
        let _ = await t.getDnsIpPoolSourcesForRead({
          kv: u,
          db: d
        });
        const S = Dp(c), E = $.Defaults.DnsIpSourceFetchMaxBytes, b = _.filter((N) => N.enabled === !0 && fr(N));
        let T = [], C = "empty", L = !1;
        if (p && b.length > 0) {
          const N = await s({
            kv: u,
            db: d,
            ctx: m,
            sourceList: _,
            maxBytes: E
          });
          _ = Array.isArray(N?.sourceList) ? N.sourceList : _, T = Array.isArray(N?.items) ? N.items : [], C = "live_sync";
        } else {
          const N = Ja(_, E), F = d && N ? await t.getDnsIpPoolFetchCacheEntry(d, N) : null;
          if (F)
            T = Array.isArray(F?.items) ? F.items : [], C = "cache";
          else if (b.length > 0 && m?.waitUntil && N) {
            const D = await i({
              kv: u,
              db: d
            }, N);
            D?.acquired === !0 && (L = !0, C = "live_deferred", m.waitUntil((async () => {
              try {
                await s({
                  kv: u,
                  db: d,
                  sourceList: _,
                  maxBytes: E
                });
              } catch (U) {
                console.warn("[DNS IP Workspace] background source snapshot refresh failed:", U?.message || U);
              } finally {
                await n({
                  kv: u,
                  db: d
                }, D);
              }
            })()));
          }
        }
        const P = Mp(T, S), A = await a(P, d, g, {
          forceRefresh: p,
          scope: "shared_pool",
          ctx: m,
          deferProbe: !0,
          syncProbeLimit: 0,
          probeTimeoutMs: 500
        }), w = [], R = Array.isArray(A?.items) ? A.items : [], I = await t.getOpsStatusSection({
          kv: u,
          db: d
        }, "dnsIpPool"), x = /* @__PURE__ */ new Map();
        for (const N of R) {
          const F = String(N?.countryCode || "").trim().toUpperCase();
          if (!F) continue;
          const D = x.get(F) || {
            code: F,
            name: String(N?.countryName || "未知"),
            count: 0
          };
          D.count += 1, x.set(F, D);
        }
        return ae({
          zoneId: String(h.cfZoneId || "").trim(),
          zoneName: "",
          host: "",
          requestColo: g,
          probeEntryColo: g,
          probeDataSource: Ip("cache", A?.probeDataSource),
          sourceSnapshotStatus: C,
          backgroundRefreshQueued: L,
          requestCountryCode: y.countryCode,
          requestCountryName: y.countryName,
          currentHostItems: w,
          sharedPoolItems: R,
          sourceList: _,
          availableCountries: [...x.values()].sort((N, F) => String(N.code || "").localeCompare(String(F.code || ""))),
          summary: sd(w, R),
          dnsIpPoolRevision: t.getDnsIpPoolRevisionFromStatus(I),
          generatedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          ...Cr(),
          revisions: await t.getAdminRevisionsForRead({
            env: l,
            kv: u,
            db: d
          }, {
            ctx: m,
            config: h
          })
        });
      } catch (p) {
        throw Mt(p, "DNS_IP_WORKSPACE_READ_FAILED", "独立 IP 池工作区读取失败：KV 读取异常", "admin.read.dns_ip_workspace");
      }
    },
    async importDnsIpPoolItems(c, { env: l, kv: u, db: d, request: f }) {
      const m = String(c?.text || c?.content || "").trim();
      if (!m) return z("EMPTY_IMPORT_TEXT", "请先提供要导入的文本内容");
      const p = String(c?.sourceKind || "manual").trim().toLowerCase() || "manual", h = String(c?.sourceLabel || "").trim() || (p === "file" ? "文件导入" : "手动导入"), g = Go(m).map((S) => ({
        ...S,
        sourceKind: p,
        sourceLabel: h
      })), y = await a(g, d, ha(f), {
        scope: "shared_pool",
        forceRefresh: !1
      }), _ = Array.isArray(y?.items) ? y.items : [];
      return ae({
        success: !0,
        importedCount: _.length,
        items: _,
        revisions: await t.getAdminRevisions({
          env: l,
          kv: u,
          db: d
        })
      });
    },
    async saveDnsIpPoolSources(c, { env: l, kv: u, db: d, ctx: f }) {
      if (!d) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
      const m = await t.persistDnsIpPoolSources({
        kv: u,
        db: d
      }, c?.sources || [], f);
      return await t.bumpDnsIpPoolRevision({
        kv: u,
        db: d
      }, {
        lastSourceConfigAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
        sourceCount: m.length
      }, f), ae({
        success: !0,
        sourceList: m,
        dnsIpPoolRevision: await t.getOpsStatusSection({
          kv: u,
          db: d
        }, "dnsIpPool").then((p) => t.getDnsIpPoolRevisionFromStatus(p)).catch(() => ""),
        ...Cr(),
        revisions: await t.getAdminRevisions({
          env: l,
          kv: u,
          db: d
        })
      });
    },
    async getDnsIpPoolSources(c, { env: l, kv: u, db: d }) {
      try {
        if (!d) return ae({
          success: !0,
          sourceList: [],
          dnsIpPoolRevision: "",
          ...Cr(),
          revisions: await t.getAdminRevisionsForRead({
            env: l,
            kv: u,
            db: d
          }, { config: await me(l) })
        });
        d && await t.ensureDnsIpWorkspaceSchema(d);
        const [f, m, p] = await Promise.all([
          me(l),
          t.getDnsIpPoolSourcesForRead({
            kv: u,
            db: d
          }),
          t.getOpsStatusSection({
            kv: u,
            db: d
          }, "dnsIpPool")
        ]);
        return ae({
          success: !0,
          sourceList: m,
          dnsIpPoolRevision: t.getDnsIpPoolRevisionFromStatus(p),
          ...Cr(),
          revisions: await t.getAdminRevisionsForRead({
            env: l,
            kv: u,
            db: d
          }, { config: f })
        });
      } catch (f) {
        throw Mt(f, "DNS_IP_POOL_SOURCES_READ_FAILED", "独立 IP 池抓取源读取失败：D1 读取异常", "admin.read.dns_ip_pool_sources");
      }
    },
    async refreshDnsIpPoolFromSources(c, { env: l, kv: u, db: d, ctx: f, request: m }) {
      try {
        if (!d) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
        d && await t.ensureDnsIpWorkspaceSchema(d);
        const p = fe(c?.maxBytes, $.Defaults.DnsIpSourceFetchMaxBytes, 1024, 8 * 1024 * 1024), h = await t.getDnsIpPoolSources({
          kv: u,
          db: d
        }), g = Ja(h, p), y = d && g ? await t.getDnsIpPoolFetchCacheEntry(d, g) : null;
        if (y) {
          let E = !1;
          if (f?.waitUntil) {
            const C = await i({
              kv: u,
              db: d
            }, g);
            C?.acquired === !0 && (E = !0, f.waitUntil((async () => {
              try {
                await s({
                  kv: u,
                  db: d,
                  sourceList: h,
                  maxBytes: p
                });
              } catch (L) {
                console.warn("[DNS IP Pool] background refresh failed:", L?.message || L);
              } finally {
                await n({
                  kv: u,
                  db: d
                }, C);
              }
            })()));
          }
          const b = Lp(y), T = await r(b.items, d, ha(m), f, { syncProbeLimit: 0 });
          return ae({
            success: !0,
            sourceResults: b.sourceResults,
            sourceList: h,
            importedCount: b.importedCount,
            items: T,
            cacheStatus: "d1",
            backgroundRefreshQueued: E,
            cachedAt: b.cachedAt,
            expiresAt: b.expiresAt,
            dnsIpPoolRevision: await t.getOpsStatusSection({
              kv: u,
              db: d
            }, "dnsIpPool").then((C) => t.getDnsIpPoolRevisionFromStatus(C)).catch(() => ""),
            ...Cr(),
            revisions: await t.getAdminRevisions({
              env: l,
              kv: u,
              db: d
            })
          });
        }
        const _ = await s({
          kv: u,
          db: d,
          ctx: f,
          sourceList: h,
          maxBytes: p
        }), S = await r(_.items, d, ha(m), f, {
          syncProbeLimit: 0,
          probeTimeoutMs: 500
        });
        return ae({
          success: !0,
          sourceResults: _.sourceResults,
          sourceList: _.sourceList,
          importedCount: _.importedCount,
          items: S,
          cacheStatus: "live",
          backgroundRefreshQueued: !1,
          cachedAt: _.cachedAt,
          expiresAt: _.expiresAt,
          dnsIpPoolRevision: await t.getOpsStatusSection({
            kv: u,
            db: d
          }, "dnsIpPool").then((E) => t.getDnsIpPoolRevisionFromStatus(E)).catch(() => ""),
          ...Cr(),
          revisions: await t.getAdminRevisions({
            env: l,
            kv: u,
            db: d
          })
        });
      } catch (p) {
        if (wn(p)) throw p;
        const h = ue(p, "unknown_error"), g = /* @__PURE__ */ new Error(`更新服务端共享快照失败: ${h}`);
        throw g.code = "DNS_IP_POOL_REFRESH_FAILED", g.status = 500, g.details = { reason: h }, g;
      }
    },
    async deleteDnsIpPoolItems(c, { env: l, kv: u, db: d, ctx: f }) {
      d && await t.ensureDnsIpWorkspaceSchema(d);
      const m = nd(c?.target);
      if (m === "shared_snapshot") {
        if (!d) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
        const h = await t.getDnsIpPoolSourcesForRead({
          kv: u,
          db: d
        }), g = Ja(h, $.Defaults.DnsIpSourceFetchMaxBytes), y = g ? await t.getDnsIpPoolFetchCacheEntry(d, g) : null, _ = od(y, c?.ips || []);
        if (y && g && _.deletedCount > 0) {
          const S = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), E = Math.max(0, Number(y?.cachedAtMs) || 0), b = Math.max(E, Number(y?.expiresAtMs) || E), T = Math.max(0, Number(y?.enabledSourceCount) || (Array.isArray(h) ? h.filter((C) => C?.enabled === !0 && fr(C)).length : 0));
          await t.upsertDnsIpPoolFetchCacheEntry(d, {
            signature: g,
            items: _.items,
            sourceResults: _.sourceResults,
            importedCount: _.items.length,
            enabledSourceCount: T,
            cachedAtMs: E,
            expiresAtMs: b,
            createdAt: String(y?.createdAt || S),
            updatedAt: S
          }), await t.bumpDnsIpPoolRevision({
            kv: u,
            db: d
          }, {
            lastSnapshotDeleteAt: S,
            lastSnapshotDeleteCount: _.deletedCount
          }, f);
        }
        return ae({
          success: !0,
          target: m,
          deletedCount: _.deletedCount,
          deletedIps: _.deletedIps,
          revisions: await t.getAdminRevisions({
            env: l,
            kv: u,
            db: d
          })
        });
      }
      const p = Qi(c?.ips || []).normalizedIps;
      return ae({
        success: !0,
        target: m,
        deletedCount: d ? await t.deleteDnsIpPoolItems(d, p) : p.length,
        revisions: await t.getAdminRevisions({
          env: l,
          kv: u,
          db: d
        })
      });
    },
    async fillDnsDraftFromIpPool(c) {
      const l = [];
      for (const f of Array.isArray(c?.ips) ? c.ips : []) {
        const m = String(f?.ip || f || "").trim(), p = Qe(m);
        !m || !p || l.push({
          type: p === "IPv6" ? "AAAA" : "A",
          content: m
        });
      }
      if (!l.length) return z("EMPTY_IP_SELECTION", "请先选择至少一个可用 IP");
      const u = [], d = /* @__PURE__ */ new Set();
      for (const f of l) {
        const m = `${f.type}:${f.content.toLowerCase()}`;
        d.has(m) || (d.add(m), u.push(f));
      }
      return u.sort((f, m) => f.type !== m.type ? f.type.localeCompare(m.type) : f.content.localeCompare(m.content)), ae({
        success: !0,
        mode: "a",
        records: u
      });
    }
  };
}
function Up(o = {}, e = {}) {
  const { kernel: t } = o;
  return {
    async testTelegram(r) {
      const { tgBotToken: a, tgChatId: n } = r;
      if (!a || !n) return z("MISSING_PARAMS", "请先填写 Bot Token 和 Chat ID");
      try {
        return await t.sendTelegramMessage({
          tgBotToken: a,
          tgChatId: n,
          text: `✅ Emby Proxy: Telegram 机器人测试通知成功！
如果您能看到这条消息，说明您的通知配置完全正确。`
        }), ae({ success: !0 });
      } catch (s) {
        return z("NETWORK_ERROR", s.message);
      }
    },
    async sendDailyReport(r, { env: a }) {
      try {
        const n = await t.sendDailyTelegramReport(a);
        return ae({
          success: !0,
          sentCount: Number(n?.sentCount) || 0,
          reportKinds: Array.isArray(n?.reportKinds) ? n.reportKinds : []
        });
      } catch (n) {
        return z("REPORT_FAILED", n.message);
      }
    },
    async sendPredictedAlert(r, { env: a }) {
      try {
        const n = await t.maybeSendRuntimeAlerts(a, null, {
          ignoreCooldown: !0,
          persistState: !1,
          triggeredBy: "manual_predict"
        });
        return ae({
          success: !0,
          sent: n?.sent === !0,
          issueCount: Number(n?.issueCount) || 0,
          reason: String(n?.reason || "").trim()
        });
      } catch (n) {
        return z("ALERT_PREDICT_FAILED", n.message);
      }
    },
    async pingNode(r, { env: a, ctx: n, request: s }) {
      const i = String(s?.headers?.get("User-Agent") || "").trim(), c = await we(a), l = fe(r.timeout, c.pingTimeout ?? Sd, 1e3, 18e4);
      if (r.target) {
        const E = t.normalizeSingleTarget(r.target);
        if (!E) return z("INVALID_TARGET", "目标源站必须是有效的 http/https URL");
        const b = await t.pingTarget(E, l, { userAgent: i });
        return ae({
          ...b.ok ? { ms: b.elapsedMs } : {},
          probe: b,
          target: E,
          usedCache: !1,
          scope: "target"
        });
      }
      const u = String(r.name || "").trim(), d = await t.getNode(u, a, n);
      if (!d || !Array.isArray(d.lines) || !d.lines.length) return z("NOT_FOUND", "节点不存在");
      const f = String(r.lineId || "").trim(), m = f ? d.lines.filter((E) => E.id === f) : d.lines.slice();
      if (f && !m.length) return z("LINE_NOT_FOUND", "线路不存在", 404);
      const p = await Promise.all(m.map(async (E) => {
        const b = await t.pingTarget(E.target, l, { userAgent: i });
        return {
          id: String(E?.id || "").trim(),
          name: String(E?.name || "").trim(),
          target: String(E?.target || "").trim(),
          latencyMs: b.ok ? b.elapsedMs : null,
          probe: b,
          latencyUpdatedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
        };
      })), h = d.lines.map((E) => {
        const b = p.find((T) => T.id === E.id);
        return b ? {
          id: b.id,
          name: b.name,
          target: b.target,
          latencyMs: b.latencyMs,
          probe: b.probe,
          latencyUpdatedAt: b.latencyUpdatedAt
        } : {
          id: String(E?.id || "").trim(),
          name: String(E?.name || "").trim(),
          target: String(E?.target || "").trim()
        };
      }), g = t.resolveActiveLineId(d.activeLineId, h, h), y = t.getActiveNodeLine({
        ...d,
        lines: h,
        activeLineId: g
      }), _ = f ? h.find((E) => E.id === f) : y, S = t.buildNodeSummary(u.toLowerCase(), d).summary || { name: u.toLowerCase() };
      return ae({
        ..._?.probe?.ok ? { ms: _.probe.elapsedMs } : {},
        probe: _?.probe || null,
        usedCache: !1,
        sorted: !1,
        activeLineId: g,
        activeLineName: y?.name || "",
        line: _ || null,
        node: {
          ...S,
          lines: h,
          activeLineId: g
        }
      });
    }
  };
}
function kp(o = {}, e = {}) {
  const { kernel: t } = o, { LogQueryPlanner: r } = o;
  return {
    async getLogs(a, { db: n, env: s }) {
      if (!n) return ae({ error: "D1 not configured" }, 500);
      const i = r.normalizeRequest(a), { filters: c } = i, l = s ? await we(s) : {}, u = await t.resolveLogsReadiness({
        db: n,
        kv: t.getKV(s)
      }), d = r.resolveSearch(c, l, u);
      if (d.errorResponse) return d.errorResponse;
      const { effectiveSearchMode: f, searchFallbackReason: m } = d;
      if (l.logEnabled === !1) return r.buildDisabledResponse(i, u, f, m);
      if (u.schemaReady !== !0) return z("LOG_SCHEMA_NOT_READY", "日志表尚未初始化，请先点击“初始化日志表”", 400, {
        effectiveSearchMode: f,
        searchFallbackReason: m,
        revisions: { logsRevision: u.revision }
      });
      const p = r.buildSqlPlan(c, i, l, f);
      if (p.errorResponse) return p.errorResponse;
      const h = await r.executeSqlPlan(n, i, p);
      return h.errorResponse ? h.errorResponse : r.buildSuccessResponse(i, u, {
        logs: h.logs,
        total: h.total,
        totalPages: h.totalPages,
        searchMode: h.searchMode,
        effectiveSearchMode: f,
        searchFallbackReason: m,
        hasPrevPage: h.hasPrevPage,
        hasNextPage: h.hasNextPage,
        nextCursor: h.nextCursor
      });
    },
    async clearLogs(a, { db: n, env: s, ctx: i, request: c }) {
      if (c.headers.get("X-Admin-Confirm") !== "clearLogs") return z("CONFIRMATION_REQUIRED", "敏感操作需要显式确认头", 428);
      if (!n) return ae({ error: "D1 not configured" }, 500);
      await t.ensureLogsBaseSchema(n), await t.ensureStatsHourlySchema(n);
      const l = B(), u = ur.get(n);
      u.LogClearEpochMs = Math.max(u.LogClearEpochMs || 0, l), await t.patchOpsStatus(s || n, { log: {
        clearEpochMs: l,
        clearEpochAt: new Date(l).toISOString()
      } }, i);
      const d = u.LogFlushTask;
      if (d) try {
        await d;
      } catch {
      }
      u.LogQueue.length = 0, u.LogDedupe.clear(), u.LogLastFlushAt = 0, await n.prepare(`DELETE FROM ${t.LOGS_TABLE}`).run(), await t.clearStatsHourly(n).catch(() => !1);
      let f = !1;
      try {
        f = await t.rebuildLogsFts(n);
      } catch (g) {
        console.warn("clearLogs FTS rebuild failed", g);
      }
      const m = await t.isLogsFtsReady(n), p = await t.hasStatsHourlyTable(n), h = await t.bumpLogsRevision(s || { db: n }, {
        schemaReady: !0,
        ftsReady: m,
        statsReady: p,
        clearEpochMs: l,
        clearEpochAt: new Date(l).toISOString(),
        lastClearAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
      }, i);
      return ae({
        success: !0,
        ftsRebuilt: f,
        revisions: { logsRevision: t.getLogsRevisionFromStatus(h?.log || h) }
      });
    },
    async getD1SchemaStatus(a, { db: n, env: s }) {
      if (!n) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库", 503);
      const i = await t.buildD1SchemaRepairPlan(n);
      let c = {
        token: "",
        expiresAt: 0
      };
      return i.phase === "destructive" && i.blockingIssues.length === 0 && (c = await t.createD1SchemaRepairToken(s, i)), ae({
        success: !0,
        status: {
          ...i.status,
          repairableIssues: i.repairableIssues,
          highRiskIssues: i.highRiskIssues,
          blockingIssues: i.blockingIssues
        },
        repairPlan: {
          version: i.version,
          phase: i.phase,
          contractVersion: i.contractVersion,
          contractHash: i.contractHash,
          schemaCookie: i.schemaCookie,
          planHash: i.planHash,
          risk: i.risk,
          repairableIssues: i.repairableIssues,
          highRiskIssues: i.highRiskIssues,
          blockingIssues: i.blockingIssues,
          steps: i.steps,
          repairToken: c.token,
          expiresAt: c.expiresAt ? (/* @__PURE__ */ new Date(c.expiresAt * 1e3)).toISOString() : ""
        }
      });
    },
    async initLogsDb(a, { db: n, env: s, request: i }) {
      if (!n) return z("D1_NOT_CONFIGURED", "D1 database is not configured", 503);
      const c = await t.initializeD1Database(n, {
        includeFts: !0,
        env: s,
        repairMode: String(a?.repairMode || "safe").trim() || "safe",
        repairToken: String(a?.repairToken || "").trim(),
        confirmHighRisk: String(i?.headers?.get("X-Admin-Confirm") || "").trim() === "repairD1Schema"
      }), l = c.status, u = l.ftsReady === !0, d = l.tables?.[t.STATS_HOURLY_TABLE] === !0, f = l.schemaReady === !0 ? await t.bumpLogsRevision(n, {
        schemaReady: !0,
        ftsReady: u,
        statsReady: d,
        categoryEnabled: !0
      }) : null;
      return ae({
        success: c.completed === !0 || c.pendingHighRisk === !0,
        schemaReady: l.schemaReady === !0,
        pendingHighRisk: c.pendingHighRisk === !0,
        categoryEnabled: !0,
        ftsReady: u,
        statsReady: d,
        initialization: c,
        steps: c.steps,
        status: l,
        revisions: f ? { logsRevision: t.getLogsRevisionFromStatus(f?.log || f) } : {}
      });
    }
  };
}
function Hp(o = {}) {
  const { kernel: e } = o, t = {}, r = tu([
    {
      name: "dashboard",
      handlers: km({
        ...o,
        kernel: e
      }, t)
    },
    {
      name: "config",
      handlers: jm({
        ...o,
        kernel: e
      }, t)
    },
    {
      name: "backup",
      handlers: qm({
        ...o,
        kernel: e
      }, t)
    },
    {
      name: "nodes",
      handlers: tp({
        ...o,
        kernel: e
      }, t)
    },
    {
      name: "maintenance",
      handlers: rp({
        ...o,
        kernel: e
      }, t)
    },
    {
      name: "dns-records",
      handlers: fp({
        ...o,
        kernel: e
      }, t)
    },
    {
      name: "dns-pool",
      handlers: Fp({
        ...o,
        kernel: e
      }, t)
    },
    {
      name: "notifications",
      handlers: Up({
        ...o,
        kernel: e
      }, t)
    },
    {
      name: "database",
      handlers: kp({
        ...o,
        kernel: e
      }, t)
    }
  ], { aliases: {
    import: "saveOrImport",
    save: "saveOrImport"
  } });
  for (const [a, n] of Object.entries(r.handlers)) t[a] = n;
  return r;
}
function $p(o = {}) {
  const e = Hp(o);
  return {
    adminActionHandlers: e.handlers,
    adminActionNames: e.names,
    resolveAdminAction: e.resolve
  };
}
function Je(o, e) {
  const t = H(o) ? o : {}, r = H(e) ? e : {}, a = { ...t };
  for (const [n, s] of Object.entries(r))
    s !== void 0 && (H(s) && H(t[n]) ? a[n] = Je(t[n], s) : H(s) ? a[n] = Je({}, s) : a[n] = s);
  return a;
}
function He(o, e, t, r) {
  o.has(e) && o.delete(e), o.set(e, t);
  const a = Math.floor(Number(r));
  if (!(!Number.isFinite(a) || a < 1))
    for (; o.size > a; ) {
      const n = o.keys().next().value;
      if (n === void 0) break;
      o.delete(n);
    }
}
function _n(o, e) {
  if (!o.has(e)) return;
  const t = o.get(e);
  return o.delete(e), o.set(e, t), t;
}
function gr(o = void 0) {
  const e = o === void 0 ? At.current() : be(o);
  e.NodesRevisionCacheGeneration += 1, e.NodesRevisionCache = null;
}
function li(o, e = null) {
  const t = be(e);
  t.NodesRevisionCacheGeneration += 1, t.NodesRevisionCache = {
    loaded: !0,
    revision: String(o || "").trim(),
    exp: Date.now() + $.Defaults.NodesRevisionCacheTtlMs
  };
}
function xe(o, e = At.current()) {
  const t = String(o || "").trim().toLowerCase(), r = t && Number(e.NodeCacheGenerations.get(t)) || 0, a = r ? `node:${r}` : `missing:${e.NodeCacheGenerationEvictionEpoch}`;
  return `${e.NodeCacheResetGeneration}:${a}`;
}
function Bp(o = [], e = At.current()) {
  for (const t of Array.isArray(o) ? o : [o]) {
    const r = String(t || "").trim().toLowerCase();
    if (!r) continue;
    !e.NodeCacheGenerations.has(r) && e.NodeCacheGenerations.size >= $.Defaults.NodeCacheMax && (e.NodeCacheGenerationEvictionEpoch += 1);
    const a = ++e.NodeCacheGenerationNonce;
    He(e.NodeCacheGenerations, r, a, $.Defaults.NodeCacheMax);
  }
}
function ui(o = At.current()) {
  o.NodeCacheResetGeneration += 1, o.NodeCacheGenerations.clear();
}
var Kp = new TextEncoder();
function ve(o) {
  return Kp.encode(String(o ?? "")).byteLength;
}
function Sl(o, e, t = {}) {
  const r = ve(e), a = Math.max(1, Number(t.limitBytes) || er), n = /* @__PURE__ */ new Error(`D1 value exceeds the ${a}-byte compatibility budget`);
  return n.code = "D1_VALUE_TOO_LARGE", n.status = 400, n.details = {
    field: String(o || "value"),
    actualBytes: r,
    limitBytes: a,
    platformLimitBytes: Md
  }, n;
}
function en(o, e, t = {}) {
  if (ve(e) > Math.max(1, Number(t.limitBytes) || er)) throw Sl(o, e, t);
  return e;
}
var di = /* @__PURE__ */ new WeakMap();
function at(o, e = {}) {
  const t = String(o || "").trim().toLowerCase(), r = e !== null && typeof e == "object";
  if (r) {
    const n = di.get(e);
    if (n && n.name === t) return n.violation;
  }
  const a = zp(o, e);
  return r && di.set(e, {
    name: t,
    violation: a
  }), a;
}
function zp(o, e = {}) {
  const t = String(o || "").trim().toLowerCase(), r = H(e) ? e : {}, a = Array.isArray(r.lines) ? r.lines : [];
  if (a.length > uo) return {
    nodeName: t,
    field: "lines",
    actual: a.length,
    limit: uo
  };
  const n = H(r.headers) ? r.headers : {}, s = Object.entries(n);
  if (s.length > Os) return {
    nodeName: t,
    field: "headers.count",
    actual: s.length,
    limit: Os
  };
  let i = 0;
  for (const [l, u] of s) {
    const d = ve(l), f = ve(u);
    if (d > Fs) return {
      nodeName: t,
      field: `headers.${l}.keyBytes`,
      actual: d,
      limit: Fs
    };
    if (f > Us) return {
      nodeName: t,
      field: `headers.${l}.valueBytes`,
      actual: f,
      limit: Us
    };
    i += d + f;
  }
  if (i > vs) return {
    nodeName: t,
    field: "headers.bytes",
    actual: i,
    limit: vs
  };
  for (const l of xd) {
    const u = ve(r[l]);
    if (u > wr) return {
      nodeName: t,
      field: l,
      actual: u,
      limit: wr
    };
  }
  for (let l = 0; l < (Array.isArray(r.tags) ? r.tags.length : 0); l += 1) {
    const u = ve(r.tags[l]);
    if (u > wr) return {
      nodeName: t,
      field: `tags.${l}`,
      actual: u,
      limit: wr
    };
  }
  for (let l = 0; l < a.length; l += 1) for (const u of [
    "id",
    "name",
    "target"
  ]) {
    const d = ve(a[l]?.[u]);
    if (d > wr) return {
      nodeName: t,
      field: `lines.${l}.${u}`,
      actual: d,
      limit: wr
    };
  }
  let c = 0;
  try {
    c = ve(JSON.stringify(r));
  } catch {
    return {
      nodeName: t,
      field: "record",
      actual: null,
      limit: Gn
    };
  }
  return c > Gn ? {
    nodeName: t,
    field: "record.bytes",
    actual: c,
    limit: Gn
  } : null;
}
function Wp(o, e = {}) {
  const t = at(o, e);
  return t ? {
    code: "NODE_RESOURCE_LIMIT_EXCEEDED",
    ...t
  } : null;
}
async function xr(o, e = null) {
  const t = be(e), r = t.NodeIndexMutationChain.catch(() => null).then(async () => {
    t.NodesListCache = null, t.NodesIndexCache = null, gr(e);
    try {
      return await o();
    } catch (a) {
      throw t.NodesListCache = null, t.NodesIndexCache = null, gr(e), a;
    }
  });
  return t.NodeIndexMutationChain = r.catch(() => null), await r;
}
var Gp = "cf_dashboard_cache:", _l = "sys:cf_dash_cache", Vp = 1800 * 1e3, fi = 1440 * 60 * 1e3, jp = "sys:cf_daily_traffic", tn = 7, qp = 1080 * 60 * 60, Xp = tn;
function To(o, e = "") {
  return `${Gp}${encodeURIComponent(String(o || "default").trim() || "default")}:${encodeURIComponent(String(e || "current").trim() || "current")}`;
}
function mi(o, e = "") {
  return `${_l}:${encodeURIComponent(String(o || "default").trim() || "default")}:${encodeURIComponent(String(e || "current").trim() || "current")}`;
}
function pi(o = /* @__PURE__ */ new Date(), e = $.Defaults.ScheduleUtcOffsetMinutes) {
  const t = ka(o, e), r = t.shiftedDate.getUTCFullYear(), a = t.shiftedDate.getUTCMonth(), n = Date.UTC(r, a, 1) - t.utcOffsetMinutes * 60 * 1e3, s = Date.UTC(r, a + 1, 1) - t.utcOffsetMinutes * 60 * 1e3, i = t.now.getTime();
  return {
    ...t,
    monthKey: `${r}-${String(a + 1).padStart(2, "0")}`,
    periodLabel: `${r}年${a + 1}月`,
    startTs: n,
    endTs: Math.min(Math.max(n, i), s - 1),
    nextMonthTs: s
  };
}
function Yp(o = "", e = "", t = 0) {
  return [
    "dashboard_monthly_traffic",
    1,
    encodeURIComponent(String(o || "default").trim() || "default"),
    encodeURIComponent(String(e || "current").trim() || "current"),
    Fe(t)
  ].join(":");
}
function Jp(o = "") {
  const e = String(o || "").trim();
  return e ? new Request(`https://dashboard-monthly-traffic-cache.invalid/${encodeURIComponent(e)}`) : null;
}
function bl(o = "", e = "") {
  return `${jp}:${encodeURIComponent(String(o || "default").trim() || "default")}:${encodeURIComponent(String(e || "current").trim() || "current")}`;
}
async function gi(o, e, t) {
  if (!o || typeof o.get != "function" || !t) return null;
  const r = bl(e, t);
  try {
    const a = await o.get(r, { type: "json" }), n = Number(a?.bytes);
    return Number.isFinite(n) && n >= 0 ? n : null;
  } catch (a) {
    return Le("dashboard.daily_traffic_archive_read_failed", a, { cacheKey: r }), null;
  }
}
async function hi(o, e, { dateKey: t = "", bytes: r = 0, dayEndTs: a = 0 } = {}) {
  if (!o || typeof o.put != "function" || !t) return !1;
  const n = bl(e, t);
  try {
    return await o.put(n, JSON.stringify({
      bytes: Math.max(0, Number(r) || 0),
      dateKey: t,
      dayEndTs: Math.max(0, Number(a) || 0)
    }), { expirationTtl: qp }), !0;
  } catch (s) {
    return Le("dashboard.daily_traffic_archive_write_failed", s, { cacheKey: n }), !1;
  }
}
function or(o = {}) {
  const e = o && typeof o == "object" ? { ...o } : {};
  return {
    period: "month",
    periodKey: String(e.periodKey || "").trim(),
    periodLabel: String(e.periodLabel || "本月").trim() || "本月",
    traffic: String(e.traffic || "0 B").trim() || "0 B",
    totalBytes: Math.max(0, Number(e.totalBytes) || 0),
    cfAnalyticsLoaded: e.cfAnalyticsLoaded === !0,
    cfAnalyticsStatus: String(e.cfAnalyticsStatus || "").trim(),
    cfAnalyticsError: String(e.cfAnalyticsError || "").trim(),
    cfAnalyticsDetail: String(e.cfAnalyticsDetail || "").trim(),
    trafficSourceText: String(e.trafficSourceText || "本月视频流量口径：CF Zone 总流量（edgeResponseBytes）").trim(),
    generatedAt: String(e.generatedAt || "").trim(),
    cacheStatus: String(e.cacheStatus || "live").trim().toLowerCase() || "live",
    warning: String(e.warning || "").trim()
  };
}
function Qp(o = "", e = "") {
  const t = String(o || "").trim();
  return t ? String(e || "").trim().toLowerCase() === "workers_usage" && t.includes("Cloudflare Workers Usage") ? "今日请求量口径：Cloudflare Workers Usage" : t : "";
}
function Zp(o = "") {
  const e = String(o || "").trim();
  return e ? e.includes("请求数已对齐 Workers Usage") ? "Cloudflare 统计正常" : e : "";
}
function eg(o = "", e = "") {
  const t = String(o || "").trim();
  if (!t) return "";
  const r = String(e || "").trim().toLowerCase();
  return t.includes("已对齐脚本") || r === "workers_usage" && t.includes("脚本:") ? "" : t;
}
var tg = [
  "周日",
  "周一",
  "周二",
  "周三",
  "周四",
  "周五",
  "周六"
];
function El() {
  return Array.from({ length: 24 }, (o, e) => String(e).padStart(2, "0"));
}
function Ro(o = "") {
  const e = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(o || "").trim());
  if (!e) return String(o || "").trim() || "-";
  const t = tg[new Date(Date.UTC(Number(e[1]), Number(e[2]) - 1, Number(e[3]))).getUTCDay()] || "";
  return `${e[2]}-${e[3]}${t ? ` ${t}` : ""}`;
}
function Al(o = "", e = 0, t = 0, r = 0, a = 0) {
  const n = Math.max(0, Math.min(23, Number(e) || 0)), s = Math.max(0, Number(t) || 0), i = Math.max(0, Number(r) || 0), c = Math.max(0, Math.min(1, Number(a) || 0)), l = `${String(n).padStart(2, "0")}:00`, u = s > 0 ? Math.min(0.88, Number((0.12 + c * 0.68).toFixed(3))) : 0.04;
  return {
    key: `${o}:${n}`,
    hour: n,
    hourLabel: l,
    rowsWritten: s,
    writeQueries: i,
    intensity: c,
    className: s > 0 ? "d1-heat-cell is-active" : "d1-heat-cell is-empty",
    style: `--d1-heat-alpha:${u}`,
    title: `${o} ${l} · 写入 ${Se(s)} 行 · SQL 写 ${Se(i)} 次`
  };
}
function bn(o = {}) {
  const e = Fe(o.utcOffsetMinutes), t = Math.max(0, Number(o.nowMs) || B()), r = dt(new Date(t), e).startTs - 8640 * 60 * 1e3, a = Array.from({ length: 7 }, (n, s) => {
    const i = ut(r + s * 24 * 60 * 60 * 1e3, e);
    return {
      key: i.dateKey,
      dateKey: i.dateKey,
      label: Ro(i.dateKey),
      cells: Array.from({ length: 24 }, (c, l) => Al(i.dateKey, l))
    };
  });
  return {
    title: "D1 写入热点图",
    status: String(o.status || "idle").trim().toLowerCase() || "idle",
    source: String(o.source || "").trim(),
    summary: String(o.summary || "D1 写入热点尚未加载").trim() || "D1 写入热点尚未加载",
    detail: String(o.detail || "").trim(),
    periodLabel: String(o.periodLabel || `最近 7 天 · ${zo(e)}`).trim(),
    hourLabels: El(),
    rows: a,
    available: !1,
    totalRowsWritten: 0,
    totalWriteQueries: 0,
    peakLabel: "",
    legendMaxLabel: "0"
  };
}
function rg(o = {}) {
  const e = o && typeof o == "object" ? { ...o } : {}, t = bn({ status: "idle" });
  return {
    ...t,
    ...e,
    title: String(e.title || t.title).trim() || t.title,
    status: String(e.status || t.status).trim().toLowerCase() || t.status,
    source: String(e.source || t.source).trim(),
    summary: String(e.summary || t.summary).trim() || t.summary,
    detail: String(e.detail || t.detail).trim(),
    periodLabel: String(e.periodLabel || t.periodLabel).trim() || t.periodLabel,
    hourLabels: Array.isArray(e.hourLabels) && e.hourLabels.length ? e.hourLabels.map((r) => String(r || "").trim()).filter(Boolean) : t.hourLabels,
    rows: Array.isArray(e.rows) ? e.rows : t.rows,
    available: e.available === !0,
    totalRowsWritten: Math.max(0, Number(e.totalRowsWritten) || 0),
    totalWriteQueries: Math.max(0, Number(e.totalWriteQueries) || 0),
    peakLabel: String(e.peakLabel || "").trim(),
    legendMaxLabel: String(e.legendMaxLabel || "0").trim() || "0"
  };
}
function ps(o = {}) {
  const e = o && typeof o == "object" ? { ...o } : {}, t = String(e.requestSource || "").trim().toLowerCase();
  return e.requestSourceText = Qp(e.requestSourceText, t), e.cfAnalyticsStatus = Zp(e.cfAnalyticsStatus), e.cfAnalyticsDetail = eg(e.cfAnalyticsDetail, t), e.d1WriteHotspot = rg(e.d1WriteHotspot), e;
}
function gs(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "cache" || e === "stale" || e === "live" ? e : "live";
}
function Tl(o, e = "dashboard_snapshot_failed") {
  const t = Wt(o, e);
  return t.length <= 220 ? t : `${t.slice(0, 217)}...`;
}
function hs(o = {}) {
  const e = gs(o.cacheStatus || o.status), t = Math.max(0, Number(o.cachedAt) || 0);
  return {
    cacheStatus: e,
    cachedAt: t,
    expiresAt: Math.max(t, Number(o.expiresAt) || t),
    updatedAt: Math.max(t, Number(o.updatedAt) || t),
    generatedAt: String(o.generatedAt || "").trim(),
    warning: String(o.warning || "").trim(),
    partial: o.partial === !0 || e === "stale"
  };
}
function Co(o = {}) {
  const e = o && typeof o == "object" ? { ...o } : {}, t = ps(!H(e.stats) && (Array.isArray(e.hourlySeries) || Object.prototype.hasOwnProperty.call(e, "todayRequests") || Object.prototype.hasOwnProperty.call(e, "todayTraffic")) ? e : H(e.stats) ? e.stats : {}), r = H(e.runtimeStatus) ? { ...e.runtimeStatus } : {}, a = H(e.cacheMeta) ? e.cacheMeta : {}, n = hs({
    cacheStatus: a.cacheStatus || t.cacheStatus || "live",
    cachedAt: a.cachedAt,
    expiresAt: a.expiresAt,
    updatedAt: a.updatedAt,
    generatedAt: a.generatedAt || t.generatedAt || "",
    warning: a.warning,
    partial: a.partial === !0
  });
  return t.cacheStatus = gs(t.cacheStatus || n.cacheStatus), {
    stats: t,
    runtimeStatus: r,
    cacheMeta: n
  };
}
function fa(o = {}, e = "live", t = {}) {
  const r = Co(o), a = gs(e || r.cacheMeta.cacheStatus);
  return {
    stats: ps({
      ...r.stats,
      cacheStatus: a
    }),
    runtimeStatus: H(r.runtimeStatus) ? { ...r.runtimeStatus } : {},
    cacheMeta: hs({
      ...r.cacheMeta,
      ...t,
      cacheStatus: a,
      generatedAt: String(t.generatedAt || r.cacheMeta.generatedAt || r.stats.generatedAt || "").trim()
    })
  };
}
function wo(o) {
  if (!(!o || typeof o != "object")) {
    try {
      o.cancelScheduledDelay?.();
    } catch {
    }
    o.cancelScheduledDelay = null, o.pendingSnapshot = null, o.scheduledFlushAt = 0, o.scheduledPromise = null, o.waitUntilCtx = null;
  }
}
function lr(o) {
  const e = oe.PlaybackProgressRelay;
  if (!(e instanceof Map)) return !1;
  const t = e.get(o);
  return t && wo(t), e.delete(o);
}
function yi(o, e) {
  const t = oe.PlaybackProgressRelay;
  if (!(t instanceof Map)) return !1;
  const r = Math.max(1, Number($.Defaults.VideoProgressForwardSessionMax) || 1);
  if (!t.has(o) && t.size >= r) {
    let a = "";
    for (const [n, s] of t) if (!s?.activeFlushPromise) {
      a = n;
      break;
    }
    if (!a) return !1;
    lr(a);
  }
  return t.has(o) && t.delete(o), t.set(o, e), !0;
}
function Ye(o, e = "/") {
  const t = Ze(o) ? new URL(o.targetUrl.toString()) : o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), r = Ze(o) ? o.normalizedBasePath : Ct(t.pathname), a = Z(e);
  return t.pathname = (a === "/" ? r ? `${r}/` : "/" : `${r}${a}`) || "/", t.search = "", t.hash = "", t;
}
var ag = /* @__PURE__ */ new Set(["emby", "mediabrowser"]);
function Si(o = "/") {
  return Z(o).split("/").filter(Boolean);
}
function ng(o = "/", e = "") {
  const t = Z(o), r = String(e || "").trim();
  if (!r || r === "/") return null;
  const a = t.toLowerCase(), n = r.toLowerCase();
  return a !== n && !a.startsWith(`${n}/`) ? null : Z(t.slice(r.length) || "/");
}
function og(o = "/", e = "") {
  const t = Si(e), r = Si(o);
  if (!t.length || !r.length) return null;
  const a = String(t[t.length - 1] || "").toLowerCase(), n = String(r[0] || "").toLowerCase();
  return !a || a !== n || !ag.has(a) ? null : Z(`/${r.slice(1).join("/")}`);
}
function sg(o, e = "/") {
  const t = Ze(o) ? o : Ba(o);
  if (!t) return null;
  const r = Z(e), a = t.normalizedBasePath;
  let n = r;
  if (a) {
    const s = ng(r, a);
    if (s !== null) n = s;
    else {
      const i = og(r, a);
      i !== null && (n = i);
    }
  }
  return Ye(t, n);
}
var ig = /^\/(?:emby|mediabrowser)(?=\/)/i, cg = /^\/(?:emby|mediabrowser)$/i;
function lg(o = "/") {
  const e = Z(o);
  if (!e || e === "/") return [e || "/"];
  if (cg.test(e)) return [e, "/"];
  const t = e.replace(ig, "");
  return t && t !== e ? [e, t] : [e, `/emby${e}`];
}
function Rl(o, e = []) {
  const t = /* @__PURE__ */ new Set(), r = [];
  for (const a of Array.isArray(e) ? e : [e]) for (const n of lg(a)) {
    const s = sg(o, n);
    if (!s) continue;
    const i = s.toString();
    t.has(i) || (t.add(i), r.push({
      probePath: n,
      probeUrl: s
    }));
  }
  return r;
}
function ug(o, e = "/", t = "") {
  if (!Ze(o)) {
    const s = Ye(o, e);
    return s.search = Ws(t), s.toString();
  }
  const r = Z(e), a = Ws(t), n = o.absoluteBasePrefix || o.originText;
  return `${(r === "/" ? `${n}/` : `${n}${r}`) || `${o.originText}/`}${a}`;
}
var dg = /* @__PURE__ */ new Set(["emby", "mediabrowser"]);
function fg(o = "") {
  const e = String(o || "").split("/").filter(Boolean);
  if (!e.length || !dg.has(e[e.length - 1].toLowerCase())) return null;
  const t = e.slice(0, -1);
  return t.length ? `/${t.join("/")}` : "";
}
function mg(o = "/", e = "", t = {}) {
  const r = Z(o || "/"), a = Ct(String(e || "")), n = (c, l) => {
    if (!l) return c;
    const u = c.toLowerCase(), d = l.toLowerCase();
    return u === d || u === `${d}/` ? "/" : u.startsWith(`${d}/`) ? c.slice(l.length) : null;
  }, s = n(r, a);
  if (s !== null) return s;
  if (t.allowLegacyRootFallback !== !0) return null;
  const i = fg(a);
  return i === null ? null : n(r, i);
}
function za(o, e, t = {}) {
  try {
    const r = o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), a = e instanceof URL ? new URL(e.toString()) : new URL(String(e || ""));
    if (r.origin !== a.origin) return {
      resolvedUrl: r,
      proxyPath: null
    };
    const n = Ct(a.pathname), s = mg(r.pathname || "/", n, t);
    return s === null ? {
      resolvedUrl: r,
      proxyPath: null
    } : {
      resolvedUrl: r,
      proxyPath: Z(s)
    };
  } catch {
    return {
      resolvedUrl: null,
      proxyPath: null
    };
  }
}
function _i(o, e, t, r, a = {}) {
  try {
    const { resolvedUrl: n, proxyPath: s } = za(o, e, { allowLegacyRootFallback: !0 });
    return n ? s ? `${ot(t, r, a)}${s === "/" ? "/" : s}${n.search}${n.hash}` : n.toString() : null;
  } catch {
    return null;
  }
}
function Cl(o = "") {
  const e = Z(o), t = e.toLowerCase();
  let r = -1;
  for (const a of [
    "/items/",
    "/videos/",
    "/audio/",
    "/livetv/"
  ]) {
    const n = t.indexOf(a);
    n > 0 && (r === -1 || n < r) && (r = n);
  }
  return r <= 0 ? "" : Ct(e.slice(0, r));
}
function ys(o = "", e = "") {
  const t = Z(o), r = Ct(e);
  if (!r) return t;
  const a = t.toLowerCase(), n = r.toLowerCase();
  return a === n ? "/" : a.startsWith(`${n}/`) ? Z(t.slice(r.length) || "/") : t;
}
function Lo(o = "", e = "") {
  const t = Ct(e);
  if (!t) return Z(o);
  let r = Z(o);
  for (; ; ) {
    if (r === t || r === `${t}/`) return "/";
    if (!r.startsWith(`${t}/`)) return r;
    r = Z(r.slice(t.length) || "/");
  }
}
function pg(o = "", e = null, t = "") {
  let r = Z(o);
  return r = Lo(r, t), r = Lo(r, e instanceof URL ? e.pathname : "/"), r;
}
function gg(o = "", e = "", t = null, r = null, a = "") {
  const n = String(o || "").trim();
  if (!n) return null;
  let s = null;
  if (r) try {
    s = r instanceof URL ? new URL(r.toString()) : new URL(String(r || ""));
  } catch {
    s = null;
  }
  let i;
  try {
    if (am(n)) {
      i = new URL(n, s || "https://playback-info.local/");
      const u = String(i.protocol || "").toLowerCase(), d = String(s?.origin || "").trim().toLowerCase();
      if (!["http:", "https:"].includes(u) || !d || i.origin.toLowerCase() !== d) return null;
    } else i = new URL(n, "https://playback-info.local/");
  } catch {
    return null;
  }
  const c = pg(i.pathname || "/", t, a), l = ys(c, Cl(c));
  return Na(l) ? {
    proxyPath: Z(l),
    search: i.search || "",
    hash: i.hash || ""
  } : null;
}
function hg(o = "", e = "", t = null) {
  let r = Z(o);
  const a = Cl(e);
  if (a) {
    const u = Lo(r, a);
    u !== r && Na(u) && (r = u);
  }
  const n = Ct(t instanceof URL ? t.pathname : "/");
  if (!a || !n) return r;
  const s = `${a}${n}`, i = r.toLowerCase(), c = s.toLowerCase();
  if (i !== c && !i.startsWith(`${c}/`)) return r;
  const l = Z(`${a}${r.slice(s.length) || "/"}`);
  return Na(l) ? l : r;
}
function yg(o = "") {
  return Qt(o) === "rewrite" ? "relative" : "";
}
function wl(o) {
  [
    "Age",
    "Accept-Ranges",
    "Content-Disposition",
    "Content-Encoding",
    "Content-Language",
    "Content-Length",
    "Content-Location",
    "Content-Range",
    "Content-Type",
    "ETag",
    "Expires",
    "Last-Modified",
    "Set-Cookie",
    "Transfer-Encoding"
  ].forEach((e) => o.delete(e));
}
function Sg(o = "/", e = null) {
  const t = Z(e instanceof URL ? e.pathname : o), r = new URLSearchParams(e instanceof URL ? e.search : String(e || ""));
  for (; r.has(ho); ) r.delete(ho);
  const a = r.toString();
  return `${t}${a ? `?${a}` : ""}`;
}
function ot(o, e, t = {}) {
  const r = Cf(t?.linkVariant), a = r ? "/" + encodeURIComponent(r) : "";
  if (tt(t?.entryMode)) return a;
  const n = encodeURIComponent(String(o || "")), s = e ? "/" + encodeURIComponent(String(e)) : "";
  return "/" + n + s + a;
}
function Ll(o, e, t, r = "/", a = {}) {
  const n = o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), s = Z(r), i = new URL(n.origin);
  return i.pathname = `${ot(e, t, {
    linkVariant: a.linkVariant,
    entryMode: a.entryMode
  })}${s === "/" ? "/" : s}`, i.search = String(a.search || ""), i.hash = String(a.hash || ""), i;
}
function _g(o, e, t, r, a = {}) {
  const n = r instanceof URL ? new URL(r.toString()) : new URL(String(r || "")), s = new URL(o instanceof URL ? o.origin : String(o || ""));
  return s.pathname = `${ot(e, t, {
    linkVariant: a.linkVariant,
    entryMode: a.entryMode
  })}/${wc}${n.pathname || "/"}`, s.search = n.search || "", s.searchParams.append(Lc, ta(n.toString())), s.hash = "", s;
}
function bg(o, e, t, r) {
  try {
    const a = new URL(String(r || "")), n = new URL(o instanceof URL ? o.origin : String(o || ""));
    return n.pathname = `${ot(e, t)}${Z(a.pathname || "/")}`, n.search = a.search || "", n.hash = "", n.toString();
  } catch {
    return "";
  }
}
function Eg(o = "", e = "", t = "", r = {}) {
  let a = Z(o);
  const n = String(e || "").trim();
  if (!n && !tt(r?.entryMode)) return a;
  const s = [...new Set([
    "proxy_a",
    "proxy_b",
    "main"
  ].map((c) => ot(n, t, {
    linkVariant: c,
    entryMode: r.entryMode
  })).filter((c) => c && c !== "/"))].sort((c, l) => l.length - c.length);
  if (!s.length) return a;
  let i = !0;
  for (; i; ) {
    i = !1;
    for (const c of s) {
      const l = ys(a, c);
      if (l !== a) {
        a = l, i = !0;
        break;
      }
    }
  }
  return a;
}
function Ag(o = null) {
  const e = String(o?.routeContextDiagnostics?.routeKind || "").trim();
  return e !== "host_prefix_path_compat" && e !== "legacy_host_prefix_path_compat" ? "" : ot(o?.nodeName, o?.nodeKey, {
    linkVariant: o?.linkVariant,
    entryMode: "kv_route"
  });
}
function Tg(o = "", e = "") {
  const t = Z(o), r = Ct(e);
  if (!r || r === "/") return t;
  const a = t.toLowerCase(), n = r.toLowerCase();
  return a === n || a.startsWith(`${n}/`) ? t : `${r}${t === "/" ? "/" : t}`;
}
function Rg(o = "", e = null) {
  const t = Z(o), r = `/${wc}`;
  if (!t.startsWith(r)) return null;
  const a = e instanceof URL && [...e.searchParams.getAll("__pb_target")].pop() || "";
  if (!a) return { error: "missing_target" };
  let n;
  try {
    n = new URL(tr(a));
  } catch {
    return { error: "invalid_target" };
  }
  return ["http:", "https:"].includes(String(n.protocol || "").toLowerCase()) ? {
    targetUrl: n,
    visibleProxyPath: Z(t.slice(r.length) || "/")
  } : { error: "unsupported_target" };
}
function bi(o = "", e = null, t = "") {
  const r = Z(o), a = r.search(/https?:\/\//i);
  if (a <= 0) return null;
  let n;
  try {
    n = e instanceof URL ? new URL(e.toString()) : new URL(String(e || ""));
  } catch {
    return null;
  }
  let s;
  try {
    s = new URL(r.slice(a));
  } catch {
    return null;
  }
  if (String(s.origin || "").toLowerCase() !== String(n.origin || "").toLowerCase()) return null;
  const i = Ct(t), c = Z(s.pathname || "/"), l = i ? ys(c, i) : c;
  if (i && l === c && c.toLowerCase() !== i.toLowerCase()) return null;
  const u = Z(r.slice(0, a) || "/"), d = [l];
  if (u !== "/") {
    const f = u.toLowerCase(), m = l.toLowerCase();
    m !== f && !m.startsWith(`${f}/`) && d.unshift(Z(`${u}${l === "/" ? "/" : l}`));
  }
  for (const f of d)
    if (Na(Z(Mr(f).remaining || f)))
      return {
        kind: "embedded_absolute",
        originalPath: r,
        normalizedPath: Z(f),
        embeddedUrl: s.toString()
      };
  return null;
}
function Oa(o) {
  const e = /* @__PURE__ */ new Map();
  if (!o || typeof o != "string") return e;
  for (const t of o.split(";")) {
    const r = t.trim();
    if (!r) continue;
    const a = r.indexOf("="), n = (a === -1 ? r : r.slice(0, a)).trim(), s = a === -1 ? "" : r.slice(a + 1).trim();
    n && e.set(n, s);
  }
  return e;
}
function Nl(o) {
  const e = [];
  for (const [t, r] of o.entries()) e.push(r === "" ? t : `${t}=${r}`);
  return e.join("; ");
}
function Ss(o, e = []) {
  const t = new Set((Array.isArray(e) ? e : [e]).map((a) => String(a || "").trim().toLowerCase()).filter(Boolean)), r = Oa(o);
  if (t.size > 0)
    for (const a of r.keys()) t.has(String(a).trim().toLowerCase()) && r.delete(a);
  return Nl(r) || null;
}
function Ei(o, e, t = ["auth_token"]) {
  const r = new Set(t.map((s) => String(s || "").trim().toLowerCase()).filter(Boolean)), a = Oa(o);
  for (const s of a.keys()) r.has(String(s).trim().toLowerCase()) && a.delete(s);
  const n = Oa(e);
  for (const [s, i] of n.entries())
    r.has(String(s).trim().toLowerCase()) || a.set(s, i);
  return Nl(a) || null;
}
function Ai(o = "") {
  const e = Z(o).split("/").filter(Boolean);
  if (e.length === 0) return !1;
  const t = nt(e[0]).toLowerCase();
  return Kd.has(t);
}
async function Cg(o = "", e = "", t = null, r = {}) {
  const a = String(o || "").trim().toLowerCase(), n = ne(e), s = String(t?.JWT_SECRET || "").trim();
  if (!a || !n || !s) return "";
  const i = Math.max(0, Math.floor(Number(r.nowMs ?? B()) / 1e3)), c = Math.max(1, Math.trunc(Number(r.maxAgeSec) || 86400)), l = ta(JSON.stringify({
    v: 1,
    node: a,
    host: n,
    iat: i,
    exp: i + c
  }));
  if (!l) return "";
  const u = await bt(s, l);
  return u ? `${l}.${u}` : "";
}
async function wg(o = "", e = null, t = {}) {
  const r = String(o || "").trim(), a = String(e?.JWT_SECRET || "").trim();
  if (!r) return {
    ok: !1,
    reason: "missing_cookie"
  };
  if (!a) return {
    ok: !1,
    reason: "missing_secret"
  };
  const n = r.indexOf(".");
  if (n <= 0 || n === r.length - 1) return {
    ok: !1,
    reason: "malformed_cookie"
  };
  const s = r.slice(0, n), i = r.slice(n + 1), c = await bt(a, s);
  if (!c || i !== c) return {
    ok: !1,
    reason: "bad_signature"
  };
  let l = null;
  try {
    l = JSON.parse(tr(s));
  } catch {
    return {
      ok: !1,
      reason: "malformed_payload"
    };
  }
  const u = {
    v: Number(l?.v) || 0,
    node: String(l?.node || "").trim().toLowerCase(),
    host: ne(l?.host || ""),
    iat: Math.max(0, Math.floor(Number(l?.iat) || 0)),
    exp: Math.max(0, Math.floor(Number(l?.exp) || 0))
  };
  if (u.v !== 1 || !u.node || !u.host || !u.iat || !u.exp || u.exp <= u.iat) return {
    ok: !1,
    reason: "invalid_payload",
    payload: u
  };
  const d = ne(t.requestHost || "");
  if (d && u.host !== d) return {
    ok: !1,
    reason: "host_mismatch",
    payload: u
  };
  const f = Math.max(0, Math.floor(Number(t.nowMs ?? B()) / 1e3));
  return u.exp <= f ? {
    ok: !1,
    reason: "expired",
    payload: u
  } : {
    ok: !0,
    payload: u
  };
}
function Lg(o = "") {
  const e = String(o || "").trim();
  return e ? `${es}=${e}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Bd}` : Il();
}
function Il() {
  return `${es}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
function Un(o = "GET", e = null) {
  const t = e ? new Headers(e) : new Headers();
  return t.set("Content-Type", "text/plain; charset=utf-8"), t.set("Cache-Control", "no-store, max-age=0"), Ne(t), t.get("Access-Control-Allow-Origin") !== "*" && Vr(t, "Origin"), new Response(o === "HEAD" ? null : "Not Found", {
    status: 404,
    headers: t
  });
}
function Wa(o = "") {
  return String(o || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}
var Dl = /* @__PURE__ */ new Set([
  "authorization",
  "x-emby-authorization",
  "x-mediabrowser-authorization"
]), Ng = /* @__PURE__ */ new Set(["x-emby-token", "x-mediabrowser-token"]), Ig = /* @__PURE__ */ new Set(["x-emby-device-id", "x-mediabrowser-device-id"]), Ml = /* @__PURE__ */ new Set([
  ...Dl,
  ...Ng,
  ...Ig
]);
function kn(o) {
  if (o instanceof Headers) return [...o.entries()];
  if (o && typeof o == "object" && typeof o.entries == "function") try {
    return [...o.entries()].filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [String(e[0] || ""), String(e[1] ?? "")]);
  } catch {
  }
  if (o && typeof o == "object" && typeof o[Symbol.iterator] == "function") try {
    return [...o].filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [String(e[0] || ""), String(e[1] ?? "")]);
  } catch {
  }
  return Array.isArray(o) ? o.filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [String(e[0] || ""), String(e[1] ?? "")]) : o && typeof o == "object" ? Object.entries(o).map(([e, t]) => [String(e || ""), String(t ?? "")]) : [];
}
var Pl = [
  "authorization",
  "api-key",
  "apikey",
  "access-key",
  "accesskey",
  "access-token",
  "accesstoken",
  "session",
  "credential",
  "signature",
  "secret",
  "auth",
  "token"
], Dg = [
  "emby",
  "jellyfin",
  "mediabrowser",
  "api_key",
  ...Pl
], Mg = new RegExp(Pl.join("|"));
function xl(o = "") {
  return !o || Ml.has(o) || o === "cookie" ? !1 : Mg.test(o);
}
function Pg(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e ? Dg.some((t) => e.includes(t)) : !1;
}
var Ol = /* @__PURE__ */ new Set([
  "apikey",
  "accesstoken",
  "token",
  "authorization",
  "xembytoken",
  "xembyauthorization",
  "xmediabrowsertoken",
  "xmediabrowserauthorization",
  "deviceid",
  "xembydeviceid",
  "xembydevicename",
  "xembyclient",
  "xembyclientversion",
  "xmediabrowserdeviceid",
  "xmediabrowserdevicename",
  "xmediabrowserclient",
  "xmediabrowserclientversion",
  "client",
  "clientid",
  "devicename",
  "userid",
  "playsessionid",
  "sessionid"
]), vl = "identity-http-v2", xg = Object.freeze([
  "Range",
  "If-None-Match",
  "If-Modified-Since"
]), Og = [
  /^\/Videos\/[^/]+\/(?:main|master|stream)\.m3u8$/i,
  /^\/Videos\/[^/]+\/(?:manifest|main|master|stream)\.mpd$/i,
  /^\/Audio\/[^/]+\/(?:main|master|stream)\.m3u8$/i
], vg = /* @__PURE__ */ new Set([
  "mediasourceid",
  "static",
  "tag",
  "audiostreamindex",
  "subtitlestreamindex",
  "subtitlemethod",
  "starttimeticks"
]);
function Fl(o = "") {
  return Ol.has(Wa(o));
}
function Fg(o) {
  const e = o instanceof URL ? new URL(o.toString()) : new URL(String(o || ""));
  e.hash = "";
  const t = [];
  for (const [r, a] of e.searchParams.entries())
    Fl(r) || t.push([r, a]);
  t.sort((r, a) => {
    const n = r[0].localeCompare(a[0]);
    return n !== 0 ? n : String(r[1]).localeCompare(String(a[1]));
  }), e.search = "";
  for (const [r, a] of t) e.searchParams.append(r, a);
  return e;
}
var Ti = /* @__PURE__ */ new WeakMap();
function Ul(o) {
  const e = o !== null && typeof o == "object";
  if (e) {
    const r = Ti.get(o);
    if (r) return r;
  }
  const t = Ug(o);
  return e && Ti.set(o, t), t;
}
function Ug(o) {
  const e = o instanceof Request ? new URL(o.url) : new URL(String(o || "")), t = [];
  for (const [s, i] of e.searchParams.entries()) {
    const c = Wa(s);
    Ol.has(c) && t.push([c, String(i)]);
  }
  t.sort((s, i) => {
    const c = s[0].localeCompare(i[0]);
    return c !== 0 ? c : s[1].localeCompare(i[1]);
  });
  const r = o instanceof Request ? o.headers : new Headers(), a = [];
  for (const [s, i] of r.entries()) {
    const c = String(s || "").trim().toLowerCase();
    !c || !Ml.has(c) && !xl(c) || a.push([c, String(i)]);
  }
  const n = Ss(r.get("Cookie") || "", ["auth_token", ...wa]);
  return n && a.push(["cookie", n]), a.sort((s, i) => {
    const c = s[0].localeCompare(i[0]);
    return c !== 0 ? c : s[1].localeCompare(i[1]);
  }), {
    queryEntries: t,
    headerEntries: a
  };
}
function kg(o) {
  const e = Ul(o);
  return e.queryEntries.length > 0 || e.headerEntries.length > 0;
}
async function kl(o) {
  const e = Ul(o), t = await ao().digest("SHA-256", new TextEncoder().encode(re(e)));
  return [...new Uint8Array(t)].map((r) => r.toString(16).padStart(2, "0")).join("");
}
async function Hg(o, e) {
  return await kl(new Request(e instanceof URL ? e.toString() : String(e || ""), { headers: o.headers }));
}
function Hl(o = "", e = {}) {
  const t = Tt.test(String(o || ""));
  return ie(`${vl}:${t ? "manifest" : "asset"}:${t ? Math.max(0, Number(e.prewarmCacheTtl) || 0) : Math.max(0, Number(e.imageCacheMaxAge) || 0)}`);
}
function $g(o, e) {
  if (!(o instanceof Request) || !(e instanceof Request) || e.headers.has("If-Range")) return null;
  const t = new Headers();
  for (const r of xg) {
    const a = e.headers.get(r);
    a && t.set(r, a);
  }
  return new Request(o.url, {
    method: "GET",
    headers: t
  });
}
function Bg(o = "") {
  const e = String(o || ""), t = /\/(?:Videos|Audio)\/.+$/i.exec(e);
  return t ? t[0] : e;
}
function Kg(o) {
  try {
    return new Request(Fg(o).toString(), { method: "GET" });
  } catch {
    return null;
  }
}
function zg(o = {}) {
  const e = Array.isArray(o?.lines) ? o.lines.slice() : [];
  if (e.length > 1) {
    const t = String(o?.activeLineId || "").trim();
    if (t) {
      const r = e.findIndex((a) => String(a?.id || "").trim() === t);
      if (r > 0) {
        const [a] = e.splice(r, 1);
        e.unshift(a);
      }
    }
  }
  return e.length > 0 ? e.map((t) => String(t?.target || "").trim()).filter(Boolean) : String(o?.target || "").split(",").map((t) => t.trim()).filter(Boolean);
}
function No(o = "", e = {}) {
  const t = String(o || "").trim().toLowerCase(), r = dr(e?.entryMode), a = kn(e?.headers).map(([n, s]) => [String(n || "").trim().toLowerCase(), String(s ?? "").trim()]).filter(([n]) => !!n).sort((n, s) => {
    const i = n[0].localeCompare(s[0]);
    return i !== 0 ? i : n[1].localeCompare(s[1]);
  });
  return ie(re({
    nodeName: t,
    entryMode: r,
    secret: r === "host_prefix" ? "" : String(e?.secret || "").trim(),
    tags: Xr(e?.tags, e?.tag),
    remark: String(e?.remark || "").trim(),
    activeLineId: String(e?.activeLineId || "").trim(),
    orderedTargets: zg(e),
    headers: a,
    playbackInfoMode: String(e?.playbackInfoMode || "").trim().toLowerCase(),
    mediaAuthMode: String(e?.mediaAuthMode || "").trim().toLowerCase(),
    realClientIpMode: String(e?.realClientIpMode || "").trim().toLowerCase(),
    routingDecisionMode: String(e?.routingDecisionMode || "").trim().toLowerCase(),
    mainVideoStreamMode: String(e?.mainVideoStreamMode || e?.wangpanDirectMode || e?.wangpanMode || "").trim().toLowerCase(),
    aggregationMode: qt(e?.aggregationMode)
  }));
}
function $l(o = []) {
  const e = /* @__PURE__ */ new Set();
  for (const t of Array.isArray(o) ? o : [o]) {
    const r = String(t || "").trim().toLowerCase();
    r && e.add(r);
  }
  return e;
}
function Bl(o = []) {
  const e = $l(o);
  if (!e.size) return;
  const t = oe.PlaybackInfoResponseCache;
  if (t instanceof Map) for (const [r, a] of t.entries()) {
    const n = String(a?.nodeName || "").trim().toLowerCase();
    e.has(n) && t.delete(r);
  }
}
function Kl(o = []) {
  const e = $l(o);
  if (!e.size) return;
  const t = oe.PlaybackProgressRelay;
  if (!(!(t instanceof Map) || t.size <= 0))
    for (const [r, a] of t.entries()) {
      const n = String(a?.nodeName || a?.pendingSnapshot?.nodeName || "").trim().toLowerCase();
      !n || !e.has(n) || lr(r);
    }
}
function zl(o, e, t, r = "/", a = {}) {
  try {
    const n = String(a.identityPartition || "").trim(), s = String(a.cachePolicyRevision || "").trim();
    if (!n || !s) return null;
    const i = o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), c = Z(r), l = new URL(i.origin);
    l.pathname = `${ot(e, t, {
      linkVariant: "main",
      entryMode: a.entryMode
    })}${c === "/" ? "/" : c}`, l.search = String(a.search || "");
    const u = String(a.nodeCacheRevision || "").trim();
    return u && l.searchParams.set("__proxyrev", u), l.searchParams.set("__metadatarev", vl), l.searchParams.set("__identity", n), l.searchParams.set("__policy", s), l.hash = "", Kg(l);
  } catch {
    return null;
  }
}
function Wg(o) {
  try {
    const e = o instanceof URL ? new URL(o.toString()) : new URL(String(o || ""));
    for (const [t, r] of e.searchParams.entries()) {
      const a = String(t || "").toLowerCase(), n = String(r || "").toLowerCase();
      if (a.includes("transcod") || n.includes("transcod")) return !0;
    }
    return !1;
  } catch {
    return !0;
  }
}
function Gg(o) {
  try {
    const e = o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), t = Bg(e.pathname || "");
    if (!Tt.test(t) || Wg(e) || !Og.some((r) => r.test(t))) return !1;
    for (const [r] of e.searchParams.entries())
      if (!Fl(r) && !vg.has(Wa(r)))
        return !1;
    return !0;
  } catch {
    return !1;
  }
}
function Io(o) {
  try {
    const e = o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), t = e.pathname || "";
    return ea.test(t) || Zr.test(t) || Er.test(t) ? !0 : Tt.test(t) ? Gg(e) : !1;
  } catch {
    return !1;
  }
}
function Vg(o = "") {
  const e = String(o || "").toLowerCase();
  return e ? /\.(?:mp4|m4v|mkv|mov|avi|wmv|flv|ts|m4s)(?:$|[?#])/.test(e) ? !0 : Tt.test(e) || Er.test(e) ? !1 : /\/videos\/[^/]+\/(?:stream|original|download|file)\b/.test(e) || /\/items\/[^/]+\/download\b/.test(e) : !1;
}
function Do(o, e = /* @__PURE__ */ new Set(), t = 0) {
  if (o == null || t > 5) return e;
  if (typeof o == "string") {
    const r = o.trim();
    if (r && /^(?:https?:\/\/|\/)/i.test(r)) {
      const a = r.toLowerCase(), n = a.split(/[?#]/, 1)[0] || a;
      (Tt.test(n) || Er.test(n) || ea.test(a) || Zr.test(n)) && e.add(r);
    }
    return e;
  }
  return Array.isArray(o) ? (o.slice(0, 24).forEach((r) => Do(r, e, t + 1)), e) : (typeof o == "object" && Object.values(o).slice(0, 32).forEach((r) => Do(r, e, t + 1)), e);
}
function va(o = "") {
  const e = /^\/Items\/([^/]+)(?:\/|$)/i.exec(String(o || ""));
  return e ? nt(e[1]) : "";
}
function Ri(o = "") {
  const e = String(o || "").toLowerCase();
  return ea.test(e) || Zr.test(e) ? 0 : Tt.test(e) ? 1 : Er.test(e) ? 2 : 3;
}
function jg(o = {}, e = {}) {
  return {
    async createKvTidyPlanToken(t, r = {}, a = {}) {
      const n = String(t?.JWT_SECRET || "").trim();
      if (!n) {
        const l = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the KV tidy plan");
        throw l.code = "SERVER_MISCONFIGURED", l.status = 503, l;
      }
      const s = Math.max(0, Math.floor(Number(a.nowMs ?? B()) / 1e3)), i = s + Math.max(60, Math.floor(Number(a.ttlMs) || 6e5) / 1e3), c = ta(JSON.stringify({
        version: 1,
        scope: "kv",
        planHash: String(r?.planHash || e.buildKvTidyPlanHash(r)).trim(),
        issuedAt: s,
        expiresAt: i
      }));
      return `${c}.${await bt(n, c)}`;
    },
    async verifyKvTidyPlanToken(t, r = "", a = {}) {
      const n = String(t?.JWT_SECRET || "").trim(), s = String(r || "").trim();
      if (!n) {
        const d = /* @__PURE__ */ new Error("JWT_SECRET is required to verify the KV tidy plan");
        throw d.code = "SERVER_MISCONFIGURED", d.status = 503, d;
      }
      const i = s.indexOf(".");
      if (i <= 0 || i === s.length - 1) {
        const d = /* @__PURE__ */ new Error("KV tidy plan token is invalid");
        throw d.code = "TIDY_PLAN_INVALID", d.status = 409, d;
      }
      const c = s.slice(0, i);
      if (s.slice(i + 1) !== await bt(n, c)) {
        const d = /* @__PURE__ */ new Error("KV tidy plan token signature is invalid");
        throw d.code = "TIDY_PLAN_INVALID", d.status = 409, d;
      }
      let l = null;
      try {
        l = JSON.parse(tr(c));
      } catch {
        l = null;
      }
      const u = Math.max(0, Math.floor(Number(a.nowMs ?? B()) / 1e3));
      if (!H(l) || l.version !== 1 || l.scope !== "kv" || !String(l.planHash || "").trim()) {
        const d = /* @__PURE__ */ new Error("KV tidy plan token payload is invalid");
        throw d.code = "TIDY_PLAN_INVALID", d.status = 409, d;
      }
      if (Number(l.expiresAt) <= u) {
        const d = /* @__PURE__ */ new Error("KV tidy plan has expired");
        throw d.code = "TIDY_PLAN_STALE", d.status = 409, d.details = {
          reason: "expired",
          expiresAt: Number(l.expiresAt) || 0
        }, d;
      }
      return l;
    },
    buildD1TidyPlanHash(t = {}) {
      const r = H(t?.schemaStatus) ? t.schemaStatus : {};
      return ie(re({
        scope: "d1",
        mode: String(t?.mode || "manual"),
        maintenanceMode: String(t?.maintenanceMode || "smart"),
        nowMs: Number(t?.nowMs) || 0,
        retentionDays: Number(t?.retentionDays) || 0,
        retentionCutoffMs: Number(t?.retentionCutoffMs) || 0,
        utcOffsetMinutes: Number(t?.utcOffsetMinutes) || 0,
        scheduledNowMs: Number(t?.scheduledNowMs) || 0,
        dayWindow: H(t?.dayWindow) ? t.dayWindow : {},
        statsBucketDate: String(t?.statsBucketDate || ""),
        statsStartTs: Number(t?.statsStartTs) || 0,
        statsEndTs: Number(t?.statsEndTs) || 0,
        statsUtcOffsetMinutes: Number(t?.statsUtcOffsetMinutes) || 0,
        schemaStatus: {
          schemaReady: r.schemaReady === !0,
          tables: H(r.tables) ? r.tables : {},
          columns: H(r.columns) ? r.columns : {},
          indexes: H(r.indexes) ? r.indexes : {},
          constraints: H(r.constraints) ? r.constraints : {},
          ftsReady: r.ftsReady === !0,
          issues: Array.isArray(r.issues) ? r.issues : []
        },
        flags: H(t?.flags) ? t.flags : {},
        summary: H(t?.summary) ? t.summary : {},
        preview: H(t?.preview) ? t.preview : {},
        d1DnsIpPoolSources: Array.isArray(t?.d1DnsIpPoolSources) ? t.d1DnsIpPoolSources : []
      }));
    },
    async createD1TidyPlanToken(t, r = {}, a = {}) {
      const n = String(t?.JWT_SECRET || "").trim();
      if (!n) {
        const l = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the D1 tidy plan");
        throw l.code = "SERVER_MISCONFIGURED", l.status = 503, l;
      }
      const s = Math.max(0, Math.floor(Number(a.issuedAtMs ?? B()) / 1e3)), i = s + Math.max(60, Math.floor(Number(a.ttlMs) || 6e5) / 1e3), c = ta(JSON.stringify({
        version: 1,
        scope: "d1",
        planHash: String(r?.planHash || e.buildD1TidyPlanHash(r)).trim(),
        planNowMs: Number(r?.nowMs) || 0,
        scheduledNowMs: Number(r?.scheduledNowMs) || Number(r?.nowMs) || 0,
        maintenanceMode: String(r?.maintenanceMode || "smart"),
        statsBucketDate: String(r?.statsBucketDate || ""),
        statsStartTs: Number(r?.statsStartTs) || 0,
        statsEndTs: Number(r?.statsEndTs) || 0,
        statsUtcOffsetMinutes: Number(r?.statsUtcOffsetMinutes) || 0,
        issuedAt: s,
        expiresAt: i
      }));
      return `${c}.${await bt(n, c)}`;
    },
    async verifyD1TidyPlanToken(t, r = "", a = {}) {
      const n = String(t?.JWT_SECRET || "").trim(), s = String(r || "").trim();
      if (!n) {
        const d = /* @__PURE__ */ new Error("JWT_SECRET is required to verify the D1 tidy plan");
        throw d.code = "SERVER_MISCONFIGURED", d.status = 503, d;
      }
      const i = s.indexOf(".");
      if (i <= 0 || i === s.length - 1) {
        const d = /* @__PURE__ */ new Error("D1 tidy plan token is invalid");
        throw d.code = "TIDY_PLAN_INVALID", d.status = 409, d;
      }
      const c = s.slice(0, i);
      if (s.slice(i + 1) !== await bt(n, c)) {
        const d = /* @__PURE__ */ new Error("D1 tidy plan token signature is invalid");
        throw d.code = "TIDY_PLAN_INVALID", d.status = 409, d;
      }
      let l = null;
      try {
        l = JSON.parse(tr(c));
      } catch {
        l = null;
      }
      const u = Math.max(0, Math.floor(Number(a.nowMs ?? B()) / 1e3));
      if (!H(l) || l.version !== 1 || l.scope !== "d1" || !String(l.planHash || "").trim() || !(Number(l.planNowMs) > 0)) {
        const d = /* @__PURE__ */ new Error("D1 tidy plan token payload is invalid");
        throw d.code = "TIDY_PLAN_INVALID", d.status = 409, d;
      }
      if (Number(l.expiresAt) <= u) {
        const d = /* @__PURE__ */ new Error("D1 tidy plan has expired");
        throw d.code = "TIDY_PLAN_STALE", d.status = 409, d.details = {
          reason: "expired",
          expiresAt: Number(l.expiresAt) || 0
        }, d;
      }
      return l;
    },
    async resolveKvTidyQuotaBudget(t, r = [], a = {}) {
      const n = a.kv || e.getKV(t), s = await fm(ce(a.config || {})), i = Math.max(1, Math.floor(Number(s?.kv?.write) || 0)), c = (Array.isArray(r) ? r : []).map((g) => ({
        type: String(g?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put",
        key: String(g?.key || "").trim()
      })).filter((g) => g.key), l = c.filter((g) => g.type === "put").length, u = c.filter((g) => g.type === "delete").length, d = n ? await e.captureRawKvEntries(n, c.map((g) => g.key)) : [], f = d.filter((g) => g?.exists === !0).length, m = d.filter((g) => g?.exists !== !0).length, p = l + u + f + m, h = {
        planClass: String(s?.planClass || "free").trim().toLowerCase() === "paid" ? "paid" : "free",
        planLabel: String(s?.planLabel || "").trim() || "FREE",
        periodLabel: String(s?.periodLabel || "").trim() || "今日",
        writeLimit: i,
        estimatedPutCount: l,
        estimatedDeleteCount: u,
        estimatedRollbackWriteCount: f,
        estimatedRollbackDeleteCount: m,
        estimatedWorstCaseWriteCount: p,
        blocked: p > i,
        reason: ""
      };
      return h.reason = h.blocked === !0 ? mm(h) : "", h;
    },
    async buildKvTidyPlan(t, r = {}) {
      const a = r.kv || e.getKV(t);
      if (!a) throw new Error("KV not configured");
      const n = (await e.listKvKeysStrict(a)).sort(), s = n.filter((W) => W.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX)), { rawStoredSummaryIndexText: i, storedSummaryIndexState: c, previousFullIndexBytes: l } = await e.readStoredNodesSummaryState(a), { nodeNames: u, removableKeys: d, untouchedOtherKeyCount: f, opsStatusKeyCount: m, dnsRecordHistoryKeyCount: p, dnsIpPoolSourceKeyCount: h, configMetaKeyCount: g, snapshotMetaKeyCount: y, nodeIndexMetaKeyCount: _, telegramAlertStateKeyCount: S, loginFailureKeyCount: E, dnsFetchLockKeyCount: b } = await e.classifyKvTidyKeys(a, n), T = await e.readRepairableRuntimeConfig(a), C = H(T.rawConfig) ? T.rawConfig : {}, L = Xf(C);
      let P = L.cleanedConfig;
      const A = [...L.migratedConfigKeys], w = await e.captureRawKvEntries(a, [
        e.CONFIG_KEY,
        e.NODES_INDEX_KEY,
        e.NODES_SUMMARY_INDEX_KEY
      ]), R = String(w.find((W) => W?.key === e.NODES_INDEX_KEY)?.value || ""), { nextTidyConfig: I, rewrittenNodes: x, fullEntityNodes: N, rewrittenNodeCount: F, deletedLegacyNodeFieldCount: D, migratedTopLevelPortNodeCount: U, migratedLinePortCount: V, migratedDefaultPortNodeCount: X, migratedDefaultPortLineCount: v } = await e.collectKvTidyNodeMutations(a, u, P, w), O = re(P) !== re(I);
      O && (P = I, A.push("sourceDirectNodes"));
      const M = await e.readRevisionMetaForRead(a, e.CONFIG_META_KEY), k = {
        configRevision: String(M?.revision || ""),
        configContentHash: ie(re(C))
      }, j = n.includes(e.CONFIG_SNAPSHOTS_KEY), q = T.hadMalformedValue || re(C) !== re(P), J = Yf(T.config, P), Q = e.collectUnreferencedAdminIndexUploadKeys(P, [], s);
      for (const W of Q) d.add(W);
      n.includes(e.CONFIG_SNAPSHOTS_KEY) && d.add(e.CONFIG_SNAPSHOTS_KEY), n.includes(e.CONFIG_SNAPSHOTS_META_KEY) && d.add(e.CONFIG_SNAPSHOTS_META_KEY);
      const se = e.normalizeNodeSummaryIndex(N).nodes, pe = e.normalizeNodeIndex(se.map((W) => W?.name)), _e = JSON.stringify(pe), ye = JSON.stringify(se), Te = new TextEncoder().encode(ye).length, Ue = l - Te, kt = e.buildLegacyConfigCacheKeys(T.config, P), De = [...d].sort(), ca = [.../* @__PURE__ */ new Set([...kt, ...De])].filter(Boolean).sort(), st = [];
      q && st.push({
        type: "put",
        key: e.CONFIG_KEY,
        value: JSON.stringify(P)
      });
      for (const W of x) st.push({
        type: "put",
        key: `${e.PREFIX}${W.name}`,
        value: JSON.stringify(W.data)
      });
      R !== _e && st.push({
        type: "put",
        key: e.NODES_INDEX_KEY,
        value: _e
      }), i !== ye && st.push({
        type: "put",
        key: e.NODES_SUMMARY_INDEX_KEY,
        value: ye
      });
      for (const W of ca) st.push({
        type: "delete",
        key: W,
        value: ""
      });
      const it = await e.resolveKvTidyQuotaBudget(t, st, {
        kv: a,
        config: P
      }), Tr = {
        scannedKeyCount: n.length,
        preservedNodeKeyCount: u.length,
        rebuiltNodeCount: pe.length,
        rewrittenNodeCount: F,
        configWasMalformed: T.hadMalformedValue,
        configReadSource: T.source,
        configRewritten: q,
        migratedConfigKeys: ir(A),
        deletedLegacyFieldCount: L.deletedLegacyFieldCount + D,
        deletedLegacyConfigFieldCount: L.deletedLegacyFieldCount,
        deletedLegacyNodeFieldCount: D,
        migratedTopLevelPortNodeCount: U,
        migratedLinePortCount: V,
        migratedDefaultPortNodeCount: X,
        migratedDefaultPortLineCount: v,
        deletedKeyCount: De.length,
        deletedCacheKeyCount: De.filter((W) => W === "sys:cf_dash_cache" || W.startsWith("sys:cf_dash_cache:")).length,
        deletedScheduledLockKeyCount: De.filter((W) => W === e.LEGACY_SCHEDULED_LOCK_KEY).length,
        deletedLoginFailureKeyCount: E,
        deletedDnsIpPoolSourceKeyCount: h,
        deletedOpsStatusKeyCount: m,
        deletedTelegramAlertStateKeyCount: S,
        deletedDnsFetchLockKeyCount: b,
        deletedAdminIndexUploadCount: Q.length,
        untouchedOtherKeyCount: f,
        previousFullIndexBytes: l,
        nextSummaryIndexBytes: Te,
        savedBytes: Ue
      }, la = Qf({
        configFieldTargets: Tr.migratedConfigKeys,
        sourceDirectNodesFromLegacyNodes: O,
        migratedTopLevelPortNodeCount: U,
        migratedLinePortCount: V,
        migratedDefaultPortNodeCount: X,
        migratedDefaultPortLineCount: v
      }), $e = [], ar = De.filter((W) => W === "sys:cf_dash_cache" || W.startsWith("sys:cf_dash_cache:")), pt = De.filter((W) => W.startsWith("fail:")), gt = De.filter((W) => W === e.LEGACY_DNS_IP_POOL_SOURCES_KEY), Ht = De.filter((W) => W === e.LEGACY_OPS_STATUS_KEY || Object.values(e.LEGACY_OPS_STATUS_SECTION_KEYS).includes(W)), wt = De.filter((W) => W === e.LEGACY_TELEGRAM_ALERT_STATE_KEY), $t = De.filter((W) => W === e.LEGACY_SCHEDULED_LOCK_KEY), nr = De.filter((W) => W.startsWith(_p)), Lt = De.filter((W) => W.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX)), Rr = x.map((W) => W.name);
      Ae($e, ar.length > 0, "cf_dash_cache", "Cloudflare 仪表盘缓存", ar, ar.length, "会删除遗留的 sys:cf_dash_cache 及其按日期 / Zone 生成的缓存键。"), Ae($e, pt.length > 0, "login_failures", "旧版登录失败计数", pt, pt.length, "会删除旧版 fail:* 登录失败计数键，后续仅保留 D1 auth_failures。"), Ae($e, gt.length > 0, "dns_ip_pool_sources", "旧版 DNS IP 池源配置", gt, gt.length, "会删除旧版 sys:dns_ip_pool_sources:v1，后续只保留 D1 dns_ip_pool_sources。"), Ae($e, Ht.length > 0, "ops_status", "旧版运维状态键", Ht, Ht.length, "会删除 sys:ops_status:v1 与 sys:ops_status:*，后续只保留 D1 sys_status。"), Ae($e, wt.length > 0, "telegram_alert_state", "旧版 Telegram 告警冷却状态", wt, wt.length, "会删除 sys:telegram_alert_state:v1，后续只保留 D1 sys_status scope。"), Ae($e, $t.length > 0, "scheduled_lock", "旧版定时租约键", $t, $t.length, "会删除 sys:scheduled_lock:v1，后续只保留 D1 sys_locks。"), Ae($e, nr.length > 0, "dns_fetch_lock", "旧版 DNS 抓取锁键", nr, nr.length, "会删除 sys:dns_ip_pool_fetch_lock:v1:*，后续只保留 D1 sys_locks。"), Ae($e, j || y > 0, "legacy_config_snapshot_keys", "停用的设置历史键", [e.CONFIG_SNAPSHOTS_KEY, e.CONFIG_SNAPSHOTS_META_KEY], Number(j) + +(y > 0), "会删除已停用的设置历史键及其元数据。"), Ae($e, Lt.length > 0, "admin_index_uploads", "未引用的本地 HTML 版本", Lt, Lt.length, "只保留当前配置引用的内容寻址 index.html。");
      const Bt = [];
      if (q && Ae(Bt, !0, "runtime_config", "全局设置 sys:theme", [...L.legacyKeysPresent, ...J.map((W) => W.key)], 1, "会把旧版设置字段吸收到当前 schema，并以后端 sanitizeRuntimeConfig() 结果回写。"), F > 0) {
        const W = [];
        U > 0 && W.push(`旧版顶层 node.port 节点 ${U} 个`), V > 0 && W.push(`旧版 lines[].port 线路 ${V} 条`), X > 0 && W.push(`隐式默认端口节点 ${X} 个`), v > 0 && W.push(`按协议补齐默认端口线路 ${v} 条`), Ae(Bt, !0, "node_entities", "节点实体 node:* 标准化重写", Rr, F, W.length ? `会把端口并入 lines[].target，并移除旧版节点字段。${W.join("，")}。` : "会移除旧版节点字段，并统一回写当前节点 schema。");
      }
      Ae(Bt, !0, "node_indexes", "节点索引 / 节点摘要索引", [e.NODES_INDEX_KEY, e.NODES_SUMMARY_INDEX_KEY], 2, `会按当前 node:* 实体重新生成轻量 name 索引与节点摘要索引，并把旧镜像压缩收敛为摘要格式（${l} -> ${Te} bytes，节省 ${Ue} bytes）。`);
      const Kt = [yt("node_entities_preserved", "node:* 节点实体", u, {
        count: u.length,
        note: "不会整批删除 node:*，只会按需重写必要节点。"
      })];
      p > 0 && Ae(Kt, !0, "dns_record_history", "DNS 历史记录", n.filter((W) => W.startsWith(e.DNS_RECORD_HISTORY_PREFIX)), p, "不会删除 sys:dns_record_history:v1:*。");
      const K = g + _;
      K > 0 && Ae(Kt, !0, "meta_keys", "配置 / 索引元信息", [e.CONFIG_META_KEY, e.NODES_INDEX_META_KEY], K, "不会删除这些 revision / meta 键。");
      const G = [];
      T.hadMalformedValue && G.push(`检测到异常 sys:theme（来源: ${T.source}），整理时会按当前 schema 修复。`), U > 0 && G.push(`检测到 ${U} 个旧节点仍使用顶层 node.port；整理后会把端口并入 lines[].target。`), V > 0 && G.push(`检测到 ${V} 条旧线路仍使用独立 lines[].port；整理后会把端口并入 lines[].target。`), (X > 0 || v > 0) && G.push(`检测到 ${X} 个节点 / ${v} 条线路仍未显式写端口；整理后会按协议补齐为 :443 / :80。`), c?.legacyMirrorDetected === !0 && G.push(`检测到旧版 sys:nodes_index_full:v2 仍保存完整节点镜像；本次会按 node:* 重建并收敛为摘要索引（${l} -> ${Te} bytes）。`), f > 0 && G.push(`发现 ${f} 个未列入整理白名单的 KV 键，本次不会自动删除。`), $e.length === 0 && !q && F === 0 && G.push("当前没有检测到需要执行的 KV 清理动作；本次更多是一轮一致性巡检。"), G.push(pm(it)), it.blocked === !0 && it.reason && G.push(it.reason);
      const Y = {
        scope: "kv",
        scannedKeys: n,
        config: P,
        nodesIndex: pe,
        rebuiltNodeSummaries: se,
        revisions: k,
        summary: Tr,
        quotaBudget: it,
        mutationPlan: st,
        preview: {
          scope: "kv",
          quotaBudget: it,
          fieldGroups: la,
          deleteGroups: $e,
          rewriteGroups: Bt,
          preserveGroups: Kt,
          warnings: G
        }
      };
      return Y.planHash = e.buildKvTidyPlanHash(Y), Y;
    },
    async applyKvTidyPlan(t, r = {}) {
      const a = r.kv || e.getKV(r.env);
      if (!a) throw new Error("KV not configured");
      const n = be(a), s = Array.isArray(t?.mutationPlan) ? t.mutationPlan : [];
      try {
        await e.applyKvMutationsWithRollback(a, s);
      } catch (i) {
        throw fn(r.env), n.NodesListCache = null, n.NodesIndexCache = null, gr(a), ui(n), n.NodeCache.clear(), n.PlaybackRouteHotCache.clear(), i;
      }
      return fn(r.env), ui(n), n.NodeCache.clear(), n.PlaybackRouteHotCache.clear(), Array.isArray(t?.nodesIndex) && t.nodesIndex.length > 0 && (Bl(t.nodesIndex), Kl(t.nodesIndex)), e.primeNodeSummaryCaches(Array.isArray(t?.rebuiltNodeSummaries) ? t.rebuiltNodeSummaries : [], a), n.NodesIndexCache = {
        data: Array.isArray(t?.nodesIndex) ? t.nodesIndex : [],
        exp: B() + 6e4
      }, e.buildTidyResult(t, { ...t?.summary }, "kv", {
        config: t?.config || {},
        nodesIndex: Array.isArray(t?.nodesIndex) ? t.nodesIndex : []
      });
    },
    async tidyKvData(t, r = {}) {
      return await Au(r.kv || e.getKV(t))(async () => {
        const a = await e.verifyKvTidyPlanToken(t, r.planToken), n = await e.buildKvTidyPlan(t, r);
        if (String(n.planHash || "") !== String(a.planHash || "")) {
          const s = /* @__PURE__ */ new Error("KV tidy data changed after preview");
          throw s.code = "TIDY_PLAN_STALE", s.status = 409, s.details = {
            reason: "plan_changed",
            previewPlanHash: String(a.planHash || ""),
            currentPlanHash: String(n.planHash || "")
          }, s;
        }
        if (n?.quotaBudget?.blocked === !0) {
          const s = String(n?.quotaBudget?.reason || "KV tidy write budget exceeded").trim() || "KV tidy write budget exceeded", i = new Error(s);
          throw i.code = "KV_TIDY_WRITE_LIMIT_EXCEEDED", i.status = 409, i.details = { quotaBudget: n.quotaBudget }, i;
        }
        return await e.applyKvTidyPlan(n, {
          ...r,
          env: t
        });
      });
    }
  };
}
function qg(o = {}, e = {}) {
  const { D1TidyExecutor: t, D1TidyPlanner: r } = o;
  return {
    async readD1Count(a, n, s = []) {
      if (!a || !n) return 0;
      try {
        let i = a.prepare(n);
        Array.isArray(s) && s.length && (i = i.bind(...s));
        const c = await i.first();
        return Math.max(0, Math.floor(Number(c?.total ?? c?.count ?? c?.c ?? c?.value) || 0));
      } catch {
        return 0;
      }
    },
    getPreviousD1TidyState(a = {}, n = null) {
      const s = H(a) ? a : {}, i = H(s.d1Tidy) ? s.d1Tidy : {};
      return Je(H(n) ? n : H(s.cleanup) ? s.cleanup : {}, i);
    },
    buildD1TidyStatusPayload(a = {}, n = {}) {
      const s = String(n.mode || a.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", i = lt(n.maintenanceMode || a.maintenanceMode, s), c = String(n.triggeredBy || (s === "scheduled" ? "scheduled" : "manual")).trim() || (s === "scheduled" ? "scheduled" : "manual"), l = String(n.timestamp || a.finishedAt || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()).trim() || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), u = String(n.status || a.status || "success").trim() || "success", d = String(n.lastError || a.lastError || "").trim(), f = u === "failed" || u === "partial_failure", m = u === "skipped" || u === "deferred", p = {
        status: u,
        lastSuccessAt: !f && !m ? l : "",
        lastSkippedAt: m ? l : "",
        lastErrorAt: f ? l : "",
        lastError: f ? d : "",
        lastTriggeredBy: c,
        mode: s,
        maintenanceMode: i
      }, h = Math.max(0, Number(a.logRetentionDays ?? a.retentionDays) || 0);
      return {
        d1Tidy: {
          ...p,
          retentionDays: h,
          deletedExpiredLogCount: Math.max(0, Number(a.deletedExpiredLogCount) || 0),
          deletedExpiredLockCount: Math.max(0, Number(a.deletedExpiredLockCount) || 0),
          deletedExpiredFetchCacheCount: Math.max(0, Number(a.deletedExpiredFetchCacheCount) || 0),
          deletedExpiredProbeCacheCount: Math.max(0, Number(a.deletedExpiredProbeCacheCount) || 0),
          deletedExpiredAuthFailureCount: Math.max(0, Number(a.deletedExpiredAuthFailureCount) || 0),
          deletedExpiredDashboardCacheCount: Math.max(0, Number(a.deletedExpiredDashboardCacheCount) || 0),
          preservedLogCount: Math.max(0, Number(a.preservedLogCount) || 0),
          rebuiltStatsHourly: a.rebuiltStatsHourly === !0,
          rebuiltLogsFts: a.rebuiltLogsFts === !0,
          alignedStatsWindow: a.alignedStatsWindow === !0,
          dnsIpPoolSourceAction: String(a.dnsIpPoolSourceAction || "").trim(),
          ftsRebuildStatus: String(a.ftsRebuildStatus || "").trim(),
          optimizeStatus: String(a.optimizeStatus || "").trim(),
          statsRebuildStatus: String(a.statsRebuildStatus || "").trim(),
          reason: String(a.reason || "").trim(),
          summary: a
        },
        cleanup: {
          ...p,
          retentionDays: h,
          ftsRebuildStatus: String(a.ftsRebuildStatus || (a.rebuiltLogsFts === !0 ? "success" : "")).trim(),
          ftsRebuildRecovered: a.ftsRebuildRecovered === !0,
          lastFtsRebuildAt: String(a.lastFtsRebuildAt || "").trim(),
          ftsRebuildError: String(a.ftsRebuildError || "").trim(),
          optimizeStatus: String(a.optimizeStatus || (a.optimizedDb === !0 ? "success" : "")).trim(),
          lastOptimizeAt: String(a.lastOptimizeAt || "").trim(),
          optimizeError: String(a.optimizeError || "").trim(),
          statsAlignStatus: String(a.statsAlignStatus || "").trim(),
          statsAlignError: String(a.statsAlignError || "").trim(),
          statsRebuildStatus: String(a.statsRebuildStatus || (a.rebuiltStatsHourly === !0 ? "success" : "")).trim(),
          statsRebuildError: String(a.statsRebuildError || "").trim(),
          reason: String(a.reason || "").trim()
        }
      };
    },
    buildTidyResult(a = {}, n = {}, s = "kv", i = {}) {
      const c = H(a?.preview) ? a.preview : e.createEmptyTidyPreview(s);
      return {
        ...i,
        summary: n,
        preview: c,
        quotaBudget: H(a?.quotaBudget) ? a.quotaBudget : H(c?.quotaBudget) ? c.quotaBudget : null,
        fieldGroups: Array.isArray(c?.fieldGroups) ? c.fieldGroups : [],
        deleteGroups: Array.isArray(c?.deleteGroups) ? c.deleteGroups : [],
        rewriteGroups: Array.isArray(c?.rewriteGroups) ? c.rewriteGroups : [],
        preserveGroups: Array.isArray(c?.preserveGroups) ? c.preserveGroups : [],
        warnings: Array.isArray(c?.warnings) ? c.warnings : []
      };
    },
    async buildD1TidyPlan(a, n = {}) {
      const s = n.db || e.getDB(a), i = n.kv || e.getKV(a) || null;
      if (!s) throw new Error("D1 not configured");
      const c = n.schemaStatus?.schemaReady === !0 ? n.schemaStatus : await e.getD1SchemaReadiness(s, {
        allowAttestedFastPath: !0,
        env: a
      });
      if (c.schemaReady !== !0) {
        const S = e.createEmptyTidyPreview("d1");
        return S.warnings.push("D1 结构尚未通过运行时兼容检查；本预览不授权删除，必须先完成统一“初始化 DB”并重新预览。"), {
          scope: "d1",
          mode: "manual",
          maintenanceMode: lt(n.maintenanceMode, "manual"),
          schemaStatus: c,
          flags: {},
          summary: {
            status: "blocked",
            schemaReady: !1,
            requiresSchemaInitialization: !0,
            issues: c.issues
          },
          preview: S,
          planHash: ""
        };
      }
      const l = ce(n.config || (a ? await we(a) : {})), u = r.buildContext(l, n), d = r.attachPreviousState(e, u, n.previousCleanupStatus);
      d.schemaStatus = c, d.logQueuePendingCount = ur.get(s).LogQueue.length;
      const f = await r.readFacts(e, s, i, d), m = r.buildSourcePolicy(f.d1DnsIpPoolSources), p = r.buildFlags(e, d, f, m), h = r.buildSummary(d, f, m, p), g = c.schemaReady === !0;
      h.schemaReady = g, h.requiresSchemaInitialization = !g;
      const y = r.buildPreview(d, f, m, p);
      g || y.warnings.unshift("D1 结构尚未通过运行时兼容检查；本预览不授权删除，必须先完成统一“初始化 DB”并重新预览。");
      const _ = {
        scope: "d1",
        mode: d.mode,
        maintenanceMode: d.maintenanceMode,
        config: l,
        nowMs: d.nowTimestamp,
        retentionDays: d.retentionDays,
        retentionCutoffMs: d.retentionCutoffMs,
        utcOffsetMinutes: d.utcOffsetMinutes,
        scheduledNowMs: d.scheduledNow.getTime(),
        dayWindow: d.dayWindow,
        statsBucketDate: d.statsBucketDate,
        statsStartTs: d.statsStartTs,
        statsEndTs: d.statsEndTs,
        statsUtcOffsetMinutes: d.statsUtcOffsetMinutes,
        statsRetentionBoundaryDate: f.statsRetentionBoundaryDate,
        d1DnsIpPoolSources: f.d1DnsIpPoolSources,
        kvDnsIpPoolSources: f.kvDnsIpPoolSources,
        dnsIpPoolSourceAction: m.dnsIpPoolSourceAction,
        skipDnsIpPoolSourceCleanup: m.skipDnsIpPoolSourceCleanup,
        previousD1State: d.previousD1State,
        schemaStatus: c,
        flags: p,
        summary: h,
        preview: y
      };
      return _.planHash = e.buildD1TidyPlanHash(_), _;
    },
    async applyD1TidyPlan(a, n = {}) {
      const s = n.env, i = n.db || e.getDB(s), c = n.kv || e.getKV(s) || null;
      if (!i) throw new Error("D1 not configured");
      const l = n.schemaStatus?.schemaReady === !0 ? n.schemaStatus : a?.schemaStatus?.schemaReady === !0 ? a.schemaStatus : await e.getD1SchemaReadiness(i, {
        allowAttestedFastPath: !0,
        env: s
      });
      if (l.schemaReady !== !0) {
        const A = /* @__PURE__ */ new Error("D1 schema must pass runtime compatibility checks before tidy execution");
        throw A.code = "D1_SCHEMA_INCOMPATIBLE", A.status = 409, A.details = {
          issues: l.issues,
          autoRepairPolicy: l.autoRepairPolicy
        }, A;
      }
      const u = a || await e.buildD1TidyPlan(s, {
        ...n,
        db: i,
        kv: c
      }), d = String(u?.mode || n.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", f = lt(u?.maintenanceMode || n.maintenanceMode, d), m = H(u?.flags) ? u.flags : {}, p = typeof n.beforeEachStep == "function" ? n.beforeEachStep : async () => {
      }, h = {
        kv: c,
        db: i
      }, g = d === "scheduled", y = t.createSummary(u, d, m);
      y.maintenanceMode = f;
      let _ = !1;
      const S = (A, w, R, I) => {
        const x = R?.message || String(R);
        if (A && (y[A] = "failed"), w && (y[w] = x), y.lastError = x, y.status = y.status === "failed" ? "failed" : "partial_failure", console.error(`${I}: `, R), !g) throw R;
        return !1;
      }, E = ur.get(i);
      E.LogFlushTask && await Promise.resolve(E.LogFlushTask).catch(() => {
      });
      const b = B(), T = t.buildDeleteScopes(e, u, m, i), C = await t.runBudgetedDeleteScopes(T, y, p, { startedAt: b });
      if (y.hasMore = C.hasMore, y.remainingScopes = C.remainingScopes, y.budget = C.budget, _ = C.budget.processedRows > 0, m.rebuildStatsHourly === !0 && B() - b < Hr) try {
        await p("resetStatsHourly"), await e.clearStatsHourly(i), y.alignedStatsWindow = !0, y.statsAlignStatus = "success", y.statsRebuildStatus = "reset_for_new_logs", _ = !0;
      } catch (A) {
        S("statsRebuildStatus", "statsRebuildError", A, "D1 stats reset Error");
      }
      else
        y.statsAlignStatus = m.rebuildStatsHourly === !0 ? "deferred_budget" : "skipped", y.statsRebuildStatus = m.rebuildStatsHourly === !0 ? "deferred_budget" : "skipped";
      const L = () => B() - b < Hr;
      if (m.rebuildLogsFtsDeferred === !0) y.ftsRebuildStatus = m.ftsRebuildDeferredReason || "deferred_size_guard";
      else if (m.rebuildLogsFts === !0 && (y.hasMore || !L())) y.ftsRebuildStatus = "deferred_budget";
      else if (m.rebuildLogsFts === !0) try {
        await p("rebuildLogsFts");
        let A = !1;
        await e.hasLogsFtsTable(i) ? A = await e.rebuildLogsFts(i) : A = (await e.ensureLogsFtsSchema(i)).rebuilt === !0, y.rebuiltLogsFts = A === !0, y.ftsRebuildStatus = A === !0 ? "success" : "skipped", y.lastFtsRebuildAt = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), _ = _ || A === !0;
      } catch (A) {
        S("ftsRebuildStatus", "ftsRebuildError", A, "D1 logs FTS rebuild Error");
      }
      if (m.optimizeDb === !0 && !y.hasMore && L()) try {
        await p("optimizeLogsDb"), await e.optimizeLogsDb(i), y.optimizedDb = !0, y.optimizeStatus = "success", y.lastOptimizeAt = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), _ = !0;
      } catch (A) {
        S("optimizeStatus", "optimizeError", A, d === "scheduled" ? "Scheduled DB optimize Error" : "D1 optimize Error");
      }
      else m.optimizeDb === !0 && (y.optimizeStatus = "deferred_budget");
      y.budget.durationMs = Math.max(0, B() - b), y.budget.durationMs >= Hr && !y.budget.exhaustedBy && (y.budget.exhaustedBy = "time_limit"), await p("patchLogStatus");
      const P = await t.patchLogStatus(e, i, h, u, y, m, n);
      if (y.status !== "partial_failure" && y.status !== "failed") if (y.hasMore)
        y.status = "success", y.reason = "maintenance_budget_exhausted";
      else if (d === "scheduled") {
        const A = m.rebuildLogsFtsDeferred === !0 || m.optimizeDbDeferred === !0;
        _ ? y.status = "success" : (y.status = "skipped", y.reason = A ? "maintenance_deferred" : "no_expired_data");
      } else y.status = "success";
      return y.finishedAt = P, e.buildTidyResult(u, y, "d1");
    },
    async tidyD1Data(a, n = {}) {
      const s = String(n.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", i = lt(n.maintenanceMode, s), c = n.db || e.getDB(a);
      if (!c) throw new Error("D1 not configured");
      if (s === "manual") {
        const d = await e.verifyD1TidyPlanToken(a, n.planToken), f = await e.getD1SchemaReadiness(c, {
          allowAttestedFastPath: !0,
          env: a
        });
        if (f.schemaReady !== !0) {
          const p = /* @__PURE__ */ new Error("D1 schema changed after preview; initialize and preview again");
          throw p.code = "TIDY_PLAN_STALE", p.status = 409, p.details = {
            reason: "schema_changed",
            issues: f.issues
          }, p;
        }
        const m = await e.buildD1TidyPlan(a, {
          ...n,
          db: c,
          mode: s,
          maintenanceMode: lt(d.maintenanceMode, s),
          nowMs: Number(d.planNowMs),
          scheduledNow: new Date(Number(d.scheduledNowMs) || Number(d.planNowMs)),
          statsBucketDate: String(d.statsBucketDate || ""),
          statsStartTs: Number(d.statsStartTs) || 0,
          statsEndTs: Number(d.statsEndTs) || 0,
          statsUtcOffsetMinutes: Number(d.statsUtcOffsetMinutes) || 0,
          schemaStatus: f
        });
        if (String(m.planHash || "") !== String(d.planHash || "")) {
          const p = /* @__PURE__ */ new Error("D1 tidy data changed after preview");
          throw p.code = "TIDY_PLAN_STALE", p.status = 409, p.details = {
            reason: "plan_changed",
            previewPlanHash: String(d.planHash || ""),
            currentPlanHash: String(m.planHash || "")
          }, p;
        }
        return {
          ...await e.applyD1TidyPlan(m, {
            ...n,
            db: c,
            env: a,
            mode: s,
            maintenanceMode: m.maintenanceMode,
            schemaStatus: f
          }),
          schema: f
        };
      }
      let l = await e.getD1SchemaReadiness(c, {
        allowAttestedFastPath: !0,
        env: a
      });
      if (l.schemaReady !== !0 && (await e.buildD1SchemaRepairPlan(c)).phase === "safe" && (await e.initializeD1Database(c, {
        includeFts: !0,
        env: a,
        repairMode: "safe"
      }), l = await e.getD1SchemaReadiness(c, {
        allowAttestedFastPath: !0,
        env: a
      })), l.schemaReady !== !0) {
        const d = /* @__PURE__ */ new Error("D1 schema is not initialized");
        throw d.code = "D1_SCHEMA_NOT_READY", d.status = 409, d.details = { issues: l.issues }, d;
      }
      const u = n.plan || await e.buildD1TidyPlan(a, {
        ...n,
        db: c,
        mode: s,
        maintenanceMode: i,
        schemaStatus: l
      });
      return {
        ...await e.applyD1TidyPlan(u, {
          ...n,
          db: c,
          env: a,
          schemaStatus: l
        }),
        schema: l
      };
    },
    shouldRunLogsOptimize(a, n = {}) {
      const s = Number(n.nowMs) || B(), i = Math.max(0, Number(n.minIntervalMs) || $.Defaults.LogVacuumMinIntervalMs);
      if (n.force === !0) return !0;
      const c = typeof a == "string" ? new Date(a).getTime() : NaN;
      return Number.isFinite(c) ? s - c >= i : !0;
    },
    shouldRunLogsFtsRebuild(a, n = {}) {
      return e.shouldRunLogsOptimize(a, {
        ...n,
        minIntervalMs: Math.max(0, Number(n.minIntervalMs) || $.Defaults.LogFtsRebuildMinIntervalMs)
      });
    },
    async optimizeLogsDb(a) {
      return a ? (await a.prepare("PRAGMA optimize").run(), !0) : !1;
    }
  };
}
function Xg(o = {}, e = {}) {
  const { buildAdminReleaseVendorManifest: t, normalizeAdminReleaseVendorManifestRecord: r, validateAdminShellHtmlSource: a } = o;
  return {
    async readLegacyConfigSnapshotRecordsStrict(n) {
      if (!n) return [];
      const s = await Oe(n, e.CONFIG_SNAPSHOTS_KEY, { type: "json" });
      if (s == null) return [];
      if (Array.isArray(s)) return s;
      const i = /* @__PURE__ */ new Error("Stored legacy config snapshot records are invalid");
      throw i.code = "CONFIG_SNAPSHOTS_INVALID", i.status = 409, i;
    },
    buildAdminIndexUploadKey(n = "") {
      const s = Pt(n);
      return s ? `${e.ADMIN_INDEX_UPLOAD_PREFIX}${s}` : "";
    },
    normalizeAdminIndexUploadRecord(n = {}, s = "") {
      if (!H(n)) return null;
      const i = Pt(n.revision), c = Pt(s);
      if (!i || c && i !== c) return null;
      const l = Qr(i), u = Xo(i), d = String(n.html || "");
      return d ? {
        version: Number(n.version) || 1,
        revision: i,
        assetRevision: u,
        sourceUrl: l,
        fileName: String(n.fileName || "index.html").trim() || "index.html",
        uploadedAt: String(n.uploadedAt || "").trim(),
        bytes: Number(n.bytes) || new TextEncoder().encode(d).length,
        html: d,
        manifest: r(n.manifest || {})
      } : null;
    },
    async validateAdminIndexUploadRecord(n = {}, s = "") {
      const i = e.normalizeAdminIndexUploadRecord(n, s);
      if (!i || await ro(i.html) !== i.revision) return null;
      try {
        const c = a(i.html, i.sourceUrl, {
          sourceLabel: "local admin index",
          contentType: "text/html"
        });
        return {
          ...i,
          bytes: c.bytes,
          manifest: r(t(c.html, {
            releaseTag: i.assetRevision,
            sourceUrl: i.sourceUrl
          }))
        };
      } catch {
        return null;
      }
    },
    async getAdminActiveIndexRecord(n) {
      return n ? e.validateAdminIndexUploadRecord(await Oe(n, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" })) : null;
    },
    async getAdminIndexUploadRecord(n, s = "") {
      const i = e.buildAdminIndexUploadKey(s);
      if (!n || !i) return null;
      const c = await e.validateAdminIndexUploadRecord(await Oe(n, i, { type: "json" }), s);
      return c || e.validateAdminIndexUploadRecord(await Oe(n, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" }), s);
    },
    collectReferencedAdminIndexUploadRevisions(n = {}, s = []) {
      const i = /* @__PURE__ */ new Set(), c = (l) => {
        const u = rt(l?.indexUrl || "");
        u && i.add(u);
      };
      c(n);
      for (const l of Array.isArray(s) ? s : []) c(l?.config);
      return i;
    },
    collectUnreferencedAdminIndexUploadKeys(n = {}, s = [], i = []) {
      const c = e.collectReferencedAdminIndexUploadRevisions(n, s);
      return (Array.isArray(i) ? i : []).filter((l) => {
        const u = String(l || "").trim();
        if (!u.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX)) return !1;
        const d = Pt(u.slice(e.ADMIN_INDEX_UPLOAD_PREFIX.length));
        return d && !c.has(d);
      });
    },
    async persistAdminIndexUpload(n = {}, s = {}) {
      const { env: i, kv: c, ctx: l } = s;
      if (!c) {
        const d = /* @__PURE__ */ new Error("KV namespace is required to persist the local admin index");
        throw d.code = "KV_NOT_CONFIGURED", d.status = 503, d;
      }
      const u = e.normalizeAdminIndexUploadRecord(n, n?.revision);
      if (!u) {
        const d = /* @__PURE__ */ new Error("本地 index.html 上传记录无效");
        throw d.code = "ADMIN_INDEX_UPLOAD_INVALID", d.status = 400, d;
      }
      return await cr(c)(async () => {
        const d = e.buildAdminIndexUploadKey(u.revision), f = await Oe(c, d, { type: "json" }), m = await Oe(c, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" });
        let p = e.normalizeAdminIndexUploadRecord(f, u.revision);
        p && await ro(p.html) !== u.revision && (p = null);
        const h = p || u;
        p || await c.put(d, JSON.stringify(u)), await c.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(h));
        try {
          const g = i ? await me(i) : ce(await Oe(c, e.CONFIG_KEY, { type: "json" }) || {});
          return {
            config: await e.commitRuntimeConfig({
              ...g,
              indexUrl: h.sourceUrl
            }, {
              env: i,
              kv: c,
              ctx: l
            }),
            previousConfig: g,
            record: h
          };
        } catch (g) {
          throw await ge(m ? c.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(m)) : c.delete(e.ADMIN_ACTIVE_INDEX_KEY), "admin.active_index_upload_rollback", { revision: u.revision }, null), p || await ge(f ? c.put(d, JSON.stringify(f)) : c.delete(d), "admin.local_index_upload_rollback", { revision: u.revision }, null), g;
        }
      });
    },
    async rollbackAdminIndexUploadActivation(n = {}, s = {}, i = {}) {
      const { env: c, kv: l, ctx: u } = i;
      if (!l) {
        const d = /* @__PURE__ */ new Error("KV namespace is required to roll back the local admin index");
        throw d.code = "KV_NOT_CONFIGURED", d.status = 503, d;
      }
      return await cr(l)(async () => {
        const d = c ? await me(c) : ce(await Oe(l, e.CONFIG_KEY, { type: "json" }) || {}), f = rt(s?.indexUrl || ""), m = rt(d?.indexUrl || "");
        if (!f || m !== f) return {
          config: d,
          skipped: !0,
          reason: m ? "superseded_by_newer_admin_index" : "admin_index_already_restored"
        };
        const p = rt(n?.indexUrl || ""), h = await Oe(l, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" }), g = p ? await e.getAdminIndexUploadRecord(l, p) : null;
        g ? await l.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(g)) : await l.delete(e.ADMIN_ACTIVE_INDEX_KEY);
        try {
          return {
            config: await e.commitRuntimeConfig({
              ...d,
              indexUrl: p ? Qr(p) : ""
            }, {
              env: c,
              kv: l,
              ctx: u
            }),
            skipped: !1,
            reason: ""
          };
        } catch (y) {
          throw await ge(h ? l.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(h)) : l.delete(e.ADMIN_ACTIVE_INDEX_KEY), "admin.active_index_rollback_restore", { revision: f }, null), y;
        }
      });
    },
    async captureRuntimeConfigRollbackState(n, s) {
      if (!s) return {
        config: ce(n ? await we(n) : {}),
        kvEntries: []
      };
      const i = n ? await me(n) : ce(await Oe(s, e.CONFIG_KEY, { type: "json" }) || {}), c = [
        e.CONFIG_KEY,
        e.CONFIG_META_KEY,
        e.CONFIG_SNAPSHOTS_KEY,
        e.CONFIG_SNAPSHOTS_META_KEY,
        ...e.buildLegacyConfigCacheKeys(i)
      ];
      return {
        config: i,
        kvEntries: await e.captureRawKvEntries(s, c)
      };
    },
    async restoreCapturedRuntimeConfigState(n = {}, s = {}) {
      const i = s.kv, c = ce(n?.config || {});
      if (!i) return c;
      const l = Array.isArray(n?.kvEntries) ? n.kvEntries : [];
      if (l.length > 0) {
        const u = l.map((d) => d?.exists === !0 ? {
          type: "put",
          key: String(d?.key || "").trim(),
          value: String(d?.value ?? "")
        } : {
          type: "delete",
          key: String(d?.key || "").trim(),
          value: ""
        });
        await e.applyKvMutationsWithRollback(i, u);
      }
      return fn(s.env), s.env ? await we(s.env) : c;
    },
    async restoreCapturedRuntimeConfigAndDnsState(n = {}, s = {}) {
      const i = ce(n?.config || {});
      let c = null, l = null, u = i;
      try {
        await e.commitRuntimeConfig(i, {
          env: s.env,
          kv: s.kv,
          ctx: s.ctx
        });
      } catch (d) {
        c = d;
      }
      try {
        u = await e.restoreCapturedRuntimeConfigState(n, s);
      } catch (d) {
        l = d;
      }
      if (c || l) {
        const d = new Error([c ? `dns:${ue(c, "restore_failed")}` : "", l ? `kv:${ue(l, "restore_failed")}` : ""].filter(Boolean).join("; "));
        throw d.code = "CONFIG_DNS_RESTORE_FAILED", d.status = 500, d.details = {
          dnsRestoreError: c ? ue(c, "restore_failed") : "",
          kvRestoreError: l ? ue(l, "restore_failed") : ""
        }, d;
      }
      return u;
    }
  };
}
function Yg(o = {}, e = {}) {
  return {
    async persistRuntimeConfig(t, r = {}) {
      return await cr(r.kv || Ft(r.env))(() => e.commitRuntimeConfig(t, {
        ...r,
        forceKvCommit: !0
      }));
    },
    async prepareRuntimeConfigPersistence(t, r = {}) {
      const { env: a, kv: n, ctx: s } = r;
      if (!n) {
        const d = /* @__PURE__ */ new Error("KV namespace is required to persist runtime config");
        throw d.code = "KV_NOT_CONFIGURED", d.status = 503, d;
      }
      ld(t?.defaultHostPrefixCnameTarget);
      const i = a ? await me(a) : ce(await Oe(n, e.CONFIG_KEY, { type: "json" }) || {}), c = ce(t);
      hd(t), yd(c, a);
      const l = Ve(a), u = un(null, i, l) !== un(null, c, l) ? (await e.loadAllNodeEntitiesFromKvStrict(n, { ctx: s })).filter((d) => tt(d?.entryMode) && !Zt(d?.hostPrefixCnameTarget)) : [];
      return u.length > 0 && Sa(c, a), {
        prevConfig: i,
        nextConfig: c,
        configuredHost: l,
        dnsPlans: u.map((d) => e.buildHostPrefixDnsSyncPlan(d.name, d, d.name, d, l, {
          previousConfig: i,
          nextConfig: c
        })).filter((d) => d.changed === !0),
        ctx: s,
        kv: n,
        env: a
      };
    },
    async buildRuntimeConfigMutationPlan(t, r, a) {
      const n = await e.readLegacyConfigSnapshotRecordsStrict(t), s = e.normalizeRevisionMeta(So(a)), i = [
        {
          type: "delete",
          key: e.CONFIG_SNAPSHOTS_KEY,
          value: ""
        },
        {
          type: "delete",
          key: e.CONFIG_SNAPSHOTS_META_KEY,
          value: ""
        },
        {
          type: "put",
          key: e.CONFIG_KEY,
          value: JSON.stringify(a)
        },
        {
          type: "put",
          key: e.CONFIG_META_KEY,
          value: JSON.stringify(s)
        }
      ];
      for (const u of e.buildLegacyConfigCacheKeys(r, a)) i.push({
        type: "delete",
        key: u,
        value: ""
      });
      const c = e.collectReferencedAdminIndexUploadRevisions(r, n), l = e.collectReferencedAdminIndexUploadRevisions(a, []);
      for (const u of c)
        l.has(u) || i.push({
          type: "delete",
          key: e.buildAdminIndexUploadKey(u),
          value: ""
        });
      return i;
    },
    async commitRuntimeConfig(t, r = {}) {
      const { prevConfig: a, nextConfig: n, configuredHost: s, dnsPlans: i, ctx: c, kv: l, env: u } = await e.prepareRuntimeConfigPersistence(t, r);
      if (qf(r.expectedConfigRevision, a), re(a) === re(n))
        return await e.ensureConfigMeta(l, n, { ctx: c }), n;
      const d = [];
      let f = null, m = !1;
      try {
        for (const h of i)
          f = h, await e.persistHostPrefixDnsSyncPlan(h, {
            env: u,
            kv: l,
            ctx: c,
            config: n,
            requestHost: s
          }), d.push(h), f = null;
        m = !0;
        const p = await e.buildRuntimeConfigMutationPlan(l, a, n);
        return await e.applyKvMutationsWithRollback(l, p), u ? Jd(u, n) : fn(), await e.invalidateDashboardSnapshotCacheForConfigChange(u, {
          prevConfig: a,
          nextConfig: n
        }), n;
      } catch (p) {
        const h = [], g = f ? [...d, f] : d;
        for (let y = g.length - 1; y >= 0; y -= 1) try {
          await e.persistHostPrefixDnsSyncPlan({ steps: g[y].rollbackSteps }, {
            env: u,
            kv: l,
            ctx: c,
            config: n,
            requestHost: s,
            skipHistory: !0
          });
        } catch (_) {
          h.push(ue(_, "dns_rollback_failed"));
        }
        if (p && typeof p == "object") {
          const y = Array.isArray(p?.details?.rollbackConflicts) ? p.details.rollbackConflicts : [], _ = Array.isArray(p?.details?.rollbackFailures) ? p.details.rollbackFailures : [];
          p.details = {
            ...H(p.details) ? p.details : {},
            hostPrefixDnsSyncAttempted: i.length > 0,
            hostPrefixDnsSyncedCount: d.length,
            failedHostPrefixDnsHost: String(f?.nextDnsHost || f?.previousDnsHost || ""),
            rollbackAttempted: g.length > 0 || m,
            rollbackSucceeded: h.length === 0 && y.length === 0 && _.length === 0,
            rollbackError: [...h, ..._].join("; "),
            rollbackConflicts: y
          };
        }
        throw p;
      }
    },
    async commitSourceDirectNodesConfigWithinMutation(t, r, a, n = {}) {
      if (!r) return null;
      const s = t ? await me(t) : ce(await r.get(e.CONFIG_KEY, { type: "json" }) || {}), i = Et(s.sourceDirectNodes || []), c = Eo(i, {
        renameMap: n.renameMap,
        removedNames: n.removedNames,
        allowedNames: n.allowedNames
      });
      return re(i) === re(c) ? s : e.commitRuntimeConfig({
        ...s,
        sourceDirectNodes: c
      }, {
        env: t,
        kv: r,
        ctx: a
      });
    },
    async commitSingleNodeMainVideoStreamShortcutShadowWithinMutation(t, r, a, n = {}) {
      if (!r) return null;
      const s = t ? await me(t) : ce(await r.get(e.CONFIG_KEY, { type: "json" }) || {}), i = String(n.originalName || "").trim().toLowerCase(), c = String(n.nodeName || "").trim().toLowerCase(), l = Nn(n.mode);
      let u = Et(s.sourceDirectNodes || []);
      return i && i !== c && (u = Eo(u, { renameMap: { [i]: c } })), u = u.filter((d) => String(d || "").trim().toLowerCase() !== c), c && l === "direct" && u.push(c), u = Et(u), re(s.sourceDirectNodes || []) === re(u) ? s : e.commitRuntimeConfig({
        ...s,
        sourceDirectNodes: u
      }, {
        env: t,
        kv: r,
        ctx: a
      });
    }
  };
}
function Jg(o = {}, e = {}) {
  return {
    async sendTelegramMessage({ tgBotToken: t, tgChatId: r, text: a }) {
      const n = String(t || "").trim(), s = String(r || "").trim();
      if (!n || !s) throw new Error("请先完善 Telegram Bot Token 和 Chat ID 配置");
      const i = await Me(await We(`https://api.telegram.org/bot${n}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: s,
          text: String(a || "")
        })
      }), Ln);
      if (i.exceeded) throw new Error("Telegram API response too large");
      const c = JSON.parse(i.text);
      if (!c.ok) throw new Error(c.description || "Telegram API 返回错误");
      return c;
    },
    async buildDailyTelegramSummaryPayload(t, r = {}) {
      const a = ce(r?.config || await me(t)), n = r?.now instanceof Date ? new Date(r.now.getTime()) : new Date(r?.now || /* @__PURE__ */ new Date()), s = r?.dayWindow && typeof r.dayWindow == "object" ? r.dayWindow : dt(n, a.scheduleUtcOffsetMinutes), [i, c] = await Promise.all([e.buildDashboardStatsPayload(t, {
        config: a,
        dayWindow: s,
        nowMs: n.getTime(),
        skipD1WriteHotspot: !0
      }), e.getDashboardMonthlyTrafficPayload(t, {
        config: a,
        ctx: r?.ctx || null,
        nowMs: n.getTime()
      })]);
      return {
        zoneName: String(i?.zoneName || "").trim(),
        requestCountDisplay: String(i?.requestCountDisplay || "").trim() || (i?.todayRequests === null || i?.todayRequests === void 0 ? "暂不可用" : String(Number(i?.todayRequests) || 0)),
        requestSourceText: String(i?.requestSourceText || "").trim(),
        todayTraffic: String(i?.todayTraffic || "").trim() || "暂不可用",
        monthlyTraffic: String(c?.traffic || "").trim() || "暂不可用",
        trafficSourceText: String(i?.trafficSourceText || "").trim(),
        playCount: Math.max(0, Number(i?.playCount) || 0),
        infoCount: Math.max(0, Number(i?.infoCount) || 0),
        nodeCount: Math.max(0, Number(i?.nodeCount) || 0),
        todayRequests: i?.todayRequests ?? null
      };
    },
    async sendDailyTelegramReport(t, r = {}) {
      const a = e.getDB(t), n = e.getKV(t);
      if (!a || !n) throw new Error("Database or KV not configured");
      const s = await n.get(e.CONFIG_KEY, { type: "json" }) || {}, i = ce(s), c = String(i.tgBotToken || "").trim(), l = String(i.tgChatId || "").trim();
      if (!c || !l) throw new Error("请先完善 Telegram Bot Token 和 Chat ID 配置");
      const u = r?.now instanceof Date ? new Date(r.now.getTime()) : new Date(r?.now || /* @__PURE__ */ new Date()), d = dt(u, i.scheduleUtcOffsetMinutes), f = Cc(i, s, {
        reportKinds: r?.reportKinds,
        fallbackAllWhenLegacy: !0
      });
      if (!f.length) throw new Error("请先至少启用一个日报类型");
      const m = f.includes("summary") ? await e.buildDailyTelegramSummaryPayload(t, {
        config: i,
        now: u,
        dayWindow: d
      }) : null, p = f.some((g) => g !== "summary") ? await e.getCloudflareRuntimeQuotaStatus(t, {
        config: i,
        db: a
      }) : null, h = [];
      for (const g of f) {
        const y = Sm(g, g === "summary" ? m : p?.[g], d);
        await e.sendTelegramMessage({
          tgBotToken: c,
          tgChatId: l,
          text: y
        }), h.push({
          kind: g,
          text: y
        });
      }
      return {
        success: h.length > 0,
        sentCount: h.length,
        reportKinds: f,
        messages: h
      };
    },
    async maybeSendRuntimeAlerts(t, r = null, a = {}) {
      const n = e.getDB(t);
      if (!n) return {
        sent: !1,
        reason: "db_unavailable"
      };
      if (!await e.ensureSysStatusTable(n)) return {
        sent: !1,
        reason: "db_init_failed"
      };
      const s = ce(await we(t)), i = a && typeof a == "object" ? a : {}, c = String(s.tgBotToken || "").trim(), l = String(s.tgChatId || "").trim();
      if (!c || !l) return {
        sent: !1,
        reason: "telegram_not_configured"
      };
      const u = fe(s.tgAlertDroppedBatchThreshold, $.Defaults.TgAlertDroppedBatchThreshold, 0, 5e3), d = fe(s.tgAlertFlushRetryThreshold, $.Defaults.TgAlertFlushRetryThreshold, 0, 10), f = fe(s.tgAlertCooldownMinutes, $.Defaults.TgAlertCooldownMinutes, 1, 1440), m = s.tgAlertOnScheduledFailure === !0, p = s.tgAlertKvUsageEnabled === !0, h = s.tgAlertD1UsageEnabled === !0, g = fe(s.tgAlertKvUsageThresholdPercent, $.Defaults.TgAlertKvUsageThresholdPercent, 1, 100), y = fe(s.tgAlertD1UsageThresholdPercent, $.Defaults.TgAlertD1UsageThresholdPercent, 1, 100);
      if (u <= 0 && d <= 0 && !m && !p && !h) return {
        sent: !1,
        reason: "thresholds_disabled"
      };
      const _ = await e.getOpsStatus(t), S = _ && typeof _.log == "object" ? _.log : {}, E = r && typeof r == "object" && Object.keys(r).length ? r : _ && typeof _.scheduled == "object" ? _.scheduled : {}, b = [], T = Number(S.lastDroppedBatchSize) || 0;
      u > 0 && T >= u && b.push({
        code: "log_drop",
        message: `日志刷盘疑似丢弃批次：${T} 条（阈值 ${u}）`,
        eventAt: S.lastFlushErrorAt || S.lastOverflowAt || S.updatedAt || _.updatedAt || ""
      });
      const C = Number(S.lastFlushRetryCount) || 0;
      d > 0 && C >= d && b.push({
        code: "log_retry",
        message: `D1 写入重试次数偏高：${C} 次（阈值 ${d}）`,
        eventAt: S.lastFlushAt || S.lastFlushErrorAt || S.updatedAt || _.updatedAt || ""
      });
      const L = String(E.status || "").toLowerCase();
      if (m && (L === "failed" || L === "partial_failure")) {
        const N = [];
        for (const [F, D] of Object.entries({
          cleanup: "日志清理",
          tgDailyReport: "每日报表",
          alerts: "异常告警"
        })) {
          const U = E?.[F];
          if (!U || typeof U != "object") continue;
          const V = String(U.status || "").trim(), X = String(U.lastError || "").trim();
          !X && V !== "failed" && V !== "partial_failure" || N.push(`${D}：${V || "failed"}${X ? `，错误：${X}` : ""}`);
        }
        b.push({
          code: "scheduled_failure",
          message: N.length ? `定时任务状态异常：${N.join("；")}` : `定时任务状态异常：${E.status}${E.lastError ? `，错误：${E.lastError}` : ""}`,
          eventAt: E.lastFinishedAt || E.lastErrorAt || E.updatedAt || _.updatedAt || ""
        });
      }
      if (p || h) {
        const N = await e.getCloudflareRuntimeQuotaStatus(t, {
          config: s,
          db: n
        }), F = [{
          enabled: p,
          threshold: g,
          code: "cf_kv_usage",
          title: "KV",
          card: N?.kv
        }, {
          enabled: h,
          threshold: y,
          code: "cf_d1_usage",
          title: "D1",
          card: N?.d1
        }];
        for (const D of F) {
          if (D.enabled !== !0) continue;
          const U = D.card && typeof D.card == "object" ? D.card : {}, V = String(U.status || "").trim().toLowerCase();
          if (V !== "success" && V !== "partial_failure") continue;
          const X = (Array.isArray(U.metrics) ? U.metrics : []).filter((O) => Number(O?.percent) >= D.threshold);
          if (!X.length) continue;
          const v = X.map((O) => `${String(O?.key || "").trim()}:${String(O?.percentText || "").trim()}`).filter(Boolean).join(",");
          b.push({
            code: D.code,
            message: hm(D.title, U, D.threshold, X),
            eventAt: `${String(U.resourceLabel || D.title || "").trim()}|${String(U.planLabel || "").trim()}|${String(U.periodLabel || "").trim()}|${v}|${V}`
          });
        }
      }
      if (!b.length) return {
        sent: !1,
        reason: "no_alerts"
      };
      const P = JSON.stringify(b.map((N) => ({
        code: N.code,
        eventAt: N.eventAt,
        message: N.message
      }))), A = await e.getOpsStatusPayloadFromDb(n, e.TELEGRAM_ALERT_STATE_DB_SCOPE), w = Date.now(), R = f * 60 * 1e3;
      if (i.ignoreCooldown !== !0 && A && A.signature === P && Number(A.sentAtMs) > 0 && w - Number(A.sentAtMs) < R) return {
        sent: !1,
        reason: "cooldown_active"
      };
      const I = ku(/* @__PURE__ */ new Date(), s.scheduleUtcOffsetMinutes), x = [
        "⚠️ Emby Proxy 运行时异常告警",
        "",
        ...b.map((N) => `- ${N.message}`),
        "",
        `时间：${I.dateKey} ${I.clockTime} (${I.offsetLabel})`,
        "#Emby #Alert"
      ];
      return await e.sendTelegramMessage({
        tgBotToken: c,
        tgChatId: l,
        text: x.join(`
`)
      }), i.persistState !== !1 && (await e.putOpsStatusPayloadToDb(n, e.TELEGRAM_ALERT_STATE_DB_SCOPE, {
        signature: P,
        sentAt: new Date(w).toISOString(),
        sentAtMs: w,
        issues: b
      }, w) || Le("telegram_alert_state.write_failed", /* @__PURE__ */ new Error("telegram alert cooldown state not persisted"), { issueCount: b.length })), {
        sent: !0,
        issueCount: b.length,
        reason: "alert_sent"
      };
    }
  };
}
function Qg(o = {}, e = {}) {
  return {
    ...jg(o, e),
    ...qg(o, e),
    ...Xg(o, e),
    ...Yg(o, e),
    ...Jg(o, e)
  };
}
var Zg = class {
  constructor({ logger: o, service: e }) {
    this.logger = o, this.service = e;
  }
  handle(o, e, t) {
    if (!t || typeof t.waitUntil != "function") throw new TypeError("ScheduledMaintenanceFacade.handle requires ctx.waitUntil");
    const r = this.#p(o, e, t);
    t.waitUntil(r);
  }
  #t(o = {}, ...e) {
    for (const t of e) {
      if (!t) continue;
      const r = o?.[t];
      if (H(r)) return r;
    }
    return {};
  }
  #e(o = "success") {
    return o === "success" ? "partial_failure" : o;
  }
  #o(o = {}, e = "") {
    const t = String(e || o?.localDateKey || "");
    return t ? {
      ...o,
      localDateKey: t,
      executedSlots: Ot(o?.executedSlots || [], [])
    } : {
      ...o,
      executedSlots: Ot(o?.executedSlots || [], [])
    };
  }
  #s(o = {}, e = "", t = "") {
    return this.#o({
      ...o,
      executedSlots: [...o?.executedSlots || [], t]
    }, e);
  }
  #n(o = "", e = []) {
    const t = e[e.length - 1] || "";
    return {
      processedSlots: e,
      lastPlannedSlot: t ? `${o} ${t}` : "",
      reason: e.length > 1 ? "clock_slots_processed" : "clock_slot_processed"
    };
  }
  #r(o = {}, e = "", t = "", r = {}) {
    return {
      ...o,
      status: "skipped",
      lastSkippedAt: e,
      reason: t,
      ...r
    };
  }
  #i(o = {}, e = "", t = {}) {
    return {
      ...o,
      status: "success",
      lastSuccessAt: e,
      ...t
    };
  }
  #c(o = {}, e = "", t = "", r = {}) {
    return {
      ...o,
      status: "failed",
      lastErrorAt: e,
      lastError: t,
      ...r
    };
  }
  #u(o = "") {
    return async (e, t, r = null, a = null) => {
      try {
        return await e;
      } catch (n) {
        return this.logger.error(`scheduled.${t}`, n, {
          leaseToken: o,
          ...H(r) ? r : {}
        }), a;
      }
    };
  }
  #a(o, e, t) {
    return { scheduled: {
      lastSkippedAt: o,
      lastSkipReason: t,
      lock: {
        status: "busy",
        reason: t,
        expiresAt: e.lock?.expiresAt || null,
        backend: String(e?.backend || e?.lock?.backend || "").trim() || "d1"
      }
    } };
  }
  #d(o, e, t = "d1") {
    const r = String(e || "scheduled_skipped").trim() || "scheduled_skipped";
    return { scheduled: {
      status: "skipped",
      lastSkippedAt: o,
      lastSkipReason: r,
      lastFinishedAt: o,
      lock: {
        status: "skipped",
        reason: r,
        backend: String(t || "").trim() || "d1"
      }
    } };
  }
  #f(o, e, t, r) {
    return { scheduled: {
      status: "running",
      lastStartedAt: o,
      lock: {
        status: "held",
        token: e,
        expiresAt: t.lock?.expiresAt || B() + r
      }
    } };
  }
  #l(o, e, t) {
    return o.lostReason ? {
      status: "lost",
      reason: o.lostReason,
      lastCheckedAt: e
    } : {
      status: t ? "released" : "release_skipped",
      releasedAt: e
    };
  }
  #m({ leaseStores: o, leaseToken: e, scheduledLeaseMs: t, leaseBackend: r = "", initialLock: a = null }) {
    const n = {
      active: !0,
      lostReason: null,
      lock: a
    }, s = async () => {
      if (!n.active) return null;
      const l = await this.service.renewScheduledLease(o, e, t, { backend: r });
      return l ? (n.lock = l, l) : (n.active = !1, n.lostReason = n.lostReason || "lease_lost", null);
    }, i = async () => {
      if (!n.active) throw new Error(n.lostReason || "scheduled_lease_lost");
      const l = await s();
      if (!l) throw new Error(n.lostReason || "scheduled_lease_lost");
      return l;
    }, c = Math.max(5e3, Math.min(Math.floor(t / 3), 6e4));
    return {
      leaseState: n,
      ensureActive: i,
      keepalivePromise: (async () => {
        for (; n.active; ) {
          let l = c;
          for (; n.active && l > 0; ) {
            const u = Math.min(l, 1e3);
            await $i(u), l -= u;
          }
          if (!n.active) break;
          await s();
        }
      })().catch((l) => {
        n.active = !1, n.lostReason = n.lostReason || "lease_renew_failed", this.logger.error("scheduled.lease_keepalive", l, {
          leaseToken: e,
          backend: r || "unknown",
          lostReason: n.lostReason
        });
      })
    };
  }
  async #p(o, e, t) {
    const r = this.service.getDB(e), a = this.service.getKV(e);
    if (!a && !r) return;
    const n = { db: r }, s = await we(e), i = Fe(s?.scheduleUtcOffsetMinutes), c = o?.scheduledTime !== void 0 ? new Date(o.scheduledTime) : /* @__PURE__ */ new Date(), l = Ns(c, i), u = (C = /* @__PURE__ */ new Date()) => Ns(C, i), d = fe(s?.scheduledLeaseMs, $.Defaults.ScheduledLeaseMs, $.Defaults.ScheduledLeaseMinMs, 900 * 1e3), f = `${B()}-${Math.random().toString(36).slice(2, 10)}`, m = this.#u(f), p = async (C) => {
      const L = String(C || "db_unavailable").trim() || "db_unavailable";
      await m(this.service.patchOpsStatus(e, this.#d(l, L, "d1")), "patch_skipped_status", {
        reason: L,
        backend: "d1"
      }, null);
    };
    if (!r) {
      await p("db_not_configured");
      return;
    }
    const h = await this.service.tryAcquireScheduledLeaseWithDb(r, {
      token: f,
      leaseMs: d
    });
    if (!h.acquired) {
      const C = String(h.reason || "lease_not_acquired");
      if (C === "db_not_configured" || C === "db_unavailable" || C === "db_init_failed") {
        await p(C);
        return;
      }
      await m(this.service.patchOpsStatus(e, this.#a(l, h, C)), "patch_busy_status", { reason: C }, null);
      return;
    }
    const g = String(h.backend || h.lock?.backend || "").trim().toLowerCase(), { leaseState: y, ensureActive: _, keepalivePromise: S } = this.#m({
      leaseStores: n,
      leaseToken: f,
      scheduledLeaseMs: d,
      leaseBackend: g,
      initialLock: h.lock || null
    }), E = l;
    await m(this.service.patchOpsStatus(e, this.#f(E, f, y, d)), "patch_running_status", { startedAt: E }, null);
    const b = {
      status: "success",
      lastStartedAt: E,
      lastFinishedAt: null,
      lastSuccessAt: null,
      lastErrorAt: null,
      lastError: null,
      d1Tidy: {},
      cleanup: {},
      kvTidy: {},
      tgDailyReport: {},
      alerts: {}
    }, T = () => u(/* @__PURE__ */ new Date());
    try {
      const C = s || {}, L = await m(this.service.getOpsStatusSection(e, "scheduled"), "read_previous_status", null, {});
      if (r) try {
        await _();
        const D = dt(c, C.scheduleUtcOffsetMinutes), U = D.dateKey, V = D.startTs, X = D.endTs, v = Fe(C.scheduleUtcOffsetMinutes), O = this.service.getPreviousD1TidyState(L), M = await this.service.tidyD1Data(e, {
          db: r,
          kv: a,
          ctx: t,
          config: C,
          mode: "scheduled",
          maintenanceMode: "smart",
          previousScheduledState: L,
          previousCleanupStatus: O,
          scheduledNow: c,
          dayWindow: D,
          statsBucketDate: U,
          statsStartTs: V,
          statsEndTs: X,
          statsUtcOffsetMinutes: v,
          beforeEachStep: _
        }), k = T(), j = this.service.buildD1TidyStatusPayload(M.summary, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: k
        });
        b.d1Tidy = j.d1Tidy, b.cleanup = j.cleanup, (b.d1Tidy.status === "partial_failure" || b.d1Tidy.status === "failed") && (b.status = "partial_failure"), await _();
      } catch (D) {
        b.status = "partial_failure";
        const U = this.service.buildD1TidyStatusPayload({
          status: "failed",
          lastError: D?.message || String(D),
          maintenanceMode: "smart"
        }, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: T()
        });
        b.d1Tidy = U.d1Tidy, b.cleanup = U.cleanup, this.logger.error("Scheduled DB Cleanup Error: ", D);
      }
      else {
        const D = this.service.buildD1TidyStatusPayload({
          status: "skipped",
          reason: "db_not_configured",
          maintenanceMode: "smart"
        }, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: T()
        });
        b.d1Tidy = D.d1Tidy, b.cleanup = D.cleanup;
      }
      try {
        await _();
        const D = await this.service.snapshotCfDailyTrafficArchive(e, {
          config: C,
          nowMs: c.getTime()
        });
        b.cfTrafficArchive = {
          status: String(D?.status || "success"),
          storedCount: Math.max(0, Number(D?.storedCount) || 0),
          lastFinishedAt: T()
        }, D?.status === "partial_failure" && (b.status = this.#e(b.status));
      } catch (D) {
        b.status = this.#e(b.status), b.cfTrafficArchive = {
          status: "failed",
          lastError: D?.message || String(D),
          lastFinishedAt: T()
        }, this.logger.error("Scheduled CF traffic archive Error: ", D);
      }
      b.kvTidy = {
        ...this.#t(L, "kvTidy"),
        mode: "manual_only",
        lastAutoSkipAt: T(),
        autoSkipReason: "manual_only"
      };
      const { tgBotToken: P, tgChatId: A } = C, w = this.#t(L, "tgDailyReport", "report"), R = this.#t(L, "alerts"), I = Ot(C.tgDailyReportClockTimes, $.Defaults.TgDailyReportClockTimes), x = $u(w, I, i, c), N = Cc(C, C), F = {
        ...w,
        clockTimes: I,
        reportKinds: N
      };
      if (C.tgDailyReportEnabled === !0) {
        let D = this.#o(x.fixedQueue);
        if (!N.length) b.tgDailyReport = this.#r(F, T(), "report_kinds_disabled", { fixedQueue: D });
        else if (!P || !A) b.tgDailyReport = this.#r(F, T(), "telegram_not_configured", { fixedQueue: D });
        else if (x.due !== !0) b.tgDailyReport = this.#r(F, T(), x.reason || "time_not_matched", { fixedQueue: D });
        else {
          let U = [], V = null, X = 0;
          for (const v of x.dueSlots) try {
            await _();
            const O = await this.service.sendDailyTelegramReport(e, {
              now: c,
              reportKinds: N
            });
            X += Number(O?.sentCount) || 0, U.push(v), D = this.#s(D, x.context.dateKey, v);
          } catch (O) {
            V = O, this.logger.error("Scheduled Daily Report Error: ", O);
            break;
          }
          V ? (b.status = this.#e(b.status), b.tgDailyReport = this.#c(F, T(), V?.message || String(V), {
            fixedQueue: D,
            processedSlots: U
          })) : b.tgDailyReport = this.#i(F, T(), {
            fixedQueue: D,
            sentCount: X,
            ...this.#n(x.context.dateKey, U)
          });
        }
      } else b.tgDailyReport = this.#r(F, T(), "disabled", { fixedQueue: x.fixedQueue });
      try {
        await _();
        const D = await this.service.maybeSendRuntimeAlerts(e, b), U = T();
        b.alerts = D.sent === !0 ? this.#i(R, U, {
          lastPolledAt: U,
          lastSkippedAt: R.lastSkippedAt || "",
          issueCount: Number(D.issueCount) || 0,
          reason: D.reason || "alert_sent"
        }) : this.#r(R, U, D.reason || "no_alerts", {
          lastPolledAt: U,
          lastSuccessAt: R.lastSuccessAt || "",
          issueCount: Number(D.issueCount) || 0
        });
      } catch (D) {
        b.status = this.#e(b.status);
        const U = T();
        b.alerts = this.#c(R, U, D?.message || String(D), { lastPolledAt: U }), this.logger.error("Scheduled Alert Error: ", D);
      }
    } catch (C) {
      b.status = "failed", b.lastErrorAt = T(), b.lastError = C?.message || String(C), this.logger.error("Scheduled Task Error: ", C);
    } finally {
      y.active = !1, await S;
      const C = T();
      b.lastFinishedAt = C, b.status === "success" && (b.lastSuccessAt = C);
      const L = y.lostReason ? !1 : await m(this.service.releaseScheduledLease(n, f, { backend: g }), "release_lease", { backend: g }, !1);
      b.lock = this.#l(y, C, L), await m(this.service.patchOpsStatus(e, { scheduled: b }), "patch_final_status", {
        finishedAt: C,
        finalStatus: b.status,
        leaseLostReason: y.lostReason || ""
      }, null);
    }
  }
};
function eh(o = {}, e = {}) {
  return {
    sanitizeHeaders(t) {
      if (!t || typeof t != "object" || Array.isArray(t)) return {};
      const r = {};
      for (const [a, n] of Object.entries(t)) {
        const s = String(a || "").trim();
        s && (fo.has(s.toLowerCase()) || (r[s] = String(n ?? "")));
      }
      return r;
    },
    normalizeTargets(t) {
      const r = String(t || "").split(",").map((n) => n.trim()).filter(Boolean);
      if (!r.length) return null;
      const a = [];
      for (const n of r) {
        const s = Ks(n);
        if (!s) return null;
        a.push(s);
      }
      return a.length ? a.join(",") : null;
    },
    normalizeSingleTarget(t) {
      const r = e.normalizeTargets(t);
      if (!r) return null;
      const [a] = r.split(",").map((n) => n.trim()).filter(Boolean);
      return a || null;
    },
    normalizeTargetPort(t) {
      const r = String(t ?? "").trim();
      if (!r) return "";
      if (!/^\d{1,5}$/.test(r)) return null;
      const a = Number(r);
      return !Number.isInteger(a) || a < 1 || a > 65535 ? null : String(a);
    },
    buildTargetWithPort(t, r = "", a = "") {
      return Ks(t, r, a);
    },
    buildDefaultLineName(t) {
      return `线路${Number(t) + 1}`;
    },
    normalizeLineId(t, r = 0) {
      return String(t || "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || `line-${Number(r) + 1}`;
    },
    parseLatencyMs(t) {
      if (t === "" || t === null || t === void 0) return null;
      const r = Number(t);
      return !Number.isFinite(r) || r < 0 ? null : Math.round(r);
    },
    normalizeIsoDatetime(t) {
      if (!t) return "";
      const r = new Date(t);
      return Number.isFinite(r.getTime()) ? r.toISOString() : "";
    },
    normalizeLines(t, r = "", a = "") {
      const n = String(e.normalizeTargets(r) || "").split(",").map((d) => d.trim()).filter(Boolean), s = e.normalizeTargetPort(a), i = s === null ? "" : s, c = Array.isArray(t) && t.length ? t : n.map((d, f) => ({
        id: `line-${f + 1}`,
        name: e.buildDefaultLineName(f),
        target: d
      }));
      if (!c.length) return [];
      const l = [], u = /* @__PURE__ */ new Set();
      return c.forEach((d, f) => {
        const m = d && typeof d == "object" && !Array.isArray(d) ? d : { target: d };
        let p = e.normalizeSingleTarget(e.buildTargetWithPort(m?.target, m?.port, i));
        if (!p && n[f] && (p = e.normalizeSingleTarget(e.buildTargetWithPort(n[f], m?.port, i))), !p) return;
        const h = e.normalizeLineId(m?.id, f);
        let g = h, y = 2;
        for (; u.has(g); )
          g = `${h}-${y}`, y += 1;
        u.add(g), l.push({
          id: g,
          name: String(m?.name || "").trim() || e.buildDefaultLineName(f),
          target: p
        });
      }), l;
    },
    resolveActiveLineId(t, r, a = [], n = "") {
      if (!Array.isArray(r) || !r.length) return "";
      const s = String(t || "").trim();
      if (s && r.some((i) => i.id === s)) return s;
      if (Array.isArray(a)) for (const i of a) {
        if (!i || typeof i != "object" || Array.isArray(i) || i.enabled !== !0) continue;
        const c = String(i.id || "").trim();
        if (c && r.some((d) => d.id === c)) return c;
        const l = e.normalizeSingleTarget(e.buildTargetWithPort(i.target, i.port, n));
        if (!l) continue;
        const u = r.find((d) => d.target === l);
        if (u) return u.id;
      }
      return r[0].id;
    },
    buildLegacyTargetFromLines(t = []) {
      return (Array.isArray(t) ? t : []).map((r) => String(r?.target || "").trim()).filter(Boolean).join(",");
    },
    getActiveNodeLine(t) {
      const r = Array.isArray(t?.lines) ? t.lines : [];
      if (!r.length) return null;
      const a = String(t?.activeLineId || "").trim();
      return r.find((n) => n.id === a) || r[0];
    },
    getOrderedNodeLines(t) {
      const r = Array.isArray(t?.lines) ? t.lines.slice() : [];
      if (r.length <= 1) return r;
      const a = e.getActiveNodeLine(t);
      return a ? [a, ...r.filter((n) => n.id !== a.id)] : r;
    },
    sortNodeLinesByLatency(t = []) {
      return (Array.isArray(t) ? t : []).map((r, a) => ({
        line: r,
        index: a
      })).sort((r, a) => {
        const n = Number.isFinite(r.line?.latencyMs) ? r.line.latencyMs : Number.POSITIVE_INFINITY, s = Number.isFinite(a.line?.latencyMs) ? a.line.latencyMs : Number.POSITIVE_INFINITY;
        return n !== s ? n - s : r.index - a.index;
      }).map((r) => r.line);
    },
    isPingCacheFresh(t, r) {
      const a = Number(t?.latencyMs), n = Date.parse(String(t?.latencyUpdatedAt || ""));
      if (!Number.isFinite(a) || !Number.isFinite(n)) return !1;
      const s = Math.max(0, Number(r) || 0) * 60 * 1e3;
      return s <= 0 ? !1 : B() - n < s;
    }
  };
}
function Jn(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e.startsWith("emby ") ? "emby" : e.startsWith("mediabrowser ") ? "mediabrowser" : "";
}
function th(o = "", e = "") {
  const t = String(o || "").trim();
  if (!t) return "";
  const r = t.replace(/^[^\s]+\s+/i, "").trim();
  return r ? e === "emby" ? `Emby ${r}` : e === "mediabrowser" ? `MediaBrowser ${r}` : t : t;
}
function _s(o = "") {
  const e = String(o || "").trim();
  if (!e) return {};
  const t = e.replace(/^[^\s]+\s+/i, "").trim();
  if (!t || !t.includes("=")) return {};
  const r = {}, a = /([A-Za-z][A-Za-z0-9_-]*)\s*=\s*(?:"([^"]*)"|([^,]+))/g;
  let n;
  for (; (n = a.exec(t)) !== null; ) {
    const s = String(n[1] || "").trim().toLowerCase(), i = String(n[2] !== void 0 ? n[2] : n[3] || "").trim();
    !s || !i || Object.prototype.hasOwnProperty.call(r, s) || (r[s] = i);
  }
  return r;
}
var rh = /* @__PURE__ */ new Set([
  "apikey",
  "accesstoken",
  "token",
  "authorization",
  "xembytoken",
  "xembyauthorization",
  "xmediabrowsertoken",
  "xmediabrowserauthorization"
]), Wl = /* @__PURE__ */ new Set([
  "deviceid",
  "xembydeviceid",
  "xmediabrowserdeviceid"
]);
function ah(o, e) {
  const t = o instanceof URL ? o : null;
  if (!t || !(e instanceof Set)) return !1;
  for (const r of t.searchParams.keys()) if (e.has(Wa(r))) return !0;
  return !1;
}
function ke(o, e = "") {
  if (o instanceof Headers) return o.get(e) || "";
  const t = String(e || "").trim().toLowerCase();
  for (const [r, a] of kn(o))
    if (String(r || "").trim().toLowerCase() === t)
      return String(a ?? "");
  return "";
}
function nh(o = "") {
  const e = String(o ?? "").replace(/[\r\n]+/g, " ").trim();
  if (!e) return "";
  let t = "";
  for (const r of e) {
    const a = r.charCodeAt(0);
    if (a === 9 || a >= 32 && a <= 126 || a >= 160 && a <= 255) {
      t += r;
      continue;
    }
    t += encodeURIComponent(r);
  }
  return t;
}
function oh(o) {
  const e = new Headers();
  for (const [t, r] of kn(o)) {
    const a = String(t || "").trim();
    if (!a) continue;
    const n = String(r ?? "");
    try {
      e.set(a, n);
    } catch {
      const s = nh(n);
      if (!s) continue;
      try {
        e.set(a, s);
      } catch {
      }
    }
  }
  return e;
}
function bs(o) {
  const e = {
    token: "",
    deviceId: ""
  };
  for (const t of ["X-Emby-Token", "X-MediaBrowser-Token"]) {
    const r = ke(o, t).trim();
    if (r) {
      e.token = r;
      break;
    }
  }
  for (const t of [
    "Authorization",
    "X-Emby-Authorization",
    "X-MediaBrowser-Authorization"
  ]) {
    const r = ke(o, t).trim();
    if (!r) continue;
    const a = _s(r);
    if (!e.token && a.token && (e.token = a.token), !e.deviceId && a.deviceid && (e.deviceId = a.deviceid), !e.token) {
      const n = /^Bearer\s+(.+)$/i.exec(r);
      n?.[1] && (e.token = n[1].trim());
    }
  }
  if (!e.deviceId) for (const t of ["X-Emby-Device-Id"]) {
    const r = ke(o, t).trim();
    if (r) {
      e.deviceId = r;
      break;
    }
  }
  return e;
}
function sh(o = "") {
  const e = String(o || "").trim();
  if (!e || /^Bearer\s+.+$/i.test(e)) return !0;
  const t = _s(e);
  return !!String(t.token || "").trim();
}
function oa(o) {
  const e = bs(o), t = [], r = [], a = Ss(ke(o, "Cookie"), wa);
  if (a) {
    for (const d of Oa(a).keys())
      if (Pg(d)) {
        r.push("cookie");
        break;
      }
  }
  for (const d of Dl) {
    const f = ke(o, d).trim();
    f && (sh(f) || t.push(d));
  }
  for (const [d, f] of kn(o)) {
    const m = String(d || "").trim().toLowerCase(), p = String(f || "").trim();
    !m || !p || xl(m) && t.push(m);
  }
  const n = [...new Set(t)], s = [...new Set(r)], i = !!String(e.token || "").trim() || !!String(e.deviceId || "").trim(), c = n.length > 0, l = s.length > 0, u = !c && !l;
  return {
    canDirect: u,
    reason: u ? "" : "direct_transport_incompatible",
    headerAuthHeaders: n,
    cookieAuthHeaders: s,
    hasQueryAuth: i,
    hasHeaderAuth: c,
    hasCookieAuth: l,
    auth: e
  };
}
function En(o, e, t = "") {
  const r = o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), a = (e && typeof e == "object" && "auth" in e ? e : { auth: bs(e) }).auth || {}, n = jt(t), s = n === "jellyfin" ? ["ApiKey"] : n === "emby" ? ["api_key"] : ["api_key", "ApiKey"];
  if (a.token)
    for (const i of s) r.searchParams.has(i) || r.searchParams.set(i, a.token);
  return a.deviceId && !ah(r, Wl) && r.searchParams.set("DeviceId", a.deviceId), r;
}
function ih(o, e = "") {
  const t = String(e || "").trim().replace(/["\\]/g, "");
  return t ? `${o === "emby" ? "Emby" : "MediaBrowser"} Token="${t}"` : "";
}
var ch = [
  "api_key",
  "ApiKey",
  "X-Emby-Token",
  "X-MediaBrowser-Token"
];
function lh(o = "") {
  for (const e of o) {
    const t = e.codePointAt(0);
    if (t < 32 || t > 255) return !1;
  }
  return !0;
}
function uh(o) {
  if (!(o instanceof URL)) return "";
  for (const e of ch) {
    const t = String(o.searchParams.get(e) || "").trim();
    if (t && lh(t)) return t;
  }
  return "";
}
function Mo(o, e = "auto", t = "") {
  const r = jt(e);
  if (r === "passthrough") return o;
  const a = o.get("Authorization")?.trim() || "", n = o.get("X-Emby-Authorization")?.trim() || "", s = o.get("X-MediaBrowser-Authorization")?.trim() || "", i = Jn(a), c = Jn(s), l = Jn(n), u = r === "emby" ? "emby" : r === "jellyfin" ? "mediabrowser" : "", d = u || "mediabrowser";
  let f = i ? a : c ? s : l ? n : "";
  const m = ke(o, "X-Emby-Token").trim() || ke(o, "X-MediaBrowser-Token").trim() || ke(o, "X-Emby-Auth-Token").trim() || ke(o, "X-MediaBrowser-Auth-Token").trim();
  if (f) {
    if (!_s(f).token) {
      const h = m || String(t || "").trim();
      if (h) {
        const g = h.replace(/["\\]/g, "");
        f = `${f.replace(/,\s*$/, "")}, Token="${g}"`;
      }
    }
  } else {
    const h = /^Bearer\s+(.+)$/i.exec(a);
    f = ih(d, m || (h ? h[1] : "") || String(t || "").trim());
  }
  if (!f) return o;
  const p = i || c || l || "";
  return f = th(f, u || (p === "emby" ? "mediabrowser" : p)), o.set("Authorization", f), o.set("X-Emby-Authorization", f), o.delete("X-MediaBrowser-Authorization"), o;
}
function Po(o, e = {}) {
  if (!(o instanceof Headers)) return o;
  const t = e.dropTokenHeaders !== !1;
  return [
    "Authorization",
    "X-Emby-Authorization",
    "X-MediaBrowser-Authorization"
  ].forEach((r) => o.delete(r)), t && [
    "X-Emby-Token",
    "X-MediaBrowser-Token",
    "X-Emby-Auth-Token",
    "X-MediaBrowser-Auth-Token"
  ].forEach((r) => o.delete(r)), o;
}
function dh() {
  const o = {};
  for (const e of ["direct", "proxy"]) {
    o[e] = {};
    for (const t of [
      "none",
      "query",
      "header",
      "cookie"
    ]) {
      o[e][t] = {};
      for (const r of [
        "none",
        "same_origin",
        "external"
      ]) o[e][t][r] = {
        deliveryMode: e,
        authCarrier: t,
        redirectScope: r,
        clientVisibleRedirect: e === "direct" && r !== "none",
        workerFollowRedirect: e === "proxy",
        reasonCode: e === "direct" ? r === "none" ? "entry_direct" : "client_redirect" : "worker_follow_redirect"
      };
    }
  }
  return Object.freeze(o);
}
var fh = dh();
function Ci(o = {}) {
  const e = o && typeof o == "object" ? o : null, t = String(o?.corsOrigins || ""), r = String(o?.ipBlacklist || ""), a = String(o?.geoAllowlist || ""), n = String(o?.geoBlocklist || ""), s = e ? oe.ProxyAccessRuleProfileCache.get(e) : null;
  if (s && s.corsOriginsRaw === t && s.ipBlacklistRaw === r && s.geoAllowlistRaw === a && s.geoBlocklistRaw === n) return s;
  const i = (u, d = !1) => {
    const f = [], m = /* @__PURE__ */ new Set();
    for (const p of u.split(",")) {
      const h = p.trim(), g = d ? h.toUpperCase() : h;
      !g || m.has(g) || (m.add(g), f.push(g));
    }
    return {
      values: f,
      valueSet: m
    };
  }, c = i(t), l = {
    corsOriginsRaw: t,
    ipBlacklistRaw: r,
    geoAllowlistRaw: a,
    geoBlocklistRaw: n,
    corsOrigins: c.values,
    corsOriginSet: c.valueSet,
    ipBlacklist: i(r).valueSet,
    geoAllowlist: i(a, !0).valueSet,
    geoBlocklist: i(n, !0).valueSet
  };
  return e && oe.ProxyAccessRuleProfileCache.set(e, l), l;
}
function mh(o = {}, e = {}) {
  const { persistCloudflareDnsRecordsForHost: t } = o;
  return {
    normalizeNode(r, a, n = {}) {
      const s = { ...a };
      let i = !1;
      const c = e.normalizeTargetPort(s.port), l = e.normalizeLines(s.lines, s.target, c || ""), u = e.resolveActiveLineId(s.activeLineId, l, Array.isArray(s.lines) ? s.lines : [], c || ""), d = e.buildLegacyTargetFromLines(l);
      JSON.stringify(l) !== JSON.stringify(Array.isArray(s.lines) ? s.lines : []) && (i = !0), String(s.activeLineId || "") !== u && (i = !0), String(s.target || "") !== d && (i = !0), s.lines = l, s.activeLineId = u, s.target = d, Object.prototype.hasOwnProperty.call(s, "port") && (delete s.port, i = !0), s.secret === void 0 && (s.secret = "", i = !0);
      const f = Xr(s.tags, s.tag), m = f[0] || "";
      JSON.stringify(f) !== JSON.stringify(Array.isArray(s.tags) ? s.tags : []) && (i = !0), String(s.tag || "") !== m && (i = !0), s.tags = f, s.tag = m;
      const p = [["server", "Record"].join(""), ["media", "Aggregation"].join("")];
      for (const A of Object.keys(s).filter((w) => p.some((R) => w.startsWith(R))))
        delete s[A], i = !0;
      s.remark === void 0 && (s.remark = "", i = !0), s.tagColor === void 0 && (s.tagColor = "", i = !0), s.remarkColor === void 0 && (s.remarkColor = "", i = !0), s.displayName === void 0 && (s.displayName = "", i = !0);
      const h = s.tmdbAggregationEnabled === !0;
      s.tmdbAggregationEnabled !== h && (i = !0), s.tmdbAggregationEnabled = h;
      const g = qt(s.aggregationMode);
      s.aggregationMode !== g && (i = !0), s.aggregationMode = g;
      const y = dr(s.entryMode);
      String(s.entryMode || "") !== y && (i = !0), s.entryMode = y, y === "host_prefix" && String(s.secret ?? "") !== "" && (s.secret = "", i = !0);
      const _ = y === "host_prefix" ? Zt(s.hostPrefixCnameTarget) : "";
      String(s.hostPrefixCnameTarget || "") !== _ && (i = !0), s.hostPrefixCnameTarget = _;
      const S = Ur(s.playbackInfoMode);
      String(s.playbackInfoMode || "") !== S && (i = !0), s.playbackInfoMode = S;
      const E = jt(s.mediaAuthMode);
      String(s.mediaAuthMode || "") !== E && (i = !0), s.mediaAuthMode = E;
      const b = Fr(s.realClientIpMode);
      String(s.realClientIpMode || "") !== b && (i = !0), s.realClientIpMode = b;
      const T = _a(s.hedgeProbePath);
      String(s.hedgeProbePath || "") !== T && (i = !0), s.hedgeProbePath = T;
      const C = qr(s);
      String(s.mainVideoStreamMode || "") !== C && (i = !0), s.mainVideoStreamMode = C;
      const L = Br(s.routingDecisionMode);
      if (String(s.routingDecisionMode || "") !== L && (i = !0), s.routingDecisionMode = L, Object.prototype.hasOwnProperty.call(s, "wangpanDirectMode") && (delete s.wangpanDirectMode, i = !0), Object.prototype.hasOwnProperty.call(s, "wangpanMode") && (delete s.wangpanMode, i = !0), n && typeof n == "object" && "dropLegacyDirectRouting" in n && n.dropLegacyDirectRouting === !0) for (const A of [...as, ...ns])
        Object.prototype.hasOwnProperty.call(s, A) && (delete s[A], i = !0);
      const P = e.sanitizeHeaders(s.headers);
      return JSON.stringify(P) !== JSON.stringify(s.headers || {}) && (i = !0), s.headers = P, delete s.videoThrottling, delete s.interceptMs, s.schemaVersion !== 6 && (s.schemaVersion = 6, i = !0), Object.prototype.hasOwnProperty.call(s, "createdAt") && (delete s.createdAt, i = !0), Object.prototype.hasOwnProperty.call(s, "updatedAt") && (delete s.updatedAt, i = !0), {
        data: s,
        changed: i
      };
    },
    buildComparableNodePayload(r = {}, a = {}) {
      if (!H(r)) return null;
      const n = { ...r };
      a.includeName !== !0 && delete n.name, delete n.createdAt, delete n.updatedAt;
      const s = (i) => {
        if (Array.isArray(i)) return i.map((c) => s(c));
        if (H(i)) {
          const c = {};
          for (const l of Object.keys(i).sort()) c[l] = s(i[l]);
          return c;
        }
        return i;
      };
      return s(n);
    },
    areNodePayloadsEquivalent(r = {}, a = {}, n = {}) {
      const s = e.buildComparableNodePayload(r, n), i = e.buildComparableNodePayload(a, n);
      return re(s) === re(i);
    },
    buildNodeRecord(r, a, n = {}) {
      let s = a?.headers !== void 0 ? a.headers : n.headers;
      if (typeof s == "string") try {
        s = JSON.parse(s);
      } catch {
        s = {};
      }
      const i = {};
      for (const p of ["proxyMode", "mode"]) {
        const h = a?.[p] !== void 0 ? a[p] : n[p];
        h !== void 0 && (i[p] = String(h || "").trim());
      }
      for (const p of [
        "direct",
        "sourceDirect",
        "directSource",
        "direct2xx"
      ]) a?.[p] !== void 0 ? i[p] = a[p] === !0 : n[p] !== void 0 && (i[p] = n[p] === !0);
      const c = Array.isArray(a?.lines) ? a.lines : a?.target !== void 0 ? [] : n.lines, l = a?.target !== void 0 ? a.target : n.target, u = a?.port !== void 0 ? a.port : n.port, d = e.normalizeLines(c, l, u);
      if (!d.length) return null;
      const f = e.resolveActiveLineId(a?.activeLineId !== void 0 ? a.activeLineId : n.activeLineId, d, Array.isArray(a?.lines) ? a.lines : n.lines, u), m = a?.mainVideoStreamMode !== void 0 ? a.mainVideoStreamMode : a?.wangpanDirectMode !== void 0 ? a.wangpanDirectMode : a?.wangpanMode;
      return e.normalizeNode(r, {
        target: e.buildLegacyTargetFromLines(d),
        lines: d,
        activeLineId: f,
        ...i,
        entryMode: a?.entryMode !== void 0 ? dr(a.entryMode) : dr(n.entryMode),
        hostPrefixCnameTarget: a?.hostPrefixCnameTarget !== void 0 ? a.hostPrefixCnameTarget : n.hostPrefixCnameTarget,
        secret: a?.secret !== void 0 ? a.secret : n.secret || "",
        tag: a?.tag !== void 0 ? a.tag : n.tag || "",
        tags: a?.tags !== void 0 ? a.tags : a?.tag !== void 0 ? [a.tag, ...Xr(n.tags, n.tag).filter((p) => p.toLowerCase() !== String(n.tag || "").trim().toLowerCase())] : n.tags,
        remark: a?.remark !== void 0 ? a.remark : n.remark || "",
        tagColor: a?.tagColor !== void 0 ? String(a.tagColor || "").trim() : n.tagColor || "",
        remarkColor: a?.remarkColor !== void 0 ? String(a.remarkColor || "").trim() : n.remarkColor || "",
        displayName: a?.displayName !== void 0 ? String(a.displayName || "").trim() : n.displayName || "",
        tmdbAggregationEnabled: a?.tmdbAggregationEnabled !== void 0 ? a.tmdbAggregationEnabled === !0 : n.tmdbAggregationEnabled === !0,
        aggregationMode: a?.aggregationMode !== void 0 ? qt(a.aggregationMode) : qt(n.aggregationMode),
        playbackInfoMode: a?.playbackInfoMode !== void 0 ? Ur(a.playbackInfoMode) : Ur(n.playbackInfoMode),
        mediaAuthMode: a?.mediaAuthMode !== void 0 ? jt(a.mediaAuthMode) : jt(n.mediaAuthMode),
        realClientIpMode: a?.realClientIpMode !== void 0 ? Fr(a.realClientIpMode) : Fr(n.realClientIpMode),
        hedgeProbePath: a?.hedgeProbePath !== void 0 ? _a(a.hedgeProbePath) : _a(n.hedgeProbePath),
        routingDecisionMode: a?.routingDecisionMode !== void 0 ? Br(a.routingDecisionMode) : Br(n.routingDecisionMode),
        mainVideoStreamMode: m !== void 0 ? Nn(m) : qr(n),
        headers: e.sanitizeHeaders(s),
        schemaVersion: 6
      }).data;
    },
    buildHostPrefixDnsRecordHost(r = "", a = "") {
      const n = String(r || "").trim().toLowerCase(), s = ne(a);
      return !s || !$a(n) ? "" : `${n}.${s}`;
    },
    buildHostPrefixDnsSyncPlan(r = "", a = null, n = "", s = null, i = "", c = {}) {
      const l = ne(i), u = a && tt(a?.entryMode) ? e.buildHostPrefixDnsRecordHost(r, l) : "", d = s && tt(s?.entryMode) ? e.buildHostPrefixDnsRecordHost(n, l) : "", f = u ? un(a, c.previousConfig || c.config || {}, l) : "", m = d ? un(s, c.nextConfig || c.config || {}, l) : "", p = [], h = [];
      return u && u !== d && p.push({
        type: "delete",
        host: u
      }), d && (c.forceUpsert === !0 || d !== u || m !== f) && p.push({
        type: "upsert",
        host: d,
        cnameTarget: m
      }), d && d !== u && h.push({
        type: "delete",
        host: d
      }), u && u !== d ? h.push({
        type: "upsert",
        host: u,
        cnameTarget: f
      }) : u && m !== f && h.push({
        type: "upsert",
        host: u,
        cnameTarget: f
      }), {
        hostRoot: l,
        previousDnsHost: u,
        nextDnsHost: d,
        previousCnameTarget: f,
        nextCnameTarget: m,
        steps: p,
        rollbackSteps: h,
        changed: p.length > 0
      };
    },
    buildPreparedNodeMutation(r = {}, a = {}, n = {}) {
      const s = String(n.nextName || r?.name || "").trim().toLowerCase();
      if (!s) return null;
      const i = String(n.previousName || r?.originalName || s).trim().toLowerCase() || s, c = e.buildNodeRecord(s, r, a);
      if (!c) return null;
      const l = H(a) && Object.keys(a).length ? e.normalizeNode(i, a || {}).data : null, u = i !== s, d = !u && !!l && e.areNodePayloadsEquivalent(l, c);
      return {
        previousName: i,
        previousNode: l,
        nextName: s,
        nextNode: c,
        isRename: u,
        nodeChanged: u || !d,
        isSemanticNoop: d,
        dnsPlan: null
      };
    },
    async upsertHostPrefixDnsRecord(r = "", a = {}) {
      const n = ne(r);
      if (!n) return null;
      const s = a.config || await we(a.env), i = Sa(s, a.env), c = Zt(a.cnameTarget) || ne(i.host);
      return await t({
        env: a.env,
        kv: a.kv,
        config: s,
        host: n,
        mode: "cname",
        desiredRecords: [{
          type: "CNAME",
          content: c,
          ttl: 1,
          proxied: !1
        }],
        requestHost: ne(a.requestHost || i.host),
        skipHistory: a.skipHistory === !0,
        includeAllRecords: !1
      });
    },
    async deleteHostPrefixDnsRecord(r = "", a = {}) {
      const n = ne(r);
      if (!n) return null;
      const s = Sa(a.config || await we(a.env), a.env), i = String(s.cfZoneId || "").trim(), c = String(s.cfApiToken || "").trim(), l = await ls(i, c, { scope: "node.host_prefix_dns_delete.zone_lookup" }), u = String(l?.name || "").trim();
      if (u && !Ca(n, u)) throw Ie("INVALID_HOST", "当前子域不在 Cloudflare Zone 下", 400, {
        host: n,
        zoneName: u
      });
      const d = (await zr(i, c, { nameExact: n })).filter((m) => ne(m?.name) === n && String(m?.type || "").trim().toUpperCase() === "CNAME");
      if (!d.length) return {
        ok: !0,
        deletedCount: 0,
        host: n
      };
      const f = gl(i, c, n, `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(i)}/dns_records`, d[0] || {
        name: n,
        ttl: 1,
        proxied: !1
      });
      for (const m of d) await f.deleteRecord(m);
      return {
        ok: !0,
        deletedCount: d.length,
        host: n
      };
    },
    async persistHostPrefixDnsSyncPlan(r = {}, a = {}) {
      const n = Array.isArray(r?.steps) ? r.steps : [];
      if (!n.length) return null;
      Sa(a.config || await we(a.env), a.env);
      for (const s of n) {
        if (String(s?.type || "").trim().toLowerCase() === "delete") {
          await e.deleteHostPrefixDnsRecord(s.host, a);
          continue;
        }
        String(s?.type || "").trim().toLowerCase() === "upsert" && await e.upsertHostPrefixDnsRecord(s.host, {
          ...a,
          cnameTarget: s.cnameTarget
        });
      }
      return {
        changed: !0,
        stepCount: n.length
      };
    },
    async applyPreparedNodeMutation(r = {}, a = {}) {
      const n = a.kv;
      if (!n || r?.nodeChanged !== !0) return !1;
      const s = String(r?.previousName || "").trim().toLowerCase(), i = String(r?.nextName || "").trim().toLowerCase();
      return r?.nextNode ? await n.put(`${e.PREFIX}${i}`, JSON.stringify(r.nextNode)) : i && await n.delete(`${e.PREFIX}${i}`), s && i && s !== i && await n.delete(`${e.PREFIX}${s}`), e.invalidateNodeCaches([s, i], {
        invalidateList: !0,
        kv: n
      }), !0;
    },
    async rollbackPreparedNodeMutation(r = {}, a = {}) {
      const n = a.kv;
      if (!n || r?.nodeChanged !== !0) return !1;
      const s = String(r?.previousName || "").trim().toLowerCase(), i = String(r?.nextName || "").trim().toLowerCase();
      return s && (r?.previousNode ? await n.put(`${e.PREFIX}${s}`, JSON.stringify(r.previousNode)) : await n.delete(`${e.PREFIX}${s}`)), i && i !== s && await n.delete(`${e.PREFIX}${i}`), e.invalidateNodeCaches([s, i], {
        invalidateList: !0,
        kv: n
      }), !0;
    },
    async rollbackPreparedNodeMutations(r = [], a = {}) {
      const n = a.kv;
      if (!n) return { rolledBackNodeCount: 0 };
      const s = (Array.isArray(r) ? r : []).filter(Boolean);
      if (!s.length) return { rolledBackNodeCount: 0 };
      const i = s.some((u) => u?.dnsPlan?.changed === !0) ? a.config || await we(a.env) : null;
      let c = 0;
      const l = [];
      for (let u = s.length - 1; u >= 0; u -= 1) {
        const d = s[u];
        if (d?.dnsPlan?.changed === !0) try {
          await e.persistHostPrefixDnsSyncPlan({ steps: d?.dnsPlan?.rollbackSteps || [] }, {
            ...a,
            config: i,
            skipHistory: !0
          });
        } catch (f) {
          l.push(`dns:${ue(f, "rollback_failed")}`);
        }
        if (d?.nodeChanged === !0) try {
          await e.rollbackPreparedNodeMutation(d, a), c += 1;
        } catch (f) {
          l.push(`node:${ue(f, "rollback_failed")}`);
        }
      }
      if (a.rebuildIndexes === !0) try {
        await e.rebuildNodeIndexesFromKv(n, {
          ctx: a.ctx,
          syncLegacyIndex: !0
        });
      } catch (u) {
        l.push(`rebuild_indexes:${ue(u, "rollback_failed")}`);
      }
      if (l.length > 0) throw new Error(l.join("; "));
      return { rolledBackNodeCount: c };
    },
    async applyPreparedNodeMutations(r = [], a = {}) {
      if (!a.kv) return { mutatedNodeCount: 0 };
      const n = (Array.isArray(r) ? r : []).filter(Boolean);
      if (!n.length) return { mutatedNodeCount: 0 };
      const s = n.some((f) => f?.dnsPlan?.changed === !0) ? await we(a.env) : null;
      let i = 0;
      const c = [];
      let l = !1, u = !0, d = "";
      try {
        for (const f of n)
          c.push(f), f?.nodeChanged === !0 && (await e.applyPreparedNodeMutation(f, a), i += 1), f?.dnsPlan?.changed === !0 && await e.persistHostPrefixDnsSyncPlan(f.dnsPlan, {
            ...a,
            config: s
          });
        return { mutatedNodeCount: i };
      } catch (f) {
        l = c.length > 0;
        try {
          await e.rollbackPreparedNodeMutations(c, {
            ...a,
            config: s,
            rebuildIndexes: !1
          });
        } catch (m) {
          u = !1, d = ue(m, "rollback_failed");
        }
        throw f && typeof f == "object" && (String(f.code || "").trim() || (f.code = "NODE_MUTATION_FAILED"), f.status = Pe(f.status, 500), f.details = {
          ...H(f.details) ? f.details : {},
          rollbackAttempted: l,
          rollbackSucceeded: u,
          rollbackError: d
        }), f;
      }
    }
  };
}
function ph(o = {}, e = {}) {
  return {
    async pingTarget(t, r, a = {}) {
      const n = B(), s = "GET", i = (f = {}) => ({
        ok: f.ok === !0,
        reason: String(f.reason || "network_error"),
        statusCode: Number.isInteger(f.statusCode) ? f.statusCode : null,
        elapsedMs: Number.isFinite(f.elapsedMs) ? Math.max(0, Math.round(f.elapsedMs)) : Math.max(0, B() - n),
        methodUsed: f.methodUsed === "HEAD" || f.methodUsed === "GET" ? f.methodUsed : null,
        probePath: String(f.probePath || Ps)
      }), c = Ba(String(t || "").trim());
      if (!c) return i({ reason: "invalid_target" });
      let l = null, u = null;
      const d = Rl(c, [Ps, bd]);
      if (!d.length) return i({ reason: "invalid_target" });
      for (const { probePath: f, probeUrl: m } of d) {
        const p = B(), h = new AbortController();
        let g = !1;
        const y = setTimeout(() => {
          g = !0, h.abort();
        }, r);
        let _ = null;
        try {
          const S = await We(m.toString(), {
            method: s,
            headers: Yo(a?.userAgent),
            signal: h.signal
          }), E = Number(S.status);
          try {
            S.body?.cancel?.();
          } catch {
          }
          const b = E >= 200 && E < 400;
          _ = {
            ok: b,
            reason: b ? E < 300 ? "ok" : "redirect" : "http_error",
            statusCode: E,
            methodUsed: s
          };
        } catch (S) {
          const E = [
            S?.name,
            S?.message,
            S?.cause?.name,
            S?.cause?.message
          ].map((T) => String(T || "")).join(" "), b = /\b(?:tls|ssl|x509|certificate|handshake)\b/i.test(E);
          _ = {
            ok: !1,
            reason: g ? "timeout" : b ? "tls_error" : "network_error",
            statusCode: null,
            methodUsed: s
          };
        } finally {
          clearTimeout(y);
        }
        if (_.probePath = f, _.elapsedMs = B() - p, _.ok) return i(_);
        if (_.statusCode === 403) {
          l || (l = _);
          continue;
        }
        if (u = _, _.statusCode === null) break;
      }
      return i(l ? {
        ...l,
        ok: !0,
        reason: "ok"
      } : u || { reason: "network_error" });
    },
    async getNode(t, r, a) {
      t = String(t).toLowerCase();
      const n = e.getKV(r);
      if (!n) return null;
      const s = be(n), i = xe(t, s), c = s.NodeCache.get(t);
      if (c && c.exp > Date.now()) {
        const u = await e.getNodesRevision(n), d = String(c?.nodesRevision || "").trim();
        if (xe(t, s) === i && (!d || !u || d === u))
          return _n(s.NodeCache, t), c.data;
        xe(t, s) === i && s.NodeCache.delete(t);
      }
      const l = xe(t, s);
      return await Pn(s.SingleFlightTasks, mt([
        "proxy_node",
        t,
        l
      ]), async () => {
        try {
          const u = await n.get(`${e.PREFIX}${t}`, { type: "json" });
          if (xe(t, s) !== l) return null;
          if (!u) {
            const h = await e.getNodesSummaryIndex(n, { ctx: a });
            if (Array.isArray(h)) if (h.some((g) => String(g?.name || "").toLowerCase().trim() === t)) {
              const g = e.rebuildNodeIndexesFromKv(n, { ctx: a });
              a ? a.waitUntil(g) : await g;
            } else {
              const g = await e.getNodesRevision(n);
              xe(t, s) === l && He(s.NodeCache, t, {
                data: null,
                exp: Date.now() + $.Defaults.NodeMissCacheTtlMs,
                nodesRevision: g
              }, $.Defaults.NodeCacheMax);
            }
            return null;
          }
          const { data: d, changed: f } = e.normalizeNode(t, u);
          if (at(t, d))
            return s.NodeCache.delete(t), s.PlaybackRouteHotCache.delete(t), d;
          if (f) {
            const h = n.put(`${e.PREFIX}${t}`, JSON.stringify(d));
            a ? a.waitUntil(h) : await h;
          }
          const m = e.upsertNodeSummaryEntry(t, d, {
            kv: n,
            ctx: a
          });
          let p = await e.getNodesRevision(n);
          return p ? a ? a.waitUntil(m) : await m : (await m, p = await e.getNodesRevision(n)), xe(t, s) !== l ? null : (He(s.NodeCache, t, {
            data: d,
            exp: Date.now() + $.Defaults.CacheTTL,
            nodesRevision: p
          }, $.Defaults.NodeCacheMax), d);
        } catch {
          return null;
        }
      });
    },
    async getNodeForRead(t, r) {
      t = String(t).toLowerCase();
      const a = e.getKV(r);
      if (!a) return null;
      const n = be(a), s = xe(t, n), i = n.NodeCache.get(t);
      if (i?.data === null) n.NodeCache.delete(t);
      else if (i && i.exp > Date.now()) {
        const l = await e.getNodesRevision(a), u = String(i?.nodesRevision || "").trim();
        if (xe(t, n) === s && (!u || !l || u === l))
          return _n(n.NodeCache, t), i.data;
        xe(t, n) === s && n.NodeCache.delete(t);
      }
      const c = xe(t, n);
      try {
        const l = await a.get(`${e.PREFIX}${t}`, { type: "json" });
        if (xe(t, n) !== c || !l) return null;
        const u = e.normalizeNode(t, l).data;
        if (at(t, u))
          return n.NodeCache.delete(t), n.PlaybackRouteHotCache.delete(t), u;
        const d = await e.getNodesRevision(a);
        return xe(t, n) !== c ? null : (He(n.NodeCache, t, {
          data: u,
          exp: Date.now() + $.Defaults.CacheTTL,
          nodesRevision: d
        }, $.Defaults.NodeCacheMax), u);
      } catch {
        return null;
      }
    },
    normalizeAdminActionRequest(t) {
      if (!t || typeof t != "object" || Array.isArray(t)) return null;
      const r = t.payload && typeof t.payload == "object" && !Array.isArray(t.payload) ? { ...t.payload } : null, a = String(t.action ?? r?.action ?? "").trim(), n = t.meta && typeof t.meta == "object" && !Array.isArray(t.meta) ? { ...t.meta } : {};
      return {
        action: a,
        data: r ? {
          ...r,
          action: a,
          meta: n
        } : {
          ...t,
          action: a,
          meta: n
        },
        meta: n
      };
    }
  };
}
function gh(o = {}, e = {}) {
  return {
    ...eh(o, e),
    ...mh(o, e),
    ...ph(o, e)
  };
}
var Qn = "proxy_logs_fts";
function hh(o = {}) {
  const e = {
    buildResponse(t = {}) {
      return ae(t);
    },
    buildRange(t, r) {
      return {
        startDate: new Date(t).toISOString(),
        endDate: new Date(r).toISOString()
      };
    },
    normalizeRequest(t = {}) {
      const { page: r = 1, pageSize: a = 50, filters: n = {} } = t, s = Math.max(1, parseInt(r, 10) || 1), i = Math.min(200, Math.max(1, parseInt(a, 10) || 50)), c = String(t?.paginationMode || "").trim().toLowerCase(), l = vc(t?.pageCursor), u = c !== "offset" && (s === 1 || !!l), d = (s - 1) * i, f = Date.now(), m = $.Defaults.LogQueryDefaultDays * 24 * 60 * 60 * 1e3, p = (_) => {
        if (!_) return null;
        const S = new Date(String(_)).getTime();
        return Number.isFinite(S) ? S : null;
      }, h = (_) => {
        if (!_) return null;
        const S = /* @__PURE__ */ (/* @__PURE__ */ new Date(String(_) + "T23:59:59.999")).getTime();
        return Number.isFinite(S) ? S : null;
      };
      let g = p(n.startDate), y = h(n.endDate);
      return Number.isFinite(y) || (y = f), Number.isFinite(g) || (g = Math.max(0, y - m)), g > y && ([g, y] = [Math.max(0, y - m), y]), {
        filters: n,
        safePage: s,
        safePageSize: i,
        requestedPageCursor: l,
        useSeekPagination: u,
        offset: d,
        startTs: g,
        endTs: y
      };
    },
    resolveSearch(t = {}, r = {}, a = {}) {
      const n = String(t.searchMode || "").trim().toLowerCase(), s = n === "fts" || n === "like";
      let i = xc(t.searchMode || r.logSearchMode), c = "";
      if (i === "fts" && a.ftsReady !== !0) {
        if (s) return { errorResponse: z("LOG_FTS_NOT_READY", "FTS5 虚拟表尚未初始化，请先点击“初始化日志表”", 400, {
          searchMode: "fts",
          effectiveSearchMode: "fts",
          searchFallbackReason: ""
        }) };
        i = "like", c = "fts_not_ready";
      }
      return {
        effectiveSearchMode: i,
        searchFallbackReason: c
      };
    },
    buildBasePayload(t = {}, r = {}, a = {}) {
      return {
        page: t.safePage,
        pageSize: t.safePageSize,
        paginationMode: t.useSeekPagination ? "seek" : "offset",
        pageCursor: t.requestedPageCursor,
        revisions: { logsRevision: r.revision },
        range: e.buildRange(t.startTs, t.endTs),
        ...a
      };
    },
    buildDisabledResponse(t = {}, r = {}, a = "", n = "") {
      return e.buildResponse(e.buildBasePayload(t, r, {
        logs: [],
        total: 0,
        totalPages: 1,
        searchMode: a,
        effectiveSearchMode: a,
        searchFallbackReason: n,
        totalExact: !0,
        hasPrevPage: !1,
        hasNextPage: !1,
        nextCursor: null,
        disabled: !0
      }));
    },
    buildSuccessResponse(t = {}, r = {}, a = {}) {
      return e.buildResponse(e.buildBasePayload(t, r, {
        logs: a.logs,
        total: a.total,
        totalPages: a.totalPages,
        searchMode: a.searchMode,
        effectiveSearchMode: a.effectiveSearchMode,
        searchFallbackReason: a.searchFallbackReason,
        totalExact: t.useSeekPagination !== !0,
        hasPrevPage: a.hasPrevPage,
        hasNextPage: a.hasNextPage,
        nextCursor: a.nextCursor
      }));
    },
    buildDisplayState(t = {}) {
      return {
        displayClientIp: t.logDisplayClientIp !== !1,
        displayColo: t.logDisplayColo !== !1,
        displayUa: t.logDisplayUa !== !1
      };
    },
    buildSqlPlan(t = {}, r = {}, a = {}, n = "") {
      const { startTs: s, endTs: i } = r, c = e.buildDisplayState(a), l = Mf(t.requestGroup), u = Pf(t.statusGroup), d = ["proxy_logs.timestamp >= ?", "proxy_logs.timestamp <= ?"], f = [s, i], m = (b, ...T) => {
        d.push(b), T.length > 0 && f.push(...T);
      }, p = "LOWER(proxy_logs.request_path)", h = String(t.keyword || "").trim();
      let g = !1;
      if (h) {
        const b = $.Defaults.LogKeywordMaxWindowDays * 24 * 60 * 60 * 1e3;
        if (i - s > b) return { errorResponse: z("LOG_QUERY_RANGE_TOO_WIDE", `关键词搜索必须限制在 ${$.Defaults.LogKeywordMaxWindowDays} 天内`, 400, { maxWindowDays: $.Defaults.LogKeywordMaxWindowDays }) };
        if (/^\d{3}$/.test(h)) m("proxy_logs.status_code = ?", Number(h));
        else if (Jl(h) || As(h)) {
          const T = [], C = [];
          if (c.displayClientIp && (T.push("proxy_logs.client_ip = ?"), C.push(h)), c.displayColo) {
            const L = As(h) ? h.toUpperCase() : h;
            T.push("COALESCE(proxy_logs.inbound_colo, proxy_logs.inbound_ip, '') = ?"), C.push(L), T.push("COALESCE(proxy_logs.outbound_colo, proxy_logs.outbound_ip, '') = ?"), C.push(L);
          }
          m(T.length ? `(${T.join(" OR ")})` : "1 = 0", ...C);
        } else if (n === "fts")
          m(`${Qn} MATCH ?`, Hf(h)), g = !0;
        else {
          const T = `%${Ga(h)}%`;
          if (ve(T) > xs) return { errorResponse: z("LOG_QUERY_KEYWORD_TOO_LONG", "LIKE 搜索关键词过长", 400, { maxPatternBytes: xs }) };
          const C = [
            "proxy_logs.node_name LIKE ? ESCAPE '\\'",
            "proxy_logs.request_path LIKE ? ESCAPE '\\'",
            "proxy_logs.detail_json LIKE ? ESCAPE '\\'"
          ];
          f.push(T, T, T), c.displayClientIp && (C.push("proxy_logs.client_ip LIKE ? ESCAPE '\\'"), f.push(T)), c.displayUa && (C.push("proxy_logs.user_agent LIKE ? ESCAPE '\\'"), f.push(T)), C.push("proxy_logs.error_detail LIKE ? ESCAPE '\\'"), f.push(T), m(`(${C.join(" OR ")})`);
        }
      }
      t.category && m("proxy_logs.category = ?", String(t.category)), l === "playback_info" ? (m("proxy_logs.category = ?", "api"), m(`(${p} LIKE ? ESCAPE '\\' OR ${p} LIKE ? ESCAPE '\\')`, "%/playbackinfo%", "%/sessions/playing%")) : l === "image" ? m("proxy_logs.category = ?", "image") : l === "api" ? (m("proxy_logs.category = ?", "api"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/playbackinfo%"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/sessions/playing%"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/users/authenticate%")) : l === "auth" && (m("proxy_logs.category = ?", "api"), m(`${p} LIKE ? ESCAPE '\\'`, "%/users/authenticate%")), u === "4xx" ? m("proxy_logs.status_code >= ? AND proxy_logs.status_code < ?", 400, 500) : u === "5xx" && m("proxy_logs.status_code >= ? AND proxy_logs.status_code < ?", 500, 600);
      const y = Gs(t.deliveryMode || "");
      if (y) {
        const b = "LOWER(COALESCE(CAST(json_extract(proxy_logs.detail_json, '$.deliveryMode') AS TEXT), ''))", T = y === "direct" ? ["Direct=entry_307", "Redirect=client_redirect"] : [
          "Redirect=proxied_follow",
          "Flow=managed",
          "Flow=passthrough"
        ];
        m(`(
          ${b} = ?
          OR (
            COALESCE(proxy_logs.detail_json, '') = ''
            AND (${T.map(() => "proxy_logs.error_detail LIKE ? ESCAPE '\\'").join(" OR ")})
          )
        )`, y, ...T.map((C) => `%${Ga(C)}%`));
      }
      const _ = xf(t.protocolFailureReason || "");
      if (_ && m(`(
          LOWER(COALESCE(CAST(json_extract(proxy_logs.detail_json, '$.protocolFailureReason') AS TEXT), '')) = ?
          OR (
            COALESCE(proxy_logs.detail_json, '') = ''
            AND proxy_logs.error_detail LIKE ? ESCAPE '\\'
          )
        )`, _, `%${Ga(_)}%`), t.playbackMode) {
        const b = String(t.playbackMode || "").trim();
        Gs(b) || m("proxy_logs.error_detail LIKE ? ESCAPE '\\'", `%${Ga(`Playback=${b}`)}%`);
      }
      const S = g ? `FROM proxy_logs INNER JOIN ${Qn} ON ${Qn}.rowid = proxy_logs.id` : "FROM proxy_logs", E = `SELECT proxy_logs.*,
          ${c.displayClientIp ? "NULLIF(proxy_logs.client_ip, '') AS client_ip" : "NULL AS client_ip"},
          ${c.displayColo ? `COALESCE(proxy_logs.inbound_colo, proxy_logs.inbound_ip, proxy_logs.client_ip, '') AS inbound_colo,
        COALESCE(proxy_logs.outbound_colo, proxy_logs.outbound_ip, '') AS outbound_colo` : `'' AS inbound_colo,
        '' AS outbound_colo`},
          ${c.displayUa ? "proxy_logs.user_agent AS user_agent" : "NULL AS user_agent"},
          proxy_logs.detail_json AS detail_json`;
      return {
        searchMode: n,
        useFtsKeyword: g,
        whereClause: d,
        params: f,
        fromClause: S,
        selectClause: E,
        orderByClause: "ORDER BY proxy_logs.timestamp DESC, proxy_logs.id DESC"
      };
    },
    async executeSqlPlan(t, r = {}, a = {}) {
      const { safePage: n, safePageSize: s, requestedPageCursor: i, useSeekPagination: c, offset: l } = r, { whereClause: u = [], params: d = [], fromClause: f = "", selectClause: m = "", orderByClause: p = "", useFtsKeyword: h = !1, searchMode: g = "" } = a, y = "WHERE " + u.join(" AND ");
      let _ = 0, S = 1, E = n > 1, b = !1, T = null, C = [];
      try {
        if (c) {
          const L = u.slice(), P = d.slice();
          i && (L.push("(proxy_logs.timestamp < ? OR (proxy_logs.timestamp = ? AND proxy_logs.id < ?))"), P.push(i.timestamp, i.timestamp, i.id));
          const A = "WHERE " + L.join(" AND "), w = await t.prepare(`${m} ${f} ${A} ${p} LIMIT ?`).bind(...P, s + 1).all(), R = Array.isArray(w?.results) ? w.results : [];
          b = R.length > s, C = b ? R.slice(0, s) : R, T = b ? $f(C[C.length - 1]) : null, _ = null, S = b ? n + 1 : n;
        } else {
          _ = (await t.prepare(`SELECT COUNT(*) as total ${f} ${y}`).bind(...d).first())?.total || 0;
          const L = await t.prepare(`${m} ${f} ${y} ${p} LIMIT ? OFFSET ?`).bind(...d, s, l).all();
          C = Array.isArray(L?.results) ? L.results : [], S = Math.ceil(_ / s) || 1, E = n > 1, b = n < S;
        }
      } catch (L) {
        const P = String(L?.message || L || "");
        if (h && /no such table:\s*proxy_logs_fts/i.test(P)) return { errorResponse: z("LOG_FTS_NOT_READY", "FTS5 虚拟表尚未初始化，请先点击“初始化日志表”", 400, { searchMode: g }) };
        if (h && /fts5/i.test(P)) return { errorResponse: z("LOG_FTS_QUERY_INVALID", "FTS 查询语法无效，请检查引号、布尔表达式或前缀写法", 400, { detail: P }) };
        throw L;
      }
      return {
        logs: C,
        total: _,
        totalPages: S,
        hasPrevPage: E,
        hasNextPage: b,
        nextCursor: T,
        searchMode: g
      };
    }
  };
  return e;
}
var yh = "sys_status";
function Sh(o = {}) {
  const { logRepository: e } = o, t = {
    error(r, a, n = null) {
      Le(r, a, n, "error");
    },
    scheduleFlush(r, a) {
      const n = e.getDB(r), s = ur.get(n);
      if (!n || !a || s.LogFlushPending) return null;
      s.LogFlushPending = !0;
      const i = t.flush(r).finally(() => {
        s.LogFlushTask === i && (s.LogFlushTask = null), s.LogFlushPending = !1, s.LogLastFlushAt = B();
      });
      return s.LogFlushTask = i, a.waitUntil(i), i;
    },
    record(r, a, n) {
      const s = e.getDB(r);
      if (!s || !a) return;
      const i = ur.get(s);
      if (n.requestMethod === "OPTIONS") return;
      const c = H(n.runtimeConfig) ? n.runtimeConfig : po(r) || {};
      if (i.runtimeConfig = c, c.logEnabled === !1) {
        i.LogQueue.length > 0 && (i.LogQueue.length = 0), i.LogDedupe.clear();
        return;
      }
      const l = Number(n.statusCode) || 0;
      if (!Mc(c, n)) return;
      const u = os(c.logWriteMode), d = c.logWriteClientIp !== !1, f = c.logWriteColo !== !1, m = c.logWriteUa !== !1, p = (R, I) => String(R || "").slice(0, I), h = p(n.inboundColo || n.inboundIp || n.clientIp || "unknown", 32), g = p(n.outboundColo || n.outboundIp || "", 32), y = d ? p(n.clientIp || "unknown", 128) : "", _ = p(n.nodeName || "unknown", 128) || "unknown", S = p(n.requestPath || "/", 2048) || "/", E = B(), b = Math.max(0, Number(i.LogClearEpochMs) || 0), T = E <= b ? b + 1 : E;
      let C = 0;
      if (n.requestMethod === "HEAD" ? C = 3e5 : (n.category === "segment" || n.category === "prewarm") && (C = 3e4), C > 0) {
        const R = [
          _,
          n.requestMethod || "GET",
          l,
          S,
          y,
          g
        ].join("|"), I = i.LogDedupe.get(R);
        if (I && E - I < C) return;
        if (i.LogDedupe.set(R, E), i.LogDedupe.size > $.Defaults.LogDedupeMax) {
          for (const [x, N] of i.LogDedupe)
            if (i.LogDedupe.has(x) && ((E - N > C || i.LogDedupe.size > $.Defaults.LogDedupeTrimTarget) && i.LogDedupe.delete(x), i.LogDedupe.size <= $.Defaults.LogDedupeTrimTarget))
              break;
        }
      }
      if (i.LogQueue.push({
        timestamp: T,
        nodeName: _,
        requestPath: S,
        requestMethod: n.requestMethod || "GET",
        statusCode: l,
        responseTime: Number(n.responseTime) || 0,
        clientIp: y,
        inboundColo: f ? h : null,
        outboundColo: f ? g : null,
        userAgent: m && p(n.userAgent, 512) || null,
        referer: p(n.referer, 1024) || null,
        category: n.category || "api",
        errorDetail: p(n.errorDetail, 2048) || null,
        detailJson: n.detailJson ? Xl(n.detailJson) : null,
        createdAt: new Date(T).toISOString()
      }), i.LogQueue.length > $.Defaults.LogQueueMax) {
        const R = Math.min($.Defaults.LogQueueOverflowDropCount, i.LogQueue.length);
        i.LogQueue.splice(0, R), e.patchOpsStatus(r, { log: {
          lastOverflowAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          lastOverflowDropCount: R,
          queueLengthAfterDrop: i.LogQueue.length
        } }, a), console.error(`Log queue overflow, dropping ${R} logs to preserve isolate headroom.`);
      }
      i.LogLastFlushAt || (i.LogLastFlushAt = E);
      const L = Number(c.logWriteDelayMinutes), P = Number(c.logFlushCountThreshold), A = Math.max(0, Number.isFinite(L) ? L * 6e4 : $.Defaults.LogFlushDelayMinutes * 6e4), w = Math.max(1, Number.isFinite(P) ? Math.floor(P) : $.Defaults.LogFlushCountThreshold);
      (u === "error" || i.LogQueue.length >= w || A === 0 || E - i.LogLastFlushAt >= A) && t.scheduleFlush(r, a);
    },
    async flush(r) {
      const a = e.getDB(r), n = ur.get(a);
      if (!a || n.LogQueue.length === 0) return;
      const s = H(n.runtimeConfig) ? n.runtimeConfig : po(r) || {}, i = Fe(s.scheduleUtcOffsetMinutes);
      if (s.logEnabled === !1) {
        n.LogQueue.length = 0, n.LogDedupe.clear();
        return;
      }
      await e.ensureSysStatusTable(a);
      const c = await e.resolveLogsReadiness({
        db: a,
        kv: e.getKV(r)
      });
      if (c.schemaReady !== !0) {
        const T = n.LogQueue.length;
        n.LogQueue.length = 0, n.LogDedupe.clear(), await e.patchOpsStatus(r, { log: {
          schemaReady: !1,
          ftsReady: c.ftsReady === !0,
          statsReady: c.statsReady === !0,
          lastFlushAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushStatus: "schema_not_ready",
          lastFlushError: "proxy_logs schema not initialized",
          lastFlushErrorAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushRetryCount: 0,
          lastDroppedBatchSize: T,
          lastFlushWrittenBeforeError: 0,
          queueLengthAfterFlush: 0
        } });
        return;
      }
      const l = Number(s.logBatchChunkSize), u = Number(s.logBatchRetryCount), d = Number(s.logBatchRetryBackoffMs), f = fe(l, $.Defaults.LogBatchChunkSize, 1, 100), m = fe(u, $.Defaults.LogBatchRetryCount, 0, 5), p = fe(d, $.Defaults.LogBatchRetryBackoffMs, 0, 5e3), h = e.getOpsStatusDbScope("log");
      let g = 0, y = 0, _ = 0, S = 0;
      const E = /* @__PURE__ */ new Map(), b = (T = []) => {
        const C = e.summarizeStatsHourlyEntries(T, { utcOffsetMinutes: i });
        for (const L of C) {
          const P = `${L.bucketDate}:${L.bucketHour}`, A = E.get(P) || {
            bucketDate: L.bucketDate,
            bucketHour: L.bucketHour,
            requestCount: 0,
            playCount: 0,
            playbackInfoCount: 0
          };
          A.requestCount += Math.max(0, Number(L.requestCount) || 0), A.playCount += Math.max(0, Number(L.playCount) || 0), A.playbackInfoCount += Math.max(0, Number(L.playbackInfoCount) || 0), E.set(P, A);
        }
      };
      try {
        const T = Math.max(n.LogClearEpochMs || 0, await e.getLogClearEpochMs(r));
        for (; n.LogQueue.length > 0; ) {
          const L = n.LogQueue.splice(0, f).filter((R) => (Number(R?.timestamp) || 0) > T);
          if (!L.length) continue;
          _ = L.length, S = 0;
          const P = JSON.stringify(L);
          if (ve(P) > er) throw Sl("proxy_logs.batch", P);
          const A = a.prepare(`INSERT INTO proxy_logs (timestamp, node_name, request_path, request_method, status_code, response_time, client_ip, inbound_colo, outbound_colo, user_agent, referer, category, error_detail, detail_json, created_at)
						SELECT
							CAST(json_extract(entry.value, '$.timestamp') AS INTEGER),
							json_extract(entry.value, '$.nodeName'), json_extract(entry.value, '$.requestPath'), json_extract(entry.value, '$.requestMethod'),
							CAST(json_extract(entry.value, '$.statusCode') AS INTEGER), CAST(json_extract(entry.value, '$.responseTime') AS INTEGER),
							json_extract(entry.value, '$.clientIp'), json_extract(entry.value, '$.inboundColo'), json_extract(entry.value, '$.outboundColo'),
							json_extract(entry.value, '$.userAgent'), json_extract(entry.value, '$.referer'), json_extract(entry.value, '$.category'),
							json_extract(entry.value, '$.errorDetail'), json_extract(entry.value, '$.detailJson'), json_extract(entry.value, '$.createdAt')
						FROM json_each(?) AS entry
						WHERE CAST(json_extract(entry.value, '$.timestamp') AS INTEGER) > COALESCE((
							SELECT CAST(json_extract(payload, '$.clearEpochMs') AS INTEGER)
							FROM ${yh}
							WHERE scope = ?
							LIMIT 1
						), 0)`).bind(P, h);
          let w = 0;
          for (; ; ) try {
            await A.run();
            break;
          } catch (R) {
            if (w >= m) throw R;
            w += 1, y += 1, p > 0 && await $i(p * w);
          }
          c.statsReady === !0 && b(L), g += L.length, S += L.length;
        }
        if (c.statsReady === !0 && E.size > 0) try {
          await e.upsertStatsHourlyBuckets(a, [...E.values()], { useBatch: !0 });
        } catch (L) {
          console.warn("upsertStatsHourlyBuckets failed", L);
        }
        const C = {
          schemaReady: !0,
          ftsReady: c.ftsReady === !0,
          statsReady: c.statsReady === !0,
          statsUtcOffsetMinutes: i,
          lastFlushAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushCount: g,
          lastFlushStatus: "success",
          lastFlushRetryCount: y,
          queueLengthAfterFlush: n.LogQueue.length,
          lastFlushError: null,
          lastFlushErrorAt: null,
          lastDroppedBatchSize: 0,
          lastFlushWrittenBeforeError: 0
        };
        g > 0 ? await e.bumpLogsRevision(r, C) : await e.patchOpsStatus(r, { log: C });
      } catch (T) {
        await e.patchOpsStatus(r, { log: {
          schemaReady: c.schemaReady === !0,
          ftsReady: c.ftsReady === !0,
          statsReady: c.statsReady === !0,
          statsUtcOffsetMinutes: i,
          lastFlushErrorAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushStatus: "failed",
          lastFlushError: T?.message || String(T),
          lastFlushRetryCount: y,
          lastDroppedBatchSize: Math.max(0, _ - S),
          lastFlushWrittenBeforeError: g,
          queueLengthAfterFlush: n.LogQueue.length
        } }), console.log("Log flush failed, dropping batch.", T);
      }
    }
  };
  return t;
}
var Zn = "sys_status", sr = "sys_locks", ma = "scheduled", wi = Object.freeze({
  log: "ops_status:log",
  scheduled: "ops_status:scheduled",
  dnsIpPool: "ops_status:dns_ip_pool"
});
function _h(o = {}) {
  const { bindingPort: e, schemaReadinessPort: t, statusPersistence: r } = o, a = {
    async getOpsStatusPayloadFromDb(n, s) {
      if (!n || !s) return null;
      const i = r.getOpsStatusPayloadCache(n), c = i?.get(String(s));
      if (c && Number(c.expiresAt) > B()) return c.payload;
      if (c && i.delete(String(s)), !await r.ensureSysStatusTable(n)) return null;
      try {
        const l = await n.prepare(`SELECT payload FROM ${Zn} WHERE scope = ? LIMIT 1`).bind(s).first(), u = l?.payload ? typeof l.payload == "string" ? JSON.parse(l.payload) : l.payload : null;
        return r.cacheOpsStatusPayload(n, s, u), u;
      } catch {
        return i?.delete(String(s)), null;
      }
    },
    async getOpsStatusPayloadFromDbStrict(n, s) {
      if (!n || !s) throw new Error("D1 status scope is not configured");
      if (!await r.ensureSysStatusTable(n)) {
        const c = /* @__PURE__ */ new Error("D1 sys_status table is unavailable");
        throw c.code = "D1_COMPATIBILITY_REQUIRED", c.status = 409, c;
      }
      const i = await n.prepare(`SELECT payload FROM ${Zn} WHERE scope = ? LIMIT 1`).bind(s).first();
      return i?.payload ? typeof i.payload == "string" ? JSON.parse(i.payload) : i.payload : null;
    },
    async putOpsStatusPayloadToDb(n, s, i, c) {
      if (!n || !s || !i || typeof i != "object" || !await r.ensureSysStatusTable(n)) return !1;
      const l = JSON.stringify(i);
      return ve(l) > er ? !1 : (await n.prepare(`INSERT INTO ${Zn} (scope, payload, updated_at) VALUES (?, ?, ?)
		ON CONFLICT(scope) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`).bind(s, l, Number(c) || B()).run(), r.cacheOpsStatusPayload(n, s, i), !0);
    },
    getOpsStatusSectionEntries() {
      return Object.entries(wi);
    },
    async getOpsStatusRootFromStores(n) {
      const s = n?.db || null;
      if (!s) return {};
      const i = await a.getOpsStatusPayloadFromDb(s, r.getOpsStatusDbScope()), c = i && typeof i == "object" ? i : {}, l = r.getOpsStatusShadowPatch(s);
      return Je(c, l && typeof l == "object" ? l : {});
    },
    async getOpsStatusRoot(n) {
      return a.getOpsStatusRootFromStores(r.resolveOpsStatusStores(n));
    },
    async getOpsStatusSectionFromStores(n, s) {
      const i = n?.db || null;
      if (!s) return {};
      if (!wi[s]) return {};
      const c = async () => {
        if (!i) return null;
        const f = await a.getOpsStatusPayloadFromDb(i, r.getOpsStatusDbScope(s));
        return f && typeof f == "object" ? f : null;
      }, [l, u] = await Promise.all([a.getOpsStatusRootFromStores(n), c()]), d = l && typeof l[s] == "object" ? l[s] : {};
      return Je(u && typeof u == "object" ? u : {}, d);
    },
    async getOpsStatusSection(n, s) {
      return a.getOpsStatusSectionFromStores(r.resolveOpsStatusStores(n), s);
    },
    async getOpsStatusFromStores(n) {
      const s = n?.db || null;
      if (!s) return {};
      const i = await a.getOpsStatusRootFromStores(n), c = i && typeof i == "object" ? { ...i } : {};
      let l = typeof c.updatedAt == "string" ? c.updatedAt : "";
      const u = await Promise.all(a.getOpsStatusSectionEntries().map(async ([d]) => {
        const f = await a.getOpsStatusPayloadFromDb(s, r.getOpsStatusDbScope(d)), m = i && typeof i[d] == "object" ? i[d] : {};
        return [d, Je(f && typeof f == "object" ? f : {}, m)];
      }));
      for (const [d, f] of u)
        !f || typeof f != "object" || Object.keys(f).length && (c[d] = Je(c[d], f), typeof f.updatedAt == "string" && f.updatedAt > l && (l = f.updatedAt));
      return l && (c.updatedAt = l), c;
    },
    async getOpsStatus(n) {
      return a.getOpsStatusFromStores(r.resolveOpsStatusStores(n));
    },
    getLogClearEpochMsFromStatus(n) {
      const s = Number(n?.clearEpochMs);
      return Number.isFinite(s) && s > 0 ? Math.floor(s) : 0;
    },
    async getLogClearEpochMs(n) {
      const s = await a.getOpsStatusSection(n, "log"), i = a.getLogClearEpochMsFromStatus(s), c = ur.get(r.resolveOpsStatusStores(n).db);
      return i > c.LogClearEpochMs && (c.LogClearEpochMs = i), i;
    },
    async patchOpsStatus(n, s, i = null) {
      const c = r.resolveOpsStatusStores(n);
      if (!c.db) return {};
      const l = s && typeof s == "object" ? s : {}, u = Object.keys(l);
      if (!u.length) return await a.getOpsStatusFromStores(c);
      const d = r.buildOpsStatusRootPatch(l);
      if (!Object.keys(d).length) return await a.getOpsStatusFromStores(c);
      const f = r.getOpsStatusShadowState(c.db);
      f && (f.pendingPatch = Je(f.pendingPatch && typeof f.pendingPatch == "object" ? f.pendingPatch : {}, d));
      const m = async () => await r.flushOpsStatusShadow(c, { patchKeys: u }), p = Promise.resolve(je.OpsStatusWriteChain).catch((h) => {
        Le("ops_status.write_chain.previous_failure", h, { patchKeys: u });
      }).then(m);
      return je.OpsStatusWriteChain = p.catch((h) => {
        Le("ops_status.write_chain.current_failure", h, { patchKeys: u });
      }), i ? i.waitUntil(p) : await p, p;
    },
    resolveScheduledLeaseStores(n) {
      return n && typeof n == "object" && !Array.isArray(n) && ("db" in n || "kv" in n) ? {
        db: n.db || null,
        kv: n.kv || null
      } : n && typeof n.prepare == "function" ? {
        db: n,
        kv: null
      } : n && typeof n.get == "function" ? {
        db: null,
        kv: n
      } : {
        db: e.getDB(n),
        kv: e.getKV(n)
      };
    },
    async ensureScheduledLeaseTable(n) {
      if (!n || typeof n.prepare != "function") return !1;
      if (t.isD1SchemaReadyCached(n, "scheduledLeaseTable")) return !0;
      let s = ee.ScheduledLeaseDbReady.get(n);
      s || (s = (async () => {
        try {
          return await n.prepare(`CREATE TABLE IF NOT EXISTS ${sr} (scope TEXT PRIMARY KEY, token TEXT NOT NULL, owner TEXT NOT NULL, acquired_at INTEGER NOT NULL, renewed_at INTEGER, expires_at INTEGER NOT NULL)`).run(), await n.prepare(`CREATE INDEX IF NOT EXISTS idx_sys_locks_expires_at ON ${sr} (expires_at DESC)`).run(), t.markD1SchemaReady(n, "scheduledLeaseTable"), !0;
        } catch (i) {
          return console.warn("scheduled lease table init failed", i), !1;
        }
      })(), ee.ScheduledLeaseDbReady.set(n, s));
      try {
        return await s;
      } finally {
        ee.ScheduledLeaseDbReady.get(n) === s && ee.ScheduledLeaseDbReady.delete(n);
      }
    },
    normalizeScheduledLeaseLock(n, s = "") {
      if (!n || typeof n != "object") return null;
      const i = String(n.token || "").trim();
      if (!i) return null;
      const c = String(n.owner || "scheduled").trim() || "scheduled", l = Number(n.expiresAt ?? n.expires_at ?? 0), u = Number(n.acquiredAtMs ?? n.acquired_at), d = Number(n.renewedAtMs ?? n.renewed_at);
      return {
        token: i,
        owner: c,
        acquiredAt: typeof n.acquiredAt == "string" ? n.acquiredAt : Number.isFinite(u) && u > 0 ? new Date(u).toISOString() : "",
        renewedAt: typeof n.renewedAt == "string" ? n.renewedAt : Number.isFinite(d) && d > 0 ? new Date(d).toISOString() : "",
        expiresAt: Number.isFinite(l) ? l : 0,
        backend: s || String(n.backend || "").trim() || ""
      };
    },
    async getScheduledLeaseLockFromDb(n, s = ma) {
      if (!n || !await a.ensureScheduledLeaseTable(n)) return null;
      try {
        const i = await n.prepare(`SELECT token, owner, acquired_at, renewed_at, expires_at FROM ${sr} WHERE scope = ? LIMIT 1`).bind(String(s || ma)).first();
        return a.normalizeScheduledLeaseLock(i, "d1");
      } catch {
        return null;
      }
    },
    async tryAcquireScheduledLeaseWithDb(n, s = {}) {
      if (!n) return {
        acquired: !1,
        reason: "db_unavailable",
        backend: "d1"
      };
      if (!await a.ensureScheduledLeaseTable(n)) return {
        acquired: !1,
        reason: "db_init_failed",
        backend: "d1"
      };
      const i = B(), c = Math.max($.Defaults.ScheduledLeaseMinMs, Number(s.leaseMs) || $.Defaults.ScheduledLeaseMs), l = String(s.token || `${i}-${Math.random().toString(36).slice(2, 10)}`), u = String(s.owner || "scheduled"), d = String(s.scope || ma), f = i + c;
      try {
        await n.prepare(`INSERT INTO ${sr} (scope, token, owner, acquired_at, renewed_at, expires_at)
          VALUES (?, ?, ?, ?, NULL, ?)
          ON CONFLICT(scope) DO UPDATE SET
            token = excluded.token,
            owner = excluded.owner,
            acquired_at = excluded.acquired_at,
            renewed_at = NULL,
            expires_at = excluded.expires_at
          WHERE ${sr}.expires_at <= ?`).bind(d, l, u, i, f, i).run();
        const m = await a.getScheduledLeaseLockFromDb(n, d);
        return m && m.token === l ? {
          acquired: !0,
          leaseMs: c,
          backend: "d1",
          lock: m
        } : m && Number(m.expiresAt) > i ? {
          acquired: !1,
          reason: "lease_held",
          backend: "d1",
          lock: m
        } : {
          acquired: !1,
          reason: "lease_contended",
          backend: "d1",
          lock: m
        };
      } catch (m) {
        return console.warn("scheduled lease acquire failed", m), {
          acquired: !1,
          reason: "db_unavailable",
          backend: "d1"
        };
      }
    },
    async tryAcquireScheduledLease(n, s = {}) {
      const i = a.resolveScheduledLeaseStores(n);
      return i.db ? await a.tryAcquireScheduledLeaseWithDb(i.db, s) : {
        acquired: !1,
        reason: "db_not_configured",
        backend: "d1"
      };
    },
    async renewScheduledLeaseWithDb(n, s, i, c = {}) {
      if (!n || !s || !await a.ensureScheduledLeaseTable(n)) return null;
      const l = B(), u = Math.max($.Defaults.ScheduledLeaseMinMs, Number(i) || $.Defaults.ScheduledLeaseMs), d = String(c.scope || ma);
      try {
        await n.prepare(`UPDATE ${sr}
          SET owner = ?, renewed_at = ?, expires_at = ?
          WHERE scope = ? AND token = ?`).bind(String(c.owner || "scheduled"), l, l + u, d, String(s)).run();
        const f = await a.getScheduledLeaseLockFromDb(n, d);
        return f && f.token === String(s) ? f : null;
      } catch {
        return null;
      }
    },
    async renewScheduledLease(n, s, i, c = {}) {
      const l = a.resolveScheduledLeaseStores(n);
      return l.db ? await a.renewScheduledLeaseWithDb(l.db, s, i, c) : null;
    },
    async releaseScheduledLeaseWithDb(n, s, i = {}) {
      if (!n || !s || !await a.ensureScheduledLeaseTable(n)) return !1;
      const c = String(i.scope || ma);
      try {
        return await n.prepare(`DELETE FROM ${sr} WHERE scope = ? AND token = ?`).bind(c, String(s)).run(), !0;
      } catch {
        return !1;
      }
    },
    async releaseScheduledLease(n, s, i = {}) {
      const c = a.resolveScheduledLeaseStores(n);
      return c.db ? await a.releaseScheduledLeaseWithDb(c.db, s, i) : !1;
    }
  };
  return a;
}
function hr(o, e = "") {
  const t = String(o || "request_aborted").trim() || "request_aborted", r = new Error(e ? `${t}_${e}` : t);
  return t === "client_aborted" ? r.code = "CLIENT_ABORTED" : t === "downstream_cancelled" ? r.code = "DOWNSTREAM_CANCELLED" : t === "stream_idle_timeout" ? r.code = "STREAM_IDLE_TIMEOUT" : r.code = "REQUEST_ABORTED", r;
}
function Gl(o) {
  const e = new AbortController();
  let t = "", r = null, a = null, n = null;
  const s = /* @__PURE__ */ new Set(), i = (l) => {
    if (s.size)
      for (const u of [...s]) try {
        u(l);
      } catch {
      }
  }, c = (l = "request_aborted") => {
    const u = String(l || "request_aborted").trim() || "request_aborted";
    if (t || (t = u), a && !a.signal.aborted) try {
      a.abort(t);
    } catch {
    }
    if (!e.signal.aborted) try {
      e.abort(t);
    } catch {
    }
    i(t);
  };
  if (o && typeof o.addEventListener == "function") {
    const l = () => c("client_aborted");
    o.aborted ? l() : (o.addEventListener("abort", l, { once: !0 }), r = () => o.removeEventListener("abort", l));
  }
  return {
    signal: e.signal,
    abort: c,
    isAborted() {
      return e.signal.aborted === !0 || !!t;
    },
    getAbortReason() {
      return t;
    },
    onAbort(l) {
      if (typeof l != "function") return () => {
      };
      if (t || e.signal.aborted) {
        try {
          l(t || "request_aborted");
        } catch {
        }
        return () => {
        };
      }
      return s.add(l), () => s.delete(l);
    },
    setActiveFetchController(l) {
      if (n && (n(), n = null), a = l || null, !l) return () => {
      };
      const u = () => {
        try {
          l.abort(t || "request_aborted");
        } catch {
        }
      };
      return t || e.signal.aborted ? u() : e.signal.addEventListener("abort", u, { once: !0 }), n = () => {
        e.signal.removeEventListener("abort", u), a === l && (a = null);
      }, () => {
        if (!n) return;
        const d = n;
        n = null, d();
      };
    },
    dispose() {
      if (r && (r(), r = null), n) {
        const l = n;
        n = null, l();
      } else a = null;
      s.clear();
    }
  };
}
function bh(o = []) {
  const e = new AbortController(), t = [], r = (a = "linked_abort") => {
    if (!e.signal.aborted)
      try {
        e.abort(a);
      } catch {
      }
  };
  for (const a of Array.isArray(o) ? o : [o]) {
    if (!a || typeof a.addEventListener != "function") continue;
    const n = () => r(a.reason || "linked_abort");
    if (a.aborted) {
      n();
      continue;
    }
    a.addEventListener("abort", n, { once: !0 }), t.push(() => a.removeEventListener("abort", n));
  }
  return {
    signal: e.signal,
    abort(a = "linked_abort") {
      r(a);
    },
    dispose() {
      for (const a of t.splice(0)) try {
        a();
      } catch {
      }
    }
  };
}
async function Eh(o, e, t = null) {
  return await new Promise((r, a) => {
    let n = !1, s = null, i = () => {
    };
    const c = (u) => {
      if (!n) {
        n = !0, s !== null && clearTimeout(s);
        try {
          i();
        } catch {
        }
        r(u);
      }
    }, l = (u) => {
      if (!n) {
        n = !0, s !== null && clearTimeout(s);
        try {
          i();
        } catch {
        }
        a(u);
      }
    };
    t?.onAbort && (i = t.onAbort((u) => l(hr(u)))), Number(e) > 0 && (s = setTimeout(() => c({
      timedOut: !0,
      value: null
    }), Math.max(0, Number(e) || 0))), Promise.resolve(o).then((u) => c({
      timedOut: !1,
      value: u
    }), l);
  });
}
async function Ah(o, e = null) {
  const t = Math.max(0, Number(o) || 0);
  if (!(t <= 0))
    return await new Promise((r, a) => {
      let n = !1, s = () => {
      };
      const i = setTimeout(() => {
        if (!n) {
          n = !0;
          try {
            s();
          } catch {
          }
          r();
        }
      }, t);
      e?.onAbort && (s = e.onAbort((c) => {
        n || (n = !0, clearTimeout(i), a(hr(c)));
      }));
    });
}
function Th(o = {}, e = {}) {
  return {
    async tryServeMetadataCache(t) {
      if (!t.metadataCache || !t.metadataCacheKey) return null;
      try {
        const r = $g(t.metadataCacheKey, t.request);
        if (!r) return null;
        const a = await t.metadataCache.match(r);
        if (!a) return null;
        const n = e.buildProxyResponseHeaders(a, t.request, t.dynamicCors, t.finalOrigin, t.requestTraits, {
          enableH3: t.enableH3,
          forceH1: t.forceH1,
          imageCacheMaxAge: t.imageCacheMaxAge
        }), s = e.classifyProxyLogCategory(t.requestTraits);
        return e.shouldRecordAccessLog(t, {
          statusCode: a.status,
          category: s
        }) && e.recordAccessLog(t, {
          statusCode: a.status,
          category: s,
          errorDetail: e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.extractProxyErrorDetail(a), e.buildStreamDiagnosticDetail(t, a, {
            flow: "cache_hit",
            source: "worker_cache",
            cacheStatus: "WORKER_CACHE"
          }))),
          detailJson: e.buildStructuredLogDetail(t, { statusCode: a.status }, {
            deliveryMode: "proxy",
            redirectMode: "worker_cache",
            decisionReason: "worker_cache_hit",
            protocolFailureReason: Number(a.status) >= 400 ? e.classifyProtocolFailureReason(e.extractProxyErrorDetail(a) || a.statusText || "", { upstreamStatus: a.status }) : null,
            upstreamStatus: a.status
          }),
          outboundColo: ""
        }), new Response(a.body, {
          status: a.status,
          statusText: a.statusText,
          headers: n
        });
      } catch {
        return null;
      }
    },
    async resolveEarlyResponse(t) {
      if (t.requestMethod === "OPTIONS") return e.buildOptionsResponse(t);
      const r = e.evaluateFirewall(t.currentConfig, t.clientIp, t.country, t.finalOrigin);
      if (r) return r;
      const a = e.applyRateLimit(t.currentConfig, t.clientIp, t.requestTraits, t.startTime, t.finalOrigin);
      return a || await e.tryServeMetadataCache(t);
    },
    shouldGuardClientDirectForRequest(t = {}, r = {}) {
      return String(r?.action || "").trim().toUpperCase() !== "DIRECT" || String(r?.reason || "").trim() === "stream_body_direct" ? !1 : t?.isBigStream === !0 || t?.isManifest === !0 || t?.isSegment === !0;
    },
    enforceStrictClientDirectAuthPolicy(t, r, a, n = {}) {
      if (!e.shouldGuardClientDirectForRequest(t?.requestTraits, r)) return r;
      const s = a?.clientRedirectAuthPolicy || oa(a?.newHeaders);
      return a && typeof a == "object" && (a.clientRedirectAuthPolicy = s), t.directRedirectAuthReason = s.reason || "", r;
    },
    createDirectTransportIncompatibleError(t, r = {}) {
      const a = /* @__PURE__ */ new Error("direct_transport_incompatible");
      return a.code = "DIRECT_TRANSPORT_INCOMPATIBLE", a.redirectTrace = r.redirectTrace || t?.redirectTrace || null, a;
    },
    async maybeProbeEntryDirectRangeRedirectResponse(t, r, a, n) {
      if (typeof a != "function") return null;
      const s = e.resolveEntryDirectTargetUrl(t, r);
      let i = null, c = () => {
      };
      const l = Gl(t?.request?.signal);
      try {
        const g = await e.performFetchWithTimeout(s, a, {
          method: "HEAD",
          timeoutMs: t.upstreamTimeoutMs,
          requestLifecycle: l
        });
        i = g.response, c = typeof g.releaseFetchController == "function" ? g.releaseFetchController : () => {
        };
      } catch {
        return c(), l.dispose(), null;
      }
      if (!(i.status >= 300 && i.status < 400)) {
        try {
          i.body?.cancel?.();
        } catch {
        }
        return c(), l.dispose(), null;
      }
      const u = xa(i.headers.get("Location"), s);
      if (!u) {
        try {
          i.body?.cancel?.();
        } catch {
        }
        return c(), l.dispose(), null;
      }
      const d = t.playbackRelayTargetUrl instanceof URL ? t.playbackRelayTargetUrl : r, f = za(u, d).proxyPath || (u.origin === d?.origin ? u.pathname : null);
      if (f && La(f)) {
        const g = e.createRedirectTrace(t.requestUrl);
        e.recordRedirectTraceHop(g, i.status, u, {
          isSameOriginRedirect: !0,
          traceAction: "blocked_web"
        }), e.finalizeRedirectTrace(g, {
          terminalMode: "web_proxy_disabled",
          finalStatus: 404,
          finalHost: u.hostname || ""
        }), t.redirectTrace = g, t.defaultOutboundColo = dn(i) || "";
        try {
          i.body?.cancel?.();
        } catch {
        }
        return c(), l.dispose(), e.shouldRecordAccessLog(t, {
          statusCode: 404,
          category: e.classifyProxyLogCategory(t.requestTraits)
        }) && e.recordAccessLog(t, e.buildDirectAccessLogPayload(t, 404, t.defaultOutboundColo, {
          redirectTrace: g,
          decisionReason: "web_proxy_disabled"
        })), Un(t.requestMethod, t.dynamicCors);
      }
      const m = e.buildClientVisibleRedirectUrl(u, t.playbackRelayTargetUrl || r, t.nodeName, t.nodeKey, t.requestUrl, { entryMode: t.entryMode }) || u, p = e.createRedirectTrace(t.requestUrl);
      e.recordRedirectTraceHop(p, i.status, u, {
        isSameOriginRedirect: u.origin === s.origin,
        traceAction: "direct",
        dataPlaneMode: n?.dataPlaneMode
      }), e.finalizeRedirectTrace(p, {
        terminalMode: "client_redirect",
        finalStatus: i.status,
        finalHost: String(u.hostname || "").trim().toLowerCase()
      }), t.redirectTrace = p, t.defaultOutboundColo = dn(i) || "";
      const h = e.buildProxyResponseHeaders(i, t.request, t.dynamicCors, t.finalOrigin, t.requestTraits, {
        enableH3: t.enableH3,
        forceH1: t.forceH1,
        imageCacheMaxAge: t.imageCacheMaxAge
      });
      return e.applyProxyRedirectHeaders(h, i, r, t.nodeName, t.nodeKey, m, s, {
        linkVariant: t.linkVariant,
        entryMode: t.entryMode
      }), e.shouldRecordAccessLog(t, {
        statusCode: i.status,
        category: e.classifyProxyLogCategory(t.requestTraits)
      }) && e.recordAccessLog(t, e.buildDirectAccessLogPayload(t, i.status, t.defaultOutboundColo || "", {
        directRedirectUrl: m,
        redirectTrace: p,
        decisionReason: String(n?.reason || n?.traceLabel || "").trim()
      })), c(), l.dispose(), new Response(t.requestMethod === "HEAD" ? null : i.body, {
        status: i.status,
        statusText: i.statusText,
        headers: h
      });
    },
    async maybeBuildEntryDirectResponse(t, r, a = null, n = null) {
      if (t?.forceWorkerProxy === !0) return null;
      const s = e.enforceStrictClientDirectAuthPolicy(t, t.entryRoutingDecision, a, {
        redirectStatus: t.entryRoutingDecision?.redirectStatus || 307,
        redirectMethod: t.requestMethod
      });
      if (t.entryRoutingDecision = s, s?.phase !== "entry" || s?.action !== "DIRECT") return null;
      const i = (Ze(r[0]) ? r[0] : null)?.targetUrl || null;
      if (!(i instanceof URL)) return null;
      const c = a?.clientRedirectAuthPolicy || oa(a?.newHeaders || t.request.headers);
      if (a && typeof a == "object" && (a.clientRedirectAuthPolicy = c), t?.requestTraits?.isBigStream === !0 && t?.requestTraits?.rangeHeader && c.hasQueryAuth !== !0 && c.hasHeaderAuth !== !0 && c.hasCookieAuth !== !0) {
        const f = await e.maybeProbeEntryDirectRangeRedirectResponse(t, i, n, s);
        if (f) return f;
      }
      if (c.canDirect !== !0)
        throw t.directRedirectAuthReason = c.reason || "direct_transport_incompatible", e.createDirectTransportIncompatibleError(t);
      const l = En(e.resolveEntryDirectTargetUrl(t, i), c, t.effectiveMediaAuthMode), u = new Response(null, {
        status: 307,
        statusText: "Temporary Redirect"
      }), d = e.buildProxyResponseHeaders(u, t.request, t.dynamicCors, t.finalOrigin, t.requestTraits, {
        enableH3: t.enableH3,
        forceH1: t.forceH1,
        imageCacheMaxAge: t.imageCacheMaxAge
      });
      return e.applyProxyRedirectHeaders(d, u, i, t.nodeName, t.nodeKey, l, l, {
        linkVariant: t.linkVariant,
        entryMode: t.entryMode
      }), e.shouldRecordAccessLog(t, {
        statusCode: 307,
        category: e.classifyProxyLogCategory(t.requestTraits)
      }) && e.recordAccessLog(t, e.buildDirectAccessLogPayload(t, 307, "")), new Response(null, {
        status: 307,
        statusText: "Temporary Redirect",
        headers: d
      });
    },
    createBuildFetchOptions(t, r) {
      const { requestMethod: a, requestTraits: n, protocolFallback: s } = t, { newHeaders: i, adminCustomHeaders: c, preparedBody: l, preparedBodyMode: u } = r, d = r?.transportTemplate || null, f = Array.isArray(d?.baseHeaderEntries) ? d.baseHeaderEntries : [...i.entries()], m = d ? d.adminCustomHasOrigin === !0 : c.has("origin"), p = d ? d.adminCustomHasReferer === !0 : c.has("referer"), h = d ? d.hasOriginHeader === !0 : i.has("Origin"), g = d ? d.hasRefererHeader === !0 : i.has("Referer"), y = String(d?.refererOrigin || "").trim(), _ = String(d?.refererPathAndSearch || "/") || "/";
      return async (S, E = {}) => {
        const b = new Headers(f), T = (S instanceof URL ? S : new URL(String(S))).origin, C = E.method || a, L = E.bodyMode || u, P = E.body !== void 0 ? E.body : l, A = E.isExternalRedirect === !0, w = E.protocolFallbackRetry === !0, R = E.stripAuthOnProtocolFallback === !0;
        if (h && !m && b.set("Origin", T), g && !p)
          if (d) y ? y !== T && b.set("Referer", `${T}${_}`) : b.set("Referer", T + "/");
          else try {
            const x = new URL(b.get("Referer") || "");
            if (x.origin !== T) {
              const N = new URL(`${x.pathname || "/"}${x.search || ""}`, T);
              b.set("Referer", N.toString());
            }
          } catch {
            b.set("Referer", T + "/");
          }
        if (A) {
          const x = [];
          if (c instanceof Set) for (const N of c) {
            if (N === "cookie") continue;
            const F = i.get(N);
            F !== null && x.push([N, F]);
          }
          Po(b), b.delete("Cookie"), d?.adminCookie && b.set("Cookie", d.adminCookie);
          for (const [N, F] of x) b.set(N, F);
          m || b.delete("Origin"), p || b.delete("Referer");
        }
        w && s && (R && Po(b), b.set("Connection", "keep-alive")), (n.isBigStream || n.isSmartStrmMedia || n.isManifest || n.isSegment) && n.rangeHeader && !b.has("Range") && b.set("Range", n.rangeHeader), (n.isBigStream || n.isSmartStrmMedia || n.isManifest || n.isSegment) && n.ifRangeHeader && !b.has("If-Range") && b.set("If-Range", n.ifRangeHeader), (C === "GET" || C === "HEAD") && b.delete("Content-Length");
        const I = {
          method: C,
          headers: b,
          redirect: "manual"
        };
        return n.isMetadataCacheable && (I.cache = "no-store"), C !== "GET" && C !== "HEAD" && (L === "buffered" && P !== null && P !== void 0 ? I.body = P.slice(0) : L === "stream" && (I.body = P)), I;
      };
    }
  };
}
function Rh(o = {}, e = {}) {
  return {
    async executeUpstreamFlow(t, r, a) {
      const n = /* @__PURE__ */ new Set([
        500,
        502,
        503,
        504,
        522,
        523,
        524,
        525,
        526,
        530
      ]), s = t.requestTraits?.isSmartStrmMedia === !0 ? {
        mode: "proxy",
        forceVideoDirect: !1,
        forceVideoProxy: !1
      } : hf(t.node, t.currentConfig), i = e.createRedirectTrace(t.requestUrl), c = mf(t.requestMethod, t.requestTraits, { playbackRelayTargetUrl: t.playbackRelayTargetUrl });
      t.redirectTrace = i;
      const l = t.playbackRelayTargetUrl ? await e.fetchAbsoluteWithRetryLoop({
        execution: t,
        absoluteUrl: t.playbackRelayTargetUrl,
        buildFetchOptions: a,
        fetchOptions: {
          method: t.requestMethod,
          bodyMode: r.preparedBodyMode,
          body: r.preparedBody,
          isExternalRedirect: !0
        },
        retryableStatuses: n,
        protocolFallback: t.protocolFallback,
        preparedBodyMode: r.preparedBodyMode,
        allowAutomaticRetry: r.allowAutomaticRetry,
        stripAuthOnProtocolFallback: t.requestTraits.canStripAuthOnProtocolFallback,
        upstreamTimeoutMs: t.upstreamTimeoutMs,
        maxExtraAttempts: r.allowAutomaticRetry && r.allowSameTargetRetry !== !1 ? t.upstreamRetryAttempts : 0,
        isRetry: !1,
        requestLifecycle: t.requestLifecycle
      }) : await e.fetchUpstreamWithRetryLoop({
        execution: t,
        retryTargetRecords: r.retryTargetRecords,
        proxyPath: t.proxyPath,
        requestUrl: t.requestUrl,
        buildFetchOptions: a,
        retryableStatuses: n,
        protocolFallback: t.protocolFallback,
        preparedBodyMode: r.preparedBodyMode,
        allowAutomaticRetry: r.allowAutomaticRetry,
        stripAuthOnProtocolFallback: t.requestTraits.canStripAuthOnProtocolFallback,
        upstreamTimeoutMs: t.upstreamTimeoutMs,
        maxExtraAttempts: r.allowAutomaticRetry && r.allowSameTargetRetry !== !1 ? t.upstreamRetryAttempts : 0,
        isRetry: !1,
        requestLifecycle: t.requestLifecycle,
        segmentFastPathEnabled: c
      });
      let u = l.response, d = l.targetRecord || null, f = d?.targetUrl || (t.playbackRelayTargetUrl instanceof URL ? new URL(t.playbackRelayTargetUrl.toString()) : null), m = l.finalUrl, p = l.releaseFetchController, h = l.protocolFallbackRetry === !0, g = l.protocolFallbackRetryFailed === !0, y = !1, _ = null;
      const S = 8;
      let E = 0, b = t.requestMethod, T = r.preparedBodyMode, C = r.preparedBody;
      for (t.defaultOutboundColo = dn(u) || ""; u.status >= 300 && u.status < 400 && E < S; ) {
        const L = Number(u.status) || 0, P = xa(u.headers.get("Location"), m || f);
        if (!P) {
          e.finalizeRedirectTrace(i, {
            terminalMode: "invalid_redirect_target",
            finalStatus: L,
            finalHost: m?.hostname || f?.hostname || ""
          });
          break;
        }
        const A = za(P, f).proxyPath || (P.origin === f?.origin ? P.pathname : null);
        if (A && La(A)) {
          e.recordRedirectTraceHop(i, L, P, {
            isSameOriginRedirect: !0,
            traceAction: "blocked_web"
          }), e.finalizeRedirectTrace(i, {
            terminalMode: "web_proxy_disabled",
            finalStatus: 404,
            finalHost: P.hostname || ""
          });
          try {
            u.body?.cancel?.();
          } catch {
          }
          try {
            p?.();
          } catch {
          }
          u = Un(t.requestMethod, t.dynamicCors), m = P, p = null, E += 1;
          break;
        }
        const w = e.enforceStrictClientDirectAuthPolicy(t, e.getRoutingDecision({
          phase: "redirect",
          nextUrl: P,
          activeTargetBase: f,
          redirectMethod: b,
          redirectBodyMode: T,
          forceWorkerProxy: t.forceWorkerProxy === !0,
          forceWorkerProxyReason: t.forceWorkerProxyReason,
          currentStatus: u.status,
          policy: {
            forceVideoDirect: s.forceVideoDirect === !0,
            forceVideoProxy: s.forceVideoProxy === !0,
            currentStatus: u.status
          },
          routingDecisionMode: t.routingDecisionMode
        }), r, {
          redirectStatus: u.status,
          redirectMethod: b,
          redirectBodyMode: T
        });
        if (e.recordRedirectTraceHop(i, L, P, w), w.action === "DIRECT") {
          const F = r.clientRedirectAuthPolicy || oa(r.newHeaders);
          if (F.canDirect !== !0)
            throw t.directRedirectAuthReason = F.reason || "direct_transport_incompatible", e.finalizeRedirectTrace(i, {
              terminalMode: "direct_incompatible",
              finalStatus: 409,
              finalHost: P.hostname || ""
            }), e.createDirectTransportIncompatibleError(t, { redirectTrace: i });
          const D = e.buildClientVisibleRedirectUrl(P, f, t.nodeName, t.nodeKey, t.requestUrl, {
            preserveWorkerProxy: w.preserveWorkerProxy === !0,
            linkVariant: t.linkVariant,
            entryMode: t.entryMode
          }) || P;
          _ = w.preserveWorkerProxy === !0 ? D : En(D, r.clientRedirectAuthPolicy || r.newHeaders, t.effectiveMediaAuthMode), e.finalizeRedirectTrace(i, {
            terminalMode: "client_redirect",
            finalStatus: L,
            finalHost: _.hostname || P.hostname || ""
          });
          break;
        }
        const R = w.nextMethod, I = w.nextBodyMode, x = I === "none" ? null : C;
        try {
          u.body?.cancel?.();
        } catch {
        }
        try {
          p?.();
        } catch {
        }
        let N;
        try {
          N = await e.fetchAbsoluteWithRetryLoop({
            absoluteUrl: P,
            buildFetchOptions: a,
            fetchOptions: {
              method: R,
              bodyMode: I,
              body: x,
              isExternalRedirect: !w.isSameOriginRedirect
            },
            retryableStatuses: n,
            protocolFallback: t.protocolFallback,
            preparedBodyMode: I,
            allowAutomaticRetry: r.allowAutomaticRetry,
            stripAuthOnProtocolFallback: t.requestTraits.canStripAuthOnProtocolFallback,
            upstreamTimeoutMs: t.upstreamTimeoutMs,
            maxExtraAttempts: r.allowAutomaticRetry && r.allowSameTargetRetry !== !1 ? t.upstreamRetryAttempts : 0,
            isRetry: !1,
            requestLifecycle: t.requestLifecycle
          });
        } catch (F) {
          if (t.requestTraits?.isImage && !w.isSameOriginRedirect) {
            _ = e.buildClientVisibleRedirectUrl(P, f, t.nodeName, t.nodeKey, t.requestUrl, {
              preserveWorkerProxy: !1,
              linkVariant: t.linkVariant,
              entryMode: t.entryMode
            }) || P, e.finalizeRedirectTrace(i, {
              terminalMode: "client_redirect",
              finalStatus: L || 301,
              finalHost: _.hostname || P.hostname || ""
            }), u = new Response(null, {
              status: L || 301,
              statusText: "Moved Permanently"
            }), m = P, p = null;
            break;
          }
          throw e.finalizeRedirectTrace(i, {
            terminalMode: "proxy_error_after_redirect",
            finalStatus: L,
            finalHost: P.hostname || ""
          }), F && typeof F == "object" && (F.redirectTrace = i), F;
        }
        if (u = N.response, m = N.finalUrl, p = N.releaseFetchController, h = h || N.protocolFallbackRetry === !0, g = g || N.protocolFallbackRetryFailed === !0, b = R, T = I, C = x, t.defaultOutboundColo = dn(u) || "", w.isSameOriginRedirect || (y = !0), E += 1, t.requestTraits?.isImage && !w.isSameOriginRedirect && u.status >= 400) {
          try {
            u.body?.cancel?.();
          } catch {
          }
          try {
            N.releaseFetchController?.();
          } catch {
          }
          _ = e.buildClientVisibleRedirectUrl(P, f, t.nodeName, t.nodeKey, t.requestUrl, {
            preserveWorkerProxy: !1,
            linkVariant: t.linkVariant,
            entryMode: t.entryMode
          }) || P, e.finalizeRedirectTrace(i, {
            terminalMode: "client_redirect",
            finalStatus: L || 301,
            finalHost: _.hostname || P.hostname || ""
          }), u = new Response(null, {
            status: L || 301,
            statusText: "Moved Permanently"
          }), m = P, p = null;
          break;
        }
      }
      if (!i.terminalMode && (i.hops.length > 0 || i.finalStatus > 0)) {
        const L = Number(u?.status) || 0;
        if (L >= 300 && L < 400) {
          const P = xa(u.headers.get("Location"), m || f);
          e.finalizeRedirectTrace(i, {
            terminalMode: E >= S ? "redirect_limit" : "upstream_redirect_passthrough",
            finalStatus: L,
            finalHost: P?.hostname || m?.hostname || f?.hostname || ""
          });
        } else e.finalizeRedirectTrace(i, {
          terminalMode: i.hops.length > 0 ? "proxied_follow" : "no_redirect",
          finalStatus: L,
          finalHost: m?.hostname || f?.hostname || ""
        });
      }
      return {
        response: u,
        finalUrl: m,
        activeTargetRecord: d,
        activeTargetBase: f,
        releaseFetchController: p,
        proxiedExternalRedirect: y,
        directRedirectUrl: _,
        protocolFallbackRetry: h,
        protocolFallbackRetryFailed: g,
        redirectTrace: i
      };
    },
    async buildSuccessResponse(t, r, a, n = null) {
      let s = await e.guardApiResponseMime(t, a);
      if (s = await e.maybeFallbackTmdbSearchResponse(t, s, r), t?.requestTraits?.isPlaybackInfoRequest === !0 && (s = await e.guardPlaybackInfoResponseContract(t, s), xt(s.playbackInfoRepresentation) && (s = await e.maybeRewritePlaybackInfoResponse(t, s)), xt(s.playbackInfoRepresentation))) {
        const A = await e.buildPeerPlaybackVersionResponse(t, t.env, s);
        if (A) {
          const w = JSON.stringify(A.payload), R = s.response;
          try {
            Promise.resolve(R.body?.cancel?.()).catch(() => {
            });
          } catch {
          }
          const I = new Response(w, {
            status: R.status,
            statusText: R.statusText,
            headers: Cn(R.headers)
          });
          s = {
            ...s,
            response: I,
            playbackInfoRepresentation: Rn({
              response: I,
              bodyText: w,
              bodyBytes: new TextEncoder().encode(w).byteLength,
              payload: A.payload
            })
          };
        }
      }
      const i = String(s.redirectTrace?.terminalMode || t?.redirectTrace?.terminalMode || ""), c = t?.playbackAbsoluteFallbackEligible === !0 && !s.directRedirectUrl && i !== "web_proxy_disabled" && Number(s.response.status) === 404;
      c && (t.playbackFallback = "relative_307");
      const l = e.shouldLogDirectAccess(t, { directRedirectUrl: s.directRedirectUrl }), u = l ? "" : e.buildRedirectDiagnosticDetail(s.redirectTrace || t.redirectTrace), d = s.response.status, f = c ? 307 : s.directRedirectUrl && Number(s.redirectTrace?.finalStatus) || d, m = c ? "Temporary Redirect" : s.response.statusText;
      e.markFailoverBusinessSuccess(t, s.activeTargetRecord, { status: d });
      const p = e.buildProxyResponseHeaders(s.response, t.request, t.dynamicCors, t.finalOrigin, t.requestTraits, {
        enableH3: t.enableH3,
        forceH1: t.forceH1,
        proxiedExternalRedirect: s.proxiedExternalRedirect,
        imageCacheMaxAge: t.imageCacheMaxAge
      }), h = Qm(t, n);
      if (e.applyProxyRedirectHeaders(p, s.response, s.activeTargetBase, t.nodeName, t.nodeKey, s.directRedirectUrl, s.finalUrl, {
        linkVariant: t.linkVariant,
        entryMode: t.entryMode,
        externalRedirectAuth: h,
        workerOrigin: t.requestUrl instanceof URL ? t.requestUrl.origin : ""
      }), h && h.canDirect !== !0 && !s.directRedirectUrl && pl(Number(s.response.status)) && Jm(p.get("Location"), t.requestUrl instanceof URL ? t.requestUrl.origin : "")) throw e.createDirectTransportIncompatibleError(t, { redirectTrace: s.redirectTrace || t.redirectTrace });
      c && (wl(p), p.set("Location", t.playbackAbsoluteFallbackLocation || "/"), p.set("Cache-Control", "no-store"));
      const g = !c && e.shouldManageProxyResponseBody(t, s), y = t.defaultOutboundColo || "", _ = c ? f : d, S = e.classifyProxyLogCategory(t.requestTraits), E = e.shouldRecordAccessLog(t, {
        statusCode: _,
        category: S
      }, { statusFinal: !g }), b = E ? e.buildRuntimeDiagnosticDetail(t) : "";
      let T = "";
      E && (T = l ? e.buildDirectAccessDiagnosticDetail(t, {
        directRedirectUrl: s.directRedirectUrl,
        redirectTrace: s.redirectTrace || t.redirectTrace
      }) : e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.extractProxyErrorDetail(s.response), e.buildStreamDiagnosticDetail(t, s.response, {
        flow: g ? "managed" : "passthrough",
        source: "upstream",
        upstreamHost: s.finalUrl?.hostname || s.activeTargetBase?.hostname || "",
        protocolFallbackRetry: s.protocolFallbackRetry === !0,
        idleTimeoutMs: g ? e.resolveResponseStreamIdleTimeoutMs(t.requestTraits, t.upstreamTimeoutMs) : 0
      })), e.appendLogDiagnosticDetail(b, u)));
      let C = null;
      if (E && (C = l ? e.buildDirectAccessLogPayload(t, f, y, {
        directRedirectUrl: s.directRedirectUrl,
        redirectTrace: s.redirectTrace || t.redirectTrace
      }) : {
        statusCode: _,
        category: S,
        errorDetail: T,
        detailJson: e.buildStructuredLogDetail(t, { statusCode: c ? f : d }, {
          transport: null,
          deliveryMode: "proxy",
          redirectTrace: s.redirectTrace || t.redirectTrace,
          redirectMode: c ? "playback_relative_fallback" : s.redirectTrace?.terminalMode || "proxied_follow",
          redirectUrl: s.finalUrl,
          decisionReason: c ? "playback_relative_fallback" : s.redirectTrace?.terminalMode || "proxied_follow",
          protocolFailureReason: s.protocolFallbackRetry === !0 || s.protocolFallbackRetryFailed === !0 ? e.classifyProtocolFailureReason("protocol_fallback", {
            upstreamStatus: d,
            protocolFallbackRetry: !0
          }) : Number(d) >= 400 ? e.classifyProtocolFailureReason(T || s.response.statusText || "", {
            upstreamStatus: d,
            protocolFallbackRetry: s.protocolFallbackRetry === !0
          }) : null,
          protocolFallbackRetry: s.protocolFallbackRetry === !0,
          playbackInfoCache: t.playbackInfoCacheState,
          playbackInfoCacheTtlSec: t.playbackInfoCacheTtlSec,
          progressRelayMode: t.progressForwardMode,
          progressIntervalSec: t.videoProgressForwardIntervalSec,
          upstreamHost: s.finalUrl?.hostname || s.activeTargetBase?.hostname || "",
          upstreamStatus: d
        }),
        outboundColo: y
      }), !g && C && e.recordAccessLog(t, C), t.metadataCacheKey && t.ctx && s.response.status === 200) {
        const A = s.response.clone();
        t.ctx.waitUntil(e.storeMetadataCache(t.metadataCacheKey, A, t.requestTraits, {
          sourceUrl: t.requestUrl,
          prewarmCacheTtl: t.requestTraits.prewarmCacheTtl,
          imageCacheMaxAge: t.imageCacheMaxAge,
          proxiedExternalRedirect: s.proxiedExternalRedirect === !0
        }));
      }
      t.requestTraits.isPlaybackInfoRequest === !0 && await e.storePlaybackInfoResponseCache(t, s.response, null, s.playbackInfoRepresentation), e.scheduleMetadataPrewarmResponse(t.request, s.response, t.requestTraits, s.activeTargetBase, r, t.nodeName, t.nodeKey, t.requestUrl, t.ctx, {
        proxyPath: t.proxyPath,
        prewarmCacheTtl: t.requestTraits.prewarmCacheTtl,
        imageCacheMaxAge: t.imageCacheMaxAge,
        nodeCacheRevision: t.nodeDerivedCacheRevision,
        entryMode: t.entryMode,
        identityPartition: t.metadataCacheIdentityPartition
      }), e.maybeScheduleBackgroundFailoverRefresh(t, s);
      const L = s.response;
      if (c) {
        try {
          s.response.body?.cancel?.();
        } catch {
        }
        try {
          s.releaseFetchController?.();
        } catch {
        }
        return t.requestLifecycle?.dispose?.(), new Response(null, {
          status: f,
          statusText: m,
          headers: p
        });
      }
      if (s.response.status === 101 && L.webSocket) {
        try {
          s.releaseFetchController?.();
        } catch {
        }
        t.requestLifecycle?.dispose?.();
        const A = {
          status: 101,
          statusText: s.response.statusText,
          headers: p,
          webSocket: L.webSocket
        };
        return new Response(null, A);
      }
      if (t?.node?.tmdbAggregationEnabled === !0) {
        an(t) && p.set("Cache-Control", "no-store");
        const A = await e.buildPeerAggregationMergedResponse(t, t.env, s);
        if (A) {
          p.set("Content-Type", "application/json; charset=utf-8"), p.delete("Content-Length"), p.delete("Content-Encoding"), p.delete("Transfer-Encoding"), p.delete("ETag"), p.delete("Last-Modified"), p.set("Cache-Control", "no-store"), g && C && e.recordAccessLog(t, C);
          try {
            Promise.resolve(s.response.body?.cancel()).catch(() => {
            });
          } catch {
          }
          return s.releaseFetchController?.(), t.requestLifecycle?.dispose?.(), new Response(t.requestMethod === "HEAD" ? null : JSON.stringify(A.payload), {
            status: 200,
            statusText: "OK",
            headers: p
          });
        }
      }
      let P;
      return g ? P = e.buildManagedProxyResponseBody(t, s, C) : P = e.buildPassthroughProxyResponseBody(t, s), new Response(P, {
        status: f,
        statusText: m,
        headers: p
      });
    }
  };
}
function Ch(o = {}, e = {}) {
  return {
    buildErrorResponse(t, r) {
      const a = r?.message || String(r || "网关或 CF Workers 内部崩溃"), n = String(r?.code || "").toUpperCase();
      let s = 502, i = "Bad Gateway", c = {
        error: "Bad Gateway",
        code: 502,
        message: "All proxy attempts failed."
      };
      n === "UPSTREAM_TIMEOUT" || n === "STREAM_IDLE_TIMEOUT" ? (s = 504, i = "Gateway Timeout", c = {
        error: "Gateway Timeout",
        code: 504,
        message: "Upstream response timed out."
      }) : n === "DIRECT_TRANSPORT_INCOMPATIBLE" ? (s = 409, i = "Conflict", c = {
        error: "Conflict",
        code: 409,
        message: "DIRECT mode is strict and will not fall back to proxy when custom auth headers or cookies are required."
      }) : (n === "CLIENT_ABORTED" || n === "DOWNSTREAM_CANCELLED" || n === "REQUEST_ABORTED") && (s = 499, i = "Client Closed Request", c = {
        error: "Client Closed Request",
        code: 499,
        message: "Client closed request."
      });
      try {
        t.requestLifecycle?.abort?.(n ? n.toLowerCase() : "proxy_error");
      } catch {
      }
      t.requestLifecycle?.dispose?.();
      const l = s === 499 ? e.classifyProxyLogCategory(t.requestTraits || {}) : "error";
      if (e.shouldRecordAccessLog(t, {
        statusCode: s,
        category: l
      })) {
        const d = e.buildRedirectDiagnosticDetail(r?.redirectTrace || t.redirectTrace), f = e.buildRuntimeDiagnosticDetail(t);
        n === "DIRECT_TRANSPORT_INCOMPATIBLE" ? e.recordAccessLog(t, e.buildDirectAccessLogPayload(t, s, t.defaultOutboundColo || "", { redirectTrace: r?.redirectTrace || t.redirectTrace })) : e.recordAccessLog(t, {
          statusCode: s,
          category: l,
          errorDetail: e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(a, e.buildStreamDiagnosticDetail(t, null, {
            flow: "proxy_error",
            source: "upstream_pending",
            upstreamHost: r?.lastFinalUrl?.hostname || r?.lastTargetBase?.hostname || "",
            idleTimeoutMs: e.resolveResponseStreamIdleTimeoutMs(t.requestTraits || {}, t.upstreamTimeoutMs)
          })), e.appendLogDiagnosticDetail(f, d)),
          detailJson: e.buildStructuredLogDetail(t, { statusCode: s }, {
            deliveryMode: "proxy",
            redirectTrace: r?.redirectTrace || t.redirectTrace,
            redirectMode: "proxy_error",
            redirectUrl: r?.lastFinalUrl,
            decisionReason: n || "proxy_error",
            protocolFailureReason: e.classifyProtocolFailureReason(r, {
              errorCode: n,
              message: a,
              protocolFallbackRetry: !1,
              upstreamStatus: s
            }),
            playbackInfoCache: t.playbackInfoCacheState,
            playbackInfoCacheTtlSec: t.playbackInfoCacheTtlSec,
            progressRelayMode: t.progressForwardMode,
            progressIntervalSec: t.videoProgressForwardIntervalSec,
            upstreamHost: r?.lastFinalUrl?.hostname || r?.lastTargetBase?.hostname || "",
            upstreamStatus: s
          }),
          outboundColo: t.defaultOutboundColo || ""
        });
      }
      const u = new Headers({
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": t.finalOrigin || "*",
        "Cache-Control": "no-store"
      });
      return t.finalOrigin !== "*" && Vr(u, "Origin"), Ne(u), new Response(JSON.stringify(c), {
        status: s,
        statusText: i,
        headers: u
      });
    },
    async handle(t, r, a, n, s, i, c, l = {}) {
      if (La(a)) {
        const y = H(l.runtimeConfig) ? l.runtimeConfig : {}, _ = sa(i, t, e.resolveCorsOrigin(y, t));
        return Un(t.method, _);
      }
      const u = await $y(t, i, r, n, a);
      if (u) return u;
      let d = await e.prepareExecutionContext(t, r, a, n, s, i, c, l);
      if (d.invalidResponse) return d.invalidResponse;
      const f = await e.resolveEarlyResponse(d);
      if (f) return f;
      let { targetRecords: m, invalidResponse: p } = e.parseTargetRecords(d.node, d.finalOrigin, { cachedTargetRecords: d.playbackRouteHotTargetRecords });
      if (p) return p;
      let h = e.prepareFailoverOverlay(d, m);
      d.defaultOutboundColo = "";
      let g = null;
      try {
        g = await e.buildProxyRequestState(d.request, d.node, d.proxyPath, d.requestUrl, d.clientIp, d.requestTraits, d.forceH1, h, {
          effectiveRealClientIpMode: d.effectiveRealClientIpMode,
          effectiveMediaAuthMode: d.effectiveMediaAuthMode
        });
        const y = await e.tryServePlaybackInfoResponseCache(d, g);
        if (y) return y;
        const _ = e.createBuildFetchOptions(d, g), S = await e.maybeBuildEntryDirectResponse(d, m, g, _);
        if (S) return S;
        const E = await e.maybeHandlePlaybackProgressRelay(d, g, _, g.retryTargetRecords);
        if (E) return E;
        d.requestLifecycle = Gl(d.request?.signal);
        const b = await e.executeUpstreamFlow(d, g, _);
        return await e.buildSuccessResponse(d, _, b, g);
      } catch (y) {
        return e.buildErrorResponse(d, y);
      }
    }
  };
}
function wh(o = {}, e = {}) {
  return {
    ...Th(o, e),
    ...Rh(o, e),
    ...Ch(o, e)
  };
}
function Lh(o = {}, e = {}) {
  return {
    resolveEntryDirectTargetUrl(t, r) {
      if (t?.playbackRelayTargetUrl instanceof URL) return new URL(t.playbackRelayTargetUrl.toString());
      const a = Ye(r, t?.proxyPath || "/");
      return a.search = String(t?.requestUrl?.search || ""), a;
    },
    classifyProxyLogCategory(t) {
      return t.isSegment ? "segment" : t.isManifest ? "manifest" : t.isBigStream || t.isSmartStrmMedia ? "stream" : t.isImage ? "image" : t.isSubtitle ? "subtitle" : t.isStaticFile ? "asset" : t.isWsUpgrade ? "websocket" : "api";
    },
    extractProxyErrorDetail(t) {
      if (t.status < 400) return null;
      const r = [], a = t.headers.get("Server");
      a && r.push(`Server: ${a}`);
      const n = t.headers.get("CF-Ray");
      n && r.push(`CF-Ray: ${n}`);
      const s = t.headers.get("X-Application-Error-Code") || t.headers.get("X-Emby-Error") || t.headers.get("X-MediaBrowser-Error");
      s && r.push(`Media-Server-Error: ${s}`);
      const i = t.headers.get("CF-Cache-Status");
      return i && r.push(`CF-Cache: ${i}`), r.length > 0 ? r.join(" | ") : t.statusText;
    },
    appendLogDiagnosticDetail(t, r) {
      const a = [], n = (i) => {
        const c = String(i || "").trim();
        c && (a.includes(c) || a.push(c));
      };
      if (n(t), n(r), !a.length) return null;
      const s = a.join(" | ");
      return s.length > 1200 ? s.slice(0, 1197) + "..." : s;
    },
    shouldLogDirectAccess(t, r = {}) {
      return !!(e.isEntryDirectDataPlaneMode(t?.entryRoutingDecision?.dataPlaneMode) || r.directRedirectUrl);
    },
    buildDirectAccessDiagnosticDetail(t, r = {}) {
      let a = "直连";
      a = e.appendLogDiagnosticDetail(a, `RoutingMode=${$r(t?.routingDecisionMode)}`), a = e.appendLogDiagnosticDetail(a, e.buildTargetHotCacheDiagnosticDetail(t));
      const n = t?.entryRoutingDecision;
      return e.isEntryDirectDataPlaneMode(n?.dataPlaneMode) && (a = e.appendLogDiagnosticDetail(a, `Direct=entry_307 | Reason=${String(n?.reason || n?.traceLabel || "entry_direct").trim() || "entry_direct"}`)), a = e.appendLogDiagnosticDetail(a, e.buildPlaybackUrlDiagnosticDetail(t)), a = e.appendLogDiagnosticDetail(a, t?.directRedirectAuthReason ? `DirectAuth=${t.directRedirectAuthReason}` : ""), a = e.appendLogDiagnosticDetail(a, e.buildRouteContextDiagnosticDetail(t)), a = e.appendLogDiagnosticDetail(a, e.buildStreamDiagnosticDetail(t, null, {
        force: !0,
        flow: r.directRedirectUrl ? "client_redirect" : "entry_direct",
        source: "client_visible_redirect"
      })), (r.directRedirectUrl || r.redirectTrace) && (a = e.appendLogDiagnosticDetail(a, e.buildRedirectDiagnosticDetail(r.redirectTrace || t?.redirectTrace))), a;
    },
    buildDirectAccessLogPayload(t, r, a = "", n = {}) {
      return {
        statusCode: r,
        category: e.classifyProxyLogCategory(t.requestTraits),
        errorDetail: e.buildDirectAccessDiagnosticDetail(t, n),
        detailJson: e.buildStructuredLogDetail(t, { statusCode: r }, {
          ...n,
          deliveryMode: "direct",
          redirectMode: n.directRedirectUrl ? "client_redirect" : "entry_307",
          decisionReason: String(n.decisionReason || t?.directRedirectAuthReason || t?.entryRoutingDecision?.reason || t?.entryRoutingDecision?.traceLabel || "").trim()
        }),
        outboundColo: a
      };
    },
    buildStreamDiagnosticDetail(t, r, a = {}) {
      const n = t?.requestTraits || {};
      if (!(a.force === !0 || n.isBigStream === !0 || n.isSmartStrmMedia === !0 || n.isSegment === !0 || n.isManifest === !0)) return "";
      const s = r?.headers, i = [], c = (l, u) => {
        const d = String(u || "").trim();
        d && i.push(`${l}=${d.length > 160 ? d.slice(0, 157) + "..." : d}`);
      };
      return c("Flow", a.flow || "passthrough"), c("Kind", e.classifyProxyLogCategory(n)), c("Source", a.source || "upstream"), c("Range", n.rangeHeader || t?.request?.headers?.get("Range")), c("Content-Range", s?.get("Content-Range")), c("Length", s?.get("Content-Length")), c("Accept-Ranges", s?.get("Accept-Ranges")), c("Cache", a.cacheStatus || s?.get("CF-Cache-Status")), c("Upstream", a.upstreamHost || a.upstreamUrlHost), c("RoutingMode", $r(t?.routingDecisionMode)), c("DirectAuth", t?.directRedirectAuthReason), a.protocolFallbackRetry === !0 && c("Retry", "protocol_fallback"), Number(a.idleTimeoutMs) > 0 && c("Idle", `${Number(a.idleTimeoutMs)}ms`), i.join(" | ");
    },
    buildPlaybackInfoCacheDiagnosticDetail(t) {
      if (t?.requestTraits?.isPlaybackInfoRequest !== !0) return "";
      const r = Qt(t?.effectivePlaybackInfoMode), a = String(t?.playbackInfoCacheState || "").trim(), n = String(t?.playbackInfoRewrite || "").trim(), s = [`PlaybackInfoMode=${r}`];
      return n && s.push(`PlaybackInfoRewrite=${n}`), a && s.push(`PlaybackInfoCache=${a}`), Number(t?.playbackInfoCacheTtlSec) > 0 && s.push(`PlaybackInfoCacheTtl=${Number(t.playbackInfoCacheTtlSec)}s`), s.join(" | ");
    },
    buildPlaybackUrlDiagnosticDetail(t) {
      const r = String(t?.playbackUrlMode || "").trim(), a = String(t?.playbackFallback || "").trim(), n = String(t?.playbackPathFix || "").trim(), s = String(t?.rewritePlaybackEntry || "").trim(), i = [];
      return r && i.push(`PlaybackUrlMode=${r}`), a && i.push(`PlaybackFallback=${a}`), n && i.push(`PlaybackPathFix=${n}`), s && i.push(`RewritePlaybackEntry=${s}`), i.join(" | ");
    },
    buildTargetHotCacheDiagnosticDetail(t) {
      const r = String(t?.nodeCacheState || t?.targetHotCacheState || "").trim();
      return r ? t?.nodeCacheState ? `NodeCacheState=${r}` : `TargetHotCache=${r}` : "";
    },
    buildRouteContextDiagnosticDetail(t) {
      const r = t?.routeContextDiagnostics && typeof t.routeContextDiagnostics == "object" ? t.routeContextDiagnostics : null;
      if (!r) return "";
      const a = [], n = (s, i) => {
        const c = String(i || "").trim();
        c && a.push(`${s}=${c}`);
      };
      return n("RouteKind", r.routeKind), n("RequestHost", r.requestHost), n("ConfiguredHost", r.configuredHost), n("ConfiguredLegacyHost", r.configuredLegacyHost), a.push(`LegacyHostRequest=${r.isLegacyHostRequest === !0 ? "true" : "false"}`), a.join(" | ");
    },
    buildRuntimeDiagnosticDetail(t) {
      return e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.buildTargetHotCacheDiagnosticDetail(t), e.buildPlaybackInfoCacheDiagnosticDetail(t)), e.buildFailoverDiagnosticDetail(t)), e.buildPlaybackUrlDiagnosticDetail(t)), e.appendLogDiagnosticDetail(e.buildProgressRelayDiagnosticDetail(t), e.buildRouteContextDiagnosticDetail(t)));
    },
    buildProgressRelayDiagnosticDetail(t) {
      if (t?.requestTraits?.isPlaybackSessionControlRequest !== !0) return "";
      const r = String(t?.progressForwardMode || "").trim();
      if (!r) return "";
      const a = [`ProgressRelay=${r}`];
      Number(t?.videoProgressForwardIntervalSec) > 0 && a.push(`ProgressInterval=${Number(t.videoProgressForwardIntervalSec)}s`);
      const n = String(t?.progressForwardSessionKey || "").trim();
      return n && a.push(`ProgressSession=${ie(n)}`), a.join(" | ");
    },
    collectLogAuthKinds(t, r = null) {
      const a = /* @__PURE__ */ new Set(), n = t?.requestUrl instanceof URL ? t.requestUrl : null;
      if (n) for (const c of n.searchParams.keys()) {
        const l = Wa(c);
        if (rh.has(l) || Wl.has(l)) {
          a.add("query");
          break;
        }
      }
      const s = r?.newHeaders || t?.request?.headers || new Headers(), i = r?.clientRedirectAuthPolicy || oa(s);
      return i.hasQueryAuth && a.add("query"), i.hasHeaderAuth && a.add("header"), i.hasCookieAuth && a.add("cookie"), [...a];
    },
    pickPrimaryAuthCarrier(t = []) {
      return (t || []).includes("query") ? "query" : (t || []).includes("header") ? "header" : (t || []).includes("cookie") ? "cookie" : "none";
    },
    resolveRedirectScope(t, r) {
      if (!t) return "none";
      try {
        const a = t instanceof URL ? t : new URL(String(t || "")), n = r instanceof URL ? r : new URL(String(r || ""));
        return a.origin === n.origin ? "same_origin" : "external";
      } catch {
        return "external";
      }
    },
    resolveRoutingCapability(t = "proxy", r = [], a = "none") {
      const n = String(t || "").trim().toLowerCase() === "direct" ? "direct" : "proxy", s = e.pickPrimaryAuthCarrier(r), i = a === "same_origin" || a === "external" ? a : "none";
      return fh?.[n]?.[s]?.[i] || {
        deliveryMode: n,
        authCarrier: s,
        redirectScope: i,
        clientVisibleRedirect: n === "direct" && i !== "none",
        workerFollowRedirect: n !== "direct",
        reasonCode: n === "direct" ? "client_redirect" : "worker_follow_redirect"
      };
    },
    classifyProtocolFailureReason(t, r = {}) {
      const a = String(r.errorCode || t?.code || "").trim().toUpperCase(), n = String(r.message || t?.message || t || "").trim().toLowerCase(), s = Number(r.upstreamStatus) || 0;
      return String(r.abortReason || "").trim().toLowerCase() === "stream_idle_timeout" || a === "STREAM_IDLE_TIMEOUT" ? "idle_timeout" : a === "UPSTREAM_TIMEOUT" || n.includes("timed out") || n.includes("timeout") ? "connect_timeout" : n.includes("redirect loop") ? "redirect_loop" : n.includes("too many redirects") || n.includes("redirect limit") ? "redirect_limit_exceeded" : n.includes("tls") || n.includes("ssl") || n.includes("certificate") ? "tls_handshake_failed" : r.protocolFallbackRetry === !0 || n.includes("protocol_fallback") ? "http_version_fallback" : s === 416 || n.includes("range") && (n.includes("416") || n.includes("unsatisfied") || n.includes("satisfiable")) ? "range_unsatisfied" : s >= 400 && s < 500 ? "upstream_4xx" : s >= 500 ? "upstream_5xx" : "unknown_fetch_error";
    },
    buildStructuredLogDetail(t, r = {}, a = {}) {
      const n = String(a.deliveryMode || (e.shouldLogDirectAccess(t, { directRedirectUrl: a.directRedirectUrl }) ? "direct" : "proxy")).trim().toLowerCase() === "direct" ? "direct" : "proxy", s = e.collectLogAuthKinds(t, a.transport), i = a.redirectScope || e.resolveRedirectScope(a.directRedirectUrl || a.redirectUrl || a.finalUrl, t?.requestUrl), c = e.resolveRoutingCapability(n, s, i), l = Number(a.upstreamStatus || r.statusCode || 0) || 0, u = vf(l), d = t?.routeContextDiagnostics && typeof t.routeContextDiagnostics == "object" ? t.routeContextDiagnostics : null, f = Array.isArray(a.authKindsForwarded) ? [...new Set(a.authKindsForwarded.map((p) => String(p || "").trim().toLowerCase()).filter(Boolean))] : n === "direct" ? s.filter((p) => p === "query") : s, m = e.ensureFailoverTelemetry(t);
      return {
        routingMode: $r(t?.routingDecisionMode),
        entryDecision: t?.entryRoutingDecision ? {
          dataPlaneMode: String(t.entryRoutingDecision.dataPlaneMode || "").trim(),
          reason: String(t.entryRoutingDecision.reason || t.entryRoutingDecision.traceLabel || "").trim()
        } : null,
        redirectDecision: a.redirectDecision && typeof a.redirectDecision == "object" ? a.redirectDecision : {
          mode: String(a.redirectMode || a.redirectTrace?.terminalMode || c.reasonCode || "").trim(),
          reason: String(a.decisionReason || t?.directRedirectAuthReason || c.reasonCode || "").trim()
        },
        deliveryMode: n,
        redirectScope: i,
        authKindsPresent: s,
        authKindsForwarded: f,
        decisionReason: String(a.decisionReason || t?.directRedirectAuthReason || c.reasonCode || "").trim(),
        routeKind: String(d?.routeKind || "").trim() || null,
        requestHost: String(d?.requestHost || "").trim() || null,
        configuredHost: String(d?.configuredHost || "").trim() || null,
        configuredLegacyHost: String(d?.configuredLegacyHost || "").trim() || null,
        isLegacyHostRequest: d?.isLegacyHostRequest === !0,
        statusReasonCode: u.code,
        statusReasonText: u.text,
        protocolFailureReason: String(a.protocolFailureReason || "").trim() || null,
        protocolFallbackRetry: a.protocolFallbackRetry === !0,
        failoverState: e.buildFailoverStateSummary(t),
        probeReason: String(a.probeReason || m.probeReason || "").trim() || null,
        probeWinner: String(a.probeWinner || m.probeWinner || "").trim() || null,
        probeElapsedMs: Math.max(0, Math.round(Number(a.probeElapsedMs ?? m.probeElapsedMs) || 0)) || null,
        waitJoinMs: Math.max(0, Math.round(Number(a.waitJoinMs ?? m.waitJoinMs) || 0)) || null,
        demotedTarget: String(a.demotedTarget || m.demotedTarget || "").trim() || null,
        preferredTarget: String(a.preferredTarget || m.preferredTarget || "").trim() || null,
        fastFailReason: String(a.fastFailReason || m.fastFailReason || "").trim() || null,
        targetHotCache: String(a.targetHotCache || t?.targetHotCacheState || "").trim() || null,
        nodeCacheState: String(a.nodeCacheState || t?.nodeCacheState || "").trim() || null,
        playbackInfoCache: String(a.playbackInfoCache || t?.playbackInfoCacheState || "").trim() || null,
        playbackInfoCacheTtlSec: Number.isFinite(Number(a.playbackInfoCacheTtlSec)) ? Math.max(0, Math.trunc(Number(a.playbackInfoCacheTtlSec))) : Math.max(0, Math.trunc(Number(t?.playbackInfoCacheTtlSec) || 0)),
        playbackInfoMode: t?.requestTraits?.isPlaybackInfoRequest === !0 ? Qt(a.playbackInfoMode || t?.effectivePlaybackInfoMode) : null,
        playbackInfoRewrite: t?.requestTraits?.isPlaybackInfoRequest === !0 && String(a.playbackInfoRewrite || t?.playbackInfoRewrite || "").trim() || null,
        playbackUrlMode: String(a.playbackUrlMode || t?.playbackUrlMode || "").trim() || null,
        playbackFallback: String(a.playbackFallback || t?.playbackFallback || "").trim() || null,
        playbackPathFix: String(a.playbackPathFix || t?.playbackPathFix || "").trim() || null,
        rewritePlaybackEntry: String(a.rewritePlaybackEntry || t?.rewritePlaybackEntry || "").trim() || null,
        progressRelayMode: String(a.progressRelayMode || t?.progressForwardMode || "").trim() || null,
        progressIntervalSec: Number.isFinite(Number(a.progressIntervalSec)) ? Math.max(0, Math.trunc(Number(a.progressIntervalSec))) : Math.max(0, Math.trunc(Number(t?.videoProgressForwardIntervalSec) || 0)),
        rangeRequest: !!String(t?.request?.headers?.get("Range") || "").trim(),
        upstreamHost: String(a.upstreamHost || a.upstreamUrlHost || a.finalUrl?.hostname || "").trim(),
        upstreamStatus: l
      };
    },
    createRedirectTrace(t) {
      return {
        initialUrl: t ? String(t) : "",
        hops: [],
        terminalMode: "",
        finalStatus: 0,
        finalHost: ""
      };
    },
    recordRedirectTraceHop(t, r, a, n = {}) {
      !t || !a || t.hops.push({
        status: Number(r) || 0,
        kind: n.isSameOriginRedirect === !0 ? "same" : "external",
        action: String(n.traceAction || (e.isEntryDirectDataPlaneMode(n.dataPlaneMode) ? "direct" : "proxy")).trim() || "proxy",
        host: String(a.hostname || "").trim().toLowerCase()
      });
    },
    finalizeRedirectTrace(t, r = {}) {
      if (!t || typeof t != "object") return null;
      const a = String(r.terminalMode || t.terminalMode || "").trim();
      a && (t.terminalMode = a);
      const n = Number(r.finalStatus);
      Number.isFinite(n) && n > 0 && (t.finalStatus = n);
      const s = String(r.finalHost || "").trim().toLowerCase();
      return s && (t.finalHost = s), t;
    },
    buildRedirectDiagnosticDetail(t) {
      if (!t || typeof t != "object") return "";
      const r = Array.isArray(t.hops) ? t.hops : [], a = r.length, n = String(t.terminalMode || "").trim(), s = Number(t.finalStatus) || 0, i = String(t.finalHost || "").trim().toLowerCase();
      if (!a && !n && s <= 0 && !i) return "";
      const c = [];
      n && c.push(`Redirect=${n}`), c.push(`RedirectHops=${a}`);
      const l = r.map((u) => {
        const d = Number(u?.status) || 0, f = String(u?.kind || "").trim() || "unknown", m = String(u?.action || "").trim() || "proxy", p = String(u?.host || "").trim().toLowerCase();
        return [
          d || "0",
          f,
          m,
          p
        ].filter(Boolean).join(":");
      }).filter(Boolean).join(">");
      return l && c.push(`RedirectChain=${l.length > 240 ? l.slice(0, 237) + "..." : l}`), s > 0 && c.push(`RedirectFinal=${s}`), i && c.push(`RedirectFinalHost=${i}`), c.join(" | ");
    }
  };
}
function Nh(o = {}, e = {}) {
  return {
    buildProxyErrorState: no,
    async guardApiResponseMime(t, r) {
      return su(t, r, {
        sanitizePath: Z,
        buildErrorState: no
      });
    },
    buildMetadataCacheStorageResponse(t, r, a = {}) {
      const n = new Headers(t.headers);
      return n.delete("Set-Cookie"), r.isImage || r.isSubtitle ? n.set("Cache-Control", `public, max-age=${Math.max(0, Number(a.imageCacheMaxAge) || 0)}`) : r.isManifest && n.set("Cache-Control", `public, max-age=${Math.max(0, Number(a.prewarmCacheTtl) || 0)}`), new Response(t.body, {
        status: t.status,
        statusText: t.statusText,
        headers: n
      });
    },
    async storeMetadataCache(t, r, a, n = {}) {
      const s = yr();
      if (!s || !t || !r || r.status !== 200 || n.proxiedExternalRedirect === !0 || a.isManifest && !Io(n.sourceUrl)) return !1;
      try {
        return await s.put(t, e.buildMetadataCacheStorageResponse(r, a, n)), !0;
      } catch {
        return !1;
      }
    },
    resolveMetadataTarget(t, r, a, n) {
      const s = String(t || "").trim();
      if (!s) return null;
      let i;
      try {
        if (/^https?:\/\//i.test(s)) i = new URL(s);
        else {
          const u = new URL(s, "https://metadata-prewarm.invalid");
          i = Ye(r, u.pathname || "/"), i.search = u.search || "", i.hash = u.hash || "";
        }
      } catch {
        return null;
      }
      if (Vg(i.pathname)) return null;
      const { proxyPath: c } = za(i, r);
      if (!c) return null;
      const l = c || "/";
      return ea.test(l) || Zr.test(l) || Tt.test(l) || Er.test(l) ? {
        upstreamUrl: i,
        proxyPath: l,
        proxySearch: i.search || ""
      } : null;
    },
    buildMetadataPrewarmTargets(t, r, a, n, s, i) {
      const c = /* @__PURE__ */ new Map(), l = va(t);
      if (l) {
        const u = e.resolveMetadataTarget(`/Items/${encodeURIComponent(l)}/Images/Primary`, a, n, s);
        u && c.set(`${u.proxyPath}${u.proxySearch}`, u);
      }
      return i !== "poster" && Do(r).forEach((u) => {
        const d = e.resolveMetadataTarget(u, a, n, s);
        d && c.set(`${d.proxyPath}${d.proxySearch}`, d);
      }), [...c.values()].sort((u, d) => Ri(u.proxyPath) - Ri(d.proxyPath)).slice(0, 4);
    },
    buildBudgetedPrewarmResponse(t, r) {
      const a = Math.max(0, Math.floor(Number(r) || 0)), n = An(t?.headers?.get("Content-Length"));
      if (a <= 0 || Number.isFinite(n) && n > a) {
        try {
          Promise.resolve(t?.body?.cancel?.()).catch(() => {
          });
        } catch {
        }
        return null;
      }
      if (!t?.body) return {
        response: t,
        getBytes: () => 0
      };
      const s = t.body.getReader();
      let i = 0, c = !1;
      const l = () => {
        if (!c) {
          c = !0;
          try {
            s.releaseLock();
          } catch {
          }
        }
      }, u = new ReadableStream({
        async pull(d) {
          try {
            const { done: f, value: m } = await s.read();
            if (f) {
              l(), d.close();
              return;
            }
            const p = m instanceof Uint8Array ? m : new Uint8Array(m || 0);
            if (i + p.byteLength > a) {
              try {
                await s.cancel("metadata_prewarm_budget_exceeded");
              } catch {
              }
              l(), d.error(/* @__PURE__ */ new Error("metadata_prewarm_budget_exceeded"));
              return;
            }
            i += p.byteLength, d.enqueue(p);
          } catch (f) {
            l(), d.error(f);
          }
        },
        async cancel(d) {
          try {
            await s.cancel(d);
          } catch {
          }
          l();
        }
      });
      return {
        response: new Response(u, {
          status: t.status,
          statusText: t.statusText,
          headers: t.headers
        }),
        getBytes: () => i
      };
    },
    async runMetadataPrewarmSingleFlight(t, r) {
      const a = oe.MetadataPrewarmTasks, n = t instanceof Request ? t.url : String(t || "");
      if (!n) return {
        skipped: !0,
        result: null
      };
      const s = a.get(n);
      if (s) return {
        joined: !0,
        result: await s
      };
      if (a.size >= Pd) return {
        skipped: !0,
        result: null
      };
      const i = Promise.resolve().then(r).finally(() => {
        a.get(n) === i && a.delete(n);
      });
      return a.set(n, i), {
        joined: !1,
        result: await i
      };
    },
    scheduleMetadataPrewarmResponse(t, r, a, n, s, i, c, l, u, d = {}) {
      if (!u || t.method !== "GET" || a.enablePrewarm !== !0 || a.isPlaybackInfoRequest === !0 || a.isImage || a.isSubtitle || a.isManifest || a.isSegment || a.isBigStream || !(r.status >= 200 && r.status < 300) || !Ua(r.headers.get("Content-Type")) || a.prewarmDepth === "poster" && !va(String(d.proxyPath || ""))) return;
      let f;
      try {
        f = r.clone();
      } catch {
        return;
      }
      const m = (async () => {
        const p = await Me(f, mc);
        if (p.exceeded) return;
        let h;
        try {
          h = JSON.parse(p.text);
        } catch {
          return;
        }
        const g = e.buildMetadataPrewarmTargets(d.proxyPath, h, n, i, c, a.prewarmDepth);
        if (!g.length) return;
        const y = yr();
        if (!y) return;
        let _ = fe(a.prewarmPrefetchBytes, $.Defaults.PrewarmPrefetchBytes, 0, Zo);
        for (const S of g) {
          if (_ <= 0) break;
          if (!Io(S.upstreamUrl)) continue;
          const E = await Hg(t, S.upstreamUrl), b = zl(l, i, c, S.proxyPath, {
            search: S.proxySearch,
            nodeCacheRevision: d.nodeCacheRevision,
            entryMode: d.entryMode,
            identityPartition: E,
            cachePolicyRevision: Hl(S.proxyPath, d)
          });
          if (b) {
            if (y && b) try {
              if (await y.match(b)) continue;
            } catch {
            }
            try {
              const T = await e.runMetadataPrewarmSingleFlight(b, async () => {
                const C = await s(S.upstreamUrl, { method: "GET" });
                C.cache = "no-store";
                const L = new Headers(C.headers);
                L.delete("Range"), L.delete("If-Modified-Since"), L.delete("If-None-Match"), L.set("X-Metadata-Prewarm", "1"), C.headers = L;
                const P = new AbortController();
                C.signal = P.signal;
                const A = fe(d.prewarmTimeoutMs, Rd, 250, 1e4), w = setTimeout(() => P.abort(), A);
                try {
                  const R = await We(S.upstreamUrl.toString(), C);
                  if (R.status !== 200) {
                    try {
                      await R.body?.cancel?.();
                    } catch {
                    }
                    return {
                      cached: !1,
                      bytes: 0
                    };
                  }
                  const I = e.buildBudgetedPrewarmResponse(R, _);
                  if (!I) return {
                    cached: !1,
                    bytes: 0
                  };
                  const x = {
                    isImage: ea.test(S.proxyPath) || Zr.test(S.proxyPath),
                    isSubtitle: Er.test(S.proxyPath),
                    isManifest: Tt.test(S.proxyPath)
                  };
                  return {
                    cached: await e.storeMetadataCache(b, I.response, x, {
                      ...d,
                      sourceUrl: S.upstreamUrl
                    }),
                    bytes: I.getBytes()
                  };
                } finally {
                  clearTimeout(w), P.abort();
                }
              });
              !T.joined && T.result && (_ = Math.max(0, _ - (Number(T.result.bytes) || 0)));
            } catch {
            }
          }
        }
      })().catch(() => {
      });
      return u.waitUntil(m), m;
    },
    shouldRetryWithProtocolFallback(t, r = {}) {
      return !(t.status !== 403 || r.isRetry !== !1 || r.protocolFallback !== !0 || r.allowAutomaticRetry !== !0 || r.preparedBodyMode === "stream" || r.stripAuthOnProtocolFallback !== !0);
    },
    async resolveProtocolFallbackRetry(t, r, a) {
      let n = null, s = null;
      try {
        n = await a();
      } catch (l) {
        s = l;
      }
      if (s && Vt(s)) {
        try {
          r.body?.cancel?.();
        } catch {
        }
        try {
          t.releaseFetchController?.();
        } catch {
        }
        throw s;
      }
      const i = n?.response || null;
      if (!s && i && (i.status === 101 || i.status < 400)) {
        try {
          r.body?.cancel?.();
        } catch {
        }
        try {
          t.releaseFetchController?.();
        } catch {
        }
        return n;
      }
      if (i) try {
        i.body?.cancel?.();
      } catch {
      }
      try {
        n?.releaseFetchController?.();
      } catch {
      }
      const c = Number(i?.status) || 0;
      return Le("proxy.protocol_fallback_retry_failed", s || /* @__PURE__ */ new Error(`protocol fallback retry returned ${c || "no_response"}`), {
        upstreamStatus: Number(r?.status) || 0,
        protocolFallbackRetryStatus: c
      }), {
        ...t,
        protocolFallbackRetry: !1,
        protocolFallbackRetryFailed: !0
      };
    },
    resolveResponseStreamIdleTimeoutMs(t) {
      return t?.isManifest === !0 ? $.Defaults.ProxyPlaylistIdleTimeoutMs : t?.isSegment === !0 ? $.Defaults.ProxyStreamIdleTimeoutMs : 0;
    },
    shouldManageProxyResponseBody(t, r) {
      return (t.requestTraits.isSegment === !0 || t.requestTraits.isManifest === !0) && t.requestMethod !== "HEAD" && r.response.status !== 101 && !!r.response.body;
    },
    buildPassthroughProxyResponseBody(t, r) {
      const a = t.requestMethod === "HEAD" ? null : r.response.body;
      try {
        r.releaseFetchController?.();
      } catch {
      }
      return t.requestLifecycle?.dispose?.(), a;
    },
    buildManagedProxyResponseBody(t, r, a) {
      const n = r.response.body, s = t.requestLifecycle;
      let i = a && typeof a == "object" ? a : null;
      if (!i) {
        const E = e.classifyProxyLogCategory(t.requestTraits);
        e.shouldRecordAccessLog(t, {
          statusCode: r.response.status,
          category: E
        }, { statusFinal: !1 }) && (i = {
          statusCode: r.response.status,
          category: E,
          errorDetail: null,
          detailJson: e.buildStructuredLogDetail(t, { statusCode: r.response.status }, {
            deliveryMode: "proxy",
            redirectMode: "proxied_follow",
            decisionReason: "proxied_follow",
            upstreamHost: r.finalUrl?.hostname || r.activeTargetBase?.hostname || "",
            upstreamStatus: r.response.status
          })
        });
      }
      if (!n || t.requestMethod === "HEAD" || !s) {
        try {
          r.releaseFetchController?.();
        } catch {
        }
        return s?.dispose?.(), t.requestMethod === "HEAD" ? null : n;
      }
      const c = n.getReader(), l = e.resolveResponseStreamIdleTimeoutMs(t.requestTraits, t.upstreamTimeoutMs), u = i && {
        ...i,
        detailJson: i?.detailJson || e.buildStructuredLogDetail(t, { statusCode: r.response.status }, {
          deliveryMode: "proxy",
          redirectMode: "proxied_follow",
          decisionReason: "proxied_follow",
          protocolFailureReason: r.protocolFallbackRetry === !0 || r.protocolFallbackRetryFailed === !0 ? e.classifyProtocolFailureReason("protocol_fallback", {
            protocolFallbackRetry: !0,
            upstreamStatus: r.response.status
          }) : Number(r.response.status) >= 400 ? e.classifyProtocolFailureReason(i?.errorDetail || r.response.statusText || "", { upstreamStatus: r.response.status }) : null,
          upstreamHost: r.finalUrl?.hostname || r.activeTargetBase?.hostname || "",
          upstreamStatus: r.response.status
        }),
        errorDetail: e.appendLogDiagnosticDetail(i.errorDetail, e.buildStreamDiagnosticDetail(t, r.response, {
          flow: "managed",
          source: "upstream",
          upstreamHost: r.finalUrl?.hostname || r.activeTargetBase?.hostname || "",
          idleTimeoutMs: l
        }))
      };
      let d = !1, f = null, m = null, p = () => {
      }, h = !1;
      const g = (E = {}) => {
        if (h || !u) return;
        h = !0;
        const b = {
          ...u,
          ...H(E) ? E : {}
        };
        b.errorDetail = e.appendLogDiagnosticDetail(E.errorDetail, u.errorDetail), b.detailJson = {
          ...u.detailJson,
          ...E.detailJson && typeof E.detailJson == "object" ? E.detailJson : {},
          protocolFailureReason: E?.detailJson?.protocolFailureReason || (Number(b.statusCode) >= 400 ? e.classifyProtocolFailureReason(b.errorDetail, {
            upstreamStatus: b.statusCode,
            protocolFallbackRetry: u?.detailJson?.protocolFallbackRetry === !0
          }) : u?.detailJson?.protocolFailureReason || null),
          upstreamStatus: Number(b.statusCode) || 0
        }, e.recordAccessLog(t, b);
      }, y = () => {
        m !== null && (clearTimeout(m), m = null);
      }, _ = () => {
        if (!d) {
          d = !0, y();
          try {
            p();
          } catch {
          }
          p = () => {
          };
          try {
            c.releaseLock();
          } catch {
          }
          try {
            r.releaseFetchController?.();
          } catch {
          }
          s.dispose();
        }
      }, S = () => {
        d || l <= 0 || (y(), m = setTimeout(() => s.abort("stream_idle_timeout"), l));
      };
      return p = s.onAbort((E) => {
        d || (y(), E === "stream_idle_timeout" ? g({
          statusCode: 504,
          category: "error",
          errorDetail: `stream_idle_timeout_${l}ms`
        }) : E === "client_aborted" || E === "downstream_cancelled" ? g({
          statusCode: 499,
          category: e.classifyProxyLogCategory(t.requestTraits),
          errorDetail: E
        }) : E && g({
          statusCode: 502,
          category: "error",
          errorDetail: String(E)
        }), Promise.resolve(c.cancel(E)).catch(() => {
        }).finally(() => {
          d || _();
        }));
      }), new ReadableStream({
        pull: async (E) => {
          if (!d)
            return f || (S(), f = (async () => {
              try {
                const { done: b, value: T } = await c.read();
                if (y(), b) {
                  const C = s.getAbortReason();
                  if (_(), C === "stream_idle_timeout") {
                    try {
                      E.error(hr(C, `${l}ms`));
                    } catch {
                    }
                    return;
                  }
                  g(), E.close();
                  return;
                }
                E.enqueue(T), S();
              } catch (b) {
                y();
                const T = s.getAbortReason(), C = T === "stream_idle_timeout" ? hr(T, `${l}ms`) : T ? hr(T) : b;
                if (_(), T === "client_aborted" || T === "downstream_cancelled") {
                  g({
                    statusCode: 499,
                    category: e.classifyProxyLogCategory(t.requestTraits),
                    errorDetail: T
                  });
                  try {
                    E.close();
                  } catch {
                  }
                  return;
                }
                g(T === "stream_idle_timeout" ? {
                  statusCode: 504,
                  category: "error",
                  errorDetail: `stream_idle_timeout_${l}ms`
                } : {
                  statusCode: 502,
                  category: "error",
                  errorDetail: b?.message || String(b)
                });
                try {
                  E.error(C);
                } catch {
                }
              } finally {
                f = null;
              }
            })(), f);
        },
        cancel: async (E) => {
          if (!d) {
            s.abort("downstream_cancelled"), y();
            try {
              await c.cancel(E);
            } catch {
            }
            g({
              statusCode: 499,
              category: e.classifyProxyLogCategory(t.requestTraits),
              errorDetail: "downstream_cancelled"
            }), _();
          }
        }
      });
    }
  };
}
function Ih(o = {}, e = {}) {
  return {
    async performFetchWithTimeout(t, r, a = {}) {
      const n = await r(t, a), s = Math.max(0, Number(a.timeoutMs) || 0), i = a.requestLifecycle || null;
      let c = null, l = null, u = !1, d = () => {
      };
      (s > 0 || i) && (l = new AbortController(), n.signal = l.signal, i && (d = i.setActiveFetchController(l)), s > 0 && (c = setTimeout(() => {
        u = !0, l.abort(`upstream_timeout_${s}ms`);
      }, s)));
      try {
        return {
          response: await We(t.toString(), n),
          finalUrl: t,
          releaseFetchController: d
        };
      } catch (f) {
        if (d(), u) {
          const m = /* @__PURE__ */ new Error(`upstream_timeout_${s}ms`);
          throw m.code = "UPSTREAM_TIMEOUT", m;
        }
        if (i && Vt(f)) {
          const m = i.getAbortReason();
          if (m) throw hr(m);
        }
        throw f;
      } finally {
        c !== null && clearTimeout(c);
      }
    },
    async performUpstreamFetch(t, r, a, n, s = {}) {
      const i = s.useFastSegmentBuilder === !0, c = i ? new URL(ug(t, r, a?.search || "")) : Ye(t, r);
      return i || (c.search = a.search), {
        ...await e.performFetchWithTimeout(c, n, s),
        targetRecord: t
      };
    },
    async fetchAbsoluteWithRetryLoop(t) {
      let r = null;
      const a = t.absoluteUrl instanceof URL ? new URL(t.absoluteUrl.toString()) : new URL(String(t.absoluteUrl || "")), n = Math.max(1, fe(t.maxExtraAttempts, co, 0, 3) + 1);
      for (let s = 0; s < n; s++) {
        const i = t.isRetry === !0 || s > 0;
        try {
          const c = await e.performFetchWithTimeout(a, t.buildFetchOptions, {
            ...t.fetchOptions,
            isRetry: i,
            protocolFallbackRetry: t.protocolFallbackRetry === !0,
            stripAuthOnProtocolFallback: t.stripAuthOnProtocolFallback === !0,
            timeoutMs: t.upstreamTimeoutMs,
            requestLifecycle: t.requestLifecycle
          }), l = c.response;
          if (l.status === 101) return {
            ...c,
            protocolFallbackRetry: t.protocolFallbackRetry === !0
          };
          if (e.shouldRetryWithProtocolFallback(l, {
            ...t,
            isRetry: i
          })) return await e.resolveProtocolFallbackRetry(c, l, () => e.fetchAbsoluteWithRetryLoop({
            ...t,
            isRetry: !0,
            protocolFallbackRetry: !0
          }));
          const u = s === n - 1;
          if (t.allowAutomaticRetry !== !0 || !t.retryableStatuses.has(l.status) || u) return {
            ...c,
            protocolFallbackRetry: t.protocolFallbackRetry === !0
          };
          try {
            l.body?.cancel?.();
          } catch {
          }
          try {
            c.releaseFetchController?.();
          } catch {
          }
        } catch (c) {
          r = c;
          const l = s === n - 1;
          if (t.allowAutomaticRetry !== !0 || l)
            throw c && typeof c == "object" && (c.lastFinalUrl = a), c;
        }
      }
      throw r && typeof r == "object" && (r.lastFinalUrl = a), r || /* @__PURE__ */ new Error("redirect_fetch_failed");
    },
    async fetchUpstreamWithRetryLoop(t) {
      let r = null, a = Array.isArray(t.retryTargetRecords) ? t.retryTargetRecords.slice() : [], n = a[0], s = Ye(n, t.proxyPath);
      s.search = t.requestUrl.search;
      const i = Math.max(1, fe(t.maxExtraAttempts, co, 0, 3) + 1);
      for (let c = 0; c < i; c++) for (let l = 0; l < a.length; l++) {
        const u = a[l];
        n = u;
        const d = t.isRetry === !0 || c > 0;
        try {
          const f = await e.performUpstreamFetch(u, t.proxyPath, t.requestUrl, t.buildFetchOptions, {
            isRetry: d,
            protocolFallbackRetry: t.protocolFallbackRetry === !0,
            stripAuthOnProtocolFallback: t.stripAuthOnProtocolFallback === !0,
            timeoutMs: t.upstreamTimeoutMs,
            requestLifecycle: t.requestLifecycle,
            useFastSegmentBuilder: t.segmentFastPathEnabled === !0 && d !== !0 && t.protocolFallbackRetry !== !0
          });
          s = f.finalUrl;
          const m = f.response;
          if (m.status === 101) return {
            ...f,
            protocolFallbackRetry: t.protocolFallbackRetry === !0
          };
          if (e.shouldRetryWithProtocolFallback(m, {
            ...t,
            isRetry: d
          })) return await e.resolveProtocolFallbackRetry(f, m, () => e.fetchUpstreamWithRetryLoop({
            ...t,
            isRetry: !0,
            protocolFallbackRetry: !0
          }));
          const p = l === a.length - 1, h = c === i - 1;
          if (t.allowAutomaticRetry !== !0 || !t.retryableStatuses.has(m.status) || p && h) return {
            ...f,
            protocolFallbackRetry: t.protocolFallbackRetry === !0
          };
          const g = await e.maybeRunForegroundFailoverWait(t, {
            targetRecord: u,
            responseStatus: m.status,
            reason: `upstream_status_${m.status}`
          });
          if (g?.upstream) {
            const y = g.upstream;
            n = y.targetRecord || u, s = y.finalUrl || s;
            const _ = y.response;
            if (_.status === 101) return {
              ...y,
              protocolFallbackRetry: t.protocolFallbackRetry === !0
            };
            if (!t.retryableStatuses.has(_.status)) return {
              ...y,
              protocolFallbackRetry: t.protocolFallbackRetry === !0
            };
          } else g?.error && (r = g.error);
          try {
            m.body?.cancel?.();
          } catch {
          }
          try {
            f.releaseFetchController?.();
          } catch {
          }
          if (t.execution?.failoverContext?.eligible) {
            const y = e.getFailoverStateSnapshot(t.execution.failoverContext.cacheKey, t.execution.failoverContext.preferredTtlMs);
            a = e.reorderRetryTargetsForFailover(t.execution.failoverContext.originalTargetRecords, y);
          }
        } catch (f) {
          r = f;
          const m = String(f?.code || "").trim().toUpperCase();
          if (![
            "CLIENT_ABORTED",
            "DOWNSTREAM_CANCELLED",
            "REQUEST_ABORTED"
          ].includes(m)) {
            const g = await e.maybeRunForegroundFailoverWait(t, {
              targetRecord: u,
              reason: m || "network_error"
            });
            if (g?.upstream) {
              const y = g.upstream;
              n = y.targetRecord || u, s = y.finalUrl || s;
              const _ = y.response;
              if (_.status === 101) return {
                ...y,
                protocolFallbackRetry: t.protocolFallbackRetry === !0
              };
              if (!t.retryableStatuses.has(_.status)) return {
                ...y,
                protocolFallbackRetry: t.protocolFallbackRetry === !0
              };
            } else g?.error && (r = g.error);
            if (t.execution?.failoverContext?.eligible) {
              const y = e.getFailoverStateSnapshot(t.execution.failoverContext.cacheKey, t.execution.failoverContext.preferredTtlMs);
              a = e.reorderRetryTargetsForFailover(t.execution.failoverContext.originalTargetRecords, y);
            }
          }
          const p = l === a.length - 1, h = c === i - 1;
          if (p && h)
            throw f && typeof f == "object" && (f.lastFinalUrl = s, f.lastTargetRecord = n, f.lastTargetBase = n?.targetUrl || null), f;
        }
      }
      throw r && typeof r == "object" && (r.lastFinalUrl = s, r.lastTargetRecord = n, r.lastTargetBase = n?.targetUrl || null), r || /* @__PURE__ */ new Error("upstream_fetch_failed");
    }
  };
}
function Dh(o = {}, e = {}) {
  const { Logger: t } = o;
  return {
    shouldRecordAccessLog(r = {}, a = {}, n = {}) {
      const s = H(r.currentConfig) ? r.currentConfig : po(r.env);
      return H(s) ? Mc(s, {
        requestMethod: r.requestMethod,
        requestPath: r.proxyPath,
        statusCode: a.statusCode,
        category: a.category
      }, n) : !0;
    },
    recordAccessLog(r, a = {}) {
      const n = {
        nodeName: r.nodeName,
        requestPath: r.proxyPath,
        requestMethod: r.requestMethod,
        responseTime: Date.now() - r.startTime,
        clientIp: r.clientIp || "unknown",
        inboundColo: r.logInboundColo || "UNKNOWN",
        outboundColo: a.outboundColo || a.outboundIp || r.defaultOutboundColo || "",
        userAgent: r.request.headers.get("User-Agent"),
        referer: r.request.headers.get("Referer"),
        runtimeConfig: r.currentConfig,
        ...a
      };
      t.record(r.env, r.ctx, n);
    },
    buildOptionsResponse(r) {
      const a = new Headers(r.dynamicCors);
      return Ne(a), r.finalOrigin !== "*" && Vr(a, "Origin"), new Response(null, { headers: a });
    }
  };
}
function Mh(o = {}, e = {}) {
  return {
    ...Lh(o, e),
    ...Nh(o, e),
    ...Ih(o, e),
    ...Dh(o, e)
  };
}
var Ph = 1440 * 60 * 1e3;
function xh(o, e, t) {
  const r = new URL(o.toString());
  return vr(r.searchParams, "AnyProviderIdEquals"), vr(r.searchParams, "SearchTerm"), vr(r.searchParams, "Years"), r.searchParams.set("SearchTerm", e), /^\d{4}$/.test(t) ? r.searchParams.set("Years", t) : r.searchParams.delete("Years"), r;
}
var Oh = "https://api.theotherdb.org/video/getVideoIdByExternalId", vh = 1440 * 1e3, Fh = 8e3, Uh = [
  "video_id",
  "videoId",
  "video_ids",
  "videoIds"
], kh = ["id", "value"], Hh = [
  "items",
  "data",
  "results",
  "videos",
  "list"
];
function $h(o) {
  const e = String(o ?? "").trim().toLowerCase();
  return e ? e === "movie" || e === "film" ? "movie" : e === "tv" || e === "series" || e === "show" ? "tv" : "" : "";
}
function Bh(o, e, t) {
  if (o != null)
    for (const r of String(o).split(",")) {
      const a = r.trim();
      if (!/^\d+$/.test(a)) continue;
      const n = t.get(a);
      n ? !n.videoType && e && (n.videoType = e) : t.set(a, {
        videoId: a,
        videoType: e
      });
    }
}
function xo(o, e, t, r = 0) {
  if (o == null || r > 3) return;
  if (Array.isArray(o)) {
    for (let s = 0; s < Math.min(o.length, 64); s++) xo(o[s], e, t, r + 1);
    return;
  }
  if (!H(o)) {
    Bh(o, e, t);
    return;
  }
  const a = $h(o.video_type ?? o.videoType) || e, n = (s) => {
    let i = !1;
    for (const c of s)
      Object.prototype.hasOwnProperty.call(o, c) && (i = !0, xo(o[c], a, t, r + 1));
    return i;
  };
  n(Uh) || n(Hh) || n(kh);
}
function Kh(o) {
  const e = /* @__PURE__ */ new Map();
  if (xo(o, "", e), !e.size) return null;
  const t = {
    "": [],
    movie: [],
    tv: []
  };
  for (const { videoId: r, videoType: a } of e.values())
    t[""].push(r), (!a || a === "movie") && t.movie.push(r), (!a || a === "tv") && t.tv.push(r);
  return Object.fromEntries(Object.entries(t).map(([r, a]) => [r, a.join(",")]));
}
async function zh(o, e, t) {
  const r = Bo.get(Ft(t)), a = JSON.stringify([
    "todb",
    ia(t),
    e,
    o
  ]);
  return await vi(r, r.TodbVideoIdCache, a, vh, async () => {
    const n = new URL(Oh);
    n.searchParams.set("type", "tmdb"), n.searchParams.set("value", o);
    const s = new AbortController(), i = setTimeout(() => s.abort("todb_timeout"), Fh);
    try {
      const c = await It(fetch(n, {
        headers: {
          accept: "application/json",
          authorization: `Bearer ${e}`
        },
        signal: s.signal,
        redirect: "manual"
      }), s.signal);
      return c.ok ? Kh(await Aa(c, 512 * 1024, s.signal)) : (Promise.resolve(c.body?.cancel()).catch(() => {
      }), console.warn(`todb video id lookup failed: ${c.status}`), null);
    } catch {
      return console.warn("todb video id lookup failed: request_failed"), null;
    } finally {
      clearTimeout(i);
    }
  });
}
async function Li(o, e = {}, t = {}, r = "", a = "") {
  const n = String(t?.todbApiKey || "").trim() || String(e?.TODB_API_KEY || "").trim();
  if (!n) return null;
  const s = (await zh(r, n, e))?.[a];
  if (!s) return null;
  const i = new URL(o.toString());
  return vr(i.searchParams, "AnyProviderIdEquals"), i.searchParams.set("todbvs", s), i;
}
async function rn(o, e = {}, t = {}, r = "auto") {
  const a = Ke(o?.searchParams, "AnyProviderIdEquals")?.match(/(?:^|,)\s*tmdb\.(\d+)(?=\s*(?:,|$))/i);
  if (!a) return null;
  const n = qt(r), s = String(Ke(o.searchParams, "IncludeItemTypes") || "").toLowerCase(), i = s.includes("movie"), c = i ? "movie" : "tv", l = i, u = l === (s.includes("series") || s.includes("tv") || s.includes("episode") || s.includes("season")) ? "" : l ? "movie" : "tv";
  if (n === "emos") return await Li(o, e, t, a[1], u);
  const d = String(t?.tmdbApiReadToken || "").trim(), f = String(t?.tmdbApiV3Key || "").trim(), m = String(e?.TMDB_API_READ_TOKEN || "").trim(), p = String(e?.TMDB_API_KEY || "").trim(), h = !!(d || f), g = h ? d : m, y = h ? f : p, _ = () => n === "auto" ? Li(o, e, t, a[1], u) : Promise.resolve(null);
  if (!g && !y) return await _();
  h && (m || p) && je.TmdbCredentialOverrideWarned !== !0 && (je.TmdbCredentialOverrideWarned = !0, Le("tmdb.credentials_override", "account settings TMDB credentials override TMDB_* environment variables", {
    configReadToken: d ? "set" : "unset",
    configApiKey: f ? "set" : "unset",
    envReadToken: m ? "set" : "unset",
    envApiKey: p ? "set" : "unset"
  }));
  const S = String(t?.tmdbLanguage || e?.TMDB_LANGUAGE || "zh-CN").trim() || "zh-CN", E = Bo.get(Ft(e)), b = JSON.stringify([
    "tmdb",
    ia(e),
    g ? "bearer" : "key",
    g || y,
    S,
    c,
    a[1]
  ]), T = await vi(E, E.TmdbLookupCache, b, Ph, async () => {
    const C = new URL(`https://api.themoviedb.org/3/${c}/${a[1]}`);
    C.searchParams.set("language", S), y && !g && C.searchParams.set("api_key", y);
    const L = new Headers({ accept: "application/json" });
    g && L.set("Authorization", `Bearer ${g}`);
    const P = new AbortController(), A = setTimeout(() => P.abort("tmdb_timeout"), 5e3);
    try {
      const w = await It(fetch(C, {
        headers: L,
        signal: P.signal,
        redirect: "manual"
      }), P.signal);
      if (!w.ok)
        return Promise.resolve(w.body?.cancel()).catch(() => {
        }), console.warn(`TMDB ${c} lookup failed: ${w.status}`), null;
      const R = await Aa(w, 512 * 1024, P.signal), I = String(i ? R?.title || "" : R?.name || "").trim(), x = String(i ? R?.release_date || "" : R?.first_air_date || "").slice(0, 4);
      return I ? {
        title: I,
        year: x
      } : null;
    } catch {
      return console.warn("TMDB request conversion failed: request_failed"), null;
    } finally {
      clearTimeout(A);
    }
  });
  return T ? xh(o, T.title, T.year) : await _();
}
function Wh(o = {}, e = {}) {
  const { CacheManager: t } = o, r = new _u({
    entries: oe.PlaybackInfoResponseCache,
    now: B,
    maxEntries: $.Defaults.PlaybackInfoCacheMax,
    maxEntryBytes: Qo,
    maxTotalBytes: Ld
  });
  return {
    async prepareExecutionContext(a, n, s, i, c, l, u, d = {}) {
      const f = Date.now(), m = a.method;
      if (t.maybeCleanup(l), !n || !n.target) return { invalidResponse: new Response("Invalid Node", {
        status: 502,
        headers: Ne(new Headers())
      }) };
      const p = H(d.runtimeConfig) ? d.runtimeConfig : await we(l), h = d.requestUrl || new URL(a.url), g = d.runtimeRouteContext && typeof d.runtimeRouteContext == "object" ? d.runtimeRouteContext : null, y = typeof g?.requestHost == "string" ? g.requestHost : ne(h.hostname), _ = typeof g?.configuredHost == "string" ? g.configuredHost : Ve(l), S = typeof g?.configuredLegacyHost == "string" ? g.configuredLegacyHost : Jr(l), E = dr(d.entryMode || n?.entryMode), b = String(d.routeKindOverride || "").trim(), T = !!(S && S !== _ && y && y === S), C = {
        requestHost: y,
        configuredHost: _,
        configuredLegacyHost: S,
        isLegacyHostRequest: T,
        routeKind: b || (T ? "legacy_host_kv_route" : E === "host_prefix" ? "host_prefix" : "kv_route")
      }, L = Z(s), P = String(d?.pathNormalizationState?.kind || "").trim(), A = a.headers.get("cf-connecting-ip") || "unknown", w = ha(a), R = A, I = a.cf?.country || "UNKNOWN", x = e.resolveCorsOrigin(p, a), N = sa(l, a, x), F = Nc(d.linkVariant), D = Rg(L, h);
      if (D?.error) return { invalidResponse: new Response("Invalid Playback Relay", {
        status: 400,
        headers: Ne(new Headers(N))
      }) };
      const U = h.searchParams.has("__pb_abs") && (!!D || Na(L));
      let V = h;
      const X = D?.visibleProxyPath || L, v = D?.targetUrl instanceof URL ? D.targetUrl.pathname : "";
      if (La(X) || v && La(v)) return { invalidResponse: Un(m, N) };
      if ((D || U) && (V = new URL(h)), D) {
        V.searchParams.delete(Lc);
        const he = Ll(h, i, c, X, {
          linkVariant: F,
          entryMode: d.entryMode
        });
        V.pathname = he.pathname;
      }
      if (U && V.searchParams.delete(ho), n.tmdbAggregationEnabled === !0 && Oo(X) && (m === "GET" || m === "HEAD")) {
        const he = await rn(V, l, p, n.aggregationMode);
        he && (V = he);
      }
      const O = Ym(n, p, i), M = e.classifyRequest(a, X, V, p, {
        nodeDirectSource: O,
        directStaticAssets: p.directStaticAssets === !0,
        directHlsDash: p.directHlsDash === !0
      }), k = Ef(n, p), j = yg(k), q = k === "rewrite" && D?.targetUrl instanceof URL ? "proxy" : "", J = F !== "main" ? "link_variant_force_proxy" : q ? "rewrite_playback_entry_proxy" : "", Q = !!J, se = Q ? {
        ...M,
        nodeDirectMedia: !1,
        directStaticAssets: !1,
        directHlsDash: !1,
        legacyEntryOffloadEnabled: !1,
        legacyEntryOffloadReason: "",
        enablePrewarm: p.enablePrewarm !== !1,
        isMetadataCacheable: m === "GET" && M.isWsUpgrade !== !0 && (M.isImage === !0 || M.isSubtitle === !0 || M.isManifest === !0)
      } : M, pe = ep(p), _e = p.protocolFallback !== !1, ye = fe(p.upstreamTimeoutMs, _d, 0, 18e4), Te = fe(p.upstreamRetryAttempts, co, 0, 3), Ue = p.hedgeFailoverEnabled === !0, kt = p.hedgeProbePreferGet !== !1, De = Tf(n, p), ca = fe(p.hedgeProbeTimeoutMs, Jo, 250, 1e4), st = fe(p.hedgeProbeParallelism, nc, 1, 2), it = fe(p.hedgeWaitTimeoutMs, oc, 250, 1e4), Tr = fe(p.hedgeLockTtlMs, sc, 1e3, 1e4), la = fe(p.hedgePreferredTtlSec, ga, 30, 3600), $e = fe(p.hedgeFailureCooldownSec, ic, 1, 300), ar = fe(p.hedgeWakeJitterMs, cc, 0, 1e3), pt = fe(p.cacheTtlImages, dc, 0, 365) * 86400, gt = pe.enableH3 === !0, Ht = pe.forceH1 === !0, wt = p.playbackInfoCacheEnabled !== !1, $t = fe(p.playbackInfoCacheTtlSec, wd, 0, 60), nr = p.videoProgressForwardEnabled !== !1, Lt = fe(p.videoProgressForwardIntervalSec, uc, 0, 60), Rr = Af(n, p), Bt = bf(n, p), Kt = String(d.nodeCacheRevision || "").trim() || No(i, n), K = se.isMetadataCacheable ? await kl(a) : "", G = se.isMetadataCacheable ? Hl(X, {
        imageCacheMaxAge: pt,
        prewarmCacheTtl: se.prewarmCacheTtl
      }) : "", Y = !(n.tmdbAggregationEnabled === !0 && Oo(X)) && se.isMetadataCacheable && Io(V) ? zl(V, i, c, X, {
        search: V.search,
        nodeCacheRevision: Kt,
        entryMode: d.entryMode,
        identityPartition: K,
        cachePolicyRevision: G
      }) : null, W = Y ? yr() : null, te = of(n, p), le = e.getRoutingDecision({
        phase: "entry",
        request: a,
        requestUrl: V,
        proxyPath: X,
        requestTraits: se,
        currentConfig: p,
        node: n,
        nodeName: i,
        nodeKey: c,
        linkVariant: F,
        forceWorkerProxy: Q,
        forceWorkerProxyReason: J,
        routingDecisionMode: te
      });
      return {
        request: a,
        requestMethod: m,
        node: n,
        nodeName: i,
        nodeKey: c,
        entryMode: E,
        env: l,
        ctx: u,
        startTime: f,
        currentConfig: p,
        rawRequestUrl: h,
        requestUrl: V,
        requestOrigin: h.origin,
        rawProxyPath: L,
        proxyPath: X,
        linkVariant: F,
        forceWorkerProxy: Q,
        forceWorkerProxyReason: J,
        clientIp: R,
        inboundIp: A,
        logInboundColo: w,
        country: I,
        finalOrigin: x,
        dynamicCors: N,
        routeContextDiagnostics: C,
        requestTraits: se,
        protocolStrategy: pe.strategy,
        routingDecisionMode: te,
        entryRoutingDecision: le,
        enableH3: gt,
        forceH1: Ht,
        protocolFallback: _e,
        upstreamTimeoutMs: ye,
        upstreamRetryAttempts: Te,
        hedgeFailoverEnabled: Ue,
        hedgeProbePreferGet: kt,
        hedgeProbePath: De,
        hedgeProbeTimeoutMs: ca,
        hedgeProbeParallelism: st,
        hedgeWaitTimeoutMs: it,
        hedgeLockTtlMs: Tr,
        hedgePreferredTtlSec: la,
        hedgeFailureCooldownSec: $e,
        hedgeWakeJitterMs: ar,
        playbackInfoCacheEnabled: wt,
        playbackInfoCacheTtlSec: $t,
        effectivePlaybackInfoMode: k,
        playbackInfoRewriteUrlMode: j,
        playbackInfoCacheState: se.isPlaybackInfoRequest === !0 ? wt && $t > 0 ? "miss" : "skip" : "",
        playbackInfoCacheKey: "",
        playbackInfoRewrite: se.isPlaybackInfoRequest === !0 && k === "passthrough" ? "passthrough" : "",
        playbackAbsoluteFallbackEligible: U,
        playbackAbsoluteFallbackLocation: U ? Sg(L, h) : "",
        playbackUrlMode: U ? "absolute" : se.isPlaybackInfoRequest === !0 && k === "rewrite" ? String(j || "relative") : "",
        playbackFallback: U ? "none" : "",
        playbackPathFix: P,
        rewritePlaybackEntry: q,
        playbackRelayTargetUrl: D?.targetUrl instanceof URL ? D.targetUrl : null,
        targetHotCacheState: String(d.targetHotCacheState || "").trim() || (se.isPlaybackCriticalRequest === !0 ? "miss" : "skip"),
        nodeCacheState: String(d.nodeCacheState || "").trim(),
        playbackRouteHotTargetRecords: Array.isArray(d.cachedTargetRecords) ? d.cachedTargetRecords : null,
        videoProgressForwardEnabled: nr,
        videoProgressForwardIntervalSec: Lt,
        effectiveRealClientIpMode: Rr,
        effectiveMediaAuthMode: Bt,
        nodeDerivedCacheRevision: Kt,
        failoverContext: null,
        failoverTelemetry: null,
        failoverForegroundWaitUsed: !1,
        progressForwardMode: "",
        progressForwardSessionKey: "",
        imageCacheMaxAge: pt,
        metadataCacheKey: Y,
        metadataCache: W,
        metadataCacheIdentityPartition: K,
        metadataCachePolicyRevision: G,
        redirectTrace: null
      };
    },
    cleanupPlaybackInfoResponseCache(a = B()) {
      r.cleanup(a);
    },
    buildPlaybackInfoAuthSignature(a, n = null) {
      const s = a?.requestUrl instanceof URL ? a.requestUrl : null, i = n?.newHeaders || a?.request?.headers || null, c = bs(i), l = Ss(ke(i, "Cookie"), wa);
      return Es([
        s ? ie(s.searchParams.get("api_key") || s.searchParams.get("ApiKey") || s.searchParams.get("X-Emby-Token") || s.searchParams.get("X-MediaBrowser-Token") || "") : "",
        c?.token ? ie(c.token) : "",
        c?.deviceId ? ie(c.deviceId) : "",
        ke(i, "Authorization") ? ie(ke(i, "Authorization")) : "",
        ke(i, "X-Emby-Authorization") ? ie(ke(i, "X-Emby-Authorization")) : "",
        ke(i, "X-MediaBrowser-Authorization") ? ie(ke(i, "X-MediaBrowser-Authorization")) : "",
        l ? ie(l) : ""
      ]);
    },
    buildPlaybackInfoCacheKey(a, n = null) {
      if (a?.requestTraits?.isPlaybackInfoRequest !== !0) return "";
      if (a.playbackInfoCacheEnabled !== !0 || Number(a.playbackInfoCacheTtlSec) <= 0)
        return a.playbackInfoCacheState = "skip", a.playbackInfoCacheKey = "", "";
      const s = a.requestMethod;
      if (s !== "GET" && s !== "HEAD" && n?.preparedBodyMode !== "buffered")
        return a.playbackInfoCacheState = "skip", a.playbackInfoCacheKey = "", "";
      const i = n?.preparedBodyMode === "buffered" ? String(n?.preparedBodyText || Tn(n?.preparedBody)) : "", c = `playback-info:${Es([
        String(a?.nodeName || "").trim(),
        String(a?.nodeDerivedCacheRevision || "").trim(),
        s,
        String(a?.proxyPath || "").trim(),
        String(a?.requestUrl?.search || "").trim(),
        i ? ie(i) : "",
        e.buildPlaybackInfoAuthSignature(a, n),
        Qt(a?.effectivePlaybackInfoMode),
        String(a?.playbackInfoRewriteUrlMode || "relative")
      ])}`;
      return a.playbackInfoCacheKey = c, c;
    },
    async storePlaybackInfoResponseCache(a, n, s = null, i = null) {
      if (a?.requestTraits?.isPlaybackInfoRequest !== !0) return !1;
      const c = a.playbackInfoCacheKey || e.buildPlaybackInfoCacheKey(a, s);
      return !c || !xt(i) || i.response !== n ? !1 : r.set(c, i, {
        nodeName: String(a?.nodeName || "").trim().toLowerCase(),
        nodeRevision: String(a?.nodeDerivedCacheRevision || "").trim(),
        playbackInfoRewrite: String(a?.playbackInfoRewrite || "").trim(),
        ttlMs: Math.max(0, Number(a?.playbackInfoCacheTtlSec) || 0) * 1e3
      });
    },
    async tryServePlaybackInfoResponseCache(a, n = null) {
      if (a?.requestTraits?.isPlaybackInfoRequest !== !0) return null;
      const s = e.buildPlaybackInfoCacheKey(a, n);
      if (!s) return null;
      const i = r.get(s);
      if (!i)
        return a.playbackInfoCacheState = a.playbackInfoCacheState === "skip" ? "skip" : "miss", null;
      const c = i.metadata, l = i.representation, u = l.response, d = l.bodyText;
      a.playbackInfoCacheState = "hit", a.playbackInfoRewrite = String(c?.playbackInfoRewrite || a?.playbackInfoRewrite || "").trim();
      const f = e.buildProxyResponseHeaders(u, a.request, a.dynamicCors, a.finalOrigin, a.requestTraits, {
        enableH3: a.enableH3,
        forceH1: a.forceH1,
        imageCacheMaxAge: a.imageCacheMaxAge
      }), m = e.classifyProxyLogCategory(a.requestTraits);
      return e.shouldRecordAccessLog(a, {
        statusCode: u.status,
        category: m
      }) && e.recordAccessLog(a, {
        statusCode: u.status,
        category: m,
        errorDetail: e.appendLogDiagnosticDetail(e.extractProxyErrorDetail(u), e.buildRuntimeDiagnosticDetail(a)),
        detailJson: e.buildStructuredLogDetail(a, { statusCode: u.status }, {
          deliveryMode: "proxy",
          redirectMode: "playback_info_cache",
          decisionReason: "playback_info_cache_hit",
          playbackInfoCache: a.playbackInfoCacheState,
          playbackInfoCacheTtlSec: a.playbackInfoCacheTtlSec,
          upstreamStatus: u.status
        }),
        outboundColo: ""
      }), new Response(a.requestMethod === "HEAD" ? null : d, {
        status: u.status,
        statusText: u.statusText,
        headers: f
      });
    }
  };
}
var Gh = /^n([A-Za-z0-9_-]+)\.(.+)$/, Vh = 8, pa = 12e3, eo = 8 * 1024 * 1024, jh = /^\/(?:emby\/|mediabrowser\/)?(?:(?:users\/[^/]+\/)?items(?:\/\d+)?|shows\/[^/]+\/episodes)$/i;
function Oo(o = "") {
  return jh.test(String(o || "").trim());
}
function an(o) {
  return !o || o.requestMethod !== "GET" || o.requestTraits?.isPlaybackCriticalRequest === !0 || o.playbackRelayTargetUrl instanceof URL ? !1 : Oo(o.proxyPath);
}
function qh(o) {
  const e = Ea(o);
  if (!e) return null;
  let t = null;
  try {
    t = JSON.parse(tr(e.itemId));
  } catch {
    return null;
  }
  if (!Array.isArray(t) || t.length < 2) return null;
  const r = String(t[0] ?? "").trim(), a = String(t[1] ?? "").trim();
  return !r || !a ? null : {
    peerName: e.peerName,
    itemId: r,
    mediaSourceId: a
  };
}
function Xh(o) {
  const e = o?.request?.headers;
  if (!e) return !1;
  for (const r of [
    "Authorization",
    "X-Emby-Authorization",
    "X-Emby-Token",
    "X-MediaBrowser-Token"
  ]) if (String(e.get(r) || "").trim()) return !0;
  const t = o?.request ? new URL(o.request.url).searchParams : o?.requestUrl?.searchParams;
  if (!t) return !1;
  for (const r of ["api_key", "ApiKey"]) if (String(t.get(r) || "").trim()) return !0;
  return !1;
}
function Ea(o) {
  const e = Gh.exec(String(o ?? "").trim());
  if (!e) return null;
  const t = tr(e[1]);
  return t ? {
    peerName: t,
    itemId: e[2]
  } : null;
}
function Yh(o, e) {
  return `n${ta(o)}.${String(e ?? "")}`;
}
function vo(o, e, t = 0) {
  if (o == null || t > 6) return o;
  if (Array.isArray(o)) return o.map((a) => vo(a, e, t + 1));
  if (!H(o)) return o;
  const r = {};
  for (const [a, n] of Object.entries(o)) {
    if (typeof n == "string" && /id$/i.test(a) && n.trim()) {
      r[a] = e + n.trim();
      continue;
    }
    if (Array.isArray(n) || H(n)) {
      r[a] = vo(n, e, t + 1);
      continue;
    }
    r[a] = n;
  }
  return r;
}
async function Aa(o, e, t) {
  const r = await nn(o, e, t);
  if (r.exceeded) return null;
  try {
    return JSON.parse(Tn(r.bodyBytes));
  } catch {
    return null;
  }
}
function Ya(o, e, t = !1) {
  const r = Mi(o, e, t);
  return r ? Mo(r, e?.mediaAuthMode) : null;
}
function Jh(o = {}, e = {}) {
  const { fetchPort: t, nodeRepository: r } = o, a = /* @__PURE__ */ new WeakMap();
  return {
    readOwnAggregationPayload(n, s) {
      return a.has(n) || a.set(n, Aa(n.clone(), eo, s)), a.get(n);
    },
    async resolvePeerAggregationNodes(n, s) {
      if (!(n?.requestTraits?.isPlaybackInfoRequest === !0 && n?.requestMethod === "GET") && !an(n)) return [];
      if (n.node?.tmdbAggregationEnabled !== !0) return [];
      if (!Xh(n)) return [];
      const i = Ft(s);
      if (!i) return [];
      let c = null;
      try {
        c = await r.getNodesSummaryIndex(i);
      } catch {
        return [];
      }
      if (!Array.isArray(c) || !c.length) return [];
      const l = String(n.nodeName || "").trim().toLowerCase(), u = [];
      for (const d of c) {
        if (u.length >= Vh) break;
        const f = String(d?.name || "").trim().toLowerCase();
        !f || f === l || d?.tmdbAggregationEnabled === !0 && u.push({ name: f });
      }
      return u;
    },
    async readPeerAggregationNode(n, s) {
      if (!n) return null;
      try {
        return await r.getNode(n, s);
      } catch {
        return null;
      }
    },
    async resolvePeerAggregationTargets(n) {
      if (!n) return [];
      const s = Array.isArray(n.lines) ? n.lines : [], i = String(n.activeLineId || "").trim(), c = i ? s.find((u) => String(u?.id || "").trim() === i) : null, l = c ? [c, ...s.filter((u) => u !== c)] : s;
      return (l.length ? l.map((u) => u.target) : String(n.target || "").split(",").map((u) => u.trim()).filter(Boolean)).map((u) => Ba(u)).filter(Ze);
    },
    async readAggregationJsonUrl(n, s, i, c = "", l = {}) {
      i?.throwIfAborted();
      const u = Bo.get(Ft(l)), d = JSON.stringify([
        ia(l),
        n.href,
        [...s]
      ]);
      return await It(Fi(u.jsonFlights, d, async () => {
        const f = Va(null, pa);
        try {
          const m = await It(t.fetchRequest(n, {
            method: "GET",
            headers: s,
            signal: f.signal,
            redirect: "manual"
          }), f.signal);
          if (!m?.ok || !Ua(m.headers.get("Content-Type"))) {
            console.log("[peer_fanout_probe]", {
              peer: c,
              status: Number(m?.status || 0),
              reason: m?.ok ? "invalid_json_response" : "upstream_rejected"
            });
            try {
              Promise.resolve(m?.body?.cancel()).catch(() => {
              });
            } catch {
            }
            return null;
          }
          return await Aa(m, eo, f.signal);
        } finally {
          f.dispose();
        }
      }), i);
    },
    async queryPeerAggregation(n, s, i, c, l, u) {
      l.throwIfAborted();
      const d = await It(rn(n, i.env, i.currentConfig, s.aggregationMode), l), f = d || n;
      let m = await e.readAggregationJsonUrl(f, c, l, u, i.env);
      if (qt(s.aggregationMode) === "auto" && d && Ke(d.searchParams, "SearchTerm") && !Ke(d.searchParams, "todbvs") && ws(n, m)) {
        l.throwIfAborted();
        const p = await It(rn(n, i.env, i.currentConfig, "emos"), l);
        if (p && p.search !== f.search) {
          const h = await e.readAggregationJsonUrl(p, c, l, u, i.env);
          Array.isArray(h?.Items) && (m = h);
        }
      }
      return console.log("[peer_fanout_probe]", {
        peer: u,
        status: m ? 200 : 0,
        items: Array.isArray(m?.Items) ? m.Items.length : "noItems"
      }), m;
    },
    async maybeFallbackTmdbSearchResponse(n, s, i) {
      if (!an(n) || n.node?.tmdbAggregationEnabled !== !0 || qt(n.node?.aggregationMode) !== "auto" || !Ke(n.rawRequestUrl?.searchParams, "AnyProviderIdEquals") || !Ke(n.requestUrl?.searchParams, "SearchTerm") || Ke(n.requestUrl?.searchParams, "AnyProviderIdEquals") || Ke(n.requestUrl?.searchParams, "todbvs") || s.response?.status !== 200) return s;
      const c = Va(n.request?.signal, pa);
      try {
        const l = await It(e.readOwnAggregationPayload(s.response, c.signal), c.signal);
        if (!ws(n.rawRequestUrl, l)) return s;
        c.signal.throwIfAborted();
        const u = await It(rn(n.rawRequestUrl, n.env, n.currentConfig, "emos"), c.signal);
        if (!u) return s;
        const d = s.activeTargetBase || s.activeTargetRecord;
        if (!d) return s;
        const f = Ye(d, n.proxyPath);
        f.search = u.search;
        const m = await i(f, { method: "GET" }), p = await e.readAggregationJsonUrl(f, m.headers, c.signal, n.nodeName, n.env);
        if (!Array.isArray(p?.Items) || !p.Items.length) return s;
        const h = new Headers(s.response.headers);
        for (const y of [
          "Content-Length",
          "Content-Encoding",
          "Transfer-Encoding",
          "ETag",
          "Last-Modified"
        ]) h.delete(y);
        h.set("Cache-Control", "no-store");
        try {
          Promise.resolve(s.response.body?.cancel()).catch(() => {
          });
        } catch {
        }
        const g = new Response(JSON.stringify(p), { headers: h });
        return a.set(g, Promise.resolve(p)), {
          ...s,
          response: g,
          finalUrl: f
        };
      } catch {
        return console.log("[tmdb_search_fallback]", { reason: c.signal.aborted ? "timeout_or_cancelled" : "lookup_failed" }), s;
      } finally {
        c.dispose();
      }
    },
    async fetchPeerAggregationPayload(n, s, i, c, l) {
      try {
        return await e.fetchPeerAggregationPayloadUnsafe(n, s, i, c, l);
      } catch {
        return console.log("[peer_aggregation_skip]", {
          peer: s?.name,
          reason: "lookup_failed"
        }), null;
      }
    },
    async fetchPeerAggregationPayloadUnsafe(n, s, i, c, l) {
      const u = await e.readPeerAggregationNode(s.name, i);
      if (!u || u.tmdbAggregationEnabled !== !0) return null;
      const d = Ya(n.request, u, !0);
      if (!d)
        return console.log("[peer_aggregation_skip]", {
          peer: s.name,
          reason: "missing_peer_credentials"
        }), null;
      const f = await e.resolvePeerAggregationTargets(u), m = Va(n.request?.signal, pa);
      try {
        for (const p of f) try {
          m.signal.throwIfAborted();
          const h = await Ls({
            rawUrl: n.rawRequestUrl || n.requestUrl,
            proxyPath: n.proxyPath,
            ownTarget: c?.activeTargetBase || c?.activeTargetRecord,
            peerTarget: p,
            ownHeaders: l.headers,
            peerHeaders: d,
            buildUrl: Ye,
            readJson: (y, _) => _ === l.headers ? It(l.read(y), m.signal) : Ke(y.searchParams, "AnyProviderIdEquals") ? e.queryPeerAggregation(y, u, n, _, m.signal, s.name) : e.readAggregationJsonUrl(y, _, m.signal, s.name, i)
          }), g = await e.queryPeerAggregation(h, u, n, d, m.signal, s.name);
          if (Array.isArray(g?.Items)) return g;
        } catch (h) {
          const g = m.signal.aborted ? "timeout_or_cancelled" : [
            "unmapped_user",
            "unmapped_scope",
            "ambiguous_scope",
            "unsupported_scope"
          ].includes(h?.message) ? h.message : "lookup_failed";
          if (console.log("[peer_aggregation_skip]", {
            peer: s.name,
            reason: g
          }), m.signal.aborted) break;
        }
        return null;
      } finally {
        m.dispose();
      }
    },
    async buildPeerAggregationMergedResponse(n, s, i) {
      const c = await e.resolvePeerAggregationNodes(n, s);
      if (!c.length)
        return an(n) && console.log("[peer_aggregation_skip]", {
          reason: "no_peers",
          path: String(n?.proxyPath || ""),
          node: String(n?.node?.name || "")
        }), null;
      const l = i?.response;
      if (!l || Number(l.status) !== 200 || !String(l.headers.get("Content-Type") || "").toLowerCase().includes("application/json")) return null;
      let u = null;
      try {
        u = await e.readOwnAggregationPayload(l, n.request?.signal);
      } catch {
        u = null;
      }
      if (!H(u) || !Array.isArray(u.Items)) return null;
      const d = Va(n.request?.signal, pa), f = /* @__PURE__ */ new Map(), m = {
        headers: Ya(n.request, n.node),
        read(y) {
          const _ = y.href;
          return f.has(_) || f.set(_, e.readAggregationJsonUrl(y, m.headers, d.signal, n.nodeName, s)), f.get(_);
        }
      };
      let p;
      try {
        p = await Promise.all(c.map((y) => e.fetchPeerAggregationPayload(n, y, s, i, m)));
      } finally {
        d.dispose();
      }
      const h = [...u.Items];
      let g = 0;
      return c.forEach((y, _) => {
        const S = p[_];
        if (!H(S) || !Array.isArray(S.Items)) return;
        const E = Yh(y.name, "");
        for (const b of S.Items)
          H(b) && (h.push(vo(b, E)), g += 1);
      }), console.log("[peer_list_merge]", {
        path: String(n?.proxyPath || ""),
        peers: c.length,
        ownItems: u.Items.length,
        added: g,
        peerItems: c.map((y, _) => {
          const S = p[_];
          return `${y.name}:${Array.isArray(S?.Items) ? S.Items.length : "null"}`;
        }).join(",")
      }), g ? {
        payload: {
          ...u,
          Items: h,
          TotalRecordCount: Number(u.TotalRecordCount || u.Items.length || 0) + g
        },
        addedCount: g,
        peerCount: c.length
      } : null;
    },
    resolvePeerAggregationItemRoute(n, s) {
      const i = [...n?.requestUrl?.searchParams?.getAll?.("Ids") || [], va(n?.proxyPath || "")];
      for (const c of i) {
        const l = Ea(c);
        if (l) return l;
      }
      return null;
    },
    shouldAggregatePeerPlaybackVersions(n) {
      return n?.node?.tmdbAggregationEnabled !== !0 || n?.requestTraits?.isPlaybackInfoRequest !== !0 || n.requestMethod !== "GET" ? !1 : !String(n?.requestUrl?.searchParams?.get?.("MediaSourceId") || "").trim();
    },
    async fetchOwnPlaybackItemIdentity(n, s, i) {
      const c = va(n?.proxyPath || "") || nt(/^\/(?:emby|mediabrowser)\/Items\/([^/]+)/i.exec(String(n?.proxyPath || ""))?.[1] || "");
      if (!c) return null;
      const l = i?.activeTargetBase || i?.activeTargetRecord;
      if (!l) return null;
      const u = Ye(l, `/Items/${encodeURIComponent(c)}`);
      u.searchParams.set("Fields", "ProviderIds,ProductionYear,SeriesName,IndexNumber,ParentIndexNumber");
      const d = Ya(n.request, n.node);
      try {
        const f = await e.readAggregationJsonUrl(u, d, n.request?.signal, n.nodeName, s);
        return H(f) ? {
          Id: f.Id,
          Type: f.Type,
          Name: f.Name,
          ProductionYear: f.ProductionYear,
          ProviderIds: f.ProviderIds,
          SeriesName: f.SeriesName,
          IndexNumber: f.IndexNumber,
          ParentIndexNumber: f.ParentIndexNumber
        } : null;
      } catch {
        return null;
      }
    },
    async fetchPeerPlaybackVersionPayload(n, s, i, c) {
      try {
        const l = await e.readPeerAggregationNode(s.name, i);
        if (!l || l.tmdbAggregationEnabled !== !0) return null;
        const u = await e.resolvePeerAggregationTargets(l);
        if (!u.length) return null;
        const d = Ya(n.request, l, !0);
        if (!d)
          return console.log("[peer_aggregation_skip]", {
            peer: s.name,
            reason: "missing_peer_credentials"
          }), null;
        const f = new AbortController(), m = setTimeout(() => f.abort("peer_playback_timeout"), pa);
        try {
          for (const p of u) {
            const h = await e.findPeerItemIdForIdentity(p, d, c, f.signal, {
              execution: n,
              peerNode: l,
              peerName: s.name
            });
            if (!h) continue;
            const g = Ye(p, `/Items/${encodeURIComponent(h)}/PlaybackInfo`), y = new URL(n.rawRequestUrl || n.requestUrl);
            vr(y.searchParams, "MediaSourceId"), g.search = (await Ls({
              rawUrl: y,
              proxyPath: "/Items",
              peerTarget: p,
              peerHeaders: d,
              buildUrl: Ye,
              readJson: (E, b) => e.readAggregationJsonUrl(E, b, f.signal, s.name, i)
            })).search;
            const _ = await t.fetchRequest(g, {
              method: "GET",
              headers: d,
              signal: f.signal,
              redirect: "manual"
            });
            if (!_?.ok) continue;
            const S = await Aa(_, eo);
            if (H(S) && Array.isArray(S.MediaSources)) return {
              itemId: h,
              payload: S,
              secret: String(l.secret || "")
            };
          }
          return null;
        } finally {
          clearTimeout(m);
        }
      } catch {
        return console.warn("peer playback aggregation skipped:", s?.name, "lookup_failed"), null;
      }
    },
    async findPeerItemIdForIdentity(n, s, i, c, l = {}) {
      const u = Bn(i);
      if (!u.size) return "";
      const d = Ye(n, "/Items"), f = d.searchParams;
      f.set("Recursive", "true"), f.set("Fields", "ProviderIds,ProductionYear,SeriesName,IndexNumber,ParentIndexNumber"), i?.Type && f.set("IncludeItemTypes", i.Type);
      let m = "", p = "";
      for (const y of u) {
        if (y.startsWith("tmdb:")) {
          m = y.slice(5);
          break;
        }
        if (y.startsWith("episode:") && !p) {
          const _ = y.slice(8), S = _.lastIndexOf(":"), E = _.lastIndexOf(":", S - 1);
          E > 0 && (p = _.slice(0, E));
        }
      }
      m ? (f.set("AnyProviderIdEquals", `tmdb.${m}`), f.set("Limit", "20")) : p ? (f.set("SearchTerm", p), f.set("IncludeItemTypes", "Episode"), f.set("Limit", "200")) : (f.set("SearchTerm", String(i?.Name || "")), f.set("Limit", "20"));
      const h = l.execution ? await e.queryPeerAggregation(d, l.peerNode, l.execution, s, c, l.peerName) : await e.readAggregationJsonUrl(d, s, c), g = Array.isArray(h?.Items) ? h.Items : [];
      for (const y of g) {
        if (!H(y)) continue;
        const _ = Bn(y);
        for (const S of _) {
          if (!u.has(S)) continue;
          const E = String(y.Id ?? "").trim();
          if (E) return E;
        }
      }
      return "";
    },
    async buildPeerPlaybackVersionResponse(n, s, i) {
      if (!e.shouldAggregatePeerPlaybackVersions(n)) return null;
      const c = i?.playbackInfoRepresentation;
      if (!xt(c)) return null;
      const l = await e.resolvePeerAggregationNodes(n, s);
      if (!l.length) return null;
      const u = await e.fetchOwnPlaybackItemIdentity(n, s, i);
      if (!u || !Bn(u).size) return null;
      const d = await Promise.all(l.map((p) => e.fetchPeerPlaybackVersionPayload(n, p, s, u))), f = [];
      l.forEach((p, h) => {
        f.push(...du(d[h]?.payload, p.name, d[h]?.itemId, (g, y) => bg(n?.requestUrl, g, d[h]?.secret || "", y)));
      });
      const m = mu(c.payload, f);
      return console.log("[peer_playback_version]", {
        peers: l.length,
        versions: m ? m.addedVersionCount : 0,
        ownSources: Array.isArray(c.payload.MediaSources) ? c.payload.MediaSources.length : 0
      }), m;
    }
  };
}
function Qh(o = {}, e = {}) {
  return {
    parsePlaybackSessionControlPayload(t, r = null) {
      if (t?.playbackSessionControlPayload) return t.playbackSessionControlPayload;
      const a = t?.requestUrl instanceof URL ? t.requestUrl : null, n = {};
      if (a) for (const [u, d] of a.searchParams.entries()) {
        const f = String(u || "").trim().toLowerCase();
        !f || n[f] !== void 0 || (n[f] = d);
      }
      const s = {
        query: n,
        body: {},
        parseError: !1,
        parseMode: "query_only",
        parseErrorReason: ""
      }, i = t.requestMethod;
      if (i === "GET" || i === "HEAD")
        return t && (t.playbackSessionControlPayload = s), s;
      if (r?.preparedBodyMode === "stream")
        return s.parseError = !0, s.parseMode = "stream", s.parseErrorReason = "unbuffered_body", t && (t.playbackSessionControlPayload = s), s;
      const c = String(r?.preparedBodyText || Tn(r?.preparedBody));
      if (!c.trim())
        return t && (t.playbackSessionControlPayload = s), s;
      const l = String(r?.newHeaders?.get("Content-Type") || t?.request?.headers?.get("Content-Type") || "").toLowerCase().split(";", 1)[0].trim();
      try {
        if (l === "application/json" || l === "text/json" || l === "text/plain" || /^application\/[a-z0-9!#$&^_.+-]+\+json$/i.test(l)) {
          const u = JSON.parse(c);
          if (!H(u)) throw new TypeError("playback_control_body_not_object");
          s.body = _c(u), s.parseMode = l === "text/plain" ? "text_plain_json" : "json";
        } else if (l === "application/x-www-form-urlencoded") {
          const u = {};
          for (const [d, f] of new URLSearchParams(c).entries()) {
            const m = String(d || "").trim().toLowerCase();
            !m || u[m] !== void 0 || (u[m] = f);
          }
          s.body = u, s.parseMode = "form";
        } else
          s.parseError = !0, s.parseMode = "unsupported", s.parseErrorReason = "unsupported_content_type";
      } catch {
        s.parseError = !0, s.parseMode = l === "text/plain" ? "text_plain_invalid" : "invalid", s.parseErrorReason = "invalid_body";
      }
      return t && (t.playbackSessionControlPayload = s), s;
    },
    resolvePlaybackProgressSessionKey(t, r = null) {
      const a = e.parsePlaybackSessionControlPayload(t, r), n = (h = []) => {
        const g = Bs(a.query, h);
        if (String(g || "").trim()) return String(g).trim();
        const y = Bs(a.body, h);
        return String(y || "").trim();
      }, s = n(["SessionId"]), i = n(["PlaySessionId"]), c = n(["DeviceId"]), l = n(["ItemId"]), u = String(t?.nodeName || "unknown").trim().toLowerCase() || "unknown";
      let d = "", f = "", m = "weak";
      if (s)
        d = `session:${s}`, f = `session:${s}`, m = "strong";
      else if (i)
        d = `play:${i}`, f = `play:${i}`, m = "strong";
      else if (c)
        d = `device-item:${c}:${l}`, f = `device:${c}`;
      else {
        const h = t?.request?.headers;
        d = `fallback:${Hn([
          h?.get?.("Authorization"),
          h?.get?.("X-Emby-Token"),
          h?.get?.("X-MediaBrowser-Token"),
          h?.get?.("X-Emby-Device-Id"),
          c,
          t?.clientIp,
          l
        ].map((g) => String(g || "").trim()).join("|"))}`, f = d;
      }
      const p = Hn(`${u}|${f}`);
      return {
        sessionKey: `${u}|${d}`,
        sessionIdentityFingerprint: p,
        sessionFingerprint: Hn(`${p}|${l}`),
        sessionStrength: m,
        itemId: l,
        parseError: a.parseError === !0
      };
    }
  };
}
function Zh(o = {}, e = {}) {
  return {
    buildPlaybackProgressRelayEntry(t = 0, r = null) {
      return {
        lastForwardAt: 0,
        lastTouchedAt: B(),
        intervalMs: Math.max(0, Number(t) || 0),
        waitUntilCtx: r || null,
        nodeName: "",
        nodeRevision: "",
        pendingSnapshot: null,
        scheduledFlushAt: 0,
        scheduledPromise: null,
        cancelScheduledDelay: null,
        activeFlushPromise: null,
        terminalState: "",
        terminalAt: 0,
        terminalTombstoneUntil: 0
      };
    },
    getPlaybackProgressRelayTerminalTtlMs(t = 0) {
      return Math.max(600 * 1e3, Math.max(1, Number(t) || 0) * 20);
    },
    isPlaybackProgressRelayTerminal(t, r = B()) {
      return !t || String(t.terminalState || "").trim().toLowerCase() !== "stopped" ? !1 : Number(t.terminalTombstoneUntil || 0) > r;
    },
    markPlaybackProgressRelayStopped(t, r) {
      const a = oe.PlaybackProgressRelay;
      if (!(a instanceof Map) || !t) return null;
      const n = Math.max(0, Number(r?.videoProgressForwardIntervalSec) || 0) * 1e3, s = a.get(t) || e.buildPlaybackProgressRelayEntry(n, r?.ctx || null), i = B();
      s.intervalMs = n > 0 ? n : Math.max(0, Number(s.intervalMs) || 0), s.waitUntilCtx = r?.ctx || s.waitUntilCtx || null, s.nodeName = String(r?.nodeName || s.nodeName || "").trim().toLowerCase(), s.nodeRevision = String(r?.nodeDerivedCacheRevision || s.nodeRevision || "").trim();
      try {
        s.cancelScheduledDelay?.();
      } catch {
      }
      return s.cancelScheduledDelay = null, s.scheduledPromise = null, s.pendingSnapshot = null, s.scheduledFlushAt = 0, s.terminalState = "stopped", s.terminalAt = i, s.terminalTombstoneUntil = i + e.getPlaybackProgressRelayTerminalTtlMs(s.intervalMs), s.lastTouchedAt = i, yi(t, s) ? s : (wo(s), null);
    },
    cleanupPlaybackProgressRelay(t = B()) {
      const r = oe.PlaybackProgressRelay;
      if (!(r instanceof Map) || r.size <= 0) return;
      const a = Math.max(3e4, Math.max(1, Number(uc) || 1) * 2e4);
      for (const [s, i] of r) {
        const c = Number(i?.lastTouchedAt || i?.lastForwardAt || 0) || 0, l = !!i?.pendingSnapshot || !!i?.activeFlushPromise, u = Number(i?.terminalTombstoneUntil || 0) || 0;
        if (u > 0) {
          !l && u <= t && lr(s);
          continue;
        }
        !l && c > 0 && c + a <= t && lr(s);
      }
      const n = Math.max(1, Number($.Defaults.VideoProgressForwardSessionMax) || 1);
      for (; r.size > n; ) {
        let s = "";
        for (const [i, c] of r) if (!c?.activeFlushPromise) {
          s = i;
          break;
        }
        if (!s) break;
        lr(s);
      }
    },
    buildPlaybackProgressSnapshot(t, r, a, n) {
      if (!t || !r || typeof a != "function" || !Ze(n) || (r.preparedBodyMode === "buffered" && Number(r.preparedBody?.byteLength) || 0) > Nd) return null;
      const s = r.preparedBodyMode === "buffered" && r.preparedBody ? r.preparedBody.slice(0) : r.preparedBody;
      return {
        ctx: t.ctx,
        nodeName: String(t.nodeName || "").trim().toLowerCase(),
        nodeRevision: String(t.nodeDerivedCacheRevision || "").trim(),
        targetRecord: n,
        proxyPath: String(t.proxyPath || "/"),
        requestUrl: new URL(t.requestUrl.toString()),
        buildFetchOptions: a,
        requestMethod: String(t.request?.method || "POST").toUpperCase(),
        preparedBodyMode: r.preparedBodyMode,
        preparedBody: s,
        upstreamTimeoutMs: t.upstreamTimeoutMs
      };
    },
    schedulePlaybackProgressRelayFlush(t, r) {
      if (!r?.pendingSnapshot || r?.scheduledFlushAt > 0 || e.isPlaybackProgressRelayTerminal(r)) return;
      const a = Math.max(0, Number(r.intervalMs) || 0);
      if (a <= 0) return;
      const n = Math.max(B(), Number(r.lastForwardAt) || 0) + a;
      r.scheduledFlushAt = n, r.lastTouchedAt = B();
      const s = Lu(Math.max(0, n - B())), i = (async () => {
        if (!await s.promise) return;
        const l = oe.PlaybackProgressRelay.get(t);
        !l || l !== r || Number(l.scheduledFlushAt) !== n || (l.scheduledFlushAt = 0, await e.flushPlaybackProgressRelayEntry(t, {
          background: !0,
          attachToCtx: !1
        }));
      })().finally(() => {
        r.scheduledPromise === i && (r.scheduledPromise = null, r.cancelScheduledDelay = null);
      });
      r.scheduledPromise = i, r.cancelScheduledDelay = s.cancel;
      const c = r.waitUntilCtx || r.pendingSnapshot?.ctx || null;
      c?.waitUntil && c.waitUntil(i);
    },
    async forwardPlaybackProgressSnapshot(t) {
      if (!t) return null;
      const r = await e.performUpstreamFetch(t.targetRecord, t.proxyPath, t.requestUrl, t.buildFetchOptions, {
        method: t.requestMethod,
        bodyMode: t.preparedBodyMode,
        body: t.preparedBody,
        timeoutMs: t.upstreamTimeoutMs
      });
      try {
        try {
          await r.response.body?.cancel?.();
        } catch {
        }
      } finally {
        try {
          r.releaseFetchController?.();
        } catch {
        }
      }
      return r.response;
    },
    async flushPlaybackProgressRelayEntry(t, r = {}) {
      const a = oe.PlaybackProgressRelay, n = a.get(t);
      if (!n || e.isPlaybackProgressRelayTerminal(n)) return !1;
      if (n.activeFlushPromise) {
        if (r.background === !0) return !1;
        try {
          await n.activeFlushPromise;
        } catch {
        }
      }
      if (!n.pendingSnapshot) return !1;
      const s = n.pendingSnapshot;
      n.pendingSnapshot = null;
      try {
        n.cancelScheduledDelay?.();
      } catch {
      }
      n.cancelScheduledDelay = null, n.scheduledPromise = null, n.scheduledFlushAt = 0, n.lastForwardAt = B(), n.lastTouchedAt = n.lastForwardAt;
      const i = (async () => {
        try {
          return await e.forwardPlaybackProgressSnapshot(s), !0;
        } catch {
          const c = a.get(t);
          return c && c === n && !c.pendingSnapshot && (c.pendingSnapshot = s, c.lastForwardAt = B(), c.lastTouchedAt = c.lastForwardAt), !1;
        } finally {
          const c = a.get(t);
          c && c === n && (c.activeFlushPromise = null, c.lastTouchedAt = B(), c.pendingSnapshot && e.schedulePlaybackProgressRelayFlush(t, c));
        }
      })();
      return n.activeFlushPromise = i, r.attachToCtx === !0 && n.waitUntilCtx?.waitUntil && n.waitUntilCtx.waitUntil(i), await i === !0;
    },
    async flushPlaybackProgressBeforeStopped(t) {
      const r = String(t?.progressForwardSessionKey || "").trim();
      if (!r) return !1;
      const a = oe.PlaybackProgressRelay.get(r);
      if (!a) return !1;
      if (a.activeFlushPromise) try {
        await a.activeFlushPromise;
      } catch {
      }
      if (!a.pendingSnapshot) return !1;
      try {
        a.cancelScheduledDelay?.();
      } catch {
      }
      return a.cancelScheduledDelay = null, a.scheduledPromise = null, a.scheduledFlushAt = 0, await e.flushPlaybackProgressRelayEntry(r, {
        background: !1,
        attachToCtx: !1
      });
    },
    buildPlaybackProgressThrottleResponse(t) {
      const r = e.buildEdgeResponseHeaders(t.finalOrigin), a = e.classifyProxyLogCategory(t.requestTraits);
      return e.shouldRecordAccessLog(t, {
        statusCode: 204,
        category: a
      }) && e.recordAccessLog(t, {
        statusCode: 204,
        category: a,
        errorDetail: e.buildProgressRelayDiagnosticDetail(t),
        detailJson: e.buildStructuredLogDetail(t, { statusCode: 204 }, {
          deliveryMode: "proxy",
          redirectMode: "progress_relay",
          decisionReason: t.progressForwardMode || "progress_relay_throttled",
          progressRelayMode: t.progressForwardMode,
          progressIntervalSec: t.videoProgressForwardIntervalSec,
          upstreamStatus: 204
        }),
        outboundColo: t.defaultOutboundColo || ""
      }), new Response(null, {
        status: 204,
        statusText: "No Content",
        headers: r
      });
    },
    async maybeHandlePlaybackProgressRelay(t, r, a, n = []) {
      if (t?.requestTraits?.isPlaybackSessionControlRequest !== !0) return null;
      const s = Math.max(0, Number(t?.videoProgressForwardIntervalSec) || 0);
      if (t?.videoProgressForwardEnabled !== !0 || s <= 0 || !t?.ctx?.waitUntil)
        return t.progressForwardMode = "pass_through", null;
      const i = e.resolvePlaybackProgressSessionKey(t, r);
      if (t.progressForwardSessionKey = String(i.sessionKey || "").trim(), i.parseError)
        return t.progressForwardMode = "parse_bypass", null;
      if (t.requestTraits.isPlaybackStartedRequest === !0)
        return t.progressForwardMode = "started_passthrough", t.progressForwardSessionKey && lr(t.progressForwardSessionKey), null;
      if (t.requestTraits.isPlaybackStoppedRequest === !0)
        return t.progressForwardMode = await e.flushPlaybackProgressBeforeStopped(t) ? "flush_before_stopped" : "stopped_passthrough", t.progressForwardSessionKey && e.markPlaybackProgressRelayStopped(t.progressForwardSessionKey, t), null;
      if (t.requestTraits.isPlaybackProgressRequest !== !0) return null;
      const c = Ze(n[0]) ? n[0] : null;
      if (!c)
        return t.progressForwardMode = "pass_through", null;
      if (t.requestMethod !== "GET" && t.requestMethod !== "HEAD" && r?.preparedBodyMode !== "buffered")
        return t.progressForwardMode = "unbuffered_bypass", null;
      const l = oe.PlaybackProgressRelay;
      e.cleanupPlaybackProgressRelay();
      const u = t.progressForwardSessionKey || `fallback:${t.clientIp}:${t.proxyPath}`;
      let d = l.get(u);
      d || (d = e.buildPlaybackProgressRelayEntry(s * 1e3, t.ctx)), d.intervalMs = s * 1e3, d.waitUntilCtx = t.ctx, d.nodeName = String(t.nodeName || "").trim().toLowerCase(), d.nodeRevision = String(t.nodeDerivedCacheRevision || "").trim();
      const f = B();
      if (d.lastTouchedAt = f, e.isPlaybackProgressRelayTerminal(d, f))
        return t.progressForwardMode = "late_progress_dropped_after_stopped", e.buildPlaybackProgressThrottleResponse(t);
      if (d.terminalState = "", d.terminalAt = 0, d.terminalTombstoneUntil = 0, !yi(u, d))
        return wo(d), t.progressForwardMode = "capacity_bypass", null;
      if (!(d.lastForwardAt > 0 && f - d.lastForwardAt < d.intervalMs) && !d.activeFlushPromise && !d.pendingSnapshot)
        return d.pendingSnapshot = null, d.scheduledFlushAt = 0, d.lastForwardAt = f, t.progressForwardMode = "forward_now", null;
      const m = e.buildPlaybackProgressSnapshot(t, r, a, c);
      return m ? (d.pendingSnapshot = m, d.lastTouchedAt = f, t.progressForwardMode = "throttled_204", e.schedulePlaybackProgressRelayFlush(u, d), e.buildPlaybackProgressThrottleResponse(t)) : (t.progressForwardMode = "snapshot_bypass", null);
    }
  };
}
function ey(o = {}, e = {}) {
  return {
    ...Wh(o, e),
    ...Qh(o, e),
    ...Zh(o, e)
  };
}
function ty(o = {}, e = {}) {
  const { nodeRepository: t } = o;
  return {
    resolveCorsOrigin(r, a) {
      const n = a.headers.get("Origin"), s = Ci(r);
      return s.corsOrigins.length > 0 ? n && s.corsOriginSet.has(n) ? n : s.corsOrigins[0] : n || "*";
    },
    buildEdgeResponseHeaders(r, a = {}) {
      const n = new Headers({
        "Access-Control-Allow-Origin": r,
        "Cache-Control": "no-store",
        ...a
      });
      return Ne(n), n;
    },
    classifyRequest(r, a, n, s, i = {}) {
      const c = r.method, l = r.headers.get("Range"), u = r.headers.get("If-Range"), d = ea.test(a) || Zr.test(a), f = Ud.test(a), m = Er.test(a), p = Tt.test(a), h = pc.test(a), g = is(a), y = r.headers.get("Upgrade")?.toLowerCase() === "websocket", _ = Vc(a), S = jc(a), E = qc(a), b = om(a), T = S || E || b, C = kd.test(a) || /\/videos\/[^/]+\/(stream|original|download|file)/i.test(a) || /\/items\/[^/]+\/download/i.test(a) || n.searchParams.get("Static") === "true" || n.searchParams.get("Download") === "true", L = c === "GET" || c === "HEAD", P = C && !p && !h && !m && !d, A = _ || g || P || p || h, w = !d && !f && !m && !p && !h && !g && !P && !y, R = i.nodeDirectSource === !0 && L && P, I = i.directStaticAssets === !0 && L && f, x = i.directHlsDash === !0 && L && (p || h), N = R ? "entry_direct_media" : I ? "entry_direct_static_asset" : x ? "entry_direct_hls_dash" : "", F = !!N;
      return {
        rangeHeader: l,
        ifRangeHeader: u,
        enablePrewarm: s.enablePrewarm !== !1 && !F,
        prewarmCacheTtl: fe(s.prewarmCacheTtl, Cd, 0, 3600),
        prewarmDepth: Pc(s.prewarmDepth),
        prewarmPrefetchBytes: s.disablePrewarmPrefetch === !0 ? 0 : fe(s.prewarmPrefetchBytes, $.Defaults.PrewarmPrefetchBytes, 0, Zo),
        isImage: d,
        isStaticFile: f,
        isSubtitle: m,
        isManifest: p,
        isSegment: h,
        isSmartStrmMedia: g,
        isWsUpgrade: y,
        isBigStream: P,
        isPlaybackCriticalRequest: A,
        isApiRequest: w,
        isPlaybackInfoRequest: _,
        isPlaybackProgressRequest: S,
        isPlaybackStoppedRequest: E,
        isPlaybackStartedRequest: b,
        isPlaybackSessionControlRequest: T,
        isMetadataCacheable: c === "GET" && !y && !F && (d || m || p),
        nodeDirectMedia: R,
        directStaticAssets: I,
        directHlsDash: x,
        legacyEntryOffloadEnabled: F,
        legacyEntryOffloadReason: N,
        canStripAuthOnProtocolFallback: L && !w && (g || P || p || h)
      };
    },
    isEntryDirectDataPlaneMode(r) {
      const a = String(r || "").trim();
      return a === "entry_direct" || a === "legacy_entry_offload";
    },
    buildRoutingDecision(r = {}) {
      const a = String(r.action || "PROXY").trim().toUpperCase() === "DIRECT" ? "DIRECT" : "PROXY", n = String(r.phase || "unknown").trim() || "unknown", s = String(r.reason || "").trim() || (a === "DIRECT" ? "direct" : "proxy"), i = String(r.traceAction || (a === "DIRECT" ? "direct" : "proxy")).trim() || (a === "DIRECT" ? "direct" : "proxy"), c = String(r.traceLabel || s).trim() || s, l = Number(r.redirectStatus);
      return {
        phase: n,
        action: a,
        dataPlaneMode: String(r.dataPlaneMode || "").trim() || (a === "DIRECT" ? "redirect_direct" : "worker_proxy"),
        nextMethod: r.nextMethod || null,
        nextBodyMode: r.nextBodyMode || "none",
        isSameOriginRedirect: r.isSameOriginRedirect === !0,
        preserveWorkerProxy: r.preserveWorkerProxy === !0,
        reason: s,
        traceAction: i,
        redirectStatus: Number.isFinite(l) && l > 0 ? Math.floor(l) : 0,
        traceLabel: c
      };
    },
    buildLegacyEntryRoutingDecision(r = {}) {
      if (r.legacyEntryOffloadEnabled === !0) {
        const a = String(r.legacyEntryOffloadReason || "entry_direct").trim() || "entry_direct";
        return e.buildRoutingDecision({
          phase: "entry",
          action: "DIRECT",
          dataPlaneMode: "entry_direct",
          reason: a,
          traceAction: "direct",
          redirectStatus: 307,
          traceLabel: a
        });
      }
      return e.buildRoutingDecision({
        phase: "entry",
        action: "PROXY",
        dataPlaneMode: "worker_proxy",
        reason: "worker_proxy",
        traceAction: "proxy",
        traceLabel: "worker_proxy"
      });
    },
    buildSimplifiedEntryRoutingDecision(r = {}) {
      const a = r.requestTraits || {}, n = a.nodeDirectMedia ? "entry_direct_media" : a.directStaticAssets ? "entry_direct_static_asset" : a.directHlsDash ? "entry_direct_hls_dash" : "";
      return n ? e.buildRoutingDecision({
        phase: "entry",
        action: "DIRECT",
        dataPlaneMode: "entry_direct",
        reason: n,
        traceAction: "direct",
        redirectStatus: 307,
        traceLabel: n
      }) : e.buildRoutingDecision({
        phase: "entry",
        action: "PROXY",
        dataPlaneMode: "worker_proxy",
        reason: "worker_proxy",
        traceAction: "proxy",
        traceLabel: "worker_proxy"
      });
    },
    getRoutingDecision(r = {}) {
      const a = String(r.phase || "").trim().toLowerCase();
      return a === "entry" ? e.getEntryRoutingDecision(r) : a === "redirect" ? e.getRedirectRoutingDecision(r) : e.buildRoutingDecision({
        phase: a || "unknown",
        action: "PROXY",
        dataPlaneMode: "worker_proxy",
        reason: "unsupported_phase",
        traceAction: "proxy",
        traceLabel: "unsupported_phase"
      });
    },
    getEntryRoutingDecision(r = {}) {
      if (r.forceWorkerProxy === !0) {
        const a = String(r.forceWorkerProxyReason || "").trim() || "link_variant_force_proxy";
        return e.buildRoutingDecision({
          phase: "entry",
          action: "PROXY",
          dataPlaneMode: "worker_proxy",
          reason: a,
          traceAction: "proxy",
          traceLabel: a
        });
      }
      return $r(r.routingDecisionMode) === "legacy" ? e.buildLegacyEntryRoutingDecision(r.requestTraits) : e.buildSimplifiedEntryRoutingDecision(r);
    },
    buildSimplifiedRedirectRoutingDecision(r, a, n, s, i = {}, c = {}) {
      const l = r.origin === a.origin, u = i.forceVideoDirect === !0, d = i.forceVideoProxy === !0, f = Zm(i.currentStatus, n);
      let m = s;
      if ((f === "GET" || f === "HEAD") && (m = "none"), c.forceWorkerProxy === !0) {
        const p = String(c.forceWorkerProxyReason || "").trim() || "link_variant_force_proxy";
        return e.buildRoutingDecision({
          phase: c.phase || "redirect",
          action: "PROXY",
          dataPlaneMode: "worker_proxy_follow",
          nextMethod: f,
          nextBodyMode: m,
          isSameOriginRedirect: l,
          preserveWorkerProxy: !1,
          reason: p,
          traceAction: "proxy",
          redirectStatus: c.redirectStatus || i.currentStatus,
          traceLabel: p
        });
      }
      return u ? e.buildRoutingDecision({
        phase: c.phase || "redirect",
        action: "DIRECT",
        dataPlaneMode: "redirect_direct",
        nextBodyMode: s,
        isSameOriginRedirect: l,
        preserveWorkerProxy: !1,
        reason: "node_video_direct",
        traceAction: "direct",
        redirectStatus: c.redirectStatus || i.currentStatus,
        traceLabel: "node_video_direct"
      }) : s === "stream" ? e.buildRoutingDecision({
        phase: c.phase || "redirect",
        action: "DIRECT",
        dataPlaneMode: "redirect_direct",
        nextBodyMode: s,
        isSameOriginRedirect: l,
        preserveWorkerProxy: !1,
        reason: "stream_body_direct",
        traceAction: "direct",
        redirectStatus: c.redirectStatus || i.currentStatus,
        traceLabel: "stream_body_direct"
      }) : e.buildRoutingDecision({
        phase: c.phase || "redirect",
        action: "PROXY",
        dataPlaneMode: "worker_proxy_follow",
        nextMethod: f,
        nextBodyMode: m,
        isSameOriginRedirect: l,
        preserveWorkerProxy: !1,
        reason: "proxy_follow",
        traceAction: "proxy",
        redirectStatus: c.redirectStatus || i.currentStatus,
        traceLabel: d ? "node_video_proxy" : "proxy_follow"
      });
    },
    getRedirectRoutingDecision(r = {}) {
      return e.buildSimplifiedRedirectRoutingDecision(r.nextUrl, r.activeTargetBase, r.redirectMethod, r.redirectBodyMode, r.policy, {
        phase: "redirect",
        forceWorkerProxy: r.forceWorkerProxy === !0,
        forceWorkerProxyReason: r.forceWorkerProxyReason,
        redirectStatus: r.currentStatus || r.policy?.currentStatus
      });
    },
    evaluateFirewall(r, a, n, s) {
      const i = Ci(r);
      return i.ipBlacklist.has(a) ? new Response("Forbidden by IP Firewall", {
        status: 403,
        headers: e.buildEdgeResponseHeaders(s)
      }) : i.geoAllowlist.size > 0 && !i.geoAllowlist.has(n) || i.geoBlocklist.size > 0 && i.geoBlocklist.has(n) ? new Response("Forbidden by Geo Firewall", {
        status: 403,
        headers: e.buildEdgeResponseHeaders(s)
      }) : null;
    },
    applyRateLimit(r, a, n, s, i) {
      const c = parseInt(r.rateLimitRpm) || 0;
      if (!(c > 0 && n.isPlaybackCriticalRequest !== !0)) return null;
      let l = je.RateLimitCache.get(a);
      return (!l || s > l.resetAt) && (l = {
        count: 0,
        resetAt: s + 6e4
      }), l.count += 1, He(je.RateLimitCache, a, l, $.Defaults.RateLimitCacheMax), l.count > c ? new Response("Rate Limit Exceeded", {
        status: 429,
        headers: e.buildEdgeResponseHeaders(i)
      }) : null;
    },
    parseTargetRecords(r, a, n = {}) {
      const s = Array.isArray(n.cachedTargetRecords) ? n.cachedTargetRecords : [];
      if (s.length > 0 && s.every(Ze)) return {
        targetRecords: s,
        invalidResponse: null
      };
      const i = t.getOrderedNodeLines(r), c = (i.length ? i.map((l) => l.target) : String(r.target || "").split(",").map((l) => l.trim()).filter(Boolean)).map((l) => Ba(l)).filter(Ze);
      return c.length ? {
        targetRecords: c,
        invalidResponse: null
      } : {
        targetRecords: c,
        invalidResponse: new Response("Invalid Node Target", {
          status: 502,
          headers: e.buildEdgeResponseHeaders(a)
        })
      };
    }
  };
}
function ry(o) {
  if (!o || !o.body) return !0;
  const e = An(o?.headers?.get("Content-Length"));
  return Number.isFinite(e) && e >= 0 && e <= lc;
}
function ay(o = {}, e = {}) {
  const { nodeRepository: t } = o;
  return {
    ensureFailoverTelemetry(r) {
      const a = r?.failoverTelemetry && typeof r.failoverTelemetry == "object" ? r.failoverTelemetry : {};
      return a.overlay = String(a.overlay || "").trim(), a.probeReason = String(a.probeReason || "").trim(), a.probeWinner = String(a.probeWinner || "").trim(), a.probeElapsedMs = Math.max(0, Math.round(Number(a.probeElapsedMs) || 0)), a.waitJoinMs = Math.max(0, Math.round(Number(a.waitJoinMs) || 0)), a.demotedTarget = String(a.demotedTarget || "").trim(), a.preferredTarget = String(a.preferredTarget || "").trim(), a.fastFailReason = String(a.fastFailReason || "").trim(), r && typeof r == "object" && (r.failoverTelemetry = a), a;
    },
    isFailoverEligible(r, a = []) {
      if (r?.hedgeFailoverEnabled !== !0) return {
        eligible: !1,
        reason: "disabled"
      };
      if (r.requestMethod !== "GET" && r.requestMethod !== "HEAD") {
        if (r?.requestTraits?.isPlaybackInfoRequest !== !0) return {
          eligible: !1,
          reason: "non_idempotent"
        };
        if (!ry(r.request)) return {
          eligible: !1,
          reason: "non_replayable_body"
        };
      }
      return r?.requestTraits?.isWsUpgrade === !0 ? {
        eligible: !1,
        reason: "websocket"
      } : r?.playbackRelayTargetUrl instanceof URL ? {
        eligible: !1,
        reason: "absolute_target"
      } : ff(a) < 2 ? {
        eligible: !1,
        reason: "single_target"
      } : {
        eligible: !0,
        reason: "eligible"
      };
    },
    buildFailoverCacheKey(r, a, n) {
      return [
        String(r || "").toLowerCase().trim(),
        String(a || "").trim(),
        String(n || "").trim()
      ].filter(Boolean).join(":");
    },
    pruneFailoverStateEntry(r, a = ga * 1e3, n = B()) {
      if (!r || typeof r != "object") return null;
      r.failingTargets instanceof Map || (r.failingTargets = /* @__PURE__ */ new Map());
      for (const [d, f] of r.failingTargets) Number(f) <= n && r.failingTargets.delete(d);
      Number(r.preferredTargetExpiresAt) <= n && (r.preferredTargetKey = "", r.preferredTargetExpiresAt = 0);
      const s = Number(r.lastProbeResult?.completedAt) || 0;
      r.lastProbeResult && s > 0 && s + Math.max(1e3, Number(a) || 0) <= n && (r.lastProbeResult = null), r.inFlightProbe && Number(r.inFlightProbe.expiresAt) <= n && (r.inFlightProbe = null);
      const i = !!String(r.preferredTargetKey || "").trim(), c = r.failingTargets.size > 0, l = !!r.inFlightProbe, u = !!r.lastProbeResult;
      return i || c || l || u ? r : null;
    },
    getOrCreateFailoverStateEntry(r, a = ga * 1e3) {
      const n = String(r || "").trim();
      if (!n) return null;
      const s = oe.ProxyFailoverStateCache;
      let i = s.get(n);
      (!i || typeof i != "object") && (i = {
        preferredTargetKey: "",
        preferredTargetExpiresAt: 0,
        failingTargets: /* @__PURE__ */ new Map(),
        inFlightProbe: null,
        lastProbeResult: null
      });
      const c = e.pruneFailoverStateEntry(i, a, B()) || i;
      return He(s, n, c, mr), c;
    },
    getFailoverStateSnapshot(r, a = ga * 1e3) {
      const n = String(r || "").trim();
      if (!n) return null;
      const s = oe.ProxyFailoverStateCache, i = s.get(n);
      if (!i) return null;
      const c = e.pruneFailoverStateEntry(i, a, B());
      return c ? (_n(s, n), {
        preferredTargetKey: String(c.preferredTargetKey || "").trim(),
        failingTargetKeys: [...c.failingTargets.keys()].map((l) => String(l || "").trim()).filter(Boolean),
        probeWinnerTargetKey: String(c.lastProbeResult?.status || "") === "ok" ? String(c.lastProbeResult?.winnerTargetKey || "").trim() : "",
        lastProbeResult: c.lastProbeResult && typeof c.lastProbeResult == "object" ? { ...c.lastProbeResult } : null,
        inFlightProbe: c.inFlightProbe ? {
          startedAt: Number(c.inFlightProbe.startedAt) || 0,
          reason: String(c.inFlightProbe.reason || "").trim()
        } : null
      }) : (s.delete(n), null);
    },
    buildFailoverStateSummary(r) {
      const a = r?.failoverContext && typeof r.failoverContext == "object" ? r.failoverContext : null, n = e.ensureFailoverTelemetry(r), s = a?.cacheKey ? e.getFailoverStateSnapshot(a.cacheKey, a.preferredTtlMs) : null;
      return {
        enabled: a?.enabled === !0,
        eligible: a?.eligible === !0,
        cacheKey: String(a?.cacheKey || "").trim() || null,
        reason: String(a?.eligibilityReason || "").trim() || null,
        overlay: String(n.overlay || "").trim() || null,
        preferredTarget: String(n.preferredTarget || s?.preferredTargetKey || "").trim() || null,
        probeWinner: String(n.probeWinner || s?.probeWinnerTargetKey || "").trim() || null,
        demotedTargets: Array.isArray(s?.failingTargetKeys) ? s.failingTargetKeys : [],
        inFlight: s?.inFlightProbe ? { reason: String(s.inFlightProbe.reason || "").trim() || null } : null
      };
    },
    buildFailoverDiagnosticDetail(r) {
      const a = r?.failoverContext && typeof r.failoverContext == "object" ? r.failoverContext : null;
      if (!a?.enabled) return "";
      const n = e.ensureFailoverTelemetry(r), s = e.buildFailoverStateSummary(r), i = [`Failover=${String(n.overlay || a.eligibilityReason || "ready").trim() || "ready"}`];
      return s.preferredTarget && i.push(`PreferredTarget=${s.preferredTarget}`), n.demotedTarget && i.push(`DemotedTarget=${n.demotedTarget}`), n.probeWinner && i.push(`ProbeWinner=${n.probeWinner}`), n.waitJoinMs > 0 && i.push(`WaitJoin=${n.waitJoinMs}ms`), n.fastFailReason && i.push(`FastFail=${n.fastFailReason}`), i.join(" | ");
    },
    reorderRetryTargetsForFailover(r, a = {}) {
      const n = Array.isArray(r) ? r.slice() : [];
      if (n.length <= 1) return n;
      const s = new Set((Array.isArray(a?.failingTargetKeys) ? a.failingTargetKeys : []).map((m) => String(m || "").trim()).filter(Boolean)), i = String(a?.preferredTargetKey || "").trim(), c = String(a?.probeWinnerTargetKey || "").trim(), l = i && !s.has(i) ? i : c && !s.has(c) ? c : "";
      if (!l && s.size <= 0) return n;
      const u = [], d = [], f = [];
      for (const m of n) {
        const p = Xe(m);
        if (l && p === l && u.length <= 0 && !s.has(p)) {
          u.push(m);
          continue;
        }
        if (s.has(p)) {
          f.push(m);
          continue;
        }
        d.push(m);
      }
      return [
        ...u,
        ...d,
        ...f
      ];
    },
    prepareFailoverOverlay(r, a = []) {
      const n = e.ensureFailoverTelemetry(r), s = df(a), i = Math.max(1e3, (Number(r?.hedgePreferredTtlSec) || ga) * 1e3), c = e.isFailoverEligible(r, a), l = e.buildFailoverCacheKey(r?.nodeName, s, r?.nodeDerivedCacheRevision), u = c.eligible ? e.getFailoverStateSnapshot(l, i) : null, d = c.eligible ? e.reorderRetryTargetsForFailover(a, u) : Array.isArray(a) ? a.slice() : [];
      let f = "disabled";
      return r?.hedgeFailoverEnabled === !0 && (c.eligible ? u?.preferredTargetKey ? f = "preferred_reordered" : u?.probeWinnerTargetKey ? f = "probe_hint_reordered" : Array.isArray(u?.failingTargetKeys) && u.failingTargetKeys.length > 0 ? f = "failure_demoted" : f = "ready" : f = c.reason || "ineligible"), n.overlay = f, n.preferredTarget = String(u?.preferredTargetKey || "").trim(), r.failoverContext = {
        enabled: r?.hedgeFailoverEnabled === !0,
        eligible: c.eligible,
        eligibilityReason: c.reason,
        cacheKey: l,
        orderedTargetSignature: s,
        preferredTtlMs: i,
        probePath: Ka(r?.hedgeProbePath, ac),
        probePreferGet: r?.hedgeProbePreferGet !== !1,
        probeTimeoutMs: Math.max(250, Number(r?.hedgeProbeTimeoutMs) || Jo),
        probeParallelism: Math.max(1, Math.min(2, Number(r?.hedgeProbeParallelism) || nc)),
        waitTimeoutMs: Math.max(250, Number(r?.hedgeWaitTimeoutMs) || oc),
        lockTtlMs: Math.max(1e3, Number(r?.hedgeLockTtlMs) || sc),
        failureCooldownMs: Math.max(1e3, (Number(r?.hedgeFailureCooldownSec) || ic) * 1e3),
        wakeJitterMs: Math.max(0, Number(r?.hedgeWakeJitterMs) || cc),
        originalTargetRecords: Array.isArray(a) ? a.slice() : [],
        retryTargetRecords: d.slice(),
        snapshot: u
      }, d;
    },
    maybeInvalidateHotSnapshotOnFailover(r, a) {
      if (String(r?.targetHotCacheState || "").trim() !== "hit") return;
      const n = Xe(a);
      n && (Array.isArray(r?.playbackRouteHotTargetRecords) ? r.playbackRouteHotTargetRecords : []).map((s) => Xe(s)).filter(Boolean).includes(n) && t.invalidatePlaybackRouteHotCache(r?.nodeName, r?.env);
    },
    markFailoverTargetFailure(r, a, n = "", s = {}) {
      const i = r?.failoverContext;
      if (!i?.eligible) return;
      const c = Xe(a);
      if (!c) return;
      const l = e.ensureFailoverTelemetry(r), u = e.getOrCreateFailoverStateEntry(i.cacheKey, i.preferredTtlMs);
      u && (u.failingTargets.set(c, B() + i.failureCooldownMs), String(u.preferredTargetKey || "").trim() === c && (u.preferredTargetKey = "", u.preferredTargetExpiresAt = 0), He(oe.ProxyFailoverStateCache, i.cacheKey, u, mr), l.overlay = String(s.overlay || "target_demoted").trim() || "target_demoted", l.demotedTarget = c, l.fastFailReason = String(n || s.fastFailReason || l.fastFailReason || "").trim(), e.maybeInvalidateHotSnapshotOnFailover(r, a));
    },
    markFailoverBusinessSuccess(r, a, n = {}) {
      const s = r?.failoverContext;
      if (!s?.eligible) return;
      const i = Number(n.status) || 0;
      if (!(i >= 200 && i < 300 || i === 206 || i >= 300 && i < 400)) return;
      const c = Xe(a);
      if (!c) return;
      const l = e.ensureFailoverTelemetry(r), u = e.getOrCreateFailoverStateEntry(s.cacheKey, s.preferredTtlMs);
      u && (u.failingTargets.delete(c), u.preferredTargetKey = c, u.preferredTargetExpiresAt = B() + s.preferredTtlMs, He(oe.ProxyFailoverStateCache, s.cacheKey, u, mr), l.overlay = String(n.overlay || "preferred_promoted").trim() || "preferred_promoted", l.preferredTarget = c);
    },
    getFailoverProbeCandidates(r, a = {}) {
      const n = r?.failoverContext;
      if (!n?.eligible) return [];
      const s = e.getFailoverStateSnapshot(n.cacheKey, n.preferredTtlMs), i = e.reorderRetryTargetsForFailover(n.originalTargetRecords, s), c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), u = Xe(a.failedTargetRecord), d = Xe(a.activeTargetRecord), f = String(a.excludeTargetKey || "").trim();
      return u && c.add(u), d && c.add(d), f && c.add(f), i.filter((m) => {
        const p = Xe(m);
        return !p || c.has(p) || l.has(p) ? !1 : (l.add(p), !0);
      }).slice(0, n.probeParallelism);
    }
  };
}
function ny(o = {}, e = {}) {
  return {
    buildFailoverProbeHeaders(t = "") {
      return new Headers(Yo(t));
    },
    async performFailoverProbeRequest(t, r, a, n, s = null, i = null) {
      const c = bh([
        t?.request?.signal,
        t?.requestLifecycle?.signal,
        s
      ]);
      let l = null, u = !1;
      try {
        return n > 0 && (l = setTimeout(() => {
          u = !0, c.abort(`probe_timeout_${n}ms`);
        }, n)), await We(r.toString(), {
          method: a,
          headers: e.buildFailoverProbeHeaders(i ?? t?.request?.headers?.get("User-Agent")),
          redirect: "manual",
          signal: c.signal
        });
      } catch (d) {
        if (u) {
          const f = /* @__PURE__ */ new Error(`probe_timeout_${n}ms`);
          throw f.code = "UPSTREAM_TIMEOUT", f;
        }
        throw t?.requestLifecycle?.getAbortReason?.() && Vt(d) ? hr(t.requestLifecycle.getAbortReason()) : d;
      } finally {
        l !== null && clearTimeout(l), c.dispose();
      }
    },
    async runFailoverProbeCandidate(t, r, a = {}) {
      const n = t?.failoverContext, s = n?.probePath || Ka(t?.hedgeProbePath, ac), i = Math.max(250, Number(n?.probeTimeoutMs) || Jo), c = Xe(r), l = Rl(r, [s]);
      if (!l.length) return {
        ok: !1,
        status: 0,
        targetRecord: r,
        targetKey: c,
        reason: "invalid_probe_target",
        elapsedMs: 0
      };
      const u = B(), d = n?.probePreferGet !== !1;
      for (let f = 0; f < l.length; f += 1) {
        const m = l[f].probeUrl, p = f < l.length - 1;
        let h = null, g = d ? "GET" : "HEAD";
        try {
          if (h = await e.performFailoverProbeRequest(t, m, g, i, a.parentSignal || null), !d && (h.status === 405 || h.status === 501)) {
            try {
              h.body?.cancel?.();
            } catch {
            }
            g = "GET", h = await e.performFailoverProbeRequest(t, m, "GET", i, a.parentSignal || null);
          }
          const y = String(t?.request?.headers?.get("User-Agent") || "").trim();
          if (h.status === 403 && y && y !== lo) {
            const E = Number(n?.waitTimeoutMs) || 0, b = E > 0 ? Math.min(i, E - (B() - u)) : i;
            if (b >= 250) {
              try {
                h.body?.cancel?.();
              } catch {
              }
              h = await e.performFailoverProbeRequest(t, m, g, b, a.parentSignal || null, lo);
            }
          }
          const _ = Math.max(0, B() - u), S = Number(h.status) || 0;
          if (S >= 200 && S < 400 || S === 403) {
            const E = h.status;
            try {
              h.body?.cancel?.();
            } catch {
            }
            return {
              ok: !0,
              status: E,
              targetRecord: r,
              targetKey: c,
              methodUsed: g,
              elapsedMs: _
            };
          }
          try {
            h.body?.cancel?.();
          } catch {
          }
          if (p && (S === 404 || S === 405)) continue;
          return {
            ok: !1,
            status: h.status,
            targetRecord: r,
            targetKey: c,
            reason: `probe_status_${Number(h.status) || 0}`,
            elapsedMs: _
          };
        } catch (y) {
          const _ = Math.max(0, B() - u), S = String(y?.code || "").trim().toUpperCase(), E = String(t?.requestLifecycle?.getAbortReason?.() || "").trim();
          return E ? {
            ok: !1,
            targetRecord: r,
            targetKey: c,
            reason: E.toLowerCase(),
            elapsedMs: _,
            aborted: !0
          } : String(a.parentSignal?.reason || "").trim() === "probe_winner" && Vt(y) ? {
            ok: !1,
            targetRecord: r,
            targetKey: c,
            reason: "probe_winner_aborted",
            elapsedMs: _,
            aborted: !0
          } : {
            ok: !1,
            targetRecord: r,
            targetKey: c,
            reason: S === "UPSTREAM_TIMEOUT" ? "probe_timeout" : "probe_network_error",
            elapsedMs: _,
            aborted: Vt(y)
          };
        }
      }
    },
    async runFailoverProbeTask(t, r, a = {}) {
      const n = t?.failoverContext;
      if (!n?.eligible) return {
        status: "skipped",
        reason: "ineligible",
        winnerTargetRecord: null,
        winnerTargetKey: "",
        elapsedMs: 0,
        attempts: []
      };
      const s = Array.isArray(r) ? r.slice(0, n.probeParallelism) : [];
      if (!s.length) return {
        status: "skipped",
        reason: "no_candidates",
        winnerTargetRecord: null,
        winnerTargetKey: "",
        elapsedMs: 0,
        attempts: []
      };
      const i = new AbortController(), c = [];
      let l = null;
      const u = B();
      await Promise.all(s.map(async (_) => {
        const S = await e.runFailoverProbeCandidate(t, _, { parentSignal: i.signal });
        if (c.push(S), !l && S?.ok === !0) {
          l = S;
          try {
            i.abort("probe_winner");
          } catch {
          }
        }
      }));
      const d = Math.max(0, B() - u), f = e.getOrCreateFailoverStateEntry(n.cacheKey, n.preferredTtlMs), m = l ? "ok" : "miss", p = l ? String(a.reason || "probe_ok").trim() || "probe_ok" : String(c.find((_) => _?.aborted !== !0 && _?.reason)?.reason || "probe_no_winner").trim() || "probe_no_winner", h = l && typeof l == "object" ? l : null, g = String(h ? h.targetKey : "").trim(), y = h ? h.targetRecord : null;
      return f && (f.lastProbeResult = {
        status: m,
        reason: p,
        winnerTargetKey: g,
        completedAt: B(),
        elapsedMs: d
      }, He(oe.ProxyFailoverStateCache, n.cacheKey, f, mr)), {
        status: m,
        reason: p,
        winnerTargetRecord: y,
        winnerTargetKey: g,
        elapsedMs: d,
        attempts: c
      };
    },
    startOrJoinFailoverProbe(t, r = {}) {
      const a = t?.failoverContext, n = e.ensureFailoverTelemetry(t);
      if (!a?.eligible) return null;
      const s = e.getOrCreateFailoverStateEntry(a.cacheKey, a.preferredTtlMs), i = B();
      if (s?.inFlightProbe && Number(s.inFlightProbe.expiresAt) > i && s.inFlightProbe.promise)
        return n.overlay = (r.background === !0 ? "background_probe_joined" : "probe_joined").trim(), {
          joined: !0,
          startedAt: Number(s.inFlightProbe.startedAt) || i,
          promise: s.inFlightProbe.promise
        };
      const c = e.getFailoverProbeCandidates(t, r);
      if (!c.length)
        return n.fastFailReason = "no_probe_candidates", n.overlay = "no_probe_candidates", {
          joined: !1,
          startedAt: i,
          promise: Promise.resolve({
            status: "skipped",
            reason: "no_candidates",
            winnerTargetRecord: null,
            winnerTargetKey: "",
            elapsedMs: 0,
            attempts: []
          })
        };
      const l = `${i}-${Math.random().toString(36).slice(2, 10)}`, u = e.runFailoverProbeTask(t, c, r).finally(() => {
        const d = e.getOrCreateFailoverStateEntry(a.cacheKey, a.preferredTtlMs);
        !d?.inFlightProbe || String(d.inFlightProbe.token || "").trim() !== l || (d.inFlightProbe = null, He(oe.ProxyFailoverStateCache, a.cacheKey, d, mr));
      });
      return s && (s.inFlightProbe = {
        token: l,
        startedAt: i,
        expiresAt: i + a.lockTtlMs,
        reason: String(r.reason || "").trim(),
        promise: u
      }, He(oe.ProxyFailoverStateCache, a.cacheKey, s, mr)), n.overlay = (r.background === !0 ? "background_probe_started" : "probe_started").trim(), {
        joined: !1,
        startedAt: i,
        promise: u
      };
    },
    async maybeRunForegroundFailoverWait(t, r = {}) {
      const a = t?.execution, n = a?.failoverContext, s = e.ensureFailoverTelemetry(a);
      if (!n?.eligible || a?.failoverForegroundWaitUsed === !0) return null;
      a.failoverForegroundWaitUsed = !0;
      const i = r.targetRecord, c = Number(r.responseStatus) || 0, l = String(r.reason || (c > 0 ? `upstream_status_${c}` : "retryable_failure")).trim() || "retryable_failure";
      e.markFailoverTargetFailure(a, i, l, { overlay: "failure_demoted" });
      const u = e.startOrJoinFailoverProbe(a, {
        reason: l,
        failedTargetRecord: i
      });
      if (!u?.promise) return null;
      const d = await Eh(u.promise, n.waitTimeoutMs, a?.requestLifecycle);
      if (s.waitJoinMs = d.timedOut === !0 ? n.waitTimeoutMs : Math.max(0, B() - Number(u.startedAt || B())), d.timedOut === !0)
        return s.overlay = "probe_wait_timeout", s.fastFailReason = "probe_wait_timeout", null;
      const f = d.value && typeof d.value == "object" ? d.value : null;
      if (s.probeReason = u.joined === !0 ? "join_existing_probe" : l, s.probeElapsedMs = Math.max(0, Number(f?.elapsedMs) || 0), s.probeWinner = String(f?.winnerTargetKey || "").trim(), !f || f.status !== "ok" || !Ze(f.winnerTargetRecord))
        return s.overlay = "probe_miss", s.fastFailReason = String(f?.reason || "probe_no_winner").trim() || "probe_no_winner", null;
      const m = Xe(i), p = Xe(f.winnerTargetRecord);
      if (!p || p === m)
        return s.overlay = "probe_miss", s.fastFailReason = "probe_reused_failed_target", null;
      n.wakeJitterMs > 0 && await Ah(Math.floor(Math.random() * (n.wakeJitterMs + 1)), a?.requestLifecycle);
      try {
        const h = await e.performUpstreamFetch(f.winnerTargetRecord, t.proxyPath, t.requestUrl, t.buildFetchOptions, {
          isRetry: !0,
          protocolFallbackRetry: t.protocolFallbackRetry === !0,
          stripAuthOnProtocolFallback: t.stripAuthOnProtocolFallback === !0,
          timeoutMs: t.upstreamTimeoutMs,
          requestLifecycle: t.requestLifecycle,
          useFastSegmentBuilder: !1
        });
        if (s.overlay = "wake_retry", h.response.status === 101 || !t.retryableStatuses.has(h.response.status)) return { upstream: h };
        e.markFailoverTargetFailure(a, f.winnerTargetRecord, `upstream_status_${h.response.status}`, { overlay: "wake_retry_failed" }), s.fastFailReason = `wake_retry_status_${h.response.status}`;
        try {
          h.response.body?.cancel?.();
        } catch {
        }
        try {
          h.releaseFetchController?.();
        } catch {
        }
        return null;
      } catch (h) {
        const g = String(h?.code || "").trim().toUpperCase();
        if ([
          "CLIENT_ABORTED",
          "DOWNSTREAM_CANCELLED",
          "REQUEST_ABORTED"
        ].includes(g) || (e.markFailoverTargetFailure(a, f.winnerTargetRecord, g || "wake_retry_error", { overlay: "wake_retry_failed" }), s.fastFailReason = String(g || "wake_retry_error").trim().toLowerCase() || "wake_retry_error"), h && typeof h == "object") {
          const y = Ye(f.winnerTargetRecord, t.proxyPath);
          y.search = String(t.requestUrl?.search || ""), h.lastFinalUrl = y, h.lastTargetRecord = f.winnerTargetRecord, h.lastTargetBase = f.winnerTargetRecord?.targetUrl || null;
        }
        if ([
          "CLIENT_ABORTED",
          "DOWNSTREAM_CANCELLED",
          "REQUEST_ABORTED"
        ].includes(g)) throw h;
        return { error: h };
      }
    },
    maybeScheduleBackgroundFailoverRefresh(t, r = {}) {
      const a = t?.failoverContext;
      if (!a?.eligible || !t?.ctx) return;
      const n = e.getFailoverStateSnapshot(a.cacheKey, a.preferredTtlMs);
      if ((Array.isArray(n?.failingTargetKeys) ? n.failingTargetKeys : []).length <= 0) return;
      const s = Number(n?.lastProbeResult?.completedAt) || 0;
      if (s > 0 && s + a.preferredTtlMs > B() || n?.inFlightProbe) return;
      const i = e.startOrJoinFailoverProbe(t, {
        reason: "stale_refresh",
        activeTargetRecord: r?.activeTargetRecord || null,
        background: !0
      });
      i?.promise && t.ctx.waitUntil(Promise.resolve(i.promise).catch(() => {
      }));
    }
  };
}
function oy(o = {}, e = {}) {
  return {
    ...ty(o, e),
    ...ay(o, e),
    ...ny(o, e)
  };
}
function sy(o = {}, e = {}) {
  const t = {
    async buildProxyRequestState(r, a, n, s, i, c, l, u, d = {}) {
      const f = oh(r.headers);
      fo.forEach((F) => f.delete(F)), a.tmdbAggregationEnabled === !0 && Mi(r, a, !0) && (Po(f), Di(s));
      const m = /* @__PURE__ */ new Set();
      let p = null;
      if (a.headers && typeof a.headers == "object") for (const [F, D] of Object.entries(a.headers)) {
        const U = String(F).toLowerCase();
        fo.has(U) || (m.add(U), U === "cookie" ? p = String(D) : f.set(F, String(D)));
      }
      const h = Ei(f.get("Cookie"), p, ["auth_token", ...wa]);
      h ? f.set("Cookie", h) : f.delete("Cookie");
      const g = p ? Ei(null, p, ["auth_token", ...wa]) : null;
      Mo(f, d.effectiveMediaAuthMode || a.mediaAuthMode, uh(s));
      const y = Rf(d.effectiveRealClientIpMode || a.realClientIpMode);
      y === "none" && Hd.forEach((F) => f.delete(F)), (y === "full" || y === "real-ip-only") && f.set("X-Real-IP", i), y === "full" && f.set("X-Forwarded-For", i), f.set("X-Forwarded-Host", s.host), f.set("X-Forwarded-Proto", s.protocol.replace(":", "")), c.isWsUpgrade ? (f.set("Upgrade", "websocket"), f.set("Connection", "Upgrade")) : l && f.set("Connection", "keep-alive"), (c.isBigStream || c.isSmartStrmMedia || c.isSegment || c.isManifest) && !m.has("referer") && f.delete("Referer");
      const _ = m.has("origin"), S = m.has("referer"), E = f.has("Origin"), b = f.has("Referer");
      let T = "", C = "/";
      if (b && !S) try {
        const F = new URL(f.get("Referer") || "");
        T = String(F.origin || "").trim(), C = `${F.pathname || "/"}${F.search || ""}` || "/";
      } catch {
        T = "", C = "/";
      }
      const L = {
        baseHeaderEntries: [...f.entries()],
        hasOriginHeader: E,
        hasRefererHeader: b,
        adminCustomHasOrigin: _,
        adminCustomHasReferer: S,
        refererOrigin: T,
        refererPathAndSearch: C,
        adminCookie: g
      }, P = r.method !== "GET" && r.method !== "HEAD";
      let A = null, w = "none", R = "";
      if (P && r.body) {
        const F = An(r.headers.get("Content-Length"));
        if (Number.isFinite(F) && F >= 0 && F <= lc) try {
          A = await r.clone().arrayBuffer(), w = "buffered", (c.isPlaybackInfoRequest === !0 || c.isPlaybackSessionControlRequest === !0) && (R = Tn(A));
        } catch {
          A = r.body, w = "stream";
        }
        else
          A = r.body, w = "stream";
      }
      const I = c?.isPlaybackInfoRequest === !0 && w !== "stream", x = !P || I, N = x ? u : u.slice(0, 1);
      return {
        newHeaders: f,
        adminCustomHeaders: m,
        transportTemplate: L,
        preparedBody: A,
        preparedBodyMode: w,
        preparedBodyText: R,
        retryTargetRecords: N,
        allowAutomaticRetry: x,
        allowSameTargetRetry: !P,
        clientRedirectAuthPolicy: oa(f)
      };
    },
    buildProxyResponseHeaders(r, a, n, s, i, c = {}) {
      const l = new Headers(r.headers);
      $d.forEach((f) => l.delete(f)), l.set("Access-Control-Allow-Origin", s), n && n["Access-Control-Expose-Headers"] && l.set("Access-Control-Expose-Headers", n["Access-Control-Expose-Headers"]), n && n["Access-Control-Allow-Methods"] && l.set("Access-Control-Allow-Methods", n["Access-Control-Allow-Methods"]);
      const u = a.headers.get("Access-Control-Request-Headers");
      u ? (l.set("Access-Control-Allow-Headers", u), Vr(l, "Access-Control-Request-Headers")) : n && n["Access-Control-Allow-Headers"] && l.set("Access-Control-Allow-Headers", n["Access-Control-Allow-Headers"]), s !== "*" && Vr(l, "Origin"), (!c.enableH3 || c.forceH1) && l.delete("Alt-Svc");
      const d = fe(c.imageCacheMaxAge, dc * 86400, 0, 365 * 86400);
      if (r.status >= 400 || i.isManifest || i.isBigStream || i.isSmartStrmMedia) l.set("Cache-Control", "no-store");
      else if (c.proxiedExternalRedirect) l.set("Cache-Control", "no-store");
      else if (i.isImage || i.isStaticFile || i.isSubtitle) {
        const f = kg(a) ? "private" : "public";
        l.set("Cache-Control", `${f}, max-age=${d}`);
      }
      return Ne(l), l;
    },
    applyProxyRedirectHeaders(r, a, n, s, i, c, l, u = {}) {
      const d = (h) => {
        const g = oi(h instanceof URL ? h.toString() : String(h || ""), n), y = u.externalRedirectAuth;
        if (!y || y.canDirect !== !0 || !/^https?:\/\//i.test(g)) return g;
        try {
          const _ = new URL(g);
          return u.workerOrigin && _.origin === u.workerOrigin ? g : En(_, y.policy, y.mode).toString();
        } catch {
          return g;
        }
      };
      if (c) {
        wl(r), r.set("Location", d(c)), r.set("Cache-Control", "no-store");
        return;
      }
      if (!pl(a.status)) {
        const h = r.get("Location");
        h && r.set("Location", oi(h, n));
        return;
      }
      const f = r.get("Location");
      if (!f) return;
      const m = xa(f, l || n);
      if (!m) {
        r.delete("Location");
        return;
      }
      const p = _i(m, n, s, i, {
        linkVariant: u.linkVariant,
        entryMode: u.entryMode
      });
      p && r.set("Location", d(p));
    },
    buildClientVisibleRedirectUrl(r, a, n, s, i, c = {}) {
      const l = r instanceof URL ? r : xa(r, a);
      if (!l) return null;
      if (c.preserveWorkerProxy !== !0) return l;
      const u = _i(l, a, n, s, {
        linkVariant: c.linkVariant,
        entryMode: c.entryMode
      }), d = ot(n, s, {
        linkVariant: c.linkVariant,
        entryMode: c.entryMode
      });
      if (!u || !String(u).startsWith(d)) return l;
      try {
        const f = i instanceof URL ? i : new URL(String(i || ""));
        return new URL(u, f);
      } catch {
        return l;
      }
    },
    buildPlaybackInfoClientVisibleUrl(r, a = "/", n = {}) {
      const s = Z(a), i = String(n.search || ""), c = String(n.hash || "");
      return String(r?.playbackInfoRewriteUrlMode || "").trim() === "absolute" ? Ll(r?.requestUrl || r?.rawRequestUrl || "https://playback-info.local/", r?.nodeName, r?.nodeKey, s, {
        linkVariant: r?.linkVariant,
        entryMode: r?.entryMode,
        search: i,
        hash: c
      }).toString() : `${Tg(Eg(s, r?.nodeName, r?.nodeKey, { entryMode: r?.entryMode }), Ag(r))}${i}${c}`;
    },
    buildPlaybackInfoProxyUrl(r, a, n, s) {
      const i = String(a || "").trim();
      if (!i) return "";
      const c = gg(i, r?.proxyPath || "/", n, r?.requestUrl || r?.rawRequestUrl || s, ot(r?.nodeName, r?.nodeKey, {
        linkVariant: r?.linkVariant,
        entryMode: r?.entryMode
      }));
      if (c) return t.buildPlaybackInfoClientVisibleUrl(r, c.proxyPath, {
        search: c.search,
        hash: c.hash
      });
      let l;
      try {
        const d = s instanceof URL ? s : new URL(String(s || ""));
        l = new URL(i, d);
      } catch {
        return i;
      }
      if (!["http:", "https:"].includes(String(l.protocol || "").toLowerCase())) return i;
      if (n) {
        const { resolvedUrl: d, proxyPath: f } = za(l, n);
        if (d && f) {
          const m = hg(f, r?.proxyPath || "/", n);
          return t.buildPlaybackInfoClientVisibleUrl(r, m, {
            search: d.search,
            hash: d.hash
          });
        }
      }
      const u = _g(r?.requestUrl || r?.rawRequestUrl || "https://playback-info.local/", r?.nodeName, r?.nodeKey, l, {
        linkVariant: r?.linkVariant,
        entryMode: r?.entryMode
      });
      return String(r?.playbackInfoRewriteUrlMode || "").trim() === "absolute" ? u.toString() : t.buildPlaybackInfoClientVisibleUrl(r, u.pathname || "/", {
        search: u.search || "",
        hash: u.hash || ""
      });
    },
    sanitizePlaybackInfoSerializedResponseHeaders: Cn,
    parsePlaybackInfoRootObject: ko,
    normalizeMediaAuthHeaders: Mo,
    appendMediaRedirectAuthToUrl: En,
    buildPlaybackInfoContractErrorState(r, a, n = "invalid_payload", s = null) {
      const i = a?.response;
      return r.playbackInfoRewrite = "rejected", e.buildProxyErrorState(r, a, {
        message: "Upstream PlaybackInfo response must be a JSON object.",
        guardHeader: "X-Proxy-Contract-Guard",
        guardValue: "playback-info",
        details: H(s) ? s : {
          reason: String(n || "invalid_payload"),
          upstreamStatus: Number(i?.status) || 0,
          contentType: Sr(i?.headers?.get?.("Content-Type")) || "missing"
        }
      });
    },
    async guardPlaybackInfoResponseContract(r, a) {
      if (r?.requestTraits?.isPlaybackInfoRequest !== !0 || xt(a?.playbackInfoRepresentation) && a.playbackInfoRepresentation.response === a?.response) return a;
      const n = await lu(a?.response, {
        requestMethod: r.requestMethod,
        maxBytes: Qo
      });
      return n.kind === "skip" ? a : n.kind === "invalid" ? n.reason === "body_too_large" ? (r.playbackInfoRewrite = "skipped_oversized", a) : t.buildPlaybackInfoContractErrorState(r, a, n.reason, n.details) : {
        ...a,
        playbackInfoRepresentation: n.representation
      };
    },
    decodePlaybackInfoJsonValue: sn,
    normalizePlaybackInfoObjectArray: Ho,
    sanitizePlaybackInfoMediaSource: xi,
    sanitizePlaybackInfoMediaSourcesPayload: $o,
    rewritePlaybackInfoPayload(r, a, n, s) {
      return Oi(a, { buildProxyUrl: (i) => t.buildPlaybackInfoProxyUrl(r, i, n, s) });
    },
    async maybeRewritePlaybackInfoResponse(r, a) {
      if (r?.requestTraits?.isPlaybackInfoRequest !== !0) return a;
      const n = Qt(r?.effectivePlaybackInfoMode) === "rewrite", s = n ? "not_needed" : "passthrough", i = a?.response;
      if (!i || !(i.status >= 200 && i.status < 300) || r.requestMethod === "HEAD" || i.status === 204 || i.status === 205 || !i.body)
        return r.playbackInfoRewrite !== "rejected" && (r.playbackInfoRewrite = s), a;
      if ((!xt(a?.playbackInfoRepresentation) || a.playbackInfoRepresentation.response !== i) && (a = await t.guardPlaybackInfoResponseContract(r, a), !xt(a?.playbackInfoRepresentation)))
        return a;
      try {
        const c = hu(a.playbackInfoRepresentation, {
          rewriteEnabled: n,
          buildProxyUrl: (l) => t.buildPlaybackInfoProxyUrl(r, l, a?.activeTargetBase, a?.finalUrl || new URL(String(r?.requestUrl || r?.rawRequestUrl || "")))
        });
        return c.kind !== "valid" ? t.buildPlaybackInfoContractErrorState(r, a, c.reason || "normalization_failed") : (r.playbackInfoRewrite = c.rewriteState, {
          ...a,
          response: c.representation.response,
          playbackInfoRepresentation: c.representation
        });
      } catch {
        return t.buildPlaybackInfoContractErrorState(r, a, "normalization_failed");
      }
    }
  };
  return t;
}
function iy({ configReader: o, nodeRepository: e, logger: t, cachePort: r, fetchPort: a }) {
  const n = {}, s = {
    CacheManager: r,
    Logger: t,
    configReader: o,
    fetchPort: a,
    nodeRepository: e
  }, i = [
    wh(s, n),
    Mh(s, n),
    ey(s, n),
    oy(s, n),
    sy(s, n),
    Jh(s, n)
  ];
  for (const c of i) for (const [l, u] of Object.entries(c)) n[l] = u;
  return n;
}
function cy({ configReader: o, nodeRepository: e, logger: t, cachePort: r, fetchPort: a }) {
  const n = iy({
    configReader: o,
    nodeRepository: e,
    logger: t,
    cachePort: r,
    fetchPort: a
  });
  return Object.freeze({
    handle: (...s) => n.handle(...s),
    testingSupport: n
  });
}
function ly(o = {}, e = {}) {
  return {
    getStatsBucketParts(t, r = $.Defaults.ScheduleUtcOffsetMinutes) {
      const a = ut(Number(t) || 0, r);
      return {
        bucketDate: a.dateKey,
        bucketHour: a.hour
      };
    },
    summarizeStatsHourlyEntries(t = [], r = {}) {
      const a = Fe(r.utcOffsetMinutes), n = /* @__PURE__ */ new Map();
      for (const s of Array.isArray(t) ? t : []) {
        const i = Number(s?.timestamp) || 0;
        if (i <= 0) continue;
        const { bucketDate: c, bucketHour: l } = e.getStatsBucketParts(i, a), u = `${c}:${l}`, d = n.get(u) || {
          bucketDate: c,
          bucketHour: l,
          requestCount: 0,
          playCount: 0,
          playbackInfoCount: 0
        };
        d.requestCount += 1, Df(s?.requestPath, s?.category) && (d.playCount += 1), If(s?.requestPath, s?.category) && (d.playbackInfoCount += 1), n.set(u, d);
      }
      return [...n.values()].sort((s, i) => s.bucketDate !== i.bucketDate ? String(s.bucketDate).localeCompare(String(i.bucketDate)) : Number(s.bucketHour) - Number(i.bucketHour));
    },
    async incrementStatsHourly(t, r = [], a = {}) {
      if (!t || !await e.hasStatsHourlyTable(t)) return !1;
      const n = e.summarizeStatsHourlyEntries(r, a);
      return n.length ? await e.upsertStatsHourlyBuckets(t, n, a) : !0;
    },
    async upsertStatsHourlyBuckets(t, r = [], a = {}) {
      if (!t || !await e.hasStatsHourlyTable(t)) return !1;
      const n = (Array.isArray(r) ? r : []).map((c) => ({
        bucketDate: String(c?.bucketDate || "").trim(),
        bucketHour: Math.max(0, Number(c?.bucketHour) || 0),
        requestCount: Math.max(0, Number(c?.requestCount) || 0),
        playCount: Math.max(0, Number(c?.playCount) || 0),
        playbackInfoCount: Math.max(0, Number(c?.playbackInfoCount) || 0)
      })).filter((c) => c.bucketDate);
      if (!n.length) return !0;
      const s = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), i = en("proxy_stats_hourly.batch", JSON.stringify(n));
      return await t.prepare(`INSERT INTO ${e.STATS_HOURLY_TABLE} (
				bucket_date, bucket_hour, request_count, play_count, playback_info_count, updated_at
			)
			SELECT json_extract(entry.value, '$.bucketDate'), CAST(json_extract(entry.value, '$.bucketHour') AS INTEGER),
				CAST(json_extract(entry.value, '$.requestCount') AS INTEGER), CAST(json_extract(entry.value, '$.playCount') AS INTEGER),
				CAST(json_extract(entry.value, '$.playbackInfoCount') AS INTEGER), ?
			FROM json_each(?) AS entry
			WHERE 1
			ON CONFLICT(bucket_date, bucket_hour) DO UPDATE SET
				request_count = ${e.STATS_HOURLY_TABLE}.request_count + excluded.request_count,
				play_count = ${e.STATS_HOURLY_TABLE}.play_count + excluded.play_count,
				playback_info_count = ${e.STATS_HOURLY_TABLE}.playback_info_count + excluded.playback_info_count,
				updated_at = excluded.updated_at`).bind(s, i).run(), !0;
    },
    async clearStatsHourly(t) {
      return !t || !await e.hasStatsHourlyTable(t) ? !1 : (await t.prepare(`DELETE FROM ${e.STATS_HOURLY_TABLE}`).run(), !0);
    },
    getStatsUtcOffsetMinutesFromStatus(t = {}) {
      const r = Number(t?.statsUtcOffsetMinutes);
      return Number.isFinite(r) ? Fe(r) : null;
    },
    async getDailyStatsHourly(t, r) {
      if (!t || !r || !await e.hasStatsHourlyTable(t)) return [];
      try {
        const a = await t.prepare(`SELECT bucket_hour, request_count, play_count, playback_info_count
              FROM ${e.STATS_HOURLY_TABLE}
              WHERE bucket_date = ?
              ORDER BY bucket_hour ASC`).bind(String(r)).all();
        return Array.isArray(a?.results) ? a.results : [];
      } catch {
        return [];
      }
    },
    async rebuildStatsHourlyForDate(t, r = {}) {
      if (!t) return !1;
      const a = String(r.bucketDate || "").trim();
      return a ? (await e.ensureStatsHourlySchema(t), await t.prepare(`DELETE FROM ${e.STATS_HOURLY_TABLE} WHERE bucket_date = ?`).bind(a).run(), !0) : !1;
    },
    async rebuildStatsHourlyWindow(t, r = {}) {
      return t ? (await e.ensureStatsHourlySchema(t), await e.clearStatsHourly(t), !0) : !1;
    },
    async ensureStatsHourlyWindowAligned(t, r = {}) {
      const a = e.resolveOpsStatusStores(t), n = a?.db || null;
      if (!n || !await e.hasStatsHourlyTable(n)) return {
        rebuilt: !1,
        reason: "stats_unavailable"
      };
      const s = ce(r.config || {}), i = Fe(s.scheduleUtcOffsetMinutes), c = await e.getOpsStatusSection(a, "log");
      if (e.getStatsUtcOffsetMinutesFromStatus(c) === i && r.force !== !0) return {
        rebuilt: !1,
        reason: "already_aligned",
        utcOffsetMinutes: i
      };
      const l = r.now instanceof Date ? r.now : /* @__PURE__ */ new Date(), u = fe(s.logRetentionDays, $.Defaults.LogRetentionDays, 1, $.Defaults.LogRetentionDaysMax), d = Math.max(0, l.getTime() - u * 24 * 60 * 60 * 1e3), f = l.getTime();
      return await e.rebuildStatsHourlyWindow(n, {
        startTs: d,
        endTs: f,
        utcOffsetMinutes: i
      }), await e.patchOpsStatus(a, { log: {
        schemaReady: !0,
        statsReady: !0,
        statsUtcOffsetMinutes: i,
        statsAlignedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
        statsAlignedWindowStartAt: new Date(d).toISOString(),
        statsAlignedWindowEndAt: new Date(f).toISOString()
      } }), {
        rebuilt: !0,
        utcOffsetMinutes: i,
        startTs: d,
        endTs: f
      };
    },
    getLegacyLogsFtsTriggerNames() {
      return new Set([
        String(e.LOGS_FTS_INSERT_TRIGGER || "").toLowerCase(),
        `${e.LOGS_TABLE}_ai`,
        `${e.LOGS_TABLE}_au`,
        `${e.LOGS_TABLE}_ad`,
        `${e.LOGS_FTS_TABLE}_ai`,
        `${e.LOGS_FTS_TABLE}_au`,
        `${e.LOGS_FTS_TABLE}_ad`
      ].map((t) => String(t || "").toLowerCase()));
    },
    isLogsFtsSyncTrigger(t) {
      const r = String(t?.name || "").trim();
      return r ? e.getLegacyLogsFtsTriggerNames().has(r.toLowerCase()) ? !0 : Pr(t?.sql || "").includes(e.LOGS_FTS_TABLE.toLowerCase()) : !1;
    },
    async dropLogsFtsSyncTriggers(t) {
      if (!t) return 0;
      let r = 0, a = [];
      try {
        a = (await t.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'trigger' AND tbl_name = ?").bind(e.LOGS_TABLE).all())?.results || [];
      } catch {
      }
      for (const n of a) {
        const s = String(n?.name || "").trim();
        s && e.isLogsFtsSyncTrigger(n) && (await t.prepare(`DROP TRIGGER IF EXISTS ${de(s)}`).run(), r += 1);
      }
      return r;
    },
    async rebuildLogsFts(t) {
      return !t || !await e.hasLogsFtsTable(t) ? !1 : (await t.prepare(`INSERT INTO ${e.LOGS_FTS_TABLE}(${e.LOGS_FTS_TABLE}) VALUES('rebuild')`).run(), !0);
    },
    async ensureLogsFtsSchema(t, r = {}) {
      if (!t) return {
        migratedRows: 0,
        droppedTriggers: 0,
        rebuilt: !1,
        recreated: !1
      };
      const a = r.forceRecreate === !0;
      r.baseSchemaReady !== !0 && await e.ensureLogsBaseSchema(t);
      const n = await e.getLogsFtsReadiness(t);
      if (n.ready && !a) return {
        migratedRows: 0,
        droppedTriggers: 0,
        rebuilt: !1,
        recreated: !1
      };
      if (n.tableReady && !a) {
        const l = /* @__PURE__ */ new Error("Existing FTS schema does not match the current contract");
        throw l.code = "D1_SCHEMA_INCOMPATIBLE", l.status = 409, l.details = { phase: "fts_preflight" }, l;
      }
      let s = !1, i = 0;
      a && (i = await e.dropLogsFtsSyncTriggers(t), await t.prepare(`DROP TABLE IF EXISTS ${e.LOGS_FTS_TABLE}`).run(), s = !0), await t.prepare(`CREATE VIRTUAL TABLE IF NOT EXISTS ${e.LOGS_FTS_TABLE} USING fts5(node_name, request_path, user_agent, error_detail, detail_json, content='${e.LOGS_TABLE}', content_rowid='id', tokenize='unicode61')`).run(), a && (i += await e.dropLogsFtsSyncTriggers(t)), await t.prepare(`CREATE TRIGGER IF NOT EXISTS ${e.LOGS_FTS_INSERT_TRIGGER} AFTER INSERT ON ${e.LOGS_TABLE} BEGIN
            INSERT INTO ${e.LOGS_FTS_TABLE}(rowid, node_name, request_path, user_agent, error_detail, detail_json)
            VALUES (new.id, new.node_name, new.request_path, COALESCE(new.user_agent, ''), COALESCE(new.error_detail, ''), COALESCE(new.detail_json, ''));
          END;`).run();
      const c = (await t.prepare(`SELECT COUNT(*) as total FROM ${e.LOGS_TABLE}`).first())?.total || 0;
      return await t.prepare(`INSERT INTO ${e.LOGS_FTS_TABLE}(${e.LOGS_FTS_TABLE}) VALUES('rebuild')`).run(), {
        migratedRows: c,
        droppedTriggers: i,
        rebuilt: !0,
        recreated: s
      };
    }
  };
}
function uy(o = {}, e = {}) {
  return {
    async ensureDnsIpWorkspaceSchema(t) {
      if (!t) return !1;
      if (e.isD1SchemaReadyCached(t, "dnsIpWorkspaceSchema")) return !0;
      let r = ee.DnsIpWorkspaceDbReady.get(t);
      r || (r = (async () => (await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.DNS_IP_POOL_ITEMS_TABLE} (
                id TEXT PRIMARY KEY,
                ip TEXT NOT NULL UNIQUE,
                ip_type TEXT NOT NULL,
                source_kind TEXT NOT NULL,
                source_label TEXT,
                line_label TEXT NOT NULL DEFAULT '',
                remark TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
              )`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_pool_items_updated_ip ON ${e.DNS_IP_POOL_ITEMS_TABLE} (updated_at DESC, ip ASC)`).run(), await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.DNS_IP_POOL_SOURCES_TABLE} (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                source_type TEXT NOT NULL DEFAULT 'url',
                domain TEXT,
                source_kind TEXT NOT NULL DEFAULT 'custom',
                preset_id TEXT NOT NULL DEFAULT '',
                builtin_id TEXT NOT NULL DEFAULT '',
                enabled INTEGER NOT NULL DEFAULT 1,
                sort_order INTEGER NOT NULL DEFAULT 0,
                ip_limit INTEGER NOT NULL DEFAULT 5,
                last_fetch_at TEXT,
                last_fetch_status TEXT,
                last_fetch_count INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
              )`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_pool_sources_sort ON ${e.DNS_IP_POOL_SOURCES_TABLE} (sort_order ASC, updated_at ASC)`).run(), await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.DNS_IP_POOL_FETCH_CACHE_TABLE} (
                signature TEXT PRIMARY KEY,
                items_json TEXT NOT NULL,
                source_results_json TEXT NOT NULL,
                imported_count INTEGER NOT NULL DEFAULT 0,
                enabled_source_count INTEGER NOT NULL DEFAULT 0,
                cached_at INTEGER NOT NULL,
                expires_at INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
              )`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_pool_fetch_cache_expires ON ${e.DNS_IP_POOL_FETCH_CACHE_TABLE} (expires_at)`).run(), await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.DNS_IP_PROBE_CACHE_TABLE} (
                ip TEXT NOT NULL,
                entry_colo TEXT NOT NULL,
                probe_status TEXT NOT NULL,
                latency_ms INTEGER,
                cf_ray TEXT,
                colo_code TEXT,
                city_name TEXT,
                country_code TEXT,
                country_name TEXT,
                probed_at TEXT NOT NULL,
                expires_at INTEGER NOT NULL,
                PRIMARY KEY (ip, entry_colo)
              )`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_probe_cache_expire ON ${e.DNS_IP_PROBE_CACHE_TABLE} (expires_at)`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_probe_cache_colo_ip_expires ON ${e.DNS_IP_PROBE_CACHE_TABLE} (entry_colo, ip, expires_at)`).run(), e.markD1SchemaReady(t, "dnsIpWorkspaceSchema"), !0))().catch((a) => {
        throw ee.DnsIpWorkspaceDbReady.delete(t), a;
      }), ee.DnsIpWorkspaceDbReady.set(t, r));
      try {
        return await r;
      } finally {
        ee.DnsIpWorkspaceDbReady.get(t) === r && ee.DnsIpWorkspaceDbReady.delete(t);
      }
    },
    getDnsIpPoolRevisionFromStatus(t = {}) {
      const r = String(t?.revision || "").trim();
      return r || Gt("dns_ip_pool", String(t?.updatedAt || "").trim());
    },
    async bumpDnsIpPoolRevision(t, r = {}, a = null) {
      const n = await e.getOpsStatusSection(t, "dnsIpPool"), s = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), i = ie(`${e.getDnsIpPoolRevisionFromStatus(n)}:${s}:${re(r)}`);
      return await e.patchOpsStatus(t, { dnsIpPool: {
        ...r,
        revision: Gt(i, s),
        updatedAt: s
      } }, a);
    },
    async getDnsIpPoolItems(t) {
      if (!t) return [];
      await e.ensureDnsIpWorkspaceSchema(t);
      try {
        const r = await t.prepare(`SELECT id, ip, ip_type, source_kind, source_label, line_label, remark, created_at, updated_at
              FROM ${e.DNS_IP_POOL_ITEMS_TABLE}
              ORDER BY updated_at DESC, ip ASC`).all();
        return (Array.isArray(r?.results) ? r.results : []).map((a) => _r(a)).filter(Boolean);
      } catch {
        return [];
      }
    },
    async upsertDnsIpPoolItems(t, r = [], a = {}) {
      if (!t) return [];
      await e.ensureDnsIpWorkspaceSchema(t);
      const n = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), s = /* @__PURE__ */ new Map();
      for (const u of Array.isArray(r) ? r : []) {
        const d = _r(u, {
          createdAt: n,
          updatedAt: n,
          sourceKind: a.sourceKind,
          sourceLabel: a.sourceLabel
        });
        d && s.set(d.ip.toLowerCase(), d);
      }
      const i = [...s.values()];
      if (!i.length) return [];
      const c = JSON.stringify(i.map((u) => ({
        id: u.id,
        ip: u.ip,
        ipType: u.ipType,
        sourceKind: u.sourceKind,
        sourceLabel: u.sourceLabel,
        lineLabel: u.lineLabel,
        remark: u.remark,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      })));
      en("dns_ip_pool_items.batch", c);
      const l = t.prepare(`INSERT INTO ${e.DNS_IP_POOL_ITEMS_TABLE} (
            id, ip, ip_type, source_kind, source_label, line_label, remark, created_at, updated_at
          )
          SELECT
            json_extract(entry.value, '$.id'),
            json_extract(entry.value, '$.ip'),
            json_extract(entry.value, '$.ipType'),
            json_extract(entry.value, '$.sourceKind'),
            json_extract(entry.value, '$.sourceLabel'),
            json_extract(entry.value, '$.lineLabel'),
            json_extract(entry.value, '$.remark'),
            json_extract(entry.value, '$.createdAt'),
            json_extract(entry.value, '$.updatedAt')
          FROM json_each(?) AS entry
          WHERE 1
          ON CONFLICT(ip) DO UPDATE SET
            ip_type = excluded.ip_type,
            source_kind = excluded.source_kind,
            source_label = excluded.source_label,
            line_label = CASE WHEN COALESCE(excluded.line_label, '') != '' THEN excluded.line_label ELSE ${e.DNS_IP_POOL_ITEMS_TABLE}.line_label END,
            remark = CASE WHEN COALESCE(excluded.remark, '') != '' THEN excluded.remark ELSE ${e.DNS_IP_POOL_ITEMS_TABLE}.remark END,
            updated_at = excluded.updated_at`).bind(c);
      return await t.batch([l]), i;
    },
    async deleteDnsIpPoolItems(t, r = []) {
      if (!t) return 0;
      await e.ensureDnsIpWorkspaceSchema(t);
      const a = [...new Set((Array.isArray(r) ? r : []).map((s) => String(s || "").trim()).filter((s) => Qe(s)))];
      if (!a.length) return 0;
      const n = JSON.stringify(a);
      return en("dns_ip_pool_items.delete_batch", n), await t.batch([t.prepare(`DELETE FROM ${e.DNS_IP_POOL_ITEMS_TABLE} WHERE ip IN (SELECT value FROM json_each(?))`).bind(n), t.prepare(`DELETE FROM ${e.DNS_IP_PROBE_CACHE_TABLE} WHERE ip IN (SELECT value FROM json_each(?))`).bind(n)]), a.length;
    },
    async getDnsIpPoolSourcesFromDb(t, r = {}) {
      if (!t) return [];
      r.schemaReady !== !0 && await e.ensureDnsIpWorkspaceSchema(t);
      try {
        const a = await t.prepare(`SELECT id, name, url, source_type, domain, source_kind, preset_id, builtin_id, enabled, sort_order, ip_limit, last_fetch_at, last_fetch_status, last_fetch_count, created_at, updated_at
              FROM ${e.DNS_IP_POOL_SOURCES_TABLE}
              ORDER BY sort_order ASC, updated_at ASC`).all();
        return (Array.isArray(a?.results) ? a.results : []).map((n, s) => vt(n, s)).filter((n) => fr(n));
      } catch {
        return [];
      }
    },
    async getDnsIpPoolSourcesFromDbStrict(t) {
      if (!t) throw new Error("D1 not configured");
      await e.ensureDnsIpWorkspaceSchema(t);
      const r = await t.prepare(`SELECT id, name, url, source_type, domain, source_kind, preset_id, builtin_id, enabled, sort_order, ip_limit, last_fetch_at, last_fetch_status, last_fetch_count, created_at, updated_at
            FROM ${e.DNS_IP_POOL_SOURCES_TABLE}
            ORDER BY sort_order ASC, updated_at ASC`).all();
      return (Array.isArray(r?.results) ? r.results : []).map((a, n) => vt(a, n)).filter((a) => fr(a));
    },
    async getDnsIpPoolSources(t) {
      const r = e.resolveOpsStatusStores(t)?.db || null;
      return await e.getDnsIpPoolSourcesFromDb(r);
    },
    async getDnsIpPoolSourcesForRead(t) {
      const r = e.resolveOpsStatusStores(t)?.db || null;
      return await e.getDnsIpPoolSourcesFromDb(r);
    },
    async persistDnsIpPoolSources(t, r = [], a = null) {
      const n = (Array.isArray(r) ? r : []).map((c, l) => vt(c, l)).filter((c) => fr(c)), s = e.resolveOpsStatusStores(t)?.db || null;
      if (!s) throw new Error("D1 not configured");
      await e.ensureDnsIpWorkspaceSchema(s);
      const i = [s.prepare(`DELETE FROM ${e.DNS_IP_POOL_SOURCES_TABLE}`)];
      if (n.length) {
        const c = JSON.stringify(n.map((l) => ({
          id: l.id,
          name: l.name,
          url: l.url,
          sourceType: l.sourceType,
          domain: l.domain,
          sourceKind: l.sourceKind,
          presetId: l.presetId,
          builtinId: l.builtinId,
          enabled: l.enabled ? 1 : 0,
          sortOrder: l.sortOrder,
          ipLimit: l.ipLimit,
          lastFetchAt: l.lastFetchAt,
          lastFetchStatus: l.lastFetchStatus,
          lastFetchCount: l.lastFetchCount,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt
        })));
        en("dns_ip_pool_sources.batch", c), i.push(s.prepare(`INSERT INTO ${e.DNS_IP_POOL_SOURCES_TABLE} (
            id, name, url, source_type, domain, source_kind, preset_id, builtin_id, enabled, sort_order, ip_limit, last_fetch_at, last_fetch_status, last_fetch_count, created_at, updated_at
          ) SELECT
            json_extract(entry.value, '$.id'),
            json_extract(entry.value, '$.name'),
            json_extract(entry.value, '$.url'),
            json_extract(entry.value, '$.sourceType'),
            json_extract(entry.value, '$.domain'),
            json_extract(entry.value, '$.sourceKind'),
            json_extract(entry.value, '$.presetId'),
            json_extract(entry.value, '$.builtinId'),
            json_extract(entry.value, '$.enabled'),
            json_extract(entry.value, '$.sortOrder'),
            json_extract(entry.value, '$.ipLimit'),
            json_extract(entry.value, '$.lastFetchAt'),
            json_extract(entry.value, '$.lastFetchStatus'),
            json_extract(entry.value, '$.lastFetchCount'),
            json_extract(entry.value, '$.createdAt'),
            json_extract(entry.value, '$.updatedAt')
          FROM json_each(?) AS entry`).bind(c));
      }
      return await s.batch(i), n;
    },
    async updateDnsIpPoolSourceFetchState(t, r = "", a = {}) {
      if (!t || !r) return !1;
      await e.ensureDnsIpWorkspaceSchema(t);
      const n = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString();
      return await t.prepare(`UPDATE ${e.DNS_IP_POOL_SOURCES_TABLE}
            SET last_fetch_at = ?, last_fetch_status = ?, last_fetch_count = ?, updated_at = ?
            WHERE id = ?`).bind(String(a.lastFetchAt || n), String(a.lastFetchStatus || ""), Math.max(0, Number(a.lastFetchCount) || 0), n, String(r)).run(), !0;
    },
    async getDnsIpPoolFetchCacheEntry(t, r = "") {
      if (!t || !r) return null;
      await e.ensureDnsIpWorkspaceSchema(t);
      try {
        const a = await t.prepare(`SELECT signature, items_json, source_results_json, imported_count, enabled_source_count, cached_at, expires_at, created_at, updated_at
              FROM ${e.DNS_IP_POOL_FETCH_CACHE_TABLE}
              WHERE signature = ? AND expires_at > ?
              LIMIT 1`).bind(String(r), B()).first();
        if (!a) return null;
        const n = JSON.parse(String(a.items_json || "[]")), s = JSON.parse(String(a.source_results_json || "[]")), i = br(Array.isArray(n) ? n : []), c = Array.isArray(s) ? s : [];
        return {
          signature: String(a.signature || ""),
          items: i,
          sourceResults: c,
          importedCount: Math.max(0, Number(a.imported_count) || i.length),
          enabledSourceCount: Math.max(0, Number(a.enabled_source_count) || 0),
          cachedAtMs: Math.max(0, Number(a.cached_at) || 0),
          expiresAtMs: Math.max(0, Number(a.expires_at) || 0),
          createdAt: String(a.created_at || ""),
          updatedAt: String(a.updated_at || "")
        };
      } catch {
        return null;
      }
    },
    async upsertDnsIpPoolFetchCacheEntry(t, r = {}) {
      if (!t) return null;
      await e.ensureDnsIpWorkspaceSchema(t);
      const a = String(r?.signature || "").trim();
      if (!a) return null;
      const n = br(r?.items || []), s = (Array.isArray(r?.sourceResults) ? r.sourceResults : []).map((h) => Yi(h, h)), i = Math.max(0, Number(r?.cachedAtMs ?? r?.cached_at ?? B()) || B()), c = Math.max(i, Number(r?.expiresAtMs ?? r?.expires_at ?? i + 24e5) || i + 24e5), l = String(r?.createdAt || r?.created_at || new Date(i).toISOString()), u = String(r?.updatedAt || r?.updated_at || new Date(i).toISOString()), d = Math.max(0, Number(r?.importedCount ?? r?.imported_count) || n.length), f = Math.max(0, Number(r?.enabledSourceCount ?? r?.enabled_source_count) || 0), m = JSON.stringify(n), p = JSON.stringify(s);
      return ve(m) + ve(p) > er ? null : (await t.prepare(`INSERT INTO ${e.DNS_IP_POOL_FETCH_CACHE_TABLE} (
            signature, items_json, source_results_json, imported_count, enabled_source_count, cached_at, expires_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(signature) DO UPDATE SET
            items_json = excluded.items_json,
            source_results_json = excluded.source_results_json,
            imported_count = excluded.imported_count,
            enabled_source_count = excluded.enabled_source_count,
            cached_at = excluded.cached_at,
            expires_at = excluded.expires_at,
				updated_at = excluded.updated_at`).bind(a, m, p, d, f, i, c, l, u).run(), {
        signature: a,
        items: n,
        sourceResults: s,
        importedCount: d,
        enabledSourceCount: f,
        cachedAtMs: i,
        expiresAtMs: c,
        createdAt: l,
        updatedAt: u
      });
    },
    async getDnsIpProbeCacheEntry(t, r = "", a = "") {
      if (!t || !r || !a) return null;
      await e.ensureDnsIpWorkspaceSchema(t);
      try {
        const n = await t.prepare(`SELECT ip, entry_colo, probe_status, latency_ms, cf_ray, colo_code, city_name, country_code, country_name, probed_at, expires_at
              FROM ${e.DNS_IP_PROBE_CACHE_TABLE}
              WHERE ip = ? AND entry_colo = ? AND expires_at > ?
              LIMIT 1`).bind(String(r), String(a).toUpperCase(), B()).first();
        return n ? {
          ip: String(n.ip || ""),
          entryColo: String(n.entry_colo || "").toUpperCase(),
          probeStatus: Qa(n.probe_status),
          latencyMs: Number.isFinite(Number(n.latency_ms)) ? Math.round(Number(n.latency_ms)) : null,
          cfRay: String(n.cf_ray || ""),
          coloCode: String(n.colo_code || "").toUpperCase(),
          cityName: String(n.city_name || ""),
          countryCode: String(n.country_code || "").toUpperCase(),
          countryName: String(n.country_name || ""),
          probedAt: String(n.probed_at || ""),
          expiresAt: Math.max(0, Number(n.expires_at) || 0)
        } : null;
      } catch {
        return null;
      }
    },
    async getDnsIpProbeCacheEntries(t, r = [], a = "") {
      if (!t || !a) return [];
      const n = [...new Set((Array.isArray(r) ? r : []).map((c) => String(c || "").trim()).filter(Boolean))];
      if (!n.length) return [];
      await e.ensureDnsIpWorkspaceSchema(t);
      const s = [], i = B();
      try {
        for (let c = 0; c < n.length; c += 98) {
          const l = n.slice(c, c + 98);
          if (!l.length) continue;
          const u = l.map(() => "?").join(", "), d = await t.prepare(`SELECT ip, entry_colo, probe_status, latency_ms, cf_ray, colo_code, city_name, country_code, country_name, probed_at, expires_at
                FROM ${e.DNS_IP_PROBE_CACHE_TABLE}
                WHERE entry_colo = ? AND expires_at > ? AND ip IN (${u})`).bind(String(a).toUpperCase(), i, ...l).all();
          s.push(...Array.isArray(d?.results) ? d.results : []);
        }
      } catch {
        return [];
      }
      return s.map((c) => ({
        ip: String(c?.ip || ""),
        entryColo: String(c?.entry_colo || "").toUpperCase(),
        probeStatus: Qa(c?.probe_status),
        latencyMs: Number.isFinite(Number(c?.latency_ms)) ? Math.round(Number(c?.latency_ms)) : null,
        cfRay: String(c?.cf_ray || ""),
        coloCode: String(c?.colo_code || "").toUpperCase(),
        cityName: String(c?.city_name || ""),
        countryCode: String(c?.country_code || "").toUpperCase(),
        countryName: String(c?.country_name || ""),
        probedAt: String(c?.probed_at || ""),
        expiresAt: Math.max(0, Number(c?.expires_at) || 0)
      }));
    },
    async upsertDnsIpProbeCacheEntries(t, r = []) {
      if (!t) return [];
      await e.ensureDnsIpWorkspaceSchema(t);
      const a = (Array.isArray(r) ? r : []).map((s) => ({
        ip: String(s?.ip || "").trim(),
        entryColo: String(s?.entryColo || s?.entry_colo || "").trim().toUpperCase(),
        probeStatus: Qa(s?.probeStatus || s?.probe_status || ""),
        latencyMs: Number.isFinite(Number(s?.latencyMs ?? s?.latency_ms)) ? Math.round(Number(s?.latencyMs ?? s?.latency_ms)) : null,
        cfRay: String(s?.cfRay || s?.cf_ray || ""),
        coloCode: String(s?.coloCode || s?.colo_code || "").toUpperCase(),
        cityName: String(s?.cityName || s?.city_name || ""),
        countryCode: String(s?.countryCode || s?.country_code || "").toUpperCase(),
        countryName: String(s?.countryName || s?.country_name || ""),
        probedAt: String(s?.probedAt || s?.probed_at || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()),
        expiresAt: Math.max(B(), Number(s?.expiresAt ?? s?.expires_at) || 0)
      })).filter((s) => Qe(s.ip) && s.entryColo);
      if (!a.length) return [];
      const n = JSON.stringify(a);
      return ve(n) > er ? [] : (await t.prepare(`INSERT INTO ${e.DNS_IP_PROBE_CACHE_TABLE} (
				ip, entry_colo, probe_status, latency_ms, cf_ray, colo_code, city_name, country_code, country_name, probed_at, expires_at
			) SELECT
				json_extract(entry.value, '$.ip'),
				json_extract(entry.value, '$.entryColo'),
				json_extract(entry.value, '$.probeStatus'),
				json_extract(entry.value, '$.latencyMs'),
				json_extract(entry.value, '$.cfRay'),
				json_extract(entry.value, '$.coloCode'),
				json_extract(entry.value, '$.cityName'),
				json_extract(entry.value, '$.countryCode'),
				json_extract(entry.value, '$.countryName'),
				json_extract(entry.value, '$.probedAt'),
				json_extract(entry.value, '$.expiresAt')
			FROM json_each(?) AS entry
			WHERE 1
			ON CONFLICT(ip, entry_colo) DO UPDATE SET
            probe_status = excluded.probe_status,
            latency_ms = excluded.latency_ms,
            cf_ray = excluded.cf_ray,
            colo_code = excluded.colo_code,
            city_name = excluded.city_name,
            country_code = excluded.country_code,
            country_name = excluded.country_name,
            probed_at = excluded.probed_at,
				expires_at = excluded.expires_at`).bind(n).run(), a);
    },
    async upsertDnsIpProbeCacheEntry(t, r = {}) {
      return (await e.upsertDnsIpProbeCacheEntries(t, [r]))[0] || null;
    }
  };
}
function dy(o = {}, e = {}) {
  return {
    resolveOpsStatusStores(t) {
      return t && typeof t == "object" && !Array.isArray(t) && ("kv" in t || "db" in t) ? {
        kv: t.kv || null,
        db: t.db || null
      } : t && typeof t.prepare == "function" ? {
        kv: null,
        db: t
      } : t && typeof t.get == "function" ? {
        kv: t,
        db: null
      } : {
        kv: e.getKV(t),
        db: e.getDB(t)
      };
    },
    getOpsStatusDbScope(t = "") {
      return t ? e.OPS_STATUS_SECTION_SCOPES[t] || `ops_status:${t}` : e.OPS_STATUS_DB_SCOPE_ROOT;
    },
    getOpsStatusShadowState(t) {
      if (!t || typeof t.prepare != "function") return null;
      let r = ee.OpsStatusShadowCache.get(t);
      return r || (r = {
        pendingPatch: {},
        flushPromise: null,
        payloadCache: /* @__PURE__ */ new Map()
      }, ee.OpsStatusShadowCache.set(t, r)), r;
    },
    getOpsStatusShadowPatch(t) {
      const r = e.getOpsStatusShadowState(t);
      return H(r?.pendingPatch) ? r.pendingPatch : {};
    },
    getOpsStatusPayloadCache(t) {
      const r = e.getOpsStatusShadowState(t);
      return r ? (r.payloadCache instanceof Map || (r.payloadCache = /* @__PURE__ */ new Map()), r.payloadCache) : null;
    },
    cacheOpsStatusPayload(t, r, a) {
      const n = e.getOpsStatusPayloadCache(t);
      n && He(n, String(r || ""), {
        payload: a && typeof a == "object" ? a : null,
        expiresAt: B() + Math.max(1e3, Number($.Defaults.OpsStatusReadCacheTtlMs) || 1e3)
      }, 8);
    },
    buildOpsStatusRootPatch(t = {}) {
      const r = t && typeof t == "object" ? t : {}, a = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), n = {};
      for (const [s, i] of Object.entries(r)) {
        if (e.OPS_STATUS_SECTION_SCOPES[s]) {
          const c = Je(n[s], i);
          c.updatedAt = a, n[s] = c;
          continue;
        }
        n[s] = i;
      }
      return n;
    },
    async flushOpsStatusShadow(t, r = {}) {
      const a = t?.db || null;
      if (!a) return {};
      const n = Array.isArray(r.patchKeys) ? r.patchKeys : [], s = e.getOpsStatusShadowState(a);
      if (!s) return {};
      if (s.flushPromise) return s.flushPromise;
      const i = (async () => {
        const c = H(s.pendingPatch) ? s.pendingPatch : {};
        if (!Object.keys(c).length) return await e.getOpsStatusFromStores(t);
        s.pendingPatch = {};
        try {
          const l = B(), u = new Date(l).toISOString();
          if (!await e.ensureSysStatusTable(a))
            return Le("ops_status.db_unavailable", /* @__PURE__ */ new Error("sys_status table unavailable"), { patchKeys: n }), s.pendingPatch = Je(c, s.pendingPatch), await e.getOpsStatusFromStores(t);
          const d = await e.getOpsStatusPayloadFromDb(a, e.getOpsStatusDbScope()), f = Je(d && typeof d == "object" ? d : {}, c);
          return f.updatedAt = u, await e.putOpsStatusPayloadToDb(a, e.getOpsStatusDbScope(), f, l), Je(f, e.getOpsStatusShadowPatch(a));
        } catch (l) {
          throw s.pendingPatch = Je(c, s.pendingPatch), l;
        }
      })().finally(() => {
        s.flushPromise === i && (s.flushPromise = null);
      });
      return s.flushPromise = i, i;
    },
    async ensureSysStatusTable(t) {
      if (!t || typeof t.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(t, "sysStatusTable")) return !0;
      let r = ee.OpsStatusDbReady.get(t);
      r || (r = (async () => {
        try {
          return await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.SYS_STATUS_TABLE} (scope TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at INTEGER NOT NULL)`).run(), e.markD1SchemaReady(t, "sysStatusTable"), !0;
        } catch (a) {
          return console.warn("sys_status init failed", a), !1;
        }
      })(), ee.OpsStatusDbReady.set(t, r));
      try {
        return await r;
      } finally {
        ee.OpsStatusDbReady.get(t) === r && ee.OpsStatusDbReady.delete(t);
      }
    },
    async ensureAuthFailuresTable(t) {
      if (!t || typeof t.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(t, "authFailuresTable")) return !0;
      let r = ee.AuthFailuresDbReady.get(t);
      r || (r = (async () => {
        try {
          return await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.AUTH_FAILURES_TABLE} (
                  ip TEXT PRIMARY KEY,
                  fail_count INTEGER NOT NULL,
                  expires_at INTEGER NOT NULL,
                  updated_at INTEGER NOT NULL
                )`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_auth_failures_expires_at ON ${e.AUTH_FAILURES_TABLE} (expires_at)`).run(), e.markD1SchemaReady(t, "authFailuresTable"), !0;
        } catch (a) {
          return console.warn("auth_failures init failed", a), !1;
        }
      })(), ee.AuthFailuresDbReady.set(t, r));
      try {
        return await r;
      } finally {
        ee.AuthFailuresDbReady.get(t) === r && ee.AuthFailuresDbReady.delete(t);
      }
    },
    async getAuthFailureEntry(t, r = "") {
      const a = String(r || "").trim();
      if (!a || !t || !await e.ensureAuthFailuresTable(t)) return null;
      try {
        const n = await t.prepare(`SELECT ip, fail_count, expires_at, updated_at
              FROM ${e.AUTH_FAILURES_TABLE}
              WHERE ip = ?
              LIMIT 1`).bind(a).first();
        if (!n) return null;
        const s = Number(n?.expires_at ?? n?.expiresAt) || 0;
        return s > 0 && s <= B() ? (await e.deleteAuthFailureEntry(t, a).catch(() => !1), null) : {
          ip: a,
          failCount: Math.max(0, Number(n?.fail_count ?? n?.failCount) || 0),
          expiresAt: s,
          updatedAt: Number(n?.updated_at ?? n?.updatedAt) || 0
        };
      } catch (n) {
        return Le("auth_failures.read_failed", n, { ip: a }), null;
      }
    },
    async upsertAuthFailureEntry(t, r = "", a = {}) {
      const n = String(r || "").trim();
      if (!n || !t || !await e.ensureAuthFailuresTable(t)) return null;
      const s = Math.max(0, Number(a?.failCount) || 0), i = Math.max(0, Number(a?.expiresAt) || 0), c = Math.max(0, Number(a?.updatedAt) || B());
      return await t.prepare(`INSERT INTO ${e.AUTH_FAILURES_TABLE} (ip, fail_count, expires_at, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(ip) DO UPDATE SET
              fail_count = excluded.fail_count,
              expires_at = excluded.expires_at,
              updated_at = excluded.updated_at`).bind(n, s, i, c).run(), {
        ip: n,
        failCount: s,
        expiresAt: i,
        updatedAt: c
      };
    },
    async deleteAuthFailureEntry(t, r = "") {
      const a = String(r || "").trim();
      return !a || !t || !await e.ensureAuthFailuresTable(t) ? !1 : (await t.prepare(`DELETE FROM ${e.AUTH_FAILURES_TABLE} WHERE ip = ?`).bind(a).run(), !0);
    }
  };
}
function fy(o = {}, e = {}) {
  return {
    async ensureCfDashboardCacheTable(t) {
      if (!t || typeof t.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(t, "cfDashboardCacheTable")) return !0;
      let r = ee.CfDashboardCacheDbReady.get(t);
      r || (r = (async () => {
        try {
          return await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.CF_DASH_CACHE_TABLE} (
                  cache_key TEXT PRIMARY KEY,
                  zone_id TEXT NOT NULL,
                  bucket_date TEXT NOT NULL,
                  payload TEXT NOT NULL,
                  version INTEGER NOT NULL,
                  cached_at INTEGER NOT NULL,
                  expires_at INTEGER NOT NULL,
                  updated_at INTEGER NOT NULL
                )`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_cf_dashboard_cache_expires_at ON ${e.CF_DASH_CACHE_TABLE} (expires_at)`).run(), e.markD1SchemaReady(t, "cfDashboardCacheTable"), !0;
        } catch (a) {
          return console.warn("cf_dashboard_cache init failed", a), !1;
        }
      })(), ee.CfDashboardCacheDbReady.set(t, r));
      try {
        return await r;
      } finally {
        ee.CfDashboardCacheDbReady.get(t) === r && ee.CfDashboardCacheDbReady.delete(t);
      }
    },
    async getCfDashboardCacheEntry(t, r = "", a = {}) {
      const n = String(r || "").trim();
      if (!n || !t || !await e.ensureCfDashboardCacheTable(t)) return null;
      const s = Math.max(0, Number(a.nowMs) || B()), i = a.includeExpired === !0, c = i ? `SELECT cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
                FROM ${e.CF_DASH_CACHE_TABLE}
                WHERE cache_key = ?
                LIMIT 1` : `SELECT cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
                FROM ${e.CF_DASH_CACHE_TABLE}
                WHERE cache_key = ? AND expires_at > ?
                LIMIT 1`;
      try {
        let l = t.prepare(c).bind(n);
        i || (l = t.prepare(c).bind(n, s));
        const u = await l.first();
        if (!u?.payload) return null;
        let d = null;
        try {
          d = JSON.parse(String(u.payload || "{}"));
        } catch {
          return null;
        }
        return {
          cacheKey: n,
          zoneId: String(u?.zone_id || u?.zoneId || ""),
          bucketDate: String(u?.bucket_date || u?.bucketDate || ""),
          payload: Co(d),
          version: Number(u?.version) || 0,
          cachedAt: Number(u?.cached_at ?? u?.cachedAt) || 0,
          expiresAt: Number(u?.expires_at ?? u?.expiresAt) || 0,
          updatedAt: Number(u?.updated_at ?? u?.updatedAt) || 0
        };
      } catch (l) {
        return Le("cf_dashboard_cache.read_failed", l, { cacheKey: n }), null;
      }
    },
    async putCfDashboardCacheEntry(t, r = {}) {
      if (!t || !await e.ensureCfDashboardCacheTable(t)) return null;
      const a = String(r?.cacheKey || "").trim();
      if (!a) return null;
      const n = String(r?.zoneId || "").trim() || "default", s = String(r?.bucketDate || "").trim() || "current", i = Math.max(0, Number(r?.version) || 0), c = Math.max(0, Number(r?.cachedAt) || B()), l = Math.max(c, Number(r?.expiresAt) || c), u = Math.max(c, Number(r?.updatedAt) || c), d = JSON.stringify(Co(r?.payload || {}));
      return ve(d) > er ? null : (await t.prepare(`INSERT INTO ${e.CF_DASH_CACHE_TABLE} (
            cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(cache_key) DO UPDATE SET
            zone_id = excluded.zone_id,
            bucket_date = excluded.bucket_date,
            payload = excluded.payload,
            version = excluded.version,
            cached_at = excluded.cached_at,
            expires_at = excluded.expires_at,
            updated_at = excluded.updated_at`).bind(a, n, s, d, i, c, l, u).run(), {
        cacheKey: a,
        zoneId: n,
        bucketDate: s,
        version: i,
        cachedAt: c,
        expiresAt: l,
        updatedAt: u
      });
    },
    async deleteCfDashboardCacheEntry(t, r = "") {
      const a = String(r || "").trim();
      if (!a || !t || !await e.ensureCfDashboardCacheTable(t)) return !1;
      try {
        return await t.prepare(`DELETE FROM ${e.CF_DASH_CACHE_TABLE} WHERE cache_key = ?`).bind(a).run(), !0;
      } catch (n) {
        return Le("cf_dashboard_cache.delete_failed", n, { cacheKey: a }), !1;
      }
    },
    async invalidateDashboardSnapshotCacheForConfigChange(t, r = {}) {
      const a = r?.db || e.getDB(t);
      if (!a) return 0;
      const n = Math.max(0, Number(r.nowMs) || B()), s = /* @__PURE__ */ new Set();
      for (const i of [r?.prevConfig, r?.nextConfig]) {
        if (!i || typeof i != "object") continue;
        const c = ce(i), l = dt(new Date(n), c.scheduleUtcOffsetMinutes);
        s.add(To(c.cfZoneId, l.dateKey));
      }
      return s.size ? (await ge(Promise.all([...s].map((i) => e.deleteCfDashboardCacheEntry(a, i))), "dashboard.cache_invalidate", { cacheKeys: [...s] }, null), s.size) : 0;
    },
    async ensureCfRuntimeCacheTable(t) {
      if (!t || typeof t.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(t, "cfRuntimeCacheTable")) return !0;
      let r = ee.CfRuntimeCacheDbReady.get(t);
      r || (r = (async () => {
        try {
          return await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.CF_RUNTIME_CACHE_TABLE} (
                  cache_key TEXT PRIMARY KEY,
                  cache_group TEXT NOT NULL,
                  resource_id TEXT NOT NULL,
                  payload TEXT NOT NULL,
                  cached_at INTEGER NOT NULL,
                  expires_at INTEGER NOT NULL,
                  updated_at INTEGER NOT NULL
                )`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_cf_runtime_cache_expires_at ON ${e.CF_RUNTIME_CACHE_TABLE} (expires_at)`).run(), e.markD1SchemaReady(t, "cfRuntimeCacheTable"), !0;
        } catch (a) {
          return console.warn("cf_runtime_cache init failed", a), !1;
        }
      })(), ee.CfRuntimeCacheDbReady.set(t, r));
      try {
        return await r;
      } finally {
        ee.CfRuntimeCacheDbReady.get(t) === r && ee.CfRuntimeCacheDbReady.delete(t);
      }
    },
    async getCfRuntimeCacheEntry(t, r = "", a = {}) {
      const n = String(r || "").trim();
      if (!n || !t || !await e.ensureCfRuntimeCacheTable(t)) return null;
      const s = Math.max(0, Number(a.nowMs) || B()), i = a.includeExpired === !0, c = i ? `SELECT cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
                FROM ${e.CF_RUNTIME_CACHE_TABLE}
                WHERE cache_key = ?
                LIMIT 1` : `SELECT cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
                FROM ${e.CF_RUNTIME_CACHE_TABLE}
                WHERE cache_key = ? AND expires_at > ?
                LIMIT 1`;
      try {
        let l = t.prepare(c).bind(n);
        i || (l = t.prepare(c).bind(n, s));
        const u = await l.first();
        if (!u?.payload) return null;
        let d = null;
        try {
          d = JSON.parse(String(u.payload || "{}"));
        } catch {
          return null;
        }
        return {
          cacheKey: n,
          cacheGroup: String(u?.cache_group || u?.cacheGroup || ""),
          resourceId: String(u?.resource_id || u?.resourceId || ""),
          payload: (H(d), d),
          cachedAt: Number(u?.cached_at ?? u?.cachedAt) || 0,
          expiresAt: Number(u?.expires_at ?? u?.expiresAt) || 0,
          updatedAt: Number(u?.updated_at ?? u?.updatedAt) || 0
        };
      } catch (l) {
        return Le("cf_runtime_cache.read_failed", l, { cacheKey: n }), null;
      }
    },
    async putCfRuntimeCacheEntry(t, r = {}) {
      if (!t || !await e.ensureCfRuntimeCacheTable(t)) return null;
      const a = String(r?.cacheKey || "").trim();
      if (!a) return null;
      const n = String(r?.cacheGroup || "").trim() || "runtime", s = String(r?.resourceId || "").trim() || "default", i = Math.max(0, Number(r?.cachedAt) || B()), c = Math.max(i, Number(r?.expiresAt) || i), l = Math.max(i, Number(r?.updatedAt) || i), u = JSON.stringify(r?.payload ?? {});
      return ve(u) > er ? null : (await t.prepare(`INSERT INTO ${e.CF_RUNTIME_CACHE_TABLE} (
            cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(cache_key) DO UPDATE SET
            cache_group = excluded.cache_group,
            resource_id = excluded.resource_id,
            payload = excluded.payload,
            cached_at = excluded.cached_at,
            expires_at = excluded.expires_at,
            updated_at = excluded.updated_at`).bind(a, n, s, u, i, c, l).run(), {
        cacheKey: a,
        cacheGroup: n,
        resourceId: s,
        cachedAt: i,
        expiresAt: c,
        updatedAt: l
      });
    },
    async loadCfRuntimeCachePayload(t, r = {}) {
      const a = String(r.cacheKey || "").trim(), n = String(r.cacheGroup || "").trim() || "runtime", s = String(r.resourceId || "").trim() || "default", i = Math.max(1e3, Number(r.ttlMs) || 3e5), c = Math.max(0, Number(r.nowMs) || B()), l = r.skipCacheRead === !0, u = typeof r.loader == "function" ? r.loader : null;
      if (!a || !u) throw new Error("cf_runtime_cache_loader_missing");
      const d = t ? await e.getCfRuntimeCacheEntry(t, a, {
        nowMs: c,
        includeExpired: !0
      }) : null, f = !l && d && d.expiresAt > c ? d : null;
      if (f?.payload !== void 0) return {
        payload: f.payload,
        cachedAt: f.cachedAt,
        expiresAt: f.expiresAt,
        updatedAt: f.updatedAt,
        stale: !1,
        source: "d1_cache",
        error: null
      };
      const m = d;
      try {
        return {
          payload: await Xt(mt([
            "cf_runtime",
            n,
            a
          ]), async () => {
            const p = await u();
            return t && await ge(e.putCfRuntimeCacheEntry(t, {
              cacheKey: a,
              cacheGroup: n,
              resourceId: s,
              payload: p,
              cachedAt: c,
              expiresAt: c + i,
              updatedAt: c
            }), "cf_runtime_cache.write", {
              cacheKey: a,
              cacheGroup: n,
              resourceId: s
            }, null), p;
          }),
          cachedAt: c,
          expiresAt: c + i,
          updatedAt: c,
          stale: !1,
          source: t ? "live_then_cached" : "live",
          error: null
        };
      } catch (p) {
        if (m?.payload !== void 0 && r.allowStale !== !1) return {
          payload: m.payload,
          cachedAt: m.cachedAt,
          expiresAt: m.expiresAt,
          updatedAt: m.updatedAt,
          stale: !0,
          source: "stale_cache",
          error: p
        };
        throw p;
      }
    }
  };
}
function my(o = {}, e = {}) {
  return {
    buildCloudflareKvQuotaCard({ planProfile: t = {}, planState: r = {}, usageState: a = {}, namespaceId: n = "", nowTimestamp: s = B() } = {}) {
      const i = Ma(t?.planClass), c = H(a?.payload) ? a.payload : {}, l = String(c.namespaceTitle || t?.resourceMeta?.kv?.namespaceTitle || n || "未命名 Namespace").trim(), u = [
        Lr({
          key: "read",
          label: "读",
          used: c.readCount,
          limit: i.kv.read,
          kind: "count"
        }),
        Lr({
          key: "write",
          label: "写",
          used: c.writeCount,
          limit: i.kv.write,
          kind: "count"
        }),
        Lr({
          key: "storage",
          label: "容量",
          used: c.storageBytes,
          limit: i.kv.storageBytes,
          kind: "bytes"
        })
      ], d = [];
      r?.stale === !0 && d.push("计划信息"), a?.stale === !0 && d.push("实时指标");
      const f = [];
      d.length > 0 && f.push(`${d.join("、")} 使用 stale cache`), f.push(`delete：${Se(c.deleteCount)} / ${Se(i.kv.delete)}`), f.push(`list：${Se(c.listCount)} / ${Se(i.kv.list)}`), f.push(`命名空间：${l}`);
      const m = Xs(a?.cachedAt, s);
      m && f.push(m), f.push(i.planClass === "paid" ? "容量条按 1 GB included quota 展示，PAID 下这是 included quota，不是硬停止线" : "容量条按 1 GB included quota 展示");
      const p = Ys(u);
      return p.length > 0 && f.push(`超额项目：${p.join("、")}（进度条按 100% 封顶）`), a?.error && f.push(`Cloudflare 详情：${Wt(a.error)}`), hn({
        title: "KV",
        status: d.length > 0 ? "partial_failure" : "success",
        summary: `${i.planLabel} 计划 · ${i.periodLabel}配额`,
        detail: f.join("；"),
        planLabel: i.planLabel,
        periodLabel: i.periodLabel,
        resourceLabel: l,
        metrics: u
      });
    },
    buildCloudflareD1QuotaCard({ planProfile: t = {}, planState: r = {}, usageState: a = {}, databaseId: n = "", nowTimestamp: s = B() } = {}) {
      const i = Ma(t?.planClass), c = H(a?.payload) ? a.payload : {}, l = String(c.databaseName || t?.resourceMeta?.d1?.databaseName || n || "未命名数据库").trim(), u = [
        Lr({
          key: "rowsRead",
          label: "读",
          used: c.rowsRead,
          limit: i.d1.rowsRead,
          kind: "count"
        }),
        Lr({
          key: "rowsWritten",
          label: "写",
          used: c.rowsWritten,
          limit: i.d1.rowsWritten,
          kind: "count"
        }),
        Lr({
          key: "storage",
          label: "容量",
          used: c.fileSizeBytes,
          limit: i.d1.storageBytes,
          kind: "bytes"
        })
      ], d = [];
      r?.stale === !0 && d.push("计划信息"), a?.stale === !0 && d.push("实时指标");
      const f = [];
      d.length > 0 && f.push(`${d.join("、")} 使用 stale cache`), f.push(`SQL 次数：读 ${Se(c.readQueries)} / 写 ${Se(c.writeQueries)}`), f.push(`数据库：${l}`);
      const m = Xs(a?.cachedAt, s);
      m && f.push(m), f.push(`容量条按单库硬上限 ${gn(i.d1.storageBytes)} 展示`);
      const p = Ys(u);
      return p.length > 0 && f.push(`超额项目：${p.join("、")}（进度条按 100% 封顶）`), a?.error && f.push(`Cloudflare 详情：${Wt(a.error)}`), hn({
        title: "D1",
        status: d.length > 0 ? "partial_failure" : "success",
        summary: `${i.planLabel} 计划 · ${i.periodLabel}配额`,
        detail: f.join("；"),
        planLabel: i.planLabel,
        periodLabel: i.periodLabel,
        resourceLabel: l,
        metrics: u
      });
    },
    async buildDashboardD1WriteHotspotPayload(t, r = {}) {
      const a = ce(r?.config || await me(t)), n = Math.max(0, Number(r?.nowMs) || B()), s = Fe(a.scheduleUtcOffsetMinutes), i = String(a.cfAccountId || "").trim(), c = String(a.cfApiToken || "").trim(), l = String(a.cfD1DatabaseId || "").trim(), u = {
        utcOffsetMinutes: s,
        nowMs: n,
        source: "cloudflare_d1_analytics"
      };
      if (!i || !c || !l) return bn({
        ...u,
        status: "unconfigured",
        summary: "D1 写入热点尚未启用",
        detail: "请先在账号设置中填写 Cloudflare 账号 ID、API 令牌与 D1 Database ID。"
      });
      const d = dt(new Date(n), s).startTs - 8640 * 60 * 1e3, f = await Am({
        accountId: i,
        apiToken: c,
        databaseId: l,
        startIso: new Date(d).toISOString(),
        endIso: new Date(n).toISOString(),
        utcOffsetMinutes: s
      }), m = new Map(f.map((b) => [`${b.dateKey}:${b.hour}`, b])), p = El(), h = [];
      let g = 0, y = 0, _ = 0, S = null;
      for (const b of f)
        g += Math.max(0, Number(b?.rowsWritten) || 0), y += Math.max(0, Number(b?.writeQueries) || 0), (Number(b?.rowsWritten) || 0) > _ && (_ = Math.max(0, Number(b?.rowsWritten) || 0), S = b);
      for (let b = 0; b < 7; b += 1) {
        const T = ut(d + b * 24 * 60 * 60 * 1e3, s).dateKey;
        h.push({
          key: T,
          dateKey: T,
          label: Ro(T),
          cells: Array.from({ length: 24 }, (C, L) => {
            const P = m.get(`${T}:${L}`) || null, A = Math.max(0, Number(P?.rowsWritten) || 0), w = Math.max(0, Number(P?.writeQueries) || 0), R = _ > 0 ? A / _ : 0;
            return Al(T, L, A, w, R);
          })
        });
      }
      const E = S ? `峰值：${Ro(S.dateKey)} ${String(S.hour).padStart(2, "0")}:00 写入 ${Se(S.rowsWritten)} 行 / SQL ${Se(S.writeQueries)} 次` : "";
      return {
        title: "D1 写入热点图",
        status: "success",
        source: "cloudflare_d1_analytics",
        summary: g > 0 ? `最近 7 天累计写入 ${Se(g)} 行` : "最近 7 天未检测到 D1 写入",
        detail: g > 0 ? "热点强度按 rowsWritten 计算；悬停单元格可查看对应小时的 SQL 写次数。" : "Cloudflare D1 Analytics 当前窗口内没有返回 rowsWritten 数据。",
        periodLabel: `最近 7 天 · ${zo(s)}`,
        hourLabels: p,
        rows: h,
        available: g > 0,
        totalRowsWritten: g,
        totalWriteQueries: y,
        peakLabel: E,
        legendMaxLabel: Se(_)
      };
    },
    async buildDashboardMonthlyTrafficPayload(t, r = {}) {
      const a = ce(r?.config || await me(t)), n = Math.max(0, Number(r.nowMs) || B()), s = r?.monthWindow || pi(new Date(n), a.scheduleUtcOffsetMinutes), i = String(a.cfZoneId || "").trim(), c = String(a.cfApiToken || "").trim(), l = {
        period: "month",
        periodKey: s.monthKey,
        periodLabel: s.periodLabel,
        generatedAt: new Date(n).toISOString(),
        cacheStatus: "live"
      };
      if (!i || !c) return or({
        ...l,
        traffic: "未配置",
        cfAnalyticsLoaded: !1,
        cfAnalyticsStatus: "未配置 Cloudflare",
        cfAnalyticsError: "请在账号设置中填写并保存 Cloudflare Zone ID 与 API 令牌",
        trafficSourceText: "本月视频流量：未配置 Cloudflare，无法获取 CF Zone 总流量"
      });
      const u = 1440 * 60 * 1e3, d = Fe(a.scheduleUtcOffsetMinutes), f = r?.kv || e.getKV(t), m = n - tn * u, p = [];
      for (let T = s.startTs; T <= s.endTs; T += u) p.push({
        startTs: T,
        endTs: Math.min(s.endTs, T + u - 1),
        dateKey: ut(new Date(T), d).dateKey
      });
      let h = 0, g = 0, y = 0, _ = 0, S = null;
      const E = 4;
      for (let T = 0; T < p.length; T += E) {
        const C = await Promise.all(p.slice(T, T + E).map(async ({ startTs: L, endTs: P, dateKey: A }) => {
          const w = await gi(f, i, A);
          let R = null;
          try {
            R = await Qs(i, c, L, P);
          } catch (I) {
            S = S || I;
          }
          return R === null ? w !== null ? {
            bytes: w,
            source: "archive"
          } : {
            bytes: 0,
            source: "missing"
          } : (P < n && L >= m && w === null && await hi(f, i, {
            dateKey: A,
            bytes: R,
            dayEndTs: P
          }), R === 0 && w !== null ? {
            bytes: w,
            source: "archive"
          } : R === 0 && L < m ? {
            bytes: 0,
            source: "missing"
          } : {
            bytes: R,
            source: "cf"
          });
        }));
        for (const L of C)
          h += Math.max(0, Number(L?.bytes) || 0), L?.source === "archive" ? g += 1 : L?.source === "missing" ? y += 1 : L?.source === "cf" && (_ += 1);
      }
      if (_ === 0 && g === 0 && S) throw S;
      const b = y > 0 ? `本地归档缺失 ${y} 天（免费版 CF Zone 分析仅保留约 ${tn} 天）` : "";
      return or({
        ...l,
        traffic: gn(h),
        totalBytes: h,
        cfAnalyticsLoaded: !0,
        cfAnalyticsStatus: y > 0 ? "Cloudflare 统计正常（部分日期缺失）" : "Cloudflare 统计正常",
        cfAnalyticsError: "",
        cfAnalyticsDetail: b,
        trafficSourceText: `${s.periodLabel}视频流量：CF Zone 总流量（edgeResponseBytes）${g > 0 ? `（本地归档 ${g} 天）` : ""}${b ? `；${b}` : ""}`,
        warning: b
      });
    },
    async snapshotCfDailyTrafficArchive(t, r = {}) {
      const a = ce(r?.config || await me(t)), n = r?.kv || e.getKV(t), s = String(a.cfZoneId || "").trim(), i = String(a.cfApiToken || "").trim();
      if (!n || !s || !i) return {
        status: "skipped",
        storedCount: 0,
        errors: []
      };
      const c = Math.max(0, Number(r?.nowMs) || B()), l = Fe(a.scheduleUtcOffsetMinutes), u = dt(new Date(c), l), d = 1440 * 60 * 1e3, f = c - tn * d;
      let m = 0;
      const p = [];
      for (let h = 1; h <= Xp; h += 1) {
        const g = u.startTs - h * d, y = g + d - 1, _ = ut(new Date(g), l).dateKey;
        if (!(g < f) && await gi(n, s, _) === null)
          try {
            await hi(n, s, {
              dateKey: _,
              bytes: await Qs(s, i, g, y),
              dayEndTs: y
            }) && (m += 1);
          } catch (S) {
            p.push(String(S?.message || S));
          }
      }
      return {
        status: p.length > 0 ? "partial_failure" : "success",
        storedCount: m,
        errors: p
      };
    },
    async getDashboardMonthlyTrafficPayload(t, r = {}) {
      const a = ce(r?.config || await me(t)), n = r?.ctx || null, s = r?.forceRefresh === !0, i = Math.max(0, Number(r.nowMs) || B()), c = r?.monthWindow || pi(new Date(i), a.scheduleUtcOffsetMinutes), l = String(a.cfZoneId || "").trim();
      if (!l || !String(a.cfApiToken || "").trim()) return await e.buildDashboardMonthlyTrafficPayload(t, {
        config: a,
        monthWindow: c,
        nowMs: i
      });
      const u = Yp(l, c.monthKey, a.scheduleUtcOffsetMinutes), d = Jp(u), f = yr();
      let m = null;
      const p = oe.DashboardMonthlyTrafficCache.get(u);
      if (p?.staleUntil > i) {
        if (He(oe.DashboardMonthlyTrafficCache, u, p, 64), m = p, !s && p.expiresAt > i) return or({
          ...p.payload,
          cacheStatus: "cache"
        });
      } else p && oe.DashboardMonthlyTrafficCache.delete(u);
      if (f && d) try {
        const h = await f.match(d);
        if (h) {
          const g = await Me(h, Ln), y = g.exceeded ? null : JSON.parse(g.text || "null");
          if (Number(y?.version) === 1 && String(y?.cacheKey || "") === u && Number(y?.staleUntil) > i && (m = {
            payload: or(y.payload),
            cachedAt: Number(y.cachedAt) || 0,
            expiresAt: Number(y.expiresAt) || 0,
            staleUntil: Number(y.staleUntil) || 0
          }, He(oe.DashboardMonthlyTrafficCache, u, m, 64), !s && m.expiresAt > i))
            return or({
              ...m.payload,
              cacheStatus: "cache"
            });
        }
      } catch (h) {
        Le("dashboard.monthly_traffic_cache_read_failed", h, { cacheKey: u });
      }
      try {
        return await Xt(mt([
          "dashboard_monthly_traffic",
          u,
          s ? "force" : "default"
        ]), async () => {
          const h = await e.buildDashboardMonthlyTrafficPayload(t, {
            config: a,
            monthWindow: c,
            nowMs: i
          }), g = i, y = g + Vp, _ = g + fi, S = {
            version: 1,
            cacheKey: u,
            cachedAt: g,
            expiresAt: y,
            staleUntil: _,
            payload: h
          };
          if (He(oe.DashboardMonthlyTrafficCache, u, {
            payload: h,
            cachedAt: g,
            expiresAt: y,
            staleUntil: _
          }, 64), f && d) {
            const E = f.put(d, new Response(JSON.stringify(S), { headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": `public, max-age=${Math.floor(fi / 1e3)}`
            } }));
            n ? n.waitUntil(ge(E, "dashboard.monthly_traffic_cache_write", { cacheKey: u }, null)) : await ge(E, "dashboard.monthly_traffic_cache_write", { cacheKey: u }, null);
          }
          return h;
        });
      } catch (h) {
        if (m?.payload && m.staleUntil > i) return or({
          ...m.payload,
          cacheStatus: "stale",
          warning: Tl(h, "monthly_traffic_refresh_failed")
        });
        const g = Wc(h?.message || h, { zoneId: l });
        return or({
          periodKey: c.monthKey,
          periodLabel: c.periodLabel,
          traffic: "CF 查询失败",
          cfAnalyticsLoaded: !1,
          cfAnalyticsStatus: g.status,
          cfAnalyticsError: g.hint,
          cfAnalyticsDetail: g.detail,
          trafficSourceText: `${c.periodLabel}视频流量：CF Zone 总流量（edgeResponseBytes）`,
          generatedAt: new Date(i).toISOString(),
          cacheStatus: "live"
        });
      }
    }
  };
}
function py(o = {}, e = {}) {
  const { CacheManager: t, withAdminShellRuntimeStatus: r } = o;
  return {
    async buildDashboardStatsPayload(a, n = {}) {
      const s = n?.ctx || null, i = n?.kv || e.getKV(a), c = n?.db || e.getDB(a), l = ce(n?.config || await me(a)), u = Math.max(0, Number(n.nowMs) || B()), d = n?.dayWindow || dt(new Date(u), l.scheduleUtcOffsetMinutes), f = n?.skipD1WriteHotspot !== !1, m = f ? null : e.buildDashboardD1WriteHotspotPayload(a, {
        config: l,
        nowMs: u
      });
      let p = null, h = "未配置", g = 0, y = !1, _ = !1, S = "", E = "", b = "", T = "pending", C = "等待数据加载", L = "视频流量口径：CF Zone 总流量", P = new Date(u).toISOString(), A = Array.from({ length: 24 }, (v, O) => ({
        label: String(O).padStart(2, "0") + ":00",
        total: 0
      })), w = 0, R = 0, I = "", x = bn({
        utcOffsetMinutes: l.scheduleUtcOffsetMinutes,
        nowMs: u
      });
      g = (await t.getNodesListStrict(a, s)).length || 0;
      const N = d.dateKey, F = d.startTs, D = d.endTs, U = String(l.cfZoneId || "").trim(), V = String(l.cfApiToken || "").trim();
      if (U && V) {
        const v = new Date(F).toISOString(), O = new Date(D).toISOString(), M = `
                query {
                  viewer {
                    zones(filter: { zoneTag: ${Ee(U)} }) {
                      series: httpRequestsAdaptiveGroups(limit: 10000, filter: { datetime_geq: ${Ee(v)}, datetime_leq: ${Ee(O)} }) {
                        count
                        dimensions { datetimeHour }
                        sum { edgeResponseBytes }
                      }
                    }
                  }
                }`;
        try {
          const k = await tl(U, V, {
            scope: "dashboard.stats.zone_lookup",
            context: { feature: "dashboard_stats" }
          });
          I = String(k?.name || "").trim();
          const j = await Zc(U, V, M);
          if (j) {
            let q = 0, J = 0, Q = Array.from({ length: 24 }, (se, pe) => ({
              label: String(pe).padStart(2, "0") + ":00",
              total: 0
            }));
            (Array.isArray(j.series) ? [...j.series].sort((se, pe) => String(se?.dimensions?.datetimeHour || "").localeCompare(String(pe?.dimensions?.datetimeHour || ""))) : []).forEach((se) => {
              const pe = Number(se.count) || 0, _e = Number(se.sum?.edgeResponseBytes) || 0;
              q += pe, J += _e;
              const ye = se?.dimensions?.datetimeHour;
              if (ye && !Number.isNaN(new Date(ye).getTime())) {
                const Te = ut(new Date(ye), l.scheduleUtcOffsetMinutes).hour;
                Q[Te].total += pe;
              }
            }), h = gn(J), y = !0, S = "Cloudflare 统计正常", L = "视频流量当前对齐：CF Zone 总流量（edgeResponseBytes）";
            try {
              const se = await Tm({
                cfAccountId: String(l.cfAccountId || "").trim(),
                cfZoneId: U,
                cfApiToken: V,
                startIso: v,
                endIso: O,
                utcOffsetMinutes: l.scheduleUtcOffsetMinutes
              });
              se && Number.isFinite(se.totalRequests) && (p = se.totalRequests, A = se.hourlySeries, _ = !0, T = "workers_usage", C = "今日请求量口径：Cloudflare Workers Usage", S = "Cloudflare 统计正常");
            } catch (se) {
              console.log("CF workers usage fetch failed", se);
            }
            _ || (p = q, A = Q, _ = !0, T = "zone_analytics", C = "今日请求量当前对齐：Cloudflare Zone Analytics");
          } else
            S = "Zone 未命中", E = "GraphQL 返回空；请检查 Zone ID 或权限", h = "CF 无统计数据";
        } catch (k) {
          const j = Wc(k?.message || k, { zoneId: U });
          S = j.status, E = j.hint, b = j.detail, h = "CF 查询失败";
        }
      } else
        S = "未配置 Cloudflare", E = "请在账号设置中填写并保存 Cloudflare Zone ID 与 API 令牌", L = "视频流量当前对齐：未配置 Cloudflare，无法获取 CF Zone 总流量";
      if (c) try {
        await e.ensureStatsHourlyWindowAligned({
          db: c,
          kv: i
        }, {
          config: l,
          now: d.now
        });
        const v = await e.resolveLogsReadiness({
          db: c,
          kv: i
        }), O = v.statsReady === !0 ? await e.getDailyStatsHourly(c, N) : [];
        if (w = O.reduce((M, k) => M + (Number(k?.play_count || k?.playCount) || 0), 0), R = O.reduce((M, k) => M + (Number(k?.playback_info_count || k?.playbackInfoCount) || 0), 0), !_ && v.statsReady === !0) {
          p = O.reduce((M, k) => M + (Number(k?.request_count || k?.requestCount) || 0), 0), A = Array.from({ length: 24 }, (M, k) => ({
            label: String(k).padStart(2, "0") + ":00",
            total: 0
          }));
          for (const M of O) {
            const k = Number.parseInt(String(M?.bucket_hour ?? M?.bucketHour), 10);
            !Number.isNaN(k) && A[k] && (A[k].total += Number(M?.request_count || M?.requestCount) || 0);
          }
          _ = !0, T = "d1_hourly_stats", C = "今日请求量当前对齐：本地 D1 预聚合";
        }
      } catch (v) {
        console.log("DB aggregated stats read failed:", v);
      }
      if (_ || (p = null, !U || !V ? (T = "unconfigured", C = c ? "今日请求量暂不可用：未配置 Cloudflare 联动，且本地 D1 日志未初始化或不可读" : "今日请求量未配置：未绑定 D1，且未配置 Cloudflare 联动") : (T = "pending", C = c ? "今日请求量暂不可用：Cloudflare 请求数查询失败，且本地 D1 日志未初始化或不可读" : "今日请求量暂不可用：Cloudflare 请求数查询失败，且未绑定 D1")), !f) try {
        x = await m;
      } catch (v) {
        console.log("D1 write hotspot read failed:", v), x = bn({
          utcOffsetMinutes: l.scheduleUtcOffsetMinutes,
          nowMs: u,
          status: "failed",
          source: "cloudflare_d1_analytics",
          summary: "D1 写入热点暂不可用",
          detail: Wt(v, "d1_write_hotspot_failed")
        });
      }
      const X = p == null ? T === "unconfigured" ? "未配置" : "暂不可用" : String(Number(p) || 0);
      return ps({
        todayRequests: p,
        requestCountDisplay: X,
        todayTraffic: h,
        hourlySeries: A,
        requestSource: T,
        requestSourceText: C,
        trafficSourceText: L,
        generatedAt: P,
        zoneName: I,
        cfAnalyticsLoaded: y,
        cfAnalyticsStatus: S,
        cfAnalyticsError: E,
        cfAnalyticsDetail: b,
        playCount: w,
        infoCount: R,
        nodeCount: g,
        cacheStatus: "live",
        d1WriteHotspot: x
      });
    },
    async buildDashboardRuntimeStatusPayload(a, n = {}) {
      const s = n?.db || e.getDB(a), i = n?.kv || e.getKV(a), c = ce(n?.config || await me(a)), l = n?.forceRefresh === !0, u = await e.getOpsStatus({
        kv: i,
        db: s
      });
      let d = {
        kv: Nr("KV", "Cloudflare 配额尚未加载", "等待运行状态接口返回 Cloudflare 配额数据。"),
        d1: Nr("D1", "Cloudflare 配额尚未加载", "等待运行状态接口返回 Cloudflare 配额数据。")
      };
      try {
        d = await e.getCloudflareRuntimeQuotaStatus(a, {
          config: c,
          db: s,
          forceRefresh: l
        });
      } catch (f) {
        const m = Wt(f, "runtime_config_read_failed");
        d = {
          kv: Ir("KV", "Cloudflare 配额读取失败", m),
          d1: Ir("D1", "Cloudflare 配额读取失败", m)
        };
      }
      return {
        ...u && typeof u == "object" ? u : {},
        cloudflare: d
      };
    },
    async getRuntimeStatusPayload(a, n = {}) {
      const s = n?.db || e.getDB(a), i = n?.kv || e.getKV(a), c = ce(n?.config || await me(a)), l = ze(a), u = n?.forceRefresh === !0, d = Math.max(0, Number(n.nowMs) || B()), f = await Xt(mt(["runtime_status", u ? "force" : "default"]), async () => e.buildDashboardRuntimeStatusPayload(a, {
        kv: i,
        db: s,
        config: c,
        forceRefresh: u
      }));
      return {
        status: r(f, a, c, l),
        cacheMeta: hs({
          cacheStatus: "live",
          cachedAt: d,
          expiresAt: d,
          updatedAt: d,
          generatedAt: new Date(d).toISOString(),
          warning: "",
          partial: !1
        })
      };
    },
    async getDashboardSnapshotPayload(a, n = {}) {
      const s = n?.db || e.getDB(a), i = n?.kv || e.getKV(a), c = n?.ctx || null, l = ce(n?.config || await me(a)), u = n?.forceRefresh === !0, d = Math.max(0, Number(n.nowMs) || B()), f = n?.dayWindow || dt(new Date(d), l.scheduleUtcOffsetMinutes), m = String(l.cfZoneId || "").trim(), p = To(m, f.dateKey), h = s ? await e.getCfDashboardCacheEntry(s, p, {
        nowMs: d,
        includeExpired: !0
      }) : null;
      if (!u && s) {
        const y = h && h.expiresAt > d ? h : null;
        if (y && y.version === 8) return fa(y.payload, "cache", {
          cachedAt: y.cachedAt,
          expiresAt: y.expiresAt,
          updatedAt: y.updatedAt,
          generatedAt: y.payload?.cacheMeta?.generatedAt || y.payload?.stats?.generatedAt || new Date(y.cachedAt || d).toISOString(),
          warning: ""
        });
      }
      const g = h;
      try {
        const y = await Xt(mt([
          "dashboard_snapshot",
          p,
          u ? "force" : "default"
        ]), async () => {
          const [_, S] = await Promise.all([e.buildDashboardStatsPayload(a, {
            ctx: c,
            kv: i,
            db: s,
            config: l,
            dayWindow: f,
            nowMs: d
          }), e.buildDashboardRuntimeStatusPayload(a, {
            kv: i,
            db: s,
            config: l,
            forceRefresh: u
          })]), E = fa({
            stats: _,
            runtimeStatus: S,
            cacheMeta: { generatedAt: _.generatedAt }
          }, "live", {
            cachedAt: d,
            expiresAt: d + 3600 * 1e3,
            updatedAt: d,
            generatedAt: _.generatedAt,
            warning: ""
          });
          if (s) {
            const b = e.putCfDashboardCacheEntry(s, {
              cacheKey: p,
              zoneId: m || "default",
              bucketDate: f.dateKey,
              payload: E,
              version: 8,
              cachedAt: d,
              expiresAt: d + 36e5,
              updatedAt: d
            });
            c ? c.waitUntil(ge(b, "dashboard.cache_write", { cacheKey: p }, null)) : await ge(b, "dashboard.cache_write", { cacheKey: p }, null);
          }
          return E;
        });
        return fa(y, "live", {
          cachedAt: d,
          expiresAt: d + 3600 * 1e3,
          updatedAt: d,
          generatedAt: y?.stats?.generatedAt || ""
        });
      } catch (y) {
        if (g && g.version === 8) return fa(g.payload, "stale", {
          cachedAt: g.cachedAt,
          expiresAt: g.expiresAt,
          updatedAt: g.updatedAt,
          generatedAt: g.payload?.cacheMeta?.generatedAt || g.payload?.stats?.generatedAt || new Date(g.cachedAt || d).toISOString(),
          warning: Tl(y),
          partial: !0
        });
        throw y;
      }
    },
    async getDashboardCachedSnapshotPayload(a, n = {}) {
      const s = n?.db || e.getDB(a);
      if (!s) return null;
      const i = ce(n?.config || await me(a)), c = Math.max(0, Number(n.nowMs) || B()), l = dt(new Date(c), i.scheduleUtcOffsetMinutes), u = To(String(i.cfZoneId || "").trim(), l.dateKey), d = await e.getCfDashboardCacheEntry(s, u, {
        nowMs: c,
        includeExpired: !0
      });
      return !d || d.version !== 8 ? null : fa(d.payload, d.expiresAt > c ? "cache" : "stale", {
        cachedAt: d.cachedAt,
        expiresAt: d.expiresAt,
        updatedAt: d.updatedAt,
        generatedAt: d.payload?.cacheMeta?.generatedAt || d.payload?.stats?.generatedAt || "",
        warning: d.expiresAt > c ? "" : "dashboard_cache_expired",
        partial: d.expiresAt <= c
      });
    },
    async getCloudflareRuntimeQuotaStatus(a, n = {}) {
      const s = n?.db || e.getDB(a), i = ce(n?.config || {}), c = n?.forceRefresh === !0, l = String(i.cfAccountId || "").trim(), u = String(i.cfApiToken || "").trim(), d = String(i.cfKvNamespaceId || "").trim(), f = String(i.cfD1DatabaseId || "").trim();
      if (!l || !u) return {
        kv: Nr("KV", "未配置 Cloudflare 账号联动", "请先在账号设置中填写 Cloudflare 账号 ID 与 API 令牌。"),
        d1: Nr("D1", "未配置 Cloudflare 账号联动", "请先在账号设置中填写 Cloudflare 账号 ID 与 API 令牌。")
      };
      const m = B(), p = fe(i.cfQuotaPlanCacheMinutes, $.Defaults.CfQuotaPlanCacheMinutes, 1, 1440), h = p * 60 * 1e3;
      let g;
      try {
        g = await e.loadCfRuntimeCachePayload(s, {
          cacheKey: `plan_profile:${l}:${d || "-"}:${f || "-"}`,
          cacheGroup: "plan_profile",
          resourceId: l,
          ttlMs: p * 60 * 1e3,
          nowMs: m,
          skipCacheRead: c,
          loader: async () => {
            const T = Jc(await rl(l, u)), [C, L] = await Promise.all([d ? ge(_m(l, d, u), "cf_runtime.plan_profile.kv_details", {
              accountId: l,
              namespaceId: d
            }, null) : null, f ? ge(Zs(l, f, u), "cf_runtime.plan_profile.d1_details", {
              accountId: l,
              databaseId: f
            }, null) : null]);
            return {
              planClass: T.planClass,
              planLabel: T.planLabel,
              periodLabel: T.periodLabel,
              usageModel: T.usageModel,
              resourceMeta: {
                kv: { namespaceTitle: String(C?.title || "").trim() },
                d1: { databaseName: String(L?.name || "").trim() }
              }
            };
          }
        });
      } catch (T) {
        const C = Wt(T);
        return {
          kv: Ir("KV", "Cloudflare 计划信息读取失败", C),
          d1: Ir("D1", "Cloudflare 计划信息读取失败", C)
        };
      }
      const y = H(g?.payload) ? g.payload : {}, _ = {
        ..._o({
          usageModel: y.usageModel || y.planClass,
          override: i.cfQuotaPlanOverride
        }),
        resourceMeta: {
          kv: { namespaceTitle: String(y?.resourceMeta?.kv?.namespaceTitle || "").trim() },
          d1: { databaseName: String(y?.resourceMeta?.d1?.databaseName || "").trim() }
        }
      }, S = gm(_.planClass), [E, b] = await Promise.all([(async () => {
        if (!d) return Nr("KV", "未配置 KV Namespace", "请在账号设置中填写 Cloudflare KV Namespace ID。");
        try {
          const T = await e.loadCfRuntimeCachePayload(s, {
            cacheKey: `usage_metrics:kv:${l}:${d}:${S.cacheBucketKey}`,
            cacheGroup: "usage_metrics",
            resourceId: `kv:${d}`,
            ttlMs: h,
            nowMs: m,
            skipCacheRead: c,
            loader: async () => ({
              ...await bm({
                accountId: l,
                apiToken: u,
                namespaceId: d,
                startIso: S.startIso,
                endIso: S.endIso
              }),
              namespaceTitle: String(_?.resourceMeta?.kv?.namespaceTitle || d).trim()
            })
          });
          return e.buildCloudflareKvQuotaCard({
            planProfile: _,
            planState: g,
            usageState: T,
            namespaceId: d,
            nowTimestamp: m
          });
        } catch (T) {
          return Ir("KV", "KV 指标读取失败", Wt(T));
        }
      })(), (async () => {
        if (!f) return Nr("D1", "未配置 D1 数据库", "请在账号设置中填写 Cloudflare D1 Database ID。");
        try {
          const T = await e.loadCfRuntimeCachePayload(s, {
            cacheKey: `usage_metrics:d1:${l}:${f}:${S.cacheBucketKey}`,
            cacheGroup: "usage_metrics",
            resourceId: `d1:${f}`,
            ttlMs: h,
            nowMs: m,
            skipCacheRead: c,
            loader: async () => {
              const [C, L] = await Promise.all([Em({
                accountId: l,
                apiToken: u,
                databaseId: f,
                startIso: S.startIso,
                endIso: S.endIso
              }), Zs(l, f, u)]);
              return {
                ...C,
                databaseName: String(L?.name || _?.resourceMeta?.d1?.databaseName || f).trim(),
                fileSizeBytes: Math.max(0, Number(L?.file_size ?? L?.fileSize) || 0)
              };
            }
          });
          return e.buildCloudflareD1QuotaCard({
            planProfile: _,
            planState: g,
            usageState: T,
            databaseId: f,
            nowTimestamp: m
          });
        } catch (T) {
          return Ir("D1", "D1 指标读取失败", Wt(T));
        }
      })()]);
      return {
        kv: E,
        d1: b
      };
    }
  };
}
function gy(o = {}, e = {}) {
  return {
    ...ly(o, e),
    ...uy(o, e),
    ...dy(o, e),
    ...fy(o, e),
    ...my(o, e),
    ...py(o, e)
  };
}
function hy(o = {}, e = {}) {
  return {
    getKV(t) {
      return Ft(t);
    },
    getDB(t) {
      return wf(t);
    },
    buildD1CreateTableSql(t, r = t, a = {}) {
      const n = de(r), s = `CREATE TABLE${a.ifNotExists === !0 ? " IF NOT EXISTS" : ""}`, i = {
        [e.D1_SCHEMA_META_TABLE]: `${s} ${n} (scope TEXT PRIMARY KEY, contract_version INTEGER NOT NULL, contract_hash TEXT NOT NULL, schema_fingerprint TEXT NOT NULL, schema_cookie INTEGER NOT NULL, last_plan_hash TEXT NOT NULL, verified_at TEXT NOT NULL, attestation TEXT NOT NULL, migration_owner TEXT, lease_expires_at INTEGER)`,
        [e.SYS_STATUS_TABLE]: `${s} ${n} (scope TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.SCHEDULED_LOCKS_TABLE]: `${s} ${n} (scope TEXT PRIMARY KEY, token TEXT NOT NULL, owner TEXT NOT NULL, acquired_at INTEGER NOT NULL, renewed_at INTEGER, expires_at INTEGER NOT NULL)`,
        [e.AUTH_FAILURES_TABLE]: `${s} ${n} (ip TEXT PRIMARY KEY, fail_count INTEGER NOT NULL, expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.CF_DASH_CACHE_TABLE]: `${s} ${n} (cache_key TEXT PRIMARY KEY, zone_id TEXT NOT NULL, bucket_date TEXT NOT NULL, payload TEXT NOT NULL, version INTEGER NOT NULL, cached_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.CF_RUNTIME_CACHE_TABLE]: `${s} ${n} (cache_key TEXT PRIMARY KEY, cache_group TEXT NOT NULL, resource_id TEXT NOT NULL, payload TEXT NOT NULL, cached_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.DNS_IP_POOL_ITEMS_TABLE]: `${s} ${n} (id TEXT PRIMARY KEY, ip TEXT NOT NULL UNIQUE, ip_type TEXT NOT NULL, source_kind TEXT NOT NULL, source_label TEXT, line_label TEXT NOT NULL DEFAULT '', remark TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        [e.DNS_IP_POOL_SOURCES_TABLE]: `${s} ${n} (id TEXT PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL, source_type TEXT NOT NULL DEFAULT 'url', domain TEXT, source_kind TEXT NOT NULL DEFAULT 'custom', preset_id TEXT NOT NULL DEFAULT '', builtin_id TEXT NOT NULL DEFAULT '', enabled INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, ip_limit INTEGER NOT NULL DEFAULT 5, last_fetch_at TEXT, last_fetch_status TEXT, last_fetch_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        [e.DNS_IP_POOL_FETCH_CACHE_TABLE]: `${s} ${n} (signature TEXT PRIMARY KEY, items_json TEXT NOT NULL, source_results_json TEXT NOT NULL, imported_count INTEGER NOT NULL DEFAULT 0, enabled_source_count INTEGER NOT NULL DEFAULT 0, cached_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        [e.DNS_IP_PROBE_CACHE_TABLE]: `${s} ${n} (ip TEXT NOT NULL, entry_colo TEXT NOT NULL, probe_status TEXT NOT NULL, latency_ms INTEGER, cf_ray TEXT, colo_code TEXT, city_name TEXT, country_code TEXT, country_name TEXT, probed_at TEXT NOT NULL, expires_at INTEGER NOT NULL, PRIMARY KEY (ip, entry_colo))`,
        [e.LOGS_TABLE]: `${s} ${n} (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER NOT NULL, node_name TEXT NOT NULL, request_path TEXT NOT NULL, request_method TEXT NOT NULL, status_code INTEGER NOT NULL, response_time INTEGER NOT NULL, client_ip TEXT NOT NULL, inbound_colo TEXT, outbound_colo TEXT, user_agent TEXT, referer TEXT, category TEXT DEFAULT 'api', error_detail TEXT, detail_json TEXT, created_at TEXT NOT NULL, inbound_ip TEXT, outbound_ip TEXT)`,
        [e.STATS_HOURLY_TABLE]: `${s} ${n} (bucket_date TEXT NOT NULL, bucket_hour INTEGER NOT NULL, request_count INTEGER NOT NULL DEFAULT 0, play_count INTEGER NOT NULL DEFAULT 0, playback_info_count INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, PRIMARY KEY (bucket_date, bucket_hour))`
      }[t];
      if (!i) throw new Error(`Unknown D1 schema table: ${t}`);
      return i;
    },
    getD1LogsFtsContractSql() {
      return {
        createTable: `CREATE VIRTUAL TABLE ${e.LOGS_FTS_TABLE} USING fts5(node_name, request_path, user_agent, error_detail, detail_json, content='${e.LOGS_TABLE}', content_rowid='id', tokenize='unicode61')`,
        createTrigger: `CREATE TRIGGER ${e.LOGS_FTS_INSERT_TRIGGER} AFTER INSERT ON ${e.LOGS_TABLE} BEGIN
          INSERT INTO ${e.LOGS_FTS_TABLE}(rowid, node_name, request_path, user_agent, error_detail, detail_json)
          VALUES (new.id, new.node_name, new.request_path, COALESCE(new.user_agent, ''), COALESCE(new.error_detail, ''), COALESCE(new.detail_json, ''));
        END;`
      };
    },
    getD1ContractHash() {
      const t = e.getD1CurrentSchemaContract();
      return ie(re({
        version: ct,
        createTables: Object.keys(t.columns).sort().map((r) => [r, e.buildD1CreateTableSql(r)]),
        columns: t.columns,
        columnAffinities: t.columnAffinities,
        primaryKeys: t.primaryKeys,
        indexes: t.indexes,
        uniqueIndexes: t.uniqueIndexes,
        fts: e.getD1LogsFtsContractSql(),
        safeColumnAdditions: e.getD1RuntimeColumnAdditions()
      }));
    },
    async getD1SchemaCookie(t) {
      return 0;
    },
    buildD1SchemaAttestationPayload(t = {}) {
      return re({
        scope: "main",
        contractVersion: Math.max(0, Number(t.contractVersion ?? t.contract_version) || 0),
        contractHash: String((t.contractHash ?? t.contract_hash) || ""),
        schemaFingerprint: String((t.schemaFingerprint ?? t.schema_fingerprint) || ""),
        schemaCookie: Math.max(0, Number(t.schemaCookie ?? t.schema_cookie) || 0),
        lastPlanHash: String((t.lastPlanHash ?? t.last_plan_hash) || ""),
        verifiedAt: String((t.verifiedAt ?? t.verified_at) || "")
      });
    },
    async signD1SchemaAttestation(t, r = {}) {
      const a = String(t?.JWT_SECRET || "").trim();
      return a ? await bt(a, e.buildD1SchemaAttestationPayload(r)) : "";
    },
    async readD1SchemaMeta(t) {
      try {
        return await t.prepare(`SELECT scope, contract_version, contract_hash, schema_fingerprint, schema_cookie, last_plan_hash, verified_at, attestation, migration_owner, lease_expires_at FROM ${de(e.D1_SCHEMA_META_TABLE)} WHERE scope = 'main' LIMIT 1`).first();
      } catch {
        return null;
      }
    },
    async verifyD1SchemaAttestation(t, r) {
      const a = await e.readD1SchemaMeta(t);
      if (!a) return {
        valid: !1,
        reason: "missing_meta"
      };
      const n = Math.max(0, Number(a.contract_version) || 0);
      if (n > ct) return {
        valid: !1,
        blocked: !0,
        reason: "schema_version_ahead",
        meta: a
      };
      if (n !== ct) return {
        valid: !1,
        reason: "version_mismatch",
        meta: a
      };
      if (String(a.contract_hash || "") !== e.getD1ContractHash()) return {
        valid: !1,
        reason: "contract_hash_mismatch",
        meta: a
      };
      const s = await e.getD1SchemaCookie(t);
      if (Math.max(0, Number(a.schema_cookie) || 0) !== s) return {
        valid: !1,
        reason: "schema_cookie_changed",
        meta: a,
        schemaCookie: s
      };
      const i = await e.getD1SchemaFingerprint(t);
      if (String(a.schema_fingerprint || "") !== i) return {
        valid: !1,
        reason: "schema_fingerprint_changed",
        meta: a,
        schemaCookie: s,
        schemaFingerprint: i
      };
      const c = await e.signD1SchemaAttestation(r, a);
      return !c || c !== String(a.attestation || "") ? {
        valid: !1,
        reason: "invalid_attestation",
        meta: a,
        schemaCookie: s
      } : {
        valid: !0,
        meta: a,
        schemaCookie: s,
        schemaFingerprint: i
      };
    },
    async writeVerifiedD1SchemaMeta(t, r, a = {}) {
      const n = e.getD1ContractHash(), s = String(a?.schemaFingerprint || "") || await e.getD1SchemaFingerprint(t), i = await e.getD1SchemaCookie(t), c = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), l = {
        contractVersion: ct,
        contractHash: n,
        schemaFingerprint: s,
        schemaCookie: i,
        lastPlanHash: String(a?.planHash || ""),
        verifiedAt: c
      }, u = await e.signD1SchemaAttestation(r, l);
      return u ? (await t.prepare(`INSERT INTO ${de(e.D1_SCHEMA_META_TABLE)} (scope, contract_version, contract_hash, schema_fingerprint, schema_cookie, last_plan_hash, verified_at, attestation, migration_owner, lease_expires_at)
        VALUES ('main', ?, ?, ?, ?, ?, ?, ?, NULL, NULL)
        ON CONFLICT(scope) DO UPDATE SET contract_version = excluded.contract_version, contract_hash = excluded.contract_hash, schema_fingerprint = excluded.schema_fingerprint, schema_cookie = excluded.schema_cookie, last_plan_hash = excluded.last_plan_hash, verified_at = excluded.verified_at, attestation = excluded.attestation, migration_owner = NULL, lease_expires_at = NULL`).bind(ct, n, s, i, l.lastPlanHash, c, u).run(), {
        written: !0,
        attestation: u,
        ...l
      }) : {
        written: !1,
        reason: "missing_secret",
        ...l
      };
    },
    async acquireD1SchemaRepairLease(t, r, a = {}) {
      const n = Math.max(0, Number(a.nowMs ?? B()) || 0), s = n + Fd, i = await t.prepare(`INSERT INTO ${de(e.D1_SCHEMA_META_TABLE)} (scope, contract_version, contract_hash, schema_fingerprint, schema_cookie, last_plan_hash, verified_at, attestation, migration_owner, lease_expires_at)
        VALUES ('main', 0, '', '', 0, '', '', '', ?, ?)
        ON CONFLICT(scope) DO UPDATE SET migration_owner = excluded.migration_owner, lease_expires_at = excluded.lease_expires_at
        WHERE ${de(e.D1_SCHEMA_META_TABLE)}.migration_owner IS NULL OR ${de(e.D1_SCHEMA_META_TABLE)}.lease_expires_at IS NULL OR ${de(e.D1_SCHEMA_META_TABLE)}.lease_expires_at < ? OR ${de(e.D1_SCHEMA_META_TABLE)}.migration_owner = excluded.migration_owner`).bind(r, s, n).run();
      if (Math.max(0, Number(i?.meta?.changes ?? i?.changes) || 0) < 1) {
        const c = /* @__PURE__ */ new Error("D1 schema repair is already running");
        throw c.code = "D1_SCHEMA_REPAIR_IN_PROGRESS", c.status = 409, c.details = { leaseExpiresAt: s }, c;
      }
      return {
        owner: r,
        leaseExpiresAt: s
      };
    },
    async releaseD1SchemaRepairLease(t, r) {
      return r ? (await t.prepare(`UPDATE ${de(e.D1_SCHEMA_META_TABLE)} SET migration_owner = NULL, lease_expires_at = NULL WHERE scope = 'main' AND migration_owner = ?`).bind(r).run(), !0) : !1;
    },
    getD1UniqueIndexContract() {
      return { ux_dns_ip_pool_items_ip: {
        table: e.DNS_IP_POOL_ITEMS_TABLE,
        columns: ["ip"],
        createSql: `CREATE UNIQUE INDEX ux_dns_ip_pool_items_ip ON ${e.DNS_IP_POOL_ITEMS_TABLE} (ip)`
      } };
    },
    getD1RuntimeIndexContract() {
      return {
        idx_sys_locks_expires_at: {
          table: e.SCHEDULED_LOCKS_TABLE,
          columns: ["expires_at"],
          createSql: `CREATE INDEX idx_sys_locks_expires_at ON ${e.SCHEDULED_LOCKS_TABLE} (expires_at DESC)`
        },
        idx_auth_failures_expires_at: {
          table: e.AUTH_FAILURES_TABLE,
          columns: ["expires_at"],
          createSql: `CREATE INDEX idx_auth_failures_expires_at ON ${e.AUTH_FAILURES_TABLE} (expires_at)`
        },
        idx_cf_dashboard_cache_expires_at: {
          table: e.CF_DASH_CACHE_TABLE,
          columns: ["expires_at"],
          createSql: `CREATE INDEX idx_cf_dashboard_cache_expires_at ON ${e.CF_DASH_CACHE_TABLE} (expires_at)`
        },
        idx_cf_runtime_cache_expires_at: {
          table: e.CF_RUNTIME_CACHE_TABLE,
          columns: ["expires_at"],
          createSql: `CREATE INDEX idx_cf_runtime_cache_expires_at ON ${e.CF_RUNTIME_CACHE_TABLE} (expires_at)`
        },
        idx_dns_ip_pool_items_updated_ip: {
          table: e.DNS_IP_POOL_ITEMS_TABLE,
          columns: ["updated_at", "ip"],
          createSql: `CREATE INDEX idx_dns_ip_pool_items_updated_ip ON ${e.DNS_IP_POOL_ITEMS_TABLE} (updated_at DESC, ip ASC)`
        },
        idx_dns_ip_pool_sources_sort: {
          table: e.DNS_IP_POOL_SOURCES_TABLE,
          columns: ["sort_order", "updated_at"],
          createSql: `CREATE INDEX idx_dns_ip_pool_sources_sort ON ${e.DNS_IP_POOL_SOURCES_TABLE} (sort_order ASC, updated_at ASC)`
        },
        idx_dns_ip_pool_fetch_cache_expires: {
          table: e.DNS_IP_POOL_FETCH_CACHE_TABLE,
          columns: ["expires_at"],
          createSql: `CREATE INDEX idx_dns_ip_pool_fetch_cache_expires ON ${e.DNS_IP_POOL_FETCH_CACHE_TABLE} (expires_at)`
        },
        idx_dns_ip_probe_cache_expire: {
          table: e.DNS_IP_PROBE_CACHE_TABLE,
          columns: ["expires_at"],
          createSql: `CREATE INDEX idx_dns_ip_probe_cache_expire ON ${e.DNS_IP_PROBE_CACHE_TABLE} (expires_at)`
        },
        idx_dns_ip_probe_cache_colo_ip_expires: {
          table: e.DNS_IP_PROBE_CACHE_TABLE,
          columns: [
            "entry_colo",
            "ip",
            "expires_at"
          ],
          createSql: `CREATE INDEX idx_dns_ip_probe_cache_colo_ip_expires ON ${e.DNS_IP_PROBE_CACHE_TABLE} (entry_colo, ip, expires_at)`
        },
        idx_proxy_logs_timestamp: {
          table: e.LOGS_TABLE,
          columns: ["timestamp"],
          createSql: `CREATE INDEX idx_proxy_logs_timestamp ON ${e.LOGS_TABLE} (timestamp)`
        },
        idx_proxy_logs_client_time: {
          table: e.LOGS_TABLE,
          columns: ["client_ip", "timestamp"],
          createSql: `CREATE INDEX idx_proxy_logs_client_time ON ${e.LOGS_TABLE} (client_ip, timestamp DESC)`
        },
        idx_proxy_logs_status_time: {
          table: e.LOGS_TABLE,
          columns: ["status_code", "timestamp"],
          createSql: `CREATE INDEX idx_proxy_logs_status_time ON ${e.LOGS_TABLE} (status_code, timestamp)`
        },
        idx_proxy_logs_category_time: {
          table: e.LOGS_TABLE,
          columns: ["category", "timestamp"],
          createSql: `CREATE INDEX idx_proxy_logs_category_time ON ${e.LOGS_TABLE} (category, timestamp)`
        }
      };
    },
    getD1RuntimeColumnAdditions() {
      return {
        [e.D1_SCHEMA_META_TABLE]: {
          contract_version: "INTEGER NOT NULL DEFAULT 0",
          contract_hash: "TEXT NOT NULL DEFAULT ''",
          schema_fingerprint: "TEXT NOT NULL DEFAULT ''",
          schema_cookie: "INTEGER NOT NULL DEFAULT 0",
          last_plan_hash: "TEXT NOT NULL DEFAULT ''",
          verified_at: "TEXT NOT NULL DEFAULT ''",
          attestation: "TEXT NOT NULL DEFAULT ''",
          migration_owner: "TEXT",
          lease_expires_at: "INTEGER"
        },
        [e.SYS_STATUS_TABLE]: {
          payload: "TEXT NOT NULL DEFAULT '{}'",
          updated_at: "INTEGER NOT NULL DEFAULT 0"
        },
        [e.SCHEDULED_LOCKS_TABLE]: {
          token: "TEXT NOT NULL DEFAULT ''",
          owner: "TEXT NOT NULL DEFAULT ''",
          acquired_at: "INTEGER NOT NULL DEFAULT 0",
          renewed_at: "INTEGER",
          expires_at: "INTEGER NOT NULL DEFAULT 0"
        },
        [e.AUTH_FAILURES_TABLE]: {
          fail_count: "INTEGER NOT NULL DEFAULT 0",
          expires_at: "INTEGER NOT NULL DEFAULT 0",
          updated_at: "INTEGER NOT NULL DEFAULT 0"
        },
        [e.CF_DASH_CACHE_TABLE]: {
          zone_id: "TEXT NOT NULL DEFAULT ''",
          bucket_date: "TEXT NOT NULL DEFAULT ''",
          payload: "TEXT NOT NULL DEFAULT '{}'",
          version: "INTEGER NOT NULL DEFAULT 0",
          cached_at: "INTEGER NOT NULL DEFAULT 0",
          expires_at: "INTEGER NOT NULL DEFAULT 0",
          updated_at: "INTEGER NOT NULL DEFAULT 0"
        },
        [e.CF_RUNTIME_CACHE_TABLE]: {
          cache_group: "TEXT NOT NULL DEFAULT ''",
          resource_id: "TEXT NOT NULL DEFAULT ''",
          payload: "TEXT NOT NULL DEFAULT '{}'",
          cached_at: "INTEGER NOT NULL DEFAULT 0",
          expires_at: "INTEGER NOT NULL DEFAULT 0",
          updated_at: "INTEGER NOT NULL DEFAULT 0"
        },
        [e.DNS_IP_POOL_ITEMS_TABLE]: {
          ip_type: "TEXT NOT NULL DEFAULT ''",
          source_kind: "TEXT NOT NULL DEFAULT ''",
          source_label: "TEXT",
          line_label: "TEXT NOT NULL DEFAULT ''",
          remark: "TEXT",
          created_at: "TEXT NOT NULL DEFAULT ''",
          updated_at: "TEXT NOT NULL DEFAULT ''"
        },
        [e.DNS_IP_POOL_SOURCES_TABLE]: {
          name: "TEXT NOT NULL DEFAULT ''",
          url: "TEXT NOT NULL DEFAULT ''",
          source_type: "TEXT NOT NULL DEFAULT 'url'",
          domain: "TEXT",
          source_kind: "TEXT NOT NULL DEFAULT 'custom'",
          preset_id: "TEXT NOT NULL DEFAULT ''",
          builtin_id: "TEXT NOT NULL DEFAULT ''",
          enabled: "INTEGER NOT NULL DEFAULT 1",
          sort_order: "INTEGER NOT NULL DEFAULT 0",
          ip_limit: "INTEGER NOT NULL DEFAULT 5",
          last_fetch_at: "TEXT",
          last_fetch_status: "TEXT",
          last_fetch_count: "INTEGER NOT NULL DEFAULT 0",
          created_at: "TEXT NOT NULL DEFAULT ''",
          updated_at: "TEXT NOT NULL DEFAULT ''"
        },
        [e.DNS_IP_POOL_FETCH_CACHE_TABLE]: {
          items_json: "TEXT NOT NULL DEFAULT '[]'",
          source_results_json: "TEXT NOT NULL DEFAULT '[]'",
          imported_count: "INTEGER NOT NULL DEFAULT 0",
          enabled_source_count: "INTEGER NOT NULL DEFAULT 0",
          cached_at: "INTEGER NOT NULL DEFAULT 0",
          expires_at: "INTEGER NOT NULL DEFAULT 0",
          created_at: "TEXT NOT NULL DEFAULT ''",
          updated_at: "TEXT NOT NULL DEFAULT ''"
        },
        [e.DNS_IP_PROBE_CACHE_TABLE]: {
          probe_status: "TEXT NOT NULL DEFAULT ''",
          latency_ms: "INTEGER",
          cf_ray: "TEXT",
          colo_code: "TEXT",
          city_name: "TEXT",
          country_code: "TEXT",
          country_name: "TEXT",
          probed_at: "TEXT NOT NULL DEFAULT ''",
          expires_at: "INTEGER NOT NULL DEFAULT 0"
        },
        [e.LOGS_TABLE]: {
          timestamp: "INTEGER NOT NULL DEFAULT 0",
          node_name: "TEXT NOT NULL DEFAULT ''",
          request_path: "TEXT NOT NULL DEFAULT ''",
          request_method: "TEXT NOT NULL DEFAULT ''",
          status_code: "INTEGER NOT NULL DEFAULT 0",
          response_time: "INTEGER NOT NULL DEFAULT 0",
          client_ip: "TEXT NOT NULL DEFAULT ''",
          inbound_colo: "TEXT",
          outbound_colo: "TEXT",
          user_agent: "TEXT",
          referer: "TEXT",
          category: "TEXT DEFAULT 'api'",
          error_detail: "TEXT",
          detail_json: "TEXT",
          created_at: "TEXT NOT NULL DEFAULT ''",
          inbound_ip: "TEXT",
          outbound_ip: "TEXT"
        },
        [e.STATS_HOURLY_TABLE]: {
          request_count: "INTEGER NOT NULL DEFAULT 0",
          play_count: "INTEGER NOT NULL DEFAULT 0",
          playback_info_count: "INTEGER NOT NULL DEFAULT 0",
          updated_at: "TEXT NOT NULL DEFAULT ''"
        }
      };
    },
    getD1RequiredPrimaryKeyContract() {
      return {
        [e.D1_SCHEMA_META_TABLE]: ["scope"],
        [e.SYS_STATUS_TABLE]: ["scope"],
        [e.SCHEDULED_LOCKS_TABLE]: ["scope"],
        [e.AUTH_FAILURES_TABLE]: ["ip"],
        [e.CF_DASH_CACHE_TABLE]: ["cache_key"],
        [e.CF_RUNTIME_CACHE_TABLE]: ["cache_key"],
        [e.DNS_IP_POOL_ITEMS_TABLE]: ["id"],
        [e.DNS_IP_POOL_SOURCES_TABLE]: ["id"],
        [e.DNS_IP_POOL_FETCH_CACHE_TABLE]: ["signature"],
        [e.DNS_IP_PROBE_CACHE_TABLE]: ["ip", "entry_colo"],
        [e.LOGS_TABLE]: ["id"],
        [e.STATS_HOURLY_TABLE]: ["bucket_date", "bucket_hour"]
      };
    },
    getD1SchemaReadyState(t) {
      if (!t || typeof t.prepare != "function") return null;
      let r = ee.D1SchemaReadyState.get(t);
      return r instanceof Map || (r = /* @__PURE__ */ new Map(), ee.D1SchemaReadyState.set(t, r)), r;
    },
    isD1SchemaReadyCached(t, r) {
      const a = e.getD1SchemaReadyState(t);
      return !!a && (Number(a.get(String(r || ""))) || 0) > B();
    },
    markD1SchemaReady(t, r) {
      const a = e.getD1SchemaReadyState(t);
      a && a.set(String(r || ""), B() + Math.max(1e3, Number($.Defaults.D1SchemaReadyTtlMs) || 1e3));
    },
    clearD1SchemaReady(t, r = []) {
      const a = ee.D1SchemaReadyState.get(t);
      if (!(a instanceof Map)) return;
      const n = (Array.isArray(r) ? r : [r]).map((s) => String(s || "").trim()).filter(Boolean);
      if (!n.length) {
        a.clear();
        return;
      }
      for (const s of n) a.delete(s);
    },
    normalizeRevisionMeta(t, r) {
      const a = H(t) ? t : {}, n = H(r) ? r : {}, s = String(a.updatedAt || n.updatedAt || "").trim(), i = String(a.hash || n.hash || "").trim();
      return {
        ...n,
        ...a,
        updatedAt: s,
        hash: i,
        revision: String(a.revision || n.revision || Gt(i, s)).trim()
      };
    },
    async readRevisionMeta(t, r, a) {
      if (!t || !r) return e.normalizeRevisionMeta({}, a);
      try {
        return e.normalizeRevisionMeta(await t.get(r, { type: "json" }), a);
      } catch {
        return e.normalizeRevisionMeta({}, a);
      }
    },
    async readRevisionMetaForRead(t, r, a) {
      if (!t || !r) return null;
      const n = await Oe(t, r, { type: "json" });
      return H(n) ? e.normalizeRevisionMeta(n, a) : null;
    },
    async writeRevisionMeta(t, r, a, n = null) {
      if (!t || !r) return a;
      const s = t.put(r, JSON.stringify(a));
      return n && n.waitUntil(s), await s, a;
    },
    async ensureConfigMeta(t, r = null, a = {}) {
      const n = ce(r ?? (await t?.get(e.CONFIG_KEY, { type: "json" }) || {})), s = e.normalizeRevisionMeta(So(n)), i = await e.readRevisionMeta(t, e.CONFIG_META_KEY);
      return i.hash === s.hash && i.revision ? i : await e.writeRevisionMeta(t, e.CONFIG_META_KEY, s, a.ctx);
    },
    buildNodesIndexMeta(t = [], r = [], a = {}) {
      const n = e.normalizeNodeIndex(t), s = e.normalizeNodeSummaryIndex(r).nodes, i = String(a.updatedAt || "").trim() || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), c = ie(re(n)), l = ie(re(s)), u = ie(`${c}:${l}:${n.length}`);
      return {
        revision: Gt(u, i),
        updatedAt: i,
        hash: u,
        count: n.length,
        indexHash: c,
        fullIndexHash: l
      };
    },
    async ensureNodesIndexMeta(t, r = {}) {
      if (!t) return e.buildNodesIndexMeta([], []);
      let a = Array.isArray(r.nodes) ? e.normalizeNodeSummaryIndex(r.nodes).nodes : null;
      if (!a) {
        const c = await e.getNodesSummaryIndex(t, { ctx: r.ctx });
        a = Array.isArray(c) ? c : [];
      }
      const n = Array.isArray(r.index) ? e.normalizeNodeIndex(r.index) : e.normalizeNodeIndex(a.map((c) => c?.name)), s = e.buildNodesIndexMeta(n, a, r), i = await e.readRevisionMeta(t, e.NODES_INDEX_META_KEY, {
        count: 0,
        indexHash: "",
        fullIndexHash: ""
      });
      return i.indexHash === s.indexHash && i.fullIndexHash === s.fullIndexHash && Number(i.count) === Number(s.count) && i.revision ? i : await xr(async () => {
        const c = await e.loadNodeSummariesForMutation(t, { ctx: r.ctx });
        return (await e.commitNodesSummaryIndexMutation(c, {
          kv: t,
          ctx: r.ctx
        })).meta;
      }, t);
    },
    async getNodesRevision(t, r = {}) {
      if (!t) return "";
      const a = be(t), n = B();
      if (r.forceFresh !== !0 && a.NodesRevisionCache?.loaded === !0 && a.NodesRevisionCache.exp > n) return String(a.NodesRevisionCache.revision || "").trim();
      const s = a.NodesRevisionCacheGeneration;
      return await Pn(a.SingleFlightTasks, mt(["nodes_revision", s]), async () => {
        const i = a.NodesRevisionCache;
        if (r.forceFresh !== !0 && i?.loaded === !0 && i.exp > B()) return String(i.revision || "").trim();
        let c = null;
        try {
          c = await t.get(e.NODES_INDEX_META_KEY, { type: "json" });
        } catch {
          return "";
        }
        const l = H(c) ? String(c.revision || "").trim() : "";
        return a.NodesRevisionCacheGeneration === s && (a.NodesRevisionCache = {
          loaded: !0,
          revision: l,
          exp: B() + $.Defaults.NodesRevisionCacheTtlMs
        }), l;
      });
    },
    getLogsRevisionFromStatus(t = {}) {
      const r = String(t?.revision || "").trim();
      return r || Gt("logs", String(t?.updatedAt || "").trim());
    },
    async bumpLogsRevision(t, r = {}, a = null) {
      const n = await e.getOpsStatusSection(t, "log"), s = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), i = ie(`${e.getLogsRevisionFromStatus(n)}:${s}:${re(r)}`);
      return await e.patchOpsStatus(t, { log: {
        ...r,
        revision: Gt(i, s),
        updatedAt: s
      } }, a);
    },
    async getAdminRevisions(t, r = {}) {
      const a = e.resolveOpsStatusStores(t), n = a.kv, s = a.db, [i, c, l, u] = await Promise.all([
        e.ensureConfigMeta(n, r.config, { ctx: r.ctx }),
        e.ensureNodesIndexMeta(n, {
          ctx: r.ctx,
          index: r.nodes?.map?.((d) => d?.name),
          nodes: r.nodes
        }),
        e.getOpsStatusSection({
          kv: n,
          db: s
        }, "log"),
        e.getOpsStatusSection({
          kv: n,
          db: s
        }, "dnsIpPool")
      ]);
      return {
        configRevision: String(i?.revision || ""),
        nodesRevision: String(c?.revision || ""),
        logsRevision: e.getLogsRevisionFromStatus(l),
        dnsIpPoolRevision: e.getDnsIpPoolRevisionFromStatus(u)
      };
    },
    async getAdminRevisionsForRead(t, r = {}) {
      const a = e.resolveOpsStatusStores(t), n = a.kv, s = a.db, [i, c, l, u] = await Promise.all([
        e.readRevisionMetaForRead(n, e.CONFIG_META_KEY),
        e.readRevisionMetaForRead(n, e.NODES_INDEX_META_KEY, {
          count: 0,
          indexHash: "",
          fullIndexHash: ""
        }),
        e.getOpsStatusSection({
          kv: n,
          db: s
        }, "log"),
        e.getOpsStatusSection({
          kv: n,
          db: s
        }, "dnsIpPool")
      ]), d = r.config !== void 0 ? r.config : await Oe(n, e.CONFIG_KEY, { type: "json" }) || {}, f = e.normalizeRevisionMeta(So(ce(d), { updatedAt: String(i?.updatedAt || "").trim() })), m = String(i?.revision || "").trim().split(".").pop() || "", p = i?.hash === f.hash && m === f.hash ? i : f;
      let h = c;
      if (!h) {
        const g = Array.isArray(r.nodes) ? r.nodes : await e.getNodesSummaryIndexStrict(n, { ctx: r.ctx });
        h = e.buildNodesIndexMeta((Array.isArray(g) ? g : []).map((y) => y?.name), Array.isArray(g) ? g : []);
      }
      return {
        configRevision: String(p?.revision || ""),
        nodesRevision: String(h?.revision || ""),
        logsRevision: e.getLogsRevisionFromStatus(l),
        dnsIpPoolRevision: e.getDnsIpPoolRevisionFromStatus(u)
      };
    }
  };
}
function yy(o = {}, e = {}) {
  return {
    async hasLogsFtsTable(t) {
      if (!t) return !1;
      try {
        const r = await t.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.LOGS_FTS_TABLE).first();
        return String(r?.name || "") === e.LOGS_FTS_TABLE;
      } catch {
        return !1;
      }
    },
    async getLogsFtsReadiness(t) {
      if (!t || !await e.hasLogsFtsTable(t)) return {
        tableReady: !1,
        virtualTableReady: !1,
        columnsReady: !1,
        triggerReady: !1,
        ready: !1
      };
      const r = await e.getTableColumns(t, e.LOGS_FTS_TABLE), a = [
        "node_name",
        "request_path",
        "user_agent",
        "error_detail",
        "detail_json"
      ].every((p) => r.has(p)), [n, s] = await Promise.all([t.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.LOGS_FTS_TABLE).first(), t.prepare("SELECT name, tbl_name, sql FROM sqlite_master WHERE type = 'trigger' AND name = ? LIMIT 1").bind(e.LOGS_FTS_INSERT_TRIGGER).first()]), i = Pr(n?.sql || "").replace(/'/g, ""), c = /^create\s+virtual\s+table\b/.test(i) && /\busing\s+fts5\s*\(/.test(i) && new RegExp(`\\bcontent\\s*=\\s*${e.LOGS_TABLE}\\b`).test(i) && /\bcontent_rowid\s*=\s*id\b/.test(i), l = Pr(s?.sql || ""), u = l.replace(/\s+/g, ""), d = `insert into ${e.LOGS_FTS_TABLE} (
            rowid, node_name, request_path, user_agent, error_detail, detail_json
          ) values (
            new.id, new.node_name, new.request_path,
            coalesce(new.user_agent, ''), coalesce(new.error_detail, ''), coalesce(new.detail_json, '')
          )`.replace(/\s+/g, ""), f = u.includes(d), m = String(s?.name || "") === e.LOGS_FTS_INSERT_TRIGGER && String(s?.tbl_name || "") === e.LOGS_TABLE && new RegExp(`\\bafter\\s+insert\\s+on\\s+${e.LOGS_TABLE}\\b`).test(l) && new RegExp(`\\binsert\\s+into\\s+${e.LOGS_FTS_TABLE}\\s*\\(`).test(l) && f;
      return {
        tableReady: !0,
        virtualTableReady: c,
        columnsReady: a,
        triggerReady: m,
        ready: c && a && m
      };
    },
    async isLogsFtsReady(t) {
      return (await e.getLogsFtsReadiness(t)).ready === !0;
    },
    async hasLogsBaseTable(t) {
      if (!t) return !1;
      if (e.isD1SchemaReadyCached(t, "logsTableExists")) return !0;
      try {
        const r = await t.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.LOGS_TABLE).first(), a = String(r?.name || "") === e.LOGS_TABLE;
        return a && e.markD1SchemaReady(t, "logsTableExists"), a;
      } catch {
        return !1;
      }
    },
    async hasStatsHourlyTable(t) {
      if (!t) return !1;
      if (e.isD1SchemaReadyCached(t, "statsTableExists")) return !0;
      try {
        const r = await t.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.STATS_HOURLY_TABLE).first(), a = String(r?.name || "") === e.STATS_HOURLY_TABLE;
        return a && e.markD1SchemaReady(t, "statsTableExists"), a;
      } catch {
        return !1;
      }
    },
    async getTableColumnDefinitions(t, r) {
      if (!t || !r) return [];
      try {
        return ((await t.prepare(`PRAGMA table_xinfo(${de(r)})`).all())?.results || []).map((a) => ({
          name: String(a?.name || "").toLowerCase(),
          type: String(a?.type || "").trim().toUpperCase(),
          affinity: jn(a?.type),
          primaryKeyOrder: Math.max(0, Number(a?.pk) || 0),
          notNull: Number(a?.notnull) === 1,
          defaultValue: a?.dflt_value ?? null,
          hidden: Math.max(0, Number(a?.hidden) || 0)
        })).filter((a) => a.name);
      } catch (a) {
        const n = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${r}`);
        throw n.code = "D1_SCHEMA_INSPECTION_FAILED", n.status = 503, n.details = {
          tableName: String(r),
          cause: ue(a, "d1_pragma_failed")
        }, n;
      }
    },
    async getTableColumns(t, r) {
      const a = await e.getTableColumnDefinitions(t, r);
      return new Set(a.map((n) => n.name));
    },
    async getIndexKeyColumns(t, r) {
      if (!t || !r) return [];
      try {
        return ((await t.prepare(`PRAGMA index_xinfo(${de(r)})`).all())?.results || []).map((a) => ({
          order: Math.max(0, Number(a?.seqno) || 0),
          name: String(a?.name || "").toLowerCase(),
          key: a?.key === void 0 || Number(a.key) === 1,
          expression: Number(a?.cid) === -2 || !String(a?.name || "").trim()
        })).filter((a) => a.key).sort((a, n) => a.order - n.order).map((a) => a.expression ? "<expression>" : a.name);
      } catch (a) {
        const n = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${r}`);
        throw n.code = "D1_SCHEMA_INSPECTION_FAILED", n.status = 503, n.details = {
          indexName: String(r),
          cause: ue(a, "d1_pragma_failed")
        }, n;
      }
    },
    async getTableIndexDefinitions(t, r) {
      if (!t || !r) return [];
      try {
        return ((await t.prepare(`PRAGMA index_list(${de(r)})`).all())?.results || []).map((a) => ({
          name: String(a?.name || ""),
          unique: Number(a?.unique) === 1,
          partial: Number(a?.partial) === 1
        })).filter((a) => a.name);
      } catch (a) {
        const n = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${r}`);
        throw n.code = "D1_SCHEMA_INSPECTION_FAILED", n.status = 503, n.details = {
          tableName: String(r),
          cause: ue(a, "d1_pragma_failed")
        }, n;
      }
    },
    async getD1TableNameSet(t) {
      if (!t) return /* @__PURE__ */ new Set();
      const r = await t.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all();
      return new Set((r?.results || []).map((a) => String(a?.name || "")).filter(Boolean));
    },
    async getD1SchemaSnapshot(t) {
      if (!t) return {
        objects: [],
        columns: [],
        indexes: []
      };
      const r = Object.keys(e.getD1CurrentSchemaContract().columns), a = [...r, e.LOGS_FTS_TABLE], n = a.map(() => "?").join(", "), s = r.map(() => "?").join(", "), [i, c, l] = await Promise.all([
        t.prepare("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE type IN ('table', 'index', 'trigger') ORDER BY type, name").all(),
        t.prepare(`SELECT schema_table.name AS table_name, column_info.name, column_info.type, column_info."notnull" AS is_not_null,
					column_info.dflt_value, column_info.pk, column_info.hidden
					FROM sqlite_master AS schema_table
					JOIN pragma_table_xinfo(schema_table.name) AS column_info
					WHERE schema_table.type = 'table' AND schema_table.name IN (${n})
					ORDER BY schema_table.name, column_info.cid`).bind(...a).all(),
        t.prepare(`SELECT schema_index.tbl_name AS table_name, index_list.name AS index_name, index_list."unique" AS is_unique,
					index_list.partial, index_list.origin, index_column.seqno, index_column.cid, index_column.name AS column_name, index_column."key" AS is_key
					FROM sqlite_master AS schema_index
					JOIN pragma_index_list(schema_index.tbl_name) AS index_list ON index_list.name = schema_index.name
					JOIN pragma_index_xinfo(index_list.name) AS index_column
					WHERE schema_index.type = 'index' AND schema_index.tbl_name IN (${s})
					ORDER BY schema_index.tbl_name, index_list.name, index_column.seqno`).bind(...r).all()
      ]);
      return {
        objects: i?.results || [],
        columns: c?.results || [],
        indexes: l?.results || []
      };
    },
    getD1CurrentSchemaContract() {
      const t = e.getD1RequiredPrimaryKeyContract(), r = {
        [e.D1_SCHEMA_META_TABLE]: { scope: "TEXT" },
        [e.SYS_STATUS_TABLE]: { scope: "TEXT" },
        [e.SCHEDULED_LOCKS_TABLE]: { scope: "TEXT" },
        [e.AUTH_FAILURES_TABLE]: { ip: "TEXT" },
        [e.CF_DASH_CACHE_TABLE]: { cache_key: "TEXT" },
        [e.CF_RUNTIME_CACHE_TABLE]: { cache_key: "TEXT" },
        [e.DNS_IP_POOL_ITEMS_TABLE]: {
          id: "TEXT",
          ip: "TEXT"
        },
        [e.DNS_IP_POOL_SOURCES_TABLE]: { id: "TEXT" },
        [e.DNS_IP_POOL_FETCH_CACHE_TABLE]: { signature: "TEXT" },
        [e.DNS_IP_PROBE_CACHE_TABLE]: {
          ip: "TEXT",
          entry_colo: "TEXT"
        },
        [e.LOGS_TABLE]: { id: "INTEGER" },
        [e.STATS_HOURLY_TABLE]: {
          bucket_date: "TEXT",
          bucket_hour: "INTEGER"
        }
      }, a = Object.fromEntries(Object.entries(e.getD1RuntimeColumnAdditions()).map(([n, s]) => {
        const i = Object.fromEntries(Object.entries(s).map(([c, l]) => [c, String(l || "").trim().split(/\s+/, 1)[0].toUpperCase()]));
        return [n, {
          ...r[n],
          ...i
        }];
      }));
      return {
        columns: Object.fromEntries(Object.entries(a).map(([n, s]) => [n, Object.keys(s)])),
        columnTypes: a,
        columnAffinities: Object.fromEntries(Object.entries(a).map(([n, s]) => [n, Object.fromEntries(Object.entries(s).map(([i, c]) => [i, jn(c)]))])),
        primaryKeys: t,
        indexes: e.getD1RuntimeIndexContract(),
        uniqueIndexes: e.getD1UniqueIndexContract()
      };
    },
    async getD1SchemaFingerprint(t) {
      return t ? ie(re((await t.prepare("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE type IN ('table', 'index', 'trigger') ORDER BY type, name").all())?.results || [])) : "";
    },
    async getD1SchemaStatus(t, r = {}) {
      if (!t) return {
        tables: {},
        columns: {},
        indexes: {},
        constraints: {
          primaryKeys: {},
          uniqueKeys: {}
        },
        ftsReady: !1,
        fts: {},
        schemaReady: !1,
        issues: ["db_not_configured"]
      };
      const a = e.getD1CurrentSchemaContract(), n = r.snapshot || await e.getD1SchemaSnapshot(t), s = n.objects || [], i = new Set(s.filter((A) => A?.type === "table").map((A) => String(A?.name || "")).filter(Boolean)), c = /* @__PURE__ */ new Map();
      for (const A of n.indexes || []) {
        const w = String(A?.index_name || "");
        if (!w) continue;
        let R = c.get(w);
        R || (R = {
          name: w,
          table: String(A?.table_name || ""),
          unique: Number(A?.is_unique) === 1,
          partial: Number(A?.partial) === 1,
          origin: String(A?.origin || ""),
          columns: []
        }, c.set(w, R)), (A?.is_key === void 0 || Number(A.is_key) === 1) && R.columns.push({
          order: Math.max(0, Number(A?.seqno) || 0),
          name: Number(A?.cid) === -2 || !String(A?.column_name || "").trim() ? "<expression>" : String(A.column_name).toLowerCase()
        });
      }
      for (const A of c.values()) A.columns = A.columns.sort((w, R) => w.order - R.order).map((w) => w.name);
      const l = /* @__PURE__ */ new Map();
      for (const A of n.columns || []) {
        const w = String(A?.table_name || "");
        l.has(w) || l.set(w, []), l.get(w).push({
          name: String(A?.name || "").toLowerCase(),
          type: String(A?.type || "").trim().toUpperCase(),
          affinity: jn(A?.type),
          primaryKeyOrder: Math.max(0, Number(A?.pk) || 0),
          notNull: Number(A?.is_not_null) === 1,
          defaultValue: A?.dflt_value ?? null,
          hidden: Math.max(0, Number(A?.hidden) || 0)
        });
      }
      const u = Object.fromEntries(Object.keys(a.columns).map((A) => [A, i.has(A)])), d = {}, f = {}, m = [];
      for (const [A, w] of Object.entries(a.columns)) {
        if (!i.has(A)) {
          d[A] = Object.fromEntries(w.map((D) => [D, !1])), f[A] = !1, m.push(`missing_table:${A}`);
          continue;
        }
        const R = l.get(A) || [], I = new Map(R.map((D) => [D.name, D]));
        d[A] = Object.fromEntries(w.map((D) => {
          const U = I.get(D), V = String(a.columnAffinities?.[A]?.[D] || "").toUpperCase(), X = A === e.LOGS_TABLE && D === "id";
          return [D, !!U && (!V || U.affinity === V) && (!X || U.type === "INTEGER")];
        }));
        for (const [D, U] of Object.entries(d[A])) if (!U) {
          const V = I.get(D);
          m.push(V ? `invalid_column_affinity:${A}.${D}` : `missing_column:${A}.${D}`);
        }
        const x = R.filter((D) => D.primaryKeyOrder > 0).sort((D, U) => D.primaryKeyOrder - U.primaryKeyOrder).map((D) => D.name), N = A === e.LOGS_TABLE ? R.find((D) => D.name === "id") : null;
        f[A] = re(x) === re(a.primaryKeys[A] || []) && (!N || N.type === "INTEGER"), f[A] || m.push(`invalid_primary_key:${A}`);
        const F = R.filter((D) => !w.includes(D.name) && D.notNull && D.defaultValue === null && D.primaryKeyOrder === 0).map((D) => D.name);
        F.length && m.push(`unsupported_required_columns:${A}:${F.join(",")}`);
      }
      let p = !1;
      if (i.has(e.DNS_IP_POOL_ITEMS_TABLE)) {
        for (const A of [...c.values()].filter((w) => w.table === e.DNS_IP_POOL_ITEMS_TABLE && w.unique && !w.partial)) if (re(A.columns) === re(["ip"])) {
          p = !0;
          break;
        }
        p || m.push(`missing_unique_key:${e.DNS_IP_POOL_ITEMS_TABLE}.ip`);
      }
      const h = {};
      for (const [A, w] of Object.entries(a.indexes)) {
        const R = c.get(A);
        if (!R) {
          h[A] = !1, m.push(`missing_index:${A}`);
          continue;
        }
        h[A] = R.table === w.table && R.unique === !1 && R.partial === !1 && re(R.columns) === re(w.columns), h[A] || m.push(`invalid_index:${A}`);
      }
      for (const A of Object.keys(a.columns)) {
        const w = [a.primaryKeys?.[A] || [], ...Object.values(a.uniqueIndexes || {}).filter((I) => I.table === A).map((I) => I.columns)], R = [...c.values()].filter((I) => I.table === A && I.unique && !I.partial && !w.some((x) => re(x) === re(I.columns))).map((I) => I.name);
        R.length && m.push(`unsupported_unique_indexes:${A}:${R.join(",")}`);
      }
      const g = /* @__PURE__ */ new Set([String(e.LOGS_FTS_INSERT_TRIGGER).toLowerCase()]);
      for (const A of Object.keys(a.columns)) {
        const w = [], R = [];
        for (const I of s) {
          if (I?.type !== "trigger" || String(I?.tbl_name || "") !== A) continue;
          const x = String(I?.name || "");
          !x || g.has(x.toLowerCase()) || (A === e.LOGS_TABLE && e.isLogsFtsSyncTrigger(I) ? R.push(x) : w.push(x));
        }
        w.length && m.push(`unsupported_triggers:${A}:${w.join(",")}`), R.length && m.push(`legacy_fts_trigger:${A}:${R.join(",")}`);
      }
      const y = s.find((A) => A?.type === "table" && String(A?.name || "") === e.LOGS_FTS_TABLE), _ = s.find((A) => A?.type === "trigger" && String(A?.name || "") === e.LOGS_FTS_INSERT_TRIGGER), S = new Set((l.get(e.LOGS_FTS_TABLE) || []).map((A) => A.name)), E = Pr(y?.sql || "").replace(/'/g, ""), b = Pr(_?.sql || ""), T = b.replace(/\s+/g, ""), C = `insertinto${e.LOGS_FTS_TABLE}(rowid,node_name,request_path,user_agent,error_detail,detail_json)values(new.id,new.node_name,new.request_path,coalesce(new.user_agent,''),coalesce(new.error_detail,''),coalesce(new.detail_json,''))`, L = {
        tableReady: !!y,
        virtualTableReady: !!y && /^create\s+virtual\s+table\b/.test(E) && /\busing\s+fts5\s*\(/.test(E) && new RegExp(`\\bcontent\\s*=\\s*${e.LOGS_TABLE}\\b`).test(E) && /\bcontent_rowid\s*=\s*id\b/.test(E),
        columnsReady: [
          "node_name",
          "request_path",
          "user_agent",
          "error_detail",
          "detail_json"
        ].every((A) => S.has(A)),
        triggerReady: String(_?.tbl_name || "") === e.LOGS_TABLE && new RegExp(`\\bafter\\s+insert\\s+on\\s+${e.LOGS_TABLE}\\b`).test(b) && T.includes(C)
      };
      L.ready = L.virtualTableReady && L.columnsReady && L.triggerReady, L.ready || m.push(L.tableReady ? "fts_contract_invalid" : `missing_table:${e.LOGS_FTS_TABLE}`);
      const P = m.length === 0 && Object.values(u).every(Boolean) && Object.values(d).every((A) => Object.values(A).every(Boolean)) && Object.values(f).every(Boolean) && p && Object.values(h).every(Boolean) && L.ready;
      return {
        tables: u,
        columns: d,
        indexes: h,
        constraints: {
          primaryKeys: f,
          uniqueKeys: { [`${e.DNS_IP_POOL_ITEMS_TABLE}.ip`]: p }
        },
        ftsReady: L.ready,
        fts: L,
        schemaReady: P,
        issues: m
      };
    },
    async getD1SchemaReadiness(t, r = {}) {
      if (r.allowAttestedFastPath === !0 && r.env) {
        const a = await e.verifyD1SchemaAttestation(t, r.env);
        if (a.blocked) return {
          ...await e.getD1SchemaStatus(t),
          fastPath: !1,
          attested: a
        };
        if (a.valid) return {
          schemaReady: !0,
          fastPath: !0,
          contractVersion: ct,
          contractHash: e.getD1ContractHash(),
          schemaFingerprint: String(a.meta?.schema_fingerprint || ""),
          schemaCookie: a.schemaCookie,
          issues: []
        };
      }
      return {
        ...await e.getD1SchemaStatus(t),
        fastPath: !1
      };
    },
    async probeD1UniqueKeyRepair(t, r, a = []) {
      const n = de(r), s = a.map((u) => de(u)), i = s.map((u) => `${u} IS NULL OR (typeof(${u}) = 'text' AND trim(${u}) = '')`).join(" OR "), [c, l] = await Promise.all([t.prepare(`SELECT 1 AS present FROM ${n} WHERE ${i} LIMIT 1`).first(), t.prepare(`SELECT 1 AS present FROM ${n} GROUP BY ${s.join(", ")} HAVING COUNT(*) > 1 LIMIT 1`).first()]);
      return {
        empty: !!c,
        duplicate: !!l
      };
    },
    async probeD1PrimaryKeyRepair(t, r, a) {
      const n = await e.getTableColumnDefinitions(t, r), s = r === e.LOGS_TABLE, i = new Set(a.columns?.[r] || []), c = a.primaryKeys?.[r] || [], l = new Map(n.map((g) => [g.name, g])), u = [];
      for (const g of c) {
        const y = l.get(g), _ = a.columnAffinities?.[r]?.[g];
        y ? (y.affinity !== _ || r === e.LOGS_TABLE && g === "id" && y.type !== "INTEGER") && u.push(`invalid_column_affinity:${r}.${g}`) : s || u.push(`missing_key_column:${r}.${g}`);
      }
      const d = n.filter((g) => !i.has(g.name)).map((g) => g.name);
      !s && d.length && u.push(`unsupported_extra_columns:${r}:${d.join(",")}`), !s && n.some((g) => g.hidden > 0) && u.push(`unsupported_hidden_columns:${r}`), ((await t.prepare(`PRAGMA foreign_key_list(${de(r)})`).all())?.results || []).length && u.push(`unsupported_foreign_keys:${r}`);
      const f = ((await t.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'trigger' AND tbl_name = ?").bind(r).all())?.results || []).filter((g) => {
        if (r !== e.LOGS_TABLE) return !0;
        const y = String(g?.name || "").toLowerCase(), _ = Pr(g?.sql || "");
        return !(y === String(e.LOGS_FTS_INSERT_TRIGGER).toLowerCase() || y === `${e.LOGS_TABLE}_ai` || y === `${e.LOGS_TABLE}_au` || y === `${e.LOGS_TABLE}_ad` || _.includes(String(e.LOGS_FTS_TABLE).toLowerCase()));
      });
      !s && f.length && u.push(`unsupported_triggers:${r}:${f.map((g) => String(g?.name || "")).join(",")}`);
      const m = [`__d1_repair_${r}_`, `__d1_backup_${r}_`], p = await t.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND (name GLOB ? OR name GLOB ?) LIMIT 1").bind(`${m[0]}*`, `${m[1]}*`).first();
      p?.name && u.push(`repair_artifact_present:${r}:${String(p.name)}`);
      let h = null;
      if (!s) {
        const g = de(r), y = await t.prepare(`SELECT COUNT(*) AS total FROM (SELECT 1 FROM ${g} LIMIT ${Vn + 1})`).first();
        h = Math.max(0, Number(y?.total) || 0);
      }
      if (!s && h > Vn && u.push(`rebuild_row_limit_exceeded:${r}:${h}`), !s && !u.length) {
        const g = await e.probeD1UniqueKeyRepair(t, r, c);
        g.empty && u.push(`primary_key_empty:${r}`), g.duplicate && u.push(`primary_key_duplicate:${r}`);
      }
      return {
        repairable: u.length === 0,
        rowCount: h,
        estimatedRowsIsLowerBound: h !== null && h > Vn,
        rowCountMeasured: h !== null,
        allowsDataLoss: s,
        blockers: u
      };
    },
    async buildD1SchemaRepairPlan(t) {
      const r = await e.getD1SchemaSnapshot(t), a = await e.getD1SchemaStatus(t, { snapshot: r }), n = e.getD1CurrentSchemaContract(), s = ie(re(r.objects || [])), i = await e.getD1SchemaCookie(t), c = e.getD1ContractHash(), l = await e.readD1SchemaMeta(t), u = [], d = [], f = [], m = [], p = (R, I, x = "low", N = 0, F = {}) => m.push({
        kind: R,
        target: I,
        risk: x,
        estimatedRows: N === null ? null : Math.max(0, Number(N) || 0),
        ...F
      }), h = Math.max(0, Number(l?.contract_version) || 0), g = h > ct ? `schema_version_ahead:${h}` : "";
      for (const [R, I] of Object.entries(a.tables || {})) {
        if (!I) {
          const N = `missing_table:${R}`;
          u.push(N), p("create_table", R);
          continue;
        }
        const x = R === e.LOGS_TABLE && a.constraints?.primaryKeys?.[R] !== !0;
        for (const [N, F] of Object.entries(a.columns?.[R] || {})) {
          if (F) continue;
          const D = `${R}.${N}`, U = (a.issues || []).find((V) => String(V).endsWith(D)) || `missing_column:${D}`;
          x && String(U).startsWith("missing_column:") ? d.push(U) : String(U).startsWith("missing_column:") && e.getD1RuntimeColumnAdditions()?.[R]?.[N] ? (u.push(U), p("add_column", D)) : f.push(U);
        }
        if (a.constraints?.primaryKeys?.[R] !== !0) {
          const N = `invalid_primary_key:${R}`, F = await e.probeD1PrimaryKeyRepair(t, R, n);
          F.repairable ? (d.push(N), p(F.allowsDataLoss === !0 ? "recreate_log_table" : "rebuild_table", R, "high", F.rowCount, {
            allowsDataLoss: F.allowsDataLoss === !0,
            willDiscardData: F.allowsDataLoss === !0,
            dataMode: F.allowsDataLoss === !0 ? "discard" : "copy",
            estimatedRowsIsLowerBound: F.estimatedRowsIsLowerBound === !0,
            rowCountMeasured: F.rowCountMeasured === !0
          })) : f.push(N, ...F.blockers);
        }
      }
      for (const R of a.issues || []) if (/^unsupported_(?:required_columns|unique_indexes|triggers):/.test(String(R))) {
        const I = String(R).split(":", 2)[1];
        if (I === e.LOGS_TABLE && a.constraints?.primaryKeys?.[I] !== !0) continue;
        f.push(R);
      }
      for (const R of a.issues || []) {
        const I = /^legacy_fts_trigger:([^:]+):(.+)$/.exec(String(R));
        if (!I) continue;
        const x = I[1];
        for (const N of I[2].split(",")) {
          const F = N.trim();
          F && (u.push(`legacy_fts_trigger:${x}:${F}`), p("drop_trigger", F));
        }
      }
      const y = `${e.DNS_IP_POOL_ITEMS_TABLE}.ip`;
      if (a.tables?.[e.DNS_IP_POOL_ITEMS_TABLE] && a.constraints?.uniqueKeys?.[y] !== !0 && a.columns?.[e.DNS_IP_POOL_ITEMS_TABLE]?.ip === !0) {
        const R = await e.probeD1UniqueKeyRepair(t, e.DNS_IP_POOL_ITEMS_TABLE, ["ip"]);
        R.empty && f.push(`unique_key_empty:${y}`), R.duplicate && f.push(`unique_key_duplicate:${y}`), !R.empty && !R.duplicate && (u.push(`missing_unique_key:${y}`), p("create_unique_index", "ux_dns_ip_pool_items_ip"));
      }
      const _ = m.some((R) => R.kind === "recreate_log_table" && R.target === e.LOGS_TABLE);
      for (const [R, I] of Object.entries(a.indexes || {})) if (!I) {
        const x = (a.issues || []).includes(`invalid_index:${R}`) ? `invalid_index:${R}` : `missing_index:${R}`;
        u.push(x), _ && n.indexes?.[R]?.table === e.LOGS_TABLE || p(x.startsWith("invalid_") ? "repair_index" : "create_index", R);
      }
      if (a.ftsReady !== !0) {
        const R = a.fts?.tableReady ? "fts_contract_invalid" : `missing_table:${e.LOGS_FTS_TABLE}`;
        u.push(R), _ || p(a.fts?.tableReady ? "recreate_fts" : "create_fts", e.LOGS_FTS_TABLE);
      }
      const S = (R) => [...new Set(R.map((I) => String(I || "").trim()).filter(Boolean))], E = S(u), b = S(d), T = S(f);
      g && (T.length || b.length ? T.push(g) : (E.push(g), p("reattest_contract_version", e.D1_SCHEMA_META_TABLE)));
      const C = [...new Map(m.map((R) => [`${R.kind}:${R.target}`, R])).values()].sort((R, I) => `${R.risk}:${R.kind}:${R.target}`.localeCompare(`${I.risk}:${I.kind}:${I.target}`)), L = C.filter((R) => R.risk !== "high"), P = C.filter((R) => R.risk === "high"), A = T.length ? "blocked" : b.length ? "high" : E.length ? "low" : "none", w = T.length ? "blocked" : L.length ? "safe" : P.length ? "destructive" : "ready";
      return {
        version: Xa,
        phase: w,
        contractVersion: ct,
        contractHash: c,
        schemaCookie: i,
        planHash: ie(re({
          version: Xa,
          contractVersion: ct,
          contractHash: c,
          schemaCookie: i,
          schemaFingerprint: s,
          phase: w,
          repairableIssues: E,
          highRiskIssues: b,
          blockingIssues: T,
          steps: C
        })),
        schemaFingerprint: s,
        risk: A,
        repairableIssues: E,
        highRiskIssues: b,
        blockingIssues: T,
        steps: C,
        status: a
      };
    },
    async createD1SchemaRepairToken(t, r, a = {}) {
      const n = String(t?.JWT_SECRET || "").trim();
      if (!n) {
        const l = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the D1 schema repair plan");
        throw l.code = "SERVER_MISCONFIGURED", l.status = 503, l;
      }
      const s = Math.max(0, Math.floor(Number(a.nowMs ?? B()) / 1e3)), i = s + Math.floor(vd / 1e3), c = ta(JSON.stringify({
        version: Xa,
        scope: "d1_schema_repair",
        phase: String(r?.phase || ""),
        contractVersion: Math.max(0, Number(r?.contractVersion) || 0),
        contractHash: String(r?.contractHash || ""),
        schemaCookie: Math.max(0, Number(r?.schemaCookie) || 0),
        planHash: String(r?.planHash || ""),
        schemaFingerprint: String(r?.schemaFingerprint || ""),
        destructiveTargets: (r?.steps || []).filter((l) => l?.risk === "high").map((l) => String(l?.target || "")),
        issuedAt: s,
        expiresAt: i
      }));
      return {
        token: `${c}.${await bt(n, c)}`,
        expiresAt: i
      };
    },
    async verifyD1SchemaRepairToken(t, r, a, n = {}) {
      const s = String(t?.JWT_SECRET || "").trim(), i = String(r || "").trim(), c = (m, p = {}) => {
        const h = /* @__PURE__ */ new Error("D1 schema repair plan is stale");
        return h.code = "D1_SCHEMA_REPAIR_PLAN_STALE", h.status = 409, h.details = {
          reason: m,
          ...p
        }, h;
      };
      if (!s) {
        const m = /* @__PURE__ */ new Error("JWT_SECRET is required to verify the D1 schema repair plan");
        throw m.code = "SERVER_MISCONFIGURED", m.status = 503, m;
      }
      const l = i.indexOf(".");
      if (l <= 0 || l === i.length - 1) throw c("invalid_token");
      const u = i.slice(0, l);
      if (i.slice(l + 1) !== await bt(s, u)) throw c("invalid_signature");
      let d = null;
      try {
        d = JSON.parse(tr(u));
      } catch {
      }
      if (!H(d) || d.version !== Xa || d.scope !== "d1_schema_repair" || d.phase !== "destructive") throw c("invalid_payload");
      const f = Math.max(0, Math.floor(Number(n.nowMs ?? B()) / 1e3));
      if (Number(d.expiresAt) <= f) throw c("expired", { expiresAt: Number(d.expiresAt) || 0 });
      if (String(d.planHash || "") !== String(a?.planHash || "") || String(d.schemaFingerprint || "") !== String(a?.schemaFingerprint || "") || Number(d.schemaCookie) !== Number(a?.schemaCookie) || String(d.contractHash || "") !== String(a?.contractHash || "") || Number(d.contractVersion) !== Number(a?.contractVersion)) throw c("schema_changed", {
        previewPlanHash: String(d.planHash || ""),
        currentPlanHash: String(a?.planHash || "")
      });
      return d;
    },
    getD1SchemaRepairTokenPlanHash(t) {
      const r = String(t || "").trim().split(".", 1)[0];
      if (!r) return "";
      try {
        const a = JSON.parse(tr(r));
        return a?.scope === "d1_schema_repair" ? String(a?.planHash || "").trim() : "";
      } catch {
        return "";
      }
    },
    async getD1TimeTravelBookmark(t) {
      if (!t || typeof t.withSession != "function") {
        const r = /* @__PURE__ */ new Error("D1 Time Travel bookmark is unavailable on this binding");
        throw r.code = "D1_SCHEMA_REPAIR_RECOVERY_UNAVAILABLE", r.status = 409, r.details = { reason: "sessions_api_unavailable" }, r;
      }
      try {
        const r = t.withSession("first-primary");
        if (!r || typeof r.prepare != "function" || typeof r.getBookmark != "function") throw new Error("invalid_d1_session");
        await r.prepare("SELECT 1 AS bookmark_probe").run();
        const a = String(r.getBookmark() || "").trim();
        if (!a) throw new Error("empty_bookmark");
        return {
          bookmark: a,
          consistency: "first-primary",
          capturedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
        };
      } catch (r) {
        if (String(r?.code || "") === "D1_SCHEMA_REPAIR_RECOVERY_UNAVAILABLE") throw r;
        const a = /* @__PURE__ */ new Error("Unable to capture a D1 Time Travel bookmark");
        throw a.code = "D1_SCHEMA_REPAIR_RECOVERY_UNAVAILABLE", a.status = 409, a.details = {
          reason: "bookmark_failed",
          cause: ue(r, "bookmark_failed")
        }, a;
      }
    },
    async ensureD1KnownColumns(t, r = {}) {
      const a = await e.getD1TableNameSet(t), n = new Set(Array.isArray(r.skipTables) ? r.skipTables : []), s = [];
      for (const [i, c] of Object.entries(e.getD1RuntimeColumnAdditions())) {
        if (!a.has(i) || n.has(i)) continue;
        const l = await e.getTableColumns(t, i);
        for (const [u, d] of Object.entries(c))
          l.has(u) || (await t.prepare(`ALTER TABLE ${de(i)} ADD COLUMN ${de(u)} ${d}`).run(), l.add(u), s.push(`${i}.${u}`));
      }
      return s;
    },
    async repairD1RuntimeIndexes(t, r = {}) {
      const a = await e.getD1TableNameSet(t), n = new Set(Array.isArray(r.skipTables) ? r.skipTables : []), s = [], i = [];
      for (const [c, l] of Object.entries(e.getD1RuntimeIndexContract())) {
        if (!a.has(l.table) || n.has(l.table)) continue;
        const u = await t.prepare("SELECT tbl_name FROM sqlite_master WHERE type = 'index' AND name = ? LIMIT 1").bind(c).first();
        let d = !1;
        if (u) {
          const f = (await e.getTableIndexDefinitions(t, l.table)).find((m) => m.name === c);
          d = String(u?.tbl_name || "") === l.table && f?.unique === !1 && f?.partial === !1 && re(await e.getIndexKeyColumns(t, c)) === re(l.columns);
        }
        d || (u ? (await t.prepare(`DROP INDEX IF EXISTS ${de(c)}`).run(), i.push(c)) : s.push(c), await t.prepare(l.createSql).run());
      }
      return {
        createdIndexes: s,
        repairedIndexes: i
      };
    },
    async ensureD1UniqueIndexes(t) {
      const r = [];
      for (const [a, n] of Object.entries(e.getD1UniqueIndexContract())) {
        if (!(await e.getD1TableNameSet(t)).has(n.table)) continue;
        let s = !1;
        for (const i of (await e.getTableIndexDefinitions(t, n.table)).filter((c) => c.unique && !c.partial)) if (re(await e.getIndexKeyColumns(t, i.name)) === re(n.columns)) {
          s = !0;
          break;
        }
        s || (await t.prepare("SELECT tbl_name FROM sqlite_master WHERE type = 'index' AND name = ? LIMIT 1").bind(a).first() && await t.prepare(`DROP INDEX IF EXISTS ${de(a)}`).run(), await t.prepare(n.createSql).run(), r.push(a));
      }
      return r;
    },
    async rebuildD1TableWithShadow(t, r, a) {
      const n = e.getD1CurrentSchemaContract();
      if (!Object.prototype.hasOwnProperty.call(n.columns, r)) throw new Error(`Unknown D1 rebuild table: ${r}`);
      if (r === e.LOGS_TABLE) throw new Error("proxy_logs must use destructive atomic recreation");
      const s = String(a?.planHash || "repair").replace(/[^a-z0-9]/gi, "").slice(0, 12) || "repair", i = `__d1_repair_${r}_${s}`, c = `__d1_backup_${r}_${s}`, l = await e.getD1TableNameSet(t);
      if (l.has(i) || l.has(c)) {
        const m = /* @__PURE__ */ new Error("D1 schema repair temporary table already exists");
        throw m.code = "D1_SCHEMA_REPAIR_BLOCKED", m.status = 409, m.details = {
          phase: "preflight",
          blockingIssues: [`repair_artifact_present:${r}`]
        }, m;
      }
      const u = n.columns[r].map((m) => de(m)).join(", "), d = (await t.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'index' AND tbl_name = ? AND sql IS NOT NULL").bind(r).all())?.results || [];
      await t.prepare(e.buildD1CreateTableSql(r, i)).run();
      try {
        await t.batch([
          t.prepare(`INSERT INTO ${de(i)} (${u}) SELECT ${u} FROM ${de(r)}`),
          t.prepare(`ALTER TABLE ${de(r)} RENAME TO ${de(c)}`),
          t.prepare(`ALTER TABLE ${de(i)} RENAME TO ${de(r)}`),
          ...d.map((m) => t.prepare(`DROP INDEX ${de(m.name)}`)),
          ...d.map((m) => t.prepare(String(m.sql)))
        ]);
      } catch (m) {
        throw await t.prepare(`DROP TABLE IF EXISTS ${de(i)}`).run().catch(() => {
        }), m;
      }
      const f = await t.prepare(`SELECT COUNT(*) AS total FROM ${de(r)}`).first();
      return {
        table: r,
        rowCount: Math.max(0, Number(f?.total) || 0),
        allowsDataLoss: !1,
        willDiscardData: !1,
        dataMode: "copy",
        backupTable: c,
        originalIndexes: d
      };
    },
    async recreateD1LogsDestructively(t, r) {
      const a = (r?.steps || []).find((i) => i?.kind === "recreate_log_table" && i?.target === e.LOGS_TABLE);
      if (!a || a.willDiscardData !== !0 || a.dataMode !== "discard") throw new Error("Missing destructive proxy_logs repair step");
      const n = e.getD1LogsFtsContractSql(), s = Object.values(e.getD1RuntimeIndexContract()).filter((i) => i.table === e.LOGS_TABLE);
      return await t.batch([
        t.prepare(`DROP TABLE IF EXISTS ${de(e.LOGS_FTS_TABLE)}`),
        t.prepare(`DROP TABLE ${de(e.LOGS_TABLE)}`),
        t.prepare(e.buildD1CreateTableSql(e.LOGS_TABLE)),
        ...s.map((i) => t.prepare(i.createSql)),
        t.prepare(n.createTable),
        t.prepare(n.createTrigger)
      ]), {
        table: e.LOGS_TABLE,
        rowCount: 0,
        rowCountMeasured: !1,
        discardedRows: null,
        discardedRowsIsLowerBound: !1,
        allowsDataLoss: !0,
        willDiscardData: !0,
        dataMode: "discard"
      };
    },
    async rollbackD1RebuiltTables(t, r = []) {
      for (const a of [...r].reverse()) {
        const n = String(a?.table || ""), s = String(a?.backupTable || "");
        if (!(!n || !s || !(await e.getD1TableNameSet(t)).has(s))) {
          n === e.LOGS_TABLE && (await e.dropLogsFtsSyncTriggers(t).catch(() => 0), await t.prepare(`DROP TABLE IF EXISTS ${de(e.LOGS_FTS_TABLE)}`).run().catch(() => {
          }));
          for (const i of (await t.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = ? AND sql IS NOT NULL").bind(n).all())?.results || []) await t.prepare(`DROP INDEX IF EXISTS ${de(i.name)}`).run().catch(() => {
          });
          await t.batch([t.prepare(`DROP TABLE IF EXISTS ${de(n)}`), t.prepare(`ALTER TABLE ${de(s)} RENAME TO ${de(n)}`)]);
          for (const i of a.originalIndexes || []) {
            const c = String(i?.sql || "").replace(/^CREATE\s+(UNIQUE\s+)?INDEX\s+/i, (l, u) => `CREATE ${u || ""}INDEX IF NOT EXISTS `);
            c && await t.prepare(c).run().catch(() => {
            });
          }
          n === e.LOGS_TABLE && await e.ensureLogsFtsSchema(t, { forceRecreate: !0 }).catch(() => {
          });
        }
      }
    },
    async assertD1CurrentSchema(t) {
      const r = await e.buildD1SchemaRepairPlan(t);
      if (r.blockingIssues.length) {
        const a = /* @__PURE__ */ new Error("D1 schema repair is blocked by incompatible data or table shape");
        throw a.code = "D1_SCHEMA_REPAIR_BLOCKED", a.status = 409, a.details = {
          phase: "preflight",
          blockingIssues: r.blockingIssues,
          repairPlan: r
        }, a;
      }
      return r;
    },
    async initializeD1Database(t, r = {}) {
      if (!t) {
        const c = /* @__PURE__ */ new Error("D1 not configured");
        throw c.code = "D1_NOT_CONFIGURED", c.status = 503, c;
      }
      const a = r.includeFts === !1 ? "logs-core" : "logs-fts";
      let n = ee.D1DatabaseInitReady.get(t);
      (!n || !(n.inFlight instanceof Map)) && (n = {
        tail: Promise.resolve(),
        inFlight: /* @__PURE__ */ new Map()
      }, ee.D1DatabaseInitReady.set(t, n));
      const s = `${a}:${e.getD1SchemaRepairTokenPlanHash(r.repairToken) || "automatic"}`;
      let i = n.inFlight.get(s);
      i || (i = Promise.resolve(n.tail).catch(() => {
      }).then(() => e.runD1DatabaseInitialization(t, {
        ...r,
        profile: a
      })), n.tail = i.catch(() => {
      }), n.inFlight.set(s, i));
      try {
        return await i;
      } finally {
        n.inFlight.get(s) === i && n.inFlight.delete(s);
      }
    },
    async runD1DatabaseInitialization(t, r = {}) {
      const a = r.profile || (r.includeFts === !1 ? "logs-core" : "logs-fts"), n = String(r.repairMode || (String(r.repairToken || "").trim() ? "confirmed-destructive" : "safe"));
      e.invalidateD1SchemaReadiness(t, "all");
      const s = await e.buildD1SchemaRepairPlan(t), i = new Set(Object.entries(s.status?.tables || {}).filter(([, f]) => f === !0).map(([f]) => f));
      if (s.status?.fts?.tableReady === !0 && i.add(e.LOGS_FTS_TABLE), s.blockingIssues.length) {
        const f = /* @__PURE__ */ new Error("D1 schema repair is blocked by incompatible data or table shape");
        throw f.code = "D1_SCHEMA_REPAIR_BLOCKED", f.status = 409, f.details = {
          phase: "preflight",
          blockingIssues: s.blockingIssues,
          repairPlan: s
        }, f;
      }
      let c = null;
      if (s.phase === "safe" && n === "confirmed-destructive") {
        const f = /* @__PURE__ */ new Error("D1 schema repair must complete safe preparation before destructive repair");
        throw f.code = "D1_SCHEMA_REPAIR_PREPARATION_REQUIRED", f.status = 409, f.details = { repairPlan: s }, f;
      }
      if (s.phase === "destructive") {
        if (r.confirmHighRisk !== !0 || !String(r.repairToken || "").trim()) {
          const f = r.env ? await e.createD1SchemaRepairToken(r.env, s) : {
            token: "",
            expiresAt: 0
          }, m = /* @__PURE__ */ new Error("D1 schema repair requires explicit confirmation");
          throw m.code = "D1_SCHEMA_REPAIR_CONFIRMATION_REQUIRED", m.status = 428, m.details = { repairPlan: {
            ...s,
            repairToken: f.token,
            expiresAt: f.expiresAt ? (/* @__PURE__ */ new Date(f.expiresAt * 1e3)).toISOString() : ""
          } }, m;
        }
        await e.verifyD1SchemaRepairToken(r.env, r.repairToken, s), c = await e.getD1TimeTravelBookmark(t);
      }
      const l = [], u = [];
      let d = "";
      try {
        if (s.steps.find((N) => N.kind === "create_table" && N.target === e.D1_SCHEMA_META_TABLE && N.risk !== "high") && (await t.prepare(e.buildD1CreateTableSql(e.D1_SCHEMA_META_TABLE, e.D1_SCHEMA_META_TABLE, { ifNotExists: !0 })).run(), u.push({
          kind: "create_table",
          target: e.D1_SCHEMA_META_TABLE
        })), (s.phase === "safe" || s.phase === "destructive") && (d = String(globalThis.crypto?.randomUUID?.() || `${B()}-${Math.random()}`), await e.acquireD1SchemaRepairLease(t, d)), s.phase === "destructive") {
          const N = await e.buildD1SchemaRepairPlan(t);
          await e.verifyD1SchemaRepairToken(r.env, r.repairToken, N);
        }
        const f = s.phase === "safe" ? s.steps.filter((N) => N.risk !== "high") : s.phase === "destructive" ? s.steps.filter((N) => N.risk === "high") : [], m = f.filter((N) => N.kind === "create_table" && N.target !== e.LOGS_FTS_TABLE && N.target !== e.D1_SCHEMA_META_TABLE).map((N) => N.target);
        for (const N of m)
          await t.prepare(e.buildD1CreateTableSql(N, N, { ifNotExists: !0 })).run(), u.push({
            kind: "create_table",
            target: N
          });
        const p = f.filter((N) => N.kind === "drop_trigger").map((N) => N.target);
        for (const N of p)
          await t.prepare(`DROP TRIGGER IF EXISTS ${de(N)}`).run(), u.push({
            kind: "drop_trigger",
            target: N
          });
        const h = f.filter((N) => N.kind === "rebuild_table").map((N) => N.target), g = f.find((N) => N.kind === "recreate_log_table" && N.target === e.LOGS_TABLE), y = [];
        for (const N of f.filter((F) => F.kind === "add_column")) {
          const [F, D] = String(N.target || "").split(".", 2), U = e.getD1RuntimeColumnAdditions()?.[F]?.[D];
          if (!U) throw new Error(`Unknown D1 column addition: ${N.target}`);
          await t.prepare(`ALTER TABLE ${de(F)} ADD COLUMN ${de(D)} ${U}`).run(), y.push(N.target), u.push({
            kind: "add_column",
            target: N.target
          });
        }
        for (const N of h)
          l.push(await e.rebuildD1TableWithShadow(t, N, s)), u.push({
            kind: "rebuild_table",
            target: N
          });
        g && (l.push(await e.recreateD1LogsDestructively(t, s)), u.push({
          kind: "recreate_log_table",
          target: e.LOGS_TABLE
        }));
        const _ = g ? Object.entries(e.getD1RuntimeIndexContract()).filter(([, N]) => N.table === e.LOGS_TABLE).map(([N]) => N) : [], S = {
          createdIndexes: [],
          repairedIndexes: []
        };
        for (const N of f.filter((F) => F.kind === "create_index" || F.kind === "repair_index")) {
          const F = e.getD1RuntimeIndexContract()?.[N.target];
          if (!F) throw new Error(`Unknown D1 runtime index: ${N.target}`);
          N.kind === "repair_index" && await t.prepare(`DROP INDEX IF EXISTS ${de(N.target)}`).run(), await t.prepare(F.createSql).run(), S[N.kind === "repair_index" ? "repairedIndexes" : "createdIndexes"].push(N.target), u.push({
            kind: N.kind,
            target: N.target
          });
        }
        const E = [];
        for (const N of f.filter((F) => F.kind === "create_unique_index")) {
          const F = e.getD1UniqueIndexContract()?.[N.target];
          if (!F) throw new Error(`Unknown D1 unique index: ${N.target}`);
          await t.prepare(F.createSql).run(), E.push(N.target), u.push({
            kind: N.kind,
            target: N.target
          });
        }
        let b = {
          rebuilt: !1,
          recreated: !1
        };
        const T = f.find((N) => N.target === e.LOGS_FTS_TABLE);
        T && r.includeFts !== !1 && (b = await e.ensureLogsFtsSchema(t, {
          forceRecreate: !0,
          baseSchemaReady: !0
        })), b?.rebuilt === !0 && u.push({
          kind: String(T?.kind || "create_fts"),
          target: e.LOGS_FTS_TABLE
        }), e.invalidateD1SchemaReadiness(t, "all");
        const C = await e.getD1SchemaSnapshot(t), L = await e.getD1SchemaStatus(t, { snapshot: C }), P = ie(re(C.objects || [])), A = (L.schemaReady ? null : await e.buildD1SchemaRepairPlan(t))?.phase === "destructive";
        if (!L.schemaReady && !A) {
          const N = /* @__PURE__ */ new Error("D1 schema repair did not produce the current contract");
          throw N.code = "D1_SCHEMA_REPAIR_FAILED", N.status = 503, N.details = {
            phase: "final_status",
            issues: L.issues
          }, N;
        }
        const w = l.filter((N) => N?.backupTable);
        w.length && await t.batch(w.map((N) => t.prepare(`DROP TABLE IF EXISTS ${de(N.backupTable)}`)));
        let R = {
          written: !1,
          reason: "pending_high_risk"
        };
        L.schemaReady && (s.phase === "ready" ? R = (await e.verifyD1SchemaAttestation(t, r.env)).valid ? {
          written: !1,
          reused: !0,
          contractVersion: ct,
          contractHash: s.contractHash
        } : await e.writeVerifiedD1SchemaMeta(t, r.env, {
          ...s,
          schemaFingerprint: P
        }) : R = await e.writeVerifiedD1SchemaMeta(t, r.env, {
          ...s,
          schemaFingerprint: P
        }));
        const I = /* @__PURE__ */ new Set([...Object.keys(e.getD1CurrentSchemaContract().columns), e.LOGS_FTS_TABLE]), x = C.objects.filter((N) => N?.type === "table").map((N) => String(N?.name || "")).filter((N) => I.has(N) && !i.has(N));
        return {
          profile: a,
          phase: s.phase,
          completed: L.schemaReady,
          pendingHighRisk: A,
          schemaReady: L.schemaReady,
          contractVersion: ct,
          contractHash: s.contractHash,
          planHash: s.planHash,
          risk: s.risk,
          createdTables: x,
          addedColumns: y,
          createdIndexes: [...S.createdIndexes, ..._],
          repairedIndexes: S.repairedIndexes,
          uniqueIndexesCreated: E,
          droppedTriggers: p,
          rebuiltTables: l.map(({ table: N, rowCount: F, rowCountMeasured: D, discardedRows: U, discardedRowsIsLowerBound: V, willDiscardData: X, dataMode: v }) => X ? {
            table: N,
            rowCount: F,
            rowCountMeasured: D,
            discardedRows: U,
            discardedRowsIsLowerBound: V,
            allowsDataLoss: !0,
            willDiscardData: !0,
            dataMode: v
          } : {
            table: N,
            rowCount: F
          }),
          ftsRebuilt: b?.rebuilt === !0,
          ftsRecreated: g ? !0 : b?.recreated === !0 && s.status?.fts?.tableReady === !0,
          recoveryBookmark: String(c?.bookmark || ""),
          bookmarkCapturedAt: String(c?.capturedAt || ""),
          schemaMeta: R,
          steps: s.steps.map((N) => ({
            ...N,
            ready: u.some((F) => F.kind === N.kind && F.target === N.target) || L.schemaReady
          })),
          status: L
        };
      } catch (f) {
        l.length && await e.rollbackD1RebuiltTables(t, l).catch(() => {
        }), e.invalidateD1SchemaReadiness(t, "all");
        let m = [];
        try {
          m = (await e.getD1SchemaStatus(t))?.issues || [];
        } catch {
        }
        if (f && typeof f == "object" && (f.details = {
          ...H(f.details) ? f.details : {},
          executedSteps: u,
          remainingIssues: m,
          recoveryBookmark: String(c?.bookmark || ""),
          bookmarkCapturedAt: String(c?.capturedAt || "")
        }), String(f?.code || "").startsWith("D1_SCHEMA_REPAIR_")) throw f;
        const p = new Error(ue(f, "D1 schema repair failed"));
        throw p.code = "D1_SCHEMA_REPAIR_FAILED", p.status = 503, p.details = {
          ...H(f?.details) ? f.details : {},
          phase: "execution"
        }, p;
      } finally {
        d && await e.releaseD1SchemaRepairLease(t, d).catch(() => {
        });
      }
    },
    async probeLogsReadiness(t, r = {}) {
      if (!t) return {
        schemaReady: !1,
        ftsReady: !1,
        statsReady: !1,
        probedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
      };
      const a = oe.LogsReadinessProbeCache.get(t), n = Math.max(1e3, Number(r.maxAgeMs) || 15e3);
      if (r.force !== !0 && a && B() - a.ts < n) return a.data;
      const [s, i, c] = await Promise.all([
        e.hasLogsBaseTable(t),
        e.isLogsFtsReady(t),
        e.hasStatsHourlyTable(t)
      ]), l = {
        schemaReady: s,
        ftsReady: i,
        statsReady: c,
        probedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
      };
      return oe.LogsReadinessProbeCache.set(t, {
        ts: B(),
        data: l
      }), l;
    },
    async resolveLogsReadiness(t, r = {}) {
      const a = e.resolveOpsStatusStores(t), n = await e.getOpsStatusSection(a, "log"), s = n?.schemaReady === !0, i = n?.ftsReady === !0, c = n?.statsReady === !0;
      return s && c && (i || r.requireFts !== !0) || !a.db ? {
        schemaReady: s,
        ftsReady: i,
        statsReady: c,
        revision: e.getLogsRevisionFromStatus(n),
        source: "status",
        logStatus: n
      } : {
        ...await e.probeLogsReadiness(a.db, r),
        revision: e.getLogsRevisionFromStatus(n),
        source: "probe",
        logStatus: n
      };
    }
  };
}
function Sy(o = {}, e = {}) {
  return {
    async ensureLogsBaseSchema(t) {
      if (!t) return !1;
      if (e.isD1SchemaReadyCached(t, "logsBaseSchema")) return !0;
      let r = ee.LogsBaseDbReady.get(t);
      r || (r = (async () => (await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.LOGS_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER NOT NULL, node_name TEXT NOT NULL, request_path TEXT NOT NULL, request_method TEXT NOT NULL, status_code INTEGER NOT NULL, response_time INTEGER NOT NULL, client_ip TEXT NOT NULL, inbound_colo TEXT, outbound_colo TEXT, user_agent TEXT, referer TEXT, category TEXT DEFAULT 'api', error_detail TEXT, detail_json TEXT, created_at TEXT NOT NULL, inbound_ip TEXT, outbound_ip TEXT)`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_timestamp ON ${e.LOGS_TABLE} (timestamp)`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_client_time ON ${e.LOGS_TABLE} (client_ip, timestamp DESC)`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_status_time ON ${e.LOGS_TABLE} (status_code, timestamp)`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_category_time ON ${e.LOGS_TABLE} (category, timestamp)`).run(), e.markD1SchemaReady(t, "logsBaseSchema"), e.markD1SchemaReady(t, "logsTableExists"), oe.LogsReadinessProbeCache.delete(t), !0))().catch((a) => {
        throw ee.LogsBaseDbReady.delete(t), a;
      }), ee.LogsBaseDbReady.set(t, r));
      try {
        return await r;
      } finally {
        ee.LogsBaseDbReady.get(t) === r && ee.LogsBaseDbReady.delete(t);
      }
    },
    async ensureStatsHourlySchema(t) {
      if (!t) return !1;
      if (e.isD1SchemaReadyCached(t, "statsHourlySchema")) return !0;
      let r = ee.StatsHourlyDbReady.get(t);
      r || (r = t.prepare(`CREATE TABLE IF NOT EXISTS ${e.STATS_HOURLY_TABLE} (
              bucket_date TEXT NOT NULL,
              bucket_hour INTEGER NOT NULL,
              request_count INTEGER NOT NULL DEFAULT 0,
              play_count INTEGER NOT NULL DEFAULT 0,
              playback_info_count INTEGER NOT NULL DEFAULT 0,
              updated_at TEXT NOT NULL,
              PRIMARY KEY (bucket_date, bucket_hour)
            )`).run().then(() => (e.markD1SchemaReady(t, "statsHourlySchema"), e.markD1SchemaReady(t, "statsTableExists"), oe.LogsReadinessProbeCache.delete(t), !0)).catch((a) => {
        throw ee.StatsHourlyDbReady.delete(t), a;
      }), ee.StatsHourlyDbReady.set(t, r));
      try {
        return await r;
      } finally {
        ee.StatsHourlyDbReady.get(t) === r && ee.StatsHourlyDbReady.delete(t);
      }
    }
  };
}
function _y(o = {}, e = {}) {
  return {
    normalizeD1SchemaProfile(t = "") {
      const r = String(t || "").trim().toLowerCase();
      return r === "runtime-core" || r === "logs-core" || r === "logs-fts" ? r : "logs-core";
    },
    invalidateD1SchemaReadiness(t, r = "all") {
      if (!t) return;
      const a = String(r || "all").trim().toLowerCase();
      if ((a === "all" || a === "logs") && (e.clearD1SchemaReady(t, [
        "logsBaseSchema",
        "logsTableExists",
        "statsHourlySchema",
        "statsTableExists"
      ]), ee.LogsBaseDbReady.delete(t), ee.StatsHourlyDbReady.delete(t), oe.LogsReadinessProbeCache.delete(t)), a === "all") {
        e.clearD1SchemaReady(t);
        const n = ee.OpsStatusShadowCache.get(t);
        n?.payloadCache instanceof Map && n.payloadCache.clear(), ee.AdminShellStatusWriteState.delete(t), ee.DnsIpWorkspaceDbReady.delete(t), ee.OpsStatusDbReady.delete(t), ee.ScheduledLeaseDbReady.delete(t), ee.AuthFailuresDbReady.delete(t), ee.CfDashboardCacheDbReady.delete(t), ee.CfRuntimeCacheDbReady.delete(t);
      }
    },
    async bootstrapD1Schema(t, r = "logs-core") {
      const a = e.normalizeD1SchemaProfile(r);
      if (!t) return {
        profile: a,
        runtimeTablesReady: !1,
        schemaReady: !1,
        statsReady: !1,
        ftsReady: !1,
        ftsResult: {
          migratedRows: 0,
          droppedTriggers: 0,
          rebuilt: !1,
          recreated: !1
        },
        steps: []
      };
      const n = [
        {
          name: "ensureSysStatusTable",
          run: () => e.ensureSysStatusTable(t)
        },
        {
          name: "ensureScheduledLeaseTable",
          run: () => e.ensureScheduledLeaseTable(t)
        },
        {
          name: "ensureDnsIpWorkspaceSchema",
          run: () => e.ensureDnsIpWorkspaceSchema(t)
        },
        {
          name: "ensureAuthFailuresTable",
          run: () => e.ensureAuthFailuresTable(t)
        },
        {
          name: "ensureCfDashboardCacheTable",
          run: () => e.ensureCfDashboardCacheTable(t)
        },
        {
          name: "ensureCfRuntimeCacheTable",
          run: () => e.ensureCfRuntimeCacheTable(t)
        }
      ], s = [{
        name: "ensureLogsBaseSchema",
        run: () => e.ensureLogsBaseSchema(t)
      }, {
        name: "ensureStatsHourlySchema",
        run: () => e.ensureStatsHourlySchema(t)
      }], i = a === "runtime-core" ? n : a === "logs-fts" ? [
        ...n,
        ...s,
        {
          name: "ensureLogsFtsSchema",
          run: () => e.ensureLogsFtsSchema(t)
        }
      ] : [...n, ...s], c = [];
      let l = {
        migratedRows: 0,
        droppedTriggers: 0,
        rebuilt: !1,
        recreated: !1
      };
      for (const u of i) {
        const d = await u.run();
        u.name === "ensureLogsFtsSchema" && H(d) && (l = {
          migratedRows: Math.max(0, Number(d.migratedRows) || 0),
          droppedTriggers: Math.max(0, Number(d.droppedTriggers) || 0),
          rebuilt: d.rebuilt === !0,
          recreated: d.recreated === !0
        }), c.push({
          name: u.name,
          ready: u.name === "ensureLogsFtsSchema" ? await e.isLogsFtsReady(t) : d === !0
        });
      }
      return oe.LogsReadinessProbeCache.delete(t), {
        profile: a,
        runtimeTablesReady: n.every((u) => c.some((d) => d.name === u.name && d.ready === !0)),
        schemaReady: await e.hasLogsBaseTable(t),
        statsReady: await e.hasStatsHourlyTable(t),
        ftsReady: await e.isLogsFtsReady(t),
        ftsResult: l,
        steps: c
      };
    }
  };
}
function by(o = {}, e = {}) {
  return {
    ...hy(o, e),
    ...yy(o, e),
    ...Sy(o, e),
    ..._y(o, e)
  };
}
function Ey() {
  const o = {
    createSummary(e = {}, t = "manual", r = {}) {
      return {
        ...e.summary,
        mode: t,
        deletedExpiredLogCount: 0,
        deletedExpiredLockCount: 0,
        deletedExpiredFetchCacheCount: 0,
        deletedExpiredProbeCacheCount: 0,
        deletedExpiredAuthFailureCount: 0,
        deletedExpiredDashboardCacheCount: 0,
        deletedExpiredRuntimeCacheCount: 0,
        deletedExpiredStatsHourlyCount: 0,
        rebuiltStatsHourly: !1,
        rebuiltLogsFts: !1,
        alignedStatsWindow: !1,
        optimizedDb: !1,
        migratedDnsIpPoolSourcesToKvCount: 0,
        clearedLegacyDnsIpPoolSourcesCount: 0,
        statsAlignStatus: r.alignStatsWindow ? "pending" : "skipped",
        statsAlignError: "",
        statsRebuildStatus: r.rebuildStatsHourly ? "pending" : "skipped",
        statsRebuildError: "",
        ftsRebuildStatus: r.rebuildLogsFts ? "pending" : r.rebuildLogsFtsDeferred ? "deferred" : "skipped",
        ftsRebuildRecovered: !1,
        ftsRebuildError: "",
        optimizeStatus: r.optimizeDb ? "pending" : r.optimizeDbDeferred ? "deferred" : "skipped",
        optimizeError: "",
        status: t === "scheduled" ? "skipped" : "success",
        reason: ""
      };
    },
    buildDeleteScopes(e, t = {}, r = {}, a) {
      return [
        [
          r.deleteExpiredLogs,
          "proxy_logs",
          "deletedExpiredLogCount",
          "deleteExpiredLogs",
          e.LOGS_TABLE,
          "timestamp < ?",
          [t.retentionCutoffMs]
        ],
        [
          r.deleteExpiredLocks,
          "sys_locks",
          "deletedExpiredLockCount",
          "deleteExpiredLocks",
          e.SCHEDULED_LOCKS_TABLE,
          "expires_at <= ?",
          [t.nowMs]
        ],
        [
          r.deleteExpiredFetchCache,
          "dns_ip_pool_fetch_cache",
          "deletedExpiredFetchCacheCount",
          "deleteExpiredFetchCache",
          e.DNS_IP_POOL_FETCH_CACHE_TABLE,
          "expires_at <= ?",
          [t.nowMs]
        ],
        [
          r.deleteExpiredProbeCache,
          "dns_ip_probe_cache",
          "deletedExpiredProbeCacheCount",
          "deleteExpiredProbeCache",
          e.DNS_IP_PROBE_CACHE_TABLE,
          "expires_at <= ?",
          [t.nowMs]
        ],
        [
          r.deleteExpiredAuthFailures,
          "auth_failures",
          "deletedExpiredAuthFailureCount",
          "deleteExpiredAuthFailures",
          e.AUTH_FAILURES_TABLE,
          "expires_at <= ?",
          [t.nowMs]
        ],
        [
          r.deleteExpiredDashboardCache,
          "cf_dashboard_cache",
          "deletedExpiredDashboardCacheCount",
          "deleteExpiredDashboardCache",
          e.CF_DASH_CACHE_TABLE,
          "expires_at <= ?",
          [t.nowMs]
        ],
        [
          r.deleteExpiredRuntimeCache,
          "cf_runtime_cache",
          "deletedExpiredRuntimeCacheCount",
          "deleteExpiredRuntimeCache",
          e.CF_RUNTIME_CACHE_TABLE,
          "expires_at <= ?",
          [t.nowMs]
        ],
        [
          r.deleteExpiredStatsHourly,
          "proxy_stats_hourly",
          "deletedExpiredStatsHourlyCount",
          "deleteExpiredStatsHourly",
          e.STATS_HOURLY_TABLE,
          "bucket_date < ?",
          [t.statsRetentionBoundaryDate]
        ]
      ].filter(([n]) => n === !0).map(([, n, s, i, c, l, u]) => ({
        key: n,
        summaryKey: s,
        stepName: i,
        tableName: c,
        whereClause: l,
        bindParams: u,
        db: a
      }));
    },
    readChanges(e) {
      const t = Number(e?.meta?.changes ?? e?.changes ?? 0);
      return Number.isFinite(t) ? Math.max(0, Math.floor(t)) : 0;
    },
    async hasScopeRows(e) {
      return !!await e.db.prepare(`SELECT 1 AS present FROM ${e.tableName} WHERE ${e.whereClause} LIMIT 1`).bind(...e.bindParams).first();
    },
    async runBudgetedDeleteScopes(e = [], t = {}, r = async (n) => {
    }, a = {}) {
      const n = Number(a.startedAt) || B();
      let s = 0, i = "", c = [...e];
      for (; c.length > 0 && !i; ) {
        const d = [];
        for (const f of c) {
          if (s >= ja) {
            i = "row_limit";
            break;
          }
          if (B() - n >= Hr) {
            i = "time_limit";
            break;
          }
          await r(f.stepName);
          const m = Math.min(ks, ja - s), p = await f.db.prepare(`DELETE FROM ${f.tableName} WHERE rowid IN (SELECT rowid FROM ${f.tableName} WHERE ${f.whereClause} ORDER BY rowid LIMIT ?)`).bind(...f.bindParams, m).run(), h = o.readChanges(p);
          s += h, t[f.summaryKey] = Math.max(0, Number(t[f.summaryKey]) || 0) + h, h >= m && d.push(f);
        }
        c = d;
      }
      const l = [];
      for (const d of e) await o.hasScopeRows(d) && l.push(d.key);
      const u = Math.max(0, B() - n);
      return !i && l.length > 0 && (i = u >= Hr ? "time_limit" : s >= ja ? "row_limit" : ""), {
        hasMore: l.length > 0,
        remainingScopes: l,
        budget: {
          batchSize: ks,
          rowLimit: ja,
          timeLimitMs: Hr,
          processedRows: s,
          durationMs: u,
          exhaustedBy: i || null
        }
      };
    },
    async patchLogStatus(e, t, r, a, n, s, i = {}) {
      const c = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), l = String(a?.mode || i.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", u = {
        schemaReady: !0,
        ftsReady: !0,
        statsReady: !0,
        categoryEnabled: !0
      };
      return (s.rebuildStatsHourly !== !0 || n.alignedStatsWindow === !0) && (u.statsUtcOffsetMinutes = a.statsUtcOffsetMinutes ?? a.utcOffsetMinutes), (n.rebuiltStatsHourly === !0 || n.alignedStatsWindow === !0) && (u.statsAlignedAt = c, u.statsAlignedWindowStartAt = new Date((l === "scheduled" ? a.statsStartTs : a.retentionCutoffMs) || a.retentionCutoffMs).toISOString(), u.statsAlignedWindowEndAt = new Date((l === "scheduled" ? a.statsEndTs : a.nowMs) || a.nowMs).toISOString()), l === "scheduled" && s.deleteExpiredLogs === !0 && Number(n.deletedExpiredLogCount) > 0 ? await e.bumpLogsRevision(r, u, i.ctx).catch(() => {
      }) : await ge(e.patchOpsStatus(r, { log: u }, i.ctx), "d1_tidy.patch_log_status", { mode: l }, null), c;
    }
  };
  return o;
}
function Ay() {
  return {
    async readBoundedCount(o, e, t = "", r = []) {
      const a = String(t || "").trim(), n = `SELECT COUNT(*) AS total FROM (SELECT 1 FROM ${e}${a ? ` WHERE ${a}` : ""} LIMIT ${qa + 1})`, s = await o.prepare(n).bind(...r).first(), i = Math.max(0, Number(s?.total ?? s?.count) || 0);
      return {
        count: Math.min(qa, i),
        countIsLowerBound: i >= qa,
        exceedsLimit: i > qa
      };
    },
    buildContext(o = {}, e = {}) {
      const t = String(e.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", r = lt(e.maintenanceMode, t), a = e.scheduledNow instanceof Date ? new Date(e.scheduledNow.getTime()) : new Date(e.scheduledNow || B()), n = Number(e.nowMs) || (t === "scheduled" ? a.getTime() : B()), s = fe(o.logRetentionDays, $.Defaults.LogRetentionDays, 1, $.Defaults.LogRetentionDaysMax), i = Math.max(0, n - s * 24 * 60 * 60 * 1e3), c = Fe(o.scheduleUtcOffsetMinutes), l = H(e.dayWindow) ? e.dayWindow : dt(a, o.scheduleUtcOffsetMinutes);
      return {
        mode: t,
        maintenanceMode: r,
        runtimeConfig: o,
        scheduledNow: a,
        nowTimestamp: n,
        retentionDays: s,
        retentionCutoffMs: i,
        utcOffsetMinutes: c,
        dayWindow: l,
        statsBucketDate: String(e.statsBucketDate || l?.dateKey || "").trim(),
        statsStartTs: Number(e.statsStartTs ?? l?.startTs) || 0,
        statsEndTs: Number(e.statsEndTs ?? l?.endTs) || 0,
        statsUtcOffsetMinutes: Fe(e.statsUtcOffsetMinutes ?? l?.utcOffsetMinutes ?? o.scheduleUtcOffsetMinutes),
        previousScheduledState: H(e.previousScheduledState) ? e.previousScheduledState : {},
        previousD1State: null,
        lastFtsRebuildAt: "",
        lastOptimizeAt: ""
      };
    },
    attachPreviousState(o, e, t = null) {
      const r = o.getPreviousD1TidyState(e.previousScheduledState, t), a = typeof r.lastFtsRebuildAt == "string" ? r.lastFtsRebuildAt : "", n = typeof r.lastOptimizeAt == "string" ? r.lastOptimizeAt : "";
      return {
        ...e,
        previousD1State: r,
        lastFtsRebuildAt: a,
        lastOptimizeAt: n || (typeof r.lastVacuumAt == "string" ? r.lastVacuumAt : "")
      };
    },
    async readFacts(o, e, t, r) {
      const a = await this.readBoundedCount(e, o.LOGS_TABLE, "timestamp < ?", [r.retentionCutoffMs]), n = await this.readBoundedCount(e, o.LOGS_TABLE, "timestamp >= ?", [r.retentionCutoffMs]), s = await this.readBoundedCount(e, o.SCHEDULED_LOCKS_TABLE, "expires_at <= ?", [r.nowTimestamp]), i = await this.readBoundedCount(e, o.DNS_IP_POOL_FETCH_CACHE_TABLE, "expires_at <= ?", [r.nowTimestamp]), c = await this.readBoundedCount(e, o.DNS_IP_PROBE_CACHE_TABLE, "expires_at <= ?", [r.nowTimestamp]), l = await this.readBoundedCount(e, o.AUTH_FAILURES_TABLE, "expires_at <= ?", [r.nowTimestamp]), u = await this.readBoundedCount(e, o.CF_DASH_CACHE_TABLE, "expires_at <= ?", [r.nowTimestamp]), d = await this.readBoundedCount(e, o.CF_RUNTIME_CACHE_TABLE, "expires_at <= ?", [r.nowTimestamp]), f = await this.readBoundedCount(e, o.STATS_HOURLY_TABLE), m = ut(r.retentionCutoffMs, r.utcOffsetMinutes).dateKey, p = await this.readBoundedCount(e, o.STATS_HOURLY_TABLE, "bucket_date < ?", [m]), h = await this.readBoundedCount(e, o.DNS_IP_POOL_ITEMS_TABLE), g = await this.readBoundedCount(e, o.DNS_IP_POOL_SOURCES_TABLE), y = await this.readBoundedCount(e, o.SYS_STATUS_TABLE), _ = await o.getOpsStatusSection({
        db: e,
        kv: t
      }, "log");
      return {
        deletedExpiredLogCount: a.count,
        preservedLogCount: n.count,
        preservedLogCountExceedsLimit: n.exceedsLimit,
        deletedExpiredLockCount: s.count,
        deletedExpiredFetchCacheCount: i.count,
        deletedExpiredProbeCacheCount: c.count,
        deletedExpiredAuthFailureCount: l.count,
        deletedExpiredDashboardCacheCount: u.count,
        deletedExpiredRuntimeCacheCount: d.count,
        deletedExpiredStatsHourlyCount: p.count,
        statsRetentionBoundaryDate: m,
        statsHourlyRowCount: f.count,
        dnsIpPoolItemCount: h.count,
        dnsIpPoolSourceCount: g.count,
        sysStatusCount: y.count,
        statsUtcOffsetMinutes: o.getStatsUtcOffsetMinutesFromStatus(_),
        countLowerBounds: {
          proxy_logs: a.countIsLowerBound,
          proxy_logs_retained: n.countIsLowerBound,
          proxy_logs_fts: n.countIsLowerBound,
          sys_locks: s.countIsLowerBound,
          dns_ip_pool_fetch_cache: i.countIsLowerBound,
          dns_ip_probe_cache: c.countIsLowerBound,
          auth_failures: l.countIsLowerBound,
          cf_dashboard_cache: u.countIsLowerBound,
          cf_runtime_cache: d.countIsLowerBound,
          proxy_stats_hourly: f.countIsLowerBound || p.countIsLowerBound,
          dns_ip_pool_items: h.countIsLowerBound,
          sys_status: y.countIsLowerBound
        },
        ftsReady: r.schemaStatus?.schemaReady === !0 || await o.isLogsFtsReady(e),
        d1DnsIpPoolSources: await o.getDnsIpPoolSourcesFromDb(e, { schemaReady: r.schemaStatus?.schemaReady === !0 }),
        kvDnsIpPoolSources: []
      };
    },
    buildSourcePolicy(o = []) {
      return {
        dnsIpPoolSourceAction: Array.isArray(o) && o.length > 0 ? "preserve_d1_primary" : "noop",
        skipDnsIpPoolSourceCleanup: !0
      };
    },
    buildFlags(o, e, t, r) {
      const a = t.deletedExpiredLogCount > 0, n = $m(e.maintenanceMode, e.mode), s = o.shouldRunLogsFtsRebuild(e.lastFtsRebuildAt, { nowMs: e.nowTimestamp }), i = (!t.ftsReady || n || a) && s, c = t.preservedLogCount > Od || t.preservedLogCountExceedsLimit === !0, l = i && !c, u = n ? !0 : a && o.shouldRunLogsOptimize(e.lastOptimizeAt, { nowMs: e.nowTimestamp }), d = n || t.statsUtcOffsetMinutes !== e.utcOffsetMinutes;
      return {
        deleteExpiredLogs: a,
        deleteExpiredLocks: t.deletedExpiredLockCount > 0,
        deleteExpiredFetchCache: t.deletedExpiredFetchCacheCount > 0,
        deleteExpiredProbeCache: t.deletedExpiredProbeCacheCount > 0,
        deleteExpiredAuthFailures: t.deletedExpiredAuthFailureCount > 0,
        deleteExpiredDashboardCache: t.deletedExpiredDashboardCacheCount > 0,
        deleteExpiredRuntimeCache: t.deletedExpiredRuntimeCacheCount > 0,
        deleteExpiredStatsHourly: t.deletedExpiredStatsHourlyCount > 0,
        rebuildStatsHourly: d,
        rebuildLogsFts: l,
        rebuildLogsFtsDeferred: i && !l,
        ftsRebuildDeferredReason: c ? "deferred_size_guard" : "",
        rebuildLogsFtsForceRecreate: !1,
        optimizeDb: u,
        optimizeDbDeferred: e.mode === "scheduled" && a && u !== !0,
        alignStatsWindow: d,
        rebuildDailyStats: !1,
        processDnsIpPoolSources: !1
      };
    },
    buildPreview(o, e, t, r) {
      const a = [], n = Zf(e.d1DnsIpPoolSources);
      Ae(a, e.deletedExpiredLogCount > 0, "proxy_logs", "超保留期 proxy_logs 日志", [], e.deletedExpiredLogCount, `只会删除早于 ${new Date(o.retentionCutoffMs).toISOString()} 的日志。`), Ae(a, e.deletedExpiredLockCount > 0, "sys_locks", "过期 sys_locks 定时租约", [], e.deletedExpiredLockCount, "只会删除 expires_at 已过期的租约记录。"), Ae(a, e.deletedExpiredFetchCacheCount > 0, "dns_ip_pool_fetch_cache", "过期 dns_ip_pool_fetch_cache 聚合缓存", [], e.deletedExpiredFetchCacheCount, "只会删除 expires_at 已过期的 API 抓取聚合缓存。"), Ae(a, e.deletedExpiredProbeCacheCount > 0, "dns_ip_probe_cache", "过期 dns_ip_probe_cache 探测缓存", [], e.deletedExpiredProbeCacheCount, "只会删除 expires_at 已过期的探测缓存。"), Ae(a, e.deletedExpiredAuthFailureCount > 0, "auth_failures", "过期 auth_failures 登录失败计数", [], e.deletedExpiredAuthFailureCount, "只会删除 expires_at 已过期的登录失败计数。"), Ae(a, e.deletedExpiredDashboardCacheCount > 0, "cf_dashboard_cache", "过期 cf_dashboard_cache 仪表盘缓存", [], e.deletedExpiredDashboardCacheCount, "只会删除 expires_at 已过期的仪表盘缓存。"), Ae(a, e.deletedExpiredRuntimeCacheCount > 0, "cf_runtime_cache", "过期 cf_runtime_cache 运行缓存", [], e.deletedExpiredRuntimeCacheCount, "只会删除 expires_at 已过期的运行缓存。"), Ae(a, e.deletedExpiredStatsHourlyCount > 0, "proxy_stats_hourly_expired", "过期 proxy_stats_hourly 日期桶", [], e.deletedExpiredStatsHourlyCount, `只删除早于边界日 ${e.statsRetentionBoundaryDate} 的统计桶。`);
      const s = [
        yt("proxy_stats_hourly", "proxy_stats_hourly 统计表", [], {
          count: Math.max(1, e.statsHourlyRowCount),
          note: r.rebuildStatsHourly ? `会清空当前统计（当前行数 ${e.statsHourlyRowCount}），并从后续新日志重新累计，不扫描历史日志。` : `保留当前统计，仅分页删除保留期边界前的日期桶（当前行数 ${e.statsHourlyRowCount}）。`
        }),
        yt("proxy_logs_fts", "proxy_logs_fts 全文索引", [], {
          count: Math.max(1, e.preservedLogCount),
          note: r.ftsRebuildDeferredReason === "deferred_size_guard" ? "基础日志超过 10000 行，本轮不会自动 rebuild。" : e.ftsReady ? "仅在无清理积压、预算有余量且满足最小间隔时重建。" : "当前未检测到 FTS 表，整理时会按资源预算决定是否补建。"
        }),
        yt("scheduled_d1_tidy", "scheduled.d1Tidy 运行状态", ["scheduled.d1Tidy"], {
          count: 1,
          note: "整理完成后会写入一份新的运行状态摘要。"
        })
      ], i = [
        yt("proxy_logs_retained", "保留期内 proxy_logs 日志", [], {
          count: e.preservedLogCount,
          note: `会保留最近 ${o.retentionDays} 天的日志。`
        }),
        yt("dns_ip_pool_items", "dns_ip_pool_items 共享 IP 池", [], {
          count: e.dnsIpPoolItemCount,
          note: "不会删除 dns_ip_pool_items。"
        }),
        yt("sys_status", "sys_status 运行状态", [], {
          count: e.sysStatusCount,
          note: "不会删除 sys_status 中的有效运行状态。"
        })
      ];
      Ae(i, e.d1DnsIpPoolSources.length > 0, "dns_ip_pool_sources_d1_primary", "dns_ip_pool_sources 主数据", n, e.d1DnsIpPoolSources.length, "dns_ip_pool_sources 现在是正式主数据，本次不会迁回 KV，也不会清空该表。");
      const c = { proxy_stats_hourly_expired: "proxy_stats_hourly" };
      for (const d of [
        ...a,
        ...s,
        ...i
      ]) {
        const f = c[d.key] || d.key;
        e.countLowerBounds?.[f] === !0 && (d.countIsLowerBound = !0);
      }
      const l = [], u = Math.max(0, Number(o.logQueuePendingCount) || 0);
      return u > 0 && l.push(`执行前会先尝试 flush ${u} 条内存日志，再开始清理 D1。`), l.push(o.maintenanceMode === "full" ? "当前为 full 维护模式；统计会清空后重新累计，FTS 与 optimize 仍受大小、积压、间隔和时间预算约束。" : "当前为 smart 维护模式，只在检测到必要条件且预算允许时执行较重的统计、FTS 与 optimize。"), a.length === 0 && l.push(o.mode === "scheduled" ? "当前定时 D1 维护没有检测到需要删除的旧数据，本轮会按计划检查统计与索引维护。" : "当前没有检测到需要删除的 D1 旧数据；本次主要会执行统计表与 FTS 维护。"), {
        scope: "d1",
        fieldGroups: [],
        deleteGroups: a,
        rewriteGroups: s,
        preserveGroups: i,
        warnings: l
      };
    },
    buildSummary(o, e, t, r = {}) {
      return {
        mode: o.mode,
        maintenanceMode: o.maintenanceMode,
        logRetentionDays: o.retentionDays,
        retentionCutoffAt: new Date(o.retentionCutoffMs).toISOString(),
        deletedExpiredLogCount: e.deletedExpiredLogCount,
        preservedLogCount: e.preservedLogCount,
        deletedExpiredLockCount: e.deletedExpiredLockCount,
        deletedExpiredFetchCacheCount: e.deletedExpiredFetchCacheCount,
        deletedExpiredProbeCacheCount: e.deletedExpiredProbeCacheCount,
        deletedExpiredAuthFailureCount: e.deletedExpiredAuthFailureCount,
        deletedExpiredDashboardCacheCount: e.deletedExpiredDashboardCacheCount,
        deletedExpiredRuntimeCacheCount: e.deletedExpiredRuntimeCacheCount,
        deletedExpiredStatsHourlyCount: e.deletedExpiredStatsHourlyCount,
        rebuiltStatsHourly: r.rebuildStatsHourly === !0,
        rebuiltLogsFts: r.rebuildLogsFts === !0,
        alignedStatsWindow: r.alignStatsWindow === !0,
        migratedDnsIpPoolSourcesToKvCount: 0,
        clearedLegacyDnsIpPoolSourcesCount: 0,
        preservedDnsIpPoolItemCount: e.dnsIpPoolItemCount,
        preservedDnsIpPoolSourceCount: e.dnsIpPoolSourceCount,
        preservedSysStatusCount: e.sysStatusCount,
        logQueuePendingCount: Math.max(0, Number(o.logQueuePendingCount) || 0),
        dnsIpPoolSourceAction: t.dnsIpPoolSourceAction,
        lastFtsRebuildAt: o.lastFtsRebuildAt,
        lastOptimizeAt: o.lastOptimizeAt
      };
    }
  };
}
var Ty = Object.freeze({
  PREFIX: "node:",
  CONFIG_KEY: "sys:theme",
  NODES_INDEX_KEY: "sys:nodes_index:v1",
  NODES_SUMMARY_INDEX_KEY: "sys:nodes_index_full:v2",
  ADMIN_INDEX_UPLOAD_PREFIX: fd,
  ADMIN_ACTIVE_INDEX_KEY: md,
  LEGACY_OPS_STATUS_KEY: "sys:ops_status:v1",
  LEGACY_SCHEDULED_LOCK_KEY: "sys:scheduled_lock:v1",
  WORKER_PLACEMENT_REGION_OVERRIDE_PREFIX: "sys:worker_placement_region:v1:",
  CONFIG_SNAPSHOTS_KEY: "sys:config_snapshots:v1",
  CONFIG_META_KEY: "sys:config_meta:v1",
  CONFIG_SNAPSHOTS_META_KEY: "sys:config_snapshots_meta:v1",
  NODES_INDEX_META_KEY: "sys:nodes_index_meta:v1",
  LEGACY_DNS_IP_POOL_SOURCES_KEY: "sys:dns_ip_pool_sources:v1",
  DNS_RECORD_HISTORY_PREFIX: "sys:dns_record_history:v1:",
  LEGACY_TELEGRAM_ALERT_STATE_KEY: "sys:telegram_alert_state:v1",
  SYS_STATUS_TABLE: "sys_status",
  D1_SCHEMA_META_TABLE: "d1_schema_meta",
  SCHEDULED_LOCKS_TABLE: "sys_locks",
  SCHEDULED_LOCK_SCOPE: "scheduled",
  LOGS_TABLE: "proxy_logs",
  LOGS_FTS_TABLE: "proxy_logs_fts",
  LOGS_FTS_INSERT_TRIGGER: "proxy_logs_fts_ai",
  STATS_HOURLY_TABLE: "proxy_stats_hourly",
  AUTH_FAILURES_TABLE: "auth_failures",
  CF_DASH_CACHE_TABLE: "cf_dashboard_cache",
  CF_RUNTIME_CACHE_TABLE: "cf_runtime_cache",
  DNS_IP_POOL_ITEMS_TABLE: "dns_ip_pool_items",
  DNS_IP_POOL_SOURCES_TABLE: "dns_ip_pool_sources",
  DNS_IP_POOL_FETCH_CACHE_TABLE: "dns_ip_pool_fetch_cache",
  DNS_IP_PROBE_CACHE_TABLE: "dns_ip_probe_cache",
  OPS_STATUS_DB_SCOPE_ROOT: "ops_status:root",
  TELEGRAM_ALERT_STATE_DB_SCOPE: "telegram_alert_state",
  OPS_STATUS_SECTION_SCOPES: Object.freeze({
    log: "ops_status:log",
    scheduled: "ops_status:scheduled",
    dnsIpPool: "ops_status:dns_ip_pool"
  }),
  LEGACY_OPS_STATUS_SECTION_KEYS: Object.freeze({
    log: "sys:ops_status:log:v1",
    scheduled: "sys:ops_status:scheduled:v1",
    dnsIpPool: "sys:ops_status:dns_ip_pool:v1"
  })
});
function Ry(o = {}) {
  const { nodeRepository: e } = o;
  return {
    async getNodesList(t, r) {
      const a = e.getKV(t);
      if (!a) return [];
      const n = be(a);
      if (n.NodesListCache && n.NodesListCache.exp > B()) return n.NodesListCache.data;
      const s = await e.getNodesSummaryIndex(a, { ctx: r });
      if (Array.isArray(s)) return s;
      const i = await e.rebuildNodeIndexesFromKv(a, { ctx: r });
      return Array.isArray(i?.summaries) ? i.summaries : [];
    },
    async getNodesListStrict(t, r) {
      const a = e.getKV(t);
      if (!a) return [];
      const n = be(a);
      if (n.NodesListCache && n.NodesListCache.exp > B()) return n.NodesListCache.data;
      const s = await e.getNodesSummaryIndexStrict(a, { ctx: r });
      if (Array.isArray(s)) return s;
      const i = await e.rebuildNodeIndexesFromKvStrict(a, { ctx: r });
      return Array.isArray(i?.summaries) ? i.summaries : [];
    },
    async invalidateList(t, r = null) {
      const a = e.getKV(r), n = be(a);
      n.NodesListCache = null, n.NodesIndexCache = null, gr(a);
    },
    maybeCleanup(t = null) {
      const r = t ? be(e.getKV(t)) : At.current(), a = B(), n = r.CleanupState;
      if (a - (n.lastRunAt || 0) < $.Defaults.CleanupMinIntervalMs) return;
      n.lastRunAt = a;
      const s = $.Defaults.CleanupBudgetMs, i = $.Defaults.CleanupChunkSize, c = n.iterators || (n.iterators = {
        node: null,
        playbackRoute: null,
        crypto: null,
        rate: null,
        log: null,
        playbackInfo: null,
        failover: null,
        progress: null,
        monthlyTraffic: null
      }), l = a, u = (d, f, m, p = c, h = (g) => d.delete(g)) => {
        let g = p[m];
        g || (g = d.entries(), p[m] = g);
        let y = 0;
        for (; y < i && (y === 0 || B() - l < s); ) {
          const _ = g.next();
          if (_.done) {
            p[m] = null;
            break;
          }
          y += 1;
          const [S, E] = _.value;
          d.has(S) && f(E, a) && h(S);
        }
      };
      if (n.phase === 0)
        u(r.NodeCache, (d) => d?.exp && d.exp < a, "node", r.CleanupIterators), n.phase = 1;
      else if (n.phase === 1)
        u(r.PlaybackRouteHotCache, (d) => !d || Number(d.expiresAt) <= a, "playbackRoute", r.CleanupIterators), n.phase = 2;
      else if (n.phase === 2)
        u(oe.CryptoKeyCache, (d) => d?.exp && d.exp < a, "crypto"), n.phase = 3;
      else if (n.phase === 3)
        u(je.RateLimitCache, (d) => !d || d.resetAt < a, "rate"), n.phase = 4;
      else if (n.phase === 4) n.phase = 5;
      else if (n.phase === 5)
        u(oe.PlaybackInfoResponseCache, (d) => !d || (Number(d.expiresAt) || 0) <= a || !Su(d, Qo), "playbackInfo", c), n.phase = 6;
      else if (n.phase === 6)
        u(oe.ProxyFailoverStateCache, (d) => {
          if (!d || typeof d != "object") return !0;
          if (d.failingTargets instanceof Map)
            for (const [y, _] of d.failingTargets) Number(_) <= a && d.failingTargets.delete(y);
          const f = Number(d.preferredTargetExpiresAt) > a, m = d.failingTargets instanceof Map && d.failingTargets.size > 0, p = !!d.inFlightProbe && Number(d.inFlightProbe.expiresAt) > a, h = Number(d.lastProbeResult?.completedAt) || 0, g = !!d.lastProbeResult && h + $.Defaults.HedgePreferredTtlSec * 1e3 > a;
          return !f && !m && !p && !g;
        }, "failover"), n.phase = 7;
      else if (n.phase === 7) {
        const d = Math.max(3e4, Math.max(1, Number($.Defaults.VideoProgressForwardIntervalSec) || 1) * 2e4);
        u(oe.PlaybackProgressRelay, (f) => {
          if (!f || f.pendingSnapshot || f.activeFlushPromise) return !f;
          const m = Number(f.terminalTombstoneUntil) || 0;
          if (m > 0) return m < a;
          const p = Number(f.lastTouchedAt || f.lastForwardAt) || 0;
          return p > 0 && p + d <= a;
        }, "progress", c, lr), n.phase = 8;
      } else
        u(oe.DashboardMonthlyTrafficCache, (d) => !d || (Number(d.staleUntil) || 0) <= a, "monthlyTraffic"), n.phase = 0;
    }
  };
}
function Cy(o = {}, e = {}) {
  return {
    normalizeNodeIndex(t = []) {
      return [...new Set((Array.isArray(t) ? t : []).map((r) => String(r || "").toLowerCase().trim()).filter(Boolean))];
    },
    normalizeNodeSummaryPayload(t, r = {}) {
      if (!H(r)) return null;
      const a = String(t || r.name || "").toLowerCase().trim();
      if (!a) return null;
      const n = e.normalizeLines(r.lines, r.target, r.port).slice(0, uo);
      if (!n.length) return null;
      const s = e.resolveActiveLineId(r.activeLineId, n, Array.isArray(r.lines) ? r.lines : [], r.port), i = dr(r.entryMode);
      return {
        name: a,
        cacheRevision: No(a, r),
        displayName: String(r.displayName ?? ""),
        entryMode: i,
        hostPrefixCnameTarget: i === "host_prefix" ? Zt(r.hostPrefixCnameTarget) : "",
        secret: i === "host_prefix" ? "" : String(r.secret ?? ""),
        tag: Xr(r.tags, r.tag)[0] || "",
        tags: Xr(r.tags, r.tag),
        tagColor: String(r.tagColor ?? ""),
        remark: String(r.remark ?? ""),
        tmdbAggregationEnabled: r.tmdbAggregationEnabled === !0,
        aggregationMode: qt(r.aggregationMode),
        lines: n.map((c) => ({
          id: String(c.id || "").trim(),
          name: String(c.name || "").trim(),
          target: String(c.target || "").trim()
        })),
        activeLineId: s,
        playbackInfoMode: Ur(r.playbackInfoMode),
        mediaAuthMode: jt(r.mediaAuthMode),
        realClientIpMode: Fr(r.realClientIpMode),
        hedgeProbePath: _a(r.hedgeProbePath),
        routingDecisionMode: Br(r.routingDecisionMode),
        mainVideoStreamMode: Nn(r.mainVideoStreamMode ?? r.wangpanDirectMode ?? r.wangpanMode)
      };
    },
    buildComparableNodeSummary(t = {}) {
      return e.normalizeNodeSummaryPayload(t?.name, t);
    },
    areNodeSummariesEquivalent(t = {}, r = {}) {
      return re(e.buildComparableNodeSummary(t)) === re(e.buildComparableNodeSummary(r));
    },
    hasLegacyNodeMirrorFields(t = {}) {
      return H(t) ? Object.prototype.hasOwnProperty.call(t, "headers") || Object.prototype.hasOwnProperty.call(t, "target") || Object.prototype.hasOwnProperty.call(t, "port") || Object.prototype.hasOwnProperty.call(t, "schemaVersion") || Object.prototype.hasOwnProperty.call(t, "createdAt") || Object.prototype.hasOwnProperty.call(t, "updatedAt") || Object.prototype.hasOwnProperty.call(t, "remarkColor") || Object.prototype.hasOwnProperty.call(t, "wangpanDirectMode") || Object.prototype.hasOwnProperty.call(t, "wangpanMode") || [...as, ...ns].some((r) => Object.prototype.hasOwnProperty.call(t, r)) ? !0 : (Array.isArray(t.lines) ? t.lines : []).some((r) => H(r) ? Object.prototype.hasOwnProperty.call(r, "port") || Object.prototype.hasOwnProperty.call(r, "latencyMs") || Object.prototype.hasOwnProperty.call(r, "latencyUpdatedAt") : !1) : !1;
    },
    summaryEntryRequiresNodeEntityRebuild(t = {}) {
      if (!H(t) || e.hasLegacyNodeMirrorFields(t)) return !0;
      const r = Array.isArray(t.lines) ? t.lines : [], a = e.normalizeLines(r, t.target, t.port);
      if (!a.length || r.length !== a.length) return !0;
      for (let n = 0; n < a.length; n += 1) {
        const s = r[n], i = a[n];
        if (!H(s) || !H(i) || String(s.target || "").trim() !== String(i.target || "").trim()) return !0;
      }
      return String(t.activeLineId || "").trim() !== e.resolveActiveLineId(t.activeLineId, a, r, t.port);
    },
    buildNodeSummary(t, r = {}, a = {}) {
      const n = String(t || r.name || "").toLowerCase().trim();
      if (!n || !H(r)) return {
        summary: null,
        changed: !1,
        legacyMirrorDetected: !1
      };
      const s = e.normalizeNode(n, r, a), i = e.normalizeNodeSummaryPayload(n, s.data);
      if (!i) return {
        summary: null,
        changed: !0,
        legacyMirrorDetected: e.hasLegacyNodeMirrorFields(r)
      };
      const c = e.normalizeNodeSummaryPayload(n, r), l = e.hasLegacyNodeMirrorFields(r);
      return {
        summary: i,
        changed: l || !e.areNodeSummariesEquivalent(c, i),
        legacyMirrorDetected: l
      };
    },
    normalizeNodeSummaryIndex(t = []) {
      const r = [], a = /* @__PURE__ */ new Set();
      let n = !1, s = !1, i = !1;
      for (const c of Array.isArray(t) ? t : []) {
        if (!H(c)) {
          n = !0, i = !0;
          continue;
        }
        const l = String(c.name || "").trim(), u = l.toLowerCase();
        if (!u || a.has(u)) {
          n = !0, i = !0;
          continue;
        }
        const { name: d, ...f } = c, m = e.buildNodeSummary(u, f);
        if (!m.summary) {
          n = !0, i = !0;
          continue;
        }
        (m.changed || l !== u) && (n = !0), m.legacyMirrorDetected && (s = !0), e.summaryEntryRequiresNodeEntityRebuild(f) && (i = !0), r.push(m.summary), a.add(u);
      }
      return {
        nodes: r,
        changed: n,
        legacyMirrorDetected: s,
        requiresRebuild: i
      };
    },
    primeNodeSummaryCaches(t = [], r = null) {
      const a = be(r), n = Array.isArray(t) ? t.filter((i) => H(i) && i.name) : [], s = e.normalizeNodeIndex(n.map((i) => i.name));
      return a.NodesListCache = {
        data: n.map((i) => ({ ...i })),
        exp: B() + 6e4
      }, a.NodesIndexCache = {
        data: s,
        exp: B() + 6e4
      }, n;
    },
    async getNodesSummaryIndex(t, r = {}) {
      if (!t) return null;
      const a = be(t);
      if (r.useCache !== !1 && a.NodesListCache?.exp > B() && Array.isArray(a.NodesListCache.data)) return a.NodesListCache.data;
      const n = a.NodesRevisionCacheGeneration;
      let s = null;
      try {
        s = await t.get(e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
      } catch {
        return null;
      }
      if (a.NodesRevisionCacheGeneration !== n) return Array.isArray(s) ? e.normalizeNodeSummaryIndex(s).nodes : null;
      if (!Array.isArray(s)) return null;
      const i = e.normalizeNodeSummaryIndex(s);
      if (i.requiresRebuild === !0) {
        const c = await e.rebuildNodeIndexesFromKv(t, { ctx: r.ctx });
        return Array.isArray(c?.summaries) ? c.summaries : [];
      }
      return a.NodesRevisionCacheGeneration === n ? e.primeNodeSummaryCaches(i.nodes, t) : i.nodes;
    },
    async getNodesSummaryIndexStrict(t, r = {}) {
      if (!t) return null;
      const a = be(t);
      if (r.useCache !== !1 && a.NodesListCache?.exp > B() && Array.isArray(a.NodesListCache.data)) return a.NodesListCache.data;
      const n = a.NodesRevisionCacheGeneration, s = await Oe(t, e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
      if (a.NodesRevisionCacheGeneration !== n) return Array.isArray(s) ? e.normalizeNodeSummaryIndex(s).nodes : [];
      if (!Array.isArray(s)) {
        const c = await e.rebuildNodeIndexesFromKvStrict(t, { ctx: r.ctx });
        return Array.isArray(c?.summaries) ? c.summaries : [];
      }
      const i = e.normalizeNodeSummaryIndex(s);
      if (i.requiresRebuild === !0) {
        const c = await e.rebuildNodeIndexesFromKvStrict(t, { ctx: r.ctx });
        return Array.isArray(c?.summaries) ? c.summaries : [];
      }
      return a.NodesRevisionCacheGeneration === n ? e.primeNodeSummaryCaches(i.nodes, t) : i.nodes;
    },
    async loadNodeSummariesForMutation(t, r = {}) {
      const a = await t.get(e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
      if (Array.isArray(a)) {
        const n = e.normalizeNodeSummaryIndex(a);
        if (n.requiresRebuild !== !0) return n.nodes;
      }
      return (await e.loadAllNodeEntitiesFromKvStrict(t, { ctx: r.ctx })).map((n) => e.buildNodeSummary(n?.name, n).summary).filter(Boolean);
    },
    async commitNodesSummaryIndexMutation(t, r = {}) {
      const { kv: a, ctx: n, syncLegacyIndex: s = !1 } = r, i = e.normalizeNodeSummaryIndex(t).nodes, c = e.normalizeNodeIndex(i.map((h) => h.name)), l = e.buildNodesIndexMeta(c, i), u = await e.readRevisionMeta(a, e.NODES_INDEX_META_KEY, {
        count: 0,
        indexHash: "",
        fullIndexHash: ""
      }), d = [];
      (u.fullIndexHash !== l.fullIndexHash || !u.revision) && d.push(a.put(e.NODES_SUMMARY_INDEX_KEY, JSON.stringify(i))), s !== !1 && (u.indexHash !== l.indexHash || !u.revision) && d.push(a.put(e.NODES_INDEX_KEY, JSON.stringify(c)));
      const f = u.indexHash !== l.indexHash || u.fullIndexHash !== l.fullIndexHash || Number(u.count) !== Number(l.count) || !u.revision;
      if (d.length > 0) {
        const h = Promise.all(d);
        n && n.waitUntil(h), await h;
      }
      if (f) {
        const h = a.put(e.NODES_INDEX_META_KEY, JSON.stringify(l));
        n && n.waitUntil(h), await h;
      }
      const m = e.primeNodeSummaryCaches(i, a), p = f ? l : u;
      return li(p.revision, a), {
        summaries: m,
        meta: p
      };
    },
    async persistNodesSummaryIndex(t, r = {}) {
      const { kv: a, ctx: n, syncLegacyIndex: s = !1 } = r, i = e.normalizeNodeSummaryIndex(t).nodes;
      if (!a) {
        const c = e.primeNodeSummaryCaches(i, a);
        return gr(a), c;
      }
      return await xr(async () => (await e.commitNodesSummaryIndexMutation(i, {
        kv: a,
        ctx: n,
        syncLegacyIndex: s
      })).summaries, a);
    },
    async listNodeEntityKeys(t) {
      return (await e.listKvKeys(t, { prefix: e.PREFIX })).map((r) => String(r || "").replace(e.PREFIX, "").toLowerCase().trim()).filter(Boolean);
    },
    async listNodeEntityKeysStrict(t) {
      return (await e.listKvKeysStrict(t, { prefix: e.PREFIX })).map((r) => String(r || "").replace(e.PREFIX, "").toLowerCase().trim()).filter(Boolean);
    },
    async loadAllNodeEntitiesFromKv(t, r = {}) {
      const { ctx: a } = r;
      return t ? (await na(await e.listNodeEntityKeys(t), $.Defaults.NodesReadConcurrency, async (n) => {
        try {
          const s = await t.get(`${e.PREFIX}${n}`, { type: "json" });
          if (!s) return null;
          const i = e.normalizeNode(n, s);
          if (i.changed && !at(n, i.data)) {
            const c = t.put(`${e.PREFIX}${n}`, JSON.stringify(i.data));
            a ? a.waitUntil(c) : await c;
          }
          return {
            name: n,
            ...i.data
          };
        } catch {
          return null;
        }
      })).filter(Boolean) : [];
    },
    async loadAllNodeEntitiesFromKvStrict(t, r = {}) {
      return t ? (await na(await e.listNodeEntityKeysStrict(t), $.Defaults.NodesReadConcurrency, async (a) => {
        const n = await Oe(t, `${e.PREFIX}${a}`, { type: "json" });
        return n ? {
          name: a,
          ...e.normalizeNode(a, n).data
        } : null;
      })).filter(Boolean) : [];
    },
    async rebuildNodeIndexesFromKv(t, r = {}) {
      const { ctx: a, syncLegacyIndex: n = !1 } = r;
      return t ? await xr(async () => {
        const s = await e.loadAllNodeEntitiesFromKvStrict(t, { ctx: a }), i = s.map((l) => e.buildNodeSummary(l?.name, l).summary).filter(Boolean), c = await e.commitNodesSummaryIndexMutation(i, {
          kv: t,
          ctx: a,
          syncLegacyIndex: n
        });
        return {
          index: e.normalizeNodeIndex(c.summaries.map((l) => l?.name)),
          summaries: c.summaries,
          nodes: s
        };
      }, t) : {
        index: [],
        summaries: [],
        nodes: []
      };
    },
    async rebuildNodeIndexesFromKvStrict(t, r = {}) {
      if (!t) return {
        index: [],
        summaries: [],
        nodes: []
      };
      const a = be(t), n = a.NodesRevisionCacheGeneration, s = await e.loadAllNodeEntitiesFromKvStrict(t, r), i = s.map((l) => e.buildNodeSummary(l?.name, l).summary).filter(Boolean), c = a.NodesRevisionCacheGeneration === n ? e.primeNodeSummaryCaches(i, t) : i;
      return {
        index: e.normalizeNodeIndex(c.map((l) => l?.name)),
        summaries: c,
        nodes: s
      };
    },
    async upsertNodeSummaryEntry(t, r, a = {}) {
      const { kv: n, ctx: s } = a;
      if (!n) return null;
      const i = String(t || "").toLowerCase().trim();
      if (!i || at(i, r)) return null;
      const c = e.buildNodeSummary(i, r).summary;
      if (!c) return null;
      const l = be(n), u = l.NodesListCache?.exp > B() && Array.isArray(l.NodesListCache.data) ? l.NodesListCache.data.find((d) => String(d?.name || "").toLowerCase().trim() === i) : null;
      return u && e.areNodeSummariesEquivalent(u, c) ? u : await xr(async () => {
        const d = await e.loadNodeSummariesForMutation(n, { ctx: s });
        let f = !1;
        const m = d.map((p) => String(p?.name || "").toLowerCase().trim() !== i ? p : (f = !0, e.areNodeSummariesEquivalent(p, c) ? p : c));
        return f || m.push(c), (await e.commitNodesSummaryIndexMutation(m, {
          kv: n,
          ctx: s
        })).summaries.find((p) => String(p?.name || "").toLowerCase().trim() === i) || c;
      }, n);
    },
    async removeNodeSummaryEntry(t, r = {}) {
      const { kv: a, ctx: n } = r;
      if (!a) return [];
      const s = String(t || "").toLowerCase().trim();
      return await xr(async () => {
        const i = (await e.loadNodeSummariesForMutation(a, { ctx: n })).filter((c) => String(c?.name || "").toLowerCase().trim() !== s);
        return (await e.commitNodesSummaryIndexMutation(i, {
          kv: a,
          ctx: n
        })).summaries;
      }, a);
    },
    async getNodesIndex(t) {
      if (!t) return [];
      const r = be(t);
      if (r.NodesIndexCache?.exp > B() && Array.isArray(r.NodesIndexCache.data)) return [...r.NodesIndexCache.data];
      if (r.NodesListCache?.exp > B() && Array.isArray(r.NodesListCache.data)) {
        const s = e.normalizeNodeIndex(r.NodesListCache.data.map((i) => i?.name));
        return r.NodesIndexCache = {
          data: s,
          exp: B() + 6e4
        }, [...s];
      }
      const a = r.NodesRevisionCacheGeneration, n = e.normalizeNodeIndex(await t.get(e.NODES_INDEX_KEY, { type: "json" }) || []);
      if (r.NodesRevisionCacheGeneration !== a) return [...n];
      if (!n.length) {
        const s = await e.rebuildNodeIndexesFromKv(t);
        return [...e.normalizeNodeIndex(s.index)];
      }
      return r.NodesRevisionCacheGeneration === a && (r.NodesIndexCache = {
        data: n,
        exp: B() + 6e4
      }), [...n];
    },
    buildPlaybackRouteHotSignature(t, r = {}) {
      const a = String(t || "").toLowerCase().trim(), n = ie(re(e.getOrderedNodeLines(r).map((s) => String(s?.target || "").trim()).filter(Boolean)));
      return {
        cacheKey: `${a}:${String(r?.activeLineId || "").trim()}:${n}`,
        orderedTargetSignature: n
      };
    },
    buildPlaybackRouteHotSnapshot(t, r = {}, a = {}) {
      const n = String(t || "").toLowerCase().trim();
      if (!n || !H(r) || at(n, r)) return null;
      const s = e.getOrderedNodeLines(r), i = (s.length ? s.map((m) => m?.target) : String(r.target || "").split(",").map((m) => m.trim()).filter(Boolean)).map((m) => Ba(m)).filter(Ze);
      if (!i.length) return null;
      const c = Array.isArray(r.lines) ? r.lines.map((m) => H(m) ? { ...m } : m) : [], l = H(r.headers) ? { ...r.headers } : {}, u = {
        ...r,
        lines: c,
        headers: l
      }, { cacheKey: d, orderedTargetSignature: f } = e.buildPlaybackRouteHotSignature(n, u);
      return {
        nodeName: n,
        cacheKey: d,
        expiresAt: B() + Id,
        nodesRevision: String(a.nodesRevision || "").trim(),
        nodeCacheRevision: No(n, u),
        orderedTargetSignature: f,
        secret: String(u.secret || "").trim(),
        headers: l,
        lines: c,
        activeLineId: String(u.activeLineId || "").trim(),
        mainVideoStreamMode: qr(u),
        playbackInfoMode: Ur(u.playbackInfoMode),
        mediaAuthMode: jt(u.mediaAuthMode),
        realClientIpMode: Fr(u.realClientIpMode),
        routingDecisionMode: Br(u.routingDecisionMode),
        targetRecords: i,
        nodeData: u
      };
    },
    getPlaybackRouteHotSnapshot(t, r = null) {
      const a = String(t || "").toLowerCase().trim();
      if (!a) return null;
      const n = be(r ? e.getKV(r) : null).PlaybackRouteHotCache, s = n.get(a);
      return s ? Number(s.expiresAt) <= B() ? (n.delete(a), null) : (_n(n, a), s) : null;
    },
    async getVerifiedPlaybackRouteHotSnapshot(t, r) {
      const a = e.getKV(r), n = be(a), s = xe(t, n), i = e.getPlaybackRouteHotSnapshot(t, r);
      if (!i) return null;
      if (!a) return i;
      const c = await e.getNodesRevision(a);
      return xe(t, n) !== s ? null : !i.nodesRevision || !c || i.nodesRevision === c ? i : (e.invalidatePlaybackRouteHotCache(t, r), null);
    },
    setPlaybackRouteHotSnapshot(t, r = {}, a = {}, n = null) {
      const s = e.buildPlaybackRouteHotSnapshot(t, r, a);
      return s ? (He(be(n ? e.getKV(n) : null).PlaybackRouteHotCache, s.nodeName, s, mr), s) : null;
    },
    async primePlaybackRouteHotSnapshot(t, r = {}, a) {
      const n = e.getKV(a), s = be(n), i = xe(t, s), c = n ? await e.getNodesRevision(n) : "";
      return xe(t, s) !== i ? null : e.setPlaybackRouteHotSnapshot(t, r, { nodesRevision: c }, a);
    },
    invalidatePlaybackRouteHotCache(t = [], r = null) {
      const a = be(r ? e.getKV(r) : null).PlaybackRouteHotCache;
      for (const n of Array.isArray(t) ? t : [t]) {
        const s = String(n || "").toLowerCase().trim();
        s && a.delete(s);
      }
    },
    invalidateNodeCaches(t = [], r = {}) {
      const a = r.kv || (r.env ? e.getKV(r.env) : null), n = be(a), s = [];
      for (const i of Array.isArray(t) ? t : [t]) {
        const c = String(i || "").toLowerCase().trim();
        c && (s.push(c), n.NodeCache.delete(c), n.PlaybackRouteHotCache.delete(c));
      }
      s.length > 0 && (Bp(s, n), Bl(s), Kl(s)), r.invalidateList && (n.NodesListCache = null, n.NodesIndexCache = null, gr(a));
    },
    async persistNodesIndex(t, r = {}) {
      const { kv: a, ctx: n, invalidateList: s = !1 } = r, i = be(a), c = e.normalizeNodeIndex(t);
      return s && (i.NodesListCache = null), a ? await xr(async () => {
        const l = await e.readRevisionMeta(a, e.NODES_INDEX_META_KEY, {
          count: 0,
          indexHash: "",
          fullIndexHash: ""
        }), u = ie(re(c)), d = l.indexHash === u && l.revision ? l.updatedAt : /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), f = {
          ...l,
          updatedAt: d,
          revision: l.indexHash === u && l.revision ? l.revision : Gt(ie(`${u}:${l.fullIndexHash || ""}:${c.length}`), d),
          hash: l.hash || "",
          count: c.length,
          indexHash: u,
          fullIndexHash: String(l.fullIndexHash || "")
        }, m = [];
        (l.indexHash !== u || !l.revision) && m.push(a.put(e.NODES_INDEX_KEY, JSON.stringify(c)));
        const p = l.indexHash !== u || Number(l.count) !== c.length || !l.revision;
        if (m.length > 0) {
          const h = Promise.all(m);
          n && n.waitUntil(h), await h;
        }
        if (p) {
          const h = a.put(e.NODES_INDEX_META_KEY, JSON.stringify(f));
          n && n.waitUntil(h), await h;
        }
        return i.NodesIndexCache = {
          data: c,
          exp: B() + 6e4
        }, li(f.revision, a), c;
      }, a) : (i.NodesIndexCache = {
        data: c,
        exp: B() + 6e4
      }, gr(a), c);
    }
  };
}
function wy(o = {}, e = {}) {
  return {
    getDnsRecordHistoryKey(t, r) {
      const a = encodeURIComponent(String(t || "").trim() || "default"), n = encodeURIComponent(String(r || "").trim() || "unknown");
      return `${e.DNS_RECORD_HISTORY_PREFIX}${a}:${n}`;
    },
    getDnsHostHistoryRecordId(t) {
      return `host:${ne(t) || "unknown"}`;
    },
    normalizeDnsHistoryValueKey(t, r) {
      return `${String(t || "").trim().toUpperCase()}::${String(r || "").trim().toLowerCase()}`;
    },
    normalizeDnsRecordHistoryEntry(t = {}) {
      const r = t && typeof t == "object" ? t : {}, a = String(r.type || "").trim().toUpperCase(), n = String(r.content || "").trim(), s = String(r.savedAt || r.updatedAt || r.createdAt || "").trim(), i = s ? new Date(s) : null, c = i && !Number.isNaN(i.getTime()) ? i.toISOString() : "", l = String(r.name || "").trim(), u = String(r.actor || "admin").trim() || "admin", d = String(r.source || "ui").trim() || "ui", f = ne(r.requestHost), m = [
        a,
        n.toLowerCase(),
        l.toLowerCase(),
        f,
        c || s,
        d.toLowerCase()
      ].join("|");
      return {
        id: String(r.id || `dns-hist-${ie(m || "empty")}`),
        name: l,
        type: a,
        content: n,
        savedAt: c,
        actor: u,
        source: d,
        requestHost: f,
        preferredFallback: r.preferredFallback === !0
      };
    },
    normalizeDnsRecordHistory(t = []) {
      const r = [], a = /* @__PURE__ */ new Map();
      for (const s of Array.isArray(t) ? t : []) {
        const i = e.normalizeDnsRecordHistoryEntry(s);
        if (i.type !== "CNAME" || !i.content) continue;
        const c = e.normalizeDnsHistoryValueKey(i.type, i.content), l = a.get(c);
        if (Number.isInteger(l) && l >= 0) {
          i.preferredFallback === !0 && r[l] && (r[l].preferredFallback = !0);
          continue;
        }
        if (a.set(c, r.length), r.push(i), r.length >= $.Defaults.DnsHistoryLimit) break;
      }
      let n = !1;
      for (const s of r)
        if (s.preferredFallback === !0) {
          if (n) {
            s.preferredFallback = !1;
            continue;
          }
          n = !0;
        }
      return r;
    },
    async getDnsRecordHistory(t, r, a) {
      if (!t || !r || !a) return [];
      try {
        const n = await t.get(e.getDnsRecordHistoryKey(r, a), { type: "json" });
        return e.normalizeDnsRecordHistory(n);
      } catch {
        return [];
      }
    },
    async getDnsRecordHistoryForMutation(t, r, a) {
      if (!t || !r || !a) return [];
      const n = await t.get(e.getDnsRecordHistoryKey(r, a), { type: "json" });
      return e.normalizeDnsRecordHistory(n);
    },
    async persistDnsRecordHistory(t, r, a, n) {
      if (!t || !r || !a) return [];
      const s = e.normalizeDnsRecordHistory(n);
      return await t.put(e.getDnsRecordHistoryKey(r, a), JSON.stringify(s)), s;
    },
    async recordDnsRecordHistory(t, r, a, n = {}) {
      if (!t || !r || !a) return [];
      const s = await e.getDnsRecordHistoryForMutation(t, r, a), i = e.normalizeDnsRecordHistoryEntry(n);
      if (i.type !== "CNAME" || !i.content) return s;
      s.find((u) => e.normalizeDnsHistoryValueKey(u?.type, u?.content) === e.normalizeDnsHistoryValueKey(i.type, i.content))?.preferredFallback === !0 && (i.preferredFallback = !0);
      const c = e.normalizeDnsHistoryValueKey(i.type, i.content), l = s[0] ? e.normalizeDnsHistoryValueKey(s[0].type, s[0].content) : "";
      return l && l === c ? s : e.persistDnsRecordHistory(t, r, a, [i, ...s]);
    },
    async getDnsHostHistory(t, r, a) {
      return e.getDnsRecordHistory(t, r, e.getDnsHostHistoryRecordId(a));
    },
    async persistDnsHostHistory(t, r, a, n) {
      return e.persistDnsRecordHistory(t, r, e.getDnsHostHistoryRecordId(a), n);
    },
    async recordDnsHostHistory(t, r, a, n = {}) {
      return e.recordDnsRecordHistory(t, r, e.getDnsHostHistoryRecordId(a), n);
    },
    async setDnsHostHistoryPreferredFallback(t, r, a, n = "", s = !0) {
      if (!t || !r || !a) return [];
      const i = await e.getDnsHostHistory(t, r, a), c = String(n || "").trim();
      let l = !1;
      const u = i.map((d) => {
        const f = c && String(d?.id || "").trim() === c;
        return f && (l = !0), {
          ...d,
          preferredFallback: s === !0 ? f : !1
        };
      });
      if (s === !0 && c && !l) throw new Error("dns_history_entry_not_found");
      return e.persistDnsHostHistory(t, r, a, u);
    },
    getCurrentDateKey(t = /* @__PURE__ */ new Date(), r = $.Defaults.ScheduleUtcOffsetMinutes) {
      return ut(t, r).dateKey;
    }
  };
}
function Ly(o = {}, e = {}) {
  return {
    buildLegacyConfigCacheKeys(...t) {
      const r = /* @__PURE__ */ new Set([_l]);
      for (const a of t) {
        const n = e.getCurrentDateKey(/* @__PURE__ */ new Date(), a?.scheduleUtcOffsetMinutes);
        r.add(mi(a?.cfZoneId)), r.add(mi(a?.cfZoneId, n));
      }
      return [...r].filter(Boolean);
    },
    async listKvKeys(t, r = {}) {
      if (!t || typeof t.list != "function") return [];
      const a = String(r.prefix || ""), n = [];
      let s = "", i = 0, c = !1;
      const l = /* @__PURE__ */ new Set();
      for (; i < 1e3; ) {
        i += 1;
        const u = s ? await t.list({
          prefix: a,
          cursor: s
        }) : await t.list({ prefix: a });
        for (const f of u?.keys || []) {
          const m = String(f?.name || "").trim();
          m && n.push(m);
        }
        const d = typeof u?.cursor == "string" ? u.cursor : "";
        if (u?.list_complete === !0) {
          c = !0;
          break;
        }
        if (!d || d === s || l.has(d)) {
          const f = /* @__PURE__ */ new Error("KV key scan did not complete");
          throw f.code = "KV_SCAN_INCOMPLETE", f.status = 409, f.details = {
            prefix: a,
            pageCount: i,
            cursor: d,
            reason: d ? "repeated_cursor" : "missing_cursor"
          }, f;
        }
        l.add(d), s = d;
      }
      if (!c) {
        const u = /* @__PURE__ */ new Error("KV key scan exceeded the page safety limit");
        throw u.code = "KV_SCAN_INCOMPLETE", u.status = 409, u.details = {
          prefix: a,
          pageCount: i,
          cursor: s,
          reason: "page_limit"
        }, u;
      }
      return [...new Set(n)];
    },
    async listKvKeysStrict(t, r = {}) {
      if (!t || typeof t.list != "function") return [];
      const a = String(r.prefix || ""), n = [];
      let s = "", i = 0, c = !1;
      const l = /* @__PURE__ */ new Set();
      for (; i < 1e3; ) {
        i += 1;
        const u = await em(t, s ? {
          prefix: a,
          cursor: s
        } : { prefix: a });
        for (const f of u?.keys || []) {
          const m = String(f?.name || "").trim();
          m && n.push(m);
        }
        const d = typeof u?.cursor == "string" ? u.cursor : "";
        if (u?.list_complete === !0) {
          c = !0;
          break;
        }
        if (!d || d === s || l.has(d)) {
          const f = /* @__PURE__ */ new Error("KV key scan did not complete");
          throw f.code = "KV_SCAN_INCOMPLETE", f.status = 409, f.details = {
            prefix: a,
            pageCount: i,
            cursor: d,
            reason: d ? "repeated_cursor" : "missing_cursor"
          }, f;
        }
        l.add(d), s = d;
      }
      if (!c) {
        const u = /* @__PURE__ */ new Error("KV key scan exceeded the page safety limit");
        throw u.code = "KV_SCAN_INCOMPLETE", u.status = 409, u.details = {
          prefix: a,
          pageCount: i,
          cursor: s,
          reason: "page_limit"
        }, u;
      }
      return [...new Set(n)];
    },
    async readRepairableRuntimeConfig(t) {
      if (!t) return {
        config: {},
        rawConfig: {},
        hadMalformedValue: !1,
        source: "missing",
        rawText: null
      };
      let r = null;
      try {
        r = await t.get(e.CONFIG_KEY);
      } catch (a) {
        const n = /* @__PURE__ */ new Error("KV tidy could not read the runtime config");
        throw n.code = "KV_TIDY_CONFIG_READ_FAILED", n.status = 503, n.details = {
          key: e.CONFIG_KEY,
          cause: ue(a, "kv_read_failed")
        }, n;
      }
      if (r == null || r === "") return {
        config: {},
        rawConfig: {},
        hadMalformedValue: !1,
        source: "missing",
        rawText: null
      };
      try {
        const a = JSON.parse(String(r));
        return {
          config: ce(H(a) ? a : {}),
          rawConfig: H(a) ? a : {},
          hadMalformedValue: !H(a),
          source: "text_json",
          rawText: String(r)
        };
      } catch {
        return {
          config: {},
          rawConfig: {},
          hadMalformedValue: !0,
          source: "text_invalid_json",
          rawText: String(r)
        };
      }
    },
    async readRawKvEntry(t, r) {
      if (!t) return {
        exists: !1,
        value: null
      };
      const a = await t.get(r);
      return a == null ? {
        exists: !1,
        value: null
      } : {
        exists: !0,
        value: String(a)
      };
    },
    async captureRawKvEntries(t, r = []) {
      const a = [], n = /* @__PURE__ */ new Set();
      for (const s of Array.isArray(r) ? r : []) {
        const i = String(s || "").trim();
        !i || n.has(i) || (n.add(i), a.push({
          key: i,
          ...await e.readRawKvEntry(t, i)
        }));
      }
      return a;
    },
    async applyKvMutationsWithRollback(t, r = []) {
      if (!t) return [];
      const a = [], n = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
      for (const l of Array.isArray(r) ? r : []) {
        const u = String(l?.key || "").trim();
        if (!u) continue;
        const d = String(l?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put";
        a.push({
          type: d,
          key: u,
          value: String(l?.value ?? "")
        }), !s.has(u) && (s.add(u), n.set(u, {
          key: u,
          ...await e.readRawKvEntry(t, u)
        }));
      }
      const i = [], c = /* @__PURE__ */ new Map();
      try {
        for (const l of a)
          l.type === "delete" ? await t.delete(l.key) : await t.put(l.key, l.value), c.has(l.key) || i.push(l.key), c.set(l.key, l.type === "delete" ? {
            exists: !1,
            value: null
          } : {
            exists: !0,
            value: l.value
          });
        return a;
      } catch (l) {
        const u = [], d = [];
        for (let f = i.length - 1; f >= 0; f -= 1) {
          const m = i[f], p = n.get(m), h = c.get(m);
          if (!(!p || !h))
            try {
              const g = await e.readRawKvEntry(t, m);
              if (!(g.exists === h.exists && (h.exists !== !0 || g.value === h.value))) {
                d.push(m);
                continue;
              }
              p.exists ? await t.put(p.key, p.value) : await t.delete(p.key);
            } catch (g) {
              u.push(`${p.key}:${g?.message || String(g)}`);
            }
        }
        if (u.length > 0 || d.length > 0) {
          const f = /* @__PURE__ */ new Error(`${l?.message || String(l)}; rollback_incomplete`);
          throw f.code = "KV_MUTATION_ROLLBACK_CONFLICT", f.status = 409, f.details = {
            rollbackConflicts: d,
            rollbackFailures: u,
            originalError: ue(l, "kv_mutation_failed")
          }, f;
        }
        throw l;
      }
    }
  };
}
function Ny(o = {}, e = {}) {
  return {
    createEmptyTidyPreview(t = "kv") {
      return {
        scope: String(t || "kv").trim() || "kv",
        fieldGroups: [],
        deleteGroups: [],
        rewriteGroups: [],
        preserveGroups: [],
        warnings: []
      };
    },
    async readStoredNodesSummaryState(t) {
      const r = String(await t.get(e.NODES_SUMMARY_INDEX_KEY) || "");
      let a = null;
      try {
        a = r ? JSON.parse(r) : null;
      } catch {
        a = null;
      }
      return {
        rawStoredSummaryIndexText: r,
        storedSummaryIndexState: Array.isArray(a) ? e.normalizeNodeSummaryIndex(a) : null,
        previousFullIndexBytes: r ? new TextEncoder().encode(r).length : 0
      };
    },
    async classifyKvTidyKeys(t, r = []) {
      const a = [], n = /* @__PURE__ */ new Set(), s = new Set(Object.values(e.LEGACY_OPS_STATUS_SECTION_KEYS));
      let i = 0, c = 0, l = 0, u = 0, d = 0, f = 0, m = 0, p = 0, h = 0, g = 0;
      for (const y of r)
        if (y) {
          if (y.startsWith(e.PREFIX)) {
            a.push(y.slice(e.PREFIX.length));
            continue;
          }
          if (y.startsWith("fail:")) {
            n.add(y), h += 1;
            continue;
          }
          if (y === "sys:cf_dash_cache" || y.startsWith("sys:cf_dash_cache:")) {
            n.add(y);
            continue;
          }
          if (y === e.LEGACY_SCHEDULED_LOCK_KEY) {
            n.add(y);
            continue;
          }
          if (y.startsWith("sys:dns_ip_pool_fetch_lock:v1:")) {
            n.add(y), g += 1;
            continue;
          }
          if (y === e.CONFIG_META_KEY) {
            d += 1;
            continue;
          }
          if (y === e.CONFIG_SNAPSHOTS_META_KEY) {
            f += 1;
            continue;
          }
          if (y === e.NODES_INDEX_META_KEY) {
            m += 1;
            continue;
          }
          if (y === e.LEGACY_DNS_IP_POOL_SOURCES_KEY) {
            i += 1;
            continue;
          }
          if (y === e.LEGACY_TELEGRAM_ALERT_STATE_KEY) {
            i += 1;
            continue;
          }
          if (s.has(y) || y === e.LEGACY_OPS_STATUS_KEY) {
            i += 1;
            continue;
          }
          if (y.startsWith(e.DNS_RECORD_HISTORY_PREFIX)) {
            l += 1;
            continue;
          }
          y.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX) || y === e.CONFIG_KEY || y === e.NODES_INDEX_KEY || y === e.NODES_SUMMARY_INDEX_KEY || y === e.CONFIG_SNAPSHOTS_KEY || (i += 1);
        }
      return {
        nodeNames: a,
        removableKeys: n,
        untouchedOtherKeyCount: i,
        opsStatusKeyCount: c,
        dnsRecordHistoryKeyCount: l,
        dnsIpPoolSourceKeyCount: u,
        configMetaKeyCount: d,
        snapshotMetaKeyCount: f,
        nodeIndexMetaKeyCount: m,
        telegramAlertStateKeyCount: p,
        loginFailureKeyCount: h,
        dnsFetchLockKeyCount: g
      };
    },
    async collectKvTidyNodeMutations(t, r = [], a = {}, n = []) {
      const s = [], i = [];
      let c = 0, l = 0, u = 0, d = 0, f = 0, m = 0, p = Et(a.sourceDirectNodes || []);
      const h = [];
      for (const y of r) {
        const _ = `${e.PREFIX}${y}`;
        let S = null;
        try {
          S = await Oe(t, _, { type: "json" });
        } catch (C) {
          const L = /* @__PURE__ */ new Error(`KV tidy could not read node ${y}`);
          throw L.code = "KV_TIDY_NODE_READ_FAILED", L.status = 503, L.details = {
            key: _,
            nodeName: y,
            cause: ue(C, "kv_read_failed")
          }, L;
        }
        if (!H(S)) {
          const C = /* @__PURE__ */ new Error(`KV tidy found an invalid node entity: ${y}`);
          throw C.code = "KV_TIDY_NODE_INVALID", C.status = 409, C.details = {
            key: _,
            nodeName: y
          }, C;
        }
        const E = gf(S);
        E.shouldAddToSourceDirectNodes && (p = Et([...p, y])), E.topLevelPortPresent && (u += 1), d += Number(E.linePortCount) || 0, E.defaultPortNodePresent && (f += 1), m += Number(E.defaultPortLineCount) || 0, l += E.legacyKeysPresent.length;
        const { data: b, changed: T } = e.normalizeNode(y, S, { dropLegacyDirectRouting: !0 });
        i.push({
          name: y,
          ...b
        }), !at(y, b) && T && (h.push({
          key: _,
          ...await e.readRawKvEntry(t, _)
        }), c += 1, s.push({
          name: y,
          data: b
        }));
      }
      let g = a;
      return re(g.sourceDirectNodes || []) !== re(p) && (g = ce({
        ...g,
        sourceDirectNodes: p
      })), {
        nextTidyConfig: g,
        rewrittenNodes: s,
        fullEntityNodes: i,
        rewrittenNodeCount: c,
        deletedLegacyNodeFieldCount: l,
        migratedTopLevelPortNodeCount: u,
        migratedLinePortCount: d,
        migratedDefaultPortNodeCount: f,
        migratedDefaultPortLineCount: m,
        rollbackKvEntries: [...n, ...h]
      };
    },
    buildKvTidyNoteParts(t = {}, r = {}) {
      const a = [];
      return Array.isArray(t.legacyKeysPresent) && t.legacyKeysPresent.length && a.push(`legacy_keys=${t.legacyKeysPresent.join(",")}`), Number(t.rewrittenNodeCount) > 0 && a.push(`rewritten_nodes=${t.rewrittenNodeCount}`), Number(t.migratedTopLevelPortNodeCount) > 0 && a.push(`top_level_port_nodes=${t.migratedTopLevelPortNodeCount}`), Number(t.migratedLinePortCount) > 0 && a.push(`line_ports=${t.migratedLinePortCount}`), Number(t.migratedDefaultPortNodeCount) > 0 && a.push(`default_port_nodes=${t.migratedDefaultPortNodeCount}`), Number(t.migratedDefaultPortLineCount) > 0 && a.push(`default_port_lines=${t.migratedDefaultPortLineCount}`), r.includeRepairSource === !0 && r.repairedConfig?.hadMalformedValue && a.push(`${r.repairLabel || "config_source"}=${r.repairedConfig.source}`), a;
    },
    buildKvTidyPlanHash(t = {}) {
      const r = (Array.isArray(t?.mutationPlan) ? t.mutationPlan : []).map((a) => ({
        type: String(a?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put",
        key: String(a?.key || "").trim(),
        value: String(a?.value ?? "")
      }));
      return ie(re({
        scope: "kv",
        scannedKeys: [...new Set(Array.isArray(t?.scannedKeys) ? t.scannedKeys : [])].sort(),
        revisions: H(t?.revisions) ? t.revisions : {},
        mutationPlan: r,
        rebuiltNodeSummaries: Array.isArray(t?.rebuiltNodeSummaries) ? t.rebuiltNodeSummaries : []
      }));
    }
  };
}
function Iy(o = {}, e = {}) {
  return {
    ...Cy(o, e),
    ...wy(o, e),
    ...Ly(o, e),
    ...Ny(o, e)
  };
}
var Dy = class {
  constructor({ configReader: o, httpService: e, nodeRouteReader: t, proxyApi: r }) {
    this.configReader = o, this.httpService = e, this.nodeRouteReader = t, this.proxyApi = r;
  }
  #t(o, e, t, r = 200) {
    return this.httpService.buildCorsResponse(sa(e, o), t, r, { mergeOriginVary: !0 });
  }
  #e(o, e) {
    const t = new URL(o.url);
    t.pathname = e + "/";
    const r = new Headers({
      Location: t.toString(),
      "Cache-Control": "no-store"
    });
    Ne(r);
    const a = o.method === "GET" || o.method === "HEAD" ? 301 : 307;
    return new Response(null, {
      status: a,
      headers: r
    });
  }
  #o(o, e = "") {
    const t = String(e || "").trim();
    if (!o || !t || o.status === 101) return o;
    const r = new Headers(o.headers || {});
    return r.append("Set-Cookie", t), new Response(o.body, {
      status: o.status,
      statusText: o.statusText,
      headers: r
    });
  }
  #s(o, e) {
    const t = this.#t(o, e, "Not Found", 404);
    return this.#o(t, Il());
  }
  async #n(o, e, t, r) {
    if (!o || o.status === 101) return o;
    const a = await Cg(t, e, r);
    return a ? this.#o(o, Lg(a)) : o;
  }
  #r(o) {
    const e = o.segments;
    return e.length <= 1 ? !1 : this.httpService.isPlaybackCriticalSegments(e, 1) ? !0 : e.length <= 2 ? !1 : this.httpService.isPlaybackCriticalSegments(e, 2);
  }
  async #i(o, e, t, r) {
    if (!o.root) return null;
    const a = this.#r(o);
    let n = a ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(o.root, e) : null, s = a ? n ? "hit" : "miss" : "skip";
    const i = n?.nodeData || await this.nodeRouteReader.getNode(o.root, e, t);
    if (!i) return null;
    const c = at(o.root, i) ? "oversized_bypass" : "";
    if (c && (s = c), tt(i?.entryMode)) return null;
    const l = i.secret, u = ot(o.root, l), d = 1 + o.rootRaw.length, f = o.normalizedPathname.substring(d), m = bi(f, o.requestUrl, u), p = m?.normalizedPath || f, h = `/${o.rootRaw}${p === "/" ? "/" : p}`, g = m ? h.split("/").filter(Boolean) : o.segments;
    let y = d;
    if (l) {
      const T = g[1] || "";
      if (nt(T) !== l) return null;
      y += 1 + T.length;
    }
    const _ = h.substring(y), S = m ? (() => {
      const T = new URL(o.requestUrl.toString());
      return T.pathname = h, T;
    })() : o.requestUrl, E = Mr(_);
    let b = E.remaining;
    return _ === "" && !S.pathname.endsWith("/") || E.needsTrailingSlashRedirect === !0 ? { response: this.#e(r, h) } : (b === "" && (b = "/"), a && !n && (n = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(o.root, i, e)), {
      nodeData: i,
      secret: l,
      remaining: Z(b),
      linkVariant: E.linkVariant,
      requestUrl: S,
      pathNormalizationState: m,
      playbackRouteHotSnapshot: n,
      targetHotCacheState: s,
      nodeCacheState: c,
      entryMode: "kv_route"
    });
  }
  #c(o) {
    return o ? pn(Mr(o.normalizedPathname)?.remaining || "/") : !1;
  }
  async #u(o, e, t, r) {
    const a = o?.hostPrefixMatch;
    if (!a?.prefix) return null;
    const n = a.prefix, s = this.#c(o);
    let i = s ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(n, e) : null, c = s ? i ? "hit" : "miss" : "skip";
    const l = i?.nodeData || await this.nodeRouteReader.getNode(n, e, t);
    if (!l || !tt(l?.entryMode)) return null;
    const u = at(n, l) ? "oversized_bypass" : "";
    u && (c = u);
    const d = Mr(o.normalizedPathname);
    let f = d.remaining;
    return d.needsTrailingSlashRedirect === !0 ? { response: this.#e(r, o.normalizedPathname) } : (f === "" && (f = "/"), s && !i && (i = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(n, l, e)), {
      nodeData: l,
      secret: "",
      remaining: Z(f),
      linkVariant: d.linkVariant,
      requestUrl: o.requestUrl,
      playbackRouteHotSnapshot: i,
      targetHotCacheState: c,
      nodeCacheState: u,
      entryMode: "host_prefix"
    });
  }
  #a(o) {
    const e = o?.requestHost || "", t = o?.configuredHost || "", r = o?.configuredLegacyHost || "";
    return e ? t && e === t ? !0 : !!(r && r !== t && e === r) : !1;
  }
  async #d(o, e, t, r, a = {}) {
    if (!this.#a(o) || !o?.root) return null;
    const n = o.root, s = this.#r(o);
    let i = s ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(n, e) : null, c = s ? i ? "hit" : "miss" : "skip";
    const l = i?.nodeData || await this.nodeRouteReader.getNode(n, e, t);
    if (!l || !tt(l?.entryMode)) return null;
    const u = at(n, l) ? "oversized_bypass" : "";
    u && (c = u);
    const d = ot(n, "", { entryMode: "kv_route" }), f = 1 + o.rootRaw.length, m = o.normalizedPathname.substring(f), p = bi(m, o.requestUrl, d), h = p?.normalizedPath || m, g = `/${o.rootRaw}${h === "/" ? "/" : h}`, y = g.substring(f), _ = p ? (() => {
      const b = new URL(o.requestUrl.toString());
      return b.pathname = g, b;
    })() : o.requestUrl, S = Mr(y);
    let E = S.remaining;
    return y === "" && !_.pathname.endsWith("/") || S.needsTrailingSlashRedirect === !0 ? { response: this.#e(r, g) } : (E === "" && (E = "/"), s && !i && (i = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(n, l, e)), {
      nodeData: l,
      nodeName: n,
      secret: "",
      remaining: Z(E),
      linkVariant: S.linkVariant,
      requestUrl: _,
      pathNormalizationState: p,
      playbackRouteHotSnapshot: i,
      targetHotCacheState: c,
      nodeCacheState: u,
      entryMode: "kv_route",
      routeKindOverride: a.isLegacyHostRequest === !0 ? "legacy_host_prefix_path_compat" : "host_prefix_path_compat",
      attachLegacyProxyContext: a.isLegacyHostRequest === !0
    });
  }
  async #f(o, e, t, r) {
    if (!Ai(o?.normalizedPathname)) return null;
    const a = r.headers.get("Cookie") || "", n = String(Oa(a).get("legacy_proxy_ctx") || "").trim();
    if (!n) return null;
    const s = await wg(n, e, { requestHost: o.requestHost });
    if (s?.ok !== !0) return { response: this.#s(r, e) };
    const i = String(s.payload?.node || "").trim().toLowerCase();
    if (!i) return { response: this.#s(r, e) };
    const c = pn(o.normalizedPathname);
    let l = c ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(i, e) : null, u = c ? l ? "hit" : "miss" : "skip";
    const d = l?.nodeData || await this.nodeRouteReader.getNode(i, e, t);
    if (!d) return { response: this.#s(r, e) };
    const f = at(i, d) ? "oversized_bypass" : "";
    f && (u = f);
    const m = tt(d?.entryMode);
    return c && !l && (l = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(i, d, e)), {
      nodeData: d,
      nodeName: i,
      secret: m ? "" : d.secret,
      remaining: o.normalizedPathname,
      linkVariant: "main",
      requestUrl: o.requestUrl,
      playbackRouteHotSnapshot: l,
      targetHotCacheState: u,
      nodeCacheState: f,
      entryMode: "kv_route",
      routeKindOverride: m ? "legacy_host_context_cookie_host_prefix_compat" : "legacy_host_context_cookie"
    };
  }
  async #l(o, e, t, r) {
    const a = Array.isArray(r?.segments) ? r.segments : [];
    if (a.length < 2) return null;
    const n = String(r.root || "").trim().toLowerCase();
    if (!n) return null;
    let s = a.slice(1);
    const i = await this.nodeRouteReader.getNode(n, e, t), c = String(i?.secret || "").trim();
    c && nt(s[0] || "") === c && (s = s.slice(1));
    const l = `/${s.join("/")}`, u = r.requestUrl instanceof URL ? r.requestUrl : null, d = u?.searchParams?.get?.("Ids") || "", f = String(u?.searchParams?.get?.("MediaSourceId") || "").trim(), m = f ? qh(f) : null, p = va(l) || nt(/^\/(?:emby|mediabrowser)\/Items\/([^/]+)/i.exec(l)?.[1] || ""), h = m || Ea(p) || (d ? d.split(",").map((b) => Ea(b)).find(Boolean) : null);
    if (!h) return null;
    const g = String(h.peerName || "").trim().toLowerCase();
    if (!g || g === n) return null;
    const y = await this.nodeRouteReader.getNode(g, e, t);
    if (!y || y.tmdbAggregationEnabled !== !0) return null;
    const _ = m ? m.itemId : h.itemId, S = l.replace(/^(\/(?:emby\/|mediabrowser\/)?Items\/)[^/]+/i, `$1${encodeURIComponent(_)}`), E = u ? new URL(u.toString()) : new URL(o.url);
    if (E.pathname = `${ot(g, String(y.secret || ""))}${S === "/" ? "/" : S}`, d) {
      const b = d.split(",").map((T) => Ea(T)?.itemId || T).join(",");
      E.searchParams.set("Ids", b);
    }
    return m && E.searchParams.set("MediaSourceId", m.mediaSourceId), {
      nodeData: y,
      nodeName: g,
      secret: String(y.secret || ""),
      remaining: Z(S),
      linkVariant: Mr(S).linkVariant,
      requestUrl: E,
      entryMode: "kv_route",
      request: o
    };
  }
  async handle(o, e, t, r) {
    if (!r) throw new TypeError("NodeProxyFacade.handle requires routeContext");
    const { requestHost: a, configuredHost: n, configuredLegacyHost: s } = r, i = await this.configReader.getRuntimeConfig(e), c = !!(s && s !== n && a === s), l = await this.#l(o, e, t, r);
    if (l)
      return l.response ? l.response : this.proxyApi.handle(l.request, l.nodeData, l.remaining, l.nodeName, l.secret, e, t, {
        requestUrl: l.requestUrl,
        linkVariant: l.linkVariant,
        runtimeConfig: i,
        runtimeRouteContext: r,
        entryMode: l.entryMode
      });
    const u = i.enableHostPrefixProxy === !0 && !!n && !c;
    r.hostPrefixMatch = u ? jo(a, n) : null;
    const d = !!(u && a !== n && a.endsWith(`.${n}`));
    if (r.hostPrefixMatch) {
      const p = await this.#u(r, e, t, o);
      return p?.response ? p.response : p?.nodeData ? this.proxyApi.handle(o, p.nodeData, p.remaining, r.hostPrefixMatch.prefix, p.secret, e, t, {
        requestUrl: p.requestUrl || r.requestUrl,
        linkVariant: p.linkVariant,
        targetHotCacheState: p.targetHotCacheState,
        nodeCacheState: p.nodeCacheState,
        cachedTargetRecords: Array.isArray(p.playbackRouteHotSnapshot?.targetRecords) ? p.playbackRouteHotSnapshot.targetRecords : null,
        nodeCacheRevision: p.playbackRouteHotSnapshot?.nodeCacheRevision || "",
        runtimeConfig: i,
        runtimeRouteContext: r,
        entryMode: p.entryMode
      }) : this.#t(o, e, "Not Found", 404);
    }
    if (d) return this.#t(o, e, "Not Found", 404);
    const f = await this.#d(r, e, t, o, { isLegacyHostRequest: c });
    if (f?.response) return f.response;
    if (f?.nodeData) {
      const p = await this.proxyApi.handle(o, f.nodeData, f.remaining, f.nodeName, f.secret, e, t, {
        requestUrl: f.requestUrl || r.requestUrl,
        linkVariant: f.linkVariant,
        pathNormalizationState: f.pathNormalizationState,
        targetHotCacheState: f.targetHotCacheState,
        nodeCacheState: f.nodeCacheState,
        cachedTargetRecords: Array.isArray(f.playbackRouteHotSnapshot?.targetRecords) ? f.playbackRouteHotSnapshot.targetRecords : null,
        nodeCacheRevision: f.playbackRouteHotSnapshot?.nodeCacheRevision || "",
        runtimeConfig: i,
        runtimeRouteContext: r,
        entryMode: f.entryMode,
        routeKindOverride: f.routeKindOverride
      });
      return f.attachLegacyProxyContext === !0 ? await this.#n(p, a, f.nodeName, e) : p;
    }
    const m = await this.#i(r, e, t, o);
    if (m?.response) return m.response;
    if (m?.nodeData) {
      const p = await this.proxyApi.handle(o, m.nodeData, m.remaining, r.root, m.secret, e, t, {
        requestUrl: m.requestUrl || r.requestUrl,
        linkVariant: m.linkVariant,
        pathNormalizationState: m.pathNormalizationState,
        targetHotCacheState: m.targetHotCacheState,
        nodeCacheState: m.nodeCacheState,
        cachedTargetRecords: Array.isArray(m.playbackRouteHotSnapshot?.targetRecords) ? m.playbackRouteHotSnapshot.targetRecords : null,
        nodeCacheRevision: m.playbackRouteHotSnapshot?.nodeCacheRevision || "",
        runtimeConfig: i,
        runtimeRouteContext: r,
        entryMode: m.entryMode
      });
      return c ? await this.#n(p, a, r.root, e) : p;
    }
    if (c && Ai(r.normalizedPathname)) {
      const p = await this.#f(r, e, t, o);
      if (p?.response) return p.response;
      if (p?.nodeData) {
        const h = await this.proxyApi.handle(o, p.nodeData, p.remaining, p.nodeName, p.secret, e, t, {
          requestUrl: p.requestUrl || r.requestUrl,
          linkVariant: p.linkVariant,
          targetHotCacheState: p.targetHotCacheState,
          nodeCacheState: p.nodeCacheState,
          cachedTargetRecords: Array.isArray(p.playbackRouteHotSnapshot?.targetRecords) ? p.playbackRouteHotSnapshot.targetRecords : null,
          nodeCacheRevision: p.playbackRouteHotSnapshot?.nodeCacheRevision || "",
          runtimeConfig: i,
          runtimeRouteContext: r,
          entryMode: p.entryMode,
          routeKindOverride: p.routeKindOverride
        });
        return this.#n(h, a, p.nodeName, e);
      }
    }
    return this.#t(o, e, "Not Found", 404);
  }
};
function My(o) {
  return Object.freeze({
    persistCloudflareDnsRecordsForHost(e) {
      return dp({
        ...e,
        dnsHistoryRepository: o
      });
    },
    buildDnsIpWorkspaceItems(e, t, r, a = {}) {
      return yl(e, t, r, {
        ...a,
        probeRepository: o
      });
    },
    buildDnsIpPoolWorkspacePreviewItems(e, t, r, a, n = {}) {
      return Np(e, t, r, a, {
        ...n,
        probeRepository: o
      });
    },
    tryAcquireDnsIpPoolFetchRefreshLock(e, t) {
      return xp({
        ...e,
        leaseRepository: o
      }, t);
    },
    releaseDnsIpPoolFetchRefreshLock(e, t) {
      return Op({
        ...e,
        leaseRepository: o
      }, t);
    },
    runDnsIpPoolSourcesLiveRefresh(e) {
      return vp({
        ...e,
        poolRepository: o
      });
    }
  });
}
function Py(o, e) {
  const t = e.shellService, r = [
    $p({
      kernel: o,
      bindingPort: o,
      CacheManager: e.cacheManager,
      LogQueryPlanner: e.logQueryPlanner,
      Logger: e.logger,
      requestModel: o,
      buildAdminLocalIndexUploadRecord: t.buildAdminLocalIndexUploadRecord,
      buildAdminShellState: t.buildAdminShellState,
      buildAdminUiContract: t.buildAdminUiContract,
      buildDnsIpPoolWorkspacePreviewItems: e.dns.buildDnsIpPoolWorkspacePreviewItems,
      buildDnsIpWorkspaceItems: e.dns.buildDnsIpWorkspaceItems,
      persistCloudflareDnsRecordsForHost: e.dns.persistCloudflareDnsRecordsForHost,
      releaseDnsIpPoolFetchRefreshLock: e.dns.releaseDnsIpPoolFetchRefreshLock,
      runDnsIpPoolSourcesLiveRefresh: e.dns.runDnsIpPoolSourcesLiveRefresh,
      tryAcquireDnsIpPoolFetchRefreshLock: e.dns.tryAcquireDnsIpPoolFetchRefreshLock,
      withAdminShellRuntimeStatus: t.withAdminShellRuntimeStatus
    }),
    Qg({
      D1TidyExecutor: e.d1TidyExecutor,
      D1TidyPlanner: e.d1TidyPlanner,
      Logger: e.logger,
      buildAdminReleaseVendorManifest: t.buildAdminReleaseVendorManifest,
      normalizeAdminReleaseVendorManifestRecord: t.normalizeAdminReleaseVendorManifestRecord,
      validateAdminShellHtmlSource: t.validateAdminShellHtmlSource
    }, o),
    gh({
      CacheManager: e.cacheManager,
      persistCloudflareDnsRecordsForHost: e.dns.persistCloudflareDnsRecordsForHost
    }, o),
    _h({
      bindingPort: o,
      schemaReadinessPort: o,
      statusPersistence: o
    }),
    gy({
      CacheManager: e.cacheManager,
      withAdminShellRuntimeStatus: t.withAdminShellRuntimeStatus
    }, o),
    by({}, o),
    Iy({}, o)
  ];
  for (const a of r) for (const [n, s] of Object.entries(a)) o[n] = s;
  return o;
}
var xy = "video.emos.best", Oy = "emos", to = "https://medb.lat/media/list/index?page_size=1", vy = 60 * 1e3, Fy = 5e3;
function Uy(o) {
  const e = H(o?.items?.[0]?.counts) ? o.items[0].counts : H(o?.counts) ? o.counts : null;
  return e ? {
    MovieCount: e.movie ?? 0,
    SeriesCount: e.series ?? 0,
    EpisodeCount: e.episode ?? 0
  } : null;
}
async function ky() {
  const o = oe.MedbItemsCountsCache.get(to);
  if (o && o.expiresAt > B()) return o.counts;
  const e = new AbortController(), t = setTimeout(() => e.abort("medb_counts_timeout"), Fy);
  try {
    const r = await fetch(to, {
      headers: { accept: "application/json" },
      signal: e.signal
    });
    if (!r.ok) return null;
    const a = Uy(await r.json());
    return a ? (oe.MedbItemsCountsCache.set(to, {
      counts: a,
      expiresAt: B() + vy
    }), a) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}
function Hy(o, e) {
  if (String(e || "").trim().toLowerCase() === Oy) return !0;
  for (const t of Array.isArray(o?.lines) ? o.lines : []) {
    const r = String(t?.target || "").trim();
    if (r)
      try {
        if (ne(new URL(r).hostname) === xy) return !0;
      } catch {
      }
  }
  return !1;
}
async function $y(o, e, t, r, a) {
  if (o.method !== "GET" || String(Z(a)).replace(/\/+$/, "").toLowerCase() !== "/emby/items/counts" || !Hy(t, r)) return null;
  const n = await ky();
  return n ? ae(n, 200, sa(e, o)) : null;
}
function By({ includeTestingSupport: o = !1 } = {}) {
  const e = { ...Ty }, t = Object.freeze({ getRuntimeConfig: we }), r = Ry({ nodeRepository: e }), a = Sh({ logRepository: e }), n = im({
    indexRepository: e,
    statusPort: e
  });
  Py(e, {
    cacheManager: r,
    d1TidyExecutor: Ey(),
    d1TidyPlanner: Ay(),
    dns: My(e),
    logger: a,
    logQueryPlanner: hh(),
    shellService: n
  });
  const s = cy({
    cachePort: r,
    configReader: t,
    fetchPort: { fetchRequest: We },
    logger: a,
    nodeRepository: e
  }), i = new Nf({
    actionHandlers: e.adminActionHandlers,
    bindingService: e,
    configReader: t,
    repository: e,
    requestModel: e,
    shellService: n
  }), c = new Dy({
    configReader: t,
    httpService: Object.freeze({
      buildCorsResponse: n.buildEdgeCorsResponse,
      isPlaybackCriticalSegments: n.isPlaybackCriticalSegments
    }),
    nodeRouteReader: e,
    proxyApi: s
  }), l = new Zg({
    logger: a,
    service: e
  }), u = (m, p) => {
    const h = new URL(m.url), g = ne(h.hostname), y = Z(h.pathname), _ = y.toLowerCase(), S = ft(p), E = S.toLowerCase(), b = Mn(S), T = b.toLowerCase(), C = Sc(p, {
      adminPath: S,
      loginPath: b
    }), L = y.split("/").filter(Boolean), P = L[0] || "", A = nt(P).toLowerCase();
    return {
      initHealth: C,
      requestUrl: h,
      requestHost: g,
      configuredHost: Ve(p),
      configuredLegacyHost: Jr(p),
      normalizedPathname: y,
      pathnameLower: _,
      adminPath: S,
      adminPathLower: E,
      adminLoginPath: b,
      adminLoginPathLower: T,
      segments: L,
      rootRaw: P,
      root: A
    };
  }, d = (m, p) => (p === "GET" || p === "HEAD") && m.pathnameLower === "/favicon.ico" || p === "GET" && m.normalizedPathname === "/" || hc(m.pathnameLower, m.adminPathLower) || Dr(m.pathnameLower, m.adminLoginPathLower) ? !0 : m.adminPathLower === "/admin" && m.pathnameLower === "/api/auth/login" && m.root === "api" && m.segments[1] === "auth" && m.segments[2] === "login", f = {
    adminConsole: i,
    nodeProxy: c,
    scheduledMaintenance: l,
    workerHandler: Object.freeze({
      async fetch(m, p, h) {
        const g = u(m, p), y = m.method;
        if (!((y === "GET" || y === "HEAD") && g.pathnameLower === "/favicon.ico")) {
          const _ = await t.getRuntimeConfig(p), S = !!(g.configuredLegacyHost && g.configuredLegacyHost !== g.configuredHost && g.requestHost === g.configuredLegacyHost);
          if (_.enableHostPrefixProxy === !0 && g.configuredHost && !S && g.requestHost !== g.configuredHost && g.requestHost.endsWith(`.${g.configuredHost}`)) return c.handle(m, p, h, g);
        }
        if (d(g, y)) {
          const _ = await i.handle(m, p, h);
          if (_) return _;
        }
        return c.handle(m, p, h, g);
      },
      scheduled(m, p, h) {
        return l.handle(m, p, h);
      }
    })
  };
  return o === !0 && (f.testingSupport = Object.freeze({
    cacheManager: r,
    kernel: e,
    logger: a,
    shellService: n,
    buildNodeRouteContext: u,
    buildRouteCorsResponse(m, p, h, g = 200) {
      return n.buildEdgeCorsResponse(sa(p, m), h, g, { mergeOriginVary: !0 });
    },
    isPlaybackCriticalRouteContext(m) {
      const p = Array.isArray(m?.segments) ? m.segments : [];
      return p.length <= 1 ? !1 : n.isPlaybackCriticalSegments(p, 1) ? !0 : p.length > 2 && n.isPlaybackCriticalSegments(p, 2);
    },
    isolateState: Ru,
    proxyService: s.testingSupport
  })), Object.freeze(f);
}
var { workerHandler: Ky } = By();
export {
  Ky as default
};

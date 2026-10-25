function pn(n) {
  const e = String(n || "").trim();
  if (!/^\d+$/.test(e)) return null;
  const t = Number(e);
  return Number.isFinite(t) ? t : null;
}
function xa(n) {
  if (n == null) return "";
  try {
    return n instanceof ArrayBuffer ? new TextDecoder().decode(new Uint8Array(n)) : ArrayBuffer.isView(n) ? new TextDecoder().decode(n) : String(n || "");
  } catch {
    return "";
  }
}
async function Sa(n, e) {
  const t = Math.max(0, Math.floor(Number(e) || 0)), r = pn(n?.headers?.get?.("Content-Length"));
  if (Number.isFinite(r) && r > t) {
    try {
      Promise.resolve(n?.body?.cancel?.()).catch(() => {
      });
    } catch {
    }
    return {
      bodyBytes: /* @__PURE__ */ new Uint8Array(0),
      bytes: r,
      exceeded: !0
    };
  }
  if (!n?.body) return {
    bodyBytes: /* @__PURE__ */ new Uint8Array(0),
    bytes: 0,
    exceeded: !1
  };
  const a = n.body.getReader(), o = [];
  let s = 0;
  try {
    for (; ; ) {
      const { done: l, value: d } = await a.read();
      if (l) break;
      const u = d instanceof Uint8Array ? d : new Uint8Array(d || 0);
      if (s + u.byteLength > t) {
        try {
          Promise.resolve(a.cancel()).catch(() => {
          });
        } catch {
        }
        return {
          bodyBytes: /* @__PURE__ */ new Uint8Array(0),
          bytes: s + u.byteLength,
          exceeded: !0
        };
      }
      o.push(u), s += u.byteLength;
    }
  } catch {
    return {
      bodyBytes: /* @__PURE__ */ new Uint8Array(0),
      bytes: s,
      exceeded: !0
    };
  } finally {
    try {
      a.releaseLock();
    } catch {
    }
  }
  const i = new Uint8Array(s);
  let c = 0;
  for (const l of o)
    i.set(l, c), c += l.byteLength;
  return {
    bodyBytes: i,
    bytes: s,
    exceeded: !1
  };
}
async function Pe(n, e) {
  const t = await Sa(n, e);
  return {
    text: t.exceeded ? "" : new TextDecoder().decode(t.bodyBytes),
    bytes: t.bytes,
    exceeded: t.exceeded
  };
}
function gn(n) {
  let e = /* @__PURE__ */ new WeakMap(), t = n(), r = t;
  return {
    get(a = null) {
      if (!a || typeof a != "object" && typeof a != "function") return t;
      let o = e.get(a);
      return o || (o = n(), e.set(a, o)), r = o, o;
    },
    current() {
      return r;
    },
    reset() {
      e = /* @__PURE__ */ new WeakMap(), t = n(), r = t;
    }
  };
}
function Fl(n, e = 8192) {
  const t = Math.max(2, Math.floor(Number(e) || 8192)), r = Math.max(1, Math.min(32, Math.floor(t / 256))), a = Math.max(16, Math.min(512, Math.floor(t / Math.max(4, r * 2)))), o = 4, s = Math.max(8, Math.min(256, Math.floor(t / 32))), i = /* @__PURE__ */ new WeakSet();
  let c = 0, l = !1;
  const d = (f, m = 0) => {
    if (f == null) return f;
    if (typeof f == "string")
      return f.length <= a ? f : (l = !0, `${f.slice(0, a)}...`);
    if (typeof f == "number" || typeof f == "boolean") return f;
    if (typeof f == "bigint" || typeof f != "object") return String(f);
    if (i.has(f)) return "[Circular]";
    if (m >= o || c >= s)
      return l = !0, "[Truncated]";
    c += 1, i.add(f);
    try {
      if (Array.isArray(f)) {
        const g = [];
        for (let y = 0; y < f.length && y < r; y += 1) g.push(d(f[y], m + 1));
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
        p[y] = d(f[g], m + 1), h += 1;
      }
      return p;
    } finally {
      i.delete(f);
    }
  };
  try {
    const f = JSON.stringify(d(n));
    if (!l && f && f.length <= t) return f;
  } catch {
  }
  const u = JSON.stringify({ truncated: !0 });
  return u.length <= t ? u : "{}";
}
var Ja = "19.9";
function ie(n = "") {
  const e = String(n || "");
  let t = 2166136261;
  for (let r = 0; r < e.length; r += 1)
    t ^= e.charCodeAt(r), t = Math.imul(t, 16777619);
  return (t >>> 0).toString(36);
}
function us(n = []) {
  const e = Array.isArray(n) ? n : [n];
  let t = 2166136261;
  const r = (a) => {
    for (let o = 0; o < 32; o += 8)
      t ^= a >>> o & 255, t = Math.imul(t, 16777619);
  };
  r(e.length);
  for (const a of e) {
    const o = String(a ?? "");
    r(o.length);
    for (let s = 0; s < o.length; s += 1)
      t ^= o.charCodeAt(s), t = Math.imul(t, 16777619);
  }
  return (t >>> 0).toString(36);
}
function Pn(n = "") {
  const e = new TextEncoder().encode(String(n || ""));
  let t = 14695981039346656037n;
  const r = 1099511628211n;
  for (const a of e)
    t ^= BigInt(a), t = BigInt.asUintN(64, t * r);
  return t.toString(16).padStart(16, "0");
}
async function Xn(n = "") {
  const e = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(n || "")));
  return [...new Uint8Array(e)].map((t) => t.toString(16).padStart(2, "0")).join("");
}
function bt(n) {
  const e = Array.isArray(n) ? n : String(n || "").split(/[\\r\\n,，;；|]+/), t = /* @__PURE__ */ new Set(), r = [];
  for (const a of e) {
    const o = String(a || "").trim();
    if (!o) continue;
    const s = o.toLowerCase();
    t.has(s) || (t.add(s), r.push(o));
  }
  return r;
}
function Co(n) {
  const e = String(n || "").trim().toLowerCase();
  if (!e) return null;
  const t = e.includes("*"), r = e.replace(/^\*\./, "").replace(/^\*+/, "").replace(/\*+$/g, "").replace(/^\.+|\.+$/g, "");
  return r ? {
    hostname: r,
    wildcard: t
  } : null;
}
function oe(n) {
  return Co(n)?.hostname || "";
}
function ar(n = []) {
  const e = Array.isArray(n) ? n : [n], t = [], r = /* @__PURE__ */ new Set();
  for (const a of e) {
    const o = String(a || "").trim();
    !o || r.has(o) || (r.add(o), t.push(o));
  }
  return t;
}
function k(n) {
  return !!n && typeof n == "object" && !Array.isArray(n);
}
function fe(n, e, t, r) {
  let a;
  if (typeof n == "number") a = n;
  else if (typeof n == "string") {
    const o = n.trim();
    if (!/^-?\d+$/.test(o)) return e;
    a = Number(o);
  } else return e;
  return Number.isFinite(a) ? Math.min(r, Math.max(t, Math.floor(a))) : e;
}
function Ul(n, e, t, r) {
  const a = Number(n);
  return Number.isFinite(a) ? Math.min(r, Math.max(t, a)) : e;
}
function _a(n, e) {
  return !!n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, e);
}
function Ba(n) {
  return String(n || "").replace(/[\\%_]/g, "\\$&");
}
function kl(n) {
  const e = String(n || "").trim();
  return e ? /^(?:\d{1,3}\.){3}\d{1,3}$/.test(e) ? !0 : /^[0-9a-f:]+$/i.test(e) && e.includes(":") : !1;
}
function ds(n) {
  const e = String(n || "").trim();
  return e ? /^[a-z]{3,4}$/i.test(e) : !1;
}
function Hl() {
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
function $l() {
  const n = gn(() => ({ namespaces: /* @__PURE__ */ new Map() }));
  let e = "default";
  const t = (r, a = "default") => {
    const o = String(a || "default").trim() || "default";
    let s = r.namespaces.get(o);
    return s || (s = {
      ConfigCache: null,
      RuntimeConfigCacheGeneration: 0,
      SingleFlightTasks: /* @__PURE__ */ new Map()
    }, r.namespaces.set(o, s)), e = o, s;
  };
  return {
    get(r = null, a = "default") {
      return t(n.get(r), a);
    },
    current() {
      return t(n.current(), e);
    },
    reset() {
      n.reset(), e = "default";
    }
  };
}
function Bl() {
  const n = gn(() => ({
    KvDataMutationChain: Promise.resolve(),
    KvTidyMutationChain: Promise.resolve()
  }));
  return {
    get(e = null) {
      return n.get(e);
    },
    current() {
      return n.current();
    },
    reset() {
      n.reset();
    }
  };
}
function mr(n = globalThis) {
  try {
    return n?.caches?.default ?? null;
  } catch {
    return null;
  }
}
function Yn(n = globalThis) {
  return n.crypto.subtle;
}
function fs(n) {
  return String(n || "").trim();
}
function Kl(n = [], e = {}) {
  const t = /* @__PURE__ */ Object.create(null), r = /* @__PURE__ */ new Map();
  for (const s of n) {
    const i = fs(s?.name) || "anonymous", c = s?.handlers && typeof s.handlers == "object" ? s.handlers : s;
    for (const [l, d] of Object.entries(c || {})) {
      if (typeof d != "function") throw new TypeError(`Admin action ${l} from ${i} is not a function`);
      if (t[l]) throw new Error(`Duplicate admin action ${l}: ${r.get(l)} and ${i}`);
      t[l] = d, r.set(l, i);
    }
  }
  const a = Object.freeze({ ...e.aliases });
  for (const [s, i] of Object.entries(a)) if (!t[i]) throw new Error(`Admin action alias ${s} targets missing action ${i}`);
  for (const s of e.requiredActions || []) if (!t[s]) throw new Error(`Missing required admin action ${s}`);
  const o = Object.freeze({ ...t });
  return Object.freeze({
    handlers: o,
    names: Object.freeze(Object.keys(o).sort()),
    resolve(s) {
      const i = fs(s);
      return o[a[i] || i] || null;
    }
  });
}
function zl(n) {
  function e(r, a = null) {
    if (typeof r != "function") {
      const i = r;
      return (c) => e(c, i);
    }
    const o = n.get(a), s = o.KvDataMutationChain.catch(() => null).then(() => r());
    return o.KvDataMutationChain = s.catch(() => null), s;
  }
  function t(r, a = null) {
    if (typeof r != "function") {
      const i = r;
      return (c) => t(c, i);
    }
    const o = n.get(a), s = o.KvTidyMutationChain.catch(() => null).then(() => e(r, a));
    return o.KvTidyMutationChain = s.catch(() => null), s;
  }
  return Object.freeze({
    runDataMutation: e,
    runTidyMutation: t
  });
}
function Wl() {
  return gn(() => ({
    LogQueue: [],
    LogDedupe: /* @__PURE__ */ new Map(),
    LogFlushPending: !1,
    LogFlushTask: null,
    LogClearEpochMs: 0,
    LogLastFlushAt: 0,
    runtimeConfig: null
  }));
}
function pr(n = "") {
  return String(n || "").trim().toLowerCase().split(";", 1)[0].trim();
}
function hn(n = "") {
  const e = pr(n);
  return e === "application/json" || e === "text/json" || /^application\/[a-z0-9!#$&^_.+-]+\+json$/i.test(e);
}
function bi(n = "") {
  const e = pr(n);
  return e === "text/html" || e === "application/xhtml+xml";
}
function Gl(n = "", e = "text/html") {
  const t = pr(e);
  if (!bi(t)) return !1;
  const [r, a] = t.split("/", 2);
  let o = -1, s = 0;
  for (const i of String(n || "").split(",")) {
    const [c, ...l] = i.split(";"), [d, u] = pr(c).split("/", 2);
    let f = -1;
    if (d === r && u === a ? f = 2 : d === r && u === "*" ? f = 1 : d === "*" && u === "*" && (f = 0), f < o || f < 0) continue;
    let m = 1;
    for (const p of l) {
      const [h, g] = p.split("=", 2);
      if (String(h || "").trim().toLowerCase() !== "q") continue;
      const y = String(g || "").trim();
      m = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(y) ? Number(y) : 0;
      break;
    }
    f > o && (o = f, s = m);
  }
  return s > 0;
}
var Vl = Object.freeze({
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
function Jn(n, e, t = {}) {
  const r = e?.response, a = Math.max(400, Number(t.status) || 502), o = String(t.statusText || Vl[a] || "Error").trim(), s = new Headers(r?.headers || {});
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
  ].forEach((d) => s.delete(d)), s.set("Content-Type", "application/json; charset=utf-8"), s.set("Cache-Control", "no-store"), s.delete("X-Proxy-Mime-Guard"), s.delete("X-Proxy-Contract-Guard");
  const i = String(t.guardHeader || "").trim(), c = String(t.guardValue || "").trim();
  i && c && s.set(i, c);
  const l = {
    error: String(t.error || o || "Error"),
    code: a,
    message: String(t.message || "The API response did not satisfy the proxy contract."),
    ...t.details && typeof t.details == "object" && !Array.isArray(t.details) ? { details: t.details } : {}
  };
  try {
    Promise.resolve(r?.body?.cancel?.()).catch(() => {
    });
  } catch {
  }
  return n && typeof n == "object" && (n.proxyGuardState = c), {
    ...e,
    response: new Response(n?.requestMethod === "HEAD" ? null : JSON.stringify(l), {
      status: a,
      statusText: o,
      headers: s
    })
  };
}
function jl(n, e, t = {}) {
  const r = e?.response;
  if (!r || n?.requestTraits?.isApiRequest !== !0 || r.status === 101 || r.status === 204 || r.status === 205 || r.status === 304) return e;
  const a = typeof t.sanitizePath == "function" ? t.sanitizePath : (l) => String(l || "/"), o = r.headers.get("Content-Type");
  if ((n?.requestMethod === "GET" || n?.requestMethod === "HEAD") && a(n?.proxyPath || "/") === "/" && Gl(n?.request?.headers?.get("Accept"), o) || !bi(o)) return e;
  const s = typeof t.buildErrorState == "function" ? t.buildErrorState : Jn, i = Number(r.status) || 0, c = i >= 400;
  return s(n, e, {
    status: c ? i : void 0,
    statusText: c && String(r.statusText || "").trim() || void 0,
    message: "Upstream API returned an HTML document instead of API data.",
    guardHeader: "X-Proxy-Mime-Guard",
    guardValue: "html-document",
    details: {
      upstreamStatus: r.status,
      contentType: pr(o) || "missing"
    }
  });
}
var ql = "playback-info", Ei = /* @__PURE__ */ new WeakSet();
function wo(n) {
  if (!n || typeof n != "object" || Array.isArray(n)) return !1;
  const e = Object.getPrototypeOf(n);
  return e === Object.prototype || e === null;
}
function Lo(n = "") {
  let e;
  try {
    e = JSON.parse(String(n || ""));
  } catch {
    return null;
  }
  return wo(e) ? e : null;
}
function yn({ response: n, bodyText: e, bodyBytes: t, payload: r }) {
  if (!n || !wo(r)) return null;
  const a = Object.freeze({
    contract: ql,
    response: n,
    bodyText: String(e || ""),
    bodyBytes: Math.max(0, Number(t) || 0),
    payload: r
  });
  return Ei.add(a), a;
}
function Pt(n) {
  return Ei.has(n) && n?.contract === "playback-info" && !!n.response && typeof n.bodyText == "string" && Number.isFinite(n.bodyBytes) && n.bodyBytes >= 0 && wo(n.payload);
}
function xn(n, e) {
  return Object.freeze({
    kind: "invalid",
    reason: e,
    details: Object.freeze({
      reason: e,
      upstreamStatus: Number(n?.status) || 0,
      contentType: pr(n?.headers?.get?.("Content-Type")) || "missing"
    })
  });
}
var Xl = 256 * 1024;
async function Yl(n, e = {}) {
  const t = String(e.requestMethod || "GET").toUpperCase();
  if (!n || !(n.status >= 200 && n.status < 300) || t === "HEAD" || n.status === 204 || n.status === 205 || !n.body) return Object.freeze({ kind: "skip" });
  if (!hn(n.headers.get("Content-Type"))) return xn(n, "unsupported_content_type");
  const r = Number(e.maxBytes), a = Number.isFinite(r) && r > 0 ? Math.floor(r) : Xl, o = await Pe(n.clone(), a);
  if (o.exceeded) return xn(n, Number(o.bytes) > a ? "body_too_large" : "body_read_failed");
  const s = Lo(o.text);
  return s ? Object.freeze({
    kind: "valid",
    representation: yn({
      response: n,
      bodyText: o.text,
      bodyBytes: o.bytes,
      payload: s
    })
  }) : xn(n, "invalid_root_object");
}
function Kr(n) {
  if (!n || typeof n != "object" || Array.isArray(n)) return !1;
  const e = Object.getPrototypeOf(n);
  return e === Object.prototype || e === null;
}
function On(n) {
  const e = /* @__PURE__ */ new Set();
  if (!Kr(n)) return e;
  const t = Kr(n.ProviderIds) ? n.ProviderIds : null;
  if (t) for (const [o, s] of Object.entries(t)) {
    if (String(o).toLowerCase() !== "tmdb") continue;
    const i = String(s ?? "").trim();
    i && e.add(`tmdb:${i}`);
  }
  const r = Jl(n);
  if (r)
    return e.add(r), e;
  const a = String(n.Name ?? "").trim().toLowerCase();
  if (a) {
    const o = String(n.ProductionYear ?? "").trim();
    e.add(o ? `name:${a}:${o}` : `name:${a}:`);
  }
  return e;
}
function Jl(n) {
  if (!Kr(n)) return "";
  const e = String(n.IndexNumber ?? "").trim();
  if (!e || e === "0") return "";
  const t = String(n.ParentIndexNumber ?? "").trim() || "0", r = String(n.SeriesName ?? "").trim().toLowerCase();
  return r ? `episode:${r}:${t}:${e}` : "";
}
function Ql(n, e, t, r) {
  const a = [];
  if (!Kr(n) || !Array.isArray(n.MediaSources) || !String(t ?? "").trim()) return a;
  const o = [];
  for (const s of n.MediaSources) {
    if (!Kr(s)) continue;
    const i = String(s.Id ?? "").trim();
    if (!i) continue;
    const c = String(s.DirectStreamUrl || s.Path || "").trim(), l = c ? r(e, c) : "";
    l && o.push({
      ...s,
      Id: Zl(e, t, i),
      Path: l,
      DirectStreamUrl: l,
      IsRemote: !1,
      Protocol: "Http",
      SupportsTranscoding: !1,
      TranscodingUrl: ""
    });
  }
  return o.length && a.push({
    peerName: e,
    mediaSources: o
  }), a;
}
function Zl(n, e, t) {
  const r = JSON.stringify([String(e ?? ""), String(t ?? "")]);
  return `n${ms(n)}.${ms(r)}`;
}
function eu(n, e) {
  if (!Kr(n) || !Array.isArray(n.MediaSources) || !Array.isArray(e) || !e.length) return null;
  const t = n.MediaSources, r = new Set(t.map((s) => String(s?.Id ?? "").trim()).filter(Boolean)), a = [...t];
  let o = 0;
  for (const s of e) for (const i of s.mediaSources) {
    const c = String(i.Id ?? "").trim();
    !c || r.has(c) || (r.add(c), a.push(i), o += 1);
  }
  return o ? {
    payload: {
      ...n,
      MediaSources: a
    },
    addedVersionCount: o
  } : null;
}
function ms(n) {
  const e = new TextEncoder().encode(String(n ?? ""));
  let t = "";
  for (const r of e) t += String.fromCharCode(r);
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function Sn(n) {
  const e = n instanceof Headers ? new Headers(n) : new Headers(n || {});
  return [
    "Content-Encoding",
    "Content-Length",
    "Content-MD5",
    "Digest",
    "ETag",
    "Transfer-Encoding"
  ].forEach((t) => e.delete(t)), e.set("Content-Type", "application/json; charset=utf-8"), e;
}
function Qa(n) {
  if (typeof n != "string") return n;
  const e = n.trim();
  if (!e || !e.startsWith("{") && !e.startsWith("[")) return n;
  try {
    return JSON.parse(e);
  } catch {
    return n;
  }
}
function No(n) {
  const e = Qa(n);
  if (!Array.isArray(e)) return {
    items: [],
    changed: !0
  };
  let t = e !== n;
  const r = [];
  for (const a of e) {
    const o = Qa(a);
    if (!o || typeof o != "object" || Array.isArray(o)) {
      t = !0;
      continue;
    }
    o !== a && (t = !0), r.push(o);
  }
  return {
    items: r,
    changed: t
  };
}
function Ti(n) {
  let e = n, t = !1;
  const r = (a, o) => {
    e === n && (e = { ...n }), e[a] = o, t = !0;
  };
  for (const a of ["MediaStreams", "MediaAttachments"]) {
    if (!Object.prototype.hasOwnProperty.call(n, a)) continue;
    const o = No(n[a]);
    o.changed && r(a, o.items);
  }
  if (Object.prototype.hasOwnProperty.call(n, "RequiredHttpHeaders")) {
    const a = Qa(n.RequiredHttpHeaders);
    !a || typeof a != "object" || Array.isArray(a) ? r("RequiredHttpHeaders", {}) : a !== n.RequiredHttpHeaders && r("RequiredHttpHeaders", a);
  }
  return {
    mediaSource: e,
    changed: t
  };
}
function Do(n) {
  if (!n || typeof n != "object" || Array.isArray(n) || !Object.prototype.hasOwnProperty.call(n, "MediaSources")) return {
    payload: n,
    rewriteState: "not_needed"
  };
  const e = No(n.MediaSources);
  let t = e.changed;
  const r = e.items.map((a) => {
    const o = Ti(a);
    return o.changed && (t = !0), o.mediaSource;
  });
  return t ? {
    payload: {
      ...n,
      MediaSources: r
    },
    rewriteState: "applied"
  } : {
    payload: n,
    rewriteState: "not_needed"
  };
}
function Ai(n, e = {}) {
  const t = Do(n), r = t.payload;
  if (!r || typeof r != "object" || Array.isArray(r) || !Array.isArray(r.MediaSources)) return {
    payload: n,
    rewriteState: "not_needed"
  };
  const a = typeof e.buildProxyUrl == "function" ? e.buildProxyUrl : () => "";
  let o = t.rewriteState === "applied";
  const s = r.MediaSources.map((i) => {
    let c = i;
    const l = (p, h, g = {}) => {
      const y = Object.prototype.hasOwnProperty.call(c, p);
      g.onlyIfPresent === !0 && !y || c[p] === h && !(g.ensurePresent === !0 && !y) || (c === i && (c = { ...i }), c[p] = h, o = !0);
    }, d = String(i.DirectStreamUrl || "").trim(), u = String(i.Path || "").trim(), f = d || u, m = f ? a(f) : "";
    return m ? (l("DirectStreamUrl", m, { ensurePresent: !0 }), l("Path", m, { ensurePresent: !0 })) : l("Path", "", { ensurePresent: !0 }), l("IsRemote", !1, { ensurePresent: !0 }), l("Protocol", "Http", { ensurePresent: !0 }), l("SupportsTranscoding", !1, { ensurePresent: !0 }), l("TranscodingUrl", "", { ensurePresent: !0 }), l("TranscodingSubProtocol", "", { onlyIfPresent: !0 }), l("TranscodingContainer", "", { onlyIfPresent: !0 }), l("TranscodingType", "", { onlyIfPresent: !0 }), c;
  });
  return o ? {
    payload: {
      ...r,
      MediaSources: s
    },
    rewriteState: "applied"
  } : {
    payload: n,
    rewriteState: "not_needed"
  };
}
function tu(n, e = {}) {
  if (!Pt(n)) return {
    kind: "invalid",
    reason: "invalid_representation"
  };
  const t = e.rewriteEnabled === !0 ? Ai(n.payload, { buildProxyUrl: e.buildProxyUrl }) : Do(n.payload);
  if (t.rewriteState !== "applied") return {
    kind: "valid",
    representation: n,
    rewriteState: e.rewriteEnabled === !0 ? "not_needed" : "passthrough"
  };
  const r = JSON.stringify(t.payload), a = new TextEncoder().encode(r).byteLength, o = n.response;
  try {
    Promise.resolve(o.body?.cancel?.()).catch(() => {
    });
  } catch {
  }
  return {
    kind: "valid",
    representation: yn({
      response: new Response(r, {
        status: o.status,
        statusText: o.statusText,
        headers: Sn(o.headers)
      }),
      bodyText: r,
      bodyBytes: a,
      payload: t.payload
    }),
    rewriteState: "applied"
  };
}
var ru = new TextEncoder();
function Qn(n) {
  return ru.encode(String(n || "")).byteLength;
}
function au(n, e) {
  const t = Number(n?.status);
  if (!(t >= 200 && t < 300) || t === 204 || t === 205) return null;
  let r;
  try {
    r = new Headers(Array.isArray(n?.headers) ? n.headers : []);
  } catch {
    return null;
  }
  if (!hn(r.get("Content-Type"))) return null;
  const a = String(n.bodyText || ""), o = Qn(a), s = Number(e);
  if (Number.isFinite(s) && s > 0 && o > s) return null;
  const i = Lo(a);
  return i ? {
    headers: r,
    bodyText: a,
    bodyBytes: o,
    payload: i
  } : null;
}
var nu = class {
  constructor(n = {}) {
    if (!(n.entries instanceof Map)) throw new TypeError("PlaybackInfoCacheStore requires a Map");
    this.entries = n.entries, this.now = typeof n.now == "function" ? n.now : Date.now, this.maxEntries = Math.max(1, Number(n.maxEntries) || 1), this.maxEntryBytes = Math.max(1, Number(n.maxEntryBytes) || 1), this.maxTotalBytes = Math.max(1, Number(n.maxTotalBytes) || 1);
  }
  cleanup(n = this.now()) {
    for (const [t, r] of this.entries) {
      const a = Number(r?.expiresAt) || 0;
      a > 0 && a <= n && this.entries.delete(t);
    }
    for (; this.entries.size > this.maxEntries; ) {
      const t = this.entries.keys().next().value;
      if (!t) break;
      this.entries.delete(t);
    }
    let e = 0;
    for (const t of this.entries.values()) {
      const r = Number(t?.bodyBytes), a = Number.isFinite(r) && r > 0 ? r : Qn(t?.bodyText);
      t.bodyBytes = a, e += a;
    }
    for (; this.entries.size > 0 && e > this.maxTotalBytes; ) {
      const t = this.entries.keys().next().value;
      if (!t) break;
      const r = this.entries.get(t);
      e -= Number(r?.bodyBytes) || 0, this.entries.delete(t);
    }
  }
  set(n, e, t = {}) {
    if (!n || !Pt(e)) return !1;
    const r = e.response;
    if (!(r.status >= 200 && r.status < 300) || r.status === 204 || r.status === 205 || !hn(r.headers.get("Content-Type"))) return !1;
    const a = Number(e.bodyBytes), o = Math.max(Number.isFinite(a) && a > 0 ? a : 0, Qn(e.bodyText)), s = e.payload;
    if (o > this.maxEntryBytes || !s) return !1;
    const i = Math.max(0, Number(t.ttlMs) || 0);
    if (i <= 0) return !1;
    const c = Sn(r.headers);
    c.delete("Set-Cookie");
    const l = this.now();
    return this.entries.delete(n), this.entries.set(n, {
      nodeName: String(t.nodeName || "").trim().toLowerCase(),
      nodeRevision: String(t.nodeRevision || "").trim(),
      playbackInfoRewrite: String(t.playbackInfoRewrite || "").trim(),
      status: r.status,
      statusText: r.statusText,
      headers: [...c.entries()],
      bodyText: e.bodyText,
      bodyBytes: o,
      payload: s,
      storedAt: l,
      expiresAt: l + i
    }), this.cleanup(l), !0;
  }
  get(n) {
    if (!n) return null;
    const e = this.entries.get(n);
    if (!e) return null;
    const t = Number(e.expiresAt) || 0;
    if (t > 0 && t <= this.now())
      return this.entries.delete(n), null;
    let r;
    try {
      r = new Response(e.bodyText, {
        status: Number(e.status) || 200,
        statusText: String(e.statusText || ""),
        headers: new Headers(Array.isArray(e.headers) ? e.headers : [])
      });
    } catch {
      return this.entries.delete(n), null;
    }
    const a = yn({
      response: r,
      bodyText: e.bodyText,
      bodyBytes: e.bodyBytes,
      payload: e.payload
    });
    return a ? (this.entries.delete(n), this.entries.set(n, e), {
      representation: a,
      metadata: e
    }) : (this.entries.delete(n), null);
  }
};
function ou() {
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
    CleanupState: Hl()
  };
}
var Tt = gn(ou), be = (n = null) => Tt.get(n), sr = Wl(), Za = $l(), Zn = Bl(), { runDataMutation: nr, runTidyMutation: su } = zl(Zn), ee = {
  ProxyFailoverStateCache: /* @__PURE__ */ new Map(),
  CryptoKeyCache: /* @__PURE__ */ new Map(),
  PlaybackInfoResponseCache: /* @__PURE__ */ new Map(),
  PlaybackProgressRelay: /* @__PURE__ */ new Map(),
  MetadataPrewarmTasks: /* @__PURE__ */ new Map(),
  TmdbLookupCache: /* @__PURE__ */ new Map(),
  TodbVideoIdCache: /* @__PURE__ */ new Map(),
  MedbItemsCountsCache: /* @__PURE__ */ new Map(),
  DashboardMonthlyTrafficCache: /* @__PURE__ */ new Map(),
  SingleFlightTasks: /* @__PURE__ */ new Map(),
  AdminRemoteShellCacheMutationChains: /* @__PURE__ */ new Map(),
  LogsReadinessProbeCache: /* @__PURE__ */ new WeakMap(),
  ProxyAccessRuleProfileCache: /* @__PURE__ */ new WeakMap()
};
for (const n of [
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
]) Object.defineProperty(ee, n, {
  enumerable: !0,
  configurable: !1,
  get: () => Tt.current()[n],
  set: (e) => {
    Tt.current()[n] = e;
  }
});
for (const n of ["ConfigCache", "RuntimeConfigCacheGeneration"]) Object.defineProperty(ee, n, {
  enumerable: !0,
  configurable: !1,
  get: () => Za.current()[n],
  set: (e) => {
    Za.current()[n] = e;
  }
});
var Ve = {
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
for (const n of ["CleanupState"]) Object.defineProperty(Ve, n, {
  enumerable: !0,
  configurable: !1,
  get: () => Tt.current()[n],
  set: (e) => {
    Tt.current()[n] = e;
  }
});
for (const n of ["KvDataMutationChain", "KvTidyMutationChain"]) Object.defineProperty(Ve, n, {
  enumerable: !0,
  configurable: !1,
  get: () => Zn.current()[n],
  set: (e) => {
    Zn.current()[n] = e;
  }
});
var te = {
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
function iu(n) {
  const e = {}, t = {};
  for (const r of n) for (const a of Object.keys(r)) t[a] = {
    enumerable: !0,
    configurable: !1,
    get: () => r[a],
    set: (o) => {
      r[a] = o;
    }
  };
  return Object.defineProperties(e, t);
}
var cu = iu([
  ee,
  Ve,
  te
]);
function ue(n, e = "unknown_error") {
  const t = String(n?.message || "").trim();
  return t || String(n || "").trim() || e;
}
function xe(n, e = 500) {
  const t = Number(n);
  if (Number.isFinite(t) && t >= 400 && t <= 599) return Math.floor(t);
  const r = Number(e);
  return Number.isFinite(r) && r >= 400 && r <= 599 ? Math.floor(r) : 500;
}
function _n(n) {
  if (!n || typeof n != "object") return !1;
  const e = String(n?.code || "").trim(), t = Number(n?.status);
  return !!e || Number.isFinite(t) && t >= 400 && t <= 599;
}
function lu(n, e = {}) {
  const t = xe(e?.status, 500), r = String(e?.code || "INTERNAL_ERROR").trim().toUpperCase() || "INTERNAL_ERROR", a = String(e?.message || "Server Error").trim() || "Server Error", o = _n(n);
  return {
    status: o ? xe(n?.status, t) : t,
    code: o && String(n?.code || r).trim().toUpperCase() || r,
    message: o && String(n?.message || a).trim() || a,
    details: o && n?.details !== void 0 ? n.details : e?.details !== void 0 ? e.details : null
  };
}
function Ri(n = "get", e = {}, t = "unknown_error") {
  const r = k(e) ? e : {}, a = {
    dependency: "KV",
    operation: String(n || "").trim().toLowerCase() === "list" ? "list" : "get",
    reason: String(t || "unknown_error").trim() || "unknown_error"
  }, o = String(r.key || "").trim(), s = String(r.prefix || "").trim();
  return o && (a.key = o), s && (a.prefix = s), Ie("KV_READ_FAILED", "KV 读取异常", 503, a);
}
function Io(n) {
  return _n(n) && String(n?.code || "").trim().toUpperCase() === "KV_READ_FAILED" && String(n?.details?.dependency || "").trim().toUpperCase() === "KV";
}
function uu(n, e = "INTERNAL_ERROR", t = "Server Error", r = "admin.read.kv_read_failed") {
  if (!Io(n)) return n;
  const a = Ie(e, t, 503, { ...k(n?.details) ? n.details : {} });
  return Le(r, a, a.details), a;
}
function It(n, e, t, r = "admin.read") {
  if (!Io(n)) return n;
  const a = String(n?.details?.operation || "").trim().toLowerCase() === "list" ? "list" : "get";
  return uu(n, e, t, `${String(r || "admin.read").trim() || "admin.read"}.kv_${a}_failed`);
}
function Le(n, e, t = null, r = "warn") {
  const a = r === "error" ? "error" : "warn", o = String(n || "runtime_failure").trim() || "runtime_failure", s = k(t) ? { ...t } : {}, i = String(e?.code || "").trim(), c = Number(e?.status);
  i && (s.errorCode = i), Number.isFinite(c) && (s.errorStatus = Math.floor(c)), Object.keys(s).length > 0 ? console[a](`[${o}] ${ue(e)}`, s) : console[a](`[${o}] ${ue(e)}`);
}
async function ge(n, e, t = null, r = null) {
  try {
    return await n;
  } catch (a) {
    return Le(e, a, t), r;
  }
}
function Ie(n = "CONFIG_INVALID", e = "配置无效", t = 400, r = null) {
  const a = new Error(String(e || "配置无效"));
  return a.code = String(n || "CONFIG_INVALID"), a.status = xe(t, 400), r != null && (a.details = r), a;
}
function Wt(n) {
  return n ? n.name === "AbortError" ? !0 : String(n.message || "").toLowerCase().includes("abort") : !1;
}
var Ci = 4 * 1024 * 1024, bn = 64 * 1024, wi = Object.freeze({
  "Referrer-Policy": "origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=15552000; preload",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block"
}), ma = Object.freeze({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Emby-Authorization, X-Emby-Token, X-Emby-Client, X-Emby-Device-Id, X-Emby-Device-Name, X-Emby-Client-Version, X-MediaBrowser-Authorization, X-MediaBrowser-Token"
});
function zr(n, e) {
  const t = n.get("Vary");
  if (!t) {
    n.set("Vary", e);
    return;
  }
  const r = t.split(",").map((a) => a.trim()).filter(Boolean);
  r.includes(e) || r.push(e), n.set("Vary", r.join(", "));
}
function De(n) {
  return Object.entries(wi).forEach(([e, t]) => n.set(e, t)), n;
}
function ae(n) {
  return Array.isArray(n) || k(n) ? JSON.stringify(n) : n === void 0 ? "" : JSON.stringify(n);
}
var $ = () => Date.now(), Li = (n) => new Promise((e) => setTimeout(e, Math.max(0, Number(n) || 0)));
function du(n) {
  let e = !1, t = () => {
  };
  const r = setTimeout(() => {
    e || (e = !0, t(!0));
  }, Math.max(0, Number(n) || 0));
  return {
    promise: new Promise((a) => {
      t = a;
    }),
    cancel() {
      return e ? !1 : (e = !0, clearTimeout(r), t(!1), !0);
    }
  };
}
var fu = Object.freeze({
  JwtExpiry: 3600 * 24 * 30,
  LoginLockDuration: 900,
  MaxLoginAttempts: 5
}), vt = Object.freeze({
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
}), mu = Object.freeze({
  EnableHostPrefixProxy: !1,
  MultiLinkCopyPanelEnabled: !1,
  DashboardShowD1WriteHotspot: !1,
  DashboardShowKvD1Status: !1,
  UiRadiusPx: 10,
  AdminUiSkin: "classic",
  NodePanelPingAutoSort: !1
}), pu = Object.freeze({
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
}), gu = Object.freeze({
  ScheduledLeaseMinMs: 30 * 1e3,
  ScheduledLeaseMs: 300 * 1e3,
  ScheduleUtcOffsetMinutes: 480,
  TgDailyReportSummaryEnabled: !1,
  TgDailyReportKvEnabled: !1,
  TgDailyReportD1Enabled: !1,
  TgDailyReportClockTimes: ["09:00"]
}), We = Object.freeze({
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
}), hu = Object.freeze({
  DnsHistoryLimit: 5,
  DnsIpProbeCacheTtlSec: 600,
  DnsIpProbeTimeoutMs: 2500,
  DnsIpProbeConcurrency: 4,
  DnsIpWorkspaceSyncProbeLimit: 2,
  DnsIpSourceConcurrency: 4,
  DnsIpSourceFetchMaxBytes: 2 * 1024 * 1024,
  DnsIpSourceIpLimit: 5
}), yu = Object.freeze({
  CfQuotaPlanCacheMinutes: 60,
  CfQuotaPlanOverride: ""
}), Su = Object.freeze({
  AssetHash: `v${Ja}`,
  Version: Ja
}), _u = Object.freeze({
  ...fu,
  ...vt,
  ...mu,
  ...pu,
  ...gu,
  ...We,
  ...hu,
  ...yu,
  ...Su
}), B = Object.freeze({ Defaults: _u });
function Ue(n) {
  return fe(n, B.Defaults.ScheduleUtcOffsetMinutes, -720, 840);
}
function ba(n = "", e = "00:00") {
  const t = String(e || "00:00").trim() || "00:00", r = String(n || "").trim().match(/^(\d{1,2}):(\d{1,2})$/);
  if (!r) return t;
  const a = Number(r[1]), o = Number(r[2]);
  return !Number.isInteger(a) || a < 0 || a > 23 || !Number.isInteger(o) || o < 0 || o > 59 ? t : `${String(a).padStart(2, "0")}:${String(o).padStart(2, "0")}`;
}
function xt(n = [], e = []) {
  const t = Array.isArray(n) ? n : String(n || "").split(/[\r\n,]+/), r = [], a = /* @__PURE__ */ new Set();
  for (const o of t) {
    const s = ba(o, "");
    !s || a.has(s) || (a.add(s), r.push(s));
  }
  return r.sort((o, s) => Mr(o) - Mr(s)), r.length ? r : [...new Set((Array.isArray(e) ? e : [e]).map((o) => ba(o, "")).filter(Boolean))].sort((o, s) => Mr(o) - Mr(s));
}
function Mr(n = "") {
  const e = ba(n, "");
  if (!e) return -1;
  const [t, r] = e.split(":");
  return (Number(t) || 0) * 60 + (Number(r) || 0);
}
function bu(n = "") {
  const e = String(n || "").trim().match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/);
  return e ? {
    dateKey: e[1],
    clockTime: ba(e[2], "")
  } : {
    dateKey: "",
    clockTime: ""
  };
}
function Eu(n, e = B.Defaults.ScheduleUtcOffsetMinutes) {
  const t = Ue(e), r = n.getUTCFullYear(), a = String(n.getUTCMonth() + 1).padStart(2, "0"), o = String(n.getUTCDate()).padStart(2, "0"), s = String(n.getUTCHours()).padStart(2, "0"), i = String(n.getUTCMinutes()).padStart(2, "0"), c = String(n.getUTCSeconds()).padStart(2, "0"), l = String(n.getUTCMilliseconds()).padStart(3, "0"), d = t >= 0 ? "+" : "-", u = Math.abs(t);
  return `${r}-${a}-${o}T${s}:${i}:${c}.${l}${d}${String(Math.floor(u / 60)).padStart(2, "0")}:${String(u % 60).padStart(2, "0")}`;
}
function Oa(n = /* @__PURE__ */ new Date(), e = B.Defaults.ScheduleUtcOffsetMinutes) {
  const t = Ue(e), r = t * 60 * 1e3, a = n instanceof Date ? new Date(n.getTime()) : new Date(n), o = a.getTime() + r, s = new Date(o), i = s.getUTCFullYear(), c = String(s.getUTCMonth() + 1).padStart(2, "0"), l = String(s.getUTCDate()).padStart(2, "0"), d = String(s.getUTCHours()).padStart(2, "0"), u = String(s.getUTCMinutes()).padStart(2, "0"), f = String(s.getUTCSeconds()).padStart(2, "0"), m = String(s.getUTCMilliseconds()).padStart(3, "0"), p = Number(d), h = Number(u);
  return {
    now: a,
    shiftedDate: s,
    utcOffsetMinutes: t,
    offsetLabel: Mo(t),
    dateKey: `${i}-${c}-${l}`,
    clockTime: `${d}:${u}`,
    hour: p,
    minute: h,
    second: Number(f),
    millisecond: Number(m),
    minuteOfDay: p * 60 + h,
    localIso: Eu(s, t)
  };
}
function ps(n = /* @__PURE__ */ new Date(), e = B.Defaults.ScheduleUtcOffsetMinutes) {
  return Oa(n, e).localIso;
}
function ut(n = /* @__PURE__ */ new Date(), e = B.Defaults.ScheduleUtcOffsetMinutes) {
  return Oa(n, e);
}
function dt(n = /* @__PURE__ */ new Date(), e = B.Defaults.ScheduleUtcOffsetMinutes, t = "") {
  const r = Oa(n, e), a = ba(t || r.clockTime, r.clockTime), o = Mr(a), s = Date.UTC(r.shiftedDate.getUTCFullYear(), r.shiftedDate.getUTCMonth(), r.shiftedDate.getUTCDate()) - r.utcOffsetMinutes * 60 * 1e3, i = s + 1440 * 60 * 1e3 - 1, c = s + Math.max(0, o) * 60 * 1e3;
  return {
    ...r,
    normalizedClockTime: a,
    plannedMinuteOfDay: o,
    plannedTs: c,
    plannedSlotKey: `${r.dateKey} ${a}`,
    startTs: s,
    endTs: i
  };
}
function Tu(n = /* @__PURE__ */ new Date(), e = B.Defaults.ScheduleUtcOffsetMinutes) {
  const t = ut(n, e);
  return {
    ...t,
    slotKey: `${t.dateKey} ${t.clockTime}`
  };
}
function Mo(n = B.Defaults.ScheduleUtcOffsetMinutes) {
  const e = Ue(n), t = e >= 0 ? "+" : "-", r = Math.abs(e);
  return `UTC${t}${String(Math.floor(r / 60)).padStart(2, "0")}:${String(r % 60).padStart(2, "0")}`;
}
function Au(n = {}, e = "") {
  const t = n?.fixedQueue && typeof n.fixedQueue == "object" ? n.fixedQueue : {};
  let r = String(t.localDateKey || "").trim(), a = xt(t.executedSlots || [], []);
  if (!r) {
    const o = bu(n?.lastPlannedSlot || "");
    o.dateKey && o.dateKey === e && (r = o.dateKey, a = xt([...a, o.clockTime], []));
  }
  return !e || r !== e ? {
    localDateKey: e,
    executedSlots: []
  } : {
    localDateKey: r,
    executedSlots: a
  };
}
function Ru(n = {}, e = [], t = B.Defaults.ScheduleUtcOffsetMinutes, r = /* @__PURE__ */ new Date()) {
  const a = Oa(r, t), o = xt(e, []), s = Au(n, a.dateKey);
  if (!o.length) return {
    due: !1,
    context: a,
    normalizedClockTimes: o,
    fixedQueue: s,
    dueSlots: [],
    reason: "no_clock_times_configured"
  };
  const i = new Set(xt(s.executedSlots || [], [])), c = o.filter((d) => Mr(d) <= a.minuteOfDay), l = c.filter((d) => !i.has(d));
  return l.length ? {
    due: !0,
    context: a,
    normalizedClockTimes: o,
    fixedQueue: s,
    dueSlots: l,
    reason: "clock_slots_due"
  } : {
    due: !1,
    context: a,
    normalizedClockTimes: o,
    fixedQueue: s,
    dueSlots: [],
    reason: c.length ? "slot_already_processed" : "time_not_matched"
  };
}
function Gt(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "emby" ? "emby" : e === "jellyfin" ? "jellyfin" : e === "passthrough" ? "passthrough" : "auto";
}
function Pr(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "forward" ? "forward" : e === "strip" ? "strip" : e === "disable" || e === "none" ? "disable" : "forward";
}
function xr(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "rewrite" ? "rewrite" : e === "passthrough" ? "passthrough" : "inherit";
}
function ir(n = "") {
  return String(n || "").trim().toLowerCase() === "host_prefix" ? "host_prefix" : "kv_route";
}
function et(n = "") {
  return ir(n) === "host_prefix";
}
function Ni(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "emby" ? "emby" : e === "jellyfin" ? "jellyfin" : e === "passthrough" ? "passthrough" : "auto";
}
function qt(n = "") {
  return String(n || "").trim().toLowerCase() === "rewrite" ? "rewrite" : B.Defaults.DefaultPlaybackInfoMode;
}
function Po(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "strip" ? "strip" : e === "disable" || e === "none" ? "disable" : "forward";
}
function Wr(n) {
  return fe(n, B.Defaults.DnsIpSourceIpLimit, 1, 1e3);
}
function En(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "direct" ? "direct" : e === "proxy" ? "proxy" : "inherit";
}
function Or(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "emos" ? "emos" : e === "tmdb" ? "tmdb" : "auto";
}
function Gr(n = {}) {
  return En(n?.mainVideoStreamMode ?? n?.wangpanDirectMode ?? n?.wangpanMode);
}
function Vr(n = [], e = "") {
  const t = Array.isArray(n) ? n : String(n || "").split(/[,，\r\n]+/), r = [], a = /* @__PURE__ */ new Set();
  for (const o of [...t, e]) {
    const s = String(o || "").trim().slice(0, 24), i = s.toLowerCase();
    if (!(!s || a.has(i)) && (a.add(i), r.push(s), r.length >= 20))
      break;
  }
  return r;
}
var eo = /\b(?:(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)|[0-9a-f:]{2,})\b/gi, Di = {
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
}, gs = Object.freeze((() => {
  const n = {};
  for (const e of Object.values(Di)) {
    const t = String(e?.countryCode || "").trim().toUpperCase(), r = String(e?.countryName || "").trim();
    !t || !r || n[t] || (n[t] = r);
  }
  return n.CN = n.CN || "中国", n.HK = n.HK || "中国香港", n.MO = n.MO || "中国澳门", n.TW = n.TW || "中国台湾", n;
})()), ia = null;
function va(n = "") {
  const e = String(n || "").trim();
  if (!e || !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(e)) return !1;
  const t = e.split(".");
  return t.length === 4 && t.every((r) => {
    const a = Number(r);
    return Number.isInteger(a) && a >= 0 && a <= 255;
  });
}
function Cu(n = "") {
  if (!va(n)) return !1;
  const [e = 0, t = 0] = String(n || "").trim().split(".").map((r) => Number(r));
  return e === 10 || e === 127 || e === 169 && t === 254 || e === 172 && t >= 16 && t <= 31 ? !0 : e === 192 && t === 168;
}
function Tn(n = "") {
  const e = String(n || "").trim();
  if (!e || !e.includes(":") || /\s/.test(e)) return !1;
  try {
    return new URL(`http://[${e}]/`), !0;
  } catch {
    return !1;
  }
}
function Ii(n = "") {
  return String(n || "").trim().toUpperCase() === "IPV6" ? "IPv6" : "IPv4";
}
function Je(n = "") {
  return Tn(n) ? "IPv6" : va(n) ? "IPv4" : "";
}
function xo(n = "", e = {}) {
  const t = String(n || ""), r = /* @__PURE__ */ new Set(), a = [], o = Number(e?.limit), s = Number.isFinite(o) && o > 0 ? Math.max(1, Math.floor(o)) : Number.POSITIVE_INFINITY, i = (l) => {
    const d = String(l || "").trim();
    if (!d) return !1;
    const u = Je(d);
    if (!u) return !1;
    const f = d.toLowerCase();
    return r.has(f) ? !1 : (r.add(f), a.push({
      ip: d,
      ipType: u
    }), a.length >= s);
  };
  eo.lastIndex = 0;
  let c = null;
  for (; (c = eo.exec(t)) !== null && !i(c[0]); ) ;
  return a;
}
function wu(n = null) {
  const e = Array.isArray(n?.Answer) ? n.Answer : [], t = /* @__PURE__ */ new Set(), r = [];
  for (const a of e) {
    const o = String(a?.data || "").trim(), s = Je(o);
    if (!s) continue;
    const i = o.toLowerCase();
    t.has(i) || (t.add(i), r.push({
      ip: o,
      ipType: s
    }));
  }
  return r;
}
function vn(n = "") {
  return String(n || "").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
}
function Lu(n = "") {
  const e = /* @__PURE__ */ new Map(), t = String(n || ""), r = t.match(/\[[0-9a-f:]{2,}\]/gi) || [];
  for (const o of r) {
    const s = String(o || "").replace(/^\[|\]$/g, "").trim();
    Je(s) && e.set(s.toLowerCase(), s);
  }
  const a = t.match(eo) || [];
  for (const o of a) {
    const s = String(o || "").trim();
    Je(s) && e.set(s.toLowerCase(), s);
  }
  return [...e.values()];
}
function Nu(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "联通" ? "联通" : e === "电信" ? "电信" : e === "移动" ? "移动" : e === "多线" ? "多线" : e === "ipv6" ? "ipv6" : "";
}
function hs(n = "", e = "") {
  const t = Nu(e);
  return t ? String(n || "").trim().toLowerCase() === t.toLowerCase() : !0;
}
function Du(n = "", e = "") {
  const t = /* @__PURE__ */ new Map(), r = (s, i = "") => {
    const c = String(s || "").trim(), l = Je(c);
    if (!l || Cu(c)) return;
    const d = c.toLowerCase(), u = jr(i), f = t.get(d);
    if (!f) {
      t.set(d, {
        ip: c,
        ipType: l,
        lineLabel: u
      });
      return;
    }
    !jr(f?.lineLabel) && u && t.set(d, {
      ...f,
      lineLabel: u
    });
  }, a = String(n || ""), o = a.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];
  for (const s of o) {
    const i = s.match(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
    if (i.length < 3) continue;
    const c = vn(String(i[1] || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    if (!hs(c, e)) continue;
    const l = Lu(vn(String(i[2] || "").replace(/<[^>]+>/g, " "))).find((d) => Je(d)) || "";
    l && r(l, c);
  }
  if (!t.size) {
    const s = vn(a.replace(/<[^>]+>/g, `
`)), i = /(?:^|\n)\s*(?:\d+\s+)?(电信|联通|移动|多线|ipv6)\s+((?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-f0-9]{1,4}:){2,}[a-f0-9:]{1,39})/gi;
    let c = null;
    for (; (c = i.exec(s)) !== null; )
      hs(c[1], e) && r(c[2], c[1]);
  }
  return [...t.values()];
}
function Iu(n = "", e = {}) {
  return xo(n, e);
}
function Mu(n = "") {
  const e = String(n || "").trim().toUpperCase(), t = Di[e];
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
function Pu(n = "") {
  const e = String(n || "").trim().toUpperCase();
  if (!e || e === "UNKNOWN") return "未知";
  if (gs[e]) return gs[e];
  try {
    if (ia === null && (ia = typeof Intl?.DisplayNames == "function" ? new Intl.DisplayNames(["zh-CN"], { type: "region" }) : !1), ia && typeof ia.of == "function") {
      const t = String(ia.of(e) || "").trim();
      if (t) return t;
    }
  } catch {
  }
  return e;
}
function Mi(n = "") {
  const e = String(n || "").trim();
  if (!e) return "";
  const t = e.match(/-([A-Za-z]{3,4})$/);
  return t ? String(t[1] || "").trim().toUpperCase() : "";
}
function xu(n = "") {
  return `dns-ip-source-${ie(n || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)}`;
}
function Rt(n = "") {
  return String(n || "").trim().toLowerCase() === "domain" ? "domain" : "url";
}
var Pi = Object.freeze([Object.freeze({
  id: "all",
  label: "麒麟优选",
  sourceType: "url",
  url: "https://api.uouin.com/cloudflare.html"
}), Object.freeze({
  id: "preferred",
  label: "CF-SPEED-DNS优选",
  sourceType: "url",
  url: "https://raw.githubusercontent.com/ZhiXuanWang/cf-speed-dns/refs/heads/main/ipTop10.html"
})]), xi = Object.freeze([
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
]), Ou = Object.freeze([
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
]), vu = Object.freeze([Object.freeze({
  label: "VPS789 优选IP",
  url: "https://vps789.com/cfip/"
}), Object.freeze({
  label: "Wetest IPv4 优选",
  url: "https://www.wetest.vip/page/cloudflare/address_v4.html"
})]);
function Fu(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "builtin" ? "builtin" : e === "preset" ? "preset" : "custom";
}
function Oi(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "preferred" ? "preferred" : e === "all" ? "all" : "";
}
function Uu(n = "") {
  return String(n || "").trim().toLowerCase().replace(/[^a-z0-9_:-]+/g, "_");
}
function ku(n = "") {
  const e = Oi(n);
  return Pi.find((t) => t.id === e) || null;
}
function Hu(n = "") {
  const e = Uu(n);
  return e && xi.find((t) => t.id === e) || null;
}
function Tr() {
  return {
    builtInSourceOptions: Pi.map((n) => ({
      id: n.id,
      label: n.label,
      sourceType: n.sourceType,
      value: "domain" in n ? n.domain : n.url
    })),
    presetList: xi.map((n) => ({
      id: n.id,
      label: n.label,
      sourceType: n.sourceType,
      value: "domain" in n ? n.domain : n.url
    })),
    preferredDomainLinks: Ou.map((n) => ({ ...n })),
    preferredIpLinks: vu.map((n) => ({ ...n }))
  };
}
function jr(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e.includes("联通") ? "联通" : e.includes("电信") ? "电信" : e.includes("移动") ? "移动" : e.includes("多线") ? "多线" : e.includes("ipv6") ? "ipv6" : "";
}
function vi(n = {}) {
  const e = Fu(n?.sourceKind || n?.source_kind || ""), t = e === "builtin" ? ku(n?.builtinId || n?.builtin_id || n?.presetId || n?.preset_id || n?.name) : null, r = e === "preset" ? Hu(n?.presetId || n?.preset_id || n?.builtinId || n?.builtin_id || n?.name) : null, a = t || r || null, o = Rt(a?.sourceType || n?.sourceType || n?.source_type || ""), s = a && "url" in a ? a.url : "", i = a && "domain" in a ? a.domain : "", c = String(s || n?.url || "").trim(), l = oe(i || n?.domain || ""), d = String(n?.name || a?.label || "").trim();
  return {
    sourceKind: e,
    builtinId: t?.id || "",
    presetId: r?.id || "",
    name: d,
    sourceType: o,
    url: c,
    domain: l,
    resolvedLabel: String(a?.label || "").trim()
  };
}
function Fi(n = {}) {
  const e = vi(n);
  return Rt(e.sourceType) === "domain" ? oe(e.domain || "") : String(e.url || "").trim();
}
function cr(n = {}) {
  return !!Fi(n);
}
function gr(n = {}, e = {}) {
  const t = String(n?.ip || n?.content || "").trim(), r = Je(t);
  if (!t || !r) return null;
  const a = String(e.updatedAt || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()), o = String(n?.sourceKind || n?.source_kind || e.sourceKind || "manual").trim().toLowerCase() || "manual", s = String(n?.sourceLabel || n?.source_label || e.sourceLabel || "").trim(), i = jr(n?.lineLabel || n?.line_label || e.lineLabel || ""), c = String(n?.remark || "").trim();
  return {
    id: String(n?.id || `dns-ip-${ie(t.toLowerCase())}`),
    ip: t,
    ipType: r,
    sourceKind: o,
    sourceLabel: s,
    lineLabel: i,
    remark: c,
    createdAt: String(n?.createdAt || n?.created_at || e.createdAt || a),
    updatedAt: a
  };
}
function Ot(n = {}, e = 0) {
  const t = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), r = vi(n), a = r.sourceKind, o = Rt(r.sourceType), s = String(r.builtinId || n?.builtinId || n?.builtin_id || "").trim(), i = String(r.presetId || n?.presetId || n?.preset_id || "").trim(), c = String(r.resolvedLabel || "").trim(), l = String(r.url || "").trim(), d = oe(r.domain || ""), u = o === "domain" ? d : l, f = String(n?.name || c || "").trim(), m = n?.enabled, p = m == null ? !0 : !(m === !1 || m === 0 || String(m).trim() === "0");
  return {
    id: String(n?.id || xu(`${a}|${s}|${i}|${o}|${u}|${e}`)),
    name: f || c || `抓取源 ${Number(e) + 1}`,
    url: l,
    domain: d,
    sourceType: o,
    sourceKind: a,
    presetId: i,
    builtinId: s,
    enabled: p,
    sortOrder: Math.max(0, Number.parseInt(String(n?.sortOrder ?? n?.sort_order ?? e), 10) || 0),
    ipLimit: Wr(n?.ipLimit ?? n?.ip_limit),
    lastFetchAt: String(n?.lastFetchAt || n?.last_fetch_at || ""),
    lastFetchStatus: String(n?.lastFetchStatus || n?.last_fetch_status || ""),
    lastFetchCount: Math.max(0, Number(n?.lastFetchCount ?? n?.last_fetch_count) || 0),
    createdAt: String(n?.createdAt || n?.created_at || t),
    updatedAt: String(n?.updatedAt || n?.updated_at || t)
  };
}
function hr(n = []) {
  const e = [], t = /* @__PURE__ */ new Map();
  for (const r of Array.isArray(n) ? n : []) {
    const a = gr(r);
    if (!a) continue;
    const o = String(a.ip || "").trim().toLowerCase();
    if (!o) continue;
    const s = t.get(o);
    if (s === void 0) {
      t.set(o, e.length), e.push(a);
      continue;
    }
    const i = e[s];
    i && !jr(i.lineLabel) && jr(a.lineLabel) && (e[s] = {
      ...i,
      lineLabel: a.lineLabel
    });
  }
  return e;
}
function $u(n = {}) {
  const e = gr(n);
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
function Oo(n = []) {
  return hr(n).map((e) => $u(e)).filter(Boolean);
}
function An(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "success" ? "success" : e === "failed" ? "failed" : "empty";
}
function Ui(n = {}, e = {}) {
  const t = Ot(e), r = hr(n?.items || []).slice(0, Wr(t?.ipLimit)), a = An(n?.status || (r.length ? "success" : "empty"));
  return {
    id: String(n?.id || t?.id || ""),
    name: String(n?.name || t?.name || ""),
    sourceType: Rt(n?.sourceType || t?.sourceType || ""),
    status: a,
    count: Math.max(0, Number(n?.count) || r.length),
    items: r,
    error: a === "failed" ? String(n?.error || "") : "",
    lastFetchAt: String(n?.lastFetchAt || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString())
  };
}
function ki(n = []) {
  return (Array.isArray(n) ? n : []).map((e) => {
    const t = Ui(e, e), r = Oo(t?.items || []);
    return {
      id: String(t?.id || ""),
      name: String(t?.name || ""),
      sourceType: Rt(t?.sourceType || ""),
      status: An(t?.status),
      count: Math.max(0, Number(t?.count) || r.length),
      items: r,
      error: String(t?.error || ""),
      lastFetchAt: String(t?.lastFetchAt || "")
    };
  });
}
function Bu(n = []) {
  const e = Array.isArray(n) ? n : [];
  return e.length ? e.some((t) => An(t?.status) !== "failed") : !0;
}
function en(n) {
  const e = Number(n) || 0;
  return !Number.isFinite(e) || e <= 0 ? "" : new Date(e).toISOString();
}
function Va(n = [], e = B.Defaults.DnsIpSourceFetchMaxBytes) {
  return ie(ae({
    maxBytes: fe(e, B.Defaults.DnsIpSourceFetchMaxBytes, 1024, 8 * 1024 * 1024),
    enabledSources: (Array.isArray(n) ? n : []).map((t, r) => Ot(t, r)).filter((t) => t.enabled === !0 && cr(t)).map((t) => ({
      id: String(t.id || ""),
      name: String(t.name || ""),
      sourceType: Rt(t.sourceType),
      target: Fi(t),
      ipLimit: Wr(t.ipLimit),
      enabled: t.enabled !== !1
    }))
  }));
}
function Ku(n = "") {
  return String(n || "").trim().toLowerCase() === "shared_snapshot" ? "shared_snapshot" : "local_pool";
}
function Hi(n = []) {
  const e = [], t = /* @__PURE__ */ new Set();
  for (const r of Array.isArray(n) ? n : []) {
    const a = String(r?.ip || r || "").trim();
    if (!Je(a)) continue;
    const o = a.toLowerCase();
    t.has(o) || (t.add(o), e.push(a));
  }
  return {
    normalizedIps: e,
    deleteKeySet: t
  };
}
function ys(n = [], e = /* @__PURE__ */ new Set()) {
  const t = [], r = [];
  for (const a of hr(n)) {
    const o = String(a?.ip || "").trim();
    if (o) {
      if (e.has(o.toLowerCase())) {
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
function zu(n = {}, e = []) {
  const { deleteKeySet: t } = Hi(e), r = hr(n?.items || []), a = Array.isArray(n?.sourceResults) ? n.sourceResults : [];
  if (!t.size) return {
    deletedCount: 0,
    deletedIps: [],
    items: r,
    sourceResults: a
  };
  const { keptItems: o, removedItems: s } = ys(r, t), i = new Set(s.map((l) => String(l?.ip || "").trim().toLowerCase()).filter(Boolean)), c = a.map((l) => {
    const { keptItems: d } = ys(l?.items || [], i), u = An(l?.status) === "failed" ? "failed" : d.length ? "success" : "empty";
    return {
      id: String(l?.id || ""),
      name: String(l?.name || ""),
      sourceType: Rt(l?.sourceType || l?.source_type || ""),
      status: u,
      count: d.length,
      items: d,
      error: u === "failed" ? String(l?.error || "") : "",
      lastFetchAt: String(l?.lastFetchAt || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString())
    };
  });
  return {
    deletedCount: s.length,
    deletedIps: s.map((l) => String(l?.ip || "").trim()).filter(Boolean),
    items: o,
    sourceResults: c
  };
}
function ja(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "ok" ? "ok" : e === "pending" ? "pending" : e === "cf_header_missing" ? "cf_header_missing" : e === "non_cloudflare" ? "non_cloudflare" : e === "timeout" ? "timeout" : "network_error";
}
function Fn(n = []) {
  const e = Array.isArray(n) ? n : [], t = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
  let a = 0, o = 0;
  for (const s of e) {
    Ii(s?.ipType || s?.ip_type || s?.type || "") === "IPv6" ? o += 1 : a += 1;
    const i = String(s?.countryCode || s?.country_code || "").trim().toUpperCase(), c = String(s?.coloCode || s?.colo_code || "").trim().toUpperCase();
    i && t.add(i), c && r.add(c);
  }
  return {
    ipCount: e.length,
    ipv4Count: a,
    ipv6Count: o,
    countryCount: t.size,
    coloCount: r.size
  };
}
function Wu(n = [], e = []) {
  const t = Array.isArray(n) ? n : [], r = Array.isArray(e) ? e : [];
  return {
    currentHost: Fn(t),
    sharedPool: Fn(r),
    combined: Fn([...t, ...r])
  };
}
function Gu(n = "") {
  const e = String(n || "").trim().toLowerCase();
  if (!e) return "";
  const t = e.endsWith(".") ? e.slice(0, -1) : e;
  return !t || t.length > 253 || t.endsWith(".") || /\s|[:/@*?#\\]/.test(t) || va(t) || Tn(t) || t.split(".").some((r) => !Fa(r)) ? "" : t;
}
function Ge(n) {
  return Gu(n?.HOST);
}
function qr(n) {
  return oe(n?.LEGACY_HOST);
}
function Vu(n) {
  const e = Ge(n), t = qr(n), r = vo(t, e);
  return r?.prefix ? {
    name: String(r.prefix || "").trim().toLowerCase(),
    reservedBy: t,
    reason: "legacy_host",
    legacyHost: t,
    host: e
  } : null;
}
function Ea(n, e) {
  const t = oe(n), r = oe(e);
  return !t || !r ? !1 : t === r || t.endsWith(`.${r}`);
}
function Fa(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return !e || e.length > 63 ? !1 : /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(e);
}
function Xt(n = "") {
  const e = String(n || "").trim().toLowerCase().replace(/\.+$/, "");
  return !e || e.length > 253 || /\s|[:/@*]/.test(e) || va(e) || Tn(e) || e.split(".").some((t) => !Fa(t)) ? "" : e;
}
function $i(n = "") {
  const e = String(n || "").trim();
  return !e || Xt(e) ? "" : "CNAME 指向必须是合法主机名，不能包含协议、端口、路径、通配符、空格或 IP 地址";
}
function ju(n = "", e = "defaultHostPrefixCnameTarget") {
  const t = $i(n);
  if (t)
    throw Ie("HOST_PREFIX_CNAME_TARGET_INVALID", t, 400, {
      field: e,
      value: String(n || "").trim()
    });
}
function tn(n = null, e = {}, t = "") {
  return Xt(n?.hostPrefixCnameTarget) || Xt(e?.defaultHostPrefixCnameTarget) || oe(t);
}
function vo(n = "", e = "") {
  const t = oe(n), r = oe(e);
  if (!t || !r || t === r) return null;
  const a = `.${r}`;
  if (!t.endsWith(a)) return null;
  const o = t.slice(0, -a.length);
  return !o || o.includes(".") || !Fa(o) ? null : {
    hostname: t,
    host: r,
    prefix: o
  };
}
function Bi(n) {
  const e = String(n || "").trim();
  if (!e) return null;
  const t = e.indexOf("/"), r = t === -1 ? e : e.slice(0, t), a = t === -1 ? "" : e.slice(t), o = Co(r);
  return o ? {
    ...o,
    path: a,
    pattern: e
  } : null;
}
function Fo(n, e = {}) {
  const t = String(e.path || "");
  let r = 0;
  return e.wildcard || (r += 100), n.includes(".workers.dev") && (r -= 20), t === "/" || t === "/*" ? r += 20 : t.endsWith("*") ? r += 10 : t && (r += 4), r += n.split(".").length * 4, r -= Math.min(t.length, 30), r;
}
var qu = "https://admin-local-index.invalid", Xu = "local-", Yu = "sys:admin_index_upload:v1:", Ju = "sys:admin_index_active:v2";
function vr(n = "") {
  const e = String(n || "").trim();
  if (!e) return "";
  try {
    const t = new URL(e);
    return ["http:", "https:"].includes(t.protocol) ? t.toString() : "";
  } catch {
    return "";
  }
}
function Qu(n = "") {
  const e = String(n || "").trim();
  return !(!e || /[\x00-\x20~^:?*[\\\]]/.test(e) || e.includes("..") || e.includes("@{") || e.includes("//") || e.startsWith("/") || e.endsWith("/") || e.endsWith(".") || e.endsWith(".lock"));
}
function yt(n = "") {
  const e = String(n || "").trim();
  return Qu(e) ? e : "";
}
function Mt(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(e) ? e : "";
}
function Xr(n = "") {
  const e = Mt(n);
  return e ? `${qu}/${e}/index.html` : "";
}
function tt(n = "") {
  const e = vr(n);
  if (!e) return "";
  try {
    const t = new URL(e);
    return t.origin !== "https://admin-local-index.invalid" || t.search || t.hash ? "" : Mt(t.pathname.match(/^\/([a-f0-9]{64})\/index\.html$/i)?.[1] || "");
  } catch {
    return "";
  }
}
function Uo(n = "") {
  const e = Mt(n);
  return e ? `${Xu}${e}` : "";
}
function Zu(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e.startsWith("local-") ? Mt(e.slice(6)) : "";
}
function St(n = null, e = {}) {
  const t = vr((k(e) ? e : {}).indexUrl), r = tt(t), a = !!r, o = a ? Xr(r) : "";
  return {
    effectiveRef: r,
    effectiveRefType: a ? "local_upload" : "",
    configIndexUrl: t,
    envIndexUrl: "",
    indexUrl: o,
    persistedIndexUrl: o,
    indexUrlSource: a ? "local_upload" : "unset",
    isLocalUpload: a,
    localUploadRevision: r,
    assetRevision: a ? Uo(r) : "",
    hasGithubRelease: !1,
    hasLocalUpload: a,
    hasDerivedIndexUrl: !1,
    gateState: o ? "shell_ready" : "setup_required"
  };
}
function ed(n = {}) {
  const e = String(k(n) && n.indexUrl || "").trim();
  if (!(!e || tt(e)))
    throw Ie("ADMIN_INDEX_SOURCE_UPLOAD_ONLY", "管理台 HTML 仅支持本地上传，请通过启动门或 Worker 和 HTML 更新面板提交 index.html", 400, { field: "indexUrl" });
}
function Ki(n = {}, e = null) {
  const t = String(e?.HOST || "").trim(), r = Ge(e), a = String(n?.cfZoneId || "").trim(), o = String(n?.cfApiToken || "").trim(), s = [], i = [];
  return t ? r || i.push("HOST") : s.push("HOST"), a || s.push("cfZoneId"), o || s.push("cfApiToken"), {
    host: r,
    cfZoneId: a,
    cfApiToken: o,
    missingFields: s,
    invalidFields: i
  };
}
function zi(n = {}) {
  if (!(!Array.isArray(n?.invalidFields) || !n.invalidFields.includes("HOST")))
    throw Ie("HOST_PREFIX_HOST_INVALID", "HOST 必须是合法 DNS 主机名，不能包含协议、用户信息、端口、路径、通配符、下划线、空标签或 IP 地址", 400, {
      field: "HOST",
      reason: "invalid_hostname"
    });
}
function td(n = {}, e = null) {
  if (n?.enableHostPrefixProxy !== !0) return;
  const t = Ki(n, e);
  if (zi(t), !(t.missingFields.length <= 0))
    throw Ie("HOST_PREFIX_PROXY_CONFIG_REQUIRED", "启用域名前缀代理前，必须先配置 HOST、Cloudflare Zone ID 和 API 令牌", 400, {
      missingFields: t.missingFields,
      host: t.host
    });
}
function pa(n = {}, e = null) {
  const t = Ki(n, e);
  if (zi(t), t.missingFields.length <= 0) return t;
  throw Ie("HOST_PREFIX_DNS_CONFIG_REQUIRED", "保存域名前缀节点前，必须先配置 HOST、Cloudflare Zone ID 和 API 令牌", 400, {
    missingFields: t.missingFields,
    host: t.host
  });
}
function Un(n = [], e = {}, t = null) {
  return (Array.isArray(n) ? n : [n]).some((r) => et(r?.nextNode?.entryMode)) ? pa(e, t) : null;
}
var rd = We.PingTimeoutMs, ad = We.UpstreamTimeoutMs, to = We.UpstreamRetryAttempts, Wi = We.HedgeProbePath, Ss = "/emby/system/info/public", nd = "/emby/system/ping", od = "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7", ro = "Hills/1.10.0 (android; 16)";
function sd(n = "") {
  return String(n || "").trim() || ro;
}
function ko(n = "") {
  return {
    Accept: "*/*",
    "Accept-Language": od,
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    "User-Agent": sd(n)
  };
}
var id = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36", Ho = We.HedgeProbeTimeoutMs, Gi = We.HedgeProbeParallelism, Vi = We.HedgeWaitTimeoutMs, ji = We.HedgeLockTtlMs, da = We.HedgePreferredTtlSec, qi = We.HedgeFailureCooldownSec, Xi = We.HedgeWakeJitterMs, Yi = We.BufferedRetryBodyMaxBytes, cd = We.MetadataPrewarmTimeoutMs, ld = We.PrewarmCacheTtl, ud = vt.PlaybackInfoCacheTtlSec, $o = vt.PlaybackInfoCacheEntryMaxBytes, dd = vt.PlaybackInfoCacheTotalMaxBytes, Ji = vt.VideoProgressForwardIntervalSec, fd = vt.VideoProgressSnapshotMaxBytes, Qi = vt.CacheTtlImagesDays, md = vt.PlaybackRouteHotCacheTtlMs, lr = vt.PlaybackRouteHotCacheMax, Zi = 12 * 1024 * 1024, pd = Zi - 64 * 1024, gd = 2e6, Yt = 19e5, _s = 50, ec = 512 * 1024, hd = 4, Bo = 8 * 1024 * 1024, kn = 256 * 1024, ao = 32, bs = 64, Es = 64 * 1024, Ts = 128, As = 8 * 1024, Ar = 4 * 1024, yd = Object.freeze([
  "displayName",
  "remark",
  "tag",
  "tagColor",
  "remarkColor",
  "secret",
  "hostPrefixCnameTarget",
  "hedgeProbePath"
]), Rs = 500, Ka = 1e4, Fr = 25e3, za = 1e4, Sd = 1e4, Hn = 1e4, _d = 600 * 1e3, bd = 120 * 1e3, it = 2, Wa = 2;
function $n(n = "") {
  const e = String(n || "").trim().toUpperCase();
  return e.includes("INT") ? "INTEGER" : e.includes("CHAR") || e.includes("CLOB") || e.includes("TEXT") ? "TEXT" : e.includes("REAL") || e.includes("FLOA") || e.includes("DOUB") ? "REAL" : !e || e.includes("BLOB") ? "BLOB" : "NUMERIC";
}
var Yr = /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i, Ed = /\.(?:js|css|woff2?|ttf|otf|map|webmanifest)$/i, yr = /\.(?:srt|ass|vtt|sub)$/i, Jr = /(?:\/Images\/|\/Icons\/|\/Branding\/|\/emby\/covers\/)/i, At = /\.(?:m3u8|mpd)$/i, tc = /\.(?:ts|m4s)$/i, Td = /\.(?:mp4|m4v|m4a|ogv|webm|mkv|mov|avi|wmv|flv)$/i, Ta = /* @__PURE__ */ new Set([
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
]), Ad = /* @__PURE__ */ new Set([
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
]), Rd = /* @__PURE__ */ new Set([
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
]), Ko = "legacy_proxy_ctx", Cd = 86400, Aa = [Ko, "emby_web_bypass"], wd = /* @__PURE__ */ new Set([
  "users",
  "items",
  "videos",
  "audio",
  "livetv",
  "sessions",
  "system"
]);
function aa(n, e, t = null) {
  const r = e.headers.get("Origin"), a = e.headers.get("Access-Control-Request-Headers") || ma["Access-Control-Allow-Headers"];
  return {
    "Access-Control-Allow-Origin": t || r || ma["Access-Control-Allow-Origin"],
    "Access-Control-Allow-Methods": ma["Access-Control-Allow-Methods"],
    "Access-Control-Allow-Headers": a,
    "Access-Control-Expose-Headers": "Content-Length, Content-Range",
    "Access-Control-Max-Age": "86400"
  };
}
function at(n = "") {
  if (!n) return "";
  try {
    return decodeURIComponent(n);
  } catch {
    return n;
  }
}
function Z(n) {
  let e = typeof n == "string" ? n : "/";
  return e ? (e.startsWith("/") || (e = "/" + e), e = e.replace(/^\/+/, "/"), e) : "/";
}
function Ra(n = "") {
  let e = Z(n);
  for (let a = 0; a < 4 && e.includes("%"); a += 1) {
    const o = e.replace(/%([0-9a-f]{2})/gi, (s, i) => {
      const c = Number.parseInt(i, 16);
      return c <= 127 ? String.fromCharCode(c) : s;
    });
    if (o === e) break;
    e = o;
  }
  const t = [];
  for (const a of e.replace(/\\/g, "/").toLowerCase().split("/"))
    !a || a === "." || (a === ".." ? t.pop() : t.push(a));
  const r = `/${t.join("/")}`;
  return r === "/web" || r.startsWith("/web/");
}
function Qr(n = "") {
  const e = String(n || ""), t = new TextEncoder().encode(e);
  let r = "";
  for (const a of t) r += String.fromCharCode(a);
  return btoa(r).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function Jt(n = "") {
  const e = String(n || "").trim().replace(/-/g, "+").replace(/_/g, "/");
  if (!e) return "";
  const t = e.length % 4, r = e + (t ? "=".repeat(4 - t) : ""), a = atob(r), o = Uint8Array.from(a, (s) => s.charCodeAt(0));
  return new TextDecoder().decode(o);
}
function rc(n) {
  const e = "/admin", t = String(n || "").trim();
  if (!t) return e;
  let r = Z(t);
  return r = r.replace(/\/{2,}/g, "/"), r.length > 1 && (r = r.replace(/\/+$/, "")), !r || r === "/" || r.toLowerCase().startsWith("/api") ? e : r;
}
function ac(n, e) {
  const t = Z(n || "/"), r = Z(e || "/");
  return t === r || t.startsWith(r + "/");
}
function Lr(n, e) {
  const t = Z(n || "/"), r = Z(e || "/");
  return !r || r === "/" ? t === r : t === r || t === `${r}/`;
}
function ft(n) {
  return rc(n?.ADMIN_PATH);
}
function Rn(n = "/admin") {
  const e = rc(n);
  return e === "/" ? "/login" : `${e}/login`;
}
function zo(n) {
  return Rn(ft(n));
}
function Ld(n) {
  const e = ft(n), t = Z(e).toLowerCase(), r = [], a = t.split("/").filter(Boolean).map((o) => at(o).toLowerCase());
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
function Nd(n, e) {
  const t = String(n || "").trim().toLowerCase();
  return t && Ld(e).find((r) => r.name === t) || null;
}
function nc(n = {}) {
  return String(n?.name || "").trim() ? String(n?.target || "").trim() ? !0 : Array.isArray(n?.lines) && n.lines.length > 0 : !1;
}
function Cs(n, e) {
  const t = Array.isArray(n) ? n : [n];
  for (const r of t) {
    if (!nc(r) || et(r?.entryMode)) continue;
    const a = Nd(r?.name, e);
    if (a)
      return {
        ...a,
        name: String(r?.name || "").trim().toLowerCase()
      };
  }
  return null;
}
function Dd(n = {}, e = null) {
  if (!et(n?.entryMode)) return null;
  const t = String(n?.name || "").trim().toLowerCase();
  if (!t) return {
    code: "HOST_PREFIX_REQUIRED",
    message: "域名前缀不能为空",
    name: t
  };
  if (!Fa(t)) return {
    code: "HOST_PREFIX_INVALID",
    message: "域名前缀仅支持小写字母、数字、连字符，且不能以下划线、点或连字符结尾",
    name: t
  };
  const r = Vu(e);
  if (r && r.name === t) return {
    code: "HOST_PREFIX_RESERVED_BY_LEGACY_HOST",
    message: "该域名前缀已被旧部署子域兼容入口保留，请更换后重试",
    name: t,
    reservedBy: r.reservedBy,
    reason: r.reason,
    legacyHost: r.legacyHost,
    host: r.host
  };
  const a = $i(n?.hostPrefixCnameTarget);
  return a ? {
    code: "HOST_PREFIX_CNAME_TARGET_INVALID",
    message: a,
    field: "hostPrefixCnameTarget",
    value: String(n?.hostPrefixCnameTarget || "").trim(),
    name: t
  } : null;
}
function ws(n, e = null) {
  const t = Array.isArray(n) ? n : [n];
  for (const r of t) {
    if (!nc(r)) continue;
    const a = Dd(r, e);
    if (a) return a;
  }
  return null;
}
function Id(n) {
  const e = ft(n);
  return e === "/" ? "/" : e;
}
function Ce(n) {
  return String(n ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Zr(n) {
  return JSON.stringify(n).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
function Ke(n, e = null) {
  const t = [];
  n?.JWT_SECRET || t.push("JWT_SECRET"), n?.ADMIN_PASS || t.push("ADMIN_PASS");
  const r = typeof e?.adminPath == "string" ? e.adminPath : ft(n), a = typeof e?.loginPath == "string" ? e.loginPath : Rn(r);
  return {
    ok: t.length === 0,
    missing: t,
    adminPath: r,
    loginPath: a,
    message: t.length ? `系统未初始化：缺少 ${t.join("、")}。` : "系统初始化检查通过。"
  };
}
function oc(n, e = null) {
  const t = Ke(n, e);
  if (t.ok) return t;
  const r = t.missing.join("|") || "unknown";
  return Ve.InitCheckWarnedFingerprints.has(r) || (Ve.InitCheckWarnedFingerprints.size >= 32 && Ve.InitCheckWarnedFingerprints.clear(), Ve.InitCheckWarnedFingerprints.add(r), console.warn(`[Init Check] ${t.message} 管理入口: ${t.adminPath}`)), t;
}
function no(n) {
  if (!n || n.ok) return "";
  const e = Array.isArray(n.missing) && n.missing.length ? n.missing.map((t) => `<code class="rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">${Ce(t)}</code>`).join(" ") : '<code class="rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">UNKNOWN</code>';
  return `<div id="init-health-banner" class="mx-4 mt-4 rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-900 shadow-sm"><div class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between"><div class="font-semibold">系统未初始化</div><div class="text-xs text-amber-700">管理入口：${Ce(n.adminPath || "/admin")}</div></div><p class="mt-2 leading-6">检测到关键环境变量缺失：${e}</p><p class="mt-1 text-xs leading-5 text-amber-700">请先在 Cloudflare Worker 环境变量中补齐后再使用管理台登录与敏感操作。</p></div>`;
}
function fa(n) {
  return String(n?.cf?.colo || "").trim().toUpperCase() || "UNKNOWN";
}
function rn(n) {
  return Mi(String(n?.headers?.get?.("CF-RAY") || n?.headers?.get?.("cf-ray") || "").trim());
}
function Md(n) {
  return String(n?.cf?.country || "").trim().toUpperCase() || "UNKNOWN";
}
function Pd(n) {
  const e = Md(n);
  return {
    countryCode: e,
    countryName: Pu(e)
  };
}
function xd(n = {}, e = {}) {
  const { statusPort: t } = n, r = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><link rel="icon" href="/favicon.ico" sizes="any"><title>Emby Proxy Admin Shell</title><script id="admin-bootstrap" type="application/json">__ADMIN_BOOTSTRAP_JSON__<\/script><style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at top,#0f172a 0,#020617 44%,#020617 100%);color:#e2e8f0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:inherit;text-decoration:none}.admin-fallback-shell{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 18px}.admin-fallback-card{width:min(100%,980px);border:1px solid rgba(51,65,85,.92);border-radius:30px;background:rgba(15,23,42,.94);box-shadow:0 32px 96px rgba(2,6,23,.52);padding:28px;backdrop-filter:blur(20px)}.admin-fallback-pill{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:8px 14px;background:rgba(59,130,246,.12);border:1px solid rgba(96,165,250,.32);color:#bfdbfe;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}.admin-fallback-title{margin:20px 0 0;font-size:clamp(1.9rem,4vw,3rem);line-height:1.08;color:#fff}.admin-fallback-copy{margin:14px 0 0;max-width:54rem;color:#cbd5e1;font-size:15px;line-height:1.8}.admin-fallback-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:24px}.admin-fallback-stat{border:1px solid rgba(51,65,85,.9);border-radius:22px;background:rgba(2,6,23,.48);padding:16px}.admin-fallback-k{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b}.admin-fallback-v{margin-top:10px;font-size:15px;line-height:1.7;color:#f8fafc;word-break:break-word}.admin-fallback-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}.admin-fallback-btn{display:inline-flex;align-items:center;justify-content:center;border-radius:16px;padding:12px 18px;font-size:14px;font-weight:700;transition:transform .18s ease,background-color .18s ease,border-color .18s ease}.admin-fallback-btn:hover{transform:translateY(-1px)}.admin-fallback-btn-primary{background:#2563eb;color:#fff;border:1px solid rgba(147,197,253,.7);box-shadow:0 12px 28px rgba(37,99,235,.24)}.admin-fallback-btn-primary:hover{background:#1d4ed8;border-color:#93c5fd}.admin-fallback-btn-secondary{background:rgba(15,23,42,.5);color:#e2e8f0;border:1px solid rgba(51,65,85,.95)}.admin-fallback-btn-secondary:hover{background:rgba(30,41,59,.85)}.admin-fallback-panel{margin-top:24px;border:1px solid rgba(51,65,85,.9);border-radius:24px;background:rgba(2,6,23,.4);padding:20px}.admin-fallback-panel h2{margin:0;font-size:15px;color:#fff}.admin-fallback-panel p{margin:10px 0 0;font-size:14px;line-height:1.7;color:#cbd5e1}.admin-fallback-panel details{margin-top:16px}.admin-fallback-panel summary{cursor:pointer;color:#93c5fd;font-weight:700}.admin-fallback-panel pre{overflow:auto;margin:12px 0 0;padding:14px;border-radius:18px;background:#020617;color:#cbd5e1;font-size:12px;line-height:1.6}.admin-fallback-note{margin-top:16px;color:#94a3b8;font-size:13px;line-height:1.7}@media (max-width:640px){.admin-fallback-shell{padding:18px 12px}.admin-fallback-card,.admin-fallback-stat,.admin-fallback-panel{border-radius:22px}.admin-fallback-card{padding:22px}.admin-fallback-actions{flex-direction:column}.admin-fallback-btn{width:100%}}</style></head><body><main class="admin-fallback-shell"><section class="admin-fallback-card"><div class="admin-fallback-pill">Admin Shell</div><h1 class="admin-fallback-title">管理台壳层正在处理中</h1><p class="admin-fallback-copy">Worker 继续负责管理台壳、登录与统一后台 API；页面主体会根据当前状态注入设置页、远端壳或错误态内容。</p>__INIT_HEALTH_BANNER____ADMIN_APP_ROOT__</section></main></body></html>';
  let a = -1;
  const o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
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
    return De(G), new Response(K === "HEAD" ? null : o, { headers: G });
  }
  const c = Object.freeze([
    "__ADMIN_BOOTSTRAP_JSON__",
    "__INIT_HEALTH_BANNER__",
    "__ADMIN_APP_ROOT__"
  ]), l = "embedded-fallback-v1", d = m(r), u = "minimal-split-parts", f = !0;
  function m(K = "") {
    const G = String(K || ""), Y = [];
    let W = 0;
    for (const re of c) {
      const le = G.indexOf(re, W);
      if (le < 0) throw new Error(`missing admin html placeholder: ${re}`);
      Y.push(G.slice(W, le)), W = le + re.length;
    }
    return Y.push(G.slice(W)), Y;
  }
  function p(K = [], G = {}) {
    let Y = String(K[0] || "");
    for (let W = 0; W < c.length; W += 1) {
      const re = c[W];
      Y += String(G[re] || ""), Y += String(K[W + 1] || "");
    }
    return Y;
  }
  const h = "__ADMIN_BOOTSTRAP_JSON__", g = "__INIT_HEALTH_BANNER__", y = "__ADMIN_APP_ROOT__", _ = "", S = "https://admin-shell-cache.invalid", T = "private, no-store, max-age=0", b = "public, max-age=31536000, immutable", A = 300 * 1e3, C = 2 * 1024 * 1024, N = "bootstrap-tailwind-assets-v3-active-index", P = "X-Admin-Shell-Cached-At", E = "X-Admin-Shell-Source-Etag", w = "X-Admin-Shell-Source-Last-Modified", R = "X-Admin-Shell-Source-Hash", D = "__release", x = "vendor", L = "__warm", F = "https://admin-release-vendor-cache.invalid", I = "https://admin-release-vendor-manifest.invalid", U = "public, max-age=31536000, immutable", V = "no-store, max-age=0", X = 8 * 1024 * 1024, v = 3, O = "X-Admin-Release-Vendor-Cached-At", M = "X-Admin-Release-Vendor-Source-Hash", H = Object.freeze([
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
      primaryViews: [...H],
      settings: {
        visualSections: [...j],
        saveGroups: [...q]
      }
    };
  }
  function Q(K, G = Ke(K), Y = {}) {
    return {
      adminPath: ft(K),
      loginPath: zo(K),
      initHealth: G,
      adminUiSkin: Lc(Y?.adminUiSkin),
      hostDomain: Ge(K),
      contract: J(),
      shell: ke(K, G, Y)
    };
  }
  function se() {
    if (a >= 0) return a;
    if (!Array.isArray(d) || d.length !== c.length + 1)
      return a = 0, 0;
    const K = new TextEncoder();
    let G = 0;
    for (let Y = 0; Y < d.length; Y += 1)
      G += K.encode(String(d[Y] || "")).length, Y < c.length && (G += K.encode(c[Y]).length);
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
  function Ae(K = !1, G = "") {
    return K ? String(G || "").trim() === "embedded_fallback" ? "active" : "retained" : "missing";
  }
  function ke(K, G = Ke(K), Y = {}) {
    const W = St(K, Y), re = W.indexUrl, le = se(), he = !!re, Ze = !!(K?.ASSETS && typeof K.ASSETS.fetch == "function"), gt = !he && Ze ? "shell_ready" : W.gateState, je = le > 0;
    let Nt = "";
    if (re) try {
      Nt = new URL(re).origin;
    } catch {
      Nt = "";
    }
    return {
      mode: he ? "remote-preferred" : Ze ? "embedded" : "setup_required",
      lifecycleState: pe(he, gt),
      embeddedFallbackState: je ? "retained" : "missing",
      retirementState: _e(je),
      gateState: gt,
      indexUrl: W.indexUrl,
      indexUrlSource: W.indexUrlSource,
      effectiveRef: W.effectiveRef,
      remoteShellConfigured: he,
      remoteShellIndexUrl: re,
      remoteShellOrigin: Nt,
      bundledShellAvailable: Ze,
      bundledShellSource: Ze ? "frontend/dist/index.html" : "",
      initHealthOk: G?.ok === !0,
      embeddedFallbackAvailable: je,
      embeddedTemplateSource: u,
      embeddedTemplateMode: u,
      embeddedTemplateBytes: le,
      finalUiHtmlRetired: f
    };
  }
  function Ft(K, G = {}) {
    return St(K, G).indexUrl;
  }
  function Me(K = {}) {
    const G = k(K.shellState) ? K.shellState : {}, Y = k(K.initHealth) ? K.initHealth : {}, W = k(K.indexState) ? K.indexState : {}, re = String(K.remoteShellIndexUrl || G.remoteShellIndexUrl || W.indexUrl || "").trim(), le = String(K.mode || "").trim().toLowerCase(), he = le === "remote" ? "remote" : le === "gate" ? "gate" : "embedded", Ze = G.remoteShellConfigured === !0 || !!re, gt = G.embeddedFallbackAvailable === !0, je = G.finalUiHtmlRetired !== !1, Nt = String(K.routeState || "").trim() || (he === "remote" ? "remote_active" : he === "gate" ? "setup_gate" : "embedded_active"), sa = String(K.lifecycleState || G.lifecycleState || "").trim() || pe(Ze, K.gateState || G.gateState || W.gateState || ""), Bt = String(K.embeddedFallbackState || G.embeddedFallbackState || "").trim() || Ae(gt, Nt), xl = String(K.retirementState || G.retirementState || "").trim() || _e(gt, je), Ol = String(K.gateState || G.gateState || W.gateState || (re ? "shell_ready" : "setup_required")).trim() || "setup_required";
    return {
      ...G,
      mode: he,
      effectiveMode: ye(he, Nt),
      gateState: Ol,
      lifecycleState: sa,
      embeddedFallbackState: Bt,
      retirementState: xl,
      sourceType: String(K.sourceType || "").trim().toLowerCase() || (he === "remote" ? "remote_fetch" : he === "gate" ? "setup_gate" : "embedded_local"),
      routeState: Nt,
      indexUrl: String(K.indexUrl || G.indexUrl || W.indexUrl || re).trim(),
      indexUrlSource: String(K.indexUrlSource || G.indexUrlSource || W.indexUrlSource || "").trim(),
      effectiveRef: String(K.effectiveRef || G.effectiveRef || W.effectiveRef || "").trim(),
      effectiveRefType: String(K.effectiveRefType || G.effectiveRefType || W.effectiveRefType || "").trim(),
      remoteShellIndexUrl: re,
      remoteShellOrigin: String(G.remoteShellOrigin || "").trim(),
      remoteCacheState: String(K.remoteCacheState || "").trim().toLowerCase(),
      revalidateDue: K.revalidateDue === !0,
      lastFetchStatus: String(K.lastFetchStatus || "").trim().toLowerCase(),
      reason: String(K.reason || "").trim(),
      requestPath: String(K.requestPath || "").trim(),
      initHealthOk: Y.ok === !0,
      initHealthMissing: [...new Set((Array.isArray(Y.missing) ? Y.missing : []).map((vl) => String(vl || "").trim()).filter(Boolean))],
      fallbackRetained: gt,
      templateMode: String(G.embeddedTemplateMode || G.embeddedTemplateSource || "").trim() || u,
      finalUiHtmlRetired: je,
      updatedAt: String(K.updatedAt || "").trim() || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async function na(K, G = {}, Y = null) {
    const W = k(G.shellState) ? G.shellState : ke(K, G.initHealth, G.config || {}), re = Me({
      ...G,
      shellState: W
    }), le = t.resolveOpsStatusStores(K).db, { updatedAt: he, ...Ze } = re, gt = ie(ae(Ze)), je = le ? te.AdminShellStatusWriteState.get(le) : null, Nt = Math.max(1e3, Number(B.Defaults.AdminShellStatusStableWriteIntervalMs) || 1e3);
    if (G.throttleStableWrites === !0 && je?.fingerprint === gt) {
      if (je.writePromise) return je.writePromise;
      if ($() - (Number(je.writtenAt) || 0) < Nt) return null;
    }
    const sa = ge(Promise.resolve(t.patchOpsStatus(K, { adminShell: re }, Y)).then((Bt) => ({
      ok: !0,
      result: Bt
    })), "admin.shell_status_patch", {
      requestPath: re.requestPath,
      mode: re.mode,
      sourceType: re.sourceType
    }, {
      ok: !1,
      result: null
    }).then((Bt) => (!le || te.AdminShellStatusWriteState.get(le)?.writePromise !== sa || (Bt?.ok === !0 ? te.AdminShellStatusWriteState.set(le, {
      fingerprint: gt,
      writtenAt: $(),
      writePromise: null
    }) : je ? te.AdminShellStatusWriteState.set(le, je) : te.AdminShellStatusWriteState.delete(le)), Bt?.result ?? null));
    return le && te.AdminShellStatusWriteState.set(le, {
      fingerprint: gt,
      writtenAt: 0,
      writePromise: sa
    }), sa;
  }
  function ot(K = {}, G, Y = {}, W = Ke(G)) {
    const re = k(K) ? K : {}, le = St(G, Y), he = ke(G, W, Y);
    return {
      ...re,
      adminShell: Me({
        ...k(re.adminShell) ? re.adminShell : {},
        shellState: he,
        initHealth: W,
        indexState: le,
        remoteShellIndexUrl: le.indexUrl,
        gateState: le.gateState,
        indexUrl: le.indexUrl,
        indexUrlSource: le.indexUrlSource,
        effectiveRef: le.effectiveRef,
        effectiveRefType: le.effectiveRefType,
        mode: k(re.adminShell) && String(re.adminShell.mode || "").trim() ? re.adminShell.mode : le.indexUrl ? "remote" : "gate",
        routeState: k(re.adminShell) && String(re.adminShell.routeState || "").trim() ? re.adminShell.routeState : le.indexUrl ? "remote_ready_idle" : "setup_gate",
        sourceType: k(re.adminShell) && String(re.adminShell.sourceType || "").trim() ? re.adminShell.sourceType : le.indexUrl ? "runtime_status" : "setup_gate"
      })
    };
  }
  function st(K = "") {
    const G = String(K || "").trim();
    if (!G) return "已上传的管理台 HTML 暂时不可用，请重新上传。";
    if (G.startsWith("remote_shell_render_failed")) {
      const Y = G.replace(/^remote_shell_render_failed:\s*/i, "").trim();
      return Y ? `Worker 读取 index.html 失败：${Y}` : "Worker 读取 index.html 失败。";
    }
    return G;
  }
  function br(K = {}, G = {}, Y = {}, W = {}) {
    const re = String(K.adminPath || "/admin").trim() || "/admin", le = String(W.remoteShellIndexUrl || G.remoteShellIndexUrl || "").trim(), he = st(W.reason || ""), Ze = `${re}?setup=1`;
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
              <a href="${Ce(re)}" class="admin-remote-error-btn admin-remote-error-btn-primary">刷新 /admin</a>
              <a href="${Ce(Ze)}" class="admin-remote-error-btn admin-remote-error-btn-secondary">重新上传 index.html</a>
            </div>
            <p class="admin-remote-error-note">如果这里继续报错，请重新上传与当前 Worker 匹配的 index.html。</p>
          </div>
        </section>
      </div>`;
  }
  function oa(K = {}, G = {}, Y = {}, W = {}, re = {}) {
    const le = String(K.adminPath || "/admin").trim() || "/admin", he = re?.isLocalUpload === !0, Ze = Zr({ adminPath: le });
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
        const ADMIN_INDEX_GATE_RUNTIME = ${Ze};
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
    return !Array.isArray(d) || d.length !== c.length + 1 ? "" : p(d, {
      [h]: String(K || "{}"),
      [g]: String(G || ""),
      [y]: String(Y || _)
    });
  }
  function Zt(K = {}, G = null, Y = _) {
    const W = k(K) ? K : {}, re = k(G) ? G : k(W.initHealth) ? W.initHealth : {}, le = {
      templateRevision: String(l).trim() || "admin-shell",
      adminPath: String(W.adminPath || "").trim(),
      loginPath: String(W.loginPath || "").trim(),
      hostDomain: oe(W.hostDomain),
      contractHash: ie(ae(W.contract || J())),
      initHealthOk: re.ok === !0,
      initHealthMissing: [...new Set((Array.isArray(re.missing) ? re.missing : []).map((he) => String(he || "").trim()).filter(Boolean))],
      appRootHash: ie(String(Y || _))
    };
    return `${le.templateRevision}-${ie(ae(le))}`;
  }
  function mt(K = "") {
    return `"${String(K || "").trim()}"`;
  }
  function pt(K = "") {
    return String(K || "").trim().replace(/^W\//i, "").replace(/^"(.*)"$/, "$1");
  }
  function Ut(K, G = "") {
    const Y = String(K?.headers?.get?.("If-None-Match") || "").trim(), W = pt(G);
    return !Y || !W ? !1 : Y.split(",").some((re) => {
      const le = pt(re);
      return le === "*" || le === W;
    });
  }
  function wt(K, G = "") {
    const Y = K instanceof Request ? new URL(K.url) : new URL(String(K || ""), S), W = new URL(Y.pathname, S);
    return W.searchParams.set("remote", ie(String(G || "").trim())), new Request(W.toString(), { method: "GET" });
  }
  function kt(K, G = "", Y = {}) {
    const W = wt(K, G), re = new URL(W.url);
    return re.searchParams.set("transform", N), re.searchParams.set("bootstrap", ie(ae(k(Y) ? Y : {}))), new Request(re.toString(), { method: "GET" });
  }
  function er(K = "", G = "no-store, max-age=0") {
    const Y = new Headers({
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": String(G || "no-store, max-age=0")
    });
    return De(Y), K && Y.set("ETag", mt(K)), Y;
  }
  function Lt(K = "") {
    const G = String(K || "").trim();
    if (!G) return "";
    const Y = Date.parse(G);
    return Number.isFinite(Y) ? new Date(Y).toUTCString() : "";
  }
  function Er(K, G = "") {
    const Y = String(K?.headers?.get?.("If-Modified-Since") || "").trim(), W = Lt(G);
    if (!Y || !W) return !1;
    const re = Date.parse(Y), le = Date.parse(W);
    return !Number.isFinite(re) || !Number.isFinite(le) ? !1 : re >= le;
  }
  function Ht(K, G) {
    return String(K?.headers?.get?.("If-None-Match") || "").trim() ? Ut(K, G?.headers?.get?.("ETag") || "") : Er(K, G?.headers?.get?.("Last-Modified") || "");
  }
  function $t(K, G = "no-store, max-age=0") {
    const Y = new Headers({ "Cache-Control": String(G || "no-store, max-age=0") }), W = pt(K?.headers?.get?.("ETag") || ""), re = Lt(K?.headers?.get?.("Last-Modified") || "");
    W && Y.set("ETag", mt(W)), re && Y.set("Last-Modified", re);
    const le = String(K?.headers?.get?.("X-Admin-Shell-Revision") || "").trim();
    return le && Y.set("X-Admin-Shell-Revision", le), De(Y), new Response(null, {
      status: 304,
      headers: Y
    });
  }
  return {
    ADMIN_FALLBACK_HTML_TEMPLATE: r,
    cachedAdminTemplateBytes: a,
    SITE_FAVICON_SVG: o,
    LANDING_PAGE_STYLE_HTML: s,
    renderFaviconResponse: i,
    ADMIN_HTML_DYNAMIC_PLACEHOLDERS: c,
    ADMIN_HTML_VARIANT_ETAG: l,
    ADMIN_HTML_PARTS_PLAIN: d,
    ADMIN_EMBEDDED_TEMPLATE_MODE: u,
    ADMIN_FINAL_UI_HTML_RETIRED: f,
    splitAdminHtmlTemplate: m,
    renderAdminHtmlTemplate: p,
    ADMIN_BOOTSTRAP_PLACEHOLDER: h,
    ADMIN_INIT_HEALTH_BANNER_PLACEHOLDER: g,
    ADMIN_APP_ROOT_PLACEHOLDER: y,
    ADMIN_APP_ROOT_HTML: _,
    ADMIN_HTML_CACHE_KEY_ORIGIN: S,
    ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL: T,
    ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL: b,
    ADMIN_REMOTE_SHELL_REVALIDATE_MS: A,
    ADMIN_REMOTE_SHELL_MAX_BYTES: C,
    ADMIN_REMOTE_SHELL_TRANSFORM_REVISION: N,
    ADMIN_REMOTE_SHELL_CACHED_AT_HEADER: P,
    ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER: E,
    ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER: w,
    ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER: R,
    ADMIN_RELEASE_PROXY_PATH_SEGMENT: D,
    ADMIN_RELEASE_VENDOR_PATH_SEGMENT: x,
    ADMIN_WARM_PATH_SEGMENT: L,
    ADMIN_RELEASE_VENDOR_CACHE_KEY_ORIGIN: F,
    ADMIN_RELEASE_VENDOR_MANIFEST_CACHE_KEY_ORIGIN: I,
    ADMIN_RELEASE_VENDOR_CACHE_CONTROL: U,
    ADMIN_RELEASE_VENDOR_MUTABLE_CACHE_CONTROL: V,
    ADMIN_RELEASE_VENDOR_MAX_BYTES: X,
    ADMIN_WARM_VENDOR_CONCURRENCY: v,
    ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER: O,
    ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER: M,
    ADMIN_PRIMARY_VIEWS: H,
    ADMIN_SETTINGS_VISUAL_SECTIONS: j,
    ADMIN_SETTINGS_SAVE_GROUPS: q,
    buildAdminUiContract: J,
    buildAdminBootstrapPayload: Q,
    measureAdminShellTemplateBytes: se,
    buildAdminShellLifecycleState: pe,
    buildAdminShellRetirementState: _e,
    buildAdminShellEffectiveMode: ye,
    buildAdminEmbeddedFallbackRuntimeState: Ae,
    buildAdminShellState: ke,
    resolveAdminShellIndexUrl: Ft,
    normalizeAdminShellRuntimeStatus: Me,
    patchAdminShellRuntimeStatus: na,
    withAdminShellRuntimeStatus: ot,
    describeAdminRemoteShellFailureReason: st,
    buildAdminRemoteShellErrorContent: br,
    buildAdminIndexSetupContent: oa,
    renderAdminHtmlShell: $e,
    buildAdminHtmlVariantEtag: Zt,
    formatAdminHtmlEtag: mt,
    normalizeEtagToken: pt,
    requestHasMatchingEtag: Ut,
    buildAdminRemoteShellLegacyCacheKeyRequest: wt,
    buildAdminRemoteShellCacheKeyRequest: kt,
    buildAdminHtmlResponseHeaders: er,
    normalizeAdminHttpDateHeader: Lt,
    requestHasMatchingLastModified: Er,
    requestMatchesAdminHtmlResponse: Ht,
    buildConditionalNotModifiedResponseFromStoredResponse: $t
  };
}
function Od(n = {}, e = {}) {
  function t(v = "{}") {
    return `${s(v)}${r}`;
  }
  const r = '<script id="admin-bootstrap-loader">try{window.__ADMIN_BOOTSTRAP__=JSON.parse(document.getElementById("admin-bootstrap")?.textContent||"{}")}catch(_){window.__ADMIN_BOOTSTRAP__=window.__ADMIN_BOOTSTRAP__||{},window.__ADMIN_UI_BOOT_ERROR__=window.__ADMIN_UI_BOOT_ERROR__||"admin bootstrap parse failed: "+(_?.message||String(_||"unknown_error"))}<\/script>', a = '<script id="admin-tailwind-prelude">window.tailwind=window.tailwind||{};<\/script>', o = /* @__PURE__ */ new Set([
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
    for (let H = O; H < v.length; H += 1) {
      const j = v[H];
      if (M)
        j === M && (M = "");
      else if (j === '"' || j === "'") M = j;
      else if (j === ">") return H;
    }
    return -1;
  }
  function l(v, O) {
    let M = O + 1;
    if (!/[A-Za-z]/.test(v[M] || "")) return null;
    const H = c(v, M);
    if (H < 0) return null;
    const j = M;
    for (; M < H && !i(v[M]) && v[M] !== "/"; ) M += 1;
    const q = v.slice(j, M).toLowerCase(), J = /* @__PURE__ */ new Map();
    for (; M < H; ) {
      for (; M < H && i(v[M]); ) M += 1;
      if (M >= H) break;
      if (v[M] === "/") {
        M += 1;
        continue;
      }
      const Q = M;
      for (; M < H && !i(v[M]) && v[M] !== "=" && v[M] !== "/"; ) M += 1;
      if (M === Q) {
        M += 1;
        continue;
      }
      const se = v.slice(Q, M).toLowerCase();
      for (; M < H && i(v[M]); ) M += 1;
      let pe = "", _e = !1, ye = -1, Ae = -1;
      if (v[M] === "=") {
        for (M += 1; M < H && i(v[M]); ) M += 1;
        const ke = v[M];
        if (ke === '"' || ke === "'") {
          for (_e = !0, M += 1, ye = M; M < H && v[M] !== ke; ) M += 1;
          Ae = M, pe = v.slice(ye, Ae), M < H && (M += 1);
        } else {
          for (ye = M; M < H && !i(v[M]); ) M += 1;
          Ae = M, pe = v.slice(ye, Ae);
        }
      }
      J.has(se) || J.set(se, {
        value: pe,
        quoted: _e,
        valueStart: ye,
        valueEnd: Ae
      });
    }
    return {
      tagName: q,
      attributes: J,
      start: O,
      tagEnd: H
    };
  }
  const d = /* @__PURE__ */ new Map();
  function u(v) {
    let O = d.get(v);
    return O || (O = new RegExp(`</${A(v)}(?=[ \\t\\n\\f\\r/>]|$)`, "gi"), d.set(v, O)), O.lastIndex = 0, O;
  }
  function f(v, O, M) {
    const H = u(O);
    H.lastIndex = M;
    const j = H.exec(v);
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
      const H = O.indexOf("<", M);
      if (H < 0) return;
      if (O.startsWith("<!--", H)) {
        const pe = O.indexOf("-->", H + 4);
        M = pe < 0 ? O.length : pe + 3;
        continue;
      }
      const j = O[H + 1] || "";
      if (j === "!" || j === "?" || j === "/") {
        const pe = c(O, H + 2);
        if (pe < 0) return;
        M = pe + 1;
        continue;
      }
      const q = l(O, H);
      if (!q) {
        if (/[A-Za-z]/.test(j)) return;
        M = H + 1;
        continue;
      }
      const J = q.tagEnd + 1, Q = o.has(q.tagName) ? f(O, q.tagName, J) : null, se = Q ? Q.start : J;
      if (M = Q ? Q.tagEnd + 1 : J, yield {
        ...q,
        contentStart: J,
        contentEnd: Q || !o.has(q.tagName) ? se : O.length,
        contentTagEnd: Q ? Q.tagEnd : -1,
        contentClosed: !!Q || !o.has(q.tagName)
      }, o.has(q.tagName) && !Q) return;
    }
  }
  function p(v = "", O = "") {
    const M = String(v || ""), H = String(O || "");
    if (!M || !H) return M;
    let j = -1;
    for (const q of m(M)) {
      if (q.tagName === "head") {
        const J = q.tagEnd + 1;
        return `${M.slice(0, J)}${H}${M.slice(J)}`;
      }
      q.tagName === "body" && j < 0 && (j = q.tagEnd + 1);
    }
    return j >= 0 ? `${M.slice(0, j)}${H}${M.slice(j)}` : `${H}${M}`;
  }
  function h(v = "") {
    const O = String(v || "");
    if (!O) return O;
    let M = -1;
    for (const H of m(O)) {
      if (H.tagName !== "script" || !H.contentClosed) continue;
      if (H.attributes.get("id")?.value === "admin-tailwind-prelude") return O;
      if (M >= 0 || H.attributes.has("src")) continue;
      const j = O.slice(H.contentStart, H.contentEnd);
      /\btailwind\s*\.\s*config\s*=/i.test(j) && (M = H.start);
    }
    return M < 0 ? O : `${O.slice(0, M)}${a}${O.slice(M)}`;
  }
  function g(v = "", O = "{}") {
    const M = h(String(v || ""));
    if (!M) return M;
    const H = s(O);
    let j = null, q = null;
    for (const J of m(M)) {
      if (J.tagName !== "script" || !J.contentClosed) continue;
      const Q = String(J.attributes.get("id")?.value || "").trim();
      Q === "admin-bootstrap" && String(J.attributes.get("type")?.value || "").trim().toLowerCase() === "application/json" ? j = J : Q === "admin-bootstrap-loader" && (q = J);
    }
    if (j && j.contentTagEnd >= j.tagEnd) {
      const J = M.slice(0, j.start), Q = M.slice(j.contentTagEnd + 1);
      return `${J}${H}${q ? "" : r}${Q}`;
    }
    return q ? `${M.slice(0, q.start)}${H}${M.slice(q.start)}` : p(M, t(O));
  }
  function y(v) {
    const O = String(v?.tagName || "").trim().toLowerCase();
    let M = "", H = "";
    if (O === "script" && v.attributes?.has("src"))
      M = "src", H = "script";
    else if (O === "link" && v.attributes?.has("href")) {
      const Q = new Set(String(v.attributes.get("rel")?.value || "").trim().toLowerCase().split(/\s+/).filter(Boolean)), se = String(v.attributes.get("as")?.value || "").trim().toLowerCase();
      Q.has("stylesheet") ? H = "css" : Q.has("modulepreload") ? H = "script" : (Q.has("preload") || Q.has("prefetch")) && se === "style" ? H = "css" : (Q.has("preload") || Q.has("prefetch")) && se === "script" && (H = "script"), H && (M = "href");
    }
    if (!M || !H) return null;
    const j = v.attributes.get(M), q = Number(j?.valueStart), J = Number(j?.valueEnd);
    return !Number.isInteger(q) || !Number.isInteger(J) || q < 0 || J < q ? null : {
      rawValue: String(j?.value || ""),
      assetKind: H,
      valueStart: q,
      valueEnd: J
    };
  }
  function _(v = "") {
    const O = [];
    for (const M of m(v)) {
      const H = y(M);
      H && O.push(H);
    }
    return O;
  }
  function S(v = "") {
    for (const O of m(v))
      if (O.tagName === "script" && String(O.attributes.get("type")?.value || "").trim().toLowerCase() === "importmap")
        return !0;
    return !1;
  }
  function T(v = "", O = "") {
    const M = String(v || "");
    if (!M) return [];
    let H = null;
    try {
      H = new URL(String(O || "").trim());
    } catch {
      H = null;
    }
    const j = [];
    for (const q of _(M)) {
      const J = String(q.rawValue || "").trim();
      if (!(!J || /^data:/i.test(J) || /^javascript:/i.test(J)))
        try {
          const Q = H ? new URL(J, H).toString() : new URL(J).toString();
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
    return T(v, O).map((M) => M.normalizedUrl);
  }
  function A(v = "") {
    return String(v || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function C(v = "", O = "") {
    const M = String(v || "").trim(), H = String(O || "").trim().toLowerCase() === "css" ? "css" : "js";
    return M ? `${ie(M)}.${H}` : "";
  }
  function N(v = "/admin", O = "", M = "") {
    const H = Z(v || "/admin").replace(/\/+$/, "") || "/admin", j = yt(O), q = String(M || "").trim();
    return !j || !q ? "" : `${H}/${e.ADMIN_RELEASE_PROXY_PATH_SEGMENT}/${encodeURIComponent(j)}/${e.ADMIN_RELEASE_VENDOR_PATH_SEGMENT}/${encodeURIComponent(q)}`;
  }
  function P(v = "", O = {}) {
    const M = T(v, O.baseUrl || O.sourceUrl || "").map((H) => ({
      assetKey: C(H.normalizedUrl, H.assetKind),
      assetKind: H.assetKind,
      upstreamUrl: H.normalizedUrl
    })).filter((H) => H.assetKey && H.upstreamUrl).filter((H, j, q) => q.findIndex((J) => J.assetKey === H.assetKey) === j);
    return {
      version: 1,
      releaseTag: yt(O.releaseTag),
      sourceUrl: vr(O.sourceUrl || O.baseUrl || ""),
      entries: M
    };
  }
  function E(v = "", O = {}, M = {}) {
    const H = String(v || "");
    if (!H) return H;
    const j = String(M.adminPath || "/admin").trim() || "/admin", q = yt(M.releaseTag), J = new Map((Array.isArray(O?.entries) ? O.entries : []).map((_e) => [String(_e?.upstreamUrl || "").trim(), String(_e?.assetKey || "").trim()]));
    if (!q || J.size === 0) return H;
    let Q = null;
    try {
      Q = new URL(String(M.baseUrl || M.sourceUrl || "").trim());
    } catch {
      Q = null;
    }
    const se = [];
    for (const _e of _(H)) {
      const ye = String(_e.rawValue || "").trim();
      if (!(!ye || /^data:/i.test(ye) || /^javascript:/i.test(ye)))
        try {
          const Ae = Q ? new URL(ye, Q).toString() : new URL(ye).toString(), ke = J.get(Ae), Ft = N(j, q, ke);
          if (!ke || !Ft) continue;
          se.push({
            start: _e.valueStart,
            end: _e.valueEnd,
            value: Ft
          });
        } catch {
          continue;
        }
    }
    let pe = H;
    for (const _e of se.sort((ye, Ae) => Ae.start - ye.start)) pe = `${pe.slice(0, _e.start)}${_e.value}${pe.slice(_e.end)}`;
    return pe;
  }
  function w(v = {}) {
    const O = k(v) ? v : {};
    return {
      version: Number(O.version) || 1,
      releaseTag: yt(O.releaseTag),
      sourceUrl: vr(O.sourceUrl),
      entries: (Array.isArray(O.entries) ? O.entries : []).map((M) => ({
        assetKey: String(M?.assetKey || "").trim(),
        assetKind: String(M?.assetKind || "").trim().toLowerCase() === "css" ? "css" : "script",
        upstreamUrl: vr(M?.upstreamUrl)
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
    const H = O.pathname.match(/^\/gh\/[^/]+\/[^@/]+@([^/]+)\//i);
    if (!H) return !0;
    const j = decodeURIComponent(String(H[1] || "").trim());
    return j ? !(/^[0-9a-f]{7,40}$/i.test(j) || /^v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/i.test(j)) : !0;
  }
  function D(v = "") {
    const O = String(v || ""), M = [], H = (J = "") => /[A-Za-z0-9_$]/.test(J), j = (J) => {
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
      if (!H(O[q - 1]) && !H(O[q + 6])) {
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
      const H = String(M.attributes.get("type")?.value || "").trim().toLowerCase().split(";")[0];
      if (!(H && ![
        "module",
        "text/javascript",
        "application/javascript",
        "text/ecmascript",
        "application/ecmascript"
      ].includes(H)) && D(O.slice(M.contentStart, M.contentEnd)).length > 0)
        return !0;
    }
    return !1;
  }
  function L(v = "", O = "") {
    const M = T(v, O), H = [];
    S(v) && H.push("远端 index.html 不允许 importmap；所有运行时依赖必须通过显式 script/link 标签交付"), x(v) && H.push("index.html 不允许 inline 动态 import()；所有运行时依赖必须通过显式 script/link 标签交付");
    for (const j of M) {
      const q = String(j?.rawValue || "").trim(), J = String(j?.normalizedUrl || "").trim();
      let Q = "", se = "";
      try {
        const pe = new URL(J);
        Q = pe.hostname.replace(/\.+$/, "").toLowerCase(), se = pe.pathname;
      } catch {
      }
      if (!/^(?:https?:)?\/\//i.test(q)) {
        H.push(`远端 index.html 不允许相对或本地 bundle 资源：${q}`);
        continue;
      }
      if (Q === "esm.sh" || Q.endsWith(".esm.sh")) {
        H.push(`esm.sh 资产不再允许：${J}`);
        continue;
      }
      if (Q === "raw.githubusercontent.com") {
        H.push(`raw.githubusercontent.com 资产不再允许：${J}`);
        continue;
      }
      if (Q === "github.com" && /^\/[^/]+\/[^/]+\/releases\/download\//i.test(se)) {
        H.push(`浏览器直连 GitHub Release 资产不再允许：${J}`);
        continue;
      }
    }
    return H;
  }
  function F(v = "") {
    for (const O of m(v)) {
      if (o.has(O.tagName)) continue;
      const M = O.attributes.get("id");
      if (M?.quoted && M.value === "app") return !0;
    }
    return !1;
  }
  function I(v = "") {
    let O = !1, M = !1;
    for (const H of m(v))
      if (H.attributes.has("data-admin-runtime-enhancements") && (H.tagName === "style" ? O = !0 : H.tagName === "script" && (M = !0), O && M))
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
    const O = k(v.bootstrap) ? v.bootstrap : {}, M = k(v.initHealth) ? v.initHealth : k(O.initHealth) ? O.initHealth : {};
    return `admin-remote-shell-${ie(ae({
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
    ADMIN_HTML_SKIPPED_CONTENT_TAGS: o,
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
    extractAdminRemoteShellAssetDescriptors: T,
    extractAdminRemoteShellAssetUrls: b,
    escapeRegexForRoute: A,
    buildAdminReleaseVendorAssetKey: C,
    buildAdminReleaseVendorProxyPath: N,
    buildAdminReleaseVendorManifest: P,
    rewriteAdminRemoteShellAssetUrlsToProxy: E,
    normalizeAdminReleaseVendorManifestRecord: w,
    isMutableJsdelivrGithubAssetUrl: R,
    collectAdminInlineDynamicImports: D,
    hasAdminRemoteShellInlineDynamicImport: x,
    getAdminRemoteShellAssetPolicyViolations: L,
    hasAdminRemoteShellAppRoot: F,
    hasAdminRemoteShellRuntimeEnhancements: I,
    hasAdminRemoteShellHtmlDocument: U,
    isAcceptedAdminHtmlDocumentContentType: V,
    buildAdminRemoteShellVariantEtag: X
  };
}
function ze(n, e) {
  return fetch(n, e);
}
function sc(n = {}) {
  const e = {};
  if (!n || typeof n != "object" || Array.isArray(n)) return e;
  for (const [t, r] of Object.entries(n)) {
    const a = String(t || "").trim().toLowerCase();
    !a || e[a] !== void 0 || (e[a] = r);
  }
  return e;
}
function Ls(n = {}, e = []) {
  const t = sc(n);
  for (const r of Array.isArray(e) ? e : [e]) {
    const a = String(r || "").trim().toLowerCase();
    if (!a) continue;
    const o = t[a];
    if (!(o == null || o === ""))
      return o;
  }
  return "";
}
function Ye(n = []) {
  return (Array.isArray(n) ? n : [n]).map((e) => String(e ?? "").trim()).filter(Boolean).join(":");
}
async function Et(n, e) {
  return await Cn(ee.SingleFlightTasks, n, e);
}
async function Cn(n, e, t) {
  const r = String(e || "").trim();
  if (!r) return await t();
  const a = n.get(r);
  if (a) return await a;
  const o = Promise.resolve().then(() => t()).finally(() => {
    n.get(r) === o && n.delete(r);
  });
  return n.set(r, o), await o;
}
function Wo(n) {
  return String(n?.__CONFIG_CACHE_NAMESPACE || n?.__WORKER_CACHE_SCOPE || "default").trim() || "default";
}
function wn(n) {
  return Za.get(Sr(n), Wo(n));
}
function oo(n) {
  return wn(n).ConfigCache?.data || null;
}
function an(n) {
  if (arguments.length === 0) {
    Za.reset();
    return;
  }
  const e = wn(n);
  e.RuntimeConfigCacheGeneration += 1, e.ConfigCache = null;
}
function vd(n, e) {
  const t = wn(n);
  t.RuntimeConfigCacheGeneration += 1, t.ConfigCache = {
    data: e,
    exp: Date.now() + B.Defaults.CacheTTL,
    namespace: Wo(n)
  };
}
async function so(n, e) {
  const t = String(n), r = (ee.AdminRemoteShellCacheMutationChains.get(t) || Promise.resolve()).catch(() => null).then(() => e()).finally(() => {
    ee.AdminRemoteShellCacheMutationChains.get(t) === r && ee.AdminRemoteShellCacheMutationChains.delete(t);
  });
  return ee.AdminRemoteShellCacheMutationChains.set(t, r), await r;
}
function Fd(n = {}, e = {}) {
  function t(E = "", w = {}) {
    const R = e.buildAdminHtmlResponseHeaders(w.variantEtag || "", e.ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL), D = Number.parseInt(String(w.cachedAt || ""), 10);
    R.set(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER, String(Number.isFinite(D) && D > 0 ? D : $()));
    const x = e.normalizeEtagToken(w.originEtag || "");
    x && R.set(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER, x);
    const L = e.normalizeAdminHttpDateHeader(w.originLastModified || "");
    L && R.set(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER, L);
    const F = ie(String(w.sourceUrl || "").trim());
    F && R.set(e.ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER, F);
    const I = Mt(w.shellRevision || tt(w.sourceUrl));
    return I && R.set("X-Admin-Shell-Revision", I), new Response(String(E || ""), {
      status: 200,
      headers: R
    });
  }
  async function r(E) {
    if (!E) return null;
    try {
      const w = await Pe(E, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
      if (w.exceeded) return null;
      const R = new Headers(E.headers || {});
      return R.delete("Content-Length"), new Response(w.text, {
        status: Number(E.status) || 200,
        statusText: String(E.statusText || ""),
        headers: R
      });
    } catch {
      return null;
    }
  }
  async function a(E, w, R, D) {
    const x = await Pe(E, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
    if (x.exceeded) throw new Error("legacy remote admin shell too large");
    const L = x.text, F = e.applyAdminRemoteBootstrapMarkup(L, Zr(R)), I = E.headers.get(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER) || "", U = e.normalizeAdminHttpDateHeader(E.headers.get(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER) || ""), V = e.normalizeAdminHttpDateHeader(E.headers.get("Last-Modified") || "") || U;
    return t(F, {
      variantEtag: e.buildAdminRemoteShellVariantEtag({
        html: F,
        bootstrap: R,
        initHealth: D,
        sourceUrl: w,
        originEtag: I,
        originLastModified: U || V
      }),
      lastModified: V,
      originEtag: I,
      originLastModified: U || V,
      sourceUrl: w,
      cachedAt: _(E)
    });
  }
  function o(E, w = "GET") {
    if (!E) return new Response("Remote admin shell unavailable", { status: 502 });
    const R = new Headers(E.headers || {});
    return R.set("Content-Type", "text/html;charset=UTF-8"), R.set("Cache-Control", e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL), R.delete(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER), R.delete(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER), R.delete(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER), R.delete(e.ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER), De(R), new Response(w === "HEAD" ? null : E.body, {
      status: E.status,
      statusText: E.statusText,
      headers: R
    });
  }
  function s(E = "", w = "") {
    const R = new URL(`/${encodeURIComponent(yt(E) || "release")}`, e.ADMIN_RELEASE_VENDOR_MANIFEST_CACHE_KEY_ORIGIN);
    return R.searchParams.set("source", ie(String(w || "").trim())), new Request(R.toString(), { method: "GET" });
  }
  function i(E = "", w = "", R = "") {
    const D = new URL(`/${encodeURIComponent(yt(E) || "release")}/${encodeURIComponent(String(w || "").trim())}`, e.ADMIN_RELEASE_VENDOR_CACHE_KEY_ORIGIN);
    return D.searchParams.set("source", ie(String(R || "").trim())), D.searchParams.set("schema", "2"), new Request(D.toString(), { method: "GET" });
  }
  function c(E = {}, w = "") {
    const R = new Headers({
      "Content-Type": "application/json;charset=UTF-8",
      "Cache-Control": e.ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL
    }), D = String(w || E?.sourceUrl || "").trim();
    return R.set(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER, String($())), D && R.set(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER, ie(D)), new Response(JSON.stringify(E), {
      status: 200,
      headers: R
    });
  }
  function l(E = "", w = "script") {
    const R = String(E || "").trim().toLowerCase(), D = String(w || "").trim().toLowerCase() === "css" ? "css" : "script";
    return R ? D === "css" ? R.includes("text/css") || R.includes("application/css") || R.startsWith("text/plain") : R.includes("javascript") || R.includes("ecmascript") || R.startsWith("text/plain") || R.startsWith("application/octet-stream") : !0;
  }
  function d(E, w = "GET") {
    const R = new Headers(E.headers);
    return R.set("Cache-Control", String(E.headers.get("Cache-Control") || e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL).trim() || e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL), R.delete(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER), R.delete(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER), De(R), new Response(w === "HEAD" ? null : E.body, {
      status: E.status,
      statusText: E.statusText,
      headers: R
    });
  }
  async function u(E, w = "", R = "") {
    if (!E || typeof E.match != "function") return null;
    const D = await E.match(s(w, R));
    if (!D) return null;
    try {
      const x = await Pe(D, ec);
      return x.exceeded ? null : e.normalizeAdminReleaseVendorManifestRecord(JSON.parse(x.text));
    } catch {
      return null;
    }
  }
  async function f(E = "", w = "") {
    const R = yt(E), D = vr(w);
    if (!R || !D) return null;
    const x = await ze(D, { method: "GET" });
    if (!x.ok) throw new Error(`release index fetch failed: HTTP ${x.status}`);
    const L = String(x.headers.get("Content-Type") || "").trim().toLowerCase(), F = Number.parseInt(String(x.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(F) && F > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`release index too large: ${F} bytes`);
    const I = await Pe(x, e.ADMIN_REMOTE_SHELL_MAX_BYTES), U = I.text, V = I.bytes;
    if (I.exceeded || !U || V > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`release index payload invalid: ${V} bytes`);
    const X = e.hasAdminRemoteShellHtmlDocument(U);
    if (!e.isAcceptedAdminHtmlDocumentContentType(L, X)) throw new Error(`release index content-type invalid: ${L}`);
    if (!X) throw new Error("release index payload invalid: html document expected");
    if (!e.hasAdminRemoteShellAppRoot(U)) throw new Error("release index missing #app root");
    const v = e.getAdminRemoteShellAssetPolicyViolations(U, D);
    if (v.length > 0) throw new Error(`release index asset policy invalid: ${v.slice(0, 3).join(" | ")}`);
    return e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(U, {
      releaseTag: R,
      sourceUrl: D
    }));
  }
  async function m(E, w = {}, R = null) {
    const D = e.normalizeAdminReleaseVendorManifestRecord(w);
    if (!E || typeof E.put != "function" || !D.releaseTag || !D.sourceUrl) return D;
    const x = ge(E.put(s(D.releaseTag, D.sourceUrl), c(D, D.sourceUrl)), "admin.release_vendor_manifest_cache_write", { releaseTag: D.releaseTag }, null);
    return R && typeof R.waitUntil == "function" ? R.waitUntil(x) : await x, D;
  }
  async function p(E, w = "", R = "", D = null) {
    const x = await u(E, w, R);
    if (x?.entries?.length) return x;
    const L = await f(w, R);
    return L ? (await m(E, L, D), L) : null;
  }
  function h(E = {}, w = "") {
    const R = String(w || "").trim();
    return R && (Array.isArray(E?.entries) ? E.entries : []).find((D) => String(D?.assetKey || "").trim() === R) || null;
  }
  function g(E = "", w = "/admin") {
    const R = Z(w || "/admin").replace(/\/+$/, "") || "/admin", D = Z(E || "/"), x = new RegExp(`^${e.escapeRegexForRoute(R)}/${e.ADMIN_RELEASE_PROXY_PATH_SEGMENT}/([^/]+)/${e.ADMIN_RELEASE_VENDOR_PATH_SEGMENT}/([^/]+)/*$`, "i"), L = D.match(x);
    if (!L) return null;
    try {
      return {
        releaseTag: yt(decodeURIComponent(String(L[1] || ""))),
        assetKey: String(decodeURIComponent(String(L[2] || "")) || "").trim()
      };
    } catch {
      return null;
    }
  }
  function y(E = "", w = "/admin") {
    const R = Z(w || "/admin").replace(/\/+$/, "") || "/admin";
    return (Z(E || "/").replace(/\/+$/, "") || "/").toLowerCase() === `${R}/${e.ADMIN_WARM_PATH_SEGMENT}`.toLowerCase();
  }
  function _(E) {
    const w = Number.parseInt(String(E?.headers?.get?.(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER) || ""), 10);
    return Number.isFinite(w) && w > 0 ? w : 0;
  }
  function S(E) {
    const w = _(E);
    return w ? $() - w >= e.ADMIN_REMOTE_SHELL_REVALIDATE_MS : !0;
  }
  function T(E = "", w = "", R = {}) {
    const D = String(E || ""), x = String(R.sourceLabel || "admin shell").trim() || "admin shell", L = String(R.contentType || "").trim().toLowerCase(), F = new TextEncoder().encode(D).length;
    if (!D || F > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`${x} payload invalid: ${F} bytes`);
    const I = e.hasAdminRemoteShellHtmlDocument(D);
    if (!e.isAcceptedAdminHtmlDocumentContentType(L, I)) throw new Error(`${x} content-type invalid: ${L}`);
    if (!I) throw new Error(`${x} payload invalid: html document expected`);
    if (!e.hasAdminRemoteShellAppRoot(D)) throw new Error(`${x} missing #app root`);
    if (!e.hasAdminRemoteShellRuntimeEnhancements(D)) throw new Error(`${x} missing runtime enhancements`);
    const U = e.getAdminRemoteShellAssetPolicyViolations(D, w);
    if (U.length > 0) throw new Error(`${x} asset policy invalid: ${U.slice(0, 3).join(" | ")}`);
    return {
      html: D,
      bytes: F
    };
  }
  function b(E = "", w = {}, R = {}, D = "", x = {}) {
    const L = T(E, D, x), F = yt(x.assetRevision || x.releaseTag), I = F ? e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(L.html, {
      releaseTag: F,
      sourceUrl: D
    })) : null, U = I?.entries?.length ? e.rewriteAdminRemoteShellAssetUrlsToProxy(L.html, I, {
      adminPath: String(x.adminPath || w?.adminPath || "/admin").trim() || "/admin",
      releaseTag: F,
      sourceUrl: D
    }) : L.html, V = e.applyAdminRemoteBootstrapMarkup(U, Zr(w)), X = e.normalizeAdminHttpDateHeader(x.lastModified || "") || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toUTCString(), v = String(x.originEtag || "").trim();
    return {
      storedResponse: t(V, {
        variantEtag: e.buildAdminRemoteShellVariantEtag({
          html: V,
          bootstrap: w,
          initHealth: R,
          sourceUrl: D,
          originEtag: v,
          originLastModified: X
        }),
        lastModified: X,
        originEtag: v,
        originLastModified: X,
        sourceUrl: D,
        shellRevision: tt(D)
      }),
      vendorManifest: I
    };
  }
  async function A(E = "", w = "index.html") {
    const R = String(E || ""), D = await Xn(R), x = Xr(D);
    let L;
    try {
      L = T(R, x, {
        sourceLabel: "local admin index",
        contentType: "text/html"
      });
    } catch (U) {
      throw U && typeof U == "object" && (U.code = String(U.code || "ADMIN_INDEX_UPLOAD_INVALID"), U.status = xe(U.status, 400)), U;
    }
    const F = Uo(D), I = e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(L.html, {
      releaseTag: F,
      sourceUrl: x
    }));
    return {
      version: 1,
      revision: D,
      assetRevision: F,
      sourceUrl: x,
      fileName: (String(w || "index.html").trim().replace(/^.*[\\/]/, "") || "index.html").slice(0, 180),
      uploadedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
      bytes: L.bytes,
      html: L.html,
      manifest: I
    };
  }
  async function C(E, w, R, D = null, x = {}) {
    if (tt(E)) {
      const j = typeof x.loadLocalIndexRecord == "function" ? await x.loadLocalIndexRecord() : null;
      if (!j?.html) throw new Error("local admin index upload is missing");
      return b(j.html, w, R, E, {
        sourceLabel: "local admin index",
        contentType: "text/html",
        adminPath: x.adminPath,
        assetRevision: x.assetRevision || j.assetRevision,
        lastModified: j.uploadedAt
      });
    }
    const L = new Headers(), F = e.normalizeEtagToken(D?.headers?.get?.(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER) || ""), I = e.normalizeAdminHttpDateHeader(D?.headers?.get?.(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER) || "");
    F && L.set("If-None-Match", F), I && L.set("If-Modified-Since", I);
    const U = await ze(E, {
      method: "GET",
      headers: L
    });
    if (U.status === 304 && D) {
      const j = await Pe(D, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
      if (j.exceeded) throw new Error("cached remote admin shell too large");
      const q = j.text;
      return {
        storedResponse: t(q, {
          variantEtag: e.normalizeEtagToken(D.headers.get("ETag") || ""),
          lastModified: e.normalizeAdminHttpDateHeader(D.headers.get("Last-Modified") || ""),
          originEtag: F,
          originLastModified: I,
          sourceUrl: E
        }),
        vendorManifest: null
      };
    }
    if (!U.ok) throw new Error(`remote admin shell fetch failed: HTTP ${U.status}`);
    const V = String(U.headers.get("Content-Type") || "").trim().toLowerCase(), X = Number.parseInt(String(U.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(X) && X > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`remote admin shell too large: ${X} bytes`);
    const v = await Pe(U, e.ADMIN_REMOTE_SHELL_MAX_BYTES), O = v.text, M = v.bytes;
    if (v.exceeded || !O || M > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`remote admin shell payload invalid: ${M} bytes`);
    const H = e.normalizeAdminHttpDateHeader(U.headers.get("Last-Modified") || "") || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toUTCString();
    return b(O, w, R, E, {
      sourceLabel: "remote admin shell",
      contentType: V,
      adminPath: x.adminPath,
      assetRevision: x.assetRevision || x.releaseTag,
      lastModified: H,
      originEtag: U.headers.get("ETag") || ""
    });
  }
  async function N(E, w, R, D, x, L, F, I = {}, U = null) {
    if (!w || typeof w.put != "function") return null;
    const V = await C(D, x, L, F, I), X = V?.storedResponse || null;
    return X ? (await w.put(R, X.clone()), V?.vendorManifest?.entries?.length && await m(w, V.vendorManifest, U), X) : null;
  }
  async function P(E, w, R, D, x, L = {}) {
    return Et(Ye(["admin_remote_shell_cold_load", w.url]), () => so(w.url, async () => {
      if (E && typeof E.match == "function") {
        const U = await E.match(w);
        if (U) {
          const V = await e.materializeAdminRemoteShellCachedResponse(U);
          if (V) return {
            storedResponse: V,
            vendorManifest: null,
            loadedFromCache: !0
          };
        }
      }
      const F = await C(R, D, x, null, L), I = F?.storedResponse || null;
      return I ? (E && typeof E.put == "function" && (await E.put(w, I.clone()), F?.vendorManifest?.entries?.length && await m(E, F.vendorManifest, null)), {
        ...F,
        loadedFromCache: !1
      }) : F;
    }));
  }
  return {
    buildAdminRemoteShellStoredResponse: t,
    materializeAdminRemoteShellCachedResponse: r,
    migrateLegacyAdminRemoteShellStoredResponse: a,
    buildAdminRemoteShellClientResponse: o,
    buildAdminReleaseVendorManifestCacheKeyRequest: s,
    buildAdminReleaseVendorAssetCacheKeyRequest: i,
    buildAdminReleaseVendorManifestResponse: c,
    isAcceptedAdminReleaseVendorContentType: l,
    buildAdminReleaseVendorClientResponse: d,
    readAdminReleaseVendorManifestFromCache: u,
    buildAdminReleaseVendorManifestFromSource: f,
    cacheAdminReleaseVendorManifest: m,
    getOrCreateAdminReleaseVendorManifest: p,
    resolveAdminReleaseVendorManifestEntry: h,
    resolveAdminReleaseVendorRouteMatch: g,
    isAdminWarmRoute: y,
    getAdminRemoteShellCachedAt: _,
    shouldRevalidateAdminRemoteShell: S,
    validateAdminShellHtmlSource: T,
    buildAdminShellStoredPayloadFromHtml: b,
    buildAdminLocalIndexUploadRecord: A,
    fetchAdminRemoteShellStoredResponse: C,
    revalidateAdminRemoteShellCache: N,
    loadAdminRemoteShellColdCache: P
  };
}
function Ud(n = {}, e = {}) {
  const { indexRepository: t } = n;
  function r(g = "") {
    const y = String(g || "");
    return y ? `bundled-${ie(y)}` : "";
  }
  async function a(g, y, _, S = Ke(y), T = {}) {
    const b = y?.ASSETS;
    if (!b || typeof b.fetch != "function") return null;
    const A = new URL("/index.html", g.url), C = await b.fetch(new Request(A, {
      method: "GET",
      headers: { Accept: "text/html" }
    }));
    if (!C?.ok) throw new Error(`bundled admin shell fetch failed: HTTP ${Number(C?.status) || 0}`);
    const N = Number.parseInt(String(C.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(N) && N > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`bundled admin shell too large: ${N} bytes`);
    const P = await Pe(C, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
    if (P.exceeded || !P.text) throw new Error(`bundled admin shell payload invalid: ${P.bytes} bytes`);
    const E = e.buildAdminShellState(y, S, T), w = e.buildAdminBootstrapPayload(y, S, T), R = St(y, T), D = A.toString(), x = e.buildAdminShellStoredPayloadFromHtml(P.text, w, S, D, {
      sourceLabel: "bundled admin shell",
      contentType: C.headers.get("Content-Type") || "text/html",
      adminPath: w.adminPath,
      assetRevision: r(P.text),
      lastModified: C.headers.get("Last-Modified") || "Thu, 01 Jan 1970 00:00:00 GMT",
      originEtag: C.headers.get("ETag") || ""
    })?.storedResponse || null;
    if (!x) throw new Error("bundled admin shell response is unavailable");
    return await e.patchAdminShellRuntimeStatus(y, {
      shellState: E,
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
      indexUrl: D,
      indexUrlSource: "worker_assets",
      effectiveRef: "frontend/dist/index.html",
      effectiveRefType: "static_assets"
    }, _), e.requestMatchesAdminHtmlResponse(g, x) ? e.buildConditionalNotModifiedResponseFromStoredResponse(x, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(x, g.method);
  }
  async function o(g, y, _, S = Ke(y), T = {}, b = "index_url_not_configured") {
    const A = St(y, T), C = e.buildAdminShellState(y, S, T), N = e.buildAdminBootstrapPayload(y, S, T), P = Zr(N), E = no(S), w = new URL(g.url).pathname;
    await e.patchAdminShellRuntimeStatus(y, {
      shellState: C,
      initHealth: S,
      indexState: A,
      remoteShellIndexUrl: A.indexUrl,
      mode: "gate",
      sourceType: "setup_gate",
      routeState: "setup_gate",
      remoteCacheState: "bypassed",
      lastFetchStatus: "skipped",
      reason: b,
      requestPath: w
    }, _);
    const R = e.buildAdminIndexSetupContent(N, C, S, T, A), D = e.renderAdminHtmlShell(P, E, R);
    return new Response(g.method === "HEAD" ? null : D, { headers: e.buildAdminHtmlResponseHeaders("", "no-store, max-age=0") });
  }
  function s(g) {
    const y = String(new URL(g.url).searchParams.get("setup") || "").trim().toLowerCase();
    return y === "1" || y === "true";
  }
  async function i(g, y, _, S = Ke(y), T = {}, b = {}) {
    const A = e.buildAdminShellState(y, S, b), C = e.buildAdminBootstrapPayload(y, S, b), N = St(y, b), P = Zr(C), E = no(S), w = new URL(g.url).pathname, R = {
      ...T,
      shellState: A,
      initHealth: S,
      indexState: N,
      remoteShellIndexUrl: T.remoteShellIndexUrl || A.remoteShellIndexUrl || N.indexUrl || "",
      mode: "remote_error",
      sourceType: T.sourceType || "remote_error",
      routeState: T.routeState || "remote_error",
      remoteCacheState: T.remoteCacheState || "bypassed",
      lastFetchStatus: T.lastFetchStatus || "failed",
      reason: T.reason || "remote_shell_render_failed",
      requestPath: w
    }, D = e.buildAdminRemoteShellErrorContent(C, A, S, R);
    await e.patchAdminShellRuntimeStatus(y, R, _);
    const x = e.renderAdminHtmlShell(P, E, D);
    return new Response(g.method === "HEAD" ? null : x, { headers: e.buildAdminHtmlResponseHeaders("", "no-store, max-age=0") });
  }
  async function c(g, y, _, S = Ke(y), T = e.resolveAdminShellIndexUrl(y), b = {}) {
    const A = mr(), C = e.buildAdminShellState(y, S, b), N = e.buildAdminBootstrapPayload(y, S, b), P = St(y, b), E = {
      releaseTag: P.assetRevision || P.releaseTag,
      assetRevision: P.assetRevision || P.releaseTag,
      adminPath: N.adminPath,
      ...P.isLocalUpload ? { loadLocalIndexRecord: () => t.getAdminIndexUploadRecord(t.getKV(y), P.localUploadRevision) } : {}
    }, w = e.buildAdminRemoteShellCacheKeyRequest(g, T, N), R = e.buildAdminRemoteShellLegacyCacheKeyRequest(g, T), D = new URL(g.url).pathname;
    if (A && typeof A.match == "function") {
      const I = await Et(Ye(["admin_remote_shell_cache_read", w.url]), async () => {
        const X = await A.match(w);
        if (X) {
          const M = await e.materializeAdminRemoteShellCachedResponse(X);
          if (M) return {
            storedResponse: M,
            legacyCacheMigrated: !1
          };
        }
        const v = await A.match(R);
        if (!v) return null;
        const O = await ge(e.migrateLegacyAdminRemoteShellStoredResponse(v, T, N, S), "admin.remote_shell_legacy_cache_read", {
          path: D,
          remoteShellIndexUrl: T
        }, null);
        return O ? await so(w.url, async () => {
          const M = await A.match(w);
          if (M) {
            const H = await e.materializeAdminRemoteShellCachedResponse(M);
            if (H) return {
              storedResponse: H,
              legacyCacheMigrated: !1
            };
          }
          return typeof A.put == "function" && await ge(A.put(w, O.clone()), "admin.remote_shell_legacy_cache_migrate", {
            path: D,
            remoteShellIndexUrl: T
          }, null), {
            storedResponse: O,
            legacyCacheMigrated: !0
          };
        }) : null;
      }), U = I === null ? null : I.storedResponse.clone(), V = I !== null && I.legacyCacheMigrated;
      if (U) {
        const X = e.shouldRevalidateAdminRemoteShell(U);
        let v = null;
        if (X) {
          const H = U.clone();
          v = Et(Ye(["admin_remote_shell_revalidate", w.url]), async () => ge(so(w.url, () => e.revalidateAdminRemoteShellCache(g, A, w, T, N, S, H, E, _)), "admin.remote_shell_revalidate", {
            path: D,
            remoteShellIndexUrl: T
          }, null));
        }
        const O = e.patchAdminShellRuntimeStatus(y, {
          shellState: C,
          initHealth: S,
          indexState: P,
          remoteShellIndexUrl: T,
          mode: "remote",
          sourceType: V ? "remote_legacy_cache" : "remote_cache",
          routeState: "remote_active",
          remoteCacheState: V ? X ? "legacy_stale_hit" : "legacy_hit" : X ? "stale_hit" : "hit",
          revalidateDue: X,
          lastFetchStatus: "cached",
          reason: V ? X ? "migrated_legacy_remote_shell_and_scheduled_revalidate" : "migrated_legacy_remote_shell" : X ? "served_cached_remote_shell_and_scheduled_revalidate" : "served_cached_remote_shell",
          requestPath: D,
          throttleStableWrites: !0
        }, null), M = v ? Promise.all([v, O]) : O;
        return _ && typeof _.waitUntil == "function" && _.waitUntil(M), e.requestMatchesAdminHtmlResponse(g, U) ? e.buildConditionalNotModifiedResponseFromStoredResponse(U, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(U, g.method);
      }
    }
    const x = await e.loadAdminRemoteShellColdCache(A, w, T, N, S, E), L = (x?.storedResponse ? {
      ...x,
      storedResponse: x.storedResponse.clone()
    } : x)?.storedResponse || null;
    if (!L) throw new Error("remote admin shell payload missing");
    const F = Et(Ye(["admin_remote_shell_cold_status", w.url]), () => e.patchAdminShellRuntimeStatus(y, {
      shellState: C,
      initHealth: S,
      indexState: P,
      remoteShellIndexUrl: T,
      mode: "remote",
      sourceType: x?.loadedFromCache ? "remote_cache" : "remote_fetch",
      routeState: "remote_active",
      remoteCacheState: x?.loadedFromCache ? "filled_while_waiting" : "miss",
      lastFetchStatus: x?.loadedFromCache ? "cached" : "fetched",
      reason: x?.loadedFromCache ? "served_cache_filled_while_waiting" : "fetched_remote_shell_index",
      requestPath: D
    }, null));
    return _ && typeof _.waitUntil == "function" ? _.waitUntil(F) : await F, e.requestMatchesAdminHtmlResponse(g, L) ? e.buildConditionalNotModifiedResponseFromStoredResponse(L, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(L, g.method);
  }
  function l(g = "Release vendor asset unavailable", y = 502) {
    const _ = new Headers({
      "Content-Type": "text/plain;charset=UTF-8",
      "Cache-Control": "no-store, max-age=0"
    });
    return De(_), new Response(String(g || "Release vendor asset unavailable"), {
      status: y,
      headers: _
    });
  }
  var d = /(?:\/\/[#@]\s*sourceMappingURL=[^\r\n]*|\/\*[#@]\s*sourceMappingURL=[^*]*\*\/)\s*$/;
  function u(g) {
    const y = new TextDecoder().decode(g);
    if (!y.includes("sourceMappingURL")) return g;
    const _ = y.replace(d, "");
    return _ === y ? g : new TextEncoder().encode(_);
  }
  const f = "/vendor", m = /^[a-z0-9]+\.(?:js|css)$/i;
  async function p(g, y, _ = "") {
    const S = String(_ || "").trim();
    if (!m.test(S)) return null;
    const T = g?.ASSETS;
    if (!T || typeof T.fetch != "function") return null;
    let b = null;
    try {
      b = new URL(`${f}/${S}`, y.url);
    } catch {
      return null;
    }
    let A = null;
    try {
      A = await T.fetch(new Request(b, {
        method: "GET",
        headers: { Accept: "*/*" }
      }));
    } catch {
      return null;
    }
    if (!A?.ok) return null;
    const C = await Sa(A, e.ADMIN_RELEASE_VENDOR_MAX_BYTES);
    if (C.exceeded || !C.bytes) return null;
    const N = new Headers({
      "Content-Type": S.toLowerCase().endsWith(".css") ? "text/css; charset=utf-8" : "text/javascript; charset=utf-8",
      "Cache-Control": e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL,
      ETag: e.formatAdminHtmlEtag(S),
      [e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER]: ie(`local:${S}`)
    });
    return new Response(u(C.bodyBytes), {
      status: 200,
      headers: N
    });
  }
  async function h(g, y, _, S = null, T = {}) {
    const b = yt(S?.releaseTag), A = String(S?.assetKey || "").trim();
    if (!b || !A) return l("Release vendor asset not found", 404);
    const C = await p(y, g, A);
    if (C)
      return e.requestMatchesAdminHtmlResponse(g, C) ? e.buildConditionalNotModifiedResponseFromStoredResponse(C, e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL) : e.buildAdminReleaseVendorClientResponse(C, g.method);
    const N = mr(), P = Zu(b);
    if (!P) return l("Local index vendor asset not found", 404);
    const E = P ? await t.getAdminIndexUploadRecord(t.getKV(y), P) : null;
    if (P && !E) return l("Local index vendor asset not found", 404);
    const w = E?.sourceUrl || "";
    if (!w) return l("Release vendor asset not found", 404);
    let R = null;
    E?.manifest ? (R = await e.readAdminReleaseVendorManifestFromCache(N, b, w), R || (R = await e.cacheAdminReleaseVendorManifest(N, E.manifest, _))) : R = await e.getOrCreateAdminReleaseVendorManifest(N, b, w, _);
    const D = e.resolveAdminReleaseVendorManifestEntry(R, A);
    if (!D?.upstreamUrl) return l("Release vendor asset not found", 404);
    const x = e.isMutableJsdelivrGithubAssetUrl(D.upstreamUrl), L = x ? e.ADMIN_RELEASE_VENDOR_MUTABLE_CACHE_CONTROL : e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL, F = e.buildAdminReleaseVendorAssetCacheKeyRequest(b, A, D.upstreamUrl);
    if (!x && N && typeof N.match == "function") {
      const q = await N.match(F);
      if (q)
        return e.requestMatchesAdminHtmlResponse(g, q) ? e.buildConditionalNotModifiedResponseFromStoredResponse(q, L) : e.buildAdminReleaseVendorClientResponse(q, g.method);
    }
    let I = null;
    try {
      I = await ze(D.upstreamUrl, {
        method: "GET",
        headers: { Accept: D.assetKind === "css" ? "text/css, text/plain;q=0.9, */*;q=0.1" : "application/javascript, text/javascript, text/plain;q=0.9, */*;q=0.1" }
      });
    } catch (q) {
      return l(`Release vendor asset fetch failed: ${String(q?.message || q || "unknown_error").trim() || "unknown_error"}`, 502);
    }
    if (!I.ok) return l(I.status === 404 ? "Release vendor asset not found" : `Release vendor asset fetch failed (HTTP ${I.status})`, I.status === 404 ? 404 : 502);
    const U = String(I.headers.get("Content-Type") || "").trim();
    if (!e.isAcceptedAdminReleaseVendorContentType(U, D.assetKind)) return l(`Release vendor asset content-type invalid: ${U || "unknown"}`, 502);
    const V = Number.parseInt(String(I.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(V) && V > e.ADMIN_RELEASE_VENDOR_MAX_BYTES) return l(`Release vendor asset too large: ${V} bytes`, 502);
    const X = await Sa(I, e.ADMIN_RELEASE_VENDOR_MAX_BYTES), v = X.bytes;
    if (X.exceeded || !v || v > e.ADMIN_RELEASE_VENDOR_MAX_BYTES) return l(`Release vendor asset payload invalid: ${v} bytes`, 502);
    const O = new Headers({ "Cache-Control": L }), M = e.normalizeEtagToken(I.headers.get("ETag") || ""), H = e.normalizeAdminHttpDateHeader(I.headers.get("Last-Modified") || "");
    U && O.set("Content-Type", U), M && O.set("ETag", e.formatAdminHtmlEtag(M)), H && O.set("Last-Modified", H), O.set(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER, String($())), O.set(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER, ie(D.upstreamUrl));
    const j = new Response(u(X.bodyBytes), {
      status: 200,
      headers: O
    });
    if (!x && N && typeof N.put == "function") {
      const q = ge(N.put(F, j.clone()), "admin.release_vendor_cache_write", {
        releaseTag: b,
        assetKey: A
      }, null);
      _ && typeof _.waitUntil == "function" ? _.waitUntil(q) : await q;
    }
    return e.requestMatchesAdminHtmlResponse(g, j) ? e.buildConditionalNotModifiedResponseFromStoredResponse(j, L) : e.buildAdminReleaseVendorClientResponse(j, g.method);
  }
  return {
    renderBundledAdminPage: a,
    renderAdminIndexSetupPage: o,
    isAdminIndexSetupForced: s,
    renderAdminRemoteShellErrorPage: i,
    renderRemoteAdminPage: c,
    buildAdminReleaseVendorErrorResponse: l,
    renderAdminReleaseVendorAsset: h
  };
}
function ic(n = {}) {
  return {
    ...wi,
    ...ma,
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    ...n
  };
}
function ne(n, e = 200, t = {}) {
  return new Response(JSON.stringify(n), {
    status: e,
    headers: ic(t)
  });
}
function z(n, e, t = 400, r = null, a = {}) {
  const o = {
    ok: !1,
    error: {
      code: n,
      message: e
    }
  };
  return r != null && (o.error.details = r), ne(o, t, a);
}
async function kd(n) {
  const e = new Headers(n.headers || {});
  if (e.set("Content-Type", "application/json; charset=utf-8"), e.set("Cache-Control", "no-store, max-age=0"), Object.entries(ma).forEach(([c, l]) => e.set(c, l)), De(e), n.ok) return new Response(n.body, {
    status: n.status,
    headers: e
  });
  const t = await Pe(n, bn);
  let r = null;
  const a = t.text;
  try {
    r = JSON.parse(a);
  } catch {
  }
  const o = r?.error?.code || (typeof r?.error == "string" ? r.error.toUpperCase() : `HTTP_${n.status}`), s = r?.error?.message || r?.message || (typeof r?.error == "string" ? r.error : a || n.statusText || "request_failed"), i = r?.error?.details ?? r?.details ?? null;
  return z(o, s, n.status || 500, i);
}
function Ur(n = "") {
  return String(n || "").trim().toLowerCase() === "simplified" ? "simplified" : "legacy";
}
function cc(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "balanced" ? "balanced" : e === "aggressive" ? "aggressive" : "compat";
}
function Go(n = {}) {
  const e = n?.enableH2 === !0, t = n?.enableH3 === !0;
  return !e && !t ? "compat" : n?.peakDowngrade === !1 ? "aggressive" : "balanced";
}
var lc = Object.freeze([
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
function uc(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "summary" || e === "kv" || e === "d1" ? e : "";
}
function Hd(n = []) {
  const e = [], t = /* @__PURE__ */ new Set();
  for (const r of Array.isArray(n) ? n : [n]) {
    const a = uc(r);
    !a || t.has(a) || (t.add(a), e.push(a));
  }
  return e;
}
function $d(n = {}) {
  return lc.some(({ configKey: e }) => _a(n, e));
}
function dc(n = {}, e = n) {
  const t = n && typeof n == "object" ? n : {}, r = e && typeof e == "object" ? e : {};
  return t.tgDailyReportEnabled === !0 && !$d(r);
}
function Bd(n = {}, e = {}) {
  const t = n && typeof n == "object" ? n : {};
  return dc(t, e && typeof e == "object" ? e : {}) ? (t.tgDailyReportSummaryEnabled = !0, t.tgDailyReportKvEnabled = !1, t.tgDailyReportD1Enabled = !1, t) : (t.tgDailyReportSummaryEnabled = t.tgDailyReportSummaryEnabled === !0, t.tgDailyReportKvEnabled = t.tgDailyReportKvEnabled === !0, t.tgDailyReportD1Enabled = t.tgDailyReportD1Enabled === !0, t);
}
function fc(n = {}, e = n, t = {}) {
  const r = n && typeof n == "object" ? n : {}, a = Hd(t?.reportKinds);
  if (a.length > 0) return a;
  const o = lc.filter(({ configKey: s }) => r[s] === !0).map(({ kind: s }) => s);
  return o.length > 0 ? o : t?.fallbackAllWhenLegacy === !0 && dc(r, e) ? ["summary"] : [];
}
function Kd(n = {}) {
  return Ur(n?.routingDecisionMode);
}
function kr(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "legacy" || e === "simplified" ? e : "inherit";
}
function zd(n = {}, e = {}) {
  const t = kr(n?.routingDecisionMode);
  return t === "inherit" ? Kd(e) : t;
}
function ur(n) {
  const e = String(n ?? "").trim();
  if (!e) return "";
  if (!/^\d{1,5}$/.test(e)) return null;
  const t = Number(e);
  return !Number.isInteger(t) || t < 1 || t > 65535 ? null : String(t);
}
function Wd(n) {
  return n === "http:" ? "80" : n === "https:" ? "443" : "";
}
function Gd(n) {
  const e = String(n?.username || ""), t = String(n?.password || "");
  return !e && !t ? "" : `${e}${t ? `:${t}` : ""}@`;
}
function Vd(n, e = "") {
  if (!(n instanceof URL)) return "";
  const t = String(n.protocol || "").trim().toLowerCase();
  if (!["http:", "https:"].includes(t)) return "";
  const r = ur(e);
  if (r === null) return "";
  const a = String(n.hostname || "").trim();
  if (!a) return "";
  const o = String(n.pathname || "/") || "/", s = String(n.search || ""), i = String(n.hash || "");
  return `${t}//${Gd(n)}${a}${r ? `:${r}` : ""}${o}${s}${i}`.replace(/\/$/, "");
}
function Ns(n, e = "", t = "") {
  const r = String(n || "").trim();
  if (!r) return null;
  try {
    const a = new URL(r);
    if (!["http:", "https:"].includes(a.protocol)) return null;
    const o = ur(a.port), s = ur(e), i = ur(t);
    return o === null || s === null || i === null ? null : Vd(a, o || s || i || Wd(a.protocol)) || null;
  } catch {
    return null;
  }
}
function jd(n = "") {
  const e = String(n || "").trim();
  if (!e) return !1;
  try {
    const t = new URL(e);
    if (!["http:", "https:"].includes(t.protocol)) return !1;
    const r = e.match(/^[a-z][a-z0-9+.-]*:\/\/([^/?#]*)/i);
    if (!r) return !1;
    let a = String(r[1] || "");
    const o = a.lastIndexOf("@");
    if (o >= 0 && (a = a.slice(o + 1)), !a) return !1;
    if (a.startsWith("[")) {
      const s = a.indexOf("]");
      return s < 0 ? !1 : /^:\d+$/.test(a.slice(s + 1));
    }
    return /:\d+$/.test(a);
  } catch {
    return !1;
  }
}
function Ds(n = "") {
  const e = String(n || "").trim();
  if (!e) return !1;
  try {
    const t = new URL(e);
    return ["http:", "https:"].includes(t.protocol) ? !jd(e) : !1;
  } catch {
    return !1;
  }
}
function Ee(n) {
  return JSON.stringify(String(n ?? ""));
}
function Ct(n = "/") {
  const e = Z(n || "/");
  return e === "/" ? "" : e.replace(/\/+$/, "");
}
function Ua(n) {
  try {
    const e = n instanceof URL ? n : new URL(String(n || ""));
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
function qe(n) {
  return Qe(n) ? String(n.absoluteBasePrefix || n.originText || "").trim() : "";
}
function qd(n = []) {
  return ie(ae((Array.isArray(n) ? n : []).map((e) => qe(e)).filter(Boolean)));
}
function Xd(n = []) {
  return new Set((Array.isArray(n) ? n : []).map((e) => qe(e)).filter(Boolean)).size;
}
function ka(n = "", e = B.Defaults.HedgeProbePath) {
  const t = String(n || e || "").trim() || String(e || "/emby/system/ping").trim() || "/emby/system/ping";
  try {
    return Z(new URL(t, "https://hedge-probe.invalid").pathname || "/");
  } catch {
    return Z(t);
  }
}
function ga(n = "") {
  const e = String(n || "").trim();
  return e ? ka(e, B.Defaults.HedgeProbePath) : "";
}
function Qe(n) {
  return !!n && typeof n == "object" && n.targetUrl instanceof URL && typeof n.originText == "string" && typeof n.normalizedBasePath == "string" && typeof n.absoluteBasePrefix == "string";
}
function Is(n = "") {
  const e = String(n || "");
  return e ? e.startsWith("?") ? e : `?${e}` : "";
}
function Yd(n = "GET", e = {}, t = {}) {
  const r = String(n || "GET").toUpperCase();
  return !(r !== "GET" && r !== "HEAD" || e?.isSegment !== !0 || e?.isWsUpgrade === !0 || t.playbackRelayTargetUrl instanceof URL || t.protocolFallbackRetry === !0 || t.isExternalRedirect === !0);
}
var Vo = ["proxyMode", "mode"], jo = [
  "direct",
  "sourceDirect",
  "directSource",
  "direct2xx"
], Jd = [
  "wangpanMode",
  "videoThrottling",
  "interceptMs"
], mc = "__playback-relay", pc = "__pb_target", io = "__pb_abs", co = Object.freeze({
  main: "",
  proxy_a: "__proxy-a",
  proxy_b: "__proxy-b"
});
function Qd(n = {}) {
  const e = n && typeof n == "object" && !Array.isArray(n) ? n : {}, t = [];
  let r = !1;
  const a = ur(e.port), o = Array.isArray(e.lines) ? e.lines.reduce((i, c) => i + (ur(c?.port) ? 1 : 0), 0) : 0, s = Array.isArray(e.lines) && e.lines.length ? e.lines.reduce((i, c) => ur(c?.port) || a ? i : i + (Ds(c?.target) ? 1 : 0), 0) : a ? 0 : String(e.target || "").split(",").map((i) => i.trim()).filter(Boolean).reduce((i, c) => i + (Ds(c) ? 1 : 0), 0);
  for (const i of Vo) {
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
  for (const i of jo)
    Object.prototype.hasOwnProperty.call(e, i) && (t.push(i), e[i] === !0 && (r = !0));
  for (const i of Jd)
    Object.prototype.hasOwnProperty.call(e, i) && t.push(i);
  return {
    legacyKeysPresent: ar(t),
    shouldAddToSourceDirectNodes: r,
    topLevelPortPresent: a !== null && a !== "",
    linePortCount: o,
    defaultPortNodePresent: s > 0,
    defaultPortLineCount: s
  };
}
function Zd(n, e = {}) {
  const t = Gr(n);
  return {
    mode: t,
    forceVideoDirect: t === "direct",
    forceVideoProxy: t === "proxy"
  };
}
function ef(n = {}) {
  return Ni(n?.defaultMediaAuthMode);
}
function nn(n = {}) {
  return _a(n, "defaultPlaybackInfoMode") ? qt(n?.defaultPlaybackInfoMode) : Reflect.get(n, "playbackInfoAutoProxy") !== void 0 ? Reflect.get(n, "playbackInfoAutoProxy") !== !1 ? "rewrite" : "passthrough" : Reflect.get(n, "playbackInfoBlockWangpanProxy") !== void 0 ? "rewrite" : B.Defaults.DefaultPlaybackInfoMode;
}
function tf(n = {}) {
  return qt(nn(n));
}
function rf(n = {}) {
  return Po(n?.defaultRealClientIpMode);
}
function af(n = {}, e = {}) {
  const t = n || {}, r = n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, "mediaAuthMode") ? Gt(t.mediaAuthMode) : "auto";
  return r === "inherit" ? ef(e) : r;
}
function nf(n = {}, e = {}) {
  const t = n || {}, r = n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, "playbackInfoMode") ? xr(t.playbackInfoMode) : "inherit";
  return r === "inherit" ? tf(e) : r;
}
function of(n = {}, e = {}) {
  const t = n || {}, r = n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, "realClientIpMode") ? Pr(t.realClientIpMode) : "forward";
  return r === "inherit" ? rf(e) : r;
}
function sf(n = {}, e = {}) {
  const t = n || {};
  return (n && typeof n == "object" && Object.prototype.hasOwnProperty.call(n, "hedgeProbePath") ? ga(t.hedgeProbePath) : "") || ka(e?.hedgeProbePath, B.Defaults.HedgeProbePath);
}
function cf(n) {
  const e = Po(typeof n == "string" ? n : n?.realClientIpMode);
  return e === "forward" ? "full" : e === "strip" ? "real-ip-only" : e === "disable" ? "none" : "full";
}
function gc(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "proxy_a" || e === "__proxy-a" ? "proxy_a" : e === "proxy_b" || e === "__proxy-b" ? "proxy_b" : "main";
}
function lf(n = "main") {
  return co[gc(n)] || "";
}
function hc(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e ? e === co.proxy_a ? "proxy_a" : e === co.proxy_b ? "proxy_b" : "main" : "main";
}
function Nr(n = "") {
  const e = String(n || "");
  if (!e) return {
    linkVariant: "main",
    remaining: "",
    needsTrailingSlashRedirect: !1
  };
  const t = e.startsWith("/") ? e : "/" + e, r = t.split("/"), a = hc(at(r[1] || ""));
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
function Sr(n = {}) {
  return n.ENI_KV || n.KV || n.EMBY_KV || n.EMBY_PROXY || null;
}
function uf(n = {}) {
  return n.DB || n.D1 || n.PROXY_LOGS || null;
}
var df = 16 * 1024;
async function _t(n, e) {
  const t = new TextEncoder(), r = Date.now();
  let a = ee.CryptoKeyCache.get(n);
  for ((!a || a.exp <= r) && (a = {
    key: await Yn().importKey("raw", t.encode(n), {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["sign"]),
    exp: r + B.Defaults.CryptoKeyCacheTTL * 1e3
  }), ee.CryptoKeyCache.has(n) && ee.CryptoKeyCache.delete(n), ee.CryptoKeyCache.set(n, a); ee.CryptoKeyCache.size > B.Defaults.CryptoKeyCacheMax; ) {
    const s = ee.CryptoKeyCache.keys().next().value;
    if (s === void 0) break;
    ee.CryptoKeyCache.delete(s);
  }
  const o = await Yn().sign("HMAC", a.key, t.encode(e));
  return btoa(String.fromCharCode(...new Uint8Array(o))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
var ff = class {
  constructor({ actionHandlers: n, bindingService: e, configReader: t, repository: r, requestModel: a, shellService: o }) {
    this.actionHandlers = Object.freeze({ ...n }), this.bindingService = e, this.configReader = t, this.repository = r, this.requestModel = a, this.shellService = o, this.actionAliases = Object.freeze({
      import: "saveOrImport",
      save: "saveOrImport"
    }), this.#t();
  }
  async handle(n, e, t) {
    const r = this.#c(n, e), { requestHost: a, configuredHost: o, configuredLegacyHost: s } = r, i = n.method, c = i === "GET" || i === "HEAD";
    if (c && r.pathnameLower === "/favicon.ico") return this.#_(i);
    const l = await this.configReader.getRuntimeConfig(e), d = !!(s && s !== o && a === s), u = l.enableHostPrefixProxy === !0 && !!o && !d, f = u ? vo(a, o) : null, m = !!(u && a !== o && a.endsWith(`.${o}`));
    if (f || m) return null;
    if (i === "GET" && r.normalizedPathname === "/") return this.#m(e, r.initHealth);
    const p = c ? this.#b(r.normalizedPathname, r.adminPath) : null;
    if (p)
      return await this.#a(n, e) ? this.#y(n, e, t, p, l) : this.#T("Unauthorized", 401);
    if (c && this.#E(r.normalizedPathname, r.adminPath))
      return await this.#a(n, e) ? this.#S(n, e, r.initHealth, l) : this.#g(n, r.adminLoginPath);
    if (c && Lr(r.pathnameLower, r.adminLoginPathLower))
      return await this.#a(n, e) ? this.#g(n, r.adminPath) : this.#p(n, e, r.initHealth);
    if (c && Lr(r.pathnameLower, r.adminPathLower))
      return await this.#a(n, e) ? this.#h(n, e, t, r.initHealth) : this.#g(n, r.adminLoginPath);
    if (i === "OPTIONS" && this.#r(r)) return this.#i(n, e, null);
    if (i === "POST" && (Lr(r.pathnameLower, r.adminLoginPathLower) || this.#n(r))) return this.#u(n, e);
    if (i !== "POST" || !Lr(r.pathnameLower, r.adminPathLower)) return null;
    if (!await this.#a(n, e)) return z("UNAUTHORIZED", "未授权", 401);
    try {
      return await kd(await this.#s(n, e, t));
    } catch (h) {
      const g = lu(h, {
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
    for (const [n, e] of Object.entries(this.actionHandlers)) {
      if (!this.#e(n)) throw new TypeError("Admin action names cannot be empty");
      if (typeof e != "function") throw new TypeError(`Admin action ${n} is not a function`);
    }
    for (const [n, e] of Object.entries(this.actionAliases)) if (!this.actionHandlers[e]) throw new Error(`Admin action alias ${n} targets missing action ${e}`);
  }
  #e(n) {
    return String(n || "").trim();
  }
  #o(n) {
    const e = this.#e(n), t = this.actionAliases[e] || e;
    return this.actionHandlers[t] || null;
  }
  async #s(n, e, t) {
    const r = this.bindingService.getKV(e);
    if (!r) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
    let a;
    try {
      const i = await Pe(n, Zi);
      if (i.exceeded) return z("REQUEST_TOO_LARGE", "请求体过大", 413);
      a = JSON.parse(i.text || "");
    } catch {
      return z("INVALID_JSON", "请求 JSON 无效", 400);
    }
    const o = this.requestModel.normalizeAdminActionRequest(a);
    if (!o) return z("INVALID_REQUEST", "请求体必须是 JSON 对象", 400);
    const s = this.#o(o.action);
    return s ? s(o.data, {
      action: o.action,
      meta: o.meta,
      request: n,
      env: e,
      ctx: t,
      kv: r,
      db: this.bindingService.getDB(e)
    }) : z("INVALID_ACTION", "未知的管理动作", 400, { action: o.action || null });
  }
  #n(n) {
    return n.adminPathLower === "/admin" && n.pathnameLower === "/api/auth/login" && n.root === "api" && n.segments[1] === "auth" && n.segments[2] === "login";
  }
  #r(n) {
    return ac(n.pathnameLower, n.adminPathLower) || Lr(n.pathnameLower, n.adminLoginPathLower) || this.#n(n);
  }
  #i(n, e, t, r = 200) {
    return this.shellService.buildEdgeCorsResponse(aa(e, n), t, r, { mergeOriginVary: !0 });
  }
  #c(n, e) {
    const t = new URL(n.url), r = oe(t.hostname), a = Z(t.pathname), o = a.toLowerCase(), s = ft(e), i = s.toLowerCase(), c = Rn(s), l = c.toLowerCase(), d = oc(e, {
      adminPath: s,
      loginPath: c
    }), u = a.split("/").filter(Boolean), f = u[0] || "", m = at(f).toLowerCase();
    return {
      initHealth: d,
      requestUrl: t,
      requestHost: r,
      configuredHost: Ge(e),
      configuredLegacyHost: qr(e),
      normalizedPathname: a,
      pathnameLower: o,
      adminPath: s,
      adminPathLower: i,
      adminLoginPath: c,
      adminLoginPathLower: l,
      segments: u,
      rootRaw: f,
      root: m
    };
  }
  async #u(n, e) {
    const t = n.headers.get("cf-connecting-ip") || "unknown", r = this.repository.getDB(e), a = Id(e), o = await this.configReader.getRuntimeConfig(e), s = Math.max(1, parseInt(o.jwtExpiryDays) || 30) * 86400;
    try {
      const i = await ge(this.repository.getAuthFailureEntry(r, t), "auth.login.read_auth_failure", { ip: t }, null), c = Math.max(0, Number(i?.failCount) || 0);
      if (c >= B.Defaults.MaxLoginAttempts) return z("TOO_MANY_ATTEMPTS", "账户已锁定，请稍后再试", 429);
      let l = "";
      if ((n.headers.get("content-type") || "").includes("application/json")) {
        const u = await Pe(n, df);
        if (u.exceeded) return z("REQUEST_TOO_LARGE", "请求体过大", 413);
        const f = JSON.parse(u.text || "{}");
        l = typeof f.password == "string" ? f.password : "";
      }
      if (!e.JWT_SECRET) return z("SERVER_MISCONFIGURED", "JWT_SECRET 未配置", 503);
      if (!e.ADMIN_PASS) return z("SERVER_MISCONFIGURED", "ADMIN_PASS 未配置", 503);
      if (l && l === e.ADMIN_PASS) {
        i && await ge(this.repository.deleteAuthFailureEntry(r, t), "auth.login.clear_auth_failure", { ip: t }, !1);
        const u = await this.#d(e.JWT_SECRET, s);
        return ne({
          ok: !0,
          expiresIn: s
        }, 200, { "Set-Cookie": `auth_token=${u}; Path=${a}; Max-Age=${s}; HttpOnly; Secure; SameSite=Strict` });
      }
      const d = c + 1;
      return await ge(this.repository.upsertAuthFailureEntry(r, t, {
        failCount: d,
        expiresAt: $() + B.Defaults.LoginLockDuration * 1e3
      }), "auth.login.write_auth_failure", {
        ip: t,
        nextFailCount: d
      }, null), ne({
        ok: !1,
        error: {
          code: "INVALID_PASSWORD",
          message: "密码错误"
        },
        remain: Math.max(0, B.Defaults.MaxLoginAttempts - d)
      }, 401);
    } catch (i) {
      return z("INVALID_REQUEST", "请求无效", 400, { reason: i.message });
    }
  }
  async #a(n, e) {
    try {
      const t = e.JWT_SECRET;
      if (!t) return !1;
      const r = n.headers.get("Authorization") || "";
      let a = r.startsWith("Bearer ") ? r.slice(7) : null;
      if (!a) {
        const o = (n.headers.get("Cookie") || "").match(/(?:^|;\s*)auth_token=([^;]+)/);
        a = o ? o[1] : null;
      }
      return a ? await this.#f(a, t) : !1;
    } catch {
      return !1;
    }
  }
  async #d(n, e) {
    const t = btoa(JSON.stringify({
      alg: "HS256",
      typ: "JWT"
    })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""), r = btoa(JSON.stringify({
      sub: "admin",
      exp: Math.floor(Date.now() / 1e3) + e
    })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return `${t}.${r}.${await this.#l(n, `${t}.${r}`)}`;
  }
  async #f(n, e) {
    const t = n.split(".");
    if (t.length !== 3 || t[2] !== await this.#l(e, `${t[0]}.${t[1]}`)) return !1;
    try {
      return JSON.parse(atob(t[1].replace(/-/g, "+").replace(/_/g, "/"))).exp > Math.floor(Date.now() / 1e3);
    } catch {
      return !1;
    }
  }
  async #l(n, e) {
    return _t(n, e);
  }
  #m(n, e) {
    return this.shellService.renderLandingPage(n, e);
  }
  #p(n, e, t) {
    return this.shellService.renderAdminLoginPage(n, e, t);
  }
  #h(n, e, t, r) {
    return this.shellService.renderAdminPage(n, e, t, r);
  }
  #y(n, e, t, r, a) {
    return this.shellService.renderAdminReleaseVendorAsset(n, e, t, r, a);
  }
  #S(n, e, t, r) {
    return this.shellService.renderAdminWarmResponse(n, e, t, r);
  }
  #_(n) {
    return this.shellService.renderFaviconResponse(n);
  }
  #b(n, e) {
    return this.shellService.resolveAdminReleaseVendorRouteMatch(n, e);
  }
  #E(n, e) {
    return this.shellService.isAdminWarmRoute(n, e);
  }
  #g(n, e) {
    return this.shellService.buildRequestPathRedirectResponse(n, e);
  }
  #T(...n) {
    return this.shellService.buildAdminReleaseVendorErrorResponse(...n);
  }
};
function yc(n = "", e = "") {
  const t = String(n || "").trim().toLowerCase(), r = String(e || "").trim().toLowerCase();
  return r === "image" || t.includes("/images/") || t.includes("/emby/covers/") || /\.(jpe?g|png|webp|gif)(?:$|[?#])/.test(t) ? "image_poster" : t.includes("/sessions/playing") || t.includes("/playbackinfo") ? "playback_info" : t.includes("/users/authenticate") ? "auth" : t.includes("/items/") || t.includes("/shows/") || t.includes("/movies/") || t.includes("/users/") ? "media_metadata" : r || "api";
}
function Sc(n = {}, e = {}, t = {}) {
  if (e.requestMethod === "OPTIONS") return !1;
  const r = yc(e.requestPath, e.category);
  if (r === "image_poster" && n?.logWriteImagePoster !== !0 || r === "media_metadata" && n?.logWriteMediaMetadata !== !0) return !1;
  if (t.statusFinal === !1) return !0;
  const a = Number(e.statusCode) || 0;
  return !(qo(n?.logWriteMode) === "error" && (a < 400 || a >= 600));
}
function mf(n = "", e = "") {
  return yc(n, e) === "playback_info";
}
function pf(n = "", e = "") {
  const t = String(n || "").trim().toLowerCase(), r = String(e || "").trim().toLowerCase();
  return r === "stream" || r === "segment" || r === "manifest" ? !0 : /\/stream(?:$|[/?])/.test(t) || t.includes("/master.m3u8") || /\/videos\/[^/]+\/(?:original|download|file)(?:$|[/?])/.test(t) || /\/items\/[^/]+\/download(?:$|[/?])/.test(t) || t.includes("static=true") || t.includes("download=true");
}
function _c(n) {
  return String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_") === "poster_manifest" ? "poster_manifest" : "poster";
}
function bc(n) {
  const e = String(n || "").trim().toLowerCase();
  return e === "fts" ? "fts" : e === "like" ? "like" : B.Defaults.LogSearchMode;
}
function qo(n) {
  return String(n || "").trim().toLowerCase() === "error" ? "error" : B.Defaults.LogWriteMode;
}
function gf(n) {
  const e = String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "playback" || e === "playback_info" ? "playback_info" : e === "image" ? "image" : e === "api" ? "api" : e === "auth" ? "auth" : "";
}
function hf(n) {
  const e = String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "4xx" || e === "status_4xx" ? "4xx" : e === "5xx" || e === "status_5xx" ? "5xx" : "";
}
function Ms(n) {
  const e = String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "direct" ? "direct" : e === "proxy" || e === "proxied" ? "proxy" : "";
}
function yf(n = "") {
  const e = String(n || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "connect_timeout" ? "connect_timeout" : e === "idle_timeout" ? "idle_timeout" : e === "tls_handshake_failed" ? "tls_handshake_failed" : e === "http_version_fallback" ? "http_version_fallback" : e === "redirect_loop" ? "redirect_loop" : e === "redirect_limit_exceeded" ? "redirect_limit_exceeded" : e === "range_unsatisfied" ? "range_unsatisfied" : e === "upstream_4xx" ? "upstream_4xx" : e === "upstream_5xx" ? "upstream_5xx" : e === "unknown_fetch_error" ? "unknown_fetch_error" : "";
}
var Sf = Object.freeze({
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
function _f(n) {
  const e = Math.trunc(Number(n) || 0);
  if (!Number.isFinite(e) || e <= 0) return {
    code: null,
    text: null
  };
  const t = Sf[e];
  return t ? {
    code: t.code,
    text: t.text
  } : {
    code: null,
    text: null
  };
}
function bf(n) {
  const e = String(n || "").trim();
  return e ? /\b(?:AND|OR|NOT|NEAR)\b/i.test(e) || /(?:^|\s)(?:node_name|request_path|user_agent|error_detail)\s*:/i.test(e) || /(?:^|\s)[^\s"]+\*/.test(e) ? !0 : /^"(?:[^"]|"")+"$/.test(e) : !1;
}
function Ec(n) {
  return `"${String(n || "").replace(/"/g, '""')}"`;
}
function Ef(n) {
  return `${Ec(n)}*`;
}
function Tf(n) {
  return String(n || "").replace(/(^|\s)((?:node_name|request_path|user_agent|error_detail)\s*:\s*)([^"\s()]+)(?=\s|$)/gi, (e, t, r, a) => `${t}${r}${Ec(a)}`);
}
function Af(n) {
  const e = String(n || "").trim();
  return e ? bf(e) ? Tf(e) : e.split(/\s+/).filter(Boolean).map((t) => Ef(t)).join(" AND ") : "";
}
function Tc(n = null) {
  if (!n || typeof n != "object") return null;
  const e = Math.floor(Number(n.timestamp)), t = Math.floor(Number(n.id));
  return !Number.isFinite(e) || !Number.isFinite(t) || e < 0 || t < 0 ? null : {
    timestamp: e,
    id: t
  };
}
function Rf(n = null) {
  return Tc({
    timestamp: Number(n?.timestamp),
    id: Number(n?.id)
  });
}
function de(n) {
  return `"${String(n || "").replace(/"/g, '""')}"`;
}
function Dr(n) {
  return String(n || "").toLowerCase().replace(/["`[\]]/g, "").replace(/\s+/g, " ").trim();
}
function Xo(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "paid" ? "paid" : e === "free" ? "free" : "";
}
function _r(n = "") {
  const e = String(n || "").trim().toUpperCase();
  return e === "A" || e === "AAAA" || e === "CNAME";
}
function qa(n, e, t = {}) {
  const r = String(n || "").trim().toUpperCase(), a = String(e || "").trim(), o = t.allowCname !== !1;
  if (!_r(r)) return "Type 仅允许 A / AAAA / CNAME";
  if (!o && r === "CNAME") return "A 模式仅允许 A / AAAA";
  if (!a) return "Content 不能为空";
  if (r === "A" && !va(a)) return "A 记录 Content 必须是合法 IPv4 地址";
  if (r === "AAAA" && !Tn(a)) return "AAAA 记录 Content 必须是合法 IPv6 地址";
  if (r === "CNAME") {
    if (/\s/.test(a)) return "CNAME 记录 Content 不能包含空格";
    if (a.length > 255) return "CNAME 记录 Content 过长";
  }
  return "";
}
function Cf(n = "") {
  const e = String(n || "").trim();
  return e ? qa("CNAME", e) ? "" : e : "";
}
var wf = [
  "logIncludeClientIp",
  "logIncludeColo",
  "logIncludeUa"
], Lf = [
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
], Ac = ["directSourceNodes", "nodeDirectList"], Nf = ["sourceSameOriginProxy", "forceExternalProxy"], Rc = [
  "enableH2",
  "enableH3",
  "peakDowngrade"
], Ps = [
  ...wf,
  ...Lf,
  ...Ac,
  ...Nf,
  ...Rc
], Cc = {
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
      fallback: B.Defaults.LogRetentionDays,
      min: 1,
      max: B.Defaults.LogRetentionDaysMax
    },
    logFlushCountThreshold: {
      fallback: B.Defaults.LogFlushCountThreshold,
      min: 1,
      max: 5e3
    },
    logBatchChunkSize: {
      fallback: B.Defaults.LogBatchChunkSize,
      min: 1,
      max: 100
    },
    logBatchRetryCount: {
      fallback: B.Defaults.LogBatchRetryCount,
      min: 0,
      max: 5
    },
    logBatchRetryBackoffMs: {
      fallback: B.Defaults.LogBatchRetryBackoffMs,
      min: 0,
      max: 5e3
    },
    scheduledLeaseMs: {
      fallback: B.Defaults.ScheduledLeaseMs,
      min: B.Defaults.ScheduledLeaseMinMs,
      max: 900 * 1e3
    },
    uiRadiusPx: {
      fallback: B.Defaults.UiRadiusPx,
      min: 0,
      max: 48
    },
    tgAlertDroppedBatchThreshold: {
      fallback: B.Defaults.TgAlertDroppedBatchThreshold,
      min: 0,
      max: 5e3
    },
    tgAlertFlushRetryThreshold: {
      fallback: B.Defaults.TgAlertFlushRetryThreshold,
      min: 0,
      max: 10
    },
    tgAlertKvUsageThresholdPercent: {
      fallback: B.Defaults.TgAlertKvUsageThresholdPercent,
      min: 1,
      max: 100
    },
    tgAlertD1UsageThresholdPercent: {
      fallback: B.Defaults.TgAlertD1UsageThresholdPercent,
      min: 1,
      max: 100
    },
    tgAlertCooldownMinutes: {
      fallback: B.Defaults.TgAlertCooldownMinutes,
      min: 1,
      max: 1440
    },
    cacheTtlImages: {
      fallback: B.Defaults.CacheTtlImagesDays,
      min: 0,
      max: 365
    },
    pingTimeout: {
      fallback: B.Defaults.PingTimeoutMs,
      min: 1e3,
      max: 18e4
    },
    pingCacheMinutes: {
      fallback: B.Defaults.PingCacheMinutes,
      min: 0,
      max: 1440
    },
    hedgeProbeTimeoutMs: {
      fallback: B.Defaults.HedgeProbeTimeoutMs,
      min: 250,
      max: 1e4
    },
    hedgeProbeParallelism: {
      fallback: B.Defaults.HedgeProbeParallelism,
      min: 1,
      max: 2
    },
    hedgeWaitTimeoutMs: {
      fallback: B.Defaults.HedgeWaitTimeoutMs,
      min: 250,
      max: 1e4
    },
    hedgeLockTtlMs: {
      fallback: B.Defaults.HedgeLockTtlMs,
      min: 1e3,
      max: 1e4
    },
    hedgePreferredTtlSec: {
      fallback: B.Defaults.HedgePreferredTtlSec,
      min: 30,
      max: 3600
    },
    hedgeFailureCooldownSec: {
      fallback: B.Defaults.HedgeFailureCooldownSec,
      min: 1,
      max: 300
    },
    hedgeWakeJitterMs: {
      fallback: B.Defaults.HedgeWakeJitterMs,
      min: 0,
      max: 1e3
    },
    cfQuotaPlanCacheMinutes: {
      fallback: B.Defaults.CfQuotaPlanCacheMinutes,
      min: 1,
      max: 1440
    },
    upstreamTimeoutMs: {
      fallback: B.Defaults.UpstreamTimeoutMs,
      min: 0,
      max: 18e4
    },
    upstreamRetryAttempts: {
      fallback: B.Defaults.UpstreamRetryAttempts,
      min: 0,
      max: 3
    },
    prewarmCacheTtl: {
      fallback: B.Defaults.PrewarmCacheTtl,
      min: 0,
      max: 3600
    },
    prewarmPrefetchBytes: {
      fallback: B.Defaults.PrewarmPrefetchBytes,
      min: 0,
      max: Bo
    },
    playbackInfoCacheTtlSec: {
      fallback: B.Defaults.PlaybackInfoCacheTtlSec,
      min: 0,
      max: 60
    },
    videoProgressForwardIntervalSec: {
      fallback: B.Defaults.VideoProgressForwardIntervalSec,
      min: 0,
      max: 60
    },
    scheduleUtcOffsetMinutes: {
      fallback: B.Defaults.ScheduleUtcOffsetMinutes,
      min: -720,
      max: 840
    }
  },
  numberFields: { logWriteDelayMinutes: {
    fallback: B.Defaults.LogFlushDelayMinutes,
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
function Df(n = {}, e = {}) {
  for (const [t, r] of Object.entries(e.aliasFields || {}))
    if (!(n[t] !== void 0 && n[t] !== null) && Array.isArray(r)) {
      for (const a of r)
        if (!(n[a] === void 0 || n[a] === null)) {
          n[t] = n[a];
          break;
        }
    }
  return n;
}
function If(n = {}, e = {}) {
  const t = Array.isArray(e.allowedFields) ? e.allowedFields : [];
  if (!t.length) return n;
  const r = {};
  for (const a of t)
    Object.prototype.hasOwnProperty.call(n, a) && (r[a] = n[a]);
  return r;
}
function Mf(n = {}, e = Cc, t = {}) {
  let r = n && typeof n == "object" && !Array.isArray(n) ? { ...n } : {};
  r = Df(r, e);
  for (const a of e.trimFields || [])
    r[a] === void 0 || r[a] === null || (r[a] = String(r[a]).trim());
  for (const [a, o] of Object.entries(e.arrayNormalizers || {}))
    Array.isArray(r[a]) && o === "nodeNameList" && typeof t.normalizeNodeNameList == "function" && (r[a] = t.normalizeNodeNameList(r[a]));
  for (const [a, o] of Object.entries(e.integerFields || {})) r[a] = fe(r[a], o.fallback, o.min, o.max);
  for (const [a, o] of Object.entries(e.numberFields || {})) r[a] = Ul(r[a], o.fallback, o.min, o.max);
  for (const a of e.booleanTrueFields || []) r[a] = r[a] !== !1;
  for (const a of e.booleanFalseFields || []) r[a] = r[a] === !0;
  return If(r, e);
}
function wc(n = {}) {
  const e = n && typeof n == "object" && !Array.isArray(n) ? n : {}, t = { ...e };
  let r = !1;
  const a = [], o = [], s = {};
  for (const c of Ps)
    Object.prototype.hasOwnProperty.call(e, c) && a.push(c);
  const i = (c, l) => {
    const d = String(c || "").trim(), u = String(l || "").trim();
    !d || !u || (o.push(u), s[d] || (s[d] = []), s[d].push(u));
  };
  if (!Object.prototype.hasOwnProperty.call(t, "sourceDirectNodes")) {
    for (const c of Ac)
      if (Object.prototype.hasOwnProperty.call(e, c)) {
        t.sourceDirectNodes = bt(e[c]), r = !0, i(c, "sourceDirectNodes");
        break;
      }
  }
  if (!Object.prototype.hasOwnProperty.call(t, "logWriteClientIp") && Reflect.get(e, "logIncludeClientIp") !== void 0 && (t.logWriteClientIp = e.logIncludeClientIp !== !1, r = !0, i("logIncludeClientIp", "logWriteClientIp")), !Object.prototype.hasOwnProperty.call(t, "logDisplayClientIp") && Reflect.get(e, "logIncludeClientIp") !== void 0 && (t.logDisplayClientIp = e.logIncludeClientIp !== !1, r = !0, i("logIncludeClientIp", "logDisplayClientIp")), !Object.prototype.hasOwnProperty.call(t, "logWriteColo") && Reflect.get(e, "logIncludeColo") !== void 0 && (t.logWriteColo = e.logIncludeColo !== !1, r = !0, i("logIncludeColo", "logWriteColo")), !Object.prototype.hasOwnProperty.call(t, "logDisplayColo") && Reflect.get(e, "logIncludeColo") !== void 0 && (t.logDisplayColo = e.logIncludeColo !== !1, r = !0, i("logIncludeColo", "logDisplayColo")), !Object.prototype.hasOwnProperty.call(t, "logWriteUa") && Reflect.get(e, "logIncludeUa") !== void 0 && (t.logWriteUa = e.logIncludeUa !== !1, r = !0, i("logIncludeUa", "logWriteUa")), !Object.prototype.hasOwnProperty.call(t, "logDisplayUa") && Reflect.get(e, "logIncludeUa") !== void 0 && (t.logDisplayUa = e.logIncludeUa !== !1, r = !0, i("logIncludeUa", "logDisplayUa")), !Object.prototype.hasOwnProperty.call(t, "protocolStrategy")) {
    let c = !1;
    for (const l of Rc)
      Object.prototype.hasOwnProperty.call(e, l) && (i(l, "protocolStrategy"), c = !0);
    c && (t.protocolStrategy = Go(e), r = !0);
  }
  Object.prototype.hasOwnProperty.call(t, "defaultPlaybackInfoMode") || (Reflect.get(e, "playbackInfoAutoProxy") !== void 0 ? (t.defaultPlaybackInfoMode = nn(e), r = !0, i("playbackInfoAutoProxy", "defaultPlaybackInfoMode")) : Reflect.get(e, "playbackInfoBlockWangpanProxy") !== void 0 && (t.defaultPlaybackInfoMode = nn(e), r = !0, i("playbackInfoBlockWangpanProxy", "defaultPlaybackInfoMode"))), Object.prototype.hasOwnProperty.call(t, "tgDailyReportClockTimes") || (t.tgDailyReportClockTimes = xt(Object.prototype.hasOwnProperty.call(e, "tgDailyReportTime") ? e.tgDailyReportTime : e.tgDailyReportClockTimes, B.Defaults.TgDailyReportClockTimes), Object.prototype.hasOwnProperty.call(e, "tgDailyReportTime") && (r = !0, i("tgDailyReportTime", "tgDailyReportClockTimes")));
  for (const c of Ps)
    Object.prototype.hasOwnProperty.call(t, c) && (delete t[c], r = !0);
  return {
    config: t,
    migrated: r,
    legacyKeysPresent: ar(a),
    deletedLegacyFieldCount: ar(a).length,
    migratedConfigKeys: ar(o),
    migratedKeyMap: Object.fromEntries(Object.entries(s).map(([c, l]) => [c, ar(l)]))
  };
}
function Lc(n = "") {
  return String(n || "").trim().toLowerCase() === "claude" ? "claude" : B.Defaults.AdminUiSkin;
}
function ce(n = {}) {
  const { config: e } = wc(n && typeof n == "object" && !Array.isArray(n) ? n : {});
  return Nc(e);
}
function Nc(n = {}) {
  const e = Mf({
    ...n,
    defaultPlaybackInfoMode: _a(n, "defaultPlaybackInfoMode") ? Reflect.get(n, "defaultPlaybackInfoMode") : nn(n),
    protocolStrategy: _a(n, "protocolStrategy") ? Reflect.get(n, "protocolStrategy") : Go(n)
  }, Cc, { normalizeNodeNameList: bt });
  e.prewarmDepth = _c(e.prewarmDepth), e.hedgeProbePath = ka(e.hedgeProbePath, B.Defaults.HedgeProbePath), e.dnsDefaultFallbackCname = Cf(e.dnsDefaultFallbackCname), e.defaultHostPrefixCnameTarget = Xt(e.defaultHostPrefixCnameTarget), e.settingsExperienceMode = String(e.settingsExperienceMode || "").trim().toLowerCase() === "expert" ? "expert" : "novice", Object.prototype.hasOwnProperty.call(e, "adminUiSkin") && (e.adminUiSkin = Lc(e.adminUiSkin)), e.cfQuotaPlanOverride = Xo(e.cfQuotaPlanOverride), e.logSearchMode = bc(e.logSearchMode), e.logWriteMode = qo(e.logWriteMode), e.routingDecisionMode = Ur(e.routingDecisionMode), e.protocolStrategy = cc(e.protocolStrategy), e.defaultPlaybackInfoMode = qt(e.defaultPlaybackInfoMode), e.defaultRealClientIpMode = Po(e.defaultRealClientIpMode), e.defaultMediaAuthMode = Ni(e.defaultMediaAuthMode), e.scheduleUtcOffsetMinutes = Ue(e.scheduleUtcOffsetMinutes), e.tgDailyReportClockTimes = xt(e.tgDailyReportClockTimes, B.Defaults.TgDailyReportClockTimes);
  const t = tt(e.indexUrl);
  return e.indexUrl = t ? Xr(t) : "", Bd(e, n), e;
}
var Dc = [
  "cfApiToken",
  "tgBotToken",
  "tmdbApiReadToken",
  "tmdbApiV3Key",
  "todbApiKey"
];
function xs(n = {}) {
  const e = ce(n);
  for (const t of Dc) delete e[t];
  return e;
}
function Dt(n = {}) {
  return ce(n);
}
function Ic(n = {}, e = {}) {
  const t = k(n) ? { ...n } : {}, r = ce(e);
  for (const a of Dc)
    Object.prototype.hasOwnProperty.call(t, a) || String(r[a] || "").length > 0 && (t[a] = r[a]);
  return !Object.prototype.hasOwnProperty.call(t, "adminUiSkin") && r.adminUiSkin && (t.adminUiSkin = r.adminUiSkin), t;
}
function Bn(n = {}, e = {}) {
  const t = Ic(n, e), r = tt(ce(e).indexUrl);
  return t.indexUrl = r ? Xr(r) : "", t;
}
function Pf(n = "", e = {}) {
  const t = String(n || "").trim();
  if (!t) return;
  const r = t.split(".").pop() || "", a = ie(ae(ce(e)));
  if (r !== a)
    throw Ie("CONFIG_REVISION_CONFLICT", "配置版本已变化，请刷新设置后重新提交", 409, {
      expectedRevision: t,
      currentHash: a
    });
}
function xf(n = {}) {
  const e = wc(n);
  return {
    cleanedConfig: Nc(e.config),
    legacyKeysPresent: e.legacyKeysPresent,
    deletedLegacyFieldCount: e.deletedLegacyFieldCount,
    migratedConfigKeys: e.migratedConfigKeys,
    migratedKeyMap: e.migratedKeyMap
  };
}
function zt(n = "", e = "") {
  const t = String(n || "").trim() || "empty";
  return `${String(e || "").trim() || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()}.${t}`;
}
function lo(n, e = {}) {
  const t = ie(ae(n)), r = String(e.updatedAt || "").trim() || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString();
  return {
    ...e,
    hash: t,
    updatedAt: r,
    revision: zt(t, r)
  };
}
function Of(n = {}, e = {}) {
  const t = ce(n), r = ce(e), a = [.../* @__PURE__ */ new Set([...Object.keys(t), ...Object.keys(r)])].sort(), o = [];
  for (const s of a)
    ae(t[s]) !== ae(r[s]) && o.push({
      key: s,
      previousValue: t[s],
      nextValue: r[s]
    });
  return o;
}
function vf(n = [], e = 20) {
  const t = Math.max(1, Number(e) || 20);
  return [...new Set((Array.isArray(n) ? n : [n]).map((r) => String(r ?? "").trim()).filter(Boolean))].slice(0, t);
}
function ht(n = "", e = "", t = [], r = {}) {
  const a = vf(t, r.limit), o = Number(r.count), s = Number.isFinite(o) ? Math.max(0, Math.floor(o)) : a.length, i = String(r.note || "").trim();
  return {
    key: String(n || "").trim(),
    label: String(e || "").trim(),
    count: s,
    countIsLowerBound: r.countIsLowerBound === !0,
    samples: a,
    truncated: s > a.length,
    note: i
  };
}
function Te(n, e, t = "", r = "", a = [], o = 0, s = "") {
  return e && n.push(ht(t, r, a, {
    count: o,
    note: s
  })), n;
}
function Ff(n = {}) {
  const e = [], t = ar(n.configFieldTargets || []);
  if (t.length > 0) {
    const i = [];
    n.sourceDirectNodesFromLegacyNodes === !0 && i.push("包含节点遗留直连标记折叠进 sourceDirectNodes"), e.push(ht("config_current_fields", "全局设置当前字段", t, {
      count: t.length,
      note: i.join("；") || "会把旧版配置别名收敛到当前 schema。"
    }));
  }
  const r = Math.max(0, Math.floor(Number(n.migratedTopLevelPortNodeCount) || 0)), a = Math.max(0, Math.floor(Number(n.migratedLinePortCount) || 0)), o = Math.max(0, Math.floor(Number(n.migratedDefaultPortNodeCount) || 0)), s = Math.max(0, Math.floor(Number(n.migratedDefaultPortLineCount) || 0));
  if (r > 0 || a > 0 || o > 0 || s > 0) {
    const i = [];
    r > 0 && i.push(`旧版顶层 node.port 节点 ${r} 个`), a > 0 && i.push(`旧版 lines[].port 线路 ${a} 条`), o > 0 && i.push(`隐式默认端口节点 ${o} 个`), s > 0 && i.push(`按协议补齐默认端口线路 ${s} 条`), e.push(ht("node_current_fields", "节点当前字段", ["lines[].target"], {
      count: 1,
      note: `会把端口统一收敛到当前字段。${i.join("，")}。`
    }));
  }
  return e;
}
function Uf(n = []) {
  return (Array.isArray(n) ? n : []).map((e) => e?.name || e?.id);
}
async function ve(n, e, t = {}) {
  if (!n) return null;
  const r = String(e || "").trim(), a = k(t) ? t : {};
  try {
    return Object.prototype.hasOwnProperty.call(a, "type") ? await n.get(r, { type: a.type }) : await n.get(r);
  } catch (o) {
    throw Ri("get", { key: r }, ue(o));
  }
}
async function kf(n, e = {}) {
  if (!n || typeof n.list != "function") return {
    keys: [],
    list_complete: !0,
    cursor: ""
  };
  const t = k(e) ? e : {}, r = String(t.prefix || "").trim(), a = String(t.cursor || "").trim();
  try {
    return a ? await n.list({
      prefix: r,
      cursor: a
    }) : await n.list({ prefix: r });
  } catch (o) {
    throw Ri("list", { prefix: r }, ue(o));
  }
}
var Hf = "sys:theme";
function Mc(n, e = {}) {
  const t = String(n || "").trim(), r = t.toLowerCase(), a = String(e.zoneId || "").trim(), o = {
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
  } : o : o;
}
async function Pc(n) {
  return ce(await n.get("sys:theme", { type: "json" }) || {});
}
async function we(n) {
  const e = Sr(n);
  if (!e) return {};
  const t = Wo(n), r = wn(n), a = r.ConfigCache;
  if (a?.exp > $() && a.data) return a.data;
  const o = r.RuntimeConfigCacheGeneration;
  return await Cn(r.SingleFlightTasks, Ye([
    "runtime_config",
    t,
    o
  ]), async () => {
    const s = r.ConfigCache;
    if (s?.exp > $() && s.data) return s.data;
    const i = s?.data && typeof s.data == "object" ? s.data : a?.data && typeof a.data == "object" ? a.data : null;
    let c = i || {};
    try {
      c = await Pc(e);
    } catch (l) {
      const d = i && typeof i == "object";
      Le("runtime_config.load_failed", l, {
        cacheNamespace: t,
        configKey: Hf,
        usedCachedConfig: d === !0
      }), c = d ? i : ce({});
    }
    return r.RuntimeConfigCacheGeneration === o && (r.ConfigCache = {
      data: c,
      exp: $() + B.Defaults.CacheTTL,
      namespace: t
    }), c;
  });
}
async function me(n) {
  const e = Sr(n);
  return e ? await Pc(e) : {};
}
function $f(n = {}, e = {}) {
  const { indexRepository: t } = n;
  async function r(f, m, p, h = Ke(m), g = null) {
    const y = k(g) ? ce(g) : ce(await me(m)), _ = await t.getAdminActiveIndexRecord(t.getKV(m)), S = _ ? ce({
      ...y,
      indexUrl: _.sourceUrl
    }) : y;
    if (e.isAdminIndexSetupForced(f)) return e.renderAdminIndexSetupPage(f, m, p, h, S, "manual_setup_requested");
    const T = St(m, S);
    if (!T.indexUrl) {
      try {
        const A = await e.renderBundledAdminPage(f, m, p, h, S);
        if (A) return A;
      } catch (A) {
        return Le("admin.bundled_shell_render", A, { path: new URL(f.url).pathname }), e.renderAdminIndexSetupPage(f, m, p, h, S, "bundled_shell_render_failed");
      }
      return e.renderAdminIndexSetupPage(f, m, p, h, S);
    }
    const b = T.indexUrl;
    if (b) try {
      const A = await e.renderRemoteAdminPage(f, m, p, h, b, S);
      if (A) return A;
    } catch (A) {
      return Le("admin.remote_shell_render", A, {
        path: new URL(f.url).pathname,
        remoteShellIndexUrl: b
      }), e.renderAdminRemoteShellErrorPage(f, m, p, h, {
        indexState: T,
        remoteShellIndexUrl: b,
        sourceType: "remote_error",
        routeState: "remote_error",
        remoteCacheState: "bypassed",
        lastFetchStatus: "failed",
        reason: `remote_shell_render_failed: ${String(A?.message || A || "unknown_error").trim()}`
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
  function o(f) {
    return new Request(f, {
      method: "HEAD",
      headers: { Accept: "*/*" },
      cache: "no-store"
    });
  }
  function s(f) {
    return f?.ok === !0 || Number(f?.status) === 304;
  }
  async function i(f, m, p = Ke(m), h = null) {
    const g = k(h) ? ce(h) : ce(await me(m)), y = St(m, g);
    if (!y.indexUrl) return z("ADMIN_INDEX_NOT_CONFIGURED", "管理台 index.html 尚未配置", 409);
    const _ = [], S = { waitUntil(I) {
      _.push(Promise.resolve(I));
    } }, T = ft(m), b = new URL(f.url);
    b.pathname = T, b.search = "";
    const A = await e.renderRemoteAdminPage(o(b), m, S, p, y.indexUrl, g);
    await Promise.all(_.splice(0));
    const C = mr(), N = y.assetRevision || y.releaseTag, P = y.isLocalUpload ? await t.getAdminIndexUploadRecord(t.getKV(m), y.localUploadRevision) : null;
    let E = null;
    P?.manifest ? (E = await e.readAdminReleaseVendorManifestFromCache(C, N, y.indexUrl), E || (E = await e.cacheAdminReleaseVendorManifest(C, P.manifest, S))) : E = await e.getOrCreateAdminReleaseVendorManifest(C, N, y.indexUrl, S);
    const w = (Array.isArray(E?.entries) ? E.entries : []).filter((I) => I?.assetKey && !e.isMutableJsdelivrGithubAssetUrl(I.upstreamUrl)), R = await a(w, async (I) => {
      const U = e.buildAdminReleaseVendorProxyPath(T, N, I.assetKey), V = new URL(f.url);
      return V.pathname = U, V.search = "", e.renderAdminReleaseVendorAsset(o(V), m, S, {
        releaseTag: N,
        assetKey: I.assetKey
      }, g);
    });
    await Promise.all(_.splice(0));
    const D = R.filter((I) => !s(I)).length, x = s(A), L = JSON.stringify({
      ok: x && D === 0,
      shellStatus: Number(A?.status) || 0,
      warmedAssetCount: w.length - D,
      failedAssetCount: D
    }), F = new Headers({
      "Content-Type": "application/json;charset=UTF-8",
      "Cache-Control": "no-store, max-age=0"
    });
    return De(F), new Response(f.method === "HEAD" ? null : L, {
      status: x && D === 0 ? 200 : 502,
      headers: F
    });
  }
  function c(f, m = Ke(f)) {
    const p = ft(f), h = m.ok ? "" : `<div class="landing-banner"><div class="landing-banner-title">系统未初始化</div><div class="landing-banner-text">缺少关键环境变量：${m.missing.map((_) => Ce(_)).join("、")}</div></div>`, g = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="/favicon.ico" sizes="any"><title>Emby Proxy V${Ja}</title>${e.LANDING_PAGE_STYLE_HTML}</head><body><main class="landing-shell"><section class="landing-card"><div class="landing-grid"><div class="landing-primary">${h}<div class="landing-pill">Headless Edge Relay</div><h1 class="landing-title">Emby Proxy V${Ja}</h1><p class="landing-text">为了极致优化视频代理性能，根路径默认只保留无头中继与说明壳；真正的管理台入口固定收口到 <span class="landing-highlight">${Ce(p)}</span>，并由 Worker 读取随部署发布或已上传的 <code>index.html</code> 返回。</p><div class="landing-actions"><a href="${Ce(p)}" class="landing-btn landing-btn-primary">访问 ${Ce(p)}</a><a href="https://github.com/axuitomo/CF-EMBY-PROXY-UI" target="_blank" rel="noopener noreferrer" class="landing-btn landing-btn-secondary">查看项目说明</a></div></div><div class="landing-side"><div class="landing-notes"><div class="landing-notes-title">Routing Notes</div><ul class="landing-note-list"><li>根路径仅提供静态说明页，不承载实时配置数据。</li><li><code>${Ce(p)}</code> 只负责返回管理台壳与 bootstrap，动态数据继续走 <code>POST ${Ce(p)}</code> API。</li><li>正式真相源固定为 <code>frontend/</code>、<code>worker.js</code> 与 <code>worker.md</code>。</li><li>媒体代理、日志与 KV / D1 逻辑保持原 Worker 主链路不变。</li></ul></div></div></div></section></main></body></html>`, y = new Headers({
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    });
    return De(y), y.set("X-Frame-Options", "DENY"), new Response(g, { headers: y });
  }
  function l(f, m = "/", p = 302) {
    const h = new URL(f.url);
    h.pathname = Z(m || "/"), h.search = "", h.hash = "";
    const g = new Headers({
      Location: h.toString(),
      "Cache-Control": "no-store, max-age=0"
    });
    return De(g), new Response(null, {
      status: p,
      headers: g
    });
  }
  async function d(f, m, p = Ke(m)) {
    const h = ft(m), g = zo(m), y = no(p), _ = Zr({
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
  function u(f, m, p = 200, h = {}) {
    const g = new Headers(f);
    return De(g), h.mergeOriginVary === !0 && g.get("Access-Control-Allow-Origin") !== "*" && zr(g, "Origin"), new Response(m, {
      status: p,
      headers: g
    });
  }
  return {
    renderAdminPage: r,
    warmAdminReleaseVendorEntries: a,
    buildAdminWarmSubrequest: o,
    isAdminWarmResponseSuccessful: s,
    renderAdminWarmResponse: i,
    renderLandingPage: c,
    buildRequestPathRedirectResponse: l,
    renderAdminLoginPage: d,
    buildEdgeCorsResponse: u
  };
}
function Yo(n = "") {
  return /(?:^|\/)smartstrm(?:$|[/?])/i.test(String(n || ""));
}
function Ca(n = "") {
  return on(n) || /\/audio\/[^/]+(?:\/|$)/i.test(String(n || "")) || /\/livetv\/[^/]+(?:\/|$)/i.test(String(n || "")) || Yo(n);
}
function Bf(n = "") {
  const e = String(n || "").trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(e) || e.startsWith("//");
}
function xc(n = "") {
  return /\/playbackinfo(?:$|[/?])/i.test(String(n || ""));
}
function on(n = "") {
  const e = Z(n);
  return xc(e) || Yo(e) || At.test(e) || tc.test(e) ? !0 : /\/videos\/[^/]+\/(?:stream|original|download|file)\b/i.test(e) || /\/items\/[^/]+\/download\b/i.test(e);
}
function Oc(n = "") {
  return /\/sessions\/playing\/progress(?:$|[/?])/i.test(String(n || ""));
}
function vc(n = "") {
  return /\/sessions\/playing\/stopped(?:$|[/?])/i.test(String(n || ""));
}
function Kf(n = "") {
  return /\/sessions\/playing\/ping(?:$|[/?])/i.test(String(n || ""));
}
function zf(n = "") {
  const e = String(n || "");
  return Oc(e) || vc(e) || Kf(e) ? !1 : /\/sessions\/playing(?:\/started)?(?:$|[/?])/i.test(e);
}
function Wf(n = {}, e = {}) {
  function t(r, a) {
    let o = a;
    const s = at(r[o]);
    let i = hc(s) === "main" ? "/" + s : "";
    for (o += 1; o < r.length; o += 1) i += "/" + at(r[o]);
    return on(i || "/");
  }
  return { isPlaybackCriticalSegments: t };
}
function Gf(n = {}) {
  const e = {};
  for (const [t, r] of Object.entries(xd(n, e))) e[t] = r;
  for (const [t, r] of Object.entries(Od(n, e))) e[t] = r;
  for (const [t, r] of Object.entries(Fd(n, e))) e[t] = r;
  for (const [t, r] of Object.entries(Ud(n, e))) e[t] = r;
  for (const [t, r] of Object.entries($f(n, e))) e[t] = r;
  for (const [t, r] of Object.entries(Wf(n, e))) e[t] = r;
  return e;
}
function sn(n) {
  if (!n || n === 0) return "0 B";
  const e = 1024, t = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB"
  ], r = Math.floor(Math.log(n) / Math.log(e));
  return parseFloat((n / Math.pow(e, r)).toFixed(2)) + " " + t[r];
}
var Fc = 1024 * 1024 * 1024, Vf = 500 * 1024 * 1024, jf = 10 * 1024 * 1024 * 1024, Jo = Object.freeze({
  planClass: "free",
  planLabel: "FREE",
  periodLabel: "今日",
  kv: {
    read: 1e5,
    write: 1e3,
    delete: 1e3,
    list: 1e3,
    storageBytes: Fc
  },
  d1: {
    rowsRead: 5e6,
    rowsWritten: 1e5,
    storageBytes: Vf
  }
}), Uc = Object.freeze({
  planClass: "paid",
  planLabel: "PAID",
  periodLabel: "本月",
  kv: {
    read: 1e7,
    write: 1e6,
    delete: 1e6,
    list: 1e6,
    storageBytes: Fc
  },
  d1: {
    rowsRead: 25e9,
    rowsWritten: 5e7,
    storageBytes: jf
  }
}), qf = Object.freeze({
  free: Jo,
  paid: Uc
});
function Se(n) {
  const e = Number(n);
  return Number.isFinite(e) ? Math.max(0, Math.round(e)).toLocaleString("en-US") : "0";
}
function wa(n) {
  const e = Number(n);
  return !Number.isFinite(e) || e <= 0 ? 0 : e >= 100 ? 100 : Math.max(0, Math.round(e * 10) / 10);
}
function Xf(n = 0) {
  const e = Number(n);
  return !Number.isFinite(e) || e <= 0 ? "slate" : e >= 90 ? "danger" : e >= 70 ? "warning" : "success";
}
function La(n = "") {
  return String(n || "").trim().toLowerCase() || "bundled";
}
function kc(n = "") {
  const e = La(n);
  return e === "standard" || e === "unbound" ? {
    ...Uc,
    usageModel: e
  } : {
    ...Jo,
    usageModel: e
  };
}
function uo(n = {}) {
  const e = Xo(n?.override);
  return e ? {
    ...Na(e),
    usageModel: La(n?.usageModel),
    override: e
  } : {
    ...kc(n?.usageModel),
    override: ""
  };
}
function Na(n = "free") {
  return qf[String(n || "").trim().toLowerCase() === "paid" ? "paid" : "free"] || Jo;
}
async function Yf(n = {}) {
  const e = ce(k(n) ? n : {}), t = Xo(e.cfQuotaPlanOverride);
  if (t) return uo({ override: t });
  const r = String(e.cfAccountId || "").trim(), a = String(e.cfApiToken || "").trim();
  if (!r || !a) return {
    ...Na("free"),
    usageModel: La("bundled"),
    override: ""
  };
  try {
    return uo({ usageModel: await zc(r, a) });
  } catch {
    return {
      ...Na("free"),
      usageModel: La("bundled"),
      override: ""
    };
  }
}
function Jf(n = {}) {
  const e = k(n) ? n : {}, t = Math.max(1, Math.floor(Number(e.writeLimit) || 0)), r = Math.max(0, Math.floor(Number(e.estimatedPutCount) || 0)), a = Math.max(0, Math.floor(Number(e.estimatedRollbackWriteCount) || 0)), o = Math.max(0, Math.floor(Number(e.estimatedWorstCaseWriteCount) || 0)), s = Math.max(0, o - t), i = String(e.planLabel || "").trim() || "FREE", c = String(e.periodLabel || "").trim() || "今日";
  return o <= t ? "" : `KV 整理已拦截：当前 ${i} 计划 · ${c} 写入上限为 ${Se(t)}，本次预计写入 ${Se(r)} 次，最坏回滚写回 ${Se(a)} 次，最坏共 ${Se(o)} 次，超出 ${Se(s)} 次。`;
}
function Qf(n = {}) {
  const e = k(n) ? n : {}, t = String(e.planLabel || "").trim() || "FREE", r = String(e.periodLabel || "").trim() || "今日", a = Math.max(1, Math.floor(Number(e.writeLimit) || 0)), o = Math.max(0, Math.floor(Number(e.estimatedPutCount) || 0)), s = Math.max(0, Math.floor(Number(e.estimatedDeleteCount) || 0)), i = Math.max(0, Math.floor(Number(e.estimatedRollbackWriteCount) || 0)), c = Math.max(0, Math.floor(Number(e.estimatedWorstCaseWriteCount) || 0));
  return `KV 配额预算：${t} 计划 · ${r}，预计 put ${Se(o)} 次，delete ${Se(s)} 次，最坏回滚写回 ${Se(i)} 次，最坏写入 ${Se(c)} / ${Se(a)}。`;
}
function Zf(n = "free", e = /* @__PURE__ */ new Date()) {
  const t = String(n || "").trim().toLowerCase() === "paid" ? "paid" : "free", r = e instanceof Date ? new Date(e.getTime()) : new Date(e || Date.now()), a = r.toISOString();
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
  const o = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth(), r.getUTCDate(), 0, 0, 0, 0)), s = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth(), r.getUTCDate() + 1, 0, 0, 0, 0));
  return {
    planClass: t,
    periodLabel: "今日",
    startIso: o.toISOString(),
    endIso: a,
    resetAtIso: s.toISOString(),
    cacheBucketKey: o.toISOString().slice(0, 10)
  };
}
function Kt(n, e = "cloudflare_runtime_error") {
  return String(n?.message || n || e).trim().replace(/\s+/g, " ").slice(0, 240) || e;
}
function Os(n, e = "count") {
  return e === "bytes" ? sn(Math.max(0, Number(n) || 0)) : Se(n);
}
function vs(n = 0, e = $()) {
  const t = Math.max(0, Number(n) || 0), r = Math.max(t, Number(e) || $());
  if (t <= 0) return "";
  const a = Math.max(0, r - t);
  return a < 60 * 1e3 ? "缓存年龄：不到 1 分钟" : a < 3600 * 1e3 ? `缓存年龄：${Math.max(1, Math.round(a / (60 * 1e3)))} 分钟` : `缓存年龄：${Math.max(1, Math.round(a / (3600 * 1e3)))} 小时`;
}
function Rr({ key: n = "", label: e = "", used: t = 0, limit: r = 0, kind: a = "count" } = {}) {
  const o = Math.max(0, Number(t) || 0), s = Math.max(0, Number(r) || 0), i = s > 0 ? o / s * 100 : 0, c = wa(i);
  return {
    key: String(n || "").trim(),
    label: String(e || "").trim(),
    usedValue: o,
    limitValue: s,
    usedText: Os(o, a),
    limitText: Os(s, a),
    percent: c,
    percentText: `${c % 1 === 0 ? Math.round(c) : c}%`,
    tone: Xf(i),
    rawPercent: i
  };
}
function Fs(n = []) {
  return (Array.isArray(n) ? n : []).filter((e) => Number(e?.rawPercent) > 100).map((e) => String(e?.label || "").trim()).filter(Boolean);
}
function cn(n = {}, e = {}) {
  const t = (Array.isArray(n.metrics) ? n.metrics : []).map((r) => ({
    key: String(r?.key || "").trim(),
    label: String(r?.label || "").trim(),
    usedText: String(r?.usedText || "").trim(),
    limitText: String(r?.limitText || "").trim(),
    percent: wa(r?.percent),
    percentText: String(r?.percentText || `${wa(r?.percent)}%`).trim(),
    tone: String(r?.tone || "slate").trim() || "slate"
  })).filter((r) => r.key && r.label);
  return {
    title: String(n.title || e.title || "Cloudflare").trim() || "Cloudflare",
    status: String(n.status || e.status || "idle").trim() || "idle",
    summary: String(n.summary || e.summary || "暂无运行记录").trim() || "暂无运行记录",
    detail: String(n.detail || e.detail || "").trim(),
    lines: (Array.isArray(n.lines) ? n.lines : Array.isArray(e.lines) ? e.lines : []).map((r) => String(r || "").trim()).filter(Boolean),
    planLabel: String(n.planLabel || e.planLabel || "").trim(),
    periodLabel: String(n.periodLabel || e.periodLabel || "").trim(),
    resourceLabel: String(n.resourceLabel || e.resourceLabel || "").trim(),
    metrics: t
  };
}
function Cr(n = "", e = "", t = "") {
  return cn({
    title: n,
    status: "skipped",
    summary: e,
    detail: t
  });
}
function wr(n = "", e = "", t = "") {
  return cn({
    title: n,
    status: "failed",
    summary: e,
    detail: t
  });
}
function em(n = "", e = {}, t = 0, r = []) {
  const a = Math.max(1, Math.min(100, Math.round(Number(t) || 0))), o = e && typeof e == "object" ? e : {}, s = (Array.isArray(r) ? r : []).map((p) => ({
    label: String(p?.label || "").trim(),
    percentText: String(p?.percentText || `${wa(p?.percent)}%`).trim()
  })).filter((p) => p.label), i = String(o.resourceLabel || "").trim() || String(n || "").trim(), c = String(o.planLabel || "").trim(), l = String(o.periodLabel || "").trim(), d = [i], u = [c, l].filter(Boolean);
  u.length > 0 && d.push(`（${u.join(" / ")}）`);
  const f = s.map((p) => `${p.label} ${p.percentText}`).join("、"), m = String(o.status || "").trim().toLowerCase() === "partial_failure" ? "（使用缓存数据）" : "";
  return `${String(n || "Cloudflare").trim() || "Cloudflare"} 使用量达到阈值：${d.join("")}，${f}（阈值 ${a}%）${m}`;
}
function Kn(n = [], e = []) {
  const t = new Set((Array.isArray(e) ? e : [e]).map((r) => String(r || "").trim()).filter(Boolean));
  for (const r of Array.isArray(n) ? n : []) {
    const a = String(r?.key || "").trim();
    if (!t.has(a)) continue;
    const o = String(r?.percentText || "").trim();
    if (o) return o;
    if (r?.percent !== void 0 && r?.percent !== null) return `${wa(r.percent)}%`;
  }
  return "暂不可用";
}
function tm(n = {}, e = {}) {
  const t = n && typeof n == "object" ? n : {}, r = e && typeof e == "object" ? e : {}, a = String(t.requestCountDisplay || "").trim() || (t.todayRequests === null || t.todayRequests === void 0 ? "暂不可用" : String(Number(t.todayRequests) || 0)), o = String(t.todayTraffic || "").trim() || "暂不可用", s = String(t.monthlyTraffic || "").trim() || "暂不可用", i = Math.max(0, Number(t.playCount) || 0), c = Math.max(0, Number(t.infoCount) || 0);
  return [
    `📊 EMBY-PROXY每日报表${r.dateKey ? ` (${r.dateKey})` : ""}`,
    "",
    `请求数: ${a}`,
    `视频流量 (CF 总计): ${o}`,
    `本月流量 (CF 总计): ${s}`,
    `请求: 播放请求 ${Se(i)} 次 | 获取播放信息 ${Se(c)} 次`,
    "#Cloudflare #Emby #日报"
  ].map((l) => String(l || "").trim()).filter((l, d, u) => !(l === "" && (d === 0 || u[d - 1] === ""))).join(`
`);
}
function rm(n = "", e = {}, t = {}) {
  const r = uc(n);
  if (r === "summary") return tm(e, t);
  const a = r === "d1" ? "d1" : "kv", o = e && typeof e == "object" ? e : {}, s = t && typeof t == "object" ? t : {}, i = a === "d1" ? "D1 数据库每日消耗报告" : "KV 数据库每日消耗报告", c = a === "d1" ? "#D1" : "#KV", l = Array.isArray(o.metrics) ? o.metrics : [], d = s.dateKey ? ` (${s.dateKey})` : "", u = String(o.planLabel || "").trim(), f = String(o.periodLabel || "").trim(), m = u || f ? `${u || "未知"} 计划 X ${f || "当前"}配额` : String(o.summary || "").trim() || "暂不可用", p = Kn(l, a === "d1" ? ["rowsRead", "read"] : ["read", "rowsRead"]), h = Kn(l, a === "d1" ? ["rowsWritten", "write"] : ["write", "rowsWritten"]), g = Kn(l, ["storage"]);
  return [
    `📊 ${i}${d}`,
    `配额口径：${m}`,
    `读取使用率：${p}`,
    `写入使用率：${h}`,
    `存储使用率：${g}`,
    `#Cloudflare ${c} #日报`
  ].map((y) => String(y || "").trim()).filter((y, _, S) => !(y === "" && (_ === 0 || S[_ - 1] === ""))).join(`
`);
}
function Us(n = null, e = "") {
  const t = (Array.isArray(n?.errors) ? n.errors : []).map((a) => {
    const o = String(a?.code || "").trim(), s = String(a?.message || "").trim();
    return o && s ? `${o}: ${s}` : s || o;
  }).filter(Boolean);
  if (t.length > 0) return t.join("; ");
  const r = String(e || "").trim();
  return r ? r.replace(/\s+/g, " ").slice(0, 300) : "";
}
async function Re(n, e, t = {}) {
  const r = t && typeof t == "object" ? t : {};
  let a = {};
  const o = r?.headers;
  o && (o instanceof Headers ? a = Object.fromEntries(o.entries()) : typeof o == "object" && (a = o));
  const s = typeof FormData < "u" && r?.body instanceof FormData, i = await ze(n, {
    ...r,
    headers: {
      Authorization: `Bearer ${e}`,
      ...s ? {} : { "Content-Type": "application/json" },
      ...a
    }
  }), c = await Pe(i, Ci);
  if (c.exceeded) throw new Error("cf_api_response_too_large");
  const l = c.text;
  let d = null;
  if (l) try {
    d = JSON.parse(l);
  } catch {
  }
  if (!i.ok) {
    const u = Number(i.status) || 0, f = Us(d, l), m = /* @__PURE__ */ new Error(f ? `cf_api_http_${u}: ${f}` : `cf_api_http_${u}`);
    throw m.status = u, m;
  }
  if (!d || typeof d != "object") return {};
  if (d?.success === !1) {
    const u = Us(d, l);
    throw new Error(u || "cf_api_error");
  }
  return d;
}
async function Hc(n, e, t) {
  const r = t && typeof t == "object" ? {
    query: e,
    variables: t
  } : { query: e }, a = await ze("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${n}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(r)
  });
  if (!a.ok) throw new Error(`cf_graphql_http_${a.status}`);
  const o = await Pe(a, Ci);
  if (o.exceeded) throw new Error("cf_graphql_response_too_large");
  const s = JSON.parse(o.text);
  if (Array.isArray(s?.errors) && s.errors.length) throw new Error(s.errors.map((i) => i?.message).filter(Boolean).join("; ") || "cf_graphql_error");
  return s;
}
async function $c(n, e, t, r) {
  return (await Hc(e, t, r))?.data?.viewer?.zones?.[0] || null;
}
async function ks(n, e, t, r) {
  const a = await $c(n, e, `
            query {
              viewer {
                zones(filter: { zoneTag: ${Ee(n)} }) {
                  series: httpRequestsAdaptiveGroups(limit: 10000, filter: { datetime_geq: ${Ee(new Date(t).toISOString())}, datetime_leq: ${Ee(new Date(r).toISOString())} }) {
                    sum { edgeResponseBytes }
                  }
                }
              }
            }`);
  if (!a) throw new Error("cf_graphql_empty_zone");
  return (Array.isArray(a.series) ? a.series : []).reduce((o, s) => o + Math.max(0, Number(s?.sum?.edgeResponseBytes) || 0), 0);
}
async function Ln(n, e, t, r) {
  return (await Hc(e, t, r))?.data?.viewer?.accounts?.[0] || null;
}
async function Bc(n, e) {
  return !n || !e ? null : (await Re(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(n).trim())}`, e))?.result || null;
}
async function Kc(n, e, t = {}) {
  const r = String(n || "").trim();
  return await ge(Bc(r, e), String(t?.scope || "cloudflare.zone_lookup"), {
    zoneId: r,
    ...k(t?.context) ? t.context : {}
  }, null);
}
async function Qo(n, e, t = {}) {
  const r = await Bc(n, e), a = String(r?.name || "").trim();
  if (r && a) return r;
  const o = /* @__PURE__ */ new Error("cf_zone_context_missing");
  throw o.code = "CF_ZONE_CONTEXT_MISSING", o.status = 400, o.details = {
    zoneId: String(n || "").trim(),
    scope: String(t?.scope || "").trim()
  }, o;
}
async function zc(n, e) {
  const t = String(n || "").trim(), r = String(e || "").trim();
  return !t || !r ? "" : La((await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(t)}/workers/account-settings`, r))?.result?.default_usage_model);
}
async function am(n, e, t) {
  const r = String(n || "").trim(), a = String(e || "").trim(), o = String(t || "").trim();
  return !r || !a || !o ? null : (await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(r)}/storage/kv/namespaces/${encodeURIComponent(a)}`, o))?.result || null;
}
async function Hs(n, e, t) {
  const r = String(n || "").trim(), a = String(e || "").trim(), o = String(t || "").trim();
  return !r || !a || !o ? null : (await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(r)}/d1/database/${encodeURIComponent(a)}`, o))?.result || null;
}
async function nm({ accountId: n, apiToken: e, namespaceId: t, startIso: r, endIso: a }) {
  const o = String(n || "").trim(), s = String(e || "").trim(), i = String(t || "").trim();
  if (!o || !s || !i) return null;
  const c = await Ln(o, s, `
    query {
      viewer {
        accounts(filter: { accountTag: ${Ee(o)} }) {
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
  const l = Array.isArray(c?.kvOperationsAdaptiveGroups) ? c.kvOperationsAdaptiveGroups : [], d = Array.isArray(c?.kvStorageAdaptiveGroups) ? c.kvStorageAdaptiveGroups : [], u = {
    readCount: 0,
    writeCount: 0,
    deleteCount: 0,
    listCount: 0,
    storageBytes: 0
  };
  for (const f of l) {
    const m = String(f?.dimensions?.actionType || "").trim().toLowerCase(), p = Math.max(0, Number(f?.sum?.requests) || 0);
    m === "read" ? u.readCount += p : m === "write" ? u.writeCount += p : m === "delete" ? u.deleteCount += p : m === "list" && (u.listCount += p);
  }
  for (const f of d) u.storageBytes = Math.max(u.storageBytes, Math.max(0, Number(f?.max?.byteCount) || 0));
  return u;
}
async function om({ accountId: n, apiToken: e, databaseId: t, startIso: r, endIso: a }) {
  const o = String(n || "").trim(), s = String(e || "").trim(), i = String(t || "").trim();
  if (!o || !s || !i) return null;
  const c = await Ln(o, s, `
    query {
      viewer {
        accounts(filter: { accountTag: ${Ee(o)} }) {
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
  return (Array.isArray(c?.d1AnalyticsAdaptiveGroups) ? c.d1AnalyticsAdaptiveGroups : []).reduce((l, d) => ({
    rowsRead: l.rowsRead + Math.max(0, Number(d?.sum?.rowsRead) || 0),
    rowsWritten: l.rowsWritten + Math.max(0, Number(d?.sum?.rowsWritten) || 0),
    readQueries: l.readQueries + Math.max(0, Number(d?.sum?.readQueries) || 0),
    writeQueries: l.writeQueries + Math.max(0, Number(d?.sum?.writeQueries) || 0)
  }), {
    rowsRead: 0,
    rowsWritten: 0,
    readQueries: 0,
    writeQueries: 0
  });
}
async function sm({ accountId: n, apiToken: e, databaseId: t, startIso: r, endIso: a, utcOffsetMinutes: o = B.Defaults.ScheduleUtcOffsetMinutes }) {
  const s = String(n || "").trim(), i = String(e || "").trim(), c = String(t || "").trim();
  if (!s || !i || !c) return [];
  const l = await Ln(s, i, `
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
  const d = Array.isArray(l?.d1AnalyticsAdaptiveGroups) ? l.d1AnalyticsAdaptiveGroups : [], u = /* @__PURE__ */ new Map();
  for (const f of d) {
    const m = String(f?.dimensions?.datetimeHour || "").trim();
    if (!m) continue;
    const p = Date.parse(m);
    if (!Number.isFinite(p)) continue;
    const h = ut(new Date(p), o), g = `${h.dateKey}:${h.hour}`, y = u.get(g) || {
      dateKey: h.dateKey,
      hour: h.hour,
      rowsWritten: 0,
      writeQueries: 0
    };
    y.rowsWritten += Math.max(0, Number(f?.sum?.rowsWritten) || 0), y.writeQueries += Math.max(0, Number(f?.sum?.writeQueries) || 0), u.set(g, y);
  }
  return [...u.values()].sort((f, m) => f.dateKey !== m.dateKey ? String(f.dateKey).localeCompare(String(m.dateKey)) : Number(f.hour) - Number(m.hour));
}
async function im({ cfAccountId: n, cfZoneId: e, cfApiToken: t, startIso: r, endIso: a, utcOffsetMinutes: o = B.Defaults.ScheduleUtcOffsetMinutes }) {
  if (!n || !t) return null;
  const s = await Ln(n, t, `
  query {
    viewer {
      accounts(filter: { accountTag: ${Ee(n)} }) {
        workersInvocationsAdaptive(limit: 10000, filter: { datetime_geq: ${Ee(r)}, datetime_leq: ${Ee(a)} }) {
          dimensions { datetime scriptName status }
          sum { requests }
        }
      }
    }
  }`), i = Array.isArray(s?.workersInvocationsAdaptive) ? s.workersInvocationsAdaptive : [], c = Array.from({ length: 24 }, (d, u) => ({
    label: String(u).padStart(2, "0") + ":00",
    total: 0
  }));
  let l = 0;
  for (const d of i) {
    const u = Number(d?.sum?.requests) || 0;
    l += u;
    const f = d?.dimensions?.datetime;
    if (!f) continue;
    const m = new Date(f);
    if (Number.isNaN(m.getTime())) continue;
    const p = ut(m, o).hour;
    c[p] && (c[p].total += u);
  }
  return {
    totalRequests: l,
    hourlySeries: c
  };
}
async function cm({ cfAccountId: n, cfZoneId: e, cfApiToken: t, zoneNameFallback: r = "" }) {
  const a = [], o = (s, i = {}) => {
    const c = Co(s);
    if (!c) return;
    const l = i.wildcard === !0 || c.wildcard === !0;
    a.push({
      hostname: c.hostname,
      path: String(i.path || ""),
      wildcard: l,
      score: Fo(c.hostname, {
        wildcard: l,
        path: i.path || ""
      })
    });
  };
  if (n && e) try {
    const s = await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(n).trim())}/workers/domains?zone_id=${encodeURIComponent(String(e).trim())}`, t);
    for (const i of s?.result || []) o(i?.hostname);
  } catch (s) {
    console.log("CF Workers domains lookup failed, will try routes", s);
  }
  if (!a.length && e) try {
    let s = 1, i = 1;
    do {
      const c = await Re(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(e).trim())}/workers/routes?page=${s}&per_page=100`, t);
      i = Number(c?.result_info?.total_pages || c?.result_info?.totalPages || 1);
      for (const l of c?.result || []) {
        const d = Bi(l?.pattern);
        d && o(d.hostname, {
          wildcard: d.wildcard,
          path: d.path
        });
      }
      s += 1;
    } while (s <= i && s <= 5);
  } catch (s) {
    console.log("CF Workers routes lookup failed", s);
  }
  return a.length ? (a.sort((s, i) => i.score - s.score || s.hostname.length - i.hostname.length || s.hostname.localeCompare(i.hostname)), a[0].hostname) : r || "未知域名 (请配置 CF 联动)";
}
function Qt(n = "") {
  const e = String(n || "").trim();
  return /^[a-z0-9_][a-z0-9-_]*$/i.test(e) ? e : "";
}
function Nn(n) {
  if (n !== void 0)
    try {
      return JSON.parse(JSON.stringify(n));
    } catch {
      return null;
    }
}
function Be(n, e = [], t = {}) {
  if (typeof n == "string") return String(n).trim();
  if (!n || typeof n != "object") return "";
  const r = Array.isArray(e) ? e : [], a = [
    "id",
    "value",
    "name",
    "region",
    "provider",
    "providerId",
    "hostname",
    "host"
  ], o = r.length ? r : a, s = t?.allowFallback !== !1, i = [o];
  s && r.length && i.push(a);
  const c = /* @__PURE__ */ new Set();
  for (const l of i) for (const d of l) {
    if (c.has(d)) continue;
    c.add(d);
    const u = n?.[d];
    if (typeof u == "string" && u.trim()) return u.trim();
    if (!(!u || typeof u != "object"))
      for (const f of l) {
        const m = u?.[f];
        if (typeof m == "string" && m.trim()) return m.trim();
      }
  }
  return "";
}
function lm(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e ? e === "aws" ? "AWS" : e === "gcp" || e === "google" ? "GCP" : e === "azure" ? "Azure" : e.toUpperCase() : "";
}
function um(n = "", e = "") {
  const t = String(n || "").trim().toLowerCase().replace(/_/g, "-"), r = String(e || "").trim().toLowerCase(), a = `${r}:${t}`;
  if (!t && !r) return {
    key: "other",
    label: "其他",
    sortOrder: 9
  };
  const o = (s = []) => s.some((i) => a.includes(String(i || "").trim().toLowerCase()));
  return o([
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
  } : o([
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
  } : o([
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
  } : o([
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
function dm(n) {
  return Array.isArray(n) ? n : n && typeof n == "object" ? [n] : typeof n == "string" && n.trim() ? [{ value: n }] : [];
}
function fm(n = []) {
  const e = [], t = /* @__PURE__ */ new Set();
  for (const r of Array.isArray(n) ? n : []) {
    const a = String(r?.id || r?.provider || r?.providerId || "").trim().toLowerCase();
    if (!a) continue;
    const o = lm(a);
    for (const s of Array.isArray(r?.regions) ? r.regions : []) {
      const i = String(s?.id || s?.region || s?.value || "").trim();
      if (!i) continue;
      const c = `${a}:${i}`;
      if (t.has(c)) continue;
      t.add(c);
      const l = um(i, a);
      e.push({
        provider: a,
        region: i,
        value: c,
        providerLabel: o,
        regionLabel: i,
        geoKey: l.key,
        geoLabel: l.label,
        geoSortOrder: l.sortOrder
      });
    }
  }
  return e.sort((r, a) => String(r.providerLabel || r.provider || "").localeCompare(String(a.providerLabel || a.provider || "")) || Number(r.geoSortOrder || 0) - Number(a.geoSortOrder || 0) || String(r.regionLabel || r.region || "").localeCompare(String(a.regionLabel || a.region || "")) || String(r.value || "").localeCompare(String(a.value || "")));
}
function Hr(n, e = "", t = []) {
  const r = Be(n, [
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
  const o = (Array.isArray(t) ? t : []).filter((s) => String(s?.region || "").trim() === r || String(s?.value || "").trim() === r);
  return o.length === 1 ? String(o[0]?.value || "").trim() : r;
}
function Da(n = {}, e = []) {
  const t = n && typeof n == "object" ? n : {}, r = String(t?.mode || "").trim().toLowerCase(), a = dm(t?.target), o = Hr(t?.region, t?.provider || t?.providerId || "", e), s = a.find((_) => !!Hr(Be(_, [
    "region",
    "value",
    "id"
  ]), Be(_, ["provider", "providerId"]), e)), i = s ? Hr(Be(s, [
    "region",
    "value",
    "id"
  ]), Be(s, ["provider", "providerId"]), e) : "", c = Be(t?.hostname, ["hostname"], { allowFallback: !1 }) || Be(t, ["hostname"], { allowFallback: !1 }), l = Be(a.find((_) => Be(_, ["hostname"], { allowFallback: !1 })), ["hostname"], { allowFallback: !1 }), d = Be(t?.host, ["host"], { allowFallback: !1 }) || Be(t, ["host"], { allowFallback: !1 }), u = Be(a.find((_) => Be(_, ["host"], { allowFallback: !1 })), ["host"], { allowFallback: !1 }), f = Be(a[0], ["value", "id"]);
  let m = "default", p = "__default__", h = "", g = "default", y = "";
  return r === "smart" ? (m = "smart", p = "__smart__", g = "smart") : r === "targeted" ? c || l ? (m = "hostname", p = "", h = c || l, g = "") : d || u ? (m = "host", p = "", h = d || u, g = "") : (m = "targeted", p = i || o || "", h = p || f || "", g = "") : o ? (m = "region", p = o, g = "region", y = o) : c ? (m = "hostname", p = "", h = c, g = "") : d ? (m = "host", p = "", h = d, g = "") : (i || a.length > 0) && (m = "targeted", p = i || "", h = p || f || "", g = ""), {
    currentMode: m,
    currentValue: p,
    currentTarget: h,
    selectedMode: g,
    selectedRegion: y,
    isTargetedOverride: m === "hostname" || m === "host" || m === "targeted"
  };
}
function Wc(n = []) {
  return (Array.isArray(n) ? n : []).filter((e) => e && typeof e == "object").map((e) => {
    const t = String(e.scope || "").trim(), r = String(e.permission || "").trim(), a = String(e.alternative || "").trim(), o = String(e.note || "").trim(), s = [];
    return t && s.push(`${t}级`), r && s.push(`"${r}"`), a && s.push(`（若当前令牌仅授予写权限，可改用 "${a}"）`), o && s.push(`：${o}`), s.join("");
  }).filter(Boolean);
}
function Gc(n = "", e = {}) {
  const t = String(n || "").trim().toLowerCase();
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
function mm(n = "", e = "读取", t = {}) {
  const r = Wc(Gc(n, t));
  return r.length <= 0 ? `Cloudflare Worker 放置${e}失败：API Token 权限不足` : `Cloudflare Worker 放置${e}失败：API Token 权限不足。至少需要：${r.join("；")}`;
}
function Dn(n = "WORKER_PLACEMENT_FORBIDDEN", e = "", t = "读取", r = {}) {
  return Ie(n, mm(e, t, r), 403, {
    permissionKind: String(e || "").trim(),
    requiredPermissions: Gc(e, r)
  });
}
function fo(n = {}) {
  const e = n && typeof n == "object" && !Array.isArray(n) ? n : {}, t = Object.prototype.hasOwnProperty.call(e, "currentValue"), r = Object.prototype.hasOwnProperty.call(e, "selectedMode");
  return {
    configured: e.configured === !0,
    scriptName: String(e.scriptName || "").trim(),
    requestHost: oe(e.requestHost || ""),
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
function pm(n = "", e = "", t = !1) {
  const r = oe(n), a = oe(e);
  return !r || !a ? !1 : t ? r === a || r.endsWith(`.${a}`) : r === a;
}
function gm(n = "", e = "/") {
  const t = String(n || "").trim(), r = String(e || "/").trim() || "/";
  return !t || t === "/" || t === "/*" ? !0 : t.endsWith("*") ? r.startsWith(t.slice(0, -1)) : r === t;
}
function hm(n = {}) {
  const e = oe(n?.hostname || ""), t = Qt(n?.service || n?.script || n?.name || "");
  return !e || !t ? null : {
    source: "domains",
    hostname: e,
    wildcard: !1,
    path: "/",
    scriptName: t,
    score: Fo(e, {
      wildcard: !1,
      path: "/"
    })
  };
}
function ym(n = {}) {
  const e = Bi(n?.pattern), t = Qt(n?.script || n?.service || n?.name || "");
  return !e || !t ? null : {
    source: "routes",
    hostname: e.hostname,
    wildcard: e.wildcard === !0,
    path: e.path || "/",
    pattern: e.pattern,
    scriptName: t,
    score: Fo(e.hostname, {
      wildcard: e.wildcard === !0,
      path: e.path || "/"
    })
  };
}
function $s(n = [], e = "", t = "/") {
  const r = oe(e), a = String(t || "/").trim() || "/", o = [];
  for (const s of Array.isArray(n) ? n : [])
    !s?.scriptName || !s?.hostname || pm(r, s.hostname, s.wildcard === !0) && gm(s.path || "/", a) && o.push({
      ...s,
      exactHostname: r === oe(s.hostname),
      exactPath: String(s.path || "/") === a
    });
  return o.length > 0 ? (o.sort((s, i) => Number(i.exactHostname) - Number(s.exactHostname) || Number(i.exactPath) - Number(s.exactPath) || Number(i.score || 0) - Number(s.score || 0) || String(s.hostname || "").length - String(i.hostname || "").length || String(s.scriptName || "").localeCompare(String(i.scriptName || ""))), o[0]) : null;
}
async function Vc(n, e) {
  const t = String(n || "").trim(), r = String(e || "").trim();
  if (!t || !r) return [];
  let a = null;
  try {
    a = await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(t)}/workers/placement/regions`, r);
  } catch (o) {
    throw Number(o?.status) === 403 ? Dn("WORKER_PLACEMENT_REGIONS_FORBIDDEN", "regions_read", "读取") : o;
  }
  return fm(a?.result?.providers);
}
async function Sm(n, e, t = {}) {
  const r = String(n || "").trim(), a = String(e || "").trim();
  if (!r || !a) return [];
  const o = new URL(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(r)}/workers/domains`), s = String(t?.zoneId || "").trim(), i = oe(t?.hostname || ""), c = Qt(t?.service || "");
  s && o.searchParams.set("zone_id", s), i && o.searchParams.set("hostname", i), c && o.searchParams.set("service", c);
  const l = await Re(o.toString(), a);
  return Array.isArray(l?.result) ? l.result : [];
}
async function _m(n, e) {
  const t = String(n || "").trim(), r = String(e || "").trim();
  if (!t || !r) return [];
  const a = [];
  let o = 1, s = 1;
  do {
    const i = await Re(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(t)}/workers/routes?page=${o}&per_page=100`, r);
    Array.isArray(i?.result) && a.push(...i.result), s = Number(i?.result_info?.total_pages || i?.result_info?.totalPages || 1), o += 1;
  } while (o <= s && o <= 10);
  return a;
}
async function Zo({ cfAccountId: n, cfZoneId: e, cfApiToken: t, request: r }) {
  const a = new URL(r?.url || "https://invalid.local/"), o = oe(a.hostname), s = String(a.pathname || "/").trim() || "/";
  if (!o) throw Ie("WORKER_PLACEMENT_HOST_INVALID", "当前请求 host 无效，无法识别 Worker 脚本", 400);
  const i = [], c = /* @__PURE__ */ new Set();
  let l = null, d = !1, u = !1;
  const f = [{
    zoneId: e,
    hostname: o
  }, { hostname: o }];
  for (const m of f) {
    const p = JSON.stringify({
      zoneId: String(m?.zoneId || "").trim(),
      hostname: oe(m?.hostname || "")
    });
    if (!c.has(`query:${p}`)) {
      c.add(`query:${p}`);
      try {
        const h = await Sm(n, t, m);
        for (const y of h) {
          const _ = hm(y);
          if (!_) continue;
          const S = `${_.source}|${_.scriptName}|${_.hostname}|${_.path}`;
          c.has(S) || (c.add(S), i.push(_));
        }
        const g = $s(i, o, s);
        if (g?.scriptName) return {
          requestHost: o,
          requestPath: s,
          scriptName: g.scriptName,
          resolvedBy: g.source
        };
      } catch (h) {
        l = h, Number(h?.status) === 403 && (d = !0), console.warn("[worker_placement.resolve_script.domains_failed]", {
          requestHost: o,
          zoneId: String(m?.zoneId || "").trim(),
          hostname: oe(m?.hostname || ""),
          reason: ue(h)
        });
      }
    }
  }
  try {
    const m = $s(await _m(e, t).then((p) => p.map((h) => ym(h)).filter(Boolean)), o, s);
    if (m?.scriptName) return {
      requestHost: o,
      requestPath: s,
      scriptName: m.scriptName,
      resolvedBy: m.source
    };
  } catch (m) {
    l = m, Number(m?.status) === 403 && (u = !0), console.warn("[worker_placement.resolve_script.routes_failed]", {
      requestHost: o,
      zoneId: String(e || "").trim(),
      reason: ue(m)
    });
  }
  throw d || u ? Dn("WORKER_PLACEMENT_SCRIPT_DISCOVERY_FORBIDDEN", "discovery", "读取", { includeRouteFallback: u }) : l || Ie("WORKER_PLACEMENT_SCRIPT_UNRESOLVED", "未能根据当前站点自动识别 Worker 脚本，请确认当前 host 已绑定到该 Zone 的 Workers Domain 或 Workers Route", 400, { requestHost: o });
}
async function ln(n, e, t) {
  let r = null;
  try {
    r = await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(n || "").trim())}/workers/scripts/${encodeURIComponent(String(e || "").trim())}/settings`, String(t || "").trim());
  } catch (a) {
    throw Number(a?.status) === 403 ? Dn("WORKER_PLACEMENT_SETTINGS_READ_FORBIDDEN", "settings_read", "读取") : a;
  }
  return k(r?.result) ? r.result : {};
}
async function ea(n, e, t, r = {}) {
  const a = new FormData();
  a.append("settings", new Blob([JSON.stringify(r && typeof r == "object" ? r : {})], { type: "application/json" }), "settings.json");
  let o = null;
  try {
    o = await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(n || "").trim())}/workers/scripts/${encodeURIComponent(String(e || "").trim())}/settings`, String(t || "").trim(), {
      method: "PATCH",
      body: a
    });
  } catch (s) {
    throw Number(s?.status) === 403 ? Dn("WORKER_PLACEMENT_SETTINGS_WRITE_FORBIDDEN", "settings_write", "保存") : s;
  }
  return k(o?.result) ? o.result : {};
}
function un(n, e = "read") {
  const t = e === "write" ? "保存" : e === "default" ? "恢复默认" : "读取", r = String(n?.message || n || "").trim() || `Worker 放置${t}失败`, a = Number(n?.status) || Number(/cf_api_http_(\d+)/i.exec(r)?.[1] || 0), o = String(n?.code || "").trim().toUpperCase();
  return o.startsWith("WORKER_PLACEMENT_") && String(n?.message || "").trim() ? n.message : a === 401 ? `Cloudflare Worker 放置${t}失败：API Token 无效` : a === 403 ? `Cloudflare Worker 放置${t}失败：API Token 权限不足` : a === 404 && e !== "read" ? "Cloudflare Worker 放置保存失败：未找到目标 Worker 脚本" : a === 404 ? "Cloudflare Worker 放置读取失败：未找到目标 Worker 脚本" : o === "WORKER_PLACEMENT_SCRIPT_UNRESOLVED" || o === "WORKER_PLACEMENT_HOST_INVALID" || o === "WORKER_PLACEMENT_CONFIG_REQUIRED" ? n.message : r;
}
function es(n = {}) {
  const e = String(n?.cfAccountId || "").trim(), t = String(n?.cfZoneId || "").trim(), r = String(n?.cfApiToken || "").trim(), a = [];
  if (e || a.push("cfAccountId"), t || a.push("cfZoneId"), r || a.push("cfApiToken"), a.length <= 0) return {
    cfAccountId: e,
    cfZoneId: t,
    cfApiToken: r
  };
  throw Ie("WORKER_PLACEMENT_CONFIG_REQUIRED", "请先在账号设置中填写并保存 Cloudflare Account ID、Zone ID 与 API Token", 400, { missingFields: a });
}
function ts(n = "") {
  const e = Qt(n);
  return e ? `sys:worker_placement_region:v1:${e}` : "";
}
function Vt(n = "WORKER_PLACEMENT_KV_FAILED", e = "Worker 放置 KV 持久化失败", t = null) {
  return Ie(n, e, 503, t);
}
function bm(n) {
  return _n(n) && String(n?.code || "").trim().toUpperCase().startsWith("WORKER_PLACEMENT_") && String(n?.details?.dependency || "").trim().toUpperCase() === "KV";
}
function jc(n = {}, e = "") {
  const t = Qt(e);
  if (!t || !k(n)) return null;
  const r = Hr(n?.region, n?.provider || n?.providerId || "", []);
  return r ? {
    scriptName: t,
    region: r,
    updatedAt: String(n?.updatedAt || "").trim()
  } : null;
}
async function qc(n, e = "") {
  if (!n) return null;
  const t = ts(e);
  return t ? jc(await ve(n, t, { type: "json" }), e) : null;
}
async function Xc(n, e = "", t = "") {
  if (!n) throw Vt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：KV 未配置", {
    dependency: "KV",
    operation: "put",
    reason: "kv_not_configured"
  });
  const r = ts(e), a = Qt(e), o = Hr(t, "", []);
  if (!r || !a || !o) throw Vt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：Region 数据无效", {
    dependency: "KV",
    operation: "put",
    key: r,
    scriptName: a,
    region: o,
    reason: "invalid_region_override"
  });
  const s = {
    scriptName: a,
    region: o,
    updatedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    await n.put(r, JSON.stringify(s));
  } catch (i) {
    throw Vt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：KV 写入异常", {
      dependency: "KV",
      operation: "put",
      key: r,
      scriptName: a,
      region: o,
      reason: ue(i)
    });
  }
  return s;
}
async function Bs(n, e = "") {
  if (!n) throw Vt("WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", "Worker 放置 Region 清理失败：KV 未配置", {
    dependency: "KV",
    operation: "delete",
    reason: "kv_not_configured"
  });
  const t = ts(e), r = Qt(e);
  if (!t || !r) return !1;
  try {
    await n.delete(t);
  } catch (a) {
    throw Vt("WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", "Worker 放置 Region 清理失败：KV 删除异常", {
      dependency: "KV",
      operation: "delete",
      key: t,
      scriptName: r,
      reason: ue(a)
    });
  }
  return !0;
}
function Em(n = "") {
  const e = String(n || "").trim();
  return e ? `当前已保存的 Worker Placement Region（${e}）已不在 Cloudflare 可选区域列表中，请重新选择并保存` : "当前已保存的 Worker Placement Region 已不在 Cloudflare 可选区域列表中，请重新选择并保存";
}
function Ks(n = "", e = "", t = "", r = [], a = {}) {
  const o = Hr(t, "", r), s = Array.isArray(r) ? r : [], i = s.find((d) => String(d?.value || "").trim() === o) || null, c = a?.regionError || null;
  let l = String(a?.error || "").trim();
  return !l && c ? l = un(c, "read") : !l && o && s.length > 0 && !i && (l = Em(o)), fo({
    configured: a?.configured !== !1,
    scriptName: n,
    requestHost: e,
    currentMode: "region",
    currentValue: o,
    currentTarget: "",
    selectedMode: "region",
    selectedRegion: o,
    options: s,
    warning: "",
    error: l
  });
}
async function zn(n, e, t, r = {}) {
  let a = !1, o = !1, s = "";
  try {
    const i = jc(r?.previousOverride, e), c = r?.originalState && typeof r.originalState == "object" ? r.originalState : Da(r?.originalPlacement, r?.regionOptions);
    if (i?.region)
      return a = !0, await ea(n, e, t, { placement: { region: i.region } }), o = !0, {
        rollbackAttempted: a,
        rollbackSucceeded: o,
        rollbackError: s
      };
    a = !0, String(c?.currentMode || "").trim().toLowerCase() === "default" ? await Yc(n, e, t, r?.regionOptions) : await ea(n, e, t, { placement: Nn(r?.originalPlacement) }), o = !0;
  } catch (i) {
    o = !1, s = ue(i);
  }
  return {
    rollbackAttempted: a,
    rollbackSucceeded: o,
    rollbackError: s
  };
}
async function zs(n = {}, e, t = {}) {
  let r = "", a = "";
  try {
    const o = es(n), s = await Zo({
      ...o,
      request: e
    });
    r = s.scriptName, a = s.requestHost;
    const i = await qc(t?.kv, s.scriptName);
    let c = [], l = null;
    try {
      c = await Vc(o.cfAccountId, o.cfApiToken);
    } catch (u) {
      l = u;
    }
    if (i?.region) return Ks(s.scriptName, s.requestHost, i.region, c, {
      configured: !l,
      regionError: l
    });
    const d = Da(Nn((await ln(o.cfAccountId, s.scriptName, o.cfApiToken))?.placement), c);
    return d.currentMode === "region" && d.currentValue ? (await Xc(t?.kv, s.scriptName, d.currentValue), Ks(s.scriptName, s.requestHost, d.currentValue, c, {
      configured: !l,
      regionError: l
    })) : fo({
      configured: !l,
      scriptName: s.scriptName,
      requestHost: s.requestHost,
      currentMode: d.currentMode,
      currentValue: d.currentValue,
      currentTarget: d.currentTarget,
      selectedMode: d.selectedMode,
      selectedRegion: d.selectedRegion,
      options: c,
      warning: "",
      error: l ? un(l, "read") : ""
    });
  } catch (o) {
    if (Io(o) || bm(o) || t?.softFail !== !0) throw o;
    return fo({
      configured: !1,
      scriptName: r,
      requestHost: a,
      selectedMode: "",
      currentMode: "default",
      currentValue: "__default__",
      error: un(o, "read")
    });
  }
}
async function Yc(n, e, t, r = []) {
  const a = await ln(n, e, t), o = Nn(a?.placement), s = Da(o, r);
  if (s.currentMode === "default") return {
    settings: a,
    placementState: s,
    clearedBy: "already_default"
  };
  for (const d of [{
    tag: "empty_object",
    patch: { placement: {} }
  }, {
    tag: "null",
    patch: { placement: null }
  }]) {
    await ea(n, e, t, d.patch);
    const u = await ln(n, e, t), f = Da(u?.placement, r);
    if (f.currentMode === "default") return {
      settings: u,
      placementState: f,
      clearedBy: d.tag
    };
  }
  let i = !1, c = !1, l = "";
  if (o !== void 0) {
    i = !0;
    try {
      await ea(n, e, t, { placement: o }), c = !0;
    } catch (d) {
      c = !1, l = ue(d);
    }
  }
  throw Ie("WORKER_PLACEMENT_DEFAULT_BLOCKED", "Cloudflare 当前接口未验证出可安全恢复 Default Placement；本次已停止，未使用近似映射", 409, {
    scriptName: e,
    rollbackAttempted: i,
    rollbackSucceeded: c,
    rollbackError: l
  });
}
function Tm(n = {}, e = {}) {
  const { kernel: t } = n, { CacheManager: r, buildAdminShellState: a, buildAdminUiContract: o, withAdminShellRuntimeStatus: s } = n;
  return {
    async getDashboardSnapshot(i, { env: c, ctx: l, kv: d, db: u }) {
      const f = await me(c);
      return ne(await t.getDashboardSnapshotPayload(c, {
        ctx: l,
        kv: d,
        db: u,
        config: f,
        forceRefresh: i?.forceRefresh === !0
      }));
    },
    async getDashboardStats(i, { env: c, ctx: l, kv: d, db: u }) {
      const f = await me(c), m = await t.getDashboardSnapshotPayload(c, {
        ctx: l,
        kv: d,
        db: u,
        config: f,
        forceRefresh: i?.forceRefresh === !0
      });
      return ne({
        ...m?.stats && typeof m.stats == "object" ? m.stats : {},
        cacheMeta: m?.cacheMeta && typeof m.cacheMeta == "object" ? m.cacheMeta : {}
      });
    },
    async getMonthlyTrafficStats(i, { env: c, ctx: l }) {
      const d = await me(c);
      return ne(await t.getDashboardMonthlyTrafficPayload(c, {
        ctx: l,
        config: d,
        forceRefresh: i?.forceRefresh === !0
      }));
    },
    async getRuntimeStatus(i, { env: c, db: l }) {
      const d = await me(c), u = await t.getRuntimeStatusPayload(c, {
        db: l,
        config: d,
        forceRefresh: i?.forceRefresh === !0
      });
      return ne({
        status: u?.status && typeof u.status == "object" ? u.status : {},
        cacheMeta: u?.cacheMeta && typeof u.cacheMeta == "object" ? u.cacheMeta : {}
      });
    },
    async getAdminBootstrap(i, { env: c, ctx: l, kv: d, db: u }) {
      try {
        const f = await me(c), m = Ke(c), [p, h] = await Promise.all([r.getNodesListStrict(c, l), t.getRuntimeStatusPayload(c, {
          ctx: l,
          kv: d,
          db: u,
          config: f
        })]), g = await t.getAdminRevisionsForRead({
          env: c,
          kv: d,
          db: u
        }, {
          ctx: l,
          config: f,
          nodes: p
        });
        return ne({
          adminPath: ft(c),
          loginPath: zo(c),
          initHealth: m,
          config: Dt(f),
          hostDomain: Ge(c),
          legacyHost: qr(c),
          contract: o(),
          nodes: p,
          shell: a(c, m, f),
          runtimeStatus: h?.status && typeof h.status == "object" ? h.status : s({}, c, f, m),
          revisions: g,
          generatedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (f) {
        throw It(f, "ADMIN_BOOTSTRAP_READ_FAILED", "管理台启动数据加载失败：KV 读取异常", "admin.read.bootstrap");
      }
    },
    async getSettingsBootstrap(i, { env: c, ctx: l, kv: d, db: u }) {
      let f;
      try {
        f = await me(c);
      } catch (g) {
        throw It(g, "SETTINGS_BOOTSTRAP_READ_FAILED", "设置页加载失败：KV 读取异常", "admin.read.settings_bootstrap");
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
          kv: d,
          db: u,
          config: f
        });
        p = g?.status && typeof g.status == "object" ? g.status : {};
      } catch (g) {
        console.warn("[settings_bootstrap.runtime_status_degraded]", ue(g));
      }
      try {
        h = await t.getAdminRevisionsForRead({
          env: c,
          kv: d,
          db: u
        }, {
          ctx: l,
          config: f,
          nodes: m
        });
      } catch (g) {
        console.warn("[settings_bootstrap.revisions_degraded]", ue(g));
      }
      return ne({
        config: Dt(f),
        hostDomain: Ge(c),
        legacyHost: qr(c),
        contract: o(),
        nodes: m,
        runtimeStatus: s(p, c, f, Ke(c)),
        revisions: h,
        generatedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    async getWorkerPlacementStatus(i, { env: c, request: l, kv: d }) {
      try {
        return ne(await zs(await me(c), l, {
          softFail: !0,
          kv: d
        }));
      } catch (u) {
        throw It(u, "WORKER_PLACEMENT_READ_FAILED", "Worker 放置状态读取失败：KV 读取异常", "admin.read.worker_placement");
      }
    },
    async saveWorkerPlacement(i, { env: c, request: l, kv: d }) {
      let u;
      try {
        u = await me(c);
      } catch (m) {
        throw It(m, "WORKER_PLACEMENT_SAVE_FAILED", "Worker 放置保存失败：KV 读取异常", "admin.write.worker_placement");
      }
      const f = String(i?.mode || "").trim().toLowerCase();
      if (f !== "default" && f !== "smart" && f !== "region") return z("WORKER_PLACEMENT_MODE_INVALID", "请选择有效的 Worker 放置模式");
      try {
        const m = es(u), p = await Zo({
          ...m,
          request: l
        }), h = await qc(d, p.scriptName), g = await Vc(m.cfAccountId, m.cfApiToken), y = Nn((await ln(m.cfAccountId, p.scriptName, m.cfApiToken))?.placement), _ = Da(y, g);
        if (f === "region") {
          const S = String(i?.region || "").trim(), T = g.find((b) => String(b?.value || "").trim() === S);
          if (!T) return z("WORKER_PLACEMENT_REGION_INVALID", "所选 Placement 区域已失效，请刷新后重试");
          await ea(m.cfAccountId, p.scriptName, m.cfApiToken, { placement: { region: T.value } });
          try {
            await Xc(d, p.scriptName, T.value);
          } catch (b) {
            const A = await zn(m.cfAccountId, p.scriptName, m.cfApiToken, {
              previousOverride: h,
              originalPlacement: y,
              originalState: _,
              regionOptions: g
            });
            throw Vt(b?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", String(b?.message || "Worker 放置 Region 持久化失败：KV 写入异常"), {
              ...k(b?.details) ? b.details : {},
              requestedMode: f,
              dependency: "KV",
              region: T.value,
              rollbackAttempted: A.rollbackAttempted,
              rollbackSucceeded: A.rollbackSucceeded,
              rollbackError: A.rollbackError
            });
          }
        } else if (f === "smart") {
          if (await ea(m.cfAccountId, p.scriptName, m.cfApiToken, { placement: { mode: "smart" } }), h) try {
            await Bs(d, p.scriptName);
          } catch (S) {
            const T = await zn(m.cfAccountId, p.scriptName, m.cfApiToken, {
              previousOverride: h,
              originalPlacement: y,
              originalState: _,
              regionOptions: g
            });
            throw Vt(S?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", String(S?.message || "Worker 放置 Region 清理失败：KV 删除异常"), {
              ...k(S?.details) ? S.details : {},
              requestedMode: f,
              dependency: "KV",
              rollbackAttempted: T.rollbackAttempted,
              rollbackSucceeded: T.rollbackSucceeded,
              rollbackError: T.rollbackError
            });
          }
        } else if (await Yc(m.cfAccountId, p.scriptName, m.cfApiToken, g), h) try {
          await Bs(d, p.scriptName);
        } catch (S) {
          const T = await zn(m.cfAccountId, p.scriptName, m.cfApiToken, {
            previousOverride: h,
            originalPlacement: y,
            originalState: _,
            regionOptions: g
          });
          throw Vt(S?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", String(S?.message || "Worker 放置 Region 清理失败：KV 删除异常"), {
            ...k(S?.details) ? S.details : {},
            requestedMode: f,
            dependency: "KV",
            rollbackAttempted: T.rollbackAttempted,
            rollbackSucceeded: T.rollbackSucceeded,
            rollbackError: T.rollbackError
          });
        }
        return ne(await zs(u, l, {
          softFail: !1,
          kv: d
        }));
      } catch (m) {
        return z("WORKER_PLACEMENT_SAVE_FAILED", un(m, f === "default" ? "default" : "write"), xe(m?.status, f === "default" ? 409 : 400), k(m?.details) ? m.details : null);
      }
    }
  };
}
var Jc = 600 * 1e3, Am = Jc;
function ct(n = "", e = "manual") {
  const t = String(e || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", r = String(n || "").trim().toLowerCase();
  return t !== "manual" ? "smart" : r === "full" ? "full" : "smart";
}
function Rm(n = "", e = "manual") {
  return ct(n, e) === "full";
}
function rs(n = "worker.js") {
  const e = String(n || "").trim().split(/[\\/]+/).pop() || "";
  return e && /\.js$/i.test(e) ? e : "";
}
function Qc(n = "") {
  const e = String(n || "");
  return e && (/(^|\n)\s*export\s+/m.test(e) || /(^|\n)\s*import\s+(?:[\w*{]|["'])/m.test(e)) ? "module" : "service-worker";
}
function Cm(n = "", e = "worker.js") {
  const t = rs(e);
  if (t.toLowerCase() !== "worker.js") throw Ie("WORKER_UPLOAD_FILE_NAME_INVALID", "Worker 文件名必须是 worker.js", 400, { fileName: t || String(e || "").trim() });
  const r = String(n || ""), a = new TextEncoder().encode(r).length;
  if (!r.trim()) throw Ie("WORKER_UPLOAD_EMPTY", "worker.js 不能为空", 400);
  if (a > 3145728) throw Ie("WORKER_UPLOAD_TOO_LARGE", `worker.js 体积超过限制（${a} bytes）`, 400, {
    contentLength: a,
    maxBytes: Im
  });
  return {
    fileName: t,
    scriptContent: r,
    contentLength: a,
    syntax: Qc(r)
  };
}
function wm(n = "", e = "module") {
  const t = rs(n) || "worker.js";
  return e === "module" ? { main_module: t } : { body_part: t };
}
function Lm(n = "module") {
  return n === "module" ? "application/javascript+module" : "application/javascript";
}
function Zc() {
  return [{
    scope: "账号",
    permission: "Workers Scripts Write",
    alternative: "",
    note: "这是账号级 Worker 脚本编辑权限，用于上传 .js 文件并仅更新脚本代码，不修改 bindings 或 settings"
  }];
}
function el(n = "更新") {
  const e = Wc(Zc());
  return e.length > 0 ? `Cloudflare Worker 脚本${n}失败：API Token 权限不足。至少需要：${e.join("；")}` : `Cloudflare Worker 脚本${n}失败：API Token 权限不足`;
}
function Nm(n = "WORKER_SCRIPT_UPDATE_FORBIDDEN", e = "更新") {
  return Ie(n, el(e), 403, { requiredPermissions: Zc() });
}
async function Dm(n, e, t, r, a = {}) {
  const o = String(n || "").trim(), s = Qt(e), i = String(t || "").trim(), c = rs(a?.fileName) || "worker.js", l = String(r || ""), d = Qc(l), u = new FormData();
  u.append("metadata", new Blob([JSON.stringify(wm(c, d))], { type: "application/json" }), "metadata.json"), u.append("files", new Blob([l], { type: Lm(d) }), c);
  let f = null;
  try {
    f = await Re(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(o)}/workers/scripts/${encodeURIComponent(s)}/content`, i, {
      method: "PUT",
      body: u
    });
  } catch (m) {
    throw Number(m?.status) === 403 ? Nm("WORKER_SCRIPT_UPDATE_FORBIDDEN", "更新") : m;
  }
  return {
    syntax: d,
    fileName: c,
    result: k(f?.result) ? f.result : {}
  };
}
function Ws(n) {
  const e = String(n?.message || n || "").trim() || "Worker 脚本更新失败", t = Number(n?.status) || Number(/cf_api_http_(\d+)/i.exec(e)?.[1] || 0), r = String(n?.code || "").trim().toUpperCase();
  return r === "WORKER_SCRIPT_UPDATE_FORBIDDEN" && String(n?.message || "").trim() ? n.message : r === "WORKER_PLACEMENT_SCRIPT_DISCOVERY_FORBIDDEN" ? String(n?.message || "").replace("Cloudflare Worker 放置读取失败", "Cloudflare Worker 脚本定位失败").trim() : r === "WORKER_PLACEMENT_SCRIPT_UNRESOLVED" || r === "WORKER_PLACEMENT_HOST_INVALID" || r === "WORKER_PLACEMENT_CONFIG_REQUIRED" ? e : t === 401 ? "Cloudflare Worker 和 HTML 更新失败：API Token 无效" : t === 403 ? el("更新") : t === 404 ? "Cloudflare Worker 和 HTML 更新失败：未找到目标 Worker 脚本" : e;
}
var Im = 3 * 1024 * 1024;
function Mm(n = {}, e = {}) {
  const { kernel: t } = n, { buildAdminLocalIndexUploadRecord: r } = n;
  return {
    async loadConfig(a, { env: o, kv: s, db: i, ctx: c }) {
      try {
        const l = await me(o), d = await t.getAdminRevisionsForRead({
          env: o,
          kv: s,
          db: i
        }, {
          ctx: c,
          config: l
        });
        return ne({
          config: Dt(l),
          revisions: d
        });
      } catch (l) {
        throw It(l, "CONFIG_READ_FAILED", "设置读取失败：KV 读取异常", "admin.read.config");
      }
    },
    async previewConfig(a, { env: o, kv: s, ctx: i }) {
      const c = a?.config && typeof a.config == "object" && !Array.isArray(a.config) ? a.config : {};
      if (!s) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const l = await me(o), d = await t.prepareRuntimeConfigPersistence(Bn(c, l), {
        env: o,
        kv: s,
        ctx: i
      });
      return ne({
        config: Dt(d.nextConfig),
        hostPrefixDnsSyncCount: d.dnsPlans.length
      });
    },
    async previewTidyData(a, { env: o, kv: s, db: i }) {
      const c = String(a?.scope || "kv").trim().toLowerCase() === "d1" ? "d1" : "kv";
      try {
        if (c === "d1") {
          if (!i) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
          const u = await t.buildD1TidyPlan(o, {
            db: i,
            kv: s,
            maintenanceMode: ct(a?.maintenanceMode, "manual")
          }), f = u.schemaStatus?.schemaReady !== !0, m = f ? "" : await t.createD1TidyPlanToken(o, u);
          return ne({
            success: !0,
            scope: "d1",
            planHash: f ? "" : u.planHash,
            planToken: m,
            planExpiresAt: m ? new Date($() + Am).toISOString() : "",
            requiresSchemaInitialization: f,
            summary: u.summary,
            ...u.preview
          });
        }
        if (!s) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace");
        const l = await t.buildKvTidyPlan(o, {
          kv: s,
          db: i
        }), d = await t.createKvTidyPlanToken(o, l);
        return ne({
          success: !0,
          scope: "kv",
          planHash: l.planHash,
          planToken: d,
          planExpiresAt: new Date($() + Jc).toISOString(),
          summary: l.summary,
          ...l.preview
        });
      } catch (l) {
        const d = l?.message || String(l);
        return z(String(l?.code || "TIDY_PREVIEW_FAILED"), d, xe(l?.status, 500), {
          scope: c,
          ...k(l?.details) ? l.details : {}
        });
      }
    },
    async updateWorkerAndAdminIndex(a, { env: o, request: s, kv: i, ctx: c }) {
      if (!i) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      let l;
      try {
        l = await me(o);
      } catch (S) {
        throw It(S, "WORKER_HTML_UPDATE_FAILED", "Worker 和 HTML 更新失败：KV 读取异常", "admin.write.worker_html");
      }
      const d = typeof a?.workerScriptContent == "string" ? a.workerScriptContent : "", u = typeof a?.indexHtml == "string" ? a.indexHtml : "";
      if (!d.trim() || !u.trim()) return z("WORKER_HTML_FILES_REQUIRED", "必须同时上传 worker.js 和 index.html，缺一不可", 400, {
        workerFileProvided: !!d.trim(),
        indexFileProvided: !!u.trim()
      });
      let f, m;
      try {
        f = Cm(d, a?.workerFileName);
        const S = String(a?.indexFileName || "").trim().split(/[\\/]+/).pop() || "";
        if (S.toLowerCase() !== "index.html") return z("ADMIN_INDEX_UPLOAD_FILE_NAME_INVALID", "HTML 文件名必须是 index.html", 400, { fileName: S || String(a?.indexFileName || "").trim() });
        m = await r(u, S);
      } catch (S) {
        return z(String(S?.code || "WORKER_HTML_VALIDATION_FAILED"), ue(S, "Worker 或 HTML 文件校验失败"), xe(S?.status, 400), k(S?.details) ? S.details : null);
      }
      let p, h;
      try {
        p = es(l), h = await Zo({
          ...p,
          request: s
        });
      } catch (S) {
        return z(String(S?.code || "WORKER_SCRIPT_CONTEXT_FAILED"), Ws(S), xe(S?.status, 400), k(S?.details) ? S.details : null);
      }
      let g;
      try {
        g = await t.persistAdminIndexUpload(m, {
          env: o,
          kv: i,
          ctx: c
        });
      } catch (S) {
        return z(String(S?.code || "ADMIN_INDEX_UPLOAD_FAILED"), ue(S, "index.html 激活失败"), xe(S?.status, 500), k(S?.details) ? S.details : null);
      }
      let y;
      try {
        y = await Dm(p.cfAccountId, h.scriptName, p.cfApiToken, f.scriptContent, { fileName: f.fileName });
      } catch (S) {
        let T = !1, b = !1, A = "", C = "";
        try {
          const N = await t.rollbackAdminIndexUploadActivation(g.previousConfig, g.config, {
            env: o,
            kv: i,
            ctx: c
          });
          T = !0, b = N.skipped === !0, A = String(N.reason || "").trim();
        } catch (N) {
          C = ue(N, "rollback_failed");
        }
        return z(String(S?.code || "WORKER_HTML_UPDATE_FAILED"), Ws(S), xe(S?.status, 400), {
          ...k(S?.details) ? S.details : {},
          htmlRollbackAttempted: !0,
          htmlRollbackSucceeded: T,
          htmlRollbackSkipped: b,
          htmlRollbackReason: A,
          htmlRollbackError: C
        });
      }
      const _ = y.result;
      return ne({
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
        revisions: await t.getAdminRevisions(o, {
          ctx: c,
          config: g.config
        })
      });
    },
    async saveConfig(a, { env: o, ctx: s, kv: i }) {
      if (!i) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const c = await me(o), l = a.config ? await t.persistRuntimeConfig(Bn(a.config, c), {
        env: o,
        kv: i,
        ctx: s,
        expectedConfigRevision: a?.expectedConfigRevision,
        mutationId: a?.mutationId,
        forceKvCommit: !0
      }) : c, d = await t.getAdminRevisions(o, {
        ctx: s,
        config: l
      });
      return ne({
        success: !0,
        committed: !0,
        config: Dt(l),
        revision: String(d.configRevision || ""),
        revisions: d
      });
    },
    async uploadAdminIndex(a, { env: o, ctx: s, kv: i }) {
      if (!i) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      try {
        const c = String(a?.fileName || "").trim().split(/[\\/]+/).pop() || "";
        if (c.toLowerCase() !== "index.html") return z("ADMIN_INDEX_UPLOAD_FILE_NAME_INVALID", "HTML 文件名必须是 index.html", 400, { fileName: c || String(a?.fileName || "").trim() });
        const l = await r(a?.indexHtml, c), d = await t.persistAdminIndexUpload(l, {
          env: o,
          kv: i,
          ctx: s
        });
        return ne({
          success: !0,
          source: "local_upload",
          revision: d.record.revision,
          assetRevision: d.record.assetRevision,
          sourceUrl: d.record.sourceUrl,
          fileName: d.record.fileName,
          bytes: d.record.bytes,
          uploadedAt: d.record.uploadedAt,
          config: Dt(d.config),
          revisions: await t.getAdminRevisions(o, {
            ctx: s,
            config: d.config
          })
        });
      } catch (c) {
        return z(String(c?.code || "ADMIN_INDEX_UPLOAD_FAILED"), ue(c, "本地 index.html 上传失败"), xe(c?.status, 500), k(c?.details) ? c.details : null);
      }
    },
    async exportConfig(a, { env: o, ctx: s, request: i }) {
      const c = t.getKV(o), l = a?.includeSecrets === !0;
      if (l && String(i.headers.get("X-Admin-Confirm") || "").trim() !== "exportConfig") return z("CONFIRMATION_REQUIRED", "Exporting secrets requires explicit confirmation", 428);
      const d = await me(o), u = St(o, d), f = c && u.localUploadRevision ? await t.getAdminIndexUploadRecord(c, u.localUploadRevision) : null, m = c ? (await t.loadAllNodeEntitiesFromKvStrict(c, { ctx: s })).filter(Boolean) : [], p = {
        version: B.Defaults.Version,
        exportTime: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
        nodes: m,
        config: l ? d : xs(d),
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
      }, h = JSON.stringify(p), g = Fe(h) + 23 - 1;
      return g > 12517376 ? z("FULL_BACKUP_TOO_LARGE", "完整备份超过安全回导上限，请先分别导出节点与设置并精简超大节点字段", 413, {
        importRequestBytes: g,
        maxBytes: pd,
        nodeCount: p.nodes.length,
        adminIndexBytes: Number(f?.bytes) || 0
      }) : new Response(h, { headers: ic() });
    },
    async exportSettings(a, { env: o, request: s }) {
      const i = a?.includeSecrets === !0;
      if (i && String(s.headers.get("X-Admin-Confirm") || "").trim() !== "exportSettings") return z("CONFIRMATION_REQUIRED", "导出完整密钥需要显式确认", 428);
      const c = await me(o);
      return ne({
        version: B.Defaults.Version,
        type: "settings-only",
        exportTime: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
        config: i ? c : xs(c),
        secretsRedacted: i !== !0,
        containsSecrets: i === !0
      });
    },
    async importSettings(a, { env: o, ctx: s, kv: i }) {
      if (!i) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const c = a?.config && typeof a.config == "object" && !Array.isArray(a.config) ? a.config : a?.settings && typeof a.settings == "object" && !Array.isArray(a.settings) ? a.settings : null;
      if (!c) return z("INVALID_SETTINGS_BACKUP", "设置备份文件无效，缺少 config/settings 对象");
      const l = await me(o), d = await t.persistRuntimeConfig(Bn(c, l), {
        env: o,
        kv: i,
        ctx: s,
        forceKvCommit: !0
      }), u = await t.getAdminRevisions(o, {
        ctx: s,
        config: d
      });
      return ne({
        success: !0,
        config: Dt(d),
        revisions: u,
        generatedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  };
}
function Pm(n = {}, e = {}) {
  const { kernel: t } = n, { CacheManager: r } = n;
  return {
    async list(a, { env: o, ctx: s, kv: i, db: c }) {
      try {
        const l = await r.getNodesListStrict(o, s);
        return ne({
          nodes: l,
          revisions: await t.getAdminRevisionsForRead({
            env: o,
            kv: i,
            db: c
          }, {
            ctx: s,
            nodes: l
          })
        });
      } catch (l) {
        throw It(l, "NODE_LIST_READ_FAILED", "节点列表读取失败：KV 读取异常", "admin.read.nodes");
      }
    },
    async getDashboardD1WriteHotspot(a, { env: o, ctx: s }) {
      const i = await me(o);
      return ne(await t.buildDashboardD1WriteHotspotPayload(o, {
        config: i,
        nowMs: $()
      }));
    },
    async getDashboardCoreStats(a, { env: o, ctx: s, kv: i, db: c }) {
      const l = await me(o);
      return ne(await t.buildDashboardStatsPayload(o, {
        ctx: s,
        kv: i,
        db: c,
        config: l,
        skipD1WriteHotspot: !0
      }));
    },
    async getDashboardCachedSnapshot(a, { env: o, db: s }) {
      const i = await me(o);
      return ne({ snapshot: await t.getDashboardCachedSnapshotPayload(o, {
        db: s,
        config: i
      }) });
    },
    async getNode(a, { env: o, ctx: s, kv: i, db: c }) {
      const l = String(a?.name || "").trim();
      if (!l) return z("NODE_NAME_REQUIRED", "请提供节点路径");
      const d = await t.getNodeForRead(l, o);
      if (!d) return z("NODE_NOT_FOUND", "节点不存在", 404);
      const u = {
        name: l.toLowerCase(),
        ...d
      }, f = Np(l, d);
      return ne({
        success: !0,
        node: u,
        warnings: f ? [f] : [],
        revisions: await t.getAdminRevisionsForRead({
          env: o,
          kv: i,
          db: c
        }, { ctx: s })
      });
    }
  };
}
function mo(n = [], e = {}) {
  const t = e.renameMap instanceof Map ? e.renameMap : new Map(Object.entries(e.renameMap && typeof e.renameMap == "object" ? e.renameMap : {})), r = /* @__PURE__ */ new Map();
  for (const [l, d] of t.entries()) {
    const u = String(l || "").trim().toLowerCase(), f = String(d || "").trim();
    !u || !f || r.set(u, f);
  }
  const a = new Set(bt(e.removedNames || []).map((l) => String(l || "").trim().toLowerCase()).filter(Boolean)), o = e.allowedNames === void 0 ? null : bt(e.allowedNames || []).map((l) => [String(l || "").trim().toLowerCase(), String(l || "").trim()]).filter(([l, d]) => l && d), s = o ? new Map(o) : null, i = [], c = /* @__PURE__ */ new Set();
  for (const l of bt(n)) {
    const d = String(l || "").trim().toLowerCase();
    if (!d || a.has(d)) continue;
    const u = r.get(d) || String(l || "").trim(), f = u.toLowerCase();
    !f || a.has(f) || s && !s.has(f) || c.has(f) || (c.add(f), i.push(s?.get(f) || u));
  }
  return i;
}
function xm(n, e = null, t = "") {
  const r = String(n?.proxyMode || n?.mode || "").trim().toLowerCase();
  if ([
    "direct",
    "source-direct",
    "origin-direct",
    "node-direct"
  ].includes(r) || n?.direct === !0 || n?.sourceDirect === !0 || n?.directSource === !0 || n?.direct2xx === !0) return !0;
  const a = `${Vr(n?.tags, n?.tag).join(" ")} ${n?.remark || ""}`;
  return /(?:^|[\s[(【])(?:直连|source-direct|origin-direct|node-direct)(?:$|[\s\])】])/i.test(a);
}
function Om(n, e = null, t = "") {
  const r = Gr(n);
  return r === "direct" ? !0 : r === "proxy" ? !1 : xm(n, e, t);
}
function Ia(n, e) {
  if (!n) return null;
  try {
    const t = new URL(n, e instanceof URL ? e : String(e || ""));
    return ["http:", "https:"].includes(t.protocol) ? t : null;
  } catch {
    return null;
  }
}
function tl(n) {
  return n === 301 || n === 302 || n === 303 || n === 307 || n === 308;
}
function vm(n, e) {
  if (!n || !/^https?:\/\//i.test(n)) return !1;
  try {
    const t = new URL(n);
    return !e || t.origin !== e;
  } catch {
    return !1;
  }
}
function Gs(n, e = null) {
  if (!/^https?:\/\//i.test(n)) return n;
  const t = e instanceof URL ? e : null;
  try {
    const r = new URL(n);
    return !r.username && !r.password || t && r.origin === t.origin && r.username === t.username && r.password === t.password ? n : (r.username = "", r.password = "", r.toString());
  } catch {
    return n;
  }
}
function Fm(n, e) {
  const t = n?.requestTraits || {};
  if (t.isPlaybackCriticalRequest !== !0 && t.isImage !== !0 && t.isSubtitle !== !0) return null;
  const r = e?.clientRedirectAuthPolicy || ra(e?.newHeaders || n.request.headers);
  return e && typeof e == "object" && (e.clientRedirectAuthPolicy = r), {
    policy: r,
    mode: n.effectiveMediaAuthMode,
    canDirect: r.canDirect === !0
  };
}
function Um(n, e = "GET") {
  const t = String(e || "GET").toUpperCase();
  return n === 303 && t !== "GET" && t !== "HEAD" || (n === 301 || n === 302) && t === "POST" ? "GET" : t;
}
function km(n = {}, e = {}) {
  const t = cc(_a(n, "protocolStrategy") ? n?.protocolStrategy : Go(n)), r = Number.isFinite(Number(e.hourUtc8)) ? Number(e.hourUtc8) : (/* @__PURE__ */ (/* @__PURE__ */ new Date()).getUTCHours() + 8) % 24, a = r >= 20 && r < 24;
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
function Hm(n = {}, e = {}) {
  const { kernel: t } = n, { CacheManager: r, buildAdminLocalIndexUploadRecord: a } = n;
  return {
    async saveOrImport(o, { action: s, ctx: i, kv: c, env: l }) {
      const d = s === "save" ? [o] : o.nodes, u = Cs(d, l);
      if (u) return z("NODE_NAME_RESERVED", "节点路径与系统保留路由冲突，请更换后重试", 409, u);
      const f = ws(d, l);
      return f ? z(f.code, f.message, 400, f) : await nr(c)(async () => {
        const m = [], p = /* @__PURE__ */ new Map(), h = [], g = Ge(l), y = await me(l);
        for (const b of d) {
          if (!b.name || !b.target && !(Array.isArray(b.lines) && b.lines.length)) continue;
          const A = String(b.name).toLowerCase(), C = b.originalName ? String(b.originalName).toLowerCase() : null, N = !!(C && C !== A);
          if (s === "save" && (!C || C !== A) && await c.get(`${t.PREFIX}${A}`, { type: "json" }))
            return z("NODE_NAME_CONFLICT", "节点路径已存在，请更换后重试", 409, { name: A });
          let P = {};
          N ? P = await c.get(`${t.PREFIX}${C}`, { type: "json" }) || {} : P = await c.get(`${t.PREFIX}${A}`, { type: "json" }) || {};
          const E = t.buildPreparedNodeMutation(b, P, {
            previousName: C || A,
            nextName: A
          });
          if (!E) continue;
          const w = rt(A, E.nextNode);
          if (w) return z("NODE_RESOURCE_LIMIT_EXCEEDED", "节点配置超过 Worker 资源限制", 400, w);
          E.dnsPlan = t.buildHostPrefixDnsSyncPlan(E.previousName, E.previousNode, E.nextName, E.nextNode, g, {
            config: y,
            forceUpsert: !0
          }), h.push(E), E.isRename && p.set(E.previousName, E.nextName), m.push(A);
        }
        if (s === "save" && m.length === 0) return z("INVALID_TARGET", "目标源站必须是有效的 http/https URL");
        Un(h, y, l);
        const _ = m.length > 0 || p.size > 0;
        let S = !1, T = null;
        try {
          await t.applyPreparedNodeMutations(h, {
            env: l,
            kv: c,
            ctx: i,
            requestHost: g
          }), S = h.some((E) => E?.nodeChanged === !0);
          const b = _ ? await t.rebuildNodeIndexesFromKv(c, {
            ctx: i,
            syncLegacyIndex: s === "import"
          }) : null, A = Array.isArray(b?.summaries) ? b.summaries : await r.getNodesList(l, i), C = new Map((Array.isArray(A) ? A : []).map((E) => [String(E?.name || "").toLowerCase().trim(), E])), N = m.map((E) => C.get(String(E || "").toLowerCase().trim()) || null).filter(Boolean), P = Array.isArray(b?.index) ? b.index : Array.isArray(A) ? A.map((E) => E?.name) : [];
          if ((p.size > 0 || s === "save" && N.length === 1) && (T = await t.captureRuntimeConfigRollbackState(l, c), p.size > 0 && await t.commitSourceDirectNodesConfigWithinMutation(l, c, i, {
            renameMap: p,
            allowedNames: P,
            source: s === "import" ? "node_import" : "node_save",
            note: [...p.entries()].map(([E, w]) => `${E}->${w}`).join(",")
          }), s === "save" && N.length === 1)) {
            const E = N[0];
            await t.commitSingleNodeMainVideoStreamShortcutShadowWithinMutation(l, c, i, {
              originalName: o.originalName,
              nodeName: E?.name,
              mode: E?.mainVideoStreamMode,
              source: "node_save",
              note: String(E?.name || "").trim()
            });
          }
          return ne({
            success: !0,
            node: s === "save" ? N[0] : void 0,
            nodes: A,
            importedNodes: s === "import" ? N : void 0,
            revisions: await t.getAdminRevisions(l, {
              ctx: i,
              nodes: A
            })
          });
        } catch (b) {
          let A = "", C = "";
          if (T) try {
            await t.restoreCapturedRuntimeConfigState(T, {
              env: l,
              kv: c,
              ctx: i
            });
          } catch (N) {
            A = ue(N, "config_restore_failed");
          }
          if (S) try {
            await t.rollbackPreparedNodeMutations(h, {
              env: l,
              kv: c,
              ctx: i,
              requestHost: g,
              rebuildIndexes: !0
            });
          } catch (N) {
            C = ue(N, "rollback_failed");
          }
          throw b && typeof b == "object" && (String(b.code || "").trim() || (b.code = "NODE_MUTATION_FAILED"), b.status = xe(b.status, 500), (T || S) && (b.details = {
            ...k(b.details) ? b.details : {},
            rollbackAttempted: !0,
            configRollbackError: A,
            nodeRollbackError: C
          })), b;
        }
      });
    },
    async saveMainVideoStreamPolicyShortcuts(o, { env: s, ctx: i, kv: c }) {
      return c ? await nr(c)(async () => {
        const l = await t.loadAllNodeEntitiesFromKvStrict(c, { ctx: i }), d = Array.isArray(l) ? l.map((A) => A?.name) : [], u = mo(o?.selectedNodeNames || [], { allowedNames: d }), f = new Set(u.map((A) => String(A || "").trim().toLowerCase()).filter(Boolean));
        let m = 0;
        const p = Ge(s), h = await me(s), g = [];
        for (const A of Array.isArray(l) ? l : []) {
          if (!k(A)) continue;
          const C = String(A.name || "").trim().toLowerCase();
          if (!C) continue;
          const N = Gr(A);
          let P = N;
          if (f.has(C) ? P = "direct" : N === "direct" && (P = "inherit"), P !== N) {
            const { name: E, ...w } = A, R = {
              name: C,
              ...w,
              mainVideoStreamMode: P
            }, D = t.buildPreparedNodeMutation(R, A, {
              previousName: C,
              nextName: C
            });
            if (!D) continue;
            D.nextNode = t.normalizeNode(C, D.nextNode || R, { dropLegacyDirectRouting: !0 }).data, D.dnsPlan = t.buildHostPrefixDnsSyncPlan(D.previousName, D.previousNode, D.nextName, D.nextNode, p, {
              config: h,
              forceUpsert: !0
            }), g.push(D), m += 1;
          }
        }
        Un(g, h, s);
        const y = ae(h.sourceDirectNodes || []) !== ae(u), _ = m > 0 || y ? await t.captureRuntimeConfigRollbackState(s, c) : null;
        let S = null, T = h;
        try {
          m > 0 && (await t.applyPreparedNodeMutations(g, {
            env: s,
            kv: c,
            ctx: i,
            requestHost: p
          }), S = await t.rebuildNodeIndexesFromKv(c, { ctx: i })), y && (T = await t.commitRuntimeConfig({
            ...h,
            sourceDirectNodes: u
          }, {
            env: s,
            kv: c,
            ctx: i
          }));
        } catch (A) {
          let C = "", N = "";
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
            N = ue(P, "rollback_failed");
          }
          throw A && typeof A == "object" && (String(A.code || "").trim() || (A.code = "NODE_MUTATION_FAILED"), A.status = xe(A.status, 500), A.details = {
            ...k(A.details) ? A.details : {},
            rollbackAttempted: !0,
            configRollbackError: C,
            nodeRollbackError: N
          }), A;
        }
        const b = Array.isArray(S?.summaries) ? S.summaries : await r.getNodesList(s, i);
        return ne({
          success: !0,
          selectedNodeNames: u,
          updatedNodeCount: m,
          config: Dt(T),
          nodes: b,
          revisions: await t.getAdminRevisions(s, {
            ctx: i,
            config: T,
            nodes: b
          })
        });
      }) : z("KV_UNAVAILABLE", "KV 未绑定或不可用", 500);
    },
    async importFull(o, { env: s, ctx: i, kv: c }) {
      const l = Cs(o?.nodes, s);
      if (l) return z("NODE_NAME_RESERVED", "节点路径与系统保留路由冲突，请更换后重试", 409, l);
      const d = ws(o?.nodes, s);
      if (d) return z(d.code, d.message, 400, d);
      const u = tt(o?.config?.indexUrl || "");
      let f = null;
      if (k(o?.adminIndexUpload)) {
        const m = String(o.adminIndexUpload.fileName || "").trim().split(/[\\/]+/).pop() || "";
        if (m.toLowerCase() !== "index.html") return z("ADMIN_INDEX_BACKUP_INVALID", "完整备份中的 HTML 文件名必须是 index.html", 400);
        try {
          f = await a(o.adminIndexUpload.html, m);
        } catch (p) {
          return z(String(p?.code || "ADMIN_INDEX_BACKUP_INVALID"), ue(p, "完整备份中的 index.html 无效"), xe(p?.status, 400), k(p?.details) ? p.details : null);
        }
        if (u && f.revision !== u) return z("ADMIN_INDEX_BACKUP_REVISION_MISMATCH", "完整备份中的 index.html 与配置版本不一致", 400, {
          expectedRevision: u,
          actualRevision: f.revision
        });
      }
      return u && !f && !await t.getAdminIndexUploadRecord(c, u) ? z("ADMIN_INDEX_BACKUP_MISSING", "完整备份缺少当前配置引用的 index.html", 400, { revision: u }) : await nr(c)(async () => {
        const m = await me(s), p = o.config ? await t.captureRuntimeConfigRollbackState(s, c) : null, h = o.config ? Ic(o.config, m) : null, g = h ? ce(h) : m, y = Ge(s), _ = f ? t.buildAdminIndexUploadKey(f.revision) : "", S = _ ? await c.get(_) : null, T = o.config ? await c.get(t.ADMIN_ACTIVE_INDEX_KEY) : null, b = u ? f || await t.getAdminIndexUploadRecord(c, u) : null, A = [];
        if (Array.isArray(o.nodes)) for (const w of o.nodes) {
          if (!w.name || !w.target && !(Array.isArray(w.lines) && w.lines.length)) continue;
          const R = String(w.name).toLowerCase(), D = await c.get(`${t.PREFIX}${R}`, { type: "json" }) || {}, x = t.buildPreparedNodeMutation(w, D, {
            previousName: R,
            nextName: R
          });
          x && (x.dnsPlan = t.buildHostPrefixDnsSyncPlan(x.previousName, x.previousNode, x.nextName, x.nextNode, y, {
            previousConfig: m,
            nextConfig: g,
            forceUpsert: !0
          }), A.push(x));
        }
        Un(A, g, s);
        let C = null, N = !1;
        try {
          _ && await c.put(_, JSON.stringify(f)), h && (b ? await c.put(t.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(b)) : await c.delete(t.ADMIN_ACTIVE_INDEX_KEY)), h && (C = await t.commitRuntimeConfig(h, {
            env: s,
            kv: c,
            ctx: i
          })), A.length > 0 && (await t.applyPreparedNodeMutations(A, {
            env: s,
            kv: c,
            ctx: i,
            requestHost: y
          }), N = !0, await t.rebuildNodeIndexesFromKv(c, {
            ctx: i,
            syncLegacyIndex: !0
          }));
        } catch (w) {
          let R = "", D = "", x = "";
          if (N) try {
            await t.rollbackPreparedNodeMutations(A, {
              env: s,
              kv: c,
              ctx: i,
              requestHost: y,
              rebuildIndexes: !0
            });
          } catch (L) {
            D = ue(L, "rollback_failed");
          }
          if (p) try {
            await t.restoreCapturedRuntimeConfigAndDnsState(p, {
              env: s,
              kv: c,
              ctx: i
            });
          } catch (L) {
            R = ue(L, "config_restore_failed");
          }
          if (_) try {
            S === null ? await c.delete(_) : await c.put(_, S);
          } catch (L) {
            x = ue(L, "admin_index_restore_failed");
          }
          if (o.config) try {
            T === null ? await c.delete(t.ADMIN_ACTIVE_INDEX_KEY) : await c.put(t.ADMIN_ACTIVE_INDEX_KEY, T);
          } catch (L) {
            x = [x, ue(L, "active_admin_index_restore_failed")].filter(Boolean).join("; ");
          }
          throw w && typeof w == "object" && (String(w.code || "").trim() || (w.code = "IMPORT_FULL_FAILED"), w.status = xe(w.status, 500), w.details = {
            ...k(w.details) ? w.details : {},
            rollbackAttempted: !!p || N || !!_,
            configRollbackError: R,
            nodeRollbackError: D,
            adminIndexRollbackError: x
          }), w;
        }
        const P = C || await we(s), E = await r.getNodesList(s, i);
        return ne({
          success: !0,
          config: P,
          nodes: E,
          adminIndexUpload: f ? {
            revision: f.revision,
            fileName: f.fileName,
            bytes: f.bytes
          } : null,
          revisions: await t.getAdminRevisions(s, {
            ctx: i,
            config: P,
            nodes: E
          })
        });
      });
    },
    async delete(o, { ctx: s, kv: i, env: c }) {
      return await nr(i)(async () => {
        if (o.name) {
          const l = String(o.name).toLowerCase(), d = await me(c), u = await i.get(`${t.PREFIX}${l}`, { type: "json" }) || null, f = u ? t.normalizeNode(l, u || {}).data : null, m = {
            previousName: l,
            previousNode: f,
            nextName: l,
            nextNode: null,
            isRename: !1,
            nodeChanged: !!f,
            isSemanticNoop: !f,
            dnsPlan: t.buildHostPrefixDnsSyncPlan(l, f, "", null, Ge(c), { config: d })
          }, p = Ge(c);
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
            } catch (T) {
              _ = ue(T, "config_restore_failed");
            }
            if (h) try {
              await t.rollbackPreparedNodeMutations([m], {
                env: c,
                kv: i,
                ctx: s,
                requestHost: p,
                rebuildIndexes: !0
              });
            } catch (T) {
              S = ue(T, "rollback_failed");
            }
            throw y && typeof y == "object" && (String(y.code || "").trim() || (y.code = "NODE_DELETE_FAILED"), y.status = xe(y.status, 500), (g || h) && (y.details = {
              ...k(y.details) ? y.details : {},
              rollbackAttempted: !0,
              configRollbackError: _,
              nodeRollbackError: S
            })), y;
          }
        }
        return ne({
          success: !0,
          revisions: await t.getAdminRevisions(c, { ctx: s })
        });
      });
    },
    async purgeCache(o, { kv: s, request: i }) {
      if (i.headers.get("X-Admin-Confirm") !== "purgeCache") return z("CONFIRMATION_REQUIRED", "敏感操作需要显式确认头", 428);
      const c = await s.get(t.CONFIG_KEY, { type: "json" }) || {};
      if (!c.cfZoneId || !c.cfApiToken) return z("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        return (await ze(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(c.cfZoneId).trim())}/purge_cache`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${c.cfApiToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ purge_everything: !0 })
        })).ok ? ne({ success: !0 }) : z("PURGE_FAILED", "清理失败，请检查密钥权限");
      } catch (l) {
        return z("PURGE_ERROR", l.message);
      }
    }
  };
}
function $m(n = {}, e = {}) {
  const { kernel: t } = n;
  return {
    async tidyKvData(r, { env: a, ctx: o, kv: s, db: i }) {
      if (!s) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace");
      try {
        const c = await t.tidyKvData(a, {
          kv: s,
          db: i,
          ctx: o,
          planToken: String(r?.planToken || "").trim()
        }), l = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString();
        return await ge(t.patchOpsStatus(a, { scheduled: { kvTidy: {
          status: "success",
          lastSuccessAt: l,
          lastTriggeredBy: "manual",
          summary: c.summary
        } } }), "manual.tidy_kv.patch_success_status", null, null), ne({
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
        } } }), "manual.tidy_kv.patch_failed_status", { message: l }, null), z(String(c?.code || "KV_TIDY_FAILED"), l, xe(c?.status, 500), k(c?.details) ? c.details : null);
      }
    },
    async tidyD1Data(r, { env: a, ctx: o, kv: s, db: i }) {
      if (!i) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
      try {
        const c = ct(r?.maintenanceMode, "manual"), l = await t.tidyD1Data(a, {
          db: i,
          kv: s,
          ctx: o,
          maintenanceMode: c,
          planToken: String(r?.planToken || "").trim()
        }), d = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), u = t.buildD1TidyStatusPayload(l.summary, {
          mode: "manual",
          maintenanceMode: c,
          triggeredBy: "manual",
          timestamp: d
        });
        return await ge(t.patchOpsStatus({
          kv: s,
          db: i
        }, { scheduled: { ...u } }), "manual.tidy_d1.patch_success_status", null, null), ne({
          success: !0,
          ...l
        });
      } catch (c) {
        const l = c?.message || String(c), d = t.buildD1TidyStatusPayload({
          status: "failed",
          lastError: l,
          maintenanceMode: ct(r?.maintenanceMode, "manual")
        }, {
          mode: "manual",
          maintenanceMode: ct(r?.maintenanceMode, "manual"),
          triggeredBy: "manual",
          timestamp: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
        });
        return await ge(t.patchOpsStatus({
          kv: s,
          db: i
        }, { scheduled: { ...d } }), "manual.tidy_d1.patch_failed_status", { message: l }, null), z("D1_TIDY_FAILED", l, 500);
      }
    }
  };
}
function Bm(n = "") {
  return String(n || "").trim().toLowerCase() === "a" ? "a" : "cname";
}
function jt(n = {}) {
  return {
    id: String(n?.id || "").trim(),
    type: String(n?.type || "").trim().toUpperCase(),
    name: oe(n?.name),
    content: String(n?.content || "").trim(),
    ttl: Number(n?.ttl) || 1,
    proxied: n?.proxied === !0,
    comment: typeof n?.comment == "string" ? n.comment : void 0,
    tags: Array.isArray(n?.tags) ? n.tags.map((e) => String(e)) : void 0
  };
}
async function $r(n, e, t = {}) {
  const r = [];
  let a = 1, o = 1;
  const s = 100, i = oe(t?.nameExact || "");
  do {
    const c = new URL(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(n)}/dns_records`);
    c.searchParams.set("page", String(a)), c.searchParams.set("per_page", String(s)), i && c.searchParams.set("name.exact", i);
    const l = await Re(c.toString(), e);
    Array.isArray(l?.result) && r.push(...l.result.map((d) => jt(d)).filter((d) => d.id && d.name)), o = Number(l?.result_info?.total_pages || l?.result_info?.totalPages || 1), a += 1;
  } while (a <= o && a <= 20);
  return r;
}
function ha(n = {}, e = {}) {
  const t = {
    type: String(e.type || n?.type || "A").trim().toUpperCase(),
    name: oe(e.host || n?.name),
    content: String(e.content || "").trim(),
    ttl: Number(n?.ttl) || 1,
    proxied: n?.proxied === !0
  };
  return typeof n?.comment == "string" && (t.comment = n.comment), Array.isArray(n?.tags) && (t.tags = n.tags.map((r) => String(r))), t;
}
function Km(n = "", e = "") {
  const t = String(n || "").trim().toUpperCase(), r = String(e || "").trim();
  return r ? t === "A" ? r : r.toLowerCase() : "";
}
function Br(n = "", e = "") {
  const t = String(n || "").trim().toUpperCase(), r = Km(t, e);
  return !t || !r ? "" : `${t}|${r}`;
}
function zm(n = []) {
  const e = [], t = /* @__PURE__ */ new Set();
  let r = 0;
  for (const a of Array.isArray(n) ? n : []) {
    const o = String(a?.type || "").trim().toUpperCase(), s = String(a?.content || "").trim(), i = Br(o, s);
    if (i) {
      if (t.has(i)) {
        r += 1;
        continue;
      }
      t.add(i), e.push({
        type: o,
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
function Vs(n = "", e = 0) {
  return {
    type: String(n || "").trim().toUpperCase(),
    desiredCount: Math.max(0, Number(e) || 0),
    identicalCount: 0,
    updatedCount: 0,
    createdCount: 0,
    deletedCount: 0
  };
}
function Wm(n = "a", e = {}, t = {}) {
  const r = {};
  let a = 0, o = 0, s = 0, i = 0, c = 0;
  for (const d of [
    "A",
    "AAAA",
    "CNAME"
  ]) {
    const u = e?.[d];
    !u || typeof u != "object" || (r[d] = {
      type: d,
      desiredCount: Math.max(0, Number(u.desiredCount) || 0),
      identicalCount: Math.max(0, Number(u.identicalCount) || 0),
      updatedCount: Math.max(0, Number(u.updatedCount) || 0),
      createdCount: Math.max(0, Number(u.createdCount) || 0),
      deletedCount: Math.max(0, Number(u.deletedCount) || 0)
    }, a += r[d].desiredCount, o += r[d].identicalCount, s += r[d].updatedCount, i += r[d].createdCount, c += r[d].deletedCount);
  }
  const l = s + i + c;
  return {
    mode: String(n || "a").trim().toLowerCase(),
    desiredCount: a,
    identicalCount: o,
    updatedCount: s,
    createdCount: i,
    deletedCount: c,
    changedCount: l,
    dedupedDesiredCount: Math.max(0, Number(t?.dedupedDesiredCount) || 0),
    familySummaries: r,
    unchangedOnly: l === 0 && o > 0
  };
}
async function Gm(n = {}, e) {
  const t = String(n?.cfZoneId || "").trim(), r = String(n?.cfApiToken || "").trim();
  if (!t || !r) throw new Error("cf_api_missing");
  const a = oe(new URL(e.url).hostname), o = await Kc(t, r, {
    scope: "dns.resolve_admin_context.zone_lookup",
    context: { requestHost: a }
  }), s = await $r(t, r), i = String(o?.name || "").trim() || "", c = i || oe(s[0]?.name || "");
  let l = a;
  Ea(l, c || i) || (l = oe(await cm({
    cfAccountId: n.cfAccountId,
    cfZoneId: t,
    cfApiToken: r,
    zoneNameFallback: c || i || a
  })));
  const d = s.filter((f) => _r(f.type)), u = l ? d.filter((f) => oe(f.name) === l) : d;
  return {
    cfZoneId: t,
    cfApiToken: r,
    zone: o,
    zoneName: i,
    currentHost: l,
    requestHost: a,
    totalRecords: s.length,
    editableRecords: d,
    currentHostRecords: u
  };
}
function Vm(n = {}) {
  const e = ce(n), t = String(e.cfZoneId || "").trim(), r = String(e.cfApiToken || "").trim();
  if (!t || !r) {
    const a = /* @__PURE__ */ new Error("请在账号设置中完善 Zone ID 和 API 令牌");
    throw a.code = "CF_API_ERROR", a.status = 400, a;
  }
  return {
    cfZoneId: t,
    cfApiToken: r
  };
}
function jm(n = []) {
  return {
    A: Vs("A", n.filter((e) => e.type === "A").length),
    AAAA: Vs("AAAA", n.filter((e) => e.type === "AAAA").length)
  };
}
function qm(n = "", e = [], t = []) {
  const r = /* @__PURE__ */ new Map(), a = [];
  let o = 0;
  for (const i of e) {
    const c = Br(n, i?.content);
    c && r.set(c, (r.get(c) || 0) + 1);
  }
  for (const i of t) {
    const c = Br(n, i?.content), l = r.get(c) || 0;
    if (l > 0) {
      o += 1, r.set(c, l - 1);
      continue;
    }
    a.push(i);
  }
  const s = [];
  for (const i of e) {
    const c = Br(n, i?.content), l = r.get(c) || 0;
    l <= 0 || (s.push(i), r.set(c, l - 1));
  }
  return {
    identicalCount: o,
    reusableCurrentRecords: a,
    pendingDesiredRecords: s
  };
}
function rl(n = "", e = "", t = "", r = "", a = {}) {
  const o = async () => (await $r(n, e, { nameExact: t })).filter((s) => oe(s.name) === t && _r(s.type));
  return {
    async deleteRecord(s) {
      s?.id && await Re(`${r}/${encodeURIComponent(s.id)}`, e, { method: "DELETE" });
    },
    async updateRecord(s, i, c) {
      const l = ha(s, {
        host: t,
        type: i,
        content: c
      });
      return jt((await Re(`${r}/${encodeURIComponent(s.id)}`, e, {
        method: "PUT",
        body: JSON.stringify(l)
      }))?.result || {
        id: s.id,
        ...l
      });
    },
    async createRecord(s, i, c = a) {
      const l = ha(c, {
        host: t,
        type: s,
        content: i
      });
      try {
        return {
          record: jt((await Re(r, e, {
            method: "POST",
            body: JSON.stringify(l)
          }))?.result || l),
          reusedExisting: !1
        };
      } catch (d) {
        if (String(d?.message || d || "").includes("81058")) {
          const u = (await o()).find((f) => oe(f?.name) === t && String(f?.type || "").toUpperCase() === String(s || "").trim().toUpperCase() && Br(f?.type, f?.content) === Br(s, i));
          if (u) return {
            record: jt(u),
            reusedExisting: !0
          };
        }
        throw d;
      }
    },
    async listCurrentHostRecords() {
      return await o();
    }
  };
}
async function js(n = "", e = [], t = [], r = {}, a = {}) {
  const o = qm(n, e, t);
  r.identicalCount += o.identicalCount;
  const { reusableCurrentRecords: s, pendingDesiredRecords: i } = o;
  for (let c = 0; c < i.length; c += 1) {
    const l = i[c], d = s[c];
    if (d) {
      await a.updateRecord(d, n, l.content), r.updatedCount += 1;
      continue;
    }
    (await a.createRecord(n, l.content, t[0]))?.reusedExisting === !0 ? r.identicalCount += 1 : r.createdCount += 1;
  }
  for (let c = i.length; c < s.length; c += 1)
    await a.deleteRecord(s[c]), r.deletedCount += 1;
}
async function Xm({ env: n, kv: e, dnsHistoryRepository: t, config: r, host: a, mode: o = "a", desiredRecords: s = [], requestHost: i = "", skipHistory: c = !1, includeAllRecords: l = !0, includeHistory: d = !0 }) {
  const { cfZoneId: u, cfApiToken: f } = Vm(r || await we(n));
  let m = !1, p = !1, h = "";
  const g = zm(s), y = g.records, _ = jm(y);
  try {
    const S = await Qo(u, f, { scope: "dns.persist_records.zone_lookup" }), T = String(S?.name || "").trim() || "";
    if (T && !Ea(a, T)) {
      const I = /* @__PURE__ */ new Error("当前站点不在该 Zone 下");
      throw I.code = "INVALID_HOST", I.status = 400, I;
    }
    const b = (await $r(u, f, { nameExact: a })).filter((I) => oe(I.name) === a && _r(I.type)), A = {
      baseRecord: b[0] || {
        name: a,
        ttl: 1,
        proxied: !1
      },
      zoneRecordsUrl: `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(u)}/dns_records`
    }, C = rl(u, f, a, A.zoneRecordsUrl, A.baseRecord), N = b.map((I) => jt(I));
    let P = !1;
    const E = {
      ...C,
      async deleteRecord(I) {
        return P = !0, await C.deleteRecord(I);
      },
      async updateRecord(I, U, V) {
        return P = !0, await C.updateRecord(I, U, V);
      },
      async createRecord(I, U, V) {
        return P = !0, await C.createRecord(I, U, V);
      }
    };
    let w = [], R = null;
    try {
      if (o === "cname") {
        const I = b.filter((M) => M.type === "CNAME"), U = b.filter((M) => M.type === "A" || M.type === "AAAA");
        for (const M of U) await E.deleteRecord(M);
        for (let M = 1; M < I.length; M += 1) await E.deleteRecord(I[M]);
        const V = I[0] || null, X = y[0], v = Number(X?.ttl) || 1, O = X?.proxied === !0;
        if (V) {
          const M = String(V.content || "").trim() !== X.content, H = Number(V.ttl) !== v, j = V.proxied === !0 !== O;
          (M || H || j) && await E.updateRecord({
            ...V,
            ttl: v,
            proxied: O
          }, "CNAME", X.content);
        } else await E.createRecord("CNAME", X.content, {
          ...A.baseRecord,
          ttl: v,
          proxied: O
        });
        w = await $r(u, f, { nameExact: a }), c || (R = await t.recordDnsHostHistory(e, u, a, {
          name: a,
          type: "CNAME",
          content: X.content,
          actor: "admin",
          source: "ui",
          requestHost: i,
          savedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
        }));
      } else {
        const I = b.filter((U) => U.type === "CNAME");
        for (const U of I) await E.deleteRecord(U);
        await js("A", y.filter((U) => U.type === "A"), b.filter((U) => U.type === "A"), _.A, E), await js("AAAA", y.filter((U) => U.type === "AAAA"), b.filter((U) => U.type === "AAAA"), _.AAAA, E), w = await $r(u, f, { nameExact: a });
      }
    } catch (I) {
      if (P) {
        m = !0;
        try {
          const U = await C.listCurrentHostRecords();
          for (const V of U) await C.deleteRecord(V);
          for (const V of N) await C.createRecord(V.type, V.content, V);
          p = !0;
        } catch (U) {
          p = !1, h = String(U?.message || U || "unknown_rollback_error");
        }
      }
      throw I;
    }
    const D = w.filter((I) => _r(I.type)), x = D.filter((I) => oe(I.name) === a), L = d === !0 ? R || await t.getDnsHostHistory(e, u, a) : [], F = o === "a" ? Wm(o, _, { dedupedDesiredCount: g.duplicateCount }) : null;
    return {
      ok: !0,
      zoneId: u,
      zoneName: T,
      currentHost: a,
      totalRecords: w.length,
      editableRecordCount: D.length,
      filteredCount: x.length,
      records: x,
      ...l === !0 ? { allRecords: D } : {},
      allRecordsIncluded: l === !0,
      history: L,
      mode: o,
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
function Ym(n = {}, e = {}) {
  const { kernel: t } = n, { persistCloudflareDnsRecordsForHost: r } = n;
  return {
    async listDnsRecords(a, { env: o, kv: s, request: i }) {
      const c = ce(await we(o)), l = String(c.cfZoneId || "").trim(), d = String(c.cfApiToken || "").trim(), u = a?.includeAllRecords !== !1;
      if (!l || !d) return z("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        const f = await Gm(c, i), m = f.currentHostRecords, p = f.currentHost ? await t.getDnsHostHistory(s, l, f.currentHost) : [];
        return ne({
          ok: !0,
          zoneId: l,
          zoneName: f.zoneName,
          currentHost: f.currentHost,
          totalRecords: f.totalRecords,
          editableRecordCount: f.editableRecords.length,
          filteredCount: m.length,
          records: m,
          ...u === !0 ? { allRecords: f.editableRecords } : {},
          allRecordsIncluded: u === !0,
          history: p
        });
      } catch (f) {
        const m = String(f?.message || f || "unknown_error");
        return z("CF_DNS_LIST_FAILED", m.includes("cf_api_http_403") ? "Cloudflare DNS 读取失败：API 令牌权限不足（需要 Zone.DNS:Read）" : m.includes("cf_api_http_401") ? "Cloudflare DNS 读取失败：API 令牌无效" : "Cloudflare DNS 读取失败", 400, { reason: m });
      }
    },
    async setDnsHistoryFallback(a, { env: o, kv: s }) {
      const i = oe(a?.host || ""), c = String(a?.entryId || "").trim(), l = a?.enabled !== !1;
      if (!i) return z("MISSING_PARAMS", "host 不能为空");
      if (l && !c) return z("MISSING_PARAMS", "entryId 不能为空");
      const d = ce(await we(o)), u = String(d.cfZoneId || "").trim();
      if (!u) return z("CF_API_ERROR", "请先在账号设置中保存 Zone ID");
      try {
        return ne({
          ok: !0,
          history: await t.setDnsHostHistoryPreferredFallback(s, u, i, c, l)
        });
      } catch (f) {
        const m = String(f?.message || f || "unknown_error");
        return m.includes("dns_history_entry_not_found") ? z("DNS_HISTORY_ENTRY_NOT_FOUND", "指定的 DNS 历史记录不存在", 404) : z("DNS_HISTORY_FALLBACK_UPDATE_FAILED", "设置 DNS 默认回退值失败", 400, { reason: m });
      }
    },
    async createDnsRecord(a, o) {
      return e.updateDnsRecord(a, o);
    },
    async updateDnsRecord(a, { env: o, kv: s, request: i }) {
      const c = String(i.headers.get("X-Admin-Confirm") || "").trim();
      if (c !== "updateDnsRecord" && c !== "createDnsRecord") return z("CONFIRMATION_REQUIRED", "敏感 DNS 操作需要显式确认头", 428);
      const l = String(a?.recordId || a?.id || "").trim(), d = oe(a?.host || a?.name || ""), u = String(a?.type || "").trim().toUpperCase(), f = String(a?.content || "").trim(), m = a?.skipHistory === !0;
      if (!_r(u)) return z("INVALID_TYPE", "Type 仅允许 A / AAAA / CNAME");
      const p = qa(u, f);
      if (p) return z("INVALID_CONTENT", p);
      if (!l && !d) return z("MISSING_PARAMS", "host 不能为空");
      const h = ce(await we(o)), g = String(h.cfZoneId || "").trim(), y = String(h.cfApiToken || "").trim();
      if (!g || !y) return z("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      let _ = null, S = !1, T = !1, b = "";
      try {
        const A = await Qo(g, y, { scope: "dns.update_record.zone_lookup" }), C = String(A?.name || "").trim(), N = oe(new URL(i.url).hostname);
        let P = null;
        if (l) {
          const w = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(g)}/dns_records/${encodeURIComponent(l)}`, R = jt((await Re(w, y))?.result || null);
          if (!R?.id) return z("NOT_FOUND", "DNS 记录不存在", 404);
          const D = String(R?.type || "").toUpperCase();
          if (!_r(D)) return z("UNSUPPORTED_RECORD_TYPE", "该 DNS 记录类型不支持编辑", 400, { currentType: D });
          const x = d || R.name;
          if (!x) return z("MISSING_PARAMS", "host 不能为空");
          if (C && !Ea(x, C)) return z("INVALID_HOST", "记录名称必须位于当前 Zone 下");
          const L = ha(R, {
            host: x,
            type: u,
            content: f
          });
          P = jt((await Re(w, y, {
            method: "PUT",
            body: JSON.stringify(L)
          }))?.result || {
            id: l,
            ...L
          }), _ = async () => {
            const F = ha(R, {
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
          if (C && !Ea(d, C)) return z("INVALID_HOST", "记录名称必须位于当前 Zone 下");
          const w = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(g)}/dns_records`, R = ha({
            name: d,
            ttl: 1,
            proxied: !1
          }, {
            host: d,
            type: u,
            content: f
          });
          P = jt((await Re(w, y, {
            method: "POST",
            body: JSON.stringify(R)
          }))?.result || R), _ = async () => {
            if (!P?.id) throw new Error("created_dns_record_id_missing");
            await Re(`${w}/${encodeURIComponent(P.id)}`, y, { method: "DELETE" });
          };
        }
        let E;
        try {
          E = P.type === "CNAME" && !m ? await t.recordDnsHostHistory(s, g, P.name, {
            name: P.name,
            type: P.type,
            content: P.content,
            actor: "admin",
            source: "ui",
            requestHost: N,
            savedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
          }) : await t.getDnsHostHistory(s, g, P.name);
        } catch (w) {
          if (S = typeof _ == "function", S) try {
            await _(), T = !0;
          } catch (R) {
            b = ue(R, "dns_rollback_failed");
          }
          throw w;
        }
        return ne({
          ok: !0,
          record: P,
          history: E
        });
      } catch (A) {
        const C = String(A?.message || A || "unknown_error");
        return z("CF_DNS_UPDATE_FAILED", C.includes("cf_api_http_403") ? "Cloudflare DNS 更新失败：API 令牌权限不足（需要 Zone.DNS:Edit）" : C.includes("cf_api_http_401") ? "Cloudflare DNS 更新失败：API 令牌无效" : "Cloudflare DNS 更新失败", 400, {
          reason: C,
          rollbackAttempted: S,
          rollbackSucceeded: T,
          rollbackError: b
        });
      }
    },
    async saveDnsRecords(a, { env: o, kv: s, request: i }) {
      if (i.headers.get("X-Admin-Confirm") !== "saveDnsRecords") return z("CONFIRMATION_REQUIRED", "敏感 DNS 操作需要显式确认头", 428);
      const c = Bm(a?.mode), l = oe(a?.host || ""), d = a?.includeAllRecords === !0, u = Array.isArray(a?.records) ? a.records : [];
      if (!l) return z("MISSING_PARAMS", "host 不能为空");
      const f = [];
      if (c === "cname") {
        const g = String(u[0]?.content || "").trim(), y = qa("CNAME", g);
        if (y) return z("INVALID_CONTENT", y);
        f.push({
          type: "CNAME",
          content: g
        });
      } else {
        const g = u.map((y) => ({
          type: String(y?.type || "").trim().toUpperCase(),
          content: String(y?.content || "").trim()
        })).filter((y) => y.type || y.content);
        if (!g.length) return z("INVALID_CONTENT", "A 模式至少保留 1 条 A / AAAA 记录");
        for (const y of g) {
          if (!["A", "AAAA"].includes(y.type)) return z("INVALID_TYPE", "A 模式仅允许 A / AAAA");
          const _ = qa(y.type, y.content, { allowCname: !1 });
          if (_) return z("INVALID_CONTENT", _);
          f.push(y);
        }
      }
      const m = ce(await we(o)), p = String(m.cfZoneId || "").trim(), h = String(m.cfApiToken || "").trim();
      if (!p || !h) return z("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        const g = oe(new URL(i.url).hostname);
        return ne(await r({
          env: o,
          kv: s,
          config: m,
          host: l,
          mode: c,
          desiredRecords: f,
          requestHost: g,
          skipHistory: !1,
          includeAllRecords: d
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
async function ta(n, e, t) {
  const r = Array.isArray(n) ? n : [];
  if (r.length === 0) return [];
  if (typeof t != "function") throw new TypeError("worker must be a function");
  const a = Number(e), o = Number.isFinite(a) && a > 0 ? Math.min(r.length, Math.max(1, Math.floor(a))) : 1, s = Array.from({ length: r.length });
  let i = 0;
  const c = Array.from({ length: o }, async () => {
    for (; i < r.length; ) {
      const l = i;
      i += 1;
      const d = Promise.resolve().then(() => t(r[l]));
      s[l] = d, await d.catch(() => {
      });
    }
  });
  return await Promise.all(c), Promise.all(s);
}
var Jm = Object.freeze([{
  id: "cloudflare",
  label: "Cloudflare",
  endpoint: "https://cloudflare-dns.com/dns-query"
}]), al = 30 * 1e3, Qm = al, Zm = "emby-proxy-ui-dns-probe/1.0", ep = 2400 * 1e3, tp = 35 * 1e3, rp = "dns_ip_pool_fetch_lock:", ap = "sys:dns_ip_pool_fetch_lock:v1:";
function np(n = {}, e = [], t = {}) {
  const r = /* @__PURE__ */ new Set(), a = [];
  for (const s of Array.isArray(e) ? e : []) {
    const i = gr(s);
    if (!i) continue;
    const c = String(i.ip || "").trim().toLowerCase();
    !c || r.has(c) || (r.add(c), a.push(i));
  }
  const o = a.slice(0, Wr(n?.ipLimit));
  return {
    id: String(n?.id || ""),
    name: String(n?.name || ""),
    sourceType: Rt(n?.sourceType || n?.source_type || ""),
    status: o.length > 0 ? "success" : "empty",
    count: o.length,
    items: o,
    lastFetchAt: String(t.lastFetchAt || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString())
  };
}
async function op(n = {}, e = B.Defaults.DnsIpSourceFetchMaxBytes) {
  const t = String(n?.url || "").trim();
  if (!t) throw new Error("empty_source_url");
  const r = new AbortController(), a = setTimeout(() => r.abort(), al);
  try {
    const o = await ze(t, {
      headers: { "User-Agent": id },
      redirect: "follow",
      signal: r.signal
    });
    if (!o.ok) throw new Error(`HTTP_${o.status}`);
    const s = await Pe(o, e);
    if (s.exceeded) throw new Error("SOURCE_TOO_LARGE");
    const i = s.text, c = Oi(n?.builtinId || n?.builtin_id || "");
    return (c === "all" ? Du(i) : c === "preferred" ? Iu(i, { limit: Wr(n?.ipLimit) }) : xo(i, { limit: Wr(n?.ipLimit) })).map((l) => ({
      ...l,
      sourceKind: "api",
      sourceLabel: n?.name || t
    }));
  } catch (o) {
    throw Wt(o) ? new Error("FETCH_TIMEOUT") : o;
  } finally {
    clearTimeout(a);
  }
}
function sp(n = {}, e = "", t = "A") {
  const r = new URL(String(n?.endpoint || ""));
  return r.searchParams.set("name", oe(e)), r.searchParams.set("type", String(t || "A").toUpperCase()), r;
}
async function ip(n = {}, e = "", t = "A") {
  const r = new AbortController(), a = setTimeout(() => r.abort(), Qm);
  try {
    const o = await ze(sp(n, e, t).toString(), {
      headers: { accept: "application/dns-json" },
      redirect: "follow",
      signal: r.signal
    });
    if (!o.ok) throw new Error(`DOH_HTTP_${o.status}`);
    const s = await Pe(o, bn);
    return wu(s.exceeded ? null : JSON.parse(s.text || "null")).map((i) => ({
      ...i,
      sourceKind: "domain",
      sourceLabel: String(e || "").trim()
    }));
  } catch (o) {
    throw Wt(o) ? new Error("DOH_TIMEOUT") : o;
  } finally {
    clearTimeout(a);
  }
}
function cp(n = []) {
  const e = (Array.isArray(n) ? n : []).map((o) => Array.isArray(o) ? [...o] : []).filter((o) => o.length > 0), t = [], r = /* @__PURE__ */ new Set();
  let a = e.length > 0;
  for (; a; ) {
    a = !1;
    for (const o of e) {
      for (; o.length; ) {
        const s = o.shift(), i = String(s?.ip || "").trim().toLowerCase();
        if (!(!i || r.has(i))) {
          r.add(i), t.push(s);
          break;
        }
      }
      o.length && (a = !0);
    }
  }
  return t;
}
async function lp(n = {}) {
  const e = oe(n?.domain || "");
  if (!e) throw new Error("empty_source_domain");
  const t = [], r = [], a = [];
  for (const i of ["A", "AAAA"]) for (const c of Jm) a.push({
    resolver: c,
    recordType: i
  });
  const o = await ta(a, Math.min(2, Math.max(1, a.length)), async ({ resolver: i, recordType: c }) => {
    try {
      return {
        resolver: i,
        recordType: c,
        items: await ip(i, e, c),
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
  for (const i of o) {
    const c = Array.isArray(i?.items) ? i.items : [];
    if (c.length) {
      t.push(c);
      continue;
    }
    String(i?.error || "").trim() && r.push(`${String(i?.resolver?.id || "resolver")}:${String(i?.recordType || "A")}=${String(i?.error || "unknown_doh_error")}`);
  }
  const s = cp(t);
  if (!s.length && o.length > 0 && r.length === o.length) {
    const i = r.every((c) => String(c || "").includes("DOH_TIMEOUT"));
    throw new Error(i ? "DOH_TIMEOUT" : r.join("; "));
  }
  return s.map((i) => ({
    ...i,
    sourceKind: "domain",
    sourceLabel: n?.name || e
  }));
}
async function up(n = {}, e = B.Defaults.DnsIpSourceFetchMaxBytes) {
  const t = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), r = Ot(n);
  try {
    return np(r, r.sourceType === "domain" ? await lp(r) : await op(r, e), { lastFetchAt: t });
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
async function qs(n, e = "", t = "UNKNOWN", r = {}) {
  const { probeRepository: a } = r, o = String(e || "").trim(), s = Je(o), i = String(t || "UNKNOWN").trim().toUpperCase() || "UNKNOWN";
  if (!o || !s) return {
    ip: o,
    entryColo: i,
    probeStatus: "network_error",
    latencyMs: null,
    cfRay: "",
    coloCode: "",
    cityName: "",
    countryCode: "UNKNOWN",
    countryName: "未知",
    probedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt: $()
  };
  if (n && r.forceRefresh !== !0 && r.skipCacheRead !== !0) {
    const m = await a.getDnsIpProbeCacheEntry(n, o, i);
    if (m) return m;
  }
  const c = new AbortController(), l = setTimeout(() => c.abort(), fe(r.probeTimeoutMs ?? r.timeoutMs, B.Defaults.DnsIpProbeTimeoutMs, 250, 3e4)), d = $(), u = s === "IPv6" ? `http://[${o}]/` : `http://${o}/`, f = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString();
  try {
    const m = await ze(u, {
      headers: ko(Zm),
      method: "HEAD",
      redirect: "manual",
      signal: c.signal
    }), p = Math.max(0, $() - d), h = String(m.headers.get("CF-RAY") || m.headers.get("cf-ray") || "").trim(), g = String(m.headers.get("Server") || m.headers.get("server") || "").trim(), y = Mi(h), _ = y ? "ok" : /cloudflare/i.test(g) ? "cf_header_missing" : "non_cloudflare", S = Mu(y), T = {
      ip: o,
      entryColo: i,
      probeStatus: _,
      latencyMs: p,
      cfRay: h,
      coloCode: S.coloCode,
      cityName: S.cityName,
      countryCode: S.countryCode,
      countryName: S.countryName,
      probedAt: f,
      expiresAt: $() + B.Defaults.DnsIpProbeCacheTtlSec * 1e3
    };
    return n && r.skipCacheWrite !== !0 && await a.upsertDnsIpProbeCacheEntry(n, T), T;
  } catch (m) {
    const p = {
      ip: o,
      entryColo: i,
      probeStatus: Wt(m) ? "timeout" : "network_error",
      latencyMs: null,
      cfRay: "",
      coloCode: "",
      cityName: "",
      countryCode: "UNKNOWN",
      countryName: "未知",
      probedAt: f,
      expiresAt: $() + B.Defaults.DnsIpProbeCacheTtlSec * 1e3
    };
    return n && r.skipCacheWrite !== !0 && await a.upsertDnsIpProbeCacheEntry(n, p), p;
  } finally {
    clearTimeout(l);
  }
}
async function nl(n = [], e, t = "UNKNOWN", r = {}) {
  const a = [], o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set(), i = String(t || "UNKNOWN").trim().toUpperCase() || "UNKNOWN";
  for (const S of Array.isArray(n) ? n : []) {
    const T = String(S?.ip || S?.content || "").trim(), b = Je(T) || Ii(S?.ipType || S?.ip_type || S?.type || "");
    if (!T || !b) continue;
    const A = {
      id: String(S?.id || S?.recordId || `${r.scope || "dns"}-${ie(`${T}|${S?.sourceKind || S?.source_kind || ""}`)}`),
      ip: T,
      ipType: b,
      recordId: String(S?.recordId || S?.id || ""),
      host: String(S?.host || S?.name || r.host || ""),
      sourceKind: String(S?.sourceKind || S?.source_kind || r.scope || "shared_pool"),
      sourceLabel: String(S?.sourceLabel || S?.source_label || r.sourceLabel || ""),
      lineLabel: jr(S?.lineLabel || S?.line_label || ""),
      remark: String(S?.remark || ""),
      createdAt: String(S?.createdAt || S?.created_at || ""),
      updatedAt: String(S?.updatedAt || S?.updated_at || ""),
      probeStatus: ja(S?.probeStatus || S?.probe_status || ""),
      latencyMs: Number.isFinite(Number(S?.latencyMs ?? S?.latency_ms)) ? Math.max(0, Math.round(Number(S?.latencyMs ?? S?.latency_ms))) : null,
      cfRay: String(S?.cfRay || S?.cf_ray || ""),
      coloCode: String(S?.coloCode || S?.colo_code || "").trim().toUpperCase(),
      cityName: String(S?.cityName || S?.city_name || ""),
      countryCode: String(S?.countryCode || S?.country_code || "").trim().toUpperCase() || "UNKNOWN",
      countryName: String(S?.countryName || S?.country_name || "") || "未知",
      probedAt: String(S?.probedAt || S?.probed_at || "")
    };
    a.push(A), o.set(T.toLowerCase(), T);
  }
  if (!a.length) return {
    items: [],
    probeEntryColo: i,
    probeDataSource: "cache"
  };
  const c = /* @__PURE__ */ new Map(), l = [], d = [...o.values()], u = e ? await r.probeRepository.getDnsIpProbeCacheEntries(e, d, i) : [];
  for (const S of Array.isArray(u) ? u : []) {
    const T = String(S?.ip || "").trim().toLowerCase();
    T && c.set(T, S);
  }
  for (const S of d)
    c.has(String(S || "").toLowerCase()) && r.forceRefresh !== !0 || l.push(S);
  const f = r.deferProbe === !0 && !!r.ctx?.waitUntil, m = fe(r.syncProbeLimit, B.Defaults.DnsIpWorkspaceSyncProbeLimit, 0, 64), p = f && l.length > m ? l.slice(0, m) : l, h = f && l.length > m ? l.slice(m) : [], g = fe(r.probeConcurrency, B.Defaults.DnsIpProbeConcurrency, 1, 4);
  let y = "cache";
  p.length > 0 && (y = "live_sync"), h.length > 0 && (y = "live_deferred");
  const _ = await ta(p, g, async (S) => {
    const T = await qs(e, S, t, {
      ...r,
      skipCacheRead: !0,
      skipCacheWrite: !0
    });
    return c.set(String(S || "").toLowerCase(), T), T;
  });
  return e && _.length && await r.probeRepository.upsertDnsIpProbeCacheEntries(e, _), h.length && (h.forEach((S) => s.add(String(S || "").toLowerCase())), r.ctx.waitUntil((async () => {
    const S = await ta(h, g, (T) => qs(e, T, t, {
      ...r,
      skipCacheRead: !0,
      skipCacheWrite: !0
    }));
    e && S.length && await r.probeRepository.upsertDnsIpProbeCacheEntries(e, S);
  })().catch((S) => {
    console.warn("[DNS IP Workspace] Deferred probe failed:", S?.message || S);
  }))), {
    items: a.map((S) => {
      const T = c.get(S.ip.toLowerCase());
      return T ? {
        ...S,
        probeStatus: T.probeStatus,
        latencyMs: T.latencyMs,
        cfRay: T.cfRay,
        coloCode: T.coloCode,
        cityName: T.cityName,
        countryCode: T.countryCode,
        countryName: T.countryName,
        probedAt: T.probedAt
      } : S;
    }).map((S) => !s.has(String(S.ip || "").toLowerCase()) || String(S.probedAt || "").trim() ? S : {
      ...S,
      probeStatus: "pending"
    }),
    probeEntryColo: i,
    probeDataSource: po(y)
  };
}
function dp(n = {}) {
  const e = Oo(n?.items || []);
  return {
    sourceResults: ki(n?.sourceResults || []),
    importedCount: Math.max(0, Number(n?.importedCount) || e.length),
    items: e,
    enabledSourceCount: Math.max(0, Number(n?.enabledSourceCount) || 0),
    cachedAt: en(n?.cachedAtMs),
    expiresAt: en(n?.expiresAtMs)
  };
}
async function fp(n = [], e, t = "UNKNOWN", r = null, a = {}) {
  const o = r && typeof r.waitUntil == "function" ? r : { waitUntil() {
  } }, s = await nl(n, e, t, {
    probeRepository: a.probeRepository,
    forceRefresh: !1,
    scope: "shared_pool",
    ctx: o,
    deferProbe: !0,
    syncProbeLimit: fe(a?.syncProbeLimit, 0, 0, 64),
    probeTimeoutMs: fe(a?.probeTimeoutMs, 500, 250, 3e4)
  });
  return Array.isArray(s?.items) ? s.items : [];
}
function po(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "live_deferred" ? "live_deferred" : e === "live_sync" ? "live_sync" : "cache";
}
function mp(n = "", e = "") {
  const t = po(n), r = po(e), a = {
    cache: 0,
    live_sync: 1,
    live_deferred: 2
  };
  return (a[r] || 0) > (a[t] || 0) ? r : t;
}
function pp(n = {}) {
  const e = [];
  Array.isArray(n?.localPoolItems) && e.push(...n.localPoolItems), Array.isArray(n?.poolItems) && e.push(...n.poolItems), Array.isArray(n?.sharedPoolItems) && e.push(...n.sharedPoolItems);
  const t = [], r = /* @__PURE__ */ new Set();
  for (const a of e) {
    const o = gr(a);
    if (!o) continue;
    const s = String(o.ip || "").trim().toLowerCase();
    !s || r.has(s) || (r.add(s), t.push({
      ...a,
      ...o
    }));
  }
  return t;
}
function gp(n = [], e = []) {
  const t = /* @__PURE__ */ new Map(), r = (a) => {
    for (const o of Array.isArray(a) ? a : []) {
      const s = gr(o);
      s && t.set(String(s.ip || "").trim().toLowerCase(), {
        ...o,
        ...s
      });
    }
  };
  return r(n), r(e), [...t.values()];
}
function hp(n = "") {
  return `${rp}${String(n || "").trim()}`;
}
async function yp({ kv: n = null, db: e = null, leaseRepository: t = null } = {}, r = "") {
  const a = hp(r);
  if (!a || a === "dns_ip_pool_fetch_lock:") return {
    acquired: !1,
    reason: "empty_signature"
  };
  const o = `${$()}-${Math.random().toString(36).slice(2, 10)}`;
  return e ? {
    ...await t.tryAcquireScheduledLeaseWithDb(e, {
      scope: a,
      token: o,
      owner: "dns_ip_pool_fetch",
      leaseMs: tp
    }),
    token: o,
    key: a
  } : {
    acquired: !1,
    reason: "db_unavailable",
    backend: "d1",
    token: o,
    key: a
  };
}
async function Sp({ kv: n = null, db: e = null, leaseRepository: t = null } = {}, r = null) {
  if (!r?.token) return !1;
  const a = String(r?.key || "").trim();
  return e && a ? await t.releaseScheduledLeaseWithDb(e, r.token, { scope: a }) : !1;
}
async function _p({ kv: n = null, db: e = null, ctx: t = null, sourceList: r = [], maxBytes: a = B.Defaults.DnsIpSourceFetchMaxBytes, poolRepository: o = null } = {}) {
  const s = (Array.isArray(r) ? r : []).map((S, T) => Ot(S, T)), i = s.filter((S) => S.enabled === !0 && cr(S)), c = fe(B.Defaults.DnsIpSourceConcurrency, B.Defaults.DnsIpSourceConcurrency, 1, 4), l = await ta(i, i.some((S) => Rt(S?.sourceType) === "domain") ? Math.min(c, 2) : c, async (S) => up(S, a)), d = [], u = /* @__PURE__ */ new Map();
  for (const S of l)
    u.set(String(S?.id || ""), S), Array.isArray(S?.items) && d.push(...S.items);
  const f = s.map((S, T) => {
    const b = u.get(String(S?.id || ""));
    return Ot(b ? {
      ...S,
      lastFetchAt: b.lastFetchAt,
      lastFetchStatus: b.status,
      lastFetchCount: b.count
    } : S, T);
  }), m = await ge(o.persistDnsIpPoolSources({
    kv: n,
    db: e
  }, f, null), "dns_ip_pool.refresh.persist_source_state", {
    sourceCount: f.length,
    enabledSourceCount: i.length
  }, f), p = hr(d), h = Oo(p), g = ki(l);
  let y = "", _ = "";
  if (e) {
    const S = Va(s, a);
    if (S && Bu(l)) {
      const T = $(), b = T + ep, A = await o.upsertDnsIpPoolFetchCacheEntry(e, {
        signature: S,
        items: p,
        sourceResults: l,
        importedCount: h.length,
        enabledSourceCount: i.length,
        cachedAtMs: T,
        expiresAtMs: b,
        createdAt: new Date(T).toISOString(),
        updatedAt: new Date(T).toISOString()
      });
      y = en(A?.cachedAtMs), _ = en(A?.expiresAtMs);
    }
  }
  return i.length && await ge(o.bumpDnsIpPoolRevision({
    kv: n,
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
function bp(n = {}, e = {}) {
  const { kernel: t } = n, { buildDnsIpPoolWorkspacePreviewItems: r, buildDnsIpWorkspaceItems: a, releaseDnsIpPoolFetchRefreshLock: o, runDnsIpPoolSourcesLiveRefresh: s, tryAcquireDnsIpPoolFetchRefreshLock: i } = n;
  return {
    async getDnsIpWorkspace(c, { env: l, kv: d, db: u, request: f, ctx: m }) {
      try {
        const p = c?.forceRefresh === !0;
        u && await t.ensureDnsIpWorkspaceSchema(u);
        const h = await me(l), g = fa(f), y = Pd(f);
        let _ = await t.getDnsIpPoolSourcesForRead({
          kv: d,
          db: u
        });
        const S = pp(c), T = B.Defaults.DnsIpSourceFetchMaxBytes, b = _.filter((L) => L.enabled === !0 && cr(L));
        let A = [], C = "empty", N = !1;
        if (p && b.length > 0) {
          const L = await s({
            kv: d,
            db: u,
            ctx: m,
            sourceList: _,
            maxBytes: T
          });
          _ = Array.isArray(L?.sourceList) ? L.sourceList : _, A = Array.isArray(L?.items) ? L.items : [], C = "live_sync";
        } else {
          const L = Va(_, T), F = u && L ? await t.getDnsIpPoolFetchCacheEntry(u, L) : null;
          if (F)
            A = Array.isArray(F?.items) ? F.items : [], C = "cache";
          else if (b.length > 0 && m?.waitUntil && L) {
            const I = await i({
              kv: d,
              db: u
            }, L);
            I?.acquired === !0 && (N = !0, C = "live_deferred", m.waitUntil((async () => {
              try {
                await s({
                  kv: d,
                  db: u,
                  sourceList: _,
                  maxBytes: T
                });
              } catch (U) {
                console.warn("[DNS IP Workspace] background source snapshot refresh failed:", U?.message || U);
              } finally {
                await o({
                  kv: d,
                  db: u
                }, I);
              }
            })()));
          }
        }
        const P = gp(A, S), E = await a(P, u, g, {
          forceRefresh: p,
          scope: "shared_pool",
          ctx: m,
          deferProbe: !0,
          syncProbeLimit: 0,
          probeTimeoutMs: 500
        }), w = [], R = Array.isArray(E?.items) ? E.items : [], D = await t.getOpsStatusSection({
          kv: d,
          db: u
        }, "dnsIpPool"), x = /* @__PURE__ */ new Map();
        for (const L of R) {
          const F = String(L?.countryCode || "").trim().toUpperCase();
          if (!F) continue;
          const I = x.get(F) || {
            code: F,
            name: String(L?.countryName || "未知"),
            count: 0
          };
          I.count += 1, x.set(F, I);
        }
        return ne({
          zoneId: String(h.cfZoneId || "").trim(),
          zoneName: "",
          host: "",
          requestColo: g,
          probeEntryColo: g,
          probeDataSource: mp("cache", E?.probeDataSource),
          sourceSnapshotStatus: C,
          backgroundRefreshQueued: N,
          requestCountryCode: y.countryCode,
          requestCountryName: y.countryName,
          currentHostItems: w,
          sharedPoolItems: R,
          sourceList: _,
          availableCountries: [...x.values()].sort((L, F) => String(L.code || "").localeCompare(String(F.code || ""))),
          summary: Wu(w, R),
          dnsIpPoolRevision: t.getDnsIpPoolRevisionFromStatus(D),
          generatedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          ...Tr(),
          revisions: await t.getAdminRevisionsForRead({
            env: l,
            kv: d,
            db: u
          }, {
            ctx: m,
            config: h
          })
        });
      } catch (p) {
        throw It(p, "DNS_IP_WORKSPACE_READ_FAILED", "独立 IP 池工作区读取失败：KV 读取异常", "admin.read.dns_ip_workspace");
      }
    },
    async importDnsIpPoolItems(c, { env: l, kv: d, db: u, request: f }) {
      const m = String(c?.text || c?.content || "").trim();
      if (!m) return z("EMPTY_IMPORT_TEXT", "请先提供要导入的文本内容");
      const p = String(c?.sourceKind || "manual").trim().toLowerCase() || "manual", h = String(c?.sourceLabel || "").trim() || (p === "file" ? "文件导入" : "手动导入"), g = xo(m).map((S) => ({
        ...S,
        sourceKind: p,
        sourceLabel: h
      })), y = await a(g, u, fa(f), {
        scope: "shared_pool",
        forceRefresh: !1
      }), _ = Array.isArray(y?.items) ? y.items : [];
      return ne({
        success: !0,
        importedCount: _.length,
        items: _,
        revisions: await t.getAdminRevisions({
          env: l,
          kv: d,
          db: u
        })
      });
    },
    async saveDnsIpPoolSources(c, { env: l, kv: d, db: u, ctx: f }) {
      if (!u) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
      const m = await t.persistDnsIpPoolSources({
        kv: d,
        db: u
      }, c?.sources || [], f);
      return await t.bumpDnsIpPoolRevision({
        kv: d,
        db: u
      }, {
        lastSourceConfigAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
        sourceCount: m.length
      }, f), ne({
        success: !0,
        sourceList: m,
        dnsIpPoolRevision: await t.getOpsStatusSection({
          kv: d,
          db: u
        }, "dnsIpPool").then((p) => t.getDnsIpPoolRevisionFromStatus(p)).catch(() => ""),
        ...Tr(),
        revisions: await t.getAdminRevisions({
          env: l,
          kv: d,
          db: u
        })
      });
    },
    async getDnsIpPoolSources(c, { env: l, kv: d, db: u }) {
      try {
        if (!u) return ne({
          success: !0,
          sourceList: [],
          dnsIpPoolRevision: "",
          ...Tr(),
          revisions: await t.getAdminRevisionsForRead({
            env: l,
            kv: d,
            db: u
          }, { config: await me(l) })
        });
        u && await t.ensureDnsIpWorkspaceSchema(u);
        const [f, m, p] = await Promise.all([
          me(l),
          t.getDnsIpPoolSourcesForRead({
            kv: d,
            db: u
          }),
          t.getOpsStatusSection({
            kv: d,
            db: u
          }, "dnsIpPool")
        ]);
        return ne({
          success: !0,
          sourceList: m,
          dnsIpPoolRevision: t.getDnsIpPoolRevisionFromStatus(p),
          ...Tr(),
          revisions: await t.getAdminRevisionsForRead({
            env: l,
            kv: d,
            db: u
          }, { config: f })
        });
      } catch (f) {
        throw It(f, "DNS_IP_POOL_SOURCES_READ_FAILED", "独立 IP 池抓取源读取失败：D1 读取异常", "admin.read.dns_ip_pool_sources");
      }
    },
    async refreshDnsIpPoolFromSources(c, { env: l, kv: d, db: u, ctx: f, request: m }) {
      try {
        if (!u) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
        u && await t.ensureDnsIpWorkspaceSchema(u);
        const p = fe(c?.maxBytes, B.Defaults.DnsIpSourceFetchMaxBytes, 1024, 8 * 1024 * 1024), h = await t.getDnsIpPoolSources({
          kv: d,
          db: u
        }), g = Va(h, p), y = u && g ? await t.getDnsIpPoolFetchCacheEntry(u, g) : null;
        if (y) {
          let T = !1;
          if (f?.waitUntil) {
            const C = await i({
              kv: d,
              db: u
            }, g);
            C?.acquired === !0 && (T = !0, f.waitUntil((async () => {
              try {
                await s({
                  kv: d,
                  db: u,
                  sourceList: h,
                  maxBytes: p
                });
              } catch (N) {
                console.warn("[DNS IP Pool] background refresh failed:", N?.message || N);
              } finally {
                await o({
                  kv: d,
                  db: u
                }, C);
              }
            })()));
          }
          const b = dp(y), A = await r(b.items, u, fa(m), f, { syncProbeLimit: 0 });
          return ne({
            success: !0,
            sourceResults: b.sourceResults,
            sourceList: h,
            importedCount: b.importedCount,
            items: A,
            cacheStatus: "d1",
            backgroundRefreshQueued: T,
            cachedAt: b.cachedAt,
            expiresAt: b.expiresAt,
            dnsIpPoolRevision: await t.getOpsStatusSection({
              kv: d,
              db: u
            }, "dnsIpPool").then((C) => t.getDnsIpPoolRevisionFromStatus(C)).catch(() => ""),
            ...Tr(),
            revisions: await t.getAdminRevisions({
              env: l,
              kv: d,
              db: u
            })
          });
        }
        const _ = await s({
          kv: d,
          db: u,
          ctx: f,
          sourceList: h,
          maxBytes: p
        }), S = await r(_.items, u, fa(m), f, {
          syncProbeLimit: 0,
          probeTimeoutMs: 500
        });
        return ne({
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
            kv: d,
            db: u
          }, "dnsIpPool").then((T) => t.getDnsIpPoolRevisionFromStatus(T)).catch(() => ""),
          ...Tr(),
          revisions: await t.getAdminRevisions({
            env: l,
            kv: d,
            db: u
          })
        });
      } catch (p) {
        if (_n(p)) throw p;
        const h = ue(p, "unknown_error"), g = /* @__PURE__ */ new Error(`更新服务端共享快照失败: ${h}`);
        throw g.code = "DNS_IP_POOL_REFRESH_FAILED", g.status = 500, g.details = { reason: h }, g;
      }
    },
    async deleteDnsIpPoolItems(c, { env: l, kv: d, db: u, ctx: f }) {
      u && await t.ensureDnsIpWorkspaceSchema(u);
      const m = Ku(c?.target);
      if (m === "shared_snapshot") {
        if (!u) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
        const h = await t.getDnsIpPoolSourcesForRead({
          kv: d,
          db: u
        }), g = Va(h, B.Defaults.DnsIpSourceFetchMaxBytes), y = g ? await t.getDnsIpPoolFetchCacheEntry(u, g) : null, _ = zu(y, c?.ips || []);
        if (y && g && _.deletedCount > 0) {
          const S = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), T = Math.max(0, Number(y?.cachedAtMs) || 0), b = Math.max(T, Number(y?.expiresAtMs) || T), A = Math.max(0, Number(y?.enabledSourceCount) || (Array.isArray(h) ? h.filter((C) => C?.enabled === !0 && cr(C)).length : 0));
          await t.upsertDnsIpPoolFetchCacheEntry(u, {
            signature: g,
            items: _.items,
            sourceResults: _.sourceResults,
            importedCount: _.items.length,
            enabledSourceCount: A,
            cachedAtMs: T,
            expiresAtMs: b,
            createdAt: String(y?.createdAt || S),
            updatedAt: S
          }), await t.bumpDnsIpPoolRevision({
            kv: d,
            db: u
          }, {
            lastSnapshotDeleteAt: S,
            lastSnapshotDeleteCount: _.deletedCount
          }, f);
        }
        return ne({
          success: !0,
          target: m,
          deletedCount: _.deletedCount,
          deletedIps: _.deletedIps,
          revisions: await t.getAdminRevisions({
            env: l,
            kv: d,
            db: u
          })
        });
      }
      const p = Hi(c?.ips || []).normalizedIps;
      return ne({
        success: !0,
        target: m,
        deletedCount: u ? await t.deleteDnsIpPoolItems(u, p) : p.length,
        revisions: await t.getAdminRevisions({
          env: l,
          kv: d,
          db: u
        })
      });
    },
    async fillDnsDraftFromIpPool(c) {
      const l = [];
      for (const f of Array.isArray(c?.ips) ? c.ips : []) {
        const m = String(f?.ip || f || "").trim(), p = Je(m);
        !m || !p || l.push({
          type: p === "IPv6" ? "AAAA" : "A",
          content: m
        });
      }
      if (!l.length) return z("EMPTY_IP_SELECTION", "请先选择至少一个可用 IP");
      const d = [], u = /* @__PURE__ */ new Set();
      for (const f of l) {
        const m = `${f.type}:${f.content.toLowerCase()}`;
        u.has(m) || (u.add(m), d.push(f));
      }
      return d.sort((f, m) => f.type !== m.type ? f.type.localeCompare(m.type) : f.content.localeCompare(m.content)), ne({
        success: !0,
        mode: "a",
        records: d
      });
    }
  };
}
function Ep(n = {}, e = {}) {
  const { kernel: t } = n;
  return {
    async testTelegram(r) {
      const { tgBotToken: a, tgChatId: o } = r;
      if (!a || !o) return z("MISSING_PARAMS", "请先填写 Bot Token 和 Chat ID");
      try {
        return await t.sendTelegramMessage({
          tgBotToken: a,
          tgChatId: o,
          text: `✅ Emby Proxy: Telegram 机器人测试通知成功！
如果您能看到这条消息，说明您的通知配置完全正确。`
        }), ne({ success: !0 });
      } catch (s) {
        return z("NETWORK_ERROR", s.message);
      }
    },
    async sendDailyReport(r, { env: a }) {
      try {
        const o = await t.sendDailyTelegramReport(a);
        return ne({
          success: !0,
          sentCount: Number(o?.sentCount) || 0,
          reportKinds: Array.isArray(o?.reportKinds) ? o.reportKinds : []
        });
      } catch (o) {
        return z("REPORT_FAILED", o.message);
      }
    },
    async sendPredictedAlert(r, { env: a }) {
      try {
        const o = await t.maybeSendRuntimeAlerts(a, null, {
          ignoreCooldown: !0,
          persistState: !1,
          triggeredBy: "manual_predict"
        });
        return ne({
          success: !0,
          sent: o?.sent === !0,
          issueCount: Number(o?.issueCount) || 0,
          reason: String(o?.reason || "").trim()
        });
      } catch (o) {
        return z("ALERT_PREDICT_FAILED", o.message);
      }
    },
    async pingNode(r, { env: a, ctx: o, request: s }) {
      const i = String(s?.headers?.get("User-Agent") || "").trim(), c = await we(a), l = fe(r.timeout, c.pingTimeout ?? rd, 1e3, 18e4);
      if (r.target) {
        const T = t.normalizeSingleTarget(r.target);
        if (!T) return z("INVALID_TARGET", "目标源站必须是有效的 http/https URL");
        const b = await t.pingTarget(T, l, { userAgent: i });
        return ne({
          ...b.ok ? { ms: b.elapsedMs } : {},
          probe: b,
          target: T,
          usedCache: !1,
          scope: "target"
        });
      }
      const d = String(r.name || "").trim(), u = await t.getNode(d, a, o);
      if (!u || !Array.isArray(u.lines) || !u.lines.length) return z("NOT_FOUND", "节点不存在");
      const f = String(r.lineId || "").trim(), m = f ? u.lines.filter((T) => T.id === f) : u.lines.slice();
      if (f && !m.length) return z("LINE_NOT_FOUND", "线路不存在", 404);
      const p = await Promise.all(m.map(async (T) => {
        const b = await t.pingTarget(T.target, l, { userAgent: i });
        return {
          id: String(T?.id || "").trim(),
          name: String(T?.name || "").trim(),
          target: String(T?.target || "").trim(),
          latencyMs: b.ok ? b.elapsedMs : null,
          probe: b,
          latencyUpdatedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
        };
      })), h = u.lines.map((T) => {
        const b = p.find((A) => A.id === T.id);
        return b ? {
          id: b.id,
          name: b.name,
          target: b.target,
          latencyMs: b.latencyMs,
          probe: b.probe,
          latencyUpdatedAt: b.latencyUpdatedAt
        } : {
          id: String(T?.id || "").trim(),
          name: String(T?.name || "").trim(),
          target: String(T?.target || "").trim()
        };
      }), g = t.resolveActiveLineId(u.activeLineId, h, h), y = t.getActiveNodeLine({
        ...u,
        lines: h,
        activeLineId: g
      }), _ = f ? h.find((T) => T.id === f) : y, S = t.buildNodeSummary(d.toLowerCase(), u).summary || { name: d.toLowerCase() };
      return ne({
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
function Tp(n = {}, e = {}) {
  const { kernel: t } = n, { LogQueryPlanner: r } = n;
  return {
    async getLogs(a, { db: o, env: s }) {
      if (!o) return ne({ error: "D1 not configured" }, 500);
      const i = r.normalizeRequest(a), { filters: c } = i, l = s ? await we(s) : {}, d = await t.resolveLogsReadiness({
        db: o,
        kv: t.getKV(s)
      }), u = r.resolveSearch(c, l, d);
      if (u.errorResponse) return u.errorResponse;
      const { effectiveSearchMode: f, searchFallbackReason: m } = u;
      if (l.logEnabled === !1) return r.buildDisabledResponse(i, d, f, m);
      if (d.schemaReady !== !0) return z("LOG_SCHEMA_NOT_READY", "日志表尚未初始化，请先点击“初始化日志表”", 400, {
        effectiveSearchMode: f,
        searchFallbackReason: m,
        revisions: { logsRevision: d.revision }
      });
      const p = r.buildSqlPlan(c, i, l, f);
      if (p.errorResponse) return p.errorResponse;
      const h = await r.executeSqlPlan(o, i, p);
      return h.errorResponse ? h.errorResponse : r.buildSuccessResponse(i, d, {
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
    async clearLogs(a, { db: o, env: s, ctx: i, request: c }) {
      if (c.headers.get("X-Admin-Confirm") !== "clearLogs") return z("CONFIRMATION_REQUIRED", "敏感操作需要显式确认头", 428);
      if (!o) return ne({ error: "D1 not configured" }, 500);
      await t.ensureLogsBaseSchema(o), await t.ensureStatsHourlySchema(o);
      const l = $(), d = sr.get(o);
      d.LogClearEpochMs = Math.max(d.LogClearEpochMs || 0, l), await t.patchOpsStatus(s || o, { log: {
        clearEpochMs: l,
        clearEpochAt: new Date(l).toISOString()
      } }, i);
      const u = d.LogFlushTask;
      if (u) try {
        await u;
      } catch {
      }
      d.LogQueue.length = 0, d.LogDedupe.clear(), d.LogLastFlushAt = 0, await o.prepare(`DELETE FROM ${t.LOGS_TABLE}`).run(), await t.clearStatsHourly(o).catch(() => !1);
      let f = !1;
      try {
        f = await t.rebuildLogsFts(o);
      } catch (g) {
        console.warn("clearLogs FTS rebuild failed", g);
      }
      const m = await t.isLogsFtsReady(o), p = await t.hasStatsHourlyTable(o), h = await t.bumpLogsRevision(s || { db: o }, {
        schemaReady: !0,
        ftsReady: m,
        statsReady: p,
        clearEpochMs: l,
        clearEpochAt: new Date(l).toISOString(),
        lastClearAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
      }, i);
      return ne({
        success: !0,
        ftsRebuilt: f,
        revisions: { logsRevision: t.getLogsRevisionFromStatus(h?.log || h) }
      });
    },
    async getD1SchemaStatus(a, { db: o, env: s }) {
      if (!o) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库", 503);
      const i = await t.buildD1SchemaRepairPlan(o);
      let c = {
        token: "",
        expiresAt: 0
      };
      return i.phase === "destructive" && i.blockingIssues.length === 0 && (c = await t.createD1SchemaRepairToken(s, i)), ne({
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
    async initLogsDb(a, { db: o, env: s, request: i }) {
      if (!o) return z("D1_NOT_CONFIGURED", "D1 database is not configured", 503);
      const c = await t.initializeD1Database(o, {
        includeFts: !0,
        env: s,
        repairMode: String(a?.repairMode || "safe").trim() || "safe",
        repairToken: String(a?.repairToken || "").trim(),
        confirmHighRisk: String(i?.headers?.get("X-Admin-Confirm") || "").trim() === "repairD1Schema"
      }), l = c.status, d = l.ftsReady === !0, u = l.tables?.[t.STATS_HOURLY_TABLE] === !0, f = l.schemaReady === !0 ? await t.bumpLogsRevision(o, {
        schemaReady: !0,
        ftsReady: d,
        statsReady: u,
        categoryEnabled: !0
      }) : null;
      return ne({
        success: c.completed === !0 || c.pendingHighRisk === !0,
        schemaReady: l.schemaReady === !0,
        pendingHighRisk: c.pendingHighRisk === !0,
        categoryEnabled: !0,
        ftsReady: d,
        statsReady: u,
        initialization: c,
        steps: c.steps,
        status: l,
        revisions: f ? { logsRevision: t.getLogsRevisionFromStatus(f?.log || f) } : {}
      });
    }
  };
}
function Ap(n = {}) {
  const { kernel: e } = n, t = {}, r = Kl([
    {
      name: "dashboard",
      handlers: Tm({
        ...n,
        kernel: e
      }, t)
    },
    {
      name: "config",
      handlers: Mm({
        ...n,
        kernel: e
      }, t)
    },
    {
      name: "backup",
      handlers: Pm({
        ...n,
        kernel: e
      }, t)
    },
    {
      name: "nodes",
      handlers: Hm({
        ...n,
        kernel: e
      }, t)
    },
    {
      name: "maintenance",
      handlers: $m({
        ...n,
        kernel: e
      }, t)
    },
    {
      name: "dns-records",
      handlers: Ym({
        ...n,
        kernel: e
      }, t)
    },
    {
      name: "dns-pool",
      handlers: bp({
        ...n,
        kernel: e
      }, t)
    },
    {
      name: "notifications",
      handlers: Ep({
        ...n,
        kernel: e
      }, t)
    },
    {
      name: "database",
      handlers: Tp({
        ...n,
        kernel: e
      }, t)
    }
  ], { aliases: {
    import: "saveOrImport",
    save: "saveOrImport"
  } });
  for (const [a, o] of Object.entries(r.handlers)) t[a] = o;
  return r;
}
function Rp(n = {}) {
  const e = Ap(n);
  return {
    adminActionHandlers: e.handlers,
    adminActionNames: e.names,
    resolveAdminAction: e.resolve
  };
}
function Xe(n, e) {
  const t = k(n) ? n : {}, r = k(e) ? e : {}, a = { ...t };
  for (const [o, s] of Object.entries(r))
    s !== void 0 && (k(s) && k(t[o]) ? a[o] = Xe(t[o], s) : k(s) ? a[o] = Xe({}, s) : a[o] = s);
  return a;
}
function Ne(n, e, t, r) {
  n.has(e) && n.delete(e), n.set(e, t);
  const a = Math.floor(Number(r));
  if (!(!Number.isFinite(a) || a < 1))
    for (; n.size > a; ) {
      const o = n.keys().next().value;
      if (o === void 0) break;
      n.delete(o);
    }
}
function dn(n, e) {
  if (!n.has(e)) return;
  const t = n.get(e);
  return n.delete(e), n.set(e, t), t;
}
function dr(n = void 0) {
  const e = n === void 0 ? Tt.current() : be(n);
  e.NodesRevisionCacheGeneration += 1, e.NodesRevisionCache = null;
}
function Xs(n, e = null) {
  const t = be(e);
  t.NodesRevisionCacheGeneration += 1, t.NodesRevisionCache = {
    loaded: !0,
    revision: String(n || "").trim(),
    exp: Date.now() + B.Defaults.NodesRevisionCacheTtlMs
  };
}
function Oe(n, e = Tt.current()) {
  const t = String(n || "").trim().toLowerCase(), r = t && Number(e.NodeCacheGenerations.get(t)) || 0, a = r ? `node:${r}` : `missing:${e.NodeCacheGenerationEvictionEpoch}`;
  return `${e.NodeCacheResetGeneration}:${a}`;
}
function Cp(n = [], e = Tt.current()) {
  for (const t of Array.isArray(n) ? n : [n]) {
    const r = String(t || "").trim().toLowerCase();
    if (!r) continue;
    !e.NodeCacheGenerations.has(r) && e.NodeCacheGenerations.size >= B.Defaults.NodeCacheMax && (e.NodeCacheGenerationEvictionEpoch += 1);
    const a = ++e.NodeCacheGenerationNonce;
    Ne(e.NodeCacheGenerations, r, a, B.Defaults.NodeCacheMax);
  }
}
function Ys(n = Tt.current()) {
  n.NodeCacheResetGeneration += 1, n.NodeCacheGenerations.clear();
}
var wp = new TextEncoder();
function Fe(n) {
  return wp.encode(String(n ?? "")).byteLength;
}
function ol(n, e, t = {}) {
  const r = Fe(e), a = Math.max(1, Number(t.limitBytes) || Yt), o = /* @__PURE__ */ new Error(`D1 value exceeds the ${a}-byte compatibility budget`);
  return o.code = "D1_VALUE_TOO_LARGE", o.status = 400, o.details = {
    field: String(n || "value"),
    actualBytes: r,
    limitBytes: a,
    platformLimitBytes: gd
  }, o;
}
function Xa(n, e, t = {}) {
  if (Fe(e) > Math.max(1, Number(t.limitBytes) || Yt)) throw ol(n, e, t);
  return e;
}
var Js = /* @__PURE__ */ new WeakMap();
function rt(n, e = {}) {
  const t = String(n || "").trim().toLowerCase(), r = e !== null && typeof e == "object";
  if (r) {
    const o = Js.get(e);
    if (o && o.name === t) return o.violation;
  }
  const a = Lp(n, e);
  return r && Js.set(e, {
    name: t,
    violation: a
  }), a;
}
function Lp(n, e = {}) {
  const t = String(n || "").trim().toLowerCase(), r = k(e) ? e : {}, a = Array.isArray(r.lines) ? r.lines : [];
  if (a.length > ao) return {
    nodeName: t,
    field: "lines",
    actual: a.length,
    limit: ao
  };
  const o = k(r.headers) ? r.headers : {}, s = Object.entries(o);
  if (s.length > bs) return {
    nodeName: t,
    field: "headers.count",
    actual: s.length,
    limit: bs
  };
  let i = 0;
  for (const [l, d] of s) {
    const u = Fe(l), f = Fe(d);
    if (u > Ts) return {
      nodeName: t,
      field: `headers.${l}.keyBytes`,
      actual: u,
      limit: Ts
    };
    if (f > As) return {
      nodeName: t,
      field: `headers.${l}.valueBytes`,
      actual: f,
      limit: As
    };
    i += u + f;
  }
  if (i > Es) return {
    nodeName: t,
    field: "headers.bytes",
    actual: i,
    limit: Es
  };
  for (const l of yd) {
    const d = Fe(r[l]);
    if (d > Ar) return {
      nodeName: t,
      field: l,
      actual: d,
      limit: Ar
    };
  }
  for (let l = 0; l < (Array.isArray(r.tags) ? r.tags.length : 0); l += 1) {
    const d = Fe(r.tags[l]);
    if (d > Ar) return {
      nodeName: t,
      field: `tags.${l}`,
      actual: d,
      limit: Ar
    };
  }
  for (let l = 0; l < a.length; l += 1) for (const d of [
    "id",
    "name",
    "target"
  ]) {
    const u = Fe(a[l]?.[d]);
    if (u > Ar) return {
      nodeName: t,
      field: `lines.${l}.${d}`,
      actual: u,
      limit: Ar
    };
  }
  let c = 0;
  try {
    c = Fe(JSON.stringify(r));
  } catch {
    return {
      nodeName: t,
      field: "record",
      actual: null,
      limit: kn
    };
  }
  return c > kn ? {
    nodeName: t,
    field: "record.bytes",
    actual: c,
    limit: kn
  } : null;
}
function Np(n, e = {}) {
  const t = rt(n, e);
  return t ? {
    code: "NODE_RESOURCE_LIMIT_EXCEEDED",
    ...t
  } : null;
}
async function Ir(n, e = null) {
  const t = be(e), r = t.NodeIndexMutationChain.catch(() => null).then(async () => {
    t.NodesListCache = null, t.NodesIndexCache = null, dr(e);
    try {
      return await n();
    } catch (a) {
      throw t.NodesListCache = null, t.NodesIndexCache = null, dr(e), a;
    }
  });
  return t.NodeIndexMutationChain = r.catch(() => null), await r;
}
var Dp = "cf_dashboard_cache:", sl = "sys:cf_dash_cache", Ip = 1800 * 1e3, Qs = 1440 * 60 * 1e3, Mp = "sys:cf_daily_traffic", Ya = 7, Pp = 1080 * 60 * 60, xp = Ya;
function go(n, e = "") {
  return `${Dp}${encodeURIComponent(String(n || "default").trim() || "default")}:${encodeURIComponent(String(e || "current").trim() || "current")}`;
}
function Zs(n, e = "") {
  return `${sl}:${encodeURIComponent(String(n || "default").trim() || "default")}:${encodeURIComponent(String(e || "current").trim() || "current")}`;
}
function ei(n = /* @__PURE__ */ new Date(), e = B.Defaults.ScheduleUtcOffsetMinutes) {
  const t = Oa(n, e), r = t.shiftedDate.getUTCFullYear(), a = t.shiftedDate.getUTCMonth(), o = Date.UTC(r, a, 1) - t.utcOffsetMinutes * 60 * 1e3, s = Date.UTC(r, a + 1, 1) - t.utcOffsetMinutes * 60 * 1e3, i = t.now.getTime();
  return {
    ...t,
    monthKey: `${r}-${String(a + 1).padStart(2, "0")}`,
    periodLabel: `${r}年${a + 1}月`,
    startTs: o,
    endTs: Math.min(Math.max(o, i), s - 1),
    nextMonthTs: s
  };
}
function Op(n = "", e = "", t = 0) {
  return [
    "dashboard_monthly_traffic",
    1,
    encodeURIComponent(String(n || "default").trim() || "default"),
    encodeURIComponent(String(e || "current").trim() || "current"),
    Ue(t)
  ].join(":");
}
function vp(n = "") {
  const e = String(n || "").trim();
  return e ? new Request(`https://dashboard-monthly-traffic-cache.invalid/${encodeURIComponent(e)}`) : null;
}
function il(n = "", e = "") {
  return `${Mp}:${encodeURIComponent(String(n || "default").trim() || "default")}:${encodeURIComponent(String(e || "current").trim() || "current")}`;
}
async function ti(n, e, t) {
  if (!n || typeof n.get != "function" || !t) return null;
  const r = il(e, t);
  try {
    const a = await n.get(r, { type: "json" }), o = Number(a?.bytes);
    return Number.isFinite(o) && o >= 0 ? o : null;
  } catch (a) {
    return Le("dashboard.daily_traffic_archive_read_failed", a, { cacheKey: r }), null;
  }
}
async function ri(n, e, { dateKey: t = "", bytes: r = 0, dayEndTs: a = 0 } = {}) {
  if (!n || typeof n.put != "function" || !t) return !1;
  const o = il(e, t);
  try {
    return await n.put(o, JSON.stringify({
      bytes: Math.max(0, Number(r) || 0),
      dateKey: t,
      dayEndTs: Math.max(0, Number(a) || 0)
    }), { expirationTtl: Pp }), !0;
  } catch (s) {
    return Le("dashboard.daily_traffic_archive_write_failed", s, { cacheKey: o }), !1;
  }
}
function tr(n = {}) {
  const e = n && typeof n == "object" ? { ...n } : {};
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
function Fp(n = "", e = "") {
  const t = String(n || "").trim();
  return t ? String(e || "").trim().toLowerCase() === "workers_usage" && t.includes("Cloudflare Workers Usage") ? "今日请求量口径：Cloudflare Workers Usage" : t : "";
}
function Up(n = "") {
  const e = String(n || "").trim();
  return e ? e.includes("请求数已对齐 Workers Usage") ? "Cloudflare 统计正常" : e : "";
}
function kp(n = "", e = "") {
  const t = String(n || "").trim();
  if (!t) return "";
  const r = String(e || "").trim().toLowerCase();
  return t.includes("已对齐脚本") || r === "workers_usage" && t.includes("脚本:") ? "" : t;
}
var Hp = [
  "周日",
  "周一",
  "周二",
  "周三",
  "周四",
  "周五",
  "周六"
];
function cl() {
  return Array.from({ length: 24 }, (n, e) => String(e).padStart(2, "0"));
}
function ho(n = "") {
  const e = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(n || "").trim());
  if (!e) return String(n || "").trim() || "-";
  const t = Hp[new Date(Date.UTC(Number(e[1]), Number(e[2]) - 1, Number(e[3]))).getUTCDay()] || "";
  return `${e[2]}-${e[3]}${t ? ` ${t}` : ""}`;
}
function ll(n = "", e = 0, t = 0, r = 0, a = 0) {
  const o = Math.max(0, Math.min(23, Number(e) || 0)), s = Math.max(0, Number(t) || 0), i = Math.max(0, Number(r) || 0), c = Math.max(0, Math.min(1, Number(a) || 0)), l = `${String(o).padStart(2, "0")}:00`, d = s > 0 ? Math.min(0.88, Number((0.12 + c * 0.68).toFixed(3))) : 0.04;
  return {
    key: `${n}:${o}`,
    hour: o,
    hourLabel: l,
    rowsWritten: s,
    writeQueries: i,
    intensity: c,
    className: s > 0 ? "d1-heat-cell is-active" : "d1-heat-cell is-empty",
    style: `--d1-heat-alpha:${d}`,
    title: `${n} ${l} · 写入 ${Se(s)} 行 · SQL 写 ${Se(i)} 次`
  };
}
function fn(n = {}) {
  const e = Ue(n.utcOffsetMinutes), t = Math.max(0, Number(n.nowMs) || $()), r = dt(new Date(t), e).startTs - 8640 * 60 * 1e3, a = Array.from({ length: 7 }, (o, s) => {
    const i = ut(r + s * 24 * 60 * 60 * 1e3, e);
    return {
      key: i.dateKey,
      dateKey: i.dateKey,
      label: ho(i.dateKey),
      cells: Array.from({ length: 24 }, (c, l) => ll(i.dateKey, l))
    };
  });
  return {
    title: "D1 写入热点图",
    status: String(n.status || "idle").trim().toLowerCase() || "idle",
    source: String(n.source || "").trim(),
    summary: String(n.summary || "D1 写入热点尚未加载").trim() || "D1 写入热点尚未加载",
    detail: String(n.detail || "").trim(),
    periodLabel: String(n.periodLabel || `最近 7 天 · ${Mo(e)}`).trim(),
    hourLabels: cl(),
    rows: a,
    available: !1,
    totalRowsWritten: 0,
    totalWriteQueries: 0,
    peakLabel: "",
    legendMaxLabel: "0"
  };
}
function $p(n = {}) {
  const e = n && typeof n == "object" ? { ...n } : {}, t = fn({ status: "idle" });
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
function as(n = {}) {
  const e = n && typeof n == "object" ? { ...n } : {}, t = String(e.requestSource || "").trim().toLowerCase();
  return e.requestSourceText = Fp(e.requestSourceText, t), e.cfAnalyticsStatus = Up(e.cfAnalyticsStatus), e.cfAnalyticsDetail = kp(e.cfAnalyticsDetail, t), e.d1WriteHotspot = $p(e.d1WriteHotspot), e;
}
function ns(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e === "cache" || e === "stale" || e === "live" ? e : "live";
}
function ul(n, e = "dashboard_snapshot_failed") {
  const t = Kt(n, e);
  return t.length <= 220 ? t : `${t.slice(0, 217)}...`;
}
function os(n = {}) {
  const e = ns(n.cacheStatus || n.status), t = Math.max(0, Number(n.cachedAt) || 0);
  return {
    cacheStatus: e,
    cachedAt: t,
    expiresAt: Math.max(t, Number(n.expiresAt) || t),
    updatedAt: Math.max(t, Number(n.updatedAt) || t),
    generatedAt: String(n.generatedAt || "").trim(),
    warning: String(n.warning || "").trim(),
    partial: n.partial === !0 || e === "stale"
  };
}
function yo(n = {}) {
  const e = n && typeof n == "object" ? { ...n } : {}, t = as(!k(e.stats) && (Array.isArray(e.hourlySeries) || Object.prototype.hasOwnProperty.call(e, "todayRequests") || Object.prototype.hasOwnProperty.call(e, "todayTraffic")) ? e : k(e.stats) ? e.stats : {}), r = k(e.runtimeStatus) ? { ...e.runtimeStatus } : {}, a = k(e.cacheMeta) ? e.cacheMeta : {}, o = os({
    cacheStatus: a.cacheStatus || t.cacheStatus || "live",
    cachedAt: a.cachedAt,
    expiresAt: a.expiresAt,
    updatedAt: a.updatedAt,
    generatedAt: a.generatedAt || t.generatedAt || "",
    warning: a.warning,
    partial: a.partial === !0
  });
  return t.cacheStatus = ns(t.cacheStatus || o.cacheStatus), {
    stats: t,
    runtimeStatus: r,
    cacheMeta: o
  };
}
function ca(n = {}, e = "live", t = {}) {
  const r = yo(n), a = ns(e || r.cacheMeta.cacheStatus);
  return {
    stats: as({
      ...r.stats,
      cacheStatus: a
    }),
    runtimeStatus: k(r.runtimeStatus) ? { ...r.runtimeStatus } : {},
    cacheMeta: os({
      ...r.cacheMeta,
      ...t,
      cacheStatus: a,
      generatedAt: String(t.generatedAt || r.cacheMeta.generatedAt || r.stats.generatedAt || "").trim()
    })
  };
}
function So(n) {
  if (!(!n || typeof n != "object")) {
    try {
      n.cancelScheduledDelay?.();
    } catch {
    }
    n.cancelScheduledDelay = null, n.pendingSnapshot = null, n.scheduledFlushAt = 0, n.scheduledPromise = null, n.waitUntilCtx = null;
  }
}
function or(n) {
  const e = ee.PlaybackProgressRelay;
  if (!(e instanceof Map)) return !1;
  const t = e.get(n);
  return t && So(t), e.delete(n);
}
function ai(n, e) {
  const t = ee.PlaybackProgressRelay;
  if (!(t instanceof Map)) return !1;
  const r = Math.max(1, Number(B.Defaults.VideoProgressForwardSessionMax) || 1);
  if (!t.has(n) && t.size >= r) {
    let a = "";
    for (const [o, s] of t) if (!s?.activeFlushPromise) {
      a = o;
      break;
    }
    if (!a) return !1;
    or(a);
  }
  return t.has(n) && t.delete(n), t.set(n, e), !0;
}
function lt(n, e = "/") {
  const t = Qe(n) ? new URL(n.targetUrl.toString()) : n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), r = Qe(n) ? n.normalizedBasePath : Ct(t.pathname), a = Z(e);
  return t.pathname = (a === "/" ? r ? `${r}/` : "/" : `${r}${a}`) || "/", t.search = "", t.hash = "", t;
}
var Bp = /* @__PURE__ */ new Set(["emby", "mediabrowser"]);
function ni(n = "/") {
  return Z(n).split("/").filter(Boolean);
}
function Kp(n = "/", e = "") {
  const t = Z(n), r = String(e || "").trim();
  if (!r || r === "/") return null;
  const a = t.toLowerCase(), o = r.toLowerCase();
  return a !== o && !a.startsWith(`${o}/`) ? null : Z(t.slice(r.length) || "/");
}
function zp(n = "/", e = "") {
  const t = ni(e), r = ni(n);
  if (!t.length || !r.length) return null;
  const a = String(t[t.length - 1] || "").toLowerCase(), o = String(r[0] || "").toLowerCase();
  return !a || a !== o || !Bp.has(a) ? null : Z(`/${r.slice(1).join("/")}`);
}
function Wp(n, e = "/") {
  const t = Qe(n) ? n : Ua(n);
  if (!t) return null;
  const r = Z(e), a = t.normalizedBasePath;
  let o = r;
  if (a) {
    const s = Kp(r, a);
    if (s !== null) o = s;
    else {
      const i = zp(r, a);
      i !== null && (o = i);
    }
  }
  return lt(t, o);
}
var Gp = /^\/(?:emby|mediabrowser)(?=\/)/i, Vp = /^\/(?:emby|mediabrowser)$/i;
function jp(n = "/") {
  const e = Z(n);
  if (!e || e === "/") return [e || "/"];
  if (Vp.test(e)) return [e, "/"];
  const t = e.replace(Gp, "");
  return t && t !== e ? [e, t] : [e, `/emby${e}`];
}
function dl(n, e = []) {
  const t = /* @__PURE__ */ new Set(), r = [];
  for (const a of Array.isArray(e) ? e : [e]) for (const o of jp(a)) {
    const s = Wp(n, o);
    if (!s) continue;
    const i = s.toString();
    t.has(i) || (t.add(i), r.push({
      probePath: o,
      probeUrl: s
    }));
  }
  return r;
}
function qp(n, e = "/", t = "") {
  if (!Qe(n)) {
    const s = lt(n, e);
    return s.search = Is(t), s.toString();
  }
  const r = Z(e), a = Is(t), o = n.absoluteBasePrefix || n.originText;
  return `${(r === "/" ? `${o}/` : `${o}${r}`) || `${n.originText}/`}${a}`;
}
var Xp = /* @__PURE__ */ new Set(["emby", "mediabrowser"]);
function Yp(n = "") {
  const e = String(n || "").split("/").filter(Boolean);
  if (!e.length || !Xp.has(e[e.length - 1].toLowerCase())) return null;
  const t = e.slice(0, -1);
  return t.length ? `/${t.join("/")}` : "";
}
function Jp(n = "/", e = "", t = {}) {
  const r = Z(n || "/"), a = Ct(String(e || "")), o = (c, l) => {
    if (!l) return c;
    const d = c.toLowerCase(), u = l.toLowerCase();
    return d === u || d === `${u}/` ? "/" : d.startsWith(`${u}/`) ? c.slice(l.length) : null;
  }, s = o(r, a);
  if (s !== null) return s;
  if (t.allowLegacyRootFallback !== !0) return null;
  const i = Yp(a);
  return i === null ? null : o(r, i);
}
function Ha(n, e, t = {}) {
  try {
    const r = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), a = e instanceof URL ? new URL(e.toString()) : new URL(String(e || ""));
    if (r.origin !== a.origin) return {
      resolvedUrl: r,
      proxyPath: null
    };
    const o = Ct(a.pathname), s = Jp(r.pathname || "/", o, t);
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
function oi(n, e, t, r, a = {}) {
  try {
    const { resolvedUrl: o, proxyPath: s } = Ha(n, e, { allowLegacyRootFallback: !0 });
    return o ? s ? `${nt(t, r, a)}${s === "/" ? "/" : s}${o.search}${o.hash}` : o.toString() : null;
  } catch {
    return null;
  }
}
function fl(n = "") {
  const e = Z(n), t = e.toLowerCase();
  let r = -1;
  for (const a of [
    "/items/",
    "/videos/",
    "/audio/",
    "/livetv/"
  ]) {
    const o = t.indexOf(a);
    o > 0 && (r === -1 || o < r) && (r = o);
  }
  return r <= 0 ? "" : Ct(e.slice(0, r));
}
function ss(n = "", e = "") {
  const t = Z(n), r = Ct(e);
  if (!r) return t;
  const a = t.toLowerCase(), o = r.toLowerCase();
  return a === o ? "/" : a.startsWith(`${o}/`) ? Z(t.slice(r.length) || "/") : t;
}
function _o(n = "", e = "") {
  const t = Ct(e);
  if (!t) return Z(n);
  let r = Z(n);
  for (; ; ) {
    if (r === t || r === `${t}/`) return "/";
    if (!r.startsWith(`${t}/`)) return r;
    r = Z(r.slice(t.length) || "/");
  }
}
function Qp(n = "", e = null, t = "") {
  let r = Z(n);
  return r = _o(r, t), r = _o(r, e instanceof URL ? e.pathname : "/"), r;
}
function Zp(n = "", e = "", t = null, r = null, a = "") {
  const o = String(n || "").trim();
  if (!o) return null;
  let s = null;
  if (r) try {
    s = r instanceof URL ? new URL(r.toString()) : new URL(String(r || ""));
  } catch {
    s = null;
  }
  let i;
  try {
    if (Bf(o)) {
      i = new URL(o, s || "https://playback-info.local/");
      const d = String(i.protocol || "").toLowerCase(), u = String(s?.origin || "").trim().toLowerCase();
      if (!["http:", "https:"].includes(d) || !u || i.origin.toLowerCase() !== u) return null;
    } else i = new URL(o, "https://playback-info.local/");
  } catch {
    return null;
  }
  const c = Qp(i.pathname || "/", t, a), l = ss(c, fl(c));
  return Ca(l) ? {
    proxyPath: Z(l),
    search: i.search || "",
    hash: i.hash || ""
  } : null;
}
function eg(n = "", e = "", t = null) {
  let r = Z(n);
  const a = fl(e);
  if (a) {
    const d = _o(r, a);
    d !== r && Ca(d) && (r = d);
  }
  const o = Ct(t instanceof URL ? t.pathname : "/");
  if (!a || !o) return r;
  const s = `${a}${o}`, i = r.toLowerCase(), c = s.toLowerCase();
  if (i !== c && !i.startsWith(`${c}/`)) return r;
  const l = Z(`${a}${r.slice(s.length) || "/"}`);
  return Ca(l) ? l : r;
}
function tg(n = "") {
  return qt(n) === "rewrite" ? "relative" : "";
}
function ml(n) {
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
  ].forEach((e) => n.delete(e));
}
function rg(n = "/", e = null) {
  const t = Z(e instanceof URL ? e.pathname : n), r = new URLSearchParams(e instanceof URL ? e.search : String(e || ""));
  for (; r.has(io); ) r.delete(io);
  const a = r.toString();
  return `${t}${a ? `?${a}` : ""}`;
}
function nt(n, e, t = {}) {
  const r = lf(t?.linkVariant), a = r ? "/" + encodeURIComponent(r) : "";
  if (et(t?.entryMode)) return a;
  const o = encodeURIComponent(String(n || "")), s = e ? "/" + encodeURIComponent(String(e)) : "";
  return "/" + o + s + a;
}
function pl(n, e, t, r = "/", a = {}) {
  const o = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), s = Z(r), i = new URL(o.origin);
  return i.pathname = `${nt(e, t, {
    linkVariant: a.linkVariant,
    entryMode: a.entryMode
  })}${s === "/" ? "/" : s}`, i.search = String(a.search || ""), i.hash = String(a.hash || ""), i;
}
function ag(n, e, t, r, a = {}) {
  const o = r instanceof URL ? new URL(r.toString()) : new URL(String(r || "")), s = new URL(n instanceof URL ? n.origin : String(n || ""));
  return s.pathname = `${nt(e, t, {
    linkVariant: a.linkVariant,
    entryMode: a.entryMode
  })}/${mc}${o.pathname || "/"}`, s.search = o.search || "", s.searchParams.append(pc, Qr(o.toString())), s.hash = "", s;
}
function ng(n, e, t, r) {
  try {
    const a = new URL(String(r || "")), o = new URL(n instanceof URL ? n.origin : String(n || ""));
    return o.pathname = `${nt(e, t)}${Z(a.pathname || "/")}`, o.search = a.search || "", o.hash = "", o.toString();
  } catch {
    return "";
  }
}
function og(n = "", e = "", t = "", r = {}) {
  let a = Z(n);
  const o = String(e || "").trim();
  if (!o && !et(r?.entryMode)) return a;
  const s = [...new Set([
    "proxy_a",
    "proxy_b",
    "main"
  ].map((c) => nt(o, t, {
    linkVariant: c,
    entryMode: r.entryMode
  })).filter((c) => c && c !== "/"))].sort((c, l) => l.length - c.length);
  if (!s.length) return a;
  let i = !0;
  for (; i; ) {
    i = !1;
    for (const c of s) {
      const l = ss(a, c);
      if (l !== a) {
        a = l, i = !0;
        break;
      }
    }
  }
  return a;
}
function sg(n = null) {
  const e = String(n?.routeContextDiagnostics?.routeKind || "").trim();
  return e !== "host_prefix_path_compat" && e !== "legacy_host_prefix_path_compat" ? "" : nt(n?.nodeName, n?.nodeKey, {
    linkVariant: n?.linkVariant,
    entryMode: "kv_route"
  });
}
function ig(n = "", e = "") {
  const t = Z(n), r = Ct(e);
  if (!r || r === "/") return t;
  const a = t.toLowerCase(), o = r.toLowerCase();
  return a === o || a.startsWith(`${o}/`) ? t : `${r}${t === "/" ? "/" : t}`;
}
function cg(n = "", e = null) {
  const t = Z(n), r = `/${mc}`;
  if (!t.startsWith(r)) return null;
  const a = e instanceof URL && [...e.searchParams.getAll("__pb_target")].pop() || "";
  if (!a) return { error: "missing_target" };
  let o;
  try {
    o = new URL(Jt(a));
  } catch {
    return { error: "invalid_target" };
  }
  return ["http:", "https:"].includes(String(o.protocol || "").toLowerCase()) ? {
    targetUrl: o,
    visibleProxyPath: Z(t.slice(r.length) || "/")
  } : { error: "unsupported_target" };
}
function si(n = "", e = null, t = "") {
  const r = Z(n), a = r.search(/https?:\/\//i);
  if (a <= 0) return null;
  let o;
  try {
    o = e instanceof URL ? new URL(e.toString()) : new URL(String(e || ""));
  } catch {
    return null;
  }
  let s;
  try {
    s = new URL(r.slice(a));
  } catch {
    return null;
  }
  if (String(s.origin || "").toLowerCase() !== String(o.origin || "").toLowerCase()) return null;
  const i = Ct(t), c = Z(s.pathname || "/"), l = i ? ss(c, i) : c;
  if (i && l === c && c.toLowerCase() !== i.toLowerCase()) return null;
  const d = Z(r.slice(0, a) || "/"), u = [l];
  if (d !== "/") {
    const f = d.toLowerCase(), m = l.toLowerCase();
    m !== f && !m.startsWith(`${f}/`) && u.unshift(Z(`${d}${l === "/" ? "/" : l}`));
  }
  for (const f of u)
    if (Ca(Z(Nr(f).remaining || f)))
      return {
        kind: "embedded_absolute",
        originalPath: r,
        normalizedPath: Z(f),
        embeddedUrl: s.toString()
      };
  return null;
}
function Ma(n) {
  const e = /* @__PURE__ */ new Map();
  if (!n || typeof n != "string") return e;
  for (const t of n.split(";")) {
    const r = t.trim();
    if (!r) continue;
    const a = r.indexOf("="), o = (a === -1 ? r : r.slice(0, a)).trim(), s = a === -1 ? "" : r.slice(a + 1).trim();
    o && e.set(o, s);
  }
  return e;
}
function gl(n) {
  const e = [];
  for (const [t, r] of n.entries()) e.push(r === "" ? t : `${t}=${r}`);
  return e.join("; ");
}
function is(n, e = []) {
  const t = new Set((Array.isArray(e) ? e : [e]).map((a) => String(a || "").trim().toLowerCase()).filter(Boolean)), r = Ma(n);
  if (t.size > 0)
    for (const a of r.keys()) t.has(String(a).trim().toLowerCase()) && r.delete(a);
  return gl(r) || null;
}
function ii(n, e, t = ["auth_token"]) {
  const r = new Set(t.map((s) => String(s || "").trim().toLowerCase()).filter(Boolean)), a = Ma(n);
  for (const s of a.keys()) r.has(String(s).trim().toLowerCase()) && a.delete(s);
  const o = Ma(e);
  for (const [s, i] of o.entries())
    r.has(String(s).trim().toLowerCase()) || a.set(s, i);
  return gl(a) || null;
}
function ci(n = "") {
  const e = Z(n).split("/").filter(Boolean);
  if (e.length === 0) return !1;
  const t = at(e[0]).toLowerCase();
  return wd.has(t);
}
async function lg(n = "", e = "", t = null, r = {}) {
  const a = String(n || "").trim().toLowerCase(), o = oe(e), s = String(t?.JWT_SECRET || "").trim();
  if (!a || !o || !s) return "";
  const i = Math.max(0, Math.floor(Number(r.nowMs ?? $()) / 1e3)), c = Math.max(1, Math.trunc(Number(r.maxAgeSec) || 86400)), l = Qr(JSON.stringify({
    v: 1,
    node: a,
    host: o,
    iat: i,
    exp: i + c
  }));
  if (!l) return "";
  const d = await _t(s, l);
  return d ? `${l}.${d}` : "";
}
async function ug(n = "", e = null, t = {}) {
  const r = String(n || "").trim(), a = String(e?.JWT_SECRET || "").trim();
  if (!r) return {
    ok: !1,
    reason: "missing_cookie"
  };
  if (!a) return {
    ok: !1,
    reason: "missing_secret"
  };
  const o = r.indexOf(".");
  if (o <= 0 || o === r.length - 1) return {
    ok: !1,
    reason: "malformed_cookie"
  };
  const s = r.slice(0, o), i = r.slice(o + 1), c = await _t(a, s);
  if (!c || i !== c) return {
    ok: !1,
    reason: "bad_signature"
  };
  let l = null;
  try {
    l = JSON.parse(Jt(s));
  } catch {
    return {
      ok: !1,
      reason: "malformed_payload"
    };
  }
  const d = {
    v: Number(l?.v) || 0,
    node: String(l?.node || "").trim().toLowerCase(),
    host: oe(l?.host || ""),
    iat: Math.max(0, Math.floor(Number(l?.iat) || 0)),
    exp: Math.max(0, Math.floor(Number(l?.exp) || 0))
  };
  if (d.v !== 1 || !d.node || !d.host || !d.iat || !d.exp || d.exp <= d.iat) return {
    ok: !1,
    reason: "invalid_payload",
    payload: d
  };
  const u = oe(t.requestHost || "");
  if (u && d.host !== u) return {
    ok: !1,
    reason: "host_mismatch",
    payload: d
  };
  const f = Math.max(0, Math.floor(Number(t.nowMs ?? $()) / 1e3));
  return d.exp <= f ? {
    ok: !1,
    reason: "expired",
    payload: d
  } : {
    ok: !0,
    payload: d
  };
}
function dg(n = "") {
  const e = String(n || "").trim();
  return e ? `${Ko}=${e}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Cd}` : hl();
}
function hl() {
  return `${Ko}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
function In(n = "GET", e = null) {
  const t = e ? new Headers(e) : new Headers();
  return t.set("Content-Type", "text/plain; charset=utf-8"), t.set("Cache-Control", "no-store, max-age=0"), De(t), t.get("Access-Control-Allow-Origin") !== "*" && zr(t, "Origin"), new Response(n === "HEAD" ? null : "Not Found", {
    status: 404,
    headers: t
  });
}
function $a(n = "") {
  return String(n || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}
var yl = /* @__PURE__ */ new Set([
  "authorization",
  "x-emby-authorization",
  "x-mediabrowser-authorization"
]), fg = /* @__PURE__ */ new Set(["x-emby-token", "x-mediabrowser-token"]), mg = /* @__PURE__ */ new Set(["x-emby-device-id", "x-mediabrowser-device-id"]), Sl = /* @__PURE__ */ new Set([
  ...yl,
  ...fg,
  ...mg
]);
function Mn(n) {
  if (n instanceof Headers) return [...n.entries()];
  if (n && typeof n == "object" && typeof n.entries == "function") try {
    return [...n.entries()].filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [String(e[0] || ""), String(e[1] ?? "")]);
  } catch {
  }
  if (n && typeof n == "object" && typeof n[Symbol.iterator] == "function") try {
    return [...n].filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [String(e[0] || ""), String(e[1] ?? "")]);
  } catch {
  }
  return Array.isArray(n) ? n.filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [String(e[0] || ""), String(e[1] ?? "")]) : n && typeof n == "object" ? Object.entries(n).map(([e, t]) => [String(e || ""), String(t ?? "")]) : [];
}
var _l = [
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
], pg = [
  "emby",
  "jellyfin",
  "mediabrowser",
  "api_key",
  ..._l
], gg = new RegExp(_l.join("|"));
function bl(n = "") {
  return !n || Sl.has(n) || n === "cookie" ? !1 : gg.test(n);
}
function hg(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e ? pg.some((t) => e.includes(t)) : !1;
}
var El = /* @__PURE__ */ new Set([
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
]), Tl = "identity-http-v2", yg = Object.freeze([
  "Range",
  "If-None-Match",
  "If-Modified-Since"
]), Sg = [
  /^\/Videos\/[^/]+\/(?:main|master|stream)\.m3u8$/i,
  /^\/Videos\/[^/]+\/(?:manifest|main|master|stream)\.mpd$/i,
  /^\/Audio\/[^/]+\/(?:main|master|stream)\.m3u8$/i
], _g = /* @__PURE__ */ new Set([
  "mediasourceid",
  "static",
  "tag",
  "audiostreamindex",
  "subtitlestreamindex",
  "subtitlemethod",
  "starttimeticks"
]);
function Al(n = "") {
  return El.has($a(n));
}
function bg(n) {
  const e = n instanceof URL ? new URL(n.toString()) : new URL(String(n || ""));
  e.hash = "";
  const t = [];
  for (const [r, a] of e.searchParams.entries())
    Al(r) || t.push([r, a]);
  t.sort((r, a) => {
    const o = r[0].localeCompare(a[0]);
    return o !== 0 ? o : String(r[1]).localeCompare(String(a[1]));
  }), e.search = "";
  for (const [r, a] of t) e.searchParams.append(r, a);
  return e;
}
var li = /* @__PURE__ */ new WeakMap();
function Rl(n) {
  const e = n !== null && typeof n == "object";
  if (e) {
    const r = li.get(n);
    if (r) return r;
  }
  const t = Eg(n);
  return e && li.set(n, t), t;
}
function Eg(n) {
  const e = n instanceof Request ? new URL(n.url) : new URL(String(n || "")), t = [];
  for (const [s, i] of e.searchParams.entries()) {
    const c = $a(s);
    El.has(c) && t.push([c, String(i)]);
  }
  t.sort((s, i) => {
    const c = s[0].localeCompare(i[0]);
    return c !== 0 ? c : s[1].localeCompare(i[1]);
  });
  const r = n instanceof Request ? n.headers : new Headers(), a = [];
  for (const [s, i] of r.entries()) {
    const c = String(s || "").trim().toLowerCase();
    !c || !Sl.has(c) && !bl(c) || a.push([c, String(i)]);
  }
  const o = is(r.get("Cookie") || "", ["auth_token", ...Aa]);
  return o && a.push(["cookie", o]), a.sort((s, i) => {
    const c = s[0].localeCompare(i[0]);
    return c !== 0 ? c : s[1].localeCompare(i[1]);
  }), {
    queryEntries: t,
    headerEntries: a
  };
}
function Tg(n) {
  const e = Rl(n);
  return e.queryEntries.length > 0 || e.headerEntries.length > 0;
}
async function Cl(n) {
  const e = Rl(n), t = await Yn().digest("SHA-256", new TextEncoder().encode(ae(e)));
  return [...new Uint8Array(t)].map((r) => r.toString(16).padStart(2, "0")).join("");
}
async function Ag(n, e) {
  return await Cl(new Request(e instanceof URL ? e.toString() : String(e || ""), { headers: n.headers }));
}
function wl(n = "", e = {}) {
  const t = At.test(String(n || ""));
  return ie(`${Tl}:${t ? "manifest" : "asset"}:${t ? Math.max(0, Number(e.prewarmCacheTtl) || 0) : Math.max(0, Number(e.imageCacheMaxAge) || 0)}`);
}
function Rg(n, e) {
  if (!(n instanceof Request) || !(e instanceof Request) || e.headers.has("If-Range")) return null;
  const t = new Headers();
  for (const r of yg) {
    const a = e.headers.get(r);
    a && t.set(r, a);
  }
  return new Request(n.url, {
    method: "GET",
    headers: t
  });
}
function Cg(n = "") {
  const e = String(n || ""), t = /\/(?:Videos|Audio)\/.+$/i.exec(e);
  return t ? t[0] : e;
}
function wg(n) {
  try {
    return new Request(bg(n).toString(), { method: "GET" });
  } catch {
    return null;
  }
}
function Lg(n = {}) {
  const e = Array.isArray(n?.lines) ? n.lines.slice() : [];
  if (e.length > 1) {
    const t = String(n?.activeLineId || "").trim();
    if (t) {
      const r = e.findIndex((a) => String(a?.id || "").trim() === t);
      if (r > 0) {
        const [a] = e.splice(r, 1);
        e.unshift(a);
      }
    }
  }
  return e.length > 0 ? e.map((t) => String(t?.target || "").trim()).filter(Boolean) : String(n?.target || "").split(",").map((t) => t.trim()).filter(Boolean);
}
function bo(n = "", e = {}) {
  const t = String(n || "").trim().toLowerCase(), r = ir(e?.entryMode), a = Mn(e?.headers).map(([o, s]) => [String(o || "").trim().toLowerCase(), String(s ?? "").trim()]).filter(([o]) => !!o).sort((o, s) => {
    const i = o[0].localeCompare(s[0]);
    return i !== 0 ? i : o[1].localeCompare(s[1]);
  });
  return ie(ae({
    nodeName: t,
    entryMode: r,
    secret: r === "host_prefix" ? "" : String(e?.secret || "").trim(),
    tags: Vr(e?.tags, e?.tag),
    remark: String(e?.remark || "").trim(),
    activeLineId: String(e?.activeLineId || "").trim(),
    orderedTargets: Lg(e),
    headers: a,
    playbackInfoMode: String(e?.playbackInfoMode || "").trim().toLowerCase(),
    mediaAuthMode: String(e?.mediaAuthMode || "").trim().toLowerCase(),
    realClientIpMode: String(e?.realClientIpMode || "").trim().toLowerCase(),
    routingDecisionMode: String(e?.routingDecisionMode || "").trim().toLowerCase(),
    mainVideoStreamMode: String(e?.mainVideoStreamMode || e?.wangpanDirectMode || e?.wangpanMode || "").trim().toLowerCase(),
    aggregationMode: Or(e?.aggregationMode)
  }));
}
function Ll(n = []) {
  const e = /* @__PURE__ */ new Set();
  for (const t of Array.isArray(n) ? n : [n]) {
    const r = String(t || "").trim().toLowerCase();
    r && e.add(r);
  }
  return e;
}
function Nl(n = []) {
  const e = Ll(n);
  if (!e.size) return;
  const t = ee.PlaybackInfoResponseCache;
  if (t instanceof Map) for (const [r, a] of t.entries()) {
    const o = String(a?.nodeName || "").trim().toLowerCase();
    e.has(o) && t.delete(r);
  }
}
function Dl(n = []) {
  const e = Ll(n);
  if (!e.size) return;
  const t = ee.PlaybackProgressRelay;
  if (!(!(t instanceof Map) || t.size <= 0))
    for (const [r, a] of t.entries()) {
      const o = String(a?.nodeName || a?.pendingSnapshot?.nodeName || "").trim().toLowerCase();
      !o || !e.has(o) || or(r);
    }
}
function Il(n, e, t, r = "/", a = {}) {
  try {
    const o = String(a.identityPartition || "").trim(), s = String(a.cachePolicyRevision || "").trim();
    if (!o || !s) return null;
    const i = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), c = Z(r), l = new URL(i.origin);
    l.pathname = `${nt(e, t, {
      linkVariant: "main",
      entryMode: a.entryMode
    })}${c === "/" ? "/" : c}`, l.search = String(a.search || "");
    const d = String(a.nodeCacheRevision || "").trim();
    return d && l.searchParams.set("__proxyrev", d), l.searchParams.set("__metadatarev", Tl), l.searchParams.set("__identity", o), l.searchParams.set("__policy", s), l.hash = "", wg(l);
  } catch {
    return null;
  }
}
function Ng(n) {
  try {
    const e = n instanceof URL ? new URL(n.toString()) : new URL(String(n || ""));
    for (const [t, r] of e.searchParams.entries()) {
      const a = String(t || "").toLowerCase(), o = String(r || "").toLowerCase();
      if (a.includes("transcod") || o.includes("transcod")) return !0;
    }
    return !1;
  } catch {
    return !0;
  }
}
function Dg(n) {
  try {
    const e = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), t = Cg(e.pathname || "");
    if (!At.test(t) || Ng(e) || !Sg.some((r) => r.test(t))) return !1;
    for (const [r] of e.searchParams.entries())
      if (!Al(r) && !_g.has($a(r)))
        return !1;
    return !0;
  } catch {
    return !1;
  }
}
function Eo(n) {
  try {
    const e = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), t = e.pathname || "";
    return Jr.test(t) || Yr.test(t) || yr.test(t) ? !0 : At.test(t) ? Dg(e) : !1;
  } catch {
    return !1;
  }
}
function Ig(n = "") {
  const e = String(n || "").toLowerCase();
  return e ? /\.(?:mp4|m4v|mkv|mov|avi|wmv|flv|ts|m4s)(?:$|[?#])/.test(e) ? !0 : At.test(e) || yr.test(e) ? !1 : /\/videos\/[^/]+\/(?:stream|original|download|file)\b/.test(e) || /\/items\/[^/]+\/download\b/.test(e) : !1;
}
function To(n, e = /* @__PURE__ */ new Set(), t = 0) {
  if (n == null || t > 5) return e;
  if (typeof n == "string") {
    const r = n.trim();
    if (r && /^(?:https?:\/\/|\/)/i.test(r)) {
      const a = r.toLowerCase(), o = a.split(/[?#]/, 1)[0] || a;
      (At.test(o) || yr.test(o) || Jr.test(a) || Yr.test(o)) && e.add(r);
    }
    return e;
  }
  return Array.isArray(n) ? (n.slice(0, 24).forEach((r) => To(r, e, t + 1)), e) : (typeof n == "object" && Object.values(n).slice(0, 32).forEach((r) => To(r, e, t + 1)), e);
}
function Pa(n = "") {
  const e = /^\/Items\/([^/]+)(?:\/|$)/i.exec(String(n || ""));
  return e ? at(e[1]) : "";
}
function ui(n = "") {
  const e = String(n || "").toLowerCase();
  return Jr.test(e) || Yr.test(e) ? 0 : At.test(e) ? 1 : yr.test(e) ? 2 : 3;
}
function Mg(n = {}, e = {}) {
  return {
    async createKvTidyPlanToken(t, r = {}, a = {}) {
      const o = String(t?.JWT_SECRET || "").trim();
      if (!o) {
        const l = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the KV tidy plan");
        throw l.code = "SERVER_MISCONFIGURED", l.status = 503, l;
      }
      const s = Math.max(0, Math.floor(Number(a.nowMs ?? $()) / 1e3)), i = s + Math.max(60, Math.floor(Number(a.ttlMs) || 6e5) / 1e3), c = Qr(JSON.stringify({
        version: 1,
        scope: "kv",
        planHash: String(r?.planHash || e.buildKvTidyPlanHash(r)).trim(),
        issuedAt: s,
        expiresAt: i
      }));
      return `${c}.${await _t(o, c)}`;
    },
    async verifyKvTidyPlanToken(t, r = "", a = {}) {
      const o = String(t?.JWT_SECRET || "").trim(), s = String(r || "").trim();
      if (!o) {
        const u = /* @__PURE__ */ new Error("JWT_SECRET is required to verify the KV tidy plan");
        throw u.code = "SERVER_MISCONFIGURED", u.status = 503, u;
      }
      const i = s.indexOf(".");
      if (i <= 0 || i === s.length - 1) {
        const u = /* @__PURE__ */ new Error("KV tidy plan token is invalid");
        throw u.code = "TIDY_PLAN_INVALID", u.status = 409, u;
      }
      const c = s.slice(0, i);
      if (s.slice(i + 1) !== await _t(o, c)) {
        const u = /* @__PURE__ */ new Error("KV tidy plan token signature is invalid");
        throw u.code = "TIDY_PLAN_INVALID", u.status = 409, u;
      }
      let l = null;
      try {
        l = JSON.parse(Jt(c));
      } catch {
        l = null;
      }
      const d = Math.max(0, Math.floor(Number(a.nowMs ?? $()) / 1e3));
      if (!k(l) || l.version !== 1 || l.scope !== "kv" || !String(l.planHash || "").trim()) {
        const u = /* @__PURE__ */ new Error("KV tidy plan token payload is invalid");
        throw u.code = "TIDY_PLAN_INVALID", u.status = 409, u;
      }
      if (Number(l.expiresAt) <= d) {
        const u = /* @__PURE__ */ new Error("KV tidy plan has expired");
        throw u.code = "TIDY_PLAN_STALE", u.status = 409, u.details = {
          reason: "expired",
          expiresAt: Number(l.expiresAt) || 0
        }, u;
      }
      return l;
    },
    buildD1TidyPlanHash(t = {}) {
      const r = k(t?.schemaStatus) ? t.schemaStatus : {};
      return ie(ae({
        scope: "d1",
        mode: String(t?.mode || "manual"),
        maintenanceMode: String(t?.maintenanceMode || "smart"),
        nowMs: Number(t?.nowMs) || 0,
        retentionDays: Number(t?.retentionDays) || 0,
        retentionCutoffMs: Number(t?.retentionCutoffMs) || 0,
        utcOffsetMinutes: Number(t?.utcOffsetMinutes) || 0,
        scheduledNowMs: Number(t?.scheduledNowMs) || 0,
        dayWindow: k(t?.dayWindow) ? t.dayWindow : {},
        statsBucketDate: String(t?.statsBucketDate || ""),
        statsStartTs: Number(t?.statsStartTs) || 0,
        statsEndTs: Number(t?.statsEndTs) || 0,
        statsUtcOffsetMinutes: Number(t?.statsUtcOffsetMinutes) || 0,
        schemaStatus: {
          schemaReady: r.schemaReady === !0,
          tables: k(r.tables) ? r.tables : {},
          columns: k(r.columns) ? r.columns : {},
          indexes: k(r.indexes) ? r.indexes : {},
          constraints: k(r.constraints) ? r.constraints : {},
          ftsReady: r.ftsReady === !0,
          issues: Array.isArray(r.issues) ? r.issues : []
        },
        flags: k(t?.flags) ? t.flags : {},
        summary: k(t?.summary) ? t.summary : {},
        preview: k(t?.preview) ? t.preview : {},
        d1DnsIpPoolSources: Array.isArray(t?.d1DnsIpPoolSources) ? t.d1DnsIpPoolSources : []
      }));
    },
    async createD1TidyPlanToken(t, r = {}, a = {}) {
      const o = String(t?.JWT_SECRET || "").trim();
      if (!o) {
        const l = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the D1 tidy plan");
        throw l.code = "SERVER_MISCONFIGURED", l.status = 503, l;
      }
      const s = Math.max(0, Math.floor(Number(a.issuedAtMs ?? $()) / 1e3)), i = s + Math.max(60, Math.floor(Number(a.ttlMs) || 6e5) / 1e3), c = Qr(JSON.stringify({
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
      return `${c}.${await _t(o, c)}`;
    },
    async verifyD1TidyPlanToken(t, r = "", a = {}) {
      const o = String(t?.JWT_SECRET || "").trim(), s = String(r || "").trim();
      if (!o) {
        const u = /* @__PURE__ */ new Error("JWT_SECRET is required to verify the D1 tidy plan");
        throw u.code = "SERVER_MISCONFIGURED", u.status = 503, u;
      }
      const i = s.indexOf(".");
      if (i <= 0 || i === s.length - 1) {
        const u = /* @__PURE__ */ new Error("D1 tidy plan token is invalid");
        throw u.code = "TIDY_PLAN_INVALID", u.status = 409, u;
      }
      const c = s.slice(0, i);
      if (s.slice(i + 1) !== await _t(o, c)) {
        const u = /* @__PURE__ */ new Error("D1 tidy plan token signature is invalid");
        throw u.code = "TIDY_PLAN_INVALID", u.status = 409, u;
      }
      let l = null;
      try {
        l = JSON.parse(Jt(c));
      } catch {
        l = null;
      }
      const d = Math.max(0, Math.floor(Number(a.nowMs ?? $()) / 1e3));
      if (!k(l) || l.version !== 1 || l.scope !== "d1" || !String(l.planHash || "").trim() || !(Number(l.planNowMs) > 0)) {
        const u = /* @__PURE__ */ new Error("D1 tidy plan token payload is invalid");
        throw u.code = "TIDY_PLAN_INVALID", u.status = 409, u;
      }
      if (Number(l.expiresAt) <= d) {
        const u = /* @__PURE__ */ new Error("D1 tidy plan has expired");
        throw u.code = "TIDY_PLAN_STALE", u.status = 409, u.details = {
          reason: "expired",
          expiresAt: Number(l.expiresAt) || 0
        }, u;
      }
      return l;
    },
    async resolveKvTidyQuotaBudget(t, r = [], a = {}) {
      const o = a.kv || e.getKV(t), s = await Yf(ce(a.config || {})), i = Math.max(1, Math.floor(Number(s?.kv?.write) || 0)), c = (Array.isArray(r) ? r : []).map((g) => ({
        type: String(g?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put",
        key: String(g?.key || "").trim()
      })).filter((g) => g.key), l = c.filter((g) => g.type === "put").length, d = c.filter((g) => g.type === "delete").length, u = o ? await e.captureRawKvEntries(o, c.map((g) => g.key)) : [], f = u.filter((g) => g?.exists === !0).length, m = u.filter((g) => g?.exists !== !0).length, p = l + d + f + m, h = {
        planClass: String(s?.planClass || "free").trim().toLowerCase() === "paid" ? "paid" : "free",
        planLabel: String(s?.planLabel || "").trim() || "FREE",
        periodLabel: String(s?.periodLabel || "").trim() || "今日",
        writeLimit: i,
        estimatedPutCount: l,
        estimatedDeleteCount: d,
        estimatedRollbackWriteCount: f,
        estimatedRollbackDeleteCount: m,
        estimatedWorstCaseWriteCount: p,
        blocked: p > i,
        reason: ""
      };
      return h.reason = h.blocked === !0 ? Jf(h) : "", h;
    },
    async buildKvTidyPlan(t, r = {}) {
      const a = r.kv || e.getKV(t);
      if (!a) throw new Error("KV not configured");
      const o = (await e.listKvKeysStrict(a)).sort(), s = o.filter((W) => W.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX)), { rawStoredSummaryIndexText: i, storedSummaryIndexState: c, previousFullIndexBytes: l } = await e.readStoredNodesSummaryState(a), { nodeNames: d, removableKeys: u, untouchedOtherKeyCount: f, opsStatusKeyCount: m, dnsRecordHistoryKeyCount: p, dnsIpPoolSourceKeyCount: h, configMetaKeyCount: g, snapshotMetaKeyCount: y, nodeIndexMetaKeyCount: _, telegramAlertStateKeyCount: S, loginFailureKeyCount: T, dnsFetchLockKeyCount: b } = await e.classifyKvTidyKeys(a, o), A = await e.readRepairableRuntimeConfig(a), C = k(A.rawConfig) ? A.rawConfig : {}, N = xf(C);
      let P = N.cleanedConfig;
      const E = [...N.migratedConfigKeys], w = await e.captureRawKvEntries(a, [
        e.CONFIG_KEY,
        e.NODES_INDEX_KEY,
        e.NODES_SUMMARY_INDEX_KEY
      ]), R = String(w.find((W) => W?.key === e.NODES_INDEX_KEY)?.value || ""), { nextTidyConfig: D, rewrittenNodes: x, fullEntityNodes: L, rewrittenNodeCount: F, deletedLegacyNodeFieldCount: I, migratedTopLevelPortNodeCount: U, migratedLinePortCount: V, migratedDefaultPortNodeCount: X, migratedDefaultPortLineCount: v } = await e.collectKvTidyNodeMutations(a, d, P, w), O = ae(P) !== ae(D);
      O && (P = D, E.push("sourceDirectNodes"));
      const M = await e.readRevisionMetaForRead(a, e.CONFIG_META_KEY), H = {
        configRevision: String(M?.revision || ""),
        configContentHash: ie(ae(C))
      }, j = o.includes(e.CONFIG_SNAPSHOTS_KEY), q = A.hadMalformedValue || ae(C) !== ae(P), J = Of(A.config, P), Q = e.collectUnreferencedAdminIndexUploadKeys(P, [], s);
      for (const W of Q) u.add(W);
      o.includes(e.CONFIG_SNAPSHOTS_KEY) && u.add(e.CONFIG_SNAPSHOTS_KEY), o.includes(e.CONFIG_SNAPSHOTS_META_KEY) && u.add(e.CONFIG_SNAPSHOTS_META_KEY);
      const se = e.normalizeNodeSummaryIndex(L).nodes, pe = e.normalizeNodeIndex(se.map((W) => W?.name)), _e = JSON.stringify(pe), ye = JSON.stringify(se), Ae = new TextEncoder().encode(ye).length, ke = l - Ae, Ft = e.buildLegacyConfigCacheKeys(A.config, P), Me = [...u].sort(), na = [.../* @__PURE__ */ new Set([...Ft, ...Me])].filter(Boolean).sort(), ot = [];
      q && ot.push({
        type: "put",
        key: e.CONFIG_KEY,
        value: JSON.stringify(P)
      });
      for (const W of x) ot.push({
        type: "put",
        key: `${e.PREFIX}${W.name}`,
        value: JSON.stringify(W.data)
      });
      R !== _e && ot.push({
        type: "put",
        key: e.NODES_INDEX_KEY,
        value: _e
      }), i !== ye && ot.push({
        type: "put",
        key: e.NODES_SUMMARY_INDEX_KEY,
        value: ye
      });
      for (const W of na) ot.push({
        type: "delete",
        key: W,
        value: ""
      });
      const st = await e.resolveKvTidyQuotaBudget(t, ot, {
        kv: a,
        config: P
      }), br = {
        scannedKeyCount: o.length,
        preservedNodeKeyCount: d.length,
        rebuiltNodeCount: pe.length,
        rewrittenNodeCount: F,
        configWasMalformed: A.hadMalformedValue,
        configReadSource: A.source,
        configRewritten: q,
        migratedConfigKeys: ar(E),
        deletedLegacyFieldCount: N.deletedLegacyFieldCount + I,
        deletedLegacyConfigFieldCount: N.deletedLegacyFieldCount,
        deletedLegacyNodeFieldCount: I,
        migratedTopLevelPortNodeCount: U,
        migratedLinePortCount: V,
        migratedDefaultPortNodeCount: X,
        migratedDefaultPortLineCount: v,
        deletedKeyCount: Me.length,
        deletedCacheKeyCount: Me.filter((W) => W === "sys:cf_dash_cache" || W.startsWith("sys:cf_dash_cache:")).length,
        deletedScheduledLockKeyCount: Me.filter((W) => W === e.LEGACY_SCHEDULED_LOCK_KEY).length,
        deletedLoginFailureKeyCount: T,
        deletedDnsIpPoolSourceKeyCount: h,
        deletedOpsStatusKeyCount: m,
        deletedTelegramAlertStateKeyCount: S,
        deletedDnsFetchLockKeyCount: b,
        deletedAdminIndexUploadCount: Q.length,
        untouchedOtherKeyCount: f,
        previousFullIndexBytes: l,
        nextSummaryIndexBytes: Ae,
        savedBytes: ke
      }, oa = Ff({
        configFieldTargets: br.migratedConfigKeys,
        sourceDirectNodesFromLegacyNodes: O,
        migratedTopLevelPortNodeCount: U,
        migratedLinePortCount: V,
        migratedDefaultPortNodeCount: X,
        migratedDefaultPortLineCount: v
      }), $e = [], Zt = Me.filter((W) => W === "sys:cf_dash_cache" || W.startsWith("sys:cf_dash_cache:")), mt = Me.filter((W) => W.startsWith("fail:")), pt = Me.filter((W) => W === e.LEGACY_DNS_IP_POOL_SOURCES_KEY), Ut = Me.filter((W) => W === e.LEGACY_OPS_STATUS_KEY || Object.values(e.LEGACY_OPS_STATUS_SECTION_KEYS).includes(W)), wt = Me.filter((W) => W === e.LEGACY_TELEGRAM_ALERT_STATE_KEY), kt = Me.filter((W) => W === e.LEGACY_SCHEDULED_LOCK_KEY), er = Me.filter((W) => W.startsWith(ap)), Lt = Me.filter((W) => W.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX)), Er = x.map((W) => W.name);
      Te($e, Zt.length > 0, "cf_dash_cache", "Cloudflare 仪表盘缓存", Zt, Zt.length, "会删除遗留的 sys:cf_dash_cache 及其按日期 / Zone 生成的缓存键。"), Te($e, mt.length > 0, "login_failures", "旧版登录失败计数", mt, mt.length, "会删除旧版 fail:* 登录失败计数键，后续仅保留 D1 auth_failures。"), Te($e, pt.length > 0, "dns_ip_pool_sources", "旧版 DNS IP 池源配置", pt, pt.length, "会删除旧版 sys:dns_ip_pool_sources:v1，后续只保留 D1 dns_ip_pool_sources。"), Te($e, Ut.length > 0, "ops_status", "旧版运维状态键", Ut, Ut.length, "会删除 sys:ops_status:v1 与 sys:ops_status:*，后续只保留 D1 sys_status。"), Te($e, wt.length > 0, "telegram_alert_state", "旧版 Telegram 告警冷却状态", wt, wt.length, "会删除 sys:telegram_alert_state:v1，后续只保留 D1 sys_status scope。"), Te($e, kt.length > 0, "scheduled_lock", "旧版定时租约键", kt, kt.length, "会删除 sys:scheduled_lock:v1，后续只保留 D1 sys_locks。"), Te($e, er.length > 0, "dns_fetch_lock", "旧版 DNS 抓取锁键", er, er.length, "会删除 sys:dns_ip_pool_fetch_lock:v1:*，后续只保留 D1 sys_locks。"), Te($e, j || y > 0, "legacy_config_snapshot_keys", "停用的设置历史键", [e.CONFIG_SNAPSHOTS_KEY, e.CONFIG_SNAPSHOTS_META_KEY], Number(j) + +(y > 0), "会删除已停用的设置历史键及其元数据。"), Te($e, Lt.length > 0, "admin_index_uploads", "未引用的本地 HTML 版本", Lt, Lt.length, "只保留当前配置引用的内容寻址 index.html。");
      const Ht = [];
      if (q && Te(Ht, !0, "runtime_config", "全局设置 sys:theme", [...N.legacyKeysPresent, ...J.map((W) => W.key)], 1, "会把旧版设置字段吸收到当前 schema，并以后端 sanitizeRuntimeConfig() 结果回写。"), F > 0) {
        const W = [];
        U > 0 && W.push(`旧版顶层 node.port 节点 ${U} 个`), V > 0 && W.push(`旧版 lines[].port 线路 ${V} 条`), X > 0 && W.push(`隐式默认端口节点 ${X} 个`), v > 0 && W.push(`按协议补齐默认端口线路 ${v} 条`), Te(Ht, !0, "node_entities", "节点实体 node:* 标准化重写", Er, F, W.length ? `会把端口并入 lines[].target，并移除旧版节点字段。${W.join("，")}。` : "会移除旧版节点字段，并统一回写当前节点 schema。");
      }
      Te(Ht, !0, "node_indexes", "节点索引 / 节点摘要索引", [e.NODES_INDEX_KEY, e.NODES_SUMMARY_INDEX_KEY], 2, `会按当前 node:* 实体重新生成轻量 name 索引与节点摘要索引，并把旧镜像压缩收敛为摘要格式（${l} -> ${Ae} bytes，节省 ${ke} bytes）。`);
      const $t = [ht("node_entities_preserved", "node:* 节点实体", d, {
        count: d.length,
        note: "不会整批删除 node:*，只会按需重写必要节点。"
      })];
      p > 0 && Te($t, !0, "dns_record_history", "DNS 历史记录", o.filter((W) => W.startsWith(e.DNS_RECORD_HISTORY_PREFIX)), p, "不会删除 sys:dns_record_history:v1:*。");
      const K = g + _;
      K > 0 && Te($t, !0, "meta_keys", "配置 / 索引元信息", [e.CONFIG_META_KEY, e.NODES_INDEX_META_KEY], K, "不会删除这些 revision / meta 键。");
      const G = [];
      A.hadMalformedValue && G.push(`检测到异常 sys:theme（来源: ${A.source}），整理时会按当前 schema 修复。`), U > 0 && G.push(`检测到 ${U} 个旧节点仍使用顶层 node.port；整理后会把端口并入 lines[].target。`), V > 0 && G.push(`检测到 ${V} 条旧线路仍使用独立 lines[].port；整理后会把端口并入 lines[].target。`), (X > 0 || v > 0) && G.push(`检测到 ${X} 个节点 / ${v} 条线路仍未显式写端口；整理后会按协议补齐为 :443 / :80。`), c?.legacyMirrorDetected === !0 && G.push(`检测到旧版 sys:nodes_index_full:v2 仍保存完整节点镜像；本次会按 node:* 重建并收敛为摘要索引（${l} -> ${Ae} bytes）。`), f > 0 && G.push(`发现 ${f} 个未列入整理白名单的 KV 键，本次不会自动删除。`), $e.length === 0 && !q && F === 0 && G.push("当前没有检测到需要执行的 KV 清理动作；本次更多是一轮一致性巡检。"), G.push(Qf(st)), st.blocked === !0 && st.reason && G.push(st.reason);
      const Y = {
        scope: "kv",
        scannedKeys: o,
        config: P,
        nodesIndex: pe,
        rebuiltNodeSummaries: se,
        revisions: H,
        summary: br,
        quotaBudget: st,
        mutationPlan: ot,
        preview: {
          scope: "kv",
          quotaBudget: st,
          fieldGroups: oa,
          deleteGroups: $e,
          rewriteGroups: Ht,
          preserveGroups: $t,
          warnings: G
        }
      };
      return Y.planHash = e.buildKvTidyPlanHash(Y), Y;
    },
    async applyKvTidyPlan(t, r = {}) {
      const a = r.kv || e.getKV(r.env);
      if (!a) throw new Error("KV not configured");
      const o = be(a), s = Array.isArray(t?.mutationPlan) ? t.mutationPlan : [];
      try {
        await e.applyKvMutationsWithRollback(a, s);
      } catch (i) {
        throw an(r.env), o.NodesListCache = null, o.NodesIndexCache = null, dr(a), Ys(o), o.NodeCache.clear(), o.PlaybackRouteHotCache.clear(), i;
      }
      return an(r.env), Ys(o), o.NodeCache.clear(), o.PlaybackRouteHotCache.clear(), Array.isArray(t?.nodesIndex) && t.nodesIndex.length > 0 && (Nl(t.nodesIndex), Dl(t.nodesIndex)), e.primeNodeSummaryCaches(Array.isArray(t?.rebuiltNodeSummaries) ? t.rebuiltNodeSummaries : [], a), o.NodesIndexCache = {
        data: Array.isArray(t?.nodesIndex) ? t.nodesIndex : [],
        exp: $() + 6e4
      }, e.buildTidyResult(t, { ...t?.summary }, "kv", {
        config: t?.config || {},
        nodesIndex: Array.isArray(t?.nodesIndex) ? t.nodesIndex : []
      });
    },
    async tidyKvData(t, r = {}) {
      return await su(r.kv || e.getKV(t))(async () => {
        const a = await e.verifyKvTidyPlanToken(t, r.planToken), o = await e.buildKvTidyPlan(t, r);
        if (String(o.planHash || "") !== String(a.planHash || "")) {
          const s = /* @__PURE__ */ new Error("KV tidy data changed after preview");
          throw s.code = "TIDY_PLAN_STALE", s.status = 409, s.details = {
            reason: "plan_changed",
            previewPlanHash: String(a.planHash || ""),
            currentPlanHash: String(o.planHash || "")
          }, s;
        }
        if (o?.quotaBudget?.blocked === !0) {
          const s = String(o?.quotaBudget?.reason || "KV tidy write budget exceeded").trim() || "KV tidy write budget exceeded", i = new Error(s);
          throw i.code = "KV_TIDY_WRITE_LIMIT_EXCEEDED", i.status = 409, i.details = { quotaBudget: o.quotaBudget }, i;
        }
        return await e.applyKvTidyPlan(o, {
          ...r,
          env: t
        });
      });
    }
  };
}
function Pg(n = {}, e = {}) {
  const { D1TidyExecutor: t, D1TidyPlanner: r } = n;
  return {
    async readD1Count(a, o, s = []) {
      if (!a || !o) return 0;
      try {
        let i = a.prepare(o);
        Array.isArray(s) && s.length && (i = i.bind(...s));
        const c = await i.first();
        return Math.max(0, Math.floor(Number(c?.total ?? c?.count ?? c?.c ?? c?.value) || 0));
      } catch {
        return 0;
      }
    },
    getPreviousD1TidyState(a = {}, o = null) {
      const s = k(a) ? a : {}, i = k(s.d1Tidy) ? s.d1Tidy : {};
      return Xe(k(o) ? o : k(s.cleanup) ? s.cleanup : {}, i);
    },
    buildD1TidyStatusPayload(a = {}, o = {}) {
      const s = String(o.mode || a.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", i = ct(o.maintenanceMode || a.maintenanceMode, s), c = String(o.triggeredBy || (s === "scheduled" ? "scheduled" : "manual")).trim() || (s === "scheduled" ? "scheduled" : "manual"), l = String(o.timestamp || a.finishedAt || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()).trim() || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), d = String(o.status || a.status || "success").trim() || "success", u = String(o.lastError || a.lastError || "").trim(), f = d === "failed" || d === "partial_failure", m = d === "skipped" || d === "deferred", p = {
        status: d,
        lastSuccessAt: !f && !m ? l : "",
        lastSkippedAt: m ? l : "",
        lastErrorAt: f ? l : "",
        lastError: f ? u : "",
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
    buildTidyResult(a = {}, o = {}, s = "kv", i = {}) {
      const c = k(a?.preview) ? a.preview : e.createEmptyTidyPreview(s);
      return {
        ...i,
        summary: o,
        preview: c,
        quotaBudget: k(a?.quotaBudget) ? a.quotaBudget : k(c?.quotaBudget) ? c.quotaBudget : null,
        fieldGroups: Array.isArray(c?.fieldGroups) ? c.fieldGroups : [],
        deleteGroups: Array.isArray(c?.deleteGroups) ? c.deleteGroups : [],
        rewriteGroups: Array.isArray(c?.rewriteGroups) ? c.rewriteGroups : [],
        preserveGroups: Array.isArray(c?.preserveGroups) ? c.preserveGroups : [],
        warnings: Array.isArray(c?.warnings) ? c.warnings : []
      };
    },
    async buildD1TidyPlan(a, o = {}) {
      const s = o.db || e.getDB(a), i = o.kv || e.getKV(a) || null;
      if (!s) throw new Error("D1 not configured");
      const c = o.schemaStatus?.schemaReady === !0 ? o.schemaStatus : await e.getD1SchemaReadiness(s, {
        allowAttestedFastPath: !0,
        env: a
      });
      if (c.schemaReady !== !0) {
        const S = e.createEmptyTidyPreview("d1");
        return S.warnings.push("D1 结构尚未通过运行时兼容检查；本预览不授权删除，必须先完成统一“初始化 DB”并重新预览。"), {
          scope: "d1",
          mode: "manual",
          maintenanceMode: ct(o.maintenanceMode, "manual"),
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
      const l = ce(o.config || (a ? await we(a) : {})), d = r.buildContext(l, o), u = r.attachPreviousState(e, d, o.previousCleanupStatus);
      u.schemaStatus = c, u.logQueuePendingCount = sr.get(s).LogQueue.length;
      const f = await r.readFacts(e, s, i, u), m = r.buildSourcePolicy(f.d1DnsIpPoolSources), p = r.buildFlags(e, u, f, m), h = r.buildSummary(u, f, m, p), g = c.schemaReady === !0;
      h.schemaReady = g, h.requiresSchemaInitialization = !g;
      const y = r.buildPreview(u, f, m, p);
      g || y.warnings.unshift("D1 结构尚未通过运行时兼容检查；本预览不授权删除，必须先完成统一“初始化 DB”并重新预览。");
      const _ = {
        scope: "d1",
        mode: u.mode,
        maintenanceMode: u.maintenanceMode,
        config: l,
        nowMs: u.nowTimestamp,
        retentionDays: u.retentionDays,
        retentionCutoffMs: u.retentionCutoffMs,
        utcOffsetMinutes: u.utcOffsetMinutes,
        scheduledNowMs: u.scheduledNow.getTime(),
        dayWindow: u.dayWindow,
        statsBucketDate: u.statsBucketDate,
        statsStartTs: u.statsStartTs,
        statsEndTs: u.statsEndTs,
        statsUtcOffsetMinutes: u.statsUtcOffsetMinutes,
        statsRetentionBoundaryDate: f.statsRetentionBoundaryDate,
        d1DnsIpPoolSources: f.d1DnsIpPoolSources,
        kvDnsIpPoolSources: f.kvDnsIpPoolSources,
        dnsIpPoolSourceAction: m.dnsIpPoolSourceAction,
        skipDnsIpPoolSourceCleanup: m.skipDnsIpPoolSourceCleanup,
        previousD1State: u.previousD1State,
        schemaStatus: c,
        flags: p,
        summary: h,
        preview: y
      };
      return _.planHash = e.buildD1TidyPlanHash(_), _;
    },
    async applyD1TidyPlan(a, o = {}) {
      const s = o.env, i = o.db || e.getDB(s), c = o.kv || e.getKV(s) || null;
      if (!i) throw new Error("D1 not configured");
      const l = o.schemaStatus?.schemaReady === !0 ? o.schemaStatus : a?.schemaStatus?.schemaReady === !0 ? a.schemaStatus : await e.getD1SchemaReadiness(i, {
        allowAttestedFastPath: !0,
        env: s
      });
      if (l.schemaReady !== !0) {
        const E = /* @__PURE__ */ new Error("D1 schema must pass runtime compatibility checks before tidy execution");
        throw E.code = "D1_SCHEMA_INCOMPATIBLE", E.status = 409, E.details = {
          issues: l.issues,
          autoRepairPolicy: l.autoRepairPolicy
        }, E;
      }
      const d = a || await e.buildD1TidyPlan(s, {
        ...o,
        db: i,
        kv: c
      }), u = String(d?.mode || o.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", f = ct(d?.maintenanceMode || o.maintenanceMode, u), m = k(d?.flags) ? d.flags : {}, p = typeof o.beforeEachStep == "function" ? o.beforeEachStep : async () => {
      }, h = {
        kv: c,
        db: i
      }, g = u === "scheduled", y = t.createSummary(d, u, m);
      y.maintenanceMode = f;
      let _ = !1;
      const S = (E, w, R, D) => {
        const x = R?.message || String(R);
        if (E && (y[E] = "failed"), w && (y[w] = x), y.lastError = x, y.status = y.status === "failed" ? "failed" : "partial_failure", console.error(`${D}: `, R), !g) throw R;
        return !1;
      }, T = sr.get(i);
      T.LogFlushTask && await Promise.resolve(T.LogFlushTask).catch(() => {
      });
      const b = $(), A = t.buildDeleteScopes(e, d, m, i), C = await t.runBudgetedDeleteScopes(A, y, p, { startedAt: b });
      if (y.hasMore = C.hasMore, y.remainingScopes = C.remainingScopes, y.budget = C.budget, _ = C.budget.processedRows > 0, m.rebuildStatsHourly === !0 && $() - b < Fr) try {
        await p("resetStatsHourly"), await e.clearStatsHourly(i), y.alignedStatsWindow = !0, y.statsAlignStatus = "success", y.statsRebuildStatus = "reset_for_new_logs", _ = !0;
      } catch (E) {
        S("statsRebuildStatus", "statsRebuildError", E, "D1 stats reset Error");
      }
      else
        y.statsAlignStatus = m.rebuildStatsHourly === !0 ? "deferred_budget" : "skipped", y.statsRebuildStatus = m.rebuildStatsHourly === !0 ? "deferred_budget" : "skipped";
      const N = () => $() - b < Fr;
      if (m.rebuildLogsFtsDeferred === !0) y.ftsRebuildStatus = m.ftsRebuildDeferredReason || "deferred_size_guard";
      else if (m.rebuildLogsFts === !0 && (y.hasMore || !N())) y.ftsRebuildStatus = "deferred_budget";
      else if (m.rebuildLogsFts === !0) try {
        await p("rebuildLogsFts");
        let E = !1;
        await e.hasLogsFtsTable(i) ? E = await e.rebuildLogsFts(i) : E = (await e.ensureLogsFtsSchema(i)).rebuilt === !0, y.rebuiltLogsFts = E === !0, y.ftsRebuildStatus = E === !0 ? "success" : "skipped", y.lastFtsRebuildAt = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), _ = _ || E === !0;
      } catch (E) {
        S("ftsRebuildStatus", "ftsRebuildError", E, "D1 logs FTS rebuild Error");
      }
      if (m.optimizeDb === !0 && !y.hasMore && N()) try {
        await p("optimizeLogsDb"), await e.optimizeLogsDb(i), y.optimizedDb = !0, y.optimizeStatus = "success", y.lastOptimizeAt = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), _ = !0;
      } catch (E) {
        S("optimizeStatus", "optimizeError", E, u === "scheduled" ? "Scheduled DB optimize Error" : "D1 optimize Error");
      }
      else m.optimizeDb === !0 && (y.optimizeStatus = "deferred_budget");
      y.budget.durationMs = Math.max(0, $() - b), y.budget.durationMs >= Fr && !y.budget.exhaustedBy && (y.budget.exhaustedBy = "time_limit"), await p("patchLogStatus");
      const P = await t.patchLogStatus(e, i, h, d, y, m, o);
      if (y.status !== "partial_failure" && y.status !== "failed") if (y.hasMore)
        y.status = "success", y.reason = "maintenance_budget_exhausted";
      else if (u === "scheduled") {
        const E = m.rebuildLogsFtsDeferred === !0 || m.optimizeDbDeferred === !0;
        _ ? y.status = "success" : (y.status = "skipped", y.reason = E ? "maintenance_deferred" : "no_expired_data");
      } else y.status = "success";
      return y.finishedAt = P, e.buildTidyResult(d, y, "d1");
    },
    async tidyD1Data(a, o = {}) {
      const s = String(o.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", i = ct(o.maintenanceMode, s), c = o.db || e.getDB(a);
      if (!c) throw new Error("D1 not configured");
      if (s === "manual") {
        const u = await e.verifyD1TidyPlanToken(a, o.planToken), f = await e.getD1SchemaReadiness(c, {
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
          ...o,
          db: c,
          mode: s,
          maintenanceMode: ct(u.maintenanceMode, s),
          nowMs: Number(u.planNowMs),
          scheduledNow: new Date(Number(u.scheduledNowMs) || Number(u.planNowMs)),
          statsBucketDate: String(u.statsBucketDate || ""),
          statsStartTs: Number(u.statsStartTs) || 0,
          statsEndTs: Number(u.statsEndTs) || 0,
          statsUtcOffsetMinutes: Number(u.statsUtcOffsetMinutes) || 0,
          schemaStatus: f
        });
        if (String(m.planHash || "") !== String(u.planHash || "")) {
          const p = /* @__PURE__ */ new Error("D1 tidy data changed after preview");
          throw p.code = "TIDY_PLAN_STALE", p.status = 409, p.details = {
            reason: "plan_changed",
            previewPlanHash: String(u.planHash || ""),
            currentPlanHash: String(m.planHash || "")
          }, p;
        }
        return {
          ...await e.applyD1TidyPlan(m, {
            ...o,
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
        const u = /* @__PURE__ */ new Error("D1 schema is not initialized");
        throw u.code = "D1_SCHEMA_NOT_READY", u.status = 409, u.details = { issues: l.issues }, u;
      }
      const d = o.plan || await e.buildD1TidyPlan(a, {
        ...o,
        db: c,
        mode: s,
        maintenanceMode: i,
        schemaStatus: l
      });
      return {
        ...await e.applyD1TidyPlan(d, {
          ...o,
          db: c,
          env: a,
          schemaStatus: l
        }),
        schema: l
      };
    },
    shouldRunLogsOptimize(a, o = {}) {
      const s = Number(o.nowMs) || $(), i = Math.max(0, Number(o.minIntervalMs) || B.Defaults.LogVacuumMinIntervalMs);
      if (o.force === !0) return !0;
      const c = typeof a == "string" ? new Date(a).getTime() : NaN;
      return Number.isFinite(c) ? s - c >= i : !0;
    },
    shouldRunLogsFtsRebuild(a, o = {}) {
      return e.shouldRunLogsOptimize(a, {
        ...o,
        minIntervalMs: Math.max(0, Number(o.minIntervalMs) || B.Defaults.LogFtsRebuildMinIntervalMs)
      });
    },
    async optimizeLogsDb(a) {
      return a ? (await a.prepare("PRAGMA optimize").run(), !0) : !1;
    }
  };
}
function xg(n = {}, e = {}) {
  const { buildAdminReleaseVendorManifest: t, normalizeAdminReleaseVendorManifestRecord: r, validateAdminShellHtmlSource: a } = n;
  return {
    async readLegacyConfigSnapshotRecordsStrict(o) {
      if (!o) return [];
      const s = await ve(o, e.CONFIG_SNAPSHOTS_KEY, { type: "json" });
      if (s == null) return [];
      if (Array.isArray(s)) return s;
      const i = /* @__PURE__ */ new Error("Stored legacy config snapshot records are invalid");
      throw i.code = "CONFIG_SNAPSHOTS_INVALID", i.status = 409, i;
    },
    buildAdminIndexUploadKey(o = "") {
      const s = Mt(o);
      return s ? `${e.ADMIN_INDEX_UPLOAD_PREFIX}${s}` : "";
    },
    normalizeAdminIndexUploadRecord(o = {}, s = "") {
      if (!k(o)) return null;
      const i = Mt(o.revision), c = Mt(s);
      if (!i || c && i !== c) return null;
      const l = Xr(i), d = Uo(i), u = String(o.html || "");
      return u ? {
        version: Number(o.version) || 1,
        revision: i,
        assetRevision: d,
        sourceUrl: l,
        fileName: String(o.fileName || "index.html").trim() || "index.html",
        uploadedAt: String(o.uploadedAt || "").trim(),
        bytes: Number(o.bytes) || new TextEncoder().encode(u).length,
        html: u,
        manifest: r(o.manifest || {})
      } : null;
    },
    async validateAdminIndexUploadRecord(o = {}, s = "") {
      const i = e.normalizeAdminIndexUploadRecord(o, s);
      if (!i || await Xn(i.html) !== i.revision) return null;
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
    async getAdminActiveIndexRecord(o) {
      return o ? e.validateAdminIndexUploadRecord(await ve(o, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" })) : null;
    },
    async getAdminIndexUploadRecord(o, s = "") {
      const i = e.buildAdminIndexUploadKey(s);
      if (!o || !i) return null;
      const c = await e.validateAdminIndexUploadRecord(await ve(o, i, { type: "json" }), s);
      return c || e.validateAdminIndexUploadRecord(await ve(o, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" }), s);
    },
    collectReferencedAdminIndexUploadRevisions(o = {}, s = []) {
      const i = /* @__PURE__ */ new Set(), c = (l) => {
        const d = tt(l?.indexUrl || "");
        d && i.add(d);
      };
      c(o);
      for (const l of Array.isArray(s) ? s : []) c(l?.config);
      return i;
    },
    collectUnreferencedAdminIndexUploadKeys(o = {}, s = [], i = []) {
      const c = e.collectReferencedAdminIndexUploadRevisions(o, s);
      return (Array.isArray(i) ? i : []).filter((l) => {
        const d = String(l || "").trim();
        if (!d.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX)) return !1;
        const u = Mt(d.slice(e.ADMIN_INDEX_UPLOAD_PREFIX.length));
        return u && !c.has(u);
      });
    },
    async persistAdminIndexUpload(o = {}, s = {}) {
      const { env: i, kv: c, ctx: l } = s;
      if (!c) {
        const u = /* @__PURE__ */ new Error("KV namespace is required to persist the local admin index");
        throw u.code = "KV_NOT_CONFIGURED", u.status = 503, u;
      }
      const d = e.normalizeAdminIndexUploadRecord(o, o?.revision);
      if (!d) {
        const u = /* @__PURE__ */ new Error("本地 index.html 上传记录无效");
        throw u.code = "ADMIN_INDEX_UPLOAD_INVALID", u.status = 400, u;
      }
      return await nr(c)(async () => {
        const u = e.buildAdminIndexUploadKey(d.revision), f = await ve(c, u, { type: "json" }), m = await ve(c, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" });
        let p = e.normalizeAdminIndexUploadRecord(f, d.revision);
        p && await Xn(p.html) !== d.revision && (p = null);
        const h = p || d;
        p || await c.put(u, JSON.stringify(d)), await c.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(h));
        try {
          const g = i ? await me(i) : ce(await ve(c, e.CONFIG_KEY, { type: "json" }) || {});
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
          throw await ge(m ? c.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(m)) : c.delete(e.ADMIN_ACTIVE_INDEX_KEY), "admin.active_index_upload_rollback", { revision: d.revision }, null), p || await ge(f ? c.put(u, JSON.stringify(f)) : c.delete(u), "admin.local_index_upload_rollback", { revision: d.revision }, null), g;
        }
      });
    },
    async rollbackAdminIndexUploadActivation(o = {}, s = {}, i = {}) {
      const { env: c, kv: l, ctx: d } = i;
      if (!l) {
        const u = /* @__PURE__ */ new Error("KV namespace is required to roll back the local admin index");
        throw u.code = "KV_NOT_CONFIGURED", u.status = 503, u;
      }
      return await nr(l)(async () => {
        const u = c ? await me(c) : ce(await ve(l, e.CONFIG_KEY, { type: "json" }) || {}), f = tt(s?.indexUrl || ""), m = tt(u?.indexUrl || "");
        if (!f || m !== f) return {
          config: u,
          skipped: !0,
          reason: m ? "superseded_by_newer_admin_index" : "admin_index_already_restored"
        };
        const p = tt(o?.indexUrl || ""), h = await ve(l, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" }), g = p ? await e.getAdminIndexUploadRecord(l, p) : null;
        g ? await l.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(g)) : await l.delete(e.ADMIN_ACTIVE_INDEX_KEY);
        try {
          return {
            config: await e.commitRuntimeConfig({
              ...u,
              indexUrl: p ? Xr(p) : ""
            }, {
              env: c,
              kv: l,
              ctx: d
            }),
            skipped: !1,
            reason: ""
          };
        } catch (y) {
          throw await ge(h ? l.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(h)) : l.delete(e.ADMIN_ACTIVE_INDEX_KEY), "admin.active_index_rollback_restore", { revision: f }, null), y;
        }
      });
    },
    async captureRuntimeConfigRollbackState(o, s) {
      if (!s) return {
        config: ce(o ? await we(o) : {}),
        kvEntries: []
      };
      const i = o ? await me(o) : ce(await ve(s, e.CONFIG_KEY, { type: "json" }) || {}), c = [
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
    async restoreCapturedRuntimeConfigState(o = {}, s = {}) {
      const i = s.kv, c = ce(o?.config || {});
      if (!i) return c;
      const l = Array.isArray(o?.kvEntries) ? o.kvEntries : [];
      if (l.length > 0) {
        const d = l.map((u) => u?.exists === !0 ? {
          type: "put",
          key: String(u?.key || "").trim(),
          value: String(u?.value ?? "")
        } : {
          type: "delete",
          key: String(u?.key || "").trim(),
          value: ""
        });
        await e.applyKvMutationsWithRollback(i, d);
      }
      return an(s.env), s.env ? await we(s.env) : c;
    },
    async restoreCapturedRuntimeConfigAndDnsState(o = {}, s = {}) {
      const i = ce(o?.config || {});
      let c = null, l = null, d = i;
      try {
        await e.commitRuntimeConfig(i, {
          env: s.env,
          kv: s.kv,
          ctx: s.ctx
        });
      } catch (u) {
        c = u;
      }
      try {
        d = await e.restoreCapturedRuntimeConfigState(o, s);
      } catch (u) {
        l = u;
      }
      if (c || l) {
        const u = new Error([c ? `dns:${ue(c, "restore_failed")}` : "", l ? `kv:${ue(l, "restore_failed")}` : ""].filter(Boolean).join("; "));
        throw u.code = "CONFIG_DNS_RESTORE_FAILED", u.status = 500, u.details = {
          dnsRestoreError: c ? ue(c, "restore_failed") : "",
          kvRestoreError: l ? ue(l, "restore_failed") : ""
        }, u;
      }
      return d;
    }
  };
}
function Og(n = {}, e = {}) {
  return {
    async persistRuntimeConfig(t, r = {}) {
      return await nr(r.kv || Sr(r.env))(() => e.commitRuntimeConfig(t, {
        ...r,
        forceKvCommit: !0
      }));
    },
    async prepareRuntimeConfigPersistence(t, r = {}) {
      const { env: a, kv: o, ctx: s } = r;
      if (!o) {
        const u = /* @__PURE__ */ new Error("KV namespace is required to persist runtime config");
        throw u.code = "KV_NOT_CONFIGURED", u.status = 503, u;
      }
      ju(t?.defaultHostPrefixCnameTarget);
      const i = a ? await me(a) : ce(await ve(o, e.CONFIG_KEY, { type: "json" }) || {}), c = ce(t);
      ed(t), td(c, a);
      const l = Ge(a), d = tn(null, i, l) !== tn(null, c, l) ? (await e.loadAllNodeEntitiesFromKvStrict(o, { ctx: s })).filter((u) => et(u?.entryMode) && !Xt(u?.hostPrefixCnameTarget)) : [];
      return d.length > 0 && pa(c, a), {
        prevConfig: i,
        nextConfig: c,
        configuredHost: l,
        dnsPlans: d.map((u) => e.buildHostPrefixDnsSyncPlan(u.name, u, u.name, u, l, {
          previousConfig: i,
          nextConfig: c
        })).filter((u) => u.changed === !0),
        ctx: s,
        kv: o,
        env: a
      };
    },
    async buildRuntimeConfigMutationPlan(t, r, a) {
      const o = await e.readLegacyConfigSnapshotRecordsStrict(t), s = e.normalizeRevisionMeta(lo(a)), i = [
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
      for (const d of e.buildLegacyConfigCacheKeys(r, a)) i.push({
        type: "delete",
        key: d,
        value: ""
      });
      const c = e.collectReferencedAdminIndexUploadRevisions(r, o), l = e.collectReferencedAdminIndexUploadRevisions(a, []);
      for (const d of c)
        l.has(d) || i.push({
          type: "delete",
          key: e.buildAdminIndexUploadKey(d),
          value: ""
        });
      return i;
    },
    async commitRuntimeConfig(t, r = {}) {
      const { prevConfig: a, nextConfig: o, configuredHost: s, dnsPlans: i, ctx: c, kv: l, env: d } = await e.prepareRuntimeConfigPersistence(t, r);
      if (Pf(r.expectedConfigRevision, a), ae(a) === ae(o))
        return await e.ensureConfigMeta(l, o, { ctx: c }), o;
      const u = [];
      let f = null, m = !1;
      try {
        for (const h of i)
          f = h, await e.persistHostPrefixDnsSyncPlan(h, {
            env: d,
            kv: l,
            ctx: c,
            config: o,
            requestHost: s
          }), u.push(h), f = null;
        m = !0;
        const p = await e.buildRuntimeConfigMutationPlan(l, a, o);
        return await e.applyKvMutationsWithRollback(l, p), d ? vd(d, o) : an(), await e.invalidateDashboardSnapshotCacheForConfigChange(d, {
          prevConfig: a,
          nextConfig: o
        }), o;
      } catch (p) {
        const h = [], g = f ? [...u, f] : u;
        for (let y = g.length - 1; y >= 0; y -= 1) try {
          await e.persistHostPrefixDnsSyncPlan({ steps: g[y].rollbackSteps }, {
            env: d,
            kv: l,
            ctx: c,
            config: o,
            requestHost: s,
            skipHistory: !0
          });
        } catch (_) {
          h.push(ue(_, "dns_rollback_failed"));
        }
        if (p && typeof p == "object") {
          const y = Array.isArray(p?.details?.rollbackConflicts) ? p.details.rollbackConflicts : [], _ = Array.isArray(p?.details?.rollbackFailures) ? p.details.rollbackFailures : [];
          p.details = {
            ...k(p.details) ? p.details : {},
            hostPrefixDnsSyncAttempted: i.length > 0,
            hostPrefixDnsSyncedCount: u.length,
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
    async commitSourceDirectNodesConfigWithinMutation(t, r, a, o = {}) {
      if (!r) return null;
      const s = t ? await me(t) : ce(await r.get(e.CONFIG_KEY, { type: "json" }) || {}), i = bt(s.sourceDirectNodes || []), c = mo(i, {
        renameMap: o.renameMap,
        removedNames: o.removedNames,
        allowedNames: o.allowedNames
      });
      return ae(i) === ae(c) ? s : e.commitRuntimeConfig({
        ...s,
        sourceDirectNodes: c
      }, {
        env: t,
        kv: r,
        ctx: a
      });
    },
    async commitSingleNodeMainVideoStreamShortcutShadowWithinMutation(t, r, a, o = {}) {
      if (!r) return null;
      const s = t ? await me(t) : ce(await r.get(e.CONFIG_KEY, { type: "json" }) || {}), i = String(o.originalName || "").trim().toLowerCase(), c = String(o.nodeName || "").trim().toLowerCase(), l = En(o.mode);
      let d = bt(s.sourceDirectNodes || []);
      return i && i !== c && (d = mo(d, { renameMap: { [i]: c } })), d = d.filter((u) => String(u || "").trim().toLowerCase() !== c), c && l === "direct" && d.push(c), d = bt(d), ae(s.sourceDirectNodes || []) === ae(d) ? s : e.commitRuntimeConfig({
        ...s,
        sourceDirectNodes: d
      }, {
        env: t,
        kv: r,
        ctx: a
      });
    }
  };
}
function vg(n = {}, e = {}) {
  return {
    async sendTelegramMessage({ tgBotToken: t, tgChatId: r, text: a }) {
      const o = String(t || "").trim(), s = String(r || "").trim();
      if (!o || !s) throw new Error("请先完善 Telegram Bot Token 和 Chat ID 配置");
      const i = await Pe(await ze(`https://api.telegram.org/bot${o}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: s,
          text: String(a || "")
        })
      }), bn);
      if (i.exceeded) throw new Error("Telegram API response too large");
      const c = JSON.parse(i.text);
      if (!c.ok) throw new Error(c.description || "Telegram API 返回错误");
      return c;
    },
    async buildDailyTelegramSummaryPayload(t, r = {}) {
      const a = ce(r?.config || await me(t)), o = r?.now instanceof Date ? new Date(r.now.getTime()) : new Date(r?.now || /* @__PURE__ */ new Date()), s = r?.dayWindow && typeof r.dayWindow == "object" ? r.dayWindow : dt(o, a.scheduleUtcOffsetMinutes), [i, c] = await Promise.all([e.buildDashboardStatsPayload(t, {
        config: a,
        dayWindow: s,
        nowMs: o.getTime(),
        skipD1WriteHotspot: !0
      }), e.getDashboardMonthlyTrafficPayload(t, {
        config: a,
        ctx: r?.ctx || null,
        nowMs: o.getTime()
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
      const a = e.getDB(t), o = e.getKV(t);
      if (!a || !o) throw new Error("Database or KV not configured");
      const s = await o.get(e.CONFIG_KEY, { type: "json" }) || {}, i = ce(s), c = String(i.tgBotToken || "").trim(), l = String(i.tgChatId || "").trim();
      if (!c || !l) throw new Error("请先完善 Telegram Bot Token 和 Chat ID 配置");
      const d = r?.now instanceof Date ? new Date(r.now.getTime()) : new Date(r?.now || /* @__PURE__ */ new Date()), u = dt(d, i.scheduleUtcOffsetMinutes), f = fc(i, s, {
        reportKinds: r?.reportKinds,
        fallbackAllWhenLegacy: !0
      });
      if (!f.length) throw new Error("请先至少启用一个日报类型");
      const m = f.includes("summary") ? await e.buildDailyTelegramSummaryPayload(t, {
        config: i,
        now: d,
        dayWindow: u
      }) : null, p = f.some((g) => g !== "summary") ? await e.getCloudflareRuntimeQuotaStatus(t, {
        config: i,
        db: a
      }) : null, h = [];
      for (const g of f) {
        const y = rm(g, g === "summary" ? m : p?.[g], u);
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
      const o = e.getDB(t);
      if (!o) return {
        sent: !1,
        reason: "db_unavailable"
      };
      if (!await e.ensureSysStatusTable(o)) return {
        sent: !1,
        reason: "db_init_failed"
      };
      const s = ce(await we(t)), i = a && typeof a == "object" ? a : {}, c = String(s.tgBotToken || "").trim(), l = String(s.tgChatId || "").trim();
      if (!c || !l) return {
        sent: !1,
        reason: "telegram_not_configured"
      };
      const d = fe(s.tgAlertDroppedBatchThreshold, B.Defaults.TgAlertDroppedBatchThreshold, 0, 5e3), u = fe(s.tgAlertFlushRetryThreshold, B.Defaults.TgAlertFlushRetryThreshold, 0, 10), f = fe(s.tgAlertCooldownMinutes, B.Defaults.TgAlertCooldownMinutes, 1, 1440), m = s.tgAlertOnScheduledFailure === !0, p = s.tgAlertKvUsageEnabled === !0, h = s.tgAlertD1UsageEnabled === !0, g = fe(s.tgAlertKvUsageThresholdPercent, B.Defaults.TgAlertKvUsageThresholdPercent, 1, 100), y = fe(s.tgAlertD1UsageThresholdPercent, B.Defaults.TgAlertD1UsageThresholdPercent, 1, 100);
      if (d <= 0 && u <= 0 && !m && !p && !h) return {
        sent: !1,
        reason: "thresholds_disabled"
      };
      const _ = await e.getOpsStatus(t), S = _ && typeof _.log == "object" ? _.log : {}, T = r && typeof r == "object" && Object.keys(r).length ? r : _ && typeof _.scheduled == "object" ? _.scheduled : {}, b = [], A = Number(S.lastDroppedBatchSize) || 0;
      d > 0 && A >= d && b.push({
        code: "log_drop",
        message: `日志刷盘疑似丢弃批次：${A} 条（阈值 ${d}）`,
        eventAt: S.lastFlushErrorAt || S.lastOverflowAt || S.updatedAt || _.updatedAt || ""
      });
      const C = Number(S.lastFlushRetryCount) || 0;
      u > 0 && C >= u && b.push({
        code: "log_retry",
        message: `D1 写入重试次数偏高：${C} 次（阈值 ${u}）`,
        eventAt: S.lastFlushAt || S.lastFlushErrorAt || S.updatedAt || _.updatedAt || ""
      });
      const N = String(T.status || "").toLowerCase();
      if (m && (N === "failed" || N === "partial_failure")) {
        const L = [];
        for (const [F, I] of Object.entries({
          cleanup: "日志清理",
          tgDailyReport: "每日报表",
          alerts: "异常告警"
        })) {
          const U = T?.[F];
          if (!U || typeof U != "object") continue;
          const V = String(U.status || "").trim(), X = String(U.lastError || "").trim();
          !X && V !== "failed" && V !== "partial_failure" || L.push(`${I}：${V || "failed"}${X ? `，错误：${X}` : ""}`);
        }
        b.push({
          code: "scheduled_failure",
          message: L.length ? `定时任务状态异常：${L.join("；")}` : `定时任务状态异常：${T.status}${T.lastError ? `，错误：${T.lastError}` : ""}`,
          eventAt: T.lastFinishedAt || T.lastErrorAt || T.updatedAt || _.updatedAt || ""
        });
      }
      if (p || h) {
        const L = await e.getCloudflareRuntimeQuotaStatus(t, {
          config: s,
          db: o
        }), F = [{
          enabled: p,
          threshold: g,
          code: "cf_kv_usage",
          title: "KV",
          card: L?.kv
        }, {
          enabled: h,
          threshold: y,
          code: "cf_d1_usage",
          title: "D1",
          card: L?.d1
        }];
        for (const I of F) {
          if (I.enabled !== !0) continue;
          const U = I.card && typeof I.card == "object" ? I.card : {}, V = String(U.status || "").trim().toLowerCase();
          if (V !== "success" && V !== "partial_failure") continue;
          const X = (Array.isArray(U.metrics) ? U.metrics : []).filter((O) => Number(O?.percent) >= I.threshold);
          if (!X.length) continue;
          const v = X.map((O) => `${String(O?.key || "").trim()}:${String(O?.percentText || "").trim()}`).filter(Boolean).join(",");
          b.push({
            code: I.code,
            message: em(I.title, U, I.threshold, X),
            eventAt: `${String(U.resourceLabel || I.title || "").trim()}|${String(U.planLabel || "").trim()}|${String(U.periodLabel || "").trim()}|${v}|${V}`
          });
        }
      }
      if (!b.length) return {
        sent: !1,
        reason: "no_alerts"
      };
      const P = JSON.stringify(b.map((L) => ({
        code: L.code,
        eventAt: L.eventAt,
        message: L.message
      }))), E = await e.getOpsStatusPayloadFromDb(o, e.TELEGRAM_ALERT_STATE_DB_SCOPE), w = Date.now(), R = f * 60 * 1e3;
      if (i.ignoreCooldown !== !0 && E && E.signature === P && Number(E.sentAtMs) > 0 && w - Number(E.sentAtMs) < R) return {
        sent: !1,
        reason: "cooldown_active"
      };
      const D = Tu(/* @__PURE__ */ new Date(), s.scheduleUtcOffsetMinutes), x = [
        "⚠️ Emby Proxy 运行时异常告警",
        "",
        ...b.map((L) => `- ${L.message}`),
        "",
        `时间：${D.dateKey} ${D.clockTime} (${D.offsetLabel})`,
        "#Emby #Alert"
      ];
      return await e.sendTelegramMessage({
        tgBotToken: c,
        tgChatId: l,
        text: x.join(`
`)
      }), i.persistState !== !1 && (await e.putOpsStatusPayloadToDb(o, e.TELEGRAM_ALERT_STATE_DB_SCOPE, {
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
function Fg(n = {}, e = {}) {
  return {
    ...Mg(n, e),
    ...Pg(n, e),
    ...xg(n, e),
    ...Og(n, e),
    ...vg(n, e)
  };
}
var Ug = class {
  constructor({ logger: n, service: e }) {
    this.logger = n, this.service = e;
  }
  handle(n, e, t) {
    if (!t || typeof t.waitUntil != "function") throw new TypeError("ScheduledMaintenanceFacade.handle requires ctx.waitUntil");
    const r = this.#p(n, e, t);
    t.waitUntil(r);
  }
  #t(n = {}, ...e) {
    for (const t of e) {
      if (!t) continue;
      const r = n?.[t];
      if (k(r)) return r;
    }
    return {};
  }
  #e(n = "success") {
    return n === "success" ? "partial_failure" : n;
  }
  #o(n = {}, e = "") {
    const t = String(e || n?.localDateKey || "");
    return t ? {
      ...n,
      localDateKey: t,
      executedSlots: xt(n?.executedSlots || [], [])
    } : {
      ...n,
      executedSlots: xt(n?.executedSlots || [], [])
    };
  }
  #s(n = {}, e = "", t = "") {
    return this.#o({
      ...n,
      executedSlots: [...n?.executedSlots || [], t]
    }, e);
  }
  #n(n = "", e = []) {
    const t = e[e.length - 1] || "";
    return {
      processedSlots: e,
      lastPlannedSlot: t ? `${n} ${t}` : "",
      reason: e.length > 1 ? "clock_slots_processed" : "clock_slot_processed"
    };
  }
  #r(n = {}, e = "", t = "", r = {}) {
    return {
      ...n,
      status: "skipped",
      lastSkippedAt: e,
      reason: t,
      ...r
    };
  }
  #i(n = {}, e = "", t = {}) {
    return {
      ...n,
      status: "success",
      lastSuccessAt: e,
      ...t
    };
  }
  #c(n = {}, e = "", t = "", r = {}) {
    return {
      ...n,
      status: "failed",
      lastErrorAt: e,
      lastError: t,
      ...r
    };
  }
  #u(n = "") {
    return async (e, t, r = null, a = null) => {
      try {
        return await e;
      } catch (o) {
        return this.logger.error(`scheduled.${t}`, o, {
          leaseToken: n,
          ...k(r) ? r : {}
        }), a;
      }
    };
  }
  #a(n, e, t) {
    return { scheduled: {
      lastSkippedAt: n,
      lastSkipReason: t,
      lock: {
        status: "busy",
        reason: t,
        expiresAt: e.lock?.expiresAt || null,
        backend: String(e?.backend || e?.lock?.backend || "").trim() || "d1"
      }
    } };
  }
  #d(n, e, t = "d1") {
    const r = String(e || "scheduled_skipped").trim() || "scheduled_skipped";
    return { scheduled: {
      status: "skipped",
      lastSkippedAt: n,
      lastSkipReason: r,
      lastFinishedAt: n,
      lock: {
        status: "skipped",
        reason: r,
        backend: String(t || "").trim() || "d1"
      }
    } };
  }
  #f(n, e, t, r) {
    return { scheduled: {
      status: "running",
      lastStartedAt: n,
      lock: {
        status: "held",
        token: e,
        expiresAt: t.lock?.expiresAt || $() + r
      }
    } };
  }
  #l(n, e, t) {
    return n.lostReason ? {
      status: "lost",
      reason: n.lostReason,
      lastCheckedAt: e
    } : {
      status: t ? "released" : "release_skipped",
      releasedAt: e
    };
  }
  #m({ leaseStores: n, leaseToken: e, scheduledLeaseMs: t, leaseBackend: r = "", initialLock: a = null }) {
    const o = {
      active: !0,
      lostReason: null,
      lock: a
    }, s = async () => {
      if (!o.active) return null;
      const l = await this.service.renewScheduledLease(n, e, t, { backend: r });
      return l ? (o.lock = l, l) : (o.active = !1, o.lostReason = o.lostReason || "lease_lost", null);
    }, i = async () => {
      if (!o.active) throw new Error(o.lostReason || "scheduled_lease_lost");
      const l = await s();
      if (!l) throw new Error(o.lostReason || "scheduled_lease_lost");
      return l;
    }, c = Math.max(5e3, Math.min(Math.floor(t / 3), 6e4));
    return {
      leaseState: o,
      ensureActive: i,
      keepalivePromise: (async () => {
        for (; o.active; ) {
          let l = c;
          for (; o.active && l > 0; ) {
            const d = Math.min(l, 1e3);
            await Li(d), l -= d;
          }
          if (!o.active) break;
          await s();
        }
      })().catch((l) => {
        o.active = !1, o.lostReason = o.lostReason || "lease_renew_failed", this.logger.error("scheduled.lease_keepalive", l, {
          leaseToken: e,
          backend: r || "unknown",
          lostReason: o.lostReason
        });
      })
    };
  }
  async #p(n, e, t) {
    const r = this.service.getDB(e), a = this.service.getKV(e);
    if (!a && !r) return;
    const o = { db: r }, s = await we(e), i = Ue(s?.scheduleUtcOffsetMinutes), c = n?.scheduledTime !== void 0 ? new Date(n.scheduledTime) : /* @__PURE__ */ new Date(), l = ps(c, i), d = (C = /* @__PURE__ */ new Date()) => ps(C, i), u = fe(s?.scheduledLeaseMs, B.Defaults.ScheduledLeaseMs, B.Defaults.ScheduledLeaseMinMs, 900 * 1e3), f = `${$()}-${Math.random().toString(36).slice(2, 10)}`, m = this.#u(f), p = async (C) => {
      const N = String(C || "db_unavailable").trim() || "db_unavailable";
      await m(this.service.patchOpsStatus(e, this.#d(l, N, "d1")), "patch_skipped_status", {
        reason: N,
        backend: "d1"
      }, null);
    };
    if (!r) {
      await p("db_not_configured");
      return;
    }
    const h = await this.service.tryAcquireScheduledLeaseWithDb(r, {
      token: f,
      leaseMs: u
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
      leaseStores: o,
      leaseToken: f,
      scheduledLeaseMs: u,
      leaseBackend: g,
      initialLock: h.lock || null
    }), T = l;
    await m(this.service.patchOpsStatus(e, this.#f(T, f, y, u)), "patch_running_status", { startedAt: T }, null);
    const b = {
      status: "success",
      lastStartedAt: T,
      lastFinishedAt: null,
      lastSuccessAt: null,
      lastErrorAt: null,
      lastError: null,
      d1Tidy: {},
      cleanup: {},
      kvTidy: {},
      tgDailyReport: {},
      alerts: {}
    }, A = () => d(/* @__PURE__ */ new Date());
    try {
      const C = s || {}, N = await m(this.service.getOpsStatusSection(e, "scheduled"), "read_previous_status", null, {});
      if (r) try {
        await _();
        const I = dt(c, C.scheduleUtcOffsetMinutes), U = I.dateKey, V = I.startTs, X = I.endTs, v = Ue(C.scheduleUtcOffsetMinutes), O = this.service.getPreviousD1TidyState(N), M = await this.service.tidyD1Data(e, {
          db: r,
          kv: a,
          ctx: t,
          config: C,
          mode: "scheduled",
          maintenanceMode: "smart",
          previousScheduledState: N,
          previousCleanupStatus: O,
          scheduledNow: c,
          dayWindow: I,
          statsBucketDate: U,
          statsStartTs: V,
          statsEndTs: X,
          statsUtcOffsetMinutes: v,
          beforeEachStep: _
        }), H = A(), j = this.service.buildD1TidyStatusPayload(M.summary, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: H
        });
        b.d1Tidy = j.d1Tidy, b.cleanup = j.cleanup, (b.d1Tidy.status === "partial_failure" || b.d1Tidy.status === "failed") && (b.status = "partial_failure"), await _();
      } catch (I) {
        b.status = "partial_failure";
        const U = this.service.buildD1TidyStatusPayload({
          status: "failed",
          lastError: I?.message || String(I),
          maintenanceMode: "smart"
        }, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: A()
        });
        b.d1Tidy = U.d1Tidy, b.cleanup = U.cleanup, this.logger.error("Scheduled DB Cleanup Error: ", I);
      }
      else {
        const I = this.service.buildD1TidyStatusPayload({
          status: "skipped",
          reason: "db_not_configured",
          maintenanceMode: "smart"
        }, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: A()
        });
        b.d1Tidy = I.d1Tidy, b.cleanup = I.cleanup;
      }
      try {
        await _();
        const I = await this.service.snapshotCfDailyTrafficArchive(e, {
          config: C,
          nowMs: c.getTime()
        });
        b.cfTrafficArchive = {
          status: String(I?.status || "success"),
          storedCount: Math.max(0, Number(I?.storedCount) || 0),
          lastFinishedAt: A()
        }, I?.status === "partial_failure" && (b.status = this.#e(b.status));
      } catch (I) {
        b.status = this.#e(b.status), b.cfTrafficArchive = {
          status: "failed",
          lastError: I?.message || String(I),
          lastFinishedAt: A()
        }, this.logger.error("Scheduled CF traffic archive Error: ", I);
      }
      b.kvTidy = {
        ...this.#t(N, "kvTidy"),
        mode: "manual_only",
        lastAutoSkipAt: A(),
        autoSkipReason: "manual_only"
      };
      const { tgBotToken: P, tgChatId: E } = C, w = this.#t(N, "tgDailyReport", "report"), R = this.#t(N, "alerts"), D = xt(C.tgDailyReportClockTimes, B.Defaults.TgDailyReportClockTimes), x = Ru(w, D, i, c), L = fc(C, C), F = {
        ...w,
        clockTimes: D,
        reportKinds: L
      };
      if (C.tgDailyReportEnabled === !0) {
        let I = this.#o(x.fixedQueue);
        if (!L.length) b.tgDailyReport = this.#r(F, A(), "report_kinds_disabled", { fixedQueue: I });
        else if (!P || !E) b.tgDailyReport = this.#r(F, A(), "telegram_not_configured", { fixedQueue: I });
        else if (x.due !== !0) b.tgDailyReport = this.#r(F, A(), x.reason || "time_not_matched", { fixedQueue: I });
        else {
          let U = [], V = null, X = 0;
          for (const v of x.dueSlots) try {
            await _();
            const O = await this.service.sendDailyTelegramReport(e, {
              now: c,
              reportKinds: L
            });
            X += Number(O?.sentCount) || 0, U.push(v), I = this.#s(I, x.context.dateKey, v);
          } catch (O) {
            V = O, this.logger.error("Scheduled Daily Report Error: ", O);
            break;
          }
          V ? (b.status = this.#e(b.status), b.tgDailyReport = this.#c(F, A(), V?.message || String(V), {
            fixedQueue: I,
            processedSlots: U
          })) : b.tgDailyReport = this.#i(F, A(), {
            fixedQueue: I,
            sentCount: X,
            ...this.#n(x.context.dateKey, U)
          });
        }
      } else b.tgDailyReport = this.#r(F, A(), "disabled", { fixedQueue: x.fixedQueue });
      try {
        await _();
        const I = await this.service.maybeSendRuntimeAlerts(e, b), U = A();
        b.alerts = I.sent === !0 ? this.#i(R, U, {
          lastPolledAt: U,
          lastSkippedAt: R.lastSkippedAt || "",
          issueCount: Number(I.issueCount) || 0,
          reason: I.reason || "alert_sent"
        }) : this.#r(R, U, I.reason || "no_alerts", {
          lastPolledAt: U,
          lastSuccessAt: R.lastSuccessAt || "",
          issueCount: Number(I.issueCount) || 0
        });
      } catch (I) {
        b.status = this.#e(b.status);
        const U = A();
        b.alerts = this.#c(R, U, I?.message || String(I), { lastPolledAt: U }), this.logger.error("Scheduled Alert Error: ", I);
      }
    } catch (C) {
      b.status = "failed", b.lastErrorAt = A(), b.lastError = C?.message || String(C), this.logger.error("Scheduled Task Error: ", C);
    } finally {
      y.active = !1, await S;
      const C = A();
      b.lastFinishedAt = C, b.status === "success" && (b.lastSuccessAt = C);
      const N = y.lostReason ? !1 : await m(this.service.releaseScheduledLease(o, f, { backend: g }), "release_lease", { backend: g }, !1);
      b.lock = this.#l(y, C, N), await m(this.service.patchOpsStatus(e, { scheduled: b }), "patch_final_status", {
        finishedAt: C,
        finalStatus: b.status,
        leaseLostReason: y.lostReason || ""
      }, null);
    }
  }
};
function kg(n = {}, e = {}) {
  return {
    sanitizeHeaders(t) {
      if (!t || typeof t != "object" || Array.isArray(t)) return {};
      const r = {};
      for (const [a, o] of Object.entries(t)) {
        const s = String(a || "").trim();
        s && (Ta.has(s.toLowerCase()) || (r[s] = String(o ?? "")));
      }
      return r;
    },
    normalizeTargets(t) {
      const r = String(t || "").split(",").map((o) => o.trim()).filter(Boolean);
      if (!r.length) return null;
      const a = [];
      for (const o of r) {
        const s = Ns(o);
        if (!s) return null;
        a.push(s);
      }
      return a.length ? a.join(",") : null;
    },
    normalizeSingleTarget(t) {
      const r = e.normalizeTargets(t);
      if (!r) return null;
      const [a] = r.split(",").map((o) => o.trim()).filter(Boolean);
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
      return Ns(t, r, a);
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
      const o = String(e.normalizeTargets(r) || "").split(",").map((u) => u.trim()).filter(Boolean), s = e.normalizeTargetPort(a), i = s === null ? "" : s, c = Array.isArray(t) && t.length ? t : o.map((u, f) => ({
        id: `line-${f + 1}`,
        name: e.buildDefaultLineName(f),
        target: u
      }));
      if (!c.length) return [];
      const l = [], d = /* @__PURE__ */ new Set();
      return c.forEach((u, f) => {
        const m = u && typeof u == "object" && !Array.isArray(u) ? u : { target: u };
        let p = e.normalizeSingleTarget(e.buildTargetWithPort(m?.target, m?.port, i));
        if (!p && o[f] && (p = e.normalizeSingleTarget(e.buildTargetWithPort(o[f], m?.port, i))), !p) return;
        const h = e.normalizeLineId(m?.id, f);
        let g = h, y = 2;
        for (; d.has(g); )
          g = `${h}-${y}`, y += 1;
        d.add(g), l.push({
          id: g,
          name: String(m?.name || "").trim() || e.buildDefaultLineName(f),
          target: p
        });
      }), l;
    },
    resolveActiveLineId(t, r, a = [], o = "") {
      if (!Array.isArray(r) || !r.length) return "";
      const s = String(t || "").trim();
      if (s && r.some((i) => i.id === s)) return s;
      if (Array.isArray(a)) for (const i of a) {
        if (!i || typeof i != "object" || Array.isArray(i) || i.enabled !== !0) continue;
        const c = String(i.id || "").trim();
        if (c && r.some((u) => u.id === c)) return c;
        const l = e.normalizeSingleTarget(e.buildTargetWithPort(i.target, i.port, o));
        if (!l) continue;
        const d = r.find((u) => u.target === l);
        if (d) return d.id;
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
      return r.find((o) => o.id === a) || r[0];
    },
    getOrderedNodeLines(t) {
      const r = Array.isArray(t?.lines) ? t.lines.slice() : [];
      if (r.length <= 1) return r;
      const a = e.getActiveNodeLine(t);
      return a ? [a, ...r.filter((o) => o.id !== a.id)] : r;
    },
    sortNodeLinesByLatency(t = []) {
      return (Array.isArray(t) ? t : []).map((r, a) => ({
        line: r,
        index: a
      })).sort((r, a) => {
        const o = Number.isFinite(r.line?.latencyMs) ? r.line.latencyMs : Number.POSITIVE_INFINITY, s = Number.isFinite(a.line?.latencyMs) ? a.line.latencyMs : Number.POSITIVE_INFINITY;
        return o !== s ? o - s : r.index - a.index;
      }).map((r) => r.line);
    },
    isPingCacheFresh(t, r) {
      const a = Number(t?.latencyMs), o = Date.parse(String(t?.latencyUpdatedAt || ""));
      if (!Number.isFinite(a) || !Number.isFinite(o)) return !1;
      const s = Math.max(0, Number(r) || 0) * 60 * 1e3;
      return s <= 0 ? !1 : $() - o < s;
    }
  };
}
function Wn(n = "") {
  const e = String(n || "").trim().toLowerCase();
  return e.startsWith("emby ") ? "emby" : e.startsWith("mediabrowser ") ? "mediabrowser" : "";
}
function Hg(n = "", e = "") {
  const t = String(n || "").trim();
  if (!t) return "";
  const r = t.replace(/^[^\s]+\s+/i, "").trim();
  return r ? e === "emby" ? `Emby ${r}` : e === "mediabrowser" ? `MediaBrowser ${r}` : t : t;
}
function cs(n = "") {
  const e = String(n || "").trim();
  if (!e) return {};
  const t = e.replace(/^[^\s]+\s+/i, "").trim();
  if (!t || !t.includes("=")) return {};
  const r = {}, a = /([A-Za-z][A-Za-z0-9_-]*)\s*=\s*(?:"([^"]*)"|([^,]+))/g;
  let o;
  for (; (o = a.exec(t)) !== null; ) {
    const s = String(o[1] || "").trim().toLowerCase(), i = String(o[2] !== void 0 ? o[2] : o[3] || "").trim();
    !s || !i || Object.prototype.hasOwnProperty.call(r, s) || (r[s] = i);
  }
  return r;
}
var $g = /* @__PURE__ */ new Set([
  "apikey",
  "accesstoken",
  "token",
  "authorization",
  "xembytoken",
  "xembyauthorization",
  "xmediabrowsertoken",
  "xmediabrowserauthorization"
]), Ml = /* @__PURE__ */ new Set([
  "deviceid",
  "xembydeviceid",
  "xmediabrowserdeviceid"
]);
function Bg(n, e) {
  const t = n instanceof URL ? n : null;
  if (!t || !(e instanceof Set)) return !1;
  for (const r of t.searchParams.keys()) if (e.has($a(r))) return !0;
  return !1;
}
function He(n, e = "") {
  if (n instanceof Headers) return n.get(e) || "";
  const t = String(e || "").trim().toLowerCase();
  for (const [r, a] of Mn(n))
    if (String(r || "").trim().toLowerCase() === t)
      return String(a ?? "");
  return "";
}
function Kg(n = "") {
  const e = String(n ?? "").replace(/[\r\n]+/g, " ").trim();
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
function zg(n) {
  const e = new Headers();
  for (const [t, r] of Mn(n)) {
    const a = String(t || "").trim();
    if (!a) continue;
    const o = String(r ?? "");
    try {
      e.set(a, o);
    } catch {
      const s = Kg(o);
      if (!s) continue;
      try {
        e.set(a, s);
      } catch {
      }
    }
  }
  return e;
}
function ls(n) {
  const e = {
    token: "",
    deviceId: ""
  };
  for (const t of ["X-Emby-Token", "X-MediaBrowser-Token"]) {
    const r = He(n, t).trim();
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
    const r = He(n, t).trim();
    if (!r) continue;
    const a = cs(r);
    if (!e.token && a.token && (e.token = a.token), !e.deviceId && a.deviceid && (e.deviceId = a.deviceid), !e.token) {
      const o = /^Bearer\s+(.+)$/i.exec(r);
      o?.[1] && (e.token = o[1].trim());
    }
  }
  if (!e.deviceId) for (const t of ["X-Emby-Device-Id"]) {
    const r = He(n, t).trim();
    if (r) {
      e.deviceId = r;
      break;
    }
  }
  return e;
}
function Wg(n = "") {
  const e = String(n || "").trim();
  if (!e || /^Bearer\s+.+$/i.test(e)) return !0;
  const t = cs(e);
  return !!String(t.token || "").trim();
}
function ra(n) {
  const e = ls(n), t = [], r = [], a = is(He(n, "Cookie"), Aa);
  if (a) {
    for (const u of Ma(a).keys())
      if (hg(u)) {
        r.push("cookie");
        break;
      }
  }
  for (const u of yl) {
    const f = He(n, u).trim();
    f && (Wg(f) || t.push(u));
  }
  for (const [u, f] of Mn(n)) {
    const m = String(u || "").trim().toLowerCase(), p = String(f || "").trim();
    !m || !p || bl(m) && t.push(m);
  }
  const o = [...new Set(t)], s = [...new Set(r)], i = !!String(e.token || "").trim() || !!String(e.deviceId || "").trim(), c = o.length > 0, l = s.length > 0, d = !c && !l;
  return {
    canDirect: d,
    reason: d ? "" : "direct_transport_incompatible",
    headerAuthHeaders: o,
    cookieAuthHeaders: s,
    hasQueryAuth: i,
    hasHeaderAuth: c,
    hasCookieAuth: l,
    auth: e
  };
}
function mn(n, e, t = "") {
  const r = n instanceof URL ? new URL(n.toString()) : new URL(String(n || "")), a = (e && typeof e == "object" && "auth" in e ? e : { auth: ls(e) }).auth || {}, o = Gt(t), s = o === "jellyfin" ? ["ApiKey"] : o === "emby" ? ["api_key"] : ["api_key", "ApiKey"];
  if (a.token)
    for (const i of s) r.searchParams.has(i) || r.searchParams.set(i, a.token);
  return a.deviceId && !Bg(r, Ml) && r.searchParams.set("DeviceId", a.deviceId), r;
}
function Gg(n, e = "") {
  const t = String(e || "").trim().replace(/["\\]/g, "");
  return t ? `${n === "emby" ? "Emby" : "MediaBrowser"} Token="${t}"` : "";
}
var Vg = [
  "api_key",
  "ApiKey",
  "X-Emby-Token",
  "X-MediaBrowser-Token"
];
function jg(n = "") {
  for (const e of n) {
    const t = e.codePointAt(0);
    if (t < 32 || t > 255) return !1;
  }
  return !0;
}
function qg(n) {
  if (!(n instanceof URL)) return "";
  for (const e of Vg) {
    const t = String(n.searchParams.get(e) || "").trim();
    if (t && jg(t)) return t;
  }
  return "";
}
function di(n, e = "auto", t = "") {
  const r = Gt(e);
  if (r === "passthrough") return n;
  const a = n.get("Authorization")?.trim() || "", o = n.get("X-Emby-Authorization")?.trim() || "", s = n.get("X-MediaBrowser-Authorization")?.trim() || "", i = Wn(a), c = Wn(s), l = Wn(o), d = r === "emby" ? "emby" : r === "jellyfin" ? "mediabrowser" : "", u = d || "mediabrowser";
  let f = i ? a : c ? s : l ? o : "";
  const m = He(n, "X-Emby-Token").trim() || He(n, "X-MediaBrowser-Token").trim() || He(n, "X-Emby-Auth-Token").trim() || He(n, "X-MediaBrowser-Auth-Token").trim();
  if (f) {
    if (!cs(f).token) {
      const h = m || String(t || "").trim();
      if (h) {
        const g = h.replace(/["\\]/g, "");
        f = `${f.replace(/,\s*$/, "")}, Token="${g}"`;
      }
    }
  } else {
    const h = /^Bearer\s+(.+)$/i.exec(a);
    f = Gg(u, m || (h ? h[1] : "") || String(t || "").trim());
  }
  if (!f) return n;
  const p = i || c || l || "";
  return f = Hg(f, d || (p === "emby" ? "mediabrowser" : p)), n.set("Authorization", f), n.set("X-Emby-Authorization", f), n.delete("X-MediaBrowser-Authorization"), n;
}
function fi(n, e = {}) {
  if (!(n instanceof Headers)) return n;
  const t = e.dropTokenHeaders !== !1;
  return [
    "Authorization",
    "X-Emby-Authorization",
    "X-MediaBrowser-Authorization"
  ].forEach((r) => n.delete(r)), t && [
    "X-Emby-Token",
    "X-MediaBrowser-Token",
    "X-Emby-Auth-Token",
    "X-MediaBrowser-Auth-Token"
  ].forEach((r) => n.delete(r)), n;
}
function Xg() {
  const n = {};
  for (const e of ["direct", "proxy"]) {
    n[e] = {};
    for (const t of [
      "none",
      "query",
      "header",
      "cookie"
    ]) {
      n[e][t] = {};
      for (const r of [
        "none",
        "same_origin",
        "external"
      ]) n[e][t][r] = {
        deliveryMode: e,
        authCarrier: t,
        redirectScope: r,
        clientVisibleRedirect: e === "direct" && r !== "none",
        workerFollowRedirect: e === "proxy",
        reasonCode: e === "direct" ? r === "none" ? "entry_direct" : "client_redirect" : "worker_follow_redirect"
      };
    }
  }
  return Object.freeze(n);
}
var Yg = Xg();
function mi(n = {}) {
  const e = n && typeof n == "object" ? n : null, t = String(n?.corsOrigins || ""), r = String(n?.ipBlacklist || ""), a = String(n?.geoAllowlist || ""), o = String(n?.geoBlocklist || ""), s = e ? ee.ProxyAccessRuleProfileCache.get(e) : null;
  if (s && s.corsOriginsRaw === t && s.ipBlacklistRaw === r && s.geoAllowlistRaw === a && s.geoBlocklistRaw === o) return s;
  const i = (d, u = !1) => {
    const f = [], m = /* @__PURE__ */ new Set();
    for (const p of d.split(",")) {
      const h = p.trim(), g = u ? h.toUpperCase() : h;
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
    geoBlocklistRaw: o,
    corsOrigins: c.values,
    corsOriginSet: c.valueSet,
    ipBlacklist: i(r).valueSet,
    geoAllowlist: i(a, !0).valueSet,
    geoBlocklist: i(o, !0).valueSet
  };
  return e && ee.ProxyAccessRuleProfileCache.set(e, l), l;
}
function Jg(n = {}, e = {}) {
  const { persistCloudflareDnsRecordsForHost: t } = n;
  return {
    normalizeNode(r, a, o = {}) {
      const s = { ...a };
      let i = !1;
      const c = e.normalizeTargetPort(s.port), l = e.normalizeLines(s.lines, s.target, c || ""), d = e.resolveActiveLineId(s.activeLineId, l, Array.isArray(s.lines) ? s.lines : [], c || ""), u = e.buildLegacyTargetFromLines(l);
      JSON.stringify(l) !== JSON.stringify(Array.isArray(s.lines) ? s.lines : []) && (i = !0), String(s.activeLineId || "") !== d && (i = !0), String(s.target || "") !== u && (i = !0), s.lines = l, s.activeLineId = d, s.target = u, Object.prototype.hasOwnProperty.call(s, "port") && (delete s.port, i = !0), s.secret === void 0 && (s.secret = "", i = !0);
      const f = Vr(s.tags, s.tag), m = f[0] || "";
      JSON.stringify(f) !== JSON.stringify(Array.isArray(s.tags) ? s.tags : []) && (i = !0), String(s.tag || "") !== m && (i = !0), s.tags = f, s.tag = m;
      const p = [["server", "Record"].join(""), ["media", "Aggregation"].join("")];
      for (const E of Object.keys(s).filter((w) => p.some((R) => w.startsWith(R))))
        delete s[E], i = !0;
      s.remark === void 0 && (s.remark = "", i = !0), s.tagColor === void 0 && (s.tagColor = "", i = !0), s.remarkColor === void 0 && (s.remarkColor = "", i = !0), s.displayName === void 0 && (s.displayName = "", i = !0);
      const h = s.tmdbAggregationEnabled === !0;
      s.tmdbAggregationEnabled !== h && (i = !0), s.tmdbAggregationEnabled = h;
      const g = Or(s.aggregationMode);
      s.aggregationMode !== g && (i = !0), s.aggregationMode = g;
      const y = ir(s.entryMode);
      String(s.entryMode || "") !== y && (i = !0), s.entryMode = y, y === "host_prefix" && String(s.secret ?? "") !== "" && (s.secret = "", i = !0);
      const _ = y === "host_prefix" ? Xt(s.hostPrefixCnameTarget) : "";
      String(s.hostPrefixCnameTarget || "") !== _ && (i = !0), s.hostPrefixCnameTarget = _;
      const S = xr(s.playbackInfoMode);
      String(s.playbackInfoMode || "") !== S && (i = !0), s.playbackInfoMode = S;
      const T = Gt(s.mediaAuthMode);
      String(s.mediaAuthMode || "") !== T && (i = !0), s.mediaAuthMode = T;
      const b = Pr(s.realClientIpMode);
      String(s.realClientIpMode || "") !== b && (i = !0), s.realClientIpMode = b;
      const A = ga(s.hedgeProbePath);
      String(s.hedgeProbePath || "") !== A && (i = !0), s.hedgeProbePath = A;
      const C = Gr(s);
      String(s.mainVideoStreamMode || "") !== C && (i = !0), s.mainVideoStreamMode = C;
      const N = kr(s.routingDecisionMode);
      if (String(s.routingDecisionMode || "") !== N && (i = !0), s.routingDecisionMode = N, Object.prototype.hasOwnProperty.call(s, "wangpanDirectMode") && (delete s.wangpanDirectMode, i = !0), Object.prototype.hasOwnProperty.call(s, "wangpanMode") && (delete s.wangpanMode, i = !0), o && typeof o == "object" && "dropLegacyDirectRouting" in o && o.dropLegacyDirectRouting === !0) for (const E of [...Vo, ...jo])
        Object.prototype.hasOwnProperty.call(s, E) && (delete s[E], i = !0);
      const P = e.sanitizeHeaders(s.headers);
      return JSON.stringify(P) !== JSON.stringify(s.headers || {}) && (i = !0), s.headers = P, delete s.videoThrottling, delete s.interceptMs, s.schemaVersion !== 6 && (s.schemaVersion = 6, i = !0), Object.prototype.hasOwnProperty.call(s, "createdAt") && (delete s.createdAt, i = !0), Object.prototype.hasOwnProperty.call(s, "updatedAt") && (delete s.updatedAt, i = !0), {
        data: s,
        changed: i
      };
    },
    buildComparableNodePayload(r = {}, a = {}) {
      if (!k(r)) return null;
      const o = { ...r };
      a.includeName !== !0 && delete o.name, delete o.createdAt, delete o.updatedAt;
      const s = (i) => {
        if (Array.isArray(i)) return i.map((c) => s(c));
        if (k(i)) {
          const c = {};
          for (const l of Object.keys(i).sort()) c[l] = s(i[l]);
          return c;
        }
        return i;
      };
      return s(o);
    },
    areNodePayloadsEquivalent(r = {}, a = {}, o = {}) {
      const s = e.buildComparableNodePayload(r, o), i = e.buildComparableNodePayload(a, o);
      return ae(s) === ae(i);
    },
    buildNodeRecord(r, a, o = {}) {
      let s = a?.headers !== void 0 ? a.headers : o.headers;
      if (typeof s == "string") try {
        s = JSON.parse(s);
      } catch {
        s = {};
      }
      const i = {};
      for (const p of ["proxyMode", "mode"]) {
        const h = a?.[p] !== void 0 ? a[p] : o[p];
        h !== void 0 && (i[p] = String(h || "").trim());
      }
      for (const p of [
        "direct",
        "sourceDirect",
        "directSource",
        "direct2xx"
      ]) a?.[p] !== void 0 ? i[p] = a[p] === !0 : o[p] !== void 0 && (i[p] = o[p] === !0);
      const c = Array.isArray(a?.lines) ? a.lines : a?.target !== void 0 ? [] : o.lines, l = a?.target !== void 0 ? a.target : o.target, d = a?.port !== void 0 ? a.port : o.port, u = e.normalizeLines(c, l, d);
      if (!u.length) return null;
      const f = e.resolveActiveLineId(a?.activeLineId !== void 0 ? a.activeLineId : o.activeLineId, u, Array.isArray(a?.lines) ? a.lines : o.lines, d), m = a?.mainVideoStreamMode !== void 0 ? a.mainVideoStreamMode : a?.wangpanDirectMode !== void 0 ? a.wangpanDirectMode : a?.wangpanMode;
      return e.normalizeNode(r, {
        target: e.buildLegacyTargetFromLines(u),
        lines: u,
        activeLineId: f,
        ...i,
        entryMode: a?.entryMode !== void 0 ? ir(a.entryMode) : ir(o.entryMode),
        hostPrefixCnameTarget: a?.hostPrefixCnameTarget !== void 0 ? a.hostPrefixCnameTarget : o.hostPrefixCnameTarget,
        secret: a?.secret !== void 0 ? a.secret : o.secret || "",
        tag: a?.tag !== void 0 ? a.tag : o.tag || "",
        tags: a?.tags !== void 0 ? a.tags : a?.tag !== void 0 ? [a.tag, ...Vr(o.tags, o.tag).filter((p) => p.toLowerCase() !== String(o.tag || "").trim().toLowerCase())] : o.tags,
        remark: a?.remark !== void 0 ? a.remark : o.remark || "",
        tagColor: a?.tagColor !== void 0 ? String(a.tagColor || "").trim() : o.tagColor || "",
        remarkColor: a?.remarkColor !== void 0 ? String(a.remarkColor || "").trim() : o.remarkColor || "",
        displayName: a?.displayName !== void 0 ? String(a.displayName || "").trim() : o.displayName || "",
        tmdbAggregationEnabled: a?.tmdbAggregationEnabled !== void 0 ? a.tmdbAggregationEnabled === !0 : o.tmdbAggregationEnabled === !0,
        aggregationMode: a?.aggregationMode !== void 0 ? Or(a.aggregationMode) : Or(o.aggregationMode),
        playbackInfoMode: a?.playbackInfoMode !== void 0 ? xr(a.playbackInfoMode) : xr(o.playbackInfoMode),
        mediaAuthMode: a?.mediaAuthMode !== void 0 ? Gt(a.mediaAuthMode) : Gt(o.mediaAuthMode),
        realClientIpMode: a?.realClientIpMode !== void 0 ? Pr(a.realClientIpMode) : Pr(o.realClientIpMode),
        hedgeProbePath: a?.hedgeProbePath !== void 0 ? ga(a.hedgeProbePath) : ga(o.hedgeProbePath),
        routingDecisionMode: a?.routingDecisionMode !== void 0 ? kr(a.routingDecisionMode) : kr(o.routingDecisionMode),
        mainVideoStreamMode: m !== void 0 ? En(m) : Gr(o),
        headers: e.sanitizeHeaders(s),
        schemaVersion: 6
      }).data;
    },
    buildHostPrefixDnsRecordHost(r = "", a = "") {
      const o = String(r || "").trim().toLowerCase(), s = oe(a);
      return !s || !Fa(o) ? "" : `${o}.${s}`;
    },
    buildHostPrefixDnsSyncPlan(r = "", a = null, o = "", s = null, i = "", c = {}) {
      const l = oe(i), d = a && et(a?.entryMode) ? e.buildHostPrefixDnsRecordHost(r, l) : "", u = s && et(s?.entryMode) ? e.buildHostPrefixDnsRecordHost(o, l) : "", f = d ? tn(a, c.previousConfig || c.config || {}, l) : "", m = u ? tn(s, c.nextConfig || c.config || {}, l) : "", p = [], h = [];
      return d && d !== u && p.push({
        type: "delete",
        host: d
      }), u && (c.forceUpsert === !0 || u !== d || m !== f) && p.push({
        type: "upsert",
        host: u,
        cnameTarget: m
      }), u && u !== d && h.push({
        type: "delete",
        host: u
      }), d && d !== u ? h.push({
        type: "upsert",
        host: d,
        cnameTarget: f
      }) : d && m !== f && h.push({
        type: "upsert",
        host: d,
        cnameTarget: f
      }), {
        hostRoot: l,
        previousDnsHost: d,
        nextDnsHost: u,
        previousCnameTarget: f,
        nextCnameTarget: m,
        steps: p,
        rollbackSteps: h,
        changed: p.length > 0
      };
    },
    buildPreparedNodeMutation(r = {}, a = {}, o = {}) {
      const s = String(o.nextName || r?.name || "").trim().toLowerCase();
      if (!s) return null;
      const i = String(o.previousName || r?.originalName || s).trim().toLowerCase() || s, c = e.buildNodeRecord(s, r, a);
      if (!c) return null;
      const l = k(a) && Object.keys(a).length ? e.normalizeNode(i, a || {}).data : null, d = i !== s, u = !d && !!l && e.areNodePayloadsEquivalent(l, c);
      return {
        previousName: i,
        previousNode: l,
        nextName: s,
        nextNode: c,
        isRename: d,
        nodeChanged: d || !u,
        isSemanticNoop: u,
        dnsPlan: null
      };
    },
    async upsertHostPrefixDnsRecord(r = "", a = {}) {
      const o = oe(r);
      if (!o) return null;
      const s = a.config || await we(a.env), i = pa(s, a.env), c = Xt(a.cnameTarget) || oe(i.host);
      return await t({
        env: a.env,
        kv: a.kv,
        config: s,
        host: o,
        mode: "cname",
        desiredRecords: [{
          type: "CNAME",
          content: c,
          ttl: 1,
          proxied: !1
        }],
        requestHost: oe(a.requestHost || i.host),
        skipHistory: a.skipHistory === !0,
        includeAllRecords: !1
      });
    },
    async deleteHostPrefixDnsRecord(r = "", a = {}) {
      const o = oe(r);
      if (!o) return null;
      const s = pa(a.config || await we(a.env), a.env), i = String(s.cfZoneId || "").trim(), c = String(s.cfApiToken || "").trim(), l = await Qo(i, c, { scope: "node.host_prefix_dns_delete.zone_lookup" }), d = String(l?.name || "").trim();
      if (d && !Ea(o, d)) throw Ie("INVALID_HOST", "当前子域不在 Cloudflare Zone 下", 400, {
        host: o,
        zoneName: d
      });
      const u = (await $r(i, c, { nameExact: o })).filter((m) => oe(m?.name) === o && String(m?.type || "").trim().toUpperCase() === "CNAME");
      if (!u.length) return {
        ok: !0,
        deletedCount: 0,
        host: o
      };
      const f = rl(i, c, o, `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(i)}/dns_records`, u[0] || {
        name: o,
        ttl: 1,
        proxied: !1
      });
      for (const m of u) await f.deleteRecord(m);
      return {
        ok: !0,
        deletedCount: u.length,
        host: o
      };
    },
    async persistHostPrefixDnsSyncPlan(r = {}, a = {}) {
      const o = Array.isArray(r?.steps) ? r.steps : [];
      if (!o.length) return null;
      pa(a.config || await we(a.env), a.env);
      for (const s of o) {
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
        stepCount: o.length
      };
    },
    async applyPreparedNodeMutation(r = {}, a = {}) {
      const o = a.kv;
      if (!o || r?.nodeChanged !== !0) return !1;
      const s = String(r?.previousName || "").trim().toLowerCase(), i = String(r?.nextName || "").trim().toLowerCase();
      return r?.nextNode ? await o.put(`${e.PREFIX}${i}`, JSON.stringify(r.nextNode)) : i && await o.delete(`${e.PREFIX}${i}`), s && i && s !== i && await o.delete(`${e.PREFIX}${s}`), e.invalidateNodeCaches([s, i], {
        invalidateList: !0,
        kv: o
      }), !0;
    },
    async rollbackPreparedNodeMutation(r = {}, a = {}) {
      const o = a.kv;
      if (!o || r?.nodeChanged !== !0) return !1;
      const s = String(r?.previousName || "").trim().toLowerCase(), i = String(r?.nextName || "").trim().toLowerCase();
      return s && (r?.previousNode ? await o.put(`${e.PREFIX}${s}`, JSON.stringify(r.previousNode)) : await o.delete(`${e.PREFIX}${s}`)), i && i !== s && await o.delete(`${e.PREFIX}${i}`), e.invalidateNodeCaches([s, i], {
        invalidateList: !0,
        kv: o
      }), !0;
    },
    async rollbackPreparedNodeMutations(r = [], a = {}) {
      const o = a.kv;
      if (!o) return { rolledBackNodeCount: 0 };
      const s = (Array.isArray(r) ? r : []).filter(Boolean);
      if (!s.length) return { rolledBackNodeCount: 0 };
      const i = s.some((d) => d?.dnsPlan?.changed === !0) ? a.config || await we(a.env) : null;
      let c = 0;
      const l = [];
      for (let d = s.length - 1; d >= 0; d -= 1) {
        const u = s[d];
        if (u?.dnsPlan?.changed === !0) try {
          await e.persistHostPrefixDnsSyncPlan({ steps: u?.dnsPlan?.rollbackSteps || [] }, {
            ...a,
            config: i,
            skipHistory: !0
          });
        } catch (f) {
          l.push(`dns:${ue(f, "rollback_failed")}`);
        }
        if (u?.nodeChanged === !0) try {
          await e.rollbackPreparedNodeMutation(u, a), c += 1;
        } catch (f) {
          l.push(`node:${ue(f, "rollback_failed")}`);
        }
      }
      if (a.rebuildIndexes === !0) try {
        await e.rebuildNodeIndexesFromKv(o, {
          ctx: a.ctx,
          syncLegacyIndex: !0
        });
      } catch (d) {
        l.push(`rebuild_indexes:${ue(d, "rollback_failed")}`);
      }
      if (l.length > 0) throw new Error(l.join("; "));
      return { rolledBackNodeCount: c };
    },
    async applyPreparedNodeMutations(r = [], a = {}) {
      if (!a.kv) return { mutatedNodeCount: 0 };
      const o = (Array.isArray(r) ? r : []).filter(Boolean);
      if (!o.length) return { mutatedNodeCount: 0 };
      const s = o.some((f) => f?.dnsPlan?.changed === !0) ? await we(a.env) : null;
      let i = 0;
      const c = [];
      let l = !1, d = !0, u = "";
      try {
        for (const f of o)
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
          d = !1, u = ue(m, "rollback_failed");
        }
        throw f && typeof f == "object" && (String(f.code || "").trim() || (f.code = "NODE_MUTATION_FAILED"), f.status = xe(f.status, 500), f.details = {
          ...k(f.details) ? f.details : {},
          rollbackAttempted: l,
          rollbackSucceeded: d,
          rollbackError: u
        }), f;
      }
    }
  };
}
function Qg(n = {}, e = {}) {
  return {
    async pingTarget(t, r, a = {}) {
      const o = $(), s = "GET", i = (f = {}) => ({
        ok: f.ok === !0,
        reason: String(f.reason || "network_error"),
        statusCode: Number.isInteger(f.statusCode) ? f.statusCode : null,
        elapsedMs: Number.isFinite(f.elapsedMs) ? Math.max(0, Math.round(f.elapsedMs)) : Math.max(0, $() - o),
        methodUsed: f.methodUsed === "HEAD" || f.methodUsed === "GET" ? f.methodUsed : null,
        probePath: String(f.probePath || Ss)
      }), c = Ua(String(t || "").trim());
      if (!c) return i({ reason: "invalid_target" });
      let l = null, d = null;
      const u = dl(c, [Ss, nd]);
      if (!u.length) return i({ reason: "invalid_target" });
      for (const { probePath: f, probeUrl: m } of u) {
        const p = $(), h = new AbortController();
        let g = !1;
        const y = setTimeout(() => {
          g = !0, h.abort();
        }, r);
        let _ = null;
        try {
          const S = await ze(m.toString(), {
            method: s,
            headers: ko(a?.userAgent),
            signal: h.signal
          }), T = Number(S.status);
          try {
            S.body?.cancel?.();
          } catch {
          }
          const b = T >= 200 && T < 400;
          _ = {
            ok: b,
            reason: b ? T < 300 ? "ok" : "redirect" : "http_error",
            statusCode: T,
            methodUsed: s
          };
        } catch (S) {
          const T = [
            S?.name,
            S?.message,
            S?.cause?.name,
            S?.cause?.message
          ].map((A) => String(A || "")).join(" "), b = /\b(?:tls|ssl|x509|certificate|handshake)\b/i.test(T);
          _ = {
            ok: !1,
            reason: g ? "timeout" : b ? "tls_error" : "network_error",
            statusCode: null,
            methodUsed: s
          };
        } finally {
          clearTimeout(y);
        }
        if (_.probePath = f, _.elapsedMs = $() - p, _.ok) return i(_);
        if (_.statusCode === 403) {
          l || (l = _);
          continue;
        }
        if (d = _, _.statusCode === null) break;
      }
      return i(l ? {
        ...l,
        ok: !0,
        reason: "ok"
      } : d || { reason: "network_error" });
    },
    async getNode(t, r, a) {
      t = String(t).toLowerCase();
      const o = e.getKV(r);
      if (!o) return null;
      const s = be(o), i = Oe(t, s), c = s.NodeCache.get(t);
      if (c && c.exp > Date.now()) {
        const d = await e.getNodesRevision(o), u = String(c?.nodesRevision || "").trim();
        if (Oe(t, s) === i && (!u || !d || u === d))
          return dn(s.NodeCache, t), c.data;
        Oe(t, s) === i && s.NodeCache.delete(t);
      }
      const l = Oe(t, s);
      return await Cn(s.SingleFlightTasks, Ye([
        "proxy_node",
        t,
        l
      ]), async () => {
        try {
          const d = await o.get(`${e.PREFIX}${t}`, { type: "json" });
          if (Oe(t, s) !== l) return null;
          if (!d) {
            const h = await e.getNodesSummaryIndex(o, { ctx: a });
            if (Array.isArray(h)) if (h.some((g) => String(g?.name || "").toLowerCase().trim() === t)) {
              const g = e.rebuildNodeIndexesFromKv(o, { ctx: a });
              a ? a.waitUntil(g) : await g;
            } else {
              const g = await e.getNodesRevision(o);
              Oe(t, s) === l && Ne(s.NodeCache, t, {
                data: null,
                exp: Date.now() + B.Defaults.NodeMissCacheTtlMs,
                nodesRevision: g
              }, B.Defaults.NodeCacheMax);
            }
            return null;
          }
          const { data: u, changed: f } = e.normalizeNode(t, d);
          if (rt(t, u))
            return s.NodeCache.delete(t), s.PlaybackRouteHotCache.delete(t), u;
          if (f) {
            const h = o.put(`${e.PREFIX}${t}`, JSON.stringify(u));
            a ? a.waitUntil(h) : await h;
          }
          const m = e.upsertNodeSummaryEntry(t, u, {
            kv: o,
            ctx: a
          });
          let p = await e.getNodesRevision(o);
          return p ? a ? a.waitUntil(m) : await m : (await m, p = await e.getNodesRevision(o)), Oe(t, s) !== l ? null : (Ne(s.NodeCache, t, {
            data: u,
            exp: Date.now() + B.Defaults.CacheTTL,
            nodesRevision: p
          }, B.Defaults.NodeCacheMax), u);
        } catch {
          return null;
        }
      });
    },
    async getNodeForRead(t, r) {
      t = String(t).toLowerCase();
      const a = e.getKV(r);
      if (!a) return null;
      const o = be(a), s = Oe(t, o), i = o.NodeCache.get(t);
      if (i?.data === null) o.NodeCache.delete(t);
      else if (i && i.exp > Date.now()) {
        const l = await e.getNodesRevision(a), d = String(i?.nodesRevision || "").trim();
        if (Oe(t, o) === s && (!d || !l || d === l))
          return dn(o.NodeCache, t), i.data;
        Oe(t, o) === s && o.NodeCache.delete(t);
      }
      const c = Oe(t, o);
      try {
        const l = await a.get(`${e.PREFIX}${t}`, { type: "json" });
        if (Oe(t, o) !== c || !l) return null;
        const d = e.normalizeNode(t, l).data;
        if (rt(t, d))
          return o.NodeCache.delete(t), o.PlaybackRouteHotCache.delete(t), d;
        const u = await e.getNodesRevision(a);
        return Oe(t, o) !== c ? null : (Ne(o.NodeCache, t, {
          data: d,
          exp: Date.now() + B.Defaults.CacheTTL,
          nodesRevision: u
        }, B.Defaults.NodeCacheMax), d);
      } catch {
        return null;
      }
    },
    normalizeAdminActionRequest(t) {
      if (!t || typeof t != "object" || Array.isArray(t)) return null;
      const r = t.payload && typeof t.payload == "object" && !Array.isArray(t.payload) ? { ...t.payload } : null, a = String(t.action ?? r?.action ?? "").trim(), o = t.meta && typeof t.meta == "object" && !Array.isArray(t.meta) ? { ...t.meta } : {};
      return {
        action: a,
        data: r ? {
          ...r,
          action: a,
          meta: o
        } : {
          ...t,
          action: a,
          meta: o
        },
        meta: o
      };
    }
  };
}
function Zg(n = {}, e = {}) {
  return {
    ...kg(n, e),
    ...Jg(n, e),
    ...Qg(n, e)
  };
}
var Gn = "proxy_logs_fts";
function eh(n = {}) {
  const e = {
    buildResponse(t = {}) {
      return ne(t);
    },
    buildRange(t, r) {
      return {
        startDate: new Date(t).toISOString(),
        endDate: new Date(r).toISOString()
      };
    },
    normalizeRequest(t = {}) {
      const { page: r = 1, pageSize: a = 50, filters: o = {} } = t, s = Math.max(1, parseInt(r, 10) || 1), i = Math.min(200, Math.max(1, parseInt(a, 10) || 50)), c = String(t?.paginationMode || "").trim().toLowerCase(), l = Tc(t?.pageCursor), d = c !== "offset" && (s === 1 || !!l), u = (s - 1) * i, f = Date.now(), m = B.Defaults.LogQueryDefaultDays * 24 * 60 * 60 * 1e3, p = (_) => {
        if (!_) return null;
        const S = new Date(String(_)).getTime();
        return Number.isFinite(S) ? S : null;
      }, h = (_) => {
        if (!_) return null;
        const S = /* @__PURE__ */ (/* @__PURE__ */ new Date(String(_) + "T23:59:59.999")).getTime();
        return Number.isFinite(S) ? S : null;
      };
      let g = p(o.startDate), y = h(o.endDate);
      return Number.isFinite(y) || (y = f), Number.isFinite(g) || (g = Math.max(0, y - m)), g > y && ([g, y] = [Math.max(0, y - m), y]), {
        filters: o,
        safePage: s,
        safePageSize: i,
        requestedPageCursor: l,
        useSeekPagination: d,
        offset: u,
        startTs: g,
        endTs: y
      };
    },
    resolveSearch(t = {}, r = {}, a = {}) {
      const o = String(t.searchMode || "").trim().toLowerCase(), s = o === "fts" || o === "like";
      let i = bc(t.searchMode || r.logSearchMode), c = "";
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
    buildDisabledResponse(t = {}, r = {}, a = "", o = "") {
      return e.buildResponse(e.buildBasePayload(t, r, {
        logs: [],
        total: 0,
        totalPages: 1,
        searchMode: a,
        effectiveSearchMode: a,
        searchFallbackReason: o,
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
    buildSqlPlan(t = {}, r = {}, a = {}, o = "") {
      const { startTs: s, endTs: i } = r, c = e.buildDisplayState(a), l = gf(t.requestGroup), d = hf(t.statusGroup), u = ["proxy_logs.timestamp >= ?", "proxy_logs.timestamp <= ?"], f = [s, i], m = (b, ...A) => {
        u.push(b), A.length > 0 && f.push(...A);
      }, p = "LOWER(proxy_logs.request_path)", h = String(t.keyword || "").trim();
      let g = !1;
      if (h) {
        const b = B.Defaults.LogKeywordMaxWindowDays * 24 * 60 * 60 * 1e3;
        if (i - s > b) return { errorResponse: z("LOG_QUERY_RANGE_TOO_WIDE", `关键词搜索必须限制在 ${B.Defaults.LogKeywordMaxWindowDays} 天内`, 400, { maxWindowDays: B.Defaults.LogKeywordMaxWindowDays }) };
        if (/^\d{3}$/.test(h)) m("proxy_logs.status_code = ?", Number(h));
        else if (kl(h) || ds(h)) {
          const A = [], C = [];
          if (c.displayClientIp && (A.push("proxy_logs.client_ip = ?"), C.push(h)), c.displayColo) {
            const N = ds(h) ? h.toUpperCase() : h;
            A.push("COALESCE(proxy_logs.inbound_colo, proxy_logs.inbound_ip, '') = ?"), C.push(N), A.push("COALESCE(proxy_logs.outbound_colo, proxy_logs.outbound_ip, '') = ?"), C.push(N);
          }
          m(A.length ? `(${A.join(" OR ")})` : "1 = 0", ...C);
        } else if (o === "fts")
          m(`${Gn} MATCH ?`, Af(h)), g = !0;
        else {
          const A = `%${Ba(h)}%`;
          if (Fe(A) > _s) return { errorResponse: z("LOG_QUERY_KEYWORD_TOO_LONG", "LIKE 搜索关键词过长", 400, { maxPatternBytes: _s }) };
          const C = [
            "proxy_logs.node_name LIKE ? ESCAPE '\\'",
            "proxy_logs.request_path LIKE ? ESCAPE '\\'",
            "proxy_logs.detail_json LIKE ? ESCAPE '\\'"
          ];
          f.push(A, A, A), c.displayClientIp && (C.push("proxy_logs.client_ip LIKE ? ESCAPE '\\'"), f.push(A)), c.displayUa && (C.push("proxy_logs.user_agent LIKE ? ESCAPE '\\'"), f.push(A)), C.push("proxy_logs.error_detail LIKE ? ESCAPE '\\'"), f.push(A), m(`(${C.join(" OR ")})`);
        }
      }
      t.category && m("proxy_logs.category = ?", String(t.category)), l === "playback_info" ? (m("proxy_logs.category = ?", "api"), m(`(${p} LIKE ? ESCAPE '\\' OR ${p} LIKE ? ESCAPE '\\')`, "%/playbackinfo%", "%/sessions/playing%")) : l === "image" ? m("proxy_logs.category = ?", "image") : l === "api" ? (m("proxy_logs.category = ?", "api"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/playbackinfo%"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/sessions/playing%"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/users/authenticate%")) : l === "auth" && (m("proxy_logs.category = ?", "api"), m(`${p} LIKE ? ESCAPE '\\'`, "%/users/authenticate%")), d === "4xx" ? m("proxy_logs.status_code >= ? AND proxy_logs.status_code < ?", 400, 500) : d === "5xx" && m("proxy_logs.status_code >= ? AND proxy_logs.status_code < ?", 500, 600);
      const y = Ms(t.deliveryMode || "");
      if (y) {
        const b = "LOWER(COALESCE(CAST(json_extract(proxy_logs.detail_json, '$.deliveryMode') AS TEXT), ''))", A = y === "direct" ? ["Direct=entry_307", "Redirect=client_redirect"] : [
          "Redirect=proxied_follow",
          "Flow=managed",
          "Flow=passthrough"
        ];
        m(`(
          ${b} = ?
          OR (
            COALESCE(proxy_logs.detail_json, '') = ''
            AND (${A.map(() => "proxy_logs.error_detail LIKE ? ESCAPE '\\'").join(" OR ")})
          )
        )`, y, ...A.map((C) => `%${Ba(C)}%`));
      }
      const _ = yf(t.protocolFailureReason || "");
      if (_ && m(`(
          LOWER(COALESCE(CAST(json_extract(proxy_logs.detail_json, '$.protocolFailureReason') AS TEXT), '')) = ?
          OR (
            COALESCE(proxy_logs.detail_json, '') = ''
            AND proxy_logs.error_detail LIKE ? ESCAPE '\\'
          )
        )`, _, `%${Ba(_)}%`), t.playbackMode) {
        const b = String(t.playbackMode || "").trim();
        Ms(b) || m("proxy_logs.error_detail LIKE ? ESCAPE '\\'", `%${Ba(`Playback=${b}`)}%`);
      }
      const S = g ? `FROM proxy_logs INNER JOIN ${Gn} ON ${Gn}.rowid = proxy_logs.id` : "FROM proxy_logs", T = `SELECT proxy_logs.*,
          ${c.displayClientIp ? "NULLIF(proxy_logs.client_ip, '') AS client_ip" : "NULL AS client_ip"},
          ${c.displayColo ? `COALESCE(proxy_logs.inbound_colo, proxy_logs.inbound_ip, proxy_logs.client_ip, '') AS inbound_colo,
        COALESCE(proxy_logs.outbound_colo, proxy_logs.outbound_ip, '') AS outbound_colo` : `'' AS inbound_colo,
        '' AS outbound_colo`},
          ${c.displayUa ? "proxy_logs.user_agent AS user_agent" : "NULL AS user_agent"},
          proxy_logs.detail_json AS detail_json`;
      return {
        searchMode: o,
        useFtsKeyword: g,
        whereClause: u,
        params: f,
        fromClause: S,
        selectClause: T,
        orderByClause: "ORDER BY proxy_logs.timestamp DESC, proxy_logs.id DESC"
      };
    },
    async executeSqlPlan(t, r = {}, a = {}) {
      const { safePage: o, safePageSize: s, requestedPageCursor: i, useSeekPagination: c, offset: l } = r, { whereClause: d = [], params: u = [], fromClause: f = "", selectClause: m = "", orderByClause: p = "", useFtsKeyword: h = !1, searchMode: g = "" } = a, y = "WHERE " + d.join(" AND ");
      let _ = 0, S = 1, T = o > 1, b = !1, A = null, C = [];
      try {
        if (c) {
          const N = d.slice(), P = u.slice();
          i && (N.push("(proxy_logs.timestamp < ? OR (proxy_logs.timestamp = ? AND proxy_logs.id < ?))"), P.push(i.timestamp, i.timestamp, i.id));
          const E = "WHERE " + N.join(" AND "), w = await t.prepare(`${m} ${f} ${E} ${p} LIMIT ?`).bind(...P, s + 1).all(), R = Array.isArray(w?.results) ? w.results : [];
          b = R.length > s, C = b ? R.slice(0, s) : R, A = b ? Rf(C[C.length - 1]) : null, _ = null, S = b ? o + 1 : o;
        } else {
          _ = (await t.prepare(`SELECT COUNT(*) as total ${f} ${y}`).bind(...u).first())?.total || 0;
          const N = await t.prepare(`${m} ${f} ${y} ${p} LIMIT ? OFFSET ?`).bind(...u, s, l).all();
          C = Array.isArray(N?.results) ? N.results : [], S = Math.ceil(_ / s) || 1, T = o > 1, b = o < S;
        }
      } catch (N) {
        const P = String(N?.message || N || "");
        if (h && /no such table:\s*proxy_logs_fts/i.test(P)) return { errorResponse: z("LOG_FTS_NOT_READY", "FTS5 虚拟表尚未初始化，请先点击“初始化日志表”", 400, { searchMode: g }) };
        if (h && /fts5/i.test(P)) return { errorResponse: z("LOG_FTS_QUERY_INVALID", "FTS 查询语法无效，请检查引号、布尔表达式或前缀写法", 400, { detail: P }) };
        throw N;
      }
      return {
        logs: C,
        total: _,
        totalPages: S,
        hasPrevPage: T,
        hasNextPage: b,
        nextCursor: A,
        searchMode: g
      };
    }
  };
  return e;
}
var th = "sys_status";
function rh(n = {}) {
  const { logRepository: e } = n, t = {
    error(r, a, o = null) {
      Le(r, a, o, "error");
    },
    scheduleFlush(r, a) {
      const o = e.getDB(r), s = sr.get(o);
      if (!o || !a || s.LogFlushPending) return null;
      s.LogFlushPending = !0;
      const i = t.flush(r).finally(() => {
        s.LogFlushTask === i && (s.LogFlushTask = null), s.LogFlushPending = !1, s.LogLastFlushAt = $();
      });
      return s.LogFlushTask = i, a.waitUntil(i), i;
    },
    record(r, a, o) {
      const s = e.getDB(r);
      if (!s || !a) return;
      const i = sr.get(s);
      if (o.requestMethod === "OPTIONS") return;
      const c = k(o.runtimeConfig) ? o.runtimeConfig : oo(r) || {};
      if (i.runtimeConfig = c, c.logEnabled === !1) {
        i.LogQueue.length > 0 && (i.LogQueue.length = 0), i.LogDedupe.clear();
        return;
      }
      const l = Number(o.statusCode) || 0;
      if (!Sc(c, o)) return;
      const d = qo(c.logWriteMode), u = c.logWriteClientIp !== !1, f = c.logWriteColo !== !1, m = c.logWriteUa !== !1, p = (R, D) => String(R || "").slice(0, D), h = p(o.inboundColo || o.inboundIp || o.clientIp || "unknown", 32), g = p(o.outboundColo || o.outboundIp || "", 32), y = u ? p(o.clientIp || "unknown", 128) : "", _ = p(o.nodeName || "unknown", 128) || "unknown", S = p(o.requestPath || "/", 2048) || "/", T = $(), b = Math.max(0, Number(i.LogClearEpochMs) || 0), A = T <= b ? b + 1 : T;
      let C = 0;
      if (o.requestMethod === "HEAD" ? C = 3e5 : (o.category === "segment" || o.category === "prewarm") && (C = 3e4), C > 0) {
        const R = [
          _,
          o.requestMethod || "GET",
          l,
          S,
          y,
          g
        ].join("|"), D = i.LogDedupe.get(R);
        if (D && T - D < C) return;
        if (i.LogDedupe.set(R, T), i.LogDedupe.size > B.Defaults.LogDedupeMax) {
          for (const [x, L] of i.LogDedupe)
            if (i.LogDedupe.has(x) && ((T - L > C || i.LogDedupe.size > B.Defaults.LogDedupeTrimTarget) && i.LogDedupe.delete(x), i.LogDedupe.size <= B.Defaults.LogDedupeTrimTarget))
              break;
        }
      }
      if (i.LogQueue.push({
        timestamp: A,
        nodeName: _,
        requestPath: S,
        requestMethod: o.requestMethod || "GET",
        statusCode: l,
        responseTime: Number(o.responseTime) || 0,
        clientIp: y,
        inboundColo: f ? h : null,
        outboundColo: f ? g : null,
        userAgent: m && p(o.userAgent, 512) || null,
        referer: p(o.referer, 1024) || null,
        category: o.category || "api",
        errorDetail: p(o.errorDetail, 2048) || null,
        detailJson: o.detailJson ? Fl(o.detailJson) : null,
        createdAt: new Date(A).toISOString()
      }), i.LogQueue.length > B.Defaults.LogQueueMax) {
        const R = Math.min(B.Defaults.LogQueueOverflowDropCount, i.LogQueue.length);
        i.LogQueue.splice(0, R), e.patchOpsStatus(r, { log: {
          lastOverflowAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          lastOverflowDropCount: R,
          queueLengthAfterDrop: i.LogQueue.length
        } }, a), console.error(`Log queue overflow, dropping ${R} logs to preserve isolate headroom.`);
      }
      i.LogLastFlushAt || (i.LogLastFlushAt = T);
      const N = Number(c.logWriteDelayMinutes), P = Number(c.logFlushCountThreshold), E = Math.max(0, Number.isFinite(N) ? N * 6e4 : B.Defaults.LogFlushDelayMinutes * 6e4), w = Math.max(1, Number.isFinite(P) ? Math.floor(P) : B.Defaults.LogFlushCountThreshold);
      (d === "error" || i.LogQueue.length >= w || E === 0 || T - i.LogLastFlushAt >= E) && t.scheduleFlush(r, a);
    },
    async flush(r) {
      const a = e.getDB(r), o = sr.get(a);
      if (!a || o.LogQueue.length === 0) return;
      const s = k(o.runtimeConfig) ? o.runtimeConfig : oo(r) || {}, i = Ue(s.scheduleUtcOffsetMinutes);
      if (s.logEnabled === !1) {
        o.LogQueue.length = 0, o.LogDedupe.clear();
        return;
      }
      await e.ensureSysStatusTable(a);
      const c = await e.resolveLogsReadiness({
        db: a,
        kv: e.getKV(r)
      });
      if (c.schemaReady !== !0) {
        const A = o.LogQueue.length;
        o.LogQueue.length = 0, o.LogDedupe.clear(), await e.patchOpsStatus(r, { log: {
          schemaReady: !1,
          ftsReady: c.ftsReady === !0,
          statsReady: c.statsReady === !0,
          lastFlushAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushStatus: "schema_not_ready",
          lastFlushError: "proxy_logs schema not initialized",
          lastFlushErrorAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushRetryCount: 0,
          lastDroppedBatchSize: A,
          lastFlushWrittenBeforeError: 0,
          queueLengthAfterFlush: 0
        } });
        return;
      }
      const l = Number(s.logBatchChunkSize), d = Number(s.logBatchRetryCount), u = Number(s.logBatchRetryBackoffMs), f = fe(l, B.Defaults.LogBatchChunkSize, 1, 100), m = fe(d, B.Defaults.LogBatchRetryCount, 0, 5), p = fe(u, B.Defaults.LogBatchRetryBackoffMs, 0, 5e3), h = e.getOpsStatusDbScope("log");
      let g = 0, y = 0, _ = 0, S = 0;
      const T = /* @__PURE__ */ new Map(), b = (A = []) => {
        const C = e.summarizeStatsHourlyEntries(A, { utcOffsetMinutes: i });
        for (const N of C) {
          const P = `${N.bucketDate}:${N.bucketHour}`, E = T.get(P) || {
            bucketDate: N.bucketDate,
            bucketHour: N.bucketHour,
            requestCount: 0,
            playCount: 0,
            playbackInfoCount: 0
          };
          E.requestCount += Math.max(0, Number(N.requestCount) || 0), E.playCount += Math.max(0, Number(N.playCount) || 0), E.playbackInfoCount += Math.max(0, Number(N.playbackInfoCount) || 0), T.set(P, E);
        }
      };
      try {
        const A = Math.max(o.LogClearEpochMs || 0, await e.getLogClearEpochMs(r));
        for (; o.LogQueue.length > 0; ) {
          const N = o.LogQueue.splice(0, f).filter((R) => (Number(R?.timestamp) || 0) > A);
          if (!N.length) continue;
          _ = N.length, S = 0;
          const P = JSON.stringify(N);
          if (Fe(P) > Yt) throw ol("proxy_logs.batch", P);
          const E = a.prepare(`INSERT INTO proxy_logs (timestamp, node_name, request_path, request_method, status_code, response_time, client_ip, inbound_colo, outbound_colo, user_agent, referer, category, error_detail, detail_json, created_at)
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
							FROM ${th}
							WHERE scope = ?
							LIMIT 1
						), 0)`).bind(P, h);
          let w = 0;
          for (; ; ) try {
            await E.run();
            break;
          } catch (R) {
            if (w >= m) throw R;
            w += 1, y += 1, p > 0 && await Li(p * w);
          }
          c.statsReady === !0 && b(N), g += N.length, S += N.length;
        }
        if (c.statsReady === !0 && T.size > 0) try {
          await e.upsertStatsHourlyBuckets(a, [...T.values()], { useBatch: !0 });
        } catch (N) {
          console.warn("upsertStatsHourlyBuckets failed", N);
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
          queueLengthAfterFlush: o.LogQueue.length,
          lastFlushError: null,
          lastFlushErrorAt: null,
          lastDroppedBatchSize: 0,
          lastFlushWrittenBeforeError: 0
        };
        g > 0 ? await e.bumpLogsRevision(r, C) : await e.patchOpsStatus(r, { log: C });
      } catch (A) {
        await e.patchOpsStatus(r, { log: {
          schemaReady: c.schemaReady === !0,
          ftsReady: c.ftsReady === !0,
          statsReady: c.statsReady === !0,
          statsUtcOffsetMinutes: i,
          lastFlushErrorAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushStatus: "failed",
          lastFlushError: A?.message || String(A),
          lastFlushRetryCount: y,
          lastDroppedBatchSize: Math.max(0, _ - S),
          lastFlushWrittenBeforeError: g,
          queueLengthAfterFlush: o.LogQueue.length
        } }), console.log("Log flush failed, dropping batch.", A);
      }
    }
  };
  return t;
}
var Vn = "sys_status", rr = "sys_locks", la = "scheduled", pi = Object.freeze({
  log: "ops_status:log",
  scheduled: "ops_status:scheduled",
  dnsIpPool: "ops_status:dns_ip_pool"
});
function ah(n = {}) {
  const { bindingPort: e, schemaReadinessPort: t, statusPersistence: r } = n, a = {
    async getOpsStatusPayloadFromDb(o, s) {
      if (!o || !s) return null;
      const i = r.getOpsStatusPayloadCache(o), c = i?.get(String(s));
      if (c && Number(c.expiresAt) > $()) return c.payload;
      if (c && i.delete(String(s)), !await r.ensureSysStatusTable(o)) return null;
      try {
        const l = await o.prepare(`SELECT payload FROM ${Vn} WHERE scope = ? LIMIT 1`).bind(s).first(), d = l?.payload ? typeof l.payload == "string" ? JSON.parse(l.payload) : l.payload : null;
        return r.cacheOpsStatusPayload(o, s, d), d;
      } catch {
        return i?.delete(String(s)), null;
      }
    },
    async getOpsStatusPayloadFromDbStrict(o, s) {
      if (!o || !s) throw new Error("D1 status scope is not configured");
      if (!await r.ensureSysStatusTable(o)) {
        const c = /* @__PURE__ */ new Error("D1 sys_status table is unavailable");
        throw c.code = "D1_COMPATIBILITY_REQUIRED", c.status = 409, c;
      }
      const i = await o.prepare(`SELECT payload FROM ${Vn} WHERE scope = ? LIMIT 1`).bind(s).first();
      return i?.payload ? typeof i.payload == "string" ? JSON.parse(i.payload) : i.payload : null;
    },
    async putOpsStatusPayloadToDb(o, s, i, c) {
      if (!o || !s || !i || typeof i != "object" || !await r.ensureSysStatusTable(o)) return !1;
      const l = JSON.stringify(i);
      return Fe(l) > Yt ? !1 : (await o.prepare(`INSERT INTO ${Vn} (scope, payload, updated_at) VALUES (?, ?, ?)
		ON CONFLICT(scope) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`).bind(s, l, Number(c) || $()).run(), r.cacheOpsStatusPayload(o, s, i), !0);
    },
    getOpsStatusSectionEntries() {
      return Object.entries(pi);
    },
    async getOpsStatusRootFromStores(o) {
      const s = o?.db || null;
      if (!s) return {};
      const i = await a.getOpsStatusPayloadFromDb(s, r.getOpsStatusDbScope()), c = i && typeof i == "object" ? i : {}, l = r.getOpsStatusShadowPatch(s);
      return Xe(c, l && typeof l == "object" ? l : {});
    },
    async getOpsStatusRoot(o) {
      return a.getOpsStatusRootFromStores(r.resolveOpsStatusStores(o));
    },
    async getOpsStatusSectionFromStores(o, s) {
      const i = o?.db || null;
      if (!s) return {};
      if (!pi[s]) return {};
      const c = async () => {
        if (!i) return null;
        const f = await a.getOpsStatusPayloadFromDb(i, r.getOpsStatusDbScope(s));
        return f && typeof f == "object" ? f : null;
      }, [l, d] = await Promise.all([a.getOpsStatusRootFromStores(o), c()]), u = l && typeof l[s] == "object" ? l[s] : {};
      return Xe(d && typeof d == "object" ? d : {}, u);
    },
    async getOpsStatusSection(o, s) {
      return a.getOpsStatusSectionFromStores(r.resolveOpsStatusStores(o), s);
    },
    async getOpsStatusFromStores(o) {
      const s = o?.db || null;
      if (!s) return {};
      const i = await a.getOpsStatusRootFromStores(o), c = i && typeof i == "object" ? { ...i } : {};
      let l = typeof c.updatedAt == "string" ? c.updatedAt : "";
      const d = await Promise.all(a.getOpsStatusSectionEntries().map(async ([u]) => {
        const f = await a.getOpsStatusPayloadFromDb(s, r.getOpsStatusDbScope(u)), m = i && typeof i[u] == "object" ? i[u] : {};
        return [u, Xe(f && typeof f == "object" ? f : {}, m)];
      }));
      for (const [u, f] of d)
        !f || typeof f != "object" || Object.keys(f).length && (c[u] = Xe(c[u], f), typeof f.updatedAt == "string" && f.updatedAt > l && (l = f.updatedAt));
      return l && (c.updatedAt = l), c;
    },
    async getOpsStatus(o) {
      return a.getOpsStatusFromStores(r.resolveOpsStatusStores(o));
    },
    getLogClearEpochMsFromStatus(o) {
      const s = Number(o?.clearEpochMs);
      return Number.isFinite(s) && s > 0 ? Math.floor(s) : 0;
    },
    async getLogClearEpochMs(o) {
      const s = await a.getOpsStatusSection(o, "log"), i = a.getLogClearEpochMsFromStatus(s), c = sr.get(r.resolveOpsStatusStores(o).db);
      return i > c.LogClearEpochMs && (c.LogClearEpochMs = i), i;
    },
    async patchOpsStatus(o, s, i = null) {
      const c = r.resolveOpsStatusStores(o);
      if (!c.db) return {};
      const l = s && typeof s == "object" ? s : {}, d = Object.keys(l);
      if (!d.length) return await a.getOpsStatusFromStores(c);
      const u = r.buildOpsStatusRootPatch(l);
      if (!Object.keys(u).length) return await a.getOpsStatusFromStores(c);
      const f = r.getOpsStatusShadowState(c.db);
      f && (f.pendingPatch = Xe(f.pendingPatch && typeof f.pendingPatch == "object" ? f.pendingPatch : {}, u));
      const m = async () => await r.flushOpsStatusShadow(c, { patchKeys: d }), p = Promise.resolve(Ve.OpsStatusWriteChain).catch((h) => {
        Le("ops_status.write_chain.previous_failure", h, { patchKeys: d });
      }).then(m);
      return Ve.OpsStatusWriteChain = p.catch((h) => {
        Le("ops_status.write_chain.current_failure", h, { patchKeys: d });
      }), i ? i.waitUntil(p) : await p, p;
    },
    resolveScheduledLeaseStores(o) {
      return o && typeof o == "object" && !Array.isArray(o) && ("db" in o || "kv" in o) ? {
        db: o.db || null,
        kv: o.kv || null
      } : o && typeof o.prepare == "function" ? {
        db: o,
        kv: null
      } : o && typeof o.get == "function" ? {
        db: null,
        kv: o
      } : {
        db: e.getDB(o),
        kv: e.getKV(o)
      };
    },
    async ensureScheduledLeaseTable(o) {
      if (!o || typeof o.prepare != "function") return !1;
      if (t.isD1SchemaReadyCached(o, "scheduledLeaseTable")) return !0;
      let s = te.ScheduledLeaseDbReady.get(o);
      s || (s = (async () => {
        try {
          return await o.prepare(`CREATE TABLE IF NOT EXISTS ${rr} (scope TEXT PRIMARY KEY, token TEXT NOT NULL, owner TEXT NOT NULL, acquired_at INTEGER NOT NULL, renewed_at INTEGER, expires_at INTEGER NOT NULL)`).run(), await o.prepare(`CREATE INDEX IF NOT EXISTS idx_sys_locks_expires_at ON ${rr} (expires_at DESC)`).run(), t.markD1SchemaReady(o, "scheduledLeaseTable"), !0;
        } catch (i) {
          return console.warn("scheduled lease table init failed", i), !1;
        }
      })(), te.ScheduledLeaseDbReady.set(o, s));
      try {
        return await s;
      } finally {
        te.ScheduledLeaseDbReady.get(o) === s && te.ScheduledLeaseDbReady.delete(o);
      }
    },
    normalizeScheduledLeaseLock(o, s = "") {
      if (!o || typeof o != "object") return null;
      const i = String(o.token || "").trim();
      if (!i) return null;
      const c = String(o.owner || "scheduled").trim() || "scheduled", l = Number(o.expiresAt ?? o.expires_at ?? 0), d = Number(o.acquiredAtMs ?? o.acquired_at), u = Number(o.renewedAtMs ?? o.renewed_at);
      return {
        token: i,
        owner: c,
        acquiredAt: typeof o.acquiredAt == "string" ? o.acquiredAt : Number.isFinite(d) && d > 0 ? new Date(d).toISOString() : "",
        renewedAt: typeof o.renewedAt == "string" ? o.renewedAt : Number.isFinite(u) && u > 0 ? new Date(u).toISOString() : "",
        expiresAt: Number.isFinite(l) ? l : 0,
        backend: s || String(o.backend || "").trim() || ""
      };
    },
    async getScheduledLeaseLockFromDb(o, s = la) {
      if (!o || !await a.ensureScheduledLeaseTable(o)) return null;
      try {
        const i = await o.prepare(`SELECT token, owner, acquired_at, renewed_at, expires_at FROM ${rr} WHERE scope = ? LIMIT 1`).bind(String(s || la)).first();
        return a.normalizeScheduledLeaseLock(i, "d1");
      } catch {
        return null;
      }
    },
    async tryAcquireScheduledLeaseWithDb(o, s = {}) {
      if (!o) return {
        acquired: !1,
        reason: "db_unavailable",
        backend: "d1"
      };
      if (!await a.ensureScheduledLeaseTable(o)) return {
        acquired: !1,
        reason: "db_init_failed",
        backend: "d1"
      };
      const i = $(), c = Math.max(B.Defaults.ScheduledLeaseMinMs, Number(s.leaseMs) || B.Defaults.ScheduledLeaseMs), l = String(s.token || `${i}-${Math.random().toString(36).slice(2, 10)}`), d = String(s.owner || "scheduled"), u = String(s.scope || la), f = i + c;
      try {
        await o.prepare(`INSERT INTO ${rr} (scope, token, owner, acquired_at, renewed_at, expires_at)
          VALUES (?, ?, ?, ?, NULL, ?)
          ON CONFLICT(scope) DO UPDATE SET
            token = excluded.token,
            owner = excluded.owner,
            acquired_at = excluded.acquired_at,
            renewed_at = NULL,
            expires_at = excluded.expires_at
          WHERE ${rr}.expires_at <= ?`).bind(u, l, d, i, f, i).run();
        const m = await a.getScheduledLeaseLockFromDb(o, u);
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
    async tryAcquireScheduledLease(o, s = {}) {
      const i = a.resolveScheduledLeaseStores(o);
      return i.db ? await a.tryAcquireScheduledLeaseWithDb(i.db, s) : {
        acquired: !1,
        reason: "db_not_configured",
        backend: "d1"
      };
    },
    async renewScheduledLeaseWithDb(o, s, i, c = {}) {
      if (!o || !s || !await a.ensureScheduledLeaseTable(o)) return null;
      const l = $(), d = Math.max(B.Defaults.ScheduledLeaseMinMs, Number(i) || B.Defaults.ScheduledLeaseMs), u = String(c.scope || la);
      try {
        await o.prepare(`UPDATE ${rr}
          SET owner = ?, renewed_at = ?, expires_at = ?
          WHERE scope = ? AND token = ?`).bind(String(c.owner || "scheduled"), l, l + d, u, String(s)).run();
        const f = await a.getScheduledLeaseLockFromDb(o, u);
        return f && f.token === String(s) ? f : null;
      } catch {
        return null;
      }
    },
    async renewScheduledLease(o, s, i, c = {}) {
      const l = a.resolveScheduledLeaseStores(o);
      return l.db ? await a.renewScheduledLeaseWithDb(l.db, s, i, c) : null;
    },
    async releaseScheduledLeaseWithDb(o, s, i = {}) {
      if (!o || !s || !await a.ensureScheduledLeaseTable(o)) return !1;
      const c = String(i.scope || la);
      try {
        return await o.prepare(`DELETE FROM ${rr} WHERE scope = ? AND token = ?`).bind(c, String(s)).run(), !0;
      } catch {
        return !1;
      }
    },
    async releaseScheduledLease(o, s, i = {}) {
      const c = a.resolveScheduledLeaseStores(o);
      return c.db ? await a.releaseScheduledLeaseWithDb(c.db, s, i) : !1;
    }
  };
  return a;
}
function fr(n, e = "") {
  const t = String(n || "request_aborted").trim() || "request_aborted", r = new Error(e ? `${t}_${e}` : t);
  return t === "client_aborted" ? r.code = "CLIENT_ABORTED" : t === "downstream_cancelled" ? r.code = "DOWNSTREAM_CANCELLED" : t === "stream_idle_timeout" ? r.code = "STREAM_IDLE_TIMEOUT" : r.code = "REQUEST_ABORTED", r;
}
function Pl(n) {
  const e = new AbortController();
  let t = "", r = null, a = null, o = null;
  const s = /* @__PURE__ */ new Set(), i = (l) => {
    if (s.size)
      for (const d of [...s]) try {
        d(l);
      } catch {
      }
  }, c = (l = "request_aborted") => {
    const d = String(l || "request_aborted").trim() || "request_aborted";
    if (t || (t = d), a && !a.signal.aborted) try {
      a.abort(t);
    } catch {
    }
    if (!e.signal.aborted) try {
      e.abort(t);
    } catch {
    }
    i(t);
  };
  if (n && typeof n.addEventListener == "function") {
    const l = () => c("client_aborted");
    n.aborted ? l() : (n.addEventListener("abort", l, { once: !0 }), r = () => n.removeEventListener("abort", l));
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
      if (o && (o(), o = null), a = l || null, !l) return () => {
      };
      const d = () => {
        try {
          l.abort(t || "request_aborted");
        } catch {
        }
      };
      return t || e.signal.aborted ? d() : e.signal.addEventListener("abort", d, { once: !0 }), o = () => {
        e.signal.removeEventListener("abort", d), a === l && (a = null);
      }, () => {
        if (!o) return;
        const u = o;
        o = null, u();
      };
    },
    dispose() {
      if (r && (r(), r = null), o) {
        const l = o;
        o = null, l();
      } else a = null;
      s.clear();
    }
  };
}
function nh(n = []) {
  const e = new AbortController(), t = [], r = (a = "linked_abort") => {
    if (!e.signal.aborted)
      try {
        e.abort(a);
      } catch {
      }
  };
  for (const a of Array.isArray(n) ? n : [n]) {
    if (!a || typeof a.addEventListener != "function") continue;
    const o = () => r(a.reason || "linked_abort");
    if (a.aborted) {
      o();
      continue;
    }
    a.addEventListener("abort", o, { once: !0 }), t.push(() => a.removeEventListener("abort", o));
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
async function oh(n, e, t = null) {
  return await new Promise((r, a) => {
    let o = !1, s = null, i = () => {
    };
    const c = (d) => {
      if (!o) {
        o = !0, s !== null && clearTimeout(s);
        try {
          i();
        } catch {
        }
        r(d);
      }
    }, l = (d) => {
      if (!o) {
        o = !0, s !== null && clearTimeout(s);
        try {
          i();
        } catch {
        }
        a(d);
      }
    };
    t?.onAbort && (i = t.onAbort((d) => l(fr(d)))), Number(e) > 0 && (s = setTimeout(() => c({
      timedOut: !0,
      value: null
    }), Math.max(0, Number(e) || 0))), Promise.resolve(n).then((d) => c({
      timedOut: !1,
      value: d
    }), l);
  });
}
async function sh(n, e = null) {
  const t = Math.max(0, Number(n) || 0);
  if (!(t <= 0))
    return await new Promise((r, a) => {
      let o = !1, s = () => {
      };
      const i = setTimeout(() => {
        if (!o) {
          o = !0;
          try {
            s();
          } catch {
          }
          r();
        }
      }, t);
      e?.onAbort && (s = e.onAbort((c) => {
        o || (o = !0, clearTimeout(i), a(fr(c)));
      }));
    });
}
function ih(n = {}, e = {}) {
  return {
    async tryServeMetadataCache(t) {
      if (!t.metadataCache || !t.metadataCacheKey) return null;
      try {
        const r = Rg(t.metadataCacheKey, t.request);
        if (!r) return null;
        const a = await t.metadataCache.match(r);
        if (!a) return null;
        const o = e.buildProxyResponseHeaders(a, t.request, t.dynamicCors, t.finalOrigin, t.requestTraits, {
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
          headers: o
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
    enforceStrictClientDirectAuthPolicy(t, r, a, o = {}) {
      if (!e.shouldGuardClientDirectForRequest(t?.requestTraits, r)) return r;
      const s = a?.clientRedirectAuthPolicy || ra(a?.newHeaders);
      return a && typeof a == "object" && (a.clientRedirectAuthPolicy = s), t.directRedirectAuthReason = s.reason || "", r;
    },
    createDirectTransportIncompatibleError(t, r = {}) {
      const a = /* @__PURE__ */ new Error("direct_transport_incompatible");
      return a.code = "DIRECT_TRANSPORT_INCOMPATIBLE", a.redirectTrace = r.redirectTrace || t?.redirectTrace || null, a;
    },
    async maybeProbeEntryDirectRangeRedirectResponse(t, r, a, o) {
      if (typeof a != "function") return null;
      const s = e.resolveEntryDirectTargetUrl(t, r);
      let i = null, c = () => {
      };
      const l = Pl(t?.request?.signal);
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
      const d = Ia(i.headers.get("Location"), s);
      if (!d) {
        try {
          i.body?.cancel?.();
        } catch {
        }
        return c(), l.dispose(), null;
      }
      const u = t.playbackRelayTargetUrl instanceof URL ? t.playbackRelayTargetUrl : r, f = Ha(d, u).proxyPath || (d.origin === u?.origin ? d.pathname : null);
      if (f && Ra(f)) {
        const g = e.createRedirectTrace(t.requestUrl);
        e.recordRedirectTraceHop(g, i.status, d, {
          isSameOriginRedirect: !0,
          traceAction: "blocked_web"
        }), e.finalizeRedirectTrace(g, {
          terminalMode: "web_proxy_disabled",
          finalStatus: 404,
          finalHost: d.hostname || ""
        }), t.redirectTrace = g, t.defaultOutboundColo = rn(i) || "";
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
        })), In(t.requestMethod, t.dynamicCors);
      }
      const m = e.buildClientVisibleRedirectUrl(d, t.playbackRelayTargetUrl || r, t.nodeName, t.nodeKey, t.requestUrl, { entryMode: t.entryMode }) || d, p = e.createRedirectTrace(t.requestUrl);
      e.recordRedirectTraceHop(p, i.status, d, {
        isSameOriginRedirect: d.origin === s.origin,
        traceAction: "direct",
        dataPlaneMode: o?.dataPlaneMode
      }), e.finalizeRedirectTrace(p, {
        terminalMode: "client_redirect",
        finalStatus: i.status,
        finalHost: String(d.hostname || "").trim().toLowerCase()
      }), t.redirectTrace = p, t.defaultOutboundColo = rn(i) || "";
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
        decisionReason: String(o?.reason || o?.traceLabel || "").trim()
      })), c(), l.dispose(), new Response(t.requestMethod === "HEAD" ? null : i.body, {
        status: i.status,
        statusText: i.statusText,
        headers: h
      });
    },
    async maybeBuildEntryDirectResponse(t, r, a = null, o = null) {
      if (t?.forceWorkerProxy === !0) return null;
      const s = e.enforceStrictClientDirectAuthPolicy(t, t.entryRoutingDecision, a, {
        redirectStatus: t.entryRoutingDecision?.redirectStatus || 307,
        redirectMethod: t.requestMethod
      });
      if (t.entryRoutingDecision = s, s?.phase !== "entry" || s?.action !== "DIRECT") return null;
      const i = (Qe(r[0]) ? r[0] : null)?.targetUrl || null;
      if (!(i instanceof URL)) return null;
      const c = a?.clientRedirectAuthPolicy || ra(a?.newHeaders || t.request.headers);
      if (a && typeof a == "object" && (a.clientRedirectAuthPolicy = c), t?.requestTraits?.isBigStream === !0 && t?.requestTraits?.rangeHeader && c.hasQueryAuth !== !0 && c.hasHeaderAuth !== !0 && c.hasCookieAuth !== !0) {
        const f = await e.maybeProbeEntryDirectRangeRedirectResponse(t, i, o, s);
        if (f) return f;
      }
      if (c.canDirect !== !0)
        throw t.directRedirectAuthReason = c.reason || "direct_transport_incompatible", e.createDirectTransportIncompatibleError(t);
      const l = mn(e.resolveEntryDirectTargetUrl(t, i), c, t.effectiveMediaAuthMode), d = new Response(null, {
        status: 307,
        statusText: "Temporary Redirect"
      }), u = e.buildProxyResponseHeaders(d, t.request, t.dynamicCors, t.finalOrigin, t.requestTraits, {
        enableH3: t.enableH3,
        forceH1: t.forceH1,
        imageCacheMaxAge: t.imageCacheMaxAge
      });
      return e.applyProxyRedirectHeaders(u, d, i, t.nodeName, t.nodeKey, l, l, {
        linkVariant: t.linkVariant,
        entryMode: t.entryMode
      }), e.shouldRecordAccessLog(t, {
        statusCode: 307,
        category: e.classifyProxyLogCategory(t.requestTraits)
      }) && e.recordAccessLog(t, e.buildDirectAccessLogPayload(t, 307, "")), new Response(null, {
        status: 307,
        statusText: "Temporary Redirect",
        headers: u
      });
    },
    createBuildFetchOptions(t, r) {
      const { requestMethod: a, requestTraits: o, protocolFallback: s } = t, { newHeaders: i, adminCustomHeaders: c, preparedBody: l, preparedBodyMode: d } = r, u = r?.transportTemplate || null, f = Array.isArray(u?.baseHeaderEntries) ? u.baseHeaderEntries : [...i.entries()], m = u ? u.adminCustomHasOrigin === !0 : c.has("origin"), p = u ? u.adminCustomHasReferer === !0 : c.has("referer"), h = u ? u.hasOriginHeader === !0 : i.has("Origin"), g = u ? u.hasRefererHeader === !0 : i.has("Referer"), y = String(u?.refererOrigin || "").trim(), _ = String(u?.refererPathAndSearch || "/") || "/";
      return async (S, T = {}) => {
        const b = new Headers(f), A = (S instanceof URL ? S : new URL(String(S))).origin, C = T.method || a, N = T.bodyMode || d, P = T.body !== void 0 ? T.body : l, E = T.isExternalRedirect === !0, w = T.protocolFallbackRetry === !0, R = T.stripAuthOnProtocolFallback === !0;
        if (h && !m && b.set("Origin", A), g && !p)
          if (u) y ? y !== A && b.set("Referer", `${A}${_}`) : b.set("Referer", A + "/");
          else try {
            const x = new URL(b.get("Referer") || "");
            if (x.origin !== A) {
              const L = new URL(`${x.pathname || "/"}${x.search || ""}`, A);
              b.set("Referer", L.toString());
            }
          } catch {
            b.set("Referer", A + "/");
          }
        if (E) {
          const x = [];
          if (c instanceof Set) for (const L of c) {
            if (L === "cookie") continue;
            const F = i.get(L);
            F !== null && x.push([L, F]);
          }
          fi(b), b.delete("Cookie"), u?.adminCookie && b.set("Cookie", u.adminCookie);
          for (const [L, F] of x) b.set(L, F);
          m || b.delete("Origin"), p || b.delete("Referer");
        }
        w && s && (R && fi(b), b.set("Connection", "keep-alive")), (o.isBigStream || o.isSmartStrmMedia || o.isManifest || o.isSegment) && o.rangeHeader && !b.has("Range") && b.set("Range", o.rangeHeader), (o.isBigStream || o.isSmartStrmMedia || o.isManifest || o.isSegment) && o.ifRangeHeader && !b.has("If-Range") && b.set("If-Range", o.ifRangeHeader), (C === "GET" || C === "HEAD") && b.delete("Content-Length");
        const D = {
          method: C,
          headers: b,
          redirect: "manual"
        };
        return o.isMetadataCacheable && (D.cache = "no-store"), C !== "GET" && C !== "HEAD" && (N === "buffered" && P !== null && P !== void 0 ? D.body = P.slice(0) : N === "stream" && (D.body = P)), D;
      };
    }
  };
}
function ch(n = {}, e = {}) {
  return {
    async executeUpstreamFlow(t, r, a) {
      const o = /* @__PURE__ */ new Set([
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
      } : Zd(t.node, t.currentConfig), i = e.createRedirectTrace(t.requestUrl), c = Yd(t.requestMethod, t.requestTraits, { playbackRelayTargetUrl: t.playbackRelayTargetUrl });
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
        retryableStatuses: o,
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
        retryableStatuses: o,
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
      let d = l.response, u = l.targetRecord || null, f = u?.targetUrl || (t.playbackRelayTargetUrl instanceof URL ? new URL(t.playbackRelayTargetUrl.toString()) : null), m = l.finalUrl, p = l.releaseFetchController, h = l.protocolFallbackRetry === !0, g = l.protocolFallbackRetryFailed === !0, y = !1, _ = null;
      const S = 8;
      let T = 0, b = t.requestMethod, A = r.preparedBodyMode, C = r.preparedBody;
      for (t.defaultOutboundColo = rn(d) || ""; d.status >= 300 && d.status < 400 && T < S; ) {
        const N = Number(d.status) || 0, P = Ia(d.headers.get("Location"), m || f);
        if (!P) {
          e.finalizeRedirectTrace(i, {
            terminalMode: "invalid_redirect_target",
            finalStatus: N,
            finalHost: m?.hostname || f?.hostname || ""
          });
          break;
        }
        const E = Ha(P, f).proxyPath || (P.origin === f?.origin ? P.pathname : null);
        if (E && Ra(E)) {
          e.recordRedirectTraceHop(i, N, P, {
            isSameOriginRedirect: !0,
            traceAction: "blocked_web"
          }), e.finalizeRedirectTrace(i, {
            terminalMode: "web_proxy_disabled",
            finalStatus: 404,
            finalHost: P.hostname || ""
          });
          try {
            d.body?.cancel?.();
          } catch {
          }
          try {
            p?.();
          } catch {
          }
          d = In(t.requestMethod, t.dynamicCors), m = P, p = null, T += 1;
          break;
        }
        const w = e.enforceStrictClientDirectAuthPolicy(t, e.getRoutingDecision({
          phase: "redirect",
          nextUrl: P,
          activeTargetBase: f,
          redirectMethod: b,
          redirectBodyMode: A,
          forceWorkerProxy: t.forceWorkerProxy === !0,
          forceWorkerProxyReason: t.forceWorkerProxyReason,
          currentStatus: d.status,
          policy: {
            forceVideoDirect: s.forceVideoDirect === !0,
            forceVideoProxy: s.forceVideoProxy === !0,
            currentStatus: d.status
          },
          routingDecisionMode: t.routingDecisionMode
        }), r, {
          redirectStatus: d.status,
          redirectMethod: b,
          redirectBodyMode: A
        });
        if (e.recordRedirectTraceHop(i, N, P, w), w.action === "DIRECT") {
          const F = r.clientRedirectAuthPolicy || ra(r.newHeaders);
          if (F.canDirect !== !0)
            throw t.directRedirectAuthReason = F.reason || "direct_transport_incompatible", e.finalizeRedirectTrace(i, {
              terminalMode: "direct_incompatible",
              finalStatus: 409,
              finalHost: P.hostname || ""
            }), e.createDirectTransportIncompatibleError(t, { redirectTrace: i });
          const I = e.buildClientVisibleRedirectUrl(P, f, t.nodeName, t.nodeKey, t.requestUrl, {
            preserveWorkerProxy: w.preserveWorkerProxy === !0,
            linkVariant: t.linkVariant,
            entryMode: t.entryMode
          }) || P;
          _ = w.preserveWorkerProxy === !0 ? I : mn(I, r.clientRedirectAuthPolicy || r.newHeaders, t.effectiveMediaAuthMode), e.finalizeRedirectTrace(i, {
            terminalMode: "client_redirect",
            finalStatus: N,
            finalHost: _.hostname || P.hostname || ""
          });
          break;
        }
        const R = w.nextMethod, D = w.nextBodyMode, x = D === "none" ? null : C;
        try {
          d.body?.cancel?.();
        } catch {
        }
        try {
          p?.();
        } catch {
        }
        let L;
        try {
          L = await e.fetchAbsoluteWithRetryLoop({
            absoluteUrl: P,
            buildFetchOptions: a,
            fetchOptions: {
              method: R,
              bodyMode: D,
              body: x,
              isExternalRedirect: !w.isSameOriginRedirect
            },
            retryableStatuses: o,
            protocolFallback: t.protocolFallback,
            preparedBodyMode: D,
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
              finalStatus: N || 301,
              finalHost: _.hostname || P.hostname || ""
            }), d = new Response(null, {
              status: N || 301,
              statusText: "Moved Permanently"
            }), m = P, p = null;
            break;
          }
          throw e.finalizeRedirectTrace(i, {
            terminalMode: "proxy_error_after_redirect",
            finalStatus: N,
            finalHost: P.hostname || ""
          }), F && typeof F == "object" && (F.redirectTrace = i), F;
        }
        if (d = L.response, m = L.finalUrl, p = L.releaseFetchController, h = h || L.protocolFallbackRetry === !0, g = g || L.protocolFallbackRetryFailed === !0, b = R, A = D, C = x, t.defaultOutboundColo = rn(d) || "", w.isSameOriginRedirect || (y = !0), T += 1, t.requestTraits?.isImage && !w.isSameOriginRedirect && d.status >= 400) {
          try {
            d.body?.cancel?.();
          } catch {
          }
          try {
            L.releaseFetchController?.();
          } catch {
          }
          _ = e.buildClientVisibleRedirectUrl(P, f, t.nodeName, t.nodeKey, t.requestUrl, {
            preserveWorkerProxy: !1,
            linkVariant: t.linkVariant,
            entryMode: t.entryMode
          }) || P, e.finalizeRedirectTrace(i, {
            terminalMode: "client_redirect",
            finalStatus: N || 301,
            finalHost: _.hostname || P.hostname || ""
          }), d = new Response(null, {
            status: N || 301,
            statusText: "Moved Permanently"
          }), m = P, p = null;
          break;
        }
      }
      if (!i.terminalMode && (i.hops.length > 0 || i.finalStatus > 0)) {
        const N = Number(d?.status) || 0;
        if (N >= 300 && N < 400) {
          const P = Ia(d.headers.get("Location"), m || f);
          e.finalizeRedirectTrace(i, {
            terminalMode: T >= S ? "redirect_limit" : "upstream_redirect_passthrough",
            finalStatus: N,
            finalHost: P?.hostname || m?.hostname || f?.hostname || ""
          });
        } else e.finalizeRedirectTrace(i, {
          terminalMode: i.hops.length > 0 ? "proxied_follow" : "no_redirect",
          finalStatus: N,
          finalHost: m?.hostname || f?.hostname || ""
        });
      }
      return {
        response: d,
        finalUrl: m,
        activeTargetRecord: u,
        activeTargetBase: f,
        releaseFetchController: p,
        proxiedExternalRedirect: y,
        directRedirectUrl: _,
        protocolFallbackRetry: h,
        protocolFallbackRetryFailed: g,
        redirectTrace: i
      };
    },
    async buildSuccessResponse(t, r, a, o = null) {
      let s = await e.guardApiResponseMime(t, a);
      if (t?.requestTraits?.isPlaybackInfoRequest === !0 && (s = await e.guardPlaybackInfoResponseContract(t, s), Pt(s.playbackInfoRepresentation) && (s = await e.maybeRewritePlaybackInfoResponse(t, s)), Pt(s.playbackInfoRepresentation))) {
        const E = await e.buildPeerPlaybackVersionResponse(t, t.env, s);
        if (E) {
          const w = JSON.stringify(E.payload), R = s.response;
          try {
            Promise.resolve(R.body?.cancel?.()).catch(() => {
            });
          } catch {
          }
          const D = new Response(w, {
            status: R.status,
            statusText: R.statusText,
            headers: Sn(R.headers)
          });
          s = {
            ...s,
            response: D,
            playbackInfoRepresentation: yn({
              response: D,
              bodyText: w,
              bodyBytes: new TextEncoder().encode(w).byteLength,
              payload: E.payload
            })
          };
        }
      }
      const i = String(s.redirectTrace?.terminalMode || t?.redirectTrace?.terminalMode || ""), c = t?.playbackAbsoluteFallbackEligible === !0 && !s.directRedirectUrl && i !== "web_proxy_disabled" && Number(s.response.status) === 404;
      c && (t.playbackFallback = "relative_307");
      const l = e.shouldLogDirectAccess(t, { directRedirectUrl: s.directRedirectUrl }), d = l ? "" : e.buildRedirectDiagnosticDetail(s.redirectTrace || t.redirectTrace), u = s.response.status, f = c ? 307 : s.directRedirectUrl && Number(s.redirectTrace?.finalStatus) || u, m = c ? "Temporary Redirect" : s.response.statusText;
      e.markFailoverBusinessSuccess(t, s.activeTargetRecord, { status: u });
      const p = e.buildProxyResponseHeaders(s.response, t.request, t.dynamicCors, t.finalOrigin, t.requestTraits, {
        enableH3: t.enableH3,
        forceH1: t.forceH1,
        proxiedExternalRedirect: s.proxiedExternalRedirect,
        imageCacheMaxAge: t.imageCacheMaxAge
      }), h = Fm(t, o);
      if (e.applyProxyRedirectHeaders(p, s.response, s.activeTargetBase, t.nodeName, t.nodeKey, s.directRedirectUrl, s.finalUrl, {
        linkVariant: t.linkVariant,
        entryMode: t.entryMode,
        externalRedirectAuth: h,
        workerOrigin: t.requestUrl instanceof URL ? t.requestUrl.origin : ""
      }), h && h.canDirect !== !0 && !s.directRedirectUrl && tl(Number(s.response.status)) && vm(p.get("Location"), t.requestUrl instanceof URL ? t.requestUrl.origin : "")) throw e.createDirectTransportIncompatibleError(t, { redirectTrace: s.redirectTrace || t.redirectTrace });
      c && (ml(p), p.set("Location", t.playbackAbsoluteFallbackLocation || "/"), p.set("Cache-Control", "no-store"));
      const g = !c && e.shouldManageProxyResponseBody(t, s), y = t.defaultOutboundColo || "", _ = c ? f : u, S = e.classifyProxyLogCategory(t.requestTraits), T = e.shouldRecordAccessLog(t, {
        statusCode: _,
        category: S
      }, { statusFinal: !g }), b = T ? e.buildRuntimeDiagnosticDetail(t) : "";
      let A = "";
      T && (A = l ? e.buildDirectAccessDiagnosticDetail(t, {
        directRedirectUrl: s.directRedirectUrl,
        redirectTrace: s.redirectTrace || t.redirectTrace
      }) : e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.extractProxyErrorDetail(s.response), e.buildStreamDiagnosticDetail(t, s.response, {
        flow: g ? "managed" : "passthrough",
        source: "upstream",
        upstreamHost: s.finalUrl?.hostname || s.activeTargetBase?.hostname || "",
        protocolFallbackRetry: s.protocolFallbackRetry === !0,
        idleTimeoutMs: g ? e.resolveResponseStreamIdleTimeoutMs(t.requestTraits, t.upstreamTimeoutMs) : 0
      })), e.appendLogDiagnosticDetail(b, d)));
      let C = null;
      if (T && (C = l ? e.buildDirectAccessLogPayload(t, f, y, {
        directRedirectUrl: s.directRedirectUrl,
        redirectTrace: s.redirectTrace || t.redirectTrace
      }) : {
        statusCode: _,
        category: S,
        errorDetail: A,
        detailJson: e.buildStructuredLogDetail(t, { statusCode: c ? f : u }, {
          transport: null,
          deliveryMode: "proxy",
          redirectTrace: s.redirectTrace || t.redirectTrace,
          redirectMode: c ? "playback_relative_fallback" : s.redirectTrace?.terminalMode || "proxied_follow",
          redirectUrl: s.finalUrl,
          decisionReason: c ? "playback_relative_fallback" : s.redirectTrace?.terminalMode || "proxied_follow",
          protocolFailureReason: s.protocolFallbackRetry === !0 || s.protocolFallbackRetryFailed === !0 ? e.classifyProtocolFailureReason("protocol_fallback", {
            upstreamStatus: u,
            protocolFallbackRetry: !0
          }) : Number(u) >= 400 ? e.classifyProtocolFailureReason(A || s.response.statusText || "", {
            upstreamStatus: u,
            protocolFallbackRetry: s.protocolFallbackRetry === !0
          }) : null,
          protocolFallbackRetry: s.protocolFallbackRetry === !0,
          playbackInfoCache: t.playbackInfoCacheState,
          playbackInfoCacheTtlSec: t.playbackInfoCacheTtlSec,
          progressRelayMode: t.progressForwardMode,
          progressIntervalSec: t.videoProgressForwardIntervalSec,
          upstreamHost: s.finalUrl?.hostname || s.activeTargetBase?.hostname || "",
          upstreamStatus: u
        }),
        outboundColo: y
      }), !g && C && e.recordAccessLog(t, C), t.metadataCacheKey && t.ctx && s.response.status === 200) {
        const E = s.response.clone();
        t.ctx.waitUntil(e.storeMetadataCache(t.metadataCacheKey, E, t.requestTraits, {
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
      const N = s.response;
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
      if (s.response.status === 101 && N.webSocket) {
        try {
          s.releaseFetchController?.();
        } catch {
        }
        t.requestLifecycle?.dispose?.();
        const E = {
          status: 101,
          statusText: s.response.statusText,
          headers: p,
          webSocket: N.webSocket
        };
        return new Response(null, E);
      }
      if (t?.node?.tmdbAggregationEnabled === !0) {
        const E = await e.buildPeerAggregationMergedResponse(t, t.env, s);
        if (E)
          return p.set("Content-Type", "application/json; charset=utf-8"), p.delete("Content-Length"), p.delete("Content-Encoding"), p.delete("Transfer-Encoding"), p.set("Cache-Control", "no-store"), new Response(t.requestMethod === "HEAD" ? null : JSON.stringify(E.payload), {
            status: 200,
            statusText: "OK",
            headers: p
          });
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
function lh(n = {}, e = {}) {
  return {
    buildErrorResponse(t, r) {
      const a = r?.message || String(r || "网关或 CF Workers 内部崩溃"), o = String(r?.code || "").toUpperCase();
      let s = 502, i = "Bad Gateway", c = {
        error: "Bad Gateway",
        code: 502,
        message: "All proxy attempts failed."
      };
      o === "UPSTREAM_TIMEOUT" || o === "STREAM_IDLE_TIMEOUT" ? (s = 504, i = "Gateway Timeout", c = {
        error: "Gateway Timeout",
        code: 504,
        message: "Upstream response timed out."
      }) : o === "DIRECT_TRANSPORT_INCOMPATIBLE" ? (s = 409, i = "Conflict", c = {
        error: "Conflict",
        code: 409,
        message: "DIRECT mode is strict and will not fall back to proxy when custom auth headers or cookies are required."
      }) : (o === "CLIENT_ABORTED" || o === "DOWNSTREAM_CANCELLED" || o === "REQUEST_ABORTED") && (s = 499, i = "Client Closed Request", c = {
        error: "Client Closed Request",
        code: 499,
        message: "Client closed request."
      });
      try {
        t.requestLifecycle?.abort?.(o ? o.toLowerCase() : "proxy_error");
      } catch {
      }
      t.requestLifecycle?.dispose?.();
      const l = s === 499 ? e.classifyProxyLogCategory(t.requestTraits || {}) : "error";
      if (e.shouldRecordAccessLog(t, {
        statusCode: s,
        category: l
      })) {
        const u = e.buildRedirectDiagnosticDetail(r?.redirectTrace || t.redirectTrace), f = e.buildRuntimeDiagnosticDetail(t);
        o === "DIRECT_TRANSPORT_INCOMPATIBLE" ? e.recordAccessLog(t, e.buildDirectAccessLogPayload(t, s, t.defaultOutboundColo || "", { redirectTrace: r?.redirectTrace || t.redirectTrace })) : e.recordAccessLog(t, {
          statusCode: s,
          category: l,
          errorDetail: e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(a, e.buildStreamDiagnosticDetail(t, null, {
            flow: "proxy_error",
            source: "upstream_pending",
            upstreamHost: r?.lastFinalUrl?.hostname || r?.lastTargetBase?.hostname || "",
            idleTimeoutMs: e.resolveResponseStreamIdleTimeoutMs(t.requestTraits || {}, t.upstreamTimeoutMs)
          })), e.appendLogDiagnosticDetail(f, u)),
          detailJson: e.buildStructuredLogDetail(t, { statusCode: s }, {
            deliveryMode: "proxy",
            redirectTrace: r?.redirectTrace || t.redirectTrace,
            redirectMode: "proxy_error",
            redirectUrl: r?.lastFinalUrl,
            decisionReason: o || "proxy_error",
            protocolFailureReason: e.classifyProtocolFailureReason(r, {
              errorCode: o,
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
      const d = new Headers({
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": t.finalOrigin || "*",
        "Cache-Control": "no-store"
      });
      return t.finalOrigin !== "*" && zr(d, "Origin"), De(d), new Response(JSON.stringify(c), {
        status: s,
        statusText: i,
        headers: d
      });
    },
    async handle(t, r, a, o, s, i, c, l = {}) {
      if (Ra(a)) {
        const y = k(l.runtimeConfig) ? l.runtimeConfig : {}, _ = aa(i, t, e.resolveCorsOrigin(y, t));
        return In(t.method, _);
      }
      const d = await Dy(t, i, r, o, a);
      if (d) return d;
      let u = await e.prepareExecutionContext(t, r, a, o, s, i, c, l);
      if (u.invalidResponse) return u.invalidResponse;
      const f = await e.resolveEarlyResponse(u);
      if (f) return f;
      let { targetRecords: m, invalidResponse: p } = e.parseTargetRecords(u.node, u.finalOrigin, { cachedTargetRecords: u.playbackRouteHotTargetRecords });
      if (p) return p;
      let h = e.prepareFailoverOverlay(u, m);
      u.defaultOutboundColo = "";
      let g = null;
      try {
        g = await e.buildProxyRequestState(u.request, u.node, u.proxyPath, u.requestUrl, u.clientIp, u.requestTraits, u.forceH1, h, {
          effectiveRealClientIpMode: u.effectiveRealClientIpMode,
          effectiveMediaAuthMode: u.effectiveMediaAuthMode
        });
        const y = await e.tryServePlaybackInfoResponseCache(u, g);
        if (y) return y;
        const _ = e.createBuildFetchOptions(u, g), S = await e.maybeBuildEntryDirectResponse(u, m, g, _);
        if (S) return S;
        const T = await e.maybeHandlePlaybackProgressRelay(u, g, _, g.retryTargetRecords);
        if (T) return T;
        u.requestLifecycle = Pl(u.request?.signal);
        const b = await e.executeUpstreamFlow(u, g, _);
        return await e.buildSuccessResponse(u, _, b, g);
      } catch (y) {
        return e.buildErrorResponse(u, y);
      }
    }
  };
}
function uh(n = {}, e = {}) {
  return {
    ...ih(n, e),
    ...ch(n, e),
    ...lh(n, e)
  };
}
function dh(n = {}, e = {}) {
  return {
    resolveEntryDirectTargetUrl(t, r) {
      if (t?.playbackRelayTargetUrl instanceof URL) return new URL(t.playbackRelayTargetUrl.toString());
      const a = lt(r, t?.proxyPath || "/");
      return a.search = String(t?.requestUrl?.search || ""), a;
    },
    classifyProxyLogCategory(t) {
      return t.isSegment ? "segment" : t.isManifest ? "manifest" : t.isBigStream || t.isSmartStrmMedia ? "stream" : t.isImage ? "image" : t.isSubtitle ? "subtitle" : t.isStaticFile ? "asset" : t.isWsUpgrade ? "websocket" : "api";
    },
    extractProxyErrorDetail(t) {
      if (t.status < 400) return null;
      const r = [], a = t.headers.get("Server");
      a && r.push(`Server: ${a}`);
      const o = t.headers.get("CF-Ray");
      o && r.push(`CF-Ray: ${o}`);
      const s = t.headers.get("X-Application-Error-Code") || t.headers.get("X-Emby-Error") || t.headers.get("X-MediaBrowser-Error");
      s && r.push(`Media-Server-Error: ${s}`);
      const i = t.headers.get("CF-Cache-Status");
      return i && r.push(`CF-Cache: ${i}`), r.length > 0 ? r.join(" | ") : t.statusText;
    },
    appendLogDiagnosticDetail(t, r) {
      const a = [], o = (i) => {
        const c = String(i || "").trim();
        c && (a.includes(c) || a.push(c));
      };
      if (o(t), o(r), !a.length) return null;
      const s = a.join(" | ");
      return s.length > 1200 ? s.slice(0, 1197) + "..." : s;
    },
    shouldLogDirectAccess(t, r = {}) {
      return !!(e.isEntryDirectDataPlaneMode(t?.entryRoutingDecision?.dataPlaneMode) || r.directRedirectUrl);
    },
    buildDirectAccessDiagnosticDetail(t, r = {}) {
      let a = "直连";
      a = e.appendLogDiagnosticDetail(a, `RoutingMode=${Ur(t?.routingDecisionMode)}`), a = e.appendLogDiagnosticDetail(a, e.buildTargetHotCacheDiagnosticDetail(t));
      const o = t?.entryRoutingDecision;
      return e.isEntryDirectDataPlaneMode(o?.dataPlaneMode) && (a = e.appendLogDiagnosticDetail(a, `Direct=entry_307 | Reason=${String(o?.reason || o?.traceLabel || "entry_direct").trim() || "entry_direct"}`)), a = e.appendLogDiagnosticDetail(a, e.buildPlaybackUrlDiagnosticDetail(t)), a = e.appendLogDiagnosticDetail(a, t?.directRedirectAuthReason ? `DirectAuth=${t.directRedirectAuthReason}` : ""), a = e.appendLogDiagnosticDetail(a, e.buildRouteContextDiagnosticDetail(t)), a = e.appendLogDiagnosticDetail(a, e.buildStreamDiagnosticDetail(t, null, {
        force: !0,
        flow: r.directRedirectUrl ? "client_redirect" : "entry_direct",
        source: "client_visible_redirect"
      })), (r.directRedirectUrl || r.redirectTrace) && (a = e.appendLogDiagnosticDetail(a, e.buildRedirectDiagnosticDetail(r.redirectTrace || t?.redirectTrace))), a;
    },
    buildDirectAccessLogPayload(t, r, a = "", o = {}) {
      return {
        statusCode: r,
        category: e.classifyProxyLogCategory(t.requestTraits),
        errorDetail: e.buildDirectAccessDiagnosticDetail(t, o),
        detailJson: e.buildStructuredLogDetail(t, { statusCode: r }, {
          ...o,
          deliveryMode: "direct",
          redirectMode: o.directRedirectUrl ? "client_redirect" : "entry_307",
          decisionReason: String(o.decisionReason || t?.directRedirectAuthReason || t?.entryRoutingDecision?.reason || t?.entryRoutingDecision?.traceLabel || "").trim()
        }),
        outboundColo: a
      };
    },
    buildStreamDiagnosticDetail(t, r, a = {}) {
      const o = t?.requestTraits || {};
      if (!(a.force === !0 || o.isBigStream === !0 || o.isSmartStrmMedia === !0 || o.isSegment === !0 || o.isManifest === !0)) return "";
      const s = r?.headers, i = [], c = (l, d) => {
        const u = String(d || "").trim();
        u && i.push(`${l}=${u.length > 160 ? u.slice(0, 157) + "..." : u}`);
      };
      return c("Flow", a.flow || "passthrough"), c("Kind", e.classifyProxyLogCategory(o)), c("Source", a.source || "upstream"), c("Range", o.rangeHeader || t?.request?.headers?.get("Range")), c("Content-Range", s?.get("Content-Range")), c("Length", s?.get("Content-Length")), c("Accept-Ranges", s?.get("Accept-Ranges")), c("Cache", a.cacheStatus || s?.get("CF-Cache-Status")), c("Upstream", a.upstreamHost || a.upstreamUrlHost), c("RoutingMode", Ur(t?.routingDecisionMode)), c("DirectAuth", t?.directRedirectAuthReason), a.protocolFallbackRetry === !0 && c("Retry", "protocol_fallback"), Number(a.idleTimeoutMs) > 0 && c("Idle", `${Number(a.idleTimeoutMs)}ms`), i.join(" | ");
    },
    buildPlaybackInfoCacheDiagnosticDetail(t) {
      if (t?.requestTraits?.isPlaybackInfoRequest !== !0) return "";
      const r = qt(t?.effectivePlaybackInfoMode), a = String(t?.playbackInfoCacheState || "").trim(), o = String(t?.playbackInfoRewrite || "").trim(), s = [`PlaybackInfoMode=${r}`];
      return o && s.push(`PlaybackInfoRewrite=${o}`), a && s.push(`PlaybackInfoCache=${a}`), Number(t?.playbackInfoCacheTtlSec) > 0 && s.push(`PlaybackInfoCacheTtl=${Number(t.playbackInfoCacheTtlSec)}s`), s.join(" | ");
    },
    buildPlaybackUrlDiagnosticDetail(t) {
      const r = String(t?.playbackUrlMode || "").trim(), a = String(t?.playbackFallback || "").trim(), o = String(t?.playbackPathFix || "").trim(), s = String(t?.rewritePlaybackEntry || "").trim(), i = [];
      return r && i.push(`PlaybackUrlMode=${r}`), a && i.push(`PlaybackFallback=${a}`), o && i.push(`PlaybackPathFix=${o}`), s && i.push(`RewritePlaybackEntry=${s}`), i.join(" | ");
    },
    buildTargetHotCacheDiagnosticDetail(t) {
      const r = String(t?.nodeCacheState || t?.targetHotCacheState || "").trim();
      return r ? t?.nodeCacheState ? `NodeCacheState=${r}` : `TargetHotCache=${r}` : "";
    },
    buildRouteContextDiagnosticDetail(t) {
      const r = t?.routeContextDiagnostics && typeof t.routeContextDiagnostics == "object" ? t.routeContextDiagnostics : null;
      if (!r) return "";
      const a = [], o = (s, i) => {
        const c = String(i || "").trim();
        c && a.push(`${s}=${c}`);
      };
      return o("RouteKind", r.routeKind), o("RequestHost", r.requestHost), o("ConfiguredHost", r.configuredHost), o("ConfiguredLegacyHost", r.configuredLegacyHost), a.push(`LegacyHostRequest=${r.isLegacyHostRequest === !0 ? "true" : "false"}`), a.join(" | ");
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
      const o = String(t?.progressForwardSessionKey || "").trim();
      return o && a.push(`ProgressSession=${ie(o)}`), a.join(" | ");
    },
    collectLogAuthKinds(t, r = null) {
      const a = /* @__PURE__ */ new Set(), o = t?.requestUrl instanceof URL ? t.requestUrl : null;
      if (o) for (const c of o.searchParams.keys()) {
        const l = $a(c);
        if ($g.has(l) || Ml.has(l)) {
          a.add("query");
          break;
        }
      }
      const s = r?.newHeaders || t?.request?.headers || new Headers(), i = r?.clientRedirectAuthPolicy || ra(s);
      return i.hasQueryAuth && a.add("query"), i.hasHeaderAuth && a.add("header"), i.hasCookieAuth && a.add("cookie"), [...a];
    },
    pickPrimaryAuthCarrier(t = []) {
      return (t || []).includes("query") ? "query" : (t || []).includes("header") ? "header" : (t || []).includes("cookie") ? "cookie" : "none";
    },
    resolveRedirectScope(t, r) {
      if (!t) return "none";
      try {
        const a = t instanceof URL ? t : new URL(String(t || "")), o = r instanceof URL ? r : new URL(String(r || ""));
        return a.origin === o.origin ? "same_origin" : "external";
      } catch {
        return "external";
      }
    },
    resolveRoutingCapability(t = "proxy", r = [], a = "none") {
      const o = String(t || "").trim().toLowerCase() === "direct" ? "direct" : "proxy", s = e.pickPrimaryAuthCarrier(r), i = a === "same_origin" || a === "external" ? a : "none";
      return Yg?.[o]?.[s]?.[i] || {
        deliveryMode: o,
        authCarrier: s,
        redirectScope: i,
        clientVisibleRedirect: o === "direct" && i !== "none",
        workerFollowRedirect: o !== "direct",
        reasonCode: o === "direct" ? "client_redirect" : "worker_follow_redirect"
      };
    },
    classifyProtocolFailureReason(t, r = {}) {
      const a = String(r.errorCode || t?.code || "").trim().toUpperCase(), o = String(r.message || t?.message || t || "").trim().toLowerCase(), s = Number(r.upstreamStatus) || 0;
      return String(r.abortReason || "").trim().toLowerCase() === "stream_idle_timeout" || a === "STREAM_IDLE_TIMEOUT" ? "idle_timeout" : a === "UPSTREAM_TIMEOUT" || o.includes("timed out") || o.includes("timeout") ? "connect_timeout" : o.includes("redirect loop") ? "redirect_loop" : o.includes("too many redirects") || o.includes("redirect limit") ? "redirect_limit_exceeded" : o.includes("tls") || o.includes("ssl") || o.includes("certificate") ? "tls_handshake_failed" : r.protocolFallbackRetry === !0 || o.includes("protocol_fallback") ? "http_version_fallback" : s === 416 || o.includes("range") && (o.includes("416") || o.includes("unsatisfied") || o.includes("satisfiable")) ? "range_unsatisfied" : s >= 400 && s < 500 ? "upstream_4xx" : s >= 500 ? "upstream_5xx" : "unknown_fetch_error";
    },
    buildStructuredLogDetail(t, r = {}, a = {}) {
      const o = String(a.deliveryMode || (e.shouldLogDirectAccess(t, { directRedirectUrl: a.directRedirectUrl }) ? "direct" : "proxy")).trim().toLowerCase() === "direct" ? "direct" : "proxy", s = e.collectLogAuthKinds(t, a.transport), i = a.redirectScope || e.resolveRedirectScope(a.directRedirectUrl || a.redirectUrl || a.finalUrl, t?.requestUrl), c = e.resolveRoutingCapability(o, s, i), l = Number(a.upstreamStatus || r.statusCode || 0) || 0, d = _f(l), u = t?.routeContextDiagnostics && typeof t.routeContextDiagnostics == "object" ? t.routeContextDiagnostics : null, f = Array.isArray(a.authKindsForwarded) ? [...new Set(a.authKindsForwarded.map((p) => String(p || "").trim().toLowerCase()).filter(Boolean))] : o === "direct" ? s.filter((p) => p === "query") : s, m = e.ensureFailoverTelemetry(t);
      return {
        routingMode: Ur(t?.routingDecisionMode),
        entryDecision: t?.entryRoutingDecision ? {
          dataPlaneMode: String(t.entryRoutingDecision.dataPlaneMode || "").trim(),
          reason: String(t.entryRoutingDecision.reason || t.entryRoutingDecision.traceLabel || "").trim()
        } : null,
        redirectDecision: a.redirectDecision && typeof a.redirectDecision == "object" ? a.redirectDecision : {
          mode: String(a.redirectMode || a.redirectTrace?.terminalMode || c.reasonCode || "").trim(),
          reason: String(a.decisionReason || t?.directRedirectAuthReason || c.reasonCode || "").trim()
        },
        deliveryMode: o,
        redirectScope: i,
        authKindsPresent: s,
        authKindsForwarded: f,
        decisionReason: String(a.decisionReason || t?.directRedirectAuthReason || c.reasonCode || "").trim(),
        routeKind: String(u?.routeKind || "").trim() || null,
        requestHost: String(u?.requestHost || "").trim() || null,
        configuredHost: String(u?.configuredHost || "").trim() || null,
        configuredLegacyHost: String(u?.configuredLegacyHost || "").trim() || null,
        isLegacyHostRequest: u?.isLegacyHostRequest === !0,
        statusReasonCode: d.code,
        statusReasonText: d.text,
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
        playbackInfoMode: t?.requestTraits?.isPlaybackInfoRequest === !0 ? qt(a.playbackInfoMode || t?.effectivePlaybackInfoMode) : null,
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
    recordRedirectTraceHop(t, r, a, o = {}) {
      !t || !a || t.hops.push({
        status: Number(r) || 0,
        kind: o.isSameOriginRedirect === !0 ? "same" : "external",
        action: String(o.traceAction || (e.isEntryDirectDataPlaneMode(o.dataPlaneMode) ? "direct" : "proxy")).trim() || "proxy",
        host: String(a.hostname || "").trim().toLowerCase()
      });
    },
    finalizeRedirectTrace(t, r = {}) {
      if (!t || typeof t != "object") return null;
      const a = String(r.terminalMode || t.terminalMode || "").trim();
      a && (t.terminalMode = a);
      const o = Number(r.finalStatus);
      Number.isFinite(o) && o > 0 && (t.finalStatus = o);
      const s = String(r.finalHost || "").trim().toLowerCase();
      return s && (t.finalHost = s), t;
    },
    buildRedirectDiagnosticDetail(t) {
      if (!t || typeof t != "object") return "";
      const r = Array.isArray(t.hops) ? t.hops : [], a = r.length, o = String(t.terminalMode || "").trim(), s = Number(t.finalStatus) || 0, i = String(t.finalHost || "").trim().toLowerCase();
      if (!a && !o && s <= 0 && !i) return "";
      const c = [];
      o && c.push(`Redirect=${o}`), c.push(`RedirectHops=${a}`);
      const l = r.map((d) => {
        const u = Number(d?.status) || 0, f = String(d?.kind || "").trim() || "unknown", m = String(d?.action || "").trim() || "proxy", p = String(d?.host || "").trim().toLowerCase();
        return [
          u || "0",
          f,
          m,
          p
        ].filter(Boolean).join(":");
      }).filter(Boolean).join(">");
      return l && c.push(`RedirectChain=${l.length > 240 ? l.slice(0, 237) + "..." : l}`), s > 0 && c.push(`RedirectFinal=${s}`), i && c.push(`RedirectFinalHost=${i}`), c.join(" | ");
    }
  };
}
function fh(n = {}, e = {}) {
  return {
    buildProxyErrorState: Jn,
    async guardApiResponseMime(t, r) {
      return jl(t, r, {
        sanitizePath: Z,
        buildErrorState: Jn
      });
    },
    buildMetadataCacheStorageResponse(t, r, a = {}) {
      const o = new Headers(t.headers);
      return o.delete("Set-Cookie"), r.isImage || r.isSubtitle ? o.set("Cache-Control", `public, max-age=${Math.max(0, Number(a.imageCacheMaxAge) || 0)}`) : r.isManifest && o.set("Cache-Control", `public, max-age=${Math.max(0, Number(a.prewarmCacheTtl) || 0)}`), new Response(t.body, {
        status: t.status,
        statusText: t.statusText,
        headers: o
      });
    },
    async storeMetadataCache(t, r, a, o = {}) {
      const s = mr();
      if (!s || !t || !r || r.status !== 200 || o.proxiedExternalRedirect === !0 || a.isManifest && !Eo(o.sourceUrl)) return !1;
      try {
        return await s.put(t, e.buildMetadataCacheStorageResponse(r, a, o)), !0;
      } catch {
        return !1;
      }
    },
    resolveMetadataTarget(t, r, a, o) {
      const s = String(t || "").trim();
      if (!s) return null;
      let i;
      try {
        if (/^https?:\/\//i.test(s)) i = new URL(s);
        else {
          const d = new URL(s, "https://metadata-prewarm.invalid");
          i = lt(r, d.pathname || "/"), i.search = d.search || "", i.hash = d.hash || "";
        }
      } catch {
        return null;
      }
      if (Ig(i.pathname)) return null;
      const { proxyPath: c } = Ha(i, r);
      if (!c) return null;
      const l = c || "/";
      return Jr.test(l) || Yr.test(l) || At.test(l) || yr.test(l) ? {
        upstreamUrl: i,
        proxyPath: l,
        proxySearch: i.search || ""
      } : null;
    },
    buildMetadataPrewarmTargets(t, r, a, o, s, i) {
      const c = /* @__PURE__ */ new Map(), l = Pa(t);
      if (l) {
        const d = e.resolveMetadataTarget(`/Items/${encodeURIComponent(l)}/Images/Primary`, a, o, s);
        d && c.set(`${d.proxyPath}${d.proxySearch}`, d);
      }
      return i !== "poster" && To(r).forEach((d) => {
        const u = e.resolveMetadataTarget(d, a, o, s);
        u && c.set(`${u.proxyPath}${u.proxySearch}`, u);
      }), [...c.values()].sort((d, u) => ui(d.proxyPath) - ui(u.proxyPath)).slice(0, 4);
    },
    buildBudgetedPrewarmResponse(t, r) {
      const a = Math.max(0, Math.floor(Number(r) || 0)), o = pn(t?.headers?.get("Content-Length"));
      if (a <= 0 || Number.isFinite(o) && o > a) {
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
      }, d = new ReadableStream({
        async pull(u) {
          try {
            const { done: f, value: m } = await s.read();
            if (f) {
              l(), u.close();
              return;
            }
            const p = m instanceof Uint8Array ? m : new Uint8Array(m || 0);
            if (i + p.byteLength > a) {
              try {
                await s.cancel("metadata_prewarm_budget_exceeded");
              } catch {
              }
              l(), u.error(/* @__PURE__ */ new Error("metadata_prewarm_budget_exceeded"));
              return;
            }
            i += p.byteLength, u.enqueue(p);
          } catch (f) {
            l(), u.error(f);
          }
        },
        async cancel(u) {
          try {
            await s.cancel(u);
          } catch {
          }
          l();
        }
      });
      return {
        response: new Response(d, {
          status: t.status,
          statusText: t.statusText,
          headers: t.headers
        }),
        getBytes: () => i
      };
    },
    async runMetadataPrewarmSingleFlight(t, r) {
      const a = ee.MetadataPrewarmTasks, o = t instanceof Request ? t.url : String(t || "");
      if (!o) return {
        skipped: !0,
        result: null
      };
      const s = a.get(o);
      if (s) return {
        joined: !0,
        result: await s
      };
      if (a.size >= hd) return {
        skipped: !0,
        result: null
      };
      const i = Promise.resolve().then(r).finally(() => {
        a.get(o) === i && a.delete(o);
      });
      return a.set(o, i), {
        joined: !1,
        result: await i
      };
    },
    scheduleMetadataPrewarmResponse(t, r, a, o, s, i, c, l, d, u = {}) {
      if (!d || t.method !== "GET" || a.enablePrewarm !== !0 || a.isPlaybackInfoRequest === !0 || a.isImage || a.isSubtitle || a.isManifest || a.isSegment || a.isBigStream || !(r.status >= 200 && r.status < 300) || !hn(r.headers.get("Content-Type")) || a.prewarmDepth === "poster" && !Pa(String(u.proxyPath || ""))) return;
      let f;
      try {
        f = r.clone();
      } catch {
        return;
      }
      const m = (async () => {
        const p = await Pe(f, ec);
        if (p.exceeded) return;
        let h;
        try {
          h = JSON.parse(p.text);
        } catch {
          return;
        }
        const g = e.buildMetadataPrewarmTargets(u.proxyPath, h, o, i, c, a.prewarmDepth);
        if (!g.length) return;
        const y = mr();
        if (!y) return;
        let _ = fe(a.prewarmPrefetchBytes, B.Defaults.PrewarmPrefetchBytes, 0, Bo);
        for (const S of g) {
          if (_ <= 0) break;
          if (!Eo(S.upstreamUrl)) continue;
          const T = await Ag(t, S.upstreamUrl), b = Il(l, i, c, S.proxyPath, {
            search: S.proxySearch,
            nodeCacheRevision: u.nodeCacheRevision,
            entryMode: u.entryMode,
            identityPartition: T,
            cachePolicyRevision: wl(S.proxyPath, u)
          });
          if (b) {
            if (y && b) try {
              if (await y.match(b)) continue;
            } catch {
            }
            try {
              const A = await e.runMetadataPrewarmSingleFlight(b, async () => {
                const C = await s(S.upstreamUrl, { method: "GET" });
                C.cache = "no-store";
                const N = new Headers(C.headers);
                N.delete("Range"), N.delete("If-Modified-Since"), N.delete("If-None-Match"), N.set("X-Metadata-Prewarm", "1"), C.headers = N;
                const P = new AbortController();
                C.signal = P.signal;
                const E = fe(u.prewarmTimeoutMs, cd, 250, 1e4), w = setTimeout(() => P.abort(), E);
                try {
                  const R = await ze(S.upstreamUrl.toString(), C);
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
                  const D = e.buildBudgetedPrewarmResponse(R, _);
                  if (!D) return {
                    cached: !1,
                    bytes: 0
                  };
                  const x = {
                    isImage: Jr.test(S.proxyPath) || Yr.test(S.proxyPath),
                    isSubtitle: yr.test(S.proxyPath),
                    isManifest: At.test(S.proxyPath)
                  };
                  return {
                    cached: await e.storeMetadataCache(b, D.response, x, {
                      ...u,
                      sourceUrl: S.upstreamUrl
                    }),
                    bytes: D.getBytes()
                  };
                } finally {
                  clearTimeout(w), P.abort();
                }
              });
              !A.joined && A.result && (_ = Math.max(0, _ - (Number(A.result.bytes) || 0)));
            } catch {
            }
          }
        }
      })().catch(() => {
      });
      return d.waitUntil(m), m;
    },
    shouldRetryWithProtocolFallback(t, r = {}) {
      return !(t.status !== 403 || r.isRetry !== !1 || r.protocolFallback !== !0 || r.allowAutomaticRetry !== !0 || r.preparedBodyMode === "stream" || r.stripAuthOnProtocolFallback !== !0);
    },
    async resolveProtocolFallbackRetry(t, r, a) {
      let o = null, s = null;
      try {
        o = await a();
      } catch (l) {
        s = l;
      }
      if (s && Wt(s)) {
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
      const i = o?.response || null;
      if (!s && i && (i.status === 101 || i.status < 400)) {
        try {
          r.body?.cancel?.();
        } catch {
        }
        try {
          t.releaseFetchController?.();
        } catch {
        }
        return o;
      }
      if (i) try {
        i.body?.cancel?.();
      } catch {
      }
      try {
        o?.releaseFetchController?.();
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
      return t?.isManifest === !0 ? B.Defaults.ProxyPlaylistIdleTimeoutMs : t?.isSegment === !0 ? B.Defaults.ProxyStreamIdleTimeoutMs : 0;
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
      const o = r.response.body, s = t.requestLifecycle;
      let i = a && typeof a == "object" ? a : null;
      if (!i) {
        const T = e.classifyProxyLogCategory(t.requestTraits);
        e.shouldRecordAccessLog(t, {
          statusCode: r.response.status,
          category: T
        }, { statusFinal: !1 }) && (i = {
          statusCode: r.response.status,
          category: T,
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
      if (!o || t.requestMethod === "HEAD" || !s) {
        try {
          r.releaseFetchController?.();
        } catch {
        }
        return s?.dispose?.(), t.requestMethod === "HEAD" ? null : o;
      }
      const c = o.getReader(), l = e.resolveResponseStreamIdleTimeoutMs(t.requestTraits, t.upstreamTimeoutMs), d = i && {
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
      let u = !1, f = null, m = null, p = () => {
      }, h = !1;
      const g = (T = {}) => {
        if (h || !d) return;
        h = !0;
        const b = {
          ...d,
          ...k(T) ? T : {}
        };
        b.errorDetail = e.appendLogDiagnosticDetail(T.errorDetail, d.errorDetail), b.detailJson = {
          ...d.detailJson,
          ...T.detailJson && typeof T.detailJson == "object" ? T.detailJson : {},
          protocolFailureReason: T?.detailJson?.protocolFailureReason || (Number(b.statusCode) >= 400 ? e.classifyProtocolFailureReason(b.errorDetail, {
            upstreamStatus: b.statusCode,
            protocolFallbackRetry: d?.detailJson?.protocolFallbackRetry === !0
          }) : d?.detailJson?.protocolFailureReason || null),
          upstreamStatus: Number(b.statusCode) || 0
        }, e.recordAccessLog(t, b);
      }, y = () => {
        m !== null && (clearTimeout(m), m = null);
      }, _ = () => {
        if (!u) {
          u = !0, y();
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
        u || l <= 0 || (y(), m = setTimeout(() => s.abort("stream_idle_timeout"), l));
      };
      return p = s.onAbort((T) => {
        u || (y(), T === "stream_idle_timeout" ? g({
          statusCode: 504,
          category: "error",
          errorDetail: `stream_idle_timeout_${l}ms`
        }) : T === "client_aborted" || T === "downstream_cancelled" ? g({
          statusCode: 499,
          category: e.classifyProxyLogCategory(t.requestTraits),
          errorDetail: T
        }) : T && g({
          statusCode: 502,
          category: "error",
          errorDetail: String(T)
        }), Promise.resolve(c.cancel(T)).catch(() => {
        }).finally(() => {
          u || _();
        }));
      }), new ReadableStream({
        pull: async (T) => {
          if (!u)
            return f || (S(), f = (async () => {
              try {
                const { done: b, value: A } = await c.read();
                if (y(), b) {
                  const C = s.getAbortReason();
                  if (_(), C === "stream_idle_timeout") {
                    try {
                      T.error(fr(C, `${l}ms`));
                    } catch {
                    }
                    return;
                  }
                  g(), T.close();
                  return;
                }
                T.enqueue(A), S();
              } catch (b) {
                y();
                const A = s.getAbortReason(), C = A === "stream_idle_timeout" ? fr(A, `${l}ms`) : A ? fr(A) : b;
                if (_(), A === "client_aborted" || A === "downstream_cancelled") {
                  g({
                    statusCode: 499,
                    category: e.classifyProxyLogCategory(t.requestTraits),
                    errorDetail: A
                  });
                  try {
                    T.close();
                  } catch {
                  }
                  return;
                }
                g(A === "stream_idle_timeout" ? {
                  statusCode: 504,
                  category: "error",
                  errorDetail: `stream_idle_timeout_${l}ms`
                } : {
                  statusCode: 502,
                  category: "error",
                  errorDetail: b?.message || String(b)
                });
                try {
                  T.error(C);
                } catch {
                }
              } finally {
                f = null;
              }
            })(), f);
        },
        cancel: async (T) => {
          if (!u) {
            s.abort("downstream_cancelled"), y();
            try {
              await c.cancel(T);
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
function mh(n = {}, e = {}) {
  return {
    async performFetchWithTimeout(t, r, a = {}) {
      const o = await r(t, a), s = Math.max(0, Number(a.timeoutMs) || 0), i = a.requestLifecycle || null;
      let c = null, l = null, d = !1, u = () => {
      };
      (s > 0 || i) && (l = new AbortController(), o.signal = l.signal, i && (u = i.setActiveFetchController(l)), s > 0 && (c = setTimeout(() => {
        d = !0, l.abort(`upstream_timeout_${s}ms`);
      }, s)));
      try {
        return {
          response: await ze(t.toString(), o),
          finalUrl: t,
          releaseFetchController: u
        };
      } catch (f) {
        if (u(), d) {
          const m = /* @__PURE__ */ new Error(`upstream_timeout_${s}ms`);
          throw m.code = "UPSTREAM_TIMEOUT", m;
        }
        if (i && Wt(f)) {
          const m = i.getAbortReason();
          if (m) throw fr(m);
        }
        throw f;
      } finally {
        c !== null && clearTimeout(c);
      }
    },
    async performUpstreamFetch(t, r, a, o, s = {}) {
      const i = s.useFastSegmentBuilder === !0, c = i ? new URL(qp(t, r, a?.search || "")) : lt(t, r);
      return i || (c.search = a.search), {
        ...await e.performFetchWithTimeout(c, o, s),
        targetRecord: t
      };
    },
    async fetchAbsoluteWithRetryLoop(t) {
      let r = null;
      const a = t.absoluteUrl instanceof URL ? new URL(t.absoluteUrl.toString()) : new URL(String(t.absoluteUrl || "")), o = Math.max(1, fe(t.maxExtraAttempts, to, 0, 3) + 1);
      for (let s = 0; s < o; s++) {
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
          const d = s === o - 1;
          if (t.allowAutomaticRetry !== !0 || !t.retryableStatuses.has(l.status) || d) return {
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
          const l = s === o - 1;
          if (t.allowAutomaticRetry !== !0 || l)
            throw c && typeof c == "object" && (c.lastFinalUrl = a), c;
        }
      }
      throw r && typeof r == "object" && (r.lastFinalUrl = a), r || /* @__PURE__ */ new Error("redirect_fetch_failed");
    },
    async fetchUpstreamWithRetryLoop(t) {
      let r = null, a = Array.isArray(t.retryTargetRecords) ? t.retryTargetRecords.slice() : [], o = a[0], s = lt(o, t.proxyPath);
      s.search = t.requestUrl.search;
      const i = Math.max(1, fe(t.maxExtraAttempts, to, 0, 3) + 1);
      for (let c = 0; c < i; c++) for (let l = 0; l < a.length; l++) {
        const d = a[l];
        o = d;
        const u = t.isRetry === !0 || c > 0;
        try {
          const f = await e.performUpstreamFetch(d, t.proxyPath, t.requestUrl, t.buildFetchOptions, {
            isRetry: u,
            protocolFallbackRetry: t.protocolFallbackRetry === !0,
            stripAuthOnProtocolFallback: t.stripAuthOnProtocolFallback === !0,
            timeoutMs: t.upstreamTimeoutMs,
            requestLifecycle: t.requestLifecycle,
            useFastSegmentBuilder: t.segmentFastPathEnabled === !0 && u !== !0 && t.protocolFallbackRetry !== !0
          });
          s = f.finalUrl;
          const m = f.response;
          if (m.status === 101) return {
            ...f,
            protocolFallbackRetry: t.protocolFallbackRetry === !0
          };
          if (e.shouldRetryWithProtocolFallback(m, {
            ...t,
            isRetry: u
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
            targetRecord: d,
            responseStatus: m.status,
            reason: `upstream_status_${m.status}`
          });
          if (g?.upstream) {
            const y = g.upstream;
            o = y.targetRecord || d, s = y.finalUrl || s;
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
              targetRecord: d,
              reason: m || "network_error"
            });
            if (g?.upstream) {
              const y = g.upstream;
              o = y.targetRecord || d, s = y.finalUrl || s;
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
            throw f && typeof f == "object" && (f.lastFinalUrl = s, f.lastTargetRecord = o, f.lastTargetBase = o?.targetUrl || null), f;
        }
      }
      throw r && typeof r == "object" && (r.lastFinalUrl = s, r.lastTargetRecord = o, r.lastTargetBase = o?.targetUrl || null), r || /* @__PURE__ */ new Error("upstream_fetch_failed");
    }
  };
}
function ph(n = {}, e = {}) {
  const { Logger: t } = n;
  return {
    shouldRecordAccessLog(r = {}, a = {}, o = {}) {
      const s = k(r.currentConfig) ? r.currentConfig : oo(r.env);
      return k(s) ? Sc(s, {
        requestMethod: r.requestMethod,
        requestPath: r.proxyPath,
        statusCode: a.statusCode,
        category: a.category
      }, o) : !0;
    },
    recordAccessLog(r, a = {}) {
      const o = {
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
      t.record(r.env, r.ctx, o);
    },
    buildOptionsResponse(r) {
      const a = new Headers(r.dynamicCors);
      return De(a), r.finalOrigin !== "*" && zr(a, "Origin"), new Response(null, { headers: a });
    }
  };
}
function gh(n = {}, e = {}) {
  return {
    ...dh(n, e),
    ...fh(n, e),
    ...mh(n, e),
    ...ph(n, e)
  };
}
var gi = 4096, hh = 1440 * 60 * 1e3, yh = 60 * 1e3;
function hi(n, e, t) {
  const r = new URL(n.toString());
  return r.searchParams.delete("AnyProviderIdEquals"), r.searchParams.set("SearchTerm", e), /^\d{4}$/.test(t) ? r.searchParams.set("Years", t) : r.searchParams.delete("Years"), r;
}
var Sh = "https://api.theotherdb.org/video/getVideoIdByExternalId", yi = 4096, _h = 1440 * 1e3, bh = 60 * 1e3, Eh = 8e3, Th = [
  "video_id",
  "videoId",
  "video_ids",
  "videoIds"
], Ah = ["id", "value"], Rh = [
  "items",
  "data",
  "results",
  "videos",
  "list"
];
function Ch(n) {
  const e = String(n ?? "").trim().toLowerCase();
  return e ? e === "movie" || e === "film" ? "movie" : e === "tv" || e === "series" || e === "show" ? "tv" : "" : "";
}
function wh(n, e, t) {
  if (n != null)
    for (const r of String(n).split(",")) {
      const a = r.trim();
      if (!/^\d+$/.test(a)) continue;
      const o = t.find((s) => s.videoId === a);
      o ? !o.videoType && e && (o.videoType = e) : t.push({
        videoId: a,
        videoType: e
      });
    }
}
function Ao(n, e, t, r = 0) {
  if (n == null || r > 3) return;
  if (Array.isArray(n)) {
    for (const s of n.slice(0, 64)) Ao(s, e, t, r + 1);
    return;
  }
  if (!k(n)) {
    wh(n, e, t);
    return;
  }
  const a = Ch(n.video_type ?? n.videoType) || e, o = (s) => {
    const i = s.filter((c) => Object.prototype.hasOwnProperty.call(n, c));
    if (!i.length) return !1;
    for (const c of i) Ao(n[c], a, t, r + 1);
    return !0;
  };
  o(Th) || o(Rh) || o(Ah);
}
function Lh(n) {
  const e = [];
  return Ao(n, "", e), e;
}
function Nh(n, e) {
  const t = n.filter((r) => r.videoType);
  return (e && t.length ? n.filter((r) => !r.videoType || r.videoType === e) : n).map((r) => r.videoId);
}
async function Dh(n, e) {
  const t = ee.TodbVideoIdCache.get(n);
  return t && Number(t.expiresAt) > $() ? t.entries : await Et(Ye(["todb_video_id", n]), async () => {
    const r = () => Ne(ee.TodbVideoIdCache, n, {
      entries: null,
      expiresAt: $() + bh
    }, yi), a = new URL(Sh);
    a.searchParams.set("type", "tmdb"), a.searchParams.set("value", n);
    const o = new AbortController(), s = setTimeout(() => o.abort("todb_timeout"), Eh);
    try {
      const i = await fetch(a, {
        headers: {
          accept: "application/json",
          authorization: `Bearer ${e}`
        },
        signal: o.signal
      });
      if (!i.ok)
        return console.warn(`todb video id lookup failed: ${i.status}`), r(), null;
      const c = Lh(await i.json());
      return c.length ? (Ne(ee.TodbVideoIdCache, n, {
        entries: c,
        expiresAt: $() + _h
      }, yi), c) : (r(), null);
    } catch (i) {
      return console.warn("todb video id lookup failed:", i?.message || i), r(), null;
    } finally {
      clearTimeout(s);
    }
  });
}
async function Si(n, e = {}, t = {}, r = "", a = "") {
  const o = String(t?.todbApiKey || "").trim() || String(e?.TODB_API_KEY || "").trim();
  if (!o) return null;
  const s = Nh(await Dh(r, o) || [], a);
  if (!s.length) return null;
  const i = new URL(n.toString());
  return i.searchParams.delete("AnyProviderIdEquals"), i.searchParams.set("todbvs", s.join(",")), i;
}
async function Ih(n, e = {}, t = {}, r = "auto") {
  const a = n?.searchParams?.get?.("AnyProviderIdEquals")?.match(/tmdb\.(\d+)/i);
  if (!a) return null;
  const o = Or(r), s = String(n.searchParams.get("IncludeItemTypes") || "").toLowerCase(), i = s.includes("movie"), c = i ? "movie" : "tv", l = i, d = l === (s.includes("series") || s.includes("tv") || s.includes("episode") || s.includes("season")) ? "" : l ? "movie" : "tv";
  if (o === "emos") return await Si(n, e, t, a[1], d);
  const u = String(t?.tmdbApiReadToken || "").trim(), f = String(t?.tmdbApiV3Key || "").trim(), m = String(e?.TMDB_API_READ_TOKEN || "").trim(), p = String(e?.TMDB_API_KEY || "").trim(), h = !!(u || f), g = h ? u : m, y = h ? f : p, _ = () => o === "auto" ? Si(n, e, t, a[1], d) : Promise.resolve(null);
  if (!g && !y) return await _();
  h && (m || p) && Ve.TmdbCredentialOverrideWarned !== !0 && (Ve.TmdbCredentialOverrideWarned = !0, Le("tmdb.credentials_override", "account settings TMDB credentials override TMDB_* environment variables", {
    configReadToken: u ? "set" : "unset",
    configApiKey: f ? "set" : "unset",
    envReadToken: m ? "set" : "unset",
    envApiKey: p ? "set" : "unset"
  }));
  const S = String(t?.tmdbLanguage || e?.TMDB_LANGUAGE || "zh-CN").trim() || "zh-CN", T = `${S}:${c}:${a[1]}`, b = ee.TmdbLookupCache.get(T);
  if (b && Number(b.expiresAt) > $())
    return b.failed === !0 ? await _() : hi(n, b.title, b.year);
  const A = () => Ne(ee.TmdbLookupCache, T, {
    failed: !0,
    expiresAt: $() + yh
  }, gi), C = await Et(Ye(["tmdb_title", T]), async () => {
    const N = new URL(`https://api.themoviedb.org/3/${c}/${a[1]}`);
    N.searchParams.set("language", S), y && !g && N.searchParams.set("api_key", y);
    const P = new Headers({ accept: "application/json" });
    g && P.set("Authorization", `Bearer ${g}`);
    const E = new AbortController(), w = setTimeout(() => E.abort("tmdb_timeout"), 5e3);
    try {
      const R = await fetch(N, {
        headers: P,
        signal: E.signal
      });
      if (!R.ok)
        return console.warn(`TMDB ${c} lookup failed: ${R.status}`), A(), null;
      const D = await R.json(), x = String(i ? D?.title || "" : D?.name || "").trim(), L = String(i ? D?.release_date || "" : D?.first_air_date || "").slice(0, 4);
      return x ? (Ne(ee.TmdbLookupCache, T, {
        title: x,
        year: L,
        expiresAt: $() + hh
      }, gi), {
        title: x,
        year: L
      }) : (A(), null);
    } catch (R) {
      return console.warn("TMDB request conversion failed:", R?.message || R), A(), null;
    } finally {
      clearTimeout(w);
    }
  });
  return C ? hi(n, C.title, C.year) : await _();
}
function Mh(n = {}, e = {}) {
  const { CacheManager: t } = n, r = new nu({
    entries: ee.PlaybackInfoResponseCache,
    now: $,
    maxEntries: B.Defaults.PlaybackInfoCacheMax,
    maxEntryBytes: $o,
    maxTotalBytes: dd
  });
  return {
    async prepareExecutionContext(a, o, s, i, c, l, d, u = {}) {
      const f = Date.now(), m = a.method;
      if (t.maybeCleanup(l), !o || !o.target) return { invalidResponse: new Response("Invalid Node", {
        status: 502,
        headers: De(new Headers())
      }) };
      const p = k(u.runtimeConfig) ? u.runtimeConfig : await we(l), h = u.requestUrl || new URL(a.url), g = u.runtimeRouteContext && typeof u.runtimeRouteContext == "object" ? u.runtimeRouteContext : null, y = typeof g?.requestHost == "string" ? g.requestHost : oe(h.hostname), _ = typeof g?.configuredHost == "string" ? g.configuredHost : Ge(l), S = typeof g?.configuredLegacyHost == "string" ? g.configuredLegacyHost : qr(l), T = ir(u.entryMode || o?.entryMode), b = String(u.routeKindOverride || "").trim(), A = !!(S && S !== _ && y && y === S), C = {
        requestHost: y,
        configuredHost: _,
        configuredLegacyHost: S,
        isLegacyHostRequest: A,
        routeKind: b || (A ? "legacy_host_kv_route" : T === "host_prefix" ? "host_prefix" : "kv_route")
      }, N = Z(s), P = String(u?.pathNormalizationState?.kind || "").trim(), E = a.headers.get("cf-connecting-ip") || "unknown", w = fa(a), R = E, D = a.cf?.country || "UNKNOWN", x = e.resolveCorsOrigin(p, a), L = aa(l, a, x), F = gc(u.linkVariant), I = cg(N, h);
      if (I?.error) return { invalidResponse: new Response("Invalid Playback Relay", {
        status: 400,
        headers: De(new Headers(L))
      }) };
      const U = h.searchParams.has("__pb_abs") && (!!I || Ca(N));
      let V = h;
      const X = I?.visibleProxyPath || N, v = I?.targetUrl instanceof URL ? I.targetUrl.pathname : "";
      if (Ra(X) || v && Ra(v)) return { invalidResponse: In(m, L) };
      if ((I || U) && (V = new URL(h)), I) {
        V.searchParams.delete(pc);
        const he = pl(h, i, c, X, {
          linkVariant: F,
          entryMode: u.entryMode
        });
        V.pathname = he.pathname;
      }
      if (U && V.searchParams.delete(io), o.tmdbAggregationEnabled === !0 && (m === "GET" || m === "HEAD")) {
        const he = await Ih(V, l, p, o.aggregationMode);
        he && (V = he);
      }
      const O = Om(o, p, i), M = e.classifyRequest(a, X, V, p, {
        nodeDirectSource: O,
        directStaticAssets: p.directStaticAssets === !0,
        directHlsDash: p.directHlsDash === !0
      }), H = nf(o, p), j = tg(H), q = H === "rewrite" && I?.targetUrl instanceof URL ? "proxy" : "", J = F !== "main" ? "link_variant_force_proxy" : q ? "rewrite_playback_entry_proxy" : "", Q = !!J, se = Q ? {
        ...M,
        nodeDirectMedia: !1,
        directStaticAssets: !1,
        directHlsDash: !1,
        legacyEntryOffloadEnabled: !1,
        legacyEntryOffloadReason: "",
        enablePrewarm: p.enablePrewarm !== !1,
        isMetadataCacheable: m === "GET" && M.isWsUpgrade !== !0 && (M.isImage === !0 || M.isSubtitle === !0 || M.isManifest === !0)
      } : M, pe = km(p), _e = p.protocolFallback !== !1, ye = fe(p.upstreamTimeoutMs, ad, 0, 18e4), Ae = fe(p.upstreamRetryAttempts, to, 0, 3), ke = p.hedgeFailoverEnabled === !0, Ft = p.hedgeProbePreferGet !== !1, Me = sf(o, p), na = fe(p.hedgeProbeTimeoutMs, Ho, 250, 1e4), ot = fe(p.hedgeProbeParallelism, Gi, 1, 2), st = fe(p.hedgeWaitTimeoutMs, Vi, 250, 1e4), br = fe(p.hedgeLockTtlMs, ji, 1e3, 1e4), oa = fe(p.hedgePreferredTtlSec, da, 30, 3600), $e = fe(p.hedgeFailureCooldownSec, qi, 1, 300), Zt = fe(p.hedgeWakeJitterMs, Xi, 0, 1e3), mt = fe(p.cacheTtlImages, Qi, 0, 365) * 86400, pt = pe.enableH3 === !0, Ut = pe.forceH1 === !0, wt = p.playbackInfoCacheEnabled !== !1, kt = fe(p.playbackInfoCacheTtlSec, ud, 0, 60), er = p.videoProgressForwardEnabled !== !1, Lt = fe(p.videoProgressForwardIntervalSec, Ji, 0, 60), Er = of(o, p), Ht = af(o, p), $t = String(u.nodeCacheRevision || "").trim() || bo(i, o), K = se.isMetadataCacheable ? await Cl(a) : "", G = se.isMetadataCacheable ? wl(X, {
        imageCacheMaxAge: mt,
        prewarmCacheTtl: se.prewarmCacheTtl
      }) : "", Y = se.isMetadataCacheable && Eo(V) ? Il(V, i, c, X, {
        search: V.search,
        nodeCacheRevision: $t,
        entryMode: u.entryMode,
        identityPartition: K,
        cachePolicyRevision: G
      }) : null, W = Y ? mr() : null, re = zd(o, p), le = e.getRoutingDecision({
        phase: "entry",
        request: a,
        requestUrl: V,
        proxyPath: X,
        requestTraits: se,
        currentConfig: p,
        node: o,
        nodeName: i,
        nodeKey: c,
        linkVariant: F,
        forceWorkerProxy: Q,
        forceWorkerProxyReason: J,
        routingDecisionMode: re
      });
      return {
        request: a,
        requestMethod: m,
        node: o,
        nodeName: i,
        nodeKey: c,
        entryMode: T,
        env: l,
        ctx: d,
        startTime: f,
        currentConfig: p,
        rawRequestUrl: h,
        requestUrl: V,
        requestOrigin: h.origin,
        rawProxyPath: N,
        proxyPath: X,
        linkVariant: F,
        forceWorkerProxy: Q,
        forceWorkerProxyReason: J,
        clientIp: R,
        inboundIp: E,
        logInboundColo: w,
        country: D,
        finalOrigin: x,
        dynamicCors: L,
        routeContextDiagnostics: C,
        requestTraits: se,
        protocolStrategy: pe.strategy,
        routingDecisionMode: re,
        entryRoutingDecision: le,
        enableH3: pt,
        forceH1: Ut,
        protocolFallback: _e,
        upstreamTimeoutMs: ye,
        upstreamRetryAttempts: Ae,
        hedgeFailoverEnabled: ke,
        hedgeProbePreferGet: Ft,
        hedgeProbePath: Me,
        hedgeProbeTimeoutMs: na,
        hedgeProbeParallelism: ot,
        hedgeWaitTimeoutMs: st,
        hedgeLockTtlMs: br,
        hedgePreferredTtlSec: oa,
        hedgeFailureCooldownSec: $e,
        hedgeWakeJitterMs: Zt,
        playbackInfoCacheEnabled: wt,
        playbackInfoCacheTtlSec: kt,
        effectivePlaybackInfoMode: H,
        playbackInfoRewriteUrlMode: j,
        playbackInfoCacheState: se.isPlaybackInfoRequest === !0 ? wt && kt > 0 ? "miss" : "skip" : "",
        playbackInfoCacheKey: "",
        playbackInfoRewrite: se.isPlaybackInfoRequest === !0 && H === "passthrough" ? "passthrough" : "",
        playbackAbsoluteFallbackEligible: U,
        playbackAbsoluteFallbackLocation: U ? rg(N, h) : "",
        playbackUrlMode: U ? "absolute" : se.isPlaybackInfoRequest === !0 && H === "rewrite" ? String(j || "relative") : "",
        playbackFallback: U ? "none" : "",
        playbackPathFix: P,
        rewritePlaybackEntry: q,
        playbackRelayTargetUrl: I?.targetUrl instanceof URL ? I.targetUrl : null,
        targetHotCacheState: String(u.targetHotCacheState || "").trim() || (se.isPlaybackCriticalRequest === !0 ? "miss" : "skip"),
        nodeCacheState: String(u.nodeCacheState || "").trim(),
        playbackRouteHotTargetRecords: Array.isArray(u.cachedTargetRecords) ? u.cachedTargetRecords : null,
        videoProgressForwardEnabled: er,
        videoProgressForwardIntervalSec: Lt,
        effectiveRealClientIpMode: Er,
        effectiveMediaAuthMode: Ht,
        nodeDerivedCacheRevision: $t,
        failoverContext: null,
        failoverTelemetry: null,
        failoverForegroundWaitUsed: !1,
        progressForwardMode: "",
        progressForwardSessionKey: "",
        imageCacheMaxAge: mt,
        metadataCacheKey: Y,
        metadataCache: W,
        metadataCacheIdentityPartition: K,
        metadataCachePolicyRevision: G,
        redirectTrace: null
      };
    },
    cleanupPlaybackInfoResponseCache(a = $()) {
      r.cleanup(a);
    },
    buildPlaybackInfoAuthSignature(a, o = null) {
      const s = a?.requestUrl instanceof URL ? a.requestUrl : null, i = o?.newHeaders || a?.request?.headers || null, c = ls(i), l = is(He(i, "Cookie"), Aa);
      return us([
        s ? ie(s.searchParams.get("api_key") || s.searchParams.get("ApiKey") || s.searchParams.get("X-Emby-Token") || s.searchParams.get("X-MediaBrowser-Token") || "") : "",
        c?.token ? ie(c.token) : "",
        c?.deviceId ? ie(c.deviceId) : "",
        He(i, "Authorization") ? ie(He(i, "Authorization")) : "",
        He(i, "X-Emby-Authorization") ? ie(He(i, "X-Emby-Authorization")) : "",
        He(i, "X-MediaBrowser-Authorization") ? ie(He(i, "X-MediaBrowser-Authorization")) : "",
        l ? ie(l) : ""
      ]);
    },
    buildPlaybackInfoCacheKey(a, o = null) {
      if (a?.requestTraits?.isPlaybackInfoRequest !== !0) return "";
      if (a.playbackInfoCacheEnabled !== !0 || Number(a.playbackInfoCacheTtlSec) <= 0)
        return a.playbackInfoCacheState = "skip", a.playbackInfoCacheKey = "", "";
      const s = a.requestMethod;
      if (s !== "GET" && s !== "HEAD" && o?.preparedBodyMode !== "buffered")
        return a.playbackInfoCacheState = "skip", a.playbackInfoCacheKey = "", "";
      const i = o?.preparedBodyMode === "buffered" ? String(o?.preparedBodyText || xa(o?.preparedBody)) : "", c = `playback-info:${us([
        String(a?.nodeName || "").trim(),
        String(a?.nodeDerivedCacheRevision || "").trim(),
        s,
        String(a?.proxyPath || "").trim(),
        String(a?.requestUrl?.search || "").trim(),
        i ? ie(i) : "",
        e.buildPlaybackInfoAuthSignature(a, o),
        qt(a?.effectivePlaybackInfoMode),
        String(a?.playbackInfoRewriteUrlMode || "relative")
      ])}`;
      return a.playbackInfoCacheKey = c, c;
    },
    async storePlaybackInfoResponseCache(a, o, s = null, i = null) {
      if (a?.requestTraits?.isPlaybackInfoRequest !== !0) return !1;
      const c = a.playbackInfoCacheKey || e.buildPlaybackInfoCacheKey(a, s);
      return !c || !Pt(i) || i.response !== o ? !1 : r.set(c, i, {
        nodeName: String(a?.nodeName || "").trim().toLowerCase(),
        nodeRevision: String(a?.nodeDerivedCacheRevision || "").trim(),
        playbackInfoRewrite: String(a?.playbackInfoRewrite || "").trim(),
        ttlMs: Math.max(0, Number(a?.playbackInfoCacheTtlSec) || 0) * 1e3
      });
    },
    async tryServePlaybackInfoResponseCache(a, o = null) {
      if (a?.requestTraits?.isPlaybackInfoRequest !== !0) return null;
      const s = e.buildPlaybackInfoCacheKey(a, o);
      if (!s) return null;
      const i = r.get(s);
      if (!i)
        return a.playbackInfoCacheState = a.playbackInfoCacheState === "skip" ? "skip" : "miss", null;
      const c = i.metadata, l = i.representation, d = l.response, u = l.bodyText;
      a.playbackInfoCacheState = "hit", a.playbackInfoRewrite = String(c?.playbackInfoRewrite || a?.playbackInfoRewrite || "").trim();
      const f = e.buildProxyResponseHeaders(d, a.request, a.dynamicCors, a.finalOrigin, a.requestTraits, {
        enableH3: a.enableH3,
        forceH1: a.forceH1,
        imageCacheMaxAge: a.imageCacheMaxAge
      }), m = e.classifyProxyLogCategory(a.requestTraits);
      return e.shouldRecordAccessLog(a, {
        statusCode: d.status,
        category: m
      }) && e.recordAccessLog(a, {
        statusCode: d.status,
        category: m,
        errorDetail: e.appendLogDiagnosticDetail(e.extractProxyErrorDetail(d), e.buildRuntimeDiagnosticDetail(a)),
        detailJson: e.buildStructuredLogDetail(a, { statusCode: d.status }, {
          deliveryMode: "proxy",
          redirectMode: "playback_info_cache",
          decisionReason: "playback_info_cache_hit",
          playbackInfoCache: a.playbackInfoCacheState,
          playbackInfoCacheTtlSec: a.playbackInfoCacheTtlSec,
          upstreamStatus: d.status
        }),
        outboundColo: ""
      }), new Response(a.requestMethod === "HEAD" ? null : u, {
        status: d.status,
        statusText: d.statusText,
        headers: f
      });
    }
  };
}
var Ph = /^n([A-Za-z0-9_-]+)\.(.+)$/, xh = 8, Oh = "sys:nodes_index_full:v2", jn = 6e3, ua = 8 * 1024 * 1024, vh = /^\/(?:emby\/|mediabrowser\/)?(?:(?:users\/[^/]+\/)?items(?:\/\d+)?|shows\/[^/]+\/episodes)$/i;
function Fh(n = "") {
  return vh.test(String(n || "").trim());
}
function _i(n) {
  return !n || n.requestMethod !== "GET" || n.requestTraits?.isPlaybackCriticalRequest === !0 || n.playbackRelayTargetUrl instanceof URL ? !1 : Fh(n.proxyPath);
}
function Uh(n) {
  const e = ya(n);
  if (!e) return null;
  let t = null;
  try {
    t = JSON.parse(Jt(e.itemId));
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
function kh(n) {
  const e = n?.request?.headers;
  if (!e) return !1;
  for (const r of [
    "Authorization",
    "X-Emby-Authorization",
    "X-Emby-Token",
    "X-MediaBrowser-Token"
  ]) if (String(e.get(r) || "").trim()) return !0;
  const t = n?.requestUrl?.searchParams;
  if (!t) return !1;
  for (const r of ["api_key", "ApiKey"]) if (String(t.get(r) || "").trim()) return !0;
  return !1;
}
function ya(n) {
  const e = Ph.exec(String(n ?? "").trim());
  if (!e) return null;
  const t = Jt(e[1]);
  return t ? {
    peerName: t,
    itemId: e[2]
  } : null;
}
function Hh(n, e) {
  return `n${Qr(n)}.${String(e ?? "")}`;
}
function Ro(n, e, t = 0) {
  if (n == null || t > 6) return n;
  if (Array.isArray(n)) return n.map((a) => Ro(a, e, t + 1));
  if (!k(n)) return n;
  const r = {};
  for (const [a, o] of Object.entries(n)) {
    if (typeof o == "string" && /id$/i.test(a) && o.trim()) {
      r[a] = Hh(e, o.trim());
      continue;
    }
    if (Array.isArray(o) || k(o)) {
      r[a] = Ro(o, e, t + 1);
      continue;
    }
    r[a] = o;
  }
  return r;
}
async function Ga(n, e) {
  const t = await Sa(n, e);
  if (t.exceeded) return null;
  try {
    return JSON.parse(xa(t.bodyBytes));
  } catch {
    return null;
  }
}
function $h(n = {}, e = {}) {
  const { fetchPort: t } = n;
  return {
    async resolvePeerAggregationNodes(r, a) {
      if (!(r?.requestTraits?.isPlaybackInfoRequest === !0 && r?.requestMethod === "GET") && !_i(r)) return [];
      if (r.node?.tmdbAggregationEnabled !== !0) return [];
      if (!kh(r)) return [];
      const o = Sr(a);
      if (!o) return [];
      let s = null;
      try {
        s = await o.get(Oh, { type: "json" });
      } catch {
        return [];
      }
      if (!Array.isArray(s) || !s.length) return [];
      const i = String(r.nodeName || "").trim().toLowerCase(), c = [];
      for (const l of s) {
        if (c.length >= xh) break;
        const d = String(l?.name || "").trim().toLowerCase();
        !d || d === i || l?.tmdbAggregationEnabled === !0 && c.push({ name: d });
      }
      return c;
    },
    async readPeerAggregationNode(r, a) {
      const o = Sr(a);
      if (!o || !r) return null;
      try {
        return await o.get(`node:${r}`, { type: "json" });
      } catch {
        return null;
      }
    },
    async resolvePeerAggregationTargets(r) {
      if (!r) return [];
      const a = Array.isArray(r.lines) ? r.lines : [], o = String(r.activeLineId || "").trim(), s = o ? a.find((c) => String(c?.id || "").trim() === o) : null, i = s ? [s, ...a.filter((c) => c !== s)] : a;
      return (i.length ? i.map((c) => c.target) : String(r.target || "").split(",").map((c) => c.trim()).filter(Boolean)).map((c) => Ua(c)).filter(Qe);
    },
    buildPeerAggregationUpstreamUrl(r, a) {
      const o = lt(r, a.proxyPath);
      return o.search = String(a.requestUrl?.search || ""), o;
    },
    async fetchPeerAggregationPayload(r, a, o) {
      try {
        return await e.fetchPeerAggregationPayloadUnsafe(r, a, o);
      } catch (s) {
        return console.warn("peer aggregation skipped:", a?.name, s?.message || s), null;
      }
    },
    async fetchPeerAggregationPayloadUnsafe(r, a, o) {
      const s = await e.readPeerAggregationNode(a.name, o);
      if (!s) return null;
      const i = await e.resolvePeerAggregationTargets(s);
      if (!i.length) return null;
      const c = new Headers({ accept: "application/json" }), l = r.request.headers.get("Authorization") || r.request.headers.get("X-Emby-Authorization") || "";
      l && c.set("Authorization", l);
      for (const m of ["X-Emby-Token", "X-MediaBrowser-Token"]) {
        const p = String(r.request.headers.get(m) || "").trim();
        p && c.set(m, p);
      }
      const d = k(s?.headers) ? s.headers : {};
      for (const [m, p] of Object.entries(d))
        Ta.has(String(m).toLowerCase()) || c.set(m, String(p));
      const u = new AbortController(), f = setTimeout(() => u.abort("peer_aggregation_timeout"), jn);
      try {
        for (const m of i) {
          const p = e.buildPeerAggregationUpstreamUrl(m, r);
          try {
            const h = await t.fetchRequest(p, {
              method: "GET",
              headers: c,
              signal: u.signal
            });
            if (!h?.ok) continue;
            const g = await Ga(h, ua);
            if (k(g) && Array.isArray(g.Items)) return g;
          } catch {
            continue;
          }
        }
        return null;
      } finally {
        clearTimeout(f);
      }
    },
    async buildPeerAggregationMergedResponse(r, a, o) {
      const s = await e.resolvePeerAggregationNodes(r, a);
      if (!s.length)
        return _i(r) && console.log("[peer_aggregation_skip]", {
          reason: "no_peers",
          path: String(r?.proxyPath || ""),
          node: String(r?.node?.name || "")
        }), null;
      const i = o?.response;
      if (!i || Number(i.status) !== 200 || !String(i.headers.get("Content-Type") || "").toLowerCase().includes("application/json")) return null;
      const c = await Sa(i.clone(), ua);
      if (c.exceeded) return null;
      let l = null;
      try {
        l = JSON.parse(xa(c.bodyBytes));
      } catch {
        l = null;
      }
      if (!k(l) || !Array.isArray(l.Items)) return null;
      const d = await Promise.all(s.map((m) => e.fetchPeerAggregationPayload(r, m, a))), u = [...l.Items];
      let f = 0;
      return s.forEach((m, p) => {
        const h = d[p];
        if (!(!k(h) || !Array.isArray(h.Items)))
          for (const g of h.Items)
            k(g) && (u.push(Ro(g, m.name)), f += 1);
      }), f ? {
        payload: {
          ...l,
          Items: u,
          TotalRecordCount: Number(l.TotalRecordCount || l.Items.length || 0) + f
        },
        addedCount: f,
        peerCount: s.length
      } : null;
    },
    resolvePeerAggregationItemRoute(r, a) {
      const o = [...r?.requestUrl?.searchParams?.getAll?.("Ids") || [], Pa(r?.proxyPath || "")];
      for (const s of o) {
        const i = ya(s);
        if (i) return i;
      }
      return null;
    },
    shouldAggregatePeerPlaybackVersions(r) {
      return r?.node?.tmdbAggregationEnabled !== !0 || r?.requestTraits?.isPlaybackInfoRequest !== !0 || r.requestMethod !== "GET" ? !1 : !String(r?.requestUrl?.searchParams?.get?.("MediaSourceId") || "").trim();
    },
    async fetchOwnPlaybackItemIdentity(r, a, o) {
      const s = Pa(r?.proxyPath || "") || at(/^\/(?:emby|mediabrowser)\/Items\/([^/]+)/i.exec(String(r?.proxyPath || ""))?.[1] || "");
      if (!s) return null;
      const i = o?.activeTargetBase || o?.activeTargetRecord;
      if (!i) return null;
      const c = lt(i, `/Items/${encodeURIComponent(s)}`);
      c.searchParams.set("Fields", "ProviderIds,ProductionYear,SeriesName,IndexNumber,ParentIndexNumber");
      const l = new Headers({ accept: "application/json" }), d = r.request.headers.get("Authorization") || r.request.headers.get("X-Emby-Authorization") || "";
      d && l.set("Authorization", d);
      for (const m of ["X-Emby-Token", "X-MediaBrowser-Token"]) {
        const p = String(r.request.headers.get(m) || "").trim();
        p && l.set(m, p);
      }
      const u = new AbortController(), f = setTimeout(() => u.abort("playback_identity_timeout"), jn);
      try {
        const m = await t.fetchRequest(c, {
          method: "GET",
          headers: l,
          signal: u.signal
        });
        if (!m?.ok) return null;
        const p = await Ga(m, ua);
        return k(p) ? {
          Id: p.Id,
          Name: p.Name,
          ProductionYear: p.ProductionYear,
          ProviderIds: p.ProviderIds,
          SeriesName: p.SeriesName,
          IndexNumber: p.IndexNumber,
          ParentIndexNumber: p.ParentIndexNumber
        } : null;
      } catch {
        return null;
      } finally {
        clearTimeout(f);
      }
    },
    async fetchPeerPlaybackVersionPayload(r, a, o, s) {
      try {
        const i = await e.readPeerAggregationNode(a.name, o);
        if (!i) return null;
        const c = await e.resolvePeerAggregationTargets(i);
        if (!c.length) return null;
        const l = new Headers({ accept: "application/json" }), d = r.request.headers.get("Authorization") || r.request.headers.get("X-Emby-Authorization") || "";
        d && l.set("Authorization", d);
        for (const p of ["X-Emby-Token", "X-MediaBrowser-Token"]) {
          const h = String(r.request.headers.get(p) || "").trim();
          h && l.set(p, h);
        }
        const u = k(i?.headers) ? i.headers : {};
        for (const [p, h] of Object.entries(u))
          Ta.has(String(p).toLowerCase()) || l.set(p, String(h));
        const f = new AbortController(), m = setTimeout(() => f.abort("peer_playback_timeout"), jn);
        try {
          for (const p of c) {
            const h = await e.findPeerItemIdForIdentity(p, l, s, f.signal);
            if (!h) continue;
            const g = lt(p, `/Items/${encodeURIComponent(h)}/PlaybackInfo`), y = new URLSearchParams(String(r.requestUrl?.search || ""));
            y.delete("MediaSourceId"), g.search = y.toString();
            const _ = await t.fetchRequest(g, {
              method: "GET",
              headers: l,
              signal: f.signal
            });
            if (!_?.ok) continue;
            const S = await Ga(_, ua);
            if (k(S) && Array.isArray(S.MediaSources)) return {
              itemId: h,
              payload: S
            };
          }
          return null;
        } finally {
          clearTimeout(m);
        }
      } catch (i) {
        return console.warn("peer playback aggregation skipped:", a?.name, i?.message || i), null;
      }
    },
    async findPeerItemIdForIdentity(r, a, o, s) {
      const i = On(o);
      if (!i.size) return "";
      const c = lt(r, "/Items"), l = c.searchParams;
      l.set("Recursive", "true"), l.set("Fields", "ProviderIds,ProductionYear,SeriesName,IndexNumber,ParentIndexNumber");
      let d = "", u = "";
      for (const h of i) {
        if (h.startsWith("tmdb:")) {
          d = h.slice(5);
          break;
        }
        if (h.startsWith("episode:") && !u) {
          const g = h.slice(8), y = g.lastIndexOf(":"), _ = g.lastIndexOf(":", y - 1);
          _ > 0 && (u = g.slice(0, _));
        }
      }
      d ? (l.set("AnyProviderIdEquals", `tmdb.${d}`), l.set("Limit", "20")) : u ? (l.set("SearchTerm", u), l.set("IncludeItemTypes", "Episode"), l.set("Limit", "200")) : (l.set("SearchTerm", String(o?.Name || "")), l.set("Limit", "20"));
      const f = await t.fetchRequest(c, {
        method: "GET",
        headers: a,
        signal: s
      });
      if (!f?.ok) return "";
      const m = await Ga(f, ua), p = Array.isArray(m?.Items) ? m.Items : [];
      for (const h of p) {
        if (!k(h)) continue;
        const g = On(h);
        for (const y of g) {
          if (!i.has(y)) continue;
          const _ = String(h.Id ?? "").trim();
          if (_) return _;
        }
      }
      return "";
    },
    async buildPeerPlaybackVersionResponse(r, a, o) {
      if (!e.shouldAggregatePeerPlaybackVersions(r)) return null;
      const s = o?.playbackInfoRepresentation;
      if (!Pt(s)) return null;
      const i = await e.resolvePeerAggregationNodes(r, a);
      if (!i.length) return null;
      const c = await e.fetchOwnPlaybackItemIdentity(r, a, o);
      if (!c || !On(c).size) return null;
      const l = await Promise.all(i.map((m) => e.fetchPeerPlaybackVersionPayload(r, m, a, c))), d = [], u = /* @__PURE__ */ new Map();
      for (const m of i) {
        const p = await e.readPeerAggregationNode(m.name, a);
        u.set(m.name, String(p?.secret || ""));
      }
      i.forEach((m, p) => {
        d.push(...Ql(l[p]?.payload, m.name, l[p]?.itemId, (h, g) => ng(r?.requestUrl, h, u.get(h) || "", g)));
      });
      const f = eu(s.payload, d);
      return console.log("[peer_playback_version]", {
        peers: i.length,
        versions: f ? f.addedVersionCount : 0,
        ownSources: Array.isArray(s.payload.MediaSources) ? s.payload.MediaSources.length : 0
      }), f;
    }
  };
}
function Bh(n = {}, e = {}) {
  return {
    parsePlaybackSessionControlPayload(t, r = null) {
      if (t?.playbackSessionControlPayload) return t.playbackSessionControlPayload;
      const a = t?.requestUrl instanceof URL ? t.requestUrl : null, o = {};
      if (a) for (const [d, u] of a.searchParams.entries()) {
        const f = String(d || "").trim().toLowerCase();
        !f || o[f] !== void 0 || (o[f] = u);
      }
      const s = {
        query: o,
        body: {},
        parseError: !1,
        parseMode: "query_only",
        parseErrorReason: ""
      }, i = t.requestMethod;
      if (i === "GET" || i === "HEAD")
        return t && (t.playbackSessionControlPayload = s), s;
      if (r?.preparedBodyMode === "stream")
        return s.parseError = !0, s.parseMode = "stream", s.parseErrorReason = "unbuffered_body", t && (t.playbackSessionControlPayload = s), s;
      const c = String(r?.preparedBodyText || xa(r?.preparedBody));
      if (!c.trim())
        return t && (t.playbackSessionControlPayload = s), s;
      const l = String(r?.newHeaders?.get("Content-Type") || t?.request?.headers?.get("Content-Type") || "").toLowerCase().split(";", 1)[0].trim();
      try {
        if (l === "application/json" || l === "text/json" || l === "text/plain" || /^application\/[a-z0-9!#$&^_.+-]+\+json$/i.test(l)) {
          const d = JSON.parse(c);
          if (!k(d)) throw new TypeError("playback_control_body_not_object");
          s.body = sc(d), s.parseMode = l === "text/plain" ? "text_plain_json" : "json";
        } else if (l === "application/x-www-form-urlencoded") {
          const d = {};
          for (const [u, f] of new URLSearchParams(c).entries()) {
            const m = String(u || "").trim().toLowerCase();
            !m || d[m] !== void 0 || (d[m] = f);
          }
          s.body = d, s.parseMode = "form";
        } else
          s.parseError = !0, s.parseMode = "unsupported", s.parseErrorReason = "unsupported_content_type";
      } catch {
        s.parseError = !0, s.parseMode = l === "text/plain" ? "text_plain_invalid" : "invalid", s.parseErrorReason = "invalid_body";
      }
      return t && (t.playbackSessionControlPayload = s), s;
    },
    resolvePlaybackProgressSessionKey(t, r = null) {
      const a = e.parsePlaybackSessionControlPayload(t, r), o = (h = []) => {
        const g = Ls(a.query, h);
        if (String(g || "").trim()) return String(g).trim();
        const y = Ls(a.body, h);
        return String(y || "").trim();
      }, s = o(["SessionId"]), i = o(["PlaySessionId"]), c = o(["DeviceId"]), l = o(["ItemId"]), d = String(t?.nodeName || "unknown").trim().toLowerCase() || "unknown";
      let u = "", f = "", m = "weak";
      if (s)
        u = `session:${s}`, f = `session:${s}`, m = "strong";
      else if (i)
        u = `play:${i}`, f = `play:${i}`, m = "strong";
      else if (c)
        u = `device-item:${c}:${l}`, f = `device:${c}`;
      else {
        const h = t?.request?.headers;
        u = `fallback:${Pn([
          h?.get?.("Authorization"),
          h?.get?.("X-Emby-Token"),
          h?.get?.("X-MediaBrowser-Token"),
          h?.get?.("X-Emby-Device-Id"),
          c,
          t?.clientIp,
          l
        ].map((g) => String(g || "").trim()).join("|"))}`, f = u;
      }
      const p = Pn(`${d}|${f}`);
      return {
        sessionKey: `${d}|${u}`,
        sessionIdentityFingerprint: p,
        sessionFingerprint: Pn(`${p}|${l}`),
        sessionStrength: m,
        itemId: l,
        parseError: a.parseError === !0
      };
    }
  };
}
function Kh(n = {}, e = {}) {
  return {
    buildPlaybackProgressRelayEntry(t = 0, r = null) {
      return {
        lastForwardAt: 0,
        lastTouchedAt: $(),
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
    isPlaybackProgressRelayTerminal(t, r = $()) {
      return !t || String(t.terminalState || "").trim().toLowerCase() !== "stopped" ? !1 : Number(t.terminalTombstoneUntil || 0) > r;
    },
    markPlaybackProgressRelayStopped(t, r) {
      const a = ee.PlaybackProgressRelay;
      if (!(a instanceof Map) || !t) return null;
      const o = Math.max(0, Number(r?.videoProgressForwardIntervalSec) || 0) * 1e3, s = a.get(t) || e.buildPlaybackProgressRelayEntry(o, r?.ctx || null), i = $();
      s.intervalMs = o > 0 ? o : Math.max(0, Number(s.intervalMs) || 0), s.waitUntilCtx = r?.ctx || s.waitUntilCtx || null, s.nodeName = String(r?.nodeName || s.nodeName || "").trim().toLowerCase(), s.nodeRevision = String(r?.nodeDerivedCacheRevision || s.nodeRevision || "").trim();
      try {
        s.cancelScheduledDelay?.();
      } catch {
      }
      return s.cancelScheduledDelay = null, s.scheduledPromise = null, s.pendingSnapshot = null, s.scheduledFlushAt = 0, s.terminalState = "stopped", s.terminalAt = i, s.terminalTombstoneUntil = i + e.getPlaybackProgressRelayTerminalTtlMs(s.intervalMs), s.lastTouchedAt = i, ai(t, s) ? s : (So(s), null);
    },
    cleanupPlaybackProgressRelay(t = $()) {
      const r = ee.PlaybackProgressRelay;
      if (!(r instanceof Map) || r.size <= 0) return;
      const a = Math.max(3e4, Math.max(1, Number(Ji) || 1) * 2e4);
      for (const [s, i] of r) {
        const c = Number(i?.lastTouchedAt || i?.lastForwardAt || 0) || 0, l = !!i?.pendingSnapshot || !!i?.activeFlushPromise, d = Number(i?.terminalTombstoneUntil || 0) || 0;
        if (d > 0) {
          !l && d <= t && or(s);
          continue;
        }
        !l && c > 0 && c + a <= t && or(s);
      }
      const o = Math.max(1, Number(B.Defaults.VideoProgressForwardSessionMax) || 1);
      for (; r.size > o; ) {
        let s = "";
        for (const [i, c] of r) if (!c?.activeFlushPromise) {
          s = i;
          break;
        }
        if (!s) break;
        or(s);
      }
    },
    buildPlaybackProgressSnapshot(t, r, a, o) {
      if (!t || !r || typeof a != "function" || !Qe(o) || (r.preparedBodyMode === "buffered" && Number(r.preparedBody?.byteLength) || 0) > fd) return null;
      const s = r.preparedBodyMode === "buffered" && r.preparedBody ? r.preparedBody.slice(0) : r.preparedBody;
      return {
        ctx: t.ctx,
        nodeName: String(t.nodeName || "").trim().toLowerCase(),
        nodeRevision: String(t.nodeDerivedCacheRevision || "").trim(),
        targetRecord: o,
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
      const o = Math.max($(), Number(r.lastForwardAt) || 0) + a;
      r.scheduledFlushAt = o, r.lastTouchedAt = $();
      const s = du(Math.max(0, o - $())), i = (async () => {
        if (!await s.promise) return;
        const l = ee.PlaybackProgressRelay.get(t);
        !l || l !== r || Number(l.scheduledFlushAt) !== o || (l.scheduledFlushAt = 0, await e.flushPlaybackProgressRelayEntry(t, {
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
      const a = ee.PlaybackProgressRelay, o = a.get(t);
      if (!o || e.isPlaybackProgressRelayTerminal(o)) return !1;
      if (o.activeFlushPromise) {
        if (r.background === !0) return !1;
        try {
          await o.activeFlushPromise;
        } catch {
        }
      }
      if (!o.pendingSnapshot) return !1;
      const s = o.pendingSnapshot;
      o.pendingSnapshot = null;
      try {
        o.cancelScheduledDelay?.();
      } catch {
      }
      o.cancelScheduledDelay = null, o.scheduledPromise = null, o.scheduledFlushAt = 0, o.lastForwardAt = $(), o.lastTouchedAt = o.lastForwardAt;
      const i = (async () => {
        try {
          return await e.forwardPlaybackProgressSnapshot(s), !0;
        } catch {
          const c = a.get(t);
          return c && c === o && !c.pendingSnapshot && (c.pendingSnapshot = s, c.lastForwardAt = $(), c.lastTouchedAt = c.lastForwardAt), !1;
        } finally {
          const c = a.get(t);
          c && c === o && (c.activeFlushPromise = null, c.lastTouchedAt = $(), c.pendingSnapshot && e.schedulePlaybackProgressRelayFlush(t, c));
        }
      })();
      return o.activeFlushPromise = i, r.attachToCtx === !0 && o.waitUntilCtx?.waitUntil && o.waitUntilCtx.waitUntil(i), await i === !0;
    },
    async flushPlaybackProgressBeforeStopped(t) {
      const r = String(t?.progressForwardSessionKey || "").trim();
      if (!r) return !1;
      const a = ee.PlaybackProgressRelay.get(r);
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
    async maybeHandlePlaybackProgressRelay(t, r, a, o = []) {
      if (t?.requestTraits?.isPlaybackSessionControlRequest !== !0) return null;
      const s = Math.max(0, Number(t?.videoProgressForwardIntervalSec) || 0);
      if (t?.videoProgressForwardEnabled !== !0 || s <= 0 || !t?.ctx?.waitUntil)
        return t.progressForwardMode = "pass_through", null;
      const i = e.resolvePlaybackProgressSessionKey(t, r);
      if (t.progressForwardSessionKey = String(i.sessionKey || "").trim(), i.parseError)
        return t.progressForwardMode = "parse_bypass", null;
      if (t.requestTraits.isPlaybackStartedRequest === !0)
        return t.progressForwardMode = "started_passthrough", t.progressForwardSessionKey && or(t.progressForwardSessionKey), null;
      if (t.requestTraits.isPlaybackStoppedRequest === !0)
        return t.progressForwardMode = await e.flushPlaybackProgressBeforeStopped(t) ? "flush_before_stopped" : "stopped_passthrough", t.progressForwardSessionKey && e.markPlaybackProgressRelayStopped(t.progressForwardSessionKey, t), null;
      if (t.requestTraits.isPlaybackProgressRequest !== !0) return null;
      const c = Qe(o[0]) ? o[0] : null;
      if (!c)
        return t.progressForwardMode = "pass_through", null;
      if (t.requestMethod !== "GET" && t.requestMethod !== "HEAD" && r?.preparedBodyMode !== "buffered")
        return t.progressForwardMode = "unbuffered_bypass", null;
      const l = ee.PlaybackProgressRelay;
      e.cleanupPlaybackProgressRelay();
      const d = t.progressForwardSessionKey || `fallback:${t.clientIp}:${t.proxyPath}`;
      let u = l.get(d);
      u || (u = e.buildPlaybackProgressRelayEntry(s * 1e3, t.ctx)), u.intervalMs = s * 1e3, u.waitUntilCtx = t.ctx, u.nodeName = String(t.nodeName || "").trim().toLowerCase(), u.nodeRevision = String(t.nodeDerivedCacheRevision || "").trim();
      const f = $();
      if (u.lastTouchedAt = f, e.isPlaybackProgressRelayTerminal(u, f))
        return t.progressForwardMode = "late_progress_dropped_after_stopped", e.buildPlaybackProgressThrottleResponse(t);
      if (u.terminalState = "", u.terminalAt = 0, u.terminalTombstoneUntil = 0, !ai(d, u))
        return So(u), t.progressForwardMode = "capacity_bypass", null;
      if (!(u.lastForwardAt > 0 && f - u.lastForwardAt < u.intervalMs) && !u.activeFlushPromise && !u.pendingSnapshot)
        return u.pendingSnapshot = null, u.scheduledFlushAt = 0, u.lastForwardAt = f, t.progressForwardMode = "forward_now", null;
      const m = e.buildPlaybackProgressSnapshot(t, r, a, c);
      return m ? (u.pendingSnapshot = m, u.lastTouchedAt = f, t.progressForwardMode = "throttled_204", e.schedulePlaybackProgressRelayFlush(d, u), e.buildPlaybackProgressThrottleResponse(t)) : (t.progressForwardMode = "snapshot_bypass", null);
    }
  };
}
function zh(n = {}, e = {}) {
  return {
    ...Mh(n, e),
    ...Bh(n, e),
    ...Kh(n, e)
  };
}
function Wh(n = {}, e = {}) {
  const { nodeRepository: t } = n;
  return {
    resolveCorsOrigin(r, a) {
      const o = a.headers.get("Origin"), s = mi(r);
      return s.corsOrigins.length > 0 ? o && s.corsOriginSet.has(o) ? o : s.corsOrigins[0] : o || "*";
    },
    buildEdgeResponseHeaders(r, a = {}) {
      const o = new Headers({
        "Access-Control-Allow-Origin": r,
        "Cache-Control": "no-store",
        ...a
      });
      return De(o), o;
    },
    classifyRequest(r, a, o, s, i = {}) {
      const c = r.method, l = r.headers.get("Range"), d = r.headers.get("If-Range"), u = Jr.test(a) || Yr.test(a), f = Ed.test(a), m = yr.test(a), p = At.test(a), h = tc.test(a), g = Yo(a), y = r.headers.get("Upgrade")?.toLowerCase() === "websocket", _ = xc(a), S = Oc(a), T = vc(a), b = zf(a), A = S || T || b, C = Td.test(a) || /\/videos\/[^/]+\/(stream|original|download|file)/i.test(a) || /\/items\/[^/]+\/download/i.test(a) || o.searchParams.get("Static") === "true" || o.searchParams.get("Download") === "true", N = c === "GET" || c === "HEAD", P = C && !p && !h && !m && !u, E = _ || g || P || p || h, w = !u && !f && !m && !p && !h && !g && !P && !y, R = i.nodeDirectSource === !0 && N && P, D = i.directStaticAssets === !0 && N && f, x = i.directHlsDash === !0 && N && (p || h), L = R ? "entry_direct_media" : D ? "entry_direct_static_asset" : x ? "entry_direct_hls_dash" : "", F = !!L;
      return {
        rangeHeader: l,
        ifRangeHeader: d,
        enablePrewarm: s.enablePrewarm !== !1 && !F,
        prewarmCacheTtl: fe(s.prewarmCacheTtl, ld, 0, 3600),
        prewarmDepth: _c(s.prewarmDepth),
        prewarmPrefetchBytes: s.disablePrewarmPrefetch === !0 ? 0 : fe(s.prewarmPrefetchBytes, B.Defaults.PrewarmPrefetchBytes, 0, Bo),
        isImage: u,
        isStaticFile: f,
        isSubtitle: m,
        isManifest: p,
        isSegment: h,
        isSmartStrmMedia: g,
        isWsUpgrade: y,
        isBigStream: P,
        isPlaybackCriticalRequest: E,
        isApiRequest: w,
        isPlaybackInfoRequest: _,
        isPlaybackProgressRequest: S,
        isPlaybackStoppedRequest: T,
        isPlaybackStartedRequest: b,
        isPlaybackSessionControlRequest: A,
        isMetadataCacheable: c === "GET" && !y && !F && (u || m || p),
        nodeDirectMedia: R,
        directStaticAssets: D,
        directHlsDash: x,
        legacyEntryOffloadEnabled: F,
        legacyEntryOffloadReason: L,
        canStripAuthOnProtocolFallback: N && !w && (g || P || p || h)
      };
    },
    isEntryDirectDataPlaneMode(r) {
      const a = String(r || "").trim();
      return a === "entry_direct" || a === "legacy_entry_offload";
    },
    buildRoutingDecision(r = {}) {
      const a = String(r.action || "PROXY").trim().toUpperCase() === "DIRECT" ? "DIRECT" : "PROXY", o = String(r.phase || "unknown").trim() || "unknown", s = String(r.reason || "").trim() || (a === "DIRECT" ? "direct" : "proxy"), i = String(r.traceAction || (a === "DIRECT" ? "direct" : "proxy")).trim() || (a === "DIRECT" ? "direct" : "proxy"), c = String(r.traceLabel || s).trim() || s, l = Number(r.redirectStatus);
      return {
        phase: o,
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
      const a = r.requestTraits || {}, o = a.nodeDirectMedia ? "entry_direct_media" : a.directStaticAssets ? "entry_direct_static_asset" : a.directHlsDash ? "entry_direct_hls_dash" : "";
      return o ? e.buildRoutingDecision({
        phase: "entry",
        action: "DIRECT",
        dataPlaneMode: "entry_direct",
        reason: o,
        traceAction: "direct",
        redirectStatus: 307,
        traceLabel: o
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
      return Ur(r.routingDecisionMode) === "legacy" ? e.buildLegacyEntryRoutingDecision(r.requestTraits) : e.buildSimplifiedEntryRoutingDecision(r);
    },
    buildSimplifiedRedirectRoutingDecision(r, a, o, s, i = {}, c = {}) {
      const l = r.origin === a.origin, d = i.forceVideoDirect === !0, u = i.forceVideoProxy === !0, f = Um(i.currentStatus, o);
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
      return d ? e.buildRoutingDecision({
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
        traceLabel: u ? "node_video_proxy" : "proxy_follow"
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
    evaluateFirewall(r, a, o, s) {
      const i = mi(r);
      return i.ipBlacklist.has(a) ? new Response("Forbidden by IP Firewall", {
        status: 403,
        headers: e.buildEdgeResponseHeaders(s)
      }) : i.geoAllowlist.size > 0 && !i.geoAllowlist.has(o) || i.geoBlocklist.size > 0 && i.geoBlocklist.has(o) ? new Response("Forbidden by Geo Firewall", {
        status: 403,
        headers: e.buildEdgeResponseHeaders(s)
      }) : null;
    },
    applyRateLimit(r, a, o, s, i) {
      const c = parseInt(r.rateLimitRpm) || 0;
      if (!(c > 0 && o.isPlaybackCriticalRequest !== !0)) return null;
      let l = Ve.RateLimitCache.get(a);
      return (!l || s > l.resetAt) && (l = {
        count: 0,
        resetAt: s + 6e4
      }), l.count += 1, Ne(Ve.RateLimitCache, a, l, B.Defaults.RateLimitCacheMax), l.count > c ? new Response("Rate Limit Exceeded", {
        status: 429,
        headers: e.buildEdgeResponseHeaders(i)
      }) : null;
    },
    parseTargetRecords(r, a, o = {}) {
      const s = Array.isArray(o.cachedTargetRecords) ? o.cachedTargetRecords : [];
      if (s.length > 0 && s.every(Qe)) return {
        targetRecords: s,
        invalidResponse: null
      };
      const i = t.getOrderedNodeLines(r), c = (i.length ? i.map((l) => l.target) : String(r.target || "").split(",").map((l) => l.trim()).filter(Boolean)).map((l) => Ua(l)).filter(Qe);
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
function Gh(n) {
  if (!n || !n.body) return !0;
  const e = pn(n?.headers?.get("Content-Length"));
  return Number.isFinite(e) && e >= 0 && e <= Yi;
}
function Vh(n = {}, e = {}) {
  const { nodeRepository: t } = n;
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
        if (!Gh(r.request)) return {
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
      } : Xd(a) < 2 ? {
        eligible: !1,
        reason: "single_target"
      } : {
        eligible: !0,
        reason: "eligible"
      };
    },
    buildFailoverCacheKey(r, a, o) {
      return [
        String(r || "").toLowerCase().trim(),
        String(a || "").trim(),
        String(o || "").trim()
      ].filter(Boolean).join(":");
    },
    pruneFailoverStateEntry(r, a = da * 1e3, o = $()) {
      if (!r || typeof r != "object") return null;
      r.failingTargets instanceof Map || (r.failingTargets = /* @__PURE__ */ new Map());
      for (const [u, f] of r.failingTargets) Number(f) <= o && r.failingTargets.delete(u);
      Number(r.preferredTargetExpiresAt) <= o && (r.preferredTargetKey = "", r.preferredTargetExpiresAt = 0);
      const s = Number(r.lastProbeResult?.completedAt) || 0;
      r.lastProbeResult && s > 0 && s + Math.max(1e3, Number(a) || 0) <= o && (r.lastProbeResult = null), r.inFlightProbe && Number(r.inFlightProbe.expiresAt) <= o && (r.inFlightProbe = null);
      const i = !!String(r.preferredTargetKey || "").trim(), c = r.failingTargets.size > 0, l = !!r.inFlightProbe, d = !!r.lastProbeResult;
      return i || c || l || d ? r : null;
    },
    getOrCreateFailoverStateEntry(r, a = da * 1e3) {
      const o = String(r || "").trim();
      if (!o) return null;
      const s = ee.ProxyFailoverStateCache;
      let i = s.get(o);
      (!i || typeof i != "object") && (i = {
        preferredTargetKey: "",
        preferredTargetExpiresAt: 0,
        failingTargets: /* @__PURE__ */ new Map(),
        inFlightProbe: null,
        lastProbeResult: null
      });
      const c = e.pruneFailoverStateEntry(i, a, $()) || i;
      return Ne(s, o, c, lr), c;
    },
    getFailoverStateSnapshot(r, a = da * 1e3) {
      const o = String(r || "").trim();
      if (!o) return null;
      const s = ee.ProxyFailoverStateCache, i = s.get(o);
      if (!i) return null;
      const c = e.pruneFailoverStateEntry(i, a, $());
      return c ? (dn(s, o), {
        preferredTargetKey: String(c.preferredTargetKey || "").trim(),
        failingTargetKeys: [...c.failingTargets.keys()].map((l) => String(l || "").trim()).filter(Boolean),
        probeWinnerTargetKey: String(c.lastProbeResult?.status || "") === "ok" ? String(c.lastProbeResult?.winnerTargetKey || "").trim() : "",
        lastProbeResult: c.lastProbeResult && typeof c.lastProbeResult == "object" ? { ...c.lastProbeResult } : null,
        inFlightProbe: c.inFlightProbe ? {
          startedAt: Number(c.inFlightProbe.startedAt) || 0,
          reason: String(c.inFlightProbe.reason || "").trim()
        } : null
      }) : (s.delete(o), null);
    },
    buildFailoverStateSummary(r) {
      const a = r?.failoverContext && typeof r.failoverContext == "object" ? r.failoverContext : null, o = e.ensureFailoverTelemetry(r), s = a?.cacheKey ? e.getFailoverStateSnapshot(a.cacheKey, a.preferredTtlMs) : null;
      return {
        enabled: a?.enabled === !0,
        eligible: a?.eligible === !0,
        cacheKey: String(a?.cacheKey || "").trim() || null,
        reason: String(a?.eligibilityReason || "").trim() || null,
        overlay: String(o.overlay || "").trim() || null,
        preferredTarget: String(o.preferredTarget || s?.preferredTargetKey || "").trim() || null,
        probeWinner: String(o.probeWinner || s?.probeWinnerTargetKey || "").trim() || null,
        demotedTargets: Array.isArray(s?.failingTargetKeys) ? s.failingTargetKeys : [],
        inFlight: s?.inFlightProbe ? { reason: String(s.inFlightProbe.reason || "").trim() || null } : null
      };
    },
    buildFailoverDiagnosticDetail(r) {
      const a = r?.failoverContext && typeof r.failoverContext == "object" ? r.failoverContext : null;
      if (!a?.enabled) return "";
      const o = e.ensureFailoverTelemetry(r), s = e.buildFailoverStateSummary(r), i = [`Failover=${String(o.overlay || a.eligibilityReason || "ready").trim() || "ready"}`];
      return s.preferredTarget && i.push(`PreferredTarget=${s.preferredTarget}`), o.demotedTarget && i.push(`DemotedTarget=${o.demotedTarget}`), o.probeWinner && i.push(`ProbeWinner=${o.probeWinner}`), o.waitJoinMs > 0 && i.push(`WaitJoin=${o.waitJoinMs}ms`), o.fastFailReason && i.push(`FastFail=${o.fastFailReason}`), i.join(" | ");
    },
    reorderRetryTargetsForFailover(r, a = {}) {
      const o = Array.isArray(r) ? r.slice() : [];
      if (o.length <= 1) return o;
      const s = new Set((Array.isArray(a?.failingTargetKeys) ? a.failingTargetKeys : []).map((m) => String(m || "").trim()).filter(Boolean)), i = String(a?.preferredTargetKey || "").trim(), c = String(a?.probeWinnerTargetKey || "").trim(), l = i && !s.has(i) ? i : c && !s.has(c) ? c : "";
      if (!l && s.size <= 0) return o;
      const d = [], u = [], f = [];
      for (const m of o) {
        const p = qe(m);
        if (l && p === l && d.length <= 0 && !s.has(p)) {
          d.push(m);
          continue;
        }
        if (s.has(p)) {
          f.push(m);
          continue;
        }
        u.push(m);
      }
      return [
        ...d,
        ...u,
        ...f
      ];
    },
    prepareFailoverOverlay(r, a = []) {
      const o = e.ensureFailoverTelemetry(r), s = qd(a), i = Math.max(1e3, (Number(r?.hedgePreferredTtlSec) || da) * 1e3), c = e.isFailoverEligible(r, a), l = e.buildFailoverCacheKey(r?.nodeName, s, r?.nodeDerivedCacheRevision), d = c.eligible ? e.getFailoverStateSnapshot(l, i) : null, u = c.eligible ? e.reorderRetryTargetsForFailover(a, d) : Array.isArray(a) ? a.slice() : [];
      let f = "disabled";
      return r?.hedgeFailoverEnabled === !0 && (c.eligible ? d?.preferredTargetKey ? f = "preferred_reordered" : d?.probeWinnerTargetKey ? f = "probe_hint_reordered" : Array.isArray(d?.failingTargetKeys) && d.failingTargetKeys.length > 0 ? f = "failure_demoted" : f = "ready" : f = c.reason || "ineligible"), o.overlay = f, o.preferredTarget = String(d?.preferredTargetKey || "").trim(), r.failoverContext = {
        enabled: r?.hedgeFailoverEnabled === !0,
        eligible: c.eligible,
        eligibilityReason: c.reason,
        cacheKey: l,
        orderedTargetSignature: s,
        preferredTtlMs: i,
        probePath: ka(r?.hedgeProbePath, Wi),
        probePreferGet: r?.hedgeProbePreferGet !== !1,
        probeTimeoutMs: Math.max(250, Number(r?.hedgeProbeTimeoutMs) || Ho),
        probeParallelism: Math.max(1, Math.min(2, Number(r?.hedgeProbeParallelism) || Gi)),
        waitTimeoutMs: Math.max(250, Number(r?.hedgeWaitTimeoutMs) || Vi),
        lockTtlMs: Math.max(1e3, Number(r?.hedgeLockTtlMs) || ji),
        failureCooldownMs: Math.max(1e3, (Number(r?.hedgeFailureCooldownSec) || qi) * 1e3),
        wakeJitterMs: Math.max(0, Number(r?.hedgeWakeJitterMs) || Xi),
        originalTargetRecords: Array.isArray(a) ? a.slice() : [],
        retryTargetRecords: u.slice(),
        snapshot: d
      }, u;
    },
    maybeInvalidateHotSnapshotOnFailover(r, a) {
      if (String(r?.targetHotCacheState || "").trim() !== "hit") return;
      const o = qe(a);
      o && (Array.isArray(r?.playbackRouteHotTargetRecords) ? r.playbackRouteHotTargetRecords : []).map((s) => qe(s)).filter(Boolean).includes(o) && t.invalidatePlaybackRouteHotCache(r?.nodeName, r?.env);
    },
    markFailoverTargetFailure(r, a, o = "", s = {}) {
      const i = r?.failoverContext;
      if (!i?.eligible) return;
      const c = qe(a);
      if (!c) return;
      const l = e.ensureFailoverTelemetry(r), d = e.getOrCreateFailoverStateEntry(i.cacheKey, i.preferredTtlMs);
      d && (d.failingTargets.set(c, $() + i.failureCooldownMs), String(d.preferredTargetKey || "").trim() === c && (d.preferredTargetKey = "", d.preferredTargetExpiresAt = 0), Ne(ee.ProxyFailoverStateCache, i.cacheKey, d, lr), l.overlay = String(s.overlay || "target_demoted").trim() || "target_demoted", l.demotedTarget = c, l.fastFailReason = String(o || s.fastFailReason || l.fastFailReason || "").trim(), e.maybeInvalidateHotSnapshotOnFailover(r, a));
    },
    markFailoverBusinessSuccess(r, a, o = {}) {
      const s = r?.failoverContext;
      if (!s?.eligible) return;
      const i = Number(o.status) || 0;
      if (!(i >= 200 && i < 300 || i === 206 || i >= 300 && i < 400)) return;
      const c = qe(a);
      if (!c) return;
      const l = e.ensureFailoverTelemetry(r), d = e.getOrCreateFailoverStateEntry(s.cacheKey, s.preferredTtlMs);
      d && (d.failingTargets.delete(c), d.preferredTargetKey = c, d.preferredTargetExpiresAt = $() + s.preferredTtlMs, Ne(ee.ProxyFailoverStateCache, s.cacheKey, d, lr), l.overlay = String(o.overlay || "preferred_promoted").trim() || "preferred_promoted", l.preferredTarget = c);
    },
    getFailoverProbeCandidates(r, a = {}) {
      const o = r?.failoverContext;
      if (!o?.eligible) return [];
      const s = e.getFailoverStateSnapshot(o.cacheKey, o.preferredTtlMs), i = e.reorderRetryTargetsForFailover(o.originalTargetRecords, s), c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), d = qe(a.failedTargetRecord), u = qe(a.activeTargetRecord), f = String(a.excludeTargetKey || "").trim();
      return d && c.add(d), u && c.add(u), f && c.add(f), i.filter((m) => {
        const p = qe(m);
        return !p || c.has(p) || l.has(p) ? !1 : (l.add(p), !0);
      }).slice(0, o.probeParallelism);
    }
  };
}
function jh(n = {}, e = {}) {
  return {
    buildFailoverProbeHeaders(t = "") {
      return new Headers(ko(t));
    },
    async performFailoverProbeRequest(t, r, a, o, s = null, i = null) {
      const c = nh([
        t?.request?.signal,
        t?.requestLifecycle?.signal,
        s
      ]);
      let l = null, d = !1;
      try {
        return o > 0 && (l = setTimeout(() => {
          d = !0, c.abort(`probe_timeout_${o}ms`);
        }, o)), await ze(r.toString(), {
          method: a,
          headers: e.buildFailoverProbeHeaders(i ?? t?.request?.headers?.get("User-Agent")),
          redirect: "manual",
          signal: c.signal
        });
      } catch (u) {
        if (d) {
          const f = /* @__PURE__ */ new Error(`probe_timeout_${o}ms`);
          throw f.code = "UPSTREAM_TIMEOUT", f;
        }
        throw t?.requestLifecycle?.getAbortReason?.() && Wt(u) ? fr(t.requestLifecycle.getAbortReason()) : u;
      } finally {
        l !== null && clearTimeout(l), c.dispose();
      }
    },
    async runFailoverProbeCandidate(t, r, a = {}) {
      const o = t?.failoverContext, s = o?.probePath || ka(t?.hedgeProbePath, Wi), i = Math.max(250, Number(o?.probeTimeoutMs) || Ho), c = qe(r), l = dl(r, [s]);
      if (!l.length) return {
        ok: !1,
        status: 0,
        targetRecord: r,
        targetKey: c,
        reason: "invalid_probe_target",
        elapsedMs: 0
      };
      const d = $(), u = o?.probePreferGet !== !1;
      for (let f = 0; f < l.length; f += 1) {
        const m = l[f].probeUrl, p = f < l.length - 1;
        let h = null, g = u ? "GET" : "HEAD";
        try {
          if (h = await e.performFailoverProbeRequest(t, m, g, i, a.parentSignal || null), !u && (h.status === 405 || h.status === 501)) {
            try {
              h.body?.cancel?.();
            } catch {
            }
            g = "GET", h = await e.performFailoverProbeRequest(t, m, "GET", i, a.parentSignal || null);
          }
          const y = String(t?.request?.headers?.get("User-Agent") || "").trim();
          if (h.status === 403 && y && y !== ro) {
            const T = Number(o?.waitTimeoutMs) || 0, b = T > 0 ? Math.min(i, T - ($() - d)) : i;
            if (b >= 250) {
              try {
                h.body?.cancel?.();
              } catch {
              }
              h = await e.performFailoverProbeRequest(t, m, g, b, a.parentSignal || null, ro);
            }
          }
          const _ = Math.max(0, $() - d), S = Number(h.status) || 0;
          if (S >= 200 && S < 400 || S === 403) {
            const T = h.status;
            try {
              h.body?.cancel?.();
            } catch {
            }
            return {
              ok: !0,
              status: T,
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
          const _ = Math.max(0, $() - d), S = String(y?.code || "").trim().toUpperCase(), T = String(t?.requestLifecycle?.getAbortReason?.() || "").trim();
          return T ? {
            ok: !1,
            targetRecord: r,
            targetKey: c,
            reason: T.toLowerCase(),
            elapsedMs: _,
            aborted: !0
          } : String(a.parentSignal?.reason || "").trim() === "probe_winner" && Wt(y) ? {
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
            aborted: Wt(y)
          };
        }
      }
    },
    async runFailoverProbeTask(t, r, a = {}) {
      const o = t?.failoverContext;
      if (!o?.eligible) return {
        status: "skipped",
        reason: "ineligible",
        winnerTargetRecord: null,
        winnerTargetKey: "",
        elapsedMs: 0,
        attempts: []
      };
      const s = Array.isArray(r) ? r.slice(0, o.probeParallelism) : [];
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
      const d = $();
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
      const u = Math.max(0, $() - d), f = e.getOrCreateFailoverStateEntry(o.cacheKey, o.preferredTtlMs), m = l ? "ok" : "miss", p = l ? String(a.reason || "probe_ok").trim() || "probe_ok" : String(c.find((_) => _?.aborted !== !0 && _?.reason)?.reason || "probe_no_winner").trim() || "probe_no_winner", h = l && typeof l == "object" ? l : null, g = String(h ? h.targetKey : "").trim(), y = h ? h.targetRecord : null;
      return f && (f.lastProbeResult = {
        status: m,
        reason: p,
        winnerTargetKey: g,
        completedAt: $(),
        elapsedMs: u
      }, Ne(ee.ProxyFailoverStateCache, o.cacheKey, f, lr)), {
        status: m,
        reason: p,
        winnerTargetRecord: y,
        winnerTargetKey: g,
        elapsedMs: u,
        attempts: c
      };
    },
    startOrJoinFailoverProbe(t, r = {}) {
      const a = t?.failoverContext, o = e.ensureFailoverTelemetry(t);
      if (!a?.eligible) return null;
      const s = e.getOrCreateFailoverStateEntry(a.cacheKey, a.preferredTtlMs), i = $();
      if (s?.inFlightProbe && Number(s.inFlightProbe.expiresAt) > i && s.inFlightProbe.promise)
        return o.overlay = (r.background === !0 ? "background_probe_joined" : "probe_joined").trim(), {
          joined: !0,
          startedAt: Number(s.inFlightProbe.startedAt) || i,
          promise: s.inFlightProbe.promise
        };
      const c = e.getFailoverProbeCandidates(t, r);
      if (!c.length)
        return o.fastFailReason = "no_probe_candidates", o.overlay = "no_probe_candidates", {
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
      const l = `${i}-${Math.random().toString(36).slice(2, 10)}`, d = e.runFailoverProbeTask(t, c, r).finally(() => {
        const u = e.getOrCreateFailoverStateEntry(a.cacheKey, a.preferredTtlMs);
        !u?.inFlightProbe || String(u.inFlightProbe.token || "").trim() !== l || (u.inFlightProbe = null, Ne(ee.ProxyFailoverStateCache, a.cacheKey, u, lr));
      });
      return s && (s.inFlightProbe = {
        token: l,
        startedAt: i,
        expiresAt: i + a.lockTtlMs,
        reason: String(r.reason || "").trim(),
        promise: d
      }, Ne(ee.ProxyFailoverStateCache, a.cacheKey, s, lr)), o.overlay = (r.background === !0 ? "background_probe_started" : "probe_started").trim(), {
        joined: !1,
        startedAt: i,
        promise: d
      };
    },
    async maybeRunForegroundFailoverWait(t, r = {}) {
      const a = t?.execution, o = a?.failoverContext, s = e.ensureFailoverTelemetry(a);
      if (!o?.eligible || a?.failoverForegroundWaitUsed === !0) return null;
      a.failoverForegroundWaitUsed = !0;
      const i = r.targetRecord, c = Number(r.responseStatus) || 0, l = String(r.reason || (c > 0 ? `upstream_status_${c}` : "retryable_failure")).trim() || "retryable_failure";
      e.markFailoverTargetFailure(a, i, l, { overlay: "failure_demoted" });
      const d = e.startOrJoinFailoverProbe(a, {
        reason: l,
        failedTargetRecord: i
      });
      if (!d?.promise) return null;
      const u = await oh(d.promise, o.waitTimeoutMs, a?.requestLifecycle);
      if (s.waitJoinMs = u.timedOut === !0 ? o.waitTimeoutMs : Math.max(0, $() - Number(d.startedAt || $())), u.timedOut === !0)
        return s.overlay = "probe_wait_timeout", s.fastFailReason = "probe_wait_timeout", null;
      const f = u.value && typeof u.value == "object" ? u.value : null;
      if (s.probeReason = d.joined === !0 ? "join_existing_probe" : l, s.probeElapsedMs = Math.max(0, Number(f?.elapsedMs) || 0), s.probeWinner = String(f?.winnerTargetKey || "").trim(), !f || f.status !== "ok" || !Qe(f.winnerTargetRecord))
        return s.overlay = "probe_miss", s.fastFailReason = String(f?.reason || "probe_no_winner").trim() || "probe_no_winner", null;
      const m = qe(i), p = qe(f.winnerTargetRecord);
      if (!p || p === m)
        return s.overlay = "probe_miss", s.fastFailReason = "probe_reused_failed_target", null;
      o.wakeJitterMs > 0 && await sh(Math.floor(Math.random() * (o.wakeJitterMs + 1)), a?.requestLifecycle);
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
          const y = lt(f.winnerTargetRecord, t.proxyPath);
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
      const o = e.getFailoverStateSnapshot(a.cacheKey, a.preferredTtlMs);
      if ((Array.isArray(o?.failingTargetKeys) ? o.failingTargetKeys : []).length <= 0) return;
      const s = Number(o?.lastProbeResult?.completedAt) || 0;
      if (s > 0 && s + a.preferredTtlMs > $() || o?.inFlightProbe) return;
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
function qh(n = {}, e = {}) {
  return {
    ...Wh(n, e),
    ...Vh(n, e),
    ...jh(n, e)
  };
}
function Xh(n = {}, e = {}) {
  const t = {
    async buildProxyRequestState(r, a, o, s, i, c, l, d, u = {}) {
      const f = zg(r.headers);
      Ta.forEach((F) => f.delete(F));
      const m = /* @__PURE__ */ new Set();
      let p = null;
      if (a.headers && typeof a.headers == "object") for (const [F, I] of Object.entries(a.headers)) {
        const U = String(F).toLowerCase();
        Ta.has(U) || (m.add(U), U === "cookie" ? p = String(I) : f.set(F, String(I)));
      }
      const h = ii(f.get("Cookie"), p, ["auth_token", ...Aa]);
      h ? f.set("Cookie", h) : f.delete("Cookie");
      const g = p ? ii(null, p, ["auth_token", ...Aa]) : null;
      di(f, u.effectiveMediaAuthMode || a.mediaAuthMode, qg(s));
      const y = cf(u.effectiveRealClientIpMode || a.realClientIpMode);
      y === "none" && Ad.forEach((F) => f.delete(F)), (y === "full" || y === "real-ip-only") && f.set("X-Real-IP", i), y === "full" && f.set("X-Forwarded-For", i), f.set("X-Forwarded-Host", s.host), f.set("X-Forwarded-Proto", s.protocol.replace(":", "")), c.isWsUpgrade ? (f.set("Upgrade", "websocket"), f.set("Connection", "Upgrade")) : l && f.set("Connection", "keep-alive"), (c.isBigStream || c.isSmartStrmMedia || c.isSegment || c.isManifest) && !m.has("referer") && f.delete("Referer");
      const _ = m.has("origin"), S = m.has("referer"), T = f.has("Origin"), b = f.has("Referer");
      let A = "", C = "/";
      if (b && !S) try {
        const F = new URL(f.get("Referer") || "");
        A = String(F.origin || "").trim(), C = `${F.pathname || "/"}${F.search || ""}` || "/";
      } catch {
        A = "", C = "/";
      }
      const N = {
        baseHeaderEntries: [...f.entries()],
        hasOriginHeader: T,
        hasRefererHeader: b,
        adminCustomHasOrigin: _,
        adminCustomHasReferer: S,
        refererOrigin: A,
        refererPathAndSearch: C,
        adminCookie: g
      }, P = r.method !== "GET" && r.method !== "HEAD";
      let E = null, w = "none", R = "";
      if (P && r.body) {
        const F = pn(r.headers.get("Content-Length"));
        if (Number.isFinite(F) && F >= 0 && F <= Yi) try {
          E = await r.clone().arrayBuffer(), w = "buffered", (c.isPlaybackInfoRequest === !0 || c.isPlaybackSessionControlRequest === !0) && (R = xa(E));
        } catch {
          E = r.body, w = "stream";
        }
        else
          E = r.body, w = "stream";
      }
      const D = c?.isPlaybackInfoRequest === !0 && w !== "stream", x = !P || D, L = x ? d : d.slice(0, 1);
      return {
        newHeaders: f,
        adminCustomHeaders: m,
        transportTemplate: N,
        preparedBody: E,
        preparedBodyMode: w,
        preparedBodyText: R,
        retryTargetRecords: L,
        allowAutomaticRetry: x,
        allowSameTargetRetry: !P,
        clientRedirectAuthPolicy: ra(f)
      };
    },
    buildProxyResponseHeaders(r, a, o, s, i, c = {}) {
      const l = new Headers(r.headers);
      Rd.forEach((f) => l.delete(f)), l.set("Access-Control-Allow-Origin", s), o && o["Access-Control-Expose-Headers"] && l.set("Access-Control-Expose-Headers", o["Access-Control-Expose-Headers"]), o && o["Access-Control-Allow-Methods"] && l.set("Access-Control-Allow-Methods", o["Access-Control-Allow-Methods"]);
      const d = a.headers.get("Access-Control-Request-Headers");
      d ? (l.set("Access-Control-Allow-Headers", d), zr(l, "Access-Control-Request-Headers")) : o && o["Access-Control-Allow-Headers"] && l.set("Access-Control-Allow-Headers", o["Access-Control-Allow-Headers"]), s !== "*" && zr(l, "Origin"), (!c.enableH3 || c.forceH1) && l.delete("Alt-Svc");
      const u = fe(c.imageCacheMaxAge, Qi * 86400, 0, 365 * 86400);
      if (r.status >= 400 || i.isManifest || i.isBigStream || i.isSmartStrmMedia) l.set("Cache-Control", "no-store");
      else if (c.proxiedExternalRedirect) l.set("Cache-Control", "no-store");
      else if (i.isImage || i.isStaticFile || i.isSubtitle) {
        const f = Tg(a) ? "private" : "public";
        l.set("Cache-Control", `${f}, max-age=${u}`);
      }
      return De(l), l;
    },
    applyProxyRedirectHeaders(r, a, o, s, i, c, l, d = {}) {
      const u = (h) => {
        const g = Gs(h instanceof URL ? h.toString() : String(h || ""), o), y = d.externalRedirectAuth;
        if (!y || y.canDirect !== !0 || !/^https?:\/\//i.test(g)) return g;
        try {
          const _ = new URL(g);
          return d.workerOrigin && _.origin === d.workerOrigin ? g : mn(_, y.policy, y.mode).toString();
        } catch {
          return g;
        }
      };
      if (c) {
        ml(r), r.set("Location", u(c)), r.set("Cache-Control", "no-store");
        return;
      }
      if (!tl(a.status)) {
        const h = r.get("Location");
        h && r.set("Location", Gs(h, o));
        return;
      }
      const f = r.get("Location");
      if (!f) return;
      const m = Ia(f, l || o);
      if (!m) {
        r.delete("Location");
        return;
      }
      const p = oi(m, o, s, i, {
        linkVariant: d.linkVariant,
        entryMode: d.entryMode
      });
      p && r.set("Location", u(p));
    },
    buildClientVisibleRedirectUrl(r, a, o, s, i, c = {}) {
      const l = r instanceof URL ? r : Ia(r, a);
      if (!l) return null;
      if (c.preserveWorkerProxy !== !0) return l;
      const d = oi(l, a, o, s, {
        linkVariant: c.linkVariant,
        entryMode: c.entryMode
      }), u = nt(o, s, {
        linkVariant: c.linkVariant,
        entryMode: c.entryMode
      });
      if (!d || !String(d).startsWith(u)) return l;
      try {
        const f = i instanceof URL ? i : new URL(String(i || ""));
        return new URL(d, f);
      } catch {
        return l;
      }
    },
    buildPlaybackInfoClientVisibleUrl(r, a = "/", o = {}) {
      const s = Z(a), i = String(o.search || ""), c = String(o.hash || "");
      return String(r?.playbackInfoRewriteUrlMode || "").trim() === "absolute" ? pl(r?.requestUrl || r?.rawRequestUrl || "https://playback-info.local/", r?.nodeName, r?.nodeKey, s, {
        linkVariant: r?.linkVariant,
        entryMode: r?.entryMode,
        search: i,
        hash: c
      }).toString() : `${ig(og(s, r?.nodeName, r?.nodeKey, { entryMode: r?.entryMode }), sg(r))}${i}${c}`;
    },
    buildPlaybackInfoProxyUrl(r, a, o, s) {
      const i = String(a || "").trim();
      if (!i) return "";
      const c = Zp(i, r?.proxyPath || "/", o, r?.requestUrl || r?.rawRequestUrl || s, nt(r?.nodeName, r?.nodeKey, {
        linkVariant: r?.linkVariant,
        entryMode: r?.entryMode
      }));
      if (c) return t.buildPlaybackInfoClientVisibleUrl(r, c.proxyPath, {
        search: c.search,
        hash: c.hash
      });
      let l;
      try {
        const u = s instanceof URL ? s : new URL(String(s || ""));
        l = new URL(i, u);
      } catch {
        return i;
      }
      if (!["http:", "https:"].includes(String(l.protocol || "").toLowerCase())) return i;
      if (o) {
        const { resolvedUrl: u, proxyPath: f } = Ha(l, o);
        if (u && f) {
          const m = eg(f, r?.proxyPath || "/", o);
          return t.buildPlaybackInfoClientVisibleUrl(r, m, {
            search: u.search,
            hash: u.hash
          });
        }
      }
      const d = ag(r?.requestUrl || r?.rawRequestUrl || "https://playback-info.local/", r?.nodeName, r?.nodeKey, l, {
        linkVariant: r?.linkVariant,
        entryMode: r?.entryMode
      });
      return String(r?.playbackInfoRewriteUrlMode || "").trim() === "absolute" ? d.toString() : t.buildPlaybackInfoClientVisibleUrl(r, d.pathname || "/", {
        search: d.search || "",
        hash: d.hash || ""
      });
    },
    sanitizePlaybackInfoSerializedResponseHeaders: Sn,
    parsePlaybackInfoRootObject: Lo,
    normalizeMediaAuthHeaders: di,
    appendMediaRedirectAuthToUrl: mn,
    buildPlaybackInfoContractErrorState(r, a, o = "invalid_payload", s = null) {
      const i = a?.response;
      return r.playbackInfoRewrite = "rejected", e.buildProxyErrorState(r, a, {
        message: "Upstream PlaybackInfo response must be a JSON object.",
        guardHeader: "X-Proxy-Contract-Guard",
        guardValue: "playback-info",
        details: k(s) ? s : {
          reason: String(o || "invalid_payload"),
          upstreamStatus: Number(i?.status) || 0,
          contentType: pr(i?.headers?.get?.("Content-Type")) || "missing"
        }
      });
    },
    async guardPlaybackInfoResponseContract(r, a) {
      if (r?.requestTraits?.isPlaybackInfoRequest !== !0 || Pt(a?.playbackInfoRepresentation) && a.playbackInfoRepresentation.response === a?.response) return a;
      const o = await Yl(a?.response, {
        requestMethod: r.requestMethod,
        maxBytes: $o
      });
      return o.kind === "skip" ? a : o.kind === "invalid" ? o.reason === "body_too_large" ? (r.playbackInfoRewrite = "skipped_oversized", a) : t.buildPlaybackInfoContractErrorState(r, a, o.reason, o.details) : {
        ...a,
        playbackInfoRepresentation: o.representation
      };
    },
    decodePlaybackInfoJsonValue: Qa,
    normalizePlaybackInfoObjectArray: No,
    sanitizePlaybackInfoMediaSource: Ti,
    sanitizePlaybackInfoMediaSourcesPayload: Do,
    rewritePlaybackInfoPayload(r, a, o, s) {
      return Ai(a, { buildProxyUrl: (i) => t.buildPlaybackInfoProxyUrl(r, i, o, s) });
    },
    async maybeRewritePlaybackInfoResponse(r, a) {
      if (r?.requestTraits?.isPlaybackInfoRequest !== !0) return a;
      const o = qt(r?.effectivePlaybackInfoMode) === "rewrite", s = o ? "not_needed" : "passthrough", i = a?.response;
      if (!i || !(i.status >= 200 && i.status < 300) || r.requestMethod === "HEAD" || i.status === 204 || i.status === 205 || !i.body)
        return r.playbackInfoRewrite !== "rejected" && (r.playbackInfoRewrite = s), a;
      if ((!Pt(a?.playbackInfoRepresentation) || a.playbackInfoRepresentation.response !== i) && (a = await t.guardPlaybackInfoResponseContract(r, a), !Pt(a?.playbackInfoRepresentation)))
        return a;
      try {
        const c = tu(a.playbackInfoRepresentation, {
          rewriteEnabled: o,
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
function Yh({ configReader: n, nodeRepository: e, logger: t, cachePort: r, fetchPort: a }) {
  const o = {}, s = {
    CacheManager: r,
    Logger: t,
    configReader: n,
    fetchPort: a,
    nodeRepository: e
  }, i = [
    uh(s, o),
    gh(s, o),
    zh(s, o),
    qh(s, o),
    Xh(s, o),
    $h(s, o)
  ];
  for (const c of i) for (const [l, d] of Object.entries(c)) o[l] = d;
  return o;
}
function Jh({ configReader: n, nodeRepository: e, logger: t, cachePort: r, fetchPort: a }) {
  const o = Yh({
    configReader: n,
    nodeRepository: e,
    logger: t,
    cachePort: r,
    fetchPort: a
  });
  return Object.freeze({
    handle: (...s) => o.handle(...s),
    testingSupport: o
  });
}
function Qh(n = {}, e = {}) {
  return {
    getStatsBucketParts(t, r = B.Defaults.ScheduleUtcOffsetMinutes) {
      const a = ut(Number(t) || 0, r);
      return {
        bucketDate: a.dateKey,
        bucketHour: a.hour
      };
    },
    summarizeStatsHourlyEntries(t = [], r = {}) {
      const a = Ue(r.utcOffsetMinutes), o = /* @__PURE__ */ new Map();
      for (const s of Array.isArray(t) ? t : []) {
        const i = Number(s?.timestamp) || 0;
        if (i <= 0) continue;
        const { bucketDate: c, bucketHour: l } = e.getStatsBucketParts(i, a), d = `${c}:${l}`, u = o.get(d) || {
          bucketDate: c,
          bucketHour: l,
          requestCount: 0,
          playCount: 0,
          playbackInfoCount: 0
        };
        u.requestCount += 1, pf(s?.requestPath, s?.category) && (u.playCount += 1), mf(s?.requestPath, s?.category) && (u.playbackInfoCount += 1), o.set(d, u);
      }
      return [...o.values()].sort((s, i) => s.bucketDate !== i.bucketDate ? String(s.bucketDate).localeCompare(String(i.bucketDate)) : Number(s.bucketHour) - Number(i.bucketHour));
    },
    async incrementStatsHourly(t, r = [], a = {}) {
      if (!t || !await e.hasStatsHourlyTable(t)) return !1;
      const o = e.summarizeStatsHourlyEntries(r, a);
      return o.length ? await e.upsertStatsHourlyBuckets(t, o, a) : !0;
    },
    async upsertStatsHourlyBuckets(t, r = [], a = {}) {
      if (!t || !await e.hasStatsHourlyTable(t)) return !1;
      const o = (Array.isArray(r) ? r : []).map((c) => ({
        bucketDate: String(c?.bucketDate || "").trim(),
        bucketHour: Math.max(0, Number(c?.bucketHour) || 0),
        requestCount: Math.max(0, Number(c?.requestCount) || 0),
        playCount: Math.max(0, Number(c?.playCount) || 0),
        playbackInfoCount: Math.max(0, Number(c?.playbackInfoCount) || 0)
      })).filter((c) => c.bucketDate);
      if (!o.length) return !0;
      const s = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), i = Xa("proxy_stats_hourly.batch", JSON.stringify(o));
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
      return Number.isFinite(r) ? Ue(r) : null;
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
      const a = e.resolveOpsStatusStores(t), o = a?.db || null;
      if (!o || !await e.hasStatsHourlyTable(o)) return {
        rebuilt: !1,
        reason: "stats_unavailable"
      };
      const s = ce(r.config || {}), i = Ue(s.scheduleUtcOffsetMinutes), c = await e.getOpsStatusSection(a, "log");
      if (e.getStatsUtcOffsetMinutesFromStatus(c) === i && r.force !== !0) return {
        rebuilt: !1,
        reason: "already_aligned",
        utcOffsetMinutes: i
      };
      const l = r.now instanceof Date ? r.now : /* @__PURE__ */ new Date(), d = fe(s.logRetentionDays, B.Defaults.LogRetentionDays, 1, B.Defaults.LogRetentionDaysMax), u = Math.max(0, l.getTime() - d * 24 * 60 * 60 * 1e3), f = l.getTime();
      return await e.rebuildStatsHourlyWindow(o, {
        startTs: u,
        endTs: f,
        utcOffsetMinutes: i
      }), await e.patchOpsStatus(a, { log: {
        schemaReady: !0,
        statsReady: !0,
        statsUtcOffsetMinutes: i,
        statsAlignedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
        statsAlignedWindowStartAt: new Date(u).toISOString(),
        statsAlignedWindowEndAt: new Date(f).toISOString()
      } }), {
        rebuilt: !0,
        utcOffsetMinutes: i,
        startTs: u,
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
      return r ? e.getLegacyLogsFtsTriggerNames().has(r.toLowerCase()) ? !0 : Dr(t?.sql || "").includes(e.LOGS_FTS_TABLE.toLowerCase()) : !1;
    },
    async dropLogsFtsSyncTriggers(t) {
      if (!t) return 0;
      let r = 0, a = [];
      try {
        a = (await t.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'trigger' AND tbl_name = ?").bind(e.LOGS_TABLE).all())?.results || [];
      } catch {
      }
      for (const o of a) {
        const s = String(o?.name || "").trim();
        s && e.isLogsFtsSyncTrigger(o) && (await t.prepare(`DROP TRIGGER IF EXISTS ${de(s)}`).run(), r += 1);
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
      const o = await e.getLogsFtsReadiness(t);
      if (o.ready && !a) return {
        migratedRows: 0,
        droppedTriggers: 0,
        rebuilt: !1,
        recreated: !1
      };
      if (o.tableReady && !a) {
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
function Zh(n = {}, e = {}) {
  return {
    async ensureDnsIpWorkspaceSchema(t) {
      if (!t) return !1;
      if (e.isD1SchemaReadyCached(t, "dnsIpWorkspaceSchema")) return !0;
      let r = te.DnsIpWorkspaceDbReady.get(t);
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
        throw te.DnsIpWorkspaceDbReady.delete(t), a;
      }), te.DnsIpWorkspaceDbReady.set(t, r));
      try {
        return await r;
      } finally {
        te.DnsIpWorkspaceDbReady.get(t) === r && te.DnsIpWorkspaceDbReady.delete(t);
      }
    },
    getDnsIpPoolRevisionFromStatus(t = {}) {
      const r = String(t?.revision || "").trim();
      return r || zt("dns_ip_pool", String(t?.updatedAt || "").trim());
    },
    async bumpDnsIpPoolRevision(t, r = {}, a = null) {
      const o = await e.getOpsStatusSection(t, "dnsIpPool"), s = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), i = ie(`${e.getDnsIpPoolRevisionFromStatus(o)}:${s}:${ae(r)}`);
      return await e.patchOpsStatus(t, { dnsIpPool: {
        ...r,
        revision: zt(i, s),
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
        return (Array.isArray(r?.results) ? r.results : []).map((a) => gr(a)).filter(Boolean);
      } catch {
        return [];
      }
    },
    async upsertDnsIpPoolItems(t, r = [], a = {}) {
      if (!t) return [];
      await e.ensureDnsIpWorkspaceSchema(t);
      const o = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), s = /* @__PURE__ */ new Map();
      for (const d of Array.isArray(r) ? r : []) {
        const u = gr(d, {
          createdAt: o,
          updatedAt: o,
          sourceKind: a.sourceKind,
          sourceLabel: a.sourceLabel
        });
        u && s.set(u.ip.toLowerCase(), u);
      }
      const i = [...s.values()];
      if (!i.length) return [];
      const c = JSON.stringify(i.map((d) => ({
        id: d.id,
        ip: d.ip,
        ipType: d.ipType,
        sourceKind: d.sourceKind,
        sourceLabel: d.sourceLabel,
        lineLabel: d.lineLabel,
        remark: d.remark,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt
      })));
      Xa("dns_ip_pool_items.batch", c);
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
      const a = [...new Set((Array.isArray(r) ? r : []).map((s) => String(s || "").trim()).filter((s) => Je(s)))];
      if (!a.length) return 0;
      const o = JSON.stringify(a);
      return Xa("dns_ip_pool_items.delete_batch", o), await t.batch([t.prepare(`DELETE FROM ${e.DNS_IP_POOL_ITEMS_TABLE} WHERE ip IN (SELECT value FROM json_each(?))`).bind(o), t.prepare(`DELETE FROM ${e.DNS_IP_PROBE_CACHE_TABLE} WHERE ip IN (SELECT value FROM json_each(?))`).bind(o)]), a.length;
    },
    async getDnsIpPoolSourcesFromDb(t, r = {}) {
      if (!t) return [];
      r.schemaReady !== !0 && await e.ensureDnsIpWorkspaceSchema(t);
      try {
        const a = await t.prepare(`SELECT id, name, url, source_type, domain, source_kind, preset_id, builtin_id, enabled, sort_order, ip_limit, last_fetch_at, last_fetch_status, last_fetch_count, created_at, updated_at
              FROM ${e.DNS_IP_POOL_SOURCES_TABLE}
              ORDER BY sort_order ASC, updated_at ASC`).all();
        return (Array.isArray(a?.results) ? a.results : []).map((o, s) => Ot(o, s)).filter((o) => cr(o));
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
      return (Array.isArray(r?.results) ? r.results : []).map((a, o) => Ot(a, o)).filter((a) => cr(a));
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
      const o = (Array.isArray(r) ? r : []).map((c, l) => Ot(c, l)).filter((c) => cr(c)), s = e.resolveOpsStatusStores(t)?.db || null;
      if (!s) throw new Error("D1 not configured");
      await e.ensureDnsIpWorkspaceSchema(s);
      const i = [s.prepare(`DELETE FROM ${e.DNS_IP_POOL_SOURCES_TABLE}`)];
      if (o.length) {
        const c = JSON.stringify(o.map((l) => ({
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
        Xa("dns_ip_pool_sources.batch", c), i.push(s.prepare(`INSERT INTO ${e.DNS_IP_POOL_SOURCES_TABLE} (
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
      return await s.batch(i), o;
    },
    async updateDnsIpPoolSourceFetchState(t, r = "", a = {}) {
      if (!t || !r) return !1;
      await e.ensureDnsIpWorkspaceSchema(t);
      const o = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString();
      return await t.prepare(`UPDATE ${e.DNS_IP_POOL_SOURCES_TABLE}
            SET last_fetch_at = ?, last_fetch_status = ?, last_fetch_count = ?, updated_at = ?
            WHERE id = ?`).bind(String(a.lastFetchAt || o), String(a.lastFetchStatus || ""), Math.max(0, Number(a.lastFetchCount) || 0), o, String(r)).run(), !0;
    },
    async getDnsIpPoolFetchCacheEntry(t, r = "") {
      if (!t || !r) return null;
      await e.ensureDnsIpWorkspaceSchema(t);
      try {
        const a = await t.prepare(`SELECT signature, items_json, source_results_json, imported_count, enabled_source_count, cached_at, expires_at, created_at, updated_at
              FROM ${e.DNS_IP_POOL_FETCH_CACHE_TABLE}
              WHERE signature = ? AND expires_at > ?
              LIMIT 1`).bind(String(r), $()).first();
        if (!a) return null;
        const o = JSON.parse(String(a.items_json || "[]")), s = JSON.parse(String(a.source_results_json || "[]")), i = hr(Array.isArray(o) ? o : []), c = Array.isArray(s) ? s : [];
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
      const o = hr(r?.items || []), s = (Array.isArray(r?.sourceResults) ? r.sourceResults : []).map((h) => Ui(h, h)), i = Math.max(0, Number(r?.cachedAtMs ?? r?.cached_at ?? $()) || $()), c = Math.max(i, Number(r?.expiresAtMs ?? r?.expires_at ?? i + 24e5) || i + 24e5), l = String(r?.createdAt || r?.created_at || new Date(i).toISOString()), d = String(r?.updatedAt || r?.updated_at || new Date(i).toISOString()), u = Math.max(0, Number(r?.importedCount ?? r?.imported_count) || o.length), f = Math.max(0, Number(r?.enabledSourceCount ?? r?.enabled_source_count) || 0), m = JSON.stringify(o), p = JSON.stringify(s);
      return Fe(m) + Fe(p) > Yt ? null : (await t.prepare(`INSERT INTO ${e.DNS_IP_POOL_FETCH_CACHE_TABLE} (
            signature, items_json, source_results_json, imported_count, enabled_source_count, cached_at, expires_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(signature) DO UPDATE SET
            items_json = excluded.items_json,
            source_results_json = excluded.source_results_json,
            imported_count = excluded.imported_count,
            enabled_source_count = excluded.enabled_source_count,
            cached_at = excluded.cached_at,
            expires_at = excluded.expires_at,
				updated_at = excluded.updated_at`).bind(a, m, p, u, f, i, c, l, d).run(), {
        signature: a,
        items: o,
        sourceResults: s,
        importedCount: u,
        enabledSourceCount: f,
        cachedAtMs: i,
        expiresAtMs: c,
        createdAt: l,
        updatedAt: d
      });
    },
    async getDnsIpProbeCacheEntry(t, r = "", a = "") {
      if (!t || !r || !a) return null;
      await e.ensureDnsIpWorkspaceSchema(t);
      try {
        const o = await t.prepare(`SELECT ip, entry_colo, probe_status, latency_ms, cf_ray, colo_code, city_name, country_code, country_name, probed_at, expires_at
              FROM ${e.DNS_IP_PROBE_CACHE_TABLE}
              WHERE ip = ? AND entry_colo = ? AND expires_at > ?
              LIMIT 1`).bind(String(r), String(a).toUpperCase(), $()).first();
        return o ? {
          ip: String(o.ip || ""),
          entryColo: String(o.entry_colo || "").toUpperCase(),
          probeStatus: ja(o.probe_status),
          latencyMs: Number.isFinite(Number(o.latency_ms)) ? Math.round(Number(o.latency_ms)) : null,
          cfRay: String(o.cf_ray || ""),
          coloCode: String(o.colo_code || "").toUpperCase(),
          cityName: String(o.city_name || ""),
          countryCode: String(o.country_code || "").toUpperCase(),
          countryName: String(o.country_name || ""),
          probedAt: String(o.probed_at || ""),
          expiresAt: Math.max(0, Number(o.expires_at) || 0)
        } : null;
      } catch {
        return null;
      }
    },
    async getDnsIpProbeCacheEntries(t, r = [], a = "") {
      if (!t || !a) return [];
      const o = [...new Set((Array.isArray(r) ? r : []).map((c) => String(c || "").trim()).filter(Boolean))];
      if (!o.length) return [];
      await e.ensureDnsIpWorkspaceSchema(t);
      const s = [], i = $();
      try {
        for (let c = 0; c < o.length; c += 98) {
          const l = o.slice(c, c + 98);
          if (!l.length) continue;
          const d = l.map(() => "?").join(", "), u = await t.prepare(`SELECT ip, entry_colo, probe_status, latency_ms, cf_ray, colo_code, city_name, country_code, country_name, probed_at, expires_at
                FROM ${e.DNS_IP_PROBE_CACHE_TABLE}
                WHERE entry_colo = ? AND expires_at > ? AND ip IN (${d})`).bind(String(a).toUpperCase(), i, ...l).all();
          s.push(...Array.isArray(u?.results) ? u.results : []);
        }
      } catch {
        return [];
      }
      return s.map((c) => ({
        ip: String(c?.ip || ""),
        entryColo: String(c?.entry_colo || "").toUpperCase(),
        probeStatus: ja(c?.probe_status),
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
        probeStatus: ja(s?.probeStatus || s?.probe_status || ""),
        latencyMs: Number.isFinite(Number(s?.latencyMs ?? s?.latency_ms)) ? Math.round(Number(s?.latencyMs ?? s?.latency_ms)) : null,
        cfRay: String(s?.cfRay || s?.cf_ray || ""),
        coloCode: String(s?.coloCode || s?.colo_code || "").toUpperCase(),
        cityName: String(s?.cityName || s?.city_name || ""),
        countryCode: String(s?.countryCode || s?.country_code || "").toUpperCase(),
        countryName: String(s?.countryName || s?.country_name || ""),
        probedAt: String(s?.probedAt || s?.probed_at || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()),
        expiresAt: Math.max($(), Number(s?.expiresAt ?? s?.expires_at) || 0)
      })).filter((s) => Je(s.ip) && s.entryColo);
      if (!a.length) return [];
      const o = JSON.stringify(a);
      return Fe(o) > Yt ? [] : (await t.prepare(`INSERT INTO ${e.DNS_IP_PROBE_CACHE_TABLE} (
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
				expires_at = excluded.expires_at`).bind(o).run(), a);
    },
    async upsertDnsIpProbeCacheEntry(t, r = {}) {
      return (await e.upsertDnsIpProbeCacheEntries(t, [r]))[0] || null;
    }
  };
}
function ey(n = {}, e = {}) {
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
      let r = te.OpsStatusShadowCache.get(t);
      return r || (r = {
        pendingPatch: {},
        flushPromise: null,
        payloadCache: /* @__PURE__ */ new Map()
      }, te.OpsStatusShadowCache.set(t, r)), r;
    },
    getOpsStatusShadowPatch(t) {
      const r = e.getOpsStatusShadowState(t);
      return k(r?.pendingPatch) ? r.pendingPatch : {};
    },
    getOpsStatusPayloadCache(t) {
      const r = e.getOpsStatusShadowState(t);
      return r ? (r.payloadCache instanceof Map || (r.payloadCache = /* @__PURE__ */ new Map()), r.payloadCache) : null;
    },
    cacheOpsStatusPayload(t, r, a) {
      const o = e.getOpsStatusPayloadCache(t);
      o && Ne(o, String(r || ""), {
        payload: a && typeof a == "object" ? a : null,
        expiresAt: $() + Math.max(1e3, Number(B.Defaults.OpsStatusReadCacheTtlMs) || 1e3)
      }, 8);
    },
    buildOpsStatusRootPatch(t = {}) {
      const r = t && typeof t == "object" ? t : {}, a = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), o = {};
      for (const [s, i] of Object.entries(r)) {
        if (e.OPS_STATUS_SECTION_SCOPES[s]) {
          const c = Xe(o[s], i);
          c.updatedAt = a, o[s] = c;
          continue;
        }
        o[s] = i;
      }
      return o;
    },
    async flushOpsStatusShadow(t, r = {}) {
      const a = t?.db || null;
      if (!a) return {};
      const o = Array.isArray(r.patchKeys) ? r.patchKeys : [], s = e.getOpsStatusShadowState(a);
      if (!s) return {};
      if (s.flushPromise) return s.flushPromise;
      const i = (async () => {
        const c = k(s.pendingPatch) ? s.pendingPatch : {};
        if (!Object.keys(c).length) return await e.getOpsStatusFromStores(t);
        s.pendingPatch = {};
        try {
          const l = $(), d = new Date(l).toISOString();
          if (!await e.ensureSysStatusTable(a))
            return Le("ops_status.db_unavailable", /* @__PURE__ */ new Error("sys_status table unavailable"), { patchKeys: o }), s.pendingPatch = Xe(c, s.pendingPatch), await e.getOpsStatusFromStores(t);
          const u = await e.getOpsStatusPayloadFromDb(a, e.getOpsStatusDbScope()), f = Xe(u && typeof u == "object" ? u : {}, c);
          return f.updatedAt = d, await e.putOpsStatusPayloadToDb(a, e.getOpsStatusDbScope(), f, l), Xe(f, e.getOpsStatusShadowPatch(a));
        } catch (l) {
          throw s.pendingPatch = Xe(c, s.pendingPatch), l;
        }
      })().finally(() => {
        s.flushPromise === i && (s.flushPromise = null);
      });
      return s.flushPromise = i, i;
    },
    async ensureSysStatusTable(t) {
      if (!t || typeof t.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(t, "sysStatusTable")) return !0;
      let r = te.OpsStatusDbReady.get(t);
      r || (r = (async () => {
        try {
          return await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.SYS_STATUS_TABLE} (scope TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at INTEGER NOT NULL)`).run(), e.markD1SchemaReady(t, "sysStatusTable"), !0;
        } catch (a) {
          return console.warn("sys_status init failed", a), !1;
        }
      })(), te.OpsStatusDbReady.set(t, r));
      try {
        return await r;
      } finally {
        te.OpsStatusDbReady.get(t) === r && te.OpsStatusDbReady.delete(t);
      }
    },
    async ensureAuthFailuresTable(t) {
      if (!t || typeof t.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(t, "authFailuresTable")) return !0;
      let r = te.AuthFailuresDbReady.get(t);
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
      })(), te.AuthFailuresDbReady.set(t, r));
      try {
        return await r;
      } finally {
        te.AuthFailuresDbReady.get(t) === r && te.AuthFailuresDbReady.delete(t);
      }
    },
    async getAuthFailureEntry(t, r = "") {
      const a = String(r || "").trim();
      if (!a || !t || !await e.ensureAuthFailuresTable(t)) return null;
      try {
        const o = await t.prepare(`SELECT ip, fail_count, expires_at, updated_at
              FROM ${e.AUTH_FAILURES_TABLE}
              WHERE ip = ?
              LIMIT 1`).bind(a).first();
        if (!o) return null;
        const s = Number(o?.expires_at ?? o?.expiresAt) || 0;
        return s > 0 && s <= $() ? (await e.deleteAuthFailureEntry(t, a).catch(() => !1), null) : {
          ip: a,
          failCount: Math.max(0, Number(o?.fail_count ?? o?.failCount) || 0),
          expiresAt: s,
          updatedAt: Number(o?.updated_at ?? o?.updatedAt) || 0
        };
      } catch (o) {
        return Le("auth_failures.read_failed", o, { ip: a }), null;
      }
    },
    async upsertAuthFailureEntry(t, r = "", a = {}) {
      const o = String(r || "").trim();
      if (!o || !t || !await e.ensureAuthFailuresTable(t)) return null;
      const s = Math.max(0, Number(a?.failCount) || 0), i = Math.max(0, Number(a?.expiresAt) || 0), c = Math.max(0, Number(a?.updatedAt) || $());
      return await t.prepare(`INSERT INTO ${e.AUTH_FAILURES_TABLE} (ip, fail_count, expires_at, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(ip) DO UPDATE SET
              fail_count = excluded.fail_count,
              expires_at = excluded.expires_at,
              updated_at = excluded.updated_at`).bind(o, s, i, c).run(), {
        ip: o,
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
function ty(n = {}, e = {}) {
  return {
    async ensureCfDashboardCacheTable(t) {
      if (!t || typeof t.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(t, "cfDashboardCacheTable")) return !0;
      let r = te.CfDashboardCacheDbReady.get(t);
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
      })(), te.CfDashboardCacheDbReady.set(t, r));
      try {
        return await r;
      } finally {
        te.CfDashboardCacheDbReady.get(t) === r && te.CfDashboardCacheDbReady.delete(t);
      }
    },
    async getCfDashboardCacheEntry(t, r = "", a = {}) {
      const o = String(r || "").trim();
      if (!o || !t || !await e.ensureCfDashboardCacheTable(t)) return null;
      const s = Math.max(0, Number(a.nowMs) || $()), i = a.includeExpired === !0, c = i ? `SELECT cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
                FROM ${e.CF_DASH_CACHE_TABLE}
                WHERE cache_key = ?
                LIMIT 1` : `SELECT cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
                FROM ${e.CF_DASH_CACHE_TABLE}
                WHERE cache_key = ? AND expires_at > ?
                LIMIT 1`;
      try {
        let l = t.prepare(c).bind(o);
        i || (l = t.prepare(c).bind(o, s));
        const d = await l.first();
        if (!d?.payload) return null;
        let u = null;
        try {
          u = JSON.parse(String(d.payload || "{}"));
        } catch {
          return null;
        }
        return {
          cacheKey: o,
          zoneId: String(d?.zone_id || d?.zoneId || ""),
          bucketDate: String(d?.bucket_date || d?.bucketDate || ""),
          payload: yo(u),
          version: Number(d?.version) || 0,
          cachedAt: Number(d?.cached_at ?? d?.cachedAt) || 0,
          expiresAt: Number(d?.expires_at ?? d?.expiresAt) || 0,
          updatedAt: Number(d?.updated_at ?? d?.updatedAt) || 0
        };
      } catch (l) {
        return Le("cf_dashboard_cache.read_failed", l, { cacheKey: o }), null;
      }
    },
    async putCfDashboardCacheEntry(t, r = {}) {
      if (!t || !await e.ensureCfDashboardCacheTable(t)) return null;
      const a = String(r?.cacheKey || "").trim();
      if (!a) return null;
      const o = String(r?.zoneId || "").trim() || "default", s = String(r?.bucketDate || "").trim() || "current", i = Math.max(0, Number(r?.version) || 0), c = Math.max(0, Number(r?.cachedAt) || $()), l = Math.max(c, Number(r?.expiresAt) || c), d = Math.max(c, Number(r?.updatedAt) || c), u = JSON.stringify(yo(r?.payload || {}));
      return Fe(u) > Yt ? null : (await t.prepare(`INSERT INTO ${e.CF_DASH_CACHE_TABLE} (
            cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(cache_key) DO UPDATE SET
            zone_id = excluded.zone_id,
            bucket_date = excluded.bucket_date,
            payload = excluded.payload,
            version = excluded.version,
            cached_at = excluded.cached_at,
            expires_at = excluded.expires_at,
            updated_at = excluded.updated_at`).bind(a, o, s, u, i, c, l, d).run(), {
        cacheKey: a,
        zoneId: o,
        bucketDate: s,
        version: i,
        cachedAt: c,
        expiresAt: l,
        updatedAt: d
      });
    },
    async deleteCfDashboardCacheEntry(t, r = "") {
      const a = String(r || "").trim();
      if (!a || !t || !await e.ensureCfDashboardCacheTable(t)) return !1;
      try {
        return await t.prepare(`DELETE FROM ${e.CF_DASH_CACHE_TABLE} WHERE cache_key = ?`).bind(a).run(), !0;
      } catch (o) {
        return Le("cf_dashboard_cache.delete_failed", o, { cacheKey: a }), !1;
      }
    },
    async invalidateDashboardSnapshotCacheForConfigChange(t, r = {}) {
      const a = r?.db || e.getDB(t);
      if (!a) return 0;
      const o = Math.max(0, Number(r.nowMs) || $()), s = /* @__PURE__ */ new Set();
      for (const i of [r?.prevConfig, r?.nextConfig]) {
        if (!i || typeof i != "object") continue;
        const c = ce(i), l = dt(new Date(o), c.scheduleUtcOffsetMinutes);
        s.add(go(c.cfZoneId, l.dateKey));
      }
      return s.size ? (await ge(Promise.all([...s].map((i) => e.deleteCfDashboardCacheEntry(a, i))), "dashboard.cache_invalidate", { cacheKeys: [...s] }, null), s.size) : 0;
    },
    async ensureCfRuntimeCacheTable(t) {
      if (!t || typeof t.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(t, "cfRuntimeCacheTable")) return !0;
      let r = te.CfRuntimeCacheDbReady.get(t);
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
      })(), te.CfRuntimeCacheDbReady.set(t, r));
      try {
        return await r;
      } finally {
        te.CfRuntimeCacheDbReady.get(t) === r && te.CfRuntimeCacheDbReady.delete(t);
      }
    },
    async getCfRuntimeCacheEntry(t, r = "", a = {}) {
      const o = String(r || "").trim();
      if (!o || !t || !await e.ensureCfRuntimeCacheTable(t)) return null;
      const s = Math.max(0, Number(a.nowMs) || $()), i = a.includeExpired === !0, c = i ? `SELECT cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
                FROM ${e.CF_RUNTIME_CACHE_TABLE}
                WHERE cache_key = ?
                LIMIT 1` : `SELECT cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
                FROM ${e.CF_RUNTIME_CACHE_TABLE}
                WHERE cache_key = ? AND expires_at > ?
                LIMIT 1`;
      try {
        let l = t.prepare(c).bind(o);
        i || (l = t.prepare(c).bind(o, s));
        const d = await l.first();
        if (!d?.payload) return null;
        let u = null;
        try {
          u = JSON.parse(String(d.payload || "{}"));
        } catch {
          return null;
        }
        return {
          cacheKey: o,
          cacheGroup: String(d?.cache_group || d?.cacheGroup || ""),
          resourceId: String(d?.resource_id || d?.resourceId || ""),
          payload: (k(u), u),
          cachedAt: Number(d?.cached_at ?? d?.cachedAt) || 0,
          expiresAt: Number(d?.expires_at ?? d?.expiresAt) || 0,
          updatedAt: Number(d?.updated_at ?? d?.updatedAt) || 0
        };
      } catch (l) {
        return Le("cf_runtime_cache.read_failed", l, { cacheKey: o }), null;
      }
    },
    async putCfRuntimeCacheEntry(t, r = {}) {
      if (!t || !await e.ensureCfRuntimeCacheTable(t)) return null;
      const a = String(r?.cacheKey || "").trim();
      if (!a) return null;
      const o = String(r?.cacheGroup || "").trim() || "runtime", s = String(r?.resourceId || "").trim() || "default", i = Math.max(0, Number(r?.cachedAt) || $()), c = Math.max(i, Number(r?.expiresAt) || i), l = Math.max(i, Number(r?.updatedAt) || i), d = JSON.stringify(r?.payload ?? {});
      return Fe(d) > Yt ? null : (await t.prepare(`INSERT INTO ${e.CF_RUNTIME_CACHE_TABLE} (
            cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(cache_key) DO UPDATE SET
            cache_group = excluded.cache_group,
            resource_id = excluded.resource_id,
            payload = excluded.payload,
            cached_at = excluded.cached_at,
            expires_at = excluded.expires_at,
            updated_at = excluded.updated_at`).bind(a, o, s, d, i, c, l).run(), {
        cacheKey: a,
        cacheGroup: o,
        resourceId: s,
        cachedAt: i,
        expiresAt: c,
        updatedAt: l
      });
    },
    async loadCfRuntimeCachePayload(t, r = {}) {
      const a = String(r.cacheKey || "").trim(), o = String(r.cacheGroup || "").trim() || "runtime", s = String(r.resourceId || "").trim() || "default", i = Math.max(1e3, Number(r.ttlMs) || 3e5), c = Math.max(0, Number(r.nowMs) || $()), l = r.skipCacheRead === !0, d = typeof r.loader == "function" ? r.loader : null;
      if (!a || !d) throw new Error("cf_runtime_cache_loader_missing");
      const u = t ? await e.getCfRuntimeCacheEntry(t, a, {
        nowMs: c,
        includeExpired: !0
      }) : null, f = !l && u && u.expiresAt > c ? u : null;
      if (f?.payload !== void 0) return {
        payload: f.payload,
        cachedAt: f.cachedAt,
        expiresAt: f.expiresAt,
        updatedAt: f.updatedAt,
        stale: !1,
        source: "d1_cache",
        error: null
      };
      const m = u;
      try {
        return {
          payload: await Et(Ye([
            "cf_runtime",
            o,
            a
          ]), async () => {
            const p = await d();
            return t && await ge(e.putCfRuntimeCacheEntry(t, {
              cacheKey: a,
              cacheGroup: o,
              resourceId: s,
              payload: p,
              cachedAt: c,
              expiresAt: c + i,
              updatedAt: c
            }), "cf_runtime_cache.write", {
              cacheKey: a,
              cacheGroup: o,
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
function ry(n = {}, e = {}) {
  return {
    buildCloudflareKvQuotaCard({ planProfile: t = {}, planState: r = {}, usageState: a = {}, namespaceId: o = "", nowTimestamp: s = $() } = {}) {
      const i = Na(t?.planClass), c = k(a?.payload) ? a.payload : {}, l = String(c.namespaceTitle || t?.resourceMeta?.kv?.namespaceTitle || o || "未命名 Namespace").trim(), d = [
        Rr({
          key: "read",
          label: "读",
          used: c.readCount,
          limit: i.kv.read,
          kind: "count"
        }),
        Rr({
          key: "write",
          label: "写",
          used: c.writeCount,
          limit: i.kv.write,
          kind: "count"
        }),
        Rr({
          key: "storage",
          label: "容量",
          used: c.storageBytes,
          limit: i.kv.storageBytes,
          kind: "bytes"
        })
      ], u = [];
      r?.stale === !0 && u.push("计划信息"), a?.stale === !0 && u.push("实时指标");
      const f = [];
      u.length > 0 && f.push(`${u.join("、")} 使用 stale cache`), f.push(`delete：${Se(c.deleteCount)} / ${Se(i.kv.delete)}`), f.push(`list：${Se(c.listCount)} / ${Se(i.kv.list)}`), f.push(`命名空间：${l}`);
      const m = vs(a?.cachedAt, s);
      m && f.push(m), f.push(i.planClass === "paid" ? "容量条按 1 GB included quota 展示，PAID 下这是 included quota，不是硬停止线" : "容量条按 1 GB included quota 展示");
      const p = Fs(d);
      return p.length > 0 && f.push(`超额项目：${p.join("、")}（进度条按 100% 封顶）`), a?.error && f.push(`Cloudflare 详情：${Kt(a.error)}`), cn({
        title: "KV",
        status: u.length > 0 ? "partial_failure" : "success",
        summary: `${i.planLabel} 计划 · ${i.periodLabel}配额`,
        detail: f.join("；"),
        planLabel: i.planLabel,
        periodLabel: i.periodLabel,
        resourceLabel: l,
        metrics: d
      });
    },
    buildCloudflareD1QuotaCard({ planProfile: t = {}, planState: r = {}, usageState: a = {}, databaseId: o = "", nowTimestamp: s = $() } = {}) {
      const i = Na(t?.planClass), c = k(a?.payload) ? a.payload : {}, l = String(c.databaseName || t?.resourceMeta?.d1?.databaseName || o || "未命名数据库").trim(), d = [
        Rr({
          key: "rowsRead",
          label: "读",
          used: c.rowsRead,
          limit: i.d1.rowsRead,
          kind: "count"
        }),
        Rr({
          key: "rowsWritten",
          label: "写",
          used: c.rowsWritten,
          limit: i.d1.rowsWritten,
          kind: "count"
        }),
        Rr({
          key: "storage",
          label: "容量",
          used: c.fileSizeBytes,
          limit: i.d1.storageBytes,
          kind: "bytes"
        })
      ], u = [];
      r?.stale === !0 && u.push("计划信息"), a?.stale === !0 && u.push("实时指标");
      const f = [];
      u.length > 0 && f.push(`${u.join("、")} 使用 stale cache`), f.push(`SQL 次数：读 ${Se(c.readQueries)} / 写 ${Se(c.writeQueries)}`), f.push(`数据库：${l}`);
      const m = vs(a?.cachedAt, s);
      m && f.push(m), f.push(`容量条按单库硬上限 ${sn(i.d1.storageBytes)} 展示`);
      const p = Fs(d);
      return p.length > 0 && f.push(`超额项目：${p.join("、")}（进度条按 100% 封顶）`), a?.error && f.push(`Cloudflare 详情：${Kt(a.error)}`), cn({
        title: "D1",
        status: u.length > 0 ? "partial_failure" : "success",
        summary: `${i.planLabel} 计划 · ${i.periodLabel}配额`,
        detail: f.join("；"),
        planLabel: i.planLabel,
        periodLabel: i.periodLabel,
        resourceLabel: l,
        metrics: d
      });
    },
    async buildDashboardD1WriteHotspotPayload(t, r = {}) {
      const a = ce(r?.config || await me(t)), o = Math.max(0, Number(r?.nowMs) || $()), s = Ue(a.scheduleUtcOffsetMinutes), i = String(a.cfAccountId || "").trim(), c = String(a.cfApiToken || "").trim(), l = String(a.cfD1DatabaseId || "").trim(), d = {
        utcOffsetMinutes: s,
        nowMs: o,
        source: "cloudflare_d1_analytics"
      };
      if (!i || !c || !l) return fn({
        ...d,
        status: "unconfigured",
        summary: "D1 写入热点尚未启用",
        detail: "请先在账号设置中填写 Cloudflare 账号 ID、API 令牌与 D1 Database ID。"
      });
      const u = dt(new Date(o), s).startTs - 8640 * 60 * 1e3, f = await sm({
        accountId: i,
        apiToken: c,
        databaseId: l,
        startIso: new Date(u).toISOString(),
        endIso: new Date(o).toISOString(),
        utcOffsetMinutes: s
      }), m = new Map(f.map((b) => [`${b.dateKey}:${b.hour}`, b])), p = cl(), h = [];
      let g = 0, y = 0, _ = 0, S = null;
      for (const b of f)
        g += Math.max(0, Number(b?.rowsWritten) || 0), y += Math.max(0, Number(b?.writeQueries) || 0), (Number(b?.rowsWritten) || 0) > _ && (_ = Math.max(0, Number(b?.rowsWritten) || 0), S = b);
      for (let b = 0; b < 7; b += 1) {
        const A = ut(u + b * 24 * 60 * 60 * 1e3, s).dateKey;
        h.push({
          key: A,
          dateKey: A,
          label: ho(A),
          cells: Array.from({ length: 24 }, (C, N) => {
            const P = m.get(`${A}:${N}`) || null, E = Math.max(0, Number(P?.rowsWritten) || 0), w = Math.max(0, Number(P?.writeQueries) || 0), R = _ > 0 ? E / _ : 0;
            return ll(A, N, E, w, R);
          })
        });
      }
      const T = S ? `峰值：${ho(S.dateKey)} ${String(S.hour).padStart(2, "0")}:00 写入 ${Se(S.rowsWritten)} 行 / SQL ${Se(S.writeQueries)} 次` : "";
      return {
        title: "D1 写入热点图",
        status: "success",
        source: "cloudflare_d1_analytics",
        summary: g > 0 ? `最近 7 天累计写入 ${Se(g)} 行` : "最近 7 天未检测到 D1 写入",
        detail: g > 0 ? "热点强度按 rowsWritten 计算；悬停单元格可查看对应小时的 SQL 写次数。" : "Cloudflare D1 Analytics 当前窗口内没有返回 rowsWritten 数据。",
        periodLabel: `最近 7 天 · ${Mo(s)}`,
        hourLabels: p,
        rows: h,
        available: g > 0,
        totalRowsWritten: g,
        totalWriteQueries: y,
        peakLabel: T,
        legendMaxLabel: Se(_)
      };
    },
    async buildDashboardMonthlyTrafficPayload(t, r = {}) {
      const a = ce(r?.config || await me(t)), o = Math.max(0, Number(r.nowMs) || $()), s = r?.monthWindow || ei(new Date(o), a.scheduleUtcOffsetMinutes), i = String(a.cfZoneId || "").trim(), c = String(a.cfApiToken || "").trim(), l = {
        period: "month",
        periodKey: s.monthKey,
        periodLabel: s.periodLabel,
        generatedAt: new Date(o).toISOString(),
        cacheStatus: "live"
      };
      if (!i || !c) return tr({
        ...l,
        traffic: "未配置",
        cfAnalyticsLoaded: !1,
        cfAnalyticsStatus: "未配置 Cloudflare",
        cfAnalyticsError: "请在账号设置中填写并保存 Cloudflare Zone ID 与 API 令牌",
        trafficSourceText: "本月视频流量：未配置 Cloudflare，无法获取 CF Zone 总流量"
      });
      const d = 1440 * 60 * 1e3, u = Ue(a.scheduleUtcOffsetMinutes), f = r?.kv || e.getKV(t), m = o - Ya * d, p = [];
      for (let A = s.startTs; A <= s.endTs; A += d) p.push({
        startTs: A,
        endTs: Math.min(s.endTs, A + d - 1),
        dateKey: ut(new Date(A), u).dateKey
      });
      let h = 0, g = 0, y = 0, _ = 0, S = null;
      const T = 4;
      for (let A = 0; A < p.length; A += T) {
        const C = await Promise.all(p.slice(A, A + T).map(async ({ startTs: N, endTs: P, dateKey: E }) => {
          const w = await ti(f, i, E);
          let R = null;
          try {
            R = await ks(i, c, N, P);
          } catch (D) {
            S = S || D;
          }
          return R === null ? w !== null ? {
            bytes: w,
            source: "archive"
          } : {
            bytes: 0,
            source: "missing"
          } : (P < o && N >= m && w === null && await ri(f, i, {
            dateKey: E,
            bytes: R,
            dayEndTs: P
          }), R === 0 && w !== null ? {
            bytes: w,
            source: "archive"
          } : R === 0 && N < m ? {
            bytes: 0,
            source: "missing"
          } : {
            bytes: R,
            source: "cf"
          });
        }));
        for (const N of C)
          h += Math.max(0, Number(N?.bytes) || 0), N?.source === "archive" ? g += 1 : N?.source === "missing" ? y += 1 : N?.source === "cf" && (_ += 1);
      }
      if (_ === 0 && g === 0 && S) throw S;
      const b = y > 0 ? `本地归档缺失 ${y} 天（免费版 CF Zone 分析仅保留约 ${Ya} 天）` : "";
      return tr({
        ...l,
        traffic: sn(h),
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
      const a = ce(r?.config || await me(t)), o = r?.kv || e.getKV(t), s = String(a.cfZoneId || "").trim(), i = String(a.cfApiToken || "").trim();
      if (!o || !s || !i) return {
        status: "skipped",
        storedCount: 0,
        errors: []
      };
      const c = Math.max(0, Number(r?.nowMs) || $()), l = Ue(a.scheduleUtcOffsetMinutes), d = dt(new Date(c), l), u = 1440 * 60 * 1e3, f = c - Ya * u;
      let m = 0;
      const p = [];
      for (let h = 1; h <= xp; h += 1) {
        const g = d.startTs - h * u, y = g + u - 1, _ = ut(new Date(g), l).dateKey;
        if (!(g < f) && await ti(o, s, _) === null)
          try {
            await ri(o, s, {
              dateKey: _,
              bytes: await ks(s, i, g, y),
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
      const a = ce(r?.config || await me(t)), o = r?.ctx || null, s = r?.forceRefresh === !0, i = Math.max(0, Number(r.nowMs) || $()), c = r?.monthWindow || ei(new Date(i), a.scheduleUtcOffsetMinutes), l = String(a.cfZoneId || "").trim();
      if (!l || !String(a.cfApiToken || "").trim()) return await e.buildDashboardMonthlyTrafficPayload(t, {
        config: a,
        monthWindow: c,
        nowMs: i
      });
      const d = Op(l, c.monthKey, a.scheduleUtcOffsetMinutes), u = vp(d), f = mr();
      let m = null;
      const p = ee.DashboardMonthlyTrafficCache.get(d);
      if (p?.staleUntil > i) {
        if (Ne(ee.DashboardMonthlyTrafficCache, d, p, 64), m = p, !s && p.expiresAt > i) return tr({
          ...p.payload,
          cacheStatus: "cache"
        });
      } else p && ee.DashboardMonthlyTrafficCache.delete(d);
      if (f && u) try {
        const h = await f.match(u);
        if (h) {
          const g = await Pe(h, bn), y = g.exceeded ? null : JSON.parse(g.text || "null");
          if (Number(y?.version) === 1 && String(y?.cacheKey || "") === d && Number(y?.staleUntil) > i && (m = {
            payload: tr(y.payload),
            cachedAt: Number(y.cachedAt) || 0,
            expiresAt: Number(y.expiresAt) || 0,
            staleUntil: Number(y.staleUntil) || 0
          }, Ne(ee.DashboardMonthlyTrafficCache, d, m, 64), !s && m.expiresAt > i))
            return tr({
              ...m.payload,
              cacheStatus: "cache"
            });
        }
      } catch (h) {
        Le("dashboard.monthly_traffic_cache_read_failed", h, { cacheKey: d });
      }
      try {
        return await Et(Ye([
          "dashboard_monthly_traffic",
          d,
          s ? "force" : "default"
        ]), async () => {
          const h = await e.buildDashboardMonthlyTrafficPayload(t, {
            config: a,
            monthWindow: c,
            nowMs: i
          }), g = i, y = g + Ip, _ = g + Qs, S = {
            version: 1,
            cacheKey: d,
            cachedAt: g,
            expiresAt: y,
            staleUntil: _,
            payload: h
          };
          if (Ne(ee.DashboardMonthlyTrafficCache, d, {
            payload: h,
            cachedAt: g,
            expiresAt: y,
            staleUntil: _
          }, 64), f && u) {
            const T = f.put(u, new Response(JSON.stringify(S), { headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": `public, max-age=${Math.floor(Qs / 1e3)}`
            } }));
            o ? o.waitUntil(ge(T, "dashboard.monthly_traffic_cache_write", { cacheKey: d }, null)) : await ge(T, "dashboard.monthly_traffic_cache_write", { cacheKey: d }, null);
          }
          return h;
        });
      } catch (h) {
        if (m?.payload && m.staleUntil > i) return tr({
          ...m.payload,
          cacheStatus: "stale",
          warning: ul(h, "monthly_traffic_refresh_failed")
        });
        const g = Mc(h?.message || h, { zoneId: l });
        return tr({
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
function ay(n = {}, e = {}) {
  const { CacheManager: t, withAdminShellRuntimeStatus: r } = n;
  return {
    async buildDashboardStatsPayload(a, o = {}) {
      const s = o?.ctx || null, i = o?.kv || e.getKV(a), c = o?.db || e.getDB(a), l = ce(o?.config || await me(a)), d = Math.max(0, Number(o.nowMs) || $()), u = o?.dayWindow || dt(new Date(d), l.scheduleUtcOffsetMinutes), f = o?.skipD1WriteHotspot !== !1, m = f ? null : e.buildDashboardD1WriteHotspotPayload(a, {
        config: l,
        nowMs: d
      });
      let p = null, h = "未配置", g = 0, y = !1, _ = !1, S = "", T = "", b = "", A = "pending", C = "等待数据加载", N = "视频流量口径：CF Zone 总流量", P = new Date(d).toISOString(), E = Array.from({ length: 24 }, (v, O) => ({
        label: String(O).padStart(2, "0") + ":00",
        total: 0
      })), w = 0, R = 0, D = "", x = fn({
        utcOffsetMinutes: l.scheduleUtcOffsetMinutes,
        nowMs: d
      });
      g = (await t.getNodesListStrict(a, s)).length || 0;
      const L = u.dateKey, F = u.startTs, I = u.endTs, U = String(l.cfZoneId || "").trim(), V = String(l.cfApiToken || "").trim();
      if (U && V) {
        const v = new Date(F).toISOString(), O = new Date(I).toISOString(), M = `
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
          const H = await Kc(U, V, {
            scope: "dashboard.stats.zone_lookup",
            context: { feature: "dashboard_stats" }
          });
          D = String(H?.name || "").trim();
          const j = await $c(U, V, M);
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
                const Ae = ut(new Date(ye), l.scheduleUtcOffsetMinutes).hour;
                Q[Ae].total += pe;
              }
            }), h = sn(J), y = !0, S = "Cloudflare 统计正常", N = "视频流量当前对齐：CF Zone 总流量（edgeResponseBytes）";
            try {
              const se = await im({
                cfAccountId: String(l.cfAccountId || "").trim(),
                cfZoneId: U,
                cfApiToken: V,
                startIso: v,
                endIso: O,
                utcOffsetMinutes: l.scheduleUtcOffsetMinutes
              });
              se && Number.isFinite(se.totalRequests) && (p = se.totalRequests, E = se.hourlySeries, _ = !0, A = "workers_usage", C = "今日请求量口径：Cloudflare Workers Usage", S = "Cloudflare 统计正常");
            } catch (se) {
              console.log("CF workers usage fetch failed", se);
            }
            _ || (p = q, E = Q, _ = !0, A = "zone_analytics", C = "今日请求量当前对齐：Cloudflare Zone Analytics");
          } else
            S = "Zone 未命中", T = "GraphQL 返回空；请检查 Zone ID 或权限", h = "CF 无统计数据";
        } catch (H) {
          const j = Mc(H?.message || H, { zoneId: U });
          S = j.status, T = j.hint, b = j.detail, h = "CF 查询失败";
        }
      } else
        S = "未配置 Cloudflare", T = "请在账号设置中填写并保存 Cloudflare Zone ID 与 API 令牌", N = "视频流量当前对齐：未配置 Cloudflare，无法获取 CF Zone 总流量";
      if (c) try {
        await e.ensureStatsHourlyWindowAligned({
          db: c,
          kv: i
        }, {
          config: l,
          now: u.now
        });
        const v = await e.resolveLogsReadiness({
          db: c,
          kv: i
        }), O = v.statsReady === !0 ? await e.getDailyStatsHourly(c, L) : [];
        if (w = O.reduce((M, H) => M + (Number(H?.play_count || H?.playCount) || 0), 0), R = O.reduce((M, H) => M + (Number(H?.playback_info_count || H?.playbackInfoCount) || 0), 0), !_ && v.statsReady === !0) {
          p = O.reduce((M, H) => M + (Number(H?.request_count || H?.requestCount) || 0), 0), E = Array.from({ length: 24 }, (M, H) => ({
            label: String(H).padStart(2, "0") + ":00",
            total: 0
          }));
          for (const M of O) {
            const H = Number.parseInt(String(M?.bucket_hour ?? M?.bucketHour), 10);
            !Number.isNaN(H) && E[H] && (E[H].total += Number(M?.request_count || M?.requestCount) || 0);
          }
          _ = !0, A = "d1_hourly_stats", C = "今日请求量当前对齐：本地 D1 预聚合";
        }
      } catch (v) {
        console.log("DB aggregated stats read failed:", v);
      }
      if (_ || (p = null, !U || !V ? (A = "unconfigured", C = c ? "今日请求量暂不可用：未配置 Cloudflare 联动，且本地 D1 日志未初始化或不可读" : "今日请求量未配置：未绑定 D1，且未配置 Cloudflare 联动") : (A = "pending", C = c ? "今日请求量暂不可用：Cloudflare 请求数查询失败，且本地 D1 日志未初始化或不可读" : "今日请求量暂不可用：Cloudflare 请求数查询失败，且未绑定 D1")), !f) try {
        x = await m;
      } catch (v) {
        console.log("D1 write hotspot read failed:", v), x = fn({
          utcOffsetMinutes: l.scheduleUtcOffsetMinutes,
          nowMs: d,
          status: "failed",
          source: "cloudflare_d1_analytics",
          summary: "D1 写入热点暂不可用",
          detail: Kt(v, "d1_write_hotspot_failed")
        });
      }
      const X = p == null ? A === "unconfigured" ? "未配置" : "暂不可用" : String(Number(p) || 0);
      return as({
        todayRequests: p,
        requestCountDisplay: X,
        todayTraffic: h,
        hourlySeries: E,
        requestSource: A,
        requestSourceText: C,
        trafficSourceText: N,
        generatedAt: P,
        zoneName: D,
        cfAnalyticsLoaded: y,
        cfAnalyticsStatus: S,
        cfAnalyticsError: T,
        cfAnalyticsDetail: b,
        playCount: w,
        infoCount: R,
        nodeCount: g,
        cacheStatus: "live",
        d1WriteHotspot: x
      });
    },
    async buildDashboardRuntimeStatusPayload(a, o = {}) {
      const s = o?.db || e.getDB(a), i = o?.kv || e.getKV(a), c = ce(o?.config || await me(a)), l = o?.forceRefresh === !0, d = await e.getOpsStatus({
        kv: i,
        db: s
      });
      let u = {
        kv: Cr("KV", "Cloudflare 配额尚未加载", "等待运行状态接口返回 Cloudflare 配额数据。"),
        d1: Cr("D1", "Cloudflare 配额尚未加载", "等待运行状态接口返回 Cloudflare 配额数据。")
      };
      try {
        u = await e.getCloudflareRuntimeQuotaStatus(a, {
          config: c,
          db: s,
          forceRefresh: l
        });
      } catch (f) {
        const m = Kt(f, "runtime_config_read_failed");
        u = {
          kv: wr("KV", "Cloudflare 配额读取失败", m),
          d1: wr("D1", "Cloudflare 配额读取失败", m)
        };
      }
      return {
        ...d && typeof d == "object" ? d : {},
        cloudflare: u
      };
    },
    async getRuntimeStatusPayload(a, o = {}) {
      const s = o?.db || e.getDB(a), i = o?.kv || e.getKV(a), c = ce(o?.config || await me(a)), l = Ke(a), d = o?.forceRefresh === !0, u = Math.max(0, Number(o.nowMs) || $()), f = await Et(Ye(["runtime_status", d ? "force" : "default"]), async () => e.buildDashboardRuntimeStatusPayload(a, {
        kv: i,
        db: s,
        config: c,
        forceRefresh: d
      }));
      return {
        status: r(f, a, c, l),
        cacheMeta: os({
          cacheStatus: "live",
          cachedAt: u,
          expiresAt: u,
          updatedAt: u,
          generatedAt: new Date(u).toISOString(),
          warning: "",
          partial: !1
        })
      };
    },
    async getDashboardSnapshotPayload(a, o = {}) {
      const s = o?.db || e.getDB(a), i = o?.kv || e.getKV(a), c = o?.ctx || null, l = ce(o?.config || await me(a)), d = o?.forceRefresh === !0, u = Math.max(0, Number(o.nowMs) || $()), f = o?.dayWindow || dt(new Date(u), l.scheduleUtcOffsetMinutes), m = String(l.cfZoneId || "").trim(), p = go(m, f.dateKey), h = s ? await e.getCfDashboardCacheEntry(s, p, {
        nowMs: u,
        includeExpired: !0
      }) : null;
      if (!d && s) {
        const y = h && h.expiresAt > u ? h : null;
        if (y && y.version === 8) return ca(y.payload, "cache", {
          cachedAt: y.cachedAt,
          expiresAt: y.expiresAt,
          updatedAt: y.updatedAt,
          generatedAt: y.payload?.cacheMeta?.generatedAt || y.payload?.stats?.generatedAt || new Date(y.cachedAt || u).toISOString(),
          warning: ""
        });
      }
      const g = h;
      try {
        const y = await Et(Ye([
          "dashboard_snapshot",
          p,
          d ? "force" : "default"
        ]), async () => {
          const [_, S] = await Promise.all([e.buildDashboardStatsPayload(a, {
            ctx: c,
            kv: i,
            db: s,
            config: l,
            dayWindow: f,
            nowMs: u
          }), e.buildDashboardRuntimeStatusPayload(a, {
            kv: i,
            db: s,
            config: l,
            forceRefresh: d
          })]), T = ca({
            stats: _,
            runtimeStatus: S,
            cacheMeta: { generatedAt: _.generatedAt }
          }, "live", {
            cachedAt: u,
            expiresAt: u + 3600 * 1e3,
            updatedAt: u,
            generatedAt: _.generatedAt,
            warning: ""
          });
          if (s) {
            const b = e.putCfDashboardCacheEntry(s, {
              cacheKey: p,
              zoneId: m || "default",
              bucketDate: f.dateKey,
              payload: T,
              version: 8,
              cachedAt: u,
              expiresAt: u + 36e5,
              updatedAt: u
            });
            c ? c.waitUntil(ge(b, "dashboard.cache_write", { cacheKey: p }, null)) : await ge(b, "dashboard.cache_write", { cacheKey: p }, null);
          }
          return T;
        });
        return ca(y, "live", {
          cachedAt: u,
          expiresAt: u + 3600 * 1e3,
          updatedAt: u,
          generatedAt: y?.stats?.generatedAt || ""
        });
      } catch (y) {
        if (g && g.version === 8) return ca(g.payload, "stale", {
          cachedAt: g.cachedAt,
          expiresAt: g.expiresAt,
          updatedAt: g.updatedAt,
          generatedAt: g.payload?.cacheMeta?.generatedAt || g.payload?.stats?.generatedAt || new Date(g.cachedAt || u).toISOString(),
          warning: ul(y),
          partial: !0
        });
        throw y;
      }
    },
    async getDashboardCachedSnapshotPayload(a, o = {}) {
      const s = o?.db || e.getDB(a);
      if (!s) return null;
      const i = ce(o?.config || await me(a)), c = Math.max(0, Number(o.nowMs) || $()), l = dt(new Date(c), i.scheduleUtcOffsetMinutes), d = go(String(i.cfZoneId || "").trim(), l.dateKey), u = await e.getCfDashboardCacheEntry(s, d, {
        nowMs: c,
        includeExpired: !0
      });
      return !u || u.version !== 8 ? null : ca(u.payload, u.expiresAt > c ? "cache" : "stale", {
        cachedAt: u.cachedAt,
        expiresAt: u.expiresAt,
        updatedAt: u.updatedAt,
        generatedAt: u.payload?.cacheMeta?.generatedAt || u.payload?.stats?.generatedAt || "",
        warning: u.expiresAt > c ? "" : "dashboard_cache_expired",
        partial: u.expiresAt <= c
      });
    },
    async getCloudflareRuntimeQuotaStatus(a, o = {}) {
      const s = o?.db || e.getDB(a), i = ce(o?.config || {}), c = o?.forceRefresh === !0, l = String(i.cfAccountId || "").trim(), d = String(i.cfApiToken || "").trim(), u = String(i.cfKvNamespaceId || "").trim(), f = String(i.cfD1DatabaseId || "").trim();
      if (!l || !d) return {
        kv: Cr("KV", "未配置 Cloudflare 账号联动", "请先在账号设置中填写 Cloudflare 账号 ID 与 API 令牌。"),
        d1: Cr("D1", "未配置 Cloudflare 账号联动", "请先在账号设置中填写 Cloudflare 账号 ID 与 API 令牌。")
      };
      const m = $(), p = fe(i.cfQuotaPlanCacheMinutes, B.Defaults.CfQuotaPlanCacheMinutes, 1, 1440), h = p * 60 * 1e3;
      let g;
      try {
        g = await e.loadCfRuntimeCachePayload(s, {
          cacheKey: `plan_profile:${l}:${u || "-"}:${f || "-"}`,
          cacheGroup: "plan_profile",
          resourceId: l,
          ttlMs: p * 60 * 1e3,
          nowMs: m,
          skipCacheRead: c,
          loader: async () => {
            const A = kc(await zc(l, d)), [C, N] = await Promise.all([u ? ge(am(l, u, d), "cf_runtime.plan_profile.kv_details", {
              accountId: l,
              namespaceId: u
            }, null) : null, f ? ge(Hs(l, f, d), "cf_runtime.plan_profile.d1_details", {
              accountId: l,
              databaseId: f
            }, null) : null]);
            return {
              planClass: A.planClass,
              planLabel: A.planLabel,
              periodLabel: A.periodLabel,
              usageModel: A.usageModel,
              resourceMeta: {
                kv: { namespaceTitle: String(C?.title || "").trim() },
                d1: { databaseName: String(N?.name || "").trim() }
              }
            };
          }
        });
      } catch (A) {
        const C = Kt(A);
        return {
          kv: wr("KV", "Cloudflare 计划信息读取失败", C),
          d1: wr("D1", "Cloudflare 计划信息读取失败", C)
        };
      }
      const y = k(g?.payload) ? g.payload : {}, _ = {
        ...uo({
          usageModel: y.usageModel || y.planClass,
          override: i.cfQuotaPlanOverride
        }),
        resourceMeta: {
          kv: { namespaceTitle: String(y?.resourceMeta?.kv?.namespaceTitle || "").trim() },
          d1: { databaseName: String(y?.resourceMeta?.d1?.databaseName || "").trim() }
        }
      }, S = Zf(_.planClass), [T, b] = await Promise.all([(async () => {
        if (!u) return Cr("KV", "未配置 KV Namespace", "请在账号设置中填写 Cloudflare KV Namespace ID。");
        try {
          const A = await e.loadCfRuntimeCachePayload(s, {
            cacheKey: `usage_metrics:kv:${l}:${u}:${S.cacheBucketKey}`,
            cacheGroup: "usage_metrics",
            resourceId: `kv:${u}`,
            ttlMs: h,
            nowMs: m,
            skipCacheRead: c,
            loader: async () => ({
              ...await nm({
                accountId: l,
                apiToken: d,
                namespaceId: u,
                startIso: S.startIso,
                endIso: S.endIso
              }),
              namespaceTitle: String(_?.resourceMeta?.kv?.namespaceTitle || u).trim()
            })
          });
          return e.buildCloudflareKvQuotaCard({
            planProfile: _,
            planState: g,
            usageState: A,
            namespaceId: u,
            nowTimestamp: m
          });
        } catch (A) {
          return wr("KV", "KV 指标读取失败", Kt(A));
        }
      })(), (async () => {
        if (!f) return Cr("D1", "未配置 D1 数据库", "请在账号设置中填写 Cloudflare D1 Database ID。");
        try {
          const A = await e.loadCfRuntimeCachePayload(s, {
            cacheKey: `usage_metrics:d1:${l}:${f}:${S.cacheBucketKey}`,
            cacheGroup: "usage_metrics",
            resourceId: `d1:${f}`,
            ttlMs: h,
            nowMs: m,
            skipCacheRead: c,
            loader: async () => {
              const [C, N] = await Promise.all([om({
                accountId: l,
                apiToken: d,
                databaseId: f,
                startIso: S.startIso,
                endIso: S.endIso
              }), Hs(l, f, d)]);
              return {
                ...C,
                databaseName: String(N?.name || _?.resourceMeta?.d1?.databaseName || f).trim(),
                fileSizeBytes: Math.max(0, Number(N?.file_size ?? N?.fileSize) || 0)
              };
            }
          });
          return e.buildCloudflareD1QuotaCard({
            planProfile: _,
            planState: g,
            usageState: A,
            databaseId: f,
            nowTimestamp: m
          });
        } catch (A) {
          return wr("D1", "D1 指标读取失败", Kt(A));
        }
      })()]);
      return {
        kv: T,
        d1: b
      };
    }
  };
}
function ny(n = {}, e = {}) {
  return {
    ...Qh(n, e),
    ...Zh(n, e),
    ...ey(n, e),
    ...ty(n, e),
    ...ry(n, e),
    ...ay(n, e)
  };
}
function oy(n = {}, e = {}) {
  return {
    getKV(t) {
      return Sr(t);
    },
    getDB(t) {
      return uf(t);
    },
    buildD1CreateTableSql(t, r = t, a = {}) {
      const o = de(r), s = `CREATE TABLE${a.ifNotExists === !0 ? " IF NOT EXISTS" : ""}`, i = {
        [e.D1_SCHEMA_META_TABLE]: `${s} ${o} (scope TEXT PRIMARY KEY, contract_version INTEGER NOT NULL, contract_hash TEXT NOT NULL, schema_fingerprint TEXT NOT NULL, schema_cookie INTEGER NOT NULL, last_plan_hash TEXT NOT NULL, verified_at TEXT NOT NULL, attestation TEXT NOT NULL, migration_owner TEXT, lease_expires_at INTEGER)`,
        [e.SYS_STATUS_TABLE]: `${s} ${o} (scope TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.SCHEDULED_LOCKS_TABLE]: `${s} ${o} (scope TEXT PRIMARY KEY, token TEXT NOT NULL, owner TEXT NOT NULL, acquired_at INTEGER NOT NULL, renewed_at INTEGER, expires_at INTEGER NOT NULL)`,
        [e.AUTH_FAILURES_TABLE]: `${s} ${o} (ip TEXT PRIMARY KEY, fail_count INTEGER NOT NULL, expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.CF_DASH_CACHE_TABLE]: `${s} ${o} (cache_key TEXT PRIMARY KEY, zone_id TEXT NOT NULL, bucket_date TEXT NOT NULL, payload TEXT NOT NULL, version INTEGER NOT NULL, cached_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.CF_RUNTIME_CACHE_TABLE]: `${s} ${o} (cache_key TEXT PRIMARY KEY, cache_group TEXT NOT NULL, resource_id TEXT NOT NULL, payload TEXT NOT NULL, cached_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.DNS_IP_POOL_ITEMS_TABLE]: `${s} ${o} (id TEXT PRIMARY KEY, ip TEXT NOT NULL UNIQUE, ip_type TEXT NOT NULL, source_kind TEXT NOT NULL, source_label TEXT, line_label TEXT NOT NULL DEFAULT '', remark TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        [e.DNS_IP_POOL_SOURCES_TABLE]: `${s} ${o} (id TEXT PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL, source_type TEXT NOT NULL DEFAULT 'url', domain TEXT, source_kind TEXT NOT NULL DEFAULT 'custom', preset_id TEXT NOT NULL DEFAULT '', builtin_id TEXT NOT NULL DEFAULT '', enabled INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, ip_limit INTEGER NOT NULL DEFAULT 5, last_fetch_at TEXT, last_fetch_status TEXT, last_fetch_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        [e.DNS_IP_POOL_FETCH_CACHE_TABLE]: `${s} ${o} (signature TEXT PRIMARY KEY, items_json TEXT NOT NULL, source_results_json TEXT NOT NULL, imported_count INTEGER NOT NULL DEFAULT 0, enabled_source_count INTEGER NOT NULL DEFAULT 0, cached_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        [e.DNS_IP_PROBE_CACHE_TABLE]: `${s} ${o} (ip TEXT NOT NULL, entry_colo TEXT NOT NULL, probe_status TEXT NOT NULL, latency_ms INTEGER, cf_ray TEXT, colo_code TEXT, city_name TEXT, country_code TEXT, country_name TEXT, probed_at TEXT NOT NULL, expires_at INTEGER NOT NULL, PRIMARY KEY (ip, entry_colo))`,
        [e.LOGS_TABLE]: `${s} ${o} (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER NOT NULL, node_name TEXT NOT NULL, request_path TEXT NOT NULL, request_method TEXT NOT NULL, status_code INTEGER NOT NULL, response_time INTEGER NOT NULL, client_ip TEXT NOT NULL, inbound_colo TEXT, outbound_colo TEXT, user_agent TEXT, referer TEXT, category TEXT DEFAULT 'api', error_detail TEXT, detail_json TEXT, created_at TEXT NOT NULL, inbound_ip TEXT, outbound_ip TEXT)`,
        [e.STATS_HOURLY_TABLE]: `${s} ${o} (bucket_date TEXT NOT NULL, bucket_hour INTEGER NOT NULL, request_count INTEGER NOT NULL DEFAULT 0, play_count INTEGER NOT NULL DEFAULT 0, playback_info_count INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, PRIMARY KEY (bucket_date, bucket_hour))`
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
      return ie(ae({
        version: it,
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
      return ae({
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
      return a ? await _t(a, e.buildD1SchemaAttestationPayload(r)) : "";
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
      const o = Math.max(0, Number(a.contract_version) || 0);
      if (o > it) return {
        valid: !1,
        blocked: !0,
        reason: "schema_version_ahead",
        meta: a
      };
      if (o !== it) return {
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
      const o = e.getD1ContractHash(), s = String(a?.schemaFingerprint || "") || await e.getD1SchemaFingerprint(t), i = await e.getD1SchemaCookie(t), c = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), l = {
        contractVersion: it,
        contractHash: o,
        schemaFingerprint: s,
        schemaCookie: i,
        lastPlanHash: String(a?.planHash || ""),
        verifiedAt: c
      }, d = await e.signD1SchemaAttestation(r, l);
      return d ? (await t.prepare(`INSERT INTO ${de(e.D1_SCHEMA_META_TABLE)} (scope, contract_version, contract_hash, schema_fingerprint, schema_cookie, last_plan_hash, verified_at, attestation, migration_owner, lease_expires_at)
        VALUES ('main', ?, ?, ?, ?, ?, ?, ?, NULL, NULL)
        ON CONFLICT(scope) DO UPDATE SET contract_version = excluded.contract_version, contract_hash = excluded.contract_hash, schema_fingerprint = excluded.schema_fingerprint, schema_cookie = excluded.schema_cookie, last_plan_hash = excluded.last_plan_hash, verified_at = excluded.verified_at, attestation = excluded.attestation, migration_owner = NULL, lease_expires_at = NULL`).bind(it, o, s, i, l.lastPlanHash, c, d).run(), {
        written: !0,
        attestation: d,
        ...l
      }) : {
        written: !1,
        reason: "missing_secret",
        ...l
      };
    },
    async acquireD1SchemaRepairLease(t, r, a = {}) {
      const o = Math.max(0, Number(a.nowMs ?? $()) || 0), s = o + bd, i = await t.prepare(`INSERT INTO ${de(e.D1_SCHEMA_META_TABLE)} (scope, contract_version, contract_hash, schema_fingerprint, schema_cookie, last_plan_hash, verified_at, attestation, migration_owner, lease_expires_at)
        VALUES ('main', 0, '', '', 0, '', '', '', ?, ?)
        ON CONFLICT(scope) DO UPDATE SET migration_owner = excluded.migration_owner, lease_expires_at = excluded.lease_expires_at
        WHERE ${de(e.D1_SCHEMA_META_TABLE)}.migration_owner IS NULL OR ${de(e.D1_SCHEMA_META_TABLE)}.lease_expires_at IS NULL OR ${de(e.D1_SCHEMA_META_TABLE)}.lease_expires_at < ? OR ${de(e.D1_SCHEMA_META_TABLE)}.migration_owner = excluded.migration_owner`).bind(r, s, o).run();
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
      let r = te.D1SchemaReadyState.get(t);
      return r instanceof Map || (r = /* @__PURE__ */ new Map(), te.D1SchemaReadyState.set(t, r)), r;
    },
    isD1SchemaReadyCached(t, r) {
      const a = e.getD1SchemaReadyState(t);
      return !!a && (Number(a.get(String(r || ""))) || 0) > $();
    },
    markD1SchemaReady(t, r) {
      const a = e.getD1SchemaReadyState(t);
      a && a.set(String(r || ""), $() + Math.max(1e3, Number(B.Defaults.D1SchemaReadyTtlMs) || 1e3));
    },
    clearD1SchemaReady(t, r = []) {
      const a = te.D1SchemaReadyState.get(t);
      if (!(a instanceof Map)) return;
      const o = (Array.isArray(r) ? r : [r]).map((s) => String(s || "").trim()).filter(Boolean);
      if (!o.length) {
        a.clear();
        return;
      }
      for (const s of o) a.delete(s);
    },
    normalizeRevisionMeta(t, r) {
      const a = k(t) ? t : {}, o = k(r) ? r : {}, s = String(a.updatedAt || o.updatedAt || "").trim(), i = String(a.hash || o.hash || "").trim();
      return {
        ...o,
        ...a,
        updatedAt: s,
        hash: i,
        revision: String(a.revision || o.revision || zt(i, s)).trim()
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
      const o = await ve(t, r, { type: "json" });
      return k(o) ? e.normalizeRevisionMeta(o, a) : null;
    },
    async writeRevisionMeta(t, r, a, o = null) {
      if (!t || !r) return a;
      const s = t.put(r, JSON.stringify(a));
      return o && o.waitUntil(s), await s, a;
    },
    async ensureConfigMeta(t, r = null, a = {}) {
      const o = ce(r ?? (await t?.get(e.CONFIG_KEY, { type: "json" }) || {})), s = e.normalizeRevisionMeta(lo(o)), i = await e.readRevisionMeta(t, e.CONFIG_META_KEY);
      return i.hash === s.hash && i.revision ? i : await e.writeRevisionMeta(t, e.CONFIG_META_KEY, s, a.ctx);
    },
    buildNodesIndexMeta(t = [], r = [], a = {}) {
      const o = e.normalizeNodeIndex(t), s = e.normalizeNodeSummaryIndex(r).nodes, i = String(a.updatedAt || "").trim() || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), c = ie(ae(o)), l = ie(ae(s)), d = ie(`${c}:${l}:${o.length}`);
      return {
        revision: zt(d, i),
        updatedAt: i,
        hash: d,
        count: o.length,
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
      const o = Array.isArray(r.index) ? e.normalizeNodeIndex(r.index) : e.normalizeNodeIndex(a.map((c) => c?.name)), s = e.buildNodesIndexMeta(o, a, r), i = await e.readRevisionMeta(t, e.NODES_INDEX_META_KEY, {
        count: 0,
        indexHash: "",
        fullIndexHash: ""
      });
      return i.indexHash === s.indexHash && i.fullIndexHash === s.fullIndexHash && Number(i.count) === Number(s.count) && i.revision ? i : await Ir(async () => {
        const c = await e.loadNodeSummariesForMutation(t, { ctx: r.ctx });
        return (await e.commitNodesSummaryIndexMutation(c, {
          kv: t,
          ctx: r.ctx
        })).meta;
      }, t);
    },
    async getNodesRevision(t, r = {}) {
      if (!t) return "";
      const a = be(t), o = $();
      if (r.forceFresh !== !0 && a.NodesRevisionCache?.loaded === !0 && a.NodesRevisionCache.exp > o) return String(a.NodesRevisionCache.revision || "").trim();
      const s = a.NodesRevisionCacheGeneration;
      return await Cn(a.SingleFlightTasks, Ye(["nodes_revision", s]), async () => {
        const i = a.NodesRevisionCache;
        if (r.forceFresh !== !0 && i?.loaded === !0 && i.exp > $()) return String(i.revision || "").trim();
        let c = null;
        try {
          c = await t.get(e.NODES_INDEX_META_KEY, { type: "json" });
        } catch {
          return "";
        }
        const l = k(c) ? String(c.revision || "").trim() : "";
        return a.NodesRevisionCacheGeneration === s && (a.NodesRevisionCache = {
          loaded: !0,
          revision: l,
          exp: $() + B.Defaults.NodesRevisionCacheTtlMs
        }), l;
      });
    },
    getLogsRevisionFromStatus(t = {}) {
      const r = String(t?.revision || "").trim();
      return r || zt("logs", String(t?.updatedAt || "").trim());
    },
    async bumpLogsRevision(t, r = {}, a = null) {
      const o = await e.getOpsStatusSection(t, "log"), s = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), i = ie(`${e.getLogsRevisionFromStatus(o)}:${s}:${ae(r)}`);
      return await e.patchOpsStatus(t, { log: {
        ...r,
        revision: zt(i, s),
        updatedAt: s
      } }, a);
    },
    async getAdminRevisions(t, r = {}) {
      const a = e.resolveOpsStatusStores(t), o = a.kv, s = a.db, [i, c, l, d] = await Promise.all([
        e.ensureConfigMeta(o, r.config, { ctx: r.ctx }),
        e.ensureNodesIndexMeta(o, {
          ctx: r.ctx,
          index: r.nodes?.map?.((u) => u?.name),
          nodes: r.nodes
        }),
        e.getOpsStatusSection({
          kv: o,
          db: s
        }, "log"),
        e.getOpsStatusSection({
          kv: o,
          db: s
        }, "dnsIpPool")
      ]);
      return {
        configRevision: String(i?.revision || ""),
        nodesRevision: String(c?.revision || ""),
        logsRevision: e.getLogsRevisionFromStatus(l),
        dnsIpPoolRevision: e.getDnsIpPoolRevisionFromStatus(d)
      };
    },
    async getAdminRevisionsForRead(t, r = {}) {
      const a = e.resolveOpsStatusStores(t), o = a.kv, s = a.db, [i, c, l, d] = await Promise.all([
        e.readRevisionMetaForRead(o, e.CONFIG_META_KEY),
        e.readRevisionMetaForRead(o, e.NODES_INDEX_META_KEY, {
          count: 0,
          indexHash: "",
          fullIndexHash: ""
        }),
        e.getOpsStatusSection({
          kv: o,
          db: s
        }, "log"),
        e.getOpsStatusSection({
          kv: o,
          db: s
        }, "dnsIpPool")
      ]), u = r.config !== void 0 ? r.config : await ve(o, e.CONFIG_KEY, { type: "json" }) || {}, f = e.normalizeRevisionMeta(lo(ce(u), { updatedAt: String(i?.updatedAt || "").trim() })), m = String(i?.revision || "").trim().split(".").pop() || "", p = i?.hash === f.hash && m === f.hash ? i : f;
      let h = c;
      if (!h) {
        const g = Array.isArray(r.nodes) ? r.nodes : await e.getNodesSummaryIndexStrict(o, { ctx: r.ctx });
        h = e.buildNodesIndexMeta((Array.isArray(g) ? g : []).map((y) => y?.name), Array.isArray(g) ? g : []);
      }
      return {
        configRevision: String(p?.revision || ""),
        nodesRevision: String(h?.revision || ""),
        logsRevision: e.getLogsRevisionFromStatus(l),
        dnsIpPoolRevision: e.getDnsIpPoolRevisionFromStatus(d)
      };
    }
  };
}
function sy(n = {}, e = {}) {
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
      ].every((p) => r.has(p)), [o, s] = await Promise.all([t.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.LOGS_FTS_TABLE).first(), t.prepare("SELECT name, tbl_name, sql FROM sqlite_master WHERE type = 'trigger' AND name = ? LIMIT 1").bind(e.LOGS_FTS_INSERT_TRIGGER).first()]), i = Dr(o?.sql || "").replace(/'/g, ""), c = /^create\s+virtual\s+table\b/.test(i) && /\busing\s+fts5\s*\(/.test(i) && new RegExp(`\\bcontent\\s*=\\s*${e.LOGS_TABLE}\\b`).test(i) && /\bcontent_rowid\s*=\s*id\b/.test(i), l = Dr(s?.sql || ""), d = l.replace(/\s+/g, ""), u = `insert into ${e.LOGS_FTS_TABLE} (
            rowid, node_name, request_path, user_agent, error_detail, detail_json
          ) values (
            new.id, new.node_name, new.request_path,
            coalesce(new.user_agent, ''), coalesce(new.error_detail, ''), coalesce(new.detail_json, '')
          )`.replace(/\s+/g, ""), f = d.includes(u), m = String(s?.name || "") === e.LOGS_FTS_INSERT_TRIGGER && String(s?.tbl_name || "") === e.LOGS_TABLE && new RegExp(`\\bafter\\s+insert\\s+on\\s+${e.LOGS_TABLE}\\b`).test(l) && new RegExp(`\\binsert\\s+into\\s+${e.LOGS_FTS_TABLE}\\s*\\(`).test(l) && f;
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
          affinity: $n(a?.type),
          primaryKeyOrder: Math.max(0, Number(a?.pk) || 0),
          notNull: Number(a?.notnull) === 1,
          defaultValue: a?.dflt_value ?? null,
          hidden: Math.max(0, Number(a?.hidden) || 0)
        })).filter((a) => a.name);
      } catch (a) {
        const o = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${r}`);
        throw o.code = "D1_SCHEMA_INSPECTION_FAILED", o.status = 503, o.details = {
          tableName: String(r),
          cause: ue(a, "d1_pragma_failed")
        }, o;
      }
    },
    async getTableColumns(t, r) {
      const a = await e.getTableColumnDefinitions(t, r);
      return new Set(a.map((o) => o.name));
    },
    async getIndexKeyColumns(t, r) {
      if (!t || !r) return [];
      try {
        return ((await t.prepare(`PRAGMA index_xinfo(${de(r)})`).all())?.results || []).map((a) => ({
          order: Math.max(0, Number(a?.seqno) || 0),
          name: String(a?.name || "").toLowerCase(),
          key: a?.key === void 0 || Number(a.key) === 1,
          expression: Number(a?.cid) === -2 || !String(a?.name || "").trim()
        })).filter((a) => a.key).sort((a, o) => a.order - o.order).map((a) => a.expression ? "<expression>" : a.name);
      } catch (a) {
        const o = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${r}`);
        throw o.code = "D1_SCHEMA_INSPECTION_FAILED", o.status = 503, o.details = {
          indexName: String(r),
          cause: ue(a, "d1_pragma_failed")
        }, o;
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
        const o = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${r}`);
        throw o.code = "D1_SCHEMA_INSPECTION_FAILED", o.status = 503, o.details = {
          tableName: String(r),
          cause: ue(a, "d1_pragma_failed")
        }, o;
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
      const r = Object.keys(e.getD1CurrentSchemaContract().columns), a = [...r, e.LOGS_FTS_TABLE], o = a.map(() => "?").join(", "), s = r.map(() => "?").join(", "), [i, c, l] = await Promise.all([
        t.prepare("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE type IN ('table', 'index', 'trigger') ORDER BY type, name").all(),
        t.prepare(`SELECT schema_table.name AS table_name, column_info.name, column_info.type, column_info."notnull" AS is_not_null,
					column_info.dflt_value, column_info.pk, column_info.hidden
					FROM sqlite_master AS schema_table
					JOIN pragma_table_xinfo(schema_table.name) AS column_info
					WHERE schema_table.type = 'table' AND schema_table.name IN (${o})
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
      }, a = Object.fromEntries(Object.entries(e.getD1RuntimeColumnAdditions()).map(([o, s]) => {
        const i = Object.fromEntries(Object.entries(s).map(([c, l]) => [c, String(l || "").trim().split(/\s+/, 1)[0].toUpperCase()]));
        return [o, {
          ...r[o],
          ...i
        }];
      }));
      return {
        columns: Object.fromEntries(Object.entries(a).map(([o, s]) => [o, Object.keys(s)])),
        columnTypes: a,
        columnAffinities: Object.fromEntries(Object.entries(a).map(([o, s]) => [o, Object.fromEntries(Object.entries(s).map(([i, c]) => [i, $n(c)]))])),
        primaryKeys: t,
        indexes: e.getD1RuntimeIndexContract(),
        uniqueIndexes: e.getD1UniqueIndexContract()
      };
    },
    async getD1SchemaFingerprint(t) {
      return t ? ie(ae((await t.prepare("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE type IN ('table', 'index', 'trigger') ORDER BY type, name").all())?.results || [])) : "";
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
      const a = e.getD1CurrentSchemaContract(), o = r.snapshot || await e.getD1SchemaSnapshot(t), s = o.objects || [], i = new Set(s.filter((E) => E?.type === "table").map((E) => String(E?.name || "")).filter(Boolean)), c = /* @__PURE__ */ new Map();
      for (const E of o.indexes || []) {
        const w = String(E?.index_name || "");
        if (!w) continue;
        let R = c.get(w);
        R || (R = {
          name: w,
          table: String(E?.table_name || ""),
          unique: Number(E?.is_unique) === 1,
          partial: Number(E?.partial) === 1,
          origin: String(E?.origin || ""),
          columns: []
        }, c.set(w, R)), (E?.is_key === void 0 || Number(E.is_key) === 1) && R.columns.push({
          order: Math.max(0, Number(E?.seqno) || 0),
          name: Number(E?.cid) === -2 || !String(E?.column_name || "").trim() ? "<expression>" : String(E.column_name).toLowerCase()
        });
      }
      for (const E of c.values()) E.columns = E.columns.sort((w, R) => w.order - R.order).map((w) => w.name);
      const l = /* @__PURE__ */ new Map();
      for (const E of o.columns || []) {
        const w = String(E?.table_name || "");
        l.has(w) || l.set(w, []), l.get(w).push({
          name: String(E?.name || "").toLowerCase(),
          type: String(E?.type || "").trim().toUpperCase(),
          affinity: $n(E?.type),
          primaryKeyOrder: Math.max(0, Number(E?.pk) || 0),
          notNull: Number(E?.is_not_null) === 1,
          defaultValue: E?.dflt_value ?? null,
          hidden: Math.max(0, Number(E?.hidden) || 0)
        });
      }
      const d = Object.fromEntries(Object.keys(a.columns).map((E) => [E, i.has(E)])), u = {}, f = {}, m = [];
      for (const [E, w] of Object.entries(a.columns)) {
        if (!i.has(E)) {
          u[E] = Object.fromEntries(w.map((I) => [I, !1])), f[E] = !1, m.push(`missing_table:${E}`);
          continue;
        }
        const R = l.get(E) || [], D = new Map(R.map((I) => [I.name, I]));
        u[E] = Object.fromEntries(w.map((I) => {
          const U = D.get(I), V = String(a.columnAffinities?.[E]?.[I] || "").toUpperCase(), X = E === e.LOGS_TABLE && I === "id";
          return [I, !!U && (!V || U.affinity === V) && (!X || U.type === "INTEGER")];
        }));
        for (const [I, U] of Object.entries(u[E])) if (!U) {
          const V = D.get(I);
          m.push(V ? `invalid_column_affinity:${E}.${I}` : `missing_column:${E}.${I}`);
        }
        const x = R.filter((I) => I.primaryKeyOrder > 0).sort((I, U) => I.primaryKeyOrder - U.primaryKeyOrder).map((I) => I.name), L = E === e.LOGS_TABLE ? R.find((I) => I.name === "id") : null;
        f[E] = ae(x) === ae(a.primaryKeys[E] || []) && (!L || L.type === "INTEGER"), f[E] || m.push(`invalid_primary_key:${E}`);
        const F = R.filter((I) => !w.includes(I.name) && I.notNull && I.defaultValue === null && I.primaryKeyOrder === 0).map((I) => I.name);
        F.length && m.push(`unsupported_required_columns:${E}:${F.join(",")}`);
      }
      let p = !1;
      if (i.has(e.DNS_IP_POOL_ITEMS_TABLE)) {
        for (const E of [...c.values()].filter((w) => w.table === e.DNS_IP_POOL_ITEMS_TABLE && w.unique && !w.partial)) if (ae(E.columns) === ae(["ip"])) {
          p = !0;
          break;
        }
        p || m.push(`missing_unique_key:${e.DNS_IP_POOL_ITEMS_TABLE}.ip`);
      }
      const h = {};
      for (const [E, w] of Object.entries(a.indexes)) {
        const R = c.get(E);
        if (!R) {
          h[E] = !1, m.push(`missing_index:${E}`);
          continue;
        }
        h[E] = R.table === w.table && R.unique === !1 && R.partial === !1 && ae(R.columns) === ae(w.columns), h[E] || m.push(`invalid_index:${E}`);
      }
      for (const E of Object.keys(a.columns)) {
        const w = [a.primaryKeys?.[E] || [], ...Object.values(a.uniqueIndexes || {}).filter((D) => D.table === E).map((D) => D.columns)], R = [...c.values()].filter((D) => D.table === E && D.unique && !D.partial && !w.some((x) => ae(x) === ae(D.columns))).map((D) => D.name);
        R.length && m.push(`unsupported_unique_indexes:${E}:${R.join(",")}`);
      }
      const g = /* @__PURE__ */ new Set([String(e.LOGS_FTS_INSERT_TRIGGER).toLowerCase()]);
      for (const E of Object.keys(a.columns)) {
        const w = [], R = [];
        for (const D of s) {
          if (D?.type !== "trigger" || String(D?.tbl_name || "") !== E) continue;
          const x = String(D?.name || "");
          !x || g.has(x.toLowerCase()) || (E === e.LOGS_TABLE && e.isLogsFtsSyncTrigger(D) ? R.push(x) : w.push(x));
        }
        w.length && m.push(`unsupported_triggers:${E}:${w.join(",")}`), R.length && m.push(`legacy_fts_trigger:${E}:${R.join(",")}`);
      }
      const y = s.find((E) => E?.type === "table" && String(E?.name || "") === e.LOGS_FTS_TABLE), _ = s.find((E) => E?.type === "trigger" && String(E?.name || "") === e.LOGS_FTS_INSERT_TRIGGER), S = new Set((l.get(e.LOGS_FTS_TABLE) || []).map((E) => E.name)), T = Dr(y?.sql || "").replace(/'/g, ""), b = Dr(_?.sql || ""), A = b.replace(/\s+/g, ""), C = `insertinto${e.LOGS_FTS_TABLE}(rowid,node_name,request_path,user_agent,error_detail,detail_json)values(new.id,new.node_name,new.request_path,coalesce(new.user_agent,''),coalesce(new.error_detail,''),coalesce(new.detail_json,''))`, N = {
        tableReady: !!y,
        virtualTableReady: !!y && /^create\s+virtual\s+table\b/.test(T) && /\busing\s+fts5\s*\(/.test(T) && new RegExp(`\\bcontent\\s*=\\s*${e.LOGS_TABLE}\\b`).test(T) && /\bcontent_rowid\s*=\s*id\b/.test(T),
        columnsReady: [
          "node_name",
          "request_path",
          "user_agent",
          "error_detail",
          "detail_json"
        ].every((E) => S.has(E)),
        triggerReady: String(_?.tbl_name || "") === e.LOGS_TABLE && new RegExp(`\\bafter\\s+insert\\s+on\\s+${e.LOGS_TABLE}\\b`).test(b) && A.includes(C)
      };
      N.ready = N.virtualTableReady && N.columnsReady && N.triggerReady, N.ready || m.push(N.tableReady ? "fts_contract_invalid" : `missing_table:${e.LOGS_FTS_TABLE}`);
      const P = m.length === 0 && Object.values(d).every(Boolean) && Object.values(u).every((E) => Object.values(E).every(Boolean)) && Object.values(f).every(Boolean) && p && Object.values(h).every(Boolean) && N.ready;
      return {
        tables: d,
        columns: u,
        indexes: h,
        constraints: {
          primaryKeys: f,
          uniqueKeys: { [`${e.DNS_IP_POOL_ITEMS_TABLE}.ip`]: p }
        },
        ftsReady: N.ready,
        fts: N,
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
          contractVersion: it,
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
      const o = de(r), s = a.map((d) => de(d)), i = s.map((d) => `${d} IS NULL OR (typeof(${d}) = 'text' AND trim(${d}) = '')`).join(" OR "), [c, l] = await Promise.all([t.prepare(`SELECT 1 AS present FROM ${o} WHERE ${i} LIMIT 1`).first(), t.prepare(`SELECT 1 AS present FROM ${o} GROUP BY ${s.join(", ")} HAVING COUNT(*) > 1 LIMIT 1`).first()]);
      return {
        empty: !!c,
        duplicate: !!l
      };
    },
    async probeD1PrimaryKeyRepair(t, r, a) {
      const o = await e.getTableColumnDefinitions(t, r), s = r === e.LOGS_TABLE, i = new Set(a.columns?.[r] || []), c = a.primaryKeys?.[r] || [], l = new Map(o.map((g) => [g.name, g])), d = [];
      for (const g of c) {
        const y = l.get(g), _ = a.columnAffinities?.[r]?.[g];
        y ? (y.affinity !== _ || r === e.LOGS_TABLE && g === "id" && y.type !== "INTEGER") && d.push(`invalid_column_affinity:${r}.${g}`) : s || d.push(`missing_key_column:${r}.${g}`);
      }
      const u = o.filter((g) => !i.has(g.name)).map((g) => g.name);
      !s && u.length && d.push(`unsupported_extra_columns:${r}:${u.join(",")}`), !s && o.some((g) => g.hidden > 0) && d.push(`unsupported_hidden_columns:${r}`), ((await t.prepare(`PRAGMA foreign_key_list(${de(r)})`).all())?.results || []).length && d.push(`unsupported_foreign_keys:${r}`);
      const f = ((await t.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'trigger' AND tbl_name = ?").bind(r).all())?.results || []).filter((g) => {
        if (r !== e.LOGS_TABLE) return !0;
        const y = String(g?.name || "").toLowerCase(), _ = Dr(g?.sql || "");
        return !(y === String(e.LOGS_FTS_INSERT_TRIGGER).toLowerCase() || y === `${e.LOGS_TABLE}_ai` || y === `${e.LOGS_TABLE}_au` || y === `${e.LOGS_TABLE}_ad` || _.includes(String(e.LOGS_FTS_TABLE).toLowerCase()));
      });
      !s && f.length && d.push(`unsupported_triggers:${r}:${f.map((g) => String(g?.name || "")).join(",")}`);
      const m = [`__d1_repair_${r}_`, `__d1_backup_${r}_`], p = await t.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND (name GLOB ? OR name GLOB ?) LIMIT 1").bind(`${m[0]}*`, `${m[1]}*`).first();
      p?.name && d.push(`repair_artifact_present:${r}:${String(p.name)}`);
      let h = null;
      if (!s) {
        const g = de(r), y = await t.prepare(`SELECT COUNT(*) AS total FROM (SELECT 1 FROM ${g} LIMIT ${Hn + 1})`).first();
        h = Math.max(0, Number(y?.total) || 0);
      }
      if (!s && h > Hn && d.push(`rebuild_row_limit_exceeded:${r}:${h}`), !s && !d.length) {
        const g = await e.probeD1UniqueKeyRepair(t, r, c);
        g.empty && d.push(`primary_key_empty:${r}`), g.duplicate && d.push(`primary_key_duplicate:${r}`);
      }
      return {
        repairable: d.length === 0,
        rowCount: h,
        estimatedRowsIsLowerBound: h !== null && h > Hn,
        rowCountMeasured: h !== null,
        allowsDataLoss: s,
        blockers: d
      };
    },
    async buildD1SchemaRepairPlan(t) {
      const r = await e.getD1SchemaSnapshot(t), a = await e.getD1SchemaStatus(t, { snapshot: r }), o = e.getD1CurrentSchemaContract(), s = ie(ae(r.objects || [])), i = await e.getD1SchemaCookie(t), c = e.getD1ContractHash(), l = await e.readD1SchemaMeta(t), d = [], u = [], f = [], m = [], p = (R, D, x = "low", L = 0, F = {}) => m.push({
        kind: R,
        target: D,
        risk: x,
        estimatedRows: L === null ? null : Math.max(0, Number(L) || 0),
        ...F
      }), h = Math.max(0, Number(l?.contract_version) || 0), g = h > it ? `schema_version_ahead:${h}` : "";
      for (const [R, D] of Object.entries(a.tables || {})) {
        if (!D) {
          const L = `missing_table:${R}`;
          d.push(L), p("create_table", R);
          continue;
        }
        const x = R === e.LOGS_TABLE && a.constraints?.primaryKeys?.[R] !== !0;
        for (const [L, F] of Object.entries(a.columns?.[R] || {})) {
          if (F) continue;
          const I = `${R}.${L}`, U = (a.issues || []).find((V) => String(V).endsWith(I)) || `missing_column:${I}`;
          x && String(U).startsWith("missing_column:") ? u.push(U) : String(U).startsWith("missing_column:") && e.getD1RuntimeColumnAdditions()?.[R]?.[L] ? (d.push(U), p("add_column", I)) : f.push(U);
        }
        if (a.constraints?.primaryKeys?.[R] !== !0) {
          const L = `invalid_primary_key:${R}`, F = await e.probeD1PrimaryKeyRepair(t, R, o);
          F.repairable ? (u.push(L), p(F.allowsDataLoss === !0 ? "recreate_log_table" : "rebuild_table", R, "high", F.rowCount, {
            allowsDataLoss: F.allowsDataLoss === !0,
            willDiscardData: F.allowsDataLoss === !0,
            dataMode: F.allowsDataLoss === !0 ? "discard" : "copy",
            estimatedRowsIsLowerBound: F.estimatedRowsIsLowerBound === !0,
            rowCountMeasured: F.rowCountMeasured === !0
          })) : f.push(L, ...F.blockers);
        }
      }
      for (const R of a.issues || []) if (/^unsupported_(?:required_columns|unique_indexes|triggers):/.test(String(R))) {
        const D = String(R).split(":", 2)[1];
        if (D === e.LOGS_TABLE && a.constraints?.primaryKeys?.[D] !== !0) continue;
        f.push(R);
      }
      for (const R of a.issues || []) {
        const D = /^legacy_fts_trigger:([^:]+):(.+)$/.exec(String(R));
        if (!D) continue;
        const x = D[1];
        for (const L of D[2].split(",")) {
          const F = L.trim();
          F && (d.push(`legacy_fts_trigger:${x}:${F}`), p("drop_trigger", F));
        }
      }
      const y = `${e.DNS_IP_POOL_ITEMS_TABLE}.ip`;
      if (a.tables?.[e.DNS_IP_POOL_ITEMS_TABLE] && a.constraints?.uniqueKeys?.[y] !== !0 && a.columns?.[e.DNS_IP_POOL_ITEMS_TABLE]?.ip === !0) {
        const R = await e.probeD1UniqueKeyRepair(t, e.DNS_IP_POOL_ITEMS_TABLE, ["ip"]);
        R.empty && f.push(`unique_key_empty:${y}`), R.duplicate && f.push(`unique_key_duplicate:${y}`), !R.empty && !R.duplicate && (d.push(`missing_unique_key:${y}`), p("create_unique_index", "ux_dns_ip_pool_items_ip"));
      }
      const _ = m.some((R) => R.kind === "recreate_log_table" && R.target === e.LOGS_TABLE);
      for (const [R, D] of Object.entries(a.indexes || {})) if (!D) {
        const x = (a.issues || []).includes(`invalid_index:${R}`) ? `invalid_index:${R}` : `missing_index:${R}`;
        d.push(x), _ && o.indexes?.[R]?.table === e.LOGS_TABLE || p(x.startsWith("invalid_") ? "repair_index" : "create_index", R);
      }
      if (a.ftsReady !== !0) {
        const R = a.fts?.tableReady ? "fts_contract_invalid" : `missing_table:${e.LOGS_FTS_TABLE}`;
        d.push(R), _ || p(a.fts?.tableReady ? "recreate_fts" : "create_fts", e.LOGS_FTS_TABLE);
      }
      const S = (R) => [...new Set(R.map((D) => String(D || "").trim()).filter(Boolean))], T = S(d), b = S(u), A = S(f);
      g && (A.length || b.length ? A.push(g) : (T.push(g), p("reattest_contract_version", e.D1_SCHEMA_META_TABLE)));
      const C = [...new Map(m.map((R) => [`${R.kind}:${R.target}`, R])).values()].sort((R, D) => `${R.risk}:${R.kind}:${R.target}`.localeCompare(`${D.risk}:${D.kind}:${D.target}`)), N = C.filter((R) => R.risk !== "high"), P = C.filter((R) => R.risk === "high"), E = A.length ? "blocked" : b.length ? "high" : T.length ? "low" : "none", w = A.length ? "blocked" : N.length ? "safe" : P.length ? "destructive" : "ready";
      return {
        version: Wa,
        phase: w,
        contractVersion: it,
        contractHash: c,
        schemaCookie: i,
        planHash: ie(ae({
          version: Wa,
          contractVersion: it,
          contractHash: c,
          schemaCookie: i,
          schemaFingerprint: s,
          phase: w,
          repairableIssues: T,
          highRiskIssues: b,
          blockingIssues: A,
          steps: C
        })),
        schemaFingerprint: s,
        risk: E,
        repairableIssues: T,
        highRiskIssues: b,
        blockingIssues: A,
        steps: C,
        status: a
      };
    },
    async createD1SchemaRepairToken(t, r, a = {}) {
      const o = String(t?.JWT_SECRET || "").trim();
      if (!o) {
        const l = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the D1 schema repair plan");
        throw l.code = "SERVER_MISCONFIGURED", l.status = 503, l;
      }
      const s = Math.max(0, Math.floor(Number(a.nowMs ?? $()) / 1e3)), i = s + Math.floor(_d / 1e3), c = Qr(JSON.stringify({
        version: Wa,
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
        token: `${c}.${await _t(o, c)}`,
        expiresAt: i
      };
    },
    async verifyD1SchemaRepairToken(t, r, a, o = {}) {
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
      const d = i.slice(0, l);
      if (i.slice(l + 1) !== await _t(s, d)) throw c("invalid_signature");
      let u = null;
      try {
        u = JSON.parse(Jt(d));
      } catch {
      }
      if (!k(u) || u.version !== Wa || u.scope !== "d1_schema_repair" || u.phase !== "destructive") throw c("invalid_payload");
      const f = Math.max(0, Math.floor(Number(o.nowMs ?? $()) / 1e3));
      if (Number(u.expiresAt) <= f) throw c("expired", { expiresAt: Number(u.expiresAt) || 0 });
      if (String(u.planHash || "") !== String(a?.planHash || "") || String(u.schemaFingerprint || "") !== String(a?.schemaFingerprint || "") || Number(u.schemaCookie) !== Number(a?.schemaCookie) || String(u.contractHash || "") !== String(a?.contractHash || "") || Number(u.contractVersion) !== Number(a?.contractVersion)) throw c("schema_changed", {
        previewPlanHash: String(u.planHash || ""),
        currentPlanHash: String(a?.planHash || "")
      });
      return u;
    },
    getD1SchemaRepairTokenPlanHash(t) {
      const r = String(t || "").trim().split(".", 1)[0];
      if (!r) return "";
      try {
        const a = JSON.parse(Jt(r));
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
      const a = await e.getD1TableNameSet(t), o = new Set(Array.isArray(r.skipTables) ? r.skipTables : []), s = [];
      for (const [i, c] of Object.entries(e.getD1RuntimeColumnAdditions())) {
        if (!a.has(i) || o.has(i)) continue;
        const l = await e.getTableColumns(t, i);
        for (const [d, u] of Object.entries(c))
          l.has(d) || (await t.prepare(`ALTER TABLE ${de(i)} ADD COLUMN ${de(d)} ${u}`).run(), l.add(d), s.push(`${i}.${d}`));
      }
      return s;
    },
    async repairD1RuntimeIndexes(t, r = {}) {
      const a = await e.getD1TableNameSet(t), o = new Set(Array.isArray(r.skipTables) ? r.skipTables : []), s = [], i = [];
      for (const [c, l] of Object.entries(e.getD1RuntimeIndexContract())) {
        if (!a.has(l.table) || o.has(l.table)) continue;
        const d = await t.prepare("SELECT tbl_name FROM sqlite_master WHERE type = 'index' AND name = ? LIMIT 1").bind(c).first();
        let u = !1;
        if (d) {
          const f = (await e.getTableIndexDefinitions(t, l.table)).find((m) => m.name === c);
          u = String(d?.tbl_name || "") === l.table && f?.unique === !1 && f?.partial === !1 && ae(await e.getIndexKeyColumns(t, c)) === ae(l.columns);
        }
        u || (d ? (await t.prepare(`DROP INDEX IF EXISTS ${de(c)}`).run(), i.push(c)) : s.push(c), await t.prepare(l.createSql).run());
      }
      return {
        createdIndexes: s,
        repairedIndexes: i
      };
    },
    async ensureD1UniqueIndexes(t) {
      const r = [];
      for (const [a, o] of Object.entries(e.getD1UniqueIndexContract())) {
        if (!(await e.getD1TableNameSet(t)).has(o.table)) continue;
        let s = !1;
        for (const i of (await e.getTableIndexDefinitions(t, o.table)).filter((c) => c.unique && !c.partial)) if (ae(await e.getIndexKeyColumns(t, i.name)) === ae(o.columns)) {
          s = !0;
          break;
        }
        s || (await t.prepare("SELECT tbl_name FROM sqlite_master WHERE type = 'index' AND name = ? LIMIT 1").bind(a).first() && await t.prepare(`DROP INDEX IF EXISTS ${de(a)}`).run(), await t.prepare(o.createSql).run(), r.push(a));
      }
      return r;
    },
    async rebuildD1TableWithShadow(t, r, a) {
      const o = e.getD1CurrentSchemaContract();
      if (!Object.prototype.hasOwnProperty.call(o.columns, r)) throw new Error(`Unknown D1 rebuild table: ${r}`);
      if (r === e.LOGS_TABLE) throw new Error("proxy_logs must use destructive atomic recreation");
      const s = String(a?.planHash || "repair").replace(/[^a-z0-9]/gi, "").slice(0, 12) || "repair", i = `__d1_repair_${r}_${s}`, c = `__d1_backup_${r}_${s}`, l = await e.getD1TableNameSet(t);
      if (l.has(i) || l.has(c)) {
        const m = /* @__PURE__ */ new Error("D1 schema repair temporary table already exists");
        throw m.code = "D1_SCHEMA_REPAIR_BLOCKED", m.status = 409, m.details = {
          phase: "preflight",
          blockingIssues: [`repair_artifact_present:${r}`]
        }, m;
      }
      const d = o.columns[r].map((m) => de(m)).join(", "), u = (await t.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'index' AND tbl_name = ? AND sql IS NOT NULL").bind(r).all())?.results || [];
      await t.prepare(e.buildD1CreateTableSql(r, i)).run();
      try {
        await t.batch([
          t.prepare(`INSERT INTO ${de(i)} (${d}) SELECT ${d} FROM ${de(r)}`),
          t.prepare(`ALTER TABLE ${de(r)} RENAME TO ${de(c)}`),
          t.prepare(`ALTER TABLE ${de(i)} RENAME TO ${de(r)}`),
          ...u.map((m) => t.prepare(`DROP INDEX ${de(m.name)}`)),
          ...u.map((m) => t.prepare(String(m.sql)))
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
        originalIndexes: u
      };
    },
    async recreateD1LogsDestructively(t, r) {
      const a = (r?.steps || []).find((i) => i?.kind === "recreate_log_table" && i?.target === e.LOGS_TABLE);
      if (!a || a.willDiscardData !== !0 || a.dataMode !== "discard") throw new Error("Missing destructive proxy_logs repair step");
      const o = e.getD1LogsFtsContractSql(), s = Object.values(e.getD1RuntimeIndexContract()).filter((i) => i.table === e.LOGS_TABLE);
      return await t.batch([
        t.prepare(`DROP TABLE IF EXISTS ${de(e.LOGS_FTS_TABLE)}`),
        t.prepare(`DROP TABLE ${de(e.LOGS_TABLE)}`),
        t.prepare(e.buildD1CreateTableSql(e.LOGS_TABLE)),
        ...s.map((i) => t.prepare(i.createSql)),
        t.prepare(o.createTable),
        t.prepare(o.createTrigger)
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
        const o = String(a?.table || ""), s = String(a?.backupTable || "");
        if (!(!o || !s || !(await e.getD1TableNameSet(t)).has(s))) {
          o === e.LOGS_TABLE && (await e.dropLogsFtsSyncTriggers(t).catch(() => 0), await t.prepare(`DROP TABLE IF EXISTS ${de(e.LOGS_FTS_TABLE)}`).run().catch(() => {
          }));
          for (const i of (await t.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = ? AND sql IS NOT NULL").bind(o).all())?.results || []) await t.prepare(`DROP INDEX IF EXISTS ${de(i.name)}`).run().catch(() => {
          });
          await t.batch([t.prepare(`DROP TABLE IF EXISTS ${de(o)}`), t.prepare(`ALTER TABLE ${de(s)} RENAME TO ${de(o)}`)]);
          for (const i of a.originalIndexes || []) {
            const c = String(i?.sql || "").replace(/^CREATE\s+(UNIQUE\s+)?INDEX\s+/i, (l, d) => `CREATE ${d || ""}INDEX IF NOT EXISTS `);
            c && await t.prepare(c).run().catch(() => {
            });
          }
          o === e.LOGS_TABLE && await e.ensureLogsFtsSchema(t, { forceRecreate: !0 }).catch(() => {
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
      let o = te.D1DatabaseInitReady.get(t);
      (!o || !(o.inFlight instanceof Map)) && (o = {
        tail: Promise.resolve(),
        inFlight: /* @__PURE__ */ new Map()
      }, te.D1DatabaseInitReady.set(t, o));
      const s = `${a}:${e.getD1SchemaRepairTokenPlanHash(r.repairToken) || "automatic"}`;
      let i = o.inFlight.get(s);
      i || (i = Promise.resolve(o.tail).catch(() => {
      }).then(() => e.runD1DatabaseInitialization(t, {
        ...r,
        profile: a
      })), o.tail = i.catch(() => {
      }), o.inFlight.set(s, i));
      try {
        return await i;
      } finally {
        o.inFlight.get(s) === i && o.inFlight.delete(s);
      }
    },
    async runD1DatabaseInitialization(t, r = {}) {
      const a = r.profile || (r.includeFts === !1 ? "logs-core" : "logs-fts"), o = String(r.repairMode || (String(r.repairToken || "").trim() ? "confirmed-destructive" : "safe"));
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
      if (s.phase === "safe" && o === "confirmed-destructive") {
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
      const l = [], d = [];
      let u = "";
      try {
        if (s.steps.find((L) => L.kind === "create_table" && L.target === e.D1_SCHEMA_META_TABLE && L.risk !== "high") && (await t.prepare(e.buildD1CreateTableSql(e.D1_SCHEMA_META_TABLE, e.D1_SCHEMA_META_TABLE, { ifNotExists: !0 })).run(), d.push({
          kind: "create_table",
          target: e.D1_SCHEMA_META_TABLE
        })), (s.phase === "safe" || s.phase === "destructive") && (u = String(globalThis.crypto?.randomUUID?.() || `${$()}-${Math.random()}`), await e.acquireD1SchemaRepairLease(t, u)), s.phase === "destructive") {
          const L = await e.buildD1SchemaRepairPlan(t);
          await e.verifyD1SchemaRepairToken(r.env, r.repairToken, L);
        }
        const f = s.phase === "safe" ? s.steps.filter((L) => L.risk !== "high") : s.phase === "destructive" ? s.steps.filter((L) => L.risk === "high") : [], m = f.filter((L) => L.kind === "create_table" && L.target !== e.LOGS_FTS_TABLE && L.target !== e.D1_SCHEMA_META_TABLE).map((L) => L.target);
        for (const L of m)
          await t.prepare(e.buildD1CreateTableSql(L, L, { ifNotExists: !0 })).run(), d.push({
            kind: "create_table",
            target: L
          });
        const p = f.filter((L) => L.kind === "drop_trigger").map((L) => L.target);
        for (const L of p)
          await t.prepare(`DROP TRIGGER IF EXISTS ${de(L)}`).run(), d.push({
            kind: "drop_trigger",
            target: L
          });
        const h = f.filter((L) => L.kind === "rebuild_table").map((L) => L.target), g = f.find((L) => L.kind === "recreate_log_table" && L.target === e.LOGS_TABLE), y = [];
        for (const L of f.filter((F) => F.kind === "add_column")) {
          const [F, I] = String(L.target || "").split(".", 2), U = e.getD1RuntimeColumnAdditions()?.[F]?.[I];
          if (!U) throw new Error(`Unknown D1 column addition: ${L.target}`);
          await t.prepare(`ALTER TABLE ${de(F)} ADD COLUMN ${de(I)} ${U}`).run(), y.push(L.target), d.push({
            kind: "add_column",
            target: L.target
          });
        }
        for (const L of h)
          l.push(await e.rebuildD1TableWithShadow(t, L, s)), d.push({
            kind: "rebuild_table",
            target: L
          });
        g && (l.push(await e.recreateD1LogsDestructively(t, s)), d.push({
          kind: "recreate_log_table",
          target: e.LOGS_TABLE
        }));
        const _ = g ? Object.entries(e.getD1RuntimeIndexContract()).filter(([, L]) => L.table === e.LOGS_TABLE).map(([L]) => L) : [], S = {
          createdIndexes: [],
          repairedIndexes: []
        };
        for (const L of f.filter((F) => F.kind === "create_index" || F.kind === "repair_index")) {
          const F = e.getD1RuntimeIndexContract()?.[L.target];
          if (!F) throw new Error(`Unknown D1 runtime index: ${L.target}`);
          L.kind === "repair_index" && await t.prepare(`DROP INDEX IF EXISTS ${de(L.target)}`).run(), await t.prepare(F.createSql).run(), S[L.kind === "repair_index" ? "repairedIndexes" : "createdIndexes"].push(L.target), d.push({
            kind: L.kind,
            target: L.target
          });
        }
        const T = [];
        for (const L of f.filter((F) => F.kind === "create_unique_index")) {
          const F = e.getD1UniqueIndexContract()?.[L.target];
          if (!F) throw new Error(`Unknown D1 unique index: ${L.target}`);
          await t.prepare(F.createSql).run(), T.push(L.target), d.push({
            kind: L.kind,
            target: L.target
          });
        }
        let b = {
          rebuilt: !1,
          recreated: !1
        };
        const A = f.find((L) => L.target === e.LOGS_FTS_TABLE);
        A && r.includeFts !== !1 && (b = await e.ensureLogsFtsSchema(t, {
          forceRecreate: !0,
          baseSchemaReady: !0
        })), b?.rebuilt === !0 && d.push({
          kind: String(A?.kind || "create_fts"),
          target: e.LOGS_FTS_TABLE
        }), e.invalidateD1SchemaReadiness(t, "all");
        const C = await e.getD1SchemaSnapshot(t), N = await e.getD1SchemaStatus(t, { snapshot: C }), P = ie(ae(C.objects || [])), E = (N.schemaReady ? null : await e.buildD1SchemaRepairPlan(t))?.phase === "destructive";
        if (!N.schemaReady && !E) {
          const L = /* @__PURE__ */ new Error("D1 schema repair did not produce the current contract");
          throw L.code = "D1_SCHEMA_REPAIR_FAILED", L.status = 503, L.details = {
            phase: "final_status",
            issues: N.issues
          }, L;
        }
        const w = l.filter((L) => L?.backupTable);
        w.length && await t.batch(w.map((L) => t.prepare(`DROP TABLE IF EXISTS ${de(L.backupTable)}`)));
        let R = {
          written: !1,
          reason: "pending_high_risk"
        };
        N.schemaReady && (s.phase === "ready" ? R = (await e.verifyD1SchemaAttestation(t, r.env)).valid ? {
          written: !1,
          reused: !0,
          contractVersion: it,
          contractHash: s.contractHash
        } : await e.writeVerifiedD1SchemaMeta(t, r.env, {
          ...s,
          schemaFingerprint: P
        }) : R = await e.writeVerifiedD1SchemaMeta(t, r.env, {
          ...s,
          schemaFingerprint: P
        }));
        const D = /* @__PURE__ */ new Set([...Object.keys(e.getD1CurrentSchemaContract().columns), e.LOGS_FTS_TABLE]), x = C.objects.filter((L) => L?.type === "table").map((L) => String(L?.name || "")).filter((L) => D.has(L) && !i.has(L));
        return {
          profile: a,
          phase: s.phase,
          completed: N.schemaReady,
          pendingHighRisk: E,
          schemaReady: N.schemaReady,
          contractVersion: it,
          contractHash: s.contractHash,
          planHash: s.planHash,
          risk: s.risk,
          createdTables: x,
          addedColumns: y,
          createdIndexes: [...S.createdIndexes, ..._],
          repairedIndexes: S.repairedIndexes,
          uniqueIndexesCreated: T,
          droppedTriggers: p,
          rebuiltTables: l.map(({ table: L, rowCount: F, rowCountMeasured: I, discardedRows: U, discardedRowsIsLowerBound: V, willDiscardData: X, dataMode: v }) => X ? {
            table: L,
            rowCount: F,
            rowCountMeasured: I,
            discardedRows: U,
            discardedRowsIsLowerBound: V,
            allowsDataLoss: !0,
            willDiscardData: !0,
            dataMode: v
          } : {
            table: L,
            rowCount: F
          }),
          ftsRebuilt: b?.rebuilt === !0,
          ftsRecreated: g ? !0 : b?.recreated === !0 && s.status?.fts?.tableReady === !0,
          recoveryBookmark: String(c?.bookmark || ""),
          bookmarkCapturedAt: String(c?.capturedAt || ""),
          schemaMeta: R,
          steps: s.steps.map((L) => ({
            ...L,
            ready: d.some((F) => F.kind === L.kind && F.target === L.target) || N.schemaReady
          })),
          status: N
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
          ...k(f.details) ? f.details : {},
          executedSteps: d,
          remainingIssues: m,
          recoveryBookmark: String(c?.bookmark || ""),
          bookmarkCapturedAt: String(c?.capturedAt || "")
        }), String(f?.code || "").startsWith("D1_SCHEMA_REPAIR_")) throw f;
        const p = new Error(ue(f, "D1 schema repair failed"));
        throw p.code = "D1_SCHEMA_REPAIR_FAILED", p.status = 503, p.details = {
          ...k(f?.details) ? f.details : {},
          phase: "execution"
        }, p;
      } finally {
        u && await e.releaseD1SchemaRepairLease(t, u).catch(() => {
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
      const a = ee.LogsReadinessProbeCache.get(t), o = Math.max(1e3, Number(r.maxAgeMs) || 15e3);
      if (r.force !== !0 && a && $() - a.ts < o) return a.data;
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
      return ee.LogsReadinessProbeCache.set(t, {
        ts: $(),
        data: l
      }), l;
    },
    async resolveLogsReadiness(t, r = {}) {
      const a = e.resolveOpsStatusStores(t), o = await e.getOpsStatusSection(a, "log"), s = o?.schemaReady === !0, i = o?.ftsReady === !0, c = o?.statsReady === !0;
      return s && c && (i || r.requireFts !== !0) || !a.db ? {
        schemaReady: s,
        ftsReady: i,
        statsReady: c,
        revision: e.getLogsRevisionFromStatus(o),
        source: "status",
        logStatus: o
      } : {
        ...await e.probeLogsReadiness(a.db, r),
        revision: e.getLogsRevisionFromStatus(o),
        source: "probe",
        logStatus: o
      };
    }
  };
}
function iy(n = {}, e = {}) {
  return {
    async ensureLogsBaseSchema(t) {
      if (!t) return !1;
      if (e.isD1SchemaReadyCached(t, "logsBaseSchema")) return !0;
      let r = te.LogsBaseDbReady.get(t);
      r || (r = (async () => (await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.LOGS_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER NOT NULL, node_name TEXT NOT NULL, request_path TEXT NOT NULL, request_method TEXT NOT NULL, status_code INTEGER NOT NULL, response_time INTEGER NOT NULL, client_ip TEXT NOT NULL, inbound_colo TEXT, outbound_colo TEXT, user_agent TEXT, referer TEXT, category TEXT DEFAULT 'api', error_detail TEXT, detail_json TEXT, created_at TEXT NOT NULL, inbound_ip TEXT, outbound_ip TEXT)`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_timestamp ON ${e.LOGS_TABLE} (timestamp)`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_client_time ON ${e.LOGS_TABLE} (client_ip, timestamp DESC)`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_status_time ON ${e.LOGS_TABLE} (status_code, timestamp)`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_category_time ON ${e.LOGS_TABLE} (category, timestamp)`).run(), e.markD1SchemaReady(t, "logsBaseSchema"), e.markD1SchemaReady(t, "logsTableExists"), ee.LogsReadinessProbeCache.delete(t), !0))().catch((a) => {
        throw te.LogsBaseDbReady.delete(t), a;
      }), te.LogsBaseDbReady.set(t, r));
      try {
        return await r;
      } finally {
        te.LogsBaseDbReady.get(t) === r && te.LogsBaseDbReady.delete(t);
      }
    },
    async ensureStatsHourlySchema(t) {
      if (!t) return !1;
      if (e.isD1SchemaReadyCached(t, "statsHourlySchema")) return !0;
      let r = te.StatsHourlyDbReady.get(t);
      r || (r = t.prepare(`CREATE TABLE IF NOT EXISTS ${e.STATS_HOURLY_TABLE} (
              bucket_date TEXT NOT NULL,
              bucket_hour INTEGER NOT NULL,
              request_count INTEGER NOT NULL DEFAULT 0,
              play_count INTEGER NOT NULL DEFAULT 0,
              playback_info_count INTEGER NOT NULL DEFAULT 0,
              updated_at TEXT NOT NULL,
              PRIMARY KEY (bucket_date, bucket_hour)
            )`).run().then(() => (e.markD1SchemaReady(t, "statsHourlySchema"), e.markD1SchemaReady(t, "statsTableExists"), ee.LogsReadinessProbeCache.delete(t), !0)).catch((a) => {
        throw te.StatsHourlyDbReady.delete(t), a;
      }), te.StatsHourlyDbReady.set(t, r));
      try {
        return await r;
      } finally {
        te.StatsHourlyDbReady.get(t) === r && te.StatsHourlyDbReady.delete(t);
      }
    }
  };
}
function cy(n = {}, e = {}) {
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
      ]), te.LogsBaseDbReady.delete(t), te.StatsHourlyDbReady.delete(t), ee.LogsReadinessProbeCache.delete(t)), a === "all") {
        e.clearD1SchemaReady(t);
        const o = te.OpsStatusShadowCache.get(t);
        o?.payloadCache instanceof Map && o.payloadCache.clear(), te.AdminShellStatusWriteState.delete(t), te.DnsIpWorkspaceDbReady.delete(t), te.OpsStatusDbReady.delete(t), te.ScheduledLeaseDbReady.delete(t), te.AuthFailuresDbReady.delete(t), te.CfDashboardCacheDbReady.delete(t), te.CfRuntimeCacheDbReady.delete(t);
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
      const o = [
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
      }], i = a === "runtime-core" ? o : a === "logs-fts" ? [
        ...o,
        ...s,
        {
          name: "ensureLogsFtsSchema",
          run: () => e.ensureLogsFtsSchema(t)
        }
      ] : [...o, ...s], c = [];
      let l = {
        migratedRows: 0,
        droppedTriggers: 0,
        rebuilt: !1,
        recreated: !1
      };
      for (const d of i) {
        const u = await d.run();
        d.name === "ensureLogsFtsSchema" && k(u) && (l = {
          migratedRows: Math.max(0, Number(u.migratedRows) || 0),
          droppedTriggers: Math.max(0, Number(u.droppedTriggers) || 0),
          rebuilt: u.rebuilt === !0,
          recreated: u.recreated === !0
        }), c.push({
          name: d.name,
          ready: d.name === "ensureLogsFtsSchema" ? await e.isLogsFtsReady(t) : u === !0
        });
      }
      return ee.LogsReadinessProbeCache.delete(t), {
        profile: a,
        runtimeTablesReady: o.every((d) => c.some((u) => u.name === d.name && u.ready === !0)),
        schemaReady: await e.hasLogsBaseTable(t),
        statsReady: await e.hasStatsHourlyTable(t),
        ftsReady: await e.isLogsFtsReady(t),
        ftsResult: l,
        steps: c
      };
    }
  };
}
function ly(n = {}, e = {}) {
  return {
    ...oy(n, e),
    ...sy(n, e),
    ...iy(n, e),
    ...cy(n, e)
  };
}
function uy() {
  const n = {
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
      ].filter(([o]) => o === !0).map(([, o, s, i, c, l, d]) => ({
        key: o,
        summaryKey: s,
        stepName: i,
        tableName: c,
        whereClause: l,
        bindParams: d,
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
    async runBudgetedDeleteScopes(e = [], t = {}, r = async (o) => {
    }, a = {}) {
      const o = Number(a.startedAt) || $();
      let s = 0, i = "", c = [...e];
      for (; c.length > 0 && !i; ) {
        const u = [];
        for (const f of c) {
          if (s >= Ka) {
            i = "row_limit";
            break;
          }
          if ($() - o >= Fr) {
            i = "time_limit";
            break;
          }
          await r(f.stepName);
          const m = Math.min(Rs, Ka - s), p = await f.db.prepare(`DELETE FROM ${f.tableName} WHERE rowid IN (SELECT rowid FROM ${f.tableName} WHERE ${f.whereClause} ORDER BY rowid LIMIT ?)`).bind(...f.bindParams, m).run(), h = n.readChanges(p);
          s += h, t[f.summaryKey] = Math.max(0, Number(t[f.summaryKey]) || 0) + h, h >= m && u.push(f);
        }
        c = u;
      }
      const l = [];
      for (const u of e) await n.hasScopeRows(u) && l.push(u.key);
      const d = Math.max(0, $() - o);
      return !i && l.length > 0 && (i = d >= Fr ? "time_limit" : s >= Ka ? "row_limit" : ""), {
        hasMore: l.length > 0,
        remainingScopes: l,
        budget: {
          batchSize: Rs,
          rowLimit: Ka,
          timeLimitMs: Fr,
          processedRows: s,
          durationMs: d,
          exhaustedBy: i || null
        }
      };
    },
    async patchLogStatus(e, t, r, a, o, s, i = {}) {
      const c = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), l = String(a?.mode || i.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", d = {
        schemaReady: !0,
        ftsReady: !0,
        statsReady: !0,
        categoryEnabled: !0
      };
      return (s.rebuildStatsHourly !== !0 || o.alignedStatsWindow === !0) && (d.statsUtcOffsetMinutes = a.statsUtcOffsetMinutes ?? a.utcOffsetMinutes), (o.rebuiltStatsHourly === !0 || o.alignedStatsWindow === !0) && (d.statsAlignedAt = c, d.statsAlignedWindowStartAt = new Date((l === "scheduled" ? a.statsStartTs : a.retentionCutoffMs) || a.retentionCutoffMs).toISOString(), d.statsAlignedWindowEndAt = new Date((l === "scheduled" ? a.statsEndTs : a.nowMs) || a.nowMs).toISOString()), l === "scheduled" && s.deleteExpiredLogs === !0 && Number(o.deletedExpiredLogCount) > 0 ? await e.bumpLogsRevision(r, d, i.ctx).catch(() => {
      }) : await ge(e.patchOpsStatus(r, { log: d }, i.ctx), "d1_tidy.patch_log_status", { mode: l }, null), c;
    }
  };
  return n;
}
function dy() {
  return {
    async readBoundedCount(n, e, t = "", r = []) {
      const a = String(t || "").trim(), o = `SELECT COUNT(*) AS total FROM (SELECT 1 FROM ${e}${a ? ` WHERE ${a}` : ""} LIMIT ${za + 1})`, s = await n.prepare(o).bind(...r).first(), i = Math.max(0, Number(s?.total ?? s?.count) || 0);
      return {
        count: Math.min(za, i),
        countIsLowerBound: i >= za,
        exceedsLimit: i > za
      };
    },
    buildContext(n = {}, e = {}) {
      const t = String(e.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", r = ct(e.maintenanceMode, t), a = e.scheduledNow instanceof Date ? new Date(e.scheduledNow.getTime()) : new Date(e.scheduledNow || $()), o = Number(e.nowMs) || (t === "scheduled" ? a.getTime() : $()), s = fe(n.logRetentionDays, B.Defaults.LogRetentionDays, 1, B.Defaults.LogRetentionDaysMax), i = Math.max(0, o - s * 24 * 60 * 60 * 1e3), c = Ue(n.scheduleUtcOffsetMinutes), l = k(e.dayWindow) ? e.dayWindow : dt(a, n.scheduleUtcOffsetMinutes);
      return {
        mode: t,
        maintenanceMode: r,
        runtimeConfig: n,
        scheduledNow: a,
        nowTimestamp: o,
        retentionDays: s,
        retentionCutoffMs: i,
        utcOffsetMinutes: c,
        dayWindow: l,
        statsBucketDate: String(e.statsBucketDate || l?.dateKey || "").trim(),
        statsStartTs: Number(e.statsStartTs ?? l?.startTs) || 0,
        statsEndTs: Number(e.statsEndTs ?? l?.endTs) || 0,
        statsUtcOffsetMinutes: Ue(e.statsUtcOffsetMinutes ?? l?.utcOffsetMinutes ?? n.scheduleUtcOffsetMinutes),
        previousScheduledState: k(e.previousScheduledState) ? e.previousScheduledState : {},
        previousD1State: null,
        lastFtsRebuildAt: "",
        lastOptimizeAt: ""
      };
    },
    attachPreviousState(n, e, t = null) {
      const r = n.getPreviousD1TidyState(e.previousScheduledState, t), a = typeof r.lastFtsRebuildAt == "string" ? r.lastFtsRebuildAt : "", o = typeof r.lastOptimizeAt == "string" ? r.lastOptimizeAt : "";
      return {
        ...e,
        previousD1State: r,
        lastFtsRebuildAt: a,
        lastOptimizeAt: o || (typeof r.lastVacuumAt == "string" ? r.lastVacuumAt : "")
      };
    },
    async readFacts(n, e, t, r) {
      const a = await this.readBoundedCount(e, n.LOGS_TABLE, "timestamp < ?", [r.retentionCutoffMs]), o = await this.readBoundedCount(e, n.LOGS_TABLE, "timestamp >= ?", [r.retentionCutoffMs]), s = await this.readBoundedCount(e, n.SCHEDULED_LOCKS_TABLE, "expires_at <= ?", [r.nowTimestamp]), i = await this.readBoundedCount(e, n.DNS_IP_POOL_FETCH_CACHE_TABLE, "expires_at <= ?", [r.nowTimestamp]), c = await this.readBoundedCount(e, n.DNS_IP_PROBE_CACHE_TABLE, "expires_at <= ?", [r.nowTimestamp]), l = await this.readBoundedCount(e, n.AUTH_FAILURES_TABLE, "expires_at <= ?", [r.nowTimestamp]), d = await this.readBoundedCount(e, n.CF_DASH_CACHE_TABLE, "expires_at <= ?", [r.nowTimestamp]), u = await this.readBoundedCount(e, n.CF_RUNTIME_CACHE_TABLE, "expires_at <= ?", [r.nowTimestamp]), f = await this.readBoundedCount(e, n.STATS_HOURLY_TABLE), m = ut(r.retentionCutoffMs, r.utcOffsetMinutes).dateKey, p = await this.readBoundedCount(e, n.STATS_HOURLY_TABLE, "bucket_date < ?", [m]), h = await this.readBoundedCount(e, n.DNS_IP_POOL_ITEMS_TABLE), g = await this.readBoundedCount(e, n.DNS_IP_POOL_SOURCES_TABLE), y = await this.readBoundedCount(e, n.SYS_STATUS_TABLE), _ = await n.getOpsStatusSection({
        db: e,
        kv: t
      }, "log");
      return {
        deletedExpiredLogCount: a.count,
        preservedLogCount: o.count,
        preservedLogCountExceedsLimit: o.exceedsLimit,
        deletedExpiredLockCount: s.count,
        deletedExpiredFetchCacheCount: i.count,
        deletedExpiredProbeCacheCount: c.count,
        deletedExpiredAuthFailureCount: l.count,
        deletedExpiredDashboardCacheCount: d.count,
        deletedExpiredRuntimeCacheCount: u.count,
        deletedExpiredStatsHourlyCount: p.count,
        statsRetentionBoundaryDate: m,
        statsHourlyRowCount: f.count,
        dnsIpPoolItemCount: h.count,
        dnsIpPoolSourceCount: g.count,
        sysStatusCount: y.count,
        statsUtcOffsetMinutes: n.getStatsUtcOffsetMinutesFromStatus(_),
        countLowerBounds: {
          proxy_logs: a.countIsLowerBound,
          proxy_logs_retained: o.countIsLowerBound,
          proxy_logs_fts: o.countIsLowerBound,
          sys_locks: s.countIsLowerBound,
          dns_ip_pool_fetch_cache: i.countIsLowerBound,
          dns_ip_probe_cache: c.countIsLowerBound,
          auth_failures: l.countIsLowerBound,
          cf_dashboard_cache: d.countIsLowerBound,
          cf_runtime_cache: u.countIsLowerBound,
          proxy_stats_hourly: f.countIsLowerBound || p.countIsLowerBound,
          dns_ip_pool_items: h.countIsLowerBound,
          sys_status: y.countIsLowerBound
        },
        ftsReady: r.schemaStatus?.schemaReady === !0 || await n.isLogsFtsReady(e),
        d1DnsIpPoolSources: await n.getDnsIpPoolSourcesFromDb(e, { schemaReady: r.schemaStatus?.schemaReady === !0 }),
        kvDnsIpPoolSources: []
      };
    },
    buildSourcePolicy(n = []) {
      return {
        dnsIpPoolSourceAction: Array.isArray(n) && n.length > 0 ? "preserve_d1_primary" : "noop",
        skipDnsIpPoolSourceCleanup: !0
      };
    },
    buildFlags(n, e, t, r) {
      const a = t.deletedExpiredLogCount > 0, o = Rm(e.maintenanceMode, e.mode), s = n.shouldRunLogsFtsRebuild(e.lastFtsRebuildAt, { nowMs: e.nowTimestamp }), i = (!t.ftsReady || o || a) && s, c = t.preservedLogCount > Sd || t.preservedLogCountExceedsLimit === !0, l = i && !c, d = o ? !0 : a && n.shouldRunLogsOptimize(e.lastOptimizeAt, { nowMs: e.nowTimestamp }), u = o || t.statsUtcOffsetMinutes !== e.utcOffsetMinutes;
      return {
        deleteExpiredLogs: a,
        deleteExpiredLocks: t.deletedExpiredLockCount > 0,
        deleteExpiredFetchCache: t.deletedExpiredFetchCacheCount > 0,
        deleteExpiredProbeCache: t.deletedExpiredProbeCacheCount > 0,
        deleteExpiredAuthFailures: t.deletedExpiredAuthFailureCount > 0,
        deleteExpiredDashboardCache: t.deletedExpiredDashboardCacheCount > 0,
        deleteExpiredRuntimeCache: t.deletedExpiredRuntimeCacheCount > 0,
        deleteExpiredStatsHourly: t.deletedExpiredStatsHourlyCount > 0,
        rebuildStatsHourly: u,
        rebuildLogsFts: l,
        rebuildLogsFtsDeferred: i && !l,
        ftsRebuildDeferredReason: c ? "deferred_size_guard" : "",
        rebuildLogsFtsForceRecreate: !1,
        optimizeDb: d,
        optimizeDbDeferred: e.mode === "scheduled" && a && d !== !0,
        alignStatsWindow: u,
        rebuildDailyStats: !1,
        processDnsIpPoolSources: !1
      };
    },
    buildPreview(n, e, t, r) {
      const a = [], o = Uf(e.d1DnsIpPoolSources);
      Te(a, e.deletedExpiredLogCount > 0, "proxy_logs", "超保留期 proxy_logs 日志", [], e.deletedExpiredLogCount, `只会删除早于 ${new Date(n.retentionCutoffMs).toISOString()} 的日志。`), Te(a, e.deletedExpiredLockCount > 0, "sys_locks", "过期 sys_locks 定时租约", [], e.deletedExpiredLockCount, "只会删除 expires_at 已过期的租约记录。"), Te(a, e.deletedExpiredFetchCacheCount > 0, "dns_ip_pool_fetch_cache", "过期 dns_ip_pool_fetch_cache 聚合缓存", [], e.deletedExpiredFetchCacheCount, "只会删除 expires_at 已过期的 API 抓取聚合缓存。"), Te(a, e.deletedExpiredProbeCacheCount > 0, "dns_ip_probe_cache", "过期 dns_ip_probe_cache 探测缓存", [], e.deletedExpiredProbeCacheCount, "只会删除 expires_at 已过期的探测缓存。"), Te(a, e.deletedExpiredAuthFailureCount > 0, "auth_failures", "过期 auth_failures 登录失败计数", [], e.deletedExpiredAuthFailureCount, "只会删除 expires_at 已过期的登录失败计数。"), Te(a, e.deletedExpiredDashboardCacheCount > 0, "cf_dashboard_cache", "过期 cf_dashboard_cache 仪表盘缓存", [], e.deletedExpiredDashboardCacheCount, "只会删除 expires_at 已过期的仪表盘缓存。"), Te(a, e.deletedExpiredRuntimeCacheCount > 0, "cf_runtime_cache", "过期 cf_runtime_cache 运行缓存", [], e.deletedExpiredRuntimeCacheCount, "只会删除 expires_at 已过期的运行缓存。"), Te(a, e.deletedExpiredStatsHourlyCount > 0, "proxy_stats_hourly_expired", "过期 proxy_stats_hourly 日期桶", [], e.deletedExpiredStatsHourlyCount, `只删除早于边界日 ${e.statsRetentionBoundaryDate} 的统计桶。`);
      const s = [
        ht("proxy_stats_hourly", "proxy_stats_hourly 统计表", [], {
          count: Math.max(1, e.statsHourlyRowCount),
          note: r.rebuildStatsHourly ? `会清空当前统计（当前行数 ${e.statsHourlyRowCount}），并从后续新日志重新累计，不扫描历史日志。` : `保留当前统计，仅分页删除保留期边界前的日期桶（当前行数 ${e.statsHourlyRowCount}）。`
        }),
        ht("proxy_logs_fts", "proxy_logs_fts 全文索引", [], {
          count: Math.max(1, e.preservedLogCount),
          note: r.ftsRebuildDeferredReason === "deferred_size_guard" ? "基础日志超过 10000 行，本轮不会自动 rebuild。" : e.ftsReady ? "仅在无清理积压、预算有余量且满足最小间隔时重建。" : "当前未检测到 FTS 表，整理时会按资源预算决定是否补建。"
        }),
        ht("scheduled_d1_tidy", "scheduled.d1Tidy 运行状态", ["scheduled.d1Tidy"], {
          count: 1,
          note: "整理完成后会写入一份新的运行状态摘要。"
        })
      ], i = [
        ht("proxy_logs_retained", "保留期内 proxy_logs 日志", [], {
          count: e.preservedLogCount,
          note: `会保留最近 ${n.retentionDays} 天的日志。`
        }),
        ht("dns_ip_pool_items", "dns_ip_pool_items 共享 IP 池", [], {
          count: e.dnsIpPoolItemCount,
          note: "不会删除 dns_ip_pool_items。"
        }),
        ht("sys_status", "sys_status 运行状态", [], {
          count: e.sysStatusCount,
          note: "不会删除 sys_status 中的有效运行状态。"
        })
      ];
      Te(i, e.d1DnsIpPoolSources.length > 0, "dns_ip_pool_sources_d1_primary", "dns_ip_pool_sources 主数据", o, e.d1DnsIpPoolSources.length, "dns_ip_pool_sources 现在是正式主数据，本次不会迁回 KV，也不会清空该表。");
      const c = { proxy_stats_hourly_expired: "proxy_stats_hourly" };
      for (const u of [
        ...a,
        ...s,
        ...i
      ]) {
        const f = c[u.key] || u.key;
        e.countLowerBounds?.[f] === !0 && (u.countIsLowerBound = !0);
      }
      const l = [], d = Math.max(0, Number(n.logQueuePendingCount) || 0);
      return d > 0 && l.push(`执行前会先尝试 flush ${d} 条内存日志，再开始清理 D1。`), l.push(n.maintenanceMode === "full" ? "当前为 full 维护模式；统计会清空后重新累计，FTS 与 optimize 仍受大小、积压、间隔和时间预算约束。" : "当前为 smart 维护模式，只在检测到必要条件且预算允许时执行较重的统计、FTS 与 optimize。"), a.length === 0 && l.push(n.mode === "scheduled" ? "当前定时 D1 维护没有检测到需要删除的旧数据，本轮会按计划检查统计与索引维护。" : "当前没有检测到需要删除的 D1 旧数据；本次主要会执行统计表与 FTS 维护。"), {
        scope: "d1",
        fieldGroups: [],
        deleteGroups: a,
        rewriteGroups: s,
        preserveGroups: i,
        warnings: l
      };
    },
    buildSummary(n, e, t, r = {}) {
      return {
        mode: n.mode,
        maintenanceMode: n.maintenanceMode,
        logRetentionDays: n.retentionDays,
        retentionCutoffAt: new Date(n.retentionCutoffMs).toISOString(),
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
        logQueuePendingCount: Math.max(0, Number(n.logQueuePendingCount) || 0),
        dnsIpPoolSourceAction: t.dnsIpPoolSourceAction,
        lastFtsRebuildAt: n.lastFtsRebuildAt,
        lastOptimizeAt: n.lastOptimizeAt
      };
    }
  };
}
var fy = Object.freeze({
  PREFIX: "node:",
  CONFIG_KEY: "sys:theme",
  NODES_INDEX_KEY: "sys:nodes_index:v1",
  NODES_SUMMARY_INDEX_KEY: "sys:nodes_index_full:v2",
  ADMIN_INDEX_UPLOAD_PREFIX: Yu,
  ADMIN_ACTIVE_INDEX_KEY: Ju,
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
function my(n = {}) {
  const { nodeRepository: e } = n;
  return {
    async getNodesList(t, r) {
      const a = e.getKV(t);
      if (!a) return [];
      const o = be(a);
      if (o.NodesListCache && o.NodesListCache.exp > $()) return o.NodesListCache.data;
      const s = await e.getNodesSummaryIndex(a, { ctx: r });
      if (Array.isArray(s)) return s;
      const i = await e.rebuildNodeIndexesFromKv(a, { ctx: r });
      return Array.isArray(i?.summaries) ? i.summaries : [];
    },
    async getNodesListStrict(t, r) {
      const a = e.getKV(t);
      if (!a) return [];
      const o = be(a);
      if (o.NodesListCache && o.NodesListCache.exp > $()) return o.NodesListCache.data;
      const s = await e.getNodesSummaryIndexStrict(a, { ctx: r });
      if (Array.isArray(s)) return s;
      const i = await e.rebuildNodeIndexesFromKvStrict(a, { ctx: r });
      return Array.isArray(i?.summaries) ? i.summaries : [];
    },
    async invalidateList(t, r = null) {
      const a = e.getKV(r), o = be(a);
      o.NodesListCache = null, o.NodesIndexCache = null, dr(a);
    },
    maybeCleanup(t = null) {
      const r = t ? be(e.getKV(t)) : Tt.current(), a = $(), o = r.CleanupState;
      if (a - (o.lastRunAt || 0) < B.Defaults.CleanupMinIntervalMs) return;
      o.lastRunAt = a;
      const s = B.Defaults.CleanupBudgetMs, i = B.Defaults.CleanupChunkSize, c = o.iterators || (o.iterators = {
        node: null,
        playbackRoute: null,
        crypto: null,
        rate: null,
        log: null,
        playbackInfo: null,
        failover: null,
        progress: null,
        monthlyTraffic: null
      }), l = a, d = (u, f, m, p = c, h = (g) => u.delete(g)) => {
        let g = p[m];
        g || (g = u.entries(), p[m] = g);
        let y = 0;
        for (; y < i && (y === 0 || $() - l < s); ) {
          const _ = g.next();
          if (_.done) {
            p[m] = null;
            break;
          }
          y += 1;
          const [S, T] = _.value;
          u.has(S) && f(T, a) && h(S);
        }
      };
      if (o.phase === 0)
        d(r.NodeCache, (u) => u?.exp && u.exp < a, "node", r.CleanupIterators), o.phase = 1;
      else if (o.phase === 1)
        d(r.PlaybackRouteHotCache, (u) => !u || Number(u.expiresAt) <= a, "playbackRoute", r.CleanupIterators), o.phase = 2;
      else if (o.phase === 2)
        d(ee.CryptoKeyCache, (u) => u?.exp && u.exp < a, "crypto"), o.phase = 3;
      else if (o.phase === 3)
        d(Ve.RateLimitCache, (u) => !u || u.resetAt < a, "rate"), o.phase = 4;
      else if (o.phase === 4) o.phase = 5;
      else if (o.phase === 5)
        d(ee.PlaybackInfoResponseCache, (u) => !u || (Number(u.expiresAt) || 0) <= a || !au(u, $o), "playbackInfo", c), o.phase = 6;
      else if (o.phase === 6)
        d(ee.ProxyFailoverStateCache, (u) => {
          if (!u || typeof u != "object") return !0;
          if (u.failingTargets instanceof Map)
            for (const [y, _] of u.failingTargets) Number(_) <= a && u.failingTargets.delete(y);
          const f = Number(u.preferredTargetExpiresAt) > a, m = u.failingTargets instanceof Map && u.failingTargets.size > 0, p = !!u.inFlightProbe && Number(u.inFlightProbe.expiresAt) > a, h = Number(u.lastProbeResult?.completedAt) || 0, g = !!u.lastProbeResult && h + B.Defaults.HedgePreferredTtlSec * 1e3 > a;
          return !f && !m && !p && !g;
        }, "failover"), o.phase = 7;
      else if (o.phase === 7) {
        const u = Math.max(3e4, Math.max(1, Number(B.Defaults.VideoProgressForwardIntervalSec) || 1) * 2e4);
        d(ee.PlaybackProgressRelay, (f) => {
          if (!f || f.pendingSnapshot || f.activeFlushPromise) return !f;
          const m = Number(f.terminalTombstoneUntil) || 0;
          if (m > 0) return m < a;
          const p = Number(f.lastTouchedAt || f.lastForwardAt) || 0;
          return p > 0 && p + u <= a;
        }, "progress", c, or), o.phase = 8;
      } else
        d(ee.DashboardMonthlyTrafficCache, (u) => !u || (Number(u.staleUntil) || 0) <= a, "monthlyTraffic"), o.phase = 0;
    }
  };
}
function py(n = {}, e = {}) {
  return {
    normalizeNodeIndex(t = []) {
      return [...new Set((Array.isArray(t) ? t : []).map((r) => String(r || "").toLowerCase().trim()).filter(Boolean))];
    },
    normalizeNodeSummaryPayload(t, r = {}) {
      if (!k(r)) return null;
      const a = String(t || r.name || "").toLowerCase().trim();
      if (!a) return null;
      const o = e.normalizeLines(r.lines, r.target, r.port).slice(0, ao);
      if (!o.length) return null;
      const s = e.resolveActiveLineId(r.activeLineId, o, Array.isArray(r.lines) ? r.lines : [], r.port), i = ir(r.entryMode);
      return {
        name: a,
        cacheRevision: bo(a, r),
        displayName: String(r.displayName ?? ""),
        entryMode: i,
        hostPrefixCnameTarget: i === "host_prefix" ? Xt(r.hostPrefixCnameTarget) : "",
        secret: i === "host_prefix" ? "" : String(r.secret ?? ""),
        tag: Vr(r.tags, r.tag)[0] || "",
        tags: Vr(r.tags, r.tag),
        tagColor: String(r.tagColor ?? ""),
        remark: String(r.remark ?? ""),
        tmdbAggregationEnabled: r.tmdbAggregationEnabled === !0,
        aggregationMode: Or(r.aggregationMode),
        lines: o.map((c) => ({
          id: String(c.id || "").trim(),
          name: String(c.name || "").trim(),
          target: String(c.target || "").trim()
        })),
        activeLineId: s,
        playbackInfoMode: xr(r.playbackInfoMode),
        mediaAuthMode: Gt(r.mediaAuthMode),
        realClientIpMode: Pr(r.realClientIpMode),
        hedgeProbePath: ga(r.hedgeProbePath),
        routingDecisionMode: kr(r.routingDecisionMode),
        mainVideoStreamMode: En(r.mainVideoStreamMode ?? r.wangpanDirectMode ?? r.wangpanMode)
      };
    },
    buildComparableNodeSummary(t = {}) {
      return e.normalizeNodeSummaryPayload(t?.name, t);
    },
    areNodeSummariesEquivalent(t = {}, r = {}) {
      return ae(e.buildComparableNodeSummary(t)) === ae(e.buildComparableNodeSummary(r));
    },
    hasLegacyNodeMirrorFields(t = {}) {
      return k(t) ? Object.prototype.hasOwnProperty.call(t, "headers") || Object.prototype.hasOwnProperty.call(t, "target") || Object.prototype.hasOwnProperty.call(t, "port") || Object.prototype.hasOwnProperty.call(t, "schemaVersion") || Object.prototype.hasOwnProperty.call(t, "createdAt") || Object.prototype.hasOwnProperty.call(t, "updatedAt") || Object.prototype.hasOwnProperty.call(t, "remarkColor") || Object.prototype.hasOwnProperty.call(t, "wangpanDirectMode") || Object.prototype.hasOwnProperty.call(t, "wangpanMode") || [...Vo, ...jo].some((r) => Object.prototype.hasOwnProperty.call(t, r)) ? !0 : (Array.isArray(t.lines) ? t.lines : []).some((r) => k(r) ? Object.prototype.hasOwnProperty.call(r, "port") || Object.prototype.hasOwnProperty.call(r, "latencyMs") || Object.prototype.hasOwnProperty.call(r, "latencyUpdatedAt") : !1) : !1;
    },
    summaryEntryRequiresNodeEntityRebuild(t = {}) {
      if (!k(t) || e.hasLegacyNodeMirrorFields(t)) return !0;
      const r = Array.isArray(t.lines) ? t.lines : [], a = e.normalizeLines(r, t.target, t.port);
      if (!a.length || r.length !== a.length) return !0;
      for (let o = 0; o < a.length; o += 1) {
        const s = r[o], i = a[o];
        if (!k(s) || !k(i) || String(s.target || "").trim() !== String(i.target || "").trim()) return !0;
      }
      return String(t.activeLineId || "").trim() !== e.resolveActiveLineId(t.activeLineId, a, r, t.port);
    },
    buildNodeSummary(t, r = {}, a = {}) {
      const o = String(t || r.name || "").toLowerCase().trim();
      if (!o || !k(r)) return {
        summary: null,
        changed: !1,
        legacyMirrorDetected: !1
      };
      const s = e.normalizeNode(o, r, a), i = e.normalizeNodeSummaryPayload(o, s.data);
      if (!i) return {
        summary: null,
        changed: !0,
        legacyMirrorDetected: e.hasLegacyNodeMirrorFields(r)
      };
      const c = e.normalizeNodeSummaryPayload(o, r), l = e.hasLegacyNodeMirrorFields(r);
      return {
        summary: i,
        changed: l || !e.areNodeSummariesEquivalent(c, i),
        legacyMirrorDetected: l
      };
    },
    normalizeNodeSummaryIndex(t = []) {
      const r = [], a = /* @__PURE__ */ new Set();
      let o = !1, s = !1, i = !1;
      for (const c of Array.isArray(t) ? t : []) {
        if (!k(c)) {
          o = !0, i = !0;
          continue;
        }
        const l = String(c.name || "").trim(), d = l.toLowerCase();
        if (!d || a.has(d)) {
          o = !0, i = !0;
          continue;
        }
        const { name: u, ...f } = c, m = e.buildNodeSummary(d, f);
        if (!m.summary) {
          o = !0, i = !0;
          continue;
        }
        (m.changed || l !== d) && (o = !0), m.legacyMirrorDetected && (s = !0), e.summaryEntryRequiresNodeEntityRebuild(f) && (i = !0), r.push(m.summary), a.add(d);
      }
      return {
        nodes: r,
        changed: o,
        legacyMirrorDetected: s,
        requiresRebuild: i
      };
    },
    primeNodeSummaryCaches(t = [], r = null) {
      const a = be(r), o = Array.isArray(t) ? t.filter((i) => k(i) && i.name) : [], s = e.normalizeNodeIndex(o.map((i) => i.name));
      return a.NodesListCache = {
        data: o.map((i) => ({ ...i })),
        exp: $() + 6e4
      }, a.NodesIndexCache = {
        data: s,
        exp: $() + 6e4
      }, o;
    },
    async getNodesSummaryIndex(t, r = {}) {
      if (!t) return null;
      const a = be(t);
      if (r.useCache !== !1 && a.NodesListCache?.exp > $() && Array.isArray(a.NodesListCache.data)) return a.NodesListCache.data;
      const o = a.NodesRevisionCacheGeneration;
      let s = null;
      try {
        s = await t.get(e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
      } catch {
        return null;
      }
      if (a.NodesRevisionCacheGeneration !== o) return Array.isArray(s) ? e.normalizeNodeSummaryIndex(s).nodes : null;
      if (!Array.isArray(s)) return null;
      const i = e.normalizeNodeSummaryIndex(s);
      if (i.requiresRebuild === !0) {
        const c = await e.rebuildNodeIndexesFromKv(t, { ctx: r.ctx });
        return Array.isArray(c?.summaries) ? c.summaries : [];
      }
      return a.NodesRevisionCacheGeneration === o ? e.primeNodeSummaryCaches(i.nodes, t) : i.nodes;
    },
    async getNodesSummaryIndexStrict(t, r = {}) {
      if (!t) return null;
      const a = be(t);
      if (r.useCache !== !1 && a.NodesListCache?.exp > $() && Array.isArray(a.NodesListCache.data)) return a.NodesListCache.data;
      const o = a.NodesRevisionCacheGeneration, s = await ve(t, e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
      if (a.NodesRevisionCacheGeneration !== o) return Array.isArray(s) ? e.normalizeNodeSummaryIndex(s).nodes : [];
      if (!Array.isArray(s)) {
        const c = await e.rebuildNodeIndexesFromKvStrict(t, { ctx: r.ctx });
        return Array.isArray(c?.summaries) ? c.summaries : [];
      }
      const i = e.normalizeNodeSummaryIndex(s);
      if (i.requiresRebuild === !0) {
        const c = await e.rebuildNodeIndexesFromKvStrict(t, { ctx: r.ctx });
        return Array.isArray(c?.summaries) ? c.summaries : [];
      }
      return a.NodesRevisionCacheGeneration === o ? e.primeNodeSummaryCaches(i.nodes, t) : i.nodes;
    },
    async loadNodeSummariesForMutation(t, r = {}) {
      const a = await t.get(e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
      if (Array.isArray(a)) {
        const o = e.normalizeNodeSummaryIndex(a);
        if (o.requiresRebuild !== !0) return o.nodes;
      }
      return (await e.loadAllNodeEntitiesFromKvStrict(t, { ctx: r.ctx })).map((o) => e.buildNodeSummary(o?.name, o).summary).filter(Boolean);
    },
    async commitNodesSummaryIndexMutation(t, r = {}) {
      const { kv: a, ctx: o, syncLegacyIndex: s = !1 } = r, i = e.normalizeNodeSummaryIndex(t).nodes, c = e.normalizeNodeIndex(i.map((h) => h.name)), l = e.buildNodesIndexMeta(c, i), d = await e.readRevisionMeta(a, e.NODES_INDEX_META_KEY, {
        count: 0,
        indexHash: "",
        fullIndexHash: ""
      }), u = [];
      (d.fullIndexHash !== l.fullIndexHash || !d.revision) && u.push(a.put(e.NODES_SUMMARY_INDEX_KEY, JSON.stringify(i))), s !== !1 && (d.indexHash !== l.indexHash || !d.revision) && u.push(a.put(e.NODES_INDEX_KEY, JSON.stringify(c)));
      const f = d.indexHash !== l.indexHash || d.fullIndexHash !== l.fullIndexHash || Number(d.count) !== Number(l.count) || !d.revision;
      if (u.length > 0) {
        const h = Promise.all(u);
        o && o.waitUntil(h), await h;
      }
      if (f) {
        const h = a.put(e.NODES_INDEX_META_KEY, JSON.stringify(l));
        o && o.waitUntil(h), await h;
      }
      const m = e.primeNodeSummaryCaches(i, a), p = f ? l : d;
      return Xs(p.revision, a), {
        summaries: m,
        meta: p
      };
    },
    async persistNodesSummaryIndex(t, r = {}) {
      const { kv: a, ctx: o, syncLegacyIndex: s = !1 } = r, i = e.normalizeNodeSummaryIndex(t).nodes;
      if (!a) {
        const c = e.primeNodeSummaryCaches(i, a);
        return dr(a), c;
      }
      return await Ir(async () => (await e.commitNodesSummaryIndexMutation(i, {
        kv: a,
        ctx: o,
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
      return t ? (await ta(await e.listNodeEntityKeys(t), B.Defaults.NodesReadConcurrency, async (o) => {
        try {
          const s = await t.get(`${e.PREFIX}${o}`, { type: "json" });
          if (!s) return null;
          const i = e.normalizeNode(o, s);
          if (i.changed && !rt(o, i.data)) {
            const c = t.put(`${e.PREFIX}${o}`, JSON.stringify(i.data));
            a ? a.waitUntil(c) : await c;
          }
          return {
            name: o,
            ...i.data
          };
        } catch {
          return null;
        }
      })).filter(Boolean) : [];
    },
    async loadAllNodeEntitiesFromKvStrict(t, r = {}) {
      return t ? (await ta(await e.listNodeEntityKeysStrict(t), B.Defaults.NodesReadConcurrency, async (a) => {
        const o = await ve(t, `${e.PREFIX}${a}`, { type: "json" });
        return o ? {
          name: a,
          ...e.normalizeNode(a, o).data
        } : null;
      })).filter(Boolean) : [];
    },
    async rebuildNodeIndexesFromKv(t, r = {}) {
      const { ctx: a, syncLegacyIndex: o = !1 } = r;
      return t ? await Ir(async () => {
        const s = await e.loadAllNodeEntitiesFromKvStrict(t, { ctx: a }), i = s.map((l) => e.buildNodeSummary(l?.name, l).summary).filter(Boolean), c = await e.commitNodesSummaryIndexMutation(i, {
          kv: t,
          ctx: a,
          syncLegacyIndex: o
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
      const a = be(t), o = a.NodesRevisionCacheGeneration, s = await e.loadAllNodeEntitiesFromKvStrict(t, r), i = s.map((l) => e.buildNodeSummary(l?.name, l).summary).filter(Boolean), c = a.NodesRevisionCacheGeneration === o ? e.primeNodeSummaryCaches(i, t) : i;
      return {
        index: e.normalizeNodeIndex(c.map((l) => l?.name)),
        summaries: c,
        nodes: s
      };
    },
    async upsertNodeSummaryEntry(t, r, a = {}) {
      const { kv: o, ctx: s } = a;
      if (!o) return null;
      const i = String(t || "").toLowerCase().trim();
      if (!i || rt(i, r)) return null;
      const c = e.buildNodeSummary(i, r).summary;
      if (!c) return null;
      const l = be(o), d = l.NodesListCache?.exp > $() && Array.isArray(l.NodesListCache.data) ? l.NodesListCache.data.find((u) => String(u?.name || "").toLowerCase().trim() === i) : null;
      return d && e.areNodeSummariesEquivalent(d, c) ? d : await Ir(async () => {
        const u = await e.loadNodeSummariesForMutation(o, { ctx: s });
        let f = !1;
        const m = u.map((p) => String(p?.name || "").toLowerCase().trim() !== i ? p : (f = !0, e.areNodeSummariesEquivalent(p, c) ? p : c));
        return f || m.push(c), (await e.commitNodesSummaryIndexMutation(m, {
          kv: o,
          ctx: s
        })).summaries.find((p) => String(p?.name || "").toLowerCase().trim() === i) || c;
      }, o);
    },
    async removeNodeSummaryEntry(t, r = {}) {
      const { kv: a, ctx: o } = r;
      if (!a) return [];
      const s = String(t || "").toLowerCase().trim();
      return await Ir(async () => {
        const i = (await e.loadNodeSummariesForMutation(a, { ctx: o })).filter((c) => String(c?.name || "").toLowerCase().trim() !== s);
        return (await e.commitNodesSummaryIndexMutation(i, {
          kv: a,
          ctx: o
        })).summaries;
      }, a);
    },
    async getNodesIndex(t) {
      if (!t) return [];
      const r = be(t);
      if (r.NodesIndexCache?.exp > $() && Array.isArray(r.NodesIndexCache.data)) return [...r.NodesIndexCache.data];
      if (r.NodesListCache?.exp > $() && Array.isArray(r.NodesListCache.data)) {
        const s = e.normalizeNodeIndex(r.NodesListCache.data.map((i) => i?.name));
        return r.NodesIndexCache = {
          data: s,
          exp: $() + 6e4
        }, [...s];
      }
      const a = r.NodesRevisionCacheGeneration, o = e.normalizeNodeIndex(await t.get(e.NODES_INDEX_KEY, { type: "json" }) || []);
      if (r.NodesRevisionCacheGeneration !== a) return [...o];
      if (!o.length) {
        const s = await e.rebuildNodeIndexesFromKv(t);
        return [...e.normalizeNodeIndex(s.index)];
      }
      return r.NodesRevisionCacheGeneration === a && (r.NodesIndexCache = {
        data: o,
        exp: $() + 6e4
      }), [...o];
    },
    buildPlaybackRouteHotSignature(t, r = {}) {
      const a = String(t || "").toLowerCase().trim(), o = ie(ae(e.getOrderedNodeLines(r).map((s) => String(s?.target || "").trim()).filter(Boolean)));
      return {
        cacheKey: `${a}:${String(r?.activeLineId || "").trim()}:${o}`,
        orderedTargetSignature: o
      };
    },
    buildPlaybackRouteHotSnapshot(t, r = {}, a = {}) {
      const o = String(t || "").toLowerCase().trim();
      if (!o || !k(r) || rt(o, r)) return null;
      const s = e.getOrderedNodeLines(r), i = (s.length ? s.map((m) => m?.target) : String(r.target || "").split(",").map((m) => m.trim()).filter(Boolean)).map((m) => Ua(m)).filter(Qe);
      if (!i.length) return null;
      const c = Array.isArray(r.lines) ? r.lines.map((m) => k(m) ? { ...m } : m) : [], l = k(r.headers) ? { ...r.headers } : {}, d = {
        ...r,
        lines: c,
        headers: l
      }, { cacheKey: u, orderedTargetSignature: f } = e.buildPlaybackRouteHotSignature(o, d);
      return {
        nodeName: o,
        cacheKey: u,
        expiresAt: $() + md,
        nodesRevision: String(a.nodesRevision || "").trim(),
        nodeCacheRevision: bo(o, d),
        orderedTargetSignature: f,
        secret: String(d.secret || "").trim(),
        headers: l,
        lines: c,
        activeLineId: String(d.activeLineId || "").trim(),
        mainVideoStreamMode: Gr(d),
        playbackInfoMode: xr(d.playbackInfoMode),
        mediaAuthMode: Gt(d.mediaAuthMode),
        realClientIpMode: Pr(d.realClientIpMode),
        routingDecisionMode: kr(d.routingDecisionMode),
        targetRecords: i,
        nodeData: d
      };
    },
    getPlaybackRouteHotSnapshot(t, r = null) {
      const a = String(t || "").toLowerCase().trim();
      if (!a) return null;
      const o = be(r ? e.getKV(r) : null).PlaybackRouteHotCache, s = o.get(a);
      return s ? Number(s.expiresAt) <= $() ? (o.delete(a), null) : (dn(o, a), s) : null;
    },
    async getVerifiedPlaybackRouteHotSnapshot(t, r) {
      const a = e.getKV(r), o = be(a), s = Oe(t, o), i = e.getPlaybackRouteHotSnapshot(t, r);
      if (!i) return null;
      if (!a) return i;
      const c = await e.getNodesRevision(a);
      return Oe(t, o) !== s ? null : !i.nodesRevision || !c || i.nodesRevision === c ? i : (e.invalidatePlaybackRouteHotCache(t, r), null);
    },
    setPlaybackRouteHotSnapshot(t, r = {}, a = {}, o = null) {
      const s = e.buildPlaybackRouteHotSnapshot(t, r, a);
      return s ? (Ne(be(o ? e.getKV(o) : null).PlaybackRouteHotCache, s.nodeName, s, lr), s) : null;
    },
    async primePlaybackRouteHotSnapshot(t, r = {}, a) {
      const o = e.getKV(a), s = be(o), i = Oe(t, s), c = o ? await e.getNodesRevision(o) : "";
      return Oe(t, s) !== i ? null : e.setPlaybackRouteHotSnapshot(t, r, { nodesRevision: c }, a);
    },
    invalidatePlaybackRouteHotCache(t = [], r = null) {
      const a = be(r ? e.getKV(r) : null).PlaybackRouteHotCache;
      for (const o of Array.isArray(t) ? t : [t]) {
        const s = String(o || "").toLowerCase().trim();
        s && a.delete(s);
      }
    },
    invalidateNodeCaches(t = [], r = {}) {
      const a = r.kv || (r.env ? e.getKV(r.env) : null), o = be(a), s = [];
      for (const i of Array.isArray(t) ? t : [t]) {
        const c = String(i || "").toLowerCase().trim();
        c && (s.push(c), o.NodeCache.delete(c), o.PlaybackRouteHotCache.delete(c));
      }
      s.length > 0 && (Cp(s, o), Nl(s), Dl(s)), r.invalidateList && (o.NodesListCache = null, o.NodesIndexCache = null, dr(a));
    },
    async persistNodesIndex(t, r = {}) {
      const { kv: a, ctx: o, invalidateList: s = !1 } = r, i = be(a), c = e.normalizeNodeIndex(t);
      return s && (i.NodesListCache = null), a ? await Ir(async () => {
        const l = await e.readRevisionMeta(a, e.NODES_INDEX_META_KEY, {
          count: 0,
          indexHash: "",
          fullIndexHash: ""
        }), d = ie(ae(c)), u = l.indexHash === d && l.revision ? l.updatedAt : /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), f = {
          ...l,
          updatedAt: u,
          revision: l.indexHash === d && l.revision ? l.revision : zt(ie(`${d}:${l.fullIndexHash || ""}:${c.length}`), u),
          hash: l.hash || "",
          count: c.length,
          indexHash: d,
          fullIndexHash: String(l.fullIndexHash || "")
        }, m = [];
        (l.indexHash !== d || !l.revision) && m.push(a.put(e.NODES_INDEX_KEY, JSON.stringify(c)));
        const p = l.indexHash !== d || Number(l.count) !== c.length || !l.revision;
        if (m.length > 0) {
          const h = Promise.all(m);
          o && o.waitUntil(h), await h;
        }
        if (p) {
          const h = a.put(e.NODES_INDEX_META_KEY, JSON.stringify(f));
          o && o.waitUntil(h), await h;
        }
        return i.NodesIndexCache = {
          data: c,
          exp: $() + 6e4
        }, Xs(f.revision, a), c;
      }, a) : (i.NodesIndexCache = {
        data: c,
        exp: $() + 6e4
      }, dr(a), c);
    }
  };
}
function gy(n = {}, e = {}) {
  return {
    getDnsRecordHistoryKey(t, r) {
      const a = encodeURIComponent(String(t || "").trim() || "default"), o = encodeURIComponent(String(r || "").trim() || "unknown");
      return `${e.DNS_RECORD_HISTORY_PREFIX}${a}:${o}`;
    },
    getDnsHostHistoryRecordId(t) {
      return `host:${oe(t) || "unknown"}`;
    },
    normalizeDnsHistoryValueKey(t, r) {
      return `${String(t || "").trim().toUpperCase()}::${String(r || "").trim().toLowerCase()}`;
    },
    normalizeDnsRecordHistoryEntry(t = {}) {
      const r = t && typeof t == "object" ? t : {}, a = String(r.type || "").trim().toUpperCase(), o = String(r.content || "").trim(), s = String(r.savedAt || r.updatedAt || r.createdAt || "").trim(), i = s ? new Date(s) : null, c = i && !Number.isNaN(i.getTime()) ? i.toISOString() : "", l = String(r.name || "").trim(), d = String(r.actor || "admin").trim() || "admin", u = String(r.source || "ui").trim() || "ui", f = oe(r.requestHost), m = [
        a,
        o.toLowerCase(),
        l.toLowerCase(),
        f,
        c || s,
        u.toLowerCase()
      ].join("|");
      return {
        id: String(r.id || `dns-hist-${ie(m || "empty")}`),
        name: l,
        type: a,
        content: o,
        savedAt: c,
        actor: d,
        source: u,
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
        if (a.set(c, r.length), r.push(i), r.length >= B.Defaults.DnsHistoryLimit) break;
      }
      let o = !1;
      for (const s of r)
        if (s.preferredFallback === !0) {
          if (o) {
            s.preferredFallback = !1;
            continue;
          }
          o = !0;
        }
      return r;
    },
    async getDnsRecordHistory(t, r, a) {
      if (!t || !r || !a) return [];
      try {
        const o = await t.get(e.getDnsRecordHistoryKey(r, a), { type: "json" });
        return e.normalizeDnsRecordHistory(o);
      } catch {
        return [];
      }
    },
    async getDnsRecordHistoryForMutation(t, r, a) {
      if (!t || !r || !a) return [];
      const o = await t.get(e.getDnsRecordHistoryKey(r, a), { type: "json" });
      return e.normalizeDnsRecordHistory(o);
    },
    async persistDnsRecordHistory(t, r, a, o) {
      if (!t || !r || !a) return [];
      const s = e.normalizeDnsRecordHistory(o);
      return await t.put(e.getDnsRecordHistoryKey(r, a), JSON.stringify(s)), s;
    },
    async recordDnsRecordHistory(t, r, a, o = {}) {
      if (!t || !r || !a) return [];
      const s = await e.getDnsRecordHistoryForMutation(t, r, a), i = e.normalizeDnsRecordHistoryEntry(o);
      if (i.type !== "CNAME" || !i.content) return s;
      s.find((d) => e.normalizeDnsHistoryValueKey(d?.type, d?.content) === e.normalizeDnsHistoryValueKey(i.type, i.content))?.preferredFallback === !0 && (i.preferredFallback = !0);
      const c = e.normalizeDnsHistoryValueKey(i.type, i.content), l = s[0] ? e.normalizeDnsHistoryValueKey(s[0].type, s[0].content) : "";
      return l && l === c ? s : e.persistDnsRecordHistory(t, r, a, [i, ...s]);
    },
    async getDnsHostHistory(t, r, a) {
      return e.getDnsRecordHistory(t, r, e.getDnsHostHistoryRecordId(a));
    },
    async persistDnsHostHistory(t, r, a, o) {
      return e.persistDnsRecordHistory(t, r, e.getDnsHostHistoryRecordId(a), o);
    },
    async recordDnsHostHistory(t, r, a, o = {}) {
      return e.recordDnsRecordHistory(t, r, e.getDnsHostHistoryRecordId(a), o);
    },
    async setDnsHostHistoryPreferredFallback(t, r, a, o = "", s = !0) {
      if (!t || !r || !a) return [];
      const i = await e.getDnsHostHistory(t, r, a), c = String(o || "").trim();
      let l = !1;
      const d = i.map((u) => {
        const f = c && String(u?.id || "").trim() === c;
        return f && (l = !0), {
          ...u,
          preferredFallback: s === !0 ? f : !1
        };
      });
      if (s === !0 && c && !l) throw new Error("dns_history_entry_not_found");
      return e.persistDnsHostHistory(t, r, a, d);
    },
    getCurrentDateKey(t = /* @__PURE__ */ new Date(), r = B.Defaults.ScheduleUtcOffsetMinutes) {
      return ut(t, r).dateKey;
    }
  };
}
function hy(n = {}, e = {}) {
  return {
    buildLegacyConfigCacheKeys(...t) {
      const r = /* @__PURE__ */ new Set([sl]);
      for (const a of t) {
        const o = e.getCurrentDateKey(/* @__PURE__ */ new Date(), a?.scheduleUtcOffsetMinutes);
        r.add(Zs(a?.cfZoneId)), r.add(Zs(a?.cfZoneId, o));
      }
      return [...r].filter(Boolean);
    },
    async listKvKeys(t, r = {}) {
      if (!t || typeof t.list != "function") return [];
      const a = String(r.prefix || ""), o = [];
      let s = "", i = 0, c = !1;
      const l = /* @__PURE__ */ new Set();
      for (; i < 1e3; ) {
        i += 1;
        const d = s ? await t.list({
          prefix: a,
          cursor: s
        }) : await t.list({ prefix: a });
        for (const f of d?.keys || []) {
          const m = String(f?.name || "").trim();
          m && o.push(m);
        }
        const u = typeof d?.cursor == "string" ? d.cursor : "";
        if (d?.list_complete === !0) {
          c = !0;
          break;
        }
        if (!u || u === s || l.has(u)) {
          const f = /* @__PURE__ */ new Error("KV key scan did not complete");
          throw f.code = "KV_SCAN_INCOMPLETE", f.status = 409, f.details = {
            prefix: a,
            pageCount: i,
            cursor: u,
            reason: u ? "repeated_cursor" : "missing_cursor"
          }, f;
        }
        l.add(u), s = u;
      }
      if (!c) {
        const d = /* @__PURE__ */ new Error("KV key scan exceeded the page safety limit");
        throw d.code = "KV_SCAN_INCOMPLETE", d.status = 409, d.details = {
          prefix: a,
          pageCount: i,
          cursor: s,
          reason: "page_limit"
        }, d;
      }
      return [...new Set(o)];
    },
    async listKvKeysStrict(t, r = {}) {
      if (!t || typeof t.list != "function") return [];
      const a = String(r.prefix || ""), o = [];
      let s = "", i = 0, c = !1;
      const l = /* @__PURE__ */ new Set();
      for (; i < 1e3; ) {
        i += 1;
        const d = await kf(t, s ? {
          prefix: a,
          cursor: s
        } : { prefix: a });
        for (const f of d?.keys || []) {
          const m = String(f?.name || "").trim();
          m && o.push(m);
        }
        const u = typeof d?.cursor == "string" ? d.cursor : "";
        if (d?.list_complete === !0) {
          c = !0;
          break;
        }
        if (!u || u === s || l.has(u)) {
          const f = /* @__PURE__ */ new Error("KV key scan did not complete");
          throw f.code = "KV_SCAN_INCOMPLETE", f.status = 409, f.details = {
            prefix: a,
            pageCount: i,
            cursor: u,
            reason: u ? "repeated_cursor" : "missing_cursor"
          }, f;
        }
        l.add(u), s = u;
      }
      if (!c) {
        const d = /* @__PURE__ */ new Error("KV key scan exceeded the page safety limit");
        throw d.code = "KV_SCAN_INCOMPLETE", d.status = 409, d.details = {
          prefix: a,
          pageCount: i,
          cursor: s,
          reason: "page_limit"
        }, d;
      }
      return [...new Set(o)];
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
        const o = /* @__PURE__ */ new Error("KV tidy could not read the runtime config");
        throw o.code = "KV_TIDY_CONFIG_READ_FAILED", o.status = 503, o.details = {
          key: e.CONFIG_KEY,
          cause: ue(a, "kv_read_failed")
        }, o;
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
          config: ce(k(a) ? a : {}),
          rawConfig: k(a) ? a : {},
          hadMalformedValue: !k(a),
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
      const a = [], o = /* @__PURE__ */ new Set();
      for (const s of Array.isArray(r) ? r : []) {
        const i = String(s || "").trim();
        !i || o.has(i) || (o.add(i), a.push({
          key: i,
          ...await e.readRawKvEntry(t, i)
        }));
      }
      return a;
    },
    async applyKvMutationsWithRollback(t, r = []) {
      if (!t) return [];
      const a = [], o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
      for (const l of Array.isArray(r) ? r : []) {
        const d = String(l?.key || "").trim();
        if (!d) continue;
        const u = String(l?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put";
        a.push({
          type: u,
          key: d,
          value: String(l?.value ?? "")
        }), !s.has(d) && (s.add(d), o.set(d, {
          key: d,
          ...await e.readRawKvEntry(t, d)
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
        const d = [], u = [];
        for (let f = i.length - 1; f >= 0; f -= 1) {
          const m = i[f], p = o.get(m), h = c.get(m);
          if (!(!p || !h))
            try {
              const g = await e.readRawKvEntry(t, m);
              if (!(g.exists === h.exists && (h.exists !== !0 || g.value === h.value))) {
                u.push(m);
                continue;
              }
              p.exists ? await t.put(p.key, p.value) : await t.delete(p.key);
            } catch (g) {
              d.push(`${p.key}:${g?.message || String(g)}`);
            }
        }
        if (d.length > 0 || u.length > 0) {
          const f = /* @__PURE__ */ new Error(`${l?.message || String(l)}; rollback_incomplete`);
          throw f.code = "KV_MUTATION_ROLLBACK_CONFLICT", f.status = 409, f.details = {
            rollbackConflicts: u,
            rollbackFailures: d,
            originalError: ue(l, "kv_mutation_failed")
          }, f;
        }
        throw l;
      }
    }
  };
}
function yy(n = {}, e = {}) {
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
      const a = [], o = /* @__PURE__ */ new Set(), s = new Set(Object.values(e.LEGACY_OPS_STATUS_SECTION_KEYS));
      let i = 0, c = 0, l = 0, d = 0, u = 0, f = 0, m = 0, p = 0, h = 0, g = 0;
      for (const y of r)
        if (y) {
          if (y.startsWith(e.PREFIX)) {
            a.push(y.slice(e.PREFIX.length));
            continue;
          }
          if (y.startsWith("fail:")) {
            o.add(y), h += 1;
            continue;
          }
          if (y === "sys:cf_dash_cache" || y.startsWith("sys:cf_dash_cache:")) {
            o.add(y);
            continue;
          }
          if (y === e.LEGACY_SCHEDULED_LOCK_KEY) {
            o.add(y);
            continue;
          }
          if (y.startsWith("sys:dns_ip_pool_fetch_lock:v1:")) {
            o.add(y), g += 1;
            continue;
          }
          if (y === e.CONFIG_META_KEY) {
            u += 1;
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
        removableKeys: o,
        untouchedOtherKeyCount: i,
        opsStatusKeyCount: c,
        dnsRecordHistoryKeyCount: l,
        dnsIpPoolSourceKeyCount: d,
        configMetaKeyCount: u,
        snapshotMetaKeyCount: f,
        nodeIndexMetaKeyCount: m,
        telegramAlertStateKeyCount: p,
        loginFailureKeyCount: h,
        dnsFetchLockKeyCount: g
      };
    },
    async collectKvTidyNodeMutations(t, r = [], a = {}, o = []) {
      const s = [], i = [];
      let c = 0, l = 0, d = 0, u = 0, f = 0, m = 0, p = bt(a.sourceDirectNodes || []);
      const h = [];
      for (const y of r) {
        const _ = `${e.PREFIX}${y}`;
        let S = null;
        try {
          S = await ve(t, _, { type: "json" });
        } catch (C) {
          const N = /* @__PURE__ */ new Error(`KV tidy could not read node ${y}`);
          throw N.code = "KV_TIDY_NODE_READ_FAILED", N.status = 503, N.details = {
            key: _,
            nodeName: y,
            cause: ue(C, "kv_read_failed")
          }, N;
        }
        if (!k(S)) {
          const C = /* @__PURE__ */ new Error(`KV tidy found an invalid node entity: ${y}`);
          throw C.code = "KV_TIDY_NODE_INVALID", C.status = 409, C.details = {
            key: _,
            nodeName: y
          }, C;
        }
        const T = Qd(S);
        T.shouldAddToSourceDirectNodes && (p = bt([...p, y])), T.topLevelPortPresent && (d += 1), u += Number(T.linePortCount) || 0, T.defaultPortNodePresent && (f += 1), m += Number(T.defaultPortLineCount) || 0, l += T.legacyKeysPresent.length;
        const { data: b, changed: A } = e.normalizeNode(y, S, { dropLegacyDirectRouting: !0 });
        i.push({
          name: y,
          ...b
        }), !rt(y, b) && A && (h.push({
          key: _,
          ...await e.readRawKvEntry(t, _)
        }), c += 1, s.push({
          name: y,
          data: b
        }));
      }
      let g = a;
      return ae(g.sourceDirectNodes || []) !== ae(p) && (g = ce({
        ...g,
        sourceDirectNodes: p
      })), {
        nextTidyConfig: g,
        rewrittenNodes: s,
        fullEntityNodes: i,
        rewrittenNodeCount: c,
        deletedLegacyNodeFieldCount: l,
        migratedTopLevelPortNodeCount: d,
        migratedLinePortCount: u,
        migratedDefaultPortNodeCount: f,
        migratedDefaultPortLineCount: m,
        rollbackKvEntries: [...o, ...h]
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
      return ie(ae({
        scope: "kv",
        scannedKeys: [...new Set(Array.isArray(t?.scannedKeys) ? t.scannedKeys : [])].sort(),
        revisions: k(t?.revisions) ? t.revisions : {},
        mutationPlan: r,
        rebuiltNodeSummaries: Array.isArray(t?.rebuiltNodeSummaries) ? t.rebuiltNodeSummaries : []
      }));
    }
  };
}
function Sy(n = {}, e = {}) {
  return {
    ...py(n, e),
    ...gy(n, e),
    ...hy(n, e),
    ...yy(n, e)
  };
}
var _y = class {
  constructor({ configReader: n, httpService: e, nodeRouteReader: t, proxyApi: r }) {
    this.configReader = n, this.httpService = e, this.nodeRouteReader = t, this.proxyApi = r;
  }
  #t(n, e, t, r = 200) {
    return this.httpService.buildCorsResponse(aa(e, n), t, r, { mergeOriginVary: !0 });
  }
  #e(n, e) {
    const t = new URL(n.url);
    t.pathname = e + "/";
    const r = new Headers({
      Location: t.toString(),
      "Cache-Control": "no-store"
    });
    De(r);
    const a = n.method === "GET" || n.method === "HEAD" ? 301 : 307;
    return new Response(null, {
      status: a,
      headers: r
    });
  }
  #o(n, e = "") {
    const t = String(e || "").trim();
    if (!n || !t || n.status === 101) return n;
    const r = new Headers(n.headers || {});
    return r.append("Set-Cookie", t), new Response(n.body, {
      status: n.status,
      statusText: n.statusText,
      headers: r
    });
  }
  #s(n, e) {
    const t = this.#t(n, e, "Not Found", 404);
    return this.#o(t, hl());
  }
  async #n(n, e, t, r) {
    if (!n || n.status === 101) return n;
    const a = await lg(t, e, r);
    return a ? this.#o(n, dg(a)) : n;
  }
  #r(n) {
    const e = n.segments;
    return e.length <= 1 ? !1 : this.httpService.isPlaybackCriticalSegments(e, 1) ? !0 : e.length <= 2 ? !1 : this.httpService.isPlaybackCriticalSegments(e, 2);
  }
  async #i(n, e, t, r) {
    if (!n.root) return null;
    const a = this.#r(n);
    let o = a ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(n.root, e) : null, s = a ? o ? "hit" : "miss" : "skip";
    const i = o?.nodeData || await this.nodeRouteReader.getNode(n.root, e, t);
    if (!i) return null;
    const c = rt(n.root, i) ? "oversized_bypass" : "";
    if (c && (s = c), et(i?.entryMode)) return null;
    const l = i.secret, d = nt(n.root, l), u = 1 + n.rootRaw.length, f = n.normalizedPathname.substring(u), m = si(f, n.requestUrl, d), p = m?.normalizedPath || f, h = `/${n.rootRaw}${p === "/" ? "/" : p}`, g = m ? h.split("/").filter(Boolean) : n.segments;
    let y = u;
    if (l) {
      const A = g[1] || "";
      if (at(A) !== l) return null;
      y += 1 + A.length;
    }
    const _ = h.substring(y), S = m ? (() => {
      const A = new URL(n.requestUrl.toString());
      return A.pathname = h, A;
    })() : n.requestUrl, T = Nr(_);
    let b = T.remaining;
    return _ === "" && !S.pathname.endsWith("/") || T.needsTrailingSlashRedirect === !0 ? { response: this.#e(r, h) } : (b === "" && (b = "/"), a && !o && (o = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(n.root, i, e)), {
      nodeData: i,
      secret: l,
      remaining: Z(b),
      linkVariant: T.linkVariant,
      requestUrl: S,
      pathNormalizationState: m,
      playbackRouteHotSnapshot: o,
      targetHotCacheState: s,
      nodeCacheState: c,
      entryMode: "kv_route"
    });
  }
  #c(n) {
    return n ? on(Nr(n.normalizedPathname)?.remaining || "/") : !1;
  }
  async #u(n, e, t, r) {
    const a = n?.hostPrefixMatch;
    if (!a?.prefix) return null;
    const o = a.prefix, s = this.#c(n);
    let i = s ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(o, e) : null, c = s ? i ? "hit" : "miss" : "skip";
    const l = i?.nodeData || await this.nodeRouteReader.getNode(o, e, t);
    if (!l || !et(l?.entryMode)) return null;
    const d = rt(o, l) ? "oversized_bypass" : "";
    d && (c = d);
    const u = Nr(n.normalizedPathname);
    let f = u.remaining;
    return u.needsTrailingSlashRedirect === !0 ? { response: this.#e(r, n.normalizedPathname) } : (f === "" && (f = "/"), s && !i && (i = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(o, l, e)), {
      nodeData: l,
      secret: "",
      remaining: Z(f),
      linkVariant: u.linkVariant,
      requestUrl: n.requestUrl,
      playbackRouteHotSnapshot: i,
      targetHotCacheState: c,
      nodeCacheState: d,
      entryMode: "host_prefix"
    });
  }
  #a(n) {
    const e = n?.requestHost || "", t = n?.configuredHost || "", r = n?.configuredLegacyHost || "";
    return e ? t && e === t ? !0 : !!(r && r !== t && e === r) : !1;
  }
  async #d(n, e, t, r, a = {}) {
    if (!this.#a(n) || !n?.root) return null;
    const o = n.root, s = this.#r(n);
    let i = s ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(o, e) : null, c = s ? i ? "hit" : "miss" : "skip";
    const l = i?.nodeData || await this.nodeRouteReader.getNode(o, e, t);
    if (!l || !et(l?.entryMode)) return null;
    const d = rt(o, l) ? "oversized_bypass" : "";
    d && (c = d);
    const u = nt(o, "", { entryMode: "kv_route" }), f = 1 + n.rootRaw.length, m = n.normalizedPathname.substring(f), p = si(m, n.requestUrl, u), h = p?.normalizedPath || m, g = `/${n.rootRaw}${h === "/" ? "/" : h}`, y = g.substring(f), _ = p ? (() => {
      const b = new URL(n.requestUrl.toString());
      return b.pathname = g, b;
    })() : n.requestUrl, S = Nr(y);
    let T = S.remaining;
    return y === "" && !_.pathname.endsWith("/") || S.needsTrailingSlashRedirect === !0 ? { response: this.#e(r, g) } : (T === "" && (T = "/"), s && !i && (i = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(o, l, e)), {
      nodeData: l,
      nodeName: o,
      secret: "",
      remaining: Z(T),
      linkVariant: S.linkVariant,
      requestUrl: _,
      pathNormalizationState: p,
      playbackRouteHotSnapshot: i,
      targetHotCacheState: c,
      nodeCacheState: d,
      entryMode: "kv_route",
      routeKindOverride: a.isLegacyHostRequest === !0 ? "legacy_host_prefix_path_compat" : "host_prefix_path_compat",
      attachLegacyProxyContext: a.isLegacyHostRequest === !0
    });
  }
  async #f(n, e, t, r) {
    if (!ci(n?.normalizedPathname)) return null;
    const a = r.headers.get("Cookie") || "", o = String(Ma(a).get("legacy_proxy_ctx") || "").trim();
    if (!o) return null;
    const s = await ug(o, e, { requestHost: n.requestHost });
    if (s?.ok !== !0) return { response: this.#s(r, e) };
    const i = String(s.payload?.node || "").trim().toLowerCase();
    if (!i) return { response: this.#s(r, e) };
    const c = on(n.normalizedPathname);
    let l = c ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(i, e) : null, d = c ? l ? "hit" : "miss" : "skip";
    const u = l?.nodeData || await this.nodeRouteReader.getNode(i, e, t);
    if (!u) return { response: this.#s(r, e) };
    const f = rt(i, u) ? "oversized_bypass" : "";
    f && (d = f);
    const m = et(u?.entryMode);
    return c && !l && (l = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(i, u, e)), {
      nodeData: u,
      nodeName: i,
      secret: m ? "" : u.secret,
      remaining: n.normalizedPathname,
      linkVariant: "main",
      requestUrl: n.requestUrl,
      playbackRouteHotSnapshot: l,
      targetHotCacheState: d,
      nodeCacheState: f,
      entryMode: "kv_route",
      routeKindOverride: m ? "legacy_host_context_cookie_host_prefix_compat" : "legacy_host_context_cookie"
    };
  }
  async #l(n, e, t, r) {
    const a = Array.isArray(r?.segments) ? r.segments : [];
    if (a.length < 2) return null;
    const o = String(r.root || "").trim().toLowerCase();
    if (!o) return null;
    let s = a.slice(1);
    const i = await this.nodeRouteReader.getNode(o, e, t), c = String(i?.secret || "").trim();
    c && at(s[0] || "") === c && (s = s.slice(1));
    const l = `/${s.join("/")}`, d = r.requestUrl instanceof URL ? r.requestUrl : null, u = d?.searchParams?.get?.("Ids") || "", f = String(d?.searchParams?.get?.("MediaSourceId") || "").trim(), m = f ? Uh(f) : null, p = Pa(l) || at(/^\/(?:emby|mediabrowser)\/Items\/([^/]+)/i.exec(l)?.[1] || ""), h = m || ya(p) || (u ? u.split(",").map((b) => ya(b)).find(Boolean) : null);
    if (!h) return null;
    const g = String(h.peerName || "").trim().toLowerCase();
    if (!g || g === o) return null;
    const y = await this.nodeRouteReader.getNode(g, e, t);
    if (!y || y.tmdbAggregationEnabled !== !0) return null;
    const _ = m ? m.itemId : h.itemId, S = l.replace(/^(\/(?:emby\/|mediabrowser\/)?Items\/)[^/]+/i, `$1${encodeURIComponent(_)}`), T = d ? new URL(d.toString()) : new URL(n.url);
    if (T.pathname = `${nt(g, String(y.secret || ""))}${S === "/" ? "/" : S}`, u) {
      const b = u.split(",").map((A) => ya(A)?.itemId || A).join(",");
      T.searchParams.set("Ids", b);
    }
    return m && T.searchParams.set("MediaSourceId", m.mediaSourceId), {
      nodeData: y,
      nodeName: g,
      secret: String(y.secret || ""),
      remaining: Z(S),
      linkVariant: Nr(S).linkVariant,
      requestUrl: T,
      entryMode: "kv_route",
      request: n
    };
  }
  async handle(n, e, t, r) {
    if (!r) throw new TypeError("NodeProxyFacade.handle requires routeContext");
    const { requestHost: a, configuredHost: o, configuredLegacyHost: s } = r, i = await this.configReader.getRuntimeConfig(e), c = !!(s && s !== o && a === s), l = await this.#l(n, e, t, r);
    if (l)
      return l.response ? l.response : this.proxyApi.handle(l.request, l.nodeData, l.remaining, l.nodeName, l.secret, e, t, {
        requestUrl: l.requestUrl,
        linkVariant: l.linkVariant,
        runtimeConfig: i,
        runtimeRouteContext: r,
        entryMode: l.entryMode
      });
    const d = i.enableHostPrefixProxy === !0 && !!o && !c;
    r.hostPrefixMatch = d ? vo(a, o) : null;
    const u = !!(d && a !== o && a.endsWith(`.${o}`));
    if (r.hostPrefixMatch) {
      const p = await this.#u(r, e, t, n);
      return p?.response ? p.response : p?.nodeData ? this.proxyApi.handle(n, p.nodeData, p.remaining, r.hostPrefixMatch.prefix, p.secret, e, t, {
        requestUrl: p.requestUrl || r.requestUrl,
        linkVariant: p.linkVariant,
        targetHotCacheState: p.targetHotCacheState,
        nodeCacheState: p.nodeCacheState,
        cachedTargetRecords: Array.isArray(p.playbackRouteHotSnapshot?.targetRecords) ? p.playbackRouteHotSnapshot.targetRecords : null,
        nodeCacheRevision: p.playbackRouteHotSnapshot?.nodeCacheRevision || "",
        runtimeConfig: i,
        runtimeRouteContext: r,
        entryMode: p.entryMode
      }) : this.#t(n, e, "Not Found", 404);
    }
    if (u) return this.#t(n, e, "Not Found", 404);
    const f = await this.#d(r, e, t, n, { isLegacyHostRequest: c });
    if (f?.response) return f.response;
    if (f?.nodeData) {
      const p = await this.proxyApi.handle(n, f.nodeData, f.remaining, f.nodeName, f.secret, e, t, {
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
    const m = await this.#i(r, e, t, n);
    if (m?.response) return m.response;
    if (m?.nodeData) {
      const p = await this.proxyApi.handle(n, m.nodeData, m.remaining, r.root, m.secret, e, t, {
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
    if (c && ci(r.normalizedPathname)) {
      const p = await this.#f(r, e, t, n);
      if (p?.response) return p.response;
      if (p?.nodeData) {
        const h = await this.proxyApi.handle(n, p.nodeData, p.remaining, p.nodeName, p.secret, e, t, {
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
    return this.#t(n, e, "Not Found", 404);
  }
};
function by(n) {
  return Object.freeze({
    persistCloudflareDnsRecordsForHost(e) {
      return Xm({
        ...e,
        dnsHistoryRepository: n
      });
    },
    buildDnsIpWorkspaceItems(e, t, r, a = {}) {
      return nl(e, t, r, {
        ...a,
        probeRepository: n
      });
    },
    buildDnsIpPoolWorkspacePreviewItems(e, t, r, a, o = {}) {
      return fp(e, t, r, a, {
        ...o,
        probeRepository: n
      });
    },
    tryAcquireDnsIpPoolFetchRefreshLock(e, t) {
      return yp({
        ...e,
        leaseRepository: n
      }, t);
    },
    releaseDnsIpPoolFetchRefreshLock(e, t) {
      return Sp({
        ...e,
        leaseRepository: n
      }, t);
    },
    runDnsIpPoolSourcesLiveRefresh(e) {
      return _p({
        ...e,
        poolRepository: n
      });
    }
  });
}
function Ey(n, e) {
  const t = e.shellService, r = [
    Rp({
      kernel: n,
      bindingPort: n,
      CacheManager: e.cacheManager,
      LogQueryPlanner: e.logQueryPlanner,
      Logger: e.logger,
      requestModel: n,
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
    Fg({
      D1TidyExecutor: e.d1TidyExecutor,
      D1TidyPlanner: e.d1TidyPlanner,
      Logger: e.logger,
      buildAdminReleaseVendorManifest: t.buildAdminReleaseVendorManifest,
      normalizeAdminReleaseVendorManifestRecord: t.normalizeAdminReleaseVendorManifestRecord,
      validateAdminShellHtmlSource: t.validateAdminShellHtmlSource
    }, n),
    Zg({
      CacheManager: e.cacheManager,
      persistCloudflareDnsRecordsForHost: e.dns.persistCloudflareDnsRecordsForHost
    }, n),
    ah({
      bindingPort: n,
      schemaReadinessPort: n,
      statusPersistence: n
    }),
    ny({
      CacheManager: e.cacheManager,
      withAdminShellRuntimeStatus: t.withAdminShellRuntimeStatus
    }, n),
    ly({}, n),
    Sy({}, n)
  ];
  for (const a of r) for (const [o, s] of Object.entries(a)) n[o] = s;
  return n;
}
var Ty = "video.emos.best", Ay = "emos", qn = "https://medb.lat/media/list/index?page_size=1", Ry = 60 * 1e3, Cy = 5e3;
function wy(n) {
  const e = k(n?.items?.[0]?.counts) ? n.items[0].counts : k(n?.counts) ? n.counts : null;
  return e ? {
    MovieCount: e.movie ?? 0,
    SeriesCount: e.series ?? 0,
    EpisodeCount: e.episode ?? 0
  } : null;
}
async function Ly() {
  const n = ee.MedbItemsCountsCache.get(qn);
  if (n && n.expiresAt > $()) return n.counts;
  const e = new AbortController(), t = setTimeout(() => e.abort("medb_counts_timeout"), Cy);
  try {
    const r = await fetch(qn, {
      headers: { accept: "application/json" },
      signal: e.signal
    });
    if (!r.ok) return null;
    const a = wy(await r.json());
    return a ? (ee.MedbItemsCountsCache.set(qn, {
      counts: a,
      expiresAt: $() + Ry
    }), a) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}
function Ny(n, e) {
  if (String(e || "").trim().toLowerCase() === Ay) return !0;
  for (const t of Array.isArray(n?.lines) ? n.lines : []) {
    const r = String(t?.target || "").trim();
    if (r)
      try {
        if (oe(new URL(r).hostname) === Ty) return !0;
      } catch {
      }
  }
  return !1;
}
async function Dy(n, e, t, r, a) {
  if (n.method !== "GET" || String(Z(a)).replace(/\/+$/, "").toLowerCase() !== "/emby/items/counts" || !Ny(t, r)) return null;
  const o = await Ly();
  return o ? ne(o, 200, aa(e, n)) : null;
}
function Iy({ includeTestingSupport: n = !1 } = {}) {
  const e = { ...fy }, t = Object.freeze({ getRuntimeConfig: we }), r = my({ nodeRepository: e }), a = rh({ logRepository: e }), o = Gf({
    indexRepository: e,
    statusPort: e
  });
  Ey(e, {
    cacheManager: r,
    d1TidyExecutor: uy(),
    d1TidyPlanner: dy(),
    dns: by(e),
    logger: a,
    logQueryPlanner: eh(),
    shellService: o
  });
  const s = Jh({
    cachePort: r,
    configReader: t,
    fetchPort: { fetchRequest: ze },
    logger: a,
    nodeRepository: e
  }), i = new ff({
    actionHandlers: e.adminActionHandlers,
    bindingService: e,
    configReader: t,
    repository: e,
    requestModel: e,
    shellService: o
  }), c = new _y({
    configReader: t,
    httpService: Object.freeze({
      buildCorsResponse: o.buildEdgeCorsResponse,
      isPlaybackCriticalSegments: o.isPlaybackCriticalSegments
    }),
    nodeRouteReader: e,
    proxyApi: s
  }), l = new Ug({
    logger: a,
    service: e
  }), d = (m, p) => {
    const h = new URL(m.url), g = oe(h.hostname), y = Z(h.pathname), _ = y.toLowerCase(), S = ft(p), T = S.toLowerCase(), b = Rn(S), A = b.toLowerCase(), C = oc(p, {
      adminPath: S,
      loginPath: b
    }), N = y.split("/").filter(Boolean), P = N[0] || "", E = at(P).toLowerCase();
    return {
      initHealth: C,
      requestUrl: h,
      requestHost: g,
      configuredHost: Ge(p),
      configuredLegacyHost: qr(p),
      normalizedPathname: y,
      pathnameLower: _,
      adminPath: S,
      adminPathLower: T,
      adminLoginPath: b,
      adminLoginPathLower: A,
      segments: N,
      rootRaw: P,
      root: E
    };
  }, u = (m, p) => (p === "GET" || p === "HEAD") && m.pathnameLower === "/favicon.ico" || p === "GET" && m.normalizedPathname === "/" || ac(m.pathnameLower, m.adminPathLower) || Lr(m.pathnameLower, m.adminLoginPathLower) ? !0 : m.adminPathLower === "/admin" && m.pathnameLower === "/api/auth/login" && m.root === "api" && m.segments[1] === "auth" && m.segments[2] === "login", f = {
    adminConsole: i,
    nodeProxy: c,
    scheduledMaintenance: l,
    workerHandler: Object.freeze({
      async fetch(m, p, h) {
        const g = d(m, p), y = m.method;
        if (!((y === "GET" || y === "HEAD") && g.pathnameLower === "/favicon.ico")) {
          const _ = await t.getRuntimeConfig(p), S = !!(g.configuredLegacyHost && g.configuredLegacyHost !== g.configuredHost && g.requestHost === g.configuredLegacyHost);
          if (_.enableHostPrefixProxy === !0 && g.configuredHost && !S && g.requestHost !== g.configuredHost && g.requestHost.endsWith(`.${g.configuredHost}`)) return c.handle(m, p, h, g);
        }
        if (u(g, y)) {
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
  return n === !0 && (f.testingSupport = Object.freeze({
    cacheManager: r,
    kernel: e,
    logger: a,
    shellService: o,
    buildNodeRouteContext: d,
    buildRouteCorsResponse(m, p, h, g = 200) {
      return o.buildEdgeCorsResponse(aa(p, m), h, g, { mergeOriginVary: !0 });
    },
    isPlaybackCriticalRouteContext(m) {
      const p = Array.isArray(m?.segments) ? m.segments : [];
      return p.length <= 1 ? !1 : o.isPlaybackCriticalSegments(p, 1) ? !0 : p.length > 2 && o.isPlaybackCriticalSegments(p, 2);
    },
    isolateState: cu,
    proxyService: s.testingSupport
  })), Object.freeze(f);
}
var { workerHandler: My } = Iy();
export {
  My as default
};

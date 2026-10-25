# EMOS 反代多服聚合机制解析与实现指南

本文档汇总了关于 EMOS（基于自研 ToDB 后端的 Emby 影视服）在第三方播放器中进行“多服聚合”时的核心机制解析、与官方 Emby/Jellyfin 标准的差异对比，以及在自建反代（如 Cloudflare Workers）中的具体代码实现方案。

---

## 一、 核心原理解析

在阅读 EMOS 官方反代文档时，常见到如下说明：
> 大多数 emby 播放器请求聚合时候 会传入 `AnyProviderIdEquals.tmdb` 字段  
> 然而 `todbv` 可通过 `todb api>video>getVideoIdByExternalId` 传入 `tmdb` 获得  
> 再将多个 `video_id` 用 `,` 拼接以 `todbvs` 参数传入即可  
> 当然 如果达到 元婴 时候是自动支持聚合的

### 1. 逐句技术拆解

* **“大多数 emby 播放器请求聚合时候 会传入 `AnyProviderIdEquals.tmdb` 字段”**
  当使用支持“多服聚合”的播放器（如 Forward、SenPlayer、Yamby 等）或聚合反代程序时，由于不同 Emby 服内部的影片 ID 各不相同，播放器为了在多个服里匹配到**同一部电影/剧集**，会在请求 `/emby/Items` 接口时带上国际通用的 TMDB ID（参数格式如 `AnyProviderIdEquals=tmdb.12345`），向服务器查询对应编号的影视资源。
* **“然而 `todbv` 可通过 `todb api>video>getVideoIdByExternalId` 传入 `tmdb` 获得”**
  EMOS 并不是原版 Emby Server，而是基于自研的 **ToDB** 元数据库实现了 Emby 接口协议。其内部不使用 TMDB ID 作为主索引，而是使用 ToDB 数据库的专属影片 ID（简称 `todbv`，即 ToDB Video ID）。对于普通等级账号，EMOS 后端默认不直接响应 `AnyProviderIdEquals.tmdb` 查询；若要查询，必须先调用 ToDB 的 API 接口（`video/getVideoIdByExternalId`），用 `tmdb` 编号换取对应的 `video_id`（`todbv`）。
* **“再将多个 `video_id` 用 `,` 拼接以 `todbvs` 参数传入即可”**
  获取到转换后的一个或多个 `video_id` 后，在反代层（例如 Cloudflare Workers 或自建中间件）拦截并修改播放器发来的请求参数，将原本的 `AnyProviderIdEquals.tmdb` 替换成 `todbvs=id1,id2,id3` 再转发给 EMOS 服务端，服务端即可正确返回对应的影片列表。
* **“当然 如果达到 元婴 时候是自动支持聚合的”**
  EMOS 的会员/积分体系采用了**修仙等级制度**（如练气、筑基、金丹、元婴等）。为了防止低等级小号或聚合爬虫高频扫库增加数据库负载，服务端对直接按 TMDB ID 聚合查询做了权限分级：
  * **元婴以下账号**：服务端忽略或拒绝直接用 `tmdb` 查片，需通过反代脚本手动完成 `tmdb -> todbvs` 的 API 转换。
  * **达到“元婴”及以上的账号**：服务端直接开启原生特权，自动在后端完成 `AnyProviderIdEquals.tmdb` 到 ToDB 的映射查询，无需反代改写即可直接在播放器中聚合。

### 2. 不同账号等级的实现链路对比

| 账号状态 | 聚合实现方式 | 实际请求链路 |
| :--- | :--- | :--- |
| **普通账号（元婴以下）** | 需在自建反代（如 CF Worker）中编写拦截转换逻辑 | 播放器传入 `tmdb` ➔ 反代层拦截并请求 `getVideoIdByExternalId` ➔ 拿到 `video_id` 拼接为 `todbvs` 参数 ➔ 转发给 `video.emos.best` |
| **高阶账号（达到元婴）** | 原生支持，无需转换 | 播放器传入 `AnyProviderIdEquals.tmdb` ➔ `video.emos.best` 后端识别账号等级达到元婴，内部自动关联 ToDB 并返回结果 |

---

## 二、 官方 Emby / Jellyfin 与 EMOS 标准对比

上述机制中提到的参数，**一半是 Emby 官方通用标准，另一半则是 EMOS 完全私有的魔改接口**。

### 1. 参数通用性总览

| 参数 / 机制 | 官方 Emby | 官方 Jellyfin | EMOS (自研后端) | 归属定性 |
| :--- | :--- | :--- | :--- | :--- |
| **`AnyProviderIdEquals`** | **原生支持** | **支持（已弃用，兼容保留）** | 仅“元婴”及以上账号自动支持 | **Emby/Jellyfin 通用标准** |
| **`todbv` / `todbvs`** | 不存在 | 不存在 | **原生支持** | **EMOS 独家私有参数** |
| **`getVideoIdByExternalId`** | 不存在 | 不存在 | **ToDB 专属接口** | **EMOS 独家私有 API** |

### 2. 官方标准规范说明

1. **`AnyProviderIdEquals`（通用外部 ID 检索标准）**：
   * **官方 Emby**：在 `/Items` 或 `/Users/{UserId}/Items` 接口文档中，`AnyProviderIdEquals` 是原生标准查询参数，用于根据外部刮削器（Provider）ID 查找影片，传参格式为 `AnyProviderIdEquals=tmdb.12345` 或 `AnyProviderIdEquals=imdb.tt1234567`。只要媒体库正常刮削了元数据，任何账号均可直接查询，无等级限制。
   * **官方 Jellyfin**：继承并兼容 `AnyProviderIdEquals`。在新版 Jellyfin OpenAPI 文档中该字段虽被标记为 `Deprecated`（推荐使用 `HasTmdbId`、`HasImdbId` 或 `ProviderIds`），但为了兼容第三方 Emby 播放器，底层依然保留了解析支持。
2. **为何只有 EMOS 需要转换**：
   * 原版 Emby/Jellyfin 使用本地 SQLite 存储刮削后的 `ProviderIds` 映射表，一步即可查出结果。
   * EMOS 采用自研后端与自建 **ToDB** 数据库，主键为 `todbv`。为降低主库联表查询压力并配合修仙等级体系，将低等级账号的 `tmdb -> todbv` 转换剥离到了外部接口。连接其他标准 Emby/Jellyfin 服时，`AnyProviderIdEquals=tmdb.xxx` 均直接生效。

---

## 三、 反代层实现方案（以 Cloudflare Workers 为例）

要在反代中实现该功能，核心是执行**“请求参数拦截与重写（Query Rewrite）”**。

### 1. 核心拦截与转换流程

1. **条件过滤**：仅拦截路径匹配 `/Items`（如 `/emby/Items` 或 `/emby/Users/{UserId}/Items`）且 URL Query 中包含 `AnyProviderIdEquals` 的 `GET` 请求。
2. **提取 TMDB ID**：解析 `AnyProviderIdEquals` 的值（如 `tmdb.12345` 或 `Tmdb.12345,Imdb.tt12345`），通过正则提取出纯数字的 `tmdb_id`。
3. **查询 ToDB 接口**：携带 `tmdb` 参数请求 `video/getVideoIdByExternalId` 接口，解析返回的 JSON 获取对应的 `video_id` 列表。
4. **改写 URL 参数**：将获取到的多个 `video_id` 用英文逗号 `,` 拼接，写入 URL 的 `todbvs` 参数中，并删除原有的 `AnyProviderIdEquals` 参数。
5. **透传请求**：使用改写后的新 URL 向 EMOS 源站发起最终请求，并将响应返回给播放器。

### 2. Cloudflare Workers 完整代码示例

```javascript
// 配置 EMOS 源站与 ToDB API 地址（请以实际文档中的 Host 为准）
const EMOS_UPSTREAM = "https://video.emos.best";
const TODB_API_URL = "https://api.todb.best/video/getVideoIdByExternalId";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. 判断是否为包含 AnyProviderIdEquals 的 Items 查询请求
    if (
      request.method === "GET" &&
      url.pathname.endsWith("/Items") &&
      url.searchParams.has("AnyProviderIdEquals")
    ) {
      const providerParam = url.searchParams.get("AnyProviderIdEquals") || "";
      
      // 2. 提取 tmdb id (兼容大小写，如 tmdb.550 或 Tmdb.550,Imdb.tt0137523)
      const tmdbMatch = providerParam.match(/tmdb\.(\d+)/i);

      if (tmdbMatch && tmdbMatch[1]) {
        const tmdbId = tmdbMatch[1];

        try {
          // 3. 调用 ToDB API 用 tmdb 换取 video_id (todbv)
          const todbIds = await fetchTodbVideoIds(tmdbId, request, env);

          if (todbIds.length > 0) {
            // 4. 拼接为 todbvs 参数并移除原有的 AnyProviderIdEquals
            url.searchParams.set("todbvs", todbIds.join(","));
            url.searchParams.delete("AnyProviderIdEquals");
          } else {
            // 可选优化：若 ToDB 中无对应影片，直接短路返回空列表，节省一次回源请求
            return new Response(
              JSON.stringify({ Items: [], TotalRecordCount: 0 }),
              { status: 200, headers: { "Content-Type": "application/json" } }
            );
          }
        } catch (err) {
          // 转换失败时打印日志并降级为原样转发，避免阻断正常请求
          console.error("ToDB ID 转换失败:", err);
        }
      }
    }

    // 5. 构造转发给 EMOS 源站的最终请求
    const targetUrl = new URL(url.pathname + url.search, EMOS_UPSTREAM);
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "manual",
    });

    return fetch(proxyRequest);
  }
};

/**
 * 调用 ToDB getVideoIdByExternalId 接口并提取 video_id
 */
async function fetchTodbVideoIds(tmdbId, originalRequest, env) {
  const apiUrl = new URL(TODB_API_URL);
  apiUrl.searchParams.set("tmdb", tmdbId);

  // 构造请求头，透传或注入鉴权信息
  const headers = new Headers({
    "Accept": "application/json",
    "User-Agent": originalRequest.headers.get("User-Agent") || "EmbyProxy/1.0",
  });
  
  if (env.TODB_API_KEY) {
    headers.set("Authorization", `Bearer ${env.TODB_API_KEY}`);
  } else if (originalRequest.headers.has("X-Emby-Token")) {
    headers.set("X-Emby-Token", originalRequest.headers.get("X-Emby-Token"));
  }

  const resp = await fetch(apiUrl.toString(), {
    method: "GET",
    headers,
    // 利用 Cloudflare 边缘缓存保存转换结果 24 小时，大幅降低重复请求延迟
    cf: {
      cacheTtl: 86400,
      cacheEverything: true,
    },
  });

  if (!resp.ok) return [];

  const data = await resp.json();

  // 兼容常见的返回结构：数组或包裹在 data 字段中
  const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [data?.data || data]);

  return list
    .map(item => (typeof item === "object" ? (item?.video_id ?? item?.id ?? item?.todbv) : item))
    .filter(Boolean);
}
```

---

## 四、 落地优化细节建议

1. **启用边缘缓存（强烈建议）**：
   一部影视作品的 `tmdb` 与 `todbv` 映射关系相对固定。在 Cloudflare Workers 中配置 `cf: { cacheTtl: 86400, cacheEverything: true }` 或结合 Cloudflare KV / Cache API 后，同一个 TMDB ID 首次查询后即可直接命中缓存，避免拖慢播放器聚合搜索的响应速度。
2. **保留原有筛选参数**：
   播放器在请求聚合时，通常还会附带 `IncludeItemTypes=Movie`、`IncludeItemTypes=Series`、`Recursive=true`、`Fields` 等参数。改写参数时只需将 `AnyProviderIdEquals` 替换为 `todbvs`，其余 Emby 标准参数全部原样保留即可。
3. **空结果短路返回**：
   如果调用 `getVideoIdByExternalId` 返回为空（代表 EMOS 库内暂无此片），可直接在反代层向播放器返回标准的 Emby 空列表 JSON（`{"Items":[],"TotalRecordCount":0}`），从而省去一次向 EMOS 源站发起的无效回源请求。
/**
 * 将包含 AnyProviderIdEquals=tmdb.xxx 的请求转换为基于标题和年份的搜索请求，
 * 仅添加 SearchTerm 和精确的 Years，其他参数完全保留原始值。
 *
 * @param {URL} upstreamUrl - 原始请求的 URL 对象（可从 new URL(request.url) 获得）
 * @param {string} tmdbApiKey - TMDB API Key（建议从环境变量读取）
 * @returns {Promise<URL|null>} 转换后的 URL 对象，若失败返回 null
 */
async function convertTmdbRequestFromUrl(upstreamUrl, tmdbApiKey) {
  // 1. 提取 TMDB ID（支持逗号分隔列表，例如 "tmdb.123,imdb.tt456"）
  const anyProviderId = upstreamUrl.searchParams.get("AnyProviderIdEquals");
  const tmdbMatch = anyProviderId?.match(/tmdb\.(\d+)/i);
  if (!tmdbMatch) return null;
  const tmdbId = tmdbMatch[1];

  if (!tmdbApiKey) {
    console.error("TMDB API key not provided");
    return null;
  }

  // 2. 判断媒体类型（优先从 IncludeItemTypes 中识别 movie）
  const includeTypes = upstreamUrl.searchParams.get("IncludeItemTypes") || "";
  const isMovie = includeTypes.toLowerCase().includes("movie");
  const mediaType = isMovie ? "movie" : "tv"; // 默认为剧集

  try {
    // 3. 调用对应的 TMDB API
    let tmdbUrl;
    if (isMovie) {
      tmdbUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${tmdbApiKey}&language=zh-CN`;
    } else {
      tmdbUrl = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${tmdbApiKey}&language=zh-CN`;
    }

    console.log(`Fetching TMDB ${mediaType} ID: ${tmdbId}`);
    const resp = await fetch(tmdbUrl);
    if (!resp.ok) {
      console.error(`TMDB API error for ${mediaType} ${tmdbId}: ${resp.status}`);
      return null;
    }
    const data = await resp.json();

    // 4. 提取标题和年份（不同媒体类型字段不同）
    let title, year;
    if (isMovie) {
      title = data.title;
      year = data.release_date ? data.release_date.substring(0, 4) : "";
    } else {
      title = data.name;
      year = data.first_air_date ? data.first_air_date.substring(0, 4) : "";
    }

    if (!title) {
      console.error(`TMDB ${mediaType} ${tmdbId} missing title`);
      return null;
    }

    // 5. 构造新的搜索 URL（基于原始 URL）
    const newUrl = new URL(upstreamUrl.toString());

    // 5.1 移除 AnyProviderIdEquals（核心转换）
    newUrl.searchParams.delete("AnyProviderIdEquals");

    // 5.2 设置搜索词
    newUrl.searchParams.set("SearchTerm", title);

    // 5.3 设置年份（精确匹配）
    if (year) {
      newUrl.searchParams.set("Years", year);
    } else {
      // 如果没有年份，确保删除可能存在的旧年份参数
      newUrl.searchParams.delete("Years");
    }

    // 6. 所有其他参数（Fields, EnableImageTypes, SortBy, Limit 等）原样保留，不做任何修改

    console.log(`Converted to search (exact year, keeping original params): ${newUrl.toString()}`);
    return newUrl;
  } catch (error) {
    console.error("TMDB conversion error:", error);
    return null;
  }
}

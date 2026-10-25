# docs/references

外部参考资料，**不是项目代码**，不参与构建、不进入 Worker bundle、不被任何测试加载。

保留它们是因为仓库里多处注释与 README 直接引用了这里的事实（例如 todb 的
`api.theotherdb.org` 主机与 `type`/`value` 参数形态），删掉会让那些引用失去出处。

| 文件 | 来源 | 用途 |
| --- | --- | --- |
| `emos-aggregation.md` | EMOS 官方反代文档（用户提供） | 多服聚合机制说明。注意其中 `api.todb.best` 域名与 `?tmdb=<id>` 参数形态**与官方 Postman 集合不符**，实测为 404；仓库实现以集合为准（`api.theotherdb.org` + `type=tmdb&value=<id>`）。 |
| `tmdb-search-converter.js` | 通用 Emby 聚合反代脚本（用户提供） | `tmdb` 档策略的参考实现：只做 `AnyProviderIdEquals` → `SearchTerm` + `Years` 改写，其余参数原样保留。Worker 里的等价实现是 `convertTmdbRequestFromUrl` 的 TMDB 分支。 |

两个文件都保留原始形态，不跟随仓库的 lint / format 规则（`.oxlintrc.json` 与 `.oxfmtrc.json`
已排除本目录），避免为了过格式检查而改动参考资料本身。

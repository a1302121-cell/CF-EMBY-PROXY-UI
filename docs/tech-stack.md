# 技术栈与更新策略

一句话结论：**真正上线的前端技术栈只有“一个 Worker bundle + 一个单文件 HTML + 4 个钉死版本的 CDN 脚本”**。根目录 `package.json` 和 `frontend/package.json` 里的依赖一行都不会进用户浏览器。

想知道“该不该更新”，先判断你要动的东西属于下面哪一层。

## 1. 线上运行时（唯一真实栈）

管理端是单文件交付：`frontend/admin-runtime.template.html` + 增强脚本 → `frontend/index.html` → `frontend/dist/index.html`，没有任何 `type="module"`，不经过打包器。页面运行时按固定版本从 CDN 拉 4 个脚本：

| 资源 | 钉死版本 | 完整 URL | 作用 |
| --- | --- | --- | --- |
| Vue | 3.5.32 | `https://cdn.jsdelivr.net/npm/vue@3.5.32/dist/vue.runtime.global.prod.js` | 管理台 UI 框架（global build） |
| Chart.js | 4.4.7 | `https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js` | 仪表盘趋势图（global `Chart`） |
| Lucide | 1.8.0 | `https://cdn.jsdelivr.net/npm/lucide@1.8.0/dist/umd/lucide.min.js` | 图标（`lucide` 指令批量替换 `<i data-lucide>`） |
| Tailwind | 4.2.2 | `https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.2.2/dist/index.global.js` | 样式：浏览器内 JIT 编译（v4 浏览器构建），主题来自模板里的 `<style type="text/tailwindcss">` |

这 4 行是**生产依赖**。改其中任何一行，等于改用户浏览器里跑的代码；`npm run check` 里的 `tests/tech-stack-pins.test.mjs` 会把它们钉住，升级必须显式改测试。

## 2. 仓库依赖的真实分层

`package.json`（根）+ `frontend/package.json`（workspace，依赖提升到根 `node_modules/`）加起来 230 个包，但它们分属三种完全不同的角色：

| 组 | 包含 | 谁在使用 | 改动影响 |
| --- | --- | --- | --- |
| **工具链** | `vite` 8、`wrangler` 4、`miniflare`、`oxlint`、`oxfmt`、`acorn` + `acorn-walk`、`@playwright/test` 1.64 | Worker 打包、lint/format、架构与 CDN 检查器、D1 测试、e2e | 影响本地与 CI，不影响线上字节 |
| **参考源** | `vue` 3.5、`chart.js`、`lucide-vue-next`、`tailwindcss` 4、`@tailwindcss/vite`、`@vitejs/plugin-vue` | 只服务 `frontend/src/`（分叉前的可读源码，不参与构建）与少数单元测试（如 `frontend/src/lib/chart.js`） | 对线上零影响；只要还能通过 `check-frontend-sources` 即可 |
| **生产 pins** | 管理端模板里的 4 行 CDN URL | 用户浏览器 | **直接改线上** |

准确版本以 `package-lock.json` 为准，不要让文档复制版本号（除上面 4 个 pin，它们由测试守着）。

## 3. 更新前先问三个问题

1. **它会不会进 `frontend/dist/index.html` 或 `worker.js`？** 不会 → 属工具链/参考源，常规升级 + `npm run check` 通过即可。
2. **它是模板里那 4 行 URL 之一吗？** 是 → 属生产变更，必须按 §6 的顺序走真实浏览器验证。
3. **我是不是想“让两边版本一致”？** 停一下。跨层对齐不是目标，见 §4。

| 动作 | 性质 | 门槛 |
| --- | --- | --- |
| 升 `vite` / `wrangler` / `miniflare` / `oxlint` / `oxfmt` / `@playwright/test` | 工具链 | `npm run check`（必要时 `npm run test:e2e`） |
| 升 `frontend/package.json` 的 `dependencies` / `devDependencies` | 参考源 | `npm run check` 里的 Vue 源语法检查 |
| 升模板里 4 个 CDN pin 的版本号 | **生产** | 改 `tests/tech-stack-pins.test.mjs` + `npm run build:frontend` + `npm run check` + `npm run test:e2e` |
| 新增第 5 个 CDN 脚本 | **生产 + 资产策略** | 还要过 `check:cdn`（禁止 `esm.sh`、禁止可变 GitHub ref、壳 ≤ 2 MiB） |

## 4. 已知的三处不一致，是故意的

不要为了“整齐”去对齐它们，否则会把参考源的版本升级误当成线上升级。

| 项 | 线上 pin | npm 侧 | 为什么保留 |
| --- | --- | --- | --- |
| Chart.js | 4.4.7 (UMD) | 4.5.1 | npm 那份只被 `frontend/src/lib/chart.js` 与单测引用；线上是 global `Chart`，升级要单独验证图表渲染 |
| Lucide | `lucide@1.8.0` (UMD) | `lucide-vue-next@1.0.0` | **不是同一个包**：线上用 UMD `lucide` 全局 + 自定义指令批量替换，参考源用 Vue 组件版 |
| Tailwind | `@tailwindcss/browser@4.2.2`（浏览器构建） | `tailwindcss@4.2.2` + `@tailwindcss/vite` | **不是同一个包**：线上是能在浏览器里即时编译的自包含构建，参考源是构建期 CLI/插件；版本号同步但产物形态不同，见第 5 节 |

## 5. Tailwind v3 → v4 迁移记录

线上从 `cdn.tailwindcss.com/3.4.17`（Play CDN v3）换成了 `@tailwindcss/browser@4.2.2`（v4 浏览器构建）。形态仍然是"CDN 拉脚本 + 浏览器内编译"，单文件交付没变，但配置语言从 JS 换成了 CSS：原来的 `<script>tailwind.config={...}</script>` 现在是模板里一段 `<style type="text/tailwindcss">`，用 `@theme` 描述设计令牌。

### 5.1 迁过去的映射

| v3 (`tailwind.config`) | v4 (`@theme`) | 说明 |
| --- | --- | --- |
| `darkMode: "class"` | `@custom-variant dark (&:where(.dark, .dark *))` | `.dark` 挂在 `html` 上，语义不变 |
| `theme.extend.colors` 的 `--ui-c-*` 变量 | `--color-brand-500: rgb(var(--ui-c-a-500))` 等 | 颜色仍然全部走 CSS 变量，皮肤切换照旧 |
| `borderRadius.field/control/panel/pill` | `--radius-field/control/panel/pill` | 命名空间从 `borderRadius` 变 `--radius-*` |
| `boxShadow.ui-*` | `--shadow-ui-*` | 同上 |
| `transitionTimingFunction` / `duration` | `--ease-*` / `--transition-duration-*` | **注意不是 `--duration-*`** |
| 内置 `text-*` 的默认行高 | `--text-xs--line-height` … `--text-4xl--line-height` | v4 改了内置字号的行高，逐个钉回 v3 |

### 5.2 四个会静默改样式的坑

这些不是配置迁移，是 v4 自己改了默认值或语义，`@theme` 写对了也照样错位。每一条都是靠截图对比定位出来的。

1. **默认调色板换成了 oklch，且色值重调过。** 模板里用到 9 个 `tailwind.config` 从未映射的色系（red / emerald / amber / rose / violet / orange / cyan / purple / pink），升级后全部变味。现在用 v3 CDN 的原始 hex 钉死了 99 个 token（9 色系 × 11 档），**不要再删成"用默认调色板就行"**。
2. **`--duration-*` 不生效。** v4 的时长命名空间是 `--transition-duration-*`。写成 `--duration-ui` 时 `duration-ui` 解析成 0s，过渡直接消失且没有任何报错。
3. **`space-y-*` 的实现方向反了。** v4 用 `:not(:last-child) { margin-bottom }`，特异性压不住子元素自己的 `my-*`；v3 是 `* + * { margin-top }`，能压住。侧栏的 `.my-4` 分隔线因此从 `mt=4/mb=0` 变成 `mt=0/mb=4`，整个导航累计下移 24px。模板里按 v3 语义重写了实际用到的 5 档（`space-y-1/2/3/4/6`），复用的是 v3 那个更高特异性的选择器。
4. **`@layer utilities` 让应用 CSS 的简写反压工具类。** v3 时 Tailwind 的 utilities 输出在应用 `<style>` 之后，同特异性平手时 utilities 赢；v4 把 utilities 放进 `@layer utilities`，未分层的 `.glass-card{background/border/box-shadow}` 简写反而全赢，`shadow-sm`、`border-l-4`、`border-brand-500` 一起失效。修法是把**单类** `.glass-card` 规则降进 `@layer components`。含 `.dark` 的 `.dark .glass-card` 特异性是 (0,2,0)，v3 时它也压过 utilities，**不能一起降级**，否则深色主题会整片崩掉（实测 62% 像素差异）。

另外几处 v4 改过的默认值已显式还原：`--shadow-sm`（v4 里 `shadow-sm` 不再是 v3 的 `shadow` 的一半档）、`--default-ring-width`/`--default-ring-color`（v4 裸 `ring` 是 1px currentColor，v3 是 3px 蓝色半透明）、`@layer base` 里的默认 `border-color` 与 `::placeholder` 颜色。

### 5.3 已知残留

唯一还没对齐的是 `input[type=date]`：v3 下高 36px，v4 下 34px。padding、border、font、line-height、min-height、box-sizing 全部一致，差的是 v4 preflight 重写表单控件后 Chromium 算出的内部高度，找不到可对应的声明。影响是日志页筛选行整体上移 2px，文字不可见差异。要消掉只能给日期输入写死 `min-height`，那更像掩盖而不是修复，所以留着。

### 5.4 怎么防止再退化

`tests/e2e/visual.spec.mjs` 用 Playwright 对 5 个主视图 × 浅/深色截图比对基线（1440×900）。基线是**迁移后**的状态，也就是"现在正确"的样子：

```powershell
npm.cmd run test:visual                                    # 比对基线
$env:VISUAL_MAX_DIFF="0"; npm.cmd run test:visual           # 打印全部差异像素数
```

差异图落在 `test-results/**/*-diff.png`。基线文件名带平台后缀（`-win32`），所以这项**不进 `npm run check`、不进 CI**：换个操作系统就没有可比基线，会假失败。改 Tailwind 配置或大范围调样式后手动跑一次；确实是想要的变化，用 `npx playwright test --update-snapshots` 重录。基线已经用迁移后的状态重录，所以现在跑出来是 0 差异；它防的是以后再动样式时的意外漂移，不是拿迁移前的图当真理。

## 6. 验证入口

```powershell
npm.cmd run check        # 11 项门禁，其中 Node 测试含 4 个 CDN pin 的锁定
npm.cmd run test:e2e     # Playwright：真实浏览器 + 本地 Worker（KV/D1 从空库开始）
```

e2e 的可运行性来自 `wrangler dev` 能在本地起真 Worker，见 [`development.md` 第 7 节](./development.md)。改 CDN pin 或管理端模板后，正确的顺序是：改模板 → `npm.cmd run --workspace frontend build` → 改 `tests/tech-stack-pins.test.mjs` → `npm.cmd run check` → `npm.cmd run test:e2e`。

## 7. 常见误判

- **“`frontend/package.json` 是技术栈清单”**：不是，它是参考源的清单；线上技术栈在上面第 1 节那张 4 行表里。
- **“改了 `frontend/src/` 就是改了 UI”**：不是。它不参与构建，改了线上不变，只影响 `check-frontend-sources` 与少量单测。
- **“npm 里版本更新就该跟”**：不一定。跨层版本号没有对齐义务。
- **“`frontend/dist/index.html` 是构建产物可以随手改”**：它是 `frontend/index.html` 的拷贝，改它下次构建就丢。

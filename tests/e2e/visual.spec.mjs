import { expect, test } from "@playwright/test";
import { loginAndWaitForAdminBoot } from "./support.mjs";

// Tailwind 迁移/主题改动的视觉验证工具，不是回归门禁：
// 截图基线跟字体渲染绑定，换机器或换系统就会变，所以不进 `npm run check`，也不进 CI。
// 用法：
//   npx playwright test tests/e2e/visual.spec.mjs --update-snapshots   # 重新生成基线
//   npx playwright test tests/e2e/visual.spec.mjs                      # 与基线比对
// 像素容差：默认 0.2%（抗字体抗锯齿抖动）；迁移排查时用 VISUAL_MAX_DIFF=0 看全量差异。
const maxDiffPixelRatio = Number(process.env.VISUAL_MAX_DIFF ?? "0.002");

const VIEWS = [
  { hash: "#dashboard", name: "dashboard" },
  { hash: "#nodes", name: "nodes" },
  { hash: "#logs", name: "logs" },
  { hash: "#dns", name: "dns" },
  { hash: "#settings", name: "settings" },
];

// 两套皮肤（data-theme）× 明暗（.dark）。claude 皮肤占了模板里一半以上的颜色声明，
// 只截 classic 的浅/深看不到它，颜色令牌一改动就没有证据了。
const THEMES = [
  { label: "light", skin: "classic", dark: false },
  { label: "dark", skin: "classic", dark: true },
  { label: "claude-light", skin: "claude", dark: false },
  { label: "claude-dark", skin: "claude", dark: true },
];

async function waitForStyles(page) {
  // 等 CDN 上的 Tailwind 真正产出 CSS：body 的 bg-slate-50 有颜色就说明样式生效了。
  await page.waitForFunction(
    () => getComputedStyle(document.body).backgroundColor !== "rgba(0, 0, 0, 0)",
    null,
    { timeout: 30_000 },
  );
  await page.evaluate(() => document.fonts.ready);
  // 动效与过渡会随机影响像素，截图前统一定格。
  await page.addStyleTag({
    content: `*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important;
              transition-duration: 0s !important; transition-delay: 0s !important; caret-color: transparent !important; }`,
  });
  // Chart.js 走 canvas 自绘，CSS 定格管不到，直接关掉动画。
  await page.evaluate(() => {
    const chart = window.Chart;
    if (!chart) return;
    chart.defaults.animation = false;
    chart.defaults.animations = false;
  });
}

async function login(page) {
  await loginAndWaitForAdminBoot(page);
  await waitForStyles(page);
}

async function openView(page, hash) {
  await page.click(`.nav-item[href="${hash}"]`);
  await page.waitForTimeout(400);
  const dismiss = page.getByRole("button", { name: "知道了" });
  if (await dismiss.isVisible()) await dismiss.click();
  await page.waitForTimeout(200);
}

// 皮肤按钮在设置页的「界面主题」卡片里，由增强脚本渲染成 [data-admin-skin-option]。
// 点它会 applyUiSkin + saveConfig，皮肤于是同时落到 html[data-theme] 和本地 KV。
async function ensureSkin(page, skin) {
  if ((await page.locator("html").getAttribute("data-theme")) !== skin) {
    await page.click('.nav-item[href="#settings"]');
    await page.click(`[data-admin-skin-option="${skin}"]`);
    await expect(page.locator("html")).toHaveAttribute("data-theme", skin);
  }
  if (skin !== "claude") return;
  // claude 皮肤的字体是运行时插进来的 CDN 样式表（另外两条 preconnect 不会长 sheet），
  // 字体没落地就截图会拿到回退字形。
  await page.waitForFunction(
    () => {
      const sheets = [
        ...document.querySelectorAll('link[data-admin-skin-font="1"][rel="stylesheet"]'),
      ];
      return (
        sheets.length >= 2 &&
        sheets.every((link) => !!link.sheet) &&
        document.fonts.status === "loaded"
      );
    },
    null,
    { timeout: 60_000 },
  );
}

// claude 皮肤的中文字体是按 unicode-range 分片从 CDN 下的：document.fonts.ready 在分片
// 还没被请求时就会返回，于是同一份代码两次截图拿到不同字形，基线会随机失败。按当前可见
// 文本显式预载一次，字形才稳定。
const CLAUDE_FONT_SPECS = [
  '500 16px "Noto Serif SC"',
  '700 16px "Noto Serif SC"',
  '400 16px "Nunito"',
  '600 16px "Nunito"',
  '400 16px "JetBrains Mono"',
  '400 16px "DM Mono"',
  '400 16px "LXGW WenKai Screen"',
];

// 返回字体是否真的落地：字体 CDN 不可达时 document.fonts.load() 返回空数组而不是报错，
// 页面照样能渲染，只是整页都在用回退字形，这时候比截图基线只会得到满屏假差异。
// textContent 而不是 innerText：隐藏的视图也要预载，否则切视图时才拉字形。
async function settleSkinFonts(page) {
  const loaded = await page.evaluate(async (specs) => {
    const text = document.body.textContent ?? "";
    const counts = await Promise.all(
      specs.map(async (spec) => (await document.fonts.load(spec, text).catch(() => [])).length),
    );
    await document.fonts.ready;
    return counts;
  }, CLAUDE_FONT_SPECS);
  return loaded.every((count) => count > 0);
}

test.describe("管理台视觉基线", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const theme of THEMES) {
    test(`${theme.label} 5 个主视图`, async ({ page }) => {
      // 明暗存在 localStorage 的 "theme" 键，增强脚本在 head 阶段就落到 .dark 上；
      // 皮肤不同：服务端 bootstrap 里的 adminUiSkin 会盖掉 localStorage，只能点界面上的
      // 皮肤按钮（它会 saveConfig 写进 KV），所以皮肤切换必须在登录之后做。
      await page.addInitScript((t) => {
        try {
          localStorage.setItem("theme", t.dark ? "dark" : "light");
        } catch {}
      }, theme);
      await login(page);
      if (theme.dark) await expect(page.locator("html")).toHaveClass(/dark/);
      await ensureSkin(page, theme.skin);
      if (theme.skin === "claude") {
        const fontsLoaded = await settleSkinFonts(page);
        test.skip(!fontsLoaded, "claude 皮肤的中文字体 CDN 不可达，本轮只有回退字形，不跟基线比");
      }
      for (const view of VIEWS) {
        await openView(page, view.hash);
        await expect.soft(page).toHaveScreenshot(`${theme.label}-${view.name}.png`, {
          fullPage: false,
          maxDiffPixelRatio,
        });
      }
    });
  }
});

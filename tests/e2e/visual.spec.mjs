import { expect, test } from "@playwright/test";

// Tailwind 迁移/主题改动的视觉验证工具，不是回归门禁：
// 截图基线跟字体渲染绑定，换机器或换系统就会变，所以不进 `npm run check`，也不进 CI。
// 用法：
//   npx playwright test tests/e2e/visual.spec.mjs --update-snapshots   # 重新生成基线
//   npx playwright test tests/e2e/visual.spec.mjs                      # 与基线比对
const adminPassword = process.env.E2E_ADMIN_PASS || "e2e-local-admin-pass";
// 像素容差：默认 0.2%（抗字体抗锯齿抖动）；迁移排查时用 VISUAL_MAX_DIFF=0 看全量差异。
const maxDiffPixelRatio = Number(process.env.VISUAL_MAX_DIFF ?? "0.002");

const VIEWS = [
  { hash: "#dashboard", name: "dashboard" },
  { hash: "#nodes", name: "nodes" },
  { hash: "#logs", name: "logs" },
  { hash: "#dns", name: "dns" },
  { hash: "#settings", name: "settings" },
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
  await page.goto("/admin");
  await expect(page.locator("#admin-login-password")).toBeVisible();
  await page.fill("#admin-login-password", adminPassword);
  await page.click("#admin-login-submit");
  await expect(page.locator("#view-dashboard")).toBeVisible();
  await waitForStyles(page);
}

async function openView(page, hash) {
  await page.click(`.nav-item[href="${hash}"]`);
  await page.waitForTimeout(400);
  const dismiss = page.getByRole("button", { name: "知道了" });
  if (await dismiss.isVisible()) await dismiss.click();
  await page.waitForTimeout(200);
}

test.describe("管理台视觉基线", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("浅色主题 5 个主视图", async ({ page }) => {
    await login(page);
    for (const view of VIEWS) {
      await openView(page, view.hash);
      await expect.soft(page).toHaveScreenshot(`light-${view.name}.png`, {
        fullPage: false,
        maxDiffPixelRatio,
      });
    }
  });

  test("深色主题 5 个主视图", async ({ page }) => {
    // 主题模式存在 localStorage 的 "theme" 键，head 阶段就会落到 .dark 上；
    // 直接预置比找图标按钮点击稳定得多。
    await page.addInitScript(() => {
      try {
        localStorage.setItem("theme", "dark");
      } catch {}
    });
    await login(page);
    await expect(page.locator("html")).toHaveClass(/dark/);
    for (const view of VIEWS) {
      await openView(page, view.hash);
      await expect.soft(page).toHaveScreenshot(`dark-${view.name}.png`, {
        fullPage: false,
        maxDiffPixelRatio,
      });
    }
  });
});

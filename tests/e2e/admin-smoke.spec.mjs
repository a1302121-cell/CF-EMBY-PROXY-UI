import { expect, test } from "@playwright/test";

// 管理台是单文件交付：这里刻意只用生产 HTML 里真实存在的选择器，
// 一旦模板改名，这条冒烟会失败，而不是悄悄测了个空壳。
const adminPassword = process.env.E2E_ADMIN_PASS || "e2e-local-admin-pass";

test("登录后能渲染看板并在视图之间切换", async ({ page }) => {
  // 只收未捕获的脚本异常：空库/未配账号时，管理台会用 console.error 报告
  // “请在账号设置中完善 Zone ID”“FTS5 未初始化”这类降级结果，那是产品行为，不是崩溃。
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(String(error)));

  await page.goto("/admin");
  await expect(page.locator("#admin-login-password")).toBeVisible();
  await page.fill("#admin-login-password", adminPassword);
  await page.click("#admin-login-submit");

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator("#view-dashboard")).toBeVisible();
  await expect(page.locator('.nav-item[href="#nodes"]')).toBeVisible();

  for (const view of ["nodes", "logs", "dns", "settings"]) {
    await page.click(`.nav-item[href="#${view}"]`);
    await expect(page.locator(`#view-${view}`)).toBeVisible();

    // 空库的日志页会弹“请先初始化日志表”。冒烟只证明视图能渲染，提示关掉继续。
    const dismiss = page.getByRole("button", { name: "知道了" });
    if (await dismiss.isVisible()) await dismiss.click();
  }

  await page.click('.nav-item[href="#dashboard"]');
  await expect(page.locator("#view-dashboard")).toBeVisible();

  expect(runtimeErrors).toEqual([]);
});

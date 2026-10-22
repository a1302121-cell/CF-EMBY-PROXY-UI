import { expect } from "@playwright/test";

export const adminPassword = process.env.E2E_ADMIN_PASS || "e2e-local-admin-pass";

// 首帧依赖 4 个 jsdelivr 脚本 + 浏览器里编译整页 Tailwind：冷启动（首次握手、v4 首次
// 编译）实测能把首帧拖到 26s，给某个选择器定 20s 死等就会假失败。
// 这里等壳层自己的启动标志；真启动不起来时，失败信息里带上壳层记录的启动错误。
export async function loginAndWaitForAdminBoot(page) {
  await page.goto("/admin");
  await page.fill("#admin-login-password", adminPassword);
  await page.click("#admin-login-submit");
  await expect(page).toHaveURL(/\/admin$/);
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          window.__ADMIN_UI_BOOTED__
            ? "booted"
            : `not booted: ${window.__ADMIN_UI_BOOT_ERROR__ || "no boot error recorded"}`,
        ),
      { timeout: 60_000 },
    )
    .toBe("booted");
}

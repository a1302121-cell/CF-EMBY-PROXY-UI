import { expect, test } from "@playwright/test";
import { loginAndWaitForAdminBoot } from "./support.mjs";

// 管理台是单文件交付：这里刻意只用生产 HTML 里真实存在的选择器，
// 一旦模板改名，这条冒烟会失败，而不是悄悄测了个空壳。

test("登录后能渲染看板并在视图之间切换", async ({ page }) => {
  // 只收未捕获的脚本异常：空库/未配账号时，管理台会用 console.error 报告
  // “请在账号设置中完善 Zone ID”“FTS5 未初始化”这类降级结果，那是产品行为，不是崩溃。
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(String(error)));

  await loginAndWaitForAdminBoot(page);
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

test("CDN 不可达时管理台仍能从同源 vendor 启动", async ({ page }) => {
  // 手机网络到 cdn.jsdelivr.net 不通是长期存在的真实场景：4 个首屏脚本必须由 Worker
  // 从本地摇树产物同源返回（/ADMIN_PATH/__release/<rev>/vendor/<assetKey>），
  // 一旦回退到浏览器直连 CDN，这里就会变成一张白屏。
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(String(error)));
  await page.route("**cdn.jsdelivr.net/**", (route) => route.abort("failed"));

  await loginAndWaitForAdminBoot(page);
  await expect(page.locator("#view-dashboard")).toBeVisible();

  // lucide 摇树子集：图标必须真的替换成 svg，而不是留一堆空的 <i data-lucide>
  expect(await page.locator("svg.lucide").count()).toBeGreaterThan(5);

  // chart.js 摇树子集：画布上必须有实际像素（坐标轴/网格），否则说明注册项或颜色被摇掉了
  const paintedPixels = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return 0;
    const data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
    let painted = 0;
    for (let index = 3; index < data.length; index += 4) if (data[index] > 0) painted += 1;
    return painted;
  });
  expect(paintedPixels).toBeGreaterThan(1000);
  expect(runtimeErrors).toEqual([]);
});

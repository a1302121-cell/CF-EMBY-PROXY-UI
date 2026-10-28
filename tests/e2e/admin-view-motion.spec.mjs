import { expect, test } from "@playwright/test";
import { loginAndWaitForAdminBoot } from "./support.mjs";

// 视图切换的"抖动"要能量化，就必须在真实 Worker 壳（wrangler dev / workerd）里跑：
// 抖动来自滚动条占位、切换动画和内容落地，这三件事只有真页面才成立。
//
// 两个环境前提，缺一个量到的都是假数据：
//   1. Playwright 默认给 Chromium 加 --hide-scrollbars，滚动条不占宽度，于是
//      "切换视图时内容被滚动条推挤 15px"在默认配置下根本不可见。这里把它关掉。
//   2. 空库会弹"DNS 记录加载失败"/"请先初始化日志表"这类模态，它们自带全屏 backdrop-blur，
//      会让每一帧都去重采样整屏模糊（实测把切换窗口从 60fps 压到 40fps）。
//      所以帧耗时只在没有模态的视图之间量，宽度则在全部视图上量。
//
// A/B 对照（同机同进程，把修复前的实现重新注入）：
//   MOTION_BASELINE=1 npx playwright test tests/e2e/admin-view-motion.spec.mjs
//   npx playwright test tests/e2e/admin-view-motion.spec.mjs
test.use({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } });

const LEGACY_CSS = `
  .view-section.active{animation:fadeIn .3s ease-out !important}
  @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
  #content-area{scrollbar-gutter:auto !important}
`;
const LEGACY_MODE = process.env.MOTION_BASELINE === "1";

const ALL_VIEWS = ["#nodes", "#logs", "#dns", "#settings", "#dashboard"];
// 空库上会弹模态的两个视图：只量宽度，不量帧耗时
const QUIET_VIEWS = ["#nodes", "#settings", "#dashboard"];
const SWITCHES = [...QUIET_VIEWS, ...QUIET_VIEWS];

async function dismissOverlays(page) {
  await page.evaluate(() => {
    for (const node of document.querySelectorAll('[data-ui-backdrop="1"]')) {
      if (getComputedStyle(node).display === "none") continue;
      const buttons = [...node.querySelectorAll("button")];
      buttons[buttons.length - 1]?.click();
    }
  });
  await page.waitForTimeout(120);
}

async function installProbe(page) {
  if (LEGACY_MODE) await page.addStyleTag({ content: LEGACY_CSS });
  await page.evaluate(() => {
    const probe = (window.__viewMotionProbe = { frames: [], loaf: [] });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) probe.loaf.push(Math.round(entry.duration));
    }).observe({ type: "long-animation-frame", buffered: false });
  });
}

// 一次切换的采样窗口：逐帧记录帧间隔，同时盯住新视图里一个静止元素的 top。
// top 在窗口里变化 = 内容在动画期间还在挪位置（这就是"抖"的物理定义）。
async function measureSwitch(page, hash) {
  return page.evaluate(async (target) => {
    const probe = window.__viewMotionProbe;
    probe.frames.length = 0;
    probe.loaf.length = 0;

    const area = document.getElementById("content-area");
    const widthBefore = area.clientWidth;
    const viewId = `view-${target.slice(1)}`;
    const nav = document.querySelector(`.nav-item[href="${target}"]`);
    if (!nav) throw new Error(`missing nav item for ${target}`);

    const tops = [];
    let last = performance.now();
    let sampling = true;
    const tick = (now) => {
      probe.frames.push(now - last);
      last = now;
      const anchor = document.getElementById(viewId)?.firstElementChild;
      if (anchor) {
        const top = anchor.getBoundingClientRect().top;
        // 只收动画窗口内的样本（首帧到 400ms）
        if (tops.length < 1 || now - start <= 400) tops.push(top);
      }
      if (sampling) requestAnimationFrame(tick);
    };
    const start = performance.now();
    requestAnimationFrame(tick);

    nav.click();
    await new Promise((resolve) => setTimeout(resolve, 700));
    sampling = false;

    return {
      hash: target,
      widthDelta: area.clientWidth - widthBefore,
      frames: probe.frames.slice(1),
      loaf: [...probe.loaf],
      // 静止内容在切换窗口内的最大纵向漂移（px），以及出现过的亚像素位置个数
      contentDrift: tops.length > 1 ? Math.max(...tops) - Math.min(...tops) : 0,
      subpixelTops: new Set(tops.map((top) => Math.round((top % 1) * 100) / 100)).size,
    };
  }, hash);
}

const round = (value) => Math.round(value * 10) / 10;

function summarize(samples) {
  const frames = samples.flatMap((sample) => sample.frames);
  return {
    switches: samples.map((sample) => ({
      view: sample.hash,
      widthDelta: sample.widthDelta,
      maxFrameMs: round(Math.max(...sample.frames, 0)),
      slowFrames: sample.frames.filter((value) => value > 33).length,
      longFrames: sample.loaf,
      contentDrift: round(sample.contentDrift),
      subpixelTops: sample.subpixelTops,
    })),
    totals: {
      widthDeltas: [...new Set(samples.map((sample) => sample.widthDelta))],
      frameCount: frames.length,
      slowFrames: frames.filter((value) => value > 33).length,
      worstFrameMs: round(Math.max(...frames, 0)),
      worstContentDrift: round(Math.max(...samples.map((sample) => sample.contentDrift))),
      worstLongFrame: Math.max(0, ...samples.flatMap((sample) => sample.loaf)),
    },
  };
}

test("视图切换的布局位移与帧耗时", async ({ page }) => {
  test.setTimeout(180_000);
  await loginAndWaitForAdminBoot(page);
  await expect(page.locator("#view-dashboard")).toBeVisible();
  await installProbe(page);

  // 先挂载全部视图：首访成本（整棵 DOM 构建 + Chart.js 初始化）是另一件事，
  // 这里量的是"已经挂载之后来回切"的稳态抖动。
  for (const hash of ALL_VIEWS) {
    await page.evaluate(
      (target) => document.querySelector(`.nav-item[href="${target}"]`).click(),
      hash,
    );
    await page.waitForTimeout(500);
    await dismissOverlays(page);
  }
  await dismissOverlays(page);

  // 宽度：全部视图都量（视图长短不同 → 滚动条出现/消失）
  const widthSamples = [];
  for (const hash of ALL_VIEWS) {
    widthSamples.push(await measureSwitch(page, hash));
    await page.waitForTimeout(150);
    await dismissOverlays(page);
  }

  // 帧耗时与内容漂移：只在不会弹模态的视图之间量
  const motionSamples = [];
  for (const hash of SWITCHES) {
    motionSamples.push(await measureSwitch(page, hash));
    await page.waitForTimeout(150);
    await dismissOverlays(page);
  }

  const report = {
    mode: LEGACY_MODE ? "legacy" : "current",
    width: summarize(widthSamples),
    motion: summarize(motionSamples),
  };
  console.log(JSON.stringify(report, null, 2));

  expect(report.width.switches).toHaveLength(ALL_VIEWS.length);
  expect(report.motion.switches).toHaveLength(SWITCHES.length);

  if (LEGACY_MODE) return;

  // 硬门禁 1：切换前后内容区宽度必须一模一样。视图长短不同 → 滚动条出现/消失，
  // 不预留槽位时每次切换都会横向推挤约 15px（实测 945 ↔ 960）。
  expect(report.width.totals.widthDeltas).toEqual([0]);
  // 硬门禁 2：切换过程中静止内容不能挪位置（修复前 translateY 会让它整体滑 5px）。
  expect(report.motion.totals.worstContentDrift).toBe(0);
  // 帧耗时是环境相关的软指标（headless + 软件栅格），这里只兜住病态回归。
  expect(report.motion.totals.worstFrameMs).toBeLessThan(100);
  expect(report.motion.totals.worstLongFrame).toBeLessThan(100);
});

test("图标占位在 lucide 接管之前就占好位置", async ({ page }) => {
  await loginAndWaitForAdminBoot(page);
  await expect(page.locator("#view-dashboard")).toBeVisible();

  // 模板里这类行内图标有 10 处（导出 / 刷新 / 上传 / 数据库…）。它们在换成 <svg> 之前是
  // <i data-lucide class="w-4 h-4 inline">，而 inline 元素忽略 width/height —— 占位宽度为 0，
  // 图标落地的那一刻会把同一行的文字整体推开。这条守住 enhancements 里
  // `#app-shell i[data-lucide]{display:inline-flex}` 这条规则别被删掉。
  const probe = await page.evaluate(() => {
    const host = document.createElement("div");
    host.innerHTML =
      '<button type="button" class="text-sm font-medium"><i data-lucide="refresh-cw" class="w-4 h-4 inline mr-1"></i>导出全局设置</button>';
    document.getElementById("content-area").appendChild(host);
    const icon = host.querySelector("[data-lucide]");
    const box = icon.getBoundingClientRect();
    const result = {
      width: Math.round(box.width),
      height: Math.round(box.height),
      display: getComputedStyle(icon).display,
    };
    host.remove();
    return result;
  });

  console.log(JSON.stringify({ iconPlaceholder: probe }, null, 2));
  expect(probe.width).toBeGreaterThan(0);
  expect(probe.height).toBeGreaterThan(0);
});

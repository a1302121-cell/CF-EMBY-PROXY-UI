import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  ADMIN_VENDOR_PINS,
  buildAdminVendorAssetKey,
} from "../frontend/scripts/build-admin-vendor.mjs";
import { createTestApplication } from "../worker/testing/hooks.js";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vendorDirectory = path.join(repositoryRoot, "frontend", "vendor");
const distVendorDirectory = path.join(repositoryRoot, "frontend", "dist", "vendor");
const shellSources = [
  "frontend/admin-runtime.template.html",
  "frontend/scripts/admin-runtime-enhancements.mjs",
  "frontend/index.html",
  "frontend/dist/index.html",
];

async function readRepositoryFile(relativePath) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

async function readManifest() {
  return JSON.parse(await readRepositoryFile("frontend/vendor/manifest.json"));
}

test("vendor 产物的 assetKey 与 Worker 实际计算的 key 完全一致", async () => {
  const app = createTestApplication();
  const shell = app.testPlatform.fetch.adminShell;
  const html = await readRepositoryFile("frontend/dist/index.html");
  const manifest = shell.buildAdminReleaseVendorManifest(html, {
    releaseTag: "parity-check",
    sourceUrl: "local:parity-check",
  });
  const workerKeys = new Map(manifest.entries.map((entry) => [entry.upstreamUrl, entry.assetKey]));
  for (const pin of ADMIN_VENDOR_PINS) {
    assert.equal(
      workerKeys.get(pin.upstreamUrl),
      buildAdminVendorAssetKey(pin.upstreamUrl, "script"),
      `${pin.key} 的 assetKey 与 Worker 计算值不一致：Worker 改了 hash 口径却没同步构建脚本`,
    );
  }
  assert.equal(workerKeys.size, ADMIN_VENDOR_PINS.length);
});

test("manifest 记录的 pin、摇树策略与体积都自洽", async () => {
  const manifest = await readManifest();
  assert.equal(manifest.assets.length, ADMIN_VENDOR_PINS.length);
  for (const pin of ADMIN_VENDOR_PINS) {
    const asset = manifest.assets.find((item) => item.key === pin.key);
    assert.ok(asset, `manifest 缺少 ${pin.key}`);
    assert.equal(asset.upstreamUrl, pin.upstreamUrl);
    assert.equal(asset.version, pin.version);
    assert.equal(asset.assetKey, buildAdminVendorAssetKey(pin.upstreamUrl, "script"));
    assert.ok(asset.bytes > 0, `${pin.key} 产物为空`);
    assert.equal(asset.treeShaken, pin.strategy !== "copy");
    if (asset.treeShaken)
      assert.ok(
        asset.bytes < asset.upstreamBytes,
        `${pin.key} 摇树后没有变小：${asset.bytes} ≥ ${asset.upstreamBytes}`,
      );
  }
});

test("frontend/vendor 与 frontend/dist/vendor 的产物一致且非空", async () => {
  const expectedKeys = ADMIN_VENDOR_PINS.map((pin) => buildAdminVendorAssetKey(pin.upstreamUrl));
  const sourceFiles = (await readdir(vendorDirectory))
    .filter((name) => name.endsWith(".js"))
    .sort();
  const distFiles = (await readdir(distVendorDirectory))
    .filter((name) => name.endsWith(".js"))
    .sort();
  assert.deepEqual(sourceFiles, [...expectedKeys].sort());
  assert.deepEqual(distFiles, [...expectedKeys].sort());
  for (const assetKey of expectedKeys) {
    const [sourceBuffer, distBuffer] = await Promise.all([
      readFile(path.join(vendorDirectory, assetKey)),
      readFile(path.join(distVendorDirectory, assetKey)),
    ]);
    assert.ok(sourceBuffer.length > 0);
    assert.ok(
      sourceBuffer.equals(distBuffer),
      `${assetKey} 在 dist/vendor 与 vendor 下不一致，请重新运行 npm run build:frontend`,
    );
  }
});

test("lucide 子集覆盖壳里出现的每一个图标名（含废弃别名）", async () => {
  const manifest = await readManifest();
  const lucideAsset = manifest.assets.find((item) => item.key === "lucide");
  assert.ok(lucideAsset?.iconNames?.length, "manifest 缺少 lucide 图标清单");
  const bundled = new Set(lucideAsset.iconNames);
  // 别名必须按"壳里写的名字"登记：replaceElement 用 toPascalCase(名字) 查表，
  // 所以 file-plus-2 要保留成 FilePlus2 的键，而不是改成 file-plus-corner。
  for (const alias of ["upload-cloud", "file-plus-2", "file-bar-chart"])
    assert.ok(bundled.has(alias), `lucide 子集缺少壳里用到的别名图标：${alias}`);

  const literalPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const seen = new Set();
  for (const relativePath of shellSources) {
    const source = await readRepositoryFile(relativePath).catch(() => "");
    if (!source) continue;
    for (const match of source.matchAll(/data-lucide\\?"\s*:\s*\\?"([a-z0-9-]+)/g))
      seen.add(match[1]);
    for (const match of source.matchAll(/\bicon:\s*\\?["']([a-z0-9-]+)/g)) seen.add(match[1]);
  }
  for (const name of [...seen].sort()) {
    if (!literalPattern.test(name)) continue;
    if (!bundled.has(name)) assert.fail(`壳里用到的图标没有进 lucide 子集：${name}`);
  }
});

test("chart 子集保留了折线图需要的注册项与颜色表", async () => {
  const manifest = await readManifest();
  for (const registration of [
    "LineController",
    "LineElement",
    "PointElement",
    "LinearScale",
    "CategoryScale",
    "Filler",
    "Tooltip",
    "Legend",
  ])
    assert.ok(
      manifest.chartRegistrations.includes(registration),
      `chart 注册项缺少 ${registration}`,
    );
  const chartAsset = manifest.assets.find((item) => item.key === "chart");
  const bundle = await readFile(path.join(vendorDirectory, chartAsset.assetKey), "utf8");
  // @kurkle/color 的 CSS 具名色表 + hwb 解析。少了它 borderColor 会退化成透明，
  // 而 Worker/Node 侧不会有任何报错，只能靠这层断言挡住。
  assert.ok(bundle.includes("d3d3d3"), "chart 子集丢了 @kurkle/color 的具名色表");
  assert.ok(bundle.includes("hwb"), "chart 子集丢了 @kurkle/color 的 hwb 解析");
});

test("首屏 vendor 总体积显著小于上游 4 个 UMD 构建", async () => {
  const manifest = await readManifest();
  const upstream = manifest.assets.reduce((sum, asset) => sum + asset.upstreamBytes, 0);
  const current = manifest.assets.reduce((sum, asset) => sum + asset.bytes, 0);
  assert.ok(current < upstream * 0.7, `摇树收益不足：${current} / ${upstream}（期望 < 70%）`);
  const lucide = manifest.assets.find((item) => item.key === "lucide");
  assert.ok(
    lucide.bytes < lucide.upstreamBytes * 0.1,
    `lucide 子集应该比上游小一个数量级：${lucide.bytes} vs ${lucide.upstreamBytes}`,
  );
});

test("vendor 产物文件确实存在于磁盘上并和 manifest 大小一致", async () => {
  const manifest = await readManifest();
  for (const asset of manifest.assets) {
    const fileStat = await stat(path.join(vendorDirectory, asset.assetKey));
    assert.equal(fileStat.size, asset.bytes, `${asset.key} 落盘大小与 manifest 不一致`);
  }
});

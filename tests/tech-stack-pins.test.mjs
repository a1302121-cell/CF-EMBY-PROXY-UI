import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// 管理端是单文件交付：这 4 个 CDN URL 就是线上前端真正的生产依赖。
// 改这里等于改用户浏览器里跑的代码，必须同时改 docs/tech-stack.md 并跑 `npm run test:e2e`。
const EXPECTED_VENDOR_PINS = [
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js",
  "https://cdn.jsdelivr.net/npm/lucide@1.8.0/dist/umd/lucide.min.js",
  "https://cdn.jsdelivr.net/npm/vue@3.5.32/dist/vue.runtime.global.prod.js",
  "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.2.2/dist/index.global.js",
];

const PINNED_HTML_FILES = [
  "frontend/admin-runtime.template.html",
  "frontend/index.html",
  "frontend/dist/index.html",
];

async function readRepositoryFile(relativePath) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function collectExternalScriptSources(html) {
  const pattern = /<script\b[^>]*\bsrc="(https?:[^"]+)"/g;
  return [...html.matchAll(pattern)].map((match) => match[1]).sort();
}

for (const relativePath of PINNED_HTML_FILES) {
  test(`${relativePath} 只引用预期版本的 4 个 CDN 脚本`, async () => {
    const html = await readRepositoryFile(relativePath);
    assert.deepEqual(collectExternalScriptSources(html), [...EXPECTED_VENDOR_PINS].sort());
  });
}

test("docs/tech-stack.md 记录的版本与模板一致", async () => {
  const document = await readRepositoryFile("docs/tech-stack.md");
  for (const pin of EXPECTED_VENDOR_PINS) {
    assert.ok(document.includes(pin), `docs/tech-stack.md 缺少 pin：${pin}`);
  }
});

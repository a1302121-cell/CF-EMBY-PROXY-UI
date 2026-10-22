import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { MAX_WORKER_BUNDLE_BYTES, buildWorkerBundle } from "./worker-build-lib.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "cf-emby-worker-check-"));

// Windows 检出（core.autocrlf=true）会让工作区 worker.js 变成 CRLF，而构建产物恒为 LF。
// 产物只比较内容，比较前统一换行，避免把检出差异当成“产物过期”。
function normalizeLineEndings(buffer) {
  return buffer.toString("utf8").replace(/\r\n/g, "\n");
}

try {
  await buildWorkerBundle({ outDir: temporaryDirectory });
  const [expected, actual] = await Promise.all([
    fs.readFile(path.join(temporaryDirectory, "worker.js")),
    fs.readFile(path.join(repositoryRoot, "worker.js")),
  ]);
  if (normalizeLineEndings(expected) !== normalizeLineEndings(actual)) {
    throw new Error(
      "worker.js is stale; run npm run build:worker and commit the generated artifact",
    );
  }
  if (actual.byteLength > MAX_WORKER_BUNDLE_BYTES) {
    throw new Error(
      `worker.js exceeds ${MAX_WORKER_BUNDLE_BYTES} byte budget; received ${actual.byteLength}`,
    );
  }
  console.log(`[check-worker-bundle] worker.js is current (${actual.byteLength} bytes)`);
} finally {
  await fs.rm(temporaryDirectory, { recursive: true, force: true });
}

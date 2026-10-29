import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const METRIC_KEYS = [
  "pumpNsPerChunk",
  "pumpMiBPerSecond",
  "classifyApiNs",
  "classifyVideoNs",
  "classifyAudioNs",
  "headerNs",
  "headerCount",
  "headerWireBytes",
];

// 基准脚本本身就是维护工具，这里只保证它的测量口径还在：指标齐全、单位合理、tee 探针能区分取消与不取消。
test(
  "stream benchmark harness reports every metric and a meaningful tee probe",
  { timeout: 120000 },
  () => {
    const stdout = execFileSync(
      process.execPath,
      [path.join(repositoryRoot, "scripts", "bench-worker-stream.mjs"), "--json", "--rounds", "1"],
      { cwd: repositoryRoot, encoding: "utf8", maxBuffer: 4 * 1024 * 1024 },
    );
    const payload = JSON.parse(stdout);
    for (const key of METRIC_KEYS) {
      assert.ok(Number.isFinite(payload.current[key]), `${key} must be a number`);
      assert.ok(payload.current[key] > 0, `${key} must be positive`);
    }
    // 剔除后的头集合：content-type/content-length/cache-control/etag/date + 三条安全头 + CORS。
    assert.ok(
      payload.current.headerCount >= 8 && payload.current.headerCount <= 14,
      "header count",
    );
    assert.equal(payload.baseline, null);
    assert.equal(payload.information.teeBodyMiB, 16);
    assert.ok(
      payload.information.teeUnreadBranchMiB >= 4,
      "unread tee branch keeps the body alive",
    );
    assert.ok(
      payload.information.teeCancelledBranchMiB <= 4,
      "cancelled tee branch frees the body",
    );
  },
);

// 流式路径的固定基准。四项 A/B 指标各自守着一个已经改过的点：
//   受管流泵送  -> pull/enqueue 里的每块开销（idle 计时器就在这条路径上）
//   请求分类    -> classifyRequest 的正则链（音频判定、路由正则合并）
//   响应头 CPU  -> buildProxyResponseHeaders 的剔除集合
//   响应头字节  -> 下游真正收到的头大小
// 另附一个 tee 保留量探针，用来量化「clone 分支不取消」会留下多少内存。
//
// 只测包装层，不测运行时拷贝：上游流每一块都复用同一份 Uint8Array。
// 意义只在百分比，仅供娱乐参考：绝对值随机器状态漂，只用于同机同进程 A/B 粗筛方向，
// 不作验收依据（行为看 tests/，真实成本看 wrangler tail 的 CPU time）。
// 用法：
//   node ./scripts/bench-worker-stream.mjs                  # 只测当前工作区
//   node ./scripts/bench-worker-stream.mjs --baseline bd55db1
//   node ./scripts/bench-worker-stream.mjs --json --rounds 1
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");

const DEFAULTS = {
  rounds: 4,
  classifyIterations: 100000,
  headerIterations: 50000,
  pumpRuns: 8,
  pumpChunks: 1024,
  pumpChunkBytes: 64 * 1024,
  teeChunks: 256,
};

const NUMBER_COLUMNS = [
  ["pumpNsPerChunk", "受管流每块成本 (ns)", -1],
  ["pumpMiBPerSecond", "受管流泵送上限 (MiB/s)", 1],
  ["classifyApiNs", "请求分类 API (ns)", -1],
  ["classifyVideoNs", "请求分类 视频 (ns)", -1],
  ["classifyAudioNs", "请求分类 音频 (ns)", -1],
  ["headerNs", "响应头 CPU (ns)", -1],
  ["headerWireBytes", "响应头线上字节 (B)", -1],
];

function parseArgs(argv) {
  const options = { ...DEFAULTS, baseline: "", json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === "--json") options.json = true;
    else if (flag === "--baseline") options.baseline = String(argv[(index += 1)] || "");
    else if (flag === "--rounds") options.rounds = Math.max(1, Number(argv[(index += 1)]) || 1);
    else throw new Error(`unknown argument: ${flag}`);
  }
  return options;
}

function hr() {
  return process.hrtime.bigint();
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function createLifecycle() {
  const listeners = new Set();
  return {
    abortReason: "",
    onAbort(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getAbortReason() {
      return this.abortReason;
    },
    abort(reason) {
      this.abortReason = reason;
      for (const listener of listeners) listener(reason);
    },
    dispose() {
      listeners.clear();
    },
  };
}

async function loadProxyService(workerDirectory) {
  const hooksUrl = pathToFileURL(path.join(workerDirectory, "worker/testing/hooks.js"));
  const { createTestApplication } = await import(hooksUrl.href);
  return createTestApplication().testPlatform.fetch.proxyService;
}

async function pumpOnce(proxyService, config) {
  const chunk = new Uint8Array(config.pumpChunkBytes);
  let sent = 0;
  const upstream = new Response(
    new ReadableStream({
      pull(controller) {
        controller.enqueue(chunk);
        sent += 1;
        if (sent === config.pumpChunks) controller.close();
      },
    }),
    { status: 200 },
  );
  const execution = {
    requestMethod: "GET",
    request: new Request("https://worker.test/alpha/Videos/1/hls1/main/0.ts"),
    requestUrl: new URL("https://worker.test/alpha/Videos/1/hls1/main/0.ts"),
    proxyPath: "/Videos/1/hls1/main/0.ts",
    // isSegment 走受管包装 + 生产默认的 15 秒 idle 计时器。
    requestTraits: { isSegment: true },
    upstreamTimeoutMs: 0,
    currentConfig: { logEnabled: false, logWriteMode: "all" },
    requestLifecycle: createLifecycle(),
  };
  const body = proxyService.buildManagedProxyResponseBody(execution, { response: upstream }, null);
  const reader = body.getReader();
  let bytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
  }
  return bytes;
}

function measureClassify(proxyService, config) {
  const cases = {
    classifyApiNs: "/Items/1/Images/Primary",
    classifyVideoNs: "/Videos/1/stream",
    classifyAudioNs: "/Audio/1/stream",
  };
  const result = {};
  for (const [key, proxyPath] of Object.entries(cases)) {
    const request = new Request(`https://worker.test/alpha${proxyPath}`);
    const requestUrl = new URL(request.url);
    for (let index = 0; index < 2000; index += 1)
      proxyService.classifyRequest(request, proxyPath, requestUrl, {});
    const start = hr();
    for (let index = 0; index < config.classifyIterations; index += 1)
      proxyService.classifyRequest(request, proxyPath, requestUrl, {});
    result[key] = Number(hr() - start) / config.classifyIterations;
  }
  return result;
}

function measureHeaders(proxyService, config) {
  const request = new Request("https://worker.test/alpha/Videos/1/stream?api_key=x");
  const response = new Response("x", {
    status: 200,
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": "4194304",
      "Cache-Control": "no-cache",
      ETag: '"abcdef"',
      Date: "Wed, 28 Oct 2026 12:00:00 GMT",
      Server: "Emby",
      "X-Powered-By": "ASP.NET",
      Connection: "keep-alive",
      "Keep-Alive": "timeout=5",
      "Transfer-Encoding": "chunked",
      TE: "trailers",
      Trailer: "X-Upstream",
      "Proxy-Connection": "keep-alive",
    },
  });
  const traits = { isBigStream: true };
  for (let index = 0; index < 2000; index += 1)
    proxyService.buildProxyResponseHeaders(response, request, {}, "*", traits, {});
  const start = hr();
  let headers = null;
  for (let index = 0; index < config.headerIterations; index += 1)
    headers = proxyService.buildProxyResponseHeaders(response, request, {}, "*", traits, {});
  const entries = [...headers];
  return {
    headerNs: Number(hr() - start) / config.headerIterations,
    headerCount: entries.length,
    headerWireBytes: entries.reduce(
      (total, [name, value]) => total + name.length + 2 + value.length + 2,
      0,
    ),
  };
}

async function measureTeeRetention(config) {
  const chunk = new Uint8Array(config.pumpChunkBytes);
  const bodyBytes = config.teeChunks * chunk.byteLength;
  const retained = async (cancelSecond) => {
    await new Promise((resolve) => setTimeout(resolve, 20));
    const before = process.memoryUsage().arrayBuffers;
    let sent = 0;
    const response = new Response(
      new ReadableStream({
        pull(controller) {
          controller.enqueue(chunk);
          sent += 1;
          if (sent === config.teeChunks) controller.close();
        },
      }),
      { status: 200 },
    );
    const clone = response.clone();
    const reader = response.body.getReader();
    while (!(await reader.read()).done);
    if (cancelSecond) await clone.body.cancel();
    await new Promise((resolve) => setTimeout(resolve, 20));
    const after = process.memoryUsage().arrayBuffers;
    reader.releaseLock();
    return Math.max(0, after - before);
  };
  return {
    teeBodyMiB: bodyBytes / 1048576,
    teeUnreadBranchMiB: (await retained(false)) / 1048576,
    teeCancelledBranchMiB: (await retained(true)) / 1048576,
  };
}

async function measureRound(proxyService, config) {
  const pumpStart = hr();
  let pumped = 0;
  for (let index = 0; index < config.pumpRuns; index += 1)
    pumped += await pumpOnce(proxyService, config);
  const pumpNs = Number(hr() - pumpStart) / config.pumpRuns;
  return {
    pumpNsPerChunk: pumpNs / config.pumpChunks,
    pumpMiBPerSecond: pumped / config.pumpRuns / 1048576 / (pumpNs / 1e9),
    ...measureClassify(proxyService, config),
    ...measureHeaders(proxyService, config),
  };
}

async function runSuite(workerDirectory, config) {
  const proxyService = await loadProxyService(workerDirectory);
  await measureRound(proxyService, config);
  const rounds = [];
  for (let index = 0; index < config.rounds; index += 1)
    rounds.push(await measureRound(proxyService, config));
  const merged = {};
  for (const key of Object.keys(rounds[0])) merged[key] = median(rounds.map((round) => round[key]));
  return merged;
}

// 把某个 rev 的 worker/ 抽到临时目录：worker 内部只有相对 import，不需要 node_modules。
async function materializeWorkerDirectory(rev) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "emby-bench-"));
  const listing = execFileSync(
    "git",
    ["-C", repositoryRoot, "ls-tree", "-r", "--name-only", rev, "worker"],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  for (const file of listing
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)) {
    const target = path.join(directory, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(
      target,
      execFileSync("git", ["-C", repositoryRoot, "show", `${rev}:${file}`], {
        maxBuffer: 64 * 1024 * 1024,
      }),
    );
  }
  return directory;
}

function formatDelta(current, baseline, betterDirection) {
  if (!baseline) return "";
  const delta = ((current - baseline) / baseline) * 100;
  const sign = delta > 0 ? "+" : "";
  const marker = Math.sign(delta) === betterDirection ? "改善" : delta === 0 ? "持平" : "回退";
  return `${sign}${delta.toFixed(1)}% ${marker}`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const current = await runSuite(repositoryRoot, options);
  const information = await measureTeeRetention(options);

  let baseline = null;
  if (options.baseline) {
    const directory = await materializeWorkerDirectory(options.baseline);
    try {
      baseline = await runSuite(directory, options);
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  }

  if (options.json) {
    console.log(JSON.stringify({ current, baseline, information }, null, 2));
    return;
  }

  const rows = NUMBER_COLUMNS.map(([key, label, betterDirection]) => [
    label,
    current[key].toFixed(1),
    baseline ? baseline[key].toFixed(1) : "-",
    formatDelta(current[key], baseline?.[key], betterDirection),
  ]);
  const width = (index) => Math.max(...rows.map((row) => row[index].length));
  const labels = ["指标", "当前", options.baseline ? options.baseline : "基线", "变化"];
  const widths = rows[0].map((_, index) => Math.max(width(index), labels[index].length));
  console.log(
    `[bench:stream] 四项流式指标（中位数，${options.rounds} 轮）· 只看百分比 · 仅供娱乐参考`,
  );
  console.log(labels.map((label, index) => label.padEnd(widths[index])).join("  "));
  for (const row of rows)
    console.log(row.map((cell, index) => cell.padEnd(widths[index])).join("  "));
  console.log(
    `[bench:stream] 参考：tee 未读分支保留 ${information.teeUnreadBranchMiB.toFixed(2)} MiB（body ${information.teeBodyMiB} MiB），取消后 ${information.teeCancelledBranchMiB.toFixed(2)} MiB`,
  );
}

await main();

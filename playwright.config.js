import { defineConfig, devices } from "@playwright/test";

// 与 frontend/.env.example 的默认管理员路径保持一致；架构文档里这是唯一入口。
const adminPath = "/admin";
const port = Number(process.env.E2E_PORT || 8787);
const adminPassword = process.env.E2E_ADMIN_PASS || "e2e-local-admin-pass";
const jwtSecret = process.env.E2E_JWT_SECRET || "e2e-local-jwt-secret";
// 本地 KV/D1 状态分区。清空动作放在 webServer 命令里执行：配置模块在 worker 进程里会再跑一遍，
// 那时 workerd 已经锁住 sqlite，删不掉。想续跑上一次状态就直接手动起 wrangler 再设 CI=0 复用。
const persistDirectory = ".wrangler/e2e";
// 每条命令前先清空状态分区，保证从空 KV/D1 开始（改前先看上面那段注释）。
const wranglerCommand = [
  `node -e "require('node:fs').rmSync('${persistDirectory}',{recursive:true,force:true})"`,
  "&&",
  "node node_modules/wrangler/bin/wrangler.js dev",
  "--config wrangler.e2e.toml",
  `--port ${port}`,
  `--persist-to ${persistDirectory}`,
  `--var ADMIN_PASS:${adminPassword}`,
  `--var JWT_SECRET:${jwtSecret}`,
].join(" ");

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  expect: { timeout: 20_000 },
  // 管理台是单 Worker + 单 KV/D1 状态分区，并发跑会互相污染日志与设置。
  workers: 1,
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: wranglerCommand,
    url: `http://127.0.0.1:${port}${adminPath}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "pipe",
  },
});

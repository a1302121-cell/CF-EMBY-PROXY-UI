import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// 手写 CSS 的颜色全部走 CSS 变量（--ui-c-* 调色板 / --d1-* 暖纸皮肤语义色）。
// 这里守两件在浏览器里会静默失效的事：
//   1. var() 引用了不存在的变量 —— 整条声明被丢弃，元素直接变透明或继承色，页面不报错。
//   2. 皮肤专属变量被用在不带 data-theme="claude" 的规则里 —— 经典皮肤下同样静默失效。

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatePath = path.join(repositoryRoot, "frontend", "admin-runtime.template.html");
const enhancementPath = path.join(
  repositoryRoot,
  "frontend",
  "scripts",
  "admin-runtime-enhancements.mjs",
);

async function loadStyleSheets() {
  const template = await readFile(templatePath, "utf8");
  const enhancement = await readFile(enhancementPath, "utf8");
  const inline = [...template.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(
    (match) => match[1],
  );
  // 增强脚本把自己的样式放在一个模板字符串里：`<style ...> ... </style>`
  const injected = enhancement.slice(
    enhancement.indexOf("`") + 1,
    enhancement.indexOf("</style>`"),
  );
  assert.ok(injected.length > 1000, "admin runtime enhancement style block not found");
  return [...inline, injected];
}

function collectRules(styleSheets) {
  const rules = [];
  for (const sheet of styleSheets) {
    for (const match of sheet.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
      rules.push({
        selector: match[1]
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .trim()
          .replace(/\s+/g, " "),
        body: match[2],
      });
    }
  }
  return rules;
}

const css = await loadStyleSheets();
const rules = collectRules(css);
const allCss = css.join("\n");

test("every var() reference resolves to a declared custom property", () => {
  const declared = new Set([...allCss.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((match) => match[1]));
  const missing = new Set();
  // 只有"没有兜底值"的 var() 才会在变量缺失时丢掉整条声明；带兜底的写法是安全的。
  for (const match of allCss.matchAll(/var\(\s*(--[a-z0-9-]+)\s*(?:,([^()]*))?\)/g)) {
    const name = match[1];
    // --tw-* 由 Tailwind 在运行时提供；带兜底的变量可以是 JS 在元素上临时写的。
    if (name.startsWith("--tw-") || declared.has(name) || match[2] !== undefined) continue;
    missing.add(name);
  }
  assert.deepEqual(
    [...missing].sort(),
    [],
    `undeclared CSS variables (the declaration that uses them is silently dropped): ${[...missing].join(", ")}`,
  );
});

test("claude-only tokens are only used inside data-theme=claude rules", () => {
  const leaks = [];
  for (const rule of rules) {
    if (!rule.body.includes("var(--d1-")) continue;
    if (/data-theme="claude"/.test(rule.selector)) continue;
    leaks.push(rule.selector.slice(0, 120));
  }
  assert.deepEqual(
    [...new Set(leaks)],
    [],
    "--d1-* is only defined under html[data-theme=claude]; using it elsewhere drops the declaration",
  );
});

test("palette tokens are only defined in the skin token blocks", () => {
  const allowedSelectors = new Set([
    ":root",
    'html[data-theme="claude"]',
    'html[data-theme="claude"].dark',
  ]);
  const strayDefinitions = [];
  for (const rule of rules) {
    if (
      !/(^|;)\s*--ui-(c-[a-z0-9-]+|surface-[a-z0-9-]+|border-[a-z0-9-]+|text-[a-z0-9-]+|shadow-[a-z0-9-]+)\s*:/.test(
        rule.body,
      )
    ) {
      continue;
    }
    if (allowedSelectors.has(rule.selector) || rule.selector.startsWith("@theme")) continue;
    strayDefinitions.push(rule.selector.slice(0, 120));
  }
  assert.deepEqual(
    [...new Set(strayDefinitions)],
    [],
    "palette tokens must be defined once in :root / html[data-theme=claude], not in a component rule",
  );
});

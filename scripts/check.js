import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { convertMcpTools, validateMcpTools } from "../src/converter.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const requiredFiles = [
  "README.md",
  "LICENSE",
  "package.json",
  "bin/mcp-tool-schema-lab.js",
  "src/converter.js",
  "src/render.js",
  "samples/mcp-tools.json",
  "samples/openai-tools.json",
  "docs/setup.md",
  "docs/schema-notes.md",
  "docs/utm-links.md",
  ".github/ISSUE_TEMPLATE/schema-fixture.yml",
  ".github/ISSUE_TEMPLATE/validator-gap.yml"
];

const riskyClaims = [
  /\bguaranteed\b/i,
  /\bfully compatible\b/i,
  /\bproduction ready\b/i,
  /\bofficial\b/i,
  /\bunlimited\b/i,
  /\bfree forever\b/i,
  /\bcomplete agent\b/i
];

const secretPatterns = [
  /sk-[A-Za-z0-9_-]{20,}/,
  /OPENAI_API_KEY\s*=/,
  /api[_-]?key["']?\s*[:=]\s*["'][A-Za-z0-9_-]{16,}/i,
  /password["']?\s*[:=]\s*["'][^"']{8,}/i
];

function main() {
  for (const file of requiredFiles) {
    assertFile(file);
  }

  const mcp = readJson("samples/mcp-tools.json");
  const expected = readJson("samples/openai-tools.json");
  const validation = validateMcpTools(mcp.tools);
  assert(validation.ok, `Expected MCP sample validation to pass: ${JSON.stringify(validation.issues)}`);

  const actual = convertMcpTools(mcp.tools);
  assert(deepEqual(actual, expected), "Converted OpenAI-style schema output does not match samples/openai-tools.json.");

  const markdown = execCli(["convert", "samples/mcp-tools.json", "--format", "markdown"]);
  assert(markdown.includes("# Converted OpenAI-Style Tool Schemas"), "Markdown convert output missing heading.");
  assert(markdown.includes("lookup_model_price"), "Markdown convert output missing fixture tool.");

  const json = execCli(["validate", "samples/mcp-tools.json", "--format", "json"]);
  assert(JSON.parse(json).ok === true, "JSON validate output should be ok.");

  const allText = allRepoText();
  assert(allText.includes("https://www.tken.shop/v1"), "Disclosed TKEN endpoint is required.");
  assert(allText.includes("utm_source=github"), "UTM CTA is required.");
  scan("secret", secretPatterns, allText);
  scan("risky claim", riskyClaims, allText);

  console.log("check ok");
}

function assertFile(file) {
  const path = join(root, file);
  try {
    assert(statSync(path).isFile(), `${file} must be a file.`);
  } catch {
    throw new Error(`Missing required file: ${file}`);
  }
}

function readJson(file) {
  return JSON.parse(readFileSync(join(root, file), "utf8"));
}

function execCli(args) {
  return execFileSync(process.execPath, [join(root, "bin/mcp-tool-schema-lab.js"), ...args], {
    cwd: root,
    encoding: "utf8"
  });
}

function allRepoText(dir = root) {
  let output = "";
  for (const name of readdirSync(dir)) {
    if ([".git", "node_modules"].includes(name)) {
      continue;
    }
    const path = join(dir, name);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      output += allRepoText(path);
    } else if (/\.(js|json|md|yml|yaml|txt|gitignore|LICENSE)$/i.test(name) || name === "LICENSE") {
      output += `\n--- ${relative(root, path)} ---\n${readFileSync(path, "utf8")}`;
    }
  }
  return output;
}

function scan(label, patterns, text) {
  for (const pattern of patterns) {
    assert(!pattern.test(text), `Found ${label} pattern: ${pattern}`);
  }
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

main();

#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { convertMcpTools, validateMcpTools } from "../src/converter.js";
import { renderJson, renderMarkdown } from "../src/render.js";

function printHelp() {
  console.log(`mcp-tool-schema-lab

Offline MCP tool schema converter and validator for OpenAI-style function calling experiments.

Usage:
  mcp-tool-schema-lab convert <file> [--format json|markdown]
  mcp-tool-schema-lab validate <file> [--format json|markdown]

Examples:
  mcp-tool-schema-lab convert samples/mcp-tools.json --format markdown
  mcp-tool-schema-lab validate samples/mcp-tools.json --format json
`);
}

function parseArgs(argv) {
  const [command, file, ...rest] = argv;
  const formatIndex = rest.indexOf("--format");
  const format = formatIndex >= 0 ? rest[formatIndex + 1] : "json";
  return { command, file, format };
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`Could not read JSON from ${path}: ${error.message}`);
  }
}

function main() {
  const { command, file, format } = parseArgs(process.argv.slice(2));
  if (!command || command === "--help" || command === "-h") {
    printHelp();
    return;
  }
  if (!["convert", "validate"].includes(command)) {
    throw new Error(`Unknown command: ${command}`);
  }
  if (!file) {
    throw new Error("A JSON file path is required.");
  }
  if (!["json", "markdown"].includes(format)) {
    throw new Error("--format must be json or markdown.");
  }

  const input = readJson(file);
  const tools = Array.isArray(input) ? input : input.tools;
  const validation = validateMcpTools(tools);
  const output = command === "convert"
    ? { validation, tools: convertMcpTools(tools) }
    : validation;

  process.stdout.write(format === "markdown" ? renderMarkdown(output) : renderJson(output));
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

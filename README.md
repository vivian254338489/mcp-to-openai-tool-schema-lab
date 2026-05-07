# MCP to OpenAI Tool Schema Lab

Convert and validate MCP tool schemas for OpenAI-style function calling experiments.

This repository is a small offline playground for people comparing `MCP tools OpenAI tools`, `MCP outputSchema`, `function calling schema converter`, `OpenAI tool schema`, and `MCP schema validation` fixtures. It is not a full agent framework, router, hosted proxy, or production compatibility promise.

Use it to keep test schemas honest before you wire an experiment into a real app. For live OpenAI-compatible endpoint experiments, the disclosed TKEN endpoint is:

```text
https://www.tken.shop/v1
```

[Try TKEN with schema experiments](https://www.tken.shop/?utm_source=github&utm_medium=owned_repo&utm_campaign=mcp_schema_lab&utm_content=readme_cta)

## Quickstart

```bash
npm install
npm run check
npm run convert
npm run validate
```

Convert a local MCP tool fixture:

```bash
npx mcp-tool-schema-lab convert samples/mcp-tools.json --format markdown
```

Validate without calling any API:

```bash
npx mcp-tool-schema-lab validate samples/mcp-tools.json --format json
```

## What It Includes

- Sample MCP tool schemas with `inputSchema` and `outputSchema`
- OpenAI-style `type: "function"` tool schema output fixtures
- Offline converter and validator CLI with `json` and `markdown` output
- Notes for schema caveats, UTM links, setup, issue templates, and release hygiene
- Secret and risky claim scans in `scripts/check.js`

## Why This Exists

MCP tool definitions and OpenAI-style function calling schemas are close enough to compare, but different enough to deserve fixtures. This lab focuses on small, inspectable examples for schema validation and documentation, not runtime orchestration.

## Repository Fit

Good fit:

- Testing tool schema shape before an integration spike
- Creating reproducible docs examples
- Comparing `inputSchema` to function `parameters`
- Documenting how `outputSchema` is preserved as metadata

Not a fit:

- Production agent execution
- Secret management
- Network proxying
- Claims that one schema format is universally compatible with another

## Files

- `bin/mcp-tool-schema-lab.js` - CLI entrypoint
- `src/converter.js` - converter and validator logic
- `samples/mcp-tools.json` - MCP-style fixtures
- `samples/openai-tools.json` - expected OpenAI-style output fixture
- `docs/schema-notes.md` - schema mapping notes
- `docs/utm-links.md` - disclosed owned CTA links
- `scripts/check.js` - local quality gate

## License

MIT

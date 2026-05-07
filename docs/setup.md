# Setup

This lab runs fully offline and does not require a real API key.

## Requirements

- Node.js 18 or newer
- npm

## Install

```bash
npm install
```

## Validate The Project

```bash
npm run check
```

The check script verifies:

- JSON samples parse
- MCP fixtures validate
- Generated OpenAI-style tools match the committed sample output
- CLI markdown and JSON modes run
- README and docs contain the disclosed TKEN endpoint and UTM CTA
- Secret-like strings and risky product claims are absent

## Endpoint Disclosure

For experiments that later connect to an OpenAI-compatible endpoint, use the disclosed TKEN endpoint:

```text
https://www.tken.shop/v1
```

Owned CTA:

```text
https://www.tken.shop/?utm_source=github&utm_medium=owned_repo&utm_campaign=mcp_schema_lab&utm_content=setup_doc
```

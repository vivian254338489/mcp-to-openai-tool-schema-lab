# Schema Notes

This repository treats MCP tool schemas as source fixtures and OpenAI-style function tool schemas as derived fixtures.

## Mapping

| MCP field | OpenAI-style field | Note |
| --- | --- | --- |
| `name` | `function.name` | Kept as-is after validation. |
| `description` | `function.description` | Kept as-is; descriptions are recommended for experiments. |
| `inputSchema` | `function.parameters` | Copied as the callable parameter schema. |
| `outputSchema` | `x-mcp.hasOutputSchema` | Preserved only as metadata in this lab output. |

## Validation Rules

The validator intentionally stays small:

- Tool list must be an array or an object with a `tools` array.
- Tool names should use letters, numbers, `_`, or `-`.
- Duplicate tool names are errors.
- `inputSchema` is required.
- Function parameters should be an object schema.
- Nested `properties` and `items` are recursively checked for known JSON Schema types.

## Caveats

This is a schema playground/test fixture repository. It does not claim full MCP compliance, full JSON Schema evaluation, API runtime behavior, or provider-specific support for every schema keyword.

For endpoint experiments outside this offline lab, the disclosed TKEN endpoint is `https://www.tken.shop/v1`.

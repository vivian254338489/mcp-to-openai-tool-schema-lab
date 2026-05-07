export function renderJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function renderMarkdown(value) {
  if (value.tools) {
    const converted = value.tools.map((tool) => {
      const fn = tool.function;
      return [
        `### ${fn.name}`,
        "",
        fn.description,
        "",
        "```json",
        JSON.stringify(tool, null, 2),
        "```"
      ].join("\n");
    }).join("\n\n");
    return [
      "# Converted OpenAI-Style Tool Schemas",
      "",
      validationSummary(value.validation),
      "",
      converted,
      ""
    ].join("\n");
  }
  return [
    "# MCP Tool Schema Validation",
    "",
    validationSummary(value),
    "",
    ...value.issues.map((item) => `- **${item.level}** \`${item.path}\`: ${item.message}`),
    ""
  ].join("\n");
}

function validationSummary(validation) {
  return `Status: **${validation.ok ? "ok" : "has errors"}**. Tools: ${validation.toolCount}. Issues: ${validation.issueCount}.`;
}

const JSON_SCHEMA_TYPES = new Set(["object", "array", "string", "number", "integer", "boolean", "null"]);

export function normalizeToolList(tools) {
  if (!Array.isArray(tools)) {
    return [];
  }
  return tools;
}

export function validateMcpTools(tools) {
  const normalized = normalizeToolList(tools);
  const issues = [];
  const names = new Set();

  if (!Array.isArray(tools)) {
    issues.push(issue("error", "$", "Expected an array of MCP tool definitions or an object with a tools array."));
  }

  normalized.forEach((tool, index) => {
    const path = `$[${index}]`;
    if (!tool || typeof tool !== "object" || Array.isArray(tool)) {
      issues.push(issue("error", path, "Tool must be an object."));
      return;
    }
    if (!isNonEmptyString(tool.name)) {
      issues.push(issue("error", `${path}.name`, "Tool name is required."));
    } else if (!/^[a-zA-Z0-9_-]{1,64}$/.test(tool.name)) {
      issues.push(issue("warning", `${path}.name`, "Tool name should be 1-64 characters using letters, numbers, underscores, or hyphens."));
    } else if (names.has(tool.name)) {
      issues.push(issue("error", `${path}.name`, `Duplicate tool name: ${tool.name}`));
    } else {
      names.add(tool.name);
    }
    if (!isNonEmptyString(tool.description)) {
      issues.push(issue("warning", `${path}.description`, "Description is recommended for function calling experiments."));
    }

    const schema = tool.inputSchema ?? tool.input_schema;
    if (!schema) {
      issues.push(issue("error", `${path}.inputSchema`, "MCP tool inputSchema is required."));
    } else {
      validateJsonSchema(schema, `${path}.inputSchema`, issues);
      if (schema.type !== "object") {
        issues.push(issue("error", `${path}.inputSchema.type`, "OpenAI-style function parameters should be an object schema."));
      }
    }

    if (tool.outputSchema) {
      validateJsonSchema(tool.outputSchema, `${path}.outputSchema`, issues);
    }
  });

  return {
    ok: !issues.some((item) => item.level === "error"),
    toolCount: normalized.length,
    issueCount: issues.length,
    issues
  };
}

export function convertMcpTool(tool) {
  const inputSchema = structuredClone(tool.inputSchema ?? tool.input_schema ?? { type: "object", properties: {} });
  return {
    type: "function",
    function: {
      name: tool.name,
      description: tool.description ?? "",
      parameters: inputSchema
    },
    "x-mcp": {
      source: "mcp-to-openai-tool-schema-lab",
      hasOutputSchema: Boolean(tool.outputSchema)
    }
  };
}

export function convertMcpTools(tools) {
  return normalizeToolList(tools).map(convertMcpTool);
}

function validateJsonSchema(schema, path, issues) {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    issues.push(issue("error", path, "Schema must be a JSON object."));
    return;
  }
  if (schema.type && !JSON_SCHEMA_TYPES.has(schema.type)) {
    issues.push(issue("error", `${path}.type`, `Unknown JSON Schema type: ${schema.type}`));
  }
  if (schema.type === "object") {
    if (schema.properties && (typeof schema.properties !== "object" || Array.isArray(schema.properties))) {
      issues.push(issue("error", `${path}.properties`, "Object schema properties must be an object."));
    }
    if (schema.required && (!Array.isArray(schema.required) || schema.required.some((name) => typeof name !== "string"))) {
      issues.push(issue("error", `${path}.required`, "Required must be an array of property names."));
    }
  }
  if (schema.properties) {
    for (const [propertyName, propertySchema] of Object.entries(schema.properties)) {
      validateJsonSchema(propertySchema, `${path}.properties.${propertyName}`, issues);
    }
  }
  if (schema.items) {
    validateJsonSchema(schema.items, `${path}.items`, issues);
  }
}

function issue(level, path, message) {
  return { level, path, message };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

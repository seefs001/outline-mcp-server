#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

// Import tool definitions utility
import { getToolDefinitions } from './utils/listTools.js';
import { registerTools } from './utils/importTools.js';

// Dynamically import all tool files
await registerTools();

const toolDefinitions = getToolDefinitions();
console.log(
  '\n',
  `loaded ${Object.keys(toolDefinitions).length} tools`,
  JSON.stringify(Object.keys(toolDefinitions)),
  '\n'
);

const server = new Server(
  {
    name: 'outline-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: Object.entries(toolDefinitions).reduce(
        (acc, [name, definition]) => {
          acc[name] = true;
          return acc;
        },
        {} as Record<string, boolean>
      ),
    },
  }
);

// Register request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: Object.keys(toolDefinitions),
}));

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { params } = request;
  const toolName = params.name;
  const parameters = params.arguments || {};

  const toolDefinition = toolDefinitions[toolName];

  try {
    // Check if the tool is supported
    if (!toolDefinition) {
      return {
        error: { code: ErrorCode.InvalidRequest, message: `Tool ${toolName} not supported` },
      };
    }

    // Call the handler with the provided parameters
    const result = await toolDefinition.handler(parameters);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    if (error instanceof McpError) {
      return { error: { code: error.code, message: error.message } };
    }
    return { error: { code: ErrorCode.InternalError, message: (error as Error).message } };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('Outline MCP server running on stdio');
}

main().catch(error => {
  console.error('Server error:', error);
  process.exit(1);
});

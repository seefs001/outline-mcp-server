import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { ListCollectionsArgs } from '../types.js';
import { outlineClient } from '../client.js';
import { registerTool } from '../utils/listTools.js';

// Register this tool
registerTool<ListCollectionsArgs>({
  name: 'list_collections',
  description: 'List all collections in the Outline workspace',
  inputSchema: {
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of collections to return (optional)',
      },
      offset: {
        type: 'number',
        description: 'Pagination offset (optional)',
      },
      sort: {
        type: 'string',
        description: 'Field to sort by (e.g., "updatedAt") (optional)',
      },
      direction: {
        type: 'string',
        description: 'Sort direction, either "ASC" or "DESC" (optional)',
        enum: ['ASC', 'DESC'],
      },
      query: {
        type: 'string',
        description: 'Filter results by collection name (optional)',
      },
      statusFilter: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['archived'], // Based on spec
        },
        description: 'Filter by collection status (e.g., ["archived"]) (optional)',
      },
    },
    type: 'object',
  },
  handler: async function handleListCollections(args: ListCollectionsArgs) {
    try {
      const payload: Record<string, any> = {};

      if (args.limit !== undefined) {
        payload.limit = args.limit;
      }
      if (args.offset !== undefined) {
        payload.offset = args.offset;
      }
      if (args.sort) {
        payload.sort = args.sort;
      }
      if (args.direction) {
        payload.direction = args.direction;
      }
      if (args.query) {
        payload.query = args.query;
      }
      if (args.statusFilter) {
        payload.statusFilter = args.statusFilter;
      }

      const response = await outlineClient.post('/collections.list', payload);
      // Spec returns { data: [Collection], pagination: Pagination, policies: [Policy] }
      // Returning only data for now, consistent with previous implementation.
      // Consider returning pagination and policies if needed later.
      return response.data.data;
    } catch (error: any) {
      console.error('Error listing collections:', error.message);
      throw new McpError(ErrorCode.InvalidRequest, error.message);
    }
  },
});

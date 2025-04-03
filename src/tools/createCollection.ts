import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { CreateCollectionArgs } from '../types.js';
import { outlineClient } from '../client.js';
import { registerTool } from '../utils/listTools.js';

// Register this tool
registerTool<CreateCollectionArgs>({
  name: 'create_collection',
  description: 'Create a new collection',
  inputSchema: {
    properties: {
      name: {
        type: 'string',
        description: 'Title of the collection',
      },
      description: {
        type: 'string',
        description: 'Content of the collection in markdown format',
      },
      permission: {
        type: 'string',
        description: 'Permission level for the collection',
        enum: ['read', 'read_write'],
      },
      color: {
        type: 'string',
        description: 'Hex color code for the collection',
      },
      private: {
        type: 'boolean',
        description: 'Whether this collection is private',
      },
    },
    required: ['name'],
    type: 'object',
  },
  handler: async function handleCreateCollection(args: CreateCollectionArgs) {
    try {
      const payload: Record<string, any> = {
        name: args.name,
      };

      if (args.description !== undefined) {
        payload.description = args.description;
      }

      if (args.permission !== undefined) {
        payload.permission = args.permission;
      }

      if (args.color !== undefined) {
        payload.color = args.color;
      }

      if (args.private !== undefined) {
        payload.private = args.private;
      }

      const response = await outlineClient.post('/collections.create', payload);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating collection:', error.message);
      throw new McpError(ErrorCode.InvalidRequest, error.message);
    }
  },
});

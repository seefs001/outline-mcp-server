import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { GetDocumentArgs } from '../types.js';
import { outlineClient } from '../client.js';
import { registerTool } from '../utils/listTools.js';

// Register this tool
registerTool<GetDocumentArgs>({
  name: 'get_document',
  description: 'Get details about a specific document. At least id XOR shareId are required.',
  inputSchema: {
    properties: {
      id: {
        type: 'string',
        description:
          'Unique identifier for the document. Either the UUID or the urlId is acceptable. One of id or shareId must be provided.',
      },
      shareId: { // Added shareId
        type: 'string',
        description: 'Unique identifier for a document share. One of id or shareId must be provided.',
        format: 'uuid',
      },
    },
    // No required fields at the schema level, validation happens in handler
    type: 'object',
  },
  handler: async function handleGetDocument(args: GetDocumentArgs) {
    // Ensure at least one identifier is provided
    if (!args.id && !args.shareId) {
      throw new McpError(ErrorCode.InvalidRequest, 'Either id or shareId must be provided.');
    }

    try {
      // Construct payload based on provided arguments
      const payload: Record<string, any> = {};
      if (args.id) {
        payload.id = args.id;
      }
      if (args.shareId) {
        payload.shareId = args.shareId;
      }

      const response = await outlineClient.post('/documents.info', payload);
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting document:', error.message);
      throw new McpError(ErrorCode.InvalidRequest, error.message);
    }
  },
});

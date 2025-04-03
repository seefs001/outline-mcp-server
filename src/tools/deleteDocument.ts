import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { DeleteDocumentArgs } from '../types.js';
import { outlineClient } from '../client.js';
import { registerTool } from '../utils/listTools.js';

// Register this tool
registerTool<DeleteDocumentArgs>({
  name: 'delete_document',
  description: 'Delete a document',
  inputSchema: {
    properties: {
      id: {
        type: 'string',
        description: 'ID of the document to delete. Either the UUID or the urlId is acceptable.',
      },
      permanent: {
        type: 'boolean',
        description: 'If true, permanently delete the document instead of moving to trash.',
        default: false,
      },
    },
    required: ['id'],
    type: 'object',
  },
  handler: async function handleDeleteDocument(args: DeleteDocumentArgs) {
    try {
      const payload: Record<string, any> = {
        id: args.id,
      };
      if (args.permanent !== undefined) {
        payload.permanent = args.permanent;
      }
      const response = await outlineClient.post('/documents.delete', payload);
      return response.data.success;
    } catch (error: any) {
      console.error('Error deleting document:', error.message);
      throw new McpError(ErrorCode.InvalidRequest, error.message);
    }
  },
});

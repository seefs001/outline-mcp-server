import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { UpdateDocumentArgs } from '../types.js';
import { outlineClient } from '../client.js';
import { registerTool } from '../utils/listTools.js';

// Register this tool
registerTool<UpdateDocumentArgs>({
  name: 'update_document',
  description: 'Update an existing document',
  inputSchema: {
    properties: {
      id: { // Renamed from documentId
        type: 'string',
        description: 'Unique identifier for the document. Either the UUID or the urlId is acceptable.',
      },
      title: {
        type: 'string',
        description: 'New title for the document',
      },
      text: {
        type: 'string',
        description: 'New content for the document in markdown format',
      },
      append: { // Added append property
        type: 'boolean',
        description: 'If true the text field will be appended to the end of the existing document, rather than the default behavior of replacing it.',
      },
      publish: {
        type: 'boolean',
        description: 'Whether to publish the document',
      },
      done: {
        type: 'boolean',
        description: 'Whether the document is marked as done',
      },
    },
    required: ['id'], // Changed from documentId
    type: 'object',
  },
  handler: async function handleUpdateDocument(args: UpdateDocumentArgs) {
    try {
      const payload: Record<string, any> = {
        id: args.id, // Changed from documentId
      };

      if (args.title !== undefined) {
        payload.title = args.title;
      }

      if (args.text !== undefined) {
        payload.text = args.text;
      }

      // Handle append property
      if (args.append !== undefined) {
        payload.append = args.append;
      }

      if (args.publish !== undefined) {
        payload.publish = args.publish;
      }

      if (args.done !== undefined) {
        payload.done = args.done;
      }

      const response = await outlineClient.post('/documents.update', payload);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating document:', error.message);
      throw new McpError(ErrorCode.InvalidRequest, error.message);
    }
  },
});

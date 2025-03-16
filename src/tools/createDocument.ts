import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { outlineClient } from '../client.js';
import { CreateDocumentArgs } from '../types.js';
import { registerTool } from '../utils/listTools.js';

// Register this tool
registerTool<CreateDocumentArgs>({
  name: 'create_document',
  description: 'Create a new document',
  inputSchema: {
    properties: {
      title: {
        type: 'string',
        description: 'Title of the document',
      },
      text: {
        type: 'string',
        description: 'Content of the document in markdown format',
      },
      collectionId: {
        type: 'string',
        description: 'ID of the collection to add the document to',
      },
      parentDocumentId: {
        type: 'string',
        description: 'ID of the parent document (if creating a nested document)',
      },
      publish: {
        type: 'boolean',
        default: true,
        description: 'Whether to publish the document immediately',
      },
      template: {
        type: 'boolean',
        description: 'Whether this document is a template',
      },
    },
    required: ['title', 'text', 'collectionId'],
    type: 'object',
  },
  handler: async function handleCreateDocument(args: CreateDocumentArgs) {
    try {
      const payload: Record<string, any> = {
        title: args.title,
        text: args.text,
        collectionId: args.collectionId,
      };

      if (args.parentDocumentId) {
        payload.parentDocumentId = args.parentDocumentId;
      }

      if (args.publish !== undefined) {
        payload.publish = args.publish ?? true;
      }

      if (args.template !== undefined) {
        payload.template = args.template;
      }

      const response = await outlineClient.post('/documents', payload);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating document:', error.message);
      throw new McpError(ErrorCode.InvalidRequest, error.message);
    }
  },
});

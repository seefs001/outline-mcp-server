import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { CreateDocumentArgs } from '../types.js';
import { outlineClient } from '../client.js';
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
        example: 'Welcome to Acme Inc',
      },
      text: {
        type: 'string',
        description: 'The body of the document in markdown', // Updated description
      },
      collectionId: {
        type: 'string',
        description: 'Identifier for the associated collection.', // Updated description
        format: 'uuid',
      },
      parentDocumentId: {
        type: 'string',
        description: 'Identifier for the document this is a child of, if any.', // Updated description
        format: 'uuid',
      },
      templateId: { // Added templateId as per spec
        type: 'string',
        description: 'Unique identifier for the template this document was created from, if any',
        format: 'uuid',
      },
      template: {
        type: 'boolean',
        description: 'Whether this document should be considered to be a template.', // Updated description
      },
      publish: {
        type: 'boolean',
        description: 'Whether this document should be immediately published and made visible to other team members.', // Updated description
      },
    },
    required: ['title', 'collectionId'], // Removed 'text' from required
    type: 'object',
  },
  handler: async function handleCreateDocument(args: CreateDocumentArgs) {
    try {
      const payload: Record<string, any> = {
        title: args.title,
        collectionId: args.collectionId,
      };

      // Add optional fields only if they exist
      if (args.text !== undefined) {
        payload.text = args.text;
      }

      if (args.parentDocumentId) {
        payload.parentDocumentId = args.parentDocumentId;
      }

      if (args.publish !== undefined) {
        payload.publish = args.publish ?? true;
      }

      if (args.template !== undefined) {
        payload.template = args.template;
      }

      if (args.templateId) {
        payload.templateId = args.templateId;
      }

      // Use the correct endpoint from the spec
      const response = await outlineClient.post('/documents.create', payload);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating document:', error.message);
      throw new McpError(ErrorCode.InvalidRequest, error.message);
    }
  },
});

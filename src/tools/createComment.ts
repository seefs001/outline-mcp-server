import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { CreateCommentArgs } from '../types.js';
import { outlineClient } from '../client.js';
import { registerTool } from '../utils/listTools.js';

// Register this tool
registerTool<CreateCommentArgs>({
  name: 'create_comment',
  description: 'Create a new comment on a document',
  inputSchema: {
    properties: {
      documentId: {
        type: 'string',
        description: 'Identifier for the document this is related to.',
      },
      text: {
        type: 'string',
        description: 'The body of the comment in markdown.',
      },
      parentCommentId: {
        type: 'string',
        description: 'Identifier for the comment this is a child of, if any.',
      },
      data: {
        type: 'object',
        description: 'The editor data representing this comment.',
      },
    },
    required: ['documentId'], // text is optional according to spec
    type: 'object',
  },
  handler: async function handleCreateComment(args: CreateCommentArgs) {
    try {
      const payload: Record<string, any> = {
        documentId: args.documentId,
      };

      // Add optional fields only if they exist
      if (args.text !== undefined) {
        payload.text = args.text;
      }

      if (args.parentCommentId) {
        payload.parentCommentId = args.parentCommentId;
      }

      if (args.data) {
        payload.data = args.data;
      }

      const response = await outlineClient.post('/comments.create', payload);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating comment:', error.message);
      throw new McpError(ErrorCode.InvalidRequest, error.message);
    }
  },
});

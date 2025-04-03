import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { CreateCommentArgs } from '../types.js';
import { outlineClient } from '../client.js';
import { registerTool } from '../utils/listTools.js';

// Define the wrapped argument type inline
type WrappedCreateCommentArgs = { content: [CreateCommentArgs] };

// Register this tool
registerTool<WrappedCreateCommentArgs>({ // Use the wrapped type here
  name: 'create_comment',
  description: 'Create a new comment on a document',
  inputSchema: {
    type: 'object',
    properties: {
      content: {
        type: 'array',
        items: {
          type: 'object',
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
        },
        minItems: 1,
        maxItems: 1,
      },
    },
    required: ['content'],
  },
  handler: async function handleCreateComment(wrappedArgs: WrappedCreateCommentArgs) {
    try {
      // Extract the actual arguments from the wrapped structure
      const args = wrappedArgs.content[0];
      if (!args) {
        throw new McpError(ErrorCode.InvalidParams, 'Missing arguments in content array');
      }

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

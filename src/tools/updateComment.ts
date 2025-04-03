import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { UpdateCommentArgs } from '../types.js';
import { outlineClient } from '../client.js';
import { registerTool } from '../utils/listTools.js';

// Register this tool
registerTool<UpdateCommentArgs>({
  name: 'update_comment',
  description: 'Update an existing comment',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'ID of the comment to update',
      },
      data: {
        type: 'object',
        description: 'The editor data representing this comment.',
      },
    },
    required: ['id', 'data'], // data is required by the API spec
  },
  handler: async function handleUpdateComment(args: UpdateCommentArgs) {
    try {
      // Ensure data is provided as it's required by the type and API
      if (args.data === undefined) {
        throw new McpError(ErrorCode.InvalidParams, 'Missing required argument: data');
      }

      const payload: Record<string, any> = {
        id: args.id,
        data: args.data, // data is required
      };

      const response = await outlineClient.post('/comments.update', payload);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating comment:', error.message);
      throw new McpError(ErrorCode.InvalidRequest, `Failed to update comment: ${error.message}`);
    }
  },
});

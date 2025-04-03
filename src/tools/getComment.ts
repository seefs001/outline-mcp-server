import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { GetCommentArgs } from '../types.js';
import { outlineClient } from '../client.js';
import { registerTool } from '../utils/listTools.js';

registerTool<GetCommentArgs>({
    name: 'get_comment',
    description: 'Retrieve a specific comment by its ID',
    inputSchema: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                description: 'Unique identifier for the comment.',
            },
            includeAnchorText: {
                type: 'boolean',
                description: 'Include the document text that the comment is anchored to, if any.',
            },
        },
        required: ['id'],
    },
    handler: async function handleGetComment(args: GetCommentArgs) {
        try {
            const payload: Record<string, any> = {
                id: args.id,
            };

            if (args.includeAnchorText !== undefined) {
                payload.includeAnchorText = args.includeAnchorText;
            }

            const response = await outlineClient.post('/comments.info', payload);
            return response.data.data;
        } catch (error: any) {
            console.error('Error retrieving comment:', error.message);
            // Throw InvalidRequest for any client-side error from the API
            throw new McpError(ErrorCode.InvalidRequest, `Failed to retrieve comment: ${error.message}`);
        }
    },
});

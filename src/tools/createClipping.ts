import { CreateClippingInput, CreateClippingOutput } from '../types.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { outlineClient } from '../client.js';
import { registerTool } from '../utils/listTools.js';

// registerTool only expects the Input type argument
registerTool<CreateClippingInput>({
    name: "createClipping",
    description: "Creates a new clipping document directly within a specified collection.",
    inputSchema: {
        type: "object",
        properties: {
            title: { type: "string", description: "The title of the clipping" },
            content: { type: "string", description: "The content of the clipping" },
            collectionId: { type: "string", description: "The ID of the collection to create the clipping in" },
        },
        required: ["title", "content", "collectionId"],
    },
    outputSchema: {
        type: "object",
        properties: {
            documentId: { type: "string", description: "The ID of the created clipping document" },
            collectionId: { type: "string", description: "The ID of the collection the clipping was created in" },
        },
        required: ["documentId", "collectionId"],
    },
    handler: async (args: CreateClippingInput): Promise<CreateClippingOutput> => {
        const { title, content, collectionId } = args;

        // Validate collection exists (optional but good practice)
        try {
            await outlineClient.post('/collections.info', { id: collectionId });
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new McpError(ErrorCode.InvalidParams, `Collection with ID ${collectionId} not found.`);
            }
            console.error(`Error validating collection ${collectionId}:`, error.message);
            // Proceed cautiously if validation fails for other reasons
        }

        // Create the clipping document directly in the specified collection
        try {
            const newClippingDoc = await outlineClient.post('/documents.create', {
                collectionId: collectionId,
                // No parentDocumentId needed for top-level in collection
                title: title,
                text: content,
                publish: true, // Assuming clippings should be published by default
            });

            if (!newClippingDoc.data?.data?.id) {
                throw new Error("Failed to create clipping document, API returned no data or ID.");
            }

            return {
                documentId: newClippingDoc.data.data.id,
                collectionId: collectionId, // Return the collection ID used
            };
        } catch (error: any) {
            console.error(`Error creating clipping document "${title}" in collection ${collectionId}:`, error.message);
            throw new McpError(ErrorCode.InternalError, `Failed to create clipping document: ${error.message}`);
        }
    },
});

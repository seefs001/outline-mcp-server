import { CreateClippingInput, CreateClippingOutput } from '../types.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { outlineClient } from '../client.js';
import { registerTool } from '../utils/listTools.js';

const DEFAULT_CLIPPING_COLLECTION_ID = "7232dc22-92c8-423f-9a35-62b69c39bfd9";

// registerTool only expects the Input type argument
registerTool<CreateClippingInput>({
    name: "createClipping",
    description: "Creates a new clipping document directly within a specified collection. Defaults to the designated clipping collection if no ID is provided.",
    inputSchema: {
        type: "object",
        properties: {
            title: { type: "string", description: "The title of the clipping" },
            content: { type: "string", description: "The content of the clipping" },
            collectionId: { type: "string", description: `Optional ID of the collection to create the clipping in. Defaults to ${DEFAULT_CLIPPING_COLLECTION_ID}` },
        },
        required: ["title", "content"], // collectionId is now optional
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
        // Use provided collectionId or the default
        const targetCollectionId = args.collectionId || DEFAULT_CLIPPING_COLLECTION_ID;
        const { title, content } = args;


        // Validate collection exists (optional but good practice)
        try {
            await outlineClient.post('/collections.info', { id: targetCollectionId });
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new McpError(ErrorCode.InvalidParams, `Collection with ID ${targetCollectionId} not found.`);
            }
            console.error(`Error validating collection ${targetCollectionId}:`, error.message);
            // Proceed cautiously if validation fails for other reasons
        }

        // Create the clipping document directly in the specified collection
        try {
            const newClippingDoc = await outlineClient.post('/documents.create', {
                collectionId: targetCollectionId,
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
                collectionId: targetCollectionId, // Return the actual collection ID used
            };
        } catch (error: any) {
            console.error(`Error creating clipping document "${title}" in collection ${targetCollectionId}:`, error.message);
            throw new McpError(ErrorCode.InternalError, `Failed to create clipping document: ${error.message}`);
        }
    },
});

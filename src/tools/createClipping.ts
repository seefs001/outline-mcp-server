import { CreateClippingInput, CreateClippingOutput } from '../types.js'; // Import types
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { outlineClient } from '../client.js';
import { registerTool } from '../utils/listTools.js';

const COLLECTION_ID = "7232dc22-92c8-423f-9a35-62b69c39bfd9";

// registerTool only expects the Input type argument
registerTool<CreateClippingInput>({
    name: "createClipping",
    description: "Creates a new clipping document under a specific date document within a designated collection.",
    inputSchema: {
        type: "object",
        properties: {
            title: { type: "string", description: "The title of the clipping" },
            content: { type: "string", description: "The content of the clipping" },
            date: {
                type: "string",
                description: "Optional date for the clipping (YYYY-MM-DD format). Defaults to the current date.",
                pattern: "^\\d{4}-\\d{2}-\\d{2}$" // Basic validation for date format
            },
        },
        required: ["title", "content"], // date is optional
    },
    outputSchema: {
        type: "object",
        properties: {
            documentId: { type: "string", description: "The ID of the created clipping document" },
            dateDocumentId: { type: "string", description: "The ID of the parent date document" },
        },
        required: ["documentId", "dateDocumentId"],
    },
    handler: async (args: CreateClippingInput): Promise<CreateClippingOutput> => {
        const { title, content, date } = args;
        // Use provided date or default to today
        const dateString = date || new Date().toISOString().split('T')[0];

        let dateDocumentId: string | undefined;

        // 1. Check if the date document exists
        try {
            const existingDateDocs = await outlineClient.post('/documents.list', {
                collectionId: COLLECTION_ID,
                title: dateString,
            });

            if (existingDateDocs.data?.data && existingDateDocs.data.data.length > 0) {
                dateDocumentId = existingDateDocs.data.data[0].id;
            }
        } catch (error: any) {
            console.error(`Error checking for date document ${dateString}:`, error.message);
            // Don't throw here, proceed to create if not found
        }

        // 2. Create the date document if it doesn't exist
        if (!dateDocumentId) {
            try {
                const newDateDoc = await outlineClient.post('/documents.create', {
                    collectionId: COLLECTION_ID,
                    title: dateString,
                    text: `# ${dateString}\n\nClippings for this date.`,
                    publish: true,
                });
                if (!newDateDoc.data?.data?.id) {
                    throw new Error("Failed to create date document, API returned no data or ID.");
                }
                dateDocumentId = newDateDoc.data.data.id;
            } catch (error: any) {
                console.error(`Error creating date document ${dateString}:`, error.message);
                throw new McpError(ErrorCode.InternalError, `Failed to create date document: ${error.message}`);
            }
        }

        // 3. Create the clipping document
        try {
            // Ensure dateDocumentId is assigned before proceeding
            if (typeof dateDocumentId !== 'string') {
                throw new McpError(ErrorCode.InternalError, "Failed to determine date document ID before creating clipping.");
            }

            const newClippingDoc = await outlineClient.post('/documents.create', {
                collectionId: COLLECTION_ID,
                parentDocumentId: dateDocumentId,
                title: title,
                text: content,
                publish: true,
            });
            if (!newClippingDoc.data?.data?.id) {
                throw new Error("Failed to create clipping document, API returned no data or ID.");
            }

            return {
                documentId: newClippingDoc.data.data.id,
                dateDocumentId: dateDocumentId,
            };
        } catch (error: any) {
            console.error(`Error creating clipping document "${title}":`, error.message);
            throw new McpError(ErrorCode.InternalError, `Failed to create clipping document: ${error.message}`);
        }
    },
});

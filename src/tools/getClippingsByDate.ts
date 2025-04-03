import { Document, GetClippingsByDateInput, GetClippingsByDateOutput } from '../types.js'; // Import types
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { outlineClient } from '../client.js';
import { registerTool } from '../utils/listTools.js';

const COLLECTION_ID = "7232dc22-92c8-423f-9a35-62b69c39bfd9";

registerTool<GetClippingsByDateInput>({
    name: "getClippingsByDate",
    description: "Retrieves all clipping documents for a specific date within the designated collection.",
    inputSchema: {
        type: "object",
        properties: {
            date: {
                type: "string",
                description: "The date to retrieve clippings for (YYYY-MM-DD format).",
                pattern: "^\\d{4}-\\d{2}-\\d{2}$" // Basic validation for date format
            },
        },
        required: ["date"],
    },
    // Output schema definition is implicitly handled by the handler's return type Promise<GetClippingsByDateOutput>
    // but we can define it for clarity if needed, though registerTool might not use it.
    // outputSchema: { ... }
    handler: async (args: GetClippingsByDateInput): Promise<GetClippingsByDateOutput> => {
        const { date } = args;
        let dateDocumentId: string | undefined;

        // 1. Find the date document
        try {
            const existingDateDocs = await outlineClient.post('/documents.list', {
                collectionId: COLLECTION_ID,
                title: date, // Use the input date as the title to find the parent
            });

            if (existingDateDocs.data?.data && existingDateDocs.data.data.length > 0) {
                dateDocumentId = existingDateDocs.data.data[0].id;
            } else {
                // If no date document found for that day, there are no clippings
                return { clippings: [] };
            }
        } catch (error: any) {
            console.error(`Error finding date document ${date}:`, error.message);
            throw new McpError(ErrorCode.InternalError, `Failed to find date document: ${error.message}`);
        }

        // 2. List documents with the date document as parent
        try {
            const clippingDocs = await outlineClient.post('/documents.list', {
                collectionId: COLLECTION_ID, // Clippings are in the main collection
                parentDocumentId: dateDocumentId,
                // Add other params like limit if needed, default might be small
                limit: 100, // Example: Get up to 100 clippings for the day
            });

            // Ensure the response structure is as expected and data exists
            const clippings = clippingDocs.data?.data ?? [];

            // We might need to map the result if the API response structure
            // doesn't exactly match the 'Document' type from types.ts.
            // Assuming direct compatibility for now.
            return { clippings: clippings as Document[] };

        } catch (error: any) {
            console.error(`Error listing clippings for date ${date} (parent ${dateDocumentId}):`, error.message);
            throw new McpError(ErrorCode.InternalError, `Failed to list clippings: ${error.message}`);
        }
    },
});

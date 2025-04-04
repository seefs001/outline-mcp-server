import { Document, GetClippingsInput, GetClippingsOutput } from '../types.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { outlineClient } from '../client.js';
import { registerTool } from '../utils/listTools.js';

const DEFAULT_CLIPPING_COLLECTION_ID = "7232dc22-92c8-423f-9a35-62b69c39bfd9";

registerTool<GetClippingsInput>({
    name: "getClippings",
    description: "Retrieves clipping documents from a specified collection (defaults to the designated clipping collection if no ID is provided), optionally filtering by date.",
    inputSchema: {
        type: "object",
        properties: {
            collectionId: {
                type: "string",
                description: `Optional ID of the collection to retrieve clippings from. Defaults to ${DEFAULT_CLIPPING_COLLECTION_ID}`
            },
            date: {
                type: "string",
                description: "Optional date to filter clippings by (YYYY-MM-DD format). If omitted, returns all clippings in the collection.",
                pattern: "^\\d{4}-\\d{2}-\\d{2}$" // Basic validation for date format
            },
        },
        required: [], // collectionId is now optional
    },
    outputSchema: {
        type: "object",
        properties: {
            clippings: {
                type: "array",
                items: {
                    // Define the structure of a Document object here if needed for strict validation
                    // For now, relying on the TypeScript type 'Document'
                    type: "object"
                },
                description: "An array of clipping documents found."
            }
        },
        required: ["clippings"]
    },
    handler: async (args: GetClippingsInput): Promise<GetClippingsOutput> => {
        // Use provided collectionId or the default
        const targetCollectionId = args.collectionId || DEFAULT_CLIPPING_COLLECTION_ID;
        const { date } = args;

        try {
            // Fetch all documents in the specified collection.
            // Note: This might need pagination for large collections.
            // Outline's default limit is 25, max is 100. Fetching all might require multiple requests.
            // For simplicity, let's fetch up to 100 for now.
            const response = await outlineClient.post('/documents.list', {
                collectionId: targetCollectionId,
                limit: 100, // Adjust limit as needed or implement pagination
                // We cannot filter by date directly via API for createdAt, so we fetch and filter manually
            });

            let allDocs = response.data?.data ?? [];

            // Filter by date if provided
            let filteredClippings: Document[];
            if (date) {
                filteredClippings = allDocs.filter((doc: Document) => {
                    // Extract YYYY-MM-DD from the document's createdAt timestamp
                    const docDate = doc.createdAt.split('T')[0];
                    return docDate === date;
                });
            } else {
                // If no date is provided, return all documents fetched
                filteredClippings = allDocs;
            }

            // Assuming the structure matches the 'Document' type
            return { clippings: filteredClippings as Document[] };

        } catch (error: any) {
            // Handle potential 404 for collection not found
            if (error.response?.status === 404) {
                // Use InvalidParams as NotFound is not available in McpError codes
                throw new McpError(ErrorCode.InvalidParams, `Collection with ID ${targetCollectionId} not found.`);
            }
            console.error(`Error listing documents for collection ${targetCollectionId}:`, error.message);
            throw new McpError(ErrorCode.InternalError, `Failed to list documents: ${error.message}`);
        }
    },
});

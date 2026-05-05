/**
 * MCP Tool: search-memories
 * Semantic search across the user's memory bank.
 * Accepts a natural language query, generates an embedding, and returns
 * the most similar memories ranked by cosine similarity.
 */
import type Database from "better-sqlite3";
export interface SearchMemoriesParams {
    query: string;
    userId: string;
    limit?: number;
}
export interface SearchMemoriesResult {
    results: Array<{
        id: string;
        title: string;
        score: number;
        date?: string;
        type?: string;
        tags?: string | null;
        therapeuticTag?: string | null;
        locationName?: string | null;
    }>;
    query: string;
    count: number;
}
export declare function searchMemories(db: Database.Database, params: SearchMemoriesParams): Promise<SearchMemoriesResult>;
//# sourceMappingURL=search-memories.d.ts.map
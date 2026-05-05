/**
 * Vector similarity search over SQLite-stored embeddings.
 * Uses brute-force cosine similarity (fast enough for <10k memories).
 */
import type Database from "better-sqlite3";
interface VectorSearchResult {
    id: string;
    title: string;
    score: number;
    [key: string]: unknown;
}
/**
 * Search memories by semantic similarity to a query embedding.
 * Returns the top-K results sorted by cosine similarity.
 */
export declare function vectorSearch(db: Database.Database, queryEmbedding: Float32Array, userId: string, topK?: number, minScore?: number): VectorSearchResult[];
export {};
//# sourceMappingURL=vector-search.d.ts.map
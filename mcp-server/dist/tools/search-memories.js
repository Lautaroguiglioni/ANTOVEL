import { getEmbedding } from "../embeddings/embedder.js";
import { vectorSearch } from "../embeddings/vector-search.js";
export async function searchMemories(db, params) {
    const { query, userId, limit = 5 } = params;
    // Generate embedding for the search query
    const queryEmbedding = await getEmbedding(query);
    // Perform vector search
    const results = vectorSearch(db, queryEmbedding, userId, limit);
    return {
        results,
        query,
        count: results.length,
    };
}
//# sourceMappingURL=search-memories.js.map
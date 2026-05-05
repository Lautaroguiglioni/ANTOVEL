/**
 * MCP Tool: search-memories
 * Semantic search across the user's memory bank.
 * Accepts a natural language query, generates an embedding, and returns
 * the most similar memories ranked by cosine similarity.
 */
import type Database from "better-sqlite3"
import { getEmbedding } from "../embeddings/embedder.js"
import { vectorSearch } from "../embeddings/vector-search.js"

export interface SearchMemoriesParams {
  query: string
  userId: string
  limit?: number
}

export interface SearchMemoriesResult {
  results: Array<{
    id: string
    title: string
    score: number
    date?: string
    type?: string
    tags?: string | null
    therapeuticTag?: string | null
    locationName?: string | null
  }>
  query: string
  count: number
}

export async function searchMemories(
  db: Database.Database,
  params: SearchMemoriesParams,
): Promise<SearchMemoriesResult> {
  const { query, userId, limit = 5 } = params

  // Generate embedding for the search query
  const queryEmbedding = await getEmbedding(query)

  // Perform vector search
  const results = vectorSearch(db, queryEmbedding, userId, limit)

  return {
    results,
    query,
    count: results.length,
  }
}

/**
 * Vector similarity search over SQLite-stored embeddings.
 * Uses brute-force cosine similarity (fast enough for <10k memories).
 */
import type Database from "better-sqlite3"
import { deserializeEmbedding } from "./embedder.js"

interface VectorSearchResult {
  id: string
  title: string
  score: number
  [key: string]: unknown
}

/**
 * Cosine similarity between two Float32Arrays.
 */
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

/**
 * Search memories by semantic similarity to a query embedding.
 * Returns the top-K results sorted by cosine similarity.
 */
export function vectorSearch(
  db: Database.Database,
  queryEmbedding: Float32Array,
  userId: string,
  topK: number = 5,
  minScore: number = 0.3,
): VectorSearchResult[] {
  // Fetch all memories with embeddings for this user
  const rows = db
    .prepare(
      `SELECT id, title, date, type, tags, therapeutic_tag, location_name, embedding
       FROM memories
       WHERE user_id = ? AND embedding IS NOT NULL`,
    )
    .all(userId) as Array<{
    id: string
    title: string
    date: string
    type: string
    tags: string | null
    therapeutic_tag: string | null
    location_name: string | null
    embedding: Buffer
  }>

  // Score each memory
  const scored: VectorSearchResult[] = []
  for (const row of rows) {
    const memEmbedding = deserializeEmbedding(row.embedding)
    const score = cosineSimilarity(queryEmbedding, memEmbedding)
    if (score >= minScore) {
      scored.push({
        id: row.id,
        title: row.title,
        date: row.date,
        type: row.type,
        tags: row.tags,
        therapeuticTag: row.therapeutic_tag,
        locationName: row.location_name,
        score: Math.round(score * 1000) / 1000,
      })
    }
  }

  // Sort by score descending, take top K
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK)
}

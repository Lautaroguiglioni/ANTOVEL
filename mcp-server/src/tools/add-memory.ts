/**
 * MCP Tool: add-memory
 * Persists a new memory to the SQLite database and generates its
 * semantic embedding for future search. Returns the created memory ID.
 */
import type Database from "better-sqlite3"
import { randomUUID } from "node:crypto"
import { getEmbedding, serializeEmbedding } from "../embeddings/embedder.js"

export interface AddMemoryParams {
  userId: string
  type: "photo" | "audio" | "video" | "note"
  title: string
  date: string
  description?: string
  tags?: string[]
  locationName?: string
  locationLat?: number
  locationLng?: number
  color?: string
  therapeuticTag?: string
  source?: string
  donorName?: string
  donorRelation?: string
  injectionNote?: string
  isFamilyDonation?: boolean
  duration?: string
  mediaUrl?: string
  thumbnailUrl?: string
}

export interface AddMemoryResult {
  id: string
  embedded: boolean
}

export async function addMemory(
  db: Database.Database,
  params: AddMemoryParams,
): Promise<AddMemoryResult> {
  const id = randomUUID()

  // Generate embedding from title + description + tags
  const embeddingText = [
    params.title,
    params.description || "",
    ...(params.tags || []),
    params.locationName || "",
  ]
    .filter(Boolean)
    .join(" ")

  let embeddingBlob: Buffer | null = null
  let embedded = false
  try {
    const embedding = await getEmbedding(embeddingText)
    embeddingBlob = serializeEmbedding(embedding)
    embedded = true
  } catch (err) {
    console.error("[antovel-mcp] Failed to generate embedding:", err)
  }

  db.prepare(
    `INSERT INTO memories (
      id, user_id, type, title, date, description, tags,
      location_name, location_lat, location_lng, color,
      therapeutic_tag, source, donor_name, donor_relation,
      injection_note, is_family_donation, duration,
      media_url, thumbnail_url, embedding
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?
    )`,
  ).run(
    id,
    params.userId,
    params.type,
    params.title,
    params.date,
    params.description || null,
    params.tags ? JSON.stringify(params.tags) : null,
    params.locationName || null,
    params.locationLat ?? null,
    params.locationLng ?? null,
    params.color || null,
    params.therapeuticTag || null,
    params.source || "self",
    params.donorName || null,
    params.donorRelation || null,
    params.injectionNote || null,
    params.isFamilyDonation ? 1 : 0,
    params.duration || null,
    params.mediaUrl || null,
    params.thumbnailUrl || null,
    embeddingBlob,
  )

  return { id, embedded }
}

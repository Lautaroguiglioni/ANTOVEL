import { randomUUID } from "node:crypto";
import { getEmbedding, serializeEmbedding } from "../embeddings/embedder.js";
export async function addMemory(db, params) {
    const id = randomUUID();
    // Generate embedding from title + description + tags
    const embeddingText = [
        params.title,
        params.description || "",
        ...(params.tags || []),
        params.locationName || "",
    ]
        .filter(Boolean)
        .join(" ");
    let embeddingBlob = null;
    let embedded = false;
    try {
        const embedding = await getEmbedding(embeddingText);
        embeddingBlob = serializeEmbedding(embedding);
        embedded = true;
    }
    catch (err) {
        console.error("[antovel-mcp] Failed to generate embedding:", err);
    }
    db.prepare(`INSERT INTO memories (
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
    )`).run(id, params.userId, params.type, params.title, params.date, params.description || null, params.tags ? JSON.stringify(params.tags) : null, params.locationName || null, params.locationLat ?? null, params.locationLng ?? null, params.color || null, params.therapeuticTag || null, params.source || "self", params.donorName || null, params.donorRelation || null, params.injectionNote || null, params.isFamilyDonation ? 1 : 0, params.duration || null, params.mediaUrl || null, params.thumbnailUrl || null, embeddingBlob);
    return { id, embedded };
}
//# sourceMappingURL=add-memory.js.map
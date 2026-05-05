/**
 * Local embedding generation using @xenova/transformers.
 * Uses the all-MiniLM-L6-v2 model (384 dimensions, ~23MB).
 * The model is downloaded and cached on first use.
 */
/**
 * Generate a 384-dimensional embedding for a given text.
 * Returns a Float32Array suitable for SQLite BLOB storage.
 */
export declare function getEmbedding(text: string): Promise<Float32Array>;
/**
 * Serialize a Float32Array to a Buffer for SQLite BLOB storage.
 */
export declare function serializeEmbedding(embedding: Float32Array): Buffer;
/**
 * Deserialize a SQLite BLOB back into a Float32Array.
 */
export declare function deserializeEmbedding(blob: Buffer): Float32Array;
//# sourceMappingURL=embedder.d.ts.map
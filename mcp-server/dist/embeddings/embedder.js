/**
 * Local embedding generation using @xenova/transformers.
 * Uses the all-MiniLM-L6-v2 model (384 dimensions, ~23MB).
 * The model is downloaded and cached on first use.
 */
let pipeline = null;
async function getPipeline() {
    if (pipeline)
        return pipeline;
    // Dynamic import to avoid issues with ESM/CJS
    const { pipeline: createPipeline } = await import("@xenova/transformers");
    pipeline = await createPipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
        // Use quantized model for faster inference
        quantized: true,
    });
    console.error("[antovel-mcp] Embedding model loaded: all-MiniLM-L6-v2");
    return pipeline;
}
/**
 * Generate a 384-dimensional embedding for a given text.
 * Returns a Float32Array suitable for SQLite BLOB storage.
 */
export async function getEmbedding(text) {
    const pipe = await getPipeline();
    const output = await pipe(text, { pooling: "mean", normalize: true });
    return new Float32Array(output.data);
}
/**
 * Serialize a Float32Array to a Buffer for SQLite BLOB storage.
 */
export function serializeEmbedding(embedding) {
    return Buffer.from(embedding.buffer);
}
/**
 * Deserialize a SQLite BLOB back into a Float32Array.
 */
export function deserializeEmbedding(blob) {
    return new Float32Array(blob.buffer, blob.byteOffset, blob.byteLength / 4);
}
//# sourceMappingURL=embedder.js.map
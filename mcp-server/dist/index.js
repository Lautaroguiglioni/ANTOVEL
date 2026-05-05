/**
 * Antovel MCP Server — Entry Point
 *
 * Exposes 5 tools via the Model Context Protocol (stdio transport):
 *   1. search_memories  — Semantic search across memory bank
 *   2. get_essence       — Retrieve patient's Essence Document
 *   3. add_memory        — Persist a new memory with auto-embedding
 *   4. daily_prompt      — Generate a therapeutic training prompt
 *   5. train_from_answer — Record and evaluate patient response
 *
 * The server runs as a background agent. It's invisible to the user —
 * the brain UI and voice assistant consume it via MCP calls.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeDatabase } from "./db/migrations.js";
import { searchMemories } from "./tools/search-memories.js";
import { getEssence } from "./tools/get-essence.js";
import { addMemory } from "./tools/add-memory.js";
import { generateDailyPrompt } from "./tools/daily-prompt.js";
import { trainFromAnswer } from "./tools/train-from-answer.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
// ── Initialize database ────────────────────────────────────────────────────
const DB_PATH = join(__dirname, "..", "data", "antovel.db");
const db = initializeDatabase(DB_PATH);
// ── Create MCP Server ──────────────────────────────────────────────────────
const server = new McpServer({
    name: "antovel-mcp",
    version: "0.1.0",
});
// ── Tool 1: search_memories ────────────────────────────────────────────────
server.tool("search_memories", "Search the user's memory bank using semantic similarity. Returns the most relevant memories for a natural language query like 'viajes con familia' or 'recuerdos de la infancia'.", {
    query: z.string().describe("Natural language search query"),
    userId: z.string().describe("User/patient ID"),
    limit: z.number().optional().default(5).describe("Max results to return"),
}, async ({ query, userId, limit }) => {
    const result = await searchMemories(db, { query, userId, limit });
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
});
// ── Tool 2: get_essence ────────────────────────────────────────────────────
server.tool("get_essence", "Retrieve the Essence Document for a patient — their identity affirmation, key people, life timeline, daily anchors, and reminiscence prompts. Used by caregivers and the AI assistant.", {
    patientId: z.string().describe("Patient ID"),
}, async ({ patientId }) => {
    const result = getEssence(db, { patientId });
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
});
// ── Tool 3: add_memory ─────────────────────────────────────────────────────
server.tool("add_memory", "Persist a new memory to the brain. Automatically generates a semantic embedding for future search. Use this when the user uploads a photo, records audio, or writes a note.", {
    userId: z.string().describe("User/patient ID"),
    type: z.enum(["photo", "audio", "video", "note"]).describe("Memory type"),
    title: z.string().describe("Memory title"),
    date: z.string().describe("ISO date (yyyy-mm-dd)"),
    description: z.string().optional().describe("Detailed description"),
    tags: z.array(z.string()).optional().describe("Tags/categories"),
    locationName: z.string().optional().describe("Location name"),
    locationLat: z.number().optional().describe("Latitude"),
    locationLng: z.number().optional().describe("Longitude"),
    therapeuticTag: z.string().optional().describe("Therapeutic tag: identity|family_bond|life_milestone|happy_place|daily_anchor|sensory"),
    source: z.string().optional().default("self").describe("Memory source: self|family|caregiver"),
    donorName: z.string().optional().describe("Family donor name (for donations)"),
    donorRelation: z.string().optional().describe("Donor relation to patient"),
    injectionNote: z.string().optional().describe("Note attached to a family donation"),
    isFamilyDonation: z.boolean().optional().default(false),
    duration: z.string().optional().describe("Duration for audio/video (e.g. '3:22')"),
}, async (params) => {
    const result = await addMemory(db, params);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
});
// ── Tool 4: daily_prompt ───────────────────────────────────────────────────
server.tool("daily_prompt", "Generate a therapeutic daily prompt for Alzheimer memory training. Selects the most relevant memory based on training history and the patient's current emotional state. Lights up the corresponding brain node.", {
    patientId: z.string().describe("Patient ID"),
    currentState: z
        .enum(["calm", "agitated", "confused", "happy"])
        .optional()
        .default("calm")
        .describe("Patient's current emotional state"),
}, async ({ patientId, currentState }) => {
    const result = generateDailyPrompt(db, { patientId, currentState });
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
});
// ── Tool 5: train_from_answer ──────────────────────────────────────────────
server.tool("train_from_answer", "Record a patient's response to a training prompt. Tracks whether they recalled the memory, their confidence level, and generates a recommendation for future training frequency.", {
    memoryId: z.string().describe("ID of the memory being trained"),
    prompt: z.string().describe("The prompt that was asked"),
    patientResponse: z.string().describe("What the patient answered"),
    recalled: z.boolean().describe("Whether the patient recalled the memory"),
    confidence: z.number().min(0).max(100).describe("Confidence level 0-100"),
}, async (params) => {
    const result = trainFromAnswer(db, params);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
});
// ── Start server ───────────────────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[antovel-mcp] Server started on stdio transport");
    console.error("[antovel-mcp] Available tools: search_memories, get_essence, add_memory, daily_prompt, train_from_answer");
}
main().catch((err) => {
    console.error("[antovel-mcp] Fatal error:", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map
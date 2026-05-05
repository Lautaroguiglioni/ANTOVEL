/**
 * MCP Tool: daily-prompt
 * Heart of the Alzheimer memory training system.
 * Selects the most therapeutically relevant memory that hasn't been
 * practiced recently, and generates a natural language prompt.
 * Adapts to the patient's current emotional state.
 */
import type Database from "better-sqlite3";
export interface DailyPromptParams {
    patientId: string;
    currentState?: "calm" | "agitated" | "confused" | "happy";
}
export interface DailyPromptResult {
    prompt: string;
    memoryId: string;
    memoryTitle: string;
    expectedAnswer: string;
    therapeuticGoal: string;
    hint?: string;
    brainNodeHighlight: string;
}
export declare function generateDailyPrompt(db: Database.Database, params: DailyPromptParams): DailyPromptResult;
//# sourceMappingURL=daily-prompt.d.ts.map
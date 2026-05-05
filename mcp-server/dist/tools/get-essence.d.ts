/**
 * MCP Tool: get-essence
 * Returns the EssenceDocument for a patient — the structured summary
 * of their identity, key people, lifeline, daily anchors, and
 * reminiscence prompts used by caregivers and the AI assistant.
 */
import type Database from "better-sqlite3";
export interface GetEssenceParams {
    patientId: string;
}
export interface EssenceResult {
    found: boolean;
    essence: {
        patientName: string;
        identityAffirmation: string;
        keyPeople: Array<{
            name: string;
            relation: string;
            description: string;
        }>;
        lifeline: Array<{
            year: number;
            event: string;
            linkedMemoryId?: string;
        }>;
        dailyAnchors: string[];
        reminiscencePrompts: Array<{
            prompt: string;
            linkedMemoryId: string;
            therapeuticGoal: string;
        }>;
        emergencyContact: {
            name: string;
            phone: string;
            relation: string;
        } | null;
        lastUpdatedBy: string;
        lastUpdatedAt: string;
    } | null;
}
export declare function getEssence(db: Database.Database, params: GetEssenceParams): EssenceResult;
//# sourceMappingURL=get-essence.d.ts.map
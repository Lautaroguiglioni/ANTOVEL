/**
 * MCP Tool: add-memory
 * Persists a new memory to the SQLite database and generates its
 * semantic embedding for future search. Returns the created memory ID.
 */
import type Database from "better-sqlite3";
export interface AddMemoryParams {
    userId: string;
    type: "photo" | "audio" | "video" | "note";
    title: string;
    date: string;
    description?: string;
    tags?: string[];
    locationName?: string;
    locationLat?: number;
    locationLng?: number;
    color?: string;
    therapeuticTag?: string;
    source?: string;
    donorName?: string;
    donorRelation?: string;
    injectionNote?: string;
    isFamilyDonation?: boolean;
    duration?: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
}
export interface AddMemoryResult {
    id: string;
    embedded: boolean;
}
export declare function addMemory(db: Database.Database, params: AddMemoryParams): Promise<AddMemoryResult>;
//# sourceMappingURL=add-memory.d.ts.map
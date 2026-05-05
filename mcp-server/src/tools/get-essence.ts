/**
 * MCP Tool: get-essence
 * Returns the EssenceDocument for a patient — the structured summary
 * of their identity, key people, lifeline, daily anchors, and
 * reminiscence prompts used by caregivers and the AI assistant.
 */
import type Database from "better-sqlite3"

export interface GetEssenceParams {
  patientId: string
}

export interface EssenceResult {
  found: boolean
  essence: {
    patientName: string
    identityAffirmation: string
    keyPeople: Array<{ name: string; relation: string; description: string }>
    lifeline: Array<{ year: number; event: string; linkedMemoryId?: string }>
    dailyAnchors: string[]
    reminiscencePrompts: Array<{ prompt: string; linkedMemoryId: string; therapeuticGoal: string }>
    emergencyContact: { name: string; phone: string; relation: string } | null
    lastUpdatedBy: string
    lastUpdatedAt: string
  } | null
}

export function getEssence(
  db: Database.Database,
  params: GetEssenceParams,
): EssenceResult {
  const { patientId } = params

  const row = db
    .prepare(`SELECT * FROM essence_documents WHERE patient_id = ? ORDER BY updated_at DESC LIMIT 1`)
    .get(patientId) as any

  if (!row) {
    return { found: false, essence: null }
  }

  return {
    found: true,
    essence: {
      patientName: row.patient_name || "",
      identityAffirmation: row.identity_affirmation || "",
      keyPeople: JSON.parse(row.key_people || "[]"),
      lifeline: JSON.parse(row.lifeline || "[]"),
      dailyAnchors: JSON.parse(row.daily_anchors || "[]"),
      reminiscencePrompts: JSON.parse(row.reminiscence_prompts || "[]"),
      emergencyContact: row.emergency_contact ? JSON.parse(row.emergency_contact) : null,
      lastUpdatedBy: row.updated_by || "",
      lastUpdatedAt: row.updated_at || "",
    },
  }
}

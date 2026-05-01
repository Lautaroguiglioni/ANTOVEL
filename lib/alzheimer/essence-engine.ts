import type {
  EssenceDocument,
  EssencePrompt,
  MemoryExtended,
  TherapeuticTag,
} from "@/lib/types"

/**
 * The "essence engine" is the heart of the reminiscence experience.
 * It selects which prompts to surface for a given session, formats
 * the identity affirmation for voice output, and merges therapy memory
 * sources into a single feed.
 */

export const TAG_LABEL: Record<TherapeuticTag, string> = {
  identity: "Identidad",
  family_bond: "Vínculo familiar",
  happy_place: "Lugar feliz",
  life_milestone: "Hito de vida",
  daily_anchor: "Ancla cotidiana",
  sensory: "Sensorial",
}

export const TAG_COLOR: Record<TherapeuticTag, string> = {
  identity: "#FCD34D", // dorado — quién soy
  family_bond: "#F472B6", // rosa — vínculo
  happy_place: "#A78BFA", // lila — lugar feliz
  life_milestone: "#FB923C", // naranja — hitos
  daily_anchor: "#34D399", // verde — rutina
  sensory: "#60A5FA", // celeste — sentidos
}

/**
 * Select N reminiscence prompts for a session.
 * Heuristic: rotate through tags so we never read the same therapeutic
 * goal twice in a row, prioritizing prompts whose linked memory is "active".
 */
export function selectSessionPrompts(
  doc: EssenceDocument,
  donations: MemoryExtended[],
  count = 3,
): EssencePrompt[] {
  const activeIds = new Set(
    donations
      .filter((m) => (m.injectionStatus ?? "active") === "active")
      .map((m) => m.id),
  )

  const pool = doc.reminiscencePrompts.filter((p) => activeIds.has(p.linkedMemoryId))
  const fallback = doc.reminiscencePrompts

  // Deterministic shuffle: rotate by current day so the patient gets a
  // gentle daily rotation but it's stable inside a session.
  const seed = new Date().getDate()
  const source = pool.length >= count ? pool : fallback
  const out: EssencePrompt[] = []
  for (let i = 0; i < Math.min(count, source.length); i++) {
    out.push(source[(seed + i) % source.length])
  }
  return out
}

/**
 * Format the identity affirmation as a friendly opening greeting,
 * read aloud by the voice assistant.
 */
export function buildOpeningGreeting(doc: EssenceDocument): string {
  const hour = new Date().getHours()
  const part = hour < 12 ? "Buen día" : hour < 19 ? "Buenas tardes" : "Buenas noches"
  return `${part}, ${doc.patientName}. ${doc.identityAffirmation}`
}

/** Build a full reminiscence script (greeting + prompts + closing). */
export function buildReminiscenceScript(
  doc: EssenceDocument,
  prompts: EssencePrompt[],
): string {
  const lines: string[] = []
  lines.push(buildOpeningGreeting(doc))
  lines.push("")
  for (const p of prompts) {
    lines.push(p.prompt)
  }
  lines.push("")
  lines.push(`Si necesitás algo, llamá a ${doc.emergencyContact.name}.`)
  return lines.join(" ")
}

/** Lookup a donated memory by id from a flat list. */
export function findDonation(
  donations: MemoryExtended[],
  memoryId: string | undefined,
): MemoryExtended | undefined {
  if (!memoryId) return undefined
  return donations.find((m) => m.id === memoryId)
}

/** Active donations only — what the patient currently sees in their brain. */
export function activeDonations(donations: MemoryExtended[]): MemoryExtended[] {
  return donations.filter((m) => (m.injectionStatus ?? "active") === "active")
}

/** Pending donations — awaiting caregiver approval. */
export function pendingDonations(donations: MemoryExtended[]): MemoryExtended[] {
  return donations.filter((m) => m.injectionStatus === "pending")
}

/** Format a relative date label like "hace 2 días" / "hoy". */
export function relativeDate(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)))
  if (diff === 0) return "hoy"
  if (diff === 1) return "ayer"
  if (diff < 7) return `hace ${diff} días`
  if (diff < 30) return `hace ${Math.floor(diff / 7)} semanas`
  if (diff < 365) return `hace ${Math.floor(diff / 30)} meses`
  return `hace ${Math.floor(diff / 365)} años`
}

// Shared TypeScript types for Antovel.

export type Purpose =
  | "memories"
  | "share-family"
  | "leave-mark"
  | "wellness"
  | "explore-history"
  | "discover-patterns"

export type Privacy = "private" | "contacts" | "public"

export interface AntovelProfile {
  // Personal data
  name: string
  birthDate?: string // ISO yyyy-mm-dd
  age?: number // derived from birthDate
  city?: string
  pronouns?: string
  avatarUrl?: string // data URL (base64) when uploaded

  // Purpose
  purposes: Purpose[] // min 1, max 3

  // Privacy
  privacy: Privacy

  // Meta
  createdAt: string // ISO datetime
  onboardingCompleted: boolean
}

export interface OnboardingState {
  step: number // 0..3
  profile: Partial<AntovelProfile>
}

/* ─────────────────────────────────────
   Phase 1 — Legacy Brain
   ───────────────────────────────────── */

export type MemoryType = "photo" | "audio" | "video" | "note"

export interface MemoryLocation {
  lat: number
  lng: number
  name: string
}

export interface Memory {
  id: string
  type: MemoryType
  date: string // ISO yyyy-mm-dd
  title: string
  tags: string[]
  location: MemoryLocation | null
  thumbnailUrl?: string
  duration?: string // for audio/video
  description?: string
  color: string // hex, derived from type
}

export interface Connection {
  from: string // memory id
  to: string // memory id
  daysDiff: number
}

/* ─────────────────────────────────────
   Phase 2 — Health & Avatar
   ───────────────────────────────────── */

export type HealthState = "radiant" | "good" | "regular" | "exhausted"

export interface HealthMetrics {
  steps: number
  stepsGoal: number
  sleepHours: number
  sleepMinutes: number
  sleepQuality: "optimal" | "good" | "poor"
  heartRate: number
  heartRateZone: "rest" | "light" | "moderate" | "intense"
  stressLevel: number // 0–100
  lastStressUpdate: string // ISO datetime
  // Historical data for mini-charts
  sleepHistory: number[] // last 7 days in hours
  heartRateHistory: number[] // last 7 readings
}

export interface HealthData extends HealthMetrics {
  healthScore: number // 0–100
  state: HealthState
  stepsTrend: number // % vs yesterday (can be negative)
}

/* ─────────────────────────────────────
   Alzheimer module — additive extensions
   (do NOT remove or rename existing fields)
   ───────────────────────────────────── */

export type AntovelRole =
  | "owner"
  | "family_member"
  | "caregiver"
  | "caregiver_secondary"

export type AppMode =
  | "personal"
  | "alzheimer_patient"
  | "alzheimer_family"
  | "alzheimer_caregiver"

export interface AlzheimerConfig {
  patientName: string
  patientId: string
  myRole: AntovelRole
  diagnosisYear?: number
  primaryContactName: string
  primaryContactPhone: string
}

/** Optional Alzheimer fields layered on top of AntovelProfile. */
export interface AntovelProfileExtended extends AntovelProfile {
  appMode?: AppMode
  alzheimerConfig?: AlzheimerConfig
}

export type TherapeuticTag =
  | "identity"
  | "family_bond"
  | "happy_place"
  | "life_milestone"
  | "daily_anchor"
  | "sensory"

export type MemorySource = "self" | "family" | "caregiver" | "ai_extracted"
export type InjectionStatus = "pending" | "approved" | "active"

/** Memory with optional Alzheimer/donation metadata layered on top. */
export interface MemoryExtended extends Memory {
  source?: MemorySource
  injectionStatus?: InjectionStatus
  donorName?: string
  donorRelation?: string
  injectionNote?: string
  therapeuticTag?: TherapeuticTag
  isFamilyDonation?: boolean
}

export interface EssencePerson {
  name: string
  relation: string
  description: string
  avatarColor: string
}

export interface EssenceLifelineEvent {
  year: number
  event: string
  linkedMemoryId?: string
}

export interface EssencePrompt {
  prompt: string
  linkedMemoryId: string
  therapeuticGoal: string
}

export interface EssenceEmergencyContact {
  name: string
  phone: string
  relation: string
}

export interface EssenceDocument {
  patientName: string
  identityAffirmation: string
  keyPeople: EssencePerson[]
  lifeline: EssenceLifelineEvent[]
  dailyAnchors: string[]
  reminiscencePrompts: EssencePrompt[]
  emergencyContact: EssenceEmergencyContact
  lastUpdatedBy: string
  lastUpdatedAt: string
}

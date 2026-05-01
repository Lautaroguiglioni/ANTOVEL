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

// Shared TypeScript types for Antovel — Phase 0 onboarding model.

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

// Shared TypeScript types for Antovel

export type LegacyIntent =
  | "memories"
  | "health"
  | "wisdom"
  | "family"
  | "creative"

export interface AntovelProfile {
  // Identity
  name: string
  pronouns?: string
  // Origin
  birthDate?: string // ISO yyyy-mm-dd
  birthPlace?: string
  // Intent
  intents: LegacyIntent[]
  // Meta
  createdAt: string // ISO datetime
  onboardingCompleted: boolean
}

export interface OnboardingState {
  step: number // 0..3
  profile: Partial<AntovelProfile>
}

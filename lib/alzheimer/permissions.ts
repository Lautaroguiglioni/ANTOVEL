import type { AntovelRole, AppMode } from "@/lib/types"

/**
 * Permissions matrix for the Alzheimer module.
 * Single source of truth for "who can do what" — the UI reads these,
 * never hardcodes role checks.
 */

export interface RoleCapabilities {
  /** Full read of memories, brain, health, and essence. */
  canViewBrain: boolean
  /** Add memories tagged as their own. */
  canCreateMemory: boolean
  /** Submit a memory donation that will be reviewed/auto-approved by a caregiver. */
  canDonateMemory: boolean
  /** Approve pending donations and activate them in the patient brain. */
  canApproveDonations: boolean
  /** Read & edit the EssenceDocument (the reminiscence "script"). */
  canEditEssence: boolean
  /** Read the EssenceDocument (everyone in family circle can read). */
  canReadEssence: boolean
  /** Use the spoken-voice assistant aimed at the patient. */
  canUseVoiceAssistant: boolean
  /** See the family/caregiver coordination portal. */
  canSeeFamilyPortal: boolean
  /** Toggle Alzheimer mode for the household. */
  canToggleAlzheimerMode: boolean
}

const NONE: RoleCapabilities = {
  canViewBrain: false,
  canCreateMemory: false,
  canDonateMemory: false,
  canApproveDonations: false,
  canEditEssence: false,
  canReadEssence: false,
  canUseVoiceAssistant: false,
  canSeeFamilyPortal: false,
  canToggleAlzheimerMode: false,
}

const ROLE_CAPS: Record<AntovelRole, RoleCapabilities> = {
  /** Owner = patient or self-managing user. Can do everything except approve their
   *  own donations (a caregiver auto-approves on their behalf). */
  owner: {
    ...NONE,
    canViewBrain: true,
    canCreateMemory: true,
    canEditEssence: true,
    canReadEssence: true,
    canUseVoiceAssistant: true,
    canSeeFamilyPortal: true,
    canToggleAlzheimerMode: true,
  },
  /** Family — can donate memories, read the essence, but not edit or approve. */
  family_member: {
    ...NONE,
    canDonateMemory: true,
    canReadEssence: true,
    canSeeFamilyPortal: true,
  },
  /** Primary caregiver — approves donations, edits essence, reads everything. */
  caregiver: {
    ...NONE,
    canViewBrain: true,
    canDonateMemory: true,
    canApproveDonations: true,
    canEditEssence: true,
    canReadEssence: true,
    canUseVoiceAssistant: true,
    canSeeFamilyPortal: true,
    canToggleAlzheimerMode: true,
  },
  /** Secondary caregiver — read-only of essence, can donate, can't approve. */
  caregiver_secondary: {
    ...NONE,
    canViewBrain: true,
    canDonateMemory: true,
    canReadEssence: true,
    canSeeFamilyPortal: true,
  },
}

export function capabilitiesFor(role: AntovelRole | undefined): RoleCapabilities {
  if (!role) return NONE
  return ROLE_CAPS[role]
}

/** Map an AppMode to the role the active session represents. */
export function roleFromMode(mode: AppMode | undefined): AntovelRole | undefined {
  switch (mode) {
    case "personal":
    case "alzheimer_patient":
      return "owner"
    case "alzheimer_family":
      return "family_member"
    case "alzheimer_caregiver":
      return "caregiver"
    default:
      return undefined
  }
}

export const ROLE_LABEL: Record<AntovelRole, string> = {
  owner: "Tu cuenta",
  family_member: "Familiar",
  caregiver: "Cuidador principal",
  caregiver_secondary: "Cuidador de apoyo",
}

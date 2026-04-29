"use client"

import { useCallback, useEffect, useState } from "react"
import type { AntovelProfile, Privacy } from "@/lib/types"

const STORAGE_KEY = "antovel_profile"
export const TOTAL_STEPS = 4

/** Compute integer age from an ISO yyyy-mm-dd birthdate. */
export function calculateAge(isoDate: string): number {
  const today = new Date()
  const birth = new Date(isoDate)
  if (Number.isNaN(birth.getTime())) return 0
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return Math.max(0, age)
}

export function loadProfile(): AntovelProfile | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AntovelProfile
  } catch {
    return null
  }
}

export function saveProfile(profile: AntovelProfile) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export function clearProfile() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(STORAGE_KEY)
}

const DEFAULT_PRIVACY: Privacy = "private"

export function useOnboarding() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<"forward" | "back">("forward")
  const [profile, setProfile] = useState<Partial<AntovelProfile>>({
    purposes: [],
    privacy: DEFAULT_PRIVACY,
  })
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const existing = loadProfile()
    if (existing) {
      setProfile(existing)
    }
    setHydrated(true)
  }, [])

  const update = useCallback((patch: Partial<AntovelProfile>) => {
    setProfile((prev) => {
      const merged = { ...prev, ...patch }
      // Auto-derive age when birthDate changes
      if (patch.birthDate !== undefined && patch.birthDate) {
        merged.age = calculateAge(patch.birthDate)
      }
      return merged
    })
  }, [])

  const next = useCallback(() => {
    setDirection("forward")
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1))
  }, [])

  const back = useCallback(() => {
    setDirection("back")
    setStep((s) => Math.max(0, s - 1))
  }, [])

  const complete = useCallback(() => {
    const finalProfile: AntovelProfile = {
      name: profile.name?.trim() || "Anónimo",
      pronouns: profile.pronouns,
      birthDate: profile.birthDate,
      age:
        profile.age ??
        (profile.birthDate ? calculateAge(profile.birthDate) : undefined),
      city: profile.city,
      avatarUrl: profile.avatarUrl,
      purposes: profile.purposes ?? [],
      privacy: profile.privacy ?? DEFAULT_PRIVACY,
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
    }
    saveProfile(finalProfile)
    return finalProfile
  }, [profile])

  return {
    step,
    direction,
    profile,
    hydrated,
    update,
    next,
    back,
    complete,
    totalSteps: TOTAL_STEPS,
  }
}

"use client"

import { useCallback, useEffect, useState } from "react"
import type { AntovelProfile } from "@/lib/types"

const STORAGE_KEY = "antovel_profile"
export const TOTAL_STEPS = 4

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

export function useOnboarding() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<"forward" | "back">("forward")
  const [profile, setProfile] = useState<Partial<AntovelProfile>>({
    intents: [],
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
    setProfile((prev) => ({ ...prev, ...patch }))
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
      birthPlace: profile.birthPlace,
      intents: profile.intents ?? [],
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

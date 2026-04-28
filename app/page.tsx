"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadProfile } from "@/hooks/useOnboarding"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const profile = loadProfile()
    if (profile?.onboardingCompleted) {
      router.replace("/brain")
    } else {
      router.replace("/onboarding")
    }
  }, [router])

  return (
    <main className="bg-neural-nebula flex min-h-dvh items-center justify-center bg-background">
      <div
        aria-hidden
        className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--neural-violet)]/30 border-t-[var(--neural-violet)]"
      />
      <span className="sr-only">Cargando Antovel…</span>
    </main>
  )
}

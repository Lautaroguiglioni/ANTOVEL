"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { clearProfile, loadProfile } from "@/hooks/useOnboarding"
import { mockMemories } from "@/lib/mock-data"
import { buildConnections } from "@/lib/brain-logic"
import type { AntovelProfile, Memory, MemoryType } from "@/lib/types"
import { BrainHUD } from "@/components/brain/BrainHUD"
import { MemoryModal } from "@/components/brain/MemoryModal"

// R3F needs WebGL, so the canvas can only render on the client.
const BrainCanvas = dynamic(() => import("@/components/brain/BrainCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--neural-violet)] border-t-transparent" />
    </div>
  ),
})

const ALL_TYPES: MemoryType[] = ["photo", "audio", "video", "note"]

export default function BrainPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<AntovelProfile | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [selected, setSelected] = useState<Memory | null>(null)
  const [visibleTypes, setVisibleTypes] = useState<Set<MemoryType>>(new Set(ALL_TYPES))
  const [yearRange, setYearRange] = useState<[number, number]>(() => {
    const cy = new Date().getFullYear()
    return [cy - 5, cy]
  })

  useEffect(() => {
    const p = loadProfile()
    if (!p?.onboardingCompleted) {
      router.replace("/onboarding")
      return
    }
    setProfile(p)

    // Initialize year range from birthDate when available.
    if (p.birthDate) {
      const birthYear = new Date(p.birthDate).getFullYear()
      const cy = new Date().getFullYear()
      setYearRange([Math.max(birthYear, cy - 8), cy])
    }
    setHydrated(true)
  }, [router])

  const memories = useMemo(() => mockMemories, [])
  const allConnections = useMemo(() => buildConnections(memories), [memories])

  const visibleMemories = useMemo(() => {
    return memories.filter((m) => {
      const y = new Date(m.date).getFullYear()
      return y >= yearRange[0] && y <= yearRange[1] && visibleTypes.has(m.type)
    })
  }, [memories, yearRange, visibleTypes])

  const visibleConnectionsCount = useMemo(() => {
    const visIds = new Set(visibleMemories.map((m) => m.id))
    return allConnections.filter((c) => visIds.has(c.from) && visIds.has(c.to)).length
  }, [allConnections, visibleMemories])

  const relatedMemories = useMemo(() => {
    if (!selected) return []
    const ids = new Set<string>()
    allConnections.forEach((c) => {
      if (c.from === selected.id) ids.add(c.to)
      if (c.to === selected.id) ids.add(c.from)
    })
    return memories.filter((m) => ids.has(m.id))
  }, [selected, allConnections, memories])

  const handleToggleType = (type: MemoryType | null) => {
    if (type === null) {
      // "Todos" toggles between all-on and only-photo
      setVisibleTypes(visibleTypes.size === 4 ? new Set(["photo"]) : new Set(ALL_TYPES))
      return
    }
    setVisibleTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        if (next.size === 1) return next // never empty — keep at least one
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  if (!hydrated || !profile) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--neural-violet)] border-t-transparent" />
      </main>
    )
  }

  return (
    <main className="relative h-dvh w-screen overflow-hidden bg-background">
      {/* Cosmic background gradient (sits behind the canvas) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.18), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(6,182,212,0.12), transparent 55%), #06060c",
        }}
      />

      {/* 3D canvas (full-screen) */}
      <div className="absolute inset-0">
        <BrainCanvas
          memories={memories}
          visibleTypes={visibleTypes}
          yearRange={yearRange}
          onSelectMemory={setSelected}
        />
      </div>

      {/* Floating UI */}
      <BrainHUD
        profile={profile}
        memories={memories}
        visibleMemories={visibleMemories}
        visibleConnections={visibleConnectionsCount}
        visibleTypes={visibleTypes}
        onToggleType={handleToggleType}
        yearRange={yearRange}
        onYearRangeChange={setYearRange}
        onClearStorage={() => {
          clearProfile()
          router.replace("/onboarding")
        }}
      />

      {/* Memory detail */}
      <MemoryModal
        memory={selected}
        related={relatedMemories}
        onClose={() => setSelected(null)}
        onSelectRelated={(m) => setSelected(m)}
      />
    </main>
  )
}

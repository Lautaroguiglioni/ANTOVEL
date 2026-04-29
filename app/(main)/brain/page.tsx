"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { clearProfile, loadProfile } from "@/hooks/useOnboarding"
import { mockMemories } from "@/lib/mock-data"
import { buildConnections } from "@/lib/brain-logic"
import type { AntovelProfile, Memory, MemoryType } from "@/lib/types"
import { BrainHUD } from "@/components/brain/BrainHUD"
import { GeoPanel } from "@/components/brain/GeoPanel"
import { MemoryCapsule } from "@/components/brain/MemoryCapsule"

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
  const [activeLocation, setActiveLocation] = useState<string | null>(null)
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
    if (p.birthDate) {
      const birthYear = new Date(p.birthDate).getFullYear()
      const cy = new Date().getFullYear()
      setYearRange([Math.max(birthYear, cy - 8), cy])
    }
    setHydrated(true)
  }, [router])

  // Esc closes the capsule and returns to the map.
  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selected])

  const memories = useMemo(() => mockMemories, [])
  const allConnections = useMemo(() => buildConnections(memories), [memories])

  const visibleMemories = useMemo(() => {
    return memories.filter((m) => {
      const y = new Date(m.date).getFullYear()
      const passesFilter = y >= yearRange[0] && y <= yearRange[1] && visibleTypes.has(m.type)
      if (!passesFilter) return false
      if (activeLocation) return m.location?.name === activeLocation
      return true
    })
  }, [memories, yearRange, visibleTypes, activeLocation])

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
      setVisibleTypes(visibleTypes.size === 4 ? new Set(["photo"]) : new Set(ALL_TYPES))
      return
    }
    setVisibleTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        if (next.size === 1) return next
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  // Predictive search → ensure the picked memory is visible (year + type +
  // clear any geo filter that would hide it) before zooming in.
  const handleSearchSelect = (m: Memory) => {
    const year = new Date(m.date).getFullYear()
    if (year < yearRange[0] || year > yearRange[1]) {
      setYearRange([Math.min(yearRange[0], year), Math.max(yearRange[1], year)])
    }
    if (!visibleTypes.has(m.type)) {
      setVisibleTypes((prev) => new Set(prev).add(m.type))
    }
    if (activeLocation && m.location?.name !== activeLocation) {
      setActiveLocation(null)
    }
    setSelected(m)
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
          activeLocationName={activeLocation}
          focusedId={selected?.id ?? null}
          onSelectMemory={setSelected}
        />
      </div>

      {/* Floating UI (header + filters + timeline + counter — preserved) */}
      <BrainHUD
        profile={profile}
        memories={memories}
        visibleMemories={visibleMemories}
        visibleConnections={visibleConnectionsCount}
        visibleTypes={visibleTypes}
        onToggleType={handleToggleType}
        yearRange={yearRange}
        onYearRangeChange={setYearRange}
        onSearchSelect={handleSearchSelect}
        onClearStorage={() => {
          clearProfile()
          router.replace("/onboarding")
        }}
      />

      {/* Geo panel (bottom-left, syncs with the 3D brain) */}
      <GeoPanel
        memories={memories}
        activeLocation={activeLocation}
        onLocationSelect={(loc) => setActiveLocation(loc?.name ?? null)}
      />

      {/* Immersive memory capsule */}
      <MemoryCapsule
        memory={selected}
        related={relatedMemories}
        onClose={() => setSelected(null)}
        onSelectRelated={(m) => setSelected(m)}
      />
    </main>
  )
}

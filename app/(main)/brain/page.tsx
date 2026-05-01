"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { clearProfile, loadProfile } from "@/hooks/useOnboarding"
import { mockMemories } from "@/lib/mock-data"
import { buildConnections } from "@/lib/brain-logic"
import { useBrainStore } from "@/lib/brain-store"
import type { AntovelProfile, Memory } from "@/lib/types"
import { BrainHUD } from "@/components/brain/BrainHUD"
import { GeoPanel } from "@/components/brain/GeoPanel"
import { MemoryCapsule } from "@/components/brain/MemoryCapsule"

/**
 * Brain HUD page. The 3D canvas itself lives in the (main) layout
 * (PersistentBrainScene) so it stays mounted across tab navigations.
 * This page only renders the floating UI: header, filters, timeline,
 * geo panel, and immersive memory capsule. All filter / selection
 * state is shared via the brain store (Zustand).
 */
export default function BrainPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<AntovelProfile | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Brain store
  const visibleTypes = useBrainStore((s) => s.visibleTypes)
  const yearRange = useBrainStore((s) => s.yearRange)
  const activeLocation = useBrainStore((s) => s.activeLocation)
  const selected = useBrainStore((s) => s.selectedMemory)

  const setSelected = useBrainStore((s) => s.setSelectedMemory)
  const setVisibleTypes = useBrainStore((s) => s.setVisibleTypes)
  const toggleType = useBrainStore((s) => s.toggleType)
  const setYearRange = useBrainStore((s) => s.setYearRange)
  const setActiveLocation = useBrainStore((s) => s.setActiveLocation)
  const initializeFromProfile = useBrainStore((s) => s.initializeFromProfile)

  useEffect(() => {
    const p = loadProfile()
    if (!p?.onboardingCompleted) {
      router.replace("/onboarding")
      return
    }
    setProfile(p)
    initializeFromProfile(p.birthDate)
    setHydrated(true)
  }, [router, initializeFromProfile])

  // Esc closes the capsule and returns to the map.
  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selected, setSelected])

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

  // Predictive search → ensure the picked memory is visible (year + type +
  // clear any geo filter that would hide it) before zooming in.
  const handleSearchSelect = (m: Memory) => {
    const year = new Date(m.date).getFullYear()
    if (year < yearRange[0] || year > yearRange[1]) {
      setYearRange([Math.min(yearRange[0], year), Math.max(yearRange[1], year)])
    }
    if (!visibleTypes.has(m.type)) {
      const next = new Set(visibleTypes)
      next.add(m.type)
      setVisibleTypes(next)
    }
    if (activeLocation && m.location?.name !== activeLocation) {
      setActiveLocation(null)
    }
    setSelected(m)
  }

  if (!hydrated || !profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--neural-violet)] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {/* Floating UI (header + filters + timeline + counter — preserved) */}
      <BrainHUD
        profile={profile}
        memories={memories}
        visibleMemories={visibleMemories}
        visibleConnections={visibleConnectionsCount}
        visibleTypes={visibleTypes}
        onToggleType={toggleType}
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
    </div>
  )
}

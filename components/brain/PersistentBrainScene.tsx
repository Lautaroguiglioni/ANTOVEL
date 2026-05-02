"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
import { mockMemories } from "@/lib/mock-data"
import { useBrainStore } from "@/lib/brain-store"
import type { Memory } from "@/lib/types"

/**
 * The 3D brain canvas lives ONCE at the layout level. It reads its inputs
 * from the brain store and stays mounted across tab navigations so the
 * WebGL context, scene state, and animations are preserved.
 *
 * When the user is not on /brain we hide the DOM node and pause the
 * render loop (frameloop="never") so it costs zero CPU/GPU.
 */
const BrainCanvas = dynamic(() => import("@/components/brain/BrainCanvas"), {
  ssr: false,
})

export function PersistentBrainScene() {
  const pathname = usePathname() ?? ""
  const isBrainRoute = pathname === "/brain" || pathname.startsWith("/brain/")

  const visibleTypes = useBrainStore((s) => s.visibleTypes)
  const yearRange = useBrainStore((s) => s.yearRange)
  const activeLocation = useBrainStore((s) => s.activeLocation)
  const selectedMemory = useBrainStore((s) => s.selectedMemory)
  const setSelectedMemory = useBrainStore((s) => s.setSelectedMemory)

  const memories = useMemo(() => mockMemories, [])

  return (
    <div
      aria-hidden={!isBrainRoute}
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        // visibility hides the canvas without unmounting it (preserves WebGL)
        visibility: isBrainRoute ? "visible" : "hidden",
      }}
    >
      {/* Cosmic background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.18), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(6,182,212,0.12), transparent 55%), #06060c",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ pointerEvents: isBrainRoute ? "auto" : "none" }}
      >
        <BrainCanvas
          memories={memories}
          visibleTypes={visibleTypes}
          yearRange={yearRange}
          activeLocationName={activeLocation}
          focusedId={selectedMemory?.id ?? null}
          onSelectMemory={(m: Memory) => setSelectedMemory(m)}
          paused={!isBrainRoute}
        />
      </div>
    </div>
  )
}

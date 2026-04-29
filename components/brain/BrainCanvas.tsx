"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense, useState } from "react"
import { BrainScene } from "./BrainScene"
import { useDeviceQuality } from "@/hooks/useDeviceQuality"
import type { Memory, MemoryType } from "@/lib/types"

interface Props {
  memories: Memory[]
  visibleTypes: Set<MemoryType>
  yearRange: [number, number]
  activeLocationName: string | null
  focusedId: string | null
  onSelectMemory: (m: Memory) => void
}

export default function BrainCanvas({
  memories,
  visibleTypes,
  yearRange,
  activeLocationName,
  focusedId,
  onSelectMemory,
}: Props) {
  const quality = useDeviceQuality()
  // OrbitControls.autoRotate is paused while the user is dragging.
  const [interacting, setInteracting] = useState(false)

  return (
    <Canvas
      dpr={quality.dpr}
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{
        antialias: quality.antialias,
        alpha: true,
        powerPreference: "high-performance",
      }}
      performance={{ min: 0.5 }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <BrainScene
          memories={memories}
          visibleTypes={visibleTypes}
          yearRange={yearRange}
          activeLocationName={activeLocationName}
          focusedId={focusedId}
          onSelectMemory={onSelectMemory}
          onUserInteract={setInteracting}
          autoRotate={!interacting}
          quality={quality}
        />
      </Suspense>
    </Canvas>
  )
}

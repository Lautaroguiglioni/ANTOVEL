"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense, useState } from "react"
import { BrainScene } from "./BrainScene"
import { useDeviceQuality } from "@/hooks/useDeviceQuality"
import type { Memory, MemoryType } from "@/lib/types"
import type { BrainMode } from "@/lib/brain-logic"

interface Props {
  memories: Memory[]
  visibleTypes: Set<MemoryType>
  yearRange: [number, number]
  activeLocationName: string | null
  focusedId: string | null
  brainMode: BrainMode
  onSelectMemory: (m: Memory) => void
  /**
   * When true, the render loop stops (frameloop="never").
   * Use this to keep the WebGL context alive across route changes
   * without consuming CPU/GPU.
   */
  paused?: boolean
}

export default function BrainCanvas({
  memories,
  visibleTypes,
  yearRange,
  activeLocationName,
  focusedId,
  brainMode,
  onSelectMemory,
  paused = false,
}: Props) {
  const quality = useDeviceQuality()
  // OrbitControls.autoRotate is paused while the user is dragging.
  const [interacting, setInteracting] = useState(false)

  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
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
          brainMode={brainMode}
          onSelectMemory={onSelectMemory}
          onUserInteract={setInteracting}
          autoRotate={!interacting}
          quality={quality}
        />
      </Suspense>
    </Canvas>
  )
}

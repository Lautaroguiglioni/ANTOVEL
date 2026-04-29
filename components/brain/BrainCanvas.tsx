"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense, useState } from "react"
import { BrainScene } from "./BrainScene"
import type { Memory, MemoryType } from "@/lib/types"

interface Props {
  memories: Memory[]
  visibleTypes: Set<MemoryType>
  yearRange: [number, number]
  focusedId: string | null
  onSelectMemory: (m: Memory) => void
}

export default function BrainCanvas({ memories, visibleTypes, yearRange, focusedId, onSelectMemory }: Props) {
  // OrbitControls.autoRotate is paused while the user is dragging.
  const [interacting, setInteracting] = useState(false)

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <BrainScene
          memories={memories}
          visibleTypes={visibleTypes}
          yearRange={yearRange}
          focusedId={focusedId}
          onSelectMemory={onSelectMemory}
          onUserInteract={setInteracting}
          autoRotate={!interacting}
        />
      </Suspense>
    </Canvas>
  )
}

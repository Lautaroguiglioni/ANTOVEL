"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
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

function BrainErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#06060c] p-6 text-center">
      <div className="rounded-full bg-red-500/20 p-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
      </div>
      <div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">El motor 3D experimentó un fallo</h3>
        <p className="max-w-xs text-sm text-muted-foreground">{error.message}</p>
      </div>
      <button 
        onClick={resetErrorBoundary}
        className="mt-2 rounded-full bg-white/10 px-6 py-2 text-sm font-medium transition-colors hover:bg-white/20"
      >
        Reintentar conexión neural
      </button>
    </div>
  )
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
    <ErrorBoundary FallbackComponent={BrainErrorFallback}>
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
    </ErrorBoundary>
  )
}

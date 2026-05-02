"use client"

import { useMemo, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "@react-three/drei"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import { OrganicBrain } from "./OrganicBrain"
import { MemoryToken } from "./MemoryToken"
import { ConnectionLine } from "./ConnectionLine"
import { SynapticParticles } from "./SynapticParticles"
import { CinematicCamera } from "./CinematicCamera"
import { PostFX } from "./PostFX"
import {
  fibonacciSphere,
  buildConnections,
  getTargetPosition,
  type BrainMode,
} from "@/lib/brain-logic"
import type { Memory, MemoryType } from "@/lib/types"
import type { QualityConfig } from "@/hooks/useDeviceQuality"

interface Props {
  memories: Memory[]
  visibleTypes: Set<MemoryType>
  yearRange: [number, number]
  /** When set, tokens of that location are boosted; everything else dims to ~18% */
  activeLocationName: string | null
  focusedId: string | null
  /** cluster | time | map | people — drives morph target positions */
  brainMode: BrainMode
  onSelectMemory: (m: Memory) => void
  onUserInteract: (interacting: boolean) => void
  autoRotate: boolean
  quality: QualityConfig
}

export function BrainScene({
  memories,
  visibleTypes,
  yearRange,
  activeLocationName,
  focusedId,
  brainMode,
  onSelectMemory,
  onUserInteract,
  autoRotate,
  quality,
}: Props) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  // Stable per-memory placement on the brain "scalp" (cluster mode).
  const clusterPositions = useMemo(() => {
    const pts = fibonacciSphere(memories.length, 2.55)
    const map = new Map<string, THREE.Vector3>()
    memories.forEach((m, i) => map.set(m.id, pts[i]))
    return map
  }, [memories])

  /**
   * Target positions per memory in the active mode.
   * Cluster mode reuses the stable Fibonacci layout above; the other modes
   * derive their target from the helpers in brain-logic. The Map is rebuilt
   * only when memories or mode change — not on filter changes — so the
   * morph animation runs with stable destinations.
   */
  const targetPositions = useMemo(() => {
    const map = new Map<string, THREE.Vector3>()
    memories.forEach((m) => {
      const fallback = clusterPositions.get(m.id) ?? new THREE.Vector3()
      map.set(m.id, getTargetPosition(m, memories, brainMode, fallback))
    })
    return map
  }, [memories, brainMode, clusterPositions])

  /**
   * Per-memory state combines two filters:
   *   1. Year/type filters (set the BASE visibility: 1, 0.06 or 0)
   *   2. Geo filter (if active, dims non-matching to 0.18 and highlights matches)
   */
  const nodeStates = useMemo(() => {
    const map = new Map<string, { visibility: number; isHighlighted: boolean }>()
    memories.forEach((m) => {
      const y = new Date(m.date).getFullYear()
      const inYear = y >= yearRange[0] && y <= yearRange[1]
      const inType = visibleTypes.has(m.type)
      let base = inYear && inType ? 1 : inYear ? 0.06 : 0

      let highlighted = false
      if (activeLocationName && base > 0) {
        const matches = m.location?.name === activeLocationName
        if (matches) {
          highlighted = base >= 0.5
        } else {
          base *= 0.18
        }
      }
      map.set(m.id, { visibility: base, isHighlighted: highlighted })
    })
    return map
  }, [memories, yearRange, visibleTypes, activeLocationName])

  const connections = useMemo(() => buildConnections(memories), [memories])

  // Connections only make spatial sense in cluster mode (Fibonacci surface).
  // In time/map/people the nodes have rearranged, so chronological lines
  // would just clutter — we hide them.
  const showConnections = brainMode === "cluster"

  // Hide the organic brain shell when nodes leave the scalp surface.
  const showBrainShell = brainMode === "cluster"

  // World position of the focused node (drives the cinematic camera).
  // Uses the target position so the camera follows nodes during morph.
  const focusPosition = focusedId ? (targetPositions.get(focusedId) ?? null) : null
  const focused = !!focusPosition

  return (
    <>
      {/* ─── Lighting (4-point + hemi GI fill) ─── */}
      <ambientLight intensity={0.4} color="#2a1050" />
      <pointLight position={[-6, 10, 4]} intensity={3.5} color="#7C3AED" />
      <pointLight position={[8, -5, 3]} intensity={2.0} color="#06B6D4" />
      <pointLight position={[0, 0, 6]} intensity={1.0} color="#EC4899" distance={8} />
      <pointLight position={[0, -8, -2]} intensity={1.5} color="#3d0070" />
      <hemisphereLight args={["#3a1170", "#000000", 0.6]} />

      {/* ─── Capa 2: Cerebro orgánico PBR (sólo en modo cluster) ─── */}
      <group visible={showBrainShell}>
        <OrganicBrain segments={quality.brainSegments} />
      </group>

      {/* ─── Capa 3: Conexiones cronológicas (sólo en modo cluster) ─── */}
      {showConnections &&
        connections.map((c, i) => {
          const a = clusterPositions.get(c.from)
          const b = clusterPositions.get(c.to)
          if (!a || !b) return null
          const sa = nodeStates.get(c.from)
          const sb = nodeStates.get(c.to)
          if (!sa || !sb) return null
          const visibility = Math.min(sa.visibility, sb.visibility)
          return (
            <ConnectionLine
              key={`${c.from}-${c.to}-${i}`}
              from={a}
              to={b}
              daysDiff={c.daysDiff}
              visibility={visibility}
              seed={(i % 10) / 10}
            />
          )
        })}

      {/* ─── Capa 4: Memory Tokens cristalinos con morfosis ─── */}
      {memories.map((m) => {
        const pos = targetPositions.get(m.id)
        const state = nodeStates.get(m.id)
        if (!pos || !state) return null
        return (
          <MemoryToken
            key={m.id}
            memory={m}
            position={pos}
            visibility={state.visibility}
            isHighlighted={state.isHighlighted}
            detail={quality.tokenGeometryDetail}
            onSelect={onSelectMemory}
          />
        )
      })}

      {/* ─── Capa 5: Partículas sinápticas ambientales ─── */}
      <SynapticParticles count={quality.particleCount} />

      {/* ─── OrbitControls (paused during interaction & focus) ─── */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        autoRotate={autoRotate && !focused}
        autoRotateSpeed={0.4}
        enableDamping
        dampingFactor={0.08}
        onStart={() => onUserInteract(true)}
        onEnd={() => onUserInteract(false)}
      />

      {/* ─── Cinematic camera state-machine (uses maath easing.damp3) ─── */}
      <CinematicCamera focusPosition={focusPosition} controlsRef={controlsRef} />

      {/* ─── Post-FX: Bloom · ChromaticAberration · Vignette ─── */}
      <PostFX
        bloomRadius={quality.bloomRadius}
        enableChromaticAberration={quality.enableChromaticAberration}
      />
    </>
  )
}

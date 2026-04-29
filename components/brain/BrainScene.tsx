"use client"

import { useMemo, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "@react-three/drei"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import { Hemispheres } from "./Hemispheres"
import { MemoryNode } from "./MemoryNode"
import { ConnectionLine } from "./ConnectionLine"
import { AmbientParticles } from "./AmbientParticles"
import { CameraDirector } from "./CameraDirector"
import { CinematicDoF } from "./CinematicDoF"
import { fibonacciSphere, buildConnections } from "@/lib/brain-logic"
import type { Memory, MemoryType } from "@/lib/types"

interface Props {
  memories: Memory[]
  visibleTypes: Set<MemoryType>
  yearRange: [number, number]
  focusedId: string | null
  onSelectMemory: (m: Memory) => void
  onUserInteract: (interacting: boolean) => void
  autoRotate: boolean
}

export function BrainScene({
  memories,
  visibleTypes,
  yearRange,
  focusedId,
  onSelectMemory,
  onUserInteract,
  autoRotate,
}: Props) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  // Stable per-memory placement on the brain "scalp" using Fibonacci.
  // Recomputed only when the memory set changes (not when filters change).
  const positions = useMemo(() => {
    const pts = fibonacciSphere(memories.length, 2.45)
    const map = new Map<string, THREE.Vector3>()
    memories.forEach((m, i) => map.set(m.id, pts[i]))
    return map
  }, [memories])

  // Stable per-node pulse params (random freq + phase) seeded by index.
  const pulseParams = useMemo(() => {
    return memories.map((_, i) => ({
      hz: 0.8 + ((i * 7) % 12) / 10, // 0.8..2.0
      phase: (i * 1.37) % (Math.PI * 2),
    }))
  }, [memories])

  // Visibility per memory = (in year range ? 1 : 0) * (type enabled ? 1 : 0.05)
  const visibilityMap = useMemo(() => {
    const map = new Map<string, number>()
    memories.forEach((m) => {
      const y = new Date(m.date).getFullYear()
      const inYear = y >= yearRange[0] && y <= yearRange[1]
      const inType = visibleTypes.has(m.type)
      const v = inYear && inType ? 1 : inYear ? 0.06 : 0
      map.set(m.id, v)
    })
    return map
  }, [memories, yearRange, visibleTypes])

  const connections = useMemo(() => buildConnections(memories), [memories])

  // World position of the focused node (drives the cinematic camera).
  const focusPosition = focusedId ? positions.get(focusedId) ?? null : null
  const focused = !!focusPosition

  return (
    <>
      {/* ─── Lighting ─── */}
      <ambientLight intensity={0.35} color="#1a0533" />
      <pointLight position={[-5, 8, 5]} intensity={2} color="#7C3AED" />
      <pointLight position={[6, -4, 3]} intensity={1.5} color="#06B6D4" />
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#EC4899" distance={5} />

      {/* ─── Brain ─── */}
      <Hemispheres />

      {/* ─── Connections (drawn before nodes so node halos overlap on top) ─── */}
      {connections.map((c, i) => {
        const a = positions.get(c.from)
        const b = positions.get(c.to)
        if (!a || !b) return null
        const va = visibilityMap.get(c.from) ?? 0
        const vb = visibilityMap.get(c.to) ?? 0
        const visibility = Math.min(va, vb) // edge visible only if both ends are
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

      {/* ─── Memory nodes ─── */}
      {memories.map((m, i) => {
        const pos = positions.get(m.id)
        if (!pos) return null
        return (
          <MemoryNode
            key={m.id}
            memory={m}
            position={pos}
            visibility={visibilityMap.get(m.id) ?? 0}
            pulseHz={pulseParams[i].hz}
            phase={pulseParams[i].phase}
            onSelect={onSelectMemory}
          />
        )
      })}

      {/* ─── Ambient dust ─── */}
      <AmbientParticles />

      {/* ─── Camera ─── */}
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

      {/* ─── Cinematic camera director (drives focus zoom) ─── */}
      <CameraDirector focusPosition={focusPosition} controlsRef={controlsRef} />

      {/* ─── Aggressive Depth-of-Field that blooms when focused ─── */}
      <CinematicDoF focused={focused} />
    </>
  )
}

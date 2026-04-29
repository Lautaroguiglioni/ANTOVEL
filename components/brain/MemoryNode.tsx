"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { Memory } from "@/lib/types"

interface Props {
  memory: Memory
  position: THREE.Vector3
  /** 0..1 visibility weight (for fade-out when filtered) */
  visibility: number
  /** randomized pulse frequency in Hz, 0.8..2.0 */
  pulseHz: number
  /** randomized initial phase so nodes don't pulse in unison */
  phase: number
  onSelect: (memory: Memory) => void
}

export function MemoryNode({ memory, position, visibility, pulseHz, phase, onSelect }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()

    // Pulse: scale 1.0 .. 1.4 by default, 2.0 on hover.
    const pulse = 1 + Math.sin(t * pulseHz * Math.PI * 2 + phase) * 0.2
    const target = hovered ? 2.0 : pulse * (0.4 + 0.6 * visibility)
    // Smooth lerp toward target
    const cur = groupRef.current.scale.x
    const next = cur + (target - cur) * 0.18
    groupRef.current.scale.setScalar(next)

    // Hover ring continuously rotates
    if (ringRef.current) {
      ringRef.current.rotation.x += 0.04
      ringRef.current.rotation.y += 0.025
    }
  })

  const opacity = Math.max(0.05, visibility)

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = "pointer"
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHovered(false)
        document.body.style.cursor = "default"
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (visibility > 0.2) onSelect(memory)
      }}
    >
      {/* Core glowing node */}
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={memory.color}
          emissive={memory.color}
          emissiveIntensity={1.6}
          toneMapped={false}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Bioluminescent halo */}
      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial
          color={memory.color}
          transparent
          opacity={0.28 * opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Hover ring */}
      {hovered && (
        <mesh ref={ringRef}>
          <torusGeometry args={[0.22, 0.012, 12, 48]} />
          <meshBasicMaterial
            color={memory.color}
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  )
}

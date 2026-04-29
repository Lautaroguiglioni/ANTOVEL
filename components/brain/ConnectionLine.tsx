"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Line } from "@react-three/drei"
import * as THREE from "three"
import { classifyConnection, curveBetween } from "@/lib/brain-logic"

interface Props {
  from: THREE.Vector3
  to: THREE.Vector3
  daysDiff: number
  /** 0..1 — both endpoints' avg visibility, fades the line + halts the pulse */
  visibility: number
  /** seed for unique pulse offset so connections don't pulse in lockstep */
  seed: number
}

export function ConnectionLine({ from, to, daysDiff, visibility, seed }: Props) {
  const curve = useMemo(() => curveBetween(from, to, 0.5), [from, to])
  const points = useMemo(() => curve.getPoints(24), [curve])
  const { color, opacity } = classifyConnection(daysDiff)
  const pulseRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!pulseRef.current || visibility < 0.1) return
    const t = ((state.clock.getElapsedTime() * 0.25 + seed) % 1)
    const p = curve.getPointAt(t)
    pulseRef.current.position.copy(p)
  })

  if (visibility < 0.05) return null

  return (
    <group>
      <Line
        points={points}
        color={color}
        lineWidth={1.5}
        transparent
        opacity={opacity * visibility}
        toneMapped={false}
      />
      {/* Traveling light pulse */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.95 * visibility}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

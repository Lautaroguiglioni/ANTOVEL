"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

/**
 * 200 violet particles drifting inside a 2.5-radius sphere around the brain.
 * The full Points system rotates slowly on Y so it feels like atmospheric dust.
 */
export function AmbientParticles({ count = 200, radius = 2.5 }: { count?: number; radius?: number }) {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Uniform distribution inside a sphere via cube-root radius scaling
      const u = Math.random()
      const r = radius * Math.cbrt(u)
      const theta = Math.acos(2 * Math.random() - 1)
      const phi = 2 * Math.PI * Math.random()
      arr[i * 3] = r * Math.sin(theta) * Math.cos(phi)
      arr[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi)
      arr[i * 3 + 2] = r * Math.cos(theta)
    }
    return arr
  }, [count, radius])

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.001
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#7C3AED"
        size={0.015}
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  )
}

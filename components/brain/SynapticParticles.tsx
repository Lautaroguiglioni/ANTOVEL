"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface Props {
  count?: number // 300 desktop · 100 mobile
}

/**
 * Ambient synaptic dust around the brain. Each particle has a tiny linear
 * velocity and bounces softly when it leaves the spherical shell [1.8, 3.5].
 * AdditiveBlending makes overlapping particles glow brighter — exactly the
 * "neural fog" feeling we want.
 */
export function SynapticParticles({ count = 300 }: Props) {
  const ref = useRef<THREE.Points>(null)

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const phi = Math.random() * Math.PI * 2
      const theta = Math.acos(2 * Math.random() - 1) // uniform on sphere
      const r = 2.0 + Math.random() * 1.5
      pos[i * 3] = r * Math.sin(theta) * Math.cos(phi)
      pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi)
      pos[i * 3 + 2] = r * Math.cos(theta)
      vel[i * 3] = (Math.random() - 0.5) * 0.002
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.002
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002
    }
    return { positions: pos, velocities: vel }
  }, [count])

  useFrame(() => {
    if (!ref.current) return
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    for (let i = 0; i < count; i++) {
      const ix = i * 3
      arr[ix] += velocities[ix]
      arr[ix + 1] += velocities[ix + 1]
      arr[ix + 2] += velocities[ix + 2]
      const x = arr[ix]
      const y = arr[ix + 1]
      const z = arr[ix + 2]
      const dist = Math.sqrt(x * x + y * y + z * z)
      if (dist > 3.5 || dist < 1.8) {
        velocities[ix] *= -1
        velocities[ix + 1] *= -1
        velocities[ix + 2] *= -1
      }
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        color="#7C3AED"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  )
}

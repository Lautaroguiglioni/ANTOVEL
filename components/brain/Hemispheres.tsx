"use client"

/**
 * Two slightly-overlapping spheres simulating the brain's hemispheres.
 * Each hemisphere has a solid violet shell (deep emissive) plus an outer
 * wireframe layer that catches the rim light and gives the surface texture.
 */
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

function Hemisphere({
  position,
  radius,
}: {
  position: [number, number, number]
  radius: number
}) {
  return (
    <group position={position}>
      {/* Solid emissive shell */}
      <mesh>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshPhongMaterial
          color="#1a0533"
          emissive="#3d0070"
          emissiveIntensity={0.6}
          shininess={40}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Outer wireframe shell (slightly larger so it doesn't z-fight) */}
      <mesh>
        <sphereGeometry args={[radius * 1.005, 24, 24]} />
        <meshBasicMaterial
          color="#7C3AED"
          wireframe
          transparent
          opacity={0.08}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export function Hemispheres() {
  const group = useRef<THREE.Group>(null)

  // Very slow ambient rotation; OrbitControls' autoRotate handles camera-side spin,
  // but a tiny mesh-side wobble adds organic life that camera rotation can't.
  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.getElapsedTime()
    group.current.rotation.z = Math.sin(t * 0.15) * 0.02
  })

  return (
    <group ref={group}>
      <Hemisphere position={[-0.6, 0, 0]} radius={2.2} />
      <Hemisphere position={[0.6, 0, 0]} radius={2.0} />
    </group>
  )
}

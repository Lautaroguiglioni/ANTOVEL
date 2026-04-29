"use client"

/**
 * BrainCanvas — low-poly rotating brain (Phase 0, step 1).
 *
 * Geometry: IcosahedronGeometry rendered as wireframe in violet (#7C3AED, opacity 0.4)
 * Nodes: 12 small spheres positioned at the 12 canonical icosahedron vertices,
 *        glowing cyan (#06B6D4) via additive blending + pulse animation.
 * Motion: continuous Y rotation at 0.003 rad/frame (~0.18 rad/s @ 60fps).
 */

import { Canvas, useFrame } from "@react-three/fiber"
import { Suspense, useMemo, useRef } from "react"
import * as THREE from "three"

const VIOLET = "#7C3AED"
const CYAN = "#06B6D4"

/** 12 canonical icosahedron vertices, normalized so the brain "breathes" symmetrically. */
function useIcosahedronVertices(radius = 1.4): THREE.Vector3[] {
  return useMemo(() => {
    const t = (1 + Math.sqrt(5)) / 2
    const raw: [number, number, number][] = [
      [-1, t, 0],
      [1, t, 0],
      [-1, -t, 0],
      [1, -t, 0],
      [0, -1, t],
      [0, 1, t],
      [0, -1, -t],
      [0, 1, -t],
      [t, 0, -1],
      [t, 0, 1],
      [-t, 0, -1],
      [-t, 0, 1],
    ]
    return raw.map(([x, y, z]) =>
      new THREE.Vector3(x, y, z).normalize().multiplyScalar(radius),
    )
  }, [radius])
}

function NeuralNode({
  position,
  delay,
}: {
  position: THREE.Vector3
  delay: number
}) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    // Gentle independent pulse on each node — period ~2.4s, scale 0.85..1.15.
    const t = state.clock.getElapsedTime() + delay
    const s = 1 + Math.sin(t * 2.6) * 0.15
    ref.current.scale.setScalar(s)
  })

  return (
    <group position={position}>
      {/* Core node */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color={CYAN} toneMapped={false} />
      </mesh>
      {/* Outer additive glow halo (slightly larger, semi-transparent) */}
      <mesh>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function BrainMesh() {
  const group = useRef<THREE.Group>(null)
  const vertices = useIcosahedronVertices(1.4)

  useFrame(() => {
    if (group.current) {
      // Per spec: 0.003 rad/frame on Y
      group.current.rotation.y += 0.003
      // Subtle X drift to feel alive
      group.current.rotation.x += 0.0008
    }
  })

  return (
    <group ref={group}>
      {/* Wireframe shell */}
      <mesh>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshBasicMaterial
          color={VIOLET}
          wireframe
          transparent
          opacity={0.4}
          toneMapped={false}
        />
      </mesh>
      {/* Inner softer shell for depth */}
      <mesh>
        <icosahedronGeometry args={[1.42, 0]} />
        <meshBasicMaterial
          color={VIOLET}
          wireframe
          transparent
          opacity={0.18}
          toneMapped={false}
        />
      </mesh>
      {/* 12 pulsing cyan nodes */}
      {vertices.map((v, i) => (
        <NeuralNode key={i} position={v} delay={i * 0.4} />
      ))}
    </group>
  )
}

export function BrainCanvas() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <BrainMesh />
      </Suspense>
    </Canvas>
  )
}

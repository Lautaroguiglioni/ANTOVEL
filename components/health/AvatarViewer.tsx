"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"
import type { HealthState } from "@/lib/types"

interface AvatarViewerProps {
  state: HealthState
  healthScore: number
}

// ── GEOMETRÍA DEL AVATAR VIDRIO ESMERILADO ────────────────────────────────
function GlassAvatarMesh({ healthScore, state }: { healthScore: number; state: HealthState }) {
  const groupRef = useRef<THREE.Group>(null)
  const heartRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  // Postura según estado
  const postureMap = {
    radiant: { torsoTilt: 0, headLift: 0.05, armDrop: 0.1 },
    good: { torsoTilt: 0, headLift: 0, armDrop: 0.3 },
    regular: { torsoTilt: 0.08, headLift: -0.05, armDrop: 0.5 },
    exhausted: { torsoTilt: 0.18, headLift: -0.12, armDrop: 0.9 },
  }
  const posture = postureMap[state]

  // Material vidrio esmerilado violeta
  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#9B5FE0"),
        roughness: 0.18,
        metalness: 0.05,
        transmission: 0.75,
        thickness: 0.6,
        ior: 1.45,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
      }),
    [],
  )

  // Partículas orbitales — cantidad según estado
  const [particlePositions, particleCount] = useMemo(() => {
    const count = state === "radiant" ? 60 : state === "good" ? 35 : 15
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const r = 0.6 + Math.random() * 0.5
      const h = (Math.random() - 0.5) * 2.5
      positions[i * 3] = Math.cos(angle) * r
      positions[i * 3 + 1] = h
      positions[i * 3 + 2] = Math.sin(angle) * r
    }
    return [positions, count] as const
  }, [state])

  useFrame((frameState, delta) => {
    if (!groupRef.current || !heartRef.current) return
    const t = frameState.clock.getElapsedTime()

    // Idle: rotación suave en Y
    groupRef.current.rotation.y += delta * 0.3

    // Respiración del torso
    const breathFreq = state === "exhausted" ? 0.4 : 0.9
    groupRef.current.position.y = Math.sin(t * breathFreq) * 0.03

    // Pulso del corazón (núcleo de energía)
    const heartPulse = 0.8 + Math.sin(t * 4) * 0.2
    heartRef.current.scale.setScalar(heartPulse)
    const heartMat = heartRef.current.material as THREE.MeshStandardMaterial
    heartMat.emissiveIntensity = 0.8 + Math.sin(t * 4) * 0.4

    // Rotación de partículas
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.4
      particlesRef.current.rotation.x += delta * 0.15
    }
  })

  return (
    <group ref={groupRef} rotation={[0, 0, posture.torsoTilt]}>
      {/* ── CABEZA ─────────────────────────────────────────────── */}
      <mesh position={[0, 2.0 + posture.headLift, 0]} material={glassMaterial}>
        <sphereGeometry args={[0.38, 24, 24]} />
      </mesh>

      {/* ── CUELLO ─────────────────────────────────────────────── */}
      <mesh position={[0, 1.52, 0]} material={glassMaterial}>
        <cylinderGeometry args={[0.11, 0.13, 0.22, 12]} />
      </mesh>

      {/* ── TORSO — cono truncado orgánico ─────────────────────── */}
      <mesh position={[0, 0.65, 0]} material={glassMaterial}>
        <cylinderGeometry args={[0.28, 0.34, 1.1, 16]} />
      </mesh>

      {/* ── HOMBROS (esferas de transición) ────────────────────── */}
      <mesh position={[-0.42, 1.18, 0]} material={glassMaterial}>
        <sphereGeometry args={[0.14, 12, 12]} />
      </mesh>
      <mesh position={[0.42, 1.18, 0]} material={glassMaterial}>
        <sphereGeometry args={[0.14, 12, 12]} />
      </mesh>

      {/* ── BRAZOS ─────────────────────────────────────────────── */}
      <group position={[-0.55, 0.7, 0]} rotation={[0, 0, posture.armDrop]}>
        <mesh material={glassMaterial}>
          <cylinderGeometry args={[0.085, 0.065, 0.95, 10]} />
        </mesh>
      </group>
      <group position={[0.55, 0.7, 0]} rotation={[0, 0, -posture.armDrop]}>
        <mesh material={glassMaterial}>
          <cylinderGeometry args={[0.085, 0.065, 0.95, 10]} />
        </mesh>
      </group>

      {/* ── CADERA ─────────────────────────────────────────────── */}
      <mesh position={[0, 0.02, 0]} material={glassMaterial}>
        <cylinderGeometry args={[0.3, 0.26, 0.28, 14]} />
      </mesh>

      {/* ── PIERNAS ────────────────────────────────────────────── */}
      <mesh position={[-0.18, -0.82, 0]} material={glassMaterial}>
        <cylinderGeometry args={[0.11, 0.085, 1.15, 10]} />
      </mesh>
      <mesh position={[0.18, -0.82, 0]} material={glassMaterial}>
        <cylinderGeometry args={[0.11, 0.085, 1.15, 10]} />
      </mesh>

      {/* ── NÚCLEO DE ENERGÍA (corazón pulsante) ───────────────── */}
      <mesh ref={heartRef} position={[0, 0.72, 0.22]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color="#EC4899"
          emissive="#EC4899"
          emissiveIntensity={1.0}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* ── PARTÍCULAS ORBITALES ────────────────────────────────── */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={state === "radiant" ? 0.025 : 0.015}
          color={state === "radiant" ? "#F59E0B" : "#7C3AED"}
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* ── LUCES QUE SIGUEN AL AVATAR ─────────────────────────── */}
      <pointLight
        position={[1.5, 2, 1.5]}
        color="#7C3AED"
        intensity={state === "radiant" ? 3.0 : 1.5}
        distance={5}
      />
      <pointLight position={[-1.5, 0, 1]} color="#06B6D4" intensity={1.0} distance={4} />
    </group>
  )
}

// ── CANVAS COMPLETO ────────────────────────────────────────────────────────
export function AvatarViewer({ state, healthScore }: AvatarViewerProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.8, 4.5], fov: 45 }}
      style={{ background: "transparent", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.2} color="#1a0533" />
      <pointLight position={[0, 5, 3]} intensity={2.5} color="#7C3AED" />
      <pointLight position={[3, -2, 2]} intensity={1.5} color="#06B6D4" />

      <GlassAvatarMesh healthScore={healthScore} state={state} />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI * 0.7}
        autoRotate={false}
      />

      <EffectComposer>
        <Bloom
          intensity={1.8}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.7}
        />
      </EffectComposer>
    </Canvas>
  )
}

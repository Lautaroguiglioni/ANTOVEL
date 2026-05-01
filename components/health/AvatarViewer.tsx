"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import * as THREE from "three"
import type { HealthState } from "@/lib/types"
import { HEALTH_STATE_CONFIG } from "@/lib/mock-health-data"

interface AvatarViewerProps {
  state: HealthState
  healthScore: number
}

// State-based animation parameters
const STATE_PARAMS: Record<HealthState, { shoulderDrop: number; breathSpeed: number; breathAmp: number }> = {
  radiant: { shoulderDrop: 0, breathSpeed: 1.2, breathAmp: 0.02 },
  good: { shoulderDrop: 0, breathSpeed: 1.0, breathAmp: 0.015 },
  regular: { shoulderDrop: 0.08, breathSpeed: 0.8, breathAmp: 0.012 },
  exhausted: { shoulderDrop: 0.15, breathSpeed: 0.5, breathAmp: 0.025 },
}

function GeometricAvatar({ state }: { state: HealthState }) {
  const groupRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const torsoRef = useRef<THREE.Mesh>(null)

  const params = STATE_PARAMS[state]
  const stateConfig = HEALTH_STATE_CONFIG[state]
  const mainColor = useMemo(() => new THREE.Color(stateConfig.color).lerp(new THREE.Color("#a78bfa"), 0.5), [stateConfig.color])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const breath = Math.sin(t * params.breathSpeed) * params.breathAmp

    // Torso breathing
    if (torsoRef.current) {
      torsoRef.current.scale.setY(1 + breath)
      torsoRef.current.position.y = 0.6 + breath * 2
    }

    // Arms slight idle sway
    if (leftArmRef.current) {
      leftArmRef.current.rotation.z = 0.15 + Math.sin(t * 0.7) * 0.03 - params.shoulderDrop * 0.3
      leftArmRef.current.position.y = 0.5 - params.shoulderDrop
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.z = -0.15 - Math.sin(t * 0.7) * 0.03 + params.shoulderDrop * 0.3
      rightArmRef.current.position.y = 0.5 - params.shoulderDrop
    }

    // Whole body subtle bob
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * params.breathSpeed * 0.5) * 0.01
    }
  })

  const material = useMemo(
    () => (
      <meshStandardMaterial
        color={mainColor}
        emissive={mainColor}
        emissiveIntensity={state === "radiant" ? 0.3 : 0.1}
        roughness={0.4}
        metalness={0.2}
      />
    ),
    [mainColor, state]
  )

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        {material}
      </mesh>

      {/* Torso */}
      <mesh ref={torsoRef} position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.28, 0.22, 1.0, 16]} />
        {material}
      </mesh>

      {/* Left arm */}
      <mesh ref={leftArmRef} position={[-0.42, 0.5, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.08, 0.06, 0.8, 12]} />
        {material}
      </mesh>

      {/* Right arm */}
      <mesh ref={rightArmRef} position={[0.42, 0.5, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.08, 0.06, 0.8, 12]} />
        {material}
      </mesh>

      {/* Left leg */}
      <mesh position={[-0.14, -0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.08, 1.0, 12]} />
        {material}
      </mesh>

      {/* Right leg */}
      <mesh position={[0.14, -0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.08, 1.0, 12]} />
        {material}
      </mesh>
    </group>
  )
}

function RadiantParticles() {
  const pointsRef = useRef<THREE.Points>(null)
  const count = 50

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const r = 1.2 + Math.random() * 0.5
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.cos(phi) + 0.5
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.1
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#facc15" transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

function AvatarScene({ state }: { state: HealthState }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 5, 3]} intensity={1.5} color="#a78bfa" />
      <pointLight position={[-3, 2, -2]} intensity={0.8} color="#06b6d4" />
      <Environment preset="night" />
      <GeometricAvatar state={state} />
      {state === "radiant" && <RadiantParticles />}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  )
}

export function AvatarViewer({ state }: AvatarViewerProps) {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 0.5, 3.5], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <AvatarScene state={state} />
      </Canvas>
    </div>
  )
}

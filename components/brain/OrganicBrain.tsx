"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { createNoise3D } from "simplex-noise"

/**
 * Procedural seeded RNG so simplex-noise produces the *same* organic
 * topology on every mount. Without a seed, every reload re-shuffles
 * the gyri/sulci, which feels wrong for a permanent "brain".
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Props {
  segments?: number // 128 desktop · 64 mobile
}

const VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying float vElevation;
  uniform float uTime;

  void main() {
    vNormal = normalize(normalMatrix * normal);

    // Gentle breathing pulse along the normal (sub-millimeter scale).
    float pulse = sin(uTime * 0.8 + position.y * 2.0) * 0.012;
    vec3 displaced = position + normal * pulse;
    vElevation = pulse;

    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const FRAGMENT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying float vElevation;

  uniform float uTime;
  uniform float uPulseSpeed;
  uniform vec3  uBaseColor;
  uniform vec3  uEmissiveColor;
  uniform vec3  uRimColor;
  uniform float uGlowIntensity;
  uniform float uSulciDepth;
  uniform vec3  uCameraPosition;

  void main() {
    // Rim lighting (Fresnel) → bioluminescent silhouette.
    vec3 viewDir = normalize(uCameraPosition - vWorldPos);
    float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
    rim = pow(rim, 2.5);

    // Synaptic flash: a slow vertical wave that flickers brighter on its peaks.
    float wave = sin(vWorldPos.y * 3.0 + uTime * uPulseSpeed) * 0.5 + 0.5;
    float synapticFlash = pow(wave, 4.0) * 0.3;

    // Sulci (the dark grooves of the cortex): darken where the breathing
    // pulse compresses inward.
    float sulci = 1.0 - abs(vElevation) * uSulciDepth * 10.0;
    sulci = clamp(sulci, 0.3, 1.0);

    vec3 baseCol  = uBaseColor * sulci;
    vec3 emissive = uEmissiveColor * (rim * uGlowIntensity + synapticFlash);
    vec3 rimCol   = uRimColor * rim * 0.6;

    gl_FragColor = vec4(baseCol + emissive + rimCol, 0.92);
  }
`

export function OrganicBrain({ segments = 128 }: Props) {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(2.4, segments, segments)
    const positions = geo.attributes.position
    const noise3D = createNoise3D(mulberry32(42))

    const v = new THREE.Vector3()
    const n = new THREE.Vector3()
    for (let i = 0; i < positions.count; i++) {
      v.set(positions.getX(i), positions.getY(i), positions.getZ(i))
      n.copy(v).normalize()
      // Layered noise = main folds (low freq) + detail (high freq).
      const macro = noise3D(v.x * 0.7, v.y * 0.7, v.z * 0.7)
      const detail = noise3D(v.x * 1.9, v.y * 1.9, v.z * 1.9) * 0.35
      const displacement = (macro + detail) * 0.32
      v.addScaledVector(n, displacement)
      positions.setXYZ(i, v.x, v.y, v.z)
    }
    geo.computeVertexNormals()
    return geo
  }, [segments])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPulseSpeed: { value: 0.8 },
      uBaseColor: { value: new THREE.Color("#1a0533") },
      uEmissiveColor: { value: new THREE.Color("#7C3AED") },
      uRimColor: { value: new THREE.Color("#EC4899") },
      uGlowIntensity: { value: 1.2 },
      uSulciDepth: { value: 0.4 },
      uCameraPosition: { value: new THREE.Vector3() },
    }),
    [],
  )

  useFrame((state) => {
    if (!matRef.current) return
    const u = matRef.current.uniforms
    u.uTime.value = state.clock.getElapsedTime()
    u.uCameraPosition.value.copy(state.camera.position)
  })

  return (
    <mesh geometry={geometry} renderOrder={0}>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

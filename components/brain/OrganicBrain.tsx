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

/**
 * NOTE: Three.js auto-injects `cameraPosition` (world space) and `modelMatrix`
 * into every ShaderMaterial. We rely on those instead of a custom uniform —
 * that was the bug: the manual uniform was either stale on first frame or
 * mis-aligned with the world-space `vPosition`, killing the rim term entirely.
 */
const VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;     // world-space position (matches built-in cameraPosition)
  varying float vElevation;
  uniform float uTime;

  void main() {
    // Sub-millimeter breathing pulse along the normal.
    float pulse = sin(uTime * 0.8 + position.y * 2.0) * 0.012;
    vec3 displaced = position + normal * pulse;
    vElevation = pulse;

    // World-space normal (so cameraPosition - vPosition lives in the same space).
    vNormal = normalize(mat3(modelMatrix) * normal);

    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const FRAGMENT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vElevation;

  uniform float uTime;
  uniform float uPulseSpeed;
  uniform vec3  uBaseColor;
  uniform vec3  uEmissiveColor;
  uniform vec3  uRimColor;
  uniform float uGlowIntensity;
  uniform float uSulciDepth;
  uniform float uAmbientFill;
  // Three.js auto-injects:
  //   uniform vec3 cameraPosition;

  void main() {
    // ── Rim lighting (Fresnel) — formula per Antovel spec ──
    float rim = 1.0 - max(dot(normalize(vNormal), normalize(cameraPosition - vPosition)), 0.0);
    rim = pow(rim, 2.5);

    // Synaptic flash: vertical wave that flickers on its peaks.
    float wave = sin(vPosition.y * 3.0 + uTime * uPulseSpeed) * 0.5 + 0.5;
    float synapticFlash = pow(wave, 4.0) * 0.45;

    // Sulci: darken where the breathing pulse compresses inward.
    float sulci = 1.0 - abs(vElevation) * uSulciDepth * 10.0;
    sulci = clamp(sulci, 0.45, 1.0);

    // Front-facing fill so the centre of the silhouette is never pitch-black.
    // (ShaderMaterial doesn't receive Three's ambient/hemi lights, so we fake it.)
    float facing = max(dot(normalize(vNormal), normalize(cameraPosition - vPosition)), 0.0);
    vec3 ambientFill = uBaseColor * (0.6 + facing * 0.4) * uAmbientFill;

    vec3 baseCol  = uBaseColor * sulci;
    vec3 emissive = uEmissiveColor * (rim * uGlowIntensity + synapticFlash);
    vec3 rimCol   = uRimColor * rim * 0.7;

    gl_FragColor = vec4(baseCol + ambientFill + emissive + rimCol, 1.0);
  }
`

export function OrganicBrain({ segments = 128 }: Props) {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const radius = 2.4
    const geo = new THREE.SphereGeometry(radius, segments, segments)
    const positions = geo.attributes.position
    const noise3D = createNoise3D(mulberry32(42))

    // Cap displacement to <20% of the radius (per spec: keep folds subtle so
    // the silhouette stays clearly spheroidal).
    const MAX_DISPLACEMENT = radius * 0.18 // 0.432 → ~18% of 2.4

    const v = new THREE.Vector3()
    const n = new THREE.Vector3()
    for (let i = 0; i < positions.count; i++) {
      v.set(positions.getX(i), positions.getY(i), positions.getZ(i))
      n.copy(v).normalize()
      const macro = noise3D(v.x * 0.7, v.y * 0.7, v.z * 0.7)
      const detail = noise3D(v.x * 1.9, v.y * 1.9, v.z * 1.9) * 0.35
      // Map noise (-1.35..1.35) → (-MAX..MAX)
      const raw = (macro + detail) / 1.35
      const displacement = THREE.MathUtils.clamp(raw, -1, 1) * MAX_DISPLACEMENT
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
      // Brighter base so the centre of the silhouette is visible without
      // depending entirely on the rim term.
      uBaseColor: { value: new THREE.Color("#3a1170") },
      uEmissiveColor: { value: new THREE.Color("#A78BFA") },
      uRimColor: { value: new THREE.Color("#EC4899") },
      uGlowIntensity: { value: 1.6 },
      uSulciDepth: { value: 0.4 },
      uAmbientFill: { value: 0.55 },
    }),
    [],
  )

  useFrame((state) => {
    if (!matRef.current) return
    matRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
    // cameraPosition is auto-updated by Three.js per render — no manual sync.
  })

  // renderOrder=0 (default) + opaque depthWrite ensures the brain anchors
  // the depth buffer; tokens (renderOrder ≥ 1) and additive particles draw on top.
  return (
    <mesh geometry={geometry} renderOrder={0}>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        transparent={false}
        depthWrite={true}
        depthTest={true}
      />
    </mesh>
  )
}

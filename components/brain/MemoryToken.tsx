"use client"

import { useMemo, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import type { ThreeEvent } from "@react-three/fiber"
import * as THREE from "three"
import { Image } from "@react-three/drei"
import type { Memory, MemoryExtended, TherapeuticTag } from "@/lib/types"

interface Props {
  memory: Memory
  /**
   * The TARGET world position the token should morph toward. The token
   * keeps an internal Vector3 it lerps toward this each frame, so when
   * the brain mode changes (cluster → time → map → people) the node
   * smoothly travels across instead of teleporting.
   */
  position: THREE.Vector3
  /** 0..1 — visibility multiplier from year/type filters and geo dim. */
  visibility: number
  /** Boost glow + add an individual point light (e.g. matched by location). */
  isHighlighted: boolean
  /** Geometry detail: 1 desktop · 0 mobile (low-poly octahedron). */
  detail?: number
  onSelect: (m: Memory) => void
}

/* ──────────────────────────────────────────
   Deterministic per-id RNG (seeded waveforms).
   ────────────────────────────────────────── */
function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h) || 1
}
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ──────────────────────────────────────────
   Therapeutic tag → size multiplier.
   identity memories are the biggest (most
   important for reminiscence), sensory the
   smallest ambient nodes.
   ────────────────────────────────────────── */
const THERAPEUTIC_SIZE: Record<TherapeuticTag, number> = {
  identity: 1.5,
  family_bond: 1.35,
  life_milestone: 1.25,
  happy_place: 1.15,
  daily_anchor: 1.0,
  sensory: 0.9,
}

/* ──────────────────────────────────────────
   Procedural thumbnail per memory type.
   No external assets — pure geometry/canvas.
   ────────────────────────────────────────── */

function PhotoThumbnail({ memory }: { memory: Memory }) {
  const ext = memory as MemoryExtended
  const [imgError, setImgError] = useState(false)
  
  const rawUrl = ext.thumbnailUrl || (memory as any).imageUrl

  const safeUrl = rawUrl && 
    !rawUrl.includes('undefined') && 
    !rawUrl.includes('null')
    ? rawUrl 
    : null

  const imageUrl = safeUrl

  return (
    <mesh position={[0, 0, 0]} scale={[0.2, 0.15, 1]}>
      <planeGeometry args={[1, 1]} />
      {imageUrl && !imgError ? (
        <Image 
          url={imageUrl} 
          transparent 
          opacity={0.95} 
          toneMapped={false} 
          crossOrigin="anonymous"
          onError={(e) => {
            console.error("Error cargando imagen en MemoryToken:", e)
            setImgError(true)
          }}
        />
      ) : (
        <meshBasicMaterial color={memory.color} transparent opacity={0.95} toneMapped={false} />
      )}
    </mesh>
  )
}

function AudioWaveform({ color, seed }: { color: string; seed: number }) {
  const bars = useMemo(() => {
    const rnd = mulberry32(seed)
    return Array.from({ length: 12 }, (_, i) => ({
      height: 0.03 + rnd() * 0.08,
      x: (i - 5.5) * 0.018,
    }))
  }, [seed])
  return (
    <group>
      {bars.map((b, i) => (
        <mesh key={i} position={[b.x, 0, 0]}>
          <boxGeometry args={[0.012, b.height, 0.005]} />
          <meshBasicMaterial color={color} transparent opacity={0.95} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function VideoPreview({ color }: { color: string }) {
  return (
    <group>
      <mesh>
        <planeGeometry args={[0.2, 0.14]} />
        <meshBasicMaterial color="#080814" transparent opacity={0.85} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.005]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.04, 0.06, 3]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} toneMapped={false} />
      </mesh>
    </group>
  )
}

function NoteLines({ color }: { color: string }) {
  const lines = [0.16, 0.13, 0.16, 0.1]
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[0.2, 0.14]} />
        <meshBasicMaterial color="#0c0c1a" transparent opacity={0.65} toneMapped={false} />
      </mesh>
      {lines.map((w, i) => (
        <mesh key={i} position={[-(0.2 - w) / 2, 0.04 - i * 0.024, 0.001]}>
          <boxGeometry args={[w, 0.005, 0.001]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function MemoryThumbnail({ memory }: { memory: Memory }) {
  switch (memory.type) {
    case "photo":
      return <PhotoThumbnail memory={memory} />
    case "audio":
      return <AudioWaveform color={memory.color} seed={hashId(memory.id)} />
    case "video":
      return <VideoPreview color={memory.color} />
    case "note":
      return <NoteLines color={memory.color} />
    default:
      return null
  }
}

/* ──────────────────────────────────────────
   Family donation ring — golden torus that
   slowly rotates around donated memories.
   ────────────────────────────────────────── */
function FamilyRing({ nodeSize }: { nodeSize: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.8
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[nodeSize * 7, nodeSize * 0.5, 8, 32]} />
      <meshBasicMaterial
        color="#F59E0B"
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

/* ──────────────────────────────────────────
   The MemoryToken: an octahedral crystal that
   refracts light, levitates with a unique offset
   per id, AND morphs smoothly toward a target
   world position when the brain mode changes.

   Enhanced with:
   - Therapeutic tag–based sizing
   - Organic breathing oscillation per node
   - Golden family donation ring
   ────────────────────────────────────────── */
export function MemoryToken({
  memory,
  position,
  visibility,
  isHighlighted,
  detail = 1,
  onSelect,
}: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Internal current position — initialized from the first target so the
  // node starts in place on mount, then lerps toward future target updates.
  const currentPos = useRef(position.clone())

  const offset = useMemo(() => hashId(memory.id) % 1000, [memory.id])

  // Extended memory fields (therapeutic tag, family donation)
  const ext = memory as MemoryExtended
  const therapeuticSize = ext.therapeuticTag
    ? THERAPEUTIC_SIZE[ext.therapeuticTag]
    : 1.0
  const isFamilyDonation = ext.isFamilyDonation && ext.injectionStatus === "active"

  const geometry = useMemo(() => {
    const geo = new THREE.OctahedronGeometry(0.18, detail)
    geo.scale(1, 1.4, 1)
    return geo
  }, [detail])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()

    // ── MORPH: ease toward the target every frame. The clamp on the lerp
    // factor prevents big jumps on slow frames (delta spikes after tab switches).
    const lerpFactor = Math.min(delta * 3.5, 1)
    currentPos.current.lerp(position, lerpFactor)

    // ── LEVITATION: each token bobs on its own phase around the morph path.
    const lift = Math.sin(t * 0.6 + offset) * 0.08
    groupRef.current.position.set(
      currentPos.current.x,
      currentPos.current.y + lift,
      currentPos.current.z,
    )

    if (innerRef.current) {
      // ── ROTATION: unique per node
      innerRef.current.rotation.y += delta * (0.2 + (offset % 5) * 0.1)
      innerRef.current.rotation.x += delta * (0.1 + (offset % 3) * 0.05)

      // ── BREATHING: organic oscillation unique to each node
      const breathPhase = offset * 0.4
      const breathing = 1 + Math.sin(t * 0.8 + breathPhase) * 0.12

      // ── SCALE: therapeutic size × breathing × hover/highlight
      const interactionScale = isHighlighted ? 1.0 : hovered ? 1.18 : 1.0
      const targetScale = therapeuticSize * breathing * interactionScale

      // Hover gets a fast pulse overlay
      const hoverPulse = hovered ? 1 + Math.sin(t * 4) * 0.08 : 1.0

      const cur = innerRef.current.scale.x
      const next = cur + (targetScale * hoverPulse - cur) * 0.12
      innerRef.current.scale.setScalar(next)
    }

    if (haloRef.current) {
      const beat =
        (Math.sin(t * 0.9 + offset) * 0.5 + 0.5) * 0.3 + (isHighlighted ? 1.6 : 1.25)
      haloRef.current.scale.setScalar(beat * therapeuticSize)
    }
  })

  if (visibility < 0.04) return null

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onSelect(memory)
  }
  const handleEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = "pointer"
  }
  const handleLeave = () => {
    setHovered(false)
    document.body.style.cursor = "auto"
  }

  const emissiveBoost = isHighlighted ? 2.0 : hovered ? 1.4 : 0.6
  const haloOpacity = isHighlighted ? 0.18 : hovered ? 0.1 : 0.05

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      <mesh ref={innerRef} geometry={geometry}>
        <meshPhysicalMaterial
          color={memory.color}
          emissive={memory.color}
          emissiveIntensity={emissiveBoost * visibility}
          transparent
          opacity={0.78 * visibility}
          roughness={0.05}
          metalness={0.1}
          transmission={isFamilyDonation ? 0.3 : 0.4}
          thickness={0.5}
          ior={1.8}
          envMapIntensity={2.0}
          toneMapped={false}
        />
      </mesh>

      <group scale={visibility}>
        <MemoryThumbnail memory={memory} />
      </group>

      <mesh ref={haloRef} renderOrder={2}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial
          color={memory.color}
          transparent
          opacity={haloOpacity * visibility}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Golden ring for family donations */}
      {isFamilyDonation && <FamilyRing nodeSize={0.18 * therapeuticSize} />}

      {/* Point light on highlighted and identity nodes */}
      {(isHighlighted || ext.therapeuticTag === "identity") && (
        <pointLight color={memory.color} intensity={1.5} distance={2} />
      )}
    </group>
  )
}

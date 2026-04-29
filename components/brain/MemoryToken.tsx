"use client"

import { useMemo, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import type { ThreeEvent } from "@react-three/fiber"
import * as THREE from "three"
import type { Memory } from "@/lib/types"

interface Props {
  memory: Memory
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
   Procedural thumbnail per memory type.
   No external assets — pure geometry/canvas.
   ────────────────────────────────────────── */

function PhotoThumbnail({ memory }: { memory: Memory }) {
  const texture = useMemo(() => {
    const seed = hashId(memory.id)
    const rnd = mulberry32(seed)
    const W = 128
    const H = 96
    const c = document.createElement("canvas")
    c.width = W
    c.height = H
    const ctx = c.getContext("2d")!

    // Diagonal gradient seeded by memory color → recognizable but unique.
    const base = new THREE.Color(memory.color)
    const dark = base.clone().multiplyScalar(0.35)
    const light = base.clone().multiplyScalar(1.4)
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, "#" + dark.getHexString())
    grad.addColorStop(1, "#" + light.getHexString())
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // 3 abstract horizon bands (pseudo landscape).
    for (let i = 0; i < 3; i++) {
      const y = H * (0.4 + rnd() * 0.5)
      ctx.beginPath()
      ctx.moveTo(0, y)
      for (let x = 0; x <= W; x += 8) {
        ctx.lineTo(x, y + Math.sin((x / W) * Math.PI * 2 + rnd() * 6) * 4)
      }
      ctx.lineTo(W, H)
      ctx.lineTo(0, H)
      ctx.closePath()
      ctx.fillStyle = `rgba(0,0,0,${0.15 + i * 0.1})`
      ctx.fill()
    }

    // Soft glow disc (sun/highlight).
    const cx = W * (0.2 + rnd() * 0.6)
    const cy = H * (0.15 + rnd() * 0.25)
    const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22)
    radial.addColorStop(0, "rgba(255,255,255,0.85)")
    radial.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = radial
    ctx.fillRect(0, 0, W, H)

    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.needsUpdate = true
    return tex
  }, [memory.id, memory.color])

  return (
    <mesh position={[0, 0, 0]} scale={[0.2, 0.15, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent opacity={0.95} toneMapped={false} />
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
      {/* Dark plate */}
      <mesh>
        <planeGeometry args={[0.2, 0.14]} />
        <meshBasicMaterial color="#080814" transparent opacity={0.85} toneMapped={false} />
      </mesh>
      {/* Play triangle (cone with 3 segments, rotated to point right) */}
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
   The MemoryToken: an octahedral crystal that
   refracts light, levitates with a unique offset
   per id, and contains a holographic thumbnail.
   ────────────────────────────────────────── */
export function MemoryToken({ memory, position, visibility, isHighlighted, detail = 1, onSelect }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const offset = useMemo(() => hashId(memory.id) % 1000, [memory.id])

  const geometry = useMemo(() => {
    const geo = new THREE.OctahedronGeometry(0.18, detail)
    geo.scale(1, 1.4, 1) // capsule-like vertical stretch
    return geo
  }, [detail])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    // Levitation: each token bobs on its own phase.
    const lift = Math.sin(t * 0.6 + offset) * 0.08
    groupRef.current.position.set(position.x, position.y + lift, position.z)

    // Inner crystal slow rotation.
    if (innerRef.current) {
      innerRef.current.rotation.y += 0.004
      const targetScale = isHighlighted ? 1.0 : hovered ? 1.18 : 1.0
      const cur = innerRef.current.scale.x
      const next = cur + (targetScale - cur) * 0.12
      innerRef.current.scale.setScalar(next)
    }

    // Halo gentle pulse (ties the visual into the brain's heartbeat).
    if (haloRef.current) {
      const beat = (Math.sin(t * 0.9 + offset) * 0.5 + 0.5) * 0.3 + (isHighlighted ? 1.6 : 1.25)
      haloRef.current.scale.setScalar(beat)
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
      position={position}
      onClick={handleClick}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      {/* Crystal body */}
      <mesh ref={innerRef} geometry={geometry}>
        <meshPhysicalMaterial
          color={memory.color}
          emissive={memory.color}
          emissiveIntensity={emissiveBoost * visibility}
          transparent
          opacity={0.78 * visibility}
          roughness={0.05}
          metalness={0.1}
          transmission={0.4}
          thickness={0.5}
          ior={1.8}
          envMapIntensity={2.0}
          toneMapped={false}
        />
      </mesh>

      {/* Holographic thumbnail inside the crystal */}
      <group scale={visibility}>
        <MemoryThumbnail memory={memory} />
      </group>

      {/* Outer halo (back-side sphere = glow without occluding the crystal) */}
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

      {/* Per-token point light when highlighted */}
      {isHighlighted && <pointLight color={memory.color} intensity={1.5} distance={2} />}
    </group>
  )
}

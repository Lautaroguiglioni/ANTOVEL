import * as THREE from "three"
import type { Memory, MemoryType, Connection } from "@/lib/types"

/* ─────────────────────────────────────
   Memory type → semantic color
   (used by both the 3D node material
    and 2D UI accents — single source of
    truth so they stay in sync).
   ───────────────────────────────────── */
export const MEMORY_TYPE_COLOR: Record<MemoryType, string> = {
  photo: "#06B6D4", // cyan
  audio: "#EC4899", // magenta
  video: "#F59E0B", // amber
  note: "#10B981", // emerald
}

export const MEMORY_TYPE_LABEL: Record<MemoryType, string> = {
  photo: "Fotos",
  audio: "Audios",
  video: "Videos",
  note: "Notas",
}

/**
 * Distribute `count` points evenly across the surface of a sphere of `radius`
 * using the golden-ratio Fibonacci algorithm (no clustering at the poles).
 */
export function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  const goldenRatio = (1 + Math.sqrt(5)) / 2
  for (let i = 0; i < count; i++) {
    // theta sweeps from 0..π (latitude); phi rotates with golden angle.
    const theta = Math.acos(1 - (2 * (i + 0.5)) / count)
    const phi = (2 * Math.PI * i) / goldenRatio
    points.push(
      new THREE.Vector3(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(theta),
      ),
    )
  }
  return points
}

/**
 * Build cronological connections between memories.
 * Rules:
 *  - Connect each memory to its next 1 or 2 successors (max 3 connections per node).
 *  - Only keep edges with daysDiff <= 30 (same month-ish).
 */
export function buildConnections(memories: Memory[]): Connection[] {
  const sorted = [...memories].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )
  const connections: Connection[] = []
  const DAY = 1000 * 60 * 60 * 24

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < Math.min(i + 3, sorted.length); j++) {
      const daysDiff = Math.abs(
        (new Date(sorted[j].date).getTime() - new Date(sorted[i].date).getTime()) / DAY,
      )
      if (daysDiff <= 30) {
        connections.push({ from: sorted[i].id, to: sorted[j].id, daysDiff })
      }
    }
  }
  return connections
}

/**
 * Quadratic-bezier curve between two surface nodes, bowed slightly toward
 * the brain center so the line drapes "around" the volume instead of cutting through.
 */
export function curveBetween(
  a: THREE.Vector3,
  b: THREE.Vector3,
  bow = 0.5,
): THREE.QuadraticBezierCurve3 {
  const mid = a.clone().add(b).multiplyScalar(0.5)
  // Push the control point toward the center of the sphere (the brain's geometric core).
  const toward = mid.clone().multiplyScalar(-bow).add(mid)
  return new THREE.QuadraticBezierCurve3(a, toward, b)
}

/**
 * Edge color/opacity classification:
 *  - same week (≤7d) → violet, stronger
 *  - same month (≤30d) → cyan, softer
 */
export function classifyConnection(daysDiff: number): { color: string; opacity: number } {
  if (daysDiff <= 7) return { color: "#7C3AED", opacity: 0.6 }
  return { color: "#06B6D4", opacity: 0.4 }
}

/** Format a date like "12 de marzo, 2022" in es-AR. */
export function formatMemoryDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/* ─────────────────────────────────────
   Brain spatial modes — Phase 2 morph
   (additive: cluster is the original
    Fibonacci, kept untouched)
   ───────────────────────────────────── */

export type BrainMode = "cluster" | "time" | "map" | "people"

/** Stable per-id RNG so positions don't jitter between frames. */
function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h) || 1
}

/**
 * MODE: TIME — chronological 3D spiral.
 * Older memories sit at the back (negative Z), newer at the front.
 * 3 full revolutions, vertical spread of 4 units, depth spread of 6.
 */
export function getTimePosition(memory: Memory, allMemories: Memory[]): THREE.Vector3 {
  const sorted = [...allMemories].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )
  const idx = sorted.findIndex((m) => m.id === memory.id)
  const denom = Math.max(sorted.length - 1, 1)
  const t = idx / denom // 0 oldest → 1 newest

  const angle = t * Math.PI * 6
  const radius = 1.6 + t * 1.2
  return new THREE.Vector3(
    Math.cos(angle) * radius,
    (t - 0.5) * 4,
    (t - 0.5) * -6,
  )
}

/**
 * MODE: MAP — geographic clusters.
 * Memories are grouped by `location.name`; each cluster gets a stable
 * slot on a wide ring around the origin. Memories without location
 * drift behind the camera in a soft cloud.
 */
export function getMapPosition(memory: Memory, allMemories: Memory[]): THREE.Vector3 {
  if (!memory.location) {
    const seed = hashId(memory.id)
    return new THREE.Vector3(
      Math.sin(seed * 0.7) * 0.7,
      Math.cos(seed * 1.3) * 0.7,
      -3.6,
    )
  }
  // Stable, deterministic order of unique location names.
  const locations = Array.from(
    new Set(allMemories.filter((m) => m.location).map((m) => m.location!.name)),
  ).sort()
  const idx = Math.max(locations.indexOf(memory.location.name), 0)
  const total = Math.max(locations.length, 1)
  const angle = (idx / total) * Math.PI * 2
  const ringR = 3.2
  const center = new THREE.Vector3(
    Math.cos(angle) * ringR,
    Math.sin(angle) * ringR * 0.42, // slight ellipse so it reads as 3D
    Math.sin(angle * 2) * 0.9,
  )
  const seed = hashId(memory.id)
  return center.add(
    new THREE.Vector3(
      Math.sin(seed * 0.7) * 0.55,
      Math.cos(seed * 1.3) * 0.55,
      Math.sin(seed * 2.1) * 0.35,
    ),
  )
}

/**
 * MODE: PEOPLE — relational planets.
 * Each tag-group gets a fixed gravity well; memories drift around it.
 * Match priority follows TAG_GROUPS order so a memory with both
 * "Familia" and "Viajes" lands in the family planet.
 */
const TAG_GROUPS: Array<{ name: string; tags: string[]; center: [number, number, number] }> = [
  { name: "Familia", tags: ["Familia", "Amor"], center: [-2.6, 0.6, 0] },
  { name: "Amigos", tags: ["Amigos", "Celebración"], center: [2.6, 0.6, 0] },
  { name: "Trabajo", tags: ["Carrera", "Trabajo"], center: [0, 2.6, 0] },
  {
    name: "Personal",
    tags: ["Personal", "Reflexión", "Hogar", "Filosofía", "Voz"],
    center: [0, -2.6, 0],
  },
  {
    name: "Viajes",
    tags: ["Viajes", "Aventura", "Naturaleza", "Mar"],
    center: [0, 0, 3],
  },
  {
    name: "Creatividad",
    tags: ["Música", "Creatividad", "Gastronomía"],
    center: [0, 0, -3],
  },
]

export function getPeopleGroupCenters(): Array<{
  name: string
  center: THREE.Vector3
}> {
  return TAG_GROUPS.map((g) => ({
    name: g.name,
    center: new THREE.Vector3(...g.center),
  }))
}

export function getPeoplePosition(memory: Memory): THREE.Vector3 {
  const group = TAG_GROUPS.find((g) => g.tags.some((t) => memory.tags.includes(t)))
  const base = group ? new THREE.Vector3(...group.center) : new THREE.Vector3(0, 0, 0)
  const seed = hashId(memory.id)
  return base.add(
    new THREE.Vector3(
      Math.sin(seed * 0.9) * 0.85,
      Math.cos(seed * 1.7) * 0.85,
      Math.sin(seed * 2.3) * 0.85,
    ),
  )
}

/**
 * Master interpolator — given a memory and the active mode, returns its
 * target world position. The MemoryToken lerps from current → target.
 * For cluster mode, the BrainScene already precomputes Fibonacci points,
 * so this helper falls back to (0,0,0) and the scene overrides per id.
 */
export function getTargetPosition(
  memory: Memory,
  allMemories: Memory[],
  mode: BrainMode,
  fallback: THREE.Vector3,
): THREE.Vector3 {
  switch (mode) {
    case "cluster":
      return fallback
    case "time":
      return getTimePosition(memory, allMemories)
    case "map":
      return getMapPosition(memory, allMemories)
    case "people":
      return getPeoplePosition(memory)
  }
}

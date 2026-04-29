"use client"

import { useMemo } from "react"

type Node = { x: number; y: number; r: number }
type Edge = { a: number; b: number }

/**
 * Cinematic neural background.
 * Three parallax layers of diffused neural nodes + connections,
 * each drifting in a different direction at a different speed.
 */
export function NeuralBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* Deep vignette / base color */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_75%,rgba(0,0,0,0.85)_100%)]" />

      {/* Layer 3 — farthest, slowest, most blurred */}
      <div className="absolute inset-[-15%] animate-neural-drift-3 opacity-[0.35] [filter:blur(28px)]">
        <NeuralLayer
          seed={11}
          count={14}
          color="rgba(124,58,237,0.55)"
          accent="rgba(236,72,153,0.35)"
        />
      </div>

      {/* Layer 2 — mid */}
      <div className="absolute inset-[-10%] animate-neural-drift-2 opacity-[0.45] [filter:blur(14px)]">
        <NeuralLayer
          seed={29}
          count={18}
          color="rgba(167,139,250,0.6)"
          accent="rgba(236,72,153,0.45)"
        />
      </div>

      {/* Layer 1 — closest, sharpest, fastest */}
      <div className="absolute inset-[-5%] animate-neural-drift-1 opacity-[0.6] [filter:blur(4px)]">
        <NeuralLayer
          seed={47}
          count={22}
          color="rgba(196,181,253,0.85)"
          accent="rgba(244,114,182,0.7)"
        />
      </div>

      {/* Subtle grain to break banding */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:3px_3px]" />
    </div>
  )
}

function NeuralLayer({
  seed,
  count,
  color,
  accent,
}: {
  seed: number
  count: number
  color: string
  accent: string
}) {
  const { nodes, edges } = useMemo(() => generateGraph(seed, count), [seed, count])

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      <defs>
        <radialGradient id={`node-${seed}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="60%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`node-accent-${seed}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="1" />
          <stop offset="60%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Connections */}
      <g stroke={color} strokeWidth="0.12" opacity="0.5">
        {edges.map((e, i) => {
          const a = nodes[e.a]
          const b = nodes[e.b]
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
        })}
      </g>

      {/* Nodes (mix of violet + magenta accents) */}
      <g>
        {nodes.map((n, i) => {
          const isAccent = i % 5 === 0
          return (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={`url(#${isAccent ? `node-accent-${seed}` : `node-${seed}`})`}
            />
          )
        })}
      </g>
    </svg>
  )
}

/** Deterministic pseudo-random graph so SSR/CSR match */
function generateGraph(seed: number, count: number): { nodes: Node[]; edges: Edge[] } {
  const rng = mulberry32(seed)
  const nodes: Node[] = Array.from({ length: count }, () => ({
    x: rng() * 100,
    y: rng() * 100,
    r: 0.6 + rng() * 1.8,
  }))

  const edges: Edge[] = []
  for (let i = 0; i < nodes.length; i++) {
    // connect each node to ~2 nearest neighbours
    const dists = nodes
      .map((n, j) => ({
        j,
        d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y),
      }))
      .filter((x) => x.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
    for (const { j } of dists) {
      const a = Math.min(i, j)
      const b = Math.max(i, j)
      if (!edges.find((e) => e.a === a && e.b === b)) edges.push({ a, b })
    }
  }
  return { nodes, edges }
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

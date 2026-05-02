"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useId } from "react"

interface Props {
  /** Rendered size in px (square). Defaults to 64. */
  size?: number
  /** Wraps the logo in a 3s vertical levitation loop via framer-motion. */
  animated?: boolean
  /** External drop-shadow glow under the logo. */
  glow?: boolean
  className?: string
  /** Use as decoration: hides from screen readers. */
  decorative?: boolean
}

/**
 * <LogoAntovel /> — pure SVG identity built with the brand gradients
 * (#7C3AED violet → #EC4899 magenta). Scales cleanly from 16px to 512px,
 * has its own glow, and respects prefers-reduced-motion when animated.
 *
 * Replaces the legacy /antovel-logo.png raster (with its checkerboard alpha).
 */
export function LogoAntovel({
  size = 64,
  animated = false,
  glow = true,
  className,
  decorative = false,
}: Props) {
  const reduced = useReducedMotion()
  // Unique IDs per instance so multiple logos on a page don't collide.
  const uid = useId().replace(/:/g, "")
  const gradPetal = `lap-petal-${uid}`
  const gradHighlight = `lap-hl-${uid}`
  const gradNode = `lap-node-${uid}`
  const blurFilter = `lap-blur-${uid}`

  const svg = (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={size}
      role={decorative ? "presentation" : "img"}
      aria-label={decorative ? undefined : "Antovel"}
      aria-hidden={decorative || undefined}
      className={className}
      style={
        glow
          ? { filter: "drop-shadow(0 0 18px rgba(167,139,250,0.45))" }
          : undefined
      }
    >
      <defs>
        {/* Main petal gradient: violet → magenta */}
        <linearGradient id={gradPetal} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="55%" stopColor="#9D4EDD" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        {/* Inner highlight (gives the glassy front-lit feel) */}
        <linearGradient id={gradHighlight} x1="0.2" y1="0" x2="0.5" y2="0.6">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* Neural node radial */}
        <radialGradient id={gradNode}>
          <stop offset="0%" stopColor="#FBCFE8" />
          <stop offset="45%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
        <filter id={blurFilter} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* ── LEFT PETAL (curves down-left from apex) ── */}
      <g>
        <path
          d="M100 18 C 78 38, 58 70, 50 110 C 44 142, 50 178, 70 192 C 82 200, 96 196, 102 184 C 110 168, 110 138, 106 100 C 104 70, 102 42, 100 18 Z"
          fill={`url(#${gradPetal})`}
          opacity="0.95"
        />
        {/* Inner glassy highlight */}
        <path
          d="M96 30 C 80 52, 66 86, 62 116 C 60 136, 64 154, 74 162 C 82 168, 88 162, 90 150 C 94 122, 96 88, 98 50 Z"
          fill={`url(#${gradHighlight})`}
        />
      </g>

      {/* ── RIGHT PETAL (mirror) ── */}
      <g>
        <path
          d="M100 18 C 122 38, 142 70, 150 110 C 156 142, 150 178, 130 192 C 118 200, 104 196, 98 184 C 90 168, 90 138, 94 100 C 96 70, 98 42, 100 18 Z"
          fill={`url(#${gradPetal})`}
          opacity="0.95"
        />
        <path
          d="M104 30 C 120 52, 134 86, 138 116 C 140 136, 136 154, 126 162 C 118 168, 112 162, 110 150 C 106 122, 104 88, 102 50 Z"
          fill={`url(#${gradHighlight})`}
          opacity="0.7"
        />
      </g>

      {/* ── INNER NEURAL NETWORK ── */}
      {/* Synaptic threads */}
      <g
        stroke="#FBCFE8"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.65"
        fill="none"
      >
        {/* Left cluster */}
        <path d="M76 64 L 70 92 L 78 118 L 70 150" />
        <path d="M70 92 L 86 100 L 78 118" />
        {/* Right cluster */}
        <path d="M124 64 L 130 92 L 122 118 L 130 150" />
        <path d="M130 92 L 114 100 L 122 118" />
        {/* Cross-bridge between hemispheres (subtle) */}
        <path d="M86 100 L 114 100" opacity="0.5" />
      </g>

      {/* Neural nodes — soft glow halo + crisp core */}
      <g filter={`url(#${blurFilter})`} opacity="0.9">
        <circle cx="76" cy="64" r="5" fill={`url(#${gradNode})`} />
        <circle cx="70" cy="92" r="6" fill={`url(#${gradNode})`} />
        <circle cx="78" cy="118" r="5" fill={`url(#${gradNode})`} />
        <circle cx="70" cy="150" r="4" fill={`url(#${gradNode})`} />
        <circle cx="124" cy="64" r="5" fill={`url(#${gradNode})`} />
        <circle cx="130" cy="92" r="6" fill={`url(#${gradNode})`} />
        <circle cx="122" cy="118" r="5" fill={`url(#${gradNode})`} />
        <circle cx="130" cy="150" r="4" fill={`url(#${gradNode})`} />
      </g>
      <g>
        <circle cx="76" cy="64" r="2" fill="#FFE4F1" />
        <circle cx="70" cy="92" r="2.4" fill="#FFE4F1" />
        <circle cx="78" cy="118" r="2" fill="#FFE4F1" />
        <circle cx="70" cy="150" r="1.6" fill="#FFE4F1" />
        <circle cx="124" cy="64" r="2" fill="#FFE4F1" />
        <circle cx="130" cy="92" r="2.4" fill="#FFE4F1" />
        <circle cx="122" cy="118" r="2" fill="#FFE4F1" />
        <circle cx="130" cy="150" r="1.6" fill="#FFE4F1" />
      </g>
    </svg>
  )

  if (!animated || reduced) {
    return svg
  }

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{
        duration: 3,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
      }}
      className="will-change-transform"
      style={{ display: "inline-block", lineHeight: 0 }}
    >
      {svg}
    </motion.div>
  )
}

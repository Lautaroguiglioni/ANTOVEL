"use client"

import { motion } from "framer-motion"
import { Sparkles, Clock, MapPin, Users } from "lucide-react"
import { useBrainStore } from "@/lib/brain-store"
import type { BrainMode } from "@/lib/brain-logic"

const MODES: Array<{
  id: BrainMode
  icon: typeof Sparkles
  label: string
  color: string
}> = [
  { id: "cluster", icon: Sparkles, label: "Todo", color: "#7C3AED" },
  { id: "time", icon: Clock, label: "Tiempo", color: "#06B6D4" },
  { id: "map", icon: MapPin, label: "Lugares", color: "#10B981" },
  { id: "people", icon: Users, label: "Vínculos", color: "#EC4899" },
]

/**
 * Floating mode switcher anchored above the bottom TabBar (which is z-50).
 * Stays inside the brain page only — the TabBar handles app-level nav.
 */
export function ModeBar() {
  const brainMode = useBrainStore((s) => s.brainMode)
  const setBrainMode = useBrainStore((s) => s.setBrainMode)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      role="radiogroup"
      aria-label="Modo de visualización del cerebro"
      className="
        pointer-events-auto absolute left-1/2 z-30 flex -translate-x-1/2
        gap-1.5 rounded-2xl border border-white/8 p-1.5
        bg-black/55 backdrop-blur-xl
        shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)]
      "
      style={{
        // Sit just above the fixed TabBar (≈64px tall + safe-area).
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 5.5rem)",
      }}
    >
      {MODES.map((mode) => {
        const Icon = mode.icon
        const active = brainMode === mode.id
        return (
          <motion.button
            key={mode.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={mode.label}
            onClick={() => setBrainMode(mode.id)}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 700, damping: 35 }}
            className="
              flex min-w-[64px] flex-col items-center gap-0.5 rounded-xl
              px-3 py-1.5 outline-none transition-colors
              focus-visible:ring-2 focus-visible:ring-white/40
            "
            style={{
              background: active ? `${mode.color}26` : "transparent",
              border: active
                ? `1px solid ${mode.color}80`
                : "1px solid transparent",
              boxShadow: active
                ? `0 0 18px -6px ${mode.color}99, inset 0 0 12px -6px ${mode.color}66`
                : "none",
            }}
          >
            <Icon
              size={18}
              strokeWidth={2.2}
              style={{ color: active ? mode.color : "rgba(255,255,255,0.55)" }}
            />
            <span
              className="text-[10px] font-medium tracking-wide"
              style={{ color: active ? mode.color : "rgba(255,255,255,0.55)" }}
            >
              {mode.label}
            </span>
          </motion.button>
        )
      })}
    </motion.div>
  )
}

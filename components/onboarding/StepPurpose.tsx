"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  Activity,
  Brain,
  Check,
  Globe2,
  Heart,
  Palette,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import type { AntovelProfile, Purpose } from "@/lib/types"

type Props = {
  profile: Partial<AntovelProfile>
  onChange: (patch: Partial<AntovelProfile>) => void
}

const MAX_SELECTIONS = 3

const PURPOSES: {
  id: Purpose
  Icon: LucideIcon
  label: string
  /** Tinted ambient color for the icon chip. */
  tone: string
}[] = [
  { id: "memories", Icon: Brain, label: "Preservar mis recuerdos", tone: "#7C3AED" },
  { id: "share-family", Icon: Heart, label: "Compartirlo con mi familia", tone: "#EC4899" },
  { id: "leave-mark", Icon: Globe2, label: "Dejar huella en el mundo", tone: "#06B6D4" },
  { id: "wellness", Icon: Activity, label: "Monitorear mi bienestar", tone: "#10B981" },
  { id: "explore-history", Icon: Palette, label: "Explorar mi historia", tone: "#F59E0B" },
  { id: "discover-patterns", Icon: Sparkles, label: "Descubrir patrones", tone: "#A78BFA" },
]

export function StepPurpose({ profile, onChange }: Props) {
  const selected = profile.purposes ?? []
  const atMax = selected.length >= MAX_SELECTIONS

  const toggle = (id: Purpose) => {
    if (selected.includes(id)) {
      onChange({ purposes: selected.filter((s) => s !== id) })
    } else if (!atMax) {
      onChange({ purposes: [...selected, id] })
    }
  }

  return (
    <div className="flex w-full max-w-2xl flex-col">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[var(--neural-cyan)]">
        Paso 03 · Tu propósito
      </p>
      <h2 className="mb-3 font-display text-3xl font-bold leading-tight text-balance sm:text-4xl">
        ¿Por qué quieres construir tu legado?
      </h2>
      <p className="mb-2 text-pretty leading-relaxed text-muted-foreground">
        Elige todo lo que resuene contigo.
      </p>
      <p className="mb-6 text-xs text-muted-foreground/70">
        {selected.length} / {MAX_SELECTIONS} seleccionado
        {selected.length === 1 ? "" : "s"} · mínimo 1, máximo {MAX_SELECTIONS}
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PURPOSES.map((p) => {
          const active = selected.includes(p.id)
          const disabled = !active && atMax
          const Icon = p.Icon
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              disabled={disabled}
              aria-pressed={active}
              animate={{ scale: active ? 1.05 : 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              whileTap={!disabled ? { scale: active ? 1.02 : 0.98 } : undefined}
              className={[
                "group relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors",
                active
                  ? "border-[var(--neural-violet)] bg-[rgba(124,58,237,0.15)] shadow-[0_0_28px_rgba(124,58,237,0.3)]"
                  : "border-[#2a2a3a] bg-[#12121E] hover:border-foreground/25",
                disabled && "cursor-not-allowed opacity-40",
              ].join(" ")}
            >
              <span
                aria-hidden
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors"
                style={{
                  background: active ? `${p.tone}26` : "rgba(255,255,255,0.04)",
                  boxShadow: active ? `0 0 16px ${p.tone}66` : undefined,
                }}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={1.7}
                  style={{ color: active ? p.tone : "rgba(255,255,255,0.7)" }}
                />
              </span>
              <span className="flex-1 pr-6 font-display text-[15px] font-semibold leading-snug text-foreground">
                {p.label}
              </span>

              {/* Spring checkmark — appears with stiff overshoot */}
              <AnimatePresence>
                {active && (
                  <motion.span
                    aria-hidden
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 520, damping: 18 }}
                    className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--neural-violet)] shadow-[0_0_12px_rgba(124,58,237,0.7)]"
                  >
                    <Check
                      className="h-3 w-3 text-white"
                      strokeWidth={3}
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

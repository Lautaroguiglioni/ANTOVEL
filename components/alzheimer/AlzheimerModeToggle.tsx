"use client"

import { motion } from "framer-motion"
import { Heart, ShieldCheck } from "lucide-react"
import type { AppMode } from "@/lib/types"

interface Props {
  mode: AppMode
  onChange: (mode: AppMode) => void
}

const OPTIONS: { value: AppMode; label: string; description: string; icon: typeof Heart }[] = [
  {
    value: "personal",
    label: "Modo personal",
    description: "Cerebro digital propio, sin acompañamiento.",
    icon: ShieldCheck,
  },
  {
    value: "alzheimer_patient",
    label: "Acompañamiento Alzheimer",
    description: "Activa la Esencia, donaciones familiares y el asistente de voz.",
    icon: Heart,
  },
]

/**
 * Radio-style toggle to flip the household into Alzheimer-companion mode.
 * Lives in /profile/settings — does not auto-redirect, just changes the mode.
 */
export function AlzheimerModeToggle({ mode, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3" role="radiogroup" aria-label="Modo de la aplicación">
      {OPTIONS.map((opt) => {
        const active = mode === opt.value
        const Icon = opt.icon
        return (
          <motion.button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            whileTap={{ scale: 0.99 }}
            className="flex items-start gap-4 rounded-2xl border p-5 text-left transition-colors"
            style={{
              borderColor: active ? "#A78BFA" : "rgba(255,255,255,0.08)",
              background: active ? "rgba(124,58,237,0.14)" : "rgba(255,255,255,0.02)",
              boxShadow: active ? "0 0 32px rgba(167,139,250,0.25)" : "none",
            }}
          >
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: active ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.04)",
                color: active ? "#E9D5FF" : "#9ca3af",
              }}
            >
              <Icon className="size-5" />
            </span>
            <div className="flex-1">
              <p className="font-sans text-base font-semibold text-white">{opt.label}</p>
              <p className="mt-0.5 text-sm text-[#cbd5e1]">{opt.description}</p>
            </div>
            <span
              className="mt-1.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
              style={{
                borderColor: active ? "#A78BFA" : "rgba(255,255,255,0.2)",
                background: active ? "#A78BFA" : "transparent",
              }}
            >
              {active ? <span className="size-2 rounded-full bg-[#1A0F2E]" /> : null}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

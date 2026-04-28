"use client"

import { BookHeart, Brain, HeartPulse, Lightbulb, Users } from "lucide-react"
import type { AntovelProfile, LegacyIntent } from "@/lib/types"

type Props = {
  profile: Partial<AntovelProfile>
  onChange: (patch: Partial<AntovelProfile>) => void
}

const INTENTS: {
  id: LegacyIntent
  label: string
  description: string
  icon: typeof Brain
  color: string
}[] = [
  {
    id: "memories",
    label: "Recuerdos",
    description: "Fotos, videos, momentos clave",
    icon: BookHeart,
    color: "var(--neural-magenta)",
  },
  {
    id: "health",
    label: "Salud",
    description: "Cuerpo, sueño, bienestar",
    icon: HeartPulse,
    color: "var(--neural-cyan)",
  },
  {
    id: "wisdom",
    label: "Sabiduría",
    description: "Lecciones y aprendizajes",
    icon: Lightbulb,
    color: "var(--neural-violet)",
  },
  {
    id: "family",
    label: "Familia",
    description: "Vínculos y genealogía",
    icon: Users,
    color: "var(--neural-cyan)",
  },
  {
    id: "creative",
    label: "Creatividad",
    description: "Obra, ideas, proyectos",
    icon: Brain,
    color: "var(--neural-magenta)",
  },
]

export function StepIntent({ profile, onChange }: Props) {
  const selected = profile.intents ?? []

  const toggle = (id: LegacyIntent) => {
    const next = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id]
    onChange({ intents: next })
  }

  return (
    <div className="flex w-full max-w-md flex-col">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[var(--neural-cyan)]">
        Paso 03 · Intención
      </p>
      <h2 className="mb-3 font-display text-3xl font-bold leading-tight text-balance">
        ¿Qué quieres preservar?
      </h2>
      <p className="mb-6 text-pretty leading-relaxed text-muted-foreground">
        Elige los pilares de tu legado. Definirán los nodos iniciales de tu
        cerebro 3D.
      </p>

      <div className="flex flex-col gap-2.5">
        {INTENTS.map((intent) => {
          const active = selected.includes(intent.id)
          const Icon = intent.icon
          return (
            <button
              key={intent.id}
              type="button"
              onClick={() => toggle(intent.id)}
              className={[
                "group flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                active
                  ? "border-[var(--neural-violet)] bg-[var(--neural-violet)]/10"
                  : "border-[var(--border-strong)] bg-surface/60 hover:border-foreground/20",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all",
                  active
                    ? "border-transparent"
                    : "border-[var(--border-strong)] bg-surface",
                ].join(" ")}
                style={
                  active
                    ? {
                        background: `${intent.color}20`,
                        boxShadow: `0 0 20px ${intent.color}40`,
                      }
                    : undefined
                }
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={1.6}
                  style={{
                    color: active ? intent.color : "var(--muted-foreground)",
                  }}
                />
              </span>
              <span className="flex-1">
                <span className="block font-display text-base font-semibold text-foreground">
                  {intent.label}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {intent.description}
                </span>
              </span>
              <span
                aria-hidden
                className={[
                  "h-5 w-5 rounded-full border-2 transition-all",
                  active
                    ? "border-[var(--neural-violet)] bg-[var(--neural-violet)]"
                    : "border-foreground/20",
                ].join(" ")}
              >
                {active && (
                  <svg viewBox="0 0 20 20" className="h-full w-full p-0.5">
                    <path
                      d="M5 10l3 3 7-7"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

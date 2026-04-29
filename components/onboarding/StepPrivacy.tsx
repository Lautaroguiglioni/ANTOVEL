"use client"

import { Globe, Lock, Users, type LucideIcon } from "lucide-react"
import type { AntovelProfile, Privacy } from "@/lib/types"

type Props = {
  profile: Partial<AntovelProfile>
  onChange: (patch: Partial<AntovelProfile>) => void
}

type Option = {
  id: Privacy
  Icon: LucideIcon
  title: string
  description: string
  /** Active accent color used for border, glow and labels. */
  accent: string
  /** Softer accent for the gradient surface. */
  accentSoft: string
}

const OPTIONS: Option[] = [
  {
    id: "private",
    Icon: Lock,
    title: "Privado",
    description: "Solo tú puedes ver tu cerebro y recuerdos.",
    accent: "#7C3AED",
    accentSoft: "rgba(124, 58, 237, 0.18)",
  },
  {
    id: "contacts",
    Icon: Users,
    title: "Contactos",
    description: "Solo las personas que apruebes pueden explorar tu legado.",
    accent: "#06B6D4",
    accentSoft: "rgba(6, 182, 212, 0.18)",
  },
  {
    id: "public",
    Icon: Globe,
    title: "Público",
    description: "Tu cerebro es visible para cualquier usuario de Antovel.",
    accent: "#EC4899",
    accentSoft: "rgba(236, 72, 153, 0.18)",
  },
]

export function StepPrivacy({ profile, onChange }: Props) {
  const current: Privacy = profile.privacy ?? "private"

  return (
    <div className="flex w-full max-w-md flex-col">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[var(--neural-cyan)]">
        Paso 04 · Privacidad
      </p>
      <h2 className="mb-3 font-display text-3xl font-bold leading-tight text-balance sm:text-4xl">
        ¿Quién puede ver tu cerebro?
      </h2>
      <p className="mb-7 text-pretty leading-relaxed text-muted-foreground">
        Puedes cambiarlo en cualquier momento.
      </p>

      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => {
          const active = current === opt.id
          const Icon = opt.Icon
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ privacy: opt.id })}
              aria-pressed={active}
              className={[
                "group relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all",
                active
                  ? "border-[color:var(--accent)]"
                  : "border-[#2a2a3a] bg-[#12121E] hover:border-foreground/25",
              ].join(" ")}
              style={
                {
                  "--accent": opt.accent,
                  background: active
                    ? `linear-gradient(135deg, ${opt.accentSoft} 0%, rgba(18,18,30,0.95) 100%)`
                    : undefined,
                  boxShadow: active
                    ? `0 0 28px ${opt.accent}55, inset 0 0 0 1px ${opt.accent}80`
                    : undefined,
                } as React.CSSProperties
              }
            >
              <span
                aria-hidden
                className={[
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all",
                  active ? "" : "bg-surface/80",
                ].join(" ")}
                style={
                  active
                    ? {
                        background: opt.accentSoft,
                        boxShadow: `0 0 18px ${opt.accent}66`,
                      }
                    : undefined
                }
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={1.7}
                  style={{
                    color: active ? opt.accent : "rgba(255,255,255,0.7)",
                  }}
                />
              </span>
              <span className="flex flex-1 flex-col">
                <span
                  className="font-display text-base font-bold uppercase tracking-wide"
                  style={{ color: active ? opt.accent : "var(--foreground)" }}
                >
                  {opt.title}
                </span>
                <span className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  {opt.description}
                </span>
              </span>

              {/* Radio indicator */}
              <span
                aria-hidden
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all"
                style={{
                  borderColor: active ? opt.accent : "rgba(255,255,255,0.18)",
                  background: active ? opt.accent : "transparent",
                  boxShadow: active ? `0 0 12px ${opt.accent}80` : undefined,
                }}
              >
                {active && (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-white"
                    aria-hidden
                  />
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

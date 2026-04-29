"use client"

import { Check } from "lucide-react"
import type { AntovelProfile, Purpose } from "@/lib/types"

type Props = {
  profile: Partial<AntovelProfile>
  onChange: (patch: Partial<AntovelProfile>) => void
}

const MAX_SELECTIONS = 3

const PURPOSES: {
  id: Purpose
  emoji: string
  label: string
}[] = [
  { id: "memories", emoji: "🧠", label: "Preservar mis recuerdos" },
  { id: "share-family", emoji: "❤️", label: "Compartirlo con mi familia" },
  { id: "leave-mark", emoji: "🌍", label: "Dejar huella en el mundo" },
  { id: "wellness", emoji: "📊", label: "Monitorear mi bienestar" },
  { id: "explore-history", emoji: "🎨", label: "Explorar mi historia" },
  { id: "discover-patterns", emoji: "✨", label: "Descubrir patrones en mi vida" },
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
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              disabled={disabled}
              aria-pressed={active}
              className={[
                "group relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                active
                  ? "border-[var(--neural-violet)] bg-[rgba(124,58,237,0.15)] shadow-[0_0_24px_rgba(124,58,237,0.25)]"
                  : "border-[#2a2a3a] bg-[#12121E] hover:border-foreground/25",
                disabled && "cursor-not-allowed opacity-40",
              ].join(" ")}
            >
              <span
                aria-hidden
                className={[
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl transition-all",
                  active
                    ? "bg-[var(--neural-violet)]/25"
                    : "bg-surface/80 group-hover:bg-surface",
                ].join(" ")}
              >
                {p.emoji}
              </span>
              <span className="flex-1 font-display text-[15px] font-semibold leading-snug text-foreground">
                {p.label}
              </span>

              {/* Checkmark — top-right corner per spec */}
              <span
                aria-hidden
                className={[
                  "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full transition-all",
                  active
                    ? "bg-[var(--neural-violet)] opacity-100 scale-100"
                    : "opacity-0 scale-50",
                ].join(" ")}
              >
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

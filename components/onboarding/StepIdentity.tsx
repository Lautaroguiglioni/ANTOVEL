"use client"

import type { AntovelProfile } from "@/lib/types"

type Props = {
  profile: Partial<AntovelProfile>
  onChange: (patch: Partial<AntovelProfile>) => void
}

const PRONOUN_OPTIONS = ["Él", "Ella", "Elle", "Otro"] as const

export function StepIdentity({ profile, onChange }: Props) {
  return (
    <div className="flex w-full max-w-md flex-col">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[var(--neural-cyan)]">
        Paso 01 · Identidad
      </p>
      <h2 className="mb-3 font-display text-3xl font-bold leading-tight text-balance">
        ¿Cómo te llamas?
      </h2>
      <p className="mb-8 text-pretty leading-relaxed text-muted-foreground">
        Tu nombre será la firma de tu cerebro digital. Solo tú lo verás.
      </p>

      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Nombre
      </label>
      <input
        type="text"
        autoFocus
        value={profile.name ?? ""}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Ej. Antonio Velez"
        className="mb-8 w-full rounded-2xl border border-[var(--border-strong)] bg-surface px-5 py-4 font-display text-lg text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-[var(--neural-violet)] focus:ring-2 focus:ring-[var(--neural-violet)]/30"
      />

      <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Pronombres <span className="normal-case text-muted/70">(opcional)</span>
      </label>
      <div className="grid grid-cols-4 gap-2">
        {PRONOUN_OPTIONS.map((p) => {
          const active = profile.pronouns === p
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange({ pronouns: active ? undefined : p })}
              className={[
                "rounded-full border px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "border-[var(--neural-violet)] bg-[var(--neural-violet)]/15 text-foreground shadow-[0_0_16px_rgba(124,58,237,0.3)]"
                  : "border-[var(--border-strong)] bg-surface/60 text-muted-foreground hover:border-foreground/20 hover:text-foreground",
              ].join(" ")}
            >
              {p}
            </button>
          )
        })}
      </div>
    </div>
  )
}

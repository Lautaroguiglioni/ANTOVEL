"use client"

import type { AntovelProfile } from "@/lib/types"

type Props = {
  profile: Partial<AntovelProfile>
  onChange: (patch: Partial<AntovelProfile>) => void
}

export function StepOrigin({ profile, onChange }: Props) {
  return (
    <div className="flex w-full max-w-md flex-col">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[var(--neural-cyan)]">
        Paso 02 · Origen
      </p>
      <h2 className="mb-3 font-display text-3xl font-bold leading-tight text-balance">
        ¿Dónde empezó tu historia?
      </h2>
      <p className="mb-8 text-pretty leading-relaxed text-muted-foreground">
        El primer nodo de tu cerebro digital. Lo usaremos para anclar tus
        recuerdos en el tiempo y el espacio.
      </p>

      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Fecha de nacimiento
      </label>
      <input
        type="date"
        value={profile.birthDate ?? ""}
        onChange={(e) => onChange({ birthDate: e.target.value })}
        className="mb-6 w-full rounded-2xl border border-[var(--border-strong)] bg-surface px-5 py-4 font-display text-lg text-foreground outline-none transition-colors [color-scheme:dark] focus:border-[var(--neural-violet)] focus:ring-2 focus:ring-[var(--neural-violet)]/30"
      />

      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Lugar de nacimiento
      </label>
      <input
        type="text"
        value={profile.birthPlace ?? ""}
        onChange={(e) => onChange({ birthPlace: e.target.value })}
        placeholder="Ciudad, País"
        className="w-full rounded-2xl border border-[var(--border-strong)] bg-surface px-5 py-4 font-display text-lg text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-[var(--neural-violet)] focus:ring-2 focus:ring-[var(--neural-violet)]/30"
      />
    </div>
  )
}

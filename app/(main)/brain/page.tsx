"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { loadProfile, clearProfile } from "@/hooks/useOnboarding"
import { AntovelLogo } from "@/components/onboarding/AntovelLogo"
import type { AntovelProfile } from "@/lib/types"

export default function BrainPage() {
  const [profile, setProfile] = useState<AntovelProfile | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setProfile(loadProfile())
    setHydrated(true)
  }, [])

  if (!hydrated) return null

  return (
    <main className="bg-neural-nebula bg-dot-grid relative flex min-h-dvh flex-col bg-background px-6 py-8 sm:px-10">
      <header className="mb-12 flex items-center justify-between">
        <AntovelLogo />
        <button
          onClick={() => {
            clearProfile()
            window.location.href = "/onboarding"
          }}
          className="rounded-full border border-[var(--border-strong)] px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Reiniciar
        </button>
      </header>

      <section className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[var(--neural-cyan)]">
          Fase 0 completada
        </p>
        <h1 className="mb-4 font-display text-4xl font-bold leading-tight text-balance">
          Hola, {profile?.name ?? "viajero"}
        </h1>
        <p className="mb-8 text-pretty leading-relaxed text-muted-foreground">
          Tu cerebro digital fue inicializado. Próxima fase: el Legacy Brain 3D.
        </p>

        {profile && (
          <div className="w-full rounded-2xl border border-[var(--border-strong)] bg-surface/60 p-5 text-left">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Perfil guardado
            </h2>
            <dl className="space-y-2 text-sm">
              <Row label="Nombre" value={profile.name} />
              {profile.pronouns && (
                <Row label="Pronombres" value={profile.pronouns} />
              )}
              {profile.birthDate && (
                <Row label="Nacimiento" value={profile.birthDate} />
              )}
              {profile.birthPlace && (
                <Row label="Lugar" value={profile.birthPlace} />
              )}
              {profile.intents.length > 0 && (
                <Row label="Pilares" value={profile.intents.join(", ")} />
              )}
            </dl>
          </div>
        )}

        <Link
          href="/onboarding"
          className="mt-8 text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Editar onboarding
        </Link>
      </section>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-display text-foreground">{value}</dd>
    </div>
  )
}

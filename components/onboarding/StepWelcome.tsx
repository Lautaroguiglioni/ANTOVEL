"use client"

import { Sparkles } from "lucide-react"

export function StepWelcome() {
  return (
    <div className="flex w-full max-w-md flex-col items-center text-center">
      {/* Floating brain orb */}
      <div className="relative mb-10 flex h-44 w-44 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[var(--neural-violet)]/20 blur-3xl" />
        <div className="absolute inset-4 rounded-full border border-[var(--neural-violet)]/30" />
        <div className="absolute inset-10 rounded-full border border-[var(--neural-cyan)]/30" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--neural-violet)] to-[var(--neural-magenta)] shadow-[0_0_40px_rgba(124,58,237,0.6)]">
          <Sparkles className="h-7 w-7 text-white" strokeWidth={1.5} />
        </div>
        <OrbitDot delay={0} />
        <OrbitDot delay={1.2} />
        <OrbitDot delay={2.4} />
      </div>

      <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[var(--neural-cyan)]">
        Bienvenido
      </p>
      <h1 className="mb-5 font-display text-4xl font-bold leading-tight text-balance">
        Tu legado, en un cerebro digital
      </h1>
      <p className="text-pretty leading-relaxed text-muted-foreground">
        Antovel transforma tus recuerdos, tu salud y tu historia en un mapa
        neuronal vivo. Construye un legado que perdure más allá del tiempo.
      </p>
    </div>
  )
}

function OrbitDot({ delay }: { delay: number }) {
  return (
    <span
      aria-hidden
      className="absolute left-1/2 top-1/2 block h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--neural-cyan)]"
      style={{
        animation: `neural-pulse 3s ease-in-out ${delay}s infinite`,
        transform: `translate(${Math.cos(delay) * 70}px, ${Math.sin(delay) * 70}px)`,
        boxShadow: "0 0 12px rgba(6,182,212,0.8)",
      }}
    />
  )
}

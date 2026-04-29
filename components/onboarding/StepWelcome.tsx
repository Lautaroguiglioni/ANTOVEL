"use client"

import dynamic from "next/dynamic"

/**
 * Brain canvas is dynamically imported with SSR disabled — Three.js
 * needs `window` and WebGL, so we keep it strictly client-side.
 */
const BrainCanvas = dynamic(
  () =>
    import("@/components/onboarding/BrainCanvas").then((m) => m.BrainCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.18),transparent_70%)]" />
    ),
  },
)

export function StepWelcome() {
  return (
    <div className="flex w-full max-w-md flex-col items-center text-center">
      {/* 3D rotating low-poly brain — sits inside a soft halo. */}
      <div className="relative mb-12 h-64 w-64 sm:h-72 sm:w-72">
        {/* Bioluminescent halo behind the canvas */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.35)_0%,rgba(6,182,212,0.12)_45%,transparent_70%)] blur-2xl animate-halo-pulse"
        />
        <div className="absolute inset-0">
          <BrainCanvas />
        </div>
      </div>

      <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[var(--neural-cyan)]">
        Bienvenido
      </p>
      <h1 className="mb-5 font-display text-[clamp(2rem,7vw,3rem)] font-bold leading-[1.05] text-balance">
        Tu legado comienza aquí.
      </h1>
      <p className="text-pretty text-base leading-relaxed text-muted-foreground">
        Antovel construye tu cerebro digital. Cada recuerdo, cada momento, cada
        versión de ti — preservados para siempre.
      </p>
    </div>
  )
}

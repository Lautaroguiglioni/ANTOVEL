"use client"

import { LogoAntovel } from "@/components/brand/LogoAntovel"

/**
 * Hero step — pure-SVG Antovel logo with multi-harmonic floating motion +
 * bioluminescent halo. No raster, no checkerboard backdrop: the SVG
 * is rendered crisp at any density and stacks on top of the halo glow.
 */
export function StepWelcome() {
  return (
    <div className="flex w-full max-w-md flex-col items-center text-center">
      <div className="relative mb-12 h-64 w-64 sm:h-72 sm:w-72">
        {/* Outer soft halo */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.45)_0%,rgba(6,182,212,0.15)_45%,transparent_70%)] blur-2xl animate-halo-pulse"
        />
        {/* Inner concentrated glow */}
        <div
          aria-hidden
          className="absolute inset-6 rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.45)_0%,transparent_70%)] blur-xl animate-halo-pulse-inner"
        />

        {/* Multi-harmonic float wrappers — Y (5s) wraps X (7s) so the
            irrational ratio yields a non-repeating Lissajous motion. */}
        <div className="absolute inset-0 flex animate-float-y items-center justify-center will-change-transform">
          <div className="flex h-full w-full animate-float-x items-center justify-center will-change-transform">
            <LogoAntovel size={240} animated glow />
          </div>
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

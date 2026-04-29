"use client"

import Image from "next/image"

/**
 * Hero step — Antovel logo with multi-harmonic floating motion +
 * bioluminescent halo. The PNG sits on top of a screen-blended
 * surface so its black backdrop disappears against the dark UI
 * and the violet petals appear to glow from within the halo.
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
        <div className="absolute inset-0 animate-float-y will-change-transform">
          <div className="absolute inset-0 animate-float-x will-change-transform">
            <Image
              src="/antovel-logo.png"
              alt="Antovel"
              width={320}
              height={320}
              priority
              className="h-full w-full object-contain mix-blend-screen drop-shadow-[0_0_28px_rgba(167,139,250,0.55)]"
            />
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

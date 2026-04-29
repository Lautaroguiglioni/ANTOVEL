"use client"

import Image from "next/image"

export function StepWelcome() {
  return (
    <div className="flex w-full max-w-md flex-col items-center text-center">
      {/* Floating Antovel logo with bioluminescent halo */}
      <div className="relative mb-12 flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
        {/* Soft outer halo — slow opacity pulse 0.1 -> 0.4 */}
        <div
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.55)_0%,rgba(124,58,237,0.25)_45%,transparent_70%)] blur-2xl animate-halo-pulse"
          aria-hidden
        />
        {/* Inner concentrated glow on the 'A' */}
        <div
          className="absolute inset-8 rounded-full bg-[radial-gradient(circle,rgba(196,181,253,0.4)_0%,transparent_65%)] blur-xl animate-halo-pulse-inner"
          aria-hidden
        />

        {/* The actual logo, gently floating */}
        <div className="relative animate-float-y">
          <Image
            src="/antovel-logo.png"
            alt="Antovel"
            width={320}
            height={320}
            priority
            className="h-44 w-44 object-contain drop-shadow-[0_0_24px_rgba(124,58,237,0.55)] sm:h-52 sm:w-52"
          />
        </div>
      </div>

      <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[var(--neural-cyan)]">
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

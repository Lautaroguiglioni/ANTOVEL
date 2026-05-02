"use client"

import { OnThisDay } from "@/components/discover/OnThisDay"
import { HeatMap } from "@/components/discover/HeatMap"
import { PublicBrains } from "@/components/discover/PublicBrains"

/**
 * /discover — "Descubrir" tab.
 *
 * Three vertically-stacked sections, full-bleed where it makes sense:
 *  1. "En este día"  — anniversaries from previous years (horizontal carousel)
 *  2. Mapa de calor  — world map with pulsing density markers
 *  3. Cerebros públicos — preview of social layer (disabled)
 *
 * IMPORTANT: no `h-full` / `overflow-y-auto` on the wrapper. Scroll lives
 * in the parent layout's `#antovel-scroll` container — duplicating it here
 * would create a nested scroll that swallows touch gestures on mobile.
 */
export default function DiscoverPage() {
  return (
    <main className="relative w-full">
      {/* Header */}
      <header className="px-5 pb-2 pt-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
          Descubrir
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-foreground">
          Tu memoria a través
          <br />
          del tiempo y el espacio
        </h1>
      </header>

      <div className="mt-6">
        <OnThisDay />
        <HeatMap />
        <PublicBrains />
      </div>
    </main>
  )
}

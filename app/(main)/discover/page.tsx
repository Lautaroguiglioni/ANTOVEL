"use client"

import { useState } from "react"
import { OnThisDay } from "@/components/discover/OnThisDay"
import { MemoryGlobe } from "@/components/discover/MemoryGlobe"
import { PublicBrains } from "@/components/discover/PublicBrains"
import { mockMemories } from "@/lib/mock-data"
import type { Memory } from "@/lib/types"

/**
 * /discover — "Descubrir" tab.
 *
 * Three vertically-stacked sections, full-bleed where it makes sense:
 *  1. "En este día"  — anniversaries from previous years (horizontal carousel)
 *  2. Memory Globe   — interactive 3D globe with memories
 *  3. Cerebros públicos — preview of social layer (disabled)
 *
 * IMPORTANT: no `h-full` / `overflow-y-auto` on the wrapper. Scroll lives
 * in the parent layout's `#antovel-scroll` container — duplicating it here
 * would create a nested scroll that swallows touch gestures on mobile.
 */
export default function DiscoverPage() {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleSelectMemory = (memory: Memory) => {
    setSelectedMemory(memory)
    setIsDetailOpen(true)
  }

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
        
        {/* Memory Globe Section */}
        <section className="mb-10 px-5">
          <header className="mb-4">
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#06B6D4]/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#67E8F9]">
              🌍 Globo Neural
            </div>
            <h2 className="font-display text-[22px] font-semibold leading-tight text-foreground">
              Tu memoria en el mundo
            </h2>
            <p className="mt-0.5 text-[13px] text-white/55">
              Cada punto es un recuerdo. Arrastrá para explorar.
            </p>
          </header>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#12121E]">
            {/* Soft cosmic glow behind the globe */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.10), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(6,182,212,0.08), transparent 60%)",
              }}
            />

            {/* Globe */}
            <div className="relative h-[520px] w-full">
              <MemoryGlobe
                memories={mockMemories}
                onSelectMemory={handleSelectMemory}
              />
            </div>
          </div>
        </section>

        <PublicBrains />
      </div>
    </main>
  )
}

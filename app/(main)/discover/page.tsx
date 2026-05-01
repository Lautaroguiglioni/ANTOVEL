"use client"

import { useMemo, useState } from "react"
import { Search, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { TapButton } from "@/components/layout/TapButton"
import { mockMemories } from "@/lib/mock-data"
import { useBrainStore } from "@/lib/brain-store"
import { useRouter } from "next/navigation"
import { MEMORY_TYPE_COLOR } from "@/lib/brain-logic"
import type { Memory } from "@/lib/types"

/**
 * /discover — "Descubrir" tab. Lists all unique locations from the
 * memory graph as a touch-friendly itinerary; tapping one sets the
 * activeLocation in the brain store and routes to /brain so the
 * 3D scene zooms into the matching cluster.
 */
type LocationCard = {
  name: string
  count: number
  memories: Memory[]
}

export default function DiscoverPage() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const setActiveLocation = useBrainStore((s) => s.setActiveLocation)

  const cards = useMemo<LocationCard[]>(() => {
    const map = new Map<string, Memory[]>()
    for (const m of mockMemories) {
      const name = m.location?.name
      if (!name) continue
      if (!map.has(name)) map.set(name, [])
      map.get(name)!.push(m)
    }
    return Array.from(map.entries())
      .map(([name, mems]) => ({ name, count: mems.length, memories: mems }))
      .sort((a, b) => b.count - a.count)
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return cards
    const q = query.toLowerCase()
    return cards.filter((c) => c.name.toLowerCase().includes(q))
  }, [cards, query])

  const totalLocations = cards.length
  const totalMemoriesWithLocation = cards.reduce((s, c) => s + c.count, 0)

  const onPick = (name: string) => {
    setActiveLocation(name)
    router.push("/brain")
  }

  return (
    <main className="relative h-full w-full overflow-y-auto pb-28">
      <div className="px-5 pt-8">
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
            Lugares con historia
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">
            Descubrir
          </h1>
          <p className="mt-1.5 text-sm text-white/55">
            {totalLocations} lugares · {totalMemoriesWithLocation} recuerdos
            geolocalizados
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar lugar..."
            className="
              w-full rounded-2xl border border-white/10 bg-[#12121E]/70 py-3 pl-10 pr-4
              text-sm text-foreground placeholder:text-white/30 outline-none
              backdrop-blur-md transition focus:border-[#7C3AED]/60
              focus:[box-shadow:0_0_0_3px_rgba(124,58,237,0.18)]
            "
          />
        </div>

        {/* Location cards */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/40">
              No hay lugares que coincidan con tu búsqueda.
            </p>
          ) : (
            filtered.map((card, i) => (
              <motion.div
                key={card.name}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.04,
                  duration: 0.32,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <TapButton
                  onClick={() => onPick(card.name)}
                  className="
                    block w-full rounded-2xl border border-white/10 bg-[#12121E]/65
                    p-4 text-left backdrop-blur-md transition-colors
                    hover:border-white/20
                  "
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="
                        mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center
                        rounded-full bg-[#7C3AED]/15
                      "
                    >
                      <MapPin size={18} className="text-[#A78BFA]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="truncate font-display text-base font-medium text-foreground">
                          {card.name}
                        </h3>
                        <span className="shrink-0 text-xs text-white/45">
                          {card.count} recuerdo{card.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {card.memories.slice(0, 4).map((m) => (
                          <span
                            key={m.id}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              background: MEMORY_TYPE_COLOR[m.type],
                              boxShadow: `0 0 6px ${MEMORY_TYPE_COLOR[m.type]}`,
                            }}
                          />
                        ))}
                        <span className="ml-1 truncate text-xs text-white/45">
                          {card.memories
                            .slice(0, 2)
                            .map((m) => m.title)
                            .join(" · ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </TapButton>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}

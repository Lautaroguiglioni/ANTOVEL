"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronUp, Globe2, X } from "lucide-react"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import type { Memory } from "@/lib/types"

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

interface LocationAggregate {
  name: string
  lat: number
  lng: number
  count: number
}

interface Props {
  memories: Memory[]
  activeLocation: string | null
  onLocationSelect: (location: LocationAggregate | null) => void
}

/**
 * Collapsible geo panel, bottom-left of the brain canvas.
 * Clicking a marker syncs with the 3D brain (highlights all memories
 * from that location, dims the rest, rotates the camera toward them).
 */
export function GeoPanel({ memories, activeLocation, onLocationSelect }: Props) {
  const [expanded, setExpanded] = useState(false)

  const locations = useMemo<LocationAggregate[]>(() => {
    const map = new Map<string, LocationAggregate>()
    for (const m of memories) {
      if (!m.location?.lat || !m.location?.lng) continue
      const k = m.location.name
      const existing = map.get(k)
      if (existing) existing.count++
      else
        map.set(k, {
          name: k,
          lat: m.location.lat,
          lng: m.location.lng,
          count: 1,
        })
    }
    return Array.from(map.values())
  }, [memories])

  return (
    <motion.div
      initial={false}
      animate={{ height: expanded ? 280 : 48 }}
      transition={{ type: "spring", damping: 26, stiffness: 220 }}
      className="absolute bottom-32 left-4 z-30 w-[224px] overflow-hidden rounded-2xl border"
      style={{
        background: "rgba(12,12,22,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-3 text-left transition-colors hover:bg-white/5"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-violet-300" />
          <span className="text-xs font-medium text-white/70">
            {locations.length} ubicaciones
          </span>
        </div>
        <motion.div animate={{ rotate: expanded ? 0 : 180 }} transition={{ duration: 0.2 }}>
          <ChevronUp className="h-3 w-3 text-white/40" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-2 pb-2"
          >
            <div className="overflow-hidden rounded-lg bg-black/30">
              <ComposableMap
                width={208}
                height={130}
                projection="geoNaturalEarth1"
                projectionConfig={{ scale: 38 }}
                style={{ background: "transparent", display: "block" }}
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#16162a"
                        stroke="#2a2a40"
                        strokeWidth={0.3}
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none", fill: "#1c1c34" },
                          pressed: { outline: "none" },
                        }}
                      />
                    ))
                  }
                </Geographies>
                {locations.map((loc) => {
                  const active = activeLocation === loc.name
                  return (
                    <Marker
                      key={loc.name}
                      coordinates={[loc.lng, loc.lat]}
                      onClick={() => onLocationSelect(active ? null : loc)}
                    >
                      <circle
                        r={3}
                        fill={active ? "#EC4899" : "#7C3AED"}
                        opacity={0.95}
                        style={{ cursor: "pointer" }}
                      />
                      <circle
                        r={6}
                        fill="transparent"
                        stroke={active ? "#EC4899" : "#7C3AED"}
                        strokeWidth={1}
                        opacity={0.4}
                      >
                        <animate
                          attributeName="r"
                          values="3;9;3"
                          dur="2.2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.5;0;0.5"
                          dur="2.2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </Marker>
                  )
                })}
              </ComposableMap>
            </div>

            {activeLocation ? (
              <div className="mt-2 flex items-center justify-between rounded-md bg-white/5 px-2 py-1.5">
                <span className="truncate text-[11px] font-medium text-white/80">
                  {activeLocation}
                </span>
                <button
                  type="button"
                  onClick={() => onLocationSelect(null)}
                  className="rounded p-0.5 text-white/50 hover:bg-white/10 hover:text-white"
                  aria-label="Limpiar selección"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <p className="mt-2 px-1 text-[10px] uppercase tracking-widest text-white/30">
                Tocá un punto para enfocar
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

"use client"

import { useMemo, useState } from "react"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import { motion, AnimatePresence } from "framer-motion"
import { Globe2, MapPin, X } from "lucide-react"
import { mockMemories } from "@/lib/mock-data"
import { MEMORY_TYPE_COLOR } from "@/lib/brain-logic"
import type { Memory } from "@/lib/types"

// Public, CDN-hosted Natural Earth-derived topojson at 110m resolution.
// `react-simple-maps` accepts a URL and fetches at mount time.
const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

type Cluster = {
  key: string
  name: string
  country: string
  lng: number
  lat: number
  count: number
  memories: Memory[]
}

function densityFill(count: number) {
  if (count >= 5) return "#F59E0B"
  if (count >= 3) return "#EC4899"
  return "#7C3AED"
}
function densityRadius(count: number) {
  // 8px base, scales to 24px max at 6+ memories
  const r = 8 + Math.min(count - 1, 5) * 3.2
  return Math.min(r, 24)
}

/**
 * "Mapa de Calor" — world map (Natural Earth-ish projection) with one
 * pulsing marker per location cluster. Color and radius scale with the
 * number of memories at that coordinate. Tapping a marker opens a
 * glass popup with the cluster's memory thumbnails.
 */
export function HeatMap() {
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const clusters = useMemo<Cluster[]>(() => {
    const byKey = new Map<string, Cluster>()
    for (const m of mockMemories) {
      if (!m.location) continue
      const key = `${m.location.lat.toFixed(2)},${m.location.lng.toFixed(2)}`
      const existing = byKey.get(key)
      if (existing) {
        existing.count += 1
        existing.memories.push(m)
      } else {
        const parts = m.location.name.split(",").map((s) => s.trim())
        byKey.set(key, {
          key,
          name: parts[0] ?? m.location.name,
          country: parts[1] ?? "",
          lng: m.location.lng,
          lat: m.location.lat,
          count: 1,
          memories: [m],
        })
      }
    }
    return Array.from(byKey.values()).sort((a, b) => b.count - a.count)
  }, [])

  const totalMemories = clusters.reduce((s, c) => s + c.count, 0)
  const totalCities = clusters.length
  const totalCountries = new Set(clusters.map((c) => c.country).filter(Boolean)).size
  const active = activeKey ? clusters.find((c) => c.key === activeKey) ?? null : null

  return (
    <section className="mb-10 px-5">
      <header className="mb-4">
        <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#06B6D4]/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#67E8F9]">
          <Globe2 size={11} />
          Mapa de calor
        </div>
        <h2 className="font-display text-[22px] font-semibold leading-tight text-foreground">
          Tu memoria en el mundo
        </h2>
        <p className="mt-0.5 text-[13px] text-white/55">
          Cada pulso es un lugar que llevás guardado.
        </p>
      </header>

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#12121E]">
        {/* Soft cosmic glow behind the map */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.10), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(6,182,212,0.08), transparent 60%)",
          }}
        />

        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 105 }}
          width={400}
          height={220}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: "#1e1e2e",
                      stroke: "#2a2a3a",
                      strokeWidth: 0.3,
                      outline: "none",
                    },
                    hover: {
                      fill: "#1e1e2e",
                      stroke: "#2a2a3a",
                      strokeWidth: 0.3,
                      outline: "none",
                    },
                    pressed: {
                      fill: "#1e1e2e",
                      stroke: "#2a2a3a",
                      strokeWidth: 0.3,
                      outline: "none",
                    },
                  }}
                />
              ))
            }
          </Geographies>

          {clusters.map((c) => (
            <Marker
              key={c.key}
              coordinates={[c.lng, c.lat]}
              onClick={() => setActiveKey(c.key)}
              style={{ default: { cursor: "pointer" } }}
            >
              <PulsingMarker
                count={c.count}
                isActive={activeKey === c.key}
                label={c.name}
              />
            </Marker>
          ))}
        </ComposableMap>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/5 px-4 py-3 text-[12px] text-white/65">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]" />
            {totalMemories} recuerdos
          </span>
          <span className="text-white/30">·</span>
          <span>{totalCities} ciudades</span>
          {totalCountries > 0 && (
            <>
              <span className="text-white/30">·</span>
              <span>{totalCountries} países</span>
            </>
          )}
        </div>

        {/* Density legend */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5 rounded-xl bg-black/40 p-2 backdrop-blur-md">
          <LegendDot color="#7C3AED" label="1–2" />
          <LegendDot color="#EC4899" label="3–4" />
          <LegendDot color="#F59E0B" label="5+" />
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <ClusterPopup cluster={active} onClose={() => setActiveKey(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────── */

function PulsingMarker({
  count,
  isActive,
  label,
}: {
  count: number
  isActive: boolean
  label: string
}) {
  const fill = densityFill(count)
  const r = densityRadius(count)
  // The pulse ring is purely SVG so it renders inside react-simple-maps
  // without any Framer/CSS dependency reaching into the SVG namespace.
  const ringDur = `${2.6 + (count > 3 ? 0 : 0.4)}s`
  return (
    <g>
      {/* Outer pulse — expands and fades */}
      <circle r={r} fill={fill} fillOpacity={0.25}>
        <animate
          attributeName="r"
          values={`${r};${r * 2.4};${r}`}
          dur={ringDur}
          repeatCount="indefinite"
        />
        <animate
          attributeName="fill-opacity"
          values="0.35;0;0.35"
          dur={ringDur}
          repeatCount="indefinite"
        />
      </circle>
      {/* Solid core */}
      <circle
        r={r * 0.5}
        fill={fill}
        stroke={isActive ? "#fff" : "rgba(255,255,255,0.55)"}
        strokeWidth={isActive ? 1.6 : 0.8}
        style={{
          filter: `drop-shadow(0 0 ${r * 0.6}px ${fill})`,
        }}
      />
      {isActive && (
        <text
          y={-r - 4}
          textAnchor="middle"
          fontSize={9}
          fontWeight={600}
          fill="#fff"
          style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 2 }}
        >
          {label}
        </text>
      )}
    </g>
  )
}

function ClusterPopup({
  cluster,
  onClose,
}: {
  cluster: Cluster
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="
        mt-3 rounded-2xl border border-white/15 bg-black/55
        p-4 backdrop-blur-2xl
      "
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7C3AED]/20">
            <MapPin size={14} className="text-[#A78BFA]" />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-foreground">
              {cluster.count} recuerdo{cluster.count !== 1 ? "s" : ""} en {cluster.name}
            </p>
            {cluster.country && (
              <p className="text-[11px] text-white/45">{cluster.country}</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="rounded-full p-1.5 text-white/55 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>

      <ul className="space-y-2">
        {cluster.memories.slice(0, 3).map((m) => {
          const c = MEMORY_TYPE_COLOR[m.type]
          return (
            <li
              key={m.id}
              className="flex items-center gap-2.5 rounded-xl bg-white/5 px-2.5 py-2"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: c, boxShadow: `0 0 8px ${c}` }}
              />
              <p className="line-clamp-1 flex-1 text-[13px] text-foreground">
                {m.title}
              </p>
              <span className="shrink-0 text-[10px] tabular-nums text-white/40">
                {new Date(m.date).getFullYear()}
              </span>
            </li>
          )
        })}
        {cluster.memories.length > 3 && (
          <li className="px-2.5 text-[11px] text-white/45">
            + {cluster.memories.length - 3} más
          </li>
        )}
      </ul>
    </motion.div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-white/65">
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      <span className="tabular-nums">{label}</span>
    </div>
  )
}

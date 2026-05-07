"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, useState } from "react"
import type { GlobeMethods } from "react-globe.gl"
import type { Memory } from "@/lib/types"

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false }) as any

interface MemoryGlobeProps {
  memories: Memory[]
  onSelectMemory?: (memory: Memory) => void
}

const TYPE_COLORS: Record<string, string> = {
  photo: "#7C3AED",
  audio: "#EC4899",
  video: "#F59E0B",
  note: "#06B6D4",
}

function getColor(m: Memory) {
  return m.color ?? TYPE_COLORS[m.type] ?? "#7C3AED"
}

function getPlaceholderImage(m: Memory): string {
  const seed =
    Math.abs(m.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 1000
  return `https://picsum.photos/seed/${seed}/400/300`
}

function GlobeTooltip({
  memory,
  x,
  y,
}: {
  memory: Memory | null
  x: number
  y: number
}) {
  if (!memory) return null

  return (
    <div
      style={{
        position: "fixed",
        left: Math.min(x + 16, window.innerWidth - 240),
        top: Math.max(y - 60, 8),
        zIndex: 9999,
        pointerEvents: "none",
        background: "rgba(8,6,20,0.95)",
        border: `1px solid ${getColor(memory)}55`,
        borderRadius: 14,
        padding: "12px 16px",
        width: 220,
        boxShadow: `0 0 24px ${getColor(memory)}33`,
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 80,
          borderRadius: 8,
          overflow: "hidden",
          marginBottom: 10,
          background: `${getColor(memory)}22`,
        }}
      >
        <img
          src={
            memory.imageUrl && !memory.imageUrl.includes("undefined")
              ? memory.imageUrl
              : getPlaceholderImage(memory)
          }
          alt={memory.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = getPlaceholderImage(memory)
          }}
        />
      </div>
      <p style={{ color: "#e8e0ff", fontSize: 13, fontWeight: 600, margin: 0 }}>
        {memory.title}
      </p>
      {memory.location && (
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, margin: "4px 0 0" }}>
          {memory.location.name}
        </p>
      )}
      {memory.date && (
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: "2px 0 0" }}>
          {new Date(memory.date).getFullYear()}
        </p>
      )}
      <div
        style={{
          marginTop: 8,
          padding: "3px 8px",
          borderRadius: 20,
          background: `${getColor(memory)}25`,
          border: `1px solid ${getColor(memory)}44`,
          display: "inline-block",
        }}
      >
        <span style={{ color: getColor(memory), fontSize: 10, fontWeight: 600 }}>
          {memory.type.toUpperCase()}
        </span>
      </div>
      <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, margin: "8px 0 0" }}>
        Click para abrir
      </p>
    </div>
  )
}

function TimelinePanel({
  memories,
  onClose,
  onSelect,
}: {
  memories: Memory[]
  onClose: () => void
  onSelect: (m: Memory) => void
}) {
  if (!memories.length) return null

  const location = memories[0].location?.name ?? "Recuerdos"
  const sorted = [...memories].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(8,6,20,0.92)",
        borderTop: "1px solid rgba(124,58,237,0.25)",
        backdropFilter: "blur(16px)",
        padding: "14px 20px",
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <span style={{ color: "#c4b0ff", fontSize: 13, fontWeight: 600, flex: 1 }}>
          {location}
        </span>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.35)",
            fontSize: 20,
            cursor: "pointer",
            lineHeight: 1,
            padding: "0 4px",
          }}
        >
          x
        </button>
      </div>
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
        {sorted.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m)}
            style={{
              flexShrink: 0,
              width: 150,
              background: "rgba(124,58,237,0.1)",
              border: `1px solid ${getColor(m)}44`,
              borderRadius: 10,
              padding: 10,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <img
              src={
                m.imageUrl && !m.imageUrl.includes("undefined")
                  ? m.imageUrl
                  : getPlaceholderImage(m)
              }
              alt={m.title}
              style={{
                width: "100%",
                height: 60,
                objectFit: "cover",
                borderRadius: 6,
                marginBottom: 6,
              }}
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = getPlaceholderImage(m)
              }}
            />
            <p style={{ color: getColor(m), fontSize: 10, margin: "0 0 2px" }}>
              {new Date(m.date).getFullYear()}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 11,
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {m.title}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

export function MemoryGlobe({ memories, onSelectMemory }: MemoryGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const lastPointerRef = useRef({ x: 0, y: 0 })

  const [tooltip, setTooltip] = useState<{ memory: Memory; x: number; y: number } | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [clickedMemories, setClickedMemories] = useState<Memory[]>([])
  const [size, setSize] = useState({ width: 500, height: 500 })

  const validMemories = useMemo(
    () => memories.filter((m) => m.lat != null && m.lng != null),
    [memories]
  )

  const locationGroups = useMemo(
    () =>
      validMemories.reduce<
        Record<string, { lat: number; lng: number; name: string; mems: Memory[] }>
      >((acc, m) => {
        const key = m.location?.name ?? `${m.lat},${m.lng}`
        const name = m.location?.name ?? `${m.lat},${m.lng}`
        if (!acc[key]) acc[key] = { lat: m.lat!, lng: m.lng!, name, mems: [] }
        acc[key].mems.push(m)
        return acc
      }, {}),
    [validMemories]
  )

  const ringPoints = useMemo(
    () =>
      Object.values(locationGroups).map((g) => ({
        lat: g.lat,
        lng: g.lng,
        color: getColor(g.mems[0]),
        count: g.mems.length,
      })),
    [locationGroups]
  )

  const pointsData = useMemo(
    () =>
      validMemories.map((m) => ({
        lat: m.lat!,
        lng: m.lng!,
        memory: m,
        color: getColor(m),
        size: 0.55 + (m.type === "photo" ? 0.1 : 0),
      })),
    [validMemories]
  )

  const labelsData = useMemo(
    () =>
      Object.values(locationGroups).map((g) => ({
        lat: g.lat,
        lng: g.lng,
        label: g.name,
        count: g.mems.length,
      })),
    [locationGroups]
  )

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!mountRef.current) return

    const updateSize = () => {
      if (!mountRef.current) return
      setSize({
        width: mountRef.current.offsetWidth || 500,
        height: mountRef.current.offsetHeight || 500,
      })
    }

    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(mountRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const configureGlobe = () => {
    const globe = globeRef.current
    if (!globe) return

    const controls = globe.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.25
    controls.enableZoom = true
    controls.minDistance = 120
    controls.maxDistance = 700
    controls.enablePan = false
    controls.zoomSpeed = 1.0

    setTimeout(() => {
      globe.pointOfView({ lat: -32.48, lng: -58.23, altitude: 1.6 }, 1800)
    }, 500)
    setIsLoaded(true)
  }

  const pauseAutoRotate = () => {
    const controls = globeRef.current?.controls()
    if (controls) controls.autoRotate = false
  }

  const resumeAutoRotate = () => {
    const controls = globeRef.current?.controls()
    if (controls) controls.autoRotate = true
  }

  const maxRingCount = ringPoints.reduce((max, ring) => Math.max(max, ring.count), 1)
  const uniqueLocs = Object.keys(locationGroups).length

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%" }}
      onMouseDown={pauseAutoRotate}
      onTouchStart={pauseAutoRotate}
      onMouseMove={(e) => {
        lastPointerRef.current = { x: e.clientX, y: e.clientY }
        setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null))
      }}
      onMouseLeave={() => {
        resumeAutoRotate()
        setTooltip(null)
      }}
    >
      {!isLoaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: "2px solid #7C3AED",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
            Iniciando globo neural...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {isLoaded && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            color: "rgba(255,255,255,0.2)",
            fontSize: 11,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          Scroll para zoom - Arrastra para rotar - Click en un punto
        </div>
      )}

      {isLoaded && (
        <div
          style={{
            position: "absolute",
            bottom: clickedMemories.length ? 110 : 12,
            left: 12,
            display: "flex",
            gap: 8,
            zIndex: 10,
            transition: "bottom 0.3s ease",
          }}
        >
          <Pill color="#7C3AED" label={`${validMemories.length} recuerdos`} />
          <Pill color="#06B6D4" label={`${uniqueLocs} lugares`} />
        </div>
      )}

      <div
        ref={mountRef}
        style={{ width: "100%", height: "100%", cursor: tooltip ? "pointer" : "grab" }}
      >
        {isMounted && (
          <Globe
            ref={globeRef}
            width={size.width}
            height={size.height}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl="https://unpkg.com/three-globe@2.31.3/example/img/earth-night.jpg"
            bumpImageUrl="https://unpkg.com/three-globe@2.31.3/example/img/earth-topology.png"
            atmosphereColor="rgba(100,60,200,0.6)"
            atmosphereAltitude={0.15}
            pointsData={pointsData}
            pointLat={(d: any) => d.lat}
            pointLng={(d: any) => d.lng}
            pointColor={(d: any) => d.color}
            pointAltitude={0.025}
            pointRadius={(d: any) => d.size}
            pointResolution={16}
            pointsMerge={false}
            ringsData={ringPoints}
            ringLat={(d: any) => d.lat}
            ringLng={(d: any) => d.lng}
            ringColor={(d: any) => {
              const hex = d.color
              const r = parseInt(hex.slice(1, 3), 16)
              const g = parseInt(hex.slice(3, 5), 16)
              const b = parseInt(hex.slice(5, 7), 16)
              return (t: number) => `rgba(${r},${g},${b},${Math.max(0, 1 - t) * 0.75})`
            }}
            ringMaxRadius={3.5 + maxRingCount * 0.3}
            ringPropagationSpeed={1.8}
            ringRepeatPeriod={1100}
            labelsData={labelsData}
            labelLat={(d: any) => d.lat}
            labelLng={(d: any) => d.lng}
            labelText={(d: any) => (d.count > 1 ? `${d.label} (${d.count})` : d.label)}
            labelSize={0.4}
            labelDotRadius={0.3}
            labelColor={() => "rgba(210,190,255,0.75)"}
            labelResolution={2}
            onGlobeReady={configureGlobe}
            onPointHover={(point: any) => {
              if (point) {
                setTooltip({
                  memory: point.memory,
                  x: lastPointerRef.current.x,
                  y: lastPointerRef.current.y,
                })
              } else {
                setTooltip(null)
              }
            }}
            onPointClick={(point: any) => {
              const loc = point.memory.location?.name ?? `${point.lat},${point.lng}`
              const group = locationGroups[loc]
              if (group && group.mems.length > 1) {
                setClickedMemories(group.mems)
              } else {
                onSelectMemory?.(point.memory)
              }
              setTooltip(null)
            }}
          />
        )}
      </div>

      <GlobeTooltip memory={tooltip?.memory ?? null} x={tooltip?.x ?? 0} y={tooltip?.y ?? 0} />

      <TimelinePanel
        memories={clickedMemories}
        onClose={() => setClickedMemories([])}
        onSelect={(m) => {
          onSelectMemory?.(m)
          setClickedMemories([])
        }}
      />
    </div>
  )
}

function Pill({ color, label }: { color: string; label: string }) {
  return (
    <div
      style={{
        background: `${color}18`,
        border: `1px solid ${color}40`,
        borderRadius: 8,
        padding: "4px 10px",
        color: `${color}cc`,
        fontSize: 12,
        backdropFilter: "blur(8px)",
      }}
    >
      {label}
    </div>
  )
}

export default MemoryGlobe

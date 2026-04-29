"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Image as ImageIcon, Mic, Film, FileText, Layers } from "lucide-react"
import * as Slider from "@radix-ui/react-slider"
import { MEMORY_TYPE_COLOR, MEMORY_TYPE_LABEL } from "@/lib/brain-logic"
import type { AntovelProfile, Memory, MemoryType } from "@/lib/types"

interface Props {
  profile: AntovelProfile
  memories: Memory[]
  visibleMemories: Memory[]
  visibleConnections: number
  visibleTypes: Set<MemoryType>
  onToggleType: (type: MemoryType | null) => void
  yearRange: [number, number]
  onYearRangeChange: (range: [number, number]) => void
  onClearStorage: () => void
}

const TYPE_ICONS = { photo: ImageIcon, audio: Mic, video: Film, note: FileText } as const

export function BrainHUD({
  profile,
  memories,
  visibleMemories,
  visibleConnections,
  visibleTypes,
  onToggleType,
  yearRange,
  onYearRangeChange,
  onClearStorage,
}: Props) {
  const currentYear = new Date().getFullYear()
  const birthYear = useMemo(
    () => (profile.birthDate ? new Date(profile.birthDate).getFullYear() : currentYear - 30),
    [profile.birthDate, currentYear],
  )
  const minYear = Math.min(birthYear, currentYear - 5)
  const maxYear = currentYear

  const focalYear = yearRange[1]
  const yearMarkers = useMemo(() => {
    const arr: number[] = []
    for (let y = minYear; y <= maxYear; y++) arr.push(y)
    return arr
  }, [minYear, maxYear])

  const allTypesActive = visibleTypes.size === 4

  const stepFocalYear = (delta: number) => {
    const next = Math.max(minYear, Math.min(maxYear, focalYear + delta))
    onYearRangeChange([Math.min(yearRange[0], next), next])
  }

  return (
    <>
      {/* ─── Header ─── */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          {/* Logo */}
          <Link
            href="/"
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#12121E]/70 px-3 py-1.5 text-sm font-display tracking-wide text-foreground/90 backdrop-blur-md transition-colors hover:border-white/20"
          >
            <Image
              src="/antovel-logo.png"
              alt=""
              width={20}
              height={20}
              className="object-contain"
              style={{ mixBlendMode: "screen" }}
            />
            Antovel
          </Link>

          {/* Year navigator */}
          <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#12121E]/70 px-1.5 py-1 backdrop-blur-md">
            <button
              onClick={() => stepFocalYear(-1)}
              disabled={focalYear <= minYear}
              aria-label="Año anterior"
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[3.5rem] text-center font-display text-sm font-semibold tabular-nums text-foreground">
              {focalYear}
            </span>
            <button
              onClick={() => stepFocalYear(+1)}
              disabled={focalYear >= maxYear}
              aria-label="Año siguiente"
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* User chip */}
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#12121E]/70 px-2 py-1 backdrop-blur-md">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl || "/placeholder.svg"}
                alt={profile.name}
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
              >
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="hidden pr-2 text-xs text-foreground/80 sm:inline">{profile.name}</span>
            <button
              onClick={onClearStorage}
              className="hidden text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Reiniciar
            </button>
          </div>
        </div>

        {/* Counter */}
        <div className="pointer-events-none mx-auto mt-3 flex max-w-6xl">
          <div className="rounded-full border border-white/10 bg-[#12121E]/70 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-md">
            {visibleMemories.length} recuerdos · {visibleConnections} conexiones
          </div>
        </div>

        {/* Type filters */}
        <div className="pointer-events-auto mx-auto mt-4 flex max-w-6xl flex-wrap gap-2">
          {(Object.keys(TYPE_ICONS) as MemoryType[]).map((t) => {
            const Icon = TYPE_ICONS[t]
            const active = visibleTypes.has(t)
            const color = MEMORY_TYPE_COLOR[t]
            return (
              <button
                key={t}
                onClick={() => onToggleType(t)}
                aria-pressed={active}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-all"
                style={{
                  borderColor: active ? `${color}88` : "rgba(255,255,255,0.1)",
                  background: active ? `${color}1A` : "rgba(18,18,30,0.7)",
                  color: active ? color : "rgba(255,255,255,0.6)",
                  boxShadow: active ? `0 0 18px ${color}33` : "none",
                }}
              >
                <Icon size={13} />
                {MEMORY_TYPE_LABEL[t]}
              </button>
            )
          })}
          <button
            onClick={() => onToggleType(null)}
            aria-pressed={allTypesActive}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-all"
            style={{
              borderColor: allTypesActive ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.1)",
              background: allTypesActive ? "rgba(124,58,237,0.12)" : "rgba(18,18,30,0.7)",
              color: allTypesActive ? "#A78BFA" : "rgba(255,255,255,0.6)",
            }}
          >
            <Layers size={13} />
            Todos
          </button>
        </div>
      </header>

      {/* ─── Timeline (bottom) ─── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-6 sm:px-8 sm:pb-10">
        <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#12121E]/75 p-4 backdrop-blur-xl sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Línea de tiempo</p>
            <p className="font-display text-sm font-medium text-foreground tabular-nums">
              Viendo: {yearRange[0]} — {yearRange[1]}
            </p>
          </div>

          <Slider.Root
            value={yearRange}
            min={minYear}
            max={maxYear}
            step={1}
            minStepsBetweenThumbs={0}
            onValueChange={(v) => onYearRangeChange([v[0], v[1]] as [number, number])}
            className="relative flex h-6 w-full touch-none select-none items-center"
          >
            <Slider.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-white/10">
              <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]" />
            </Slider.Track>
            <Slider.Thumb
              className="block h-4 w-4 rounded-full border border-white/30 bg-[#7C3AED] shadow-[0_0_14px_rgba(124,58,237,0.7)] outline-none transition-transform hover:scale-110 focus-visible:scale-110"
              aria-label="Año inicial"
            />
            <Slider.Thumb
              className="block h-4 w-4 rounded-full border border-white/30 bg-[#06B6D4] shadow-[0_0_14px_rgba(6,182,212,0.7)] outline-none transition-transform hover:scale-110 focus-visible:scale-110"
              aria-label="Año final"
            />
          </Slider.Root>

          {/* Year markers */}
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground/70 tabular-nums">
            {yearMarkers.length <= 12 ? (
              yearMarkers.map((y) => <span key={y}>{y}</span>)
            ) : (
              <>
                <span>{yearMarkers[0]}</span>
                <span>{yearMarkers[Math.floor(yearMarkers.length / 2)]}</span>
                <span>{yearMarkers[yearMarkers.length - 1]}</span>
              </>
            )}
          </div>
        </div>
        {/* unused memories count for ESLint awareness */}
        <span className="hidden">{memories.length}</span>
      </div>
    </>
  )
}

"use client"

import { useMemo } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { Calendar, Plus, Heart } from "lucide-react"
import { mockMemories } from "@/lib/mock-data"
import { mockDonations } from "@/lib/alzheimer/mock-alzheimer-data"
import { MEMORY_TYPE_COLOR, MEMORY_TYPE_LABEL } from "@/lib/brain-logic"
import { useBrainStore } from "@/lib/brain-store"
import type { Memory } from "@/lib/types"
import type { MemoryExtended } from "@/lib/types"

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
]

/**
 * "En este día" — surfaces memories whose month + day match today's
 * date in previous years. Family donations show a special badge so
 * the patient/owner immediately sees who shared the memory.
 *
 * Dataset: mockMemories (personal) + mockDonations with `isFamilyDonation`.
 * Empty state nudges the user toward /upload.
 */
export function OnThisDay() {
  const setSelectedMemory = useBrainStore((s) => s.setSelectedMemory)

  const today = useMemo(() => new Date(), [])
  const todayMonth = today.getMonth()
  const todayDay = today.getDate()

  const matches = useMemo(() => {
    const all: (Memory | MemoryExtended)[] = [
      ...mockMemories,
      ...mockDonations,
    ]
    return all
      .filter((m) => {
        const d = new Date(m.date)
        return d.getMonth() === todayMonth && d.getDate() === todayDay
      })
      .sort((a, b) => (a.date > b.date ? -1 : 1))
  }, [todayMonth, todayDay])

  const todayLabel = `${todayDay} de ${MONTHS[todayMonth]}`

  return (
    <section className="mb-10">
      <header className="mb-4 flex items-end justify-between gap-3 px-5">
        <div>
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#7C3AED]/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#A78BFA]">
            <Calendar size={11} />
            Hoy
          </div>
          <h2 className="font-display text-[22px] font-semibold leading-tight text-foreground">
            En este día...
          </h2>
          <p className="mt-0.5 text-[13px] text-white/55">
            {todayLabel} en años anteriores
          </p>
        </div>
      </header>

      {matches.length === 0 ? <EmptyDayCard /> : <MemoryCarousel memories={matches} onPick={setSelectedMemory} />}
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────── */

function MemoryCarousel({
  memories,
  onPick,
}: {
  memories: (Memory | MemoryExtended)[]
  onPick: (m: Memory) => void
}) {
  return (
    <div
      className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2"
      style={{ scrollbarWidth: "none" }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {memories.map((m, i) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="snap-start"
        >
          <DayMemoryCard memory={m} onPick={onPick} />
        </motion.div>
      ))}
    </div>
  )
}

function DayMemoryCard({
  memory,
  onPick,
}: {
  memory: Memory | MemoryExtended
  onPick: (m: Memory) => void
}) {
  const reduced = useReducedMotion()
  const year = new Date(memory.date).getFullYear()
  const tint = MEMORY_TYPE_COLOR[memory.type]
  const isFamily = "isFamilyDonation" in memory && memory.isFamilyDonation === true
  const donor = "donorName" in memory ? memory.donorName : null

  return (
    <Link
      href={`/brain?highlight=${memory.id}`}
      onClick={() => onPick(memory as Memory)}
      className="block touch-manipulation select-none"
    >
      <motion.div
        whileTap={reduced ? undefined : { scale: 0.95 }}
        transition={{ type: "spring", stiffness: 700, damping: 35 }}
        className="
          relative flex h-[260px] w-[200px] shrink-0 flex-col overflow-hidden rounded-2xl
          border border-white/10 bg-[#12121E]/80
          backdrop-blur-md transition-colors hover:border-white/20
        "
      >
        {/* Tinted top half — establishes type identity */}
        <div
          className="absolute inset-x-0 top-0 h-3/5"
          style={{
            background: `linear-gradient(165deg, ${tint}55 0%, ${tint}22 50%, transparent 100%)`,
          }}
        />
        {/* Soft dark vignette toward the bottom for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 35%, rgba(8,8,16,0.55) 65%, rgba(8,8,16,0.92) 100%)",
          }}
        />

        {/* Year — large semi-transparent, top-left */}
        <span
          className="relative z-10 px-4 pt-4 font-display font-bold leading-none tracking-tighter"
          style={{
            fontSize: 48,
            color: "rgba(255,255,255,0.18)",
          }}
        >
          {year}
        </span>

        {/* Family donation badge */}
        {isFamily && donor && (
          <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-[#EC4899]/22 px-2 py-1 backdrop-blur-md">
            <Heart size={10} className="fill-[#F9A8D4] text-[#F9A8D4]" />
            <span className="text-[10px] font-medium leading-none text-[#FBCFE8]">
              de {donor}
            </span>
          </div>
        )}

        {/* Bottom block: title + type chip + CTA */}
        <div className="relative z-10 mt-auto flex flex-col gap-2 p-4">
          <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-foreground">
            {memory.title}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider"
              style={{ color: tint }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: tint, boxShadow: `0 0 6px ${tint}` }}
              />
              {MEMORY_TYPE_LABEL[memory.type]}
            </span>
            <span className="text-[11px] font-medium text-white/70">
              Ver en cerebro →
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

function EmptyDayCard() {
  return (
    <div className="px-5">
      <div
        className="
          relative flex h-[200px] flex-col items-center justify-center gap-3 overflow-hidden
          rounded-2xl border border-dashed border-white/15 bg-[#12121E]/55 px-6 text-center
        "
      >
        <div
          aria-hidden
          className="absolute -top-12 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)",
            filter: "blur(8px)",
          }}
        />
        <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#7C3AED]/15">
          <Calendar size={20} className="text-[#A78BFA]" />
        </div>
        <p className="relative max-w-[260px] text-sm leading-snug text-white/70">
          Aún no tenés recuerdos de este día.
        </p>
        <Link href="/upload" className="relative touch-manipulation select-none">
          <motion.span
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 700, damping: 35 }}
            className="
              inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white
              shadow-[0_0_20px_-4px_rgba(124,58,237,0.55)]
            "
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
            }}
          >
            <Plus size={14} />
            Agregar uno ahora
          </motion.span>
        </Link>
      </div>
    </div>
  )
}

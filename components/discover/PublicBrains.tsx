"use client"

import { Lock, Globe2, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

type PublicBrain = {
  id: string
  initials: string
  alias: string
  count: number
  since: number
  color: string
  vibe: string
}

/**
 * "Cerebros Públicos" — preview of an upcoming social discovery layer.
 * All cards are intentionally disabled in this MVP: this surfaces the
 * concept without exposing real users, and the privacy notice below
 * makes the sharing model explicit.
 */
const MOCK_PUBLIC_BRAINS: PublicBrain[] = [
  {
    id: "pb1",
    initials: "MT",
    alias: "Marcela T.",
    count: 142,
    since: 2018,
    color: "#7C3AED",
    vibe: "Viajes y arte",
  },
  {
    id: "pb2",
    initials: "JR",
    alias: "Joaquín R.",
    count: 89,
    since: 2020,
    color: "#06B6D4",
    vibe: "Música y noches",
  },
  {
    id: "pb3",
    initials: "AC",
    alias: "Ana C.",
    count: 215,
    since: 2016,
    color: "#EC4899",
    vibe: "Familia y cocina",
  },
  {
    id: "pb4",
    initials: "DF",
    alias: "Diego F.",
    count: 67,
    since: 2022,
    color: "#F59E0B",
    vibe: "Montaña y sur",
  },
]

export function PublicBrains() {
  return (
    <section className="mb-12 px-5">
      <header className="mb-4">
        <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#F59E0B]/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#FCD34D]">
          <Sparkles size={11} />
          Pronto
        </div>
        <h2 className="font-display text-[22px] font-semibold leading-tight text-foreground">
          Cerebros públicos
        </h2>
        <p className="mt-0.5 text-[13px] text-white/55">
          Explorá memorias compartidas por otros usuarios.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {MOCK_PUBLIC_BRAINS.map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.05,
              duration: 0.34,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <BrainCard brain={b} />
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-white/8 bg-white/[0.03] p-3.5">
        <Lock size={14} className="mt-0.5 shrink-0 text-white/45" />
        <p className="text-[12px] leading-relaxed text-white/55">
          Solo aparecen los cerebros marcados como públicos por sus dueños.
          Tu cerebro empieza siempre en privado.
        </p>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────── */

function BrainCard({ brain }: { brain: PublicBrain }) {
  return (
    <div
      className="
        relative flex h-full flex-col overflow-hidden rounded-2xl
        border border-white/10 bg-[#12121E]/80 p-3.5
        backdrop-blur-md
      "
    >
      {/* Soft tint behind the avatar */}
      <div
        aria-hidden
        className="absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-30 blur-2xl"
        style={{ background: brain.color }}
      />

      {/* Avatar + public badge */}
      <div className="relative flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full font-display text-base font-semibold text-white"
          style={{
            background: `linear-gradient(135deg, ${brain.color} 0%, ${brain.color}aa 100%)`,
            boxShadow: `0 0 16px -4px ${brain.color}88`,
          }}
        >
          {brain.initials}
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/65">
          <Globe2 size={9} />
          Público
        </span>
      </div>

      {/* Body */}
      <div className="relative mt-3">
        <p className="font-display text-[15px] font-semibold text-foreground">
          {brain.alias}
        </p>
        <p className="mt-0.5 text-[11px] text-white/55">
          {brain.count} recuerdos · desde {brain.since}
        </p>
        <p className="mt-1 text-[10.5px] uppercase tracking-wider text-white/35">
          {brain.vibe}
        </p>
      </div>

      {/* CTA — disabled with tooltip-like microcopy */}
      <button
        type="button"
        disabled
        title="Próximamente"
        className="
          relative mt-3.5 cursor-not-allowed select-none rounded-xl border border-white/8
          bg-white/[0.04] px-3 py-2 text-[12px] font-medium text-white/45
          outline-none
        "
      >
        Explorar
      </button>
    </div>
  )
}

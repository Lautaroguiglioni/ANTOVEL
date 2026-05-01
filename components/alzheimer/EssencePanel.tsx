"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Phone, Volume2, Edit3 } from "lucide-react"
import Link from "next/link"
import type { EssenceDocument, MemoryExtended } from "@/lib/types"
import { TAG_COLOR, TAG_LABEL, relativeDate } from "@/lib/alzheimer/essence-engine"
import { FamilyDonationBadge } from "@/components/alzheimer/FamilyDonationBadge"

interface Props {
  essence: EssenceDocument
  donations: MemoryExtended[]
  canEdit: boolean
}

/**
 * The reminiscence "script" — the most important screen of the Alzheimer module.
 * Every typographic choice is Alzheimer-first: large body (20px), generous line
 * height, warm palette, and one clear CTA per section.
 */
export function EssencePanel({ essence, donations, canEdit }: Props) {
  const sortedLifeline = useMemo(
    () => [...essence.lifeline].sort((a, b) => a.year - b.year),
    [essence.lifeline],
  )

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 pb-32">
      {/* ─── Identity Affirmation ───────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border p-8 md:p-10"
        style={{
          borderColor: "rgba(252,211,77,0.25)",
          background:
            "radial-gradient(circle at 30% 20%, rgba(252,211,77,0.08), transparent 60%), rgba(26,15,46,0.6)",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FCD34D]">
          Quién sos
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-white md:text-5xl">
          {essence.patientName}
        </h1>
        <p className="mt-6 text-xl leading-relaxed text-[#F5F0FF] md:text-2xl">
          {essence.identityAffirmation}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/voice"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold text-[#1A0F2E] transition-transform hover:scale-[1.02]"
            style={{ background: "#FCD34D" }}
          >
            <Volume2 className="size-5" />
            Escuchar mi historia
          </Link>
          {canEdit ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-base font-medium text-white/90 hover:bg-white/10"
            >
              <Edit3 className="size-4" />
              Editar
            </button>
          ) : null}
        </div>
      </motion.section>

      {/* ─── Key People ─────────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 font-serif text-2xl text-white md:text-3xl">
          Las personas que más querés
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {essence.keyPeople.map((person) => (
            <motion.div
              key={person.name}
              whileHover={{ y: -2 }}
              className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5"
            >
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-full font-serif text-lg font-semibold text-[#1A0F2E]"
                style={{ background: person.avatarColor }}
              >
                {person.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-lg font-semibold text-white">{person.name}</p>
                <p className="text-sm font-medium" style={{ color: person.avatarColor }}>
                  {person.relation}
                </p>
                <p className="mt-1.5 text-base leading-relaxed text-[#cbd5e1]">
                  {person.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Lifeline ───────────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 font-serif text-2xl text-white md:text-3xl">Tu vida en años</h2>
        <ol className="relative ml-2 border-l-2 border-[#A78BFA]/25 pl-6">
          {sortedLifeline.map((item, i) => {
            const linked = donations.find((m) => m.id === item.linkedMemoryId)
            return (
              <li key={`${item.year}-${i}`} className="mb-6 last:mb-0">
                <span
                  className="absolute -left-[9px] flex size-4 items-center justify-center rounded-full"
                  style={{
                    background: linked ? "#F472B6" : "#A78BFA",
                    boxShadow: "0 0 10px rgba(167,139,250,0.45)",
                  }}
                />
                <p className="font-mono text-sm font-semibold tracking-wide text-[#FCD34D]">
                  {item.year}
                </p>
                <p className="mt-1 text-lg leading-relaxed text-[#F5F0FF]">{item.event}</p>
                {linked ? (
                  <span className="mt-2 inline-block">
                    <FamilyDonationBadge
                      donorName={linked.donorName}
                      donorRelation={linked.donorRelation}
                      size="sm"
                    />
                  </span>
                ) : null}
              </li>
            )
          })}
        </ol>
      </section>

      {/* ─── Daily Anchors ──────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 font-serif text-2xl text-white md:text-3xl">Tus rutinas del día</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {essence.dailyAnchors.map((a, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4"
            >
              <span
                className="mt-1.5 size-2 shrink-0 rounded-full"
                style={{ background: "#34D399", boxShadow: "0 0 6px rgba(52,211,153,0.6)" }}
              />
              <span className="text-base leading-relaxed text-[#F5F0FF]">{a}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── Reminiscence Prompts ───────────────────────────────── */}
      <section>
        <h2 className="mb-1 font-serif text-2xl text-white md:text-3xl">
          Preguntas para recordar
        </h2>
        <p className="mb-4 text-sm text-[#cbd5e1]">
          Cada pregunta abre una puerta a un recuerdo familiar.
        </p>
        <div className="flex flex-col gap-3">
          {essence.reminiscencePrompts.map((p, i) => {
            const linked = donations.find((m) => m.id === p.linkedMemoryId)
            const tag = linked?.therapeuticTag
            return (
              <article
                key={i}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-5"
              >
                {tag ? (
                  <span
                    className="mb-3 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
                    style={{
                      background: `${TAG_COLOR[tag]}22`,
                      color: TAG_COLOR[tag],
                    }}
                  >
                    {TAG_LABEL[tag]}
                  </span>
                ) : null}
                <p className="font-serif text-xl leading-snug text-white md:text-2xl">
                  {p.prompt}
                </p>
                <p className="mt-2 text-sm text-[#94a3b8]">Objetivo: {p.therapeuticGoal}</p>
              </article>
            )
          })}
        </div>
      </section>

      {/* ─── Emergency Contact ──────────────────────────────────── */}
      <section
        className="sticky bottom-4 rounded-2xl border p-5"
        style={{
          borderColor: "rgba(248,113,113,0.3)",
          background: "rgba(31,12,30,0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-[#FCA5A5]">
          Si necesitás ayuda
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-white">
              Llamar a {essence.emergencyContact.name}
            </p>
            <p className="text-sm text-[#cbd5e1]">
              {essence.emergencyContact.relation} · {essence.emergencyContact.phone}
            </p>
          </div>
          <a
            href={`tel:${essence.emergencyContact.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-base font-semibold text-white transition-transform hover:scale-[1.02]"
            style={{ background: "#DC2626" }}
          >
            <Phone className="size-5" />
            Llamar ahora
          </a>
        </div>
      </section>

      <p className="text-center text-xs text-[#64748b]">
        Última actualización por {essence.lastUpdatedBy} · {relativeDate(essence.lastUpdatedAt)}
      </p>
    </div>
  )
}

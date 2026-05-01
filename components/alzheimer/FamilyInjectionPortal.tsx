"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, Mic, FileText, Plus, CheckCircle2, Clock } from "lucide-react"
import type { MemoryExtended, MemoryType, TherapeuticTag } from "@/lib/types"
import { TAG_COLOR, TAG_LABEL, relativeDate } from "@/lib/alzheimer/essence-engine"
import { MEMORY_TYPE_COLOR } from "@/lib/brain-logic"
import { FamilyDonationBadge } from "@/components/alzheimer/FamilyDonationBadge"

interface Props {
  donations: MemoryExtended[]
  canApprove: boolean
  onSubmit: (donation: Omit<MemoryExtended, "id" | "color">) => void
  onApprove: (id: string) => void
}

const TYPE_ICON: Record<MemoryType, typeof Camera> = {
  photo: Camera,
  audio: Mic,
  video: Camera,
  note: FileText,
}

const TAG_OPTIONS: TherapeuticTag[] = [
  "identity",
  "family_bond",
  "happy_place",
  "life_milestone",
  "daily_anchor",
  "sensory",
]

/**
 * Family portal: lets a relative donate a memory to the patient's brain
 * and lets the caregiver review/approve pending donations.
 */
export function FamilyInjectionPortal({ donations, canApprove, onSubmit, onApprove }: Props) {
  const [showForm, setShowForm] = useState(false)
  const pending = donations.filter((m) => m.injectionStatus === "pending")
  const active = donations.filter((m) => (m.injectionStatus ?? "active") === "active")

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-24">
      {/* ─── Pending donations queue ────────────────────────────── */}
      <section>
        <header className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-white md:text-3xl">
            Donaciones para revisar
          </h2>
          <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-200">
            {pending.length} pendiente{pending.length === 1 ? "" : "s"}
          </span>
        </header>

        {pending.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-8 text-center">
            <p className="text-base text-[#cbd5e1]">No hay donaciones esperando aprobación.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((m) => (
              <DonationCard
                key={m.id}
                memory={m}
                actionLabel={canApprove ? "Aprobar e inyectar" : undefined}
                actionIcon={CheckCircle2}
                onAction={canApprove ? () => onApprove(m.id) : undefined}
                statusLabel="Pendiente"
                statusColor="#F59E0B"
              />
            ))}
          </div>
        )}
      </section>

      {/* ─── Active donations ───────────────────────────────────── */}
      <section>
        <h2 className="mb-3 font-serif text-2xl text-white md:text-3xl">
          Recuerdos activos en el cerebro
        </h2>
        <div className="flex flex-col gap-3">
          {active.map((m) => (
            <DonationCard
              key={m.id}
              memory={m}
              statusLabel="Activo"
              statusColor="#34D399"
            />
          ))}
        </div>
      </section>

      {/* ─── Floating + button ──────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 z-30 flex size-16 items-center justify-center rounded-full text-white shadow-2xl transition-transform hover:scale-105"
        style={{
          background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 100%)",
          boxShadow: "0 0 36px rgba(244,114,182,0.55)",
        }}
        aria-label="Donar un recuerdo nuevo"
      >
        <Plus className="size-7" strokeWidth={2.4} />
      </button>

      {/* ─── Donation form modal ────────────────────────────────── */}
      <AnimatePresence>
        {showForm ? (
          <DonationForm onClose={() => setShowForm(false)} onSubmit={onSubmit} />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────────────────────────── */

interface CardProps {
  memory: MemoryExtended
  actionLabel?: string
  actionIcon?: typeof CheckCircle2
  onAction?: () => void
  statusLabel: string
  statusColor: string
}

function DonationCard({ memory, actionLabel, actionIcon, onAction, statusLabel, statusColor }: CardProps) {
  const Icon = TYPE_ICON[memory.type]
  const ActionIcon = actionIcon
  return (
    <article className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]">
      <div className="flex flex-col sm:flex-row">
        {memory.thumbnailUrl ? (
          <div className="relative h-44 w-full sm:h-auto sm:w-44 sm:shrink-0">
            <Image
              src={memory.thumbnailUrl}
              alt={memory.title}
              fill
              className="object-cover"
              sizes="(min-width: 640px) 176px, 100vw"
            />
          </div>
        ) : (
          <div
            className="flex h-44 w-full items-center justify-center sm:h-auto sm:w-44 sm:shrink-0"
            style={{ background: `${memory.color}15` }}
          >
            <Icon className="size-10" style={{ color: memory.color }} />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <header className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-serif text-xl text-white">{memory.title}</p>
              <p className="text-sm text-[#94a3b8]">
                {new Date(memory.date).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {memory.location ? ` · ${memory.location.name}` : ""}
              </p>
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: statusColor, background: `${statusColor}1f` }}
            >
              {statusLabel === "Pendiente" ? <Clock className="size-3" /> : null}
              {statusLabel}
            </span>
          </header>

          <FamilyDonationBadge donorName={memory.donorName} donorRelation={memory.donorRelation} />

          {memory.injectionNote ? (
            <blockquote className="border-l-2 pl-3 text-base italic leading-relaxed text-[#F5F0FF]" style={{ borderColor: "#F472B6" }}>
              &ldquo;{memory.injectionNote}&rdquo;
            </blockquote>
          ) : null}

          {memory.therapeuticTag ? (
            <span
              className="inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
              style={{
                background: `${TAG_COLOR[memory.therapeuticTag]}22`,
                color: TAG_COLOR[memory.therapeuticTag],
              }}
            >
              {TAG_LABEL[memory.therapeuticTag]}
            </span>
          ) : null}

          {actionLabel && ActionIcon ? (
            <button
              type="button"
              onClick={onAction}
              className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-[#34D399] px-5 py-2 text-sm font-semibold text-[#0F1A14] transition-transform hover:scale-[1.02]"
            >
              <ActionIcon className="size-4" />
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

interface FormProps {
  onClose: () => void
  onSubmit: (donation: Omit<MemoryExtended, "id" | "color">) => void
}

function DonationForm({ onClose, onSubmit }: FormProps) {
  const [type, setType] = useState<MemoryType>("photo")
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [donorName, setDonorName] = useState("")
  const [donorRelation, setDonorRelation] = useState("")
  const [injectionNote, setInjectionNote] = useState("")
  const [therapeuticTag, setTherapeuticTag] = useState<TherapeuticTag>("family_bond")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !donorName.trim()) return
    onSubmit({
      type,
      date: date || new Date().toISOString().slice(0, 10),
      title: title.trim(),
      tags: [],
      location: null,
      source: "family",
      injectionStatus: "pending",
      donorName: donorName.trim(),
      donorRelation: donorRelation.trim() || undefined,
      injectionNote: injectionNote.trim() || undefined,
      therapeuticTag,
      isFamilyDonation: true,
    } as Omit<MemoryExtended, "id" | "color">)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-md sm:items-center"
      onClick={onClose}
    >
      <motion.form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="flex w-full max-w-lg flex-col gap-5 rounded-3xl border border-white/10 bg-[#1A0F2E] p-6 sm:p-8"
      >
        <header>
          <h3 className="font-serif text-2xl text-white">Donar un recuerdo</h3>
          <p className="text-sm text-[#cbd5e1]">
            Una historia, una foto, una receta. Algo que quieras que él o ella recuerde.
          </p>
        </header>

        <FieldLabel label="Tipo">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TYPE_ICON) as MemoryType[]).map((t) => {
              const Icon = TYPE_ICON[t]
              const active = type === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors"
                  style={{
                    borderColor: active ? MEMORY_TYPE_COLOR[t] : "rgba(255,255,255,0.1)",
                    background: active ? `${MEMORY_TYPE_COLOR[t]}1f` : "transparent",
                    color: active ? MEMORY_TYPE_COLOR[t] : "#cbd5e1",
                  }}
                >
                  <Icon className="size-3.5" />
                  {t === "photo" ? "Foto" : t === "audio" ? "Audio" : t === "video" ? "Video" : "Nota"}
                </button>
              )
            })}
          </div>
        </FieldLabel>

        <FieldLabel label="Título del recuerdo">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ej: Cumpleaños de Joaco" />
        </FieldLabel>

        <FieldLabel label="Fecha del recuerdo">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FieldLabel>

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldLabel label="Tu nombre">
            <Input value={donorName} onChange={(e) => setDonorName(e.target.value)} required placeholder="Marina" />
          </FieldLabel>
          <FieldLabel label="Tu vínculo">
            <Input value={donorRelation} onChange={(e) => setDonorRelation(e.target.value)} placeholder="Hija mayor" />
          </FieldLabel>
        </div>

        <FieldLabel label="Mensaje personal (opcional)">
          <textarea
            value={injectionNote}
            onChange={(e) => setInjectionNote(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-[#64748b] focus:border-[#A78BFA] focus:outline-none"
            placeholder="Lo que quieras decirle al recordar este momento."
          />
        </FieldLabel>

        <FieldLabel label="Categoría terapéutica">
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((t) => {
              const active = therapeuticTag === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTherapeuticTag(t)}
                  className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={{
                    borderColor: active ? TAG_COLOR[t] : "rgba(255,255,255,0.1)",
                    background: active ? `${TAG_COLOR[t]}22` : "transparent",
                    color: active ? TAG_COLOR[t] : "#cbd5e1",
                  }}
                >
                  {TAG_LABEL[t]}
                </button>
              )
            })}
          </div>
        </FieldLabel>

        <footer className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm text-[#cbd5e1] hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-full px-6 py-2.5 text-sm font-semibold text-[#1A0F2E]"
            style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 100%)" }}
          >
            Enviar para aprobación
          </button>
        </footer>
      </motion.form>
    </motion.div>
  )
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">{label}</span>
      {children}
    </label>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-[#64748b] focus:border-[#A78BFA] focus:outline-none"
    />
  )
}

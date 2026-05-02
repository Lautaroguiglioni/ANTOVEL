"use client"

import { useState } from "react"
import { Camera, Mic, Film, FileText, Upload, ImageIcon } from "lucide-react"
import { TapButton } from "@/components/layout/TapButton"
import { motion, AnimatePresence } from "framer-motion"
import { MEMORY_TYPE_COLOR, MEMORY_TYPE_LABEL } from "@/lib/brain-logic"
import type { MemoryType } from "@/lib/types"

const TYPE_ICONS = {
  photo: Camera,
  audio: Mic,
  video: Film,
  note: FileText,
} as const

const TYPES: MemoryType[] = ["photo", "audio", "video", "note"]

/**
 * /upload — "Carga" tab. Compose new memories that will be added to the brain.
 * Mock-only at this stage: writes nothing yet, just shows confirmation.
 */
export default function UploadPage() {
  const [type, setType] = useState<MemoryType>("photo")
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [submitted, setSubmitted] = useState(false)

  const accent = MEMORY_TYPE_COLOR[type]

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setTitle("")
      setTags("")
    }, 2200)
  }

  const Icon = TYPE_ICONS[type]

  return (
    <main className="relative w-full">
      <div className="px-5 pt-8">
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
            Nuevo recuerdo
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">
            Cargar
          </h1>
          <p className="mt-1.5 text-sm text-white/55">
            Sumá un nodo nuevo a tu cerebro digital.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Type selector */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/55">
              Tipo
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TYPES.map((t) => {
                const TIcon = TYPE_ICONS[t]
                const active = t === type
                const c = MEMORY_TYPE_COLOR[t]
                return (
                  <TapButton
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    aria-pressed={active}
                    className="rounded-2xl border p-3 transition-all"
                    style={{
                      borderColor: active ? c : "rgba(255,255,255,0.1)",
                      background: active ? `${c}1A` : "rgba(18,18,30,0.55)",
                      boxShadow: active ? `0 0 18px ${c}33` : "none",
                    }}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <TIcon
                        size={20}
                        strokeWidth={active ? 2.4 : 1.8}
                        style={{ color: active ? c : "rgba(255,255,255,0.55)" }}
                      />
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: active ? c : "rgba(255,255,255,0.55)" }}
                      >
                        {MEMORY_TYPE_LABEL[t]}
                      </span>
                    </div>
                  </TapButton>
                )
              })}
            </div>
          </div>

          {/* Drop zone */}
          <TapButton
            type="button"
            className="block w-full rounded-2xl border-2 border-dashed p-8"
            style={{
              borderColor: `${accent}55`,
              background: `${accent}0A`,
            }}
          >
            <div className="flex flex-col items-center gap-2.5 text-center">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: `${accent}22` }}
              >
                <Upload size={20} style={{ color: accent }} />
              </div>
              <p className="text-sm font-medium text-foreground">
                Tocá para seleccionar archivo
              </p>
              <p className="text-xs text-white/45">
                Foto, audio, video o nota — hasta 100 MB
              </p>
            </div>
          </TapButton>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/55"
            >
              Título
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Un nombre que recuerdes"
              maxLength={80}
              className="
                w-full rounded-xl border border-white/10 bg-[#12121E]/70 px-4 py-3
                text-base text-foreground placeholder:text-white/30 outline-none
                transition focus:border-[#7C3AED]/60
                focus:[box-shadow:0_0_0_3px_rgba(124,58,237,0.18)]
              "
            />
          </div>

          {/* Date + tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="date"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/55"
              >
                Fecha
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="
                  w-full rounded-xl border border-white/10 bg-[#12121E]/70 px-3 py-3
                  text-sm text-foreground outline-none
                  transition focus:border-[#7C3AED]/60
                "
              />
            </div>
            <div>
              <label
                htmlFor="tags"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/55"
              >
                Etiquetas
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="familia, viaje"
                className="
                  w-full rounded-xl border border-white/10 bg-[#12121E]/70 px-3 py-3
                  text-sm text-foreground placeholder:text-white/30 outline-none
                  transition focus:border-[#7C3AED]/60
                "
              />
            </div>
          </div>

          {/* CTA */}
          <TapButton
            type="submit"
            disabled={!title.trim()}
            className="
              relative mt-2 w-full rounded-2xl px-5 py-4 font-display text-base font-semibold
              text-white shadow-[0_0_28px_-4px_rgba(124,58,237,0.6)]
              disabled:cursor-not-allowed disabled:opacity-40
            "
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
            }}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <ImageIcon size={18} />
              Sumar al cerebro
            </span>
          </TapButton>
        </form>

        {/* Helper microcopy */}
        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-white/40">
          <Icon size={12} />
          Tu recuerdo aparecerá como un nodo cristalino en el cerebro 3D.
        </p>
      </div>

      {/* Submit toast */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="
              pointer-events-none absolute inset-x-6 bottom-24 z-50
              rounded-2xl border border-white/15 bg-black/80 px-4 py-3
              text-center text-sm text-white backdrop-blur-xl
            "
          >
            Recuerdo guardado en tu cerebro
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

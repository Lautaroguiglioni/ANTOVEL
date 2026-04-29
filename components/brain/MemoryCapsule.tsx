"use client"

import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { Calendar, MapPin, Tag, X, Image as ImageIcon, Mic, Film, FileText } from "lucide-react"
import { MEMORY_TYPE_COLOR, MEMORY_TYPE_LABEL } from "@/lib/brain-logic"
import type { Memory } from "@/lib/types"

interface Props {
  memory: Memory | null
  related: Memory[]
  onClose: () => void
  onSelectRelated: (m: Memory) => void
}

const TYPE_ICONS = { photo: ImageIcon, audio: Mic, video: Film, note: FileText } as const

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

/**
 * Immersive Memory Capsule — sits centered on screen while the brain
 * stays visible (and blurred) behind it. Designed to feel like the
 * camera has dived inside the node and surfaced this moment.
 */
export function MemoryCapsule({ memory, related, onClose, onSelectRelated }: Props) {
  const visible = !!memory
  const accent = memory ? MEMORY_TYPE_COLOR[memory.type] : "#7C3AED"
  const Icon = memory ? TYPE_ICONS[memory.type] : ImageIcon

  return (
    <AnimatePresence>
      {visible && memory && (
        <>
          {/* Soft vignette so the capsule sits cleanly on the blurred brain */}
          <motion.div
            key="capsule-vignette"
            className="pointer-events-none fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(6,6,12,0) 0%, rgba(6,6,12,0.45) 55%, rgba(6,6,12,0.85) 100%)",
            }}
          />

          {/* Click-outside catcher */}
          <motion.button
            key="capsule-backdrop"
            aria-label="Cerrar recuerdo"
            onClick={onClose}
            className="fixed inset-0 z-30 cursor-zoom-out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Capsule */}
          <motion.div
            key="capsule"
            role="dialog"
            aria-labelledby="capsule-title"
            aria-modal="true"
            className="fixed left-1/2 top-1/2 z-40 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.86, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{
              // Delay so the capsule materializes once the camera has
              // settled inside the node (CameraDirector ≈ 600ms damping).
              delay: 0.45,
              type: "spring",
              stiffness: 260,
              damping: 28,
            }}
          >
            <div
              className="relative overflow-hidden rounded-3xl border bg-[#0a0a14]/85 backdrop-blur-2xl"
              style={{
                borderColor: `${accent}55`,
                boxShadow: `0 30px 90px -20px ${accent}66, 0 0 60px -10px ${accent}40, inset 0 1px 0 rgba(255,255,255,0.06)`,
              }}
            >
              {/* Top gradient highlight */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-32"
                style={{
                  background: `linear-gradient(180deg, ${accent}26 0%, transparent 100%)`,
                }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Cerrar y volver al mapa"
                className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-foreground/80 backdrop-blur-md transition-colors hover:bg-black/60 hover:text-foreground"
              >
                <X size={16} />
              </button>

              {/* Hero media */}
              <div className="relative h-56 w-full overflow-hidden sm:h-64">
                {memory.thumbnailUrl ? (
                  <Image
                    src={memory.thumbnailUrl || "/placeholder.svg"}
                    alt={memory.title}
                    fill
                    sizes="560px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{
                      background: `radial-gradient(ellipse at center, ${accent}40, transparent 70%), #12121e`,
                    }}
                  >
                    <Icon size={48} style={{ color: accent }} />
                  </div>
                )}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(10,10,20,0) 35%, rgba(10,10,20,0.55) 75%, rgba(10,10,20,0.95) 100%)",
                  }}
                />
                {/* Type chip */}
                <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md"
                  style={{
                    borderColor: `${accent}66`,
                    background: `${accent}1F`,
                    color: accent,
                  }}
                >
                  <Icon size={12} />
                  {MEMORY_TYPE_LABEL[memory.type]}
                  {memory.duration ? <span className="text-foreground/70">· {memory.duration}</span> : null}
                </div>
              </div>

              {/* Body */}
              <div className="space-y-5 p-6 sm:p-7">
                <header className="space-y-2">
                  <h2 id="capsule-title" className="font-display text-2xl font-semibold text-balance leading-tight text-foreground">
                    {memory.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={12} />
                      {formatDate(memory.date)}
                    </span>
                    {memory.location ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={12} />
                        {memory.location.name}
                      </span>
                    ) : null}
                  </div>
                </header>

                {memory.description ? (
                  <p className="text-pretty text-sm leading-relaxed text-foreground/80">{memory.description}</p>
                ) : null}

                {memory.tags.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Tag size={12} className="text-muted-foreground" />
                    {memory.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-foreground/75"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {related.length > 0 ? (
                  <div className="space-y-2.5 border-t border-white/5 pt-5">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Conectado con {related.length} {related.length === 1 ? "recuerdo" : "recuerdos"}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {related.slice(0, 4).map((r) => {
                        const RIcon = TYPE_ICONS[r.type]
                        const rAccent = MEMORY_TYPE_COLOR[r.type]
                        return (
                          <button
                            key={r.id}
                            onClick={() => onSelectRelated(r)}
                            className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-left transition-colors hover:border-white/20 hover:bg-white/[0.06]"
                          >
                            <span
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                              style={{ background: `${rAccent}1F`, color: rAccent }}
                            >
                              <RIcon size={13} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-medium text-foreground/90">{r.title}</span>
                              <span className="block text-[10px] text-muted-foreground tabular-nums">
                                {new Date(r.date).getFullYear()}
                              </span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-5">
                  <button
                    type="button"
                    disabled
                    className="text-xs text-muted-foreground/60"
                    title="Próximamente"
                  >
                    Editar (Próximamente)
                  </button>
                  <button
                    onClick={onClose}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-foreground/90 transition-colors hover:border-white/25 hover:bg-white/10"
                  >
                    <X size={13} />
                    Volver al mapa
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

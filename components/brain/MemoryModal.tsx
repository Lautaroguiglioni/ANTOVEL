"use client"

import { AnimatePresence, motion } from "framer-motion"
import { MapPin, X, Pencil, Image as ImageIcon, Mic, Film, FileText, Clock } from "lucide-react"
import Image from "next/image"
import type { Memory, MemoryType } from "@/lib/types"
import { formatMemoryDate, MEMORY_TYPE_LABEL } from "@/lib/brain-logic"

interface Props {
  memory: Memory | null
  related: Memory[]
  onClose: () => void
  onSelectRelated: (m: Memory) => void
}

const TYPE_ICON: Record<MemoryType, typeof ImageIcon> = {
  photo: ImageIcon,
  audio: Mic,
  video: Film,
  note: FileText,
}

export function MemoryModal({ memory, related, onClose, onSelectRelated }: Props) {
  return (
    <AnimatePresence>
      {memory && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={memory.title}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[#12121E]/95 shadow-[0_-20px_60px_rgba(124,58,237,0.25)] backdrop-blur-xl"
          >
            {/* Drag handle */}
            <div className="sticky top-0 z-10 flex justify-center bg-gradient-to-b from-[#12121E] to-transparent pb-2 pt-3">
              <div className="h-1.5 w-10 rounded-full bg-white/15" />
            </div>

            <div className="px-6 pb-10 sm:px-10">
              {/* Close */}
              <div className="mb-4 flex items-start justify-between gap-4">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider"
                  style={{
                    borderColor: `${memory.color}55`,
                    color: memory.color,
                    backgroundColor: `${memory.color}14`,
                  }}
                >
                  <TypeIcon type={memory.type} />
                  {MEMORY_TYPE_LABEL[memory.type]}
                </span>
                <button
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="rounded-full border border-white/10 p-2 text-muted-foreground transition-colors hover:border-white/30 hover:text-foreground"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Media */}
              <div
                className="relative mb-6 aspect-video w-full overflow-hidden rounded-2xl border border-white/10"
                style={{
                  background: `linear-gradient(135deg, ${memory.color}22, transparent 60%), #0b0b14`,
                }}
              >
                {memory.thumbnailUrl ? (
                  <Image
                    src={memory.thumbnailUrl || "/placeholder.svg"}
                    alt={memory.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <TypeIcon type={memory.type} large color={memory.color} />
                  </div>
                )}
                {memory.duration && (
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white/90 backdrop-blur">
                    <Clock size={12} />
                    {memory.duration}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="font-display mb-2 text-2xl font-semibold leading-tight text-balance text-foreground">
                {memory.title}
              </h2>

              {/* Date · Location */}
              <p className="mb-5 text-sm text-muted-foreground">
                {formatMemoryDate(memory.date)}
                {memory.location && (
                  <>
                    {" · "}
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} />
                      {memory.location.name}
                    </span>
                  </>
                )}
              </p>

              {/* Description */}
              {memory.description && (
                <p className="mb-6 leading-relaxed text-foreground/85">{memory.description}</p>
              )}

              {/* Tags */}
              {memory.tags.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {memory.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-foreground/75"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Related memories */}
              {related.length > 0 && (
                <div className="mb-6">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Conectado con {related.length} {related.length === 1 ? "recuerdo" : "recuerdos"}
                  </p>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {related.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => onSelectRelated(r)}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#0b0b14] transition-transform hover:scale-[1.04]"
                        style={{
                          boxShadow: `inset 0 0 24px ${r.color}20`,
                        }}
                      >
                        {r.thumbnailUrl ? (
                          <Image
                            src={r.thumbnailUrl || "/placeholder.svg"}
                            alt={r.title}
                            fill
                            sizes="120px"
                            className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                          />
                        ) : (
                          <div
                            className="flex h-full w-full items-center justify-center"
                            style={{ color: r.color }}
                          >
                            <TypeIcon type={r.type} />
                          </div>
                        )}
                        <span
                          className="absolute bottom-1 left-1 right-1 truncate rounded bg-black/65 px-1.5 py-0.5 text-[10px] text-white/90"
                          title={r.title}
                        >
                          {r.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                {memory.location && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-foreground transition-colors hover:bg-white/10"
                  >
                    <MapPin size={14} />
                    Ver en mapa
                  </button>
                )}
                <button
                  type="button"
                  disabled
                  title="Próximamente"
                  className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-white/10 bg-white/3 px-4 py-2 text-sm text-muted-foreground opacity-60"
                >
                  <Pencil size={14} />
                  Editar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function TypeIcon({
  type,
  large,
  color,
}: {
  type: MemoryType
  large?: boolean
  color?: string
}) {
  const Icon = TYPE_ICON[type]
  return <Icon size={large ? 56 : 14} color={color} aria-hidden />
}

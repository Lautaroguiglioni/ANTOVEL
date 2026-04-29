"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Search, X, Image as ImageIcon, Mic, Film, FileText } from "lucide-react"
import { MEMORY_TYPE_COLOR, MEMORY_TYPE_LABEL } from "@/lib/brain-logic"
import type { Memory, MemoryType } from "@/lib/types"

interface Props {
  memories: Memory[]
  onSelect: (m: Memory) => void
}

const TYPE_ICONS: Record<MemoryType, typeof ImageIcon> = {
  photo: ImageIcon,
  audio: Mic,
  video: Film,
  note: FileText,
}

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()

/**
 * Predictive search across memories. Matches against title, tags,
 * description, location and year.
 *
 * Behavior:
 *  - 220ms debounce before computing matches
 *  - Glassmorphism dropdown with type-tinted icons
 *  - Keyboard nav: ↑ ↓ Enter Esc
 *  - Click-outside closes
 */
export function PredictiveSearch({ memories, onSelect }: Props) {
  const [query, setQuery] = useState("")
  const [debounced, setDebounced] = useState("")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Debounce the query
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 220)
    return () => clearTimeout(id)
  }, [query])

  // Click-outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  const results = useMemo(() => {
    const q = normalize(debounced)
    if (!q) return [] as Memory[]
    return memories
      .filter((m) => {
        const haystack = normalize(
          [m.title, m.tags.join(" "), m.description ?? "", m.location?.name ?? "", new Date(m.date).getFullYear()].join(
            " ",
          ),
        )
        return haystack.includes(q)
      })
      .slice(0, 6)
  }, [debounced, memories])

  // Keep active index in range
  useEffect(() => {
    if (active >= results.length) setActive(0)
  }, [results.length, active])

  const handleSelect = (m: Memory) => {
    setOpen(false)
    setQuery("")
    setDebounced("")
    onSelect(m)
    inputRef.current?.blur()
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) setOpen(true)
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, Math.max(0, results.length - 1)))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === "Enter") {
      if (results[active]) {
        e.preventDefault()
        handleSelect(results[active])
      }
    } else if (e.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const showDropdown = open && debounced.length > 0

  return (
    <div ref={wrapperRef} className="pointer-events-auto relative w-full max-w-md">
      <div
        className="flex items-center gap-2 rounded-full border border-white/10 bg-[#12121E]/70 px-3 py-1.5 backdrop-blur-md transition-colors focus-within:border-[#7C3AED]/60"
        style={{
          boxShadow: showDropdown ? "0 0 0 3px rgba(124,58,237,0.18)" : undefined,
        }}
      >
        <Search size={14} className="text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder="Buscar por año, lugar o tema…"
          aria-label="Buscar recuerdos"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="predictive-search-listbox"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => {
              setQuery("")
              setDebounced("")
              inputRef.current?.focus()
            }}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {showDropdown ? (
          <motion.div
            key="dropdown"
            id="predictive-search-listbox"
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d18]/85 backdrop-blur-2xl"
            style={{ boxShadow: "0 24px 60px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)" }}
          >
            {results.length === 0 ? (
              <div className="px-4 py-5 text-center text-xs text-muted-foreground">
                Sin coincidencias para “{debounced}”
              </div>
            ) : (
              <ul className="max-h-80 overflow-y-auto py-1.5">
                {results.map((m, i) => {
                  const Icon = TYPE_ICONS[m.type]
                  const accent = MEMORY_TYPE_COLOR[m.type]
                  const year = new Date(m.date).getFullYear()
                  const isActive = i === active
                  return (
                    <li key={m.id} role="option" aria-selected={isActive}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => handleSelect(m)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors"
                        style={{
                          background: isActive ? "rgba(124,58,237,0.12)" : "transparent",
                        }}
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                          style={{ background: `${accent}1F`, color: accent }}
                        >
                          <Icon size={14} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">{m.title}</span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            <span className="tabular-nums">{year}</span>
                            {m.location ? <span> · {m.location.name}</span> : null}
                            {m.tags.length > 0 ? <span> · {m.tags.slice(0, 2).join(", ")}</span> : null}
                          </span>
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                          {MEMORY_TYPE_LABEL[m.type]}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

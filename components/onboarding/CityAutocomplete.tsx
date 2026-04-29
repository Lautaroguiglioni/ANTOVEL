"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MapPin, Search } from "lucide-react"
import { CITIES } from "@/lib/cities"

const stripAccents = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

type Props = {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

/**
 * Predictive city search with 300ms debounce.
 * Glassmorphism dropdown — bg-[#12121E]/85 + backdrop-blur — keeping
 * the dark aesthetic. Fully keyboard navigable (↑ ↓ Enter Esc).
 */
export function CityAutocomplete({ value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState(value)
  const [debounced, setDebounced] = useState(value)
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputId = useId()

  // Sync external value
  useEffect(() => {
    setQuery(value)
  }, [value])

  // 300ms debounce
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query), 300)
    return () => window.clearTimeout(t)
  }, [query])

  const matches = useMemo(() => {
    const q = stripAccents(debounced.trim())
    if (q.length < 1) return []
    return CITIES.filter((c) =>
      stripAccents(`${c.name} ${c.country}`).includes(q),
    ).slice(0, 8)
  }, [debounced])

  // Click-outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const select = (label: string) => {
    onChange(label)
    setQuery(label)
    setOpen(false)
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && matches.length > 0) {
      e.preventDefault()
      setOpen(true)
      setHighlight((h) => (h + 1) % matches.length)
    } else if (e.key === "ArrowUp" && matches.length > 0) {
      e.preventDefault()
      setHighlight((h) => (h - 1 + matches.length) % matches.length)
    } else if (e.key === "Enter" && open && matches[highlight]) {
      e.preventDefault()
      const c = matches[highlight]
      select(`${c.name}, ${c.country}`)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  const showDropdown = open && matches.length > 0

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.7}
        />
        <input
          id={inputId}
          type="text"
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={`${inputId}-listbox`}
          aria-autocomplete="list"
          value={query}
          placeholder={placeholder ?? "Ciudad, País"}
          onChange={(e) => {
            setQuery(e.target.value)
            onChange(e.target.value)
            setOpen(true)
            setHighlight(0)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          className="w-full rounded-2xl border border-[var(--border-strong)] bg-surface px-5 py-4 pl-11 font-display text-lg text-foreground outline-none transition-all placeholder:text-muted/60 focus:border-[var(--neural-violet)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.18)]"
        />
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            id={`${inputId}-listbox`}
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#12121E]/85 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          >
            {matches.map((c, i) => {
              const label = `${c.name}, ${c.country}`
              const active = i === highlight
              return (
                <li
                  key={`${c.name}-${c.country}`}
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setHighlight(i)}
                  onMouseDown={(e) => {
                    e.preventDefault() // keep input focus
                    select(label)
                  }}
                  className={[
                    "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                    active
                      ? "bg-[var(--neural-violet)]/22 text-foreground"
                      : "text-foreground/85 hover:bg-white/5",
                  ].join(" ")}
                >
                  <Search
                    aria-hidden
                    className="h-3.5 w-3.5 text-muted-foreground"
                    strokeWidth={1.7}
                  />
                  <span className="flex-1 truncate text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground">, {c.country}</span>
                  </span>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

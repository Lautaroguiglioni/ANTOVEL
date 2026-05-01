import { create } from "zustand"
import type { Memory, MemoryType } from "@/lib/types"

const ALL_TYPES: MemoryType[] = ["photo", "audio", "video", "note"]

interface BrainState {
  // Selection / focus (drives the camera + capsule)
  selectedMemory: Memory | null

  // Filters
  visibleTypes: Set<MemoryType>
  yearRange: [number, number]
  activeLocation: string | null

  // Whether the year range was already initialized from the user's profile
  initialized: boolean

  // Actions
  setSelectedMemory: (m: Memory | null) => void
  toggleType: (type: MemoryType | null) => void
  setVisibleTypes: (ts: Set<MemoryType>) => void
  setYearRange: (range: [number, number]) => void
  setActiveLocation: (loc: string | null) => void
  initializeFromProfile: (birthDateISO?: string) => void
}

export const useBrainStore = create<BrainState>((set, get) => ({
  selectedMemory: null,
  visibleTypes: new Set(ALL_TYPES),
  yearRange: (() => {
    const cy = new Date().getFullYear()
    return [cy - 5, cy] as [number, number]
  })(),
  activeLocation: null,
  initialized: false,

  setSelectedMemory: (m) => set({ selectedMemory: m }),

  toggleType: (type) => {
    const prev = get().visibleTypes
    if (type === null) {
      set({
        visibleTypes: prev.size === 4 ? new Set<MemoryType>(["photo"]) : new Set(ALL_TYPES),
      })
      return
    }
    const next = new Set(prev)
    if (next.has(type)) {
      // Never allow zero active types
      if (next.size === 1) return
      next.delete(type)
    } else {
      next.add(type)
    }
    set({ visibleTypes: next })
  },

  setVisibleTypes: (ts) => set({ visibleTypes: new Set(ts) }),

  setYearRange: (range) => set({ yearRange: range }),

  setActiveLocation: (loc) => set({ activeLocation: loc }),

  initializeFromProfile: (birthDateISO) => {
    if (get().initialized) return
    if (!birthDateISO) {
      set({ initialized: true })
      return
    }
    const birthYear = new Date(birthDateISO).getFullYear()
    const cy = new Date().getFullYear()
    set({
      yearRange: [Math.max(birthYear, cy - 8), cy],
      initialized: true,
    })
  },
}))

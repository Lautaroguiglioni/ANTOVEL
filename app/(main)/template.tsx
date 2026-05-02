"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

/**
 * template.tsx remounts on every route change inside (main)/* — perfect
 * for native-style page transitions without affecting the persistent
 * BrainCanvas in layout.tsx.
 *
 * No `h-full` or `min-h-full` here — the parent (#antovel-scroll) owns
 * the scroll. We only set width and reserve `pb-32` so the floating
 * glass TabBar doesn't cover the last items.
 */
export default function MainTemplate({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
      className="w-full pb-32"
    >
      {children}
    </motion.div>
  )
}

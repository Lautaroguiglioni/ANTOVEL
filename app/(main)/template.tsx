"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

/**
 * template.tsx re-mounts on every route change inside (main)/* — perfect
 * for native-style page transitions without affecting the persistent
 * BrainCanvas which lives in layout.tsx (never remounts).
 *
 * `min-h-full` (not `h-full`) lets pages grow taller than the shell so
 * the parent's overflow-y-auto can scroll them. `pb-32` reserves space
 * for the floating TabBar (z-50, glass) on the 4 primary routes.
 */
export default function MainTemplate({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{
        duration: 0.32,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="min-h-full w-full pb-32"
    >
      {children}
    </motion.div>
  )
}

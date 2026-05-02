"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

/**
 * Page transition wrapper. Opacity-only — no transform animations.
 *
 * Why no transforms: a `transform` (even `translate3d(0,0,0)`) on this
 * element creates a containing block for any descendant `position: fixed`
 * (modals, the memory capsule, dropdowns). That breaks fullscreen overlays
 * by confining them to this wrapper instead of the viewport. Animating
 * just opacity keeps the visual cross-fade between tabs without that bug.
 *
 * `pb-32` reserves space at the bottom so the floating glass TabBar
 * doesn't cover the final content.
 */
export default function MainTemplate({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="w-full pb-32"
    >
      {children}
    </motion.div>
  )
}

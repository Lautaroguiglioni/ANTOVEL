"use client"

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

/**
 * Native-feeling button: scales to 0.95 on press (haptic feedback simulation).
 * Drop-in replacement for <button>.
 */
type Props = HTMLMotionProps<"button"> & {
  className?: string
}

export const TapButton = forwardRef<HTMLButtonElement, Props>(function TapButton(
  { children, className, ...rest },
  ref,
) {
  const reduced = useReducedMotion()
  return (
    <motion.button
      ref={ref}
      whileTap={reduced ? undefined : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 700, damping: 35 }}
      className={cn("touch-manipulation select-none outline-none", className)}
      {...rest}
    >
      {children}
    </motion.button>
  )
})

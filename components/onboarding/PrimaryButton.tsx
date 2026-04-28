"use client"

import type { ButtonHTMLAttributes, ReactNode } from "react"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
}

export function PrimaryButton({ children, className, ...props }: Props) {
  return (
    <button
      {...props}
      className={[
        "group relative w-full rounded-full bg-[var(--neural-violet)] px-6 py-4",
        "font-display text-base font-semibold tracking-tight text-white",
        "transition-all duration-300 glow-violet glow-violet-hover",
        "hover:scale-[1.01] active:scale-[0.99]",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100",
        className ?? "",
      ].join(" ")}
    >
      <span className="flex items-center justify-center gap-2">{children}</span>
    </button>
  )
}

export function GhostButton({ children, className, ...props }: Props) {
  return (
    <button
      {...props}
      className={[
        "rounded-full px-5 py-2.5 text-sm font-medium",
        "text-muted-foreground transition-colors hover:text-foreground",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </button>
  )
}

"use client"

import type { ReactNode } from "react"

/**
 * App shell — page-based layout that scales from mobile to desktop.
 *
 * Mobile: full viewport, native body-scroll (no nested scroll container).
 * Desktop: same body-scroll, ambient violet glow as background; pages
 * constrain their own content width with internal `max-w-*` wrappers.
 *
 * No fixed frame, no `overflow-hidden`, no `h-dvh` on the wrapper —
 * any of those would clip tall pages on desktop and trap touch gestures
 * on mobile. `min-h-dvh` lets the body grow with content.
 */
export function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh w-full bg-black text-foreground">
      {/* Ambient glow — fixed so it stays put while the body scrolls. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.10), transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(6,182,212,0.06), transparent 55%)",
        }}
      />
      {children}
    </div>
  )
}

"use client"

import type { ReactNode } from "react"

/**
 * Native-app shell: max-width 430px (iPhone 15 Pro Max), centered.
 * On mobile it's full-screen; on desktop it sits in a phone-like frame
 * with rounded corners and a subtle violet glow.
 */
export function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-dvh w-full justify-center bg-black md:items-center md:py-6"
      style={{
        // Subtle ambient glow around the device on desktop
        backgroundImage:
          "radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.08), transparent 60%)",
      }}
    >
      <div
        className="
          relative h-dvh w-full max-w-[430px] overflow-hidden bg-background
          md:h-[920px] md:max-h-[calc(100dvh-3rem)] md:rounded-[44px]
          md:border md:border-white/10
          md:shadow-[0_0_80px_-10px_rgba(124,58,237,0.45),0_30px_80px_-20px_rgba(0,0,0,0.7)]
        "
      >
        {children}
      </div>
    </div>
  )
}

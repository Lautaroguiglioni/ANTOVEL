import type { ReactNode } from "react"
import { TabBar } from "@/components/layout/TabBar"
import { PersistentBrainScene } from "@/components/brain/PersistentBrainScene"

/**
 * (main) layout — flat page structure.
 *
 * - PersistentBrainScene is `fixed inset-0` to the viewport, mounted once
 *   and shown only on /brain (visibility toggled, render loop paused
 *   elsewhere via `frameloop="never"`).
 * - Children flow in normal document order so the body owns the scroll.
 *   This gives mobile and desktop identical, predictable scrolling.
 * - TabBar is `fixed bottom-0` (centered, max-width inside) so it floats
 *   over content but doesn't trap pointer events outside the bar itself.
 *
 * No nested scroll containers, no fragile `h-full` chains, no
 * transformed wrappers around fixed-position modals.
 */
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PersistentBrainScene />
      {children}
      <TabBar />
    </>
  )
}

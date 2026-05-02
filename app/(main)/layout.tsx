import type { ReactNode } from "react"
import { TabBar } from "@/components/layout/TabBar"
import { PersistentBrainScene } from "@/components/brain/PersistentBrainScene"

/**
 * Native-app shell for the (main) experience.
 *
 * Scroll architecture (single source of truth):
 * - The 430px MobileLayout shell is `relative h-dvh overflow-hidden`.
 * - We mount ONE scroll container here (`absolute inset-0 overflow-y-auto`)
 *   that fills the shell exactly. `absolute inset-0` gives it a guaranteed
 *   concrete height regardless of the page tree above (no fragile
 *   `h-full` chains, no flex-context dependencies).
 * - Children pages MUST NOT add their own `overflow-y-auto` or `h-full`
 *   to a wrapping `<main>` — that creates a nested scroll that collapses
 *   when its parent has only `min-height`, eating touch gestures.
 * - The PersistentBrainScene sits behind (z-0) and the TabBar floats
 *   above (z-50). Both are `absolute` and untouched by scroll.
 */
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PersistentBrainScene />
      <div
        id="antovel-scroll"
        className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {children}
      </div>
      <TabBar />
    </>
  )
}

import type { ReactNode } from "react"
import { TabBar } from "@/components/layout/TabBar"
import { PersistentBrainScene } from "@/components/brain/PersistentBrainScene"

/**
 * Native-app shell for the (main) experience.
 * - The 430px MobileLayout already wraps everything from root.
 * - Mounts the 3D brain canvas ONCE (preserved across tab changes).
 * - Renders the bottom tab bar on the 4 primary routes.
 *
 * The inner wrapper owns the scroll: `h-full overflow-y-auto`. The
 * MobileLayout frame keeps `overflow-hidden` to preserve its rounded
 * corners on desktop, but the scrollable area lives here so children
 * can grow vertically and scroll under the floating TabBar.
 */
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PersistentBrainScene />
      <div className="relative z-10 h-full overflow-y-auto overflow-x-hidden overscroll-contain">
        {children}
      </div>
      <TabBar />
    </>
  )
}

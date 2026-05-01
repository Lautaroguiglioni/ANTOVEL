import type { ReactNode } from "react"
import { TabBar } from "@/components/layout/TabBar"
import { PersistentBrainScene } from "@/components/brain/PersistentBrainScene"

/**
 * Native-app shell for the (main) experience.
 * - The 430px MobileLayout already wraps everything from root.
 * - Mounts the 3D brain canvas ONCE (preserved across tab changes).
 * - Renders the bottom tab bar on the 4 primary routes.
 *
 * PersistentBrainScene and TabBar are absolutely positioned, so they
 * anchor to MobileLayout's relative inner container.
 */
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PersistentBrainScene />
      <div className="relative z-10 flex h-full flex-col">{children}</div>
      <TabBar />
    </>
  )
}

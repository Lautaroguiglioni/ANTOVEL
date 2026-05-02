"use client"

import { Brain, HeartPulse, Plus, Map } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

type Tab = {
  href: string
  label: string
  icon: typeof Brain
  primary?: boolean
}

const TABS: Tab[] = [
  { href: "/brain", label: "Cerebro", icon: Brain },
  { href: "/health", label: "Salud", icon: HeartPulse },
  { href: "/upload", label: "Carga", icon: Plus, primary: true },
  { href: "/discover", label: "Descubrir", icon: Map },
]

const VISIBLE_ROUTES = ["/brain", "/health", "/upload", "/discover"]

export function TabBar() {
  const pathname = usePathname() ?? ""
  const reduced = useReducedMotion()

  // Only show the tab bar on the 4 primary routes (not on alzheimer pages)
  const visible = VISIBLE_ROUTES.some((r) => pathname.startsWith(r))
  if (!visible) return null

  return (
    <nav
      aria-label="Navegación principal"
      className="
        pointer-events-auto fixed inset-x-0 bottom-0 z-50
        border-t border-white/10
        bg-black/55 backdrop-blur-md
        [&]:supports-[backdrop-filter]:bg-black/40
      "
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)",
      }}
    >
      <ul className="mx-auto grid w-full max-w-[480px] grid-cols-4 px-2 pt-2 md:max-w-[560px]">
        {TABS.map((tab) => {
          const isActive = pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <li key={tab.href} className="flex justify-center">
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={tab.label}
                className="block touch-manipulation select-none"
              >
                <motion.div
                  whileTap={reduced ? undefined : { scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 700, damping: 32 }}
                  className="relative flex flex-col items-center gap-1 px-3 py-1.5"
                >
                  {/* Primary action ("Carga") gets a filled circular treatment */}
                  {tab.primary ? (
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full transition-all",
                        isActive
                          ? "shadow-[0_0_20px_rgba(124,58,237,0.55)]"
                          : "shadow-[0_0_14px_rgba(124,58,237,0.3)]",
                      )}
                      style={{
                        background:
                          "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
                      }}
                    >
                      <Icon
                        size={22}
                        strokeWidth={2.4}
                        className="text-white"
                      />
                    </div>
                  ) : (
                    <div className="relative flex h-7 w-7 items-center justify-center">
                      {isActive && (
                        <motion.div
                          layoutId="tab-indicator-bg"
                          className="absolute inset-[-6px] rounded-full bg-[#7C3AED]/15"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}
                      <Icon
                        size={22}
                        strokeWidth={isActive ? 2.4 : 1.8}
                        className={cn(
                          "relative transition-colors",
                          isActive ? "text-[#A78BFA]" : "text-white/55",
                        )}
                      />
                    </div>
                  )}

                  <span
                    className={cn(
                      "text-[10px] font-medium tracking-wide transition-colors",
                      isActive ? "text-[#A78BFA]" : "text-white/55",
                    )}
                  >
                    {tab.label}
                  </span>
                </motion.div>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

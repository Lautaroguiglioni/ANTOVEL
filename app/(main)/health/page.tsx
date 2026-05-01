"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import Image from "next/image"
import { Plus } from "lucide-react"
import { loadProfile } from "@/hooks/useOnboarding"
import { useHealthData } from "@/hooks/useHealthData"
import { HEALTH_STATE_CONFIG } from "@/lib/mock-health-data"
import type { AntovelProfile } from "@/lib/types"
import { ProgressRing } from "@/components/health/ProgressRing"
import { HealthCard } from "@/components/health/HealthCard"
import { HealthModal } from "@/components/health/HealthModal"

// Avatar needs WebGL
const AvatarViewer = dynamic(
  () => import("@/components/health/AvatarViewer").then((m) => m.AvatarViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--neural-violet)] border-t-transparent" />
      </div>
    ),
  }
)

export default function HealthPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<AntovelProfile | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const { metrics, data, updateMetrics } = useHealthData()

  useEffect(() => {
    const p = loadProfile()
    if (!p?.onboardingCompleted) {
      router.replace("/onboarding")
      return
    }
    setProfile(p)
    setHydrated(true)
  }, [router])

  if (!hydrated || !profile) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--neural-violet)] border-t-transparent" />
      </main>
    )
  }

  const stateConfig = HEALTH_STATE_CONFIG[data.state]

  return (
    <main className="relative flex min-h-dvh flex-col bg-background">
      {/* Subtle background gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12), transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(6,182,212,0.08), transparent 50%), #080810",
        }}
      />

      {/* ── Avatar Section (55%) ── */}
      <section className="relative flex h-[55dvh] flex-col items-center justify-center px-4">
        {/* Header with logo */}
        <header className="absolute left-4 top-4 z-10 flex items-center gap-3">
          <Image
            src="/antovel-logo.png"
            alt="Antovel"
            width={36}
            height={36}
            className="mix-blend-screen"
          />
          <span className="font-display text-lg font-semibold text-foreground tracking-wide">
            Salud
          </span>
        </header>

        {/* Greeting */}
        <div className="absolute left-4 top-16 z-10 md:left-8">
          <h1 className="font-display text-xl font-semibold text-foreground md:text-2xl">
            Hola, {profile.name}
          </h1>
        </div>

        {/* Avatar canvas */}
        <div className="relative h-[70%] w-full max-w-[320px]">
          <AvatarViewer state={data.state} healthScore={data.healthScore} />
        </div>

        {/* State badge */}
        <div
          className="mt-2 flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
          style={{
            backgroundColor: stateConfig.bgColor,
            color: stateConfig.color,
          }}
        >
          Estado: {stateConfig.label}
          {data.state === "radiant" && <span className="animate-pulse">*</span>}
        </div>

        {/* Health Score ring — positioned to the right on desktop */}
        <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 md:block">
          <ProgressRing
            progress={data.healthScore}
            size={100}
            strokeWidth={8}
            color={stateConfig.color}
            bgColor={stateConfig.bgColor}
          >
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl font-bold text-foreground">
                {data.healthScore}
              </span>
              <span className="text-[10px] text-muted-foreground">Health</span>
            </div>
          </ProgressRing>
        </div>

        {/* Mobile health score — below badge */}
        <div className="mt-4 md:hidden">
          <ProgressRing
            progress={data.healthScore}
            size={80}
            strokeWidth={6}
            color={stateConfig.color}
            bgColor={stateConfig.bgColor}
          >
            <div className="flex flex-col items-center">
              <span className="font-display text-xl font-bold text-foreground">
                {data.healthScore}
              </span>
              <span className="text-[9px] text-muted-foreground">Health</span>
            </div>
          </ProgressRing>
        </div>
      </section>

      {/* ── Dashboard Section (45%) ── */}
      <section className="flex flex-1 flex-col gap-4 px-4 pb-24 pt-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Metricas</h2>

        {/* Horizontal scroll cards */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
          <HealthCard type="steps" data={data} />
          <HealthCard type="sleep" data={data} />
          <HealthCard type="heart" data={data} />
          <HealthCard type="stress" data={data} />
        </div>
      </section>

      {/* Floating action button */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--neural-violet)] px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:brightness-110 glow-violet"
      >
        <Plus size={18} />
        Registrar datos manualmente
      </button>

      {/* Modal */}
      <HealthModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        currentMetrics={metrics}
        onSave={updateMetrics}
      />
    </main>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, ChevronLeft } from "lucide-react"
import { useOnboarding } from "@/hooks/useOnboarding"
import { AntovelLogo } from "@/components/onboarding/AntovelLogo"
import { LogoAntovel } from "@/components/brand/LogoAntovel"
import { NeuralBackground } from "@/components/onboarding/NeuralBackground"
import { ProgressDots } from "@/components/onboarding/ProgressDots"
import {
  GhostButton,
  PrimaryButton,
} from "@/components/onboarding/PrimaryButton"
import { StepWelcome } from "@/components/onboarding/StepWelcome"
import { StepPersonalData } from "@/components/onboarding/StepPersonalData"
import { StepPurpose } from "@/components/onboarding/StepPurpose"
import { StepPrivacy } from "@/components/onboarding/StepPrivacy"

/**
 * Slide variants — directional horizontal translate + fade.
 * `custom` carries the navigation direction so the same variants
 * resolve into mirrored animations for forward vs back.
 */
const slideVariants = {
  enter: (dir: "forward" | "back") => ({
    x: dir === "forward" ? 64 : -64,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: "forward" | "back") => ({
    x: dir === "forward" ? -64 : 64,
    opacity: 0,
  }),
}

export default function OnboardingPage() {
  const router = useRouter()
  const {
    step,
    direction,
    profile,
    hydrated,
    update,
    next,
    back,
    complete,
    totalSteps,
  } = useOnboarding()

  const [activating, setActivating] = useState(false)

  if (!hydrated) {
    return <div className="min-h-dvh bg-background" aria-hidden />
  }

  const isLast = step === totalSteps - 1

  // Per-step validation
  const canAdvance = (() => {
    if (step === 0) return true
    if (step === 1) {
      const nameOk = (profile.name ?? "").trim().length >= 2
      const dateOk = Boolean(profile.birthDate)
      const cityOk = Boolean((profile.city ?? "").trim())
      return nameOk && dateOk && cityOk
    }
    if (step === 2) {
      const count = (profile.purposes ?? []).length
      return count >= 1 && count <= 3
    }
    if (step === 3) return Boolean(profile.privacy)
    return true
  })()

  const ctaLabel =
    step === 0
      ? "Comenzar mi Legado"
      : isLast
        ? "Activar mi Cerebro"
        : "Continuar"

  const handleNext = () => {
    if (!canAdvance || activating) return
    if (isLast) {
      complete() // saves to localStorage `antovel_user_data`
      // 1.5s activation choreography, then navigate.
      setActivating(true)
      window.setTimeout(() => {
        router.push("/brain")
      }, 1500)
      return
    }
    next()
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <NeuralBackground />

      {/* Header: logo + dots */}
      <header className="flex items-center justify-between px-6 pt-8 sm:px-10">
        <AntovelLogo />
        <ProgressDots total={totalSteps} current={step} />
      </header>

      {/* Step content — directional slide + fade with framer-motion */}
      <section className="relative flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
            className="flex w-full justify-center"
          >
            {step === 0 && <StepWelcome />}
            {step === 1 && (
              <StepPersonalData profile={profile} onChange={update} />
            )}
            {step === 2 && <StepPurpose profile={profile} onChange={update} />}
            {step === 3 && <StepPrivacy profile={profile} onChange={update} />}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Bottom CTA */}
      <footer className="sticky bottom-0 px-6 pb-8 pt-4 sm:px-10 sm:pb-10">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3">
          <PrimaryButton
            onClick={handleNext}
            disabled={!canAdvance || activating}
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </PrimaryButton>
          <div className="flex h-8 items-center justify-center">
            {step > 0 ? (
              <GhostButton onClick={back} className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Atrás
              </GhostButton>
            ) : (
              <span className="text-xs text-muted-foreground/70">
                Tus datos se guardan solo en tu dispositivo.
              </span>
            )}
          </div>
        </div>
      </footer>

      {/* ─── Activation overlay (1.5s) ─────────────────────────────
          Logo fades in, pulses with intense glow, then fades out
          while the router navigates to /brain.
          ────────────────────────────────────────────────────────── */}
      {activating && (
        <div
          aria-hidden
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-activation-fade"
        >
          <div className="relative flex h-56 w-56 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.7)_0%,rgba(6,182,212,0.22)_45%,transparent_70%)] blur-2xl animate-activation-glow" />
            <div className="relative animate-activation-pulse drop-shadow-[0_0_44px_rgba(167,139,250,0.85)]">
              <LogoAntovel size={176} decorative glow={false} />
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

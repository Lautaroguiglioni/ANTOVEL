"use client"

import { useRouter } from "next/navigation"
import { ArrowRight, ChevronLeft } from "lucide-react"
import { useOnboarding } from "@/hooks/useOnboarding"
import { AntovelLogo } from "@/components/onboarding/AntovelLogo"
import { ProgressDots } from "@/components/onboarding/ProgressDots"
import {
  GhostButton,
  PrimaryButton,
} from "@/components/onboarding/PrimaryButton"
import { StepWelcome } from "@/components/onboarding/StepWelcome"
import { StepIdentity } from "@/components/onboarding/StepIdentity"
import { StepOrigin } from "@/components/onboarding/StepOrigin"
import { StepIntent } from "@/components/onboarding/StepIntent"

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

  if (!hydrated) {
    return <div className="min-h-dvh bg-background" aria-hidden />
  }

  const isLast = step === totalSteps - 1
  const canAdvance = (() => {
    if (step === 0) return true
    if (step === 1) return (profile.name ?? "").trim().length >= 2
    if (step === 2) return Boolean(profile.birthDate && profile.birthPlace)
    if (step === 3) return (profile.intents ?? []).length > 0
    return true
  })()

  const ctaLabel = step === 0 ? "Comenzar" : isLast ? "Activar mi cerebro" : "Continuar"

  const handleNext = () => {
    if (!canAdvance) return
    if (isLast) {
      complete()
      router.push("/brain")
      return
    }
    next()
  }

  const animClass =
    direction === "forward"
      ? "animate-slide-in-right"
      : "animate-slide-in-left"

  return (
    <main className="bg-neural-nebula bg-dot-grid relative flex min-h-dvh flex-col bg-background">
      {/* Header: logo + dots */}
      <header className="flex items-center justify-between px-6 pt-8 sm:px-10">
        <AntovelLogo />
        <ProgressDots total={totalSteps} current={step} />
      </header>

      {/* Step content */}
      <section className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
        <div key={step} className={animClass}>
          {step === 0 && <StepWelcome />}
          {step === 1 && <StepIdentity profile={profile} onChange={update} />}
          {step === 2 && <StepOrigin profile={profile} onChange={update} />}
          {step === 3 && <StepIntent profile={profile} onChange={update} />}
        </div>
      </section>

      {/* Bottom CTA */}
      <footer className="sticky bottom-0 px-6 pb-8 pt-4 sm:px-10 sm:pb-10">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3">
          <PrimaryButton onClick={handleNext} disabled={!canAdvance}>
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
    </main>
  )
}

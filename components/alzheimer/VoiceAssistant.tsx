"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pause, Play, RotateCcw, Volume2 } from "lucide-react"
import type { EssenceDocument, EssencePrompt, MemoryExtended } from "@/lib/types"
import {
  buildOpeningGreeting,
  selectSessionPrompts,
} from "@/lib/alzheimer/essence-engine"

interface Props {
  essence: EssenceDocument
  donations: MemoryExtended[]
}

type Phase = "idle" | "greeting" | "prompt" | "closing" | "done"

/**
 * Voice assistant — reads the patient's identity affirmation and rotates
 * through 3 reminiscence prompts using the browser's Web Speech API.
 * No external dependency. Falls back gracefully if speech is unavailable.
 */
export function VoiceAssistant({ essence, donations }: Props) {
  const [supported, setSupported] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [phase, setPhase] = useState<Phase>("idle")
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeText, setActiveText] = useState<string>("")
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const promptsRef = useRef<EssencePrompt[]>([])

  // ── Capability detection (client-only) ──
  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window)
  }, [])

  // ── Build the session script ──
  useEffect(() => {
    promptsRef.current = selectSessionPrompts(essence, donations, 3)
  }, [essence, donations])

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  /** Speak a single piece of text and resolve when it ends. */
  const speak = (text: string): Promise<void> =>
    new Promise((resolve) => {
      if (!supported) {
        resolve()
        return
      }
      const u = new SpeechSynthesisUtterance(text)
      u.lang = "es-AR"
      u.rate = 0.92
      u.pitch = 1.0
      u.onend = () => resolve()
      u.onerror = () => resolve()
      utteranceRef.current = u
      window.speechSynthesis.speak(u)
    })

  /** Run the full session: greeting → prompts → closing. */
  const runSession = async () => {
    if (!supported) return
    setPlaying(true)

    // Greeting
    setPhase("greeting")
    const greeting = buildOpeningGreeting(essence)
    setActiveText(greeting)
    await speak(greeting)
    if (window.speechSynthesis.paused) return // user paused

    // Prompts
    setPhase("prompt")
    for (let i = 0; i < promptsRef.current.length; i++) {
      setActiveIndex(i)
      const text = promptsRef.current[i].prompt
      setActiveText(text)
      await speak(text)
      // pause briefly between prompts
      await new Promise((r) => setTimeout(r, 600))
    }

    // Closing
    setPhase("closing")
    const closing = `Si necesitás algo, llamá a ${essence.emergencyContact.name}.`
    setActiveText(closing)
    await speak(closing)

    setPhase("done")
    setPlaying(false)
  }

  const handleStart = () => {
    if (!supported) return
    if (phase === "idle" || phase === "done") {
      setActiveIndex(0)
      void runSession()
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setPlaying(true)
    }
  }

  const handlePause = () => {
    if (!supported) return
    window.speechSynthesis.pause()
    setPlaying(false)
  }

  const handleRestart = () => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setPhase("idle")
    setActiveText("")
    setActiveIndex(0)
    setPlaying(false)
    setTimeout(() => {
      void runSession()
    }, 200)
  }

  if (!supported) {
    return (
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <Volume2 className="mx-auto mb-4 size-10 text-[#A78BFA]" />
        <p className="text-lg text-white">
          Tu navegador no permite reproducir voz por ahora.
        </p>
        <p className="mt-2 text-sm text-[#cbd5e1]">
          Probá abrir Antovel desde Safari o Chrome para escuchar la sesión.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8 pb-24">
      {/* ─── Pulsing orb ─────────────────────────────────────────── */}
      <div className="relative flex h-72 w-72 items-center justify-center">
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(167,139,250,0.55) 0%, rgba(244,114,182,0.18) 45%, transparent 70%)",
          }}
          animate={{
            scale: playing ? [1, 1.18, 1] : 1,
            opacity: playing ? [0.7, 1, 0.7] : 0.5,
          }}
          transition={{
            duration: 2.4,
            repeat: playing ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
        <motion.span
          className="absolute size-44 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(252,211,77,0.45), rgba(167,139,250,0.2) 60%, transparent 80%)",
            filter: "blur(2px)",
          }}
          animate={{ scale: playing ? [1, 1.06, 1] : 1 }}
          transition={{ duration: 1.6, repeat: playing ? Infinity : 0, ease: "easeInOut" }}
        />
        <span
          className="relative flex size-32 items-center justify-center rounded-full font-serif text-3xl font-semibold text-[#1A0F2E]"
          style={{
            background: "linear-gradient(135deg, #FCD34D 0%, #F472B6 100%)",
            boxShadow: "0 0 50px rgba(252,211,77,0.4)",
          }}
        >
          {essence.patientName.charAt(0)}
        </span>
      </div>

      {/* ─── Active line ─────────────────────────────────────────── */}
      <div className="min-h-[88px] w-full text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={activeText || "idle"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="font-serif text-2xl leading-relaxed text-white md:text-3xl"
          >
            {activeText ||
              `Pulsá Empezar y escuchá tu historia, ${essence.patientName}.`}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ─── Progress dots ───────────────────────────────────────── */}
      {phase === "prompt" || phase === "closing" || phase === "done" ? (
        <div className="flex gap-2">
          {promptsRef.current.map((_, i) => (
            <span
              key={i}
              className="size-2.5 rounded-full transition-colors"
              style={{
                background:
                  i < activeIndex || phase === "closing" || phase === "done"
                    ? "#FCD34D"
                    : i === activeIndex
                      ? "#F472B6"
                      : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>
      ) : null}

      {/* ─── Controls ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {playing ? (
          <button
            type="button"
            onClick={handlePause}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-base font-semibold text-white hover:bg-white/10"
          >
            <Pause className="size-5" />
            Pausar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStart}
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-lg font-semibold text-[#1A0F2E] transition-transform hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #FCD34D 0%, #F472B6 100%)",
              boxShadow: "0 0 32px rgba(252,211,77,0.45)",
            }}
          >
            <Play className="size-5" />
            {phase === "idle" ? "Empezar sesión" : phase === "done" ? "Repetir" : "Continuar"}
          </button>
        )}
        {phase !== "idle" ? (
          <button
            type="button"
            onClick={handleRestart}
            aria-label="Reiniciar"
            className="flex size-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            <RotateCcw className="size-5" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Phone } from "lucide-react"
import { VoiceAssistant } from "@/components/alzheimer/VoiceAssistant"
import { mockEssence, mockDonations } from "@/lib/alzheimer/mock-alzheimer-data"

/**
 * /voice — spoken reminiscence session. Plays the patient's identity
 * affirmation followed by 3 prompts using the Web Speech API.
 * Emergency call button is permanently visible.
 */
export default function VoicePage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#1A0F2E] text-white">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(252,211,77,0.16) 0%, transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(167,139,250,0.16) 0%, transparent 65%)",
        }}
      />

      <header className="sticky top-0 z-20 backdrop-blur-md" style={{ background: "rgba(26,15,46,0.7)" }}>
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4">
          <Link
            href="/essence"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#cbd5e1] hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Esencia
          </Link>
          <div className="flex items-center gap-2">
            <Image
              src="/antovel-logo.png"
              alt="Antovel"
              width={28}
              height={28}
              className="size-7 object-contain"
              style={{ mixBlendMode: "screen" }}
            />
            <span className="font-serif text-lg tracking-wider text-white">Voz</span>
          </div>
        </div>
      </header>

      <div className="px-5 pt-12 sm:pt-16">
        <VoiceAssistant essence={mockEssence} donations={mockDonations} />
      </div>

      {/* Permanent emergency floating button */}
      <a
        href={`tel:${mockEssence.emergencyContact.phone.replace(/\s/g, "")}`}
        className="fixed bottom-6 left-1/2 z-30 inline-flex -translate-x-1/2 items-center gap-2 rounded-full px-6 py-3 text-base font-semibold text-white shadow-2xl"
        style={{ background: "#DC2626", boxShadow: "0 0 32px rgba(220,38,38,0.5)" }}
      >
        <Phone className="size-5" />
        Llamar a {mockEssence.emergencyContact.name}
      </a>
    </main>
  )
}

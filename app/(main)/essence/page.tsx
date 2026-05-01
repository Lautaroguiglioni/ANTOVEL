"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { EssencePanel } from "@/components/alzheimer/EssencePanel"
import { mockEssence, mockDonations } from "@/lib/alzheimer/mock-alzheimer-data"
import { capabilitiesFor } from "@/lib/alzheimer/permissions"

/**
 * /essence — the reminiscence script. The most important page in the
 * Alzheimer module. For this MVP we assume the active session is the
 * primary caregiver (full read + edit). In production this would be
 * derived from the AntovelProfile.appMode + alzheimerConfig.myRole.
 */
export default function EssencePage() {
  const caps = capabilitiesFor("caregiver")

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#1A0F2E] text-white">
      {/* Warm ambient backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(252,211,77,0.10) 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(244,114,182,0.10) 0%, transparent 50%), radial-gradient(ellipse at 0% 60%, rgba(167,139,250,0.08) 0%, transparent 55%)",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md" style={{ background: "rgba(26,15,46,0.7)" }}>
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4">
          <Link
            href="/brain"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#cbd5e1] hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Volver al cerebro
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
            <span className="font-serif text-lg tracking-wider text-white">Esencia</span>
          </div>
        </div>
      </header>

      <div className="px-5 pt-8 sm:pt-12">
        <EssencePanel essence={mockEssence} donations={mockDonations} canEdit={caps.canEditEssence} />
      </div>
    </main>
  )
}

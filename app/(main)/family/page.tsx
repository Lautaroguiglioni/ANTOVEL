"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"
import type { MemoryExtended } from "@/lib/types"
import { FamilyInjectionPortal } from "@/components/alzheimer/FamilyInjectionPortal"
import { LogoAntovel } from "@/components/brand/LogoAntovel"
import { mockDonations, mockEssence } from "@/lib/alzheimer/mock-alzheimer-data"
import { capabilitiesFor } from "@/lib/alzheimer/permissions"
import { MEMORY_TYPE_COLOR } from "@/lib/brain-logic"

/**
 * /family — coordination portal. Family members donate memories,
 * the primary caregiver approves them. The state lives in this page
 * (in-memory for the MVP); donations would persist server-side in prod.
 */
export default function FamilyPage() {
  const caps = capabilitiesFor("caregiver")
  const [donations, setDonations] = useState<MemoryExtended[]>(mockDonations)

  const handleSubmit = (incoming: Omit<MemoryExtended, "id" | "color">) => {
    const memory: MemoryExtended = {
      ...incoming,
      id: `donor-${Date.now()}`,
      color: MEMORY_TYPE_COLOR[incoming.type],
    }
    setDonations((prev) => [memory, ...prev])
  }

  const handleApprove = (id: string) => {
    setDonations((prev) =>
      prev.map((m) => (m.id === id ? { ...m, injectionStatus: "active" } : m)),
    )
  }

  const pendingCount = donations.filter((m) => m.injectionStatus === "pending").length
  const activeCount = donations.filter((m) => (m.injectionStatus ?? "active") === "active").length

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#1A0F2E] text-white">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 70% 0%, rgba(244,114,182,0.10) 0%, transparent 55%), radial-gradient(ellipse at 0% 80%, rgba(167,139,250,0.08) 0%, transparent 55%)",
        }}
      />

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
            <LogoAntovel size={28} decorative />
            <span className="font-serif text-lg tracking-wider text-white">Familia</span>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-5 pt-8">
        <div className="mb-8 flex items-start gap-4 rounded-3xl border border-white/8 bg-white/[0.03] p-6">
          <span className="flex size-12 items-center justify-center rounded-full" style={{ background: "rgba(244,114,182,0.18)" }}>
            <Users className="size-5 text-[#F472B6]" />
          </span>
          <div>
            <h1 className="font-serif text-2xl text-white md:text-3xl">
              El cerebro de {mockEssence.patientName}
            </h1>
            <p className="mt-1 text-sm text-[#cbd5e1]">
              {activeCount} recuerdos activos · {pendingCount} esperando aprobación
            </p>
          </div>
        </div>

        <FamilyInjectionPortal
          donations={donations}
          canApprove={caps.canApproveDonations}
          onSubmit={handleSubmit}
          onApprove={handleApprove}
        />
      </div>
    </main>
  )
}

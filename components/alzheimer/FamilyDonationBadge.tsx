"use client"

import { Heart } from "lucide-react"

interface Props {
  donorName?: string
  donorRelation?: string
  size?: "sm" | "md"
}

/**
 * Badge surfaced on memory nodes/cards that came from a family donation.
 * Visual language: warm rose, heart icon, soft glow. Used both in the
 * brain HUD overlay and inside the FamilyInjectionPortal review queue.
 */
export function FamilyDonationBadge({ donorName, donorRelation, size = "md" }: Props) {
  const padding = size === "sm" ? "px-2 py-1" : "px-3 py-1.5"
  const iconSize = size === "sm" ? "size-3" : "size-3.5"
  const text = size === "sm" ? "text-[11px]" : "text-xs"

  const label = donorName
    ? donorRelation
      ? `Donado por ${donorName} · ${donorRelation}`
      : `Donado por ${donorName}`
    : "Donación familiar"

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${padding} ${text}`}
      style={{
        borderColor: "rgba(244,114,182,0.35)",
        background: "rgba(244,114,182,0.12)",
        color: "#FBCFE8",
        boxShadow: "0 0 12px rgba(244,114,182,0.18)",
      }}
    >
      <Heart className={iconSize} fill="#F472B6" stroke="none" />
      {label}
    </span>
  )
}

"use client"

import { useEffect, useId, useRef } from "react"
import { Camera, Lock, User } from "lucide-react"
import type { AntovelProfile } from "@/lib/types"
import { calculateAge } from "@/hooks/useOnboarding"
import { CityAutocomplete } from "@/components/onboarding/CityAutocomplete"

type Props = {
  profile: Partial<AntovelProfile>
  onChange: (patch: Partial<AntovelProfile>) => void
}

const PRONOUN_OPTIONS = [
  { id: "el", label: "Él/Ellos" },
  { id: "ella", label: "Ella/Ellas" },
  { id: "elle", label: "Él·ella" },
  { id: "custom", label: "Personalizado" },
] as const

export function StepPersonalData({ profile, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dateId = useId()

  // Read-only age field — recalculated reactively whenever the
  // birthDate picker changes (per spec: explicit useEffect).
  useEffect(() => {
    if (profile.birthDate) {
      const next = calculateAge(profile.birthDate)
      if (profile.age !== next) onChange({ age: next })
    } else if (profile.age !== undefined) {
      onChange({ age: undefined })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.birthDate])

  const age = profile.age

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange({ avatarUrl: reader.result })
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex w-full max-w-md flex-col">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[var(--neural-cyan)]">
        Paso 02 · Datos personales
      </p>
      <h2 className="mb-8 font-display text-3xl font-bold leading-tight text-balance sm:text-4xl">
        Cuéntame sobre ti
      </h2>

      {/* Avatar uploader (optional) */}
      <div className="mb-7 flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Subir foto de perfil"
          className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-[var(--border-strong)] bg-surface transition-all hover:border-[var(--neural-violet)] hover:shadow-[0_0_20px_rgba(124,58,237,0.35)]"
        >
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl || "/placeholder.svg"}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User
                className="h-7 w-7 text-muted-foreground/60"
                strokeWidth={1.5}
              />
            </div>
          )}
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-background/80 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <Camera className="h-3 w-3" />
            Cambiar
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="sr-only"
        />
        <div className="flex flex-col">
          <span className="font-display text-sm font-semibold text-foreground">
            Foto de perfil
          </span>
          <span className="text-xs text-muted-foreground">
            Opcional — circular, con preview
          </span>
        </div>
      </div>

      {/* Name */}
      <FieldLabel>Nombre completo</FieldLabel>
      <input
        type="text"
        autoFocus
        required
        value={profile.name ?? ""}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Antonio Velez"
        className={inputCx + " mb-5"}
      />

      {/* Birthdate + Age (read-only) */}
      <div className="mb-5 flex items-end gap-3">
        <div className="flex-1">
          <label
            htmlFor={dateId}
            className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Fecha de nacimiento
          </label>
          <input
            id={dateId}
            type="date"
            required
            value={profile.birthDate ?? ""}
            onChange={(e) => onChange({ birthDate: e.target.value })}
            className={inputCx + " [color-scheme:dark]"}
          />
        </div>
        <div
          aria-live="polite"
          aria-label="Edad calculada"
          className="flex h-[58px] min-w-[88px] flex-col items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-surface/50 px-4 select-none"
        >
          <span className="font-display text-2xl font-bold leading-none text-foreground">
            {age ?? "—"}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            años
          </span>
        </div>
      </div>

      {/* City — predictive autocomplete */}
      <FieldLabel>Ciudad / País de origen</FieldLabel>
      <div className="mb-6">
        <CityAutocomplete
          value={profile.city ?? ""}
          onChange={(val) => onChange({ city: val })}
        />
      </div>

      {/* Pronouns */}
      <FieldLabel optional>Pronombres</FieldLabel>
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PRONOUN_OPTIONS.map((p) => {
          const active = profile.pronouns === p.label
          return (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                onChange({ pronouns: active ? undefined : p.label })
              }
              className={[
                "rounded-full border px-3 py-2.5 text-xs font-medium transition-all",
                active
                  ? "border-[var(--neural-violet)] bg-[var(--neural-violet)]/15 text-foreground shadow-[0_0_16px_rgba(124,58,237,0.3)]"
                  : "border-[var(--border-strong)] bg-surface/60 text-muted-foreground hover:border-foreground/20 hover:text-foreground",
              ].join(" ")}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      {/* Privacy reassurance */}
      <p className="flex items-center gap-2 text-xs leading-relaxed text-muted-foreground/80">
        <Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.7} />
        Tus datos son privados por defecto. Nunca los compartimos.
      </p>
    </div>
  )
}

const inputCx =
  "w-full rounded-2xl border border-[var(--border-strong)] bg-surface px-5 py-4 font-display text-lg text-foreground outline-none transition-all placeholder:text-muted/60 focus:border-[var(--neural-violet)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.18)]"

function FieldLabel({
  children,
  optional,
}: {
  children: React.ReactNode
  optional?: boolean
}) {
  return (
    <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {children}
      {optional && (
        <span className="ml-2 normal-case text-muted/70">(opcional)</span>
      )}
    </label>
  )
}

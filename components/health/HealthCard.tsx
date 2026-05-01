"use client"

import { Footprints, Moon, Heart, Brain } from "lucide-react"
import { ProgressRing } from "./ProgressRing"
import type { HealthData } from "@/lib/types"

interface HealthCardProps {
  type: "steps" | "sleep" | "heart" | "stress"
  data: HealthData
}

const CARD_CONFIG = {
  steps: { icon: Footprints, color: "#7C3AED", label: "Pasos" },
  sleep: { icon: Moon, color: "#06B6D4", label: "Sueno" },
  heart: { icon: Heart, color: "#EC4899", label: "Frecuencia Cardiaca" },
  stress: { icon: Brain, color: "#22c55e", label: "Estres" },
}

export function HealthCard({ type, data }: HealthCardProps) {
  const config = CARD_CONFIG[type]
  const Icon = config.icon

  return (
    <div
      className="flex min-w-[260px] flex-col gap-3 rounded-2xl border border-white/5 bg-[#12121E]/80 p-5 backdrop-blur-md"
      style={{
        boxShadow: `0 0 24px -8px ${config.color}22`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon size={20} style={{ color: config.color }} />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{config.label}</span>
      </div>

      {/* Content varies by type */}
      {type === "steps" && <StepsContent data={data} color={config.color} />}
      {type === "sleep" && <SleepContent data={data} color={config.color} />}
      {type === "heart" && <HeartContent data={data} color={config.color} />}
      {type === "stress" && <StressContent data={data} color={config.color} />}
    </div>
  )
}

function StepsContent({ data, color }: { data: HealthData; color: string }) {
  const progress = Math.min((data.steps / data.stepsGoal) * 100, 100)
  return (
    <>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-3xl font-semibold text-foreground">
          {data.steps.toLocaleString()}
        </span>
        <span className="text-sm text-muted-foreground">/ {data.stepsGoal.toLocaleString()}</span>
      </div>
      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
      {/* Trend */}
      <div className="flex items-center gap-1 text-xs">
        <span style={{ color: data.stepsTrend >= 0 ? "#22c55e" : "#ef4444" }}>
          {data.stepsTrend >= 0 ? "+" : ""}{data.stepsTrend}%
        </span>
        <span className="text-muted-foreground">vs ayer</span>
      </div>
    </>
  )
}

function SleepContent({ data, color }: { data: HealthData; color: string }) {
  const qualityColors = { optimal: "#22c55e", good: "#facc15", poor: "#ef4444" }
  const qualityLabels = { optimal: "Optimo", good: "Bueno", poor: "Pobre" }
  return (
    <>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-3xl font-semibold text-foreground">
          {data.sleepHours}h {data.sleepMinutes}m
        </span>
      </div>
      <span
        className="inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium"
        style={{
          backgroundColor: `${qualityColors[data.sleepQuality]}20`,
          color: qualityColors[data.sleepQuality],
        }}
      >
        {qualityLabels[data.sleepQuality]}
      </span>
      {/* Mini bar chart */}
      <div className="flex h-8 items-end gap-1">
        {data.sleepHistory.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t transition-all"
            style={{
              height: `${(h / 10) * 100}%`,
              backgroundColor: i === data.sleepHistory.length - 1 ? color : `${color}40`,
            }}
          />
        ))}
      </div>
    </>
  )
}

function HeartContent({ data, color }: { data: HealthData; color: string }) {
  const zoneLabels = { rest: "Reposo", light: "Ligero", moderate: "Moderado", intense: "Intenso" }
  return (
    <>
      <div className="flex items-center gap-3">
        <span className="font-display text-3xl font-semibold text-foreground">
          {data.heartRate}
        </span>
        <span className="text-sm text-muted-foreground">bpm</span>
        {/* Pulse animation */}
        <div className="relative h-4 w-4">
          <div
            className="absolute inset-0 animate-ping rounded-full"
            style={{ backgroundColor: color, opacity: 0.4 }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
      <span className="text-xs text-muted-foreground">
        Zona: {zoneLabels[data.heartRateZone]}
      </span>
      {/* Mini line trend */}
      <svg viewBox="0 0 100 24" className="h-6 w-full">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={data.heartRateHistory
            .map((v, i) => `${(i / 6) * 100},${24 - ((v - 60) / 20) * 24}`)
            .join(" ")}
        />
      </svg>
    </>
  )
}

function StressContent({ data, color }: { data: HealthData; color: string }) {
  const stressColor = data.stressLevel < 40 ? "#22c55e" : data.stressLevel < 70 ? "#facc15" : "#ef4444"
  const stressLabel = data.stressLevel < 40 ? "Bajo" : data.stressLevel < 70 ? "Medio" : "Alto"
  const timeSince = getTimeSince(data.lastStressUpdate)
  return (
    <>
      <div className="flex items-center gap-4">
        <ProgressRing
          progress={data.stressLevel}
          size={64}
          strokeWidth={6}
          color={stressColor}
          bgColor={`${stressColor}20`}
        >
          <span className="font-display text-lg font-semibold" style={{ color: stressColor }}>
            {data.stressLevel}
          </span>
        </ProgressRing>
        <div className="flex flex-col">
          <span className="font-display text-xl font-semibold text-foreground">{stressLabel}</span>
          <span className="text-xs text-muted-foreground">Ultimo: {timeSince}</span>
        </div>
      </div>
    </>
  )
}

function getTimeSince(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return "hace menos de 1h"
  if (hours === 1) return "hace 1h"
  return `hace ${hours}h`
}

import type { HealthData, HealthMetrics, HealthState } from "./types"

/**
 * Calculate a HealthScore from 0 to 100 based on the spec formula:
 * - Steps: (steps / 10000) * 25 (max 25)
 * - Sleep: (sleepHours / 8) * 25 (max 25)
 * - Heart Rate: < 80 bpm → 25, else 10
 * - Stress: < 40 → 25, else 5
 */
export function calculateHealthScore(m: HealthMetrics): number {
  const stepsScore = Math.min((m.steps / m.stepsGoal) * 25, 25)
  const sleepScore = Math.min(((m.sleepHours + m.sleepMinutes / 60) / 8) * 25, 25)
  const heartScore = m.heartRate < 80 ? 25 : 10
  const stressScore = m.stressLevel < 40 ? 25 : 5
  return Math.round(stepsScore + sleepScore + heartScore + stressScore)
}

/**
 * Derive visual state from healthScore:
 * 90–100: Radiant, 70–89: Good, 50–69: Regular, 0–49: Exhausted
 */
export function deriveHealthState(score: number): HealthState {
  if (score >= 90) return "radiant"
  if (score >= 70) return "good"
  if (score >= 50) return "regular"
  return "exhausted"
}

/** Mock initial metrics */
export const mockHealthMetrics: HealthMetrics = {
  steps: 7432,
  stepsGoal: 10000,
  sleepHours: 7,
  sleepMinutes: 20,
  sleepQuality: "optimal",
  heartRate: 68,
  heartRateZone: "rest",
  stressLevel: 24,
  lastStressUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
  sleepHistory: [6.5, 7, 7.5, 6, 8, 7, 7.3],
  heartRateHistory: [72, 70, 68, 74, 66, 68, 68],
}

/** Build full HealthData from metrics */
export function buildHealthData(m: HealthMetrics): HealthData {
  const healthScore = calculateHealthScore(m)
  return {
    ...m,
    healthScore,
    state: deriveHealthState(healthScore),
    stepsTrend: 12, // mock: +12% vs yesterday
  }
}

export const mockHealthData: HealthData = buildHealthData(mockHealthMetrics)

/** State labels and colors for the UI */
export const HEALTH_STATE_CONFIG: Record<
  HealthState,
  { label: string; color: string; bgColor: string }
> = {
  radiant: { label: "Radiante", color: "#facc15", bgColor: "rgba(250,204,21,0.15)" },
  good: { label: "Bien", color: "#22c55e", bgColor: "rgba(34,197,94,0.15)" },
  regular: { label: "Regular", color: "#f97316", bgColor: "rgba(249,115,22,0.15)" },
  exhausted: { label: "Agotado", color: "#ef4444", bgColor: "rgba(239,68,68,0.15)" },
}

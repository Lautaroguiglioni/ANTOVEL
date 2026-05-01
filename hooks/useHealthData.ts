"use client"

import { useCallback, useState } from "react"
import type { HealthData, HealthMetrics } from "@/lib/types"
import { buildHealthData, mockHealthMetrics } from "@/lib/mock-health-data"

const STORAGE_KEY = "antovel_health_data"

function loadHealthMetrics(): HealthMetrics {
  if (typeof window === "undefined") return mockHealthMetrics
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return mockHealthMetrics
    return JSON.parse(raw) as HealthMetrics
  } catch {
    return mockHealthMetrics
  }
}

function saveHealthMetrics(m: HealthMetrics) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(m))
}

export function useHealthData() {
  const [metrics, setMetrics] = useState<HealthMetrics>(() => loadHealthMetrics())
  const [data, setData] = useState<HealthData>(() => buildHealthData(loadHealthMetrics()))

  const updateMetrics = useCallback((patch: Partial<HealthMetrics>) => {
    setMetrics((prev) => {
      const next = { ...prev, ...patch }
      saveHealthMetrics(next)
      const newData = buildHealthData(next)
      setData(newData)
      return next
    })
  }, [])

  const resetToMock = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    setMetrics(mockHealthMetrics)
    setData(buildHealthData(mockHealthMetrics))
  }, [])

  return { metrics, data, updateMetrics, resetToMock }
}

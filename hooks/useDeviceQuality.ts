"use client"

import { useEffect, useState } from "react"

export interface QualityConfig {
  isMobile: boolean
  particleCount: number
  brainSegments: number
  bloomRadius: number
  tokenGeometryDetail: number
  enableChromaticAberration: boolean
  dpr: [number, number]
  antialias: boolean
}

const DESKTOP: QualityConfig = {
  isMobile: false,
  particleCount: 300,
  brainSegments: 128,
  bloomRadius: 0.8,
  tokenGeometryDetail: 1,
  enableChromaticAberration: true,
  dpr: [1, 2],
  antialias: true,
}

const MOBILE: QualityConfig = {
  isMobile: true,
  particleCount: 100,
  brainSegments: 64,
  bloomRadius: 0.5,
  tokenGeometryDetail: 0,
  enableChromaticAberration: false,
  dpr: [1, 1.5],
  antialias: false,
}

/**
 * Detect mobile vs desktop on the client only (avoids SSR mismatch).
 * Default = DESKTOP until the effect runs; the brain canvas is only
 * mounted in the browser so the initial render is harmless.
 */
export function useDeviceQuality(): QualityConfig {
  const [quality, setQuality] = useState<QualityConfig>(DESKTOP)

  useEffect(() => {
    if (typeof navigator === "undefined") return
    const mobile =
      /iPhone|iPad|iPod|Android|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (typeof window !== "undefined" && window.innerWidth < 720)
    setQuality(mobile ? MOBILE : DESKTOP)
  }, [])

  return quality
}

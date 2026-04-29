"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { EffectComposer, DepthOfField } from "@react-three/postprocessing"
import type { DepthOfFieldEffect } from "postprocessing"
import * as THREE from "three"

interface Props {
  focused: boolean
}

/**
 * Aggressive Depth-of-Field that blooms in when a memory is focused.
 * Bokeh scale is animated through a ref so we don't trigger React
 * re-renders every frame — we just mutate the post-processing uniform.
 */
export function CinematicDoF({ focused }: Props) {
  const dofRef = useRef<DepthOfFieldEffect | null>(null)

  useFrame((_, dt) => {
    const dof = dofRef.current
    if (!dof) return
    const target = focused ? 9 : 0
    const t = 1 - Math.exp(-dt * 5) // ~5 units/s damping
    dof.bokehScale = THREE.MathUtils.lerp(dof.bokehScale, target, t)
  })

  return (
    <EffectComposer enableNormalPass={false}>
      <DepthOfField ref={dofRef} focusDistance={0.018} focalLength={0.06} bokehScale={0} />
    </EffectComposer>
  )
}

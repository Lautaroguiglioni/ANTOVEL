"use client"

import { Bloom, ChromaticAberration, EffectComposer, Vignette } from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"
import { Vector2 } from "three"

interface Props {
  bloomRadius?: number // 0.8 desktop · 0.5 mobile
  enableChromaticAberration?: boolean // false on mobile
}

/**
 * Cinematic post-processing chain.
 *
 * - Bloom (mipmapBlur for performance) → makes every emissive surface
 *   bleed light, which is what sells the "bioluminescence".
 * - ChromaticAberration → very subtle RGB shift, holographic feel.
 *   Disabled on mobile (cost vs. perceptual gain trade-off).
 * - Vignette → focuses attention on the brain at the center.
 */
export function PostFX({ bloomRadius = 0.8, enableChromaticAberration = true }: Props) {
  return (
    <EffectComposer>
      <Bloom
        intensity={2.5}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={bloomRadius}
      />
      {enableChromaticAberration && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new Vector2(0.0008, 0.0008)}
          radialModulation={false}
          modulationOffset={0}
        />
      )}
      <Vignette offset={0.4} darkness={0.7} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  )
}

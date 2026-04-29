"use client"

import { useEffect, useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { easing } from "maath"
import * as THREE from "three"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"

interface Props {
  /** World position of the focused token (null = orbit). */
  focusPosition: THREE.Vector3 | null
  /** Ref to OrbitControls so we can disable it during the zoom. */
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>
}

/**
 * Cinematic camera state machine using maath's frame-rate independent
 * exponential damping (`easing.damp3`).
 *
 *   ORBIT       ←→  ZOOMING_IN  →  FOCUSED
 *                                       ↓
 *                   ZOOMING_OUT  ←──────┘
 *
 * - When focusPosition appears, controls are disabled and the camera
 *   eases to a position 1.5 units OUTSIDE the token, looking at origin.
 * - When focusPosition becomes null, the camera eases back to the
 *   pre-zoom position; controls are re-enabled when we're close enough
 *   that the user can take over without a visible pop.
 */
export function CinematicCamera({ focusPosition, controlsRef }: Props) {
  const { camera } = useThree()
  const savedRef = useRef(new THREE.Vector3(0, 0, 7))
  const lookTargetRef = useRef(new THREE.Vector3(0, 0, 0))
  const wasFocusedRef = useRef(false)

  // The destination point for "focused" mode: 1.5 units further along the
  // node's outward radial — frames the node from outside the brain.
  const focusedDest = useMemo(() => {
    if (!focusPosition) return null
    const len = focusPosition.length()
    return focusPosition.clone().normalize().multiplyScalar(len + 1.5)
  }, [focusPosition])

  // When entering focus, snapshot the current camera position so we can return.
  useEffect(() => {
    if (focusPosition && !wasFocusedRef.current) {
      savedRef.current.copy(camera.position)
      if (controlsRef.current) controlsRef.current.enabled = false
      wasFocusedRef.current = true
    }
  }, [focusPosition, camera, controlsRef])

  useFrame((_, delta) => {
    if (focusedDest) {
      // ZOOMING_IN / FOCUSED
      easing.damp3(camera.position, focusedDest as unknown as [number, number, number], 0.4, delta)
      // Always look at world origin during focus → the brain stays centered.
      lookTargetRef.current.lerp(new THREE.Vector3(0, 0, 0), 1 - Math.exp(-delta * 6))
      camera.lookAt(lookTargetRef.current)
      return
    }

    // ZOOMING_OUT / ORBIT
    if (wasFocusedRef.current) {
      easing.damp3(camera.position, savedRef.current as unknown as [number, number, number], 0.3, delta)
      const dist = camera.position.distanceTo(savedRef.current)
      if (dist < 0.05) {
        wasFocusedRef.current = false
        if (controlsRef.current) {
          controlsRef.current.enabled = true
          controlsRef.current.target.set(0, 0, 0)
          controlsRef.current.update()
        }
      } else {
        // Smoothly recenter the look while easing back.
        lookTargetRef.current.lerp(new THREE.Vector3(0, 0, 0), 1 - Math.exp(-delta * 4))
        camera.lookAt(lookTargetRef.current)
      }
    }
  })

  return null
}

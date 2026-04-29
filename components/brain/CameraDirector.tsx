"use client"

import { useEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"

interface Props {
  /** World-space position of the focused node, or null when in map view. */
  focusPosition: THREE.Vector3 | null
  controlsRef: React.RefObject<OrbitControlsImpl | null>
}

/**
 * Smoothly drives the camera between two states:
 *   - Map view (user-controlled via OrbitControls).
 *   - Focus view (zoomed-in close to a memory node).
 *
 * On focus: saves the current camera + target, disables OrbitControls,
 * and lerps both toward the node along its radial direction (so we end
 * up "outside" the brain looking at the node).
 *
 * On unfocus: lerps back to the saved camera/target, then re-enables
 * the controls once close enough.
 */
export function CameraDirector({ focusPosition, controlsRef }: Props) {
  const { camera } = useThree()

  const targetCamPos = useRef(new THREE.Vector3(0, 0, 7))
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0))
  const savedCamPos = useRef(new THREE.Vector3(0, 0, 7))
  const savedLookAt = useRef(new THREE.Vector3(0, 0, 0))
  const isReturning = useRef(false)

  // Recompute targets whenever focus changes.
  useEffect(() => {
    const controls = controlsRef.current
    if (focusPosition) {
      // Save the current free-cam state so we can restore it on close.
      savedCamPos.current.copy(camera.position)
      if (controls) savedLookAt.current.copy(controls.target)

      // Position the camera ~1.5 units OUTWARD along the node's radial
      // direction (so we're looking inward at the node from outside the brain).
      const radial = focusPosition.clone().normalize()
      targetCamPos.current.copy(focusPosition).addScaledVector(radial, 1.5)
      targetLookAt.current.copy(focusPosition)

      if (controls) controls.enabled = false
      isReturning.current = false
    } else {
      targetCamPos.current.copy(savedCamPos.current)
      targetLookAt.current.copy(savedLookAt.current)
      isReturning.current = true
    }
  }, [focusPosition, camera, controlsRef])

  useFrame((_, dt) => {
    const controls = controlsRef.current
    // Frame-rate independent damping (≈ 4 units/s smoothing).
    const t = 1 - Math.exp(-dt * 4)

    camera.position.lerp(targetCamPos.current, t)
    if (controls) {
      controls.target.lerp(targetLookAt.current, t)
      controls.update()

      // Once the return animation has settled, hand control back.
      if (isReturning.current && camera.position.distanceTo(targetCamPos.current) < 0.04) {
        controls.enabled = true
        isReturning.current = false
      }
    }
  })

  return null
}

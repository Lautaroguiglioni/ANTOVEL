"use client"

import { useMemo } from "react"
import { Billboard, Text } from "@react-three/drei"
import type { Memory } from "@/lib/types"
import { getTimePosition } from "@/lib/brain-logic"

interface Props {
  memories: Memory[]
}

/**
 * Floating year labels rendered in 3D space when the brain is in TIME mode.
 * Each label is positioned at the average Y/Z of its year's memory nodes,
 * offset to the left so it reads like a vertical timeline axis.
 * Wrapped in Billboard so they always face the camera.
 */
export function TimeLabels({ memories }: Props) {
  const labels = useMemo(() => {
    const years = [...new Set(memories.map((m) => new Date(m.date).getFullYear()))].sort()
    return years.map((year) => {
      const yearMemories = memories.filter(
        (m) => new Date(m.date).getFullYear() === year,
      )
      const positions = yearMemories.map((m) => getTimePosition(m, memories))
      const avgY = positions.reduce((s, p) => s + p.y, 0) / positions.length
      const avgZ = positions.reduce((s, p) => s + p.z, 0) / positions.length
      return { year, y: avgY, z: avgZ }
    })
  }, [memories])

  return (
    <>
      {labels.map(({ year, y, z }) => (
        <Billboard
          key={year}
          position={[-3.8, y, z]}
          follow
        >
          <Text
            fontSize={0.28}
            color="rgba(167,139,250,0.3)"
            anchorX="right"
            anchorY="middle"
            outlineWidth={0.006}
            outlineColor="rgba(0,0,0,0.4)"
          >
            {year.toString()}
          </Text>
        </Billboard>
      ))}
    </>
  )
}

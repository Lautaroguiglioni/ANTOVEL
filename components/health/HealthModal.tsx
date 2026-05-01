"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { HealthMetrics } from "@/lib/types"

interface HealthModalProps {
  open: boolean
  onClose: () => void
  currentMetrics: HealthMetrics
  onSave: (metrics: Partial<HealthMetrics>) => void
}

export function HealthModal({ open, onClose, currentMetrics, onSave }: HealthModalProps) {
  const [steps, setSteps] = useState(currentMetrics.steps.toString())
  const [sleepH, setSleepH] = useState(currentMetrics.sleepHours.toString())
  const [sleepM, setSleepM] = useState(currentMetrics.sleepMinutes.toString())
  const [heartRate, setHeartRate] = useState(currentMetrics.heartRate.toString())
  const [stress, setStress] = useState(currentMetrics.stressLevel.toString())

  const handleSave = () => {
    onSave({
      steps: parseInt(steps, 10) || 0,
      sleepHours: parseInt(sleepH, 10) || 0,
      sleepMinutes: parseInt(sleepM, 10) || 0,
      heartRate: parseInt(heartRate, 10) || 60,
      stressLevel: Math.min(100, Math.max(0, parseInt(stress, 10) || 0)),
      lastStressUpdate: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#12121E] p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Registrar datos
              </h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4">
              <FieldGroup label="Pasos">
                <input
                  type="number"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#1a1a28] px-3 py-2 text-foreground outline-none transition-shadow focus:ring-2 focus:ring-[var(--neural-violet)]/30"
                />
              </FieldGroup>

              <FieldGroup label="Sueno">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={sleepH}
                      onChange={(e) => setSleepH(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#1a1a28] px-3 py-2 text-foreground outline-none transition-shadow focus:ring-2 focus:ring-[var(--neural-violet)]/30"
                      placeholder="Horas"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={sleepM}
                      onChange={(e) => setSleepM(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#1a1a28] px-3 py-2 text-foreground outline-none transition-shadow focus:ring-2 focus:ring-[var(--neural-violet)]/30"
                      placeholder="Min"
                    />
                  </div>
                </div>
              </FieldGroup>

              <FieldGroup label="Frecuencia Cardiaca (bpm)">
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#1a1a28] px-3 py-2 text-foreground outline-none transition-shadow focus:ring-2 focus:ring-[var(--neural-violet)]/30"
                />
              </FieldGroup>

              <FieldGroup label="Nivel de Estres (0-100)">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={stress}
                  onChange={(e) => setStress(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#1a1a28] px-3 py-2 text-foreground outline-none transition-shadow focus:ring-2 focus:ring-[var(--neural-violet)]/30"
                />
              </FieldGroup>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-[var(--neural-violet)] px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110 glow-violet"
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

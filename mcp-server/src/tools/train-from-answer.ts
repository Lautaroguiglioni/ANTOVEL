/**
 * MCP Tool: train-from-answer
 * Records a patient's response to a daily prompt and updates the
 * training history. The brain learns which memories are well-retained
 * and which need more reinforcement.
 */
import type Database from "better-sqlite3"

export interface TrainFromAnswerParams {
  memoryId: string
  prompt: string
  patientResponse: string
  recalled: boolean
  confidence: number // 0-100
}

export interface TrainFromAnswerResult {
  trainingId: number
  memoryId: string
  totalSessions: number
  recallRate: number // 0-1
  recommendation: string
}

export function trainFromAnswer(
  db: Database.Database,
  params: TrainFromAnswerParams,
): TrainFromAnswerResult {
  const { memoryId, prompt, patientResponse, recalled, confidence } = params

  // Insert the training session
  const result = db
    .prepare(
      `INSERT INTO memory_training (memory_id, prompt, patient_response, recalled, confidence)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(memoryId, prompt, patientResponse, recalled ? 1 : 0, confidence)

  const trainingId = Number(result.lastInsertRowid)

  // Calculate updated stats for this memory
  const stats = db
    .prepare(
      `SELECT
         COUNT(*) as total_sessions,
         SUM(CASE WHEN recalled = 1 THEN 1 ELSE 0 END) as recall_count,
         AVG(confidence) as avg_confidence
       FROM memory_training
       WHERE memory_id = ?`,
    )
    .get(memoryId) as { total_sessions: number; recall_count: number; avg_confidence: number }

  const recallRate = stats.total_sessions > 0
    ? stats.recall_count / stats.total_sessions
    : 0

  // Generate recommendation based on performance
  let recommendation: string
  if (recallRate >= 0.8) {
    recommendation = "Memoria bien consolidada. Reducir frecuencia de entrenamiento."
  } else if (recallRate >= 0.5) {
    recommendation = "Progreso positivo. Mantener frecuencia actual."
  } else if (recallRate >= 0.2) {
    recommendation = "Memoria frágil. Aumentar frecuencia y usar pistas sensoriales."
  } else {
    recommendation = "Memoria muy débil. Considerar inyección de recuerdos familiares como apoyo."
  }

  return {
    trainingId,
    memoryId,
    totalSessions: stats.total_sessions,
    recallRate: Math.round(recallRate * 100) / 100,
    recommendation,
  }
}

/**
 * MCP Tool: train-from-answer
 * Records a patient's response to a daily prompt and updates the
 * training history. The brain learns which memories are well-retained
 * and which need more reinforcement.
 */
import type Database from "better-sqlite3";
export interface TrainFromAnswerParams {
    memoryId: string;
    prompt: string;
    patientResponse: string;
    recalled: boolean;
    confidence: number;
}
export interface TrainFromAnswerResult {
    trainingId: number;
    memoryId: string;
    totalSessions: number;
    recallRate: number;
    recommendation: string;
}
export declare function trainFromAnswer(db: Database.Database, params: TrainFromAnswerParams): TrainFromAnswerResult;
//# sourceMappingURL=train-from-answer.d.ts.map
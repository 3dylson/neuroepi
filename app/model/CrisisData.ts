// Define interfaces for clarity and type safety
export interface CrisisData {
  intensityCounts: Record<string, number>;
  symptomCounts: Record<string, number>;
  crisisTypes: Record<string, number>;
  recoveryCounts: Record<string, number>;
  postStateCounts: Record<string, number>;
  auraSymptomCounts: Record<string, number>;
  tookMedicationCount: number;
  preMenstrualCount: number;
  noMenstrualRelationCount: number;
  poorSleepCount: number;
  alcoholCount: number;
  foodVarietyCount: number;
  emotionalStressCount: number;
  substanceUseCount: number;
  selfHarmCount: number;
  totalDuration: number;
  countedCrises: number;
  avgDuration: string;
  recentChangeOnMedication: number;
  timeOfDayCounts: Record<string, number>;
  contextCounts: Record<string, number>;
  activitiesDuringCrisisCounts: Record<string, number>;
}

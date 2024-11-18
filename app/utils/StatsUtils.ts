import { ChartsUrls } from "../model/ChartUrls";
import { Crisis } from "../model/Crisis/Crisis";
import {
  MenstruationOrPregnancy,
  SleepStatus,
} from "../model/Crisis/FieldsEnums";
import { CrisisData } from "../model/CrisisData";

export function countSymptomsAndAura(crisis: Crisis, counters: any) {
  crisis.symptomsBefore?.forEach((symptom) => {
    counters.symptomCounts[symptom] =
      (counters.symptomCounts[symptom] || 0) + 1;
    counters.auraSymptomCounts[symptom] =
      (counters.auraSymptomCounts[symptom] || 0) + 1;
  });
}

export function countContext(crisis: Crisis, counters: any) {
  if (crisis.whatWasDoing) {
    counters.contextCounts[crisis.whatWasDoing] =
      (counters.contextCounts[crisis.whatWasDoing] || 0) + 1;
  }
}

export function countTimeOfDay(crisis: Crisis, counters: any) {
  const date = crisis.dateTime ? new Date(crisis.dateTime) : null;
  if (!date) return;
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) counters.timeOfDayCounts.morning++;
  else if (hour >= 12 && hour < 18) counters.timeOfDayCounts.afternoon++;
  else if (hour >= 18 && hour < 24) counters.timeOfDayCounts.evening++;
  else counters.timeOfDayCounts.night++;
}

// Helper function to count crisis types, intensities, and recovery times
export function countTypesAndIntensities(crisis: Crisis, counters: any) {
  if (crisis.type)
    counters.crisisTypes[crisis.type] =
      (counters.crisisTypes[crisis.type] || 0) + 1;
  if (crisis.intensity)
    counters.intensityCounts[crisis.intensity] =
      (counters.intensityCounts[crisis.intensity] || 0) + 1;
  if (crisis.recoverySpeed)
    counters.recoveryCounts[crisis.recoverySpeed] =
      (counters.recoveryCounts[crisis.recoverySpeed] || 0) + 1;

  const durationMapping = {
    "< 1 minuto": 0.5,
    "1 a 3 minutos": 2,
    "> 5 minutos": 5,
    "Não sei": 0,
  };
  const mappedDuration =
    durationMapping[crisis.duration as keyof typeof durationMapping];
  if (mappedDuration !== undefined) {
    counters.totalDuration += mappedDuration;
    counters.countedCrises++;
  }
}

// Helper function to count post-state and related factors
export function countPostStateAndFactors(crisis: Crisis, counters: any) {
  crisis.postState?.forEach((state) => {
    counters.postStateCounts[state] =
      (counters.postStateCounts[state] || 0) + 1;
  });

  // TODO change name
  if (crisis.tookMedication == false) counters.tookMedicationCount++;
  if (
    crisis.menstruationOrPregnancy === MenstruationOrPregnancy.Pre3Menstruation
  )
    counters.preMenstrualCount++;
  if (
    !crisis.menstruationOrPregnancy ||
    [MenstruationOrPregnancy.No, MenstruationOrPregnancy.Pregnant].includes(
      crisis.menstruationOrPregnancy as MenstruationOrPregnancy
    )
  )
    counters.noMenstrualRelationCount++;

  if (crisis.sleepStatus === SleepStatus.Bad) counters.poorSleepCount++;
  if (crisis.alcohol) counters.alcoholCount++;
  if (crisis.food && crisis.food !== "Não") counters.foodVarietyCount++;
  if (crisis.emotionalStress !== "Não") counters.emotionalStressCount++;
  if (crisis.substanceUse) counters.substanceUseCount++;
  if (crisis.selfHarm) counters.selfHarmCount++;
  if (crisis.recentChangeOnMedication) counters.recentChangeOnMedication++;
}

// Helper function to calculate average duration
export function calculateAverageDuration(
  totalDuration: number,
  countedCrises: number
): string {
  return countedCrises > 0 ? (totalDuration / countedCrises).toFixed(2) : "N/A";
}

// Helper function to analyze crisis data and calculate counts
export function analyzeCrisisData(crises: Crisis[]): any {
  const counters = initializeCounters();

  crises.forEach((crisis) => {
    countSymptomsAndAura(crisis, counters);
    countTypesAndIntensities(crisis, counters);
    countPostStateAndFactors(crisis, counters);
    countTimeOfDay(crisis, counters);
    countContext(crisis, counters);
  });

  counters.avgDuration = calculateAverageDuration(
    counters.totalDuration,
    counters.countedCrises
  );
  return counters;
}

// Helper function to initialize counters
function initializeCounters(): CrisisData {
  return {
    intensityCounts: {},
    symptomCounts: {},
    crisisTypes: {},
    recoveryCounts: {},
    postStateCounts: {},
    auraSymptomCounts: {},
    tookMedicationCount: 0,
    preMenstrualCount: 0,
    noMenstrualRelationCount: 0,
    poorSleepCount: 0,
    alcoholCount: 0,
    foodVarietyCount: 0,
    emotionalStressCount: 0,
    substanceUseCount: 0,
    selfHarmCount: 0,
    totalDuration: 0,
    countedCrises: 0,
    avgDuration: "N/A",
    recentChangeOnMedication: 0,
    timeOfDayCounts: { morning: 0, afternoon: 0, evening: 0, night: 0 },
    contextCounts: {},
  };
}

// Helper to normalize data to percentages
export function normalizeToPercentages(
  counts: Record<string, number>
): number[] {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return Object.values(counts).map((count) =>
    total > 0 ? Math.round((count / total) * 100) : 0
  );
}

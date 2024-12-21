import { ChartsUrls } from "../model/ChartUrls";
import { Crisis } from "../model/Crisis/Crisis";
import {
  MenstruationOrPregnancy,
  SleepStatus,
} from "../model/Crisis/FieldsEnums";
import { CrisisData } from "../model/CrisisData";

// Consolidated counting function
function countCrisisAttributes(crisis: Crisis, counters: CrisisData) {
  // Count Symptoms and Auras
  crisis.symptomsBefore?.forEach((symptom) => {
    counters.symptomCounts[symptom] =
      (counters.symptomCounts[symptom] || 0) + 1;
    counters.auraSymptomCounts[symptom] =
      (counters.auraSymptomCounts[symptom] || 0) + 1;
  });

  // Count Activities During Crisis
  crisis.duringCrisisSymptoms?.forEach((activity) => {
    counters.activitiesDuringCrisisCounts[activity] =
      (counters.activitiesDuringCrisisCounts[activity] || 0) + 1;
  });

  // Count Context
  if (crisis.whatWasDoing) {
    counters.contextCounts[crisis.whatWasDoing] =
      (counters.contextCounts[crisis.whatWasDoing] || 0) + 1;
  }

  // Count Crisis Types, Intensities, and Recovery Times
  if (crisis.type)
    counters.crisisTypes[crisis.type] =
      (counters.crisisTypes[crisis.type] || 0) + 1;
  if (crisis.intensity)
    counters.intensityCounts[crisis.intensity] =
      (counters.intensityCounts[crisis.intensity] || 0) + 1;
  if (crisis.recoverySpeed)
    counters.recoveryCounts[crisis.recoverySpeed] =
      (counters.recoveryCounts[crisis.recoverySpeed] || 0) + 1;

  // Count Duration
  const durationMapping: Record<string, number> = {
    "< 1 minuto": 0.5,
    "1 a 3 minutos": 2,
    "> 5 minutos": 5,
    "Não sei": 0,
  };
  const duration = durationMapping[crisis.duration || ""] ?? 0;
  if (duration > 0) {
    counters.totalDuration += duration;
    counters.countedCrises++;
  }

  // Count Post-State and Related Factors
  crisis.postState?.forEach((state) => {
    counters.postStateCounts[state] =
      (counters.postStateCounts[state] || 0) + 1;
  });

  if (crisis.tookMedication === false) counters.tookMedicationCount++;
  if (
    crisis.menstruationOrPregnancy === MenstruationOrPregnancy.Pre3Menstruation
  )
    counters.preMenstrualCount++;
  if (
    ![MenstruationOrPregnancy.Pre3Menstruation].includes(
      (crisis.menstruationOrPregnancy as MenstruationOrPregnancy) ||
        MenstruationOrPregnancy.No
    )
  ) {
    counters.noMenstrualRelationCount++;
  }

  if (crisis.sleepStatus === SleepStatus.Bad) counters.poorSleepCount++;
  if (crisis.alcohol) counters.alcoholCount++;
  if (crisis.food && crisis.food !== "Não") counters.foodVarietyCount++;
  if (crisis.emotionalStress !== "Não") counters.emotionalStressCount++;
  if (crisis.substanceUse) counters.substanceUseCount++;
  if (crisis.selfHarm) counters.selfHarmCount++;
  if (crisis.recentChangeOnMedication) counters.recentChangeOnMedication++;
}

// Count Time of Day
function countTimeOfDay(crisis: Crisis, counters: CrisisData) {
  const hour = crisis.dateTime ? new Date(crisis.dateTime).getHours() : null;
  if (hour !== null) {
    if (hour >= 6 && hour < 12) counters.timeOfDayCounts.morning++;
    else if (hour >= 12 && hour < 18) counters.timeOfDayCounts.afternoon++;
    else if (hour >= 18 && hour < 24) counters.timeOfDayCounts.evening++;
    else counters.timeOfDayCounts.night++;
  }
}

// Calculate Average Duration
function calculateAverageDuration(
  totalDuration: number,
  countedCrises: number
): string {
  return countedCrises > 0 ? (totalDuration / countedCrises).toFixed(2) : "N/A";
}

// Analyze Crisis Data
export function analyzeCrisisData(crises: Crisis[]): CrisisData {
  const counters = initializeCounters();

  crises.forEach((crisis) => {
    countCrisisAttributes(crisis, counters);
    countTimeOfDay(crisis, counters);
  });

  counters.avgDuration = calculateAverageDuration(
    counters.totalDuration,
    counters.countedCrises
  );
  return counters;
}

// Initialize Counters
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
    activitiesDuringCrisisCounts: {},
  };
}

// Normalize Data to Percentages
export function normalizeToPercentages(
  counts: Record<string, number>
): number[] {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return Object.values(counts).map((count) =>
    total > 0 ? Math.round((count / total) * 100) : 0
  );
}

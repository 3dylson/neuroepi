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

  if (crisis.tookMedication) counters.tookMedicationCount++;
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
}

// Helper function to calculate average duration
export function calculateAverageDuration(
  totalDuration: number,
  countedCrises: number
): string {
  return countedCrises > 0 ? (totalDuration / countedCrises).toFixed(2) : "N/A";
}

// Helper function to format and ensure percentages add up to 100%
export function formatPercentageDistribution(
  occurrences: Record<string, number>,
  total: number
): string {
  const rawPercentages = Object.entries(occurrences).map(([key, count]) => ({
    key,
    percentage: (count / total) * 100,
  }));

  // Round each percentage to one decimal place and sum them
  let roundedPercentages = rawPercentages.map((item) => ({
    key: item.key,
    percentage: Math.round(item.percentage * 10) / 10,
  }));

  // Calculate the difference to ensure a total of 100%
  const totalRounded = roundedPercentages.reduce(
    (sum, item) => sum + item.percentage,
    0
  );
  const roundingDifference = 100 - totalRounded;

  // Distribute rounding difference to ensure the sum equals 100%
  if (roundingDifference !== 0) {
    const adjustment = roundingDifference / roundedPercentages.length;
    roundedPercentages = roundedPercentages.map((item) => ({
      key: item.key,
      percentage: item.percentage + adjustment,
    }));
  }

  // Format the output as a comma-separated string
  return roundedPercentages
    .map((item) => `${item.percentage.toFixed(1)}%: ${item.key}`)
    .join(", ");
}

// Helper function to calculate related factors
export function calculateRelatedFactors(data: any, crisesLength: number): any {
  const calculateFactorPercentage = (count: number) =>
    ((count / crisesLength) * 100).toFixed(1);

  return {
    tookMedicationPercentage: calculateFactorPercentage(
      data.tookMedicationCount
    ),
    preMenstrualPercentage: calculateFactorPercentage(data.preMenstrualCount),
    noMenstrualRelationPercentage: calculateFactorPercentage(
      data.noMenstrualRelationCount
    ),
    poorSleepPercentage: calculateFactorPercentage(data.poorSleepCount),
    alcoholPercentage: calculateFactorPercentage(data.alcoholCount),
    foodVarietyPercentage: calculateFactorPercentage(data.foodVarietyCount),
    emotionalStressPercentage: calculateFactorPercentage(
      data.emotionalStressCount
    ),
    substanceUsePercentage: calculateFactorPercentage(data.substanceUseCount),
    selfHarmPercentage: calculateFactorPercentage(data.selfHarmCount),
  };
}

// Helper function to generate percentage distributions
export function generatePercentageDistributions(
  data: any,
  crisesLength: number
): any {
  return {
    mostFrequentSymptoms: formatPercentageDistribution(
      data.symptomCounts,
      crisesLength
    ),
    crisisManifestations: formatPercentageDistribution(
      data.crisisTypes,
      crisesLength
    ),
    intensityDistribution: formatPercentageDistribution(
      data.intensityCounts,
      crisesLength
    ),
    recoveryDistribution: formatPercentageDistribution(
      data.recoveryCounts,
      crisesLength
    ),
    postStateDistribution: formatPercentageDistribution(
      data.postStateCounts,
      crisesLength
    ),
    auraSymptomDistribution: formatPercentageDistribution(
      data.auraSymptomCounts,
      crisesLength
    ),
  };
}

// Helper function to analyze crisis data and calculate counts
export function analyzeCrisisData(crises: Crisis[]): any {
  const counters = initializeCounters();

  crises.forEach((crisis) => {
    countSymptomsAndAura(crisis, counters);
    countTypesAndIntensities(crisis, counters);
    countPostStateAndFactors(crisis, counters);
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
  };
}

// Helper to normalize data to percentages
export function normalizeToPercentages(
  counts: Record<string, number>
): number[] {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return Object.values(counts).map((count) =>
    total > 0 ? (count / total) * 100 : 0
  );
}

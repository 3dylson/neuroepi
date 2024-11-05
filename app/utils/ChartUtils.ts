import { ChartsUrls } from "../model/ChartUrls";
import { CrisisData } from "../model/CrisisData";
import { normalizeToPercentages } from "./StatsUtils";

// Main function to generate chart URLs
export function generateCharts(data: CrisisData): ChartsUrls {
  return {
    intensityChartUrl: generateIntensityChartUrl(data.intensityCounts),
    symptomsChartUrl: generateSymptomsChartUrl(data.symptomCounts),
    manifestationChartUrl: generateManifestationChartUrl(data.crisisTypes),
    recoveryChartUrl: generateRecoveryChartUrl(data.recoveryCounts),
    relatedFactorsChartUrl: generateRelatedFactorsChartUrl(data),
  };
}

// Generate chart URLs as percentages
export function generateIntensityChartUrl(
  intensityCounts: Record<string, number>
): string {
  return chartConfigWithColor("pie", intensityCounts, [
    "#ff9999",
    "#66b3ff",
    "#99ff99",
    "#ffcc99",
  ]);
}

export function generateSymptomsChartUrl(
  symptomCounts: Record<string, number>
): string {
  return chartConfigSingleColor("bar", symptomCounts, "#36a2eb");
}

export function generateManifestationChartUrl(
  crisisTypes: Record<string, number>
): string {
  return chartConfigWithColor("doughnut", crisisTypes, [
    "#ff6384",
    "#36a2eb",
    "#cc65fe",
    "#ffce56",
  ]);
}

export function generateRecoveryChartUrl(
  recoveryCounts: Record<string, number>
): string {
  return chartConfigSingleColor("horizontalBar", recoveryCounts, "#ffcc56");
}

export function generateRelatedFactorsChartUrl(data: CrisisData): string {
  const labels = [
    "Medicação",
    "Sono Ruim",
    "Álcool",
    "Estresse",
    "Menstruação",
  ];
  const values = [
    data.tookMedicationCount,
    data.poorSleepCount,
    data.alcoholCount,
    data.emotionalStressCount,
    data.preMenstrualCount,
  ];

  const sanitizedData = labels
    .map((label, index) => ({
      label: label.trim(),
      value: values[index],
    }))
    .filter((item) => item.label && item.value != null && !isNaN(item.value));

  const finalLabels = sanitizedData.map((item) => item.label);
  const finalValues = sanitizedData.map((item) => item.value);

  if (finalLabels.length === 0 || finalValues.length === 0) {
    return "";
  }

  // Convert to percentages
  const percentageValues = normalizeToPercentages(
    Object.fromEntries(finalLabels.map((label, i) => [label, finalValues[i]]))
  );

  return `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify({
      type: "radar",
      data: {
        labels: finalLabels,
        datasets: [
          {
            label: "Fatores Relacionados",
            data: percentageValues,
            backgroundColor: "rgba(34, 202, 236, .2)",
            borderColor: "rgba(34, 202, 236, 1)",
          },
        ],
      },
      options: {},
    })
  )}`;
}

// Updated helper functions
export function chartConfigWithColor(
  type: string,
  counts: Record<string, number>,
  backgroundColors: string[]
): string {
  const labels = Object.keys(counts).filter(
    (label) => label && label.trim() !== ""
  );
  const values = normalizeToPercentages(counts);

  if (labels.length === 0 || values.length === 0) return "";

  const colors = generateColorArray(backgroundColors, labels.length);

  return `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify({
      type,
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
          },
        ],
      },
      options: type === "horizontalBar" ? { indexAxis: "y" } : {},
    })
  )}`;
}

export function chartConfigSingleColor(
  type: string,
  counts: Record<string, number>,
  backgroundColor: string
): string {
  const labels = Object.keys(counts).filter(
    (label) => label && label.trim() !== ""
  );
  const values = normalizeToPercentages(counts);

  if (labels.length === 0 || values.length === 0) return "";

  return `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify({
      type,
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: backgroundColor,
          },
        ],
      },
      options: type === "horizontalBar" ? { indexAxis: "y" } : {},
    })
  )}`;
}

// Color array generator to handle dynamic lengths
export function generateColorArray(
  defaultColors: string[],
  length: number
): string[] {
  if (length <= defaultColors.length) {
    return defaultColors.slice(0, length);
  }
  const colors: string[] = [];
  while (colors.length < length) {
    colors.push(...defaultColors);
  }
  return colors.slice(0, length);
}

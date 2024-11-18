import { ChartsUrls } from "../model/ChartUrls";
import { CrisisData } from "../model/CrisisData";
import { normalizeToPercentages } from "./StatsUtils";

// Main function to generate chart URLs
export function generateCharts(data: CrisisData): ChartsUrls {
  return {
    postStateChartUrl: generatePostStateChartUrl(data.postStateCounts),
    intensityChartUrl: generateIntensityChartUrl(data.intensityCounts),
    symptomsChartUrl: generateSymptomsChartUrl(data.symptomCounts),
    manifestationChartUrl: generateManifestationChartUrl(data.crisisTypes),
    recoveryChartUrl: generateRecoveryChartUrl(data.recoveryCounts),
    relatedFactorsChartUrl: generateRelatedFactorsChartUrl(data),
    timeOfDayChartUrl: generateTimeOfDayChartUrl(data.timeOfDayCounts),
    contextChartUrl: generateContextChartUrl(data.contextCounts),
  };
}

export function generateContextChartUrl(
  contextCounts: Record<string, number>
): string {
  const contextLabels = Object.keys(contextCounts);
  return chartConfigWithColor(
    "doughnut",
    contextCounts,
    generateColorArray(
      ["#FF4500", "#32CD32", "#1E90FF", "#FFD700", "#8A2BE2"],
      contextLabels.length
    ),
    "Distribuição por Contexto Antes da Crise",
    contextLabels
  );
}

export function generateTimeOfDayChartUrl(
  timeOfDayCounts: Record<string, number>
): string {
  return chartConfigSingleColor(
    "bar",
    timeOfDayCounts,
    "#FFA07A",
    "Distribuição por Período do Dia",
    ["Manhã", "Tarde", "Noite", "Madrugada"]
  );
}

export function generatePostStateChartUrl(
  postStateCounts: Record<string, number>
): string {
  return chartConfigWithColor(
    "doughnut",
    postStateCounts,
    generateColorArray(
      ["#ff9999", "#66b3ff", "#99ff99", "#ffcc99"],
      Object.keys(postStateCounts).length
    ),
    "Estado Pós-Crise",
    Object.keys(postStateCounts).map((label) => label.replace(/_/g, " "))
  );
}

// Generate chart URLs as percentages
export function generateIntensityChartUrl(
  intensityCounts: Record<string, number>
): string {
  return chartConfigWithColor(
    "pie",
    intensityCounts,
    ["#ff9999", "#66b3ff", "#99ff99", "#ffcc99"],
    ""
  );
}

export function generateSymptomsChartUrl(
  symptomCounts: Record<string, number>
): string {
  return chartConfigSingleColor("bar", symptomCounts, "#36a2eb", "Sintomas");
}

export function generateManifestationChartUrl(
  crisisTypes: Record<string, number>
): string {
  return chartConfigWithColor(
    "doughnut",
    crisisTypes,
    ["#ff6384", "#36a2eb", "#cc65fe", "#ffce56"],
    ""
  );
}

export function generateRecoveryChartUrl(
  recoveryCounts: Record<string, number>
): string {
  return chartConfigSingleColor(
    "horizontalBar",
    recoveryCounts,
    "#ffcc56",
    "Recuperação"
  );
}

export function generateRelatedFactorsChartUrl(data: CrisisData): string {
  // Define labels and corresponding counts from the data
  const labels = [
    "Medicação não tomada",
    "Sono Ruim",
    "Álcool",
    "Estresse",
    "Menstruação",
    "Mudança recente de medicação",
    "Alteração de alimentos",
    "Ferimentos",
    "Uso de substâncias ilícitas",
  ];
  const values = [
    data.tookMedicationCount,
    data.poorSleepCount,
    data.alcoholCount,
    data.emotionalStressCount,
    data.preMenstrualCount,
    data.recentChangeOnMedication,
    data.foodVarietyCount,
    data.selfHarmCount,
    data.substanceUseCount,
  ];

  // Sanitize and filter out invalid data
  const sanitizedData = labels
    .map((label, index) => ({
      label: label.trim(),
      value: values[index],
    }))
    .filter(
      (item) =>
        item.label && item.value != null && !isNaN(item.value) && item.value > 0
    );

  const finalLabels = sanitizedData.map((item) => item.label);
  const finalValues = sanitizedData.map((item) => item.value);

  if (finalLabels.length === 0 || finalValues.length === 0) return "";

  // Calculate total and convert values to percentages
  const total = finalValues.reduce((acc, value) => acc + value, 0);
  const percentageValues = finalValues.map((value) =>
    Math.round((value / total) * 100)
  );

  // Generate the QuickChart URL
  return `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify({
      type: "radar",
      data: {
        labels: finalLabels,
        datasets: [
          {
            label: "Fatores Relacionados",
            data: percentageValues,
            backgroundColor: "rgba(54, 162, 235, 0.4)", // Lighter background color
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(54, 162, 235, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(54, 162, 235, 1)",
            pointRadius: 5, // Larger points for better visibility
          },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            display: true,
            formatter: (value: number) => `${value}%`,
            color: "#000000", // Black text color for maximum contrast
            anchor: "bottom", // Change anchor to end
            align: "bottom", // Change align to end
            offset: 10, // Adjust offset for better readability
            font: {
              size: 6,
              weight: "bold",
            },
            backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent white background for better visibility
            borderRadius: 4,
            padding: 6,
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            angleLines: {
              color: "rgba(0, 0, 0, 0.1)", // Lighter angle lines
            },
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
            ticks: {
              display: true,
              stepSize: 20,
              showLabelBackdrop: false, // Remove backdrop for ticks
              callback: (value: number) => `${value}%`,
              color: "#666", // Darker tick color for readability
            },
            pointLabels: {
              font: {
                size: 14,
                weight: "bold",
              },
              color: "#333",
            },
          },
        },
        maintainAspectRatio: true,
        responsive: true,
      },
    })
  )}`;
}

export function chartConfigWithColor(
  type: string,
  counts: Record<string, number>,
  backgroundColors: string[],
  label: string,
  labelsList: string[] = []
): string {
  // Extract labels and values
  const labels =
    labelsList.length === 0
      ? Object.keys(counts).filter((label) => label && label.trim() !== "")
      : labelsList;
  const total = Object.values(counts).reduce((acc, val) => acc + val, 0);
  const values = Object.values(counts);

  // If no valid data, return an empty string
  if (labels.length === 0 || values.length === 0 || total === 0) return "";

  // Normalize values to percentages and round them
  const percentages = values.map((value) => Math.round((value / total) * 100));
  const colors = generateColorArray(backgroundColors, labels.length);

  // Generate QuickChart URL with rounded percentages
  return `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify({
      type,
      data: {
        labels,
        datasets: [
          {
            label: label,
            data: percentages,
            backgroundColor: colors,
          },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            display: true,
            formatter: (value: number) => `${Math.round(value)}%`,
            color: "#000000",
            anchor: "center",
            align: "center",
            clip: false,
            font: {
              size: 16,
              weight: "bold",
            },
          },
        },
        ...(type === "horizontalBar" && { indexAxis: "y" }),
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value: number) => `${Math.round(value)}%`, // Show rounded percentage on Y-axis
            },
          },
          x: {
            beginAtZero: true,
            ticks: {
              callback: (value: number) => `${Math.round(value)}%`, // Show rounded percentage on X-axis for horizontal bar
            },
          },
        },
      },
    })
  )}`;
}

export function chartConfigSingleColor(
  type: string,
  counts: Record<string, number>,
  backgroundColor: string,
  label: string,
  labelsList: string[] = []
): string {
  // Determine labels to use
  const labels =
    labelsList.length === 0
      ? Object.keys(counts).filter((label) => label && label.trim() !== "")
      : labelsList;

  // Calculate total and normalize values to percentages
  const total = Object.values(counts).reduce((acc, val) => acc + val, 0);
  const values = Object.values(counts).map((value) =>
    Math.round((value / total) * 100)
  );

  // If no valid data, return an empty string
  if (labels.length === 0 || values.length === 0 || total === 0) return "";

  // Generate QuickChart URL with rounded percentages
  return `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify({
      type,
      data: {
        labels,
        datasets: [
          {
            label: label,
            data: values,
            backgroundColor: backgroundColor,
          },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            display: true,
            formatter: (value: number) => `${value}%`, // Show rounded percentage
            color: "#000000",
            anchor: type === "bar" ? "end" : "center",
            align: type === "bar" ? "bottom" : "center",
            clip: false,
            font: {
              size: 16,
              weight: "bold",
            },
          },
        },
        ...(type === "horizontalBar" && { indexAxis: "y" }),
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value: number) => `${value}%`, // Show rounded percentage on Y-axis
            },
          },
          x:
            type === "horizontalBar"
              ? {
                  beginAtZero: true,
                  ticks: {
                    callback: (value: number) => `${value}%`, // Show rounded percentage on X-axis
                  },
                }
              : {},
        },
        maintainAspectRatio: false,
      },
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

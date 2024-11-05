import * as Print from "expo-print";
import * as IntentLauncher from "expo-intent-launcher";
import { User } from "../model/User";
import { Crisis } from "../model/Crisis/Crisis";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import * as Sharing from "expo-sharing";
import {
  MenstruationOrPregnancy,
  SleepStatus,
} from "../model/Crisis/FieldsEnums";
import { DateUtils } from "./TimeUtils";
import { Medicine } from "../model/Medicine";

// Helper function to format HTML content sections
function formatHTMLSection(title: string, content: string) {
  return `<div class="section"><h2>${title}</h2>${content}</div>`;
}

// Helper to get age from birth date
function calculateAge(birthDate: Date | undefined): string {
  return birthDate
    ? `${new Date().getFullYear() - birthDate.getFullYear()}`
    : "N/A";
}

// Helper to format crisis date range
function formatReportPeriod(crises: Crisis[]): string {
  if (crises.length === 0) return "Período indisponível";

  const start = new Date(
    Math.min(
      ...crises.map((c) =>
        c.dateTime ? new Date(c.dateTime).getTime() : Infinity
      )
    )
  );
  const end = new Date();
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
}

function getAnyOtherDisease(medicines: Medicine[] | null): string[] {
  if (!medicines) {
    return ["N/A"];
  }

  return medicines
    .filter((m) => !m.isForEpilepsy && m.relatedMedication !== undefined)
    .map((m) => m.relatedMedication);
}

/// Helper function to format a summary of crises in HTML format with additional insights and charts
function formatCrisesList(crises: Crisis[] | null): string {
  if (!crises || crises.length === 0) return "<p>Nenhuma crise registrada.</p>";

  const durationMapping = {
    "< 1 minuto": 0.5,
    "1 a 3 minutos": 2,
    "> 5 minutos": 5,
    "Não sei": 0,
  };

  let totalCrises = crises.length;
  let symptomVariety = new Set<string>();
  let mostRecentCrisisDate: Date | null = null;
  let timeOfDayCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  let contextCounts: Record<string, number> = {};

  crises.forEach((crisis) => {
    // Record most recent crisis date
    const crisisDate = crisis.dateTime ? new Date(crisis.dateTime) : null;
    if (
      crisisDate &&
      (!mostRecentCrisisDate || crisisDate > mostRecentCrisisDate)
    ) {
      mostRecentCrisisDate = crisisDate;
    }

    // Track time of day
    if (crisisDate) {
      const hour = crisisDate.getHours();
      if (hour >= 5 && hour < 12) timeOfDayCounts.morning++;
      else if (hour >= 12 && hour < 17) timeOfDayCounts.afternoon++;
      else if (hour >= 17 && hour < 21) timeOfDayCounts.evening++;
      else timeOfDayCounts.night++;
    }

    // Track symptoms and contexts
    crisis.symptomsBefore?.forEach((symptom) => symptomVariety.add(symptom));
    if (crisis.whatWasDoing) {
      contextCounts[crisis.whatWasDoing] =
        (contextCounts[crisis.whatWasDoing] || 0) + 1;
    }
  });

  const daysSinceLastCrisis = mostRecentCrisisDate
    ? Math.floor(
        (new Date().getTime() -
          ((mostRecentCrisisDate as Date)?.getTime() || 0)) /
          (1000 * 60 * 60 * 24)
      )
    : "N/A";

  // Get the most common context
  const mostCommonContext = Object.entries(contextCounts).reduce(
    (max, entry) => (entry[1] > max[1] ? entry : max),
    ["N/A", 0]
  )[0];

  // Create QuickChart URL for a bar chart representing time of day distribution
  const quickChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify({
      type: "bar",
      data: {
        labels: ["Manhã", "Tarde", "Noite", "Madrugada"],
        datasets: [
          {
            label: "Distribuição por Período do Dia",
            data: [
              timeOfDayCounts.morning,
              timeOfDayCounts.afternoon,
              timeOfDayCounts.evening,
              timeOfDayCounts.night,
            ],
            backgroundColor: ["#FFA07A", "#20B2AA", "#778899", "#DAA520"],
          },
        ],
      },
      options: {
        scales: {
          y: { beginAtZero: true },
        },
      },
    })
  )}`;

  // Generate HTML summary with chart
  return `
    <div class="crisis-summary">
      <p><strong>Total de Crises Registradas:</strong> ${totalCrises}</p>
      <p><strong>Dias desde a Última Crise:</strong> ${daysSinceLastCrisis} dias</p>

      <h4>Distribuição por Período do Dia</h4>
      <img src="${quickChartUrl}" alt="Distribuição por Período do Dia" />

      <h4>Outras Informações</h4>
      <p><strong>Variedade de Sintomas:</strong> ${symptomVariety.size} tipos de sintomas relatados</p>
      <p><strong>Atividade Mais Comum Antes da Crise:</strong> ${mostCommonContext}</p>
    </div>
  `;
}

// Function to generate HTML content for PDF
async function generateHTMLContent(crises: Crisis[] | null): Promise<string> {
  const user = await User.getFromLocal();
  if (!user) throw new Error("User data is not available");

  const {
    birthDate,
    emergencyContact,
    emergencyContact2,
    firstName,
    lastName,
    diagnostic,
    medicines,
    allergies,
  } = user;
  const age = calculateAge(birthDate);
  const formattedBirthDate = birthDate
    ? DateUtils.toDayMonthYearString(birthDate)
    : "N/A";
  const reportPeriod = formatReportPeriod(crises || []);
  const medicinesUsed = medicines?.map((m) => m.name).join(", ") || "N/A";
  const allergiesList = allergies?.join(", ") || "N/A";
  const otherDiseases = getAnyOtherDisease(medicines || null);

  // Initialize counters and mappings
  const symptomCounts: Record<string, number> = {};
  const crisisTypes: Record<string, number> = {};
  const intensityCounts: Record<string, number> = {};
  const recoveryCounts: Record<string, number> = {};
  const postStateCounts: Record<string, number> = {};
  const auraSymptomCounts: Record<string, number> = {};

  let totalDuration = 0,
    countedCrises = 0,
    tookMedicationCount = 0;
  let preMenstrualCount = 0,
    noMenstrualRelationCount = 0;
  let poorSleepCount = 0,
    alcoholCount = 0,
    foodVarietyCount = 0;
  let emotionalStressCount = 0,
    substanceUseCount = 0,
    selfHarmCount = 0;

  const durationMapping = {
    "< 1 minuto": 0.5,
    "1 a 3 minutos": 2,
    "> 5 minutos": 5,
    "Não sei": 0,
  };

  crises?.forEach((crisis) => {
    // Count Symptoms and Aura
    crisis.symptomsBefore?.forEach((symptom) => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      auraSymptomCounts[symptom] = (auraSymptomCounts[symptom] || 0) + 1;
    });

    // Count Crisis Types, Intensities, Recovery Speeds
    if (crisis.type)
      crisisTypes[crisis.type] = (crisisTypes[crisis.type] || 0) + 1;
    if (crisis.intensity)
      intensityCounts[crisis.intensity] =
        (intensityCounts[crisis.intensity] || 0) + 1;
    if (crisis.recoverySpeed)
      recoveryCounts[crisis.recoverySpeed] =
        (recoveryCounts[crisis.recoverySpeed] || 0) + 1;

    // Map Duration
    const mappedDuration =
      durationMapping[crisis.duration as keyof typeof durationMapping];
    if (mappedDuration !== undefined) {
      totalDuration += mappedDuration;
      countedCrises++;
    }

    // Post-State Counts
    crisis.postState?.forEach((state) => {
      postStateCounts[state] = (postStateCounts[state] || 0) + 1;
    });

    // Related Factors
    if (crisis.tookMedication) tookMedicationCount++;
    if (
      crisis.menstruationOrPregnancy ===
      MenstruationOrPregnancy.Pre3Menstruation
    )
      preMenstrualCount++;
    if (
      !crisis.menstruationOrPregnancy ||
      [MenstruationOrPregnancy.No, MenstruationOrPregnancy.Pregnant].includes(
        crisis.menstruationOrPregnancy as MenstruationOrPregnancy
      )
    ) {
      noMenstrualRelationCount++;
    }
    if (crisis.sleepStatus === SleepStatus.Bad) poorSleepCount++;
    if (crisis.alcohol) alcoholCount++;
    if (crisis.food && crisis.food !== "Não") foodVarietyCount++;
    if (crisis.emotionalStress !== "Não") emotionalStressCount++;
    if (crisis.substanceUse) substanceUseCount++;
    if (crisis.selfHarm) selfHarmCount++;
  });

  const avgDuration =
    countedCrises > 0 ? (totalDuration / countedCrises).toFixed(2) : "N/A";
  const crisesLength = crises ? crises.length : 0;

  // Generate percentage distributions
  const distributions = {
    mostFrequentSymptoms: formatPercentageDistribution(
      symptomCounts,
      crisesLength
    ),
    crisisManifestations: formatPercentageDistribution(
      crisisTypes,
      crisesLength
    ),
    intensityDistribution: formatPercentageDistribution(
      intensityCounts,
      crisesLength
    ),
    recoveryDistribution: formatPercentageDistribution(
      recoveryCounts,
      crisesLength
    ),
    postStateDistribution: formatPercentageDistribution(
      postStateCounts,
      crisesLength
    ),
    auraSymptomDistribution: formatPercentageDistribution(
      auraSymptomCounts,
      crisesLength
    ),
  };

  // Related Factors Percentages
  const factors = {
    tookMedicationPercentage: (
      (tookMedicationCount / crisesLength) *
      100
    ).toFixed(1),
    preMenstrualPercentage: ((preMenstrualCount / crisesLength) * 100).toFixed(
      1
    ),
    noMenstrualRelationPercentage: (
      (noMenstrualRelationCount / crisesLength) *
      100
    ).toFixed(1),
    poorSleepPercentage: ((poorSleepCount / crisesLength) * 100).toFixed(1),
    alcoholPercentage: ((alcoholCount / crisesLength) * 100).toFixed(1),
    foodVarietyPercentage: ((foodVarietyCount / crisesLength) * 100).toFixed(1),
    emotionalStressPercentage: (
      (emotionalStressCount / crisesLength) *
      100
    ).toFixed(1),
    substanceUsePercentage: ((substanceUseCount / crisesLength) * 100).toFixed(
      1
    ),
    selfHarmPercentage: ((selfHarmCount / crisesLength) * 100).toFixed(1),
  };

  // QuickChart URLs for each chart
  const intensityChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify({
      type: "pie",
      data: {
        labels: Object.keys(intensityCounts),
        datasets: [
          {
            data: Object.values(intensityCounts),
            backgroundColor: ["#ff9999", "#66b3ff", "#99ff99", "#ffcc99"],
          },
        ],
      },
    })
  )}`;

  const symptomsChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify({
      type: "bar",
      data: {
        labels: Object.keys(symptomCounts),
        datasets: [
          { data: Object.values(symptomCounts), backgroundColor: "#36a2eb" },
        ],
      },
      options: { indexAxis: "y" },
    })
  )}`;

  const manifestationChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify({
      type: "doughnut",
      data: {
        labels: Object.keys(crisisTypes),
        datasets: [
          {
            data: Object.values(crisisTypes),
            backgroundColor: ["#ff6384", "#36a2eb", "#cc65fe", "#ffce56"],
          },
        ],
      },
    })
  )}`;

  const recoveryChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify({
      type: "horizontalBar",
      data: {
        labels: Object.keys(recoveryCounts) as string[],
        datasets: [
          { data: Object.values(recoveryCounts), backgroundColor: "#ffcc56" },
        ],
      },
    })
  )}`;

  const relatedFactorsChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify({
      type: "radar",
      data: {
        labels: ["Medicação", "Sono Ruim", "Álcool", "Estresse", "Menstruação"],
        datasets: [
          {
            label: "Fatores Relacionados",
            data: [
              factors.tookMedicationPercentage,
              factors.poorSleepPercentage,
              factors.alcoholPercentage,
              factors.emotionalStressPercentage,
              factors.preMenstrualPercentage,
            ],
            backgroundColor: "rgba(34, 202, 236, .2)",
            borderColor: "rgba(34, 202, 236, 1)",
          },
        ],
      },
    })
  )}`;

  // HTML Template with embedded charts
  return `
  <html>
    <head><style>${cssStyles()}</style></head>
    <body>
      <div class="header">
        <h1>Relatório Médico</h1>
        <p><strong>Período do Relatório:</strong> ${reportPeriod}</p>
      </div>
      ${formatHTMLSection(
        "Informações do Paciente",
        `
        <p><strong>Nome:</strong> ${firstName} ${lastName}</p>
        <p><strong>Data de nascimento:</strong> ${formattedBirthDate}</p>
        <p><strong>Contato de emergência 1:</strong> ${
          emergencyContact || "N/A"
        }</p>
        <p><strong>Contato de emergência 2:</strong> ${
          emergencyContact2 || "N/A"
        }</p>
        <p><strong>Tipo de crise ou síndrome epiléptica:</strong> ${
          diagnostic || "N/A"
        }</p>
        <p><strong>Em uso de:</strong> ${medicinesUsed}</p>
        <p><strong>NÃO USAR:</strong> ${allergiesList}</p>
        <p><strong>Alguma outra doença?:</strong> ${otherDiseases.join(
          ", "
        )}</p>
      `
      )}

      ${formatHTMLSection(
        "Informações das Crises",
        `<ul>${formatCrisesList(crises)}</ul>`
      )}

      ${formatHTMLSection(
        "Resumo das Crises",
        `
        <p><strong>Duração Média das Crises:</strong> ${avgDuration} minutos</p>

        <h4>Distribuição da Intensidade das Crises</h4>
        <img src="${intensityChartUrl}" alt="Distribuição da Intensidade das Crises" />

        <h4>Sintomas Mais Frequentes</h4>
        <img src="${symptomsChartUrl}" alt="Sintomas Mais Frequentes" />

        <h4>Tipos de Crises</h4>
        <img src="${manifestationChartUrl}" alt="Tipos de Crises" />

        <h4>Tempo de Recuperação</h4>
        <img src="${recoveryChartUrl}" alt="Tempo de Recuperação" />

        <h4>Fatores Relacionados às Crises</h4>
        <img src="${relatedFactorsChartUrl}" alt="Fatores Relacionados às Crises" />
      `
      )}
    </body>
  </html>
`;
}

// Helper function to format and ensure percentages add up to 100%
function formatPercentageDistribution(
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

function cssStyles(): string {
  return `
    body { font-family: Arial, sans-serif; color: #333; }
    h1, h2 { color: #333; text-align: center; }
    p, li { font-size: 14px; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 20px; }
    .section { margin: 20px 0; }
    .crisis-entry {
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 15px;
      background-color: #f9f9f9;
    }
    .crisis-entry p { margin: 5px 0; }
    .crisis-entry h3 {
      color: #555;
      margin-top: 10px;
      font-size: 15px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 3px;
    }
  `;
}

// Helper to generate and get URI of a PDF
export async function generatePDF(
  startDate: Date,
  endDate: Date
): Promise<string> {
  const crisis = await Crisis.getCrises();
  // get crises between the selected dates
  const crises = crisis?.filter(
    (c) =>
      c.dateTime &&
      new Date(c.dateTime) >= startDate &&
      new Date(c.dateTime) <= endDate
  );
  const htmlContent = await generateHTMLContent(crises || null);
  const { uri } = await Print.printToFileAsync({ html: htmlContent });
  return uri;
}

export async function sharePDF(uri: string) {
  try {
    const isSharingAvailable = await Sharing.isAvailableAsync();
    console.log("Is sharing available:", isSharingAvailable);

    if (isSharingAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share your PDF",
        UTI: "com.adobe.pdf",
      });
      console.log("PDF shared successfully.");
    } else {
      console.log("Sharing is not available on this device.");
    }
  } catch (error) {
    console.error("Error sharing PDF:", error);
  }
}

// Generate and share PDF
export async function generateAndSharePDF(startDate: Date, endDate: Date) {
  try {
    console.log("Starting PDF generation...");
    const uri = await generatePDF(startDate, endDate);
    console.log("PDF generated at URI:", uri);

    const isSharingAvailable = await Sharing.isAvailableAsync();
    console.log("Is sharing available:", isSharingAvailable);

    if (isSharingAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share your PDF",
        UTI: "com.adobe.pdf",
      });
      console.log("PDF shared successfully.");
    } else {
      console.log("Sharing is not available on this device.");
    }
  } catch (error) {
    console.error("Error generating or sharing PDF:", error);
  }
}

// Generate and open PDF
export async function generateAndOpenPDF(startDate: Date, endDate: Date) {
  try {
    const uri = await generatePDF(startDate, endDate);
    if (Platform.OS === "android") {
      const contentUri = await FileSystem.getContentUriAsync(uri);
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: contentUri,
        flags: 1,
        type: "application/pdf",
      });
    } else if (Platform.OS === "ios") {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Open your PDF",
          UTI: "com.adobe.pdf",
        });
      } else {
        console.log("Sharing is not available on this device.");
      }
    }
  } catch (error) {
    console.error("Error generating or opening PDF:", error);
  }
}

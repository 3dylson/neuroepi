import * as Print from "expo-print";
import * as IntentLauncher from "expo-intent-launcher";
import { User } from "../model/User";
import { Crisis } from "../model/Crisis/Crisis";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import * as Sharing from "expo-sharing";
import { DateUtils } from "./TimeUtils";
import { Medicine } from "../model/Medicine";
import { generateCharts } from "./ChartUtils";
import {
  analyzeCrisisData,
  calculateRelatedFactors,
  generatePercentageDistributions,
} from "./StatsUtils";

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

// Function to generate HTML content for PDF with optimized structure
async function generateHTMLContent(crises: Crisis[] | null): Promise<string> {
  const user = await User.getFromLocal();
  if (!user) throw new Error("User data is not available");

  const userData = getUserData(user);
  const crisisData = analyzeCrisisData(crises || []);
  const distributions = generatePercentageDistributions(
    crisisData,
    crises?.length || 0
  );
  const factors = calculateRelatedFactors(crisisData, crises?.length || 0);
  const charts = generateCharts(crisisData);

  return `
  <html>
    <head><style>${cssStyles()}</style></head>
    <body>
      <div class="header">
        <h1>Relatório Médico</h1>
        <p><strong>Período do Relatório:</strong> ${formatReportPeriod(
          crises || []
        )}</p>
      </div>
      ${formatHTMLSection("Informações do Paciente", userData)}
      ${formatHTMLSection(
        "Informações das Crises",
        `<ul>${formatCrisesList(crises)}</ul>`
      )}
      ${formatHTMLSection(
        "Resumo das Crises",
        generateSummarySection(
          distributions,
          factors,
          crisisData.avgDuration,
          charts
        )
      )}
    </body>
  </html>
  `;
}

// Helper function to structure user data
function getUserData(user: User): string {
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
  const formattedBirthDate = birthDate
    ? DateUtils.toDayMonthYearString(birthDate)
    : "N/A";
  const medicinesUsed = medicines?.map((m) => m.name).join(", ") || "N/A";
  const allergiesList = allergies?.join(", ") || "N/A";
  const otherDiseases = getAnyOtherDisease(medicines || null).join(", ");

  return `
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
    <p><strong>Alguma outra doença?:</strong> ${otherDiseases}</p>
  `;
}

// Helper function to structure the summary section
function generateSummarySection(
  distributions: any,
  factors: any,
  avgDuration: string,
  charts: any
): string {
  return `
    <p><strong>Duração Média das Crises:</strong> ${avgDuration} minutos</p>

    <h4>Distribuição da Intensidade das Crises</h4>
    <img src="${charts.intensityChartUrl}" alt="Distribuição da Intensidade das Crises" />

    <h4>Sintomas Mais Frequentes</h4>
    <img src="${charts.symptomsChartUrl}" alt="Sintomas Mais Frequentes" />

    <h4>Tipos de Crises</h4>
    <img src="${charts.manifestationChartUrl}" alt="Tipos de Crises" />

    <h4>Tempo de Recuperação</h4>
    <img src="${charts.recoveryChartUrl}" alt="Tempo de Recuperação" />

    <h4>Fatores Relacionados às Crises</h4>
    <img src="${charts.relatedFactorsChartUrl}" alt="Fatores Relacionados às Crises" />
  `;
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

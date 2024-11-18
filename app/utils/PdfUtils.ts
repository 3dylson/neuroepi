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
import { analyzeCrisisData } from "./StatsUtils";
import { formatReportPeriod } from "./Utils";
import { ChartInfo } from "../model/ChartInfo";

// Helper function to format HTML content sections
function formatHTMLSection(title: string, content: string) {
  return `<div class="section"><h2>${title}</h2>${content}</div>`;
}

function getAnyOtherDisease(medicines: Medicine[] | null): string[] {
  if (!medicines) {
    return ["N/A"];
  }

  return medicines
    .filter((m) => !m.isForEpilepsy && m.relatedMedication !== undefined)
    .map((m) => m.relatedMedication);
}

// Helper function to format a summary of crises in HTML format with additional insights and charts
function formatCrisesList(
  crises: Crisis[] | null,
  avgDuration: string
): string {
  if (!crises || crises.length === 0) return "<p>Nenhuma crise registrada.</p>";

  const totalCrises = crises.length;

  // Get the most recent crisis date
  const mostRecentCrisisDate = crises
    .map((crisis) => (crisis.dateTime ? new Date(crisis.dateTime) : null))
    .filter((date) => date !== null) as Date[];

  const latestCrisisDate =
    mostRecentCrisisDate.length > 0
      ? new Date(
          Math.max(...mostRecentCrisisDate.map((date) => date!.getTime()))
        )
      : null;

  const daysSinceLastCrisis = latestCrisisDate
    ? Math.floor(
        (Date.now() - latestCrisisDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    : "N/A";

  const chartPeriod = formatReportPeriod(crises);

  // Generate HTML summary with charts
  return `
    <div class="crisis-summary">
      <p><strong>Total de Crises Registradas no período de ${chartPeriod}:</strong> ${totalCrises}</p>
      <p><strong>Duração Média das Crises:</strong> ${avgDuration} minutos</p>
      <p><strong>Dias desde a Última Crise:</strong> ${daysSinceLastCrisis} dias</p>
    </div>
  `;
}

async function generateHTMLContent(crises: Crisis[] | null): Promise<string> {
  // Fetch user data and analyze crisis data in parallel for efficiency
  const [user, crisisData] = await Promise.all([
    User.getFromLocal(),
    analyzeCrisisData(crises || []),
  ]);

  if (!user) throw new Error("User data is not available");

  const userData = getUserData(user);
  const charts = generateCharts(crisisData);
  const chartPeriod = formatReportPeriod(crises || []);

  // Generate individual sections
  const patientInfo = formatHTMLSection("Informações do Paciente", userData);
  const crisisInfo = formatHTMLSection(
    "Informações das Crises",
    formatCrisesList(crises, crisisData.avgDuration)
  );
  const chartsSummary = formatHTMLSection("", generateSummarySection(charts));

  // Return the final HTML content
  return `
    <html>
      <head><style>${cssStyles()}</style></head>
      <body>
        <div class="header">
          <h1>Relatório Médico</h1>
          <p><strong>Período do Relatório:</strong> ${chartPeriod}</p>
        </div>
        ${patientInfo}
        ${crisisInfo}
        ${chartsSummary}
      </body>
    </html>
  `;
}

// Utility function to handle "N/A" fallback
function formatValue(value?: string | null): string {
  return value ? value : "N/A";
}

// Helper function to structure user data
function getUserData(user: User): string {
  const formattedBirthDate = user.birthDate
    ? DateUtils.toDayMonthYearString(user.birthDate)
    : "N/A";

  const medicinesUsed = user.medicines?.map((m) => m.name).join(", ") || "N/A";
  const allergiesList = user.allergies?.join(", ") || "N/A";
  const otherDiseases =
    getAnyOtherDisease(user.medicines || []).join(", ") || "N/A";

  const fields = [
    { label: "Nome", value: `${user.firstName} ${user.lastName}` },
    { label: "Data de nascimento", value: formattedBirthDate },
    { label: "Contato de telefone", value: formatValue(user.phoneNumber) },
    {
      label: "Contato de emergência 1",
      value: formatValue(user.emergencyContact),
    },
    {
      label: "Contato de emergência 2",
      value: formatValue(user.emergencyContact2),
    },
    { label: "Diagnóstico", value: formatValue(user.diagnostic) },
    { label: "Em uso de", value: medicinesUsed },
    { label: "Alergias", value: allergiesList },
    { label: "Alguma outra doença?", value: otherDiseases },
  ];

  return fields
    .map(({ label, value }) => `<p><strong>${label}:</strong> ${value}</p>`)
    .join("\n");
}

function generateSummarySection(charts: any): string {
  const chartData: ChartInfo[] = [
    {
      title: "Tipos de Crises",
      url: charts.manifestationChartUrl,
      altText: "Tipos de Crises",
    },
    {
      title: "Distribuição da Intensidade das Crises",
      url: charts.intensityChartUrl,
      altText: "Distribuição da Intensidade das Crises",
    },
    {
      title: "Distribuição por Período do Dia",
      url: charts.timeOfDayChartUrl,
      altText: "Distribuição por Período do Dia",
    },
    {
      title: "Fatores Relacionados às Crises",
      url: charts.relatedFactorsChartUrl,
      altText: "Fatores Relacionados às Crises",
    },
    {
      title: "Sintomas Antes da Crise (Auras)",
      url: charts.symptomsChartUrl,
      altText: "Sintomas Mais Frequentes",
    },
    {
      title: "Tempo de Recuperação",
      url: charts.recoveryChartUrl,
      altText: "Tempo de Recuperação",
    },
    {
      title: "Atividades que Precederam à Crise",
      url: charts.contextChartUrl,
      altText: "Contexto Antes da Crise",
    },
    {
      title: "Distribuição do Estado Pós Crises",
      url: charts.postStateChartUrl,
      altText: "Distribuição do Estado Pós Crises",
    },
  ];

  return `
    <div class="charts-container">
      ${chartData
        .map(
          (chart) => `
          <div class="chart-item">
            <h4>${chart.title}</h4>
            <img src="${chart.url}" alt="${chart.altText}" />
          </div>`
        )
        .join("")}
    </div>
  `;
}

function cssStyles(): string {
  return `
    body { font-family: Arial, sans-serif; color: #333; }
    h1, h2 { color: #333; text-align: center; }
    p, li { font-size: 14px; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 20px; }
    .section { margin: 20px 0; }
    .charts-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
      margin: 20px 0;
    }
    .chart-item {
      flex: 1 1 45%;
      max-width: 45%;
      text-align: center;
      margin-bottom: 20px;
    }
    .chart-item img {
      width: 100%;
      height: auto;
      max-width: 400px;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 10px;
      background-color: #f9f9f9;
    }
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

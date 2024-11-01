import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import * as IntentLauncher from "expo-intent-launcher";
import * as WebBrowser from "expo-web-browser";
import { User } from "../model/User";
import { Crisis } from "../model/Crisis/Crisis";
import { isAndroid, isIOS } from "./Utils";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import {
  MenstruationOrPregnancy,
  SleepStatus,
} from "../model/Crisis/FieldsEnums";

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

// Helper function to format each crisis detail in HTML format
function formatCrisesList(crises: Crisis[] | null): string {
  if (!crises || crises.length === 0) return "<p>Nenhuma crise registrada.</p>";

  return crises
    .map(
      (crisis) => `
      <div class="crisis-entry">
        <p><strong>Data e Hora:</strong> ${
          crisis.dateTime ? new Date(crisis.dateTime).toLocaleString() : "N/A"
        }</p>
        <p><strong>Duração da Crise:</strong> ${crisis.duration || "N/A"}</p>
        <p><strong>Tipo de Crise:</strong> ${crisis.type || "N/A"}</p>
        <p><strong>Intensidade da Crise:</strong> ${
          crisis.intensity || "N/A"
        }</p>
        <p><strong>Recuperação da Crise:</strong> ${
          crisis.recoverySpeed || "N/A"
        }</p>

        <h3>Sintomas</h3>
        <p><strong>Sintomas Antes da Crise:</strong> ${
          crisis.symptomsBefore?.join(", ") || "Nenhum"
        }</p>
        <p><strong>Estado após a Crise:</strong> ${
          crisis.postState?.join(", ") || "N/A"
        }</p>

        <h3>Informações Contextuais</h3>
        <p><strong>Tomou Medicamento:</strong> ${
          crisis.tookMedication ? "Sim" : "Não"
        }</p>
        <p><strong>O que fazia antes da crise:</strong> ${
          crisis.whatWasDoing || "N/A"
        }</p>
        <p><strong>Menstruação ou Gravidez:</strong> ${
          crisis.menstruationOrPregnancy || "N/A"
        }</p>
        <p><strong>Mudança recente de medicamentos:</strong> ${
          crisis.recentChangeOnMedication ? "Sim" : "Não"
        }</p>
        <p><strong>Como foi a noite de sono:</strong> ${
          crisis.sleepStatus || "N/A"
        }</p>
        
        <h3>Fatores Associados</h3>
        <p><strong>Ingeriu bebida alcoólica:</strong> ${
          crisis.alcohol ? "Sim" : "Não"
        }</p>
        <p><strong>Alimento diferente:</strong> ${crisis.food || "N/A"}</p>
        <p><strong>Estresse emocional:</strong> ${
          crisis.emotionalStress || "N/A"
        }</p>
        <p><strong>Uso de substâncias ilícitas:</strong> ${
          crisis.substanceUse ? "Sim" : "Não"
        }</p>
        <p><strong>Autolesão:</strong> ${crisis.selfHarm ? "Sim" : "Não"}</p>
      </div>
    `
    )
    .join("");
}

// Function to generate HTML content for PDF
async function generateHTMLContent(crises: Crisis[] | null): Promise<string> {
  const user = await User.getFromLocal();

  const age = calculateAge(user?.birthDate);
  const reportPeriod = formatReportPeriod(crises || []);
  const symptomCounts: Record<string, number> = {};
  const crisisTypes: Record<string, number> = {};
  const intensityCounts: Record<string, number> = {};
  const recoveryCounts: Record<string, number> = {};
  const postStateCounts: Record<string, number> = {};
  const auraSymptomCounts: Record<string, number> = {};

  let totalDuration = 0;
  let countedCrises = 0;
  let tookMedicationCount = 0;
  let preMenstrualCount = 0;
  let noMenstrualRelationCount = 0;
  let poorSleepCount = 0;
  let alcoholCount = 0;
  let foodVarietyCount = 0;
  let emotionalStressCount = 0;
  let substanceUseCount = 0;
  let selfHarmCount = 0;

  const durationMapping = {
    "< 1 minuto": 0.5, // cspell:ignore minuto
    "1 a 3 minutos": 2, // cspell:ignore minutos
    "> 5 minutos": 5, // cspell:ignore minutos
    "Não sei": 0, // cspell:ignore Não
  };

  crises?.forEach((crisis) => {
    crisis.symptomsBefore?.forEach((symptom) => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });

    if (crisis.type)
      crisisTypes[crisis.type] = (crisisTypes[crisis.type] || 0) + 1;
    if (crisis.intensity)
      intensityCounts[crisis.intensity] =
        (intensityCounts[crisis.intensity] || 0) + 1;

    const mappedDuration =
      durationMapping[crisis.duration as keyof typeof durationMapping];
    if (mappedDuration !== undefined) {
      totalDuration += mappedDuration;
      countedCrises++;
    }

    if (crisis.recoverySpeed) {
      recoveryCounts[crisis.recoverySpeed] =
        (recoveryCounts[crisis.recoverySpeed] || 0) + 1;
    }

    crisis.postState?.forEach((state) => {
      postStateCounts[state] = (postStateCounts[state] || 0) + 1;
    });

    crisis.symptomsBefore?.forEach((aura) => {
      auraSymptomCounts[aura] = (auraSymptomCounts[aura] || 0) + 1;
    });

    if (crisis.tookMedication === true) tookMedicationCount++;
    if (
      crisis.menstruationOrPregnancy ===
      MenstruationOrPregnancy.Pre3Menstruation
    )
      preMenstrualCount++;
    if (
      !crisis.menstruationOrPregnancy ||
      crisis.menstruationOrPregnancy === MenstruationOrPregnancy.No ||
      crisis.menstruationOrPregnancy === MenstruationOrPregnancy.Pregnant
    )
      noMenstrualRelationCount++;
    if (crisis.sleepStatus === SleepStatus.Bad) poorSleepCount++;
    if (crisis.alcohol) alcoholCount++;
    if (crisis.food && crisis.food !== "Não") foodVarietyCount++;
    if (crisis.emotionalStress) emotionalStressCount++;
    if (crisis.substanceUse) substanceUseCount++;
    if (crisis.selfHarm) selfHarmCount++;
  });

  const avgDuration =
    countedCrises > 0 ? (totalDuration / countedCrises).toFixed(2) : "N/A";
  const crisesLength = crises ? crises.length : 0;
  const mostFrequentSymptoms = formatPercentageDistribution(
    symptomCounts,
    crisesLength
  );
  const crisisManifestations = formatPercentageDistribution(
    crisisTypes,
    crisesLength
  );
  const intensityDistribution = formatPercentageDistribution(
    intensityCounts,
    crisesLength
  );
  const recoveryDistribution = formatPercentageDistribution(
    recoveryCounts,
    crisesLength
  );
  const postStateDistribution = formatPercentageDistribution(
    postStateCounts,
    crisesLength
  );
  const auraSymptomDistribution = formatPercentageDistribution(
    auraSymptomCounts,
    crisesLength
  );

  const tookMedicationPercentage = (
    (tookMedicationCount / crisesLength) *
    100
  ).toFixed(1);
  const preMenstrualPercentage = (
    (preMenstrualCount / crisesLength) *
    100
  ).toFixed(1);

  const noMenstrualRelationPercentage = (
    (noMenstrualRelationCount / crisesLength) *
    100
  ).toFixed(1);
  const poorSleepPercentage = ((poorSleepCount / crisesLength) * 100).toFixed(
    1
  );
  const alcoholPercentage = ((alcoholCount / crisesLength) * 100).toFixed(1);
  const foodVarietyPercentage = (
    (foodVarietyCount / crisesLength) *
    100
  ).toFixed(1);
  const emotionalStressPercentage = (
    (emotionalStressCount / crisesLength) *
    100
  ).toFixed(1);
  const substanceUsePercentage = (
    (substanceUseCount / crisesLength) *
    100
  ).toFixed(1);
  const selfHarmPercentage = ((selfHarmCount / crisesLength) * 100).toFixed(1);

  // HTML Template
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
        <p><strong>Nome:</strong> ${user?.firstName || ""} ${
          user?.lastName || ""
        }</p>
        <p><strong>Idade:</strong> ${age}</p>
        <p><strong>Gênero:</strong> ${user?.gender || "N/A"}</p>
        <p><strong>Diagnóstico:</strong> ${user?.diagnostic || "N/A"}</p>
      `
      )}

      ${formatHTMLSection(
        "Informações das Crises",
        `
        <ul>${formatCrisesList(crises)}</ul>
      `
      )}

      ${formatHTMLSection(
        "Resumo das Crises",
        `
        <p><strong>Duração Média das Crises:</strong> ${avgDuration} minutos</p>
        <p><strong>Manifestação das Crises:</strong> ${
          crisisManifestations || "N/A"
        }</p>
        <p><strong>Distribuição da Intensidade das Crises:</strong> ${
          intensityDistribution || "N/A"
        }</p>
        <p><strong>Tempo de Recuperação:</strong> ${
          recoveryDistribution || "N/A"
        }</p>
        <p><strong>Estado Pós-Crise:</strong> ${
          postStateDistribution || "N/A"
        }</p>
        <p><strong>Sintomas de Aura Mais Frequentes:</strong> ${
          auraSymptomDistribution || "Nenhum"
        }</p>
        
        <h3>Fatores Relacionados</h3>
        <p><strong>Relação com a Tomada de Medicamentos:</strong> ${tookMedicationPercentage}% das crises ocorreram sem medicação de controle nas 24-48 horas anteriores.</p>
        <p><strong>Relação com Menstruação:</strong> ${preMenstrualPercentage}% das crises ocorreram até três dias antes do ciclo menstrual, e ${noMenstrualRelationPercentage}% não têm relação com o ciclo menstrual.</p>

        <h3>Fatores Associados às Crises</h3>
        <p><strong>Alimentos Diferentes:</strong> ${
          foodVarietyCount > 0
            ? `${foodVarietyPercentage}% das crises associadas a alimentos variados.`
            : `Sem relatos de alimentos diferentes antes da crise.`
        }</p>
        <p><strong>Noite de Sono:</strong> ${poorSleepPercentage}% das crises associadas a sono ruim.</p>
        <p><strong>Consumo de Álcool:</strong> ${alcoholPercentage}% das crises associadas ao consumo de álcool.</p>
        <p><strong>Estresse Emocional:</strong> ${emotionalStressPercentage}% das crises associadas a estresse ou preocupação.</p>
        <p><strong>Uso de Substâncias Ilícitas:</strong> ${substanceUsePercentage}% das crises associadas ao uso de substâncias ilícitas.</p>
        <p><strong>Autolesão:</strong> ${selfHarmPercentage}% das crises relatam autolesão.</p>
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
async function generatePDF(startDate: Date, endDate: Date): Promise<string> {
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

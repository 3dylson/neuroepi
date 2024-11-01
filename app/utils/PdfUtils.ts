import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import * as IntentLauncher from "expo-intent-launcher";
import * as WebBrowser from "expo-web-browser";
import { User } from "../model/User";
import { Crisis } from "../model/Crisis/Crisis";
import { isAndroid, isIOS } from "./Utils";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

// Helper function to prepare HTML content for PDF
async function generateHTMLContent(): Promise<string> {
  const user = await User.getFromLocal();
  const crises = await Crisis.getCrises();

  // Calculate age based on birth date
  const age = user?.birthDate
    ? new Date().getFullYear() - user.birthDate.getFullYear()
    : "N/A";

  // Find the date of the first crisis and the current date for the report period
  const reportStartDate =
    crises && crises.length > 0
      ? new Date(
          Math.min(
            ...crises.map((c) =>
              c.dateTime ? new Date(c.dateTime).getTime() : Infinity
            )
          )
        )
      : null;
  const reportEndDate = new Date();
  const reportPeriod = reportStartDate
    ? `${reportStartDate.toLocaleDateString()} - ${reportEndDate.toLocaleDateString()}`
    : "Período indisponível";

  // Map CrisisDuration values to numeric values for averaging
  const durationMapping: Record<string, number> = {
    "< 1 minuto": 0.5,
    "1 a 3 minutos": 2,
    "> 5 minutos": 5,
    "Não sei": 0,
  };

  // Count occurrences of each symptom and crisis type for summary
  const symptomCounts: Record<string, number> = {};
  const crisisTypes: Record<string, number> = {};
  let totalDuration = 0;
  let countedCrises = 0;
  crises?.forEach((crise) => {
    crise.symptomsBefore?.forEach((symptom) => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
    if (crise.type) {
      crisisTypes[crise.type] = (crisisTypes[crise.type] || 0) + 1;
    }
    const mappedDuration =
      durationMapping[crise.duration as keyof typeof durationMapping];
    if (mappedDuration !== undefined) {
      totalDuration += mappedDuration;
      countedCrises++;
    }
  });

  const avgDuration = countedCrises > 0 ? totalDuration / countedCrises : 0;

  const formatOccurrencePercentage = (
    occurrences: Record<string, number>,
    total: number
  ) =>
    Object.entries(occurrences)
      .map(([key, value]) => `${((value / total) * 100).toFixed(1)}%: ${key}`)
      .join(", ");

  const mostFrequentSymptoms = formatOccurrencePercentage(
    symptomCounts,
    crises?.length || 0
  );
  const crisisManifestations = formatOccurrencePercentage(
    crisisTypes,
    crises?.length || 0
  );

  // HTML content with a structured layout in Portuguese
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          h1, h2 { color: #333; text-align: center; }
          p, li { font-size: 14px; }
          .header { text-align: center; margin-bottom: 20px; }
          .section { margin: 20px 0; }
          .section-title { font-weight: bold; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório Médico</h1>
          <p><strong>Período do Relatório:</strong> ${reportPeriod}</p>
        </div>

        <div class="section">
          <h2>Informações do Paciente</h2>
          <p><strong>Nome:</strong> ${user?.firstName || ""} ${
    user?.lastName || ""
  }</p>
          <p><strong>Idade:</strong> ${age}</p>
          <p><strong>Gênero:</strong> ${user?.gender || "N/A"}</p>
          <p><strong>Diagnóstico:</strong> ${user?.diagnostic || "N/A"}</p>
        </div>

        <div class="section">
          <h2>Informações das Crises</h2>
          <p><strong>Datas das Crises:</strong></p>
          <ul>
            ${
              crises
                ?.map(
                  (crise) => `
                <li>
                  <strong>Data:</strong> ${
                    crise.dateTime
                      ? new Date(crise.dateTime).toLocaleDateString()
                      : "N/A"
                  }
                  <br><strong>Duração:</strong> ${crise.duration || "N/A"}
                  <br><strong>Tipo:</strong> ${crise.type || "N/A"}
                  <br><strong>Sintomas Antes:</strong> ${
                    crise.symptomsBefore?.join(", ") || "Nenhum"
                  }
                  <br><strong>Estado após a crise:</strong> ${
                    crise.postState?.join(", ") || "N/A"
                  }
                </li>
              `
                )
                .join("") || "<p>Nenhuma crise registrada.</p>"
            }
          </ul>
        </div>

        <div class="section">
          <h2>Resumo das Crises</h2>
          <p><strong>Duração média das crises:</strong> ${avgDuration.toFixed(
            2
          )} minutos</p>
          <p><strong>Como as crises se manifestaram:</strong> ${
            crisisManifestations || "N/A"
          }</p>
          <p><strong>Intensidade das crises:</strong> ${[
            ...new Set(crises?.map((c) => c.intensity || "N/A")),
          ].join(", ")}</p>
          <p><strong>Tempo de recuperação:</strong> ${[
            ...new Set(crises?.map((c) => c.recoverySpeed || "N/A")),
          ].join(", ")}</p>
          <p><strong>Estado após as crises:</strong> ${[
            ...new Set(crises?.flatMap((c) => c.postState || ["N/A"])),
          ].join(", ")}</p>
          <p><strong>Sintomas de Aura mais registrados:</strong> ${
            mostFrequentSymptoms || "Nenhum"
          }</p>
        </div>

        <div class="section">
          <h2>Fatores Associados às Crises</h2>
          <p><strong>Relação das crises com a tomada de medicamentos:</strong> ${
            crises?.some((c) => c.tookMedication) ? "Sim" : "Não"
          }</p>
          <p><strong>Relação com o ciclo menstrual:</strong> ${
            crises?.some((c) => c.menstruationOrPregnancy) ? "Sim" : "Não"
          }</p>
          <p><strong>Fatores associados:</strong> ${
            [
              ...new Set(
                crises?.flatMap((c) => [
                  c.emotionalStress,
                  c.sleepStatus,
                  c.alcohol,
                  c.substanceUse,
                  c.selfHarm,
                ])
              ),
            ]
              .filter((factor) => factor)
              .join(", ") || "Nenhum fator associado registrado"
          }</p>
        </div>
      </body>
    </html>
  `;
}

// Helper function to generate PDF and return its URI
async function generatePDF(): Promise<string> {
  const htmlContent = await generateHTMLContent();
  const { uri } = await Print.printToFileAsync({ html: htmlContent });
  return uri;
}

export async function generateAndSharePDF() {
  try {
    // Generate the HTML content for the PDF
    const htmlContent = await generateHTMLContent();

    // Create the PDF file with a specific name
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
    });

    // Share the PDF using Expo's Sharing API
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share your PDF",
        UTI: "com.adobe.pdf", // iOS-specific Universal Type Identifier for PDFs
      });
      console.log("PDF generated and shared successfully");
    } else {
      console.log("Sharing is not available on this device.");
    }
  } catch (error) {
    console.error(
      "Error generating or sharing PDF:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

export async function generateAndOpenPDF() {
  try {
    // Generate the HTML content for the PDF
    const htmlContent = await generateHTMLContent();

    // Create the PDF file with a specific name
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
    });

    if (Platform.OS === "android") {
      // On Android, use IntentLauncher to open the PDF
      const contentUri = await FileSystem.getContentUriAsync(uri);
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: contentUri,
        flags: 1, // Intent.FLAG_GRANT_READ_URI_PERMISSION
        type: "application/pdf",
      });
    } else if (Platform.OS === "ios") {
      // On iOS, use Sharing API to open the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Open your PDF",
          UTI: "com.adobe.pdf", // iOS-specific Universal Type Identifier for PDFs
        });
      } else {
        console.log("Sharing is not available on this device.");
      }
    }

    console.log("PDF generated and opened successfully");
  } catch (error) {
    console.error(
      "Error generating or opening PDF:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

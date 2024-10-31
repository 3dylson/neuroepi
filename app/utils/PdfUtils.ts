import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import * as IntentLauncher from "expo-intent-launcher";
import * as WebBrowser from "expo-web-browser";
import { User } from "../model/User";
import { Crise } from "../model/Crise";
import { isAndroid, isIOS } from "./Utils";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

// Helper function to prepare HTML content for PDF
// Helper function to prepare HTML content for PDF
async function generateHTMLContent(): Promise<string> {
  const user = await User.getFromLocal();
  const crises = await Crise.getCrises();

  const userData = user
    ? `
      <h1>User Information</h1>
      <p><strong>Name:</strong> ${user.firstName || ""} ${
        user.lastName || ""
      }</p>
      <p><strong>Email:</strong> ${user.email || ""}</p>
      <p><strong>Phone:</strong> ${user.phoneNumber || ""}</p>
      <p><strong>Birth Date:</strong> ${
        user.birthDate instanceof Date ? user.birthDate.toISOString() : "N/A"
      }</p>
      <p><strong>Medicines:</strong> ${
        user.medicines?.map((m) => m.name).join(", ") || "None"
      }</p>
    `
    : "<p>No user data found</p>";

  const crisisData =
    crises && crises.length > 0
      ? `
      <h2>Crises Information</h2>
      <ul>
        ${crises
          .map(
            (crise) => `
          <li>
            <strong>Date:</strong> ${
              crise.dateTime instanceof Date
                ? crise.dateTime.toISOString()
                : "N/A"
            }<br>
            <strong>Type:</strong> ${crise.type || "N/A"}<br>
            <strong>Duration:</strong> ${crise.duration || "N/A"}<br>
            <strong>Symptoms:</strong> ${
              crise.symptomsBefore?.join(", ") || "None"
            }
          </li>
        `
          )
          .join("")}
      </ul>
    `
      : "<p>No crises data found</p>";

  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          h1, h2 { color: #333; }
          p, li { font-size: 14px; }
        </style>
      </head>
      <body>
        ${userData}
        ${crisisData}
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

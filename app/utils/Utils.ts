import { Platform } from "react-native";
import { Crisis } from "../model/Crisis/Crisis";

export const isAndroid = (): boolean => {
  return Platform.OS === "android";
};

export const isIOS = (): boolean => {
  return Platform.OS === "ios";
};

/**
 * generates a ID intended for local, non-global use cases.
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export function calculateAge(birthDate: Date | undefined): string {
  return birthDate
    ? `${new Date().getFullYear() - birthDate.getFullYear()}`
    : "N/A";
}

// Helper to format crisis date range
export function formatReportPeriod(crises: Crisis[]): string {
  if (crises.length === 0) return "Período indisponível";

  const start = new Date(
    Math.min(
      ...crises.map((c) =>
        c.dateTime ? new Date(c.dateTime).getTime() : Infinity
      )
    )
  );
  const end = new Date();
  return `${start.toLocaleDateString()} a ${end.toLocaleDateString()}`;
}

import * as Localization from "expo-localization";

export async function getDeviceTimeZone(): Promise<string> {
  try {
    const calendars = await Localization.getCalendars();
    if (calendars && calendars.length > 0) {
      // Retrieve the first calendar's time zone
      return calendars[0].timeZone || "UTC";
    }
    console.warn("No calendars available; falling back to UTC.");
    return "UTC";
  } catch (error) {
    console.error("Error fetching device time zone:", error);
    return "UTC"; // Default fallback time zone
  }
}

export function isDebugMode(): boolean {
  return __DEV__;
}

import { DoseFrequency } from "@/constants/DoseFrequency";
import * as Notifications from "expo-notifications";
import * as Calendar from "expo-calendar";
import { Medicine } from "../model/Medicine";
import { Alert, Linking } from "react-native";
import { getDeviceTimeZone } from "./Utils";

export const setNotificationAlarm = async (
  newMedicine: Medicine
): Promise<void> => {
  if (!newMedicine.isAlarmSet) return;

  try {
    // Request notification permissions
    const notificationPermissionGranted = await requestNotificationPermission();
    if (!notificationPermissionGranted) {
      console.warn("Notification permission not granted.");
      return;
    }

    // Request calendar (and reminders) permissions
    const calendarPermissionGranted = await requestCalendarPermission();
    if (!calendarPermissionGranted) {
      console.warn("Calendar/Reminders permission not granted.");
      return;
    }

    // Get upcoming notification dates
    const notificationDates = getNextNotificationDates(
      newMedicine.times,
      newMedicine.frequency
    );

    // Filter out past dates
    const futureNotificationDates = notificationDates.filter(
      (date) => date > new Date()
    );

    if (futureNotificationDates.length === 0) {
      console.warn("No future notification dates available.");
      return;
    }

    // Schedule notifications and calendar events
    const deviceTimeZone = await getDeviceTimeZone();
    const calendarId = await getDefaultCalendarId();

    if (!calendarId) {
      console.warn("Default calendar ID not found.");
    }

    await Promise.all(
      futureNotificationDates.map(async (notificationDate) => {
        try {
          // Schedule notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `Hora de tomar seu remédio!`,
              body: `Não se esqueça de tomar seu remédio: ${newMedicine.name}`,
              data: { medicineId: newMedicine.id },
            },
            trigger: { date: notificationDate },
          });

          // Create calendar event if a calendar ID is available
          if (calendarId) {
            await Calendar.createEventAsync(calendarId, {
              title: `Tome seu remédio: ${newMedicine.name}`,
              startDate: notificationDate,
              endDate: new Date(notificationDate.getTime() + 30 * 60 * 1000),
              timeZone: deviceTimeZone,
              notes: newMedicine.notes,
              alarms: [{ relativeOffset: -10 }], // Optional alarm: 10 minutes before the event
            });
          }
        } catch (error) {
          console.error(
            `Error scheduling notification or calendar event for ${notificationDate}:`,
            error
          );
        }
      })
    );
  } catch (error) {
    console.error("Error setting notifications and calendar events:", error);
  }
};

export function getNextNotificationDates(
  times: string[],
  frequency: DoseFrequency
): Date[] {
  const now = new Date();
  const notificationDates: Date[] = [];

  // Parse the provided times into valid Date objects
  const parsedTimes = parseTimeStrings(times);

  if (parsedTimes.length === 0) {
    console.warn("No valid times provided.");
    return [];
  }

  parsedTimes.forEach((time) => {
    // Clone the parsed time to avoid mutation
    const baseDate = new Date(time);

    // Define how many intervals to add based on frequency
    let intervals: number;
    let intervalType: "days" | "weeks" | "months";

    switch (frequency) {
      case DoseFrequency.DAILY:
        intervals = 7; // Generate dates for the next 7 days
        intervalType = "days";
        break;
      case DoseFrequency.WEEKLY:
        intervals = 4; // Generate dates for the next 4 weeks
        intervalType = "weeks";
        break;
      case DoseFrequency.MONTHLY:
        intervals = 3; // Generate dates for the next 3 months
        intervalType = "months";
        break;
      default:
        console.warn("Unknown frequency. Defaulting to a single day interval.");
        intervals = 1;
        intervalType = "days";
        break;
    }

    // Add the initial notification date (if in the future)
    if (baseDate > now) {
      notificationDates.push(new Date(baseDate));
    }

    // Schedule subsequent notifications based on frequency
    for (let i = 1; i <= intervals; i++) {
      const nextNotificationDate = new Date(baseDate);

      switch (intervalType) {
        case "days":
          nextNotificationDate.setDate(nextNotificationDate.getDate() + i);
          break;
        case "weeks":
          nextNotificationDate.setDate(nextNotificationDate.getDate() + 7 * i);
          break;
        case "months":
          nextNotificationDate.setMonth(nextNotificationDate.getMonth() + i);
          break;
      }

      // Only include future dates
      if (nextNotificationDate > now) {
        notificationDates.push(nextNotificationDate);
      }
    }
  });

  return notificationDates;
}

/**
 * Request both Calendar and Reminders permissions (especially needed for iOS).
 * This function returns true only if both are granted.
 */
export async function requestCalendarPermission(): Promise<boolean> {
  try {
    const { status: calendarStatus } =
      await Calendar.requestCalendarPermissionsAsync();
    // On iOS, we also need to request "reminders" permission if we want to create reminders.
    // If you're only using calendars, this may not be needed—but some iOS versions might demand it.
    const { status: remindersStatus } =
      await Calendar.requestRemindersPermissionsAsync();

    if (calendarStatus === "granted" && remindersStatus === "granted") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.warn("Error requesting calendar/reminder permissions:", error);
    return false;
  }
}

export async function getDefaultCalendarId(): Promise<string | null> {
  try {
    const calendars = await Calendar.getCalendarsAsync();

    if (!calendars || calendars.length === 0) {
      console.warn("No calendars available on the device.");
      return null;
    }

    // Log all available calendars for debugging
    console.log("Available calendars:", calendars);

    // Filter writable calendars
    const writableCalendars = calendars.filter(
      (calendar) => calendar.allowsModifications
    );

    if (writableCalendars.length === 0) {
      console.warn("No writable calendars available.");
      return null;
    }

    // Find primary calendar
    const defaultCalendar = writableCalendars.find(
      (calendar) => calendar.isPrimary
    );

    if (defaultCalendar) {
      return defaultCalendar.id;
    } else {
      // Fallback to the first writable calendar
      return writableCalendars[0].id;
    }
  } catch (error) {
    console.error("Error getting default calendar ID:", error);
    return null;
  }
}

export function parseTimeStrings(times: string[]): Date[] {
  const now = new Date();
  const notificationDates: Date[] = [];

  // This regex handles multiple formats:
  // - "7:4", "07:04"
  // - "7h:4m", "7H:4M"
  // - "7:4m", etc.
  // Explanation:
  // (\d{1,2}) => Captures 1 or 2 digits for hours
  // (?:[hH])? => Optionally matches a "h" or "H"
  // :? => Optionally matches a colon
  // (\d{1,2}) => Captures 1 or 2 digits for minutes
  // (?:[mM])? => Optionally matches a "m" or "M"
  const timeRegex = /^\s*(\d{1,2})(?:[hH])?:?(\d{1,2})(?:[mM])?\s*$/;

  times.forEach((time) => {
    try {
      // Try matching the time string with the regex
      const match = time.match(timeRegex);
      if (!match) {
        console.warn(`Invalid time format: ${time}`);
        return;
      }

      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);

      if (isNaN(hours) || isNaN(minutes)) {
        console.warn(
          `Invalid time values (hours/minutes are not numbers): ${time}`
        );
        return;
      }

      const notificationDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes
      );

      // If the time is earlier than the current time, schedule it for the next day
      if (notificationDate < now) {
        notificationDate.setDate(notificationDate.getDate() + 1);
      }

      notificationDates.push(notificationDate);
    } catch (error) {
      console.error(`Error parsing time string ${time}:`, error);
    }
  });

  return notificationDates;
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status === "granted") {
      return true;
    } else if (status === "denied") {
      Alert.alert(
        "Permissão Necessária",
        "As notificações estão desativadas. Por favor, ative-as nas configurações do seu dispositivo.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Abrir Configurações",
            onPress: () => Linking.openSettings(),
          },
        ]
      );
    }

    return false;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    Alert.alert(
      "Erro",
      "Ocorreu um erro ao solicitar permissão para notificações. Tente novamente mais tarde."
    );
    return false;
  }
}

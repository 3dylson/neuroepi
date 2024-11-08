import { DoseFrequency } from "@/constants/DoseFrequency";
import * as Notifications from "expo-notifications";
import * as Calendar from "expo-calendar";
import { Medicine } from "../model/Medicine";
import * as Localization from "expo-localization";

export const setNotificationAlarm = async (
  newMedicine: Medicine
): Promise<void> => {
  if (!newMedicine.isAlarmSet) return;

  try {
    // Request calendar permissions
    const calendarPermissionGranted = await requestCalendarPermission();
    if (!calendarPermissionGranted) {
      console.warn("Calendar permission not granted.");
      return;
    }

    // Get upcoming notification dates based on medicine times and frequency
    const notificationDates = getNextNotificationDates(
      newMedicine.times,
      newMedicine.frequency
    );

    // Iterate over each notification date
    for (const notificationDate of notificationDates) {
      // Schedule a notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Hora de tomar seu remédio!`,
          body: `Não se esqueça de tomar seu remédio: ${newMedicine.name}`,
          data: { medicineId: newMedicine.id },
        },
        trigger: { date: notificationDate },
      });

      // Get the default calendar ID
      const calendarId = await getDefaultCalendarId();
      if (!calendarId) {
        console.warn("Default calendar ID not found.");
        return;
      }

      // Set the time zone and create an event in the calendar
      const deviceTimeZone = Localization.timezone;
      await Calendar.createEventAsync(calendarId, {
        title: `Tome seu remédio: ${newMedicine.name}`,
        startDate: notificationDate,
        endDate: new Date(notificationDate.getTime() + 30 * 60 * 1000), // Event duration: 30 minutes
        timeZone: deviceTimeZone,
        notes: newMedicine.notes,
        alarms: [{ relativeOffset: -10 }], // Optional: 10 minutes before the event
      });
    }
  } catch (error) {
    console.error("Error setting notification and calendar event:", error);
  }
};

export function getNextNotificationDates(
  times: string[],
  frequency: DoseFrequency
): Date[] {
  const notificationDates: Date[] = [];
  const parsedTimes = parseTimeStrings(times);

  parsedTimes.forEach((time) => {
    // Clone the parsed time to avoid mutation
    const baseDate = new Date(time);

    // Define how many intervals to add based on frequency
    let intervals: number;
    let intervalType: "days" | "weeks" | "months";

    switch (frequency) {
      case DoseFrequency.DAILY:
        intervals = 7; // Next 7 days
        intervalType = "days";
        break;
      case DoseFrequency.WEEKLY:
        intervals = 4; // Next 4 weeks
        intervalType = "weeks";
        break;
      case DoseFrequency.MONTHLY:
        intervals = 3; // Next 3 months
        intervalType = "months";
        break;
      default:
        intervals = 1; // Fallback to a single instance if frequency is unknown
        intervalType = "days";
        break;
    }

    // Add the initial notification date
    notificationDates.push(new Date(baseDate));

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

      notificationDates.push(nextNotificationDate);
    }
  });

  return notificationDates;
}

export async function requestCalendarPermission(): Promise<boolean> {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error requesting calendar permission:", error);
    return false;
  }
}

export async function getDefaultCalendarId(): Promise<string | null> {
  try {
    const calendars = await Calendar.getCalendarsAsync();
    const defaultCalendar = calendars.find((calendar) => calendar.isPrimary);

    // Fallback to the first available calendar if no primary calendar is set
    if (defaultCalendar) {
      return defaultCalendar.id;
    } else if (calendars.length > 0) {
      return calendars[0].id;
    } else {
      console.warn("No calendars available on the device.");
      return null;
    }
  } catch (error) {
    console.error("Error getting default calendar ID:", error);
    return null;
  }
}

export function parseTimeStrings(times: string[]): Date[] {
  const now = new Date();
  const notificationDates: Date[] = [];

  times.forEach((time) => {
    try {
      const [hours, minutes] = time.split(":").map(Number);

      if (isNaN(hours) || isNaN(minutes)) {
        console.warn(`Invalid time format: ${time}`);
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
    return status === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
}

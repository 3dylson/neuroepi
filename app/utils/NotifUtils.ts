import { DoseFrequency } from "@/constants/DoseFrequency";
import * as Notifications from "expo-notifications";
import * as Calendar from "expo-calendar";

export function parseTimeStrings(times: string[]): Date[] {
  const now = new Date();
  const notificationDates: Date[] = [];

  times.forEach((time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const notificationDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );
    // Adjust for past times (set for the next day)
    if (notificationDate < now) {
      notificationDate.setDate(notificationDate.getDate() + 1);
    }
    notificationDates.push(notificationDate);
  });

  return notificationDates;
}

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export function getNextNotificationDates(
  times: string[],
  frequency: DoseFrequency
): Date[] {
  const notificationDates: Date[] = [];
  const parsedTimes = parseTimeStrings(times);

  parsedTimes.forEach((date) => {
    // Clone the date object to avoid mutating the original
    const notificationDate = new Date(date);

    // Depending on frequency, schedule additional notifications
    switch (frequency) {
      case DoseFrequency.DAILY:
        notificationDates.push(notificationDate);
        for (let i = 1; i < 7; i++) {
          // Schedule for the next 6 days
          const nextDay = new Date(notificationDate);
          nextDay.setDate(nextDay.getDate() + i);
          notificationDates.push(nextDay);
        }
        break;
      case DoseFrequency.WEEKLY:
        notificationDates.push(notificationDate);
        for (let i = 1; i < 4; i++) {
          // Schedule for the next 4 weeks
          const nextWeek = new Date(notificationDate);
          nextWeek.setDate(nextWeek.getDate() + 7 * i);
          notificationDates.push(nextWeek);
        }
        break;
      case DoseFrequency.MONTHLY:
        notificationDates.push(notificationDate);
        for (let i = 1; i < 4; i++) {
          // Schedule for the next 3 months
          const nextMonth = new Date(notificationDate);
          nextMonth.setMonth(nextMonth.getMonth() + i);
          notificationDates.push(nextMonth);
        }
        break;
      // Add cases for other frequencies...
      default:
        break;
    }
  });

  return notificationDates;
}

export async function requestCalendarPermission() {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === "granted";
}

export async function getDefaultCalendarId(): Promise<string | null> {
  const calendars = await Calendar.getCalendarsAsync();
  const defaultCalendar = calendars.find((calendar) => calendar.isPrimary);
  return defaultCalendar ? defaultCalendar.id : null;
}

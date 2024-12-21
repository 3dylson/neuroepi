export {};

export class DateUtils {
  static toHourMinuteString(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}h:${minutes}m`;
  }

  static fromHourMinuteString(timeString: string): Date {
    const [hours, minutes] = timeString.split(/[h:m]+/).map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }

  static toDayMonthYearString(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  static toDayMonthNameYearString(
    date: Date,
    abbreviatedName: boolean = true
  ): string {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthName = date.toLocaleString("default", {
      month: abbreviatedName ? "short" : "long",
    });
    return `${day} ${monthName} ${year}`;
  }

  /**
   * Returns the age of the date in years.
   * @param date The date to calculate the age from.
   * @returns {number}
   * @example DateUtils.getAge(new Date(2000, 0, 1)) // returns 21 if today is 1 Jan 2021
   */
  static getAge(date: Date): number {
    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();
    if (
      now.getMonth() < date.getMonth() ||
      (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())
    ) {
      return age - 1;
    }
    return age;
  }
}

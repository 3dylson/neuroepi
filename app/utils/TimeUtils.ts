export {};

declare global {
  interface Date {
    toHourMinuteString(): string;

    toDayMonthYearString(): string;

    /**
     * Returns a string representation of the date in the format "day month year".
     * @param {boolean} abbreviatedName - If true, the month name will be abbreviated.
     * ex: "1 Jan 2021" or "1 January 2021"
     * @returns {string}
     */
    toDayMonthNameYearString(abbreviatedName: boolean): string;
    getAge(): number;
  }
}

Date.prototype.toHourMinuteString = function (): string {
  const hours = this.getHours();
  const minutes = this.getMinutes();
  return `${hours}h:${minutes}m`;
};

Date.prototype.toDayMonthYearString = function (): string {
  const day = this.getDate();
  const month = this.getMonth() + 1;
  const year = this.getFullYear();
  return `${day}/${month}/${year}`;
};

Date.prototype.toDayMonthNameYearString = function (
  abbreviatedName: boolean = true
): string {
  const day = this.getDate();
  const month = this.getMonth();
  const year = this.getFullYear();
  const monthName = this.toLocaleString("default", {
    month: abbreviatedName ? "short" : "long",
  });
  return `${day} ${monthName} ${year}`;
};

/**
 * Returns the age of the date in years.
 * @returns {number}
 * @example new Date(2000, 0, 1).getAge() // returns 21 if today is 1 Jan 2021
 */
Date.prototype.getAge = function (): number {
  const now = new Date();
  const age = now.getFullYear() - this.getFullYear();
  if (
    now.getMonth() < this.getMonth() ||
    (now.getMonth() === this.getMonth() && now.getDate() < this.getDate())
  ) {
    return age - 1;
  }
  return age;
};

// Example usage:
const date = new Date();
console.log(date.toHourMinuteString());

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

// Example usage:
const date = new Date();
console.log(date.toHourMinuteString());

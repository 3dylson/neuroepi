export {};

declare global {
  interface String {
    toDateFromHourMinuteString(): Date;
    isNullOrEmpty(): boolean;
  }
}

String.prototype.toDateFromHourMinuteString = function (): Date {
  const [hours, minutes] = this.split("h:").map((part) =>
    parseInt(part.replace("m", ""), 10)
  );
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

String.prototype.isNullOrEmpty = function (): boolean {
  return this == null || this.trim() === "";
};

// Example usage:
const timeString = "14h:30m";
const date = timeString.toDateFromHourMinuteString();
console.log(date);

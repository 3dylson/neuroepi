export {};

declare global {
  interface String {
    toDateFromHourMinuteString(): Date;
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

// Example usage:
const timeString = "14h:30m";
const date = timeString.toDateFromHourMinuteString();
console.log(date);

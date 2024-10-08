export {};

declare global {
  interface String {
    toDateFromHourMinuteString(): Date;
    isNullOrEmpty(): boolean;
    orDefault(value: string): string;
  }
}

String.prototype.orDefault = function (value: string): string {
  if (this.isNullOrEmpty()) {
    return value;
  } else {
    return String(this);
  }
};

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

// Simple phone validation (allows digits, spaces, dashes, etc.)
export const PhoneRegex = /^[0-9-+\s()]*$/;

// Standard email validation regex
export const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

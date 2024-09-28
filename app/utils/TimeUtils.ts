export {};

declare global {
  interface Date {
    toHourMinuteString(): string;
  }
}

Date.prototype.toHourMinuteString = function (): string {
  const hours = this.getHours();
  const minutes = this.getMinutes();
  return `${hours}h:${minutes}m`;
};

// Example usage:
const date = new Date();
console.log(date.toHourMinuteString());

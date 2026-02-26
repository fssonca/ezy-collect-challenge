const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function formatDateDayMonthYear(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date).replace(/\s/g, "-");
}

export function formatReceiptDateTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const parts = dateTimeFormatter.formatToParts(date);
  const map = new Map(parts.map((part) => [part.type, part.value]));

  const day = map.get("day");
  const month = map.get("month");
  const year = map.get("year");
  const hour = map.get("hour");
  const minute = map.get("minute");
  const second = map.get("second");

  if (!day || !month || !year || !hour || !minute || !second) {
    return dateTimeFormatter.format(date);
  }

  return `${day}-${month}-${year}, ${hour}:${minute}:${second}`;
}

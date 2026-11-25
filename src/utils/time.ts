/** Parses a "h:mm AM/PM" string (e.g. "9:30 AM") into minutes since midnight. Returns null if unparseable. */
export function parseTimeToMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
  if (period === 'AM') {
    if (hours === 12) hours = 0;
  } else if (hours !== 12) {
    hours += 12;
  }
  return hours * 60 + minutes;
}

/** Combines a YYYY-MM-DD date string with a "h:mm AM/PM" time string into a real Date, or null if unparseable. */
export function combineDateAndTime(dateISO: string, time: string): Date | null {
  const minutes = parseTimeToMinutes(time);
  if (minutes === null) return null;
  const [y, m, d] = dateISO.split('-').map(Number);
  const date = new Date(y, m - 1, d, 0, 0, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}

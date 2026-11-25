/** Formats a Date as YYYY-MM-DD using its LOCAL calendar date (never UTC — toISOString() shifts the date near midnight in non-UTC timezones). */
export function toLocalISODate(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Today's date as YYYY-MM-DD, in local time. */
export function todayISO(): string {
  return toLocalISODate(new Date());
}

/** Returns the YYYY-MM-DD date `days` away from `iso` (negative for past), in local time. */
export function shiftISODate(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toLocalISODate(date);
}

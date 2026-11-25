/** Returns the last Monday–Friday date of the given month (month is 0-indexed, like Date). */
export function lastWorkingDayOfMonth(year: number, month: number): Date {
  const d = new Date(year, month + 1, 0); // last calendar day of the month
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() - 1);
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

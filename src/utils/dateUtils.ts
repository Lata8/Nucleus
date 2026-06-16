/**
 * Utility functions for local date formatting without UTC rollover skew.
 */

/**
 * Returns a 'YYYY-MM-DD' string of the given Date in the local timezone.
 */
export function getLocalDateString(dateInput: Date | number | string = new Date()): string {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

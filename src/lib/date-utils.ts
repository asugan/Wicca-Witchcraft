/**
 * Format a Date as YYYY-MM-DD using the device's LOCAL timezone.
 * Unlike toISOString().slice(0, 10) which converts to UTC first,
 * this always matches the calendar day the user sees on their device.
 */
export function toLocalIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

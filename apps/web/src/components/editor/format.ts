/** "Nov 3, 14:05" for today-ish dates, with the year when it's not the current year. */
export function formatDateTime(iso: string): string {
  // SQLite's CURRENT_TIMESTAMP looks like "2026-11-03 12:05:00" (UTC, no zone) — make it parseable as UTC.
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(iso) ? iso.replace(' ', 'T') + 'Z' : iso;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return iso;
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

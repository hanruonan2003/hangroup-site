/**
 * Format a news.yml date string ("YYYY", "YYYY-MM", or "YYYY-MM-DD") for display.
 *
 *   "2022"        → "2022"
 *   "2025-09"     → "Sep 2025"
 *   "2018-07-16"  → "Jul 16, 2018"
 */
export function formatNewsDate(s: string): string {
  const parts = s.split("-");
  if (parts.length === 1) return parts[0]!;
  const monthIdx = Number(parts[1]) - 1;
  const month = new Date(2000, monthIdx, 1).toLocaleString("en-US", {
    month: "short",
  });
  if (parts.length === 2) return `${month} ${parts[0]}`;
  return `${month} ${Number(parts[2])}, ${parts[0]}`;
}

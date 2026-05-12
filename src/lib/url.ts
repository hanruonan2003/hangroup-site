// Prefix an absolute internal path with import.meta.env.BASE_URL so links
// keep working when the site is deployed under a sub-path (e.g. GitHub Pages
// at /hangroup-site/). Pass absolute paths like "/people/" or "/publications/".
// Non-absolute inputs (hash links, external URLs) pass through unchanged.

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");

export function url(path: string): string {
  if (!path.startsWith("/")) return path;
  return BASE + path;
}

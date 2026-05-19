// Prefix an absolute internal path with import.meta.env.BASE_URL so links
// keep working under either a root deploy or a sub-path deploy. The site
// currently ships at the apex of hangroup.mit.edu (base = "/"), so the
// prefix is empty; the helper is kept so we can re-introduce a sub-path
// without rewriting every link. Pass absolute paths like "/people/" or
// "/publications/". Non-absolute inputs (hash links, external URLs) pass
// through unchanged.

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");

export function url(path: string): string {
  if (!path.startsWith("/")) return path;
  return BASE + path;
}

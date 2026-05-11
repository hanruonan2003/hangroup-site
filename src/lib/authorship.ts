import type { Author } from "./publications.ts";

/**
 * Build a Set of "family|firstInitial" keys that identify authors who should
 * render in primary text color on the publications page (PI + current members).
 *
 * - "Ruonan Han" → "han|R"
 * - "Nicholas (Sihyun) Lee" → "lee|N" (parenthesized middle names dropped)
 */
export function buildPrimaryAuthorSet(displayNames: string[]): Set<string> {
  const set = new Set<string>();
  for (const name of displayNames) {
    const key = makeKey(name);
    if (key) set.add(key);
  }
  return set;
}

function makeKey(displayName: string): string | null {
  // Strip parenthesized aliases like "Nicholas (Sihyun) Lee" → "Nicholas Lee".
  const cleaned = displayName.replace(/\([^)]*\)/g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return null;
  const family = parts[parts.length - 1].toLowerCase();
  const initial = parts[0][0]?.toUpperCase();
  if (!initial) return null;
  return `${family}|${initial}`;
}

/**
 * True if a publication author matches a current member or the PI.
 * Literal/group-marker authors ("others", "Group members …") always return false.
 */
export function isPrimaryAuthor(
  author: Author,
  primarySet: Set<string>,
): boolean {
  if (author.literal) return false;
  const family = author.family.toLowerCase();
  const initialMatch = (author.given ?? "").match(/[A-Za-z]/);
  if (!initialMatch) return false;
  const initial = initialMatch[0].toUpperCase();
  return primarySet.has(`${family}|${initial}`);
}

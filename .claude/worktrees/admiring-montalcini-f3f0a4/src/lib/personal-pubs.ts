// Per-person personal-publication BibTeX support.
//
// A group member may optionally have a personal BibTeX file at
// `content/people/<slug>.bib` listing papers they authored WITHOUT R. Han
// (pre-MIT work, independent collaborations, etc.). Those entries are
// rendered in an "Other publications" section on the person's profile page
// only — they MUST NOT appear in /publications/, /research/, or any
// group-wide pub list.
//
// To prevent a student from accidentally polluting their profile with group
// papers, the build deduplicates each personal entry against the group bib
// (publications.bib). The matcher requires title + year + meaningful author
// overlap; conference/journal versions of the same work with distinct titles
// stay separate.
//
// See CLAUDE.md for the editorial rule: when in doubt, ASK whether R. Han is
// a co-author. Personal bib if not, group bib if yes.

import { parsePublicationsBib, type NormalizedPublication } from "./publications.ts";

/**
 * Vite glob: every `content/people/*.bib` file is read at build time and the
 * raw text is bundled into this module. Doing it this way (rather than fs.readFile
 * with a path derived from import.meta.url) avoids the fact that Astro's
 * bundler relocates the compiled chunk into dist/ and breaks any
 * filesystem path computed from __dirname. Same pattern PersonPhoto.astro
 * uses for headshots.
 */
const PERSONAL_BIB_RAW = import.meta.glob<string>(
  "../../content/people/*.bib",
  { eager: true, query: "?raw", import: "default" },
);
/** slug -> raw bib text. Keyed by filename minus the .bib extension. */
const personalBibBySlug: Record<string, string> = {};
for (const [path, text] of Object.entries(PERSONAL_BIB_RAW)) {
  const name = path.split("/").pop()!.replace(/\.bib$/i, "");
  personalBibBySlug[name] = text;
}

/**
 * Set PERSONAL_PUBS_STRICT=1 to convert "duplicate suppressed" warnings into
 * hard errors. Useful in CI. Default behavior: warn only.
 */
const STRICT = process.env.PERSONAL_PUBS_STRICT === "1";

/** Cache parsed bibs and dedup results per slug for the life of the process. */
const bibCache = new Map<string, NormalizedPublication[]>();
const dedupCache = new Map<string, NormalizedPublication[]>();

/**
 * Load and parse `content/people/<slug>.bib`. Returns [] if the file does
 * not exist. Throws on parse errors so a malformed personal bib fails the
 * build loudly instead of silently degrading.
 */
export function loadPersonalBib(slug: string): NormalizedPublication[] {
  if (bibCache.has(slug)) return bibCache.get(slug)!;
  const text = personalBibBySlug[slug];
  if (text === undefined) {
    bibCache.set(slug, []);
    return [];
  }
  const pubs = parsePublicationsBib(text);
  bibCache.set(slug, pubs);
  return pubs;
}

const LEADING_ARTICLE_RE = /^(a |an |the )/;

/**
 * Compare titles ignoring case, punctuation, internal whitespace differences,
 * and leading "a / an / the". Diacritics are preserved (rare in our corpus).
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(LEADING_ARTICLE_RE, "");
}

function surnameSet(pub: NormalizedPublication): Set<string> {
  const out = new Set<string>();
  for (const a of pub.authors) {
    if (a.literal) continue;
    const last = (a.family || "").trim().toLowerCase();
    if (last) out.add(last);
  }
  return out;
}

function firstAuthorSurname(pub: NormalizedPublication): string | null {
  for (const a of pub.authors) {
    if (a.literal) continue;
    const last = (a.family || "").trim().toLowerCase();
    if (last) return last;
  }
  return null;
}

/**
 * Two entries are "the same paper" when all hold:
 *   - normalized titles match,
 *   - publication year matches,
 *   - author lists overlap meaningfully: same first-author surname, OR at
 *     least 3 distinct surnames appear in both.
 *
 * Title+year alone false-positives on conf/journal pairs sharing a title.
 * The author check correctly catches "exported the group paper into my bib
 * by accident" while letting genuinely different papers coexist.
 */
export function isSamePaper(
  a: NormalizedPublication,
  b: NormalizedPublication,
): boolean {
  if (a.year !== b.year) return false;
  if (normalizeTitle(a.title) !== normalizeTitle(b.title)) return false;

  const firstA = firstAuthorSurname(a);
  const firstB = firstAuthorSurname(b);
  if (firstA && firstB && firstA === firstB) return true;

  const setA = surnameSet(a);
  const setB = surnameSet(b);
  let overlap = 0;
  for (const s of setA) if (setB.has(s)) overlap++;
  return overlap >= 3;
}

/**
 * Strip personal entries that already appear in the group bib. Logs each
 * suppression with the matched group cite-key. In strict mode, throws
 * instead of warning so CI can gate on a clean personal/group split.
 */
export function dedupAgainstGroup(
  personal: NormalizedPublication[],
  group: NormalizedPublication[],
  slug: string,
): NormalizedPublication[] {
  const cacheKey = `${slug}::${group.length}::${personal.length}`;
  if (dedupCache.has(cacheKey)) return dedupCache.get(cacheKey)!;

  const kept: NormalizedPublication[] = [];
  for (const p of personal) {
    const match = group.find((g) => isSamePaper(p, g));
    if (match) {
      const msg = `[personal-pubs] Suppressed duplicate in ${slug}.bib: "${p.title}" (${p.year}) — already in group publications.bib as ${match.key}`;
      if (STRICT) {
        throw new Error(msg + " (PERSONAL_PUBS_STRICT=1)");
      }
      // eslint-disable-next-line no-console
      console.warn(msg);
      continue;
    }
    kept.push(p);
  }
  dedupCache.set(cacheKey, kept);
  return kept;
}

/**
 * Convenience: load + dedup in one call. Returns the personal publications
 * ready for rendering, sorted newest-first.
 */
export function loadDedupedPersonalPubs(
  slug: string,
  groupPubs: NormalizedPublication[],
): NormalizedPublication[] {
  const personal = loadPersonalBib(slug);
  const kept = dedupAgainstGroup(personal, groupPubs, slug);
  return [...kept].sort((a, b) => b.sort_key - a.sort_key);
}

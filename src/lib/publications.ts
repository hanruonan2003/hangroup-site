import { readFile } from "node:fs/promises";
import { parse, type Creator } from "@retorquere/bibtex-parser";

export interface Author {
  /** Display string, e.g. "N. M. Monroe" or "Group members with D. Englund". */
  raw: string;
  /** Family name (for matching against people records). "Group" for group-marker entries. */
  family: string;
  /** Given name or initials, if any. */
  given?: string;
  /** True for non-personal author entries: "others", "Group members …", corporate names. */
  literal?: boolean;
}

export interface NormalizedPublication {
  /** BibTeX citation key, e.g. "monroe2022reflectarray". */
  key: string;
  /** BibTeX entry type: "article", "inproceedings", "misc", etc. */
  type: string;
  /** De-LaTeX'd title, ready to render. */
  title: string;
  authors: Author[];
  /** Pre-rendered comma-separated author list with "others" → "et al.". */
  authors_display: string;
  year: number;
  /** 1–12 if present in source. */
  month?: number;
  /** year*100 + (month ?? 0) — sort descending for newest-first ordering. */
  sort_key: number;
  /** Group-curated venue shortname: ISSCC, JSSC, RFIC, NatElec, etc. */
  venue: string;
  /** Full journal name or booktitle. */
  container: string;
  keywords: string[];
  highlight: boolean;
  pdf?: string;
  video?: string;
  doi?: string;
  pages?: string;
  note?: string;
  /** Filename (relative to content/research/figures/) of a feature image for this paper. */
  image?: string;
  /** Original BibTeX source for this entry, used for the per-entry citation disclosure. */
  raw_bib: string;
}

function normalizeAuthor(c: Creator): Author {
  if (c.lastName === "others" && !c.firstName) {
    return { raw: "others", family: "others", literal: true };
  }
  if (c.firstName === "Group" && c.prefix) {
    const tail = c.lastName ? ` ${c.prefix} ${c.lastName}` : ` ${c.prefix}`;
    return {
      raw: `Group${tail}`,
      family: "Group",
      given: "members",
      literal: true,
    };
  }
  if (c.name && !c.firstName && !c.lastName) {
    return { raw: c.name, family: c.name, literal: true };
  }
  if (c.lastName && !c.firstName) {
    return { raw: c.lastName, family: c.lastName, literal: true };
  }
  const given = (c.firstName ?? "").trim();
  const family = (c.lastName ?? "").trim();
  const raw = given ? `${given} ${family}` : family;
  return { raw, family, given };
}

function formatAuthorsDisplay(authors: Author[]): string {
  return authors
    .map((a) => (a.literal && a.family === "others" ? "et al." : a.raw))
    .join(", ");
}

function toIntOrUndef(s: string | undefined): number | undefined {
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * The parser's `entry.input` may include trailing % comments and section
 * separators that belong to the next entry. Trim them to keep the per-entry
 * BibTeX disclosure clean.
 */
function stripTrailingCommentBlock(input: string): string {
  // Find the closing brace of the entry — entries end with `}` on a line by itself.
  const trimmed = input.trimEnd();
  // If the trimmed input ends with `}`, return as-is.
  if (trimmed.endsWith("}")) return trimmed;
  // Otherwise drop everything after the last `}` followed by a newline.
  const lastBrace = trimmed.lastIndexOf("}");
  if (lastBrace === -1) return trimmed;
  return trimmed.slice(0, lastBrace + 1);
}

export function parsePublicationsBib(text: string): NormalizedPublication[] {
  // english: false disables sentence-casing — preserves "GHz", "THz", "FMCW", etc.
  const lib = parse(text, { english: false });
  if (lib.errors.length > 0) {
    const summary = lib.errors
      .map((e) => JSON.stringify(e))
      .join("\n");
    throw new Error(`BibTeX parse errors:\n${summary}`);
  }

  const results: NormalizedPublication[] = [];
  for (const entry of lib.entries) {
    const f = entry.fields;
    const year = toIntOrUndef(f.year);
    if (year === undefined) {
      throw new Error(
        `Publication ${entry.key} is missing a year field`,
      );
    }
    const month = toIntOrUndef(f.month);
    const authors = (f.author ?? []).map(normalizeAuthor);
    const keywords = (f.keywords ?? [])
      .map((k) => k.trim())
      .filter(Boolean);
    const venue = (f.venue ?? "").trim();
    const container = (f.journal ?? f.booktitle ?? "").trim();

    results.push({
      key: entry.key,
      type: entry.type,
      title: (f.title ?? "").trim(),
      authors,
      authors_display: formatAuthorsDisplay(authors),
      year,
      month,
      sort_key: year * 100 + (month ?? 0),
      venue,
      container,
      keywords,
      highlight: f.highlight === "yes",
      pdf: f.pdf,
      video: f.video,
      doi: f.doi,
      pages: f.pages,
      note: f.note,
      image: f.image,
      raw_bib: stripTrailingCommentBlock(entry.input),
    });
  }

  return results;
}

export async function loadPublications(
  filePath: string,
): Promise<NormalizedPublication[]> {
  const text = await readFile(filePath, "utf-8");
  return parsePublicationsBib(text);
}

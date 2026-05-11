import { readFile } from "node:fs/promises";

export interface Thrust {
  /** kebab-case from the title, used as the collection id. */
  slug: string;
  /** Ordinal as written in the markdown (1, 2, 3, 4). */
  number: number;
  title: string;
  /** Controlled-vocab tags matching publications.bib keywords. */
  tags: string[];
  description_paragraphs: string[];
  /** True when the description is marked NEEDS REWRITE in source. */
  description_is_stale: boolean;
  /** BibTeX citation keys the build script will resolve against the publications collection. */
  publications: string[];
  /** Free-text description of figures that should ultimately go here. */
  figures_todo: string;
}

const STOPWORDS = new Set([
  "and", "the", "in", "of", "a", "for", "with", "an", "on",
  "at", "to", "or", "by", "as", "is", "are", "be",
]);

export function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOPWORDS.has(t)),
  );
}

export function thrustTokens(thrust: Pick<Thrust, "tags">): Set<string> {
  return tokenize(thrust.tags.join(" "));
}

export function interestsMatchThrust(
  interests: string[],
  thrust: Pick<Thrust, "tags">,
): boolean {
  const personTokens = tokenize(interests.join(" "));
  const tt = thrustTokens(thrust);
  for (const t of personTokens) if (tt.has(t)) return true;
  return false;
}

export function parseThrusts(text: string): Thrust[] {
  // Split on "## " at start of line; first chunk is the file preamble.
  const sections = text.split(/\n## /m).slice(1);
  const thrusts: Thrust[] = [];

  for (const raw of sections) {
    const lines = raw.split("\n");
    const headingMatch = lines[0]!.trim().match(/^(\d+)\.\s+(.+)$/);
    if (!headingMatch) continue;
    const number = Number(headingMatch[1]);
    const title = headingMatch[2]!.trim();
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const body = lines.slice(1).join("\n");

    const tagsMatch = body.match(/\*\*Tag:\*\*\s*(.+)/);
    const tags = tagsMatch
      ? tagsMatch[1]!
          .split(",")
          .map((t) => t.replace(/`/g, "").trim())
          .filter(Boolean)
      : [];

    const descLabelMatch = body.match(/\*\*Current description[^*]+\*\*/);
    const description_is_stale = /NEEDS REWRITE/i.test(descLabelMatch?.[0] ?? "");

    const descBodyMatch = body.match(
      /\*\*Current description[^*]+\*\*\s*\n([\s\S]*?)(?=\n\*\*Representative)/,
    );
    const descRaw = descBodyMatch ? descBodyMatch[1]!.trim() : "";
    const description_paragraphs = descRaw
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const pubsMatch = body.match(
      /\*\*Representative publications:\*\*\s*\n([\s\S]*?)(?=\n\*\*Figures)/,
    );
    const publications = pubsMatch
      ? pubsMatch[1]!
          .split("\n")
          .map((l) => l.replace(/^-\s*/, "").trim())
          .filter(Boolean)
      : [];

    const figMatch = body.match(
      /\*\*Figures to include:\*\*\s*([\s\S]*?)(?=\n\n|\n---|\n## |$)/,
    );
    const figures_todo = figMatch
      ? figMatch[1]!.trim().replace(/\s+/g, " ")
      : "";

    thrusts.push({
      slug,
      number,
      title,
      tags,
      description_paragraphs,
      description_is_stale,
      publications,
      figures_todo,
    });
  }

  return thrusts;
}

export async function loadThrusts(filePath: string): Promise<Thrust[]> {
  const text = await readFile(filePath, "utf-8");
  return parseThrusts(text);
}

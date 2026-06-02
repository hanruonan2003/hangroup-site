import { defineCollection, z } from "astro:content";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { parse as parseYAML } from "yaml";
import { loadPublications } from "./lib/publications.ts";
import { loadThrusts } from "./lib/research.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentDir = resolve(__dirname, "../content");

async function readYAML<T = unknown>(relPath: string): Promise<T> {
  const text = await readFile(resolve(contentDir, relPath), "utf-8");
  return parseYAML(text) as T;
}

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

const ROLE_LABELS = {
  phd_students: "PhD student",
  postdocs: "Postdoc",
  masters_students: "M.Eng student",
  undergrad_students: "Undergraduate",
} as const;

type RoleGroup = keyof typeof ROLE_LABELS;

// Note: the people loader intentionally does NOT load personal-publication
// .bib files (content/people/<slug>.bib). Those are read on demand by the
// profile page via src/lib/personal-pubs.ts so that the dedup helper has
// access to the parsed group publications collection. See CLAUDE.md
// (section "Per-person personal publications") for the editorial rule.
const people = defineCollection({
  loader: async () => {
    const data = await readYAML<Record<RoleGroup, unknown[]>>(
      "people/current.yml",
    );
    const entries: Array<Record<string, unknown>> = [];
    for (const group of Object.keys(ROLE_LABELS) as RoleGroup[]) {
      const list = data[group] ?? [];
      for (const person of list as Record<string, unknown>[]) {
        entries.push({
          id: String(person.slug),
          ...person,
          role: ROLE_LABELS[group],
          role_group: group,
        });
      }
    }
    return entries;
  },
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    email: z.string().email().optional(),
    photo: z.string(),
    interests: z.array(z.string()).default([]),
    awards: z.array(z.string()).optional(),
    bio: z.string(),
    // Optional outbound profile links. All four are independently optional;
    // a person can set any subset.
    links: z
      .object({
        website: z.string().url().optional(),
        scholar: z.string().url().optional(),
        orcid: z.string().url().optional(),
        linkedin: z.string().url().optional(),
      })
      .optional(),
    role: z.enum(["PhD student", "M.Eng student", "Postdoc", "Undergraduate"]),
    role_group: z.enum([
      "phd_students",
      "masters_students",
      "postdocs",
      "undergrad_students",
    ]),
  }),
});

const alumni = defineCollection({
  loader: async () => {
    const data = await readYAML<{ alumni?: Record<string, unknown>[] }>(
      "people/alumni.yml",
    );
    return (data.alumni ?? []).map((a) => ({
      id: String(a.slug),
      ...a,
    }));
  },
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    degree: z.string().default(""),
    category: z
      .enum(["phd", "postdoc", "meng", "ms", "visiting", "urop"])
      .default("phd"),
    period: z.string().default(""), // e.g. "09/2017–05/2022"
    year_graduated: z.number().int().nullable().optional(),
    research: z.string().default(""),
    current_position: z.string().default(""),
    current_org: z.string().default(""),
    placement_type: z.enum([
      "academia",
      "industry",
      "national_lab",
      "startup",
      "unknown",
    ]),
    awards: z.array(z.string()).optional(),
    photo: z.string().optional(),
  }),
});

const news = defineCollection({
  loader: async () => {
    const data = await readYAML<{ news?: Record<string, unknown>[] }>(
      "news/news.yml",
    );
    return (data.news ?? []).map((item) => ({
      id: `${String(item.date)}-${slugify(String(item.title ?? ""))}`,
      ...item,
    }));
  },
  schema: z.object({
    // Date can be YYYY, YYYY-MM, or YYYY-MM-DD — kept as string for flexibility.
    date: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/),
    title: z.string(),
    body: z.string().optional(),
    links: z
      .array(
        z.object({
          url: z.string().url(),
          label: z.string(),
        }),
      )
      .optional(),
  }),
});

const site = defineCollection({
  loader: async () => {
    const data = await readYAML<Record<string, unknown>>("site/site.yml");
    return [{ id: "site", ...data }];
  },
  schema: z.object({
    site: z.object({
      name: z.string(),
      short_name: z.string(),
      institution: z.string(),
      unit: z.string(),
      department: z.string(),
      url: z.string().url(),
      established: z.number().int(),
      tagline: z.string(),
      description: z.string(),
    }),
    pi: z.object({
      name: z.string(),
      slug: z.string(),
      title: z.string(),
      appointment: z.string(),
      email: z.string().email(),
      phone: z.string(),
      fax: z.string().optional(),
      office: z.string(),
      scholar: z.string().optional(),
      cv_url: z.string().optional(),
      bio: z.string().optional(),
    }),
    contact: z.object({
      address: z.object({
        street: z.string(),
        building: z.string(),
        city: z.string(),
        state: z.string(),
        zip: z.string(),
      }),
      admin: z.object({
        name: z.string(),
        slug: z.string().optional(),
        title: z.string(),
        email: z.string().email(),
        phone: z.string(),
      }),
    }),
    recruiting: z.object({
      status: z.enum(["open", "closed"]),
      title: z.string(),
      body: z.string(),
      apply_url: z.string().url(),
    }),
  }),
});

const publications = defineCollection({
  loader: async () => {
    const pubs = await loadPublications(
      resolve(contentDir, "publications/publications.bib"),
    );
    return pubs.map((p) => ({ id: p.key, ...p }));
  },
  schema: z.object({
    key: z.string(),
    type: z.string(),
    title: z.string(),
    authors: z.array(
      z.object({
        raw: z.string(),
        family: z.string(),
        given: z.string().optional(),
        literal: z.boolean().optional(),
      }),
    ),
    authors_display: z.string(),
    year: z.number().int(),
    month: z.number().int().min(1).max(12).optional(),
    sort_key: z.number().int(),
    venue: z.string(),
    container: z.string(),
    keywords: z.array(z.string()),
    highlight: z.boolean(),
    pdf: z.string().optional(),
    video: z.string().optional(),
    doi: z.string().optional(),
    pages: z.string().optional(),
    note: z.string().optional(),
    image: z.string().optional(),
    raw_bib: z.string(),
  }),
});

const research = defineCollection({
  loader: async () => {
    const thrusts = await loadThrusts(resolve(contentDir, "research/thrusts.md"));
    return thrusts.map((t) => ({ id: t.slug, ...t }));
  },
  schema: z.object({
    slug: z.string(),
    number: z.number().int(),
    title: z.string(),
    tags: z.array(z.string()),
    description_paragraphs: z.array(z.string()),
    description_is_stale: z.boolean(),
    publications: z.array(z.string()),
    figure: z.string().default(""),
    figures_todo: z.string(),
  }),
});

export const collections = { people, alumni, news, site, publications, research };

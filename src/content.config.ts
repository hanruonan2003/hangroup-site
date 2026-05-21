import { defineCollection, z } from "astro:content";
import { readFile, readdir } from "node:fs/promises";
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

// Load every per-alumnus profile file under content/people/alumni/*.yml.
// These hold the strict 14-field uniform schema documented in
// content/people/alumni/_schema.yaml and drive /people/alumni/<slug>/.
// The leading-underscore _schema.yaml and any non-.yml file are ignored.
async function readAlumniProfiles(): Promise<Record<string, unknown>[]> {
  const dir = resolve(contentDir, "people/alumni");
  const files = await readdir(dir).catch(() => [] as string[]);
  const yamlFiles = files.filter(
    (f) => f.endsWith(".yml") && !f.startsWith("_"),
  );
  const profiles: Record<string, unknown>[] = [];
  for (const f of yamlFiles) {
    const text = await readFile(resolve(dir, f), "utf-8");
    profiles.push(parseYAML(text) as Record<string, unknown>);
  }
  return profiles;
}

// Parse the last 4-digit year out of a years_with_group string. Handles
// both ranges ("08/2017–09/2020" → 2020) and single years ("2026" → 2026).
function deriveYearGraduated(yearsWithGroup: string): number | null {
  const matches = yearsWithGroup.match(/\d{4}/g);
  if (!matches || matches.length === 0) return null;
  return Number.parseInt(matches[matches.length - 1]!, 10);
}

// Split "Position, Organization" into [position, organization]; if no
// comma is present everything is treated as the organization. Used to
// back-fill the legacy current_position/current_org pair from the new
// uniform `destination` field on per-file alumni profiles.
function splitDestination(dest: string): { position: string; org: string } {
  if (!dest) return { position: "", org: "" };
  const idx = dest.indexOf(",");
  if (idx === -1) return { position: "", org: dest };
  return {
    position: dest.slice(0, idx).trim(),
    org: dest.slice(idx + 1).trim(),
  };
}

const ROLE_FROM_CATEGORY: Record<string, string> = {
  phd: "PhD",
  postdoc: "Postdoc",
  meng: "M.Eng.",
  ms: "M.S.",
  visiting: "Visiting",
  urop: "UROP",
};

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

// The alumni collection is the union of two sources:
//
//   1) content/people/alumni.yml — the lightweight roster for non-
//      PhD/Postdoc alumni (M.Eng, M.S., visiting, UROP). These entries
//      drive the alumni grid on /people/ only — they do NOT get a
//      personal profile page.
//
//   2) content/people/alumni/<slug>.yml — one file per PhD/Postdoc
//      alumnus, holding the strict 14-field uniform schema documented
//      in content/people/alumni/_schema.yaml. These DO get a profile
//      page at /people/alumni/<slug>/.
//
// The loader normalizes both shapes into a single output record so the
// alumni grid (which keys on category, year_graduated, current_org,
// placement_type, photo) keeps working unchanged. Per-file entries
// also carry the profile-specific fields (name_variants, co_advisor,
// thesis_title, etc.) plus has_profile=true, which is what
// /people/alumni/[slug].astro and the name-link logic on /people/
// branch on.
const alumni = defineCollection({
  loader: async () => {
    const yml = await readYAML<{ alumni?: Record<string, unknown>[] }>(
      "people/alumni.yml",
    );
    const legacy = (yml.alumni ?? []).map((a) => {
      const cp = String(a.current_position ?? "");
      const co = String(a.current_org ?? "");
      const destination = [cp, co].filter(Boolean).join(", ");
      const cat = String(a.category ?? "phd");
      return {
        id: String(a.slug),
        ...a,
        destination,
        role: ROLE_FROM_CATEGORY[cat] ?? "",
        name_variants: [] as string[],
        years_with_group: String(a.period ?? ""),
        education_before_mit: [] as string[],
        co_advisor: "",
        thesis_title: "",
        research_summary: "",
        notes: "",
        has_profile: false,
      };
    });

    const profiles = await readAlumniProfiles();
    const profileEntries = profiles.map((p) => {
      const role = String(p.role ?? "");
      const category = role.toLowerCase(); // "PhD" → "phd", "Postdoc" → "postdoc"
      const destination = String(p.destination ?? "");
      const { position, org } = splitDestination(destination);
      const yearsWithGroup = String(p.years_with_group ?? "");
      return {
        id: String(p.slug),
        slug: String(p.slug),
        name: String(p.name),
        name_variants: (p.name_variants as string[] | undefined) ?? [],
        role,
        photo: p.photo ? String(p.photo) : undefined,
        years_with_group: yearsWithGroup,
        education_before_mit:
          (p.education_before_mit as string[] | undefined) ?? [],
        co_advisor: String(p.co_advisor ?? ""),
        destination,
        thesis_title: String(p.thesis_title ?? ""),
        research_summary: String(p.research_summary ?? ""),
        awards: (p.awards as string[] | undefined) ?? [],
        placement_type: String(p.placement_type ?? "industry"),
        notes: String(p.notes ?? ""),
        // Back-fill legacy fields so the alumni grid on /people/ keeps
        // working without conditional logic.
        category,
        degree: role,
        period: yearsWithGroup,
        year_graduated: deriveYearGraduated(yearsWithGroup),
        current_position: position,
        current_org: org,
        research: "",
        has_profile: true,
      };
    });

    return [...legacy, ...profileEntries];
  },
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    degree: z.string().default(""),
    category: z
      .enum(["phd", "postdoc", "meng", "ms", "visiting", "urop"])
      .default("phd"),
    period: z.string().default(""),
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
    // Fields below are populated for per-file PhD/Postdoc profile
    // entries; for legacy alumni.yml entries they're empty/defaults.
    name_variants: z.array(z.string()).default([]),
    role: z.string().default(""),
    years_with_group: z.string().default(""),
    education_before_mit: z.array(z.string()).default([]),
    co_advisor: z.string().default(""),
    destination: z.string().default(""),
    thesis_title: z.string().default(""),
    research_summary: z.string().default(""),
    notes: z.string().default(""),
    has_profile: z.boolean().default(false),
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
    // /publications/ filter-row knobs.
    //   year_window: number of most-recent years to keep in the always-
    //     visible chip row. Older years (those with papers but outside the
    //     window) collapse into an "Older ▾" disclosure.
    //   featured_venues: always-visible venue chips, in YAML order. Their
    //     paper count is irrelevant — they appear as credential signals.
    //   featured_venues_threshold: the auto-include cutoff for the top
    //     venue row (venues not in featured_venues but with ≥ this many
    //     papers in the current bib still surface to the top row).
    publications: z
      .object({
        year_window: z.number().int().min(1).default(10),
        featured_venues: z.array(z.string()).default([]),
        featured_venues_threshold: z.number().int().min(1).default(3),
      })
      .default({}),
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

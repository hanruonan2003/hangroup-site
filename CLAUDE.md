# CLAUDE.md

Project conventions and editorial rules for the MIT Terahertz Integrated
Electronics Group site. Read these before editing content.

## Per-person personal publications

Each group member may optionally have a personal BibTeX file at
`content/people/<slug>.bib` containing papers they authored WITHOUT R. Han
(pre-MIT work, independent collaborations, etc.). These render in an
"Other publications" section on the person's profile page only.

Rules:

- Personal `.bib` files MUST NOT be merged into
  `content/publications/publications.bib`. The group bib is canonical and
  drives /publications/, the home-page selected-work grid, and the
  per-thrust pub lists on /research/. Personal entries do not appear in any
  of those.
- The build automatically deduplicates personal entries against the group
  bib using title + year + author-overlap matching. A student accidentally
  pasting a group paper into their personal bib will see it silently
  suppressed at build time, with a console warning of the form:

      [personal-pubs] Suppressed duplicate in <slug>.bib: "<title>" (<year>)
        — already in group publications.bib as <cite_key>

  Set `PERSONAL_PUBS_STRICT=1` in the environment to promote those warnings
  into hard build errors (useful in CI to enforce a clean split).
- The match rule lives in `src/lib/personal-pubs.ts`. Two entries count as
  the same paper when normalized titles match, years match, AND author
  lists overlap meaningfully (same first-author surname OR ≥3 shared
  surnames). This catches accidental duplicates while letting genuine
  conference vs. journal pairs with distinct titles coexist.
- The `keywords` and `highlight` fields on personal entries are ignored:
  personal pubs don't get topic chips on the group page or highlight
  badges anywhere.
- When a person leaves the group:
  - **PhD or Postdoc** → create
    `content/people/alumni/<slug>.yml` following the strict 14-field
    uniform schema documented in
    `content/people/alumni/_schema.yaml`, and delete their entry from
    `content/people/current.yml`. The per-file record drives both the
    alumni grid on `/people/` (their name becomes clickable) and the
    profile page at `/people/alumni/<slug>/`. Move the photo from
    `content/people/photos/` to `content/people/photos/alumni/`. Keep
    their personal `.bib` (`content/people/<slug>.bib`) so their
    "Other publications" section survives. Keep their group
    publications in `publications.bib` untouched.
  - **M.Eng, M.S., visiting, UROP** → add a lightweight entry to
    `content/people/alumni.yml` (the existing roster format) and
    delete from `current.yml`. No profile page is generated.

When the user asks "add this paper to <person>'s page": **ask explicitly
whether R. Han is a co-author.**

- If yes → goes in `content/publications/publications.bib` (group bib).
  May then auto-appear on the person's profile page via the existing
  author-name filter.
- If no → goes in `content/people/<slug>.bib` (personal bib).

Never assume. The cost of asking is one short message. The cost of
contamination is a polluted group publications list.

## Alumni profile pages (PhD / Postdoc)

PhD and Postdoc alumni each get an individual profile page at
`/people/alumni/<slug>/`, driven by per-file records under
`content/people/alumni/<slug>.yml`. The strict 15-field uniform schema
is documented in `content/people/alumni/_schema.yaml`; every alumnus
file MUST carry **all** 15 fields **in the same order**, even when
empty, so the set stays greppable and easy to extend.

Rules:

- **Never fabricate**. Leave fields empty (`""` for strings, `[]` for
  lists) when the user has not provided the content. In particular,
  `thesis_title` is intentionally blank until the user supplies it;
  do not auto-fetch it from external sources.
- **Uniform field order**. Adding a new field means updating
  `_schema.yaml` AND back-filling every existing file so all entries
  still look identical. Don't let the set drift.
- **Sections hide when empty**. The profile template at
  `src/pages/people/alumni/[slug].astro` omits every section whose
  data is blank, so a sparse profile (only photo + role + destination)
  reads cleanly instead of showing empty headers.
- **Group publications auto-match** via the `name_variants` list,
  using the same `buildPrimaryAuthorSet`/`isPrimaryAuthor` matcher
  that drives current-member profile pages. List every form that
  appears in `publications.bib` (e.g. `["X. Yi", "Xiang Yi"]`). The
  matcher keys on `family-name | first-initial`, so initialed forms
  are usually sufficient.
- **`placement_type`** drives the existing chip filter on `/people/`
  (`academia | industry | national_lab | startup`). It is one of the
  14 uniform fields.
- **`year_graduated`** is derived in the loader from the last 4-digit
  year in `years_with_group` — don't store it twice.
- **Loader wiring**: the `alumni` content collection (in
  `src/content.config.ts`) reads both `content/people/alumni.yml`
  (M.Eng / M.S. / visiting / UROP roster) **and**
  `content/people/alumni/*.yml` (PhD/Postdoc profiles), normalizing
  them into one collection. Per-file entries carry `has_profile=true`,
  which is what `/people/` and `/people/alumni/[slug].astro` branch on.

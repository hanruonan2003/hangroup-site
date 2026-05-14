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
- When a person leaves the group: delete BOTH their entry in
  `content/people/current.yml` AND `content/people/<slug>.bib` together,
  and move their record into `content/people/alumni.yml`. Keep their group
  publications in `publications.bib` — only the personal `.bib` goes away.

When the user asks "add this paper to <person>'s page": **ask explicitly
whether R. Han is a co-author.**

- If yes → goes in `content/publications/publications.bib` (group bib).
  May then auto-appear on the person's profile page via the existing
  author-name filter.
- If no → goes in `content/people/<slug>.bib` (personal bib).

Never assume. The cost of asking is one short message. The cost of
contamination is a polluted group publications list.

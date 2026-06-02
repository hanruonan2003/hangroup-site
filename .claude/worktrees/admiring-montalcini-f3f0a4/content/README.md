# content/

Starter content folder for the redesigned hangroup.mit.edu site.

This was assembled by scraping the existing WordPress site (hangroup.mit.edu)
on 2026-05-11. It is INTENTIONALLY INCOMPLETE — the goal was to seed real
data so Claude Code has something to work against, not to ship a finished
content set.

## What's here

- `site/site.yml` — top-level site config (PI, contact, recruiting paragraph)
- `people/current.yml` — current PhDs, postdocs, M.Eng (with bios from the site)
- `people/alumni.yml` — graduated PhDs with placement (PARTIAL — needs your input)
- `publications/publications.bib` — BibTeX, ~25 representative papers
  (PARTIAL — full publication list lives across 3 WP pages and needs to be
  exported from your reference manager)
- `research/thrusts.md` — the four research thrusts (NEEDS REWRITING — current
  text on the site was last updated in 2019)
- `news/news.yml` — recent news items pulled from the site
- `MIGRATION_NOTES.md` — flagged gaps, inconsistencies, and questions for you

## What needs to be added by you

1. **Headshot photos** for each person → `people/photos/{slug}.jpg`
   (square, ideally consistent backdrop/crop)
2. **Chip die photos and figures** → `research/figures/`
   (high-resolution, with one-line captions)
3. **Full publications.bib** exported from Zotero/Mendeley
4. **Alumni placements** — most current placements are inferred or unknown;
   see MIGRATION_NOTES.md
5. **Updated research thrust descriptions** reflecting 2020–2026 work

## What Claude Code will do with this

Run `claude` in the repo root after this folder is in place. The first session
should scaffold an Astro site with these as data sources. Subsequent sessions
will add the photos, expand the BibTeX, and polish each page.

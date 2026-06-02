# Migration Notes

Generated 2026-05-11 from a scrape of hangroup.mit.edu. Flagging what needs
human verification before this content is published on the new site.

## Inconsistencies on the current WordPress site

- **"Pfitenmaier" vs "Pfitzenmaier"** — the name appears spelled both ways
  on the current Team page. Verify the correct spelling.
- **Empty bios** — Kathleen Brody, Ava Bowen, and Aaron Pfitzenmaier have
  empty "Read more" modals on the current site. Ava Bowen is listed in
  `site.yml` as the administrative assistant per the Contact page, not as
  a postdoc; but the Team page lists her among members. Resolve.
- **Xingcun Li** — listed on the Team page but his bio says he is at
  Tsinghua. Confirm whether he is a current visiting student, alumnus, or
  whether the listing is stale.
- **Xingyu Zou** — listed as M.Eng but her bio is brief and lacks a
  graduation year. Confirm current status.
- **Broken image link** in the Research page: `uploads2017/01/Test_Structures.png`
  is missing a slash, so it 404s. Re-link or remove.
- **Research page modified-time** still reads 2019-06-20. The four thrusts
  are still right but the project listings stop around 2019. Update.

## Data this scrape could not recover

- **Alumni placements** — current positions of graduated PhDs are largely
  unknown to me. This is the single most valuable recruiting signal on
  the new site, so it's worth gathering systematically. Suggested format
  per alum: `Name → Current title, Current organization (PhD year)`.
- **Year of graduation** for each PhD alum.
- **Full publication list** — only ~25 representative papers are in the
  starter BibTeX. The current site splits these across three pages
  (Journal Papers, Conference Papers, Patents & Talks). Easier path:
  export from Zotero/Mendeley if you have one.
- **Headshot photos** — currently served from the WordPress media library
  with low-quality compression. New site should use higher-resolution
  square crops, ideally re-shot with consistent backdrop/lighting.
- **Chip die photos and field plots** — the visual centerpieces of the
  homepage and research pages. Several are referenced in the carousel
  but I don't have the source files. These will need to be supplied
  directly.

## Suggested next steps before running `claude` on this content

1. **Audit `people/current.yml`** against your real current roster. The
   names came from the Team page snapshot but membership may have
   shifted since.
2. **Fill in `people/alumni.yml`** placements. Even partial is fine —
   the build will gracefully handle empty `current_position` fields.
3. **Export real BibTeX** to replace `publications/publications.bib` if
   you have a reference manager. Otherwise the seed file is fine to
   start with and Claude Code can expand it iteratively.
4. **Drop headshot photos** into `people/photos/<slug>.jpg` matching
   the slugs in current.yml and alumni.yml.
5. **Drop chip photos and figures** into `research/figures/` with
   descriptive filenames (e.g. `265ghz-reflectarray-die.jpg`).
6. **Rewrite the four research thrust descriptions** in
   `research/thrusts.md` to reflect 2020–2026 work. The 2019 text in
   place now is a placeholder.

After those six steps the content folder will be in good enough shape
that Claude Code can scaffold a complete site against it.

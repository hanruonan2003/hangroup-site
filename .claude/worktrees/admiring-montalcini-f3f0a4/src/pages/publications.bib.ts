// The bib file is inlined into the bundle at build time via Vite's `?raw`
// import — works in both `astro dev` (reads from disk) and `astro build`
// (embedded as a string), with no runtime fs lookup.
// @ts-expect-error Vite suffix imports aren't typed by default.
import bibSource from "../../content/publications/publications.bib?raw";

export const GET = (): Response =>
  new Response(bibSource as string, {
    headers: {
      "Content-Type": "application/x-bibtex; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="hangroup-publications.bib"',
    },
  });

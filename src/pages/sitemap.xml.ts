import type { APIContext } from "astro";
import { getCollection } from "astro:content";

export async function GET(context: APIContext): Promise<Response> {
  const site = context.site;
  if (!site) {
    throw new Error("Astro.site is not configured; cannot build sitemap");
  }

  const people = await getCollection("people");

  const paths: string[] = [
    "/",
    "/research/",
    "/people/",
    "/people/ruonan-han/",
    ...people.map((p) => `/people/${p.data.slug}/`),
    "/publications/",
    "/news/",
    "/teaching/",
    "/contact/",
  ];

  // Include the configured base path so sitemap entries stay correct under
  // both a root deploy (current setup at hangroup.mit.edu) and a future
  // sub-path deploy.
  const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");
  const urls = paths
    .map((p) => `  <url><loc>${new URL(BASE + p, site).toString()}</loc></url>`)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

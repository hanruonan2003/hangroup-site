// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // Used to build canonical URLs, OG og:url tags, and sitemap.xml entries.
  // Update this if the site moves off hangroup.mit.edu.
  site: 'https://hangroup.mit.edu',
  trailingSlash: 'always',
});

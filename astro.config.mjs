// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // Served from the apex of the custom domain via GitHub Pages.
  // The CNAME file in public/ pins the custom-domain attachment so it
  // survives re-deploys even if the Pages settings UI is reset.
  site: 'https://hangroup.mit.edu',
  trailingSlash: 'always',
});

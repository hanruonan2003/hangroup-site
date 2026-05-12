// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // Staging on GitHub Pages at https://hanruonan2003.github.io/hangroup-site/.
  // Switch site to 'https://hangroup.mit.edu' and base to '/' when this moves
  // to the production host.
  site: 'https://hanruonan2003.github.io',
  base: '/hangroup-site',
  trailingSlash: 'always',
});

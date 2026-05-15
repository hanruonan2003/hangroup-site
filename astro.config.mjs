// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // Hosted on MIT GitHub Enterprise Pages at
  // https://pages.github.mit.edu/ruonan/hangroup-site/. Switch site to
  // 'https://hangroup.mit.edu' and base to '/' when this moves to the
  // production host.
  site: 'https://pages.github.mit.edu',
  base: '/ruonan/hangroup-site',
  trailingSlash: 'always',
});

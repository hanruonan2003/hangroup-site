// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // Hosted on MIT GitHub Enterprise Pages at
  // https://github.mit.edu/pages/ruonan/hangroup-site/. Switch site to
  // 'https://hangroup.mit.edu' and base to '/' when this moves to the
  // production host.
  site: 'https://github.mit.edu',
  base: '/pages/ruonan/hangroup-site',
  trailingSlash: 'always',
});

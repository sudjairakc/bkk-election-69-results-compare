// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages project site: https://sudjairakc.github.io/bkk-election-69-results-compare/
export default defineConfig({
  site: 'https://sudjairakc.github.io',
  base: '/bkk-election-69-results-compare',
  // static output (default) — produces dist/ for GitHub Pages
  integrations: [sitemap()],
});

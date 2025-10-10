// @ts-check
// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx(), sitemap(), react(), tailwind()],
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  i18n: {
    defaultLocale: 'sr',
    locales: ['sr', 'en'],
    routing: {
      prefixDefaultLocale: false, // Serbian URLs won't have /sr/ prefix
      redirectToDefaultLocale: true, // Redirect /sr/* to /*
    },
    fallback: {
      en: 'sr' // If English content missing, fallback to Serbian
    }
  },
  vite: {
    plugins: [tailwind()]
  }
});
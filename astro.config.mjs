// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'

// https://astro.build/config
// Mostly static, with a couple of on-demand routes (e.g. /api/reviews) that
// run on Vercel Functions. Static pages keep their CDN cache benefits.
export default defineConfig({
  site: 'https://recolaborativo.com.br',
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: false },
  }),
  integrations: [sitemap()],
  vite: {
    css: { devSourcemap: true },
  },
})

// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
  site: 'https://recolaborativo.com.br',
  integrations: [sitemap()],
  vite: {
    css: { devSourcemap: true },
  },
})

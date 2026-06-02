import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const events = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/events' }),
  schema: z.object({
    year: z.number(),
    label: z.string(),
    description: z.string().optional(),
    stat: z.object({ value: z.number(), label: z.string() }).optional(),
    when: z.enum(['past', 'now', 'future']),
    image: z.string().optional(),
    order: z.number().optional(),
  }),
})

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    pillar: z.enum(['negocios', 'estrategia', 'comunidade', 'eventos', 'mentalidade', 'empreendedorismo']),
    publishedAt: z.coerce.date(),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    author: z.string().default('REC'),
  }),
})

// Partners — criados pela página interna /cadastro-empresas (a partir do Google Form).
// Schema mirrors the static partners.ts shape so they can be merged at render time.
const partners = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/partners' }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    instagram: z.string().optional(),
    sector: z.enum([
      'beleza', 'saude', 'educacao', 'gastronomia', 'contabilidade', 'advocacia',
      'marketing', 'tech', 'consultoria', 'arquitetura', 'eventos', 'moda',
      'imoveis', 'turismo', 'servicos', 'outro',
    ]),
    logo: z.string(),
    description: z.string().optional(),
    reach: z.coerce.number().int().min(1).max(5).default(3),
    whatsapp: z.string().optional(),
    city: z.string().optional(),
    website: z.string().optional(),
    hideGoogle: z.boolean().optional(),
  }),
})

export const collections = { events, blog, partners }

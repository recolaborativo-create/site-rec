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
    pillar: z.enum(['negocios', 'estrategia', 'comunidade', 'eventos', 'mentalidade']),
    publishedAt: z.coerce.date(),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    author: z.string().default('REC'),
  }),
})

export const collections = { events, blog }

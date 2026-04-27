import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'

export async function GET(context: APIContext) {
  const posts = await getCollection('blog')
  return rss({
    title: 'REC - blog',
    description: 'Pensamento sem a pressa do feed',
    site: context.site!.toString(),
    items: posts.map(p => ({
      title: p.data.title,
      pubDate: p.data.publishedAt,
      description: p.data.excerpt,
      link: `/blog/${p.id}/`,
    })),
  })
}

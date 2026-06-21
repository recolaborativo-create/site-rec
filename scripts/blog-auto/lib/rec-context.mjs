// Contexto extra pro prompt da IA:
//  1) Títulos já publicados → evita repetir tema (anti-repetição)
//  2) Próximos eventos reais do REC (Notion) → posts podem ancorar na agenda real
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BLOG_DIR = join(__dirname, '..', '..', '..', 'src', 'content', 'blog')
const NOTION_DB = 'd9fb8577-bf00-427b-a662-79f9ab8fca86'

/** Títulos dos posts .md já publicados (lê o `title:` do frontmatter). */
function publishedTitles() {
  let files = []
  try {
    files = readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))
  } catch {
    return []
  }
  const titles = []
  for (const f of files) {
    try {
      const txt = readFileSync(join(BLOG_DIR, f), 'utf8')
      const m = txt.match(/^title:\s*["']?(.+?)["']?\s*$/m)
      if (m) titles.push(m[1].trim())
    } catch {}
  }
  return titles
}

/** Próximos eventos do REC via Notion (mesma base usada no site). */
async function upcomingEvents() {
  const token = process.env.NOTION_TOKEN
  if (!token) return []
  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: { property: 'Status', select: { does_not_equal: 'encerrado' } },
        sorts: [{ property: 'Data', direction: 'ascending' }],
        page_size: 6,
      }),
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.results ?? []).map(pg => {
      const p = pg.properties
      return {
        name: p['Nome do Evento']?.title?.[0]?.plain_text ?? '',
        city: p['Cidade / Local']?.rich_text?.[0]?.plain_text ?? '',
        date: p['Data']?.date?.start ?? '',
      }
    }).filter(e => e.name)
  } catch {
    return []
  }
}

/**
 * Monta o bloco de contexto REC pra injetar no prompt.
 * Retorna markdown (ou string vazia se nada disponível).
 */
export async function gatherRecContext() {
  const [titles, events] = await Promise.all([
    Promise.resolve(publishedTitles()),
    upcomingEvents(),
  ])

  const parts = []

  if (events.length) {
    const list = events
      .map(e => `- ${e.name}${e.city ? ` — ${e.city}` : ''}${e.date ? ` (${e.date})` : ''}`)
      .join('\n')
    parts.push(
      `### Próximos eventos REAIS do REC (use quando fizer sentido, principalmente nos posts de comunidade/eventos)\n${list}`
    )
  }

  if (titles.length) {
    const list = titles.slice(-40).map(t => `- ${t}`).join('\n')
    parts.push(
      `### Temas JÁ publicados no blog (NÃO repita estes ângulos — traga assuntos ou abordagens novas)\n${list}`
    )
  }

  return parts.join('\n\n')
}

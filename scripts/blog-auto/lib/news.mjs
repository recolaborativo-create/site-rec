// Busca de notícias do mês passado pra inspirar a IA.
// Usa Brave Search API (2000 queries/mês free). Fallback pra lista temática genérica.
//
// Get key: https://brave.com/search/api/

const BRAVE_KEY = process.env.BRAVE_SEARCH_KEY

// Tópicos base que sempre rendem matéria boa pro REC, usados se sem busca externa.
const EVERGREEN_TOPICS = [
  'Como pequenos negócios estão usando IA generativa em 2026',
  'Networking presencial volta a crescer no Brasil',
  'Mudanças recentes no algoritmo do Instagram',
  'Empreendedoras brasileiras em destaque na imprensa nacional',
  'Tendências de marketing digital para PMEs',
  'Como precificar serviços sem perder cliente',
  'Vendas por WhatsApp Business: o que está funcionando',
  'Estratégias de retenção de clientes em economia apertada',
  'Histórias de empreendedores do interior do Brasil que viraram referência',
]

const QUERIES = [
  'mudanças instagram meta empresas brasil',
  'google ads novidade pequena empresa 2026',
  'empreendedora brasileira destaque',
  'startup brasileira crescimento',
  'networking empresarial brasil tendência',
  'IA pequena empresa case real brasil',
]

async function searchBrave(query, freshness = 'pw') {
  // freshness=pw → past week. Outras: pd (day), pm (month), py (year)
  if (!BRAVE_KEY) return []

  try {
    const url = new URL('https://api.search.brave.com/res/v1/web/search')
    url.searchParams.set('q', query)
    url.searchParams.set('count', '5')
    url.searchParams.set('freshness', freshness)
    url.searchParams.set('country', 'BR')
    url.searchParams.set('search_lang', 'pt')

    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'X-Subscription-Token': BRAVE_KEY,
      },
    })

    if (!res.ok) {
      console.warn(`[brave] HTTP ${res.status} para "${query}"`)
      return []
    }

    const data = await res.json()
    return (data?.web?.results ?? []).map(r => ({
      title: r.title,
      description: r.description,
      url: r.url,
    }))
  } catch (err) {
    console.warn(`[brave] erro em "${query}":`, err.message)
    return []
  }
}

/**
 * Coleta inspirações de notícias do mês passado.
 * Retorna texto markdown pra injetar no prompt da IA.
 */
export async function gatherNewsContext() {
  if (!BRAVE_KEY) {
    console.log('[news] sem BRAVE_SEARCH_KEY — usando tópicos evergreen.')
    return EVERGREEN_TOPICS.map((t, i) => `${i + 1}. ${t}`).join('\n')
  }

  console.log(`[news] buscando ${QUERIES.length} queries no Brave...`)
  const all = []
  for (const q of QUERIES) {
    const results = await searchBrave(q, 'pm') // past month
    if (results.length) all.push({ query: q, results })
    // Educado: Brave pede no máximo 1 req/sec no plano free
    await new Promise(r => setTimeout(r, 1100))
  }

  if (all.length === 0) {
    console.warn('[news] nenhum resultado real — fallback evergreen.')
    return EVERGREEN_TOPICS.map((t, i) => `${i + 1}. ${t}`).join('\n')
  }

  return all
    .map(({ query, results }) => {
      const block = results
        .slice(0, 3)
        .map(r => `- ${r.title} — ${r.description?.slice(0, 200) ?? ''}`)
        .join('\n')
      return `### Busca: "${query}"\n${block}`
    })
    .join('\n\n')
}

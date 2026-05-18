// =============================================================
// EVENTOS REC — lidos do Notion em tempo real
// Notion Database ID: 04db9462-e005-47cc-8487-ce2124449caa
// =============================================================

export interface RecEvent {
  id: string
  name: string
  type: 'rodada de negócios' | 'workshop' | 'encontro' | 'summit' | 'imersão' | 'happy hour'
  city: string
  date: string
  time: string
  description: string
  status: 'proximo' | 'inscricoes' | 'encerrado'
  featured?: boolean
}

const NOTION_DATABASE_ID = '36278c6a-4c30-81b9-8d77-fb56266a16e2'
const NOTION_VERSION     = '2022-06-28'

// ── Fallback (usado se Notion offline ou token ausente) ──────
const EVENTS_FALLBACK: RecEvent[] = [
  {
    id: 'workshop-redes-mai-2026',
    name: 'Workshop Redes Sociais + Faturamento',
    type: 'workshop',
    city: 'Canoas, RS',
    date: '2026-05-25',
    time: '19h',
    description: 'Inscrições abertas, vagas limitadas para empreendedores(as). Aprenda a transformar presença digital em faturamento real.',
    status: 'inscricoes',
    featured: true,
  },
  {
    id: 'hh-canoas-mai-2026',
    name: 'Happy Hour de Negócios',
    type: 'happy hour',
    city: 'Canoas, RS',
    date: '2026-05-26',
    time: '19h',
    description: 'Encontro segmentado para empreendedores(as) que querem ampliar conexões e gerar oportunidades de negócio.',
    status: 'inscricoes',
  },
  {
    id: 'hh-pa-sul-jun-2026',
    name: 'Happy Hour de Negócios',
    type: 'happy hour',
    city: 'Porto Alegre Zona Sul, RS',
    date: '2026-06-09',
    time: '19h',
    description: 'Encontro segmentado para empreendedores(as) que querem ampliar conexões e gerar oportunidades de negócio.',
    status: 'inscricoes',
  },
  {
    id: 'hh-pa-norte-jun-2026',
    name: 'Happy Hour de Negócios',
    type: 'happy hour',
    city: 'Porto Alegre Zona Norte, RS',
    date: '2026-06-16',
    time: '19h',
    description: 'Encontro segmentado para empreendedores(as) que querem ampliar conexões e gerar oportunidades de negócio.',
    status: 'inscricoes',
  },
]

// ── Busca via Notion REST API (sem SDK) ──────────────────────
async function fetchFromNotion(): Promise<RecEvent[]> {
  const token = import.meta.env.NOTION_TOKEN
  if (!token) {
    console.warn('[Notion] NOTION_TOKEN não configurado — usando fallback.')
    return EVENTS_FALLBACK
  }

  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            property: 'Status',
            select: { does_not_equal: 'encerrado' },
          },
          sorts: [
            { property: 'Destaque no Site', direction: 'descending' },
            { property: 'Data',             direction: 'ascending'  },
          ],
        }),
      }
    )

    if (!res.ok) {
      console.error('[Notion] Resposta inesperada:', res.status, await res.text())
      return EVENTS_FALLBACK
    }

    const data = await res.json()

    const statusMap: Record<string, RecEvent['status']> = {
      'inscricoes abertas': 'inscricoes',
      'em breve':           'proximo',
      'encerrado':          'encerrado',
    }

    return (data.results ?? []).map((page: any) => {
      const p = page.properties
      return {
        id:          page.id,
        name:        p['Nome do Evento']?.title?.[0]?.plain_text        ?? '',
        type:        (p['Tipo']?.select?.name ?? 'encontro')             as RecEvent['type'],
        city:        p['Cidade / Local']?.rich_text?.[0]?.plain_text    ?? '',
        date:        p['Data']?.date?.start                             ?? '',
        time:        p['Horário']?.rich_text?.[0]?.plain_text           ?? '',
        description: p['Descrição']?.rich_text?.[0]?.plain_text         ?? '',
        status:      statusMap[p['Status']?.select?.name ?? '']         ?? 'proximo',
        featured:    p['Destaque no Site']?.checkbox                    ?? false,
      } satisfies RecEvent
    })
  } catch (err) {
    console.error('[Notion] Erro de conexão:', err)
    return EVENTS_FALLBACK
  }
}

export const events: RecEvent[] = await fetchFromNotion()

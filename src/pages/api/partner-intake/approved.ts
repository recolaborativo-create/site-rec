import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { isModAuthorized, unauthorizedResponse, json } from '../../../utils/mod-auth'
import { loadAllPartners } from '../../../data/partners-merged'

export const prerender = false

// GET /api/partner-intake/approved → empresas que já estão no site (constelação).
// source: 'cms' (arquivo JSON, removível por completo) | 'static' (partners.ts, só oculta).
export const GET: APIRoute = async ({ request }) => {
  if (!isModAuthorized(request)) return unauthorizedResponse()

  const cmsIds = new Set((await getCollection('partners')).map((e) => e.data.id))
  const all = await loadAllPartners()
  const approved = all
    .map((p) => ({
      id: p.id,
      name: p.name,
      logo: p.logo,
      sector: p.sector,
      instagram: p.instagram || '',
      source: cmsIds.has(p.id) ? 'cms' : 'static',
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  return json({ approved, count: approved.length })
}

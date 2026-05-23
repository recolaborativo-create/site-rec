import type { APIRoute } from 'astro'
import { loadAllPartners } from '../../data/partners-merged'

export const prerender = false

// Retorna mapa { id → name } — usado pela página de moderação pra exibir
// nome legível da empresa em vez do ID técnico.
// Info pública (nomes das empresas), sem dados sensíveis.

export const GET: APIRoute = async () => {
  const partners = await loadAllPartners()
  const map: Record<string, string> = {}
  for (const p of partners) map[p.id] = p.name
  return new Response(JSON.stringify(map), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
  })
}

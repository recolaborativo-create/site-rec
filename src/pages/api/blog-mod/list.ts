import type { APIRoute } from 'astro'
import { isModAuthorized, unauthorizedResponse } from '../../../utils/mod-auth'
import { getSupabaseAdmin } from '../../../utils/supabase-admin'
import { isValidBatch } from '../../../utils/blog-batch'

export const prerender = false

// GET /api/blog-mod/list?batchMonth=2026-05-31
// Retorna todos os drafts do batch ordenados por position.
export const GET: APIRoute = async ({ request, url }) => {
  if (!isModAuthorized(request)) return unauthorizedResponse()

  const batchMonth = url.searchParams.get('batchMonth')
  if (!isValidBatch(batchMonth)) {
    return json({ error: 'batchMonth obrigatório no formato YYYY-MM-DD' }, 400)
  }

  const supa = getSupabaseAdmin()
  const { data, error } = await supa
    .from('blog_drafts')
    .select('*')
    .eq('batch_month', batchMonth)
    .order('position', { ascending: true })

  if (error) return json({ error: error.message }, 500)

  return json({ drafts: data ?? [] })
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

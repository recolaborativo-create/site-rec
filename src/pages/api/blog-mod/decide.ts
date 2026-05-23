import type { APIRoute } from 'astro'
import { isModAuthorized, unauthorizedResponse } from '../../../utils/mod-auth'
import { getSupabaseAdmin } from '../../../utils/supabase-admin'

export const prerender = false

// POST /api/blog-mod/decide
// Body: { id, decision: 'approved' | 'rejected' }
// Marca um draft como aprovado ou rejeitado. Não publica ainda — pra isso o
// usuário precisa clicar em "publicar aprovados" (rota /publish).
export const POST: APIRoute = async ({ request }) => {
  if (!isModAuthorized(request)) return unauthorizedResponse()

  let body: any
  try { body = await request.json() } catch { return json({ error: 'JSON inválido' }, 400) }

  const { id, decision } = body
  if (!id) return json({ error: 'id obrigatório' }, 400)
  if (!['approved', 'rejected', 'pending'].includes(decision)) {
    return json({ error: 'decision deve ser approved, rejected ou pending' }, 400)
  }

  const supa = getSupabaseAdmin()
  const { data, error } = await supa
    .from('blog_drafts')
    .update({
      status: decision,
      reviewed_at: decision === 'pending' ? null : new Date().toISOString(),
    })
    .eq('id', id)
    .neq('status', 'published') // não permite mexer no que já está no site
    .select()
    .single()

  if (error) return json({ error: error.message }, 500)
  if (!data) return json({ error: 'draft não encontrado ou já publicado' }, 404)

  return json({ ok: true, draft: data })
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

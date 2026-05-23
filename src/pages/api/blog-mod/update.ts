import type { APIRoute } from 'astro'
import { isModAuthorized, unauthorizedResponse } from '../../../utils/mod-auth'
import { getSupabaseAdmin } from '../../../utils/supabase-admin'

export const prerender = false

// PATCH /api/blog-mod/update
// Body: { id, title?, excerpt?, content?, cover_alt? }
// Edita inline um draft. Só campos textuais — não dá pra mudar status por aqui.
export const PATCH: APIRoute = async ({ request }) => {
  if (!isModAuthorized(request)) return unauthorizedResponse()

  let body: any
  try { body = await request.json() } catch { return json({ error: 'JSON inválido' }, 400) }

  const { id, title, excerpt, content, cover_alt } = body
  if (!id) return json({ error: 'id obrigatório' }, 400)

  const updates: Record<string, any> = {}
  if (typeof title === 'string') updates.title = title.slice(0, 200)
  if (typeof excerpt === 'string') updates.excerpt = excerpt.slice(0, 400)
  if (typeof content === 'string') updates.content = content.slice(0, 20000)
  if (typeof cover_alt === 'string') updates.cover_alt = cover_alt.slice(0, 200)

  if (Object.keys(updates).length === 0) {
    return json({ error: 'nada pra atualizar' }, 400)
  }

  const supa = getSupabaseAdmin()
  const { data, error } = await supa
    .from('blog_drafts')
    .update(updates)
    .eq('id', id)
    .eq('status', 'pending') // só edita pending; aprovados não podem mais ser mudados
    .select()
    .single()

  if (error) return json({ error: error.message }, 500)
  if (!data) return json({ error: 'draft não encontrado ou já decidido' }, 404)

  return json({ ok: true, draft: data })
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

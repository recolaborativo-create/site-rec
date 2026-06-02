import type { APIRoute } from 'astro'
import { isModAuthorized, unauthorizedResponse } from '../../../utils/mod-auth'
import { getSupabaseAdmin } from '../../../utils/supabase-admin'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  if (!isModAuthorized(request)) return unauthorizedResponse()
  let body: any
  try { body = await request.json() } catch { return json({ error: 'JSON inválido' }, 400) }
  if (!body.key) return json({ error: 'key obrigatória' }, 400)

  try {
    const supa = getSupabaseAdmin()
    await supa.from('partner_submissions').upsert(
      { submission_key: body.key, status: 'dismissed', partner_name: body.name || null },
      { onConflict: 'submission_key' }
    )
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
  return json({ ok: true })
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

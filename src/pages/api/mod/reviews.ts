import type { APIRoute } from 'astro'

export const prerender = false

// API de moderação de avaliações — protegida por cookie httpOnly `rec_mod`
// (setado por /moderacao quando você faz o "login" via ?s=TOKEN). NUNCA aceita
// o secret na URL ou no body por questão de log/referer/histórico.
//
// GET  /api/mod/reviews   → lista avaliações pendentes
// PATCH /api/mod/reviews  → { id, action: 'approve'|'reject' }

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL
const SERVICE_ROLE = import.meta.env.SUPABASE_SERVICE_ROLE
const MOD_SECRET   = import.meta.env.MOD_SECRET
const COOKIE_NAME  = 'rec_mod'

function authError() {
  return new Response(JSON.stringify({ error: 'não autorizado' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  })
}

function bad(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get('cookie') ?? ''
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

function isAuthorized(req: Request): boolean {
  if (!MOD_SECRET) return false
  const token = readCookie(req, COOKIE_NAME)
  return !!token && token === MOD_SECRET
}

async function adminFetch(method: string, path: string, body?: unknown) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export const GET: APIRoute = async ({ request }) => {
  if (!MOD_SECRET || !SERVICE_ROLE || !SUPABASE_URL) return bad('servidor não configurado', 503)
  if (!isAuthorized(request)) return authError()

  try {
    const res = await adminFetch(
      'GET',
      'partner_reviews?approved=eq.false&order=created_at.desc&select=id,partner_id,author_name,rating,comment,created_at,ip_hash',
    )
    const data = await res.json()
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  } catch {
    return bad('erro ao buscar avaliações', 503)
  }
}

export const PATCH: APIRoute = async ({ request }) => {
  if (!MOD_SECRET || !SERVICE_ROLE || !SUPABASE_URL) return bad('servidor não configurado', 503)
  if (!isAuthorized(request)) return authError()

  let body: any
  try { body = await request.json() } catch { return bad('payload inválido') }

  const { id, action } = body
  if (!id) return bad('id obrigatório')
  if (!['approve', 'reject'].includes(action)) return bad('action deve ser approve ou reject')

  try {
    if (action === 'approve') {
      await adminFetch('PATCH', `partner_reviews?id=eq.${id}`, {
        approved: true,
        approved_at: new Date().toISOString(),
      })
    } else {
      // reject = deleta permanentemente
      await adminFetch('DELETE', `partner_reviews?id=eq.${id}`)
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return bad('erro ao processar ação', 503)
  }
}

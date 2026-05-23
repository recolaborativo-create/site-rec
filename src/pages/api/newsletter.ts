import type { APIRoute } from 'astro'
import { checkRateLimit, extractIp, isHoneypotTripped } from '../../utils/rate-limit'

export const prerender = false

// POST /api/newsletter
// Body: { email: string, website?: string (honeypot) }
// Adiciona o contato à lista de newsletter no Brevo.
// Lista ID padrão: 2 (configurável via env BREVO_LIST_ID)
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const BREVO_API_KEY = import.meta.env.BREVO_API_KEY
  const LIST_ID = Number(import.meta.env.BREVO_LIST_ID ?? 2)

  if (!BREVO_API_KEY) {
    return new Response(JSON.stringify({ error: 'Serviço de newsletter não configurado.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Rate-limit: 5 cadastros por IP a cada 10 min — gente real tenta 1 ou 2.
  const ip = extractIp(request, clientAddress)
  const limit = checkRateLimit(ip, { max: 5, windowSec: 600, prefix: 'newsletter' })
  if (!limit.allowed) {
    return new Response(JSON.stringify({ error: 'muitas tentativas. tenta de novo em alguns minutos.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(limit.resetIn) },
    })
  }

  // Valida Content-Type
  const ct = request.headers.get('content-type') ?? ''
  let email = ''
  let bodyForHoneypot: Record<string, unknown> = {}

  if (ct.includes('application/json')) {
    const body = await request.json().catch(() => ({}))
    email = (body?.email ?? '').toString().trim()
    bodyForHoneypot = body
  } else {
    const fd = await request.formData().catch(() => new FormData())
    email = (fd.get('email') ?? '').toString().trim()
    bodyForHoneypot = { website: fd.get('website') ?? '' }
  }

  // Honeypot — silencia bots com 200 ok.
  if (isHoneypotTripped(bodyForHoneypot)) {
    console.warn('[newsletter] honeypot trip from', ip)
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Validação básica de formato de email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'E-mail inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        listIds: [LIST_ID],
        updateEnabled: true,   // atualiza se o contato já existir
        attributes: {
          SOURCE: 'blog-rec',
        },
      }),
    })

    // 201 = criado, 204 = já existe e foi atualizado
    if (res.status === 201 || res.status === 204) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Contato já existia (duplicado sem updateEnabled — não deve acontecer, mas cobre o caso)
    if (res.status === 400) {
      const data = await res.json().catch(() => ({}))
      if (data?.code === 'duplicate_parameter') {
        return new Response(JSON.stringify({ ok: true, already: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    // Erro inesperado do Brevo
    const errData = await res.json().catch(() => ({}))
    console.error('[newsletter] Brevo error:', res.status, errData)
    return new Response(JSON.stringify({ error: 'Erro ao cadastrar. Tente novamente.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[newsletter] fetch error:', err)
    return new Response(JSON.stringify({ error: 'Erro de conexão com o serviço.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

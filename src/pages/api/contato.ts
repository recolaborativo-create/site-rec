import type { APIRoute } from 'astro'
import { checkRateLimit, extractIp, isHoneypotTripped } from '../../utils/rate-limit'

export const prerender = false

// POST /api/contato
// Body: { nome: string, contato: string, mensagem: string }
//
// Envia email transacional via Brevo pro time do REC.
// Falha de forma silenciosa — o front-end já tem fallback de WhatsApp,
// então mesmo se a API não responder a experiência do usuário continua boa.

const TO_EMAIL = import.meta.env.CONTATO_TO_EMAIL ?? 'henrique@somosrecoficial.com.br'
const FROM_EMAIL = import.meta.env.CONTATO_FROM_EMAIL ?? 'site@somosrecoficial.com.br'
const FROM_NAME = 'Site REC'

function sanitize(input: unknown, maxLen: number): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen)
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>')
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const BREVO_API_KEY = import.meta.env.BREVO_API_KEY

  // Rate-limit: 3 envios por IP a cada 10 minutos. Cubra: bots e cliques duplos.
  const ip = extractIp(request, clientAddress)
  const limit = checkRateLimit(ip, { max: 3, windowSec: 600, prefix: 'contato' })
  if (!limit.allowed) {
    return new Response(JSON.stringify({ error: 'muitos envios. tenta de novo em alguns minutos.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(limit.resetIn) },
    })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'payload inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Honeypot: campo invisível que só bot preenche. Responde 200 silencioso
  // pra não revelar a detecção (bots aprendem com 4xx).
  if (isHoneypotTripped(body)) {
    console.warn('[contato] honeypot trip from', ip)
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const nome = sanitize(body?.nome, 60)
  const contato = sanitize(body?.contato, 80)
  const mensagem = sanitize(body?.mensagem, 400)

  if (!nome || !contato || !mensagem) {
    return new Response(JSON.stringify({ error: 'campos obrigatórios faltando' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Sem Brevo configurado → aceita mas só loga (modo dev local)
  if (!BREVO_API_KEY) {
    console.log('[contato] mensagem recebida (Brevo não configurado):', { nome, contato, mensagem })
    return new Response(JSON.stringify({ ok: true, logged: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Envia email transacional via Brevo
  try {
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #012659;">
        <div style="border-left: 4px solid #00A198; padding: 4px 0 4px 16px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #00A198; font-weight: 700;">novo contato pelo site</p>
          <h1 style="margin: 6px 0 0; font-size: 22px; font-weight: 300;">${escapeHtml(nome)}</h1>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #889; font-weight: 700; width: 110px;">contato</td>
            <td style="padding: 8px 0; font-size: 15px; color: #012659; font-weight: 500;">${escapeHtml(contato)}</td>
          </tr>
        </table>

        <div style="background: #fbfcfe; border: 1px solid rgba(0,161,152,0.18); border-radius: 12px; padding: 18px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #889; font-weight: 700;">mensagem</p>
          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #012659;">${escapeHtml(mensagem)}</p>
        </div>

        <p style="font-size: 12px; color: #889; margin: 0; text-align: center;">
          Recebido em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}<br>
          Responda em até 24h pra manter o ritmo da rede.
        </p>
      </div>
    `

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: TO_EMAIL }],
        replyTo: contato.includes('@') ? { email: contato, name: nome } : undefined,
        subject: `[REC site] ${nome}: ${mensagem.slice(0, 60)}${mensagem.length > 60 ? '...' : ''}`,
        htmlContent,
      }),
    })

    if (res.status === 201 || res.ok) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const errData = await res.json().catch(() => ({}))
    console.error('[contato] Brevo erro:', res.status, errData)
    return new Response(JSON.stringify({ error: 'erro ao enviar' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[contato] fetch erro:', err)
    return new Response(JSON.stringify({ error: 'erro de conexão' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

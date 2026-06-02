import type { APIRoute } from 'astro'
import { isModAuthorized, unauthorizedResponse } from '../../../utils/mod-auth'
import { getSupabaseAdmin } from '../../../utils/supabase-admin'
import { fetchSubmissions, guessSector } from '../../../utils/sheet-csv'

export const prerender = false

// slug a partir do nome: "Conte & Conect RH" -> "conte-conect-rh"
function slugify(s: string): string {
  return s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

function onlyDigits(s: string): string {
  const d = (s || '').replace(/\D/g, '')
  if (!d) return ''
  return d.startsWith('55') ? d : '55' + d
}

export const GET: APIRoute = async ({ request }) => {
  if (!isModAuthorized(request)) return unauthorizedResponse()

  const csvUrl = import.meta.env.PARTNERS_SHEET_CSV_URL
  if (!csvUrl) {
    return json({ error: 'PARTNERS_SHEET_CSV_URL não configurada nas env vars da Vercel.' }, 503)
  }

  let submissions
  try {
    submissions = await fetchSubmissions(csvUrl)
  } catch (e: any) {
    return json({ error: e.message }, 502)
  }

  // chaves já resolvidas (publicadas ou ignoradas)
  let done = new Set<string>()
  try {
    const supa = getSupabaseAdmin()
    const { data } = await supa.from('partner_submissions').select('submission_key')
    done = new Set((data || []).map((r: any) => r.submission_key))
  } catch {
    // sem supabase: mostra tudo (melhor do que falhar)
  }

  const pending = submissions
    // inscrição válida = tem algo identificável (logo, descrição, contato ou instagram)
    .filter(s => !done.has(s.key) && (s.logoRef || s.description || s.contactName || s.instagram))
    .map(s => {
      // Form não coleta nome da empresa → sugere pelo @ (sem o @), revisor ajusta
      const igHandle = s.instagram.replace(/^@/, '').trim()
      const suggestedName = s.name || igHandle
      return {
        key: s.key,
        suggestedId: slugify(suggestedName || s.contactName),
        name: suggestedName,
        contactName: s.contactName,
        segment: s.segment,
        suggestedSector: guessSector(s.segment),
        instagram: !s.instagram || s.instagram.startsWith('@') ? s.instagram : '@' + s.instagram,
        city: s.city,
        whatsapp: onlyDigits(s.whatsapp),
        website: /^https?:\/\//i.test(s.website) ? s.website : '',
        hasGoogle: s.hasGoogle,
        description: s.description,
        logoRef: s.logoRef,
        raw: s.raw,
      }
    })

  return json({ pending, count: pending.length })
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

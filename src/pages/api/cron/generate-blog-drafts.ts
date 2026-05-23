import type { APIRoute } from 'astro'

export const prerender = false

// =============================================================
// Cron Vercel: gera os 9 drafts mensais e dispara email pro Henrique.
// Schedule definido em vercel.json: "0 9 1 * *" (UTC) = 06h BR dia 1.
//
// Segurança: Vercel envia header `x-vercel-cron-signature` que valida origem.
// Adicionalmente exigimos `CRON_SECRET` no header `authorization` pra evitar
// invocação manual não autorizada.
// =============================================================

export const GET: APIRoute = async ({ request }) => {
  // Auth: Vercel Cron envia automaticamente, ou via header se for manual
  const auth = request.headers.get('authorization')
  const cronSecret = import.meta.env.CRON_SECRET
  const vercelCron = request.headers.get('x-vercel-cron-signature')

  if (!cronSecret) {
    return json({ error: 'CRON_SECRET não configurado no servidor' }, 503)
  }

  // Aceita: Vercel cron OU bearer token correto
  const isAuthorized = vercelCron || auth === `Bearer ${cronSecret}`
  if (!isAuthorized) {
    return json({ error: 'não autorizado' }, 403)
  }

  // Dynamic import pra não carregar tudo se rota for chamada errada
  const { runMonthlyGeneration } = await import('../../../../scripts/blog-auto/generate-monthly-drafts.mjs')
  const { sendDraftsReadyEmail } = await import('../../../../scripts/blog-auto/lib/email.mjs')

  try {
    const result = await runMonthlyGeneration()
    if (!result) return json({ ok: true, skipped: true })

    // Email de notificação (não bloqueia a resposta se falhar)
    sendDraftsReadyEmail(result).catch(err => {
      console.error('[cron] email falhou:', err.message)
    })

    return json({ ok: true, batchMonth: result.batchMonth, count: result.count })
  } catch (err: any) {
    console.error('[cron] geração falhou:', err)
    return json({ error: err.message }, 500)
  }
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

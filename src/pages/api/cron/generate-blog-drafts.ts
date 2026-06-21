import type { APIRoute } from 'astro'

export const prerender = false

// =============================================================
// Cron Vercel: gera os 9 drafts semanais e dispara email pro Henrique.
// Schedule definido em vercel.json: "0 18 * * 1" (UTC) = segunda 15h BR.
//
// Segurança: quando CRON_SECRET está setado, a Vercel envia automaticamente
// `Authorization: Bearer $CRON_SECRET` nos crons agendados. Validamos SÓ o secret.
// (NÃO confiar na mera presença de `x-vercel-cron-signature` — header arbitrário
// que qualquer um pode enviar → bypass + queima de ANTHROPIC_API_KEY/Brave/Unsplash.)
// =============================================================

export const GET: APIRoute = async ({ request }) => {
  const auth = request.headers.get('authorization')
  const cronSecret = import.meta.env.CRON_SECRET

  if (!cronSecret) {
    return json({ error: 'CRON_SECRET não configurado no servidor' }, 503)
  }

  if (auth !== `Bearer ${cronSecret}`) {
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

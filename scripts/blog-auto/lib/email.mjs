// Envio de email via Brevo (mesma API que a newsletter já usa).
// Notifica o Henrique quando o ciclo mensal terminou e precisa aprovar.

const BREVO_API_KEY = process.env.BREVO_API_KEY
const TO_EMAIL = process.env.BLOG_NOTIFY_EMAIL || 'henrique.callefi@gmail.com'
const FROM_EMAIL = process.env.CONTATO_FROM_EMAIL || 'site@somosrecoficial.com.br'
const SITE_URL = 'https://somosrecoficial.com.br'

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

/**
 * Manda email avisando que os 9 drafts mensais estão prontos pra revisão.
 * @param {{batchMonth:string, count:number}} result
 */
export async function sendDraftsReadyEmail({ batchMonth, count }) {
  if (!BREVO_API_KEY) {
    console.warn('[email] BREVO_API_KEY ausente — skip notificação.')
    return { skipped: true }
  }

  const [year, month] = batchMonth.split('-')
  const monthLabel = `${MONTH_NAMES[parseInt(month, 10) - 1]} de ${year}`
  const approvalUrl = `${SITE_URL}/aprovacao-blog/${batchMonth}`

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #012659;">

      <div style="border-left: 4px solid #00A198; padding: 4px 0 4px 16px; margin-bottom: 28px;">
        <p style="margin: 0; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #00A198; font-weight: 700;">
          blog mensal automático
        </p>
        <h1 style="margin: 6px 0 0; font-size: 24px; font-weight: 300; line-height: 1.2;">
          ${count} posts prontos pra você revisar
        </h1>
      </div>

      <p style="font-size: 15px; line-height: 1.6; color: #012659; margin: 0 0 16px;">
        Os ${count} artigos de <strong>${monthLabel}</strong> foram gerados automaticamente
        e estão aguardando sua aprovação no painel.
      </p>

      <p style="font-size: 15px; line-height: 1.6; color: #012659; margin: 0 0 28px;">
        Você pode editar qualquer texto direto no painel, aprovar os bons e
        rejeitar os ruins. Quando terminar, clica em <em>publicar aprovados</em>
        e eles vão pro site em alguns minutos.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${approvalUrl}" style="display: inline-block; background: #012659; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; letter-spacing: 0.05em; font-size: 14px;">
          revisar os ${count} posts →
        </a>
      </div>

      <div style="background: #fbfcfe; border: 1px solid rgba(0,161,152,0.18); border-radius: 12px; padding: 18px; margin: 24px 0;">
        <p style="margin: 0 0 8px; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #889; font-weight: 700;">
          ⏰ prazo recomendado
        </p>
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #012659;">
          Idealmente até o dia 5. Drafts não revisados em 10 dias são arquivados
          automaticamente (não publicam).
        </p>
      </div>

      <p style="font-size: 12px; color: #889; margin: 32px 0 0; text-align: center;">
        REC Colaborativo · Blog Automation<br>
        Esse email foi enviado automaticamente pelo sistema.
      </p>
    </div>
  `

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'REC Blog Auto', email: FROM_EMAIL },
        to: [{ email: TO_EMAIL }],
        subject: `📝 ${count} posts de ${monthLabel} aguardando aprovação`,
        htmlContent: html,
      }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(`Brevo HTTP ${res.status}: ${JSON.stringify(errData)}`)
    }

    console.log(`[email] notificação enviada pra ${TO_EMAIL}`)
    return { sent: true }
  } catch (err) {
    console.error('[email] falhou:', err.message)
    throw err
  }
}

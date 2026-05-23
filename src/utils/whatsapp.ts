const PHONE = '5551984632545'

export function whatsappLink(message: string): string {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`
}

/** Gera um link WhatsApp com o nome de um evento embutido na mensagem.
 *  Se a cidade for fornecida, ela é incluída para a equipe já saber o local. */
export function whatsappEventLink(eventName: string, city?: string): string {
  const where = city ? ` em ${city}` : ''
  const msg = `Olá! Vi o evento "${eventName}"${where} no site do REC e quero saber mais.`
  return whatsappLink(msg)
}

export const messages = {
  // ── HUB Digital ──────────────────────────────────────────────────────────
  hubGeneric:       'Olá! Vim pelo site - gostaria de um orçamento do HUB Digital REC.',
  hubConsultoria:   'Olá! Quero saber mais sobre a Consultoria de alta performance do REC.',
  hubEmbaixadoras:  'Olá! Vim pelo site do REC e gostaria de saber sobre o programa de embaixadoras.',

  // ── Comunidade ───────────────────────────────────────────────────────────
  comunidadeProSemestral: 'Olá! Tenho interesse no Plano Pro da comunidade do REC com adesão semestral.',
  comunidadeProAnual:     'Olá! Tenho interesse no Plano Pro da comunidade do REC com adesão anual.',

  // ── Planos ────────────────────────────────────────────────────────────────
  helpChoose: 'Olá! Quero entender qual plano combina com o meu negócio.',

  // ── Contextos por página ──────────────────────────────────────────────────

  /** Página inicial — botão "Entrar no ecossistema" */
  homeCta: 'Olá! Vim pelo site do REC e quero entrar para o ecossistema.',

  /** Página /comunidade — botão "Entrar na comunidade" */
  comunidadeJoin: 'Olá! Vim pela página da Comunidade REC e quero saber como participar.',

  /** Página /agenda — botão "quero fazer parte" na timeline */
  agendaTimeline: 'Olá! Conheço a história do REC e quero fazer parte da comunidade.',

  /** Página /agenda — CTA final da página */
  agendaFinalCta: 'Olá! Quero participar dos próximos eventos do REC.',

  /** Página /empresas */
  empresas: 'Olá! Vim pela página de Empresas do site do REC e quero saber mais.',

  /** Página /hub — seção de serviços */
  hubPage: 'Olá! Vim pela página do HUB Digital e quero saber mais sobre os serviços.',

  /** Blog */
  blog: 'Olá! Li um artigo no blog do REC e quero saber mais sobre a comunidade.',

  /** Footer — CTA geral do site */
  footer: 'Olá! Vim pelo site do REC e gostaria de mais informações.',

  /** Hero (manifesto) — botão principal da home */
  heroManifesto: 'Olá! Vi o manifesto do REC e quero conhecer a comunidade.',

} as const

export type WhatsAppMessageKey = keyof typeof messages

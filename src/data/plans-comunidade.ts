export interface ComunidadePlan {
  id: 'pro'
  name: string
  monthly: number
  semestralEquivalent: number
  bullets: string[]
  paymentMethods: string[]
  ctaKey: 'comunidadePro'
}

// Plano único Pro a partir de 2026 — alinhado com a apresentação REC-2026.
// Mensalidade R$ 109,90 em qualquer adesão. Semestral = compromisso 6 meses
// (equivalente R$ 659,40). Anual = compromisso 12 meses, acerto mensal via Pix.
export const comunidadePlan: ComunidadePlan = {
  id: 'pro',
  name: 'Plano Pro',
  monthly: 109.9,
  semestralEquivalent: 659.4,
  bullets: [
    'Visibilidade no site do REC',
    'Benefícios exclusivos da rede',
    'Protagonismo em eventos',
    'Condições especiais em eventos',
    'Consultoria em grupo trimestral',
    'Clube de desconto',
    'Engajamento digital',
    'Página de vendas dentro do nosso site',
  ],
  paymentMethods: [
    'Cartão de crédito em até 6x (consulte taxas)',
    'Assinatura mensal via Pix (apenas plano anual)',
  ],
  ctaKey: 'comunidadePro',
}

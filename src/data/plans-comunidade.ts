export type PaymentIcon = 'card' | 'pix'

export interface ComunidadeAdesao {
  id: 'semestral' | 'anual'
  label: string
  durationLabel: string
  monthly: number
  totalLabel: string
  paymentIcons: PaymentIcon[]
  paymentHighlight: string
  paymentDetail: string
  paymentBenefitNote?: string
  ctaKey: 'comunidadeProSemestral' | 'comunidadeProAnual'
  ctaLabel: string
  badge?: string
  discountFromSemestral?: number
}

export interface ComunidadeBenefit {
  icon: 'eye' | 'gift' | 'mic' | 'ticket' | 'compass' | 'tag' | 'spark' | 'store'
  title: string
  description: string
}

export interface ComunidadeStep {
  num: string
  title: string
  description: string
}

export interface ComunidadePlan {
  id: 'pro'
  name: string
  tagline: string
  adesoes: ComunidadeAdesao[]
  benefits: ComunidadeBenefit[]
  steps: ComunidadeStep[]
}

export const comunidadePlan: ComunidadePlan = {
  id: 'pro',
  name: 'Plano Pro',
  tagline: 'Pra empresas que querem fazer parte do ecossistema completo do REC.',
  adesoes: [
    {
      id: 'semestral',
      label: 'semestral',
      durationLabel: '6 meses',
      monthly: 149.9,
      totalLabel: 'R$ 899,40 em 6 meses',
      paymentIcons: ['card', 'pix'],
      paymentHighlight: 'Pague no cartão ou no Pix à vista',
      paymentDetail: 'Cartão de crédito em até 6x (taxas do cartão por conta do cliente) ou Pix à vista',
      ctaKey: 'comunidadeProSemestral',
      ctaLabel: 'quero o plano semestral',
    },
    {
      id: 'anual',
      label: 'anual',
      durationLabel: '12 meses',
      monthly: 109.9,
      totalLabel: 'R$ 1.318,80 em 12 meses',
      paymentIcons: ['pix', 'card'],
      paymentHighlight: 'Pague no Pix ou no cartão',
      paymentDetail: 'Pix mensal recorrente ou cartão em até 12x',
      ctaKey: 'comunidadeProAnual',
      ctaLabel: 'quero o plano anual',
      badge: '27% off',
      discountFromSemestral: 27,
    },
  ],
  benefits: [
    {
      icon: 'eye',
      title: 'Visibilidade que vira oportunidade',
      description:
        'Sua empresa aparece no site do REC e na vitrine de associadas. Toda a rede vê.',
    },
    {
      icon: 'mic',
      title: 'Protagonismo nos eventos',
      description:
        'Você não só participa: apresenta. Espaço de fala e momentos de pitch nos encontros.',
    },
    {
      icon: 'ticket',
      title: 'Condições especiais em eventos',
      description:
        'Valores reduzidos ou cortesia em eventos pagos, com prioridade nas inscrições.',
    },
    {
      icon: 'compass',
      title: 'Consultoria em grupo trimestral',
      description:
        'Encontros de estratégia a cada três meses com curadoria temática da rede.',
    },
    {
      icon: 'tag',
      title: 'Clube de desconto',
      description:
        'Fornecedores e serviços parceiros com condições especiais exclusivas.',
    },
    {
      icon: 'spark',
      title: 'Engajamento digital',
      description:
        'Sua marca compartilhada nas redes do REC, com indicações cruzadas entre membras.',
    },
    {
      icon: 'store',
      title: 'Página de vendas no site',
      description:
        'Espaço próprio dentro do site do REC pra mostrar o que você faz e captar leads.',
    },
    {
      icon: 'gift',
      title: 'Benefícios exclusivos',
      description:
        'Acesso a sorteios, prêmios e oportunidades que só circulam entre quem está dentro.',
    },
  ],
  steps: [
    {
      num: '01',
      title: 'Você escolhe a adesão',
      description: 'Semestral ou anual. Decide pelo WhatsApp direto com a equipe.',
    },
    {
      num: '02',
      title: 'Recebe o onboarding',
      description: 'Formulário rápido já no seu WhatsApp pra te preparar pra primeira aparição na rede.',
    },
    {
      num: '03',
      title: 'Entra no movimento',
      description: 'No primeiro evento você já recebe os benefícios exclusivos e descontos.',
    },
  ],
}

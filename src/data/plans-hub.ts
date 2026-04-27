export interface HubPlan {
  id: 'basic' | 'classic' | 'pro' | 'premium'
  name: string
  monthly: number
  summary: string
  bullets: string[]
  addOns: string[]
  featured: boolean
  ctaKey: 'hubBasic' | 'hubClassic' | 'hubPro' | 'hubPremium'
}

export const hubPlans: HubPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    monthly: 1500,
    summary: 'Gestão de Social Media + Captação de Conteúdo',
    bullets: [
      'Planejamento estratégico mensal',
      'Até 3 posts por semana',
      'Captação de fotos e vídeos (1 mês)',
      'Edição de feed e reels',
      'Organização e padronização do perfil',
      'Acompanhamento contínuo',
    ],
    addOns: [],
    featured: false,
    ctaKey: 'hubBasic',
  },
  {
    id: 'classic',
    name: 'Classic',
    monthly: 2500,
    summary: 'Basic + Tráfego Pago Meta',
    bullets: [
      'Tudo do Basic',
      'Até 3 campanhas/mês no Meta Ads',
      'Estratégia e segmentação de públicos',
      'Otimização e escala contínuas',
    ],
    addOns: [],
    featured: false,
    ctaKey: 'hubClassic',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 2900,
    summary: 'Classic + Google Empresa',
    bullets: [
      'Tudo do Classic',
      'Gestão completa do Google Empresa',
      'Avaliações e posicionamento local',
    ],
    addOns: ['TikTok +R$ 300/mês'],
    featured: true,
    ctaKey: 'hubPro',
  },
  {
    id: 'premium',
    name: 'Premium',
    monthly: 3800,
    summary: 'Pro + Suporte Comercial',
    bullets: [
      'Tudo do Pro',
      'Estratégias de follow-up',
      'Suporte no atendimento de leads',
      'Marketing de relacionamento',
    ],
    addOns: ['TikTok +R$ 300/mês'],
    featured: false,
    ctaKey: 'hubPremium',
  },
]

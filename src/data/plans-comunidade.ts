export interface ComunidadePlan {
  id: 'pro' | 'select'
  name: string
  monthly: number
  semestral: number
  bullets: string[]
  featured: boolean
  ctaKey: 'comunidadePro' | 'comunidadeSelect'
}

export const comunidadePlans: ComunidadePlan[] = [
  {
    id: 'pro',
    name: 'Pró',
    monthly: 47.9,
    semestral: 287.4,
    bullets: [
      'Eventos presenciais mensais',
      'Acesso à rede de parceiras',
      'Conteúdo exclusivo da comunidade',
    ],
    featured: false,
    ctaKey: 'comunidadePro',
  },
  {
    id: 'select',
    name: 'Select',
    monthly: 87.9,
    semestral: 527.4,
    bullets: [
      'Tudo do Pró',
      'Mentorias individuais',
      'Benefícios exclusivos com parceiros',
    ],
    featured: true,
    ctaKey: 'comunidadeSelect',
  },
]

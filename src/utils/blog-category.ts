// =============================================================
// Mapeamento de pillar (6 valores no content collection)
// para CATEGORIA visual do blog (4 grupos)
// =============================================================

export type Pillar = 'negocios' | 'estrategia' | 'comunidade' | 'eventos' | 'mentalidade' | 'empreendedorismo'
export type Category = 'eventos' | 'educacional' | 'historias' | 'empreendedorismo'

export interface CategoryInfo {
  slug: Category
  label: string
  /** Cor-âncora da categoria (hex) */
  color: string
  /** Cor de texto sobre fundos da cor-âncora */
  contrast: string
  /** Descrição curta (usado em hero e tooltips) */
  blurb: string
}

export const CATEGORIES: Record<Category, CategoryInfo> = {
  eventos: {
    slug: 'eventos',
    label: 'Eventos',
    color: '#00A198',
    contrast: '#ffffff',
    blurb: 'Recaps, bastidores e cobertura dos encontros REC.',
  },
  educacional: {
    slug: 'educacional',
    label: 'Educacional',
    color: '#4a6fa5',
    contrast: '#ffffff',
    blurb: 'Estratégia, vendas, posicionamento e crescimento.',
  },
  historias: {
    slug: 'historias',
    label: 'Histórias',
    color: '#b8963e',
    contrast: '#ffffff',
    blurb: 'Cases reais da comunidade — transformações e conexões.',
  },
  empreendedorismo: {
    slug: 'empreendedorismo',
    label: 'Empreendedorismo',
    color: '#c44b1f',
    contrast: '#ffffff',
    blurb: 'Do zero ao crescimento — caminhos práticos pra quem constrói.',
  },
}

/** Converte um pillar do content collection na categoria visual */
export function pillarToCategory(pillar: Pillar): Category {
  switch (pillar) {
    case 'eventos':
      return 'eventos'
    case 'negocios':
    case 'estrategia':
      return 'educacional'
    case 'comunidade':
    case 'mentalidade':
      return 'historias'
    case 'empreendedorismo':
      return 'empreendedorismo'
  }
}

export function getCategoryInfo(pillar: Pillar): CategoryInfo {
  return CATEGORIES[pillarToCategory(pillar)]
}

/** Calcula tempo estimado de leitura em minutos (200 palavras/min) */
export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

export interface NavItem {
  label: string
  href: string
  description: string
}

export const navItems: NavItem[] = [
  { label: 'Comunidade', href: '/comunidade', description: 'eventos - rede - benefícios' },
  { label: 'HUB', href: '/hub', description: 'serviços digitais' },
  { label: 'Eventos', href: '/agenda', description: 'trajetória e próximos encontros' },
  { label: 'Empresas', href: '/empresas', description: '84 empresas conectadas' },
  { label: 'Blog', href: '/blog', description: 'pensamento sem pressa' },
  { label: 'Planos', href: '/planos', description: 'adesão + serviços hub' },
  { label: 'Contato', href: '/contato', description: 'fale com a gente' },
]

export const externalLinks = {
  vitrine: { url: 'https://clube.recolaborativo.com.br/divulga/', label: 'Vitrine' },
  whatsapp: { url: 'https://wa.me/5551984632545', number: '51 98463-2545' },
  instagram: { url: 'https://instagram.com/somosrecoficial', handle: '@somosrecoficial' },
}

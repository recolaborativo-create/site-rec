const PHONE = '5551984632545'

export function whatsappLink(message: string): string {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`
}

export const messages = {
  hubGeneric: 'Olá! Vim pelo site - gostaria de um orçamento do HUB Digital REC.',
  hubBasic: 'Olá! Tenho interesse no plano Basic do HUB Digital.',
  hubClassic: 'Olá! Tenho interesse no plano Classic do HUB Digital.',
  hubPro: 'Olá! Tenho interesse no plano Pro do HUB Digital.',
  hubPremium: 'Olá! Tenho interesse no plano Premium do HUB Digital.',
  comunidadeSelect: 'Olá! Quero saber mais sobre a comunidade do REC.',
  comunidadePro: 'Olá! Quero saber mais sobre o Plano Pro da comunidade do REC.',
  comunidadeProSemestral: 'Olá! Tenho interesse no Plano Pro da comunidade do REC com adesão semestral.',
  comunidadeProAnual: 'Olá! Tenho interesse no Plano Pro da comunidade do REC com adesão anual.',
  helpChoose: 'Olá! Quero entender qual plano combina com o meu negócio.',
  generic: 'Olá! Vim pelo site do REC.',
} as const

export type WhatsAppMessageKey = keyof typeof messages

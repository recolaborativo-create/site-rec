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
  comunidadePro: 'Olá! Quero saber mais sobre o Plano Pró da comunidade REC.',
  comunidadeSelect: 'Olá! Quero saber mais sobre o Plano Select da comunidade REC.',
  helpChoose: 'Olá! Quero entender qual plano combina com o meu negócio.',
  generic: 'Olá! Vim pelo site da REC.',
} as const

export type WhatsAppMessageKey = keyof typeof messages

// "05 jun 2026" — sem ponto do mês abreviado
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')
}

// "05 de junho de 2026"
export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

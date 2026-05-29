// Lote semanal de blog: chave = data do domingo da semana (YYYY-MM-DD).
// Espelha scripts/blog-auto/lib/batch.mjs (lado servidor/script).
export const BATCH_RE = /^\d{4}-\d{2}-\d{2}$/

export function isValidBatch(s: string | undefined | null): boolean {
  return !!s && BATCH_RE.test(s)
}

const MONTH_NAMES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']

export function batchLabel(key: string): string {
  const [y, m, d] = key.split('-')
  return `semana de ${d} de ${MONTH_NAMES[parseInt(m, 10) - 1]} de ${y}`
}

// Lote SEMANAL de blog: a chave é a data do domingo da semana (YYYY-MM-DD, UTC).
// Antes era mensal (YYYY-MM); agora roda todo domingo.

const MONTH_NAMES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']

/** Data do domingo da semana de `date` (inclui o próprio dia se for domingo). YYYY-MM-DD UTC. */
export function sundayBatchKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  d.setUTCDate(d.getUTCDate() - d.getUTCDay()) // getUTCDay: 0 = domingo
  return d.toISOString().slice(0, 10)
}

/** Rótulo humano: "semana de 31 de maio de 2026". */
export function weekLabel(key) {
  const [y, m, d] = key.split('-')
  return `semana de ${d} de ${MONTH_NAMES[parseInt(m, 10) - 1]} de ${y}`
}

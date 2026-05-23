// Renderizador de markdown minimalista e SEGURO pra preview no client.
// Suporta o subset que a IA realmente usa: parágrafos, negrito, itálico,
// listas, ## headings, links. NÃO renderiza HTML embutido — escapa tudo
// antes de transformar markdown.
//
// Pra produção, posts viram .md e Astro renderiza com a pipeline completa.
// Aqui é só pra visualização no painel de aprovação.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderInline(text: string): string {
  // Já assumimos que o input já foi escapado uma vez.
  // **negrito**
  let out = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // *itálico* (cuidado pra não pegar ** que já foi tratado)
  out = out.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
  // [texto](url) — só http/https, evita javascript:
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (_m, label, url) => {
    return `<a href="${url}" target="_blank" rel="noopener">${label}</a>`
  })
  return out
}

export function renderMarkdown(md: string): string {
  if (!md) return ''
  const escaped = escapeHtml(md)
  const lines = escaped.split(/\r?\n/)
  const out: string[] = []
  let inList: 'ul' | 'ol' | null = null
  let paraBuffer: string[] = []

  const flushPara = () => {
    if (paraBuffer.length === 0) return
    out.push(`<p>${renderInline(paraBuffer.join(' '))}</p>`)
    paraBuffer = []
  }
  const closeList = () => {
    if (inList) { out.push(`</${inList}>`); inList = null }
  }

  for (const raw of lines) {
    const line = raw.trim()

    if (!line) {
      flushPara()
      closeList()
      continue
    }

    // Headings
    if (line.startsWith('### ')) {
      flushPara(); closeList()
      out.push(`<h3>${renderInline(line.slice(4))}</h3>`)
      continue
    }
    if (line.startsWith('## ')) {
      flushPara(); closeList()
      out.push(`<h2>${renderInline(line.slice(3))}</h2>`)
      continue
    }
    if (line.startsWith('# ')) {
      flushPara(); closeList()
      out.push(`<h1>${renderInline(line.slice(2))}</h1>`)
      continue
    }

    // Listas
    const ulMatch = line.match(/^[-*]\s+(.+)/)
    const olMatch = line.match(/^\d+\.\s+(.+)/)
    if (ulMatch) {
      flushPara()
      if (inList !== 'ul') { closeList(); out.push('<ul>'); inList = 'ul' }
      out.push(`<li>${renderInline(ulMatch[1])}</li>`)
      continue
    }
    if (olMatch) {
      flushPara()
      if (inList !== 'ol') { closeList(); out.push('<ol>'); inList = 'ol' }
      out.push(`<li>${renderInline(olMatch[1])}</li>`)
      continue
    }

    // Parágrafo normal — acumula até linha vazia
    closeList()
    paraBuffer.push(line)
  }

  flushPara()
  closeList()
  return out.join('\n')
}

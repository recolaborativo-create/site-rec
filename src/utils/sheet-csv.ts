// Lê as respostas do Google Form a partir da planilha PUBLICADA como CSV.
// (Arquivo → Compartilhar → Publicar na web → CSV). Sem API/credencial.
//
// O mapeamento de colunas casa por PALAVRA-CHAVE no cabeçalho (sem acento,
// case-insensitive), então funciona mesmo que o texto exato da pergunta mude.

export interface PartnerSubmission {
  /** chave estável da inscrição (timestamp+instagram) pra dedupe */
  key: string
  name: string
  instagram: string
  city: string
  whatsapp: string
  website: string
  hasGoogle: boolean
  description: string
  /** URL/!d do arquivo de logo no Drive (do upload do Form) */
  logoRef: string
  raw: Record<string, string>
}

const norm = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

// Para cada campo, lista de palavras-chave; casa a 1ª coluna cujo header contém alguma.
const FIELD_KEYS: Record<keyof Omit<PartnerSubmission, 'key' | 'raw' | 'hasGoogle'>, string[]> = {
  name: ['nome da empresa', 'nome do negocio', 'nome da marca', 'empresa', 'marca', 'nome'],
  instagram: ['instagram', '@'],
  city: ['cidade'],
  whatsapp: ['whatsapp', 'telefone', 'celular', 'contato'],
  website: ['site', 'website', 'link'],
  description: ['descricao', 'descricao sobre', 'breve descricao', 'sobre sua empresa', 'sobre a empresa'],
  logoRef: ['logo', 'logotipo', 'arquivo', 'imagem'],
}
const GOOGLE_KEYS = ['avaliacao', 'google meu negocio', 'google']

// Parser CSV simples com suporte a campos entre aspas (vírgula/quebra dentro).
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += c
    } else {
      if (c === '"') inQuotes = true
      else if (c === ',') { row.push(field); field = '' }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
      else if (c === '\r') { /* ignora */ }
      else field += c
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows.filter(r => r.some(c => c.trim() !== ''))
}

function pickIndex(headers: string[], keys: string[]): number {
  const H = headers.map(norm)
  for (const k of keys) {
    const kk = norm(k)
    const i = H.findIndex(h => h.includes(kk))
    if (i !== -1) return i
  }
  return -1
}

export async function fetchSubmissions(csvUrl: string): Promise<PartnerSubmission[]> {
  const res = await fetch(csvUrl, { headers: { 'cache-control': 'no-cache' } })
  if (!res.ok) throw new Error(`Falha ao ler a planilha CSV: ${res.status}`)
  const text = await res.text()
  const rows = parseCsv(text)
  if (rows.length < 2) return []

  const headers = rows[0]
  const idx = {
    name: pickIndex(headers, FIELD_KEYS.name),
    instagram: pickIndex(headers, FIELD_KEYS.instagram),
    city: pickIndex(headers, FIELD_KEYS.city),
    whatsapp: pickIndex(headers, FIELD_KEYS.whatsapp),
    website: pickIndex(headers, FIELD_KEYS.website),
    description: pickIndex(headers, FIELD_KEYS.description),
    logoRef: pickIndex(headers, FIELD_KEYS.logoRef),
    google: pickIndex(headers, GOOGLE_KEYS),
  }

  const get = (r: string[], i: number) => (i >= 0 ? (r[i] ?? '').trim() : '')

  return rows.slice(1).map((r, n) => {
    const instagram = get(r, idx.instagram)
    const raw: Record<string, string> = {}
    headers.forEach((h, i) => { raw[h] = (r[i] ?? '').trim() })
    return {
      key: `${(r[0] ?? '').trim()}|${norm(instagram)}|${n}`,
      name: get(r, idx.name),
      instagram,
      city: get(r, idx.city),
      whatsapp: get(r, idx.whatsapp),
      website: get(r, idx.website),
      description: get(r, idx.description),
      hasGoogle: /sim|yes|tenho/i.test(get(r, idx.google)),
      logoRef: get(r, idx.logoRef),
      raw,
    }
  })
}

// Extrai o ID de arquivo de uma URL do Google Drive (vários formatos).
export function driveFileId(ref: string): string | null {
  if (!ref) return null
  const m =
    ref.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    ref.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
    ref.match(/open\?id=([a-zA-Z0-9_-]+)/)
  if (m) return m[1]
  // às vezes o Form grava só o id
  if (/^[a-zA-Z0-9_-]{20,}$/.test(ref.trim())) return ref.trim()
  return null
}

export function driveDownloadUrl(id: string): string {
  return `https://drive.google.com/uc?export=download&id=${id}`
}

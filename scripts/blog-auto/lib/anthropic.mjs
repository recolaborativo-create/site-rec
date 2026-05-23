// Wrapper Anthropic API com retry, parse de JSON e validação.
import Anthropic from '@anthropic-ai/sdk'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROMPTS_DIR = join(__dirname, '..', 'prompts')

// Lazy — só valida quando for usar de fato
let _client = null
function getClient() {
  if (_client) return _client
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    throw new Error('[anthropic] ANTHROPIC_API_KEY não configurada. Crie em https://console.anthropic.com/settings/keys')
  }
  _client = new Anthropic({ apiKey: key })
  return _client
}

// Haiku é rápido e barato; Sonnet pra qualidade maior. Configurável.
function getModel() {
  return process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5'
}

/**
 * Lê os 2 prompts e substitui as variáveis.
 */
async function buildPrompt({ batchMonthLabel, newsContext }) {
  const [rules, master] = await Promise.all([
    readFile(join(PROMPTS_DIR, 'writing-rules.md'), 'utf8'),
    readFile(join(PROMPTS_DIR, 'master-prompt.md'), 'utf8'),
  ])

  return master
    .replace('{{WRITING_RULES}}', rules)
    .replace('{{BATCH_MONTH_LABEL}}', batchMonthLabel)
    .replace('{{NEWS_CONTEXT}}', newsContext || '(sem contexto adicional este mês — use temas evergreen)')
}

/**
 * Valida o JSON retornado pela IA. Lança erro descritivo se algo estiver fora.
 */
function validatePosts(payload) {
  if (!payload || !Array.isArray(payload.posts)) {
    throw new Error('Resposta não tem "posts" como array.')
  }
  if (payload.posts.length !== 9) {
    throw new Error(`Esperado 9 posts, recebido ${payload.posts.length}.`)
  }

  const slugs = new Set()
  const validPillars = new Set(['negocios','estrategia','comunidade','eventos','mentalidade','empreendedorismo'])

  payload.posts.forEach((p, i) => {
    const idx = i + 1
    const must = ['position', 'pillar', 'title', 'slug', 'excerpt', 'content', 'cover_search_query', 'cover_alt']
    for (const f of must) {
      if (!p[f]) throw new Error(`Post ${idx}: campo "${f}" ausente ou vazio.`)
    }
    if (!validPillars.has(p.pillar)) {
      throw new Error(`Post ${idx}: pillar "${p.pillar}" inválido.`)
    }
    if (p.title.includes('—') || p.title.includes('–')) {
      throw new Error(`Post ${idx}: título contém travessão (proibido pelas regras).`)
    }
    if (!/^[a-z0-9-]+$/.test(p.slug)) {
      throw new Error(`Post ${idx}: slug "${p.slug}" deve ser kebab-case (a-z, 0-9, hífen).`)
    }
    if (slugs.has(p.slug)) {
      throw new Error(`Post ${idx}: slug "${p.slug}" duplicado no batch.`)
    }
    slugs.add(p.slug)
    if (p.excerpt.length < 40 || p.excerpt.length > 220) {
      throw new Error(`Post ${idx}: excerpt com ${p.excerpt.length} chars (esperado 40-220).`)
    }
    const wordCount = p.content.trim().split(/\s+/).length
    if (wordCount < 400 || wordCount > 1400) {
      throw new Error(`Post ${idx}: content com ${wordCount} palavras (esperado 400-1400).`)
    }
  })

  return payload.posts
}

/**
 * Extrai o JSON da resposta da IA, removendo eventuais cercas de código markdown.
 */
function extractJson(text) {
  const trimmed = text.trim()

  // Remove cercas markdown ```json ... ``` ou ``` ... ```
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  const candidate = fenceMatch ? fenceMatch[1] : trimmed

  try {
    return JSON.parse(candidate)
  } catch (e) {
    // Tenta achar primeiro `{` e último `}`
    const start = candidate.indexOf('{')
    const end = candidate.lastIndexOf('}')
    if (start !== -1 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1))
    }
    throw new Error(`Falha ao parsear JSON da resposta da IA: ${e.message}`)
  }
}

/**
 * Gera 9 posts via Claude. Faz até 3 tentativas em caso de validação falhar.
 */
export async function generatePosts({ batchMonthLabel, newsContext }) {
  const prompt = await buildPrompt({ batchMonthLabel, newsContext })

  const maxAttempts = 3
  let lastError
  const client = getClient()
  const model = getModel()

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[anthropic] Tentativa ${attempt}/${maxAttempts}...`)

    try {
      const response = await client.messages.create({
        model,
        max_tokens: 16000,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      })

      const text = response.content
        .filter(c => c.type === 'text')
        .map(c => c.text)
        .join('\n')

      const json = extractJson(text)
      const posts = validatePosts(json)

      return {
        posts,
        usage: response.usage, // { input_tokens, output_tokens }
        model: response.model,
      }
    } catch (err) {
      lastError = err
      console.warn(`[anthropic] Tentativa ${attempt} falhou: ${err.message}`)
      if (attempt < maxAttempts) {
        // backoff: 5s, 15s
        await new Promise(r => setTimeout(r, 5000 * attempt))
      }
    }
  }

  throw new Error(`Falhou em ${maxAttempts} tentativas. Último erro: ${lastError.message}`)
}

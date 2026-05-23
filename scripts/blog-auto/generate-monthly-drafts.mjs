#!/usr/bin/env node
// =============================================================
// Blog Automation — Gerador Mensal de Rascunhos
// Roda via cron Vercel todo dia 1 do mês, OU manualmente:
//   node scripts/blog-auto/generate-monthly-drafts.mjs
//   node scripts/blog-auto/generate-monthly-drafts.mjs --month 2026-06
//   node scripts/blog-auto/generate-monthly-drafts.mjs --month 2026-06 --dry-run
// =============================================================

// Carrega .env automaticamente se rodando como script CLI (não no Vercel,
// onde as env vars vêm do painel). Usa dotenv só se disponível.
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '..', '..', '.env')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

import { supabaseAdmin } from './lib/supabase.mjs'
import { generatePosts } from './lib/anthropic.mjs'
import { fetchCoverImage } from './lib/unsplash.mjs'
import { gatherNewsContext } from './lib/news.mjs'

const MONTH_NAMES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']

function parseArgs(argv) {
  const args = { month: null, dryRun: false }
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--month' && argv[i + 1]) { args.month = argv[++i] }
    else if (argv[i] === '--dry-run') { args.dryRun = true }
  }
  return args
}

/** Default: mês ATUAL no formato YYYY-MM (rodou dia 1 do mês = pega o próprio mês) */
function defaultBatchMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(batchMonth) {
  const [y, m] = batchMonth.split('-')
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} de ${y}`
}

async function main() {
  const args = parseArgs(process.argv)
  const batchMonth = args.month || defaultBatchMonth()
  const label = monthLabel(batchMonth)

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🤖  Gerando blog do REC — ${label}`)
  console.log(`📅  batch_month=${batchMonth} | dry-run=${args.dryRun}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // 1) Checa se já existem drafts deste batch (evita duplicação acidental)
  if (!args.dryRun) {
    const { data: existing, error } = await supabaseAdmin
      .from('blog_drafts')
      .select('id')
      .eq('batch_month', batchMonth)
      .limit(1)
    if (error) throw new Error(`Supabase erro: ${error.message}`)
    if (existing && existing.length > 0) {
      console.log(`⚠️  Já existem drafts para ${batchMonth}. Abortando.`)
      console.log('   (Pra regenerar: delete os registros antigos primeiro)')
      process.exit(0)
    }
  }

  // 2) Coleta contexto de notícias
  console.log('\n📰 Coletando notícias do mês...')
  const newsContext = await gatherNewsContext()
  console.log(`   ${newsContext.split('\n').length} linhas de contexto.`)

  // 3) Chama IA pra gerar 9 posts
  console.log('\n🧠 Chamando IA...')
  const { posts, usage, model } = await generatePosts({
    batchMonthLabel: label,
    newsContext,
  })
  console.log(`   ✅ ${posts.length} posts gerados em ${model}`)
  console.log(`   tokens: in=${usage.input_tokens} out=${usage.output_tokens}`)

  // 4) Pra cada post: busca imagem
  console.log('\n🖼️  Buscando imagens de capa...')
  const enriched = []
  for (const p of posts) {
    const cover = await fetchCoverImage(p.cover_search_query, p.cover_alt)
    enriched.push({ ...p, cover })
    console.log(`   ${p.position}. "${p.title}" → ${cover.url.startsWith('http') ? 'unsplash' : 'fallback'}`)
  }

  // 5) Insere no Supabase (ou só imprime, se dry-run)
  if (args.dryRun) {
    console.log('\n🧪 DRY-RUN — não vai gravar no Supabase. Resumo:')
    enriched.forEach(p => {
      console.log(`   ${p.position}. [${p.pillar}] ${p.title} (${p.content.split(/\s+/).length}w)`)
    })
    return
  }

  console.log('\n💾 Salvando no Supabase...')
  const rows = enriched.map(p => ({
    batch_month: batchMonth,
    position: p.position,
    pillar: p.pillar,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    cover_url: p.cover.url,
    cover_alt: p.cover.alt,
    cover_credit: p.cover.credit,
    cover_search_query: p.cover_search_query,
    source_topic: p.source_topic || null,
    generation_model: model,
    generation_tokens: usage.input_tokens + usage.output_tokens,
  }))

  const { error: insertErr } = await supabaseAdmin.from('blog_drafts').insert(rows)
  if (insertErr) throw new Error(`Supabase insert: ${insertErr.message}`)

  console.log(`   ✅ ${rows.length} drafts inseridos.`)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✨ Pronto. Revisar em: https://somosrecoficial.com.br/aprovacao-blog/${batchMonth}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  return { batchMonth, count: rows.length }
}

// Permite rodar via CLI OU importar como módulo (pro cron endpoint).
// Usa pathToFileURL pra lidar com paths com espaços/acentos.
const isCli = import.meta.url === pathToFileURL(process.argv[1] || '').href
if (isCli) {
  main().catch(err => {
    console.error('💥 ERRO:', err.message)
    console.error(err.stack)
    process.exit(1)
  })
}

export { main as runMonthlyGeneration }

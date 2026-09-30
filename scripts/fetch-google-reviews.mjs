// Busca rating, contagem e top reviews do Google Places API (New) pra cada
// empresa em src/data/partners.ts e salva em src/data/partners-google.json.
//
// Uso:
//   1. Cria .env na raiz do site com: GOOGLE_PLACES_API_KEY=AIzaSy...
//   2. Roda: node scripts/fetch-google-reviews.mjs
//   3. Site puxa automaticamente via partners-merged.ts
//
// API: Places API (New) — https://developers.google.com/maps/documentation/places/web-service/text-search
// Custo aproximado: ~$0,02 por empresa (Text Search $32/1000 + Place Details lite $17/1000). Free tier $200/mês cobre.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PARTNERS_TS = resolve(ROOT, 'src/data/partners.ts')
const CMS_DIR = resolve(ROOT, 'src/content/partners')
const OUTPUT_JSON = resolve(ROOT, 'src/data/partners-google.json')
const ENV_PATH = resolve(ROOT, '.env')

// ===== Carrega API key =====
function loadApiKey() {
  if (process.env.GOOGLE_PLACES_API_KEY) return process.env.GOOGLE_PLACES_API_KEY
  if (existsSync(ENV_PATH)) {
    const env = readFileSync(ENV_PATH, 'utf8')
    const match = env.match(/^GOOGLE_PLACES_API_KEY\s*=\s*(.+?)\s*$/m)
    if (match) return match[1].replace(/^['"]|['"]$/g, '')
  }
  throw new Error('GOOGLE_PLACES_API_KEY não encontrada. Define em .env ou via env var.')
}

// ===== Extrai entries do partners.ts via regex =====
function parsePartners() {
  const src = readFileSync(PARTNERS_TS, 'utf8')
  // Match cada objeto `{ id: '...', ..., }` no array `partners`
  const entries = []
  const blockRe = /\{\s*id:\s*['"]([^'"]+)['"][\s\S]*?name:\s*['"]([^'"]+)['"][\s\S]*?\}/g
  let m
  while ((m = blockRe.exec(src)) !== null) {
    const block = m[0]
    const id = m[1]
    const name = m[2]
    const cityMatch = block.match(/city:\s*['"]([^'"]+)['"]/)
    const city = cityMatch ? cityMatch[1] : null
    const overrideMatch = block.match(/googleSearchOverride:\s*['"]([^'"]+)['"]/)
    const override = overrideMatch ? overrideMatch[1] : null
    const hideGoogle = /hideGoogle:\s*true/.test(block)
    entries.push({ id, name, city, override, hideGoogle })
  }
  // Empresas do CMS (src/content/partners/*.json, vindas do formulário de adesão)
  if (existsSync(CMS_DIR)) {
    for (const f of readdirSync(CMS_DIR).filter((f) => f.endsWith('.json'))) {
      const j = JSON.parse(readFileSync(resolve(CMS_DIR, f), 'utf8'))
      if (entries.some((e) => e.id === j.id)) continue
      entries.push({ id: j.id, name: j.name, city: j.city || null, override: j.googleSearchOverride || null, hideGoogle: !!j.hideGoogle })
    }
  }
  return entries
}

// ===== Google Places API (New) — Text Search + Place Details =====
const API_BASE = 'https://places.googleapis.com/v1'

async function searchPlace(apiKey, query) {
  const res = await fetch(`${API_BASE}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      // Field mask: só pede os campos que precisamos
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri,places.reviews,places.nationalPhoneNumber,places.internationalPhoneNumber,places.editorialSummary,places.websiteUri',
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: 'pt-BR',
      regionCode: 'BR',
      maxResultCount: 1,
    }),
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`searchText failed (${res.status}): ${errText}`)
  }
  const data = await res.json()
  return data.places?.[0] || null
}

function shortenReview(text) {
  if (!text) return ''
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= 220) return clean
  return clean.slice(0, 217).trimEnd() + '…'
}

function pickTopReviews(reviews) {
  if (!Array.isArray(reviews)) return []
  // Prioriza 5 estrelas, depois pega mais recentes
  return reviews
    .slice()
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 2)
    .map((r) => ({
      author: r.authorAttribution?.displayName || 'Cliente Google',
      rating: r.rating || 5,
      text: shortenReview(r.text?.text || r.originalText?.text || ''),
    }))
    .filter((r) => r.text)
}

async function main() {
  const apiKey = loadApiKey()
  // --only id1,id2 → busca só essas (ignora hideGoogle, pra testar se a empresa tem ficha)
  const onlyArg = process.argv.find((a) => a.startsWith('--only='))
  const only = onlyArg ? onlyArg.slice(7).split(',') : null
  const partners = parsePartners().filter((p) => !only || only.includes(p.id)).map((p) => (only ? { ...p, hideGoogle: false } : p))
  console.log(`📋 ${partners.length} empresas pra processar`)
  console.log('')

  const existing = existsSync(OUTPUT_JSON)
    ? JSON.parse(readFileSync(OUTPUT_JSON, 'utf8'))
    : {}
  const result = { ...existing }
  const failures = []

  let i = 0
  for (const p of partners) {
    i++
    if (p.hideGoogle) {
      process.stdout.write(`[${i}/${partners.length}] ${p.name} → SKIP (hideGoogle) ⏭️\n`)
      continue
    }
    const query = p.override
      ? p.override
      : (p.city ? `${p.name} ${p.city}` : `${p.name} Rio Grande do Sul`)
    process.stdout.write(`[${i}/${partners.length}] ${p.name} → `)

    try {
      const place = await searchPlace(apiKey, query)
      if (!place) {
        process.stdout.write('sem resultado ⚠️\n')
        failures.push({ id: p.id, name: p.name, reason: 'sem resultado' })
        continue
      }
      // Empresa achada — guarda tudo, mesmo se rating ausente (rating === undefined permitido)
      result[p.id] = {
        rating: typeof place.rating === 'number' ? place.rating : 0,
        reviewsCount: place.userRatingCount || 0,
        mapsUrl: place.googleMapsUri || null,
        address: place.formattedAddress || null,
        phone: place.nationalPhoneNumber || null,
        editorialSummary: place.editorialSummary?.text || null,
        websiteUri: place.websiteUri || null,
        reviews: pickTopReviews(place.reviews),
        fetchedAt: Date.now(),
      }
      const phoneStr = place.nationalPhoneNumber ? ` 📞 ${place.nationalPhoneNumber}` : ''
      if (typeof place.rating === 'number') {
        process.stdout.write(`★ ${place.rating} (${place.userRatingCount || 0})${phoneStr} ✓\n`)
      } else {
        process.stdout.write(`sem rating mas listing achado${phoneStr} ⚪\n`)
      }
    } catch (err) {
      process.stdout.write(`erro: ${err.message} ❌\n`)
      failures.push({ id: p.id, name: p.name, reason: err.message })
    }

    // Throttle leve pra ser educado (Places permite 11 req/s)
    await new Promise((r) => setTimeout(r, 150))
  }

  writeFileSync(OUTPUT_JSON, JSON.stringify(result, null, 2), 'utf8')
  console.log('')
  console.log(`✅ Salvo em ${OUTPUT_JSON}`)
  console.log(`📊 ${Object.keys(result).length}/${partners.length} empresas com dados`)
  if (failures.length) {
    console.log(`⚠️  ${failures.length} sem dados:`)
    failures.forEach((f) => console.log(`   - ${f.name}: ${f.reason}`))
  }
}

main().catch((err) => {
  console.error('Erro fatal:', err)
  process.exit(1)
})

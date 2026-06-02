import type { APIRoute } from 'astro'
import { isModAuthorized, unauthorizedResponse, json } from '../../../utils/mod-auth'
import { getSupabaseAdmin } from '../../../utils/supabase-admin'
import { commitFiles } from '../../../utils/github-commit'
import { normalizeLogo } from '../../../utils/normalize-logo'
import { driveFileId, driveDownloadUrl } from '../../../utils/sheet-csv'

export const prerender = false

const SECTORS = [
  'beleza','saude','educacao','gastronomia','contabilidade','advocacia','marketing','tech',
  'consultoria','arquitetura','eventos','moda','imoveis','turismo','servicos','outro',
]

export const POST: APIRoute = async ({ request }) => {
  if (!isModAuthorized(request)) return unauthorizedResponse()

  let body: any
  try { body = await request.json() } catch { return json({ error: 'JSON inválido' }, 400) }

  const { key, id, name, sector, reach, instagram, whatsapp, city, website, description, hasGoogle, logoRef } = body
  if (!id || !/^[a-z0-9-]+$/.test(id)) return json({ error: 'id inválido (use a-z 0-9 e hífen)' }, 400)
  if (!name) return json({ error: 'nome obrigatório' }, 400)
  if (!SECTORS.includes(sector)) return json({ error: 'segmento inválido' }, 400)
  if (!logoRef) return json({ error: 'logo ausente na inscrição' }, 400)

  const GH_TOKEN = import.meta.env.GITHUB_PAT
  const GH_OWNER = import.meta.env.GITHUB_OWNER || 'recolaborativo-create'
  const GH_REPO = import.meta.env.GITHUB_REPO || 'site-rec'
  const GH_BRANCH = import.meta.env.GITHUB_BRANCH || 'main'
  if (!GH_TOKEN) return json({ error: 'GITHUB_PAT não configurado na Vercel.' }, 503)

  // 1) baixa a logo do Drive
  const fileId = driveFileId(logoRef)
  if (!fileId) return json({ error: 'não consegui extrair o ID do arquivo de logo do Drive.' }, 400)
  let logoBuf: Buffer
  try {
    const r = await fetch(driveDownloadUrl(fileId))
    const ct = r.headers.get('content-type') || ''
    const ab = await r.arrayBuffer()
    if (!r.ok || ct.includes('text/html')) {
      return json({
        error: 'Não consegui baixar a logo do Drive. Confirme que a pasta de respostas do Form está compartilhada como "qualquer pessoa com o link pode ver".',
      }, 502)
    }
    logoBuf = Buffer.from(ab)
  } catch (e: any) {
    return json({ error: 'Erro ao baixar logo: ' + e.message }, 502)
  }

  // 2) normaliza (autocrop + caixa 400x240 branca). Se sharp falhar, usa o original.
  let pngBuf: Buffer
  try {
    pngBuf = await normalizeLogo(logoBuf)
  } catch {
    pngBuf = logoBuf
  }

  // 3) monta JSON do parceiro
  const partner: Record<string, unknown> = {
    id, name, sector,
    reach: Math.min(5, Math.max(1, Number(reach) || 3)),
    logo: `/partners/${id}.png`,
  }
  if (instagram) partner.instagram = instagram
  if (whatsapp) partner.whatsapp = whatsapp
  if (city) partner.city = city
  if (website) partner.website = website
  if (description) partner.description = description
  if (!hasGoogle) partner.hideGoogle = true

  // 4) commita JSON + PNG num único commit
  try {
    await commitFiles({
      owner: GH_OWNER, repo: GH_REPO, branch: GH_BRANCH, token: GH_TOKEN,
      message: `partners: adiciona ${name} (cadastro via Form)`,
      files: [
        { path: `src/content/partners/${id}.json`, content: JSON.stringify(partner, null, 2) + '\n' },
        { path: `public/partners/${id}.png`, content: pngBuf },
      ],
    })
  } catch (e: any) {
    return json({ error: 'Falha ao commitar no GitHub: ' + e.message }, 502)
  }

  // 5) marca como publicada (idempotente)
  try {
    const supa = getSupabaseAdmin()
    await supa.from('partner_submissions').upsert(
      { submission_key: key, status: 'published', partner_id: id, partner_name: name },
      { onConflict: 'submission_key' }
    )
  } catch { /* commit já foi; estado é só pra fila */ }

  return json({ ok: true, id, note: 'Empresa publicada. Vercel rebuilda em ~2-3 min e ela aparece na constelação.' })
}


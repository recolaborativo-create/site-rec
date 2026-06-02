import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { isModAuthorized, unauthorizedResponse, json } from '../../../utils/mod-auth'
import { commitFiles } from '../../../utils/github-commit'

export const prerender = false

// POST /api/partner-intake/remove  body: { id }
// Remove uma empresa já aceita do site E do código:
// - adiciona o id em src/data/partners-removed.json (loadAllPartners filtra) → some do site
// - se for CMS (tem JSON), deleta o JSON + a logo /partners/{id}.png do repositório
// Tudo num único commit → Vercel rebuilda → empresa sai da constelação.
export const POST: APIRoute = async ({ request }) => {
  if (!isModAuthorized(request)) return unauthorizedResponse()

  let body: any
  try { body = await request.json() } catch { return json({ error: 'JSON inválido' }, 400) }
  const id = String(body?.id || '').trim()
  if (!id || !/^[a-z0-9-]+$/.test(id)) return json({ error: 'id inválido' }, 400)

  const GH_TOKEN = import.meta.env.GITHUB_PAT
  const GH_OWNER = import.meta.env.GITHUB_OWNER || 'recolaborativo-create'
  const GH_REPO = import.meta.env.GITHUB_REPO || 'site-rec'
  const GH_BRANCH = import.meta.env.GITHUB_BRANCH || 'main'
  if (!GH_TOKEN) return json({ error: 'GITHUB_PAT não configurado.' }, 503)

  // É uma empresa via CMS (arquivo)? → também deletamos os arquivos
  const cmsIds = new Set((await getCollection('partners')).map((e) => e.data.id))
  const isCms = cmsIds.has(id)

  // Lê a lista atual de removidos direto do repo (raw) pra não sobrescrever
  let removed: string[] = []
  try {
    const raw = await fetch(
      `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${GH_BRANCH}/src/data/partners-removed.json?t=${Date.now()}`
    )
    if (raw.ok) removed = await raw.json()
  } catch { /* começa do zero se falhar */ }
  if (!Array.isArray(removed)) removed = []
  if (!removed.includes(id)) removed.push(id)

  const deletions = isCms
    ? [`src/content/partners/${id}.json`, `public/partners/${id}.png`]
    : []

  try {
    await commitFiles({
      owner: GH_OWNER, repo: GH_REPO, branch: GH_BRANCH, token: GH_TOKEN,
      message: `partners: remove ${id} do site${isCms ? ' (arquivos + lista)' : ' (lista)'}`,
      files: [{ path: 'src/data/partners-removed.json', content: JSON.stringify(removed, null, 2) + '\n' }],
      deletions,
    })
  } catch (e: any) {
    return json({ error: 'Falha ao remover no GitHub: ' + e.message }, 502)
  }

  return json({
    ok: true, id, source: isCms ? 'cms' : 'static',
    note: isCms
      ? 'Empresa e logo removidas do código. Sai da constelação no próximo build (~2-3 min).'
      : 'Empresa ocultada do site (entrada estática em partners.ts fica inerte). Sai da constelação no próximo build.',
  })
}

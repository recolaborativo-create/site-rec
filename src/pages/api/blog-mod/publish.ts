import type { APIRoute } from 'astro'
import { isModAuthorized, unauthorizedResponse } from '../../../utils/mod-auth'
import { getSupabaseAdmin } from '../../../utils/supabase-admin'

export const prerender = false

// POST /api/blog-mod/publish
// Body: { batchMonth: '2026-06' }
// Pega TODOS os drafts com status='approved' do batch e commita como arquivos
// .md no repositório via GitHub API. Vercel rebuilda automaticamente e os posts
// aparecem em recolaborativo.com.br/blog em ~2-3 minutos.
//
// Marca como status='published' após commit OK.
export const POST: APIRoute = async ({ request }) => {
  if (!isModAuthorized(request)) return unauthorizedResponse()

  let body: any
  try { body = await request.json() } catch { return json({ error: 'JSON inválido' }, 400) }

  const { batchMonth } = body
  if (!batchMonth || !/^\d{4}-\d{2}$/.test(batchMonth)) {
    return json({ error: 'batchMonth obrigatório (YYYY-MM)' }, 400)
  }

  // Env config GitHub
  const GH_TOKEN = import.meta.env.GITHUB_PAT
  const GH_OWNER = import.meta.env.GITHUB_OWNER || 'HenriqueCallefi'
  const GH_REPO = import.meta.env.GITHUB_REPO || 'REC-HUB-COMPLETO'
  const GH_BRANCH = import.meta.env.GITHUB_BRANCH || 'main'

  if (!GH_TOKEN) {
    return json({
      error: 'GITHUB_PAT não configurado. Crie um Personal Access Token com escopo "repo" em https://github.com/settings/tokens e adicione na Vercel.',
    }, 503)
  }

  // 1) Busca todos os approved do batch
  const supa = getSupabaseAdmin()
  const { data: approved, error: fetchErr } = await supa
    .from('blog_drafts')
    .select('*')
    .eq('batch_month', batchMonth)
    .eq('status', 'approved')

  if (fetchErr) return json({ error: fetchErr.message }, 500)
  if (!approved || approved.length === 0) {
    return json({ error: 'nenhum draft aprovado neste batch' }, 400)
  }

  // 2) Commita um arquivo por draft via GitHub API
  // Cada arquivo: site/src/content/blog/{slug}.md
  const published: string[] = []
  const failed: Array<{ slug: string; error: string }> = []

  for (const draft of approved) {
    try {
      const filePath = `site/src/content/blog/${draft.slug}.md`
      const markdown = buildMarkdownFile(draft)
      const sha = await getExistingSha(GH_OWNER, GH_REPO, filePath, GH_BRANCH, GH_TOKEN)

      await commitFile({
        owner: GH_OWNER,
        repo: GH_REPO,
        branch: GH_BRANCH,
        token: GH_TOKEN,
        path: filePath,
        content: markdown,
        sha, // se existir, sobrescreve; se não, cria
        message: `blog: publish "${draft.title}" (auto-gen ${batchMonth})`,
      })

      // Marca como published no Supabase
      await supa
        .from('blog_drafts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', draft.id)

      published.push(draft.slug)
    } catch (err: any) {
      failed.push({ slug: draft.slug, error: err.message })
      console.error(`[publish] erro em ${draft.slug}:`, err.message)
    }
  }

  return json({
    ok: failed.length === 0,
    published_count: published.length,
    failed_count: failed.length,
    published,
    failed,
    note: 'Vercel deve rebuildar em ~2-3 min. Posts aparecem em /blog após o build.',
  })
}

function buildMarkdownFile(draft: any): string {
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(draft.title)}`,
    `excerpt: ${JSON.stringify(draft.excerpt)}`,
    `pillar: ${draft.pillar}`,
    `publishedAt: ${new Date().toISOString().split('T')[0]}`,
    draft.cover_url ? `cover: ${JSON.stringify(draft.cover_url)}` : null,
    draft.cover_alt ? `coverAlt: ${JSON.stringify(draft.cover_alt)}` : null,
    `author: ${JSON.stringify(draft.author || 'Equipe REC')}`,
    '---',
    '',
    draft.content,
    '',
  ].filter(Boolean).join('\n')

  return frontmatter
}

async function getExistingSha(
  owner: string, repo: string, path: string, branch: string, token: string
): Promise<string | undefined> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (res.status === 404) return undefined
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub GET contents falhou: ${res.status} ${text}`)
  }
  const json = await res.json()
  return json.sha
}

async function commitFile({
  owner, repo, branch, token, path, content, sha, message,
}: {
  owner: string; repo: string; branch: string; token: string;
  path: string; content: string; sha?: string; message: string;
}) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
  const body: any = {
    message,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch,
  }
  if (sha) body.sha = sha

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub PUT contents falhou: ${res.status} ${text}`)
  }

  return res.json()
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

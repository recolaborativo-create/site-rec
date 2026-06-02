// Commita 1+ arquivos (texto ou binário) num ÚNICO commit via Git Data API.
// Usado pelo fluxo de cadastro de empresas (JSON do parceiro + PNG da logo).

interface FileToCommit {
  path: string
  /** conteúdo: string (utf8) ou Buffer (binário) */
  content: string | Buffer
}

interface CommitArgs {
  owner: string
  repo: string
  branch: string
  token: string
  message: string
  files?: FileToCommit[]
  /** caminhos a REMOVER do repositório no mesmo commit */
  deletions?: string[]
}

async function gh(token: string, url: string, init?: RequestInit) {
  const res = await fetch(`https://api.github.com${url}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) throw new Error(`GitHub ${init?.method || 'GET'} ${url} → ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function commitFiles({ owner, repo, branch, token, message, files = [], deletions = [] }: CommitArgs) {
  const base = `/repos/${owner}/${repo}`

  // 1) ref atual → commit base → tree base
  const ref = await gh(token, `${base}/git/ref/heads/${branch}`)
  const baseCommitSha = ref.object.sha
  const baseCommit = await gh(token, `${base}/git/commits/${baseCommitSha}`)
  const baseTreeSha = baseCommit.tree.sha

  // 2) cria blobs (adições) + marca deleções (sha: null no tree)
  const treeItems: any[] = []
  for (const f of files) {
    const isBuffer = typeof f.content !== 'string'
    const blob = await gh(token, `${base}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify(
        isBuffer
          ? { content: (f.content as Buffer).toString('base64'), encoding: 'base64' }
          : { content: f.content as string, encoding: 'utf-8' }
      ),
    })
    treeItems.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha })
  }
  for (const path of deletions) {
    treeItems.push({ path, mode: '100644', type: 'blob', sha: null })
  }

  // 3) tree → commit → atualiza ref
  const tree = await gh(token, `${base}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
  })
  const commit = await gh(token, `${base}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: tree.sha, parents: [baseCommitSha] }),
  })
  await gh(token, `${base}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  })
  return commit.sha as string
}

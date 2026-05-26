import type { APIRoute } from 'astro'

// Decap CMS GitHub OAuth - step 1 of 2
// Redirects the user to GitHub's OAuth consent screen. After they authorize,
// GitHub redirects to /api/auth/callback with a temporary code.

export const prerender = false

export const GET: APIRoute = ({ url, redirect }) => {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID || import.meta.env.GITHUB_OAUTH_CLIENT_ID
  if (!clientId) {
    return new Response('OAuth not configured. Set GITHUB_OAUTH_CLIENT_ID in Vercel env.', {
      status: 500,
    })
  }
  const provider = url.searchParams.get('provider') ?? 'github'
  if (provider !== 'github') {
    return new Response('Unsupported provider', { status: 400 })
  }
  const scope = url.searchParams.get('scope') ?? 'repo,user'
  const state = crypto.randomUUID()
  const params = new URLSearchParams({
    client_id: clientId,
    scope,
    state,
  })
  // SameSite=None;Secure garante que o cookie seja enviado de volta quando o GitHub
  // redireciona para /api/auth/callback — mesmo dentro de um popup (cross-site navigation).
  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params}`,
      'Set-Cookie': `oauth_state=${state}; Path=/api/auth; HttpOnly; SameSite=None; Secure; Max-Age=600`,
    },
  })
}

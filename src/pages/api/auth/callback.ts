import type { APIRoute } from 'astro'

// Decap CMS GitHub OAuth - step 2 of 2
// GitHub redirects here with ?code=... after user authorizes. We exchange the
// code for an access token, then post it back to the Decap CMS window via
// postMessage in an HTML response.

export const prerender = false

function html(body: string) {
  return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html' } })
}

export const GET: APIRoute = async ({ url, request }) => {
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  if (!code) return new Response('Missing code', { status: 400 })

  // Verify CSRF state matches the cookie set during /api/auth.
  // OBRIGATÓRIO: ausência de state ou de cookie é rejeitada (antes permitia bypass
  // se o atacante simplesmente removesse o param state da URL).
  const cookieHeader = request.headers.get('cookie') ?? ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=')
      return [k, v.join('=')]
    }),
  )
  if (!state || !cookies.oauth_state || cookies.oauth_state !== state) {
    return new Response('Invalid state', { status: 400 })
  }

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID || import.meta.env.GITHUB_OAUTH_CLIENT_ID
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET || import.meta.env.GITHUB_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return new Response('OAuth not configured. Set env vars in Vercel.', { status: 500 })
  }

  // Exchange code for access token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  })
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string
    error?: string
    error_description?: string
  }

  if (!tokenJson.access_token) {
    const err = tokenJson.error_description ?? tokenJson.error ?? 'unknown'
    return html(`<!doctype html><html><body>
      <p>Erro de autenticação: ${err}</p>
      <p><a href="/admin">voltar</a></p>
    </body></html>`)
  }

  // Send token back to Decap CMS via postMessage and close the popup
  const payload = JSON.stringify({ token: tokenJson.access_token, provider: 'github' })
  return html(`<!doctype html><html><head><title>Authorizing</title></head><body>
    <p style="font-family:sans-serif;text-align:center;padding:32px">autenticando…</p>
    <script>
      (function() {
        function send(status, content) {
          const message = 'authorization:github:' + status + ':' + JSON.stringify(content);
          window.opener && window.opener.postMessage(message, '*');
        }
        send('success', ${payload});
        window.close();
      })();
    </script>
  </body></html>`)
}

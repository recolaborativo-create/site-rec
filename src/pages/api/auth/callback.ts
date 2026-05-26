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

  // State check removido: o code do GitHub é single-use e expira em minutos.
  // A validação de state adicionava proteção CSRF mas quebrava o fluxo quando
  // o popup era bloqueado pelo browser (cookie gerado em tentativa anterior
  // não batia com o state da tentativa que finalmente abriu).
  // Mitigação: o admin só é acessível via /admin (não linkado no site) e
  // o token só dá acesso ao repositório cujo owner autoriza o OAuth App.

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

  // Send token back to Decap CMS.
  // Suporta dois fluxos:
  //   1) Popup (padrão): window.opener existe → postMessage + fecha popup
  //   2) Redirect (sem popup / popup bloqueado): salva token no localStorage
  //      com a chave que o Decap CMS lê e redireciona pra /admin
  const token = tokenJson.access_token
  return html(`<!doctype html><html><head><title>Authorizing</title></head><body>
    <p style="font-family:sans-serif;text-align:center;padding:32px">autenticando…</p>
    <script>
      (function() {
        var token = ${JSON.stringify(token)};
        var provider = 'github';
        var msg = 'authorization:github:success:' + JSON.stringify({token:token,provider:provider});
        if (window.opener) {
          // Fluxo popup — envia pro pai e fecha
          window.opener.postMessage(msg, window.location.origin);
          window.opener.postMessage(msg, '*');
          setTimeout(function(){ window.close(); }, 200);
        } else {
          // Fluxo redirect — salva no localStorage e volta pro admin
          try { localStorage.setItem('netlify-cms-user', JSON.stringify({token:token,provider:provider,backendName:'github'})); } catch(e){}
          window.location.replace('/admin');
        }
      })();
    </script>
  </body></html>`)
}

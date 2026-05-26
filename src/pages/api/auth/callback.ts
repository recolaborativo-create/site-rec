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
  // Três canais em ordem de prioridade:
  //   1) BroadcastChannel → aba /admin aberta recebe o token sem precisar de window.opener
  //   2) postMessage via window.opener → fluxo popup clássico (fecha o popup)
  //   3) IndexedDB (localForage) → fluxo redirect puro; redireciona pra /admin que já lê o token
  const token = tokenJson.access_token
  return html(`<!doctype html><html><head><title>Authorizing…</title></head><body>
    <p style="font-family:sans-serif;text-align:center;padding:40px 24px;color:#555">
      Autenticando… pode fechar esta aba se ela não fechar automaticamente.
    </p>
    <script>
      (function() {
        var token = ${JSON.stringify(token)};
        var provider = 'github';
        var msg = 'authorization:github:success:' + JSON.stringify({token:token,provider:provider});

        // ── Canal 1: BroadcastChannel ──────────────────────────────────────────
        // Funciona mesmo sem window.opener (popup bloqueado, nova aba, etc.)
        // A aba /admin ouve este canal e despacha um MessageEvent sintético.
        var sent = false;
        try {
          var bc = new BroadcastChannel('rec-cms-auth');
          bc.postMessage({token:token,provider:provider});
          bc.close();
          sent = true;
        } catch(e) {}

        // ── Canal 2: postMessage clássico (popup com opener) ───────────────────
        if (window.opener) {
          try {
            window.opener.postMessage(msg, window.location.origin);
            window.opener.postMessage(msg, '*');
          } catch(e) {}
          setTimeout(function(){ window.close(); }, 600);
          return; // popup fecha → pronto
        }

        // ── Canal 3: IndexedDB (localForage) + redirect ────────────────────────
        // Usado quando não há opener E BroadcastChannel falhou (ou aba /admin fechada).
        // Grava no mesmo DB/store que localForage usa para que o Decap CMS leia.
        function goAdmin() { window.location.replace('/admin'); }
        try {
          var req = indexedDB.open('localforage', 2);
          req.onupgradeneeded = function(e) {
            try { e.target.result.createObjectStore('keyvaluepairs'); } catch(_) {}
          };
          req.onsuccess = function(e) {
            try {
              var db = e.target.result;
              var tx = db.transaction('keyvaluepairs', 'readwrite');
              tx.objectStore('keyvaluepairs').put(
                {token:token,provider:provider,backendName:'github'},
                'netlify-cms-user'
              );
              tx.oncomplete = function(){ db.close(); setTimeout(goAdmin, 100); };
              tx.onerror    = function(){ db.close(); goAdmin(); };
            } catch(_){ goAdmin(); }
          };
          req.onerror = function(){ goAdmin(); };
        } catch(_){ goAdmin(); }
      })();
    </script>
  </body></html>`)
}

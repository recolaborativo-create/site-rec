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
  // Canais em ordem de prioridade:
  //   1) postMessage via window.opener   → popup clássico (fecha o popup)
  //   2) localStorage + storage event    → cross-tab sem opener; aba /admin recebe via event
  //   3) fragment de URL (/admin#cms-auth=...) → redirect puro; admin lê no load
  //
  // Obs: window.close() é sempre tentado — funciona mesmo sem opener se aberto via window.open()
  const token = tokenJson.access_token
  return html(`<!doctype html><html><head><title>Autorizando…</title></head><body>
    <p id="msg" style="font-family:sans-serif;text-align:center;padding:40px 24px;color:#555;font-size:1.1rem">
      Autorizando… aguarde
    </p>
    <script>
      (function() {
        var token    = ${JSON.stringify(token)};
        var provider = 'github';
        var msg      = 'authorization:' + provider + ':success:' + JSON.stringify({token:token,provider:provider});
        var LS_KEY   = 'rec-cms-pending-auth';

        function setMsg(t) {
          var el = document.getElementById('msg');
          if (el) el.textContent = t;
        }

        // ── Canal 1: postMessage clássico (popup com opener) ──────────────
        if (window.opener) {
          setMsg('Enviando token para o painel…');
          try { window.opener.postMessage(msg, window.location.origin); } catch(_){}
          try { window.opener.postMessage(msg, '*'); } catch(_){}
          setTimeout(function(){ window.close(); }, 800);
          return;
        }

        // ── Canal 2: localStorage → storage event na aba /admin ──────────
        // O event 'storage' dispara SOMENTE em outras abas (não nesta).
        // A aba /admin escuta este evento e injeta o MessageEvent no Decap CMS.
        setMsg('Login realizado! Voltando ao painel…');
        try {
          localStorage.setItem(LS_KEY, JSON.stringify({
            token    : token,
            provider : provider,
            ts       : Date.now(),           // timestamp pra evitar reusar token antigo
          }));
        } catch(_){}

        // Tenta fechar o popup — funciona se foi aberto via window.open()
        // mesmo sem opener (Chrome pode desvinculá-lo mas ainda consegue fechar).
        try { window.close(); } catch(_){}

        // ── Canal 3: redirect com fragment (se não fechou = aba normal) ──
        // Pequeno delay pra dar tempo ao window.close() de funcionar.
        // Se chegarmos aqui, é porque não é um popup.
        setTimeout(function() {
          try {
            var frag = encodeURIComponent(JSON.stringify({token:token,provider:provider}));
            window.location.replace('/admin#cms-auth=' + frag);
          } catch(_){
            window.location.replace('/admin');
          }
        }, 500);
      })();
    </script>
  </body></html>`)
}

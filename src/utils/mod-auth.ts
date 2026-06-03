// Autenticação das rotas /api/blog-mod/* (drafts de blog). Usa o cookie
// `rec_mod` setado pela página /moderacao após login com ?s=MOD_SECRET.

const COOKIE_NAME = 'rec_mod'

export function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get('cookie') ?? ''
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

function modSecret(): string | undefined {
  return process.env.MOD_SECRET || import.meta.env.MOD_SECRET
}

// Comparação em tempo constante — não vaza o tamanho do match via timing.
// (Runtime-agnóstica: não depende de node:crypto.)
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function isModAuthorized(req: Request): boolean {
  const secret = modSecret()
  if (!secret) return false
  const token = readCookie(req, COOKIE_NAME)
  return !!token && safeEqual(token, secret)
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: 'não autorizado' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Gate de acesso pras PÁGINAS internas (/moderacao, /cadastro-empresas).
// - ?s=SEGREDO  → valida, seta cookie httpOnly (12h) e redireciona pra URL limpa
// - sem segredo → exige cookie válido; senão 404 (página não linkada)
// Retorna um Response (redirect/404) pra retornar imediatamente, ou null se autorizado.
export function modPageGate(request: Request, url: URL, redirectTo: string): Response | null {
  const secret = modSecret()
  if (!secret) return new Response(null, { status: 404 })

  const param = url.searchParams.get('s')
  if (param) {
    if (!safeEqual(param, secret)) return new Response(null, { status: 404 })
    const cookie = `${COOKIE_NAME}=${encodeURIComponent(param)}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=${60 * 60 * 12}`
    return new Response(null, { status: 302, headers: { Location: redirectTo, 'Set-Cookie': cookie } })
  }

  const token = readCookie(request, COOKIE_NAME)
  if (!token || !safeEqual(token, secret)) return new Response(null, { status: 404 })
  return null
}

// Helper de resposta JSON pras rotas /api (DRY — evita redefinir em cada arquivo).
export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

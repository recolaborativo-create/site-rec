// Autenticação compartilhada entre /api/mod/* (reviews de empresas) e
// /api/blog-mod/* (drafts de blog). Usa o mesmo cookie `rec_mod` setado
// pela página /moderacao após login com ?s=MOD_SECRET.

const COOKIE_NAME = 'rec_mod'

export function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get('cookie') ?? ''
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

export function isModAuthorized(req: Request): boolean {
  const secret = import.meta.env.MOD_SECRET
  if (!secret) return false
  const token = readCookie(req, COOKIE_NAME)
  return !!token && token === secret
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: 'não autorizado' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  })
}

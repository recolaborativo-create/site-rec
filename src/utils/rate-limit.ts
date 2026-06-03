// Rate-limit em memória por IP. Não usa banco/Vercel KV → mais simples,
// não persiste entre cold starts, mas suficiente como mitigação de spam
// burst de um único atacante em um curto intervalo.
//
// Para algo mais robusto (multi-instância, persistência) trocar pra Vercel KV.

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export interface RateLimitOptions {
  /** Máximo de requests permitidos dentro da janela */
  max: number
  /** Janela em segundos */
  windowSec: number
  /** Prefixo opcional pra diferenciar buckets de endpoints distintos */
  prefix?: string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetIn: number
}

/**
 * Lê o IP do cliente. PRIORIZA `clientAddress` (derivado pela Vercel a partir de
 * headers confiáveis) porque `x-forwarded-for` é controlado pelo cliente e o
 * primeiro valor pode ser forjado (`X-Forwarded-For: 1.2.3.4`) pra burlar o limite.
 * Headers só entram como último recurso (dev local sem clientAddress).
 */
export function extractIp(request: Request, fallback?: string | null): string {
  if (fallback) return fallback
  const fwd = request.headers.get('x-forwarded-for') ?? ''
  if (fwd) return fwd.split(',')[0]!.trim()
  const real = request.headers.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}

export function checkRateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const fullKey = `${opts.prefix ?? ''}:${key}`
  const now = Date.now()
  const windowMs = opts.windowSec * 1000

  const existing = buckets.get(fullKey)
  if (!existing || existing.resetAt < now) {
    buckets.set(fullKey, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: opts.max - 1, resetIn: opts.windowSec }
  }

  if (existing.count >= opts.max) {
    return { allowed: false, remaining: 0, resetIn: Math.ceil((existing.resetAt - now) / 1000) }
  }

  existing.count += 1
  return { allowed: true, remaining: opts.max - existing.count, resetIn: Math.ceil((existing.resetAt - now) / 1000) }
}

/**
 * Checa o honeypot field. Bots de spam geralmente preenchem TODOS os campos
 * incluindo os invisíveis. Se o honeypot tem valor, é spam (ou erro do user).
 *
 * Convenção: o form deve ter um <input type="text" name="website" tabindex="-1"
 * autocomplete="off" style="position:absolute;left:-9999px"> escondido por CSS.
 * Usuários reais não veem nem preenchem — bots sim.
 */
export function isHoneypotTripped(body: Record<string, unknown>): boolean {
  const trap = body?.['website']
  return typeof trap === 'string' && trap.trim().length > 0
}

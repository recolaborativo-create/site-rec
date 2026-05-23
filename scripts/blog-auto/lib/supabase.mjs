// Cliente Supabase com SERVICE_ROLE — bypass RLS, só pra uso em servidor/scripts.
// NUNCA importar isso em código que vá pro browser.
import { createClient } from '@supabase/supabase-js'

let _client = null

function build() {
  const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    throw new Error(
      '[supabase] PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE não configurada. ' +
      'Cheque o .env (local) ou as env vars do Vercel.'
    )
  }

  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// Proxy lazy — só instancia (e valida env vars) na primeira chamada de método.
export const supabaseAdmin = new Proxy({}, {
  get(_t, prop) {
    if (!_client) _client = build()
    return _client[prop]
  },
})

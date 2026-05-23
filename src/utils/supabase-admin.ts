// Cliente Supabase com SERVICE_ROLE pra uso em endpoints server-side.
// NÃO importe isso em código que rode no browser.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached

  const url = import.meta.env.PUBLIC_SUPABASE_URL
  const key = import.meta.env.SUPABASE_SERVICE_ROLE

  if (!url || !key) {
    throw new Error('Supabase URL ou SERVICE_ROLE não configurada nas env vars.')
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}

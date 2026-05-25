import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async () => {
  const info = {
    process_PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL ? 'SET' : 'UNSET',
    process_PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'UNSET',
    process_SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE ? 'SET' : 'UNSET',
    importmeta_PUBLIC_SUPABASE_URL: import.meta.env.PUBLIC_SUPABASE_URL ? 'SET' : 'UNSET',
    importmeta_PUBLIC_SUPABASE_ANON_KEY: import.meta.env.PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'UNSET',
    importmeta_SUPABASE_SERVICE_ROLE: import.meta.env.SUPABASE_SERVICE_ROLE ? 'SET' : 'UNSET',
    node_env: process.env.NODE_ENV,
    vercel: process.env.VERCEL ? 'true' : 'false',
  }
  return new Response(JSON.stringify(info, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  })
}

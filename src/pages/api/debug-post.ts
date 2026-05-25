import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE ?? import.meta.env.SUPABASE_SERVICE_ROLE ?? ''
  const url = 'https://ovrqfgjqpwucgeqhnbce.supabase.co'

  // Tenta um INSERT real com a service role
  let status = 0
  let body = ''
  try {
    const res = await fetch(`${url}/rest/v1/partner_reviews`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        partner_id: 'adegas-vinas',
        rating: 5,
        author_name: 'debug-test',
        comment: 'debug',
        ip_hash: 'debug123',
        approved: false,
      }),
    })
    status = res.status
    body = await res.text().catch(() => '')
  } catch (e: any) {
    body = 'fetch error: ' + e.message
  }

  return new Response(JSON.stringify({
    service_key_len: serviceKey.length,
    service_key_prefix: serviceKey.slice(0, 12),
    supabase_status: status,
    supabase_response: body,
  }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
}

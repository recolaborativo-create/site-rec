// Wrapper Unsplash API. Documentação: https://unsplash.com/documentation
// Limite free: 50 requests/hora — generoso pra 9-27 posts/mês.

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY

if (!UNSPLASH_KEY) {
  console.warn('[unsplash] UNSPLASH_ACCESS_KEY não configurada — vai usar fallback genérico.')
}

const FALLBACK_IMAGE = {
  url: '/NORMAL - FT.png',
  alt: 'REC Colaborativo',
  credit: 'REC Colaborativo',
}

/**
 * Busca uma imagem de capa relevante pro post.
 * @param {string} query Termo em inglês curto (ex: "small business owner laptop")
 * @param {string} altPt Descrição em português pra acessibilidade
 * @returns {Promise<{url:string, alt:string, credit:string}>}
 */
export async function fetchCoverImage(query, altPt) {
  if (!UNSPLASH_KEY) return { ...FALLBACK_IMAGE, alt: altPt }

  try {
    const url = new URL('https://api.unsplash.com/search/photos')
    url.searchParams.set('query', query)
    url.searchParams.set('orientation', 'landscape')
    url.searchParams.set('per_page', '10')
    url.searchParams.set('content_filter', 'high') // mais restritivo

    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
    })

    if (!res.ok) {
      console.warn(`[unsplash] HTTP ${res.status} para "${query}". Usando fallback.`)
      return { ...FALLBACK_IMAGE, alt: altPt }
    }

    const data = await res.json()
    if (!data.results || data.results.length === 0) {
      console.warn(`[unsplash] zero resultados para "${query}". Usando fallback.`)
      return { ...FALLBACK_IMAGE, alt: altPt }
    }

    // Pega uma das 3 primeiras randomicamente pra variar entre posts similares
    const pick = data.results[Math.floor(Math.random() * Math.min(3, data.results.length))]

    return {
      // regular = ~1080px, suficiente pra capa de blog
      url: pick.urls.regular,
      alt: altPt || pick.alt_description || query,
      credit: `Foto por ${pick.user.name} no Unsplash`,
      // utm_source obrigatório pela API guidelines do Unsplash
      // (não vamos exibir mas guardamos pra rastreabilidade)
      photographer_url: `${pick.user.links.html}?utm_source=rec_colaborativo&utm_medium=referral`,
    }
  } catch (err) {
    console.error('[unsplash] erro inesperado:', err.message)
    return { ...FALLBACK_IMAGE, alt: altPt }
  }
}

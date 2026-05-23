// Returns the union of static partners (src/data/partners.ts) + partners
// added via Decap CMS (src/content/partners/*.json) + Google reviews data
// (src/data/partners-google.json, gerado por scripts/fetch-google-reviews.mjs).
//
// CMS partners override static ones if id collides.
// Google data is merged on top (rating, reviewsCount, mapsUrl, reviews).

import { getCollection } from 'astro:content'
import { partners as staticPartners, type Partner } from './partners'

// Importa o JSON do Google. Astro/Vite resolve em build time.
// Se o arquivo não existir/estiver vazio, o merge simplesmente não adiciona campos.
let googleData: Record<string, {
  rating: number
  reviewsCount: number
  mapsUrl: string | null
  reviews: Array<{ author: string; rating: number; text: string }>
  phone?: string | null
  address?: string | null
  editorialSummary?: string | null
  websiteUri?: string | null
  fetchedAt: number
}> = {}
try {
  const mod = await import('./partners-google.json')
  googleData = (mod.default || mod) as typeof googleData
} catch {
  googleData = {}
}

export async function loadAllPartners(): Promise<Partner[]> {
  const cmsEntries = await getCollection('partners')
  const cmsPartners: Partner[] = cmsEntries.map((e) => ({
    id: e.data.id,
    name: e.data.name,
    instagram: e.data.instagram || undefined,
    sector: e.data.sector,
    reach: (e.data.reach || 3) as 1 | 2 | 3 | 4 | 5,
    logo: e.data.logo,
    description: e.data.description,
  }))
  // CMS partners win on id collision
  const map = new Map<string, Partner>()
  for (const p of staticPartners) map.set(p.id, p)
  for (const p of cmsPartners) map.set(p.id, p)

  // Merge Google data por id (NÃO sobrescreve campos já preenchidos manualmente)
  const merged: Partner[] = []
  for (const [, partner] of map) {
    const g = googleData[partner.id]
    if (g) {
      // Site só é considerado "real" se NÃO for rede social/linktree
      const socialRe = /(instagram\.com|facebook\.com|linktr\.ee|beacons\.ai|wa\.me|whatsapp\.com)/i
      const googleSite = g.websiteUri && !socialRe.test(g.websiteUri) ? g.websiteUri : undefined
      merged.push({
        ...partner,
        googleRating: g.rating,
        googleReviewsCount: g.reviewsCount,
        googleMapsUrl: g.mapsUrl || undefined,
        googleReviews: g.reviews,
        // Telefone do Google só preenche se o partner não tiver phone/whatsapp ainda
        phone: partner.phone ?? (g.phone ? g.phone.replace(/\D/g, '') : partner.phone),
        // Endereço vem do Google quando empresa não tem hideGoogle
        address: partner.address || g.address || undefined,
        // Site: manual prevalece, senão usa do Google (excluindo redes sociais)
        website: partner.website || googleSite,
      })
    } else {
      merged.push(partner)
    }
  }
  return merged
}

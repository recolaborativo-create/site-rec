// Returns the union of static partners (src/data/partners.ts) and partners
// added via Decap CMS (src/content/partners/*.json). Use this from pages.
//
// CMS partners override static ones if id collides, so the founder can edit
// existing entries by creating a CMS file with the same id.

import { getCollection } from 'astro:content'
import { partners as staticPartners, type Partner } from './partners'

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
  return Array.from(map.values())
}

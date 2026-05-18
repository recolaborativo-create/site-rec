// Manually-curated Instagram feed.
//
// HOW TO UPDATE:
// 1. Take a screenshot of an IG post (3:4 ratio works best — Reels are 9:16, feed is 1:1 or 4:5).
// 2. Drop the image into site/public/instagram/ as post-N.jpg
// 3. Add an entry below with the post URL (right-click → "copy link" on Instagram).
// 4. Save — site auto-rebuilds.
//
// FUTURE AUTOMATION (optional):
// - Behold.so — paste a single <script> tag, free up to 25 posts. Drop-in replacement for this carousel.
// - SnapWidget — similar service.
// - Instagram Basic Display API — heaviest path, requires Meta app approval, but fully owned.

export interface InstagramPost {
  id: string
  image?: string // /instagram/post-1.jpg — leave undefined to show elegant placeholder
  caption: string
  url: string
  ratio?: '1/1' | '4/5' | '3/4' | '9/16'
}

export const instagramFeed: InstagramPost[] = [
  {
    id: 'post-1',
    caption: 'Network Entre Elas — 370 mulheres reunidas. Um movimento.',
    url: 'https://www.instagram.com/somosrecoficial/',
    ratio: '4/5',
  },
  {
    id: 'post-2',
    caption: 'Os bastidores de mais um encontro da rede.',
    url: 'https://www.instagram.com/somosrecoficial/',
    ratio: '4/5',
  },
  {
    id: 'post-3',
    caption: 'Conexões reais geram negócios reais.',
    url: 'https://www.instagram.com/somosrecoficial/',
    ratio: '4/5',
  },
  {
    id: 'post-4',
    caption: '84 empresas - uma constelação que cresce junto.',
    url: 'https://www.instagram.com/somosrecoficial/',
    ratio: '4/5',
  },
  {
    id: 'post-5',
    caption: 'Marketing que conversa - não que interrompe.',
    url: 'https://www.instagram.com/somosrecoficial/',
    ratio: '4/5',
  },
  {
    id: 'post-6',
    caption: 'O REC HUB no dia-a-dia das parceiras.',
    url: 'https://www.instagram.com/somosrecoficial/',
    ratio: '4/5',
  },
]

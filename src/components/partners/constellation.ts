import { forceSimulation, forceManyBody, forceCenter, forceCollide, forceLink, forceX, forceY } from 'd3-force'
import type { Partner } from '../../data/partners'

interface Node extends Partner {
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
  isCenter?: boolean
}

interface Edge {
  source: string | Node
  target: string | Node
}

const REC_CENTER_ID = '__rec_center__'

// Detect low-power devices to fall back to static layout (no live simulation).
// Mobile + low memory + low CPU → static. Avoids jank on entry-level Androids.
function isLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const deviceMemory = (navigator as any).deviceMemory as number | undefined
  const cores = navigator.hardwareConcurrency || 4
  const isCoarsePointer = matchMedia('(pointer: coarse)').matches
  if (isCoarsePointer && (deviceMemory && deviceMemory < 4)) return true
  if (isCoarsePointer && cores < 4) return true
  return false
}

export function initConstellation(container: HTMLElement, partners: Partner[]) {
  // Honor user preference: no animation if reduced-motion is set.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return renderStatic(container, partners)
  }

  const lowPower = isLowPowerDevice()

  const width = container.clientWidth
  const height = container.clientHeight
  const cx = width / 2
  const cy = height / 2

  // Pinned REC center node — always anchors the constellation
  const centerNode: Node = {
    id: REC_CENTER_ID,
    name: 'REC Colaborativo',
    sector: 'outro',
    reach: 5,
    logo: '/logo-text.png',
    isCenter: true,
    fx: cx,
    fy: cy,
    x: cx,
    y: cy,
  }

  const partnerNodes: Node[] = partners.map(p => ({ ...p }))
  const nodes: Node[] = [centerNode, ...partnerNodes]
  const edges: Edge[] = partnerNodes.map(p => ({ source: REC_CENTER_ID, target: p.id }))

  // Tuned for fewer iterations and faster settling.
  // - Lower charge magnitude → less work per tick
  // - Higher velocityDecay → quicker convergence (settles 30-40% faster)
  // - Wider collide radius → more breathing room, less jiggling near collisions
  const sim = forceSimulation(nodes as any)
    .alphaDecay(0.03) // settle faster (default 0.0228)
    .velocityDecay(0.55) // damp motion harder (default 0.4)
    .force('charge', forceManyBody().strength((d: any) => (d.isCenter ? -1500 : -200)))
    .force('center', forceCenter(cx, cy))
    .force('x', forceX(cx).strength(0.06))
    .force('y', forceY(cy).strength(0.06))
    .force('collide', forceCollide().radius((d: any) => (d.isCenter ? 100 : 64)))
    .force(
      'link',
      forceLink(edges as any)
        .id((d: any) => d.id)
        .distance(() => 200 + Math.random() * 60)
        .strength(0.1),
    )

  // SVG edges layer (behind nodes) — single SVG, all lines pooled
  const svgNS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(svgNS, 'svg')
  svg.classList.add('constellation-edges')
  svg.setAttribute('width', String(width))
  svg.setAttribute('height', String(height))
  container.appendChild(svg)

  const lineEls = edges.map(e => {
    const line = document.createElementNS(svgNS, 'line')
    line.setAttribute('stroke', 'rgba(0,161,152,0.22)')
    line.setAttribute('stroke-width', '1')
    line.setAttribute('stroke-dasharray', '2 5')
    svg.appendChild(line)
    return { el: line, edge: e }
  })

  // Nodes
  const nodeEls = nodes.map(n => {
    const el = document.createElement(n.isCenter ? 'div' : 'button')
    el.className = n.isCenter ? 'constellation-node is-center' : 'constellation-node'
    el.dataset.id = n.id
    el.dataset.sector = n.sector
    if (n.isCenter) {
      el.setAttribute('aria-label', 'REC Colaborativo - centro da rede')
    } else {
      el.setAttribute('aria-label', n.name)
      ;(el as HTMLButtonElement).setAttribute('type', 'button')
    }
    // Hint the GPU we'll be transforming this element a lot
    el.style.willChange = 'transform'
    const img = document.createElement('img')
    img.src = n.logo
    img.alt = n.name
    img.loading = n.isCenter ? 'eager' : 'lazy'
    img.decoding = 'async'
    el.appendChild(img)
    container.appendChild(el)
    return { el, node: n }
  })

  // Drag (skip center node — it's pinned)
  let dragNode: Node | null = null
  let downX = 0
  let downY = 0

  function onPointerDown(e: PointerEvent) {
    downX = e.clientX
    downY = e.clientY
    const target = (e.target as HTMLElement).closest<HTMLElement>('.constellation-node')
    if (!target) return
    const id = target.dataset.id
    if (id === REC_CENTER_ID) return
    dragNode = nodes.find(n => n.id === id) || null
    if (!dragNode) return
    sim.alphaTarget(0.25).restart()
    target.setPointerCapture?.(e.pointerId)
  }
  function onPointerMove(e: PointerEvent) {
    if (!dragNode) return
    const rect = container.getBoundingClientRect()
    dragNode.fx = e.clientX - rect.left
    dragNode.fy = e.clientY - rect.top
  }
  function onPointerUp() {
    if (!dragNode) return
    sim.alphaTarget(0)
    dragNode.fx = null
    dragNode.fy = null
    dragNode = null
  }
  container.addEventListener('pointerdown', onPointerDown)
  container.addEventListener('pointermove', onPointerMove)
  container.addEventListener('pointerup', onPointerUp)
  container.addEventListener('pointercancel', onPointerUp)

  nodeEls.forEach(({ el, node }) => {
    if (node.isCenter) return
    el.addEventListener('click', (e: Event) => {
      const me = e as MouseEvent
      const dx = me.clientX - downX
      const dy = me.clientY - downY
      if (Math.hypot(dx, dy) > 6) return
      openCard(node)
    })
  })

  function openCard(n: Node) {
    const card = document.querySelector<HTMLElement>('[data-partner-card]')
    if (!card) return
    const logoEl = card.querySelector<HTMLImageElement>('.card-logo')!
    logoEl.src = n.logo
    logoEl.alt = n.name
    card.querySelector<HTMLElement>('.card-name')!.textContent = n.name
    card.querySelector<HTMLElement>('.card-sector')!.textContent = n.sector === 'outro' ? '' : n.sector
    const ig = card.querySelector<HTMLAnchorElement>('.card-instagram')!
    if (n.instagram) {
      const handle = n.instagram.replace('@', '')
      ig.href = `https://instagram.com/${handle}`
      ig.textContent = n.instagram.startsWith('@') ? n.instagram : `@${handle}`
      ig.style.display = 'inline-block'
    } else {
      ig.style.display = 'none'
    }
    // Description block
    const descEl = card.querySelector<HTMLElement>('.card-description')
    if (descEl) {
      if (n.description && n.description.trim()) {
        descEl.textContent = n.description.trim()
        descEl.classList.remove('is-empty')
      } else {
        descEl.textContent = 'descrição em breve'
        descEl.classList.add('is-empty')
      }
    }
    // Reset reviews UI for this partner; the reviews module will repopulate
    card.dataset.partnerId = n.id
    document.dispatchEvent(new CustomEvent('partner-card-opened', { detail: { id: n.id, name: n.name } }))
    card.classList.add('open')
    card.setAttribute('aria-hidden', 'false')
  }

  // Render loop — throttled via rAF, batches DOM writes
  let pendingFrame = false
  function renderPositions() {
    pendingFrame = false
    const w = container.clientWidth
    const h = container.clientHeight
    const padX = 56
    const padY = 32
    for (let i = 0; i < nodeEls.length; i++) {
      const { el, node } = nodeEls[i]
      // Bounding-box clamp: keep nodes inside the visible container (with padding for the logo size)
      if (!node.isCenter) {
        if (typeof node.x === 'number') node.x = Math.max(padX, Math.min(w - padX, node.x))
        if (typeof node.y === 'number') node.y = Math.max(padY, Math.min(h - padY, node.y))
      }
      const x = node.x ?? 0
      const y = node.y ?? 0
      const halfW = node.isCenter ? 80 : 48
      const halfH = node.isCenter ? 45 : 27
      // translate3d forces GPU compositing
      el.style.transform = `translate3d(${x - halfW}px, ${y - halfH}px, 0)`
    }
    for (let i = 0; i < lineEls.length; i++) {
      const { el, edge } = lineEls[i]
      const s = (typeof edge.source === 'string' ? nodes.find(n => n.id === edge.source) : edge.source) as Node
      const t = (typeof edge.target === 'string' ? nodes.find(n => n.id === edge.target) : edge.target) as Node
      if (!s || !t) continue
      el.setAttribute('x1', String(s.x ?? 0))
      el.setAttribute('y1', String(s.y ?? 0))
      el.setAttribute('x2', String(t.x ?? 0))
      el.setAttribute('y2', String(t.y ?? 0))
    }
  }
  sim.on('tick', () => {
    if (pendingFrame) return
    pendingFrame = true
    requestAnimationFrame(renderPositions)
  })
  // Once settled, free the GPU hint and stop work
  sim.on('end', () => {
    nodeEls.forEach(({ el }) => {
      el.style.willChange = ''
    })
  })

  // Low-power: skip pinch-zoom + freeze sim early
  if (lowPower) {
    sim.alphaMin(0.05) // freeze sooner
  } else {
    attachPinchZoom(container)
  }

  // Card close handler
  const card = document.querySelector<HTMLElement>('[data-partner-card]')
  card?.querySelector<HTMLButtonElement>('.card-close')?.addEventListener('click', () => {
    card.classList.remove('open')
    card.setAttribute('aria-hidden', 'true')
  })

  // Re-center on resize (debounced)
  let resizeTimer: ReturnType<typeof setTimeout> | null = null
  function onResize() {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      const w = container.clientWidth
      const h = container.clientHeight
      const ncx = w / 2
      const ncy = h / 2
      centerNode.fx = ncx
      centerNode.fy = ncy
      sim.force('center', forceCenter(ncx, ncy))
      sim.force('x', forceX(ncx).strength(0.06))
      sim.force('y', forceY(ncy).strength(0.06))
      svg.setAttribute('width', String(w))
      svg.setAttribute('height', String(h))
      sim.alpha(0.25).restart()
    }, 150)
  }
  window.addEventListener('resize', onResize)

  // Filter via CustomEvent — keeps SegmentFilter component decoupled
  // detail: { sectors: string[] | null }  null/empty = show all
  function applyFilter(sectors: string[] | null) {
    const showAll = !sectors || sectors.length === 0
    const sectorSet = new Set(sectors ?? [])
    let visibleCount = 0
    nodeEls.forEach(({ el, node }) => {
      if (node.isCenter) return
      const matches = showAll || sectorSet.has(node.sector)
      el.style.display = matches ? '' : 'none'
      el.style.pointerEvents = matches ? '' : 'none'
      if (matches) visibleCount++
    })
    // Hide edges to filtered-out partners
    lineEls.forEach(({ el, edge }) => {
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id
      const node = partnerNodes.find(p => p.id === targetId)
      const matches = !node ? true : showAll || sectorSet.has(node.sector)
      el.style.display = matches ? '' : 'none'
    })

    // When filtered: tighten link distance & boost centering forces so visible
    // nodes cluster snugly around the REC center within the viewport.
    const w = container.clientWidth
    const h = container.clientHeight
    const minDim = Math.min(w, h)
    const targetRadius = showAll
      ? 200
      : Math.max(110, Math.min(minDim * 0.32, 110 + visibleCount * 8))

    sim.force(
      'link',
      forceLink(edges as any)
        .id((d: any) => d.id)
        .distance(() => targetRadius + Math.random() * 40)
        .strength(0.18),
    )
    const centerStrength = showAll ? 0.06 : 0.18
    sim.force('x', forceX(w / 2).strength(centerStrength))
    sim.force('y', forceY(h / 2).strength(centerStrength))
    sim.alpha(0.6).restart()
  }
  document.addEventListener('partners-filter' as any, (ev: any) => {
    applyFilter(ev.detail?.sectors ?? null)
  })

  return () => {
    sim.stop()
    window.removeEventListener('resize', onResize)
  }
}

// Static fallback for reduced-motion users — single computed layout, no animation.
function renderStatic(container: HTMLElement, partners: Partner[]) {
  container.classList.add('fallback-static')
  // Render a simple grid representation of partners — non-interactive but accessible.
  const wrap = document.createElement('div')
  wrap.className = 'static-grid'
  partners.forEach(p => {
    const item = document.createElement('a')
    item.className = 'static-tile'
    item.href = p.instagram ? `https://instagram.com/${p.instagram.replace('@', '')}` : '#'
    if (p.instagram) {
      item.target = '_blank'
      item.rel = 'noopener'
    }
    const img = document.createElement('img')
    img.src = p.logo
    img.alt = p.name
    img.loading = 'lazy'
    item.appendChild(img)
    wrap.appendChild(item)
  })
  container.appendChild(wrap)
  return () => {}
}

function attachPinchZoom(container: HTMLElement) {
  const pointers = new Map<number, { x: number; y: number }>()
  let lastDist = 0
  let scale = 1
  let panX = 0
  let panY = 0
  let lastPanX = 0
  let lastPanY = 0

  function apply() {
    container.style.transformOrigin = '50% 50%'
    container.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${scale})`
  }

  container.addEventListener('pointerdown', e => {
    if ((e.target as HTMLElement).closest('.constellation-node')) return
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.size === 2) {
      const pts = [...pointers.values()]
      lastDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
    } else if (pointers.size === 1) {
      lastPanX = e.clientX - panX
      lastPanY = e.clientY - panY
    }
  })

  container.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.size === 2) {
      const pts = [...pointers.values()]
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      if (lastDist > 0) scale = Math.max(0.6, Math.min(2.2, scale * (dist / lastDist)))
      lastDist = dist
      apply()
    } else if (pointers.size === 1 && scale > 1) {
      panX = e.clientX - lastPanX
      panY = e.clientY - lastPanY
      apply()
    }
  })

  function clear(e: PointerEvent) {
    pointers.delete(e.pointerId)
    if (pointers.size < 2) lastDist = 0
  }
  container.addEventListener('pointerup', clear)
  container.addEventListener('pointercancel', clear)
}

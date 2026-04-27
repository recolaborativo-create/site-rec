import { forceSimulation, forceManyBody, forceCenter, forceCollide, forceLink } from 'd3-force'
import { partners, SHOW_CONSTELLATION_LINES, type Partner } from '../../data/partners'

interface Node extends Partner {
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

interface Edge {
  source: string | Node
  target: string | Node
}

export function initConstellation(container: HTMLElement) {
  // Bail out if motion is disabled or container is hidden
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    container.classList.add('fallback-static')
    return () => {}
  }

  const nodes: Node[] = partners.map(p => ({ ...p }))
  const edges: Edge[] = []
  if (SHOW_CONSTELLATION_LINES) {
    partners.forEach(p =>
      p.related?.forEach(r => {
        if (partners.some(q => q.id === r)) edges.push({ source: p.id, target: r })
      }),
    )
  }

  const width = container.clientWidth
  const height = container.clientHeight

  const sim = forceSimulation(nodes as any)
    .force('charge', forceManyBody().strength(-90))
    .force('center', forceCenter(width / 2, height / 2))
    .force('collide', forceCollide().radius((d: any) => 32 + (d as Node).reach * 4))
  if (edges.length) {
    sim.force('link', forceLink(edges as any).id((d: any) => d.id).distance(110).strength(0.4))
  }

  // SVG layer for edges
  const svgNS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(svgNS, 'svg')
  svg.classList.add('constellation-edges')
  svg.setAttribute('width', String(width))
  svg.setAttribute('height', String(height))
  container.appendChild(svg)

  const lineEls = edges.map(e => {
    const line = document.createElementNS(svgNS, 'line')
    line.setAttribute('stroke', 'rgba(0,161,152,0.25)')
    line.setAttribute('stroke-width', '1')
    svg.appendChild(line)
    return { el: line, edge: e }
  })

  // Nodes
  const nodeEls = nodes.map(n => {
    const el = document.createElement('button')
    el.className = 'constellation-node'
    el.style.setProperty('--reach', String(n.reach))
    el.dataset.id = n.id
    el.setAttribute('aria-label', n.name)
    el.setAttribute('type', 'button')
    const img = document.createElement('img')
    img.src = n.logo
    img.alt = n.name
    img.loading = 'lazy'
    el.appendChild(img)
    container.appendChild(el)
    return { el, node: n }
  })

  // Drag
  let dragNode: Node | null = null
  function onPointerDown(e: PointerEvent) {
    const target = (e.target as HTMLElement).closest<HTMLElement>('.constellation-node')
    if (!target) return
    const id = target.dataset.id
    dragNode = nodes.find(n => n.id === id) || null
    if (!dragNode) return
    sim.alphaTarget(0.3).restart()
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

  // Click → side card (only fires if no drag happened)
  let downX = 0, downY = 0
  container.addEventListener('pointerdown', e => { downX = e.clientX; downY = e.clientY })
  nodeEls.forEach(({ el, node }) => {
    el.addEventListener('click', e => {
      const dx = e.clientX - downX, dy = e.clientY - downY
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
      ig.href = `https://instagram.com/${n.instagram.replace('@', '')}`
      ig.textContent = n.instagram
      ig.style.display = 'inline-block'
    } else {
      ig.style.display = 'none'
    }
    card.classList.add('open')
    card.setAttribute('aria-hidden', 'false')
  }

  // Tick
  sim.on('tick', () => {
    nodeEls.forEach(({ el, node }) => {
      const x = node.x ?? 0, y = node.y ?? 0
      el.style.transform = `translate(${x - 32}px, ${y - 18}px)`
    })
    lineEls.forEach(({ el, edge }) => {
      const s = (typeof edge.source === 'string' ? nodes.find(n => n.id === edge.source) : edge.source) as Node
      const t = (typeof edge.target === 'string' ? nodes.find(n => n.id === edge.target) : edge.target) as Node
      if (!s || !t) return
      el.setAttribute('x1', String(s.x ?? 0))
      el.setAttribute('y1', String(s.y ?? 0))
      el.setAttribute('x2', String(t.x ?? 0))
      el.setAttribute('y2', String(t.y ?? 0))
    })
  })

  // Pinch-zoom + pan (touch)
  attachPinchZoom(container)

  // Card close handler (idempotent)
  const card = document.querySelector<HTMLElement>('[data-partner-card]')
  card?.querySelector<HTMLButtonElement>('.card-close')?.addEventListener('click', () => {
    card.classList.remove('open')
    card.setAttribute('aria-hidden', 'true')
  })

  return () => sim.stop()
}

function attachPinchZoom(container: HTMLElement) {
  const pointers = new Map<number, { x: number; y: number }>()
  let lastDist = 0
  let scale = 1
  let panX = 0, panY = 0
  let lastPanX = 0, lastPanY = 0

  function apply() {
    container.style.transformOrigin = '50% 50%'
    container.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`
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
      if (lastDist > 0) scale = Math.max(0.6, Math.min(2.5, scale * (dist / lastDist)))
      lastDist = dist
      apply()
    } else if (pointers.size === 1) {
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

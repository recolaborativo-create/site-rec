export function initNavScroll() {
  const nav = document.querySelector<HTMLElement>('[data-adaptive-nav]')
  if (!nav) return

  let lastY = window.scrollY
  let ticking = false
  let hideTimer: ReturnType<typeof setTimeout> | null = null

  function show() {
    nav!.classList.remove('is-hidden')
  }
  function hide() {
    nav!.classList.add('is-hidden')
  }

  function update() {
    const y = window.scrollY

    if (y < 120) {
      // perto do topo: sempre visível
      show()
    } else if (y > lastY + 4) {
      // rolando pra baixo: esconde
      hide()
    } else if (y < lastY - 4) {
      // rolando pra cima: mostra
      show()
    }

    lastY = y
    ticking = false
  }

  window.addEventListener('scroll', () => {
    // quando parar de rolar: mostra a navbar após 400ms
    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      show()
    }, 400)

    if (!ticking) {
      requestAnimationFrame(update)
      ticking = true
    }
  }, { passive: true })

  // mouse perto do topo: mostra, mas não quando o modal de vídeo estiver aberto
  document.addEventListener('mousemove', (e) => {
    const modalOpen = document.getElementById('video-modal')?.classList.contains('open')
    if (e.clientY < 80 && !modalOpen) show()
  })

  update()
}

export function initNavDrawer() {
  const burger = document.querySelector<HTMLButtonElement>('.nav-burger')
  const drawer = document.querySelector<HTMLElement>('[data-nav-drawer]')
  const backdrop = drawer?.querySelector<HTMLElement>('.nav-drawer-backdrop')
  const panel = drawer?.querySelector<HTMLElement>('.nav-drawer-panel')
  const close = drawer?.querySelector<HTMLButtonElement>('.drawer-close')
  if (!burger || !drawer || !close) return

  // Mantém scroll position pra restaurar depois (evita "salto" ao fechar)
  let savedScrollY = 0

  function open() {
    savedScrollY = window.scrollY
    drawer!.classList.add('open')
    drawer!.setAttribute('aria-hidden', 'false')
    burger!.setAttribute('aria-expanded', 'true')

    // Lock body scroll mantendo posição visual
    document.body.style.position = 'fixed'
    document.body.style.top = `-${savedScrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'

    // Foco no botão fechar (acessibilidade)
    setTimeout(() => close!.focus(), 100)
  }

  function shut() {
    drawer!.classList.remove('open')
    drawer!.setAttribute('aria-hidden', 'true')
    burger!.setAttribute('aria-expanded', 'false')

    // Restaura scroll
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
    document.body.style.width = ''
    window.scrollTo(0, savedScrollY)

    // Foco volta pro burger
    burger!.focus()
  }

  // Toggle no burger
  burger.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('open')
    if (isOpen) shut(); else open()
  })

  // Fechar pelo botão X
  close.addEventListener('click', shut)

  // Fechar clicando no backdrop
  if (backdrop) {
    backdrop.addEventListener('click', shut)
  }

  // Fechar ao clicar num link de navegação
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', shut))

  // Fechar com ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) shut()
  })

  // Swipe-to-close: arrasta painel pra direita pra fechar
  if (panel) {
    let touchStartX = 0
    let touchCurrentX = 0
    let dragging = false

    panel.addEventListener('touchstart', (e) => {
      if (!drawer.classList.contains('open')) return
      touchStartX = e.touches[0].clientX
      touchCurrentX = touchStartX
      dragging = true
      panel.style.transition = 'none'
    }, { passive: true })

    panel.addEventListener('touchmove', (e) => {
      if (!dragging) return
      touchCurrentX = e.touches[0].clientX
      const delta = Math.max(0, touchCurrentX - touchStartX)
      panel.style.transform = `translateX(${delta}px)`
    }, { passive: true })

    panel.addEventListener('touchend', () => {
      if (!dragging) return
      dragging = false
      panel.style.transition = ''
      panel.style.transform = ''
      const delta = touchCurrentX - touchStartX
      // Se arrastou mais de 80px pra direita → fecha
      if (delta > 80) shut()
    })
  }
}

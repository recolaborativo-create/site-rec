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
  const close = drawer?.querySelector<HTMLButtonElement>('.drawer-close')
  if (!burger || !drawer || !close) return
  function open() {
    drawer!.classList.add('open')
    drawer!.setAttribute('aria-hidden', 'false')
    burger!.setAttribute('aria-expanded', 'true')
    document.body.style.overflow = 'hidden'
  }
  function shut() {
    drawer!.classList.remove('open')
    drawer!.setAttribute('aria-hidden', 'true')
    burger!.setAttribute('aria-expanded', 'false')
    document.body.style.overflow = ''
  }
  burger.addEventListener('click', open)
  close.addEventListener('click', shut)
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', shut))
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) shut()
  })
}

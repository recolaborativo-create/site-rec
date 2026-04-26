export function initNavScroll() {
  const nav = document.querySelector<HTMLElement>('[data-adaptive-nav]')
  if (!nav) return
  let ticking = false
  function update() {
    const scrolled = window.scrollY > 80
    nav!.classList.toggle('is-scrolled', scrolled)
    ticking = false
  }
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(update)
        ticking = true
      }
    },
    { passive: true },
  )
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

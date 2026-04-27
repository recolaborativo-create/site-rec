export function initReveal() {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]')
  if (!els.length) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('in-view'))
    return
  }
  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view')
          obs.unobserve(e.target)
        }
      })
    },
    { threshold: 0.15 },
  )
  els.forEach(el => obs.observe(el))
}

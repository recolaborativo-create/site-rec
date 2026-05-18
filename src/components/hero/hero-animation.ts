export function initHero() {
  const hero = document.querySelector<HTMLElement>('[data-hero] .hero-statement')
  if (!hero) return

  const words = [...hero.querySelectorAll<HTMLElement>('.word')]
  const delays = [80, 380, 680]
  const easing = 'cubic-bezier(0.22, 1, 0.36, 1)'
  const duration = 1100

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

  // Set the initial hidden state inline so the browser commits it before
  // we kick off the transition.
  for (const w of words) {
    w.style.transform = 'translateY(110%)'
    if (!reduceMotion) {
      w.style.transition = `transform ${duration}ms ${easing}`
    }
  }

  if (reduceMotion) {
    requestAnimationFrame(() => words.forEach(w => (w.style.transform = 'translateY(0)')))
    return
  }

  // Double rAF guarantees the initial frame is painted before we change the
  // target value, so the browser interpolates between them.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      words.forEach((w, i) => {
        const d = delays[i] ?? 0
        setTimeout(() => {
          w.style.transform = 'translateY(0)'
        }, d)
      })
      hero.classList.add('in-view')
    })
  })
}

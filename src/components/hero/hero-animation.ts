export function initHero() {
  const hero = document.querySelector<HTMLElement>('[data-hero] .hero-statement')
  if (!hero) return
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) hero.classList.add('in-view')
      })
    },
    { threshold: 0.4 },
  )
  observer.observe(hero)
}

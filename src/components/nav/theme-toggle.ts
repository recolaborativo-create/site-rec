// Toggle de tema claro/escuro com reveal circular (View Transitions API).
// Inspirado no animated-theme-toggler do magicui, porém vanilla — sem React/Tailwind.
// O tema é persistido em localStorage('rec-theme'); o <head> aplica antes do paint.

type Theme = 'light' | 'dark'

function current(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

function apply(theme: Theme) {
  if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
  else document.documentElement.removeAttribute('data-theme')
  try { localStorage.setItem('rec-theme', theme) } catch {}
}

export function initThemeToggle() {
  const btns = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')
  if (!btns.length) return

  btns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const next: Theme = current() === 'dark' ? 'light' : 'dark'

      const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches
      const supportsVT = typeof (document as any).startViewTransition === 'function'

      if (!supportsVT || prefersReduced) {
        apply(next)
        return
      }

      // Origem do reveal = centro do botão clicado
      const rect = btn.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )

      document.documentElement.classList.add('theme-switching')
      const transition = (document as any).startViewTransition(() => apply(next))

      try {
        await transition.ready
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 480,
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        )
        await transition.finished
      } catch {
        // se algo falhar, o tema já foi aplicado no callback — ok
      } finally {
        document.documentElement.classList.remove('theme-switching')
      }
    })
  })
}

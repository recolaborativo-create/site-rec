export function initTimelineScroll() {
  const tlEl = document.querySelector<HTMLElement>('[data-timeline-scroll]')
  if (!tlEl) return
  const tl: HTMLElement = tlEl
  let isDown = false
  let startX = 0
  let scrollLeft = 0
  tl.addEventListener('pointerdown', e => {
    isDown = true
    startX = e.pageX
    scrollLeft = tl.scrollLeft
    tl.style.cursor = 'grabbing'
    tl.setPointerCapture?.(e.pointerId)
  })
  function end() {
    isDown = false
    tl.style.cursor = ''
  }
  tl.addEventListener('pointerup', end)
  tl.addEventListener('pointercancel', end)
  tl.addEventListener('pointerleave', end)
  tl.addEventListener('pointermove', e => {
    if (!isDown) return
    const dx = e.pageX - startX
    tl.scrollLeft = scrollLeft - dx
  })
}

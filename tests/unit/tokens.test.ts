import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

describe('brand tokens', () => {
  const css = readFileSync('src/styles/tokens.css', 'utf-8')

  it('declares brand colors', () => {
    expect(css).toContain('--rec-purple: #3e4095')
    expect(css).toContain('--rec-teal: #00a198')
    expect(css).toContain('--rec-dark: #253439')
    expect(css).toContain('--rec-navy: #012659')
  })

  it('declares motion duration tokens', () => {
    expect(css).toContain('--motion-fast')
    expect(css).toContain('--motion-medium')
  })

  it('honors prefers-reduced-motion', () => {
    expect(css).toContain('prefers-reduced-motion')
  })
})

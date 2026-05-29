import { describe, it, expect } from 'vitest'
import { isValidBatch, batchLabel } from '../../src/utils/blog-batch'

describe('isValidBatch', () => {
  it('aceita data de domingo no formato YYYY-MM-DD', () => {
    expect(isValidBatch('2026-05-31')).toBe(true)
  })

  it('rejeita o formato mensal antigo YYYY-MM', () => {
    expect(isValidBatch('2026-05')).toBe(false)
  })

  it('rejeita vazio/nulo', () => {
    expect(isValidBatch('')).toBe(false)
    expect(isValidBatch(undefined)).toBe(false)
    expect(isValidBatch(null)).toBe(false)
  })
})

describe('batchLabel', () => {
  it('formata como "semana de DD de MÊS de AAAA"', () => {
    expect(batchLabel('2026-05-31')).toBe('semana de 31 de maio de 2026')
  })
})

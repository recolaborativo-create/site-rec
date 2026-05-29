import { describe, it, expect } from 'vitest'
import { sundayBatchKey, weekLabel } from '../../scripts/blog-auto/lib/batch.mjs'

describe('sundayBatchKey', () => {
  it('retorna o próprio dia quando já é domingo', () => {
    // 2026-05-31 é domingo
    expect(sundayBatchKey(new Date('2026-05-31T12:00:00Z'))).toBe('2026-05-31')
  })

  it('volta pro domingo da semana quando é outro dia', () => {
    // 2026-06-03 é quarta → domingo anterior = 2026-05-31
    expect(sundayBatchKey(new Date('2026-06-03T09:00:00Z'))).toBe('2026-05-31')
  })

  it('lida com virada de mês', () => {
    // 2026-06-02 (terça) → domingo = 2026-05-31
    expect(sundayBatchKey(new Date('2026-06-02T00:00:00Z'))).toBe('2026-05-31')
  })
})

describe('weekLabel', () => {
  it('bate com o batchLabel do front', () => {
    expect(weekLabel('2026-05-31')).toBe('semana de 31 de maio de 2026')
  })
})

import { describe, it, expect } from 'vitest'
import { sortReviews, REVIEWS_VISIBLE } from '../../src/utils/review-sort'

describe('sortReviews', () => {
  it('põe nota maior primeiro (5★ no topo)', () => {
    const input = [
      { rating: 3, createdAt: 100 },
      { rating: 5, createdAt: 50 },
      { rating: 1, createdAt: 200 },
    ]
    expect(sortReviews(input).map(r => r.rating)).toEqual([5, 3, 1])
  })

  it('empate de nota desempata pela mais recente', () => {
    const input = [
      { rating: 5, createdAt: 100 },
      { rating: 5, createdAt: 300 },
      { rating: 5, createdAt: 200 },
    ]
    expect(sortReviews(input).map(r => r.createdAt)).toEqual([300, 200, 100])
  })

  it('não muta o array original', () => {
    const input = [{ rating: 1, createdAt: 1 }, { rating: 5, createdAt: 2 }]
    const copy = [...input]
    sortReviews(input)
    expect(input).toEqual(copy)
  })

  it('expõe 2 avaliações visíveis antes do "ver mais"', () => {
    expect(REVIEWS_VISIBLE).toBe(2)
  })
})

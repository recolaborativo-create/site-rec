// Ordenação de avaliações: nota maior primeiro (5★ no topo),
// empate desempata pela mais recente. Usado no PartnerModal.
export interface SortableReview {
  rating: number
  createdAt: number
}

export function sortReviews<T extends SortableReview>(reviews: T[]): T[] {
  return reviews.slice().sort((a, b) => b.rating - a.rating || b.createdAt - a.createdAt)
}

// Quantas avaliações aparecem antes do botão "ver mais".
export const REVIEWS_VISIBLE = 2

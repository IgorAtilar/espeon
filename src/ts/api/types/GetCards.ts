import { Type } from '../../entities/Card'

export interface CardResponse {
  id: string
  name: string
  images: {
    small: string
    large: string
  }
  types?: Type[]
}

export interface GetCardsResponse {
  data?: {
    cards: CardResponse[]
    page: number
    pageSize: number
    totalCount: number
  }
  error?: boolean
  loading?: boolean
}

export interface GetCardsParams {
  cardName: string
  page?: number
  pageSize?: number
}

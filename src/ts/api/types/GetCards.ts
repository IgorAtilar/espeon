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

export type RawSearchCardsResponse =
  | {
      cards: CardResponse[]
      totalPages: number
    }
  | { message: string }

export interface SearchCardsResponse {
  error?: boolean
  message?: string
  cards?: CardResponse[]
  loading?: boolean
  totalPages?: number
}

export interface GetCardsParams {
  cardName: string
  page?: number
  pageSize?: number
}

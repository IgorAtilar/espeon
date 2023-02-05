import { RawSearchCardsResponse, SearchCardsResponse } from '../types/GetCards'

export const getApiUrl = (): string => import.meta.env.VITE_API_URL

type RawSearchCardsResponseWithLoading = RawSearchCardsResponse | { loading: boolean }

export const mapRawSearchCardsResponse = (response: RawSearchCardsResponseWithLoading) => {
  if ('loading' in response) {
    const result: SearchCardsResponse = {
      loading: true,
      error: false,
    }
    return result
  }

  if ('message' in response) {
    const { message } = response
    const result: SearchCardsResponse = {
      error: true,
      message,
      loading: false,
    }

    return result
  }

  const { cards, totalPages } = response

  const result: SearchCardsResponse = {
    error: false,
    cards,
    loading: false,
    totalPages,
  }
  return result
}

import { RawSearchCardsResponse, SearchCardsResponse } from '../types/GetCards'
import { GetTipsResponse, RawGetTipsResponse } from '../types/GetTips'

export const getApiUrl = (): string => import.meta.env.VITE_API_URL

type RawSearchCardsResponseWithLoading = RawSearchCardsResponse | { loading: boolean }
type RawGetTipsResponseWithLoading = RawGetTipsResponse | { loading: boolean }

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

export const mapRawGetTipsResponse = (response: RawGetTipsResponseWithLoading) => {
  if ('loading' in response) {
    const result: GetTipsResponse = {
      loading: true,
      error: false,
    }
    return result
  }

  if ('message' in response) {
    const { message } = response
    const result: GetTipsResponse = {
      error: true,
      message,
      loading: false,
    }

    return result
  }

  const { tips } = response

  const result: GetTipsResponse = {
    error: false,
    loading: false,
    tips,
  }
  return result
}

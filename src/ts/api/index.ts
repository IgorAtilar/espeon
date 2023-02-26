import { map, startWith, tap } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'

import { getApiUrl, mapRawGetTipsResponse, mapRawSearchCardsResponse } from './helpers'
import { GetCardsParams, RawSearchCardsResponse } from './types/GetCards'
import { GetTipsParams, RawGetTipsResponse } from './types/GetTips'

export const getSearchCardsUrl = ({ cardName, page = 1, pageSize = 20 }: GetCardsParams) => {
  const url = `${getApiUrl()}/cards/${cardName}?page=${page}&pageSize=${pageSize}`
  const encodedUrl = encodeURI(url)
  return encodedUrl
}

export const getTipsUrl = () => `${getApiUrl()}/tips`

export const searchCards = ({ cardName, page, pageSize }: GetCardsParams) =>
  fromFetch<RawSearchCardsResponse>(getSearchCardsUrl({ cardName, page, pageSize }), {
    selector: (response) => response.json(),
  }).pipe(
    startWith({
      loading: true,
    }),
    map(mapRawSearchCardsResponse)
  )

export const getTips = ({ deck }: GetTipsParams) =>
  fromFetch<RawGetTipsResponse>(getTipsUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(deck),
    selector: (response) => response.json(),
  }).pipe(
    tap(console.log),
    startWith({
      loading: true,
    }),
    map(mapRawGetTipsResponse)
  )

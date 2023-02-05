import { map, startWith } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'

import { getApiUrl, mapRawSearchCardsResponse } from './helpers'
import { GetCardsParams, RawSearchCardsResponse } from './types/GetCards'

export const getSearchCardsUrl = ({ cardName, page = 1, pageSize = 20 }: GetCardsParams) => {
  const url = `${getApiUrl()}/cards/${cardName}?page=${page}&pageSize=${pageSize}`
  const encodedUrl = encodeURI(url)
  return encodedUrl
}

export const searchCards = ({ cardName, page, pageSize }: GetCardsParams) =>
  fromFetch<RawSearchCardsResponse>(getSearchCardsUrl({ cardName, page, pageSize }), {
    selector: (response) => response.json(),
  }).pipe(
    startWith({
      loading: true,
    }),
    map(mapRawSearchCardsResponse)
  )

import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { GetCardsParams, GetCardsResponse } from './types/GetCards';

export const getPokemonApiHeaders = () => {
  const headers = new Headers();
  headers.append('X-Api-Key', import.meta.env.VITE_POKEMON_TCG_API_KEY);

  return headers;
};

export const getCardsUrl = ({
  cardName,
  page = 1,
  pageSize = 20,
}: GetCardsParams) => {
  const url = `https://api.pokemontcg.io/v2/cards?q=name:${cardName}&page=${page}&pageSize=${pageSize}`;
  const encodedUrl = encodeURI(url);
  return encodedUrl;
};

export const getCards = ({ cardName, page, pageSize }: GetCardsParams) =>
  fromFetch(getCardsUrl({ cardName, page, pageSize }), {
    headers: getPokemonApiHeaders(),
  }).pipe(
    switchMap((response) => {
      if (response.ok) {
        return response.json();
      }
      return of({ error: true });
    }),
    catchError(() => {
      return of({ error: true });
    }),
    startWith({
      loading: true,
    }),
    map(({ data: cards, error, loading, page, pageSize, totalCount }) => {
      const result: GetCardsResponse = {
        data: {
          cards: cards || [],
          page,
          pageSize,
          totalCount,
        },
        error,
        loading,
      };
      return result;
    })
  );

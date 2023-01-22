import Tilt from 'vanilla-tilt';
import { fromFetch } from 'rxjs/fetch';
import {
  catchError,
  debounceTime,
  EMPTY,
  fromEvent,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

const isMobile = () => window.innerWidth <= 800;

const getPokemonTCGApiHeaders = () => {
  const headers = new Headers();
  headers.append('X-Api-Key', import.meta.env.VITE_POKEMON_TCG_API_KEY);

  return headers;
};

const searchInput = <HTMLInputElement>document.querySelector('#search-input');

const input$ = fromEvent<InputEvent>(searchInput, 'input');

type Card = {
  id: string;
  name: string;
  images: {
    small: string;
    large: string;
  };
};

const createCardElement = (card: Card) => {
  const button = document.createElement('button');
  button.setAttribute('title', card.name);
  button.setAttribute('class', 'card');

  const image = document.createElement('img');
  image.setAttribute('src', card.images.large);
  image.setAttribute('alt', `Carta do pokémon ${card.name}`);

  button.appendChild(image);

  return button;
};

const clearCardsContainer = () => {
  const cardsContainer = document.querySelector('#cards-container')!;
  cardsContainer.innerHTML = '';
};

const insertPokemonCards = (cards: Card[]) => {
  const cardsContainer = document.querySelector('#cards-container')!;

  cards.forEach((card) => {
    const cardElement = createCardElement(card);
    cardsContainer.appendChild(cardElement);

    if (isMobile()) return;

    Tilt.init(cardElement, {
      glare: true,
      'max-glare': 0.5,
    });
  });
};

const insertLoading = () => {
  const cardsContainer = document.querySelector('#cards-container')!;
  cardsContainer.innerHTML = `<div id="loading-container" aria-busy="true">
  <img src="/assets/espeon.gif" alt="Gif do Pokémon Espeon" />
  <span>Carregando cartas...</span>
</div>`;
};

const insertError = () => {
  const cardsContainer = document.querySelector('#cards-container')!;
  cardsContainer.innerHTML = `<div id="error-container">
  <span
    >Ops, um erro ocorreu. Tente buscar por outro termo ou tente
    novamente mais tarde.</span
  >
</div>`;
};

const removeExtraSpaces = (value: string) => value.replace(/\s+/g, ' ').trim();

const getEncodedUrl = (name: string) => {
  const url = `https://api.pokemontcg.io/v2/cards?q=name:${name}&page=1&pageSize=20`;
  const encodedUrl = encodeURI(url);
  return encodedUrl;
};

input$
  .pipe(
    map((event) => !!(<HTMLInputElement>event.target).value.length),
    tap((value) => {
      if (value) return;
      clearCardsContainer();
    })
  )
  .subscribe();

const fetchCards = (cardName: string) =>
  fromFetch(getEncodedUrl(cardName), {
    headers: getPokemonTCGApiHeaders(),
  });

type FetchCardsResponse = {
  error?: boolean;
  loading?: boolean;
  data?: Card[];
};

input$
  .pipe(
    map((event) => (<HTMLInputElement>event.target).value || ''),
    map(removeExtraSpaces),
    debounceTime(1000),
    switchMap((cardName) => {
      if (!cardName) {
        return EMPTY;
      }
      return fetchCards(cardName).pipe(
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
        })
      );
    })
  )
  .subscribe(({ data, error, loading }: FetchCardsResponse) => {
    clearCardsContainer();

    if (loading) {
      insertLoading();
      return;
    }

    if (error) {
      insertError();
      return;
    }

    insertPokemonCards(data || []);
  });

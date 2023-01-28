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

const createElement = <K extends keyof HTMLElementTagNameMap>({
  tagName,
  attributes,
}: {
  tagName: K;
  attributes?: Record<string, string>;
}): HTMLElementTagNameMap[K] => {
  const el = document.createElement(tagName);
  Object.entries(attributes || {}).forEach(([key, value]) =>
    el.setAttribute(key, value)
  );
  return el;
};

const createCardElement = (card: Card) => {
  const button = createElement({
    tagName: 'button',
    attributes: {
      class: 'card',
      title: card.name,
    },
  });

  const image = createElement({
    tagName: 'img',
    attributes: {
      src: card.images.large,
      alt: `Carta do pokémon ${card.name}`,
    },
  });

  button.appendChild(image);

  return button;
};

const clearCardsContainer = () => {
  const pokeballBackgroundContainer = document.querySelector(
    '#background-container'
  )!;
  const cardsContainer = document.querySelector('#cards-container')!;

  const image = createElement({
    tagName: 'img',
    attributes: {
      id: 'pokeball-bg',
      src: '/assets/pokeball-bg.svg',
    },
  });

  pokeballBackgroundContainer.replaceChildren(image);
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
  const pokeballBackgroundImage = document.querySelector('#pokeball-bg')!;
  pokeballBackgroundImage.classList.add('rotation-animation');
};

const insertError = () => {
  const backgroundContainer = document.querySelector('#background-container')!;
  const pokeballTop = createElement({
    tagName: 'img',
    attributes: {
      src: '/assets/pokeball-slice-top.svg',
    },
  });

  const pokeballBottom = createElement({
    tagName: 'img',
    attributes: {
      src: '/assets/pokeball-slice-bottom.svg',
    },
  });

  const text = createElement({
    tagName: 'span',
  });

  text.innerHTML = `Ops, um erro aconteceu :( <br />
  Tente buscar por outro termo ou tente novamente mais tarde.`;

  backgroundContainer.replaceChildren(pokeballTop, text, pokeballBottom);
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

const modal = document.querySelector('dialog')!;
const modalContainer = document.querySelector('#modal-container')!;

modal.addEventListener('click', () => modal.close());

modalContainer.addEventListener('click', (event) => event.stopPropagation());

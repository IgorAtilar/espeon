import './style.css';
import Tilt from 'vanilla-tilt';
import { fromFetch } from 'rxjs/fetch';
import {
  catchError,
  debounce,
  fromEvent,
  interval,
  map,
  of,
  switchMap,
} from 'rxjs';

const headers = new Headers();
headers.append('X-Api-Key', import.meta.env.VITE_POKEMON_TCG_API_KEY);

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

const handleOnCardMouseMove = (e: MouseEvent) => {
  const { currentTarget } = e;

  const target = currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  target.style.setProperty('--mouse-x', `${x}px`);
  target.style.setProperty('--mouse-y', `${y}px`);
};

const createCardElement = (card: Card) => {
  const button = document.createElement('button');
  button.setAttribute('title', card.name);
  button.setAttribute('class', 'card');

  const image = document.createElement('img');
  image.setAttribute('src', card.images.large);
  image.setAttribute('alt', `Carta do pokémon ${card.name}`);

  button.appendChild(image);

  Tilt.init(button);
  button.onmousemove = handleOnCardMouseMove;

  return button;
};

const insertCards = (cards: Card[]) => {
  const cardsContainer = document.querySelector('#cards-container')!;

  cards.forEach((card) => {
    const cardElement = createCardElement(card);
    cardsContainer.appendChild(cardElement);
    Tilt.init(cardElement);
  });
};

input$
  .pipe(
    map((event) => (<HTMLInputElement>event.target).value),
    debounce(() => interval(200)),
    switchMap((name = '') =>
      fromFetch(
        `https://api.pokemontcg.io/v2/cards?q=name:${name}&page=1&pageSize=20`,
        {
          headers,
        }
      ).pipe(
        switchMap((response) => {
          if (response.ok) {
            return response.json();
          } else {
            return of({ error: true, message: `Error ${response.status}` });
          }
        }),
        catchError((err) => {
          return of({ error: true, message: err.message as string });
        })
      )
    ),
    map((response) => (response?.data as Card[]) || [])
  )
  .subscribe(insertCards);

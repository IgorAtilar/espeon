import './style.css';
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

const createCardElement = (
  card: Card
) => `<button title="${card.name}" class="card">
<img src="${card.images.large}"  alt="Carta do pokémon ${card.name}"/>
</button>`;

const insertCards = (cards: Card[]) => {
  const cardsContainer = document.querySelector('#cards-container')!;

  const cardsElements = cards.map(createCardElement).join('');

  cardsContainer.innerHTML = cardsElements;
};

input$
  .pipe(
    map((event) => (<HTMLInputElement>event.target).value),
    debounce(() => interval(200)),
    switchMap((name = '') =>
      fromFetch(`https://api.pokemontcg.io/v2/cards?q=name:${name}`, {
        headers,
      }).pipe(
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

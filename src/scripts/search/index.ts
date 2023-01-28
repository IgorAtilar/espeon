import Tilt from 'vanilla-tilt';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { createElement, isMobile } from '../helpers/dom';
import { removeExtraSpaces } from '../helpers/string';
import { Card } from '../entities/Card';
import { getCards } from '../api';
import { mapCardResponseToCard } from '../helpers/entities';
import pokeballBgURL from '../../assets/pokeball-bg.svg';
import pokeballSliceTopURL from '../../assets/pokeball-slice-top.svg';
import pokeballSliceBottomURL from '../../assets/pokeball-slice-bottom.svg';

const searchInput = <HTMLInputElement>document.querySelector('#search-input');
const cardsContainer = document.querySelector('#cards-container')!;
const pokeballBackgroundContainer = document.querySelector(
  '#background-container'
)!;

const page$ = new BehaviorSubject({
  page: 1,
});

const totalPages$ = new BehaviorSubject<{ totalPages?: number }>({
  totalPages: undefined,
});
const input$ = fromEvent<InputEvent>(searchInput, 'input');

const intersectionObserver = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) {
    const {
      value: { page },
    } = page$;
    const {
      value: { totalPages },
    } = totalPages$;

    if (!totalPages || page < totalPages) {
      page$.next({ page: page + 1 });
    }
  }
});

const createCardElement = ({ name, imageURL }: Card) => {
  const button = createElement({
    tagName: 'button',
    attributes: {
      class: 'card',
      title: name,
    },
  });

  const image = createElement({
    tagName: 'img',
    attributes: {
      src: imageURL,
      alt: `Carta do pokémon ${name}`,
    },
  });

  button.appendChild(image);

  return button;
};

const clearCardsContainer = () => {
  const image = createElement({
    tagName: 'img',
    attributes: {
      id: 'pokeball-bg',
      src: pokeballBgURL,
    },
  });

  pokeballBackgroundContainer.replaceChildren(image);
  cardsContainer.innerHTML = '';
};

const insertPokemonCards = (cards: Card[]) => {
  cards.forEach((card, index) => {
    const cardElement = createCardElement(card);
    const lastELement = cardsContainer.lastElementChild;
    const isLastCard = cards.length - 1 === index;

    if (lastELement) {
      intersectionObserver.unobserve(lastELement);
    }

    if (isLastCard) {
      intersectionObserver.observe(cardElement);
    }

    cardsContainer.appendChild(cardElement);

    if (isMobile()) return;

    Tilt.init(cardElement, {
      glare: true,
      'max-glare': 0.5,
    });
  });
};

const handleLoading = (loading?: boolean) => {
  const pokeballBackgroundImage = document.querySelector('#pokeball-bg')!;

  if (!loading) {
    pokeballBackgroundImage.classList.remove('rotation-animation');
    return;
  }
  pokeballBackgroundImage.classList.add('rotation-animation');
};

const insertError = () => {
  const pokeballTop = createElement({
    tagName: 'img',
    attributes: {
      src: pokeballSliceTopURL,
    },
  });

  const pokeballBottom = createElement({
    tagName: 'img',
    attributes: {
      src: pokeballSliceBottomURL,
    },
  });

  const text = createElement({
    tagName: 'span',
  });

  text.innerHTML = `Ops, um erro aconteceu :( <br />
  Tente buscar por outro termo ou tente novamente mais tarde.`;

  pokeballBackgroundContainer.replaceChildren(
    pokeballTop,
    text,
    pokeballBottom
  );
};

const result$ = input$.pipe(
  map((event) => (<HTMLInputElement>event.target).value || ''),
  map(removeExtraSpaces),
  debounceTime(1000),
  distinctUntilChanged(),
  tap(clearCardsContainer),
  filter((cardName) => !!cardName),
  tap(() => page$.next({ page: 1 })),
  switchMap((cardName) =>
    page$.pipe(switchMap(({ page }) => getCards({ cardName, page })))
  ),
  tap(({ data }) => {
    if (data?.totalCount && data?.pageSize) {
      const totalPages = Math.ceil(data.totalCount / data.pageSize);
      totalPages$.next({ totalPages });
    }
  })
);

result$.subscribe(({ data, loading, error }) => {
  handleLoading(loading);

  if (error) {
    insertError();
    return;
  }

  const cards = data?.cards?.map(mapCardResponseToCard) || [];
  insertPokemonCards(cards);
});
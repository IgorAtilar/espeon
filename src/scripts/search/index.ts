import Tilt from 'vanilla-tilt';
import { debounceTime, EMPTY, fromEvent, map, switchMap, tap } from 'rxjs';
import { createElement, isMobile } from '../helpers/dom';
import { removeExtraSpaces } from '../helpers/string';
import { Card } from '../entities/Card';
import { getCards } from '../api';
import { mapCardResponseToCard } from '../helpers/entities';
import pokeballBgURL from '../../assets/pokeball-bg.svg';
import pokeballSliceTopURL from '../../assets/pokeball-slice-top.svg';
import pokeballSliceBottomURL from '../../assets/pokeball-slice-bottom.svg';

const searchInput = <HTMLInputElement>document.querySelector('#search-input');
const input$ = fromEvent<InputEvent>(searchInput, 'input');
const cardsContainer = document.querySelector('#cards-container')!;
const pokeballBackgroundContainer = document.querySelector(
  '#background-container'
)!;

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

input$
  .pipe(
    map((event) => !!(<HTMLInputElement>event.target).value.length),
    tap((value) => {
      if (value) return;
      clearCardsContainer();
    })
  )
  .subscribe();

input$
  .pipe(
    map((event) => (<HTMLInputElement>event.target).value || ''),
    map(removeExtraSpaces),
    debounceTime(1000),
    switchMap((cardName) => {
      if (!cardName) {
        return EMPTY;
      }
      return getCards({ cardName });
    })
  )
  .subscribe(({ data, error, loading }) => {
    clearCardsContainer();

    if (loading) {
      insertLoading();
      return;
    }

    if (error) {
      insertError();
      return;
    }

    const cards = data?.map(mapCardResponseToCard) || [];

    insertPokemonCards(cards);
  });

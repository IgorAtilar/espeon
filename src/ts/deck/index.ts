import { fromEvent, map, tap } from 'rxjs';
import { Card } from '../entities/Card';
import { Deck } from '../entities/Deck';
import { createElement, swapElements } from '../helpers/dom';
import { DECK_STORAGE_KEY } from '../helpers/storage';

const pageLoaded$ = fromEvent(window, 'DOMContentLoaded');

export const addCardToDeck = (card: Card) => {
  const rawDeck = localStorage.getItem(DECK_STORAGE_KEY);
  const hasSavedDeck = typeof rawDeck === 'string' && rawDeck;

  if (!hasSavedDeck) {
    const cards = [card];
    localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify({ cards }));
    return;
  }

  const deck = <Deck>JSON.parse(rawDeck);

  const { cards } = deck;

  const newCards = [...cards, card];

  localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify({ cards: newCards }));
};

export const setDeckCards = (cards: Card[]) => {
  localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify({ cards }));
};

export const getDeckCards = () => {
  const rawDeck = localStorage.getItem(DECK_STORAGE_KEY);
  const hasSavedDeck = typeof rawDeck === 'string' && rawDeck;

  if (!hasSavedDeck) {
    return [] as Card[];
  }

  const deck = <Deck>JSON.parse(rawDeck);

  const { cards } = deck;

  return cards || [];
};

const createDeckCard = ({ imageURL, id, name, types }: Card) => {
  const deckCardImage = createElement({
    tagName: 'img',
    attributes: {
      class: 'deck-card',
      src: imageURL,
      ['data-id']: id,
      ['data-name']: name,
      ['data-types']: JSON.stringify(types),
      ['data-imageurl']: imageURL,
    },
  });

  return deckCardImage;
};

const insertDeckCardsElements = (cards: Card[]) => {
  const deckCardsContainer = document.querySelector('#deck-container')!;
  const deckCards: HTMLDivElement[] = [];

  cards.forEach((card) => {
    const deckCard = createDeckCard(card);
    deckCards.push(deckCard);
    deckCardsContainer.appendChild(deckCard);
  });
};

const parseCardDataSetToCard = (cardElement: HTMLElement) => {
  const { id, imageurl, name, types } = cardElement.dataset;

  return {
    id: id || '',
    imageURL: imageurl || '',
    name: name || '',
    types: JSON.parse(types || '') || [],
  };
};

const swapDeckCard = (
  firstCardElement: HTMLElement,
  secondCardElement: HTMLElement
) => {
  swapElements(firstCardElement, secondCardElement);

  const firstCardData: Card = parseCardDataSetToCard(firstCardElement);

  const secondCardData: Card = parseCardDataSetToCard(secondCardElement);

  const deckCards = getDeckCards();

  const firstCardIdx = deckCards.findIndex(
    (card) => card.id === firstCardData.id
  );

  const secondCardIdx = deckCards.findIndex(
    (card) => card.id === secondCardData.id
  );

  const newDeckCards = deckCards.map((card, idx) => {
    if (idx === firstCardIdx) return secondCardData;
    if (idx === secondCardIdx) return firstCardData;
    return card;
  });

  setDeckCards(newDeckCards);
};

const initDragHandlers = () => {
  const cards = document.querySelectorAll('.deck-card');

  cards.forEach((card) => {
    const dragStart$ = fromEvent(card, 'dragstart');
    const drop$ = fromEvent(card, 'drop');
    const dragOver$ = fromEvent(card, 'dragover');
    const dragEnd$ = fromEvent(card, 'dragend');

    dragOver$.pipe(tap((event) => event.preventDefault())).subscribe();

    dragStart$
      .pipe(map((event) => event.target as HTMLImageElement))
      .subscribe((card) => card.classList.add('is-dragging'));

    dragEnd$
      .pipe(map((event) => event.target as HTMLImageElement))
      .subscribe((card) => card.classList.remove('is-dragging'));

    drop$
      .pipe(
        tap((event) => event.preventDefault()),
        map((event) => event.target as HTMLImageElement)
      )
      .subscribe((card) => {
        const cardBeingDragged = <HTMLImageElement>(
          document.querySelector('.is-dragging')!
        );

        swapDeckCard(card, cardBeingDragged);
      });
  });
};

pageLoaded$.subscribe(() => {
  const cards = getDeckCards();
  insertDeckCardsElements(cards);
  initDragHandlers();
});

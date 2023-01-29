import { fromEvent } from 'rxjs';
import { Card } from '../entities/Card';
import { Deck } from '../entities/Deck';
import { createElement } from '../helpers/dom';
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

export const getDeckCards = () => {
  const rawDeck = localStorage.getItem(DECK_STORAGE_KEY);
  const hasSavedDeck = typeof rawDeck === 'string' && rawDeck;

  if (!hasSavedDeck) {
    return [];
  }

  const deck = <Deck>JSON.parse(rawDeck);
  const { cards } = deck;

  return cards || [];
};

const onDeckCardDragStart = (event: DragEvent) => {
  const target = event.target as HTMLDivElement;

  target.classList.add('is-dragging');
};

const handleDeckCardDragEnd = (event: DragEvent) => {
  const target = event.target as HTMLDivElement;
  const { id } = target.dataset;
  target.classList.remove('is-dragging');

  const deckCardsElements = <HTMLDivElement[]>(
    (<unknown>document.querySelectorAll('.deck-card'))
  );

  deckCardsElements.forEach((deckCardElement) => {
    const { id: cardId } = deckCardElement.dataset;

    if (cardId === id) return;

    deckCardElement.classList.remove('highlight');
  });
};

const handleDeckCardDragOver = (event: DragEvent) => {
  const target = event.target as HTMLDivElement;

  const targetImage = <HTMLImageElement>target.firstElementChild;
  const cardBeingDragged = document.querySelector('.is-dragging')!;
  const cardImage = <HTMLImageElement>cardBeingDragged.firstElementChild;

  setTimeout(() => {
    target.replaceChildren(cardImage);
    cardBeingDragged.replaceChildren(targetImage);
  }, 500);
};


const createDeckCard = ({ imageURL, id }: Card) => {
  const deckCard = createElement({
    tagName: 'div',
    attributes: {
      class: 'deck-card',
      draggable: 'true',
      ['data-id']: id,
    },
  });
  const deckCardImage = createElement({
    tagName: 'img',
    attributes: {
      src: imageURL,
      draggable: 'false',
    },
  });

  deckCard.appendChild(deckCardImage);

  return deckCard;
};

const insertDeckCards = (cards: Card[]) => {
  const deckCardsContainer = document.querySelector('#deck-container')!;
  const deckCards: HTMLDivElement[] = [];

  cards.forEach((card) => {
    const deckCard = createDeckCard(card);
    deckCards.push(deckCard);
    deckCardsContainer.appendChild(deckCard);
  });

  return deckCards;
};

pageLoaded$.subscribe(() => {
  const cards = getDeckCards();
  const deckCards = insertDeckCards(cards);

  deckCards.forEach((deckCard) => {
    deckCard.addEventListener('dragstart', onDeckCardDragStart);
    deckCard.addEventListener('dragend', handleDeckCardDragEnd);
    deckCard.addEventListener('dragover', handleDeckCardDragOver);
  });
});

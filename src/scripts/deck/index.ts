import { fromEvent } from 'rxjs';
import { Card } from '../entities/Card';
import { Deck } from '../entities/Deck';
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

const insertCards = (cards: Card[]) => {
  const deckCardsContainer = document.querySelector('#deck-container')!;

  cards.forEach(({ imageURL }) => {
    deckCardsContainer.innerHTML += `<button class="deck-card">
    <img src="${imageURL}" />
  </button>`;
  });
};

pageLoaded$.subscribe(() => {
  const cards = getDeckCards();
  insertCards(cards);
});

import { Card } from './Card'

export type DeckCard = Card & {
  count: number
}

export type DeckCards = Map<string, DeckCard>

export interface Deck {
  cards: DeckCards
}

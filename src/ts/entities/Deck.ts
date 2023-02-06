import { Card } from './Card'

export type DeckCard = Card & {
  count: number
}

export interface Deck {
  cards: Map<string, DeckCard>
}

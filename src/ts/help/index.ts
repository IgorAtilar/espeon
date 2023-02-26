import { debounceTime, fromEvent, switchMap } from 'rxjs'
import { getTips } from '../api'
import { getDeckCards } from '../deck'
import { Type } from '../entities/Card'
import { DeckCard, DeckCards } from '../entities/Deck'
import { createElement } from '../helpers/dom'

const getTipsButton = document.querySelector('#get-tips-btn') as HTMLButtonElement

const pageLoaded$ = fromEvent(window, 'DOMContentLoaded')
const getTipsClick = fromEvent(getTipsButton, 'click')

const createDeckCardPreviewElement = ({ imageURL, types, name }: DeckCard) => {
  const type = types?.[0] ?? Type.Colorless

  const img = createElement({
    tagName: 'img',
    attributes: {
      src: imageURL,
      class: type.toLowerCase(),
      alt: `Image of ${name} card`,
    },
  })

  return img
}

const insertDeckCardsPreview = (deckCards: DeckCards) => {
  if (deckCards.size < 3) {
    return
  }

  const deckPreviewContainer = document.querySelector('#deck-preview-container')

  if (!deckPreviewContainer) return

  const [first, second, third] = Array.from(deckCards).map(([_, card]) => card)

  const firstElement = createDeckCardPreviewElement(first)
  const secondElement = createDeckCardPreviewElement(second)
  const thirdElement = createDeckCardPreviewElement(third)

  deckPreviewContainer.appendChild(firstElement)
  deckPreviewContainer.appendChild(secondElement)
  deckPreviewContainer.appendChild(thirdElement)
}

const getTipsDeckCardsParams = () => {
  const deckCards = getDeckCards()
  const formattedDeckCards = Array.from(deckCards)
    .map(([_, card]) => card)
    .map(({ name, supertype }) => ({ name, type: supertype }))

  return { deck: formattedDeckCards }
}

getTipsClick
  .pipe(
    debounceTime(1000),
    switchMap(() => getTips(getTipsDeckCardsParams()))
  )
  .subscribe()

pageLoaded$.subscribe(() => {
  const cards = getDeckCards()
  insertDeckCardsPreview(cards)
})

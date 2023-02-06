import { fromEvent, map, tap } from 'rxjs'
import { Card, Type } from '../entities/Card'
import { Deck, DeckCard } from '../entities/Deck'
import { createElement, swapElements } from '../helpers/dom'
import { DECK_STORAGE_KEY } from '../helpers/storage'

const pageLoaded$ = fromEvent(window, 'DOMContentLoaded')

export const addCardToDeck = (card: Card) => {
  const rawDeck = localStorage.getItem(DECK_STORAGE_KEY)
  const hasSavedDeck = typeof rawDeck === 'string' && !(rawDeck.length === 0)

  if (!hasSavedDeck) {
    const cards = new Map()
    cards.set(card.id, { ...card, count: 1 })
    localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify({ cards: Array.from(cards.entries()) }))
    return
  }

  const deck = JSON.parse(rawDeck) as Deck

  const { cards } = deck

  const parsedCards = new Map(cards)

  const savedCard = parsedCards.get(card.id)
  const hasSavedCard = !!savedCard?.id

  if (!hasSavedCard) {
    const newCards = parsedCards.set(card.id, { ...card, count: 1 })

    localStorage.setItem(
      DECK_STORAGE_KEY,
      JSON.stringify({ cards: Array.from(newCards.entries()) })
    )

    return
  }

  const { count } = savedCard

  const newCards = parsedCards.set(card.id, { ...card, count: count + 1 })

  localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify({ cards: Array.from(newCards.entries()) }))
}

export const removeCardOnDeck = (card: Card) => {
  const rawDeck = localStorage.getItem(DECK_STORAGE_KEY)
  const hasSavedDeck = typeof rawDeck === 'string' && !(rawDeck.length === 0)

  if (!hasSavedDeck) {
    return
  }

  const deck = JSON.parse(rawDeck) as Deck

  const { cards } = deck

  const parsedCards = new Map(cards)

  const savedCard = parsedCards.get(card.id)
  const hasSavedCard = !!savedCard?.id

  if (!hasSavedCard) {
    return
  }

  const { count } = savedCard

  if (count - 1 > 0) {
    const newCards = parsedCards.set(card.id, { ...card, count: count - 1 })

    localStorage.setItem(
      DECK_STORAGE_KEY,
      JSON.stringify({ cards: Array.from(newCards.entries()) })
    )

    return
  }

  parsedCards.delete(card.id)

  localStorage.setItem(
    DECK_STORAGE_KEY,
    JSON.stringify({ cards: Array.from(parsedCards.entries()) })
  )
}

export const setDeckCards = (deckCards: Deck['cards']) => {
  localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify({ cards: Array.from(deckCards.entries()) }))
}

export const getDeckCards = () => {
  const rawDeck = localStorage.getItem(DECK_STORAGE_KEY)
  const hasSavedDeck = typeof rawDeck === 'string' && !(rawDeck.length === 0)

  if (!hasSavedDeck) {
    return new Map() as Deck['cards']
  }

  const deck = JSON.parse(rawDeck) as Deck

  const { cards } = deck

  return new Map(cards)
}

const parseCardDataSetToCard = (cardElement: HTMLElement) => {
  const { id, imageurl, name, types = '', count } = cardElement.dataset

  const parsedCard: DeckCard = {
    id: id ?? '',
    imageURL: imageurl ?? '',
    name: name ?? '',
    types: JSON.parse(types) ?? [],
    count: Number(count),
  }
  return parsedCard
}

const removeDeckCardElement = ({ id, count }: DeckCard) => {
  const deckCardElement = document.querySelector(`[data-id="${id}"]`) as HTMLElement

  if (!deckCardElement) return

  const newCount = count - 1

  if (newCount > 0) {
    const counterElement = deckCardElement.querySelector('.deck-card-counter')
    deckCardElement.dataset.count = String(newCount)

    if (!counterElement) return

    counterElement.textContent = String(newCount)

    return
  }

  deckCardElement?.parentNode?.removeChild(deckCardElement)
}

const removeDeckCard = (deckCard: DeckCard) => {
  removeDeckCardElement(deckCard)
  removeCardOnDeck(deckCard)
}

const createDeckCard = ({ imageURL, id, name, types, count }: DeckCard) => {
  const type = types?.[0] ?? Type.Colorless

  const deckCardContainer = createElement({
    tagName: 'div',
    attributes: {
      class: `deck-card ${type.toLowerCase()}`,
      draggable: 'true',
      'data-id': id,
      'data-name': name,
      'data-types': JSON.stringify(types),
      'data-imageurl': imageURL,
      'data-count': String(count),
    },
  })

  const deckCardRemoveButton = createElement({
    tagName: 'button',
    attributes: {
      class: 'deck-card-remove-btn',
      'data-id': id,
      title: 'remove card',
    },
  })

  const deckCardRemoveIcon = createElement({
    tagName: 'i',
    attributes: {
      class: 'ph-x-bold',
    },
  })
  deckCardRemoveButton.appendChild(deckCardRemoveIcon)

  const deckCardImageWrapper = createElement({
    tagName: 'div',
    attributes: {
      draggable: 'false',
      class: 'deck-card-image-wrapper',
    },
  })

  const deckCardImage = createElement({
    tagName: 'img',
    attributes: {
      src: imageURL,
      draggable: 'false',
    },
  })

  deckCardImageWrapper.appendChild(deckCardImage)

  const deckCardCounter = createElement({
    tagName: 'div',
    attributes: {
      class: 'deck-card-counter',
    },
  })

  deckCardCounter.innerText = String(count)

  deckCardContainer.appendChild(deckCardRemoveButton)
  deckCardContainer.appendChild(deckCardImageWrapper)
  deckCardContainer.appendChild(deckCardCounter)

  return deckCardContainer
}

const insertDeckCardsElements = (cards: Deck['cards']) => {
  const deckCardsContainer = document.querySelector('#deck-container')
  const deckCards: HTMLDivElement[] = []

  cards.forEach((card) => {
    const deckCard = createDeckCard(card)
    deckCards.push(deckCard)
    deckCardsContainer?.appendChild?.(deckCard)
  })
}

const swapDeckCard = (firstCardElement: HTMLElement, secondCardElement: HTMLElement) => {
  swapElements(firstCardElement, secondCardElement)

  const firstCardData: DeckCard = parseCardDataSetToCard(firstCardElement)

  const secondCardData: DeckCard = parseCardDataSetToCard(secondCardElement)

  const deckCards = getDeckCards()

  const { id: firstId } = firstCardData
  const { id: secondId } = secondCardData

  const deckCardsArray = Array.from(deckCards)

  const firstCardIndex = deckCardsArray.findIndex(([id]) => id === firstId)
  const secondCardIndex = deckCardsArray.findIndex(([id]) => id === secondId)

  const temp = deckCardsArray[firstCardIndex]
  deckCardsArray[firstCardIndex] = deckCardsArray[secondCardIndex]
  deckCardsArray[secondCardIndex] = temp

  const swapedDeck = new Map(deckCardsArray)

  setDeckCards(swapedDeck)
}

const initDragHandlers = () => {
  const cards = document.querySelectorAll('.deck-card')
  const removeCardZone = document.querySelector('.remove-card-zone')

  if (removeCardZone) {
    const dragOverRemoveCardZone$ = fromEvent(removeCardZone, 'dragover')
    const dragLeaveRemoveCardZone$ = fromEvent(removeCardZone, 'dragleave')
    const dropRemoveCardZone$ = fromEvent(removeCardZone, 'drop')

    dragOverRemoveCardZone$
      .pipe(
        tap((event) => {
          event.preventDefault()
        })
      )
      .subscribe(() => {
        removeCardZone.classList.add('on-dragover-remove-card-zone')
      })

    dragLeaveRemoveCardZone$
      .pipe(
        tap((event) => {
          event.preventDefault()
        })
      )
      .subscribe(() => {
        removeCardZone.classList.remove('on-dragover-remove-card-zone')
      })

    dropRemoveCardZone$
      .pipe(
        tap((event) => {
          event.preventDefault()
        })
      )
      .subscribe(() => {
        const cardBeingDragged = document.querySelector<HTMLElement>('.is-dragging')

        if (!cardBeingDragged) return

        const parsedDeckCard = parseCardDataSetToCard(cardBeingDragged)

        removeDeckCard(parsedDeckCard)
        removeCardZone.classList.remove('on-dragover-remove-card-zone')
      })
  }

  cards.forEach((card) => {
    const dragStart$ = fromEvent(card, 'dragstart')
    const swapCard$ = fromEvent(card, 'drop')
    const dragOver$ = fromEvent(card, 'dragover')
    const dragEnd$ = fromEvent(card, 'dragend')

    dragOver$
      .pipe(
        tap((event) => {
          event.preventDefault()
        })
      )
      .subscribe()

    dragStart$.pipe(map((event) => event.target as HTMLImageElement)).subscribe((card) => {
      card.classList.add('is-dragging')
      removeCardZone?.classList.add('show-remove-card-zone')
    })

    dragEnd$.pipe(map((event) => event.target as HTMLImageElement)).subscribe((card) => {
      card.classList.remove('is-dragging')
      removeCardZone?.classList.remove('show-remove-card-zone')
    })

    swapCard$
      .pipe(
        tap((event) => {
          event.preventDefault()
        }),
        map((event) => event.target as HTMLImageElement)
      )
      .subscribe((card) => {
        const cardBeingDragged = document.querySelector<HTMLElement>('.is-dragging')

        if (cardBeingDragged !== null) {
          swapDeckCard(card, cardBeingDragged)
        }
      })
  })
}

pageLoaded$.subscribe(() => {
  const cards = getDeckCards()
  insertDeckCardsElements(cards)
  initDragHandlers()
})

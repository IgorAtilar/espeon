import Tilt from 'vanilla-tilt'
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  switchMap,
  tap,
} from 'rxjs'
import { createElement, isMobile } from '../helpers/dom'
import { removeExtraSpaces } from '../helpers/string'
import { Card, Type } from '../entities/Card'
import { searchCards } from '../api'
import { mapCardResponseToCard } from '../helpers/entities'
import pokeballBgURL from '../../assets/pokeball-bg.svg'
import pokeballSliceTopURL from '../../assets/pokeball-slice-top.svg'
import pokeballSliceBottomURL from '../../assets/pokeball-slice-bottom.svg'
import { addCardToDeck } from '../deck'
import { showToast } from '../main'
import { ToastType } from '../types/toast'

const searchInput = document.querySelector('#search-input') as HTMLInputElement
const cardsContainer = document.querySelector('#cards-container')
const pokeballBackgroundContainer = document.querySelector('#background-container')
const modal = document.querySelector('dialog')
const modalContainer = document.querySelector('#modal-container')

modal?.addEventListener('click', () => {
  modal?.close()
})

modalContainer?.addEventListener('click', (event) => {
  event.stopPropagation()
})

const handleCloseModal = () => {
  modal?.close()
}

const handleAddCard = (card: Card) => {
  addCardToDeck(card)
  modal?.close()
  showToast({
    type: ToastType.SUCCESS,
    message: 'Card added to your deck!',
  })
}

const createCardModalContent = (card: Card) => {
  const { imageURL, name, types } = card
  const type = types?.[0] ?? Type.Colorless

  if (!modalContainer) return

  modalContainer.className = `modal-${type.toLowerCase()}`

  const header = createElement({
    tagName: 'div',
    attributes: {
      id: 'modal-header',
    },
  })

  const closeButton = createElement({
    tagName: 'button',
    attributes: {
      id: 'modal-close-button',
      title: 'Close modal',
    },
  })

  closeButton.onclick = handleCloseModal

  const closeIcon = createElement({
    tagName: 'i',
    attributes: {
      class: 'ph-x',
    },
  })

  closeButton.appendChild(closeIcon)
  header.appendChild(closeButton)

  const image = createElement({
    tagName: 'img',
    attributes: {
      src: imageURL,
      class: 'modal-image',
      alt: `Card ${name}`,
    },
  })

  const addButton = createElement({
    tagName: 'button',
    attributes: {
      id: 'modal-add-card-button',
    },
  })

  addButton.onclick = () => {
    handleAddCard(card)
  }

  addButton.textContent = 'Add to deck'

  modalContainer.innerHTML = ''

  modalContainer.appendChild(header)
  modalContainer.appendChild(image)
  modalContainer.appendChild(addButton)
}

const handleShowModal = (card: Card) => {
  createCardModalContent(card)
  modal?.showModal()
}

const page$ = new BehaviorSubject({
  page: 1,
})

const totalPages$ = new BehaviorSubject<{ totalPages?: number }>({
  totalPages: undefined,
})
const input$ = fromEvent<InputEvent>(searchInput, 'input')

const intersectionObserver = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) {
    const {
      value: { page },
    } = page$
    const {
      value: { totalPages },
    } = totalPages$

    if (!totalPages || page < totalPages) {
      page$.next({ page: page + 1 })
    }
  }
})

const createCardElement = ({ name, imageURL, types }: Card) => {
  const type = types?.[0] ?? Type.Colorless
  const button = createElement({
    tagName: 'button',
    attributes: {
      class: `card ${type.toLowerCase()}`,
      title: name,
    },
  })

  const image = createElement({
    tagName: 'img',
    attributes: {
      src: imageURL,
      alt: `Card ${name}`,
    },
  })

  button.appendChild(image)

  return button
}

const clearCardsContainer = () => {
  const image = createElement({
    tagName: 'img',
    attributes: {
      id: 'pokeball-bg',
      src: pokeballBgURL,
    },
  })

  if (!cardsContainer) return

  pokeballBackgroundContainer?.replaceChildren(image)
  cardsContainer.innerHTML = ''
}

const insertPokemonCards = (cards: Card[]) => {
  cards.forEach((card, index) => {
    const cardElement = createCardElement(card)
    cardElement.onclick = () => {
      handleShowModal(card)
    }

    if (!cardsContainer) return

    const lastELement = cardsContainer.lastElementChild
    const isLastCard = cards.length - 1 === index

    if (lastELement) {
      intersectionObserver.unobserve(lastELement)
    }

    if (isLastCard) {
      intersectionObserver.observe(cardElement)
    }

    cardsContainer.appendChild(cardElement)

    if (isMobile()) return

    Tilt.init(cardElement, {
      glare: true,
      'max-glare': 0.5,
    })
  })
}

const handleLoading = (loading?: boolean) => {
  const pokeballBackgroundImage = document.querySelector('#pokeball-bg')

  if (!loading) {
    pokeballBackgroundImage?.classList.remove('rotation-animation')
    return
  }
  pokeballBackgroundImage?.classList.add('rotation-animation')
}

const insertError = (message?: string) => {
  const pokeballTop = createElement({
    tagName: 'img',
    attributes: {
      src: pokeballSliceTopURL,
    },
  })

  const pokeballBottom = createElement({
    tagName: 'img',
    attributes: {
      src: pokeballSliceBottomURL,
    },
  })

  const text = createElement({
    tagName: 'span',
  })

  text.innerHTML = message?.length
    ? message
    : `Oops, something wrong happened :( <br />
  Try to search for another card or try later.`

  pokeballBackgroundContainer?.replaceChildren(pokeballTop, text, pokeballBottom)
}

const result$ = input$.pipe(
  map((event) => (event.target as HTMLInputElement).value || ''),
  map(removeExtraSpaces),
  debounceTime(1000),
  distinctUntilChanged(),
  tap(clearCardsContainer),
  filter((cardName) => !!cardName),
  tap(() => {
    page$.next({ page: 1 })
  }),
  switchMap((cardName) => page$.pipe(switchMap(({ page }) => searchCards({ cardName, page })))),
  tap(({ totalPages }) => {
    if (totalPages) {
      totalPages$.next({ totalPages })
    }
  })
)

result$.subscribe(({ cards, loading, error, message }) => {
  handleLoading(loading)

  if (error) {
    insertError(message)
    return
  }

  const mappedCards = cards?.map(mapCardResponseToCard) ?? []
  insertPokemonCards(mappedCards)
})

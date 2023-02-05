import { CardResponse } from '../../api/types/GetCards'
import { Card } from '../../entities/Card'

export const mapCardResponseToCard = ({ images, ...card }: CardResponse): Card => ({
  imageURL: images.large,
  ...card,
})

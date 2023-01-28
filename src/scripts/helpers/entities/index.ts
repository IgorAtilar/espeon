import { CardResponse } from '../../api/types/GetCards';
import { Card } from '../../entities/Card';

export const mapCardResponseToCard = ({
  id,
  images,
  name,
}: CardResponse): Card => ({
  id,
  name,
  imageURL: images.large,
});

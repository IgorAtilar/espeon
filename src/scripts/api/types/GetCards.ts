export type CardResponse = {
  id: string;
  name: string;
  images: {
    small: string;
    large: string;
  };
};

export type GetCardsResponse = {
  data?: {
    cards: CardResponse[];
    page: number;
    pageSize: number;
    totalCount: number;
  };
  error?: boolean;
  loading?: boolean;
};

export type GetCardsParams = {
  cardName: string;
  page?: number;
  pageSize?: number;
};

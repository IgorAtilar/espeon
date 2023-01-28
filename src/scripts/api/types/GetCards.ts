export type CardResponse = {
  id: string;
  name: string;
  images: {
    small: string;
    large: string;
  };
};

export type GetCardsResponse = {
  data?: CardResponse[];
  error?: boolean;
  loading?: boolean;
};

export type GetCardsParams = {
  cardName: string;
  page?: number;
  pageSize?: number;
};

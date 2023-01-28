export enum Type {
  Colorless = 'colorless',
  Darkness = 'darkness',
  Dragon = 'dragon',
  Fairy = 'fairy',
  Fighting = 'fighting',
  Fire = 'fire',
  Grass = 'grass',
  Lightning = 'lightning',
  Metal = 'metal',
  Psychic = 'psychic',
  Water = 'water',
}

export type Card = {
  id: string;
  name: string;
  imageURL: string;
  types?: Type[];
};

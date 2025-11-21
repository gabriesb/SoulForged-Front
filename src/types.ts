export type UserDTO = { id: number; username: string; email: string };
export type CardInstance = { id: number; cardTemplateCode: string; quantity: number };
export type CollectionDTO = { id: number; user: UserDTO; cards: CardInstance[] };

export type CardTemplate = {
  id: number;
  code: string;
  name: string;
  description: string;
  type: "HERO" | "SPELL" | "ARTIFACT";
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  manaCost: number;
  attack: number;
  health: number;
};

export type DeckCard = {
  id: number;
  quantity: number;
  cardTemplate?: CardTemplate;
};
export type Deck = { id: number; ownerUserId: number; name: string; cards: DeckCard[] };

export type GameSession = {
  id: number;
  playerOneId: number;
  playerTwoId: number;
  stateJson: string;
  finished: boolean;
};

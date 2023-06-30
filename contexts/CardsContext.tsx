import React, { Dispatch, SetStateAction } from "react";

export interface card {
  cardID: string;
  parentSet: string;
  title: string;
  answer: string;
}

interface cardsContextInterface {
  cards: card[];
  setCards: Dispatch<SetStateAction<card[]>>;
}

export const cardsContextDefaultValue: cardsContextInterface = {
  cards: [],
  setCards: () => [],
};

export const CardsContext = React.createContext<cardsContextInterface>(
  cardsContextDefaultValue
);

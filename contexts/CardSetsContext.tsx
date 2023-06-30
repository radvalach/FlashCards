import React, { Dispatch, SetStateAction } from "react";

export interface cardSet {
  cardSetID: string;
  title: string;
  parentFolders: string[];
  remainingCards: string[];
  learnedCards: string[];
  active: boolean;
}

interface cardSetContextInterface {
  cardSets: cardSet[];
  setCardSets: Dispatch<SetStateAction<cardSet[]>>;
}

export const cardSetContextDefaultValue: cardSetContextInterface = {
  cardSets: [],
  setCardSets: () => [],
};

export const CardSetsContext = React.createContext<cardSetContextInterface>(
  cardSetContextDefaultValue
);

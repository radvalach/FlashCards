import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useRef } from "react";
import { Animated, GestureResponderEvent, StyleSheet, Text, View } from "react-native";

import { card, cardSet, folder } from "../../App";
import { CardsContext } from "../../contexts/CardsContext";
import { CardSetsContext } from "../../contexts/CardSetsContext";
import { FoldersContext } from "../../contexts/FoldersContext";
import Button from "./Button";

type DeleteMenuProps = {
  item: string;
  title: string;
  cancel: ((event: GestureResponderEvent) => void);
}

const DeleteMenu = ({ item, title, cancel }: DeleteMenuProps) => {
  const { folders, setFolders } = useContext(FoldersContext);
  const { cardSets, setCardSets } = useContext(CardSetsContext);
  const { cards, setCards } = useContext(CardsContext);

  const scaled: Animated.Value = useRef(new Animated.Value(0.95)).current;
  const opacAnim: Animated.Value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaled, {
        toValue: 1,
        speed: 20,
        bounciness: 12,
        useNativeDriver: true,
      }),
      Animated.timing(opacAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const cancelAnim = () => {
    Animated.parallel([
      Animated.spring(scaled, {
        toValue: 0.95,
        speed: 20,
        bounciness: 12,
        useNativeDriver: true,
      }),
      Animated.timing(opacAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(cancel, 50);
  };

  const decide = async (itemID: string) => {
    cancelAnim();
    if (itemID.charAt(0) == "f") {
      await deleteFolder(itemID);
    } else if (itemID.charAt(0) == "s") {
      let newSets: cardSet[] = await deleteSet(itemID, [...cardSets]);
      setCardSets(newSets);
    } else {
      let newCards: card[] = await deleteCard(itemID, cards);
      setCards(newCards);
    }
  };

  const deleteFolder = async (folderID: string) => {
    let folderStr: string | null;
    try {
      folderStr = await AsyncStorage.getItem(folderID);
    } catch(e) {
      throw e
    }

    if (folderStr == null) {
      return;
    }
    const folder: folder = JSON.parse(folderStr);
    let newSets: cardSet[] = [...cardSets];
    for (const set of folder.activeSets.concat(folder.inactiveSets)) {
      newSets = await deleteSet(set, newSets);
    }
    setCardSets(newSets);
    setFolders(folders.filter((folder) => folder.folderID != folderID));
    try {
      await AsyncStorage.removeItem(folderID);
    } catch(e) {
      throw e
    }
    
  };

  const deleteSet = async (setID: string, newSets: cardSet[]) => {
    let setStr: string | null;
    try {
      setStr = await AsyncStorage.getItem(setID);
    } catch(e) {
      throw e
    }
    if (setStr == null) {
      return newSets;
    }
    const set: cardSet = JSON.parse(setStr);

    let newCards = [...cards];
    for (const cardID of set.learnedCards.concat(set.remainingCards)) {
      newCards = await deleteCard(cardID, newCards);
    }
    setCards(newCards);

    let foldersCopy: folder[] = [...folders];
    for (const folderID of set.parentFolders) {
      let folderInd = foldersCopy.findIndex(
        (folder) => folder.folderID == folderID
      );
      if (folderInd == -1) {
        continue;
      }
      foldersCopy[folderInd].inactiveSets = foldersCopy[
        folderInd
      ].inactiveSets.filter((set) => set != setID);

      if (set.active) {
        foldersCopy[folderInd].activeSets = foldersCopy[
          folderInd
        ].activeSets.filter((set) => set != setID);
      }
    }
    setFolders(foldersCopy);

    try {
      await AsyncStorage.removeItem(setID);
    } catch(e) {
      throw e
    }

    for (const folderID of set.parentFolders) {
      let folderStr: string | null = await AsyncStorage.getItem(folderID);
      if (folderStr == null) {
        continue;
      }
      let folder: folder = JSON.parse(folderStr);
      folder.inactiveSets = folder.inactiveSets.filter((set) => set != setID);
      if (set.active) {
        folder.activeSets = folder.activeSets.filter((set) => set != setID);
      }
      try {
        await AsyncStorage.setItem(folderID, JSON.stringify(folder));
      } catch(e) {
        throw e
      }
    }
    return newSets.filter((set) => set.cardSetID != setID);
  };

  const deleteCard = async (cardID: string, newCards: card[]) => {
    let cardStr: string | null
    try {
      cardStr = await AsyncStorage.getItem(cardID);
    } catch(e) {
      throw e
    }
    
    if (cardStr == null) {
      return newCards;
    }
    const card: card = JSON.parse(cardStr);

    let setsCopy: cardSet[] = [...cardSets];
    let setInd = setsCopy.findIndex((set) => set.cardSetID == card.parentSet);
    setsCopy[setInd].learnedCards = setsCopy[setInd].learnedCards.filter(
      (card) => card != cardID
    );
    setsCopy[setInd].remainingCards = setsCopy[setInd].remainingCards.filter(
      (card) => card != cardID
    );
    setCardSets(setsCopy);

    let parentSet: string | null;
    try {
      await AsyncStorage.removeItem(cardID);
      parentSet = await AsyncStorage.getItem(card.parentSet);
    } catch(e) {
      throw e
    }

    if (parentSet == null) {
      return newCards;
    }
    let parsedSet: cardSet = JSON.parse(parentSet);
    parsedSet.learnedCards = parsedSet.learnedCards.filter(
      (card) => card != cardID
    );
    parsedSet.remainingCards = parsedSet.remainingCards.filter(
      (card) => card != cardID
    );
    try {
      await AsyncStorage.setItem(card.parentSet, JSON.stringify(parsedSet));
    } catch(e) {
      throw e
    }

    return newCards.filter((card) => card.cardID != cardID);
  };

  return (
    <Animated.View style={animatedStyles(scaled, opacAnim).container}>
      <View style={styles.messageBox}>
        <Text style={styles.messageText}>Delete {title}?</Text>
      </View>
      <View style={styles.buttonsMenu}>
        <Button
          text="Cancel"
          backGround="#F6F7F9"
          radius={8}
          xPadding={41}
          yPadding={10}
          textColor="#000000"
          function={cancelAnim}
        />
        <Button
          text="Delete"
          backGround="#F6F7F9"
          radius={8}
          xPadding={41}
          yPadding={10}
          textColor="red"
          function={() => {
            decide(item);
            cancel;
          }}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonsMenu: {
    flex: 0.4,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  messageBox: {
    flex: 0.6,
    justifyContent: "center" 
  },
  messageText: {
    fontSize: 16 
  }
});

const animatedStyles = (scaled: any, opacity: any) =>
  StyleSheet.create({
    container: {
      width: 300,
      backgroundColor: "#FFFFFF",
      height: 120,
      alignItems: "center",
      paddingHorizontal: 12,
      paddingBottom: 6,
      borderRadius: 16,
      transform: [{ scaleX: scaled }, { scaleY: scaled }],
      opacity: opacity,

      shadowColor: "#00262C",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 18,
    },
  });

  export default DeleteMenu;
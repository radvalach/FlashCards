import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { card, cardSet, RootStackParamList } from "../App";
import ModalHeader from "../components/Home/ModalHeader";
import { CardsContext } from "../contexts/CardsContext";
import { CardSetsContext } from "../contexts/CardSetsContext";

type NewCardProps = NativeStackScreenProps<RootStackParamList, "NewCard">;

const NewCard = ({ navigation, route }: NewCardProps) => {
  const { cardData, setID } = route.params;
  const isNew = cardData == undefined;

  const { cardSets } = useContext(CardSetsContext);
  const { cards, setCards } = useContext(CardsContext);

  const [cardTitle, setCardTitle] = useState<string>(
    isNew ? "" : cardData.title
  );
  const [cardAnswer, setCardAnswer] = useState<string>(
    isNew ? "" : cardData.answer
  );
  const [canSave, setCanSave] = useState<boolean>(false);

  useEffect(() => {
    if (
      (isNew && cardTitle != "" && cardAnswer != "") ||
      (!isNew &&
        (cardTitle != cardData.title || cardAnswer != cardData.answer) &&
        cardTitle != "" &&
        cardAnswer != "")
    ) {
      setCanSave(true);
    } else {
      setCanSave(false);
    }
  }, [cardTitle, cardAnswer]);

  const saveCard = async () => {
    let setsCopy: cardSet[] = [...cardSets];
    let setInd: number = setsCopy.findIndex((set) => set.cardSetID == setID);
    if (!canSave) {
      return;
    }

    const key: string = isNew ? await getKeyNum() : cardData.cardID;
    const cardToSave: card = {
      cardID: key,
      parentSet: setsCopy[setInd].cardSetID,
      title: cardTitle,
      answer: cardAnswer,
    };
    try {
    await AsyncStorage.setItem(key, JSON.stringify(cardToSave));
    } catch(e) {
      throw e
    }

    if (isNew) {
      const parent: cardSet | undefined = cardSets.find((set) => set.cardSetID == setID);
      if (parent != undefined) {
        parent.remainingCards.push(key);
        try {
          await AsyncStorage.setItem(setID, JSON.stringify(parent)); 
        } catch(e) {
          throw e
        }
        
      }
      setCards([...cards, cardToSave]);
    } else {
      let copy: card[] = [...cards];
      let index: number = copy.findIndex((card) => card.cardID == key);
      copy[index].title = cardTitle;
      copy[index].answer = cardAnswer;
      setCards(copy);
    }

    navigation.goBack();
  };

  const getKeyNum = async () => {
    let keyNum: string | null;
    try {
      keyNum = await AsyncStorage.getItem("card_key");
    } catch(e) {
      throw e
    }

    let newKeyNum: string;
    if (keyNum == null) {
      newKeyNum = "0";
    } else {
      newKeyNum = (Number(keyNum) + 1).toString();
    }
    try {
      await AsyncStorage.setItem("card_key", newKeyNum);
    } catch(e) {
      throw e
    }
    
    return "c" + newKeyNum;
  };

  return (
    <View style={styles.container}>
      <ModalHeader
        isNew={isNew}
        canSave={canSave}
        func={saveCard}
        nav={() => navigation.goBack()}
        showLeft={true}
        title="New Card"
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={cardTitle}
          onChangeText={(newCardName) => setCardTitle(newCardName)}
          placeholder={"Card Title"}
          style={styles.titleInput}
          placeholderTextColor={"#8F8F91"}
          maxLength={64}
          textAlign="center"
          multiline={true}
        />
      </View>

      <TextInput
        value={cardAnswer}
        onChangeText={(newCardAnswer) => setCardAnswer(newCardAnswer)}
        placeholder={"Term description..."}
        style={styles.answerInput}
        placeholderTextColor={"#8F8F91"}
        maxLength={1024}
        multiline={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputContainer: {
    height: 72,
    backgroundColor: "#F6F7F9",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  titleInput: {
    fontSize: 16,
    paddingHorizontal: 12,
    flex: 1,
  },
  answerInput: {
    backgroundColor: "#F6F7F9",
    borderRadius: 10,
    width: "100%",
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    fontSize: 16,
  },
});

export default NewCard;
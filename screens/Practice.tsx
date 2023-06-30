import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

import { card, RootStackParamList } from "../App";
import Button from "../components/Global/Button";
import ModalHeader from "../components/Home/ModalHeader";
import { CardsContext } from "../contexts/CardsContext";
import { CardSetsContext } from "../contexts/CardSetsContext";

type PracticeProps = NativeStackScreenProps<RootStackParamList, "Practice">;

const Practice = ({ navigation, route }: PracticeProps) => {
  const { setData } = route.params;
  const { cardSets, setCardSets } = useContext(CardSetsContext);
  const { cards } = useContext(CardsContext);

  const [remainingCards, setremainingCards] = useState<card[]>(
    cards.filter((card) => setData.remainingCards.includes(card.cardID))
  );
  const [learnedCards, setLearnedCards] = useState<string[]>(
    setData.learnedCards
  );
  const [wrongCardsN, setWrongCardsN] = useState<number>(0);

  useEffect(() => {
    const change = async () => {
      let copySets = [...cardSets];
      let parent = copySets.findIndex(
        (set) => set.cardSetID == setData.cardSetID
      );
      copySets[parent].remainingCards = remainingCards.map(
        (card) => card.cardID
      );
      copySets[parent].remainingCards = learnedCards;

      setCardSets(copySets);

      setData.learnedCards = learnedCards;
      setData.remainingCards = remainingCards.map((card) => card.cardID);
      try {
        await AsyncStorage.setItem(setData.cardSetID, JSON.stringify(setData));
      } catch (e) {
        throw e;
      }
    };
    change();
  }, [learnedCards]);

  const changeCards = (wasCorrect: boolean) => {
    let copy = [...remainingCards];
    let popped = copy.pop();
    if (popped == undefined) {
      return;
    }

    if (wasCorrect) {
      setremainingCards(copy);
      setLearnedCards([...learnedCards, popped.cardID]);
    } else {
      setremainingCards([popped, ...copy]);
      setWrongCardsN(wrongCardsN + 1);
    }

    if (copy.length == 0) {
      navigation.goBack()
    }
  };

  const scaled = useRef(new Animated.Value(0)).current;
  const answerOpacity = useRef(new Animated.Value(0)).current;

  const moveCard = (wasCorrect: boolean) => {
    Animated.sequence([
      Animated.spring(scaled, {
        toValue: wasCorrect ? 75 : -75,
        speed: 200,
        bounciness: 8,
        useNativeDriver: true,
      }),
      Animated.timing(answerOpacity, {
        toValue: 0,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.spring(scaled, {
        toValue: 0,
        speed: 100,
        bounciness: 20,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(() => changeCards(wasCorrect), 400);
  };

  const revealAns = () => {
    Animated.timing(answerOpacity, {
      toValue: 1,
      duration: 75,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles().container}>
      <View style={styles().header}>
        <ModalHeader
          isNew={false}
          canSave={true}
          func={() => navigation.goBack()}
          showLeft={false}
          nav={() => navigation.goBack()}
        />
      </View>

      <Animated.View style={styles(scaled).cardTitle}>
        <Text style={styles().cardTitleText}>
          {remainingCards.slice(-1)[0].title}
        </Text>
      </Animated.View>

      <Animated.View style={styles().cardAnswer}>
        <Animated.Text style={styles(undefined, answerOpacity).cardAnswerText}>
          {remainingCards.slice(-1)[0].answer}
        </Animated.Text>
      </Animated.View>

      <Button
        text={"Reveal the Answer"}
        backGround="#E2ECEF"
        radius={10}
        yPadding={14}
        xPadding={24}
        function={revealAns}
      />

      <View style={styles().controls}>
        <View style={styles().categoryButton}>
          <Button
            icon={"x"}
            iconSize={22}
            backGround="#FF001F"
            textColor="#FFFFFF"
            radius={30}
            yPadding={14}
            xPadding={14}
            function={() => moveCard(false)}
          />
          <Text style={styles(undefined, undefined, true).categoryNumber}>
            {wrongCardsN.toString()}
          </Text>
        </View>

        <Text style={styles().remainingText}>
          {remainingCards.length.toString()} Cards left
        </Text>

        <View style={styles().categoryButton}>
          <Button
            icon={"check"}
            iconSize={22}
            textColor="#FFFFFF"
            backGround="#00CB76"
            radius={30}
            yPadding={14}
            xPadding={14}
            function={() => moveCard(true)}
          />
          <Text style={styles(undefined, undefined, false).categoryNumber}>
            {learnedCards.length.toString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = (scaled?: any, opac?: any, wrong?: boolean) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      backgroundColor: "#F2F4F6",
      alignItems: "center",
      flex: 1
    },
    header: {
      marginTop: 64,
      width: "100%",
    },
    controls: {
      width: "90%",
      position: "absolute",
      top: Dimensions.get("window").height * 0.84,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    categoryButton: {
      alignItems: "center",
    },
    categoryNumber: {
      marginTop: 8,
      fontSize: 18,
      fontWeight: "600",
      color: (wrong == true) ? "#FF001F" : "#00B569"
    },
    remainingText: {
      fontSize: 16,
      fontWeight: "500",
      color: "#6D727B",
    },
    cardTitle: {
      backgroundColor: "#FFFFFF",
      width: "100%",
      height: 100,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      padding: 12,
      transform: [{ translateX: scaled }],
      shadowColor: "#00262C",
      shadowOpacity: 0.06,
      shadowOffset: { width: 0, height: 20 },
      shadowRadius: 18,
    },
    cardTitleText: {
      fontSize: 16,
      fontWeight: "500",
      textAlign: "center",
    },
    cardAnswer: {
      backgroundColor: "#FFFFFF",
      width: "100%",
      marginBottom: 30,
      padding: 16,
      borderRadius: 10,
      height: "45%",
      shadowColor: "#00262C",
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 20 },
      shadowRadius: 18,
    },
    cardAnswerText: {
      fontSize: 16,
      opacity: opac,
    },
  });

export default Practice;

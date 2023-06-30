import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";

import { card, cardSet, RootStackParamList } from "../App";
import Button from "../components/Global/Button";
import DeleteMenu from "../components/Global/DeleteMenu";
import { CardsContext } from "../contexts/CardsContext";
import { CardSetsContext } from "../contexts/CardSetsContext";

type CardSetProps = NativeStackScreenProps<RootStackParamList, "CardSet">;

const CardSet = ({ navigation, route }: CardSetProps) => {
  let { cardSet, color } = route.params;
  const { cardSets, setCardSets } = useContext(CardSetsContext);
  const { cards, setCards } = useContext(CardsContext);

  const [setData, setSetData] = useState<cardSet>(cardSet);
  const [isActive, setIsActive] = useState<boolean>(cardSet.active);

  const [delValue, setDelValue] = useState<string>("");
  const [delTitle, setDelTitle] = useState<string>("");

  const infoOpacity: Animated.Value = useRef(new Animated.Value(1)).current;
  const addButtonOpacity: Animated.Value = useRef(new Animated.Value(1)).current;
  const titlePosition: Animated.Value = useRef(new Animated.Value(0)).current;
  const AnimatedPress = Animated.createAnimatedComponent(Pressable);

  useEffect(() => {
    const myFun = async () => {
      if (setData == undefined || setData.active == isActive) {
        return;
      }
      setData.active = isActive;
      let copy: cardSet[] = [...cardSets];
      let ind: number = copy.findIndex(
        (set) => set.cardSetID == setData.cardSetID
      );
      copy[ind].active = isActive;
      setCardSets(copy);

      let data: string | null;
      try {
        data = await AsyncStorage.getItem(setData.cardSetID);
      } catch (e) {
        throw e;
      }
      if (data == null) {
        return;
      }
      let set: cardSet = JSON.parse(data);
      set.active = isActive;
      try {
        await AsyncStorage.setItem(setData.cardSetID, JSON.stringify(set));
      } catch (e) {
        throw e;
      }
    };
    myFun();
  }, [isActive]);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    const allKeys: string[] = setData.learnedCards.concat(
      setData.remainingCards
    );

    let arr: card[] = [];
    for (const key of allKeys) {
      let jsonValue: string | null;
      try {
        jsonValue = await AsyncStorage.getItem(key);
      } catch (e) {
        throw e;
      }

      if (jsonValue != null && setData != undefined) {
        const parsedCard: card = JSON.parse(jsonValue);
        if (parsedCard.parentSet == setData.cardSetID) {
          arr.push(parsedCard);
        }
      }
    }
    setCards(arr);
  };

  const reset = async () => {
    let copySets: cardSet[] = [...cardSets];
    let parent: number = copySets.findIndex(
      (set) => set.cardSetID == setData.cardSetID
    );
    copySets[parent].remainingCards = copySets[parent].remainingCards.concat(
      copySets[parent].learnedCards
    );
    copySets[parent].learnedCards = [];
    setCardSets(copySets);

    let parsedSet: cardSet = copySets[parent];

    parsedSet.remainingCards = parsedSet.remainingCards.concat(
      parsedSet.learnedCards
    );
    parsedSet.learnedCards = [];

    try {
      await AsyncStorage.setItem(setData.cardSetID, JSON.stringify(parsedSet));
    } catch (e) {
      throw e;
    }
    setSetData(parsedSet);
  };

  const fadeIn = (value: Animated.Value) => {
    Animated.timing(value, {
      toValue: 0.6,
      duration: 50,
      useNativeDriver: true,
    }).start();
  };
  const fadeOut = (value: Animated.Value) => {
    Animated.timing(value, {
      toValue: 1,
      duration: 50,
      useNativeDriver: true,
    }).start();
  };

  const animateComponent = (value: number) =>
    titlePosition.interpolate({
      inputRange: [0, 100],
      outputRange: [0, value],
      extrapolate: "extend",
    });

  const hideComponent = (value: number) =>
    titlePosition.interpolate({
      inputRange: [0, value],
      outputRange: [1, 0],
      extrapolate: "extend",
    });

  return (
    <CardsContext.Provider value={{ cards, setCards }}>
      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerAlignment}
        contentInsetAdjustmentBehavior="automatic"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: titlePosition } } }],
          { useNativeDriver: true }
        )}
      >
        <Animated.View
          style={titleStyle(animateComponent(35), hideComponent(200)).setTitle}
        >
          <Text style={titleStyle().setTitleText} numberOfLines={3}>
            {setData.title}
          </Text>
        </Animated.View>

        <Animated.View
          style={buttonStyle(animateComponent(20), hideComponent(150)).Button}
        >
          <Button
            backGround={color}
            function={() => {
              if (setData.remainingCards.length > 0) {
                navigation.navigate("Practice", { setData });
              }
            }}
            text="Practice"
            textColor="#FFFFFF"
            yPadding={16}
            radius={10}
            scale={true}
            scaleIntensity={0.98}
          />
        </Animated.View>

        {delValue != "" && (
          <Animated.View
            style={floatingStyle(animateComponent(35)).floatingComponent}
          >
            <DeleteMenu
              item={delValue}
              title={delTitle}
              cancel={() => setDelValue("")}
            />
          </Animated.View>
        )}
        <Animated.View
          style={
            infoStyle(animateComponent(10), hideComponent(100), infoOpacity)
              .practiceInfo
          }
        >
          <View
            style={
              infoStyle(animateComponent(10), hideComponent(100), infoOpacity)
                .infoLearnedCards
            }
          >
            <Text
              style={
                infoStyle(animateComponent(10), hideComponent(100), infoOpacity)
                  .infoCount
              }
            >
              {setData.learnedCards.length} /{" "}
              {setData.learnedCards.length + setData.remainingCards.length}
            </Text>
            <Text
              style={
                infoStyle(animateComponent(10), hideComponent(100), infoOpacity)
                  .infoLearned
              }
            >
              learned
            </Text>
          </View>

          <View style={infoStyle().container}>
            <AnimatedPress
              onPressIn={() => fadeIn(infoOpacity)}
              onPressOut={() => fadeOut(infoOpacity)}
              style={
                infoStyle(animateComponent(10), hideComponent(100), infoOpacity)
                  .resetButton
              }
              onPress={reset}
            >
              <Text style={infoStyle().resetButtonText}>Reset</Text>
            </AnimatedPress>

            <BouncyCheckbox
              onPress={() => {
                setIsActive(!isActive);
              }}
              iconComponent={
                isActive ? (
                  <FontAwesome name="star" size={24} color="gold" />
                ) : (
                  <FontAwesome name="star-o" size={24} color="#6D727B" />
                )
              }
              fillColor=""
              innerIconStyle={infoStyle().activeButton}
              bounceEffectIn={0.9}
              bouncinessIn={15}
              bouncinessOut={8}
              bounceVelocityIn={1}
              bounceVelocityOut={1}
            />
          </View>
        </Animated.View>

        <View style={styles.cardList}>
          <AnimatedPress
            onPressIn={() => fadeIn(addButtonOpacity)}
            onPressOut={() => fadeOut(addButtonOpacity)}
          >
            <Animated.View
              style={addButtonStyle(animateComponent(0), addButtonOpacity).Button}
            >
              <Button
                text="Add a Card"
                backGround="#E2ECEF"
                radius={10}
                yPadding={14}
                icon={"plus"}
                function={() =>
                  navigation.navigate("NewCard", {
                    cardData: null,
                    setID: setData.cardSetID,
                  })
                }
              />
            </Animated.View>
          </AnimatedPress>

          {cards.length != 0 ? (
            <Animated.FlatList
              data={cards}
              renderItem={({ item, index }) => {
                return (
                  <Pressable
                    style={styles.card}
                    onPress={() =>
                      navigation.navigate("NewCard", {
                        cardData: item,
                        setID: setData.cardSetID,
                      })
                    }
                    onLongPress={() => {
                      setDelValue(item.cardID);
                      setDelTitle(item.title);
                    }}
                  >
                    <Text style={styles.cardTitle}>{item.title}</Text>
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => (
                <View style={styles.cardsSeparator} />
              )}
              scrollEnabled={false}
            ></Animated.FlatList>
          ) : (
            <Text style={styles.emptyMessage}>No cards in this set </Text>
          )}
        </View>
      </Animated.ScrollView>
    </CardsContext.Provider>
  );
};

const titleStyle = (animateTitle?: any, hideTitle?: any) =>
  StyleSheet.create({
    setTitle: {
      marginBottom: 40,
      marginTop: 60,
      justifyContent: "flex-end",
      height: 70,
      width: "70%",
      transform: [{ translateY: animateTitle }],
      opacity: hideTitle,
    },
    setTitleText: {
      fontSize: 20,
      fontWeight: "700",
      textAlign: "center",
    },
  });

const buttonStyle = (animateButton?: any, hideButton?: any) =>
  StyleSheet.create({
    Button: {
      opacity: hideButton,
      transform: [{ translateY: animateButton }],
      marginBottom: 20,
      width: "80%",
    },
    ButtonText: {
      fontSize: 16,
      fontWeight: "500",
      color: "#FFFFFF",
    },
  });

const addButtonStyle = (animateButton?: any, addButtonOpacity?: any) =>
  StyleSheet.create({
    Button: {
      opacity: addButtonOpacity,
      transform: [{ translateY: animateButton }],
      marginBottom: 8,
      width: "100%",
    },
  });

const infoStyle = (animateInfo?: any, hideInfo?: any, infoOpacity?: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    practiceInfo: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "70%",
      transform: [{ translateY: animateInfo }],
      opacity: hideInfo,
      paddingBottom: 40,
    },
    infoLearnedCards: {
      alignItems: "center",
    },
    infoCount: {
      fontSize: 17,
      fontWeight: "700",
      color: "#000000",
      flexWrap: "wrap",
      textAlign: "center",
    },
    infoLearned: {
      fontSize: 13,
      fontWeight: "500",
      color: "#6D727B",
      flexWrap: "wrap",
      textAlign: "center",
    },
    resetButton: {
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: "#E2ECEF",
      alignItems: "center",
      opacity: infoOpacity,
      marginRight: 20,
      marginLeft: 70,
    },
    resetButtonText: {
      fontSize: 16,
      fontWeight: "500",
      color: "#007499",
    },
    activeButton: {
      borderWidth: 0,
    },
  });

const floatingStyle = (position: any) =>
  StyleSheet.create({
    floatingComponent: {
      position: "absolute",
      top: 400,
      zIndex: 2,
      left: 0,
      right: 0,
      alignItems: "center",
      transform: [{ translateY: position }],
    },
  });

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F2F4F6",
    paddingHorizontal: 20,
  },
  containerAlignment: {
    alignItems: "center",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginVertical: 14,
    textAlign: "center",
  },
  emptyMessage: {
    textAlign: "center",
    color: "#6D797C",
    marginVertical: 40,
    fontSize: 16,
  },
  cardsSeparator: {
    height: 8,
  },
  cardList: {
    width: "100%",
  },
});

export default CardSet;
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useContext, useRef, useState } from "react";
import { Animated, GestureResponderEvent, Pressable, StyleSheet, Text, View } from "react-native";

import { card, cardSet, RootStackParamList } from "../../App";
import { CardsContext } from "../../contexts/CardsContext";
import Button from "../Global/Button";

type CardSetPreviewProps = {
  nav: NativeStackNavigationProp<RootStackParamList, "Folder", undefined>;
  setData: cardSet;
  del: ((event: GestureResponderEvent) => void);
  color: string
}
const CardSetPreview = ({ nav, setData, del, color }: CardSetPreviewProps) => {
  const [folderColor] = useState<string>(color);
  const { setCards } = useContext(CardsContext);

  const scaled: Animated.Value = useRef(new Animated.Value(1)).current;
  const scaleDown = () => {
    Animated.spring(scaled, {
      toValue: 0.99,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  };
  const scaleUp = () => {
    Animated.spring(scaled, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const loadCards = async () => {
    const allKeys: string[] = setData.learnedCards.concat(setData.remainingCards);

    let arr: card[] = [];
    try {
      for (const key of allKeys) {
        const jsonValue: string | null = await AsyncStorage.getItem(key);
        if (jsonValue != null && setData != undefined) {
          const parsedCard: card = JSON.parse(jsonValue);
          if (parsedCard.parentSet == setData.cardSetID) {
            arr.push(parsedCard);
          }
        }
      }
      setCards(arr);
    } catch (e) {
      throw e
    }
  };

  return (
    <Pressable
      onPress={() => nav.navigate("CardSet", { cardSet: setData, color: color })}
      onLongPress={del}
      onPressIn={scaleDown}
      onPressOut={scaleUp}
    >
      <Animated.View style={styles(scaled).set}>
        <View style={styles(scaled, folderColor).setColor} />

        <View style={styles().setInfo}>
          <View style={styles().setHeader}>
            <Text style={styles().setTitle}>{setData.title}</Text>

            <View style={styles().setHeaderIcons}>
              {setData.active && (
                <Ionicons name="ios-star" size={12} color="#F5BF00" />
              )}

              <Ionicons
                name="ios-chevron-forward"
                size={18}
                color="#B9BFC0"
                style={{ marginLeft: 6 }}
              />
            </View>
          </View>

          <View style={styles().setDetails}>
          {setData.remainingCards.length > 0 ? (
              <View style={[styles().setDetailsCount, styles().setDetailsLeft]}>
                <Text style={styles().setDetailsCardsNum}>
                  {setData.remainingCards.length.toString()}{" "}
                </Text>
                <Text style={styles().setDetailsLeftText}>Cards left</Text>
              </View>
            ) : (setData.learnedCards.length > 0 ? (
              <View style={[styles().setDetailsCount, styles().setDetailsLearned]}>
                <Ionicons name="checkmark-circle" size={20} color="#00B569" />
                <Text style={styles().setDetailsLeftText}> All learned</Text>
              </View> ) : (
                <View style={[styles().setDetailsCount, styles().setDetailsLearned]}>
                <Text style={styles().setDetailsLeftText}> No cards</Text>
              </View>
              )
            )}

            <Button
              text="Practice"
              backGround="#007499"
              textColor="#FFFFFF"
              function={async () => {
                await loadCards();
                if (setData.remainingCards.length > 0) {
                  nav.navigate("Practice", { setData });
                }
              }}
            />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = (scaled?: any, folderColor?: string) =>
  StyleSheet.create({
    set: {
      backgroundColor: "#FFFFFF",
      flexDirection: "row",
      borderRadius: 10,
      transform: [{ scaleX: scaled }, { scaleY: scaled }],
    },
    setInfo: {
      flex: 1,
      padding: 16,
    },
    setColor: {
      width: 8,
      borderBottomLeftRadius: 10,
      borderTopStartRadius: 10,
      backgroundColor: folderColor
    },

    setHeader: {
      flexDirection: "row",
      marginBottom: 4,
      alignItems: "baseline",
      justifyContent: "space-between",
    },
    setHeaderIcons: {
      flexDirection: "row",
      alignItems: "center",
    },

    setTitle: {
      fontSize: 15,
      fontWeight: "500",
      marginBottom: 16,
    },

    setDetails: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    setDetailsCardsNum: {
      fontSize: 16,
      color: "#000000",
      fontWeight: "600"
    },
    setDetailsCount: {
      paddingVertical: 6,
      paddingHorizontal: 8,
      backgroundColor: "#F6F7F9",
      borderRadius: 6,
      flexDirection: "row",
      
    },
    setDetailsLeft: {
      alignItems: "baseline"
    },
    setDetailsLearned
    : {
      alignItems: "center"
    },
    setDetailsLeftText: {
      fontSize: 15,
      fontWeight: "500",
      color: "#6D727B",
    },
  });

export default CardSetPreview
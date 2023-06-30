import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useContext, useRef, useState } from "react";
import { Animated, Dimensions, FlatList, StyleSheet, Text, View } from "react-native";

import { RootStackParamList } from "../App";
import CardSetPreview from "../components/Folder/CardSetPreview";
import DeleteMenu from "../components/Global/DeleteMenu";
import { CardSetsContext } from "../contexts/CardSetsContext";

type FolderProps = NativeStackScreenProps<RootStackParamList, "Folder">;

const Folder = ({ navigation, route }: FolderProps) => {
  const { cardSets } = useContext(CardSetsContext);
  const { folderData } = route.params;

  const [delValue, setDelValue] = useState<string>("");
  const [delTitle, setDelTitle] = useState<string>("");

  const floatingPosition: Animated.Value = useRef(new Animated.Value(0)).current;
  const animateFloat = floatingPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: "extend",
  });

  return (
    <Animated.ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior="automatic"
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: floatingPosition } } }],
        { useNativeDriver: true }
      )}
    >
      {delValue != "" && (
        <Animated.View
          style={animatedStyles(animateFloat, 0.35).floatingComponent}
        >
          <DeleteMenu
            item={delValue}
            title={delTitle}
            cancel={() => setDelValue("")}
          />
        </Animated.View>
      )}

      <Text style={styles.sectionHeader}>Card Sets</Text>

      {(cardSets.filter((set) =>
          set.parentFolders.includes(folderData.folderID)
        ).length != 0) ? <FlatList
        data={cardSets.filter((set) =>
          set.parentFolders.includes(folderData.folderID)
        )}
        renderItem={({ item }) => {
          return (
            <CardSetPreview
              nav={navigation}
              setData={item}
              del={() => {
                setDelValue(item.cardSetID);
                setDelTitle(item.title);
              }}
              color={folderData.color}
            />
          );
        }}
        scrollEnabled={false}
        style={styles.list}
        ItemSeparatorComponent={() => <View style={styles.setSeparator} />}
      /> : <Text style={styles.emptyMessage}>No sets in this folder</Text>}
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F2F4F6",
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
  },
  list: {
    paddingBottom: 20,
    marginVertical: 10,
    backgroundColor: "#F2F4F6",
  },
  setSeparator: {
    height: 8
  },
  emptyMessage: {
    textAlign: "center",
    color: "#6D797C",
    marginVertical: 40,
    fontSize: 16
  }
});

const animatedStyles = (animateFloat: any, topDistance: number) =>
  StyleSheet.create({
    floatingComponent: {
      position: "absolute",
      top: Dimensions.get("window").height * topDistance,
      zIndex: 2,
      left: 0,
      right: 0,
      alignItems: "center",
      transform: [{ translateY: animateFloat }],
    },
  });

export default Folder;
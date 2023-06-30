import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useContext, useRef, useState } from "react";
import { Animated, Dimensions, FlatList, StyleSheet, Text, View } from "react-native";

import { RootStackParamList } from "../App";
import Button from "../components/Global/Button";
import DeleteMenu from "../components/Global/DeleteMenu";
import CardSetPreview from "../components/Home/CardSetPreview";
import FolderPreview from "../components/Home/FolderPreview";
import { CardSetsContext } from "../contexts/CardSetsContext";
import { FoldersContext } from "../contexts/FoldersContext";

type HomeProps = NativeStackScreenProps<RootStackParamList, "Home">;

const Home = ({ navigation }: HomeProps) => {
  const { folders } = useContext(FoldersContext);
  const { cardSets } = useContext(CardSetsContext);

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
          style={animatedStyles(animateFloat, 0.45).floatingComponent}
        >
          <DeleteMenu
            item={delValue}
            title={delTitle}
            cancel={() => setDelValue("")}
          />
        </Animated.View>
      )}

      <Animated.View
        style={animatedStyles(animateFloat, 0.88).floatingComponent}
        pointerEvents={"box-none"}
      >
        <Button
          text=" New Set"
          textColor="#000000"
          icon={"plus"}
          radius={30}
          xPadding={20}
          yPadding={12}
          function={() => navigation.navigate("NewSet")}
          backGround="#FFFFFF"
          shadow={true}
          scale={true}
        />
      </Animated.View>

      <Text style={[styles.sectionHeader]}>Active</Text>

      {(cardSets.filter((set) => set.active).length != 0) ? <FlatList
        data={cardSets.filter((set) => set.active)}
        renderItem={({ item }) => {
          return ( 
            <CardSetPreview
              nav={navigation}
              setData={item}
              del={() => {
                setDelValue(item.cardSetID);
                setDelTitle(item.title);
              }}
            />
          );
        }}
        scrollEnabled={false}
        style={styles.setList}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      /> : <Text style={styles.emptyMessage}>No sets to practice today</Text>}

      <Text style={styles.sectionHeader}>Library</Text>

      {(folders.length != 0) ? <FlatList
        data={folders}
        renderItem={({ item, index }) => {
          return (
            <View
              style={[
                { flex: 1 / 2 },
                index % 2 == 0 ? { marginRight: 20 } : { marginLeft: 0 },
              ]}
            >
              <FolderPreview
                nav={() => navigation.navigate("Folder", { folderData: item })}
                folderData={item}
                del={() => {
                  setDelValue(item.folderID);
                  setDelTitle(item.title);
                }}
              />
            </View>
          );
        }}
        numColumns={2}
        scrollEnabled={false}
        style={styles.folderList}
        ItemSeparatorComponent={() => <View style={styles.foldersSeparator} />}
      /> : <Text style={styles.emptyMessage}>No folders in your library</Text>}
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F2F4F6",
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
  },
  setList: {
    marginBottom: 20,
  },
  folderList: {
    marginBottom: 72,
    overflow: "visible",
  },
  foldersSeparator: {
    height: 20
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
      width: "100%",
      alignItems: "center",
      transform: [{ translateY: animateFloat }],
    },
  });

export default Home;

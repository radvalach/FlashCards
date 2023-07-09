import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, FlatList, KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { cardSet, folder, RootStackParamList } from "../App";
import Button from "../components/Global/Button";
import ModalHeader from "../components/Home/ModalHeader";
import ColorMenu from "../components/NewSet/ColorMenu";
import NewFolder from "../components/NewSet/NewFolder";
import { CardSetsContext } from "../contexts/CardSetsContext";
import { FoldersContext } from "../contexts/FoldersContext";

type NewSetProps = NativeStackScreenProps<RootStackParamList, "NewSet">;

const NewSet = ({ navigation }: NewSetProps) => {
  const { folders, setFolders } = useContext(FoldersContext);
  const { cardSets, setCardSets } = useContext(CardSetsContext);

  const [newFolders, setNewFolders] = useState<folder[]>([]);
  const [newSetName, setNewSetName] = useState<string>("");
  const [pickedFolders, setPickedFolders] = useState<number[]>([]);
  const [canSave, setCanSave] = useState<boolean>(false);
  const [colorIndex, setColorIndex] = useState<number>(-1);

  const floatingPosition: Animated.Value = useRef(
    new Animated.Value(0)
  ).current;
  const animateFloat = floatingPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: "extend",
  });

  const AnimScroll = Animated.createAnimatedComponent(KeyboardAwareScrollView)

  useEffect(() => {
    if (
      newSetName != "" &&
      (newFolders.length != 0 || pickedFolders.length != 0)
    ) {
      setCanSave(true);
    } else {
      setCanSave(false);
    }
  }, [newFolders, newSetName, pickedFolders]);

  // Working with new folders
  const updateFolderName = (newName: string, index: number) => {
    let folders: folder[] = [...newFolders];
    folders[index].title = newName;
    setNewFolders(folders);
  };

  const updateFolderColor = (newColor: string, index: number) => {
    let folders: folder[] = [...newFolders];
    folders[index].color = newColor;
    setNewFolders(folders);
  };

  const addNewFolder = () => {
    let newFolder: folder = {
      folderID: "",
      title: "New Folder",
      color: "#46A388",
      inactiveSets: [],
      activeSets: [],
    };
    setNewFolders((newFolders) => [newFolder, ...newFolders]);
  };

  const deleteNewFolder = (index: number) => {
    let folders: folder[] = [...newFolders];
    folders.splice(index, 1);
    setNewFolders(folders);
  };

  const createNewFolders = async (
    newFoldersArr: folder[],
    newKeys: string[],
    setKey: string
  ) => {
    for (const folder of newFolders) {
      let folderKey: string;
      try {
        folderKey = await getKeyNum("folder");
      } catch (e) {
        throw e;
      }

      const newFoldersComplete: folder = {
        folderID: "f" + folderKey,
        title: folder.title,
        color: folder.color,
        inactiveSets: [],
        activeSets: ["s" + setKey],
      };

      newFoldersArr.push(newFoldersComplete);
      newKeys.push("f" + folderKey);
      try {
        await AsyncStorage.setItem(
          "f" + folderKey,
          JSON.stringify(newFoldersComplete)
        );
      } catch (e) {
        throw e;
      }
    }
  };

  const createNewSet = async (
    newFoldersArr: folder[],
    foldersCopy: folder[],
    newKeys: string[],
    setKey: string
  ) => {
    const newSetComplete: cardSet = {
      cardSetID: "s" + setKey,
      title: newSetName,
      parentFolders: pickedFolders
        .map((index) => folders[index].folderID)
        .concat(newKeys),
      remainingCards: [],
      learnedCards: [],
      active: true,
    };

    setFolders(foldersCopy.concat(newFoldersArr));
    setCardSets([...cardSets, newSetComplete]);
    try {
      await AsyncStorage.setItem("s" + setKey, JSON.stringify(newSetComplete));
    } catch (e) {
      throw e;
    }
  };
  // Saving folders to Async
  const savefolders = async () => {
    if (!canSave) {
      return;
    }

    let newKeys: string[] = [];
    let newFoldersArr: folder[] = [];

    const setKey = await getKeyNum("set");
    let foldersCopy: folder[] = [...folders];

    for (const folder of pickedFolders) {
      const readFolder: folder = foldersCopy[folder];
      readFolder.activeSets.push("s" + setKey);
      try {
        await AsyncStorage.setItem(
          folders[folder].folderID,
          JSON.stringify(readFolder)
        );
      } catch (e) {
        throw e;
      }

      foldersCopy[folder] = readFolder;
    }

    await createNewFolders(newFoldersArr, newKeys, setKey);
    await createNewSet(newFoldersArr, foldersCopy, newKeys, setKey);

    navigation.goBack();
  };

  const getKeyNum = async (type: string) => {
    let keyNum: string | null;
    try {
      keyNum = await AsyncStorage.getItem(type + "_key");
    } catch (e) {
      throw e;
    }
    let newKeyNum: string;
    if (keyNum == null) {
      newKeyNum = "0";
    } else {
      newKeyNum = (Number(keyNum) + 1).toString();
    }
    try {
      await AsyncStorage.setItem(type + "_key", newKeyNum);
    } catch (e) {
      throw e;
    }

    return newKeyNum;
  };

  // Selecting folders
  const changePicked = (index: number) => {
    if (!pickedFolders.includes(index)) {
      setPickedFolders([...pickedFolders, index]);
    } else {
      let pickedF: number[] = [...pickedFolders];
      pickedF.splice(pickedF.indexOf(index), 1);
      setPickedFolders(pickedF);
    }
  };


  return (
    <AnimScroll
      style={styles().container}
      contentContainerStyle={styles().contentContainer}
      contentInsetAdjustmentBehavior="automatic"
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: floatingPosition } } }],
        { useNativeDriver: true }
      )}
    >
      {colorIndex >= 0 && (
        <Animated.View style={animatedStyles(animateFloat).floatingComponent}>
          <ColorMenu
            index={colorIndex}
            cancel={() => setTimeout(() => setColorIndex(-1), 50)}
            updateFolderColor={updateFolderColor}
          />
        </Animated.View>
      )}

      <ModalHeader
        isNew={true}
        canSave={canSave}
        func={savefolders}
        nav={() => navigation.goBack()}
        showLeft={true}
        title="New Set"
      />

      <TextInput
        value={newSetName}
        onChangeText={(newName) => setNewSetName(newName)}
        placeholder={"Set Title"}
        style={styles().input}
        placeholderTextColor={"#8F8F91"}
        maxLength={32}
        textAlign="center"

      />

      <Text style={styles().sectionHeader}>Save to an existing folder</Text>

      {folders.length != 0 ? (
        <FlatList
          data={folders}
          renderItem={({ item, index }) => {
            return (
              <View style={styles().folderItem}>
                <View style={styles().folderInfo}>
                  <View style={styles(item.color).setColor} />

                  <Text style={styles().folderItemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                </View>
                <Pressable>
                  <View>
                    <BouncyCheckbox
                      size={25}
                      fillColor="#007499"
                      iconStyle={styles().checkBoxIcon}
                      innerIconStyle={styles().checkBoxInnerIcon}
                      disableText={true}
                      onPress={() => changePicked(index)}
                      bounceEffectIn={0.9}
                      bouncinessIn={15}
                      bouncinessOut={15}
                      isChecked={false}
                    />
                  </View>
                </Pressable>
              </View>
            );
          }}
          scrollEnabled={false}
          style={styles().list}
          ItemSeparatorComponent={() => (
            <View style={styles().foldersSeparator} />
          )}
        />
      ) : (
        <View style={styles().emptyMessageBox}>
          <Text style={styles().emptyMessage}>No folders in your library</Text>
        </View>
      )}

      <Text style={styles().sectionHeader}>or save to a new folder</Text>

      <View style={styles().newFoldersList}>
        <Button
          text="New Folder"
          backGround="#E2ECEF"
          radius={10}
          yPadding={12}
          icon={"plus"}
          function={addNewFolder}
        />

        <FlatList
          data={newFolders}
          renderItem={({ item, index }) => {
            return (
              <NewFolder
                setColorIndex={setColorIndex}
                updateFolderName={updateFolderName}
                index={index}
                deleteNewFolder={deleteNewFolder}
                newFolders={newFolders}
              />
            );
          }}
          scrollEnabled={false}
        />
      </View>
    </AnimScroll>
  );
};

const styles = (color?: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: "#FFFFFF",
    },
    contentContainer: {
      alignItems: "center",
      paddingHorizontal: 20,
      marginTop: 20,
    },
    input: {
      height: 44,
      backgroundColor: "#F6F7F9",
      borderRadius: 10,
      fontSize: 16,
      width: "100%",
    },

    sectionHeader: {
      fontSize: 15,
      fontWeight: "500",
      color: "#70787B",
      marginTop: 40,
      marginBottom: 10,
    },
    list: {
      width: "100%",
      backgroundColor: "#F6F7F9",
      borderRadius: 10,
      flexGrow: 0,
    },
    folderItem: {
      padding: 10,
      paddingRight: 18,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    folderInfo: {
      flexDirection: "row",
    },
    folderItemTitle: {
      fontSize: 17,
      fontWeight: "500",
      padding: 10,
      width: 280,
    },
    setColor: {
      width: 4,
      borderRadius: 4,
      backgroundColor: color,
    },
    checkBoxIcon: {
      borderColor: "#E3E6EA",
      borderWidth: 2,
    },
    checkBoxInnerIcon: {
      borderWidth: 0,
    },
    foldersSeparator: {
      height: 1,
      backgroundColor: "#E3E6EA",
    },
    newFoldersList: {
      width: "100%",
      marginBottom: 40,
    },
    emptyMessage: {
      textAlign: "center",
      color: "#6D797C",
      marginVertical: 40,
      fontSize: 16,
    },
    emptyMessageBox: {
      width: "100%",
      backgroundColor: "#F6F7F9",
      borderRadius: 10,
    },
  });

const animatedStyles = (animateFloat: any) =>
  StyleSheet.create({
    floatingComponent: {
      position: "absolute",
      top: Dimensions.get("window").height * 0.6,
      zIndex: 2,
      left: 0,
      right: 0,
      alignItems: "center",
      transform: [{ translateY: animateFloat }],
    },
  });

export default NewSet;

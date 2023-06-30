import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { folder } from "../../App";

type NewFolderProps = {
  setColorIndex: React.Dispatch<React.SetStateAction<number>>;
  updateFolderName: (newName: string, index: number) => void;
  index: number;
  deleteNewFolder: (index: number) => void;
  newFolders: folder[];
}

const NewFolder = ({
  setColorIndex,
  updateFolderName,
  index,
  deleteNewFolder,
  newFolders,
}: NewFolderProps) => {
  return (
    <View style={styles().newFolderItem}>
      <View style={styles().newFolderItemColor}>
        <Pressable
          style={styles(newFolders[index].color).newFolderItemColorPicker}
          onPress={() => setColorIndex(index)}
        />
      </View>

      <TextInput
        value={newFolders[index].title}
        placeholder={"Folder Title"}
        onChangeText={(newName) => updateFolderName(newName, index)}
        style={styles().newFolderItemInput}
        placeholderTextColor={"#8F8F91"}
        maxLength={48}
      />

      <Pressable
        onPress={() => deleteNewFolder(index)}
        style={styles().deleteFolderButton
}
      >
        <Feather name="x" size={20} color="black" />
      </Pressable>
    </View>
  );
}

const styles = (color?: string) =>
  StyleSheet.create({
    newFolderItem: {
      flexDirection: "row",
      width: "100%",
      marginTop: 8,
      alignItems: "center",
      backgroundColor: "#F6F7F9",
      borderRadius: 10,
    },
    newFolderItemColor: {
      backgroundColor: "#F6F7F9",
      width: 44,
      height: 44,
      borderRightColor: "#E3E6EA",
      borderRightWidth: 1,
      borderBottomLeftRadius: 10,
      borderTopLeftRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    newFolderItemColorPicker: {
      width: 24,
      height: 24,
      backgroundColor: color,
      borderRadius: 50,
    },
    newFolderItemInput: {
      height: 44,
      backgroundColor: "#F6F7F9",
      borderRadius: 10,
      fontSize: 16,
      flex: 1,
      paddingLeft: 12,
      borderBottomLeftRadius: 0,
      borderTopLeftRadius: 0,
    },
    deleteFolderButton: {
      marginRight: 10,
      padding: 4,
      borderRadius: 5,
    }
  });

export default NewFolder
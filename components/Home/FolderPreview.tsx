import React, { useRef } from "react";
import { Animated, GestureResponderEvent, Pressable, StyleSheet, Text, View } from "react-native";

import { folder } from "../../App";

type FolderPreviewProps = {
  nav: () => void;
  folderData: folder;
  del: ((event: GestureResponderEvent) => void)
}

const FolderPreview = ({ nav, folderData, del }: FolderPreviewProps) => {
  const scaled: Animated.Value = useRef(new Animated.Value(1)).current;
  const scaleDown = () => {
    Animated.spring(scaled, {
      toValue: 0.95,
      speed: 20,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  };
  const scaleUp = () => {
    Animated.spring(scaled, {
      toValue: 1,
      speed: 30,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={scaleDown}
      onPressOut={scaleUp}
      onPress={nav}
      onLongPress={del}
    >
      <Animated.View style={styles(scaled, folderData).folder}>
        <View style={styles(scaled, folderData).folderTitle}>
          <Text
            numberOfLines={2}
            style={styles(scaled, folderData).folderTitleText}
          >
            {folderData.title}
          </Text>
        </View>

        <View style={styles(scaled, folderData).folderDetails}>
            <Text style={styles(scaled, folderData).activeNum}>{folderData.activeSets.length} </Text>
            <Text style={styles(scaled, folderData).folderDetailsText}>
              /{" "}
              {folderData.inactiveSets.concat(folderData.activeSets).length} Active Sets
            </Text>

        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = (scaled?: any, folderData?: any) =>
  StyleSheet.create({
    folder: {
      flex: 1,
      backgroundColor: "#FFFFFF",
      borderRadius: 10,
      shadowColor: "#00262C",
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 18,
      transform: [{ scaleX: scaled }, { scaleY: scaled }],
    },

    folderTitle: {
      backgroundColor: folderData.color,
      paddingHorizontal: 16,
      paddingVertical: 8,
      justifyContent: "flex-end",
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      height: 56,
    },
    folderTitleText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#FFFFFF",
    },

    folderDetails: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 12,
      alignItems: "baseline",
    },
    folderDetailsText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#6D797C",
    },
    activeNum: {
      fontSize: 16,
      color: "#000000",
      fontWeight: "700"
    }
  });

export default FolderPreview
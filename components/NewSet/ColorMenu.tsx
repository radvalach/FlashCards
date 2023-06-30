import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

import Button from "../Global/Button";

type ColorMenuProps = {
  index: number;
  cancel: () => NodeJS.Timeout;
  updateFolderColor: (newColor: string, index: number) => void
}

const ColorMenu = ({ index, cancel, updateFolderColor }: ColorMenuProps) => {
  const scaled = useRef(new Animated.Value(0.95)).current;
  const opacAnim = useRef(new Animated.Value(0)).current;

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

  return (
    <Animated.View style={animatedStyles(scaled, opacAnim).container}>
      <Button
        backGround="#46A388"
        function={() => {
          updateFolderColor("#46A388", index);
          cancelAnim();
        }}
        xPadding={20}
        yPadding={13}
      />
      <Button
        backGround="#4E89E0"
        function={() => {
          updateFolderColor("#4E89E0", index);
          cancelAnim();
        }}
        xPadding={20}
        yPadding={13}
      />
      <Button
        backGround="#7161EF"
        function={() => {
          updateFolderColor("#7161EF", index);
          cancelAnim();
        }}
        xPadding={20}
        yPadding={13}
      />
      <Button
        backGround="#E258AB"
        function={() => {
          updateFolderColor("#E258AB", index);
          cancelAnim();
        }}
        xPadding={20}
        yPadding={13}
      />
      <Button
        backGround="#FF6363"
        function={() => {
          updateFolderColor("#FF6363", index);
          cancelAnim();
        }}
        xPadding={20}
        yPadding={13}
      />
      <Button
        backGround="#FF8B66"
        function={() => {
          updateFolderColor("#FF8B66", index);
          cancelAnim();
        }}
        xPadding={20}
        yPadding={13}
      />
    </Animated.View>
  );
};

const animatedStyles = (scaled: any, opacity: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      width: "90%",
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      paddingVertical: 16,
      transform: [{ scaleX: scaled }, { scaleY: scaled }],
      opacity: opacity,

      borderRadius: 16,
      shadowColor: "#00262C",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 18,
    },
  });

export default ColorMenu;
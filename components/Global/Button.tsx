import { Feather } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Animated, GestureResponderEvent, Pressable, StyleSheet, Text } from "react-native";

type ButtonProps = {
  text?: string;
  backGround?: string;
  textColor?: string;
  icon?: any;
  radius?: number;
  xPadding?: number;
  yPadding?: number;
  iconSize?: number;
  textSize?: number;
  textWeight?:
    | "500"
    | "normal"
    | "bold"
    | "100"
    | "200"
    | "300"
    | "400"
    | "600"
    | "700"
    | "800"
    | "900"
    | undefined;
  opacity?: number;
  function?: ((event: GestureResponderEvent) => void);
  shadow?: boolean;
  scale?: boolean;
  scaleIntensity?: number
};

const Button = (props: ButtonProps) => {
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeOut = () => {
    Animated.timing(opacityAnim, {
      toValue: 0.6,
      duration: 50,
      useNativeDriver: true,
    }).start();
  };
  const fadeIn = () => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 50,
      useNativeDriver: true,
    }).start();
  };

  const scaleDown = () => {
    Animated.spring(scaleAnim, {
      toValue: props.scaleIntensity ? props.scaleIntensity : 0.95,
      speed: 20,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  };
  const scaleUp = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      speed: 30,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={() => {if (props.scale == true) { scaleDown() } else {fadeOut()}}}
      onPressOut={() => {if (props.scale == true) { scaleUp() } else {fadeIn()}}}
      onPress={props.function}
    >
      <Animated.View style={styles(props, opacityAnim, scaleAnim).Button}>
        <Feather
          name={props.icon}
          size={props.iconSize ? props.iconSize : 18}
          color={props.textColor ? props.textColor : "#007499"}
        />
        <Text style={styles(props).ButtonText}>
          {props.text ? props.text : ""}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = (props: ButtonProps, opacityAnim?: any, scaleAnim?: any) =>
  StyleSheet.create({
    Button: {
      borderRadius: props.radius ? props.radius : 20,
      paddingVertical: props.yPadding !== undefined ? props.yPadding : 6,
      paddingHorizontal: props.xPadding !== undefined ? props.xPadding : 12,
      backgroundColor: props.backGround ? props.backGround : undefined,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      opacity: opacityAnim,
      transform: [{ scaleX: scaleAnim }, { scaleY: scaleAnim }],
      shadowColor: props.shadow ? "#00262C" : undefined,
      shadowOpacity: props.shadow ? 0.2 : undefined,
      shadowOffset: props.shadow ? { width: 0, height: 10 } : undefined,
      shadowRadius: props.shadow ? 18 : undefined,
    },
    ButtonText: {
      fontSize: props.textSize ? props.textSize : 16,
      fontWeight: props.textWeight ? props.textWeight : "500",
      color: props.textColor ? props.textColor : "#007499",
      opacity: props.opacity ? props.opacity : 1,
    },
  });

export default Button
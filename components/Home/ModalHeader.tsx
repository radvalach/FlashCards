import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Button from "../Global/Button";

type ModalHeaderProps = {
  isNew: boolean;
  canSave: boolean;
  func: () => void;
  nav: () => void;
  showLeft: boolean;
}
const ModalHeader = ({ isNew, canSave, func, nav, showLeft }: ModalHeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftButton}>
        {showLeft && (
          <Button
            text="Cancel"
            textWeight="400"
            textColor="#007499"
            xPadding={0}
            yPadding={0}
            function={nav}
          />
        )}
      </View>
      <Text style={styles.headerTitle}>New Set</Text>

      <View style={styles.rightButton}>
        <Button
          text={isNew ? "Create" : "Save"}
          textWeight="600"
          textColor={canSave ? "#007499" : "grey"}
          xPadding={0}
          yPadding={0}
          function={func}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingBottom: 40,
  },
  leftButton: {
    width: 60,
    alignItems: "flex-start",
  },
  rightButton: {
    width: 60,
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600" 
  }
});

export default ModalHeader
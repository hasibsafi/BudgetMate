import React, { PropsWithChildren } from "react";
import { Modal, SafeAreaView, StyleSheet, View } from "react-native";
import { colors } from "@/constants/colors";

interface ModalSheetProps extends PropsWithChildren {
  visible: boolean;
  onRequestClose: () => void;
}

export function ModalSheet({ visible, onRequestClose, children }: ModalSheetProps): React.JSX.Element {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onRequestClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>{children}</SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.2)"
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    minHeight: 240
  }
});

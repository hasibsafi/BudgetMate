import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ViewToggleProps {
  isPartnerView: boolean;
  onToggle: (isPartnerView: boolean) => void;
  disabledPartner?: boolean;
}

export function ViewToggle({
  isPartnerView,
  onToggle,
  disabledPartner
}: ViewToggleProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, !isPartnerView && styles.active]}
        onPress={() => onToggle(false)}
      >
        <Text style={styles.text}>My Budget</Text>
      </Pressable>
      <Pressable
        style={[styles.button, isPartnerView && styles.active, disabledPartner && styles.disabled]}
        onPress={() => !disabledPartner && onToggle(true)}
      >
        <Text style={styles.text}>Partner View</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#DCE5EA",
    borderRadius: 12,
    overflow: "hidden"
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center"
  },
  active: {
    backgroundColor: "#DDF3F7"
  },
  disabled: {
    opacity: 0.5
  },
  text: {
    fontWeight: "700"
  }
});

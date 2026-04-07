import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors";
import { radii } from "@/constants/layout";

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
        <Text style={[styles.text, !isPartnerView ? styles.activeText : styles.inactiveText]}>
          My Budget
        </Text>
      </Pressable>
      <Pressable
        style={[styles.button, isPartnerView && styles.active, disabledPartner && styles.disabled]}
        onPress={() => !disabledPartner && onToggle(true)}
      >
        <Text style={[styles.text, isPartnerView ? styles.activeText : styles.inactiveText]}>
          Partner View
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: "hidden"
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center"
  },
  active: {
    backgroundColor: `${colors.primary}15`
  },
  disabled: {
    opacity: 0.5
  },
  text: {
    fontWeight: "700"
  },
  activeText: {
    color: colors.primary
  },
  inactiveText: {
    color: colors.textMuted
  }
});

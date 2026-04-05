import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface SettingsRowProps {
  label: string;
  value?: string;
  rightElement?: React.ReactNode;
}

export function SettingsRow({ label, value, rightElement }: SettingsRowProps): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Text>{label}</Text>
      {rightElement || <Text style={styles.value}>{value || "-"}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6
  },
  value: {
    color: "#5F7280"
  }
});

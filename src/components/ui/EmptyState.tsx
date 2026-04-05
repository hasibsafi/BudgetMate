import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
}

export function EmptyState({ title, subtitle }: EmptyStateProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#EFF4F7",
    gap: 4
  },
  title: {
    color: colors.text,
    fontWeight: "700"
  },
  subtitle: {
    color: colors.textMuted
  }
});

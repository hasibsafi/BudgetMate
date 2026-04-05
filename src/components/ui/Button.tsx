import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@/constants/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "destructive";
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false
}: ButtonProps): React.JSX.Element {
  const handlePress = async (): Promise<void> => {
    await Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      disabled={disabled}
      onPress={() => void handlePress()}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "destructive" && styles.destructive,
        (pressed || disabled) && styles.pressed
      ]}
    >
      <Text style={[styles.title, variant === "secondary" && styles.secondaryText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    minHeight: 46,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  destructive: {
    backgroundColor: colors.danger
  },
  title: {
    color: "#FFFFFF",
    fontWeight: "700"
  },
  secondaryText: {
    color: colors.text
  },
  pressed: {
    opacity: 0.75
  }
});

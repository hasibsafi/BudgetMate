import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "@/constants/colors";

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  error?: string | null;
}

export function Input({ label, error, ...props }: InputProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...props} style={[styles.input, !!error && styles.inputError]} />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { color: colors.text, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 11
  },
  inputError: {
    borderColor: colors.danger
  },
  error: { color: colors.danger, fontSize: 12 }
});

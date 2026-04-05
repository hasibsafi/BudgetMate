import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatCurrency } from "@/utils/budget";

interface FixedExpenseRowProps {
  name: string;
  amount: number;
  currency?: string;
}

export function FixedExpenseRow({ name, amount, currency }: FixedExpenseRowProps): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Text>{name}</Text>
      <Text>{formatCurrency(amount, currency)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8
  }
});

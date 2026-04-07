import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors";
import { formatCurrency } from "@/utils/budget";

interface FixedExpenseRowProps {
  name: string;
  amount: number;
  currency?: string;
  isLast?: boolean;
}

export function FixedExpenseRow({
  name,
  amount,
  currency,
  isLast
}: FixedExpenseRowProps): React.JSX.Element {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.amount}>{formatCurrency(amount, currency)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  name: {
    color: colors.text,
    fontWeight: "500"
  },
  amount: {
    color: colors.text,
    fontWeight: "600"
  }
});

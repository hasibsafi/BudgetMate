import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { colors } from "@/constants/colors";
import { formatCurrency, getAmountColor } from "@/utils/budget";

interface DashboardCardProps {
  income: number;
  fixedTotal: number;
  variableSpent: number;
  remaining: number;
  currency?: string;
}

export function DashboardCard({
  income,
  fixedTotal,
  variableSpent,
  remaining,
  currency
}: DashboardCardProps): React.JSX.Element {
  const spentColor = variableSpent > 0 ? colors.danger : colors.text;

  return (
    <Card>
      <Text style={styles.title}>Month Summary</Text>
      <View style={styles.grid}>
        <View style={styles.row}>
          <Text style={styles.label}>Income</Text>
          <Text style={[styles.value, styles.incomeValue]}>{formatCurrency(income, currency)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fixed Expenses</Text>
          <Text style={styles.value}>{formatCurrency(fixedTotal, currency)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Spent</Text>
          <Text style={[styles.value, { color: spentColor }]}>{formatCurrency(variableSpent, currency)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.remainingLabel}>Remaining</Text>
          <Text style={[styles.remainingValue, { color: getAmountColor(remaining) }]}>
            {formatCurrency(remaining, currency)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    color: colors.text
  },
  grid: {
    gap: 8
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  label: {
    color: colors.textMuted,
    fontSize: 13
  },
  value: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16
  },
  incomeValue: {
    color: colors.success
  },
  divider: {
    borderTopWidth: 1,
    borderColor: colors.border,
    marginVertical: 2
  },
  remainingLabel: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14
  },
  remainingValue: {
    fontSize: 18,
    fontWeight: "800"
  }
});

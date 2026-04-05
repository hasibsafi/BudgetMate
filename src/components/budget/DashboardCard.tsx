import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/utils/budget";

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
  return (
    <Card>
      <Text style={styles.title}>Month Summary</Text>
      <View style={styles.grid}>
        <Text>Income: {formatCurrency(income, currency)}</Text>
        <Text>Fixed: {formatCurrency(fixedTotal, currency)}</Text>
        <Text>Spent: {formatCurrency(variableSpent, currency)}</Text>
        <Text style={styles.remaining}>Remaining: {formatCurrency(remaining, currency)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10
  },
  grid: {
    gap: 6
  },
  remaining: {
    fontWeight: "800"
  }
});

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { getStatusColor, formatCurrency, getAmountColor } from "@/utils/budget";
import { UserCategorySnapshot } from "@/types";

interface CategoryCardProps {
  snapshot: UserCategorySnapshot;
  currency?: string;
  onPress?: () => void;
  showAddTransaction?: boolean;
  onAddTransaction?: () => void;
}

export function CategoryCard({
  snapshot,
  currency,
  onPress,
  showAddTransaction,
  onAddTransaction
}: CategoryCardProps): React.JSX.Element {
  const color = getStatusColor(snapshot.spent, snapshot.adjustedBudget);
  const carryoverColor = getAmountColor(snapshot.carryover);
  const remainingColor = getAmountColor(snapshot.remaining);

  return (
    <Card style={styles.card}>
      <View style={styles.detailsContent}>
        <View style={styles.header}>
          <Text style={styles.name}>{snapshot.categoryName}</Text>
          <StatusBadge label={snapshot.type} color={color} />
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Base</Text>
          <Text style={styles.metricValue}>{formatCurrency(snapshot.baseBudget, currency)}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Carryover</Text>
          <Text style={[styles.metricValue, { color: carryoverColor }]}>
            {formatCurrency(snapshot.carryover, currency)}
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Adjusted</Text>
          <Text style={styles.metricValue}>{formatCurrency(snapshot.adjustedBudget, currency)}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Spent</Text>
          <Text style={styles.metricValue}>{formatCurrency(snapshot.spent, currency)}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Remaining</Text>
          <Text style={[styles.metricValue, styles.remainingValue, { color: remainingColor }]}>
            {formatCurrency(snapshot.remaining, currency)}
          </Text>
        </View>
        <ProgressBar value={snapshot.spent} max={snapshot.adjustedBudget} color={color} />
      </View>
      {onPress && <Button title="Details" variant="secondary" onPress={onPress} />}
      {showAddTransaction && onAddTransaction && (
        <Button title="Add Transaction" onPress={onAddTransaction} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8
  },
  detailsContent: {
    gap: 7
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 13
  },
  metricValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600"
  },
  remainingValue: {
    fontWeight: "700"
  }
});

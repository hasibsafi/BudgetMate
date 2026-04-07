import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { getStatusColor, formatCurrency } from "@/utils/budget";
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

  return (
    <Card style={styles.card}>
      <View style={styles.detailsContent}>
        <View style={styles.header}>
          <Text style={styles.name}>{snapshot.categoryName}</Text>
          <StatusBadge label={snapshot.type} color={color} />
        </View>
        <Text>Base: {formatCurrency(snapshot.baseBudget, currency)}</Text>
        <Text>Carryover: {formatCurrency(snapshot.carryover, currency)}</Text>
        <Text>Adjusted: {formatCurrency(snapshot.adjustedBudget, currency)}</Text>
        <Text>Spent: {formatCurrency(snapshot.spent, currency)}</Text>
        <Text>Remaining: {formatCurrency(snapshot.remaining, currency)}</Text>
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
    gap: 6
  },
  detailsContent: {
    gap: 6
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  name: {
    fontSize: 16,
    fontWeight: "700"
  }
});

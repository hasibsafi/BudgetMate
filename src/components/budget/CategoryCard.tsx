import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getStatusColor, formatCurrency } from "@/utils/budget";
import { UserCategorySnapshot } from "@/types";

interface CategoryCardProps {
  snapshot: UserCategorySnapshot;
  currency?: string;
  onPress?: () => void;
}

export function CategoryCard({ snapshot, currency, onPress }: CategoryCardProps): React.JSX.Element {
  const color = getStatusColor(snapshot.spent, snapshot.adjustedBudget);
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
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
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
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

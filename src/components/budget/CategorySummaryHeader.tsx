import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { UserCategorySnapshot } from "@/types";
import { formatCurrency } from "@/utils/budget";

interface CategorySummaryHeaderProps {
  snapshot: UserCategorySnapshot;
  currency?: string;
}

export function CategorySummaryHeader({
  snapshot,
  currency
}: CategorySummaryHeaderProps): React.JSX.Element {
  return (
    <Card>
      <Text style={styles.title}>{snapshot.categoryName}</Text>
      <Text>Adjusted Budget: {formatCurrency(snapshot.adjustedBudget, currency)}</Text>
      <Text>Spent: {formatCurrency(snapshot.spent, currency)}</Text>
      <Text>Remaining: {formatCurrency(snapshot.remaining, currency)}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6
  }
});

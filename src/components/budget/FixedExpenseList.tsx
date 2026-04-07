import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/layout";
import { FixedExpenseRow } from "@/components/budget/FixedExpenseRow";
import { UserCategorySnapshot } from "@/types";

interface FixedExpenseListProps {
  snapshots: UserCategorySnapshot[];
  currency?: string;
}

export function FixedExpenseList({ snapshots, currency }: FixedExpenseListProps): React.JSX.Element {
  const fixed = snapshots.filter((snapshot) => snapshot.type === "fixed");

  return (
    <Card>
      <Text style={styles.title}>Fixed Expenses</Text>
      {fixed.map((snapshot) => (
        <FixedExpenseRow
          key={snapshot.categoryId}
          name={snapshot.categoryName}
          amount={snapshot.baseBudget}
          isLast={snapshot.categoryId === fixed[fixed.length - 1]?.categoryId}
          currency={currency}
        />
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: spacing.sm
  }
});

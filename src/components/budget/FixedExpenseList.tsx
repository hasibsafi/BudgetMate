import React from "react";
import { Text, View } from "react-native";
import { FixedExpenseRow } from "@/components/budget/FixedExpenseRow";
import { UserCategorySnapshot } from "@/types";

interface FixedExpenseListProps {
  snapshots: UserCategorySnapshot[];
  currency?: string;
}

export function FixedExpenseList({ snapshots, currency }: FixedExpenseListProps): React.JSX.Element {
  const fixed = snapshots.filter((snapshot) => snapshot.type === "fixed");
  return (
    <View>
      <Text>Fixed Expenses</Text>
      {fixed.map((snapshot) => (
        <FixedExpenseRow
          key={snapshot.categoryId}
          name={snapshot.categoryName}
          amount={snapshot.baseBudget}
          currency={currency}
        />
      ))}
    </View>
  );
}

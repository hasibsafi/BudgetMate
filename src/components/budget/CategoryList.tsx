import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CategoryCard } from "@/components/budget/CategoryCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/layout";
import { Transaction, UserCategorySnapshot } from "@/types";

interface CategoryListProps {
  snapshots: UserCategorySnapshot[];
  transactions?: Record<string, Transaction[]>;
  currency?: string;
  onSelect: (snapshot: UserCategorySnapshot) => void;
  showAddTransaction?: boolean;
  onAddTransaction?: (snapshot: UserCategorySnapshot) => void;
}

export function CategoryList({
  snapshots,
  transactions,
  currency,
  onSelect,
  showAddTransaction,
  onAddTransaction
}: CategoryListProps): React.JSX.Element {
  const budgetedSnapshots = snapshots.filter((snapshot) => snapshot.type === "budgeted");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budget Categories</Text>
      {budgetedSnapshots.length === 0 ? (
        <EmptyState
          title="No categories yet"
          subtitle="Add categories in settings to begin tracking your budget."
        />
      ) : (
        <View style={styles.list}>
          {budgetedSnapshots.map((item) => (
            <CategoryCard
              key={item.categoryId}
              snapshot={item}
              transactions={transactions?.[item.categoryId] || []}
              currency={currency}
              onPress={() => onSelect(item)}
              showAddTransaction={showAddTransaction}
              onAddTransaction={
                onAddTransaction
                  ? () => {
                      onAddTransaction(item);
                    }
                  : undefined
              }
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  list: {
    gap: spacing.sm
  }
});

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CategoryCard } from "@/components/budget/CategoryCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/layout";
import { UserCategorySnapshot } from "@/types";

interface CategoryListProps {
  snapshots: UserCategorySnapshot[];
  currency?: string;
  onSelect: (snapshot: UserCategorySnapshot) => void;
  showAddTransaction?: boolean;
  onAddTransaction?: (snapshot: UserCategorySnapshot) => void;
}

export function CategoryList({
  snapshots,
  currency,
  onSelect,
  showAddTransaction,
  onAddTransaction
}: CategoryListProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budget Categories</Text>
      {snapshots.length === 0 ? (
        <EmptyState
          title="No categories yet"
          subtitle="Add categories in settings to begin tracking your budget."
        />
      ) : (
        <View style={styles.list}>
          {snapshots.map((item) => (
            <CategoryCard
              key={item.categoryId}
              snapshot={item}
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

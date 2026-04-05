import React from "react";
import { Text, View } from "react-native";
import { CategoryCard } from "@/components/budget/CategoryCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserCategorySnapshot } from "@/types";

interface CategoryListProps {
  snapshots: UserCategorySnapshot[];
  currency?: string;
  onSelect: (snapshot: UserCategorySnapshot) => void;
}

export function CategoryList({ snapshots, currency, onSelect }: CategoryListProps): React.JSX.Element {
  return (
    <View style={{ gap: 10 }}>
      <Text>Budget Categories</Text>
      {snapshots.length === 0 ? (
        <EmptyState
          title="No categories yet"
          subtitle="Add categories in settings to begin tracking your budget."
        />
      ) : (
        <View style={{ gap: 10 }}>
          {snapshots.map((item) => (
            <CategoryCard
              key={item.categoryId}
              snapshot={item}
              currency={currency}
              onPress={() => onSelect(item)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

import React from "react";
import { SectionList, Text, View } from "react-native";
import { TransactionItem } from "@/components/budget/TransactionItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { Transaction } from "@/types";

interface TransactionListProps {
  transactions: Transaction[];
  currency?: string;
  readOnly?: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

export function TransactionList({
  transactions,
  currency,
  readOnly,
  onEdit,
  onDelete
}: TransactionListProps): React.JSX.Element {
  const sections = transactions.reduce<Array<{ title: string; data: Transaction[] }>>((acc, tx) => {
    const date = tx.date.toDate ? tx.date.toDate() : new Date();
    const title = date.toLocaleDateString();
    const existing = acc.find((item) => item.title === title);
    if (existing) {
      existing.data.push(tx);
      return acc;
    }
    acc.push({ title, data: [tx] });
    return acc;
  }, []);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => (
        <View style={{ paddingTop: 10 }}>
          <Text style={{ fontWeight: "800", color: "#1A2A33" }}>{section.title}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <TransactionItem
          item={item}
          currency={currency}
          readOnly={readOnly}
          onEdit={() => onEdit?.(item)}
          onDelete={() => onDelete?.(item)}
        />
      )}
      ListEmptyComponent={<EmptyState title="No transactions yet" subtitle="Add your first transaction." />}
    />
  );
}

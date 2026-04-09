import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { getStatusColor, formatCurrency, getAmountColor } from "@/utils/budget";
import { Transaction, UserCategorySnapshot } from "@/types";

interface CategoryCardProps {
  snapshot: UserCategorySnapshot;
  currency?: string;
  transactions?: Transaction[];
  onPress?: () => void;
  showAddTransaction?: boolean;
  onAddTransaction?: () => void;
}

export function CategoryCard({
  snapshot,
  currency,
  transactions,
  onPress,
  showAddTransaction,
  onAddTransaction
}: CategoryCardProps): React.JSX.Element {
  const color = getStatusColor(snapshot.spent, snapshot.adjustedBudget);
  const carryoverColor = getAmountColor(snapshot.carryover);
  const remainingColor = getAmountColor(snapshot.remaining);
  const recentTransactions = [...(transactions || [])]
    .sort((a, b) => {
      const aDate = a.date.toDate ? a.date.toDate().getTime() : 0;
      const bDate = b.date.toDate ? b.date.toDate().getTime() : 0;
      return bDate - aDate;
    })
    .slice(0, 3);

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
        <View style={styles.transactionSection}>
          <Text style={styles.transactionTitle}>Transactions</Text>
          {recentTransactions.length === 0 ? (
            <Text style={styles.emptyTransactionText}>No transactions yet.</Text>
          ) : (
            recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionRow}>
                <Text style={styles.transactionAmount}>{formatCurrency(transaction.amount, currency)}</Text>
                <Text style={styles.transactionNote} numberOfLines={1}>
                  {transaction.note || "No note"}
                </Text>
              </View>
            ))
          )}
        </View>
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
  },
  transactionSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    gap: 6
  },
  transactionTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13
  },
  emptyTransactionText: {
    color: colors.textMuted,
    fontSize: 12
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8
  },
  transactionAmount: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 12
  },
  transactionNote: {
    color: colors.textMuted,
    fontSize: 12,
    flex: 1,
    textAlign: "right"
  }
});

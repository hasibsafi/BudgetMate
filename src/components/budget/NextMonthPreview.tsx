import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { colors } from "@/constants/colors";
import { UserCategorySnapshot } from "@/types";
import { formatCurrency } from "@/utils/budget";

interface NextMonthPreviewProps {
  snapshots: UserCategorySnapshot[];
  currency?: string;
}

export function NextMonthPreview({ snapshots, currency }: NextMonthPreviewProps): React.JSX.Element | null {
  const budgeted = snapshots.filter((item) => item.type === "budgeted");
  const projected = budgeted.map((snapshot) => ({
    ...snapshot,
    projectedCarryover: snapshot.adjustedBudget - snapshot.spent
  }));
  const hasOverBudget = projected.some((item) => item.projectedCarryover < 0);

  if (!hasOverBudget) {
    return null;
  }

  const formatSignedCurrency = (amount: number): string => {
    const absolute = formatCurrency(Math.abs(amount), currency);
    if (amount > 0) {
      return `+${absolute}`;
    }
    if (amount < 0) {
      return `-${absolute}`;
    }
    return absolute;
  };

  return (
    <Card>
      <Text style={styles.title}>Next Month Preview</Text>
      <Text style={styles.subtitle}>Projected carryover by category</Text>
      {projected.map((snapshot) => {
        const amountStyle =
          snapshot.projectedCarryover < 0
            ? styles.negative
            : snapshot.projectedCarryover > 0
              ? styles.positive
              : styles.neutral;

        return (
          <View key={snapshot.categoryId} style={styles.row}>
            <Text>{snapshot.categoryName}</Text>
            <Text style={amountStyle}>{formatSignedCurrency(snapshot.projectedCarryover)}</Text>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "700",
    marginBottom: 6
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 10
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6
  },
  positive: {
    color: colors.success,
    fontWeight: "700"
  },
  negative: {
    color: colors.danger,
    fontWeight: "700"
  },
  neutral: {
    color: colors.textMuted,
    fontWeight: "600"
  }
});

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { UserCategorySnapshot } from "@/types";
import { formatCurrency } from "@/utils/budget";

interface NextMonthPreviewProps {
  snapshots: UserCategorySnapshot[];
  currency?: string;
}

export function NextMonthPreview({ snapshots, currency }: NextMonthPreviewProps): React.JSX.Element {
  const budgeted = snapshots.filter((item) => item.type === "budgeted");
  return (
    <Card>
      <Text style={styles.title}>Next Month Preview</Text>
      {budgeted.map((snapshot) => {
        const projectedCarryover = snapshot.adjustedBudget - snapshot.spent;
        const projectedAdjusted = snapshot.baseBudget + projectedCarryover;
        return (
          <View key={snapshot.categoryId} style={styles.row}>
            <Text>{snapshot.categoryName}</Text>
            <Text>{formatCurrency(projectedAdjusted, currency)}</Text>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "700",
    marginBottom: 10
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6
  }
});

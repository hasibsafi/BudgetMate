import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { formatCurrency } from "@/utils/budget";
import { Transaction } from "@/types";

interface TransactionItemProps {
  item: Transaction;
  currency?: string;
  readOnly?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TransactionItem({
  item,
  currency,
  readOnly,
  onEdit,
  onDelete
}: TransactionItemProps): React.JSX.Element {
  const date = item.date.toDate ? item.date.toDate() : new Date();

  const content = (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.amount}>{formatCurrency(item.amount, currency)}</Text>
        <Text>{date.toLocaleDateString()}</Text>
      </View>
      <Text style={styles.note}>{item.note || "No note"}</Text>
    </View>
  );

  if (readOnly) {
    return content;
  }

  return (
    <Swipeable
      overshootRight={false}
      renderRightActions={() => (
        <View style={styles.actions}>
          <Pressable onPress={onEdit} style={[styles.actionButton, styles.editAction]}>
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>
          <Pressable onPress={onDelete} style={[styles.actionButton, styles.deleteAction]}>
            <Text style={styles.actionText}>Delete</Text>
          </Pressable>
        </View>
      )}
    >
      {content}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F4",
    gap: 4
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  amount: {
    fontWeight: "700"
  },
  note: {
    color: "#617481"
  },
  actions: {
    flexDirection: "row",
    alignItems: "stretch",
    marginVertical: 4
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    borderRadius: 8
  },
  editAction: {
    backgroundColor: "#1F7A8C"
  },
  deleteAction: {
    backgroundColor: "#D14343"
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "700"
  }
});

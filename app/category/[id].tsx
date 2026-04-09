import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { CategorySummaryHeader } from "@/components/budget/CategorySummaryHeader";
import { TransactionList } from "@/components/budget/TransactionList";
import { useBudgetStore } from "@/store/budgetStore";
import { usePartnerStore } from "@/store/partnerStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import { useTransactionStore } from "@/store/transactionStore";
import { getCategorySnapshots } from "@/services/firestore/months";
import { Transaction, UserCategorySnapshot } from "@/types";
import { getCurrentMonthKey, getMonthDateRange } from "@/utils/date";

export default function CategoryDetailScreen(): React.JSX.Element {
  const router = useRouter();
  const { id, isPartnerView, monthKey, dataOwnerId } = useLocalSearchParams<{
    id: string;
    isPartnerView: string;
    monthKey?: string;
    dataOwnerId?: string;
  }>();
  const userId = useAuthStore((state) => state.firebaseUser?.uid);
  const currency = useSettingsStore((state) => state.settings?.currency);
  const currentMonthKey = useBudgetStore((state) => state.currentMonthKey);
  const ownSnapshot = useBudgetStore((state) => state.categorySnapshots[id]);
  const partnerSnapshot = usePartnerStore((state) => state.partnerSnapshots[id]);
  const {
    monthTransactions,
    isLoading,
    loadMonthTransactions,
    deleteTransaction
  } = useTransactionStore();
  const [historySnapshot, setHistorySnapshot] = useState<UserCategorySnapshot | null>(null);
  const readOnly = isPartnerView === "true";
  const activeMonthKey = monthKey || currentMonthKey;
  const activeOwnerId = dataOwnerId || userId;

  useFocusEffect(
    useCallback(() => {
      if (!activeOwnerId || !id) {
        return;
      }
      const range = getMonthDateRange(activeMonthKey);
      void loadMonthTransactions(activeOwnerId, range.start, range.end);
    }, [activeMonthKey, activeOwnerId, id, loadMonthTransactions])
  );

  useEffect(() => {
    if (!activeOwnerId || !id || activeMonthKey === currentMonthKey) {
      return;
    }
    getCategorySnapshots(activeOwnerId, activeMonthKey).then((snapshots) => {
      setHistorySnapshot(snapshots.find((item) => item.categoryId === id) || null);
    });
  }, [activeMonthKey, activeOwnerId, currentMonthKey, id]);

  const header = useMemo(() => {
    if (activeMonthKey !== currentMonthKey) {
      return historySnapshot;
    }
    if (readOnly) {
      return partnerSnapshot;
    }
    return ownSnapshot;
  }, [activeMonthKey, currentMonthKey, historySnapshot, ownSnapshot, partnerSnapshot, readOnly]);

  const categoryTransactions = useMemo(
    () =>
      monthTransactions.filter((transaction: Transaction) => {
        return transaction.categoryId === id;
      }),
    [id, monthTransactions]
  );

  if (!header) {
    return <View style={styles.screen} />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.navRow}>
        <Button title="Back" variant="secondary" onPress={() => router.back()} />
        <Button title="Home" variant="secondary" onPress={() => router.replace("/(tabs)/home")} />
      </View>
      <CategorySummaryHeader snapshot={header} currency={currency} />
      {!readOnly && (
        <Button
          title="Add Transaction"
          onPress={() =>
            router.push({
              pathname: "/modals/transaction",
              params: { categoryId: id, monthKey: activeMonthKey }
            })
          }
        />
      )}
      {isLoading && <ActivityIndicator />}
      <TransactionList
        transactions={categoryTransactions}
        currency={currency}
        readOnly={readOnly}
        onEdit={(transaction) =>
          router.push({
            pathname: "/modals/transaction",
            params: {
              categoryId: transaction.categoryId,
              transactionId: transaction.id,
              monthKey: activeMonthKey
            }
          })
        }
        onDelete={async (transaction) => {
          if (!activeOwnerId) {
            return;
          }
          Alert.alert("Delete transaction?", "This action cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                void (async () => {
                  try {
                    const transactionDate = transaction.date?.toDate ? transaction.date.toDate() : new Date();
                    const transactionMonthKey = getCurrentMonthKey(transactionDate);
                    await deleteTransaction(
                      activeOwnerId,
                      transaction.id,
                      transaction.categoryId,
                      transaction.amount,
                      transactionMonthKey
                    );
                  } catch (error) {
                    Alert.alert("Delete failed", (error as Error).message);
                  }
                })();
              }
            }
          ]);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F8F9",
    gap: 10,
    padding: 16
  },
  navRow: {
    flexDirection: "row",
    gap: 8
  }
});

import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { DashboardCard } from "@/components/budget/DashboardCard";
import { FixedExpenseList } from "@/components/budget/FixedExpenseList";
import { CategoryList } from "@/components/budget/CategoryList";
import { NextMonthPreview } from "@/components/budget/NextMonthPreview";
import { ViewToggle } from "@/components/budget/ViewToggle";
import { PartnerBanner } from "@/components/ui/PartnerBanner";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/layout";
import { useAuthStore } from "@/store/authStore";
import { useBudgetStore } from "@/store/budgetStore";
import { usePartnerStore } from "@/store/partnerStore";
import { useHouseholdStore } from "@/store/householdStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTransactionStore } from "@/store/transactionStore";
import { Transaction } from "@/types";
import { getCurrentMonthKey, getMonthDateRange } from "@/utils/date";

export default function HomeScreen(): React.JSX.Element {
  const router = useRouter();
  const userId = useAuthStore((state) => state.firebaseUser?.uid);
  const profile = useAuthStore((state) => state.user);
  const {
    currentMonth,
    categorySnapshots,
    isLoading,
    isPartnerView,
    setPartnerView,
    loadCategories,
    loadCategorySnapshots,
    initializeMonthIfNeeded,
    loadMonth,
    bindRealtimeMonth,
    cleanup
  } = useBudgetStore();
  const { partnerId, loadHousehold } = useHouseholdStore();
  const { partnerMonth, partnerSnapshots, loadPartnerData } = usePartnerStore();
  const { settings, loadSettings } = useSettingsStore();
  const { monthTransactions, loadMonthTransactions } = useTransactionStore();
  const [refreshing, setRefreshing] = useState(false);

  const monthKey = getCurrentMonthKey();
  const monthRange = useMemo(() => getMonthDateRange(monthKey), [monthKey]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    initializeMonthIfNeeded(userId, monthKey)
      .then(() =>
        Promise.all([
          loadCategories(userId),
          loadMonth(userId, monthKey),
          loadMonthTransactions(userId, monthRange.start, monthRange.end)
        ])
      )
      .then(() => bindRealtimeMonth(userId, monthKey));
    return cleanup;
  }, [
    bindRealtimeMonth,
    cleanup,
    initializeMonthIfNeeded,
    loadCategories,
    loadMonth,
    loadMonthTransactions,
    monthKey,
    monthRange.end,
    monthRange.start,
    userId
  ]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    loadSettings(userId);
  }, [loadSettings, userId]);

  useEffect(() => {
    if (isPartnerView && partnerId) {
      loadPartnerData(partnerId, monthKey);
    }
  }, [isPartnerView, partnerId, loadPartnerData, monthKey]);

  useEffect(() => {
    if (!profile?.householdId || !userId) {
      return;
    }
    void loadHousehold(profile.householdId, userId);
  }, [loadHousehold, profile?.householdId, userId]);

  const activeMonth = isPartnerView ? partnerMonth : currentMonth;
  const activeSnapshots = isPartnerView ? partnerSnapshots : categorySnapshots;
  const snapshotList = useMemo(() => Object.values(activeSnapshots), [activeSnapshots]);
  const transactionsByCategory = useMemo(() => {
    if (isPartnerView) {
      return {} as Record<string, Transaction[]>;
    }

    const grouped: Record<string, Transaction[]> = {};
    monthTransactions.forEach((transaction) => {
      grouped[transaction.categoryId] = [...(grouped[transaction.categoryId] || []), transaction];
    });

    Object.keys(grouped).forEach((categoryId) => {
      grouped[categoryId].sort((a, b) => {
        const aDate = a.date.toDate ? a.date.toDate().getTime() : 0;
        const bDate = b.date.toDate ? b.date.toDate().getTime() : 0;
        return bDate - aDate;
      });
    });

    return grouped;
  }, [isPartnerView, monthTransactions]);

  const onRefresh = async (): Promise<void> => {
    if (!userId) {
      return;
    }
    setRefreshing(true);
    await Promise.all([
      loadCategories(userId),
      loadMonth(userId, monthKey),
      loadCategorySnapshots(userId, monthKey),
      loadMonthTransactions(userId, monthRange.start, monthRange.end),
      loadSettings(userId),
      isPartnerView && partnerId ? loadPartnerData(partnerId, monthKey) : Promise.resolve()
    ]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />}
      >
        <ViewToggle isPartnerView={isPartnerView} onToggle={setPartnerView} disabledPartner={!partnerId} />
        {isLoading && <ActivityIndicator />}
        {isPartnerView && <PartnerBanner />}
        <DashboardCard
          income={activeMonth?.income ?? 0}
          fixedTotal={activeMonth?.fixedTotal ?? 0}
          variableSpent={activeMonth?.variableSpent ?? 0}
          remaining={activeMonth?.remaining ?? 0}
          currency={settings?.currency}
        />
        <FixedExpenseList snapshots={snapshotList} currency={settings?.currency} />
        <CategoryList
          snapshots={snapshotList}
          transactions={transactionsByCategory}
          currency={settings?.currency}
          showAddTransaction={!isPartnerView}
          onSelect={(snapshot) =>
            router.push({
              pathname: "/category/[id]",
              params: {
                id: snapshot.categoryId,
                isPartnerView: String(isPartnerView),
                monthKey,
                dataOwnerId: isPartnerView ? partnerId : userId
              }
            })
          }
          onAddTransaction={(snapshot) =>
            router.push({
              pathname: "/modals/transaction",
              params: {
                categoryId: snapshot.categoryId,
                monthKey
              }
            })
          }
        />
        <NextMonthPreview snapshots={snapshotList} currency={settings?.currency} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg
  },
  content: {
    padding: spacing.lg,
    gap: 12
  }
});

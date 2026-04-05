import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MonthSelector } from "@/components/budget/MonthSelector";
import { CategoryList } from "@/components/budget/CategoryList";
import { DashboardCard } from "@/components/budget/DashboardCard";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { getMonthHistory, getCategorySnapshots, getUserMonth } from "@/services/firestore/months";
import { UserCategorySnapshot, UserMonth } from "@/types";

export default function HistoryScreen(): React.JSX.Element {
  const router = useRouter();
  const userId = useAuthStore((state) => state.firebaseUser?.uid);
  const currency = useSettingsStore((state) => state.settings?.currency);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [snapshots, setSnapshots] = useState<UserCategorySnapshot[]>([]);
  const [monthSummary, setMonthSummary] = useState<UserMonth | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      return;
    }
    getMonthHistory(userId, 12).then((history) => {
      const keys = history.map((month) => month.monthKey);
      setMonths(keys);
      if (keys[0]) {
        setSelectedMonth(keys[0]);
      }
    });
  }, [userId]);

  useEffect(() => {
    if (!userId || !selectedMonth) {
      return;
    }
    setIsLoading(true);
    Promise.all([getCategorySnapshots(userId, selectedMonth), getUserMonth(userId, selectedMonth)]).then(
      ([monthlySnapshots, month]) => {
        setSnapshots(monthlySnapshots);
        setMonthSummary(month);
        setIsLoading(false);
      }
    );
  }, [selectedMonth, userId]);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <Text style={styles.title}>History</Text>
      <MonthSelector months={months} selected={selectedMonth} onChange={setSelectedMonth} />
      {isLoading && <ActivityIndicator />}
      <ScrollView>
        <DashboardCard
          income={monthSummary?.income ?? 0}
          fixedTotal={monthSummary?.fixedTotal ?? 0}
          variableSpent={monthSummary?.variableSpent ?? 0}
          remaining={monthSummary?.remaining ?? 0}
          currency={currency}
        />
        <View style={styles.listSpacing}>
          <CategoryList
            snapshots={snapshots}
            currency={currency}
            onSelect={(snapshot) =>
              router.push({
                pathname: "/category/[id]",
                params: {
                  id: snapshot.categoryId,
                  monthKey: selectedMonth,
                  isPartnerView: "false",
                  dataOwnerId: userId
                }
              })
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F8F9",
    padding: 16,
    gap: 8
  },
  title: {
    fontSize: 24,
    fontWeight: "800"
  },
  listSpacing: {
    marginTop: 10
  }
});

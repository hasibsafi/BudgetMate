import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CategoryList } from "@/components/budget/CategoryList";
import { DashboardCard } from "@/components/budget/DashboardCard";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { getMonthHistory, getCategorySnapshots, getUserMonth } from "@/services/firestore/months";
import { UserCategorySnapshot, UserMonth } from "@/types";

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month) {
    return monthKey;
  }
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });
}

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
      <ScrollView contentContainerStyle={styles.content}>
        {months.length === 0 && !isLoading && <Text style={styles.empty}>No history available yet.</Text>}
        {months.map((month) => {
          const isExpanded = selectedMonth === month;

          return (
            <Card key={month} style={styles.monthCard}>
              <Pressable
                style={styles.monthHeader}
                onPress={() => setSelectedMonth((current) => (current === month ? "" : month))}
              >
                <Text style={styles.monthTitle}>{formatMonthLabel(month)}</Text>
                <Text style={styles.chevron}>{isExpanded ? "▲" : "▼"}</Text>
              </Pressable>

              {isExpanded && (
                <View style={styles.expandedContent}>
                  {isLoading ? (
                    <ActivityIndicator />
                  ) : (
                    <>
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
                                monthKey: month,
                                isPartnerView: "false",
                                dataOwnerId: userId
                              }
                            })
                          }
                        />
                      </View>
                    </>
                  )}
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F8F9",
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12
  },
  content: {
    gap: 10,
    paddingBottom: 20
  },
  monthCard: {
    paddingVertical: 12
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A2A33"
  },
  chevron: {
    fontSize: 14,
    color: "#5F7280"
  },
  expandedContent: {
    marginTop: 10,
    gap: 10
  },
  listSpacing: {
    marginTop: 10
  },
  empty: {
    color: "#5F7280"
  }
});

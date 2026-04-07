import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { FixedExpenseManager } from "@/components/settings/FixedExpenseManager";
import { CategoryManager } from "@/components/settings/CategoryManager";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useBudgetStore } from "@/store/budgetStore";
import { updateMonthIncome } from "@/services/firestore/months";
import { currencies } from "@/utils/currency";

export default function FinancesScreen(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.firebaseUser);
  const { settings, isLoading, loadSettings, updateSettings } = useSettingsStore();
  const { categories, loadCategories, currentMonthKey, refreshTotals } = useBudgetStore();
  const [income, setIncome] = useState("");
  const [isSavingIncome, setIsSavingIncome] = useState(false);
  const [incomeSaveStatus, setIncomeSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const incomeSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (incomeSaveTimeoutRef.current) {
        clearTimeout(incomeSaveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user?.uid) {
      loadSettings(user.uid);
      loadCategories(user.uid);
    }
  }, [loadCategories, loadSettings, user?.uid]);

  useEffect(() => {
    setIncome(String(settings?.monthlyIncome ?? 0));
  }, [settings?.monthlyIncome]);

  const fixedCategories = useMemo(() => categories.filter((item) => item.type === "fixed"), [categories]);
  const budgetCategories = useMemo(() => categories.filter((item) => item.type === "budgeted"), [categories]);

  const handleSaveIncome = async (): Promise<void> => {
    if (!user?.uid || isSavingIncome) {
      return;
    }

    const monthlyIncome = Number(income);
    if (Number.isNaN(monthlyIncome)) {
      setIncomeSaveStatus("error");
      return;
    }

    setIsSavingIncome(true);
    setIncomeSaveStatus("idle");

    if (incomeSaveTimeoutRef.current) {
      clearTimeout(incomeSaveTimeoutRef.current);
    }

    try {
      await updateSettings(user.uid, { monthlyIncome });
      await updateMonthIncome(user.uid, currentMonthKey, monthlyIncome);
      await refreshTotals(user.uid, currentMonthKey);
      setIncomeSaveStatus("saved");
      incomeSaveTimeoutRef.current = setTimeout(() => {
        setIncomeSaveStatus("idle");
      }, 2000);
    } catch {
      setIncomeSaveStatus("error");
    } finally {
      setIsSavingIncome(false);
    }
  };

  const handleCategoriesChanged = async (): Promise<void> => {
    if (!user?.uid) {
      return;
    }
    await Promise.all([loadCategories(user.uid), refreshTotals(user.uid, currentMonthKey)]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.navRow}>
        <Button title="Back" variant="secondary" onPress={() => router.back()} />
      </View>
      <Text style={styles.title}>Finance Settings</Text>
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading && <ActivityIndicator />}

        <SettingsSection title="Income">
          <Input label="Monthly Income" value={income} onChangeText={setIncome} keyboardType="numeric" />
          <Button
            title={isSavingIncome ? "Saving..." : "Save Income"}
            onPress={() => void handleSaveIncome()}
            disabled={isSavingIncome}
          />
          {isSavingIncome && (
            <View style={styles.feedbackRow}>
              <ActivityIndicator size="small" />
              <Text style={styles.feedbackText}>Saving income...</Text>
            </View>
          )}
          {incomeSaveStatus === "saved" && <Text style={styles.successText}>Income updated.</Text>}
          {incomeSaveStatus === "error" && (
            <Text style={styles.errorText}>Couldn't save income. Please try again.</Text>
          )}
        </SettingsSection>

        <SettingsSection title="Currency">
          <View style={styles.currencyGrid}>
            {currencies.map((currency) => (
              <Button
                key={currency}
                title={currency}
                variant={settings?.currency === currency ? "primary" : "secondary"}
                onPress={() => {
                  if (!user?.uid) {
                    return;
                  }
                  void updateSettings(user.uid, { currency });
                }}
              />
            ))}
          </View>
        </SettingsSection>

        <SettingsSection title="Fixed Expenses">
          {user?.uid ? (
            <FixedExpenseManager
              userId={user.uid}
              categories={fixedCategories}
              onChanged={handleCategoriesChanged}
            />
          ) : (
            <Text>Sign in to manage expenses.</Text>
          )}
        </SettingsSection>

        <SettingsSection title="Budget Categories">
          {user?.uid ? (
            <CategoryManager
              userId={user.uid}
              categories={budgetCategories}
              onChanged={handleCategoriesChanged}
            />
          ) : (
            <Text>Sign in to manage categories.</Text>
          )}
        </SettingsSection>
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
  navRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12
  },
  content: {
    gap: 12,
    paddingBottom: 40
  },
  currencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  feedbackText: {
    color: "#607180",
    fontWeight: "600"
  },
  successText: {
    color: "#22A06B",
    fontWeight: "700"
  },
  errorText: {
    color: "#D14343",
    fontWeight: "700"
  }
});

import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { FixedExpenseManager } from "@/components/settings/FixedExpenseManager";
import { CategoryManager } from "@/components/settings/CategoryManager";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useBudgetStore } from "@/store/budgetStore";
import { useHouseholdStore } from "@/store/householdStore";
import { updateMonthIncome } from "@/services/firestore/months";
import { currencies } from "@/utils/currency";

export default function SettingsScreen(): React.JSX.Element {
  const user = useAuthStore((state) => state.firebaseUser);
  const profile = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const { settings, isLoading, loadSettings, updateSettings } = useSettingsStore();
  const { categories, loadCategories, currentMonthKey, refreshTotals } = useBudgetStore();
  const { household, partnerName, loadHousehold } = useHouseholdStore();
  const [income, setIncome] = useState("");

  useEffect(() => {
    if (user?.uid) {
      loadSettings(user.uid);
      loadCategories(user.uid);
    }
  }, [loadCategories, loadSettings, user?.uid]);

  useEffect(() => {
    if (profile?.householdId && user?.uid) {
      void loadHousehold(profile.householdId, user.uid);
    }
  }, [loadHousehold, profile?.householdId, user?.uid]);

  useEffect(() => {
    setIncome(String(settings?.monthlyIncome ?? 0));
  }, [settings?.monthlyIncome]);

  const fixedCategories = useMemo(() => categories.filter((item) => item.type === "fixed"), [categories]);
  const budgetCategories = useMemo(() => categories.filter((item) => item.type === "budgeted"), [categories]);

  const handleSaveIncome = async (): Promise<void> => {
    if (!user?.uid) {
      return;
    }
    const monthlyIncome = Number(income);
    if (Number.isNaN(monthlyIncome)) {
      return;
    }
    await updateSettings(user.uid, { monthlyIncome });
    await updateMonthIncome(user.uid, currentMonthKey, monthlyIncome);
    await refreshTotals(user.uid, currentMonthKey);
  };

  const handleCategoriesChanged = async (): Promise<void> => {
    if (!user?.uid) {
      return;
    }
    await Promise.all([loadCategories(user.uid), refreshTotals(user.uid, currentMonthKey)]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading && <ActivityIndicator />}
        <SettingsSection title="Account">
          <SettingsRow label="Email" value={user?.email || "-"} />
          <SettingsRow label="User ID" value={user?.uid || "-"} />
          <SettingsRow label="Name" value={profile?.name || "-"} />
          <SettingsRow label="Session" value="Authenticated" rightElement={undefined} />
        </SettingsSection>

        <SettingsSection title="Household">
          <SettingsRow label="Name" value={household?.name || "Not linked yet"} />
          <SettingsRow label="Invite Code" value={household?.inviteCode || "-"} />
          <SettingsRow label="Partner" value={partnerName || "Waiting for partner"} />
        </SettingsSection>

        <SettingsSection title="Income">
          <Input label="Monthly Income" value={income} onChangeText={setIncome} keyboardType="numeric" />
          <Button title="Save Income" onPress={() => void handleSaveIncome()} />
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

        <SettingsSection title="Rollover">
          <SettingsRow
            label="Rollover Enabled"
            rightElement={
              <Switch
                value={settings?.rolloverEnabled ?? true}
                onValueChange={(value) => {
                  if (!user?.uid) {
                    return;
                  }
                  void updateSettings(user.uid, { rolloverEnabled: value });
                }}
              />
            }
          />
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

        <SettingsSection title="Session">
          <Button title="Sign Out" variant="destructive" onPress={() => void signOut()} />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F8F9"
  },
  content: {
    gap: 12,
    padding: 16
  },
  currencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  }
});

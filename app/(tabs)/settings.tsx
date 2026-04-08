import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useHouseholdStore } from "@/store/householdStore";

export default function SettingsScreen(): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.firebaseUser);
  const profile = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const { settings, isLoading, loadSettings, updateSettings } = useSettingsStore();
  const { household, partnerName, loadHousehold } = useHouseholdStore();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadSettings(user.uid);
    }
  }, [loadSettings, user?.uid]);

  useEffect(() => {
    if (profile?.householdId && user?.uid) {
      void loadHousehold(profile.householdId, user.uid);
    }
  }, [loadHousehold, profile?.householdId, user?.uid]);

  useFocusEffect(
    useCallback(() => {
      if (profile?.householdId && user?.uid) {
        void loadHousehold(profile.householdId, user.uid);
      }
    }, [loadHousehold, profile?.householdId, user?.uid])
  );

  const handleDeleteAccount = (): void => {
    Alert.alert(
      "Delete account?",
      "This will permanently delete your account and all your budget data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setIsDeletingAccount(true);
              try {
                await deleteAccount();
              } catch (error) {
                Alert.alert("Delete failed", (error as Error).message);
              } finally {
                setIsDeletingAccount(false);
              }
            })();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading && <ActivityIndicator />}
        <SettingsSection title="Account">
          <SettingsRow label="Email" value={user?.email || "-"} />
          <SettingsRow label="Name" value={profile?.name || "-"} />
          <SettingsRow label="Session" value="Authenticated" rightElement={undefined} />
        </SettingsSection>

        <SettingsSection title="Household">
          <SettingsRow label="Name" value={household?.name || "Not linked yet"} />
          <SettingsRow label="Invite Code" value={household?.inviteCode || "-"} />
          <SettingsRow label="Partner" value={partnerName || "Waiting for partner"} />
        </SettingsSection>

        <SettingsSection title="Finances">
          <Button title="Finance Settings" onPress={() => router.push("/finances")} />
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

        <SettingsSection title="Danger Zone">
          <Button
            title={isDeletingAccount ? "Deleting Account..." : "Delete Account"}
            variant="destructive"
            disabled={isDeletingAccount}
            onPress={handleDeleteAccount}
          />
        </SettingsSection>

        <SettingsSection title="Session">
          <Button
            title="Sign Out"
            variant="destructive"
            disabled={isDeletingAccount}
            onPress={() => void signOut()}
          />
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
  }
});

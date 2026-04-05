import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { useHouseholdStore } from "@/store/householdStore";
import { initializeDefaultSettings } from "@/services/firestore/settings";

export default function OnboardingScreen(): React.JSX.Element {
  const router = useRouter();
  const userId = useAuthStore((state) => state.firebaseUser?.uid);
  const refreshUserProfile = useAuthStore((state) => state.refreshUserProfile);
  const create = useHouseholdStore((state) => state.createHousehold);
  const join = useHouseholdStore((state) => state.joinHousehold);

  const [householdName, setHouseholdName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [income, setIncome] = useState("0");

  const onCreate = async (): Promise<void> => {
    if (!userId) {
      return;
    }
    if (!householdName.trim()) {
      Alert.alert("Missing household name", "Household name is required.");
      return;
    }
    try {
      const code = await create(householdName.trim(), userId);
      await initializeDefaultSettings(userId, Number(income) || 0);
      await refreshUserProfile();
      Alert.alert(
        "Household created",
        `Invite code: ${code}. Next, add your fixed expenses and budget categories in Settings.`
      );
      router.replace("/(tabs)/settings");
    } catch (error) {
      Alert.alert("Failed", (error as Error).message);
    }
  };

  const onJoin = async (): Promise<void> => {
    if (!userId) {
      return;
    }
    try {
      await join(inviteCode, userId);
      await initializeDefaultSettings(userId, Number(income) || 0);
      await refreshUserProfile();
      Alert.alert("Joined household", "Next, add your fixed expenses and budget categories in Settings.");
      router.replace("/(tabs)/settings");
    } catch (error) {
      Alert.alert("Failed", (error as Error).message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Text style={styles.title}>Household Setup</Text>
      <Input label="Monthly Income" value={income} onChangeText={setIncome} keyboardType="numeric" />
      <Input label="Household Name" value={householdName} onChangeText={setHouseholdName} />
      <Button title="Create Household" onPress={onCreate} />
      <Input label="Invite Code" value={inviteCode} onChangeText={setInviteCode} />
      <Button title="Join Household" variant="secondary" onPress={onJoin} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: 12,
    padding: 20,
    backgroundColor: "#F6F8F9"
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8
  }
});

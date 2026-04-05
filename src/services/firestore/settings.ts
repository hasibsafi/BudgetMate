import { db } from "@/services/firebase/config";
import { UserSettings } from "@/types";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const defaultSettings: UserSettings = {
  monthlyIncome: 0,
  resetDay: 1,
  rolloverEnabled: true,
  overspendingEnabled: true,
  currency: "USD",
  notificationsEnabled: false
};

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const ref = doc(db, "users", userId, "settings", "default");
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return defaultSettings;
  }
  return snap.data() as UserSettings;
}

export async function updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<void> {
  const ref = doc(db, "users", userId, "settings", "default");
  await updateDoc(ref, updates);
}

export async function initializeDefaultSettings(userId: string, monthlyIncome: number): Promise<void> {
  const ref = doc(db, "users", userId, "settings", "default");
  await setDoc(ref, { ...defaultSettings, monthlyIncome });
}

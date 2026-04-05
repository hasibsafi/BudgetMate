import { create } from "zustand";
import { getUserSettings, updateUserSettings } from "@/services/firestore/settings";
import { UserSettings } from "@/types";

interface SettingsState {
  settings: UserSettings | null;
  isLoading: boolean;
  loadSettings: (userId: string) => Promise<void>;
  updateSettings: (userId: string, updates: Partial<UserSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  loadSettings: async (userId) => {
    set({ isLoading: true });
    const settings = await getUserSettings(userId);
    set({ settings, isLoading: false });
  },
  updateSettings: async (userId, updates) => {
    await updateUserSettings(userId, updates);
    const current = get().settings;
    if (current) {
      set({ settings: { ...current, ...updates } });
    }
  }
}));

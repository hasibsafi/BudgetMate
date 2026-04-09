import { create } from "zustand";
import { getUserCategories } from "@/services/firestore/categories";
import {
  cleanupOrphanedSnapshots,
  getCategorySnapshots,
  getUserMonth,
  initializeMonth,
  refreshMonthTotals,
  subscribeToCategorySnapshots,
  subscribeToMonth
} from "@/services/firestore/months";
import { getUserSettings } from "@/services/firestore/settings";
import { UserCategory, UserCategorySnapshot, UserMonth } from "@/types";
import { getCurrentMonthKey, getPreviousMonthKey } from "@/utils/date";
import { Unsubscribe } from "firebase/firestore";

interface BudgetState {
  currentMonthKey: string;
  currentMonth: UserMonth | null;
  categories: UserCategory[];
  categorySnapshots: Record<string, UserCategorySnapshot>;
  isLoading: boolean;
  isPartnerView: boolean;
  monthUnsubscribe: Unsubscribe | null;
  snapshotUnsubscribe: Unsubscribe | null;
  setPartnerView: (enabled: boolean) => void;
  loadMonth: (userId: string, monthKey: string) => Promise<void>;
  loadCategories: (userId: string) => Promise<void>;
  loadCategorySnapshots: (userId: string, monthKey: string) => Promise<void>;
  initializeMonthIfNeeded: (userId: string, monthKey?: string) => Promise<void>;
  refreshTotals: (userId: string, monthKey: string) => Promise<void>;
  bindRealtimeMonth: (userId: string, monthKey: string) => void;
  cleanup: () => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  currentMonthKey: getCurrentMonthKey(),
  currentMonth: null,
  categories: [],
  categorySnapshots: {},
  isLoading: false,
  isPartnerView: false,
  monthUnsubscribe: null,
  snapshotUnsubscribe: null,
  setPartnerView: (enabled) => set({ isPartnerView: enabled }),
  loadMonth: async (userId, monthKey) => {
    set({ isLoading: true, currentMonthKey: monthKey });
    const [month, snapshots] = await Promise.all([
      getUserMonth(userId, monthKey),
      getCategorySnapshots(userId, monthKey)
    ]);
    const byId = snapshots.reduce<Record<string, UserCategorySnapshot>>((acc, item) => {
      acc[item.categoryId] = item;
      return acc;
    }, {});
    set({ currentMonth: month, categorySnapshots: byId, isLoading: false });
  },
  loadCategories: async (userId) => {
    const categories = await getUserCategories(userId);
    set({ categories });

    const { currentMonthKey } = get();
    await cleanupOrphanedSnapshots(
      userId,
      currentMonthKey,
      categories.map((category) => category.id)
    );
  },
  loadCategorySnapshots: async (userId, monthKey) => {
    const snapshots = await getCategorySnapshots(userId, monthKey);
    const byId = snapshots.reduce<Record<string, UserCategorySnapshot>>((acc, item) => {
      acc[item.categoryId] = item;
      return acc;
    }, {});
    set({ categorySnapshots: byId });
  },
  initializeMonthIfNeeded: async (userId, monthKey = getCurrentMonthKey()) => {
    const existing = await getUserMonth(userId, monthKey);
    if (existing) {
      return;
    }

    const settings = await getUserSettings(userId);
    const categories = await getUserCategories(userId);

    let previousKey = getPreviousMonthKey(monthKey);
    let previousSnapshots = await getCategorySnapshots(userId, previousKey);
    let guard = 0;

    while (previousSnapshots.length === 0 && guard < 12) {
      const prevMonth = await getUserMonth(userId, previousKey);
      if (!prevMonth) {
        break;
      }
      previousKey = getPreviousMonthKey(previousKey);
      previousSnapshots = await getCategorySnapshots(userId, previousKey);
      guard += 1;
    }

    await initializeMonth(
      userId,
      monthKey,
      settings,
      categories,
      previousSnapshots.length ? previousSnapshots : null
    );
  },
  refreshTotals: async (userId, monthKey) => {
    await refreshMonthTotals(userId, monthKey);
    await get().loadMonth(userId, monthKey);
  },
  bindRealtimeMonth: (userId, monthKey) => {
    get().cleanup();
    const monthUnsubscribe = subscribeToMonth(userId, monthKey, (month) => {
      set({ currentMonth: month });
    });
    const snapshotUnsubscribe = subscribeToCategorySnapshots(userId, monthKey, (snapshots) => {
      const byId = snapshots.reduce<Record<string, UserCategorySnapshot>>((acc, item) => {
        acc[item.categoryId] = item;
        return acc;
      }, {});
      set({ categorySnapshots: byId });
    });
    set({ monthUnsubscribe, snapshotUnsubscribe });
  },
  cleanup: () => {
    get().monthUnsubscribe?.();
    get().snapshotUnsubscribe?.();
    set({ monthUnsubscribe: null, snapshotUnsubscribe: null });
  }
}));

import { create } from "zustand";
import { getUserCategories } from "@/services/firestore/categories";
import { getCategorySnapshots, getUserMonth } from "@/services/firestore/months";
import { UserCategory, UserCategorySnapshot, UserMonth } from "@/types";

interface PartnerState {
  partnerMonth: UserMonth | null;
  partnerCategories: UserCategory[];
  partnerSnapshots: Record<string, UserCategorySnapshot>;
  isLoading: boolean;
  loadPartnerData: (partnerId: string, monthKey: string) => Promise<void>;
}

export const usePartnerStore = create<PartnerState>((set) => ({
  partnerMonth: null,
  partnerCategories: [],
  partnerSnapshots: {},
  isLoading: false,
  loadPartnerData: async (partnerId, monthKey) => {
    set({ isLoading: true });
    const [partnerMonth, partnerCategories, snapshots] = await Promise.all([
      getUserMonth(partnerId, monthKey),
      getUserCategories(partnerId),
      getCategorySnapshots(partnerId, monthKey)
    ]);
    const partnerSnapshots = snapshots.reduce<Record<string, UserCategorySnapshot>>((acc, item) => {
      acc[item.categoryId] = item;
      return acc;
    }, {});
    set({ partnerMonth, partnerCategories, partnerSnapshots, isLoading: false });
  }
}));

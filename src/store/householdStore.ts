import { create } from "zustand";
import {
  createHousehold,
  getCategoryTemplates,
  getHouseholdById,
  getHouseholdByInviteCode,
  getHouseholdMembers,
  joinHousehold
} from "@/services/firestore/households";
import { copyTemplatesToUser } from "@/services/firestore/categories";
import { getUser } from "@/services/firestore/users";
import { Household, HouseholdMember } from "@/types";

interface HouseholdState {
  household: Household | null;
  members: HouseholdMember[];
  partnerId: string | null;
  partnerName: string | null;
  isLoading: boolean;
  loadHousehold: (householdId: string, currentUserId: string) => Promise<void>;
  createHousehold: (name: string, ownerId: string) => Promise<string>;
  joinHousehold: (inviteCode: string, userId: string) => Promise<void>;
  setPartnerName: (name: string | null) => void;
}

export const useHouseholdStore = create<HouseholdState>((set) => ({
  household: null,
  members: [],
  partnerId: null,
  partnerName: null,
  isLoading: false,
  loadHousehold: async (householdId, currentUserId) => {
    set({ isLoading: true });
    const [members, household] = await Promise.all([
      getHouseholdMembers(householdId),
      getHouseholdById(householdId)
    ]);
    const partner = members.find((member) => member.userId !== currentUserId) || null;
    const partnerUser = partner ? await getUser(partner.userId) : null;
    set({
      household,
      members,
      partnerId: partner?.userId || null,
      partnerName: partnerUser?.name || null,
      isLoading: false
    });
  },
  createHousehold: async (name, ownerId) => {
    const { inviteCode } = await createHousehold(name, ownerId);
    return inviteCode;
  },
  joinHousehold: async (inviteCode, userId) => {
    const household = await getHouseholdByInviteCode(inviteCode);
    if (!household) {
      throw new Error("Invalid invite code");
    }
    await joinHousehold(household.id, userId);
    const templates = await getCategoryTemplates(household.id);
    if (templates.length > 0) {
      await copyTemplatesToUser(userId, templates);
    }
  },
  setPartnerName: (name) => set({ partnerName: name })
}));

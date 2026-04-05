import { Timestamp } from "firebase/firestore";

export type CategoryType = "fixed" | "budgeted";

export interface User {
  id: string;
  email: string;
  name: string;
  householdId: string | null;
  createdAt: Timestamp;
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: Timestamp;
}

export interface HouseholdMember {
  userId: string;
  role: "owner" | "member";
  joinedAt: Timestamp;
}

export interface HouseholdCategoryTemplate {
  id: string;
  name: string;
  type: CategoryType;
  baseBudget: number;
  createdAt: Timestamp;
}

export interface UserCategory {
  id: string;
  name: string;
  type: CategoryType;
  baseBudget: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Transaction {
  id: string;
  categoryId: string;
  amount: number;
  note: string;
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserMonth {
  monthKey: string;
  income: number;
  fixedTotal: number;
  variableSpent: number;
  remaining: number;
  status: "active" | "closed";
  createdAt: Timestamp;
  closedAt: Timestamp | null;
}

export interface UserCategorySnapshot {
  categoryId: string;
  categoryName: string;
  type: CategoryType;
  baseBudget: number;
  carryover: number;
  adjustedBudget: number;
  spent: number;
  remaining: number;
}

export interface UserSettings {
  monthlyIncome: number;
  resetDay: number;
  rolloverEnabled: boolean;
  overspendingEnabled: boolean;
  currency: string;
  notificationsEnabled: boolean;
}

export interface CreateTransactionInput {
  categoryId: string;
  amount: number;
  note: string;
  date: Date;
}

export interface UpdateTransactionInput {
  amount?: number;
  note?: string;
  date?: Date;
  categoryId?: string;
}

import { db } from "@/services/firebase/config";
import { calculateMonthTotals, calculateNewSnapshot } from "@/services/rollover";
import { getPreviousMonthKey } from "@/utils/date";
import { UserCategory, UserCategorySnapshot, UserMonth, UserSettings } from "@/types";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  Unsubscribe,
  writeBatch,
  limit
} from "firebase/firestore";

export async function getUserMonth(userId: string, monthKey: string): Promise<UserMonth | null> {
  const snap = await getDoc(doc(db, "users", userId, "months", monthKey));
  if (!snap.exists()) {
    return null;
  }
  return {
    monthKey: snap.id,
    ...(snap.data() as Omit<UserMonth, "monthKey">)
  };
}

export async function getCategorySnapshots(
  userId: string,
  monthKey: string
): Promise<UserCategorySnapshot[]> {
  const snap = await getDocs(collection(db, "users", userId, "months", monthKey, "categorySnapshots"));
  return snap.docs.map((d) => ({
    categoryId: d.id,
    ...(d.data() as Omit<UserCategorySnapshot, "categoryId">)
  }));
}

export async function closeMonth(userId: string, monthKey: string): Promise<void> {
  await updateDoc(doc(db, "users", userId, "months", monthKey), {
    status: "closed",
    closedAt: Timestamp.now()
  });
}

export async function initializeMonth(
  userId: string,
  monthKey: string,
  settings: UserSettings,
  categories: UserCategory[],
  previousSnapshots: UserCategorySnapshot[] | null
): Promise<void> {
  const previousById = new Map((previousSnapshots || []).map((s) => [s.categoryId, s]));

  const snapshots = categories.map((category) =>
    calculateNewSnapshot(
      category,
      previousById.get(category.id) || null,
      settings.rolloverEnabled,
      settings.overspendingEnabled
    )
  );

  const totals = calculateMonthTotals(snapshots, settings.monthlyIncome);

  const batch = writeBatch(db);
  const monthRef = doc(db, "users", userId, "months", monthKey);

  batch.set(monthRef, {
    income: settings.monthlyIncome,
    fixedTotal: totals.fixedTotal,
    variableSpent: totals.variableSpent,
    remaining: totals.remaining,
    status: "active",
    createdAt: Timestamp.now(),
    closedAt: null
  });

  snapshots.forEach((snapshot) => {
    batch.set(doc(db, "users", userId, "months", monthKey, "categorySnapshots", snapshot.categoryId), {
      categoryName: snapshot.categoryName,
      type: snapshot.type,
      baseBudget: snapshot.baseBudget,
      carryover: snapshot.carryover,
      adjustedBudget: snapshot.adjustedBudget,
      spent: snapshot.spent,
      remaining: snapshot.remaining
    });
  });

  const previousMonthKey = getPreviousMonthKey(monthKey);
  const previousMonthRef = doc(db, "users", userId, "months", previousMonthKey);
  const prevSnap = await getDoc(previousMonthRef);
  if (prevSnap.exists()) {
    batch.update(previousMonthRef, {
      status: "closed",
      closedAt: Timestamp.now()
    });
  }

  await batch.commit();
}

export async function getMonthHistory(userId: string, count: number): Promise<UserMonth[]> {
  const q = query(
    collection(db, "users", userId, "months"),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    monthKey: d.id,
    ...(d.data() as Omit<UserMonth, "monthKey">)
  }));
}

export async function updateMonthIncome(
  userId: string,
  monthKey: string,
  income: number
): Promise<void> {
  const month = await getUserMonth(userId, monthKey);
  if (!month) {
    return;
  }
  const remaining = income - month.fixedTotal - month.variableSpent;
  await updateDoc(doc(db, "users", userId, "months", monthKey), {
    income,
    remaining
  });
}

export async function refreshMonthTotals(userId: string, monthKey: string): Promise<void> {
  const month = await getUserMonth(userId, monthKey);
  if (!month) {
    return;
  }
  const snapshots = await getCategorySnapshots(userId, monthKey);
  const totals = calculateMonthTotals(snapshots, month.income);
  await updateDoc(doc(db, "users", userId, "months", monthKey), {
    fixedTotal: totals.fixedTotal,
    variableSpent: totals.variableSpent,
    remaining: totals.remaining
  });
}

export function subscribeToMonth(
  userId: string,
  monthKey: string,
  callback: (month: UserMonth | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, "users", userId, "months", monthKey), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback({ monthKey: snap.id, ...(snap.data() as Omit<UserMonth, "monthKey">) });
  });
}

export function subscribeToCategorySnapshots(
  userId: string,
  monthKey: string,
  callback: (snapshots: UserCategorySnapshot[]) => void
): Unsubscribe {
  return onSnapshot(collection(db, "users", userId, "months", monthKey, "categorySnapshots"), (snap) => {
    callback(
      snap.docs.map((d) => ({
        categoryId: d.id,
        ...(d.data() as Omit<UserCategorySnapshot, "categoryId">)
      }))
    );
  });
}

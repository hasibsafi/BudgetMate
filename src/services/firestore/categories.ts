import { db } from "@/services/firebase/config";
import { HouseholdCategoryTemplate, UserCategory } from "@/types";
import { getCurrentMonthKey } from "@/utils/date";
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch
} from "firebase/firestore";

export async function getUserCategories(userId: string): Promise<UserCategory[]> {
  const snap = await getDocs(collection(db, "users", userId, "categories"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<UserCategory, "id">)
  }));
}

export async function addUserCategory(
  userId: string,
  data: Omit<UserCategory, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = doc(collection(db, "users", userId, "categories"));
  const categoryData = {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  await setDoc(ref, categoryData);

  const monthKey = getCurrentMonthKey();
  const monthRef = doc(db, "users", userId, "months", monthKey);
  const monthDoc = await getDoc(monthRef);

  if (monthDoc.exists()) {
    await setDoc(
      doc(db, "users", userId, "months", monthKey, "categorySnapshots", ref.id),
      {
        categoryName: data.name,
        type: data.type,
        baseBudget: data.baseBudget,
        carryover: 0,
        adjustedBudget: data.baseBudget,
        spent: 0,
        remaining: data.baseBudget
      },
      { merge: true }
    );

    if (data.type === "fixed") {
      const currentFixedTotal = (monthDoc.data().fixedTotal as number) || 0;
      const currentRemaining = (monthDoc.data().remaining as number) || 0;
      await updateDoc(monthRef, {
        fixedTotal: currentFixedTotal + data.baseBudget,
        remaining: currentRemaining - data.baseBudget
      });
    }
  }

  return ref.id;
}

export async function updateUserCategory(
  userId: string,
  categoryId: string,
  updates: Partial<UserCategory>
): Promise<void> {
  await updateDoc(doc(db, "users", userId, "categories", categoryId), {
    ...updates,
    updatedAt: Timestamp.now()
  });
}

export async function deleteUserCategory(userId: string, categoryId: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "categories", categoryId));
}

export async function copyTemplatesToUser(
  userId: string,
  templates: HouseholdCategoryTemplate[]
): Promise<void> {
  const batch = writeBatch(db);
  templates.forEach((template) => {
    const ref = doc(collection(db, "users", userId, "categories"));
    batch.set(ref, {
      name: template.name,
      type: template.type,
      baseBudget: template.baseBudget,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  });
  await batch.commit();
}

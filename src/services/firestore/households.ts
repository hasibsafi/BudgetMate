import { db } from "@/services/firebase/config";
import { Household, HouseholdCategoryTemplate, HouseholdMember } from "@/types";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
  writeBatch
} from "firebase/firestore";
import { customAlphabet } from "nanoid/non-secure";

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

async function generateUniqueInviteCode(): Promise<string> {
  for (let i = 0; i < 5; i += 1) {
    const code = nanoid();
    const q = query(collection(db, "households"), where("inviteCode", "==", code), limit(1));
    const result = await getDocs(q);
    if (result.empty) {
      return code;
    }
  }
  return `${nanoid()}X`;
}

export async function createHousehold(
  name: string,
  ownerId: string
): Promise<{ householdId: string; inviteCode: string }> {
  const householdRef = doc(collection(db, "households"));
  const inviteCode = await generateUniqueInviteCode();
  const batch = writeBatch(db);

  batch.set(householdRef, {
    name,
    inviteCode,
    createdAt: Timestamp.now()
  });

  batch.set(doc(db, "households", householdRef.id, "members", ownerId), {
    role: "owner",
    joinedAt: Timestamp.now()
  });

  batch.set(
    doc(db, "users", ownerId),
    {
      householdId: householdRef.id
    },
    { merge: true }
  );

  await batch.commit();

  return { householdId: householdRef.id, inviteCode };
}

export async function getHouseholdByInviteCode(code: string): Promise<Household | null> {
  const q = query(collection(db, "households"), where("inviteCode", "==", code.toUpperCase()), limit(1));
  const result = await getDocs(q);
  if (result.empty) {
    return null;
  }
  const found = result.docs[0];
  return { id: found.id, ...(found.data() as Omit<Household, "id">) };
}

export async function getHouseholdById(householdId: string): Promise<Household | null> {
  const householdDoc = await getDoc(doc(db, "households", householdId));
  if (!householdDoc.exists()) {
    return null;
  }
  return { id: householdDoc.id, ...(householdDoc.data() as Omit<Household, "id">) };
}

export async function joinHousehold(householdId: string, userId: string): Promise<void> {
  const batch = writeBatch(db);
  batch.set(doc(db, "households", householdId, "members", userId), {
    role: "member",
    joinedAt: Timestamp.now()
  });
  batch.set(doc(db, "users", userId), { householdId }, { merge: true });
  await batch.commit();
}

export async function getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  const snap = await getDocs(collection(db, "households", householdId, "members"));
  return snap.docs.map((d) => ({ userId: d.id, ...(d.data() as Omit<HouseholdMember, "userId">) }));
}

export async function getCategoryTemplates(householdId: string): Promise<HouseholdCategoryTemplate[]> {
  const snap = await getDocs(collection(db, "households", householdId, "categoryTemplates"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<HouseholdCategoryTemplate, "id">)
  }));
}

export async function addCategoryTemplate(
  householdId: string,
  data: Omit<HouseholdCategoryTemplate, "id" | "createdAt">
): Promise<void> {
  const ref = doc(collection(db, "households", householdId, "categoryTemplates"));
  await setDoc(ref, {
    ...data,
    createdAt: Timestamp.now()
  });
}

import { db } from "@/services/firebase/config";
import { User } from "@/types";
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  writeBatch
} from "firebase/firestore";

const usersCollection = "users";

export async function getUser(userId: string): Promise<User | null> {
  const snap = await getDoc(doc(db, usersCollection, userId));
  if (!snap.exists()) {
    return null;
  }
  return { id: snap.id, ...(snap.data() as Omit<User, "id">) };
}

export async function createUser(
  userId: string,
  data: { email: string; name: string }
): Promise<void> {
  await setDoc(doc(db, usersCollection, userId), {
    email: data.email,
    name: data.name,
    householdId: null,
    createdAt: Timestamp.now()
  });
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  await updateDoc(doc(db, usersCollection, userId), updates);
}

async function deleteCollectionDocs(collectionRef: ReturnType<typeof collection>): Promise<void> {
  while (true) {
    const snap = await getDocs(query(collectionRef, limit(200)));
    if (snap.empty) {
      return;
    }

    const batch = writeBatch(db);
    snap.docs.forEach((document) => {
      batch.delete(document.ref);
    });
    await batch.commit();
  }
}

export async function deleteUserData(userId: string, householdId: string | null): Promise<void> {
  await deleteCollectionDocs(collection(db, "users", userId, "transactions"));

  const monthsSnap = await getDocs(collection(db, "users", userId, "months"));
  for (const monthDoc of monthsSnap.docs) {
    await deleteCollectionDocs(collection(db, "users", userId, "months", monthDoc.id, "categorySnapshots"));
  }

  await deleteCollectionDocs(collection(db, "users", userId, "months"));
  await deleteCollectionDocs(collection(db, "users", userId, "categories"));

  await deleteDoc(doc(db, "users", userId, "settings", "default")).catch(() => undefined);

  if (householdId) {
    await deleteDoc(doc(db, "households", householdId, "members", userId)).catch(() => undefined);
  }

  await deleteDoc(doc(db, "users", userId));
}

import { db } from "@/services/firebase/config";
import { User } from "@/types";
import { Timestamp, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

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

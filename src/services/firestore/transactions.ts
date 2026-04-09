import { db } from "@/services/firebase/config";
import { CreateTransactionInput, Transaction, UpdateTransactionInput } from "@/types";
import { getCurrentMonthKey } from "@/utils/date";
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore";

export async function getTransactions(
  userId: string,
  categoryId: string,
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> {
  const q = query(
    collection(db, "users", userId, "transactions"),
    where("categoryId", "==", categoryId),
    where("date", ">=", Timestamp.fromDate(startDate)),
    where("date", "<=", Timestamp.fromDate(endDate))
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Transaction, "id">) }));
}

export async function getMonthTransactions(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> {
  const q = query(
    collection(db, "users", userId, "transactions"),
    where("date", ">=", Timestamp.fromDate(startDate)),
    where("date", "<=", Timestamp.fromDate(endDate))
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Transaction, "id">) }));
}

export async function getTransactionById(
  userId: string,
  transactionId: string
): Promise<Transaction | null> {
  const tx = await getDoc(doc(db, "users", userId, "transactions", transactionId));
  if (!tx.exists()) {
    return null;
  }
  return { id: tx.id, ...(tx.data() as Omit<Transaction, "id">) };
}

export async function addTransaction(userId: string, data: CreateTransactionInput): Promise<string> {
  const txRef = doc(collection(db, "users", userId, "transactions"));
  const monthKey = getCurrentMonthKey(data.date);
  const snapRef = doc(db, "users", userId, "months", monthKey, "categorySnapshots", data.categoryId);
  const monthRef = doc(db, "users", userId, "months", monthKey);
  const snapshotDoc = await getDoc(snapRef);
  const monthDoc = await getDoc(monthRef);

  const currentSpent = snapshotDoc.exists() ? (snapshotDoc.data().spent as number) : 0;
  const adjustedBudget = snapshotDoc.exists() ? (snapshotDoc.data().adjustedBudget as number) : 0;
  const currentVariableSpent = monthDoc.exists() ? (monthDoc.data().variableSpent as number) : 0;
  const currentRemaining = monthDoc.exists() ? (monthDoc.data().remaining as number) : 0;

  const batch = writeBatch(db);
  batch.set(txRef, {
    categoryId: data.categoryId,
    amount: data.amount,
    note: data.note,
    date: Timestamp.fromDate(data.date),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  batch.set(
    snapRef,
    {
      spent: currentSpent + data.amount,
      remaining: adjustedBudget - (currentSpent + data.amount)
    },
    { merge: true }
  );
  batch.set(
    monthRef,
    {
      variableSpent: currentVariableSpent + data.amount,
      remaining: currentRemaining - data.amount
    },
    { merge: true }
  );
  await batch.commit();
  return txRef.id;
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  oldAmount: number,
  data: UpdateTransactionInput
): Promise<void> {
  const txRef = doc(db, "users", userId, "transactions", transactionId);
  const txDoc = await getDoc(txRef);
  if (!txDoc.exists()) {
    return;
  }

  const merged = { ...(txDoc.data() as Omit<Transaction, "id">), ...data };
  const nextAmount = merged.amount;
  const delta = nextAmount - oldAmount;
  const txDate = merged.date instanceof Timestamp ? merged.date.toDate() : (merged.date as Date);
  const monthKey = getCurrentMonthKey(txDate);

  const snapRef = doc(db, "users", userId, "months", monthKey, "categorySnapshots", merged.categoryId);
  const monthRef = doc(db, "users", userId, "months", monthKey);

  const snapshotDoc = await getDoc(snapRef);
  const monthDoc = await getDoc(monthRef);

  const currentSpent = snapshotDoc.exists() ? (snapshotDoc.data().spent as number) : 0;
  const adjustedBudget = snapshotDoc.exists() ? (snapshotDoc.data().adjustedBudget as number) : 0;
  const currentVariableSpent = monthDoc.exists() ? (monthDoc.data().variableSpent as number) : 0;
  const currentRemaining = monthDoc.exists() ? (monthDoc.data().remaining as number) : 0;

  const batch = writeBatch(db);
  batch.update(txRef, {
    ...data,
    date: data.date ? Timestamp.fromDate(data.date) : merged.date,
    updatedAt: Timestamp.now()
  });
  batch.set(
    snapRef,
    {
      spent: currentSpent + delta,
      remaining: adjustedBudget - (currentSpent + delta)
    },
    { merge: true }
  );
  batch.set(
    monthRef,
    {
      variableSpent: currentVariableSpent + delta,
      remaining: currentRemaining - delta
    },
    { merge: true }
  );
  await batch.commit();
}

export async function deleteTransaction(
  userId: string,
  transactionId: string,
  categoryId: string,
  amount: number,
  monthKey: string
): Promise<void> {
  const snapRef = doc(db, "users", userId, "months", monthKey, "categorySnapshots", categoryId);
  const monthRef = doc(db, "users", userId, "months", monthKey);
  const snapshotDoc = await getDoc(snapRef);
  const monthDoc = await getDoc(monthRef);
  const currentSpent = snapshotDoc.exists() ? (snapshotDoc.data().spent as number) : 0;
  const adjustedBudget = snapshotDoc.exists() ? (snapshotDoc.data().adjustedBudget as number) : 0;
  const currentVariableSpent = monthDoc.exists() ? (monthDoc.data().variableSpent as number) : 0;
  const currentRemaining = monthDoc.exists() ? (monthDoc.data().remaining as number) : 0;

  const batch = writeBatch(db);
  batch.delete(doc(db, "users", userId, "transactions", transactionId));
  batch.set(
    snapRef,
    {
      spent: currentSpent - amount,
      remaining: adjustedBudget - (currentSpent - amount)
    },
    { merge: true }
  );
  batch.set(
    monthRef,
    {
      variableSpent: currentVariableSpent - amount,
      remaining: currentRemaining + amount
    },
    { merge: true }
  );
  await batch.commit();
}

export async function hardDeleteTransaction(userId: string, transactionId: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "transactions", transactionId));
}

import { create } from "zustand";
import {
  addTransaction,
  deleteTransaction,
  getMonthTransactions,
  getTransactionById,
  getTransactions,
  updateTransaction
} from "@/services/firestore/transactions";
import { CreateTransactionInput, Transaction, UpdateTransactionInput } from "@/types";

function toOptimisticTransaction(id: string, data: CreateTransactionInput): Transaction {
  const now = new Date();
  return {
    id,
    categoryId: data.categoryId,
    amount: data.amount,
    note: data.note,
    date: { toDate: () => data.date } as Transaction["date"],
    createdAt: { toDate: () => now } as Transaction["createdAt"],
    updatedAt: { toDate: () => now } as Transaction["updatedAt"]
  };
}

interface TransactionState {
  transactions: Transaction[];
  monthTransactions: Transaction[];
  isLoading: boolean;
  loadTransactions: (userId: string, categoryId: string, monthStart: Date, monthEnd: Date) => Promise<void>;
  loadMonthTransactions: (userId: string, monthStart: Date, monthEnd: Date) => Promise<void>;
  getTransaction: (userId: string, transactionId: string) => Promise<Transaction | null>;
  addTransaction: (userId: string, data: CreateTransactionInput) => Promise<void>;
  editTransaction: (
    userId: string,
    transactionId: string,
    oldAmount: number,
    data: UpdateTransactionInput
  ) => Promise<void>;
  deleteTransaction: (
    userId: string,
    transactionId: string,
    categoryId: string,
    amount: number,
    monthKey: string
  ) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  monthTransactions: [],
  isLoading: false,
  loadTransactions: async (userId, categoryId, monthStart, monthEnd) => {
    set({ isLoading: true });
    try {
      const transactions = await getTransactions(userId, categoryId, monthStart, monthEnd);
      set({ transactions });
    } catch {
      set({ transactions: [] });
      throw new Error("Failed to load transactions.");
    } finally {
      set({ isLoading: false });
    }
  },
  loadMonthTransactions: async (userId, monthStart, monthEnd) => {
    set({ isLoading: true });
    try {
      const monthTransactions = await getMonthTransactions(userId, monthStart, monthEnd);
      set({ monthTransactions });
    } catch {
      set({ monthTransactions: [] });
      throw new Error("Failed to load transactions.");
    } finally {
      set({ isLoading: false });
    }
  },
  getTransaction: async (userId, transactionId) => {
    return getTransactionById(userId, transactionId);
  },
  addTransaction: async (userId, data) => {
    const id = await addTransaction(userId, data);
    const optimistic = toOptimisticTransaction(id, data);
    set({
      transactions: [...get().transactions, optimistic],
      monthTransactions: [...get().monthTransactions, optimistic]
    });
  },
  editTransaction: async (userId, transactionId, oldAmount, data) => {
    await updateTransaction(userId, transactionId, oldAmount, data);

    const updateTx = (tx: Transaction): Transaction =>
      tx.id === transactionId
        ? {
            ...tx,
            ...data,
            date: data.date ? ({ toDate: () => data.date as Date } as Transaction["date"]) : tx.date
          }
        : tx;

    set({
      transactions: get().transactions.map(updateTx),
      monthTransactions: get().monthTransactions.map(updateTx)
    });
  },
  deleteTransaction: async (userId, transactionId, categoryId, amount, monthKey) => {
    await deleteTransaction(userId, transactionId, categoryId, amount, monthKey);
    set({
      transactions: get().transactions.filter((tx) => tx.id !== transactionId),
      monthTransactions: get().monthTransactions.filter((tx) => tx.id !== transactionId)
    });
  }
}));

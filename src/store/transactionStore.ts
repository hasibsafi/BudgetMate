import { create } from "zustand";
import {
  addTransaction,
  deleteTransaction,
  getTransactionById,
  getTransactions,
  updateTransaction
} from "@/services/firestore/transactions";
import { CreateTransactionInput, Transaction, UpdateTransactionInput } from "@/types";

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  loadTransactions: (userId: string, categoryId: string, monthStart: Date, monthEnd: Date) => Promise<void>;
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
  getTransaction: async (userId, transactionId) => {
    return getTransactionById(userId, transactionId);
  },
  addTransaction: async (userId, data) => {
    const id = await addTransaction(userId, data);
    set({
      transactions: [
        ...get().transactions,
        {
          id,
          categoryId: data.categoryId,
          amount: data.amount,
          note: data.note,
          date: { toDate: () => data.date } as Transaction["date"],
          createdAt: { toDate: () => new Date() } as Transaction["createdAt"],
          updatedAt: { toDate: () => new Date() } as Transaction["updatedAt"]
        }
      ]
    });
  },
  editTransaction: async (userId, transactionId, oldAmount, data) => {
    await updateTransaction(userId, transactionId, oldAmount, data);
    set({
      transactions: get().transactions.map((tx) =>
        tx.id === transactionId
          ? {
              ...tx,
              ...data,
              date: data.date ? ({ toDate: () => data.date as Date } as Transaction["date"]) : tx.date
            }
          : tx
      )
    });
  },
  deleteTransaction: async (userId, transactionId, categoryId, amount, monthKey) => {
    await deleteTransaction(userId, transactionId, categoryId, amount, monthKey);
    set({ transactions: get().transactions.filter((tx) => tx.id !== transactionId) });
  }
}));

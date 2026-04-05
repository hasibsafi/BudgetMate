import { create } from "zustand";
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/services/firebase/config";
import { createUser, getUser } from "@/services/firestore/users";
import { User } from "@/types";

interface AuthState {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: FirebaseUser | null) => void;
  refreshUserProfile: () => Promise<void>;
  initializeAuth: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ firebaseUser: user, isAuthenticated: !!user, isLoading: false }),
  refreshUserProfile: async () => {
    if (!auth?.currentUser) {
      set({ user: null });
      return;
    }
    const profile = await getUser(auth.currentUser.uid);
    set({ user: profile });
  },
  initializeAuth: () => {
    if (!isFirebaseConfigured || !auth) {
      set({ firebaseUser: null, user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        set({ firebaseUser: null, user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      const profile = await getUser(user.uid);
      set({ firebaseUser: user, user: profile, isAuthenticated: true, isLoading: false });
    });
  },
  signIn: async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured. Update src/services/firebase/config.ts");
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === "auth/configuration-not-found") {
        throw new Error("Enable Email/Password in Firebase Console > Authentication > Sign-in method.");
      }
      throw error;
    }
  },
  signUp: async (email, password, name) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured. Update src/services/firebase/config.ts");
    }
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await createUser(credential.user.uid, { email, name });
      const profile = await getUser(credential.user.uid);
      set({ firebaseUser: credential.user, user: profile, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === "auth/configuration-not-found") {
        throw new Error("Enable Email/Password in Firebase Console > Authentication > Sign-in method.");
      }
      throw error;
    }
  },
  signOut: async () => {
    if (!isFirebaseConfigured || !auth) {
      set({ firebaseUser: null, user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    await signOut(auth);
  }
}));

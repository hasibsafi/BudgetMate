import { create } from "zustand";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/services/firebase/config";
import { getGoogleIdToken } from "@/services/firebase/googleAuth";
import { createUser, deleteUserData, getUser } from "@/services/firestore/users";
import { User } from "@/types";

const NEEDS_PASSWORD_ERROR = "NEEDS_PASSWORD";

async function reauthenticateForDelete(currentUser: FirebaseUser, password?: string): Promise<void> {
  const hasGoogleProvider = currentUser.providerData.some((provider) => provider.providerId === "google.com");
  if (hasGoogleProvider) {
    const idToken = await getGoogleIdToken();
    const credential = GoogleAuthProvider.credential(idToken);
    await reauthenticateWithCredential(currentUser, credential);
    return;
  }

  const hasPasswordProvider = currentUser.providerData.some((provider) => provider.providerId === "password");
  if (hasPasswordProvider) {
    if (!currentUser.email) {
      throw new Error("Unable to verify your account email. Please sign out and sign back in.");
    }
    if (!password) {
      throw new Error(NEEDS_PASSWORD_ERROR);
    }

    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);
    return;
  }

  throw new Error("For security, please sign out and sign back in before deleting your account.");
}

interface AuthState {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: FirebaseUser | null) => void;
  refreshUserProfile: () => Promise<void>;
  initializeAuth: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
  signInWithGoogle: async () => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured. Update src/services/firebase/config.ts");
    }
    if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      throw new Error("Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your .env file.");
    }

    const idToken = await getGoogleIdToken();
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);

    const existingUser = await getUser(result.user.uid);
    if (!existingUser) {
      const fallbackName = result.user.displayName || result.user.email?.split("@")[0] || "User";
      await createUser(result.user.uid, {
        email: result.user.email || "",
        name: fallbackName
      });
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
  deleteAccount: async (password) => {
    if (!isFirebaseConfigured || !auth || !auth.currentUser) {
      throw new Error("You must be signed in to delete your account.");
    }

    const currentUser = auth.currentUser;
    const profile = get().user || (await getUser(currentUser.uid));
    const lastSignIn = currentUser.metadata.lastSignInTime
      ? new Date(currentUser.metadata.lastSignInTime).getTime()
      : 0;

    if (!lastSignIn || Date.now() - lastSignIn > 10 * 60 * 1000) {
      await reauthenticateForDelete(currentUser, password);
    }

    try {
      await deleteUserData(currentUser.uid, profile?.householdId ?? null);
      await deleteUser(currentUser);
      set({ firebaseUser: null, user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === "auth/requires-recent-login") {
        await reauthenticateForDelete(currentUser, password);
        await deleteUserData(currentUser.uid, profile?.householdId ?? null);
        await deleteUser(currentUser);
        set({ firebaseUser: null, user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      throw error;
    }
  },
  signOut: async () => {
    if (!isFirebaseConfigured || !auth) {
      set({ firebaseUser: null, user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    await firebaseSignOut(auth);
  }
}));

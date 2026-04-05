import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  getAuth,
  initializeAuth
} from "firebase/auth";
import * as FirebaseAuth from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Firestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

export const isFirebaseConfigured =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.projectId &&
  !!firebaseConfig.appId;

const app: FirebaseApp | null = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

let authInstance: Auth | null = null;
if (app) {
  try {
    const getRN = (FirebaseAuth as unknown as { getReactNativePersistence?: (storage: unknown) => unknown })
      .getReactNativePersistence;
    if (getRN) {
      authInstance = initializeAuth(app, {
        persistence: getRN(AsyncStorage) as never
      });
    } else {
      authInstance = getAuth(app);
    }
  } catch {
    authInstance = getAuth(app);
  }
}

export const auth = authInstance;
export const db = (app ? getFirestore(app) : ({} as Firestore)) as Firestore;

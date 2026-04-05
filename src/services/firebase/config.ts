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
  apiKey: "AIzaSyDAe77sjeeS3pVIpyDHVOq9Si2T_MwJPTA",
  authDomain: "getbudgetmate.firebaseapp.com",
  projectId: "getbudgetmate",
  storageBucket: "getbudgetmate.firebasestorage.app",
  messagingSenderId: "612507726182",
  appId: "1:612507726182:web:38dedba9576967d8c418a7",
  measurementId: "G-N07012JMX7"
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

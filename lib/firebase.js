import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { 
  initializeAuth, 
  getReactNativePersistence, 
  browserLocalPersistence, 
  getAuth 
} from 'firebase/auth';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;

const setupAuth = () => {
  if (getApps().length > 0) {
    try {
      const existingAuth = getAuth(app);
      if (existingAuth) return existingAuth;
    } catch (_e) {
    }
  }

  if (Platform.OS === 'web') {
    return initializeAuth(app, {
      persistence: browserLocalPersistence,
    });
  } else {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
};

auth = setupAuth();

export { auth };
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });
export const storage = getStorage(app);
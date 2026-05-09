import { initializeApp, getApps, getApp } from "firebase/app";

import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  browserLocalPersistence,
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyDW2CNrOXXBQIyGHrGOp7gVKc43kWm33MY",
  authDomain: "mabulileatherworks.firebaseapp.com",
  projectId: "mabulileatherworks",
  storageBucket: "mabulileatherworks.appspot.com",
  messagingSenderId: "872626611767",
  appId: "1:872626611767:web:e8b48ae801a66ec8c301b2",
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

let auth;

try {
  if (Platform.OS === "web") {
    auth = getAuth(app);
    auth.setPersistence(browserLocalPersistence);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
} catch (_error) {
  auth = getAuth(app);
}

export { auth };

export const db = getFirestore(app);

export const storage = getStorage(app);
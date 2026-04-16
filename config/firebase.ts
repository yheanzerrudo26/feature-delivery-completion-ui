import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDW2CNrOXXBQIyGHrGOp7gVKc43kWm33MY",
  authDomain: "mabulileatherworks.firebaseapp.com",
  projectId: "mabulileatherworks",
  storageBucket: "mabulileatherworks.appspot.com", // corrected
  messagingSenderId: "872626611767",
  appId: "1:872626611767:web:e8b48ae801a66ec8c301b2",
};

const app = initializeApp(firebaseConfig);

// ✅ Use initializeAuth instead of getAuth
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);

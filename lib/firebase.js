import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔥 Firebase config (SAFE for frontend)
const firebaseConfig = {
  apiKey: "AIzaSyDW2CNrOXXBQIyGHrGOp7gVKc43kWm33MY",
  authDomain: "mabulileatherworks.firebaseapp.com",
  projectId: "mabulileatherworks",
  storageBucket: "mabulileatherworks.appspot.com",
  messagingSenderId: "872626611767",
  appId: "1:872626611767:web:e8b48ae801a66ec8c301b2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const storage = getStorage(app);
// frontend/services/auth.service.js
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/backend/firebase";

const API_URL = "http://192.168.1.22:5000/api/auth";

// Register still goes through backend
export const registerUser = async (email, password, firstName, lastName) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      firstName,
      lastName,
      role: "user", // default role
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return await response.json(); // backend returns uid, email, role
};

// Login with Firebase Auth directly
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
  };
};

// Fetch role from backend after login
export const fetchUserRole = async (uid) => {
  const response = await fetch(`${API_URL}/role/${uid}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return await response.json(); // { role: "admin" | "user" }
};

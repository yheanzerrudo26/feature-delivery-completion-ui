import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, // We will keep this and actually use it below
} from "firebase/auth";
import { auth } from "./firebase.js";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api`;

/**
 * Registers a new user via Firebase Auth and saves profile to Backend
 */
export const registerUser = async (email, password, firstName, lastName) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  
  const uid = userCredential.user.uid;

  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uid,
      email,
      firstName,
      lastName,
      role: "user",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to save user profile");
  }

  return userCredential.user;
};

/**
 * Logs in a user (This uses the imported function, fixing your warning)
 */
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};

/**
 * Fetches the user role from the Node.js backend
 */
export const fetchUserRole = async (uid) => {
  const response = await fetch(`${API_URL}/auth/role/${uid}`);
  if (!response.ok) throw await response.json();
  return response.json();
};
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, } from "firebase/auth";
import { auth } from "./firebase.js";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api`;

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

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};

export const fetchUserRole = async (uid) => {
  const response = await fetch(`${API_URL}/auth/role/${uid}`);
  if (!response.ok) throw await response.json();
  return response.json();
};
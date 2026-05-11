import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase.js";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.20:5000"}/api`;

export const registerUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  return userCredential.user;
};

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  return userCredential.user;
};

export const fetchUserRole = async (uid) => {
  const response = await fetch(`${API_URL}/auth/role/${uid}`);

  if (!response.ok) throw await response.json();

  return response.json();
};

export const getAuthToken = async () => {
  return await auth.currentUser?.getIdToken();
};
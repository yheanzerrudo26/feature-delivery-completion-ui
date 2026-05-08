import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/backend/firebase";

const API_URL = "http://192.168.1.22:5000/api/auth";

export const registerUser = async (email, password, firstName, lastName) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      firstName,
      lastName,
      role: "user", 
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return await response.json();
};

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
  };
};

export const fetchUserRole = async (uid) => {
  const response = await fetch(`${API_URL}/role/${uid}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return await response.json(); 
};

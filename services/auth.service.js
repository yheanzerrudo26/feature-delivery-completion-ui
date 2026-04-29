import { createUserWithEmailAndPassword, signInWithEmailAndPassword, } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { addLog } from "./log.service";


export const registerUser = async (
  email,
  password,
  firstName,
  lastName
) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", res.user.uid), {
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    email,
    role: "user",
    createdAt: new Date(),
  });

  await addLog("register", "New user registered");

  return res.user;
};

export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};


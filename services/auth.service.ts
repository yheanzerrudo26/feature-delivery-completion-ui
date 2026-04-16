import { auth, db } from "../config/firebase";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword,} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { addLog } from "./log.service";


export const registerUser = async (
  email: string,
  password: string,
  name: string
) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", res.user.uid), {
    name,
    email,
    role: "user",
    createdAt: new Date(),
  });

  await addLog("register", "New user registered");

  return res.user;
};

export const loginUser = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

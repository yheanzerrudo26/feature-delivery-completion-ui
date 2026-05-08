import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const getUserRole = async (uid) => {
  try {
    const snap = await getDoc(doc(db, "users", uid));

    if (!snap.exists()) return "user";

    return snap.data()?.role || "user";
  } catch (error) {
    console.log(error);
    return "user";
  }
};


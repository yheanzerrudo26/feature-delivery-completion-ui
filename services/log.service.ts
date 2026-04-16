import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/config/firebase";

export const addLog = async (
  type: "login" | "register" | "profileUpdate",
  message: string
) => {
  const date = new Date().toISOString().split("T")[0];

  const ref = doc(db, "logs", date);

  await setDoc(
    ref,
    {
      items: arrayUnion({
        type,
        message,
        createdAt: Date.now(),
      }),
    },
    { merge: true }
  );
};
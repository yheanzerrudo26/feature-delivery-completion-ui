import { db } from "@/backend/firebase";
import { arrayUnion, doc, setDoc } from "firebase/firestore";

export const addLog = async (
  type,
  message
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


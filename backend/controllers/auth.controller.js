import { db } from "../config/firebase.js";

export const getRoleByUid = async (req, res) => {
  try {
    const { uid } = req.params;

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.json({ role: "user" });
    }

    return res.json(userSnap.data());
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

}; 
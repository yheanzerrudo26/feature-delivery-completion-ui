import { db, admin } from "../config/firebase.js";

export const addLog = async (req, res) => {
  try {
    const { userId, action, message } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const date = new Date().toLocaleDateString("en-CA", {timeZone: "Asia/Manila",});

    const logRef = db.collection("logs").doc(date);

    await logRef.set(
      {
        items: admin.firestore.FieldValue.arrayUnion({
          userId,
          type: action,
          message: message || "",
          createdAt: Date.now(),
        }),
      },
      { merge: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const getLogs = async (req, res) => {
  try {
    const snapshot = await db.collection("logs").get();

    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      items: doc.data().items || [],
    }));

    return res.json({ logs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
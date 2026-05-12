import { db } from "../config/firebase.js";

// GET user role
export const getRoleByUid = async (req, res) => {
  try {
    const { uid } = req.params;
    const userSnap = await db.collection("users").doc(uid).get();

    if (!userSnap.exists) {
      return res.json({ role: "user" });
    }

    return res.json(userSnap.data());
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST new user record
export const registerUserRecord = async (req, res) => {
  try {
    const { uid, email, firstName, lastName, role } = req.body;

    await db.collection("users").doc(uid).set({
      email,
      firstName,
      lastName,
      role: role || "user",
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({ message: "User profile created successfully" });
  } catch (err) {
    console.error("Registration Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
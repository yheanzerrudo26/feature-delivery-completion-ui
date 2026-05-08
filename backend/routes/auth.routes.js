// backend/routes/auth.routes.js
import express from "express";
import { auth, db } from "../services/firebase.service.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await setDoc(doc(db, "users", uid), {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      role: role || "user",
      createdAt: new Date(),
    });

    res.json({ uid, email, role: role || "user" });
  } catch (error) {
    res.status(400).json({ code: error.code, message: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const roleDoc = await getDoc(doc(db, "users", uid));
    const role = roleDoc.exists() ? roleDoc.data().role : "user";

    res.json({ uid, email: userCredential.user.email, role });
  } catch (error) {
    res.status(400).json({ code: error.code, message: error.message });
  }
});

// Get role by UID
router.get("/role/:uid", async (req, res) => {
  const { uid } = req.params;
  try {
    const roleDoc = await getDoc(doc(db, "users", uid));
    if (roleDoc.exists()) {
      res.json({ role: roleDoc.data().role });
    } else {
      res.json({ role: "user" }); // fallback
    }
  } catch (error) {
    res.status(400).json({ code: error.code, message: error.message });
  }
});

export default router;

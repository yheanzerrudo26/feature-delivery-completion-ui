import express from "express";
import { getRoleByUid, registerUserRecord } from "../controllers/auth.controller.js";

const router = express.Router();

// GET: http://192.168.1.XX:5000/api/auth/role/:uid
router.get("/role/:uid", getRoleByUid);

// POST: http://192.168.1.XX:5000/api/auth/register
router.post("/register", registerUserRecord);

export default router;
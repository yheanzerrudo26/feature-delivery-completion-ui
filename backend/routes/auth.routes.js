import express from "express";
import { getRoleByUid, registerUserRecord } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/role/:uid", getRoleByUid);

router.post("/register", registerUserRecord);

export default router;
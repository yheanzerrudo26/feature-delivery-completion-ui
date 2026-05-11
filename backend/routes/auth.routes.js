import express from "express";
import { getRoleByUid } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/role/:uid", getRoleByUid);

export default router;
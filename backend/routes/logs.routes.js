import express from "express";
import { addLog, getLogs } from "../controllers/logs.controller.js";

const router = express.Router();

router.post("/add", addLog);
router.get("/", getLogs);

export default router;
// backend/routes/checklist.routes.js
import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Checklist route working!" });
});

export default router;

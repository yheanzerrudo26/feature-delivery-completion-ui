import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import logsRoutes from "./routes/logs.routes.js";
import checklistRoutes from "./routes/checklist.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import photoRoutes from "./routes/photo.routes.js";
import workflowRoutes from "./routes/workflow.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "MABULI Backend API Running..." });
});

app.use("/api/auth", authRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/checklist", checklistRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/workflow", workflowRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
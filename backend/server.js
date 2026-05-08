import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import checklistRoutes from "./routes/checklist.routes.js";
import photoRoutes from "./routes/photo.routes.js";
import workflowRoutes from "./routes/workflow.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "MABULI Backend API is running..." });
});

app.use("/api/auth", authRoutes);
app.use("/api/checklist", checklistRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/workflow", workflowRoutes);
app.use("/api/inventory", inventoryRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

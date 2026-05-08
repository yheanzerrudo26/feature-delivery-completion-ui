// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import routes FIRST
import authRoutes from "./routes/auth.routes.js";
import checklistRoutes from "./routes/checklist.routes.js";
import photoRoutes from "./routes/photo.routes.js";
import workflowRoutes from "./routes/workflow.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "MABULI Backend API is running..." });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/checklist", checklistRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/workflow", workflowRoutes);
app.use("/api/inventory", inventoryRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

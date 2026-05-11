import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import logsRoutes from "./routes/logs.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "*", // tighten later in production
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "MABULI Backend API Running..." });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/logs", logsRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
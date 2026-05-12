import { auth } from "../config/firebase.js";

export const verifyToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];

    const decoded = await auth.verifyIdToken(token);

    req.user = decoded;

    next();
  } catch (_err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
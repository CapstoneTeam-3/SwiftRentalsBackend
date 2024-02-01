// src/middlewares/authMiddleware.js
import { JWT_SECRET_KEY } from "../config/index.js";
import jwt from "jsonwebtoken";

export const authenticate = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - Token missing" });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Forbidden - Invalid token" });
  }
};

export default authenticate;

import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import User from "../models/user";

/**
 * Middleware to check if user session is still valid
 * Ensures user hasn't been logged out
 */
export const checkSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const user = await User.findById(req.user.id).select("refreshToken");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // If no refresh token, user has logged out
    if (!user.refreshToken) {
      res.status(401).json({
        message: "Session expired. Please login again",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Session check error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

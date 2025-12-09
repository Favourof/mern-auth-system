import express, { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getMe,
  refreshToken,
  logout,
} from "../controllers/authController";
import { protect } from "../middleware/auth";

const router: Router = express.Router();

// Validation rules
const registerValidation = [
  body("name", "Name is required").notEmpty().trim(),
  body("email", "Please include a valid email").isEmail().normalizeEmail(),
  body("password", "Password must be at least 6 characters").isLength({
    min: 6,
  }),
];

const loginValidation = [
  body("email", "Please include a valid email").isEmail().normalizeEmail(),
  body("password", "Password is required").exists(),
];

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/refresh", refreshToken);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;

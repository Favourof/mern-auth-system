import express, { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getMe,
  refreshToken,
  logout,
} from "../controllers/authController";
import {
  verifyEmail,
  resendVerification,
} from "../controllers/verificationController";
import { protect } from "../middleware/auth";
import { checkSession } from "../middleware/checkSession";
import { resetPasswordLimiter } from "../middleware/rateLimiter";
import {
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/passwordController";

const router: Router = express.Router();

// Validation rules
const registerValidation = [
  body("name", "Name is required").notEmpty().trim(),
  body("email", "Please include a valid email").isEmail().normalizeEmail(),
  body("password", "Password must be at least 8 characters").isLength({
    min: 6,
  }),
];

const loginValidation = [
  body("email", "Please include a valid email").isEmail().normalizeEmail(),
  body("password", "Password is required").exists(),
];

const forgotPasswordValidation = [
  body("email", "Please include a valid email").isEmail().normalizeEmail(),
];

const resetPasswordValidation = [
  body("token", "Token is required").notEmpty(),
  body("newPassword", "Password must be at least 8 characters").isLength({
    min: 8,
  }),
];

const changePasswordValidation = [
  body("currentPassword", "Current password is required").notEmpty(),
  body("newPassword", "New password must be at least 8 characters").isLength({
    min: 8,
  }),
];
const verifyEmailValidation = [body("token", "Token is required").notEmpty()];

const resendVerificationValidation = [
  body("email", "Email is requiared").notEmpty(),
];
// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/refresh", refreshToken);

// verificatoin route
router.post("/verify-email", verifyEmailValidation, verifyEmail);
router.post(
  "/resend-verification",
  resendVerificationValidation,
  resendVerification
);

// Password reset routes
router.post(
  "/forgot-password",
  resetPasswordLimiter,
  forgotPasswordValidation,
  forgotPassword
);
router.post(
  "/reset-password",
  resetPasswordLimiter,
  resetPasswordValidation,
  resetPassword
);
router.post(
  "/change-password",
  protect,
  checkSession,
  changePasswordValidation,
  changePassword
);

// Protected routes
router.post("/logout", protect, checkSession, logout);
router.get("/me", protect, checkSession, getMe);

export default router;

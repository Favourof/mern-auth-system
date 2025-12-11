import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import User from "../models/user";
import { AuthRequest } from "../types";
import {
  verifyVerificationToken,
  generateVerificationToken,
} from "../utils/token";
import { sendWelcomeEmail, resendVerificationEmail } from "../utils/email";
import { AppError } from "../middleware/errorHandler";

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
export const verifyEmail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { token } = req.body;

    // Verify token
    let decoded;
    try {
      decoded = verifyVerificationToken(token);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
      return;
    }

    // Find user with valid verification token
    const user = await User.findOne({
      _id: decoded.id,
      email: decoded.email,
      verificationToken: token,
      verificationTokenExpire: { $gt: Date.now() }, // Token not expired
    });

    if (!user) {
      throw new AppError("Invalid or expired verification token", 400);
    }

    // Check if already verified
    if (user.isVerified) {
      throw new AppError("Email already verified", 400);
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      console.error("Welcome email error:", error);
      // Don't fail verification if welcome email fails
    }

    res.json({
      success: true,
      message: "Email verified successfully! You can now login.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
export const resendVerification = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists
      res.json({
        success: true,
        message:
          "If that email exists and is unverified, a new verification email has been sent",
      });
      return;
    }

    // Check if already verified
    if (user.isVerified) {
      res.status(400).json({ message: "Email already verified" });
      return;
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken(
      user._id.toString(),
      user.email
    );

    user.verificationToken = verificationToken;
    user.verificationTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email
    try {
      await resendVerificationEmail(user.email, verificationToken);
    } catch (error) {
      res.status(500).json({ message: "Email could not be sent" });
      return;
    }

    res.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

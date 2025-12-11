import { NextFunction, Response } from "express";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import User from "../models/user";
import { AuthRequest } from "../types";
import { generateResetToken, verifyResetToken } from "../utils/token";
import { sendPasswordResetEmail } from "../utils/email";
import { AppError } from "../middleware/errorHandler";

//    Request password reset email

export const forgotPassword = async (
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

    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always return success (don't reveal if email exists)
    if (!user) {
      throw new AppError(
        "If that email exists, a reset link has been sent",
        400
      );
    }

    // Generate reset token
    const resetToken = generateResetToken(user._id.toString(), user.email);

    // Save token and expiry to database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      // Reset token fields if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(500).json({ message: "Email could not be sent" });
      return;
    }

    res.json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password

export const resetPassword = async (
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

    const { token, newPassword } = req.body;

    // Verify token
    let decoded;
    try {
      decoded = verifyResetToken(token);
    } catch (error) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    // Find user with valid reset token
    const user = await User.findOne({
      _id: decoded.id,
      email: decoded.email,
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }, // Token not expired
    });

    if (!user) {
      throw new AppError("Invalid or expired reset token", 401);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Invalidate all sessions (clear refresh token)
    user.refreshToken = null;

    await user.save();

    res.json({
      success: true,
      message:
        "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

//  Change password (when logged in)
export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError("Current password is incorrect", 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

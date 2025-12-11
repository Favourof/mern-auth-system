import { NextFunction, Response } from "express";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import User from "../models/user";
import { AuthRequest, AuthResponse } from "../types";
import {
  generateTokens,
  generateVerificationToken,
  verifyRefreshToken,
} from "../utils/token";
import {
  formatUserResponse,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../utils/response";
import { sendVerificationEmail, sendWelcomeEmail } from "../utils/email";
import { AppError } from "../middleware/errorHandler";

//  Register a new user

export const register = async (
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

    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("User already exists", 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const tempUserId = "temp";
    const verificationToken = generateVerificationToken(tempUserId, email);

    // Create user (unverified)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false, // User starts as unverified
      verificationToken,
      verificationTokenExpire: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Update verification token with real user ID
    const actualVerificationToken = generateVerificationToken(
      user._id.toString(),
      user.email
    );
    user.verificationToken = actualVerificationToken;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, actualVerificationToken);
    } catch (error) {
      console.error("Verification email error:", error);
    }

    res.status(201).json({
      success: true,
      message:
        "Registration successful! Please check your email to verify your account.",
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};
// Login user

export const login = async (
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

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    // Check if email is verified
    if (!user.isVerified) {
      res.status(403).json({
        message: "Please verify your email before logging in",
        requiresVerification: true,
      });
      return;
    }

    // Generate new tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookie
    setRefreshTokenCookie(res, refreshToken);

    // Send response
    const response: AuthResponse = {
      success: true,
      token: accessToken,
      user: formatUserResponse(user),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
//   Refresh access token

export const refreshToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError("Refresh token not found", 401);
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new AppError("Invalid refresh token", 401);
    }

    // Find user and verify token matches
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError("Invalid refresh token", 401);
    }

    // Generate new tokens (token rotation)
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id.toString()
    );

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh token in cookie
    setRefreshTokenCookie(res, newRefreshToken);

    res.json({
      success: true,
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

//  Logout user

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Not authorized", 401);
    }

    // Remove refresh token from database
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });

    // Clear cookie
    clearRefreshTokenCookie(res);

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

//   Get current user
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Not authorized", 401);
    }

    const user = await User.findById(req.user.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json({
      success: true,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

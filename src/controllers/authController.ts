import { Response } from "express";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import User from "../models/user";
import { AuthRequest, AuthResponse } from "../types";
import { generateTokens, verifyRefreshToken } from "../utils/token";
import {
  formatUserResponse,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../utils/response";

//  Register a new user

export const register = async (
  req: AuthRequest,
  res: Response
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
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with placeholder refresh token
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    // Store refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token in cookie
    setRefreshTokenCookie(res, refreshToken);

    // Send response
    const response: AuthResponse = {
      success: true,
      token: accessToken,
      user: formatUserResponse(user),
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
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
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
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
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//   Refresh access token

export const refreshToken = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token not found" });
      return;
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    // Find user and verify token matches
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
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
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//  Logout user

export const logout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
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
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//   Get current user

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const user = await User.findById(req.user.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      success: true,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

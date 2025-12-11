import { Response } from "express";
import { config } from "../config/config";

// Format user response (exclude sensitive data)
export const formatUserResponse = (user: any) => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
};

//  Set refresh token as httpOnly cookie

export const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string
): void => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "strict",
    maxAge: config.cookieMaxAge,
  });
};

// Clear refresh token cookie

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie("refreshToken");
};

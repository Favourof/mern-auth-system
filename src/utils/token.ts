import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { config } from "../config/config";
import {
  ResetTokenPayload,
  TokenPayload,
  VerificationTokenPayload,
} from "../types";
import crypto from "crypto";

const jwtSecret = config.jwtSecret as string;
const accessTokenExpiry = config.accessTokenExpiry as string;
const jwtRefreshSecret = config.jwtRefreshSecret;
const refreshTokenExpiry = config.refreshTokenExpiry;

//  Generate Access Token (short-lived)

export const generateAccessToken = (userId: string): string => {
  const payload: TokenPayload = { id: userId };

  return jwt.sign(payload, jwtSecret, {
    expiresIn: accessTokenExpiry,
  } as SignOptions);
};

//  Generate Refresh Token (long-lived)

export const generateRefreshToken = (userId: string): string => {
  const payload: TokenPayload = { id: userId };

  return jwt.sign(
    payload,
    jwtRefreshSecret as Secret,
    {
      expiresIn: refreshTokenExpiry,
    } as SignOptions
  );
};

//   Verify Access Token

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, jwtSecret as Secret) as TokenPayload;
};

//  Verify Refresh Token

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, jwtRefreshSecret as Secret) as TokenPayload;
};

//  Generate both tokens at once
export const generateTokens = (userId: string) => {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId),
  };
};

// Generate Password Reset Token
export const generateResetToken = (userId: string, email: string): string => {
  const payload: ResetTokenPayload = { id: userId, email };

  return jwt.sign(
    payload,
    jwtSecret as Secret,
    {
      expiresIn: config.resetTokenExpiry,
    } as SignOptions
  );
};

/**
 * Verify Reset Token
 */
export const verifyResetToken = (token: string): ResetTokenPayload => {
  return jwt.verify(token, config.jwtSecret as Secret) as ResetTokenPayload;
};

/**
 * Generate random token (alternative approach)
 */
export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Generate Email Verification Token
 */
export const generateVerificationToken = (
  userId: string,
  email: string
): string => {
  const payload: VerificationTokenPayload = { id: userId, email };

  return jwt.sign(payload, config.jwtSecret as Secret, {
    expiresIn: "24h", // 24 hours to verify
  });
};

/**
 * Verify Email Verification Token
 */
export const verifyVerificationToken = (
  token: string
): VerificationTokenPayload => {
  return jwt.verify(
    token,
    config.jwtSecret as Secret
  ) as VerificationTokenPayload;
};

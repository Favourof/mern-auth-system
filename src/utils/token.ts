import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { config } from "../config/config";
import { TokenPayload } from "../types";

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

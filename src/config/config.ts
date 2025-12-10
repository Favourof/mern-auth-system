import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  mongoUrl: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  nodeEnv: string;
  clientUrl: string;
  cookieMaxAge: number;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

export const config: Config = {
  port: Number(process.env.PORT) || 5000,
  mongoUrl: process.env.MONGO_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:4002",
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  accessTokenExpiry: "15m",
  refreshTokenExpiry: "7d",
};

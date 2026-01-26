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
  resetTokenExpiry: string;
  emailHost: string;
  emailPort: number;
  emailUser: string;
  emailPassword: string;
  emailFrom: string;
  resendApiKey: string;
}

export const config: Config = {
  port: Number(process.env.PORT) || 5000,
  mongoUrl: process.env.MONGO_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  accessTokenExpiry: "15m",
  refreshTokenExpiry: "7d",
  emailHost: process.env.EMAIL_HOST || "smtp.gmail.com",
  emailPort: Number(process.env.EMAIL_PORT) || 587,
  emailUser: process.env.EMAIL_USER || "",
  emailPassword: process.env.EMAIL_PASSWORD || "",
  emailFrom: process.env.EMAIL_FROM || "noreply@resend.dev",
  resetTokenExpiry: "1h",
  resendApiKey: process.env.RESEND_API_KEY || "",
};

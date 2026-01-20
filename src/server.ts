import express, { Application, Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/db";
import { config } from "./config/config";
import authRoutes from "./routes/auth";
import cookieParser from "cookie-parser";
import { apiLimiter } from "./middleware/rateLimiter";
import adminRoutes from "./routes/admin";
import { requestLogger } from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";
const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Request logging (only in development)
if (config.nodeEnv === "development") {
  app.use(requestLogger);
}

// applying genrate rate limiting for all route
app.use("/api/", apiLimiter);

// connecting to database
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Health check route
app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "MERN Auth API - Production Ready",
    version: "2.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
    features: [
      "Email Verification",
      "Access + Refresh Tokens",
      "Password Reset",
      "Admin Routes",
      "Rate Limiting",
      "Session Validation",
      "Role-Based Access Control",
      "Centralized Error Handling",
    ],
  });
});

// API documentation route
app.get("/api", (req: Request, res: Response) => {
  res.json({
    message: "API Documentation",
    version: "2.0.0",
    endpoints: {
      auth: "/api/auth",
      admin: "/api/admin",
      docs: "See README.md for complete documentation",
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log("🚀 Server Status:");
  console.log(`   Port: ${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   API: http://localhost:${config.port}/api`);
  console.log(`   Health: http://localhost:${config.port}/`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("❌ Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});

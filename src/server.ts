import express, { Application, Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/db";
import { config } from "./config/config";
import authRoutes from "./routes/auth";
import cookieParser from "cookie-parser";
import { apiLimiter } from "./middleware/rateLimiter";
import adminRoutes from "./routes/admin";
const app: Application = express();

app.use(express.json());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(cookieParser());
// applying genrate rate limiting for all route

app.use("/api/", apiLimiter);

// connecting to database
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Health check route
app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    message: "Auth API with Advanced Features",
    version: "1.0.0",
    features: [
      "Access + Refresh Tokens",
      "Password Reset",
      "Admin Routes",
      "Rate Limiting",
      "Session Validation",
    ],
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(config.port, () => {
  console.log(`server is running on port:${config.port}`);
});

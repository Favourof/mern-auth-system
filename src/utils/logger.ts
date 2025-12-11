import { Request, Response, NextFunction } from "express";

/**
 * Request Logger Middleware
 * Logs all incoming requests
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  // Log when response finishes
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? "🔴" : "🟢";

    console.log(
      `${statusColor} ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

/**
 * Development Logger - More detailed
 */
export const devLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.log("📨 Incoming Request:");
  console.log(`   Method: ${req.method}`);
  console.log(`   Path: ${req.path}`);
  console.log(`   Body:`, req.body);
  console.log(`   Query:`, req.query);
  console.log(`   IP: ${req.ip}`);
  console.log("---");
  next();
};

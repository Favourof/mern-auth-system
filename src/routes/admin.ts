import express, { Router } from "express";
import { body } from "express-validator";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getUserStats,
} from "../controllers/adminController";
import { protect } from "../middleware/auth";
import { authorize } from "../middleware/auth";
import { checkSession } from "../middleware/checkSession";

const router: Router = express.Router();

// All routes require admin role
router.use(protect, checkSession, authorize("admin"));

// User management routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put(
  "/users/:id/role",
  [body("role").isIn(["user", "admin"]).withMessage("Invalid role")],
  updateUserRole
);
router.delete("/users/:id", deleteUser);

// Statistics
router.get("/stats", getUserStats);

export default router;

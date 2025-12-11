import { NextFunction, Response } from "express";
import User from "../models/user";
import { AuthRequest } from "../types";
import { AppError } from "../middleware/errorHandler";
import { nextTick } from "process";

//  Get all users (Admin only)

export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find()
      .select("-password -refreshToken -resetPasswordToken")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

//    Get single user by ID (Admin only)
export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -refreshToken -resetPasswordToken"
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

//   Update user role (Admin only)
export const updateUserRole = async (
  req: AuthRequest,
  res: Response,
  Next: NextFunction
): Promise<void> => {
  try {
    if (!req.body || !req.body.role) {
      throw new AppError("Role is required", 400);
    }
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      res.status(400).json({ message: "Invalid role" });
      return;
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Prevent demoting yourself
    if (user._id.toString() === req.user?.id) {
      throw new AppError("Cannot change your own role", 400);
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    Next(error);
  }
};

/**
 * @desc    Delete user (Admin only)
 * @access  Private/Admin
 */
export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user._id.toString() === req.user?.id) {
      throw new AppError("Cannot delete your own account", 400);
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/stats
 * @desc    Get user statistics (Admin only)
 * @access  Private/Admin
 */
export const getUserStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: "admin" });
    const regularUsers = await User.countDocuments({ role: "user" });

    // Users registered in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        adminUsers,
        regularUsers,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

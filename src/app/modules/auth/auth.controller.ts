import { Request, Response } from "express";

import {
  loginUser,
  getCurrentUser,
} from "./auth.service";

import { loginSchema } from "./auth.validation";

export const loginController = async (
  req: Request,
  res: Response
) => {
  try {
    const payload = loginSchema.parse(req.body);

    const result = await loginUser(payload);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    console.error(error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues,
      });
    }

    if (error.message === "Invalid email or password") {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "User account is inactive") {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export const meController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await getCurrentUser(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Current user retrieved successfully",
      data: user,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve current user",
    });
  }
};
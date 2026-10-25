import { Request, Response } from "express";

import {
  createLeave,
  deleteLeave,
  getAllLeaves,
  getLeaveById,
  getUserLeaves,
  reviewLeave,
} from "./leave.service";
import { createLeaveSchema, reviewLeaveSchema } from "./leave.validation";

const handleError = (res: Response, error: any, fallback: string) => {
  console.error(error);

  if (error.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.issues,
    });
  }

  if (error.message === "Leave not found") {
    return res.status(404).json({ success: false, message: error.message });
  }

  if (
    [
      "End date must be after start date",
      "Leave has already been reviewed",
      "Only pending leaves can be deleted",
      "You are not authorized",
    ].includes(error.message)
  ) {
    return res.status(400).json({ success: false, message: error.message });
  }

  return res.status(500).json({ success: false, message: fallback });
};

export const createLeaveController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const payload = createLeaveSchema.parse(req.body);
    const result = await createLeave(req.user.id, payload);

    return res.status(201).json({
      success: true,
      message: "Leave request submitted",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to create leave");
  }
};

export const getAllLeavesController = async (req: Request, res: Response) => {
  try {
    const result = await getAllLeaves();

    return res.status(200).json({
      success: true,
      message: "Leaves retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to retrieve leaves");
  }
};

export const getMyLeavesController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await getUserLeaves(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Leaves retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to retrieve leaves");
  }
};

export const getLeaveByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id) || !req.user) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave ID",
      });
    }

    const result = await getLeaveById(id);
    const privileged = ["admin", "hr", "manager"].includes(req.user.role);

    if (result.userId !== req.user.id && !privileged) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Leave retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to retrieve leave");
  }
};

export const reviewLeaveController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id) || !req.user) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave ID",
      });
    }

    const payload = reviewLeaveSchema.parse(req.body);
    const result = await reviewLeave(id, req.user.id, payload);

    return res.status(200).json({
      success: true,
      message: `Leave ${payload.status}`,
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to review leave");
  }
};

export const deleteLeaveController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id) || !req.user) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave ID",
      });
    }

    const result = await deleteLeave(id, req.user.id, req.user.role);

    return res.status(200).json({
      success: true,
      message: "Leave deleted successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to delete leave");
  }
};

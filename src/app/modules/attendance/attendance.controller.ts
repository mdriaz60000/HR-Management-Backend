import {
  Request,
  Response,
} from "express";

import {
  createAttendance,
  deleteAttendance,
  getAllAttendance,
  getAttendanceById,
  getUserAttendance,
  updateAttendance,
} from "./attendance.service";

import {
  createAttendanceSchema,
  updateAttendanceSchema,
} from "./attendance.validation";

export const createAttendanceController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const payload =
        createAttendanceSchema.parse(
          req.body
        );

      const result =
        await createAttendance(payload);

      return res.status(201).json({
        success: true,
        message:
          "Attendance created successfully",
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

      if (
        error.message === "User not found"
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message === "User is inactive"
      ) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message ===
        "Attendance already exists for this date"
      ) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to create attendance",
      });
    }
  };

  export const getAllAttendanceController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const result =
        await getAllAttendance();

      return res.status(200).json({
        success: true,
        message:
          "Attendance retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to retrieve attendance",
      });
    }
  };

  export const getUserAttendanceController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { userId } = req.params;

      if (Array.isArray(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const result =
        await getUserAttendance(userId);

      return res.status(200).json({
        success: true,
        message:
          "User attendance retrieved successfully",
        data: result,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to retrieve user attendance",
      });
    }
  };


  export const getAttendanceByIdController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid attendance ID",
        });
      }

      const result =
        await getAttendanceById(id);

      return res.status(200).json({
        success: true,
        message:
          "Attendance retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      console.error(error);

      if (
        error.message ===
        "Attendance not found"
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to retrieve attendance",
      });
    }
  };

  export const updateAttendanceController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid attendance ID",
        });
      }

      const payload =
        updateAttendanceSchema.parse(
          req.body
        );

      const result =
        await updateAttendance(
          id,
          payload
        );

      return res.status(200).json({
        success: true,
        message:
          "Attendance updated successfully",
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

      if (
        error.message ===
        "Attendance not found"
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to update attendance",
      });
    }
  };

  export const deleteAttendanceController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid attendance ID",
        });
      }

      const result =
        await deleteAttendance(id);

      return res.status(200).json({
        success: true,
        message:
          "Attendance deleted successfully",
        data: result,
      });
    } catch (error: any) {
      console.error(error);

      if (
        error.message ===
        "Attendance not found"
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete attendance",
      });
    }
  };
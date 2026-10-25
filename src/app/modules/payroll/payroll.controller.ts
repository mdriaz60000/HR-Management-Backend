import { Request, Response } from "express";

import {
  deletePayroll,
  generatePayroll,
  getAllPayrolls,
  getMyPayrolls,
  getPayrollById,
  updatePayroll,
} from "./payroll.service";
import {
  generatePayrollSchema,
  updatePayrollSchema,
} from "./payroll.validation";

const handleError = (res: Response, error: any, fallback: string) => {
  console.error(error);

  if (error.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.issues,
    });
  }

  if (
    error.message === "Payroll not found" ||
    error.message === "Employee not found"
  ) {
    return res.status(404).json({ success: false, message: error.message });
  }

  if (error.message === "Payroll already exists for this period") {
    return res.status(409).json({ success: false, message: error.message });
  }

  return res.status(500).json({ success: false, message: fallback });
};

export const generatePayrollController = async (
  req: Request,
  res: Response
) => {
  try {
    const payload = generatePayrollSchema.parse(req.body);
    const result = await generatePayroll(payload);

    return res.status(201).json({
      success: true,
      message: "Payroll generated successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to generate payroll");
  }
};

export const getAllPayrollsController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await getAllPayrolls();

    return res.status(200).json({
      success: true,
      message: "Payrolls retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to retrieve payrolls");
  }
};

export const getMyPayrollsController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await getMyPayrolls(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Payrolls retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to retrieve payrolls");
  }
};

export const getPayrollByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id) || !req.user) {
      return res.status(400).json({
        success: false,
        message: "Invalid payroll ID",
      });
    }

    const result = await getPayrollById(id);
    const privileged = ["admin", "hr", "manager"].includes(req.user.role);

    if (result.userId !== req.user.id && !privileged) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payroll retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to retrieve payroll");
  }
};

export const updatePayrollController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payroll ID",
      });
    }

    const payload = updatePayrollSchema.parse(req.body);
    const result = await updatePayroll(id, payload);

    return res.status(200).json({
      success: true,
      message: "Payroll updated successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to update payroll");
  }
};

export const deletePayrollController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payroll ID",
      });
    }

    const result = await deletePayroll(id);

    return res.status(200).json({
      success: true,
      message: "Payroll deleted successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to delete payroll");
  }
};

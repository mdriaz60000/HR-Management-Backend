import { Request, Response } from "express";

import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployeeById,
  getEmployeeByUserId,
  updateEmployee,
} from "./employee.service";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "./employee.validation";

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
    error.message === "Employee not found" ||
    error.message === "User not found"
  ) {
    return res.status(404).json({ success: false, message: error.message });
  }

  if (
    [
      "Email already exists",
      "Employee code already exists",
      "Employee profile already exists for this user",
    ].includes(error.message)
  ) {
    return res.status(409).json({ success: false, message: error.message });
  }

  if (
    error.message ===
    "Name, email and password are required for a new employee"
  ) {
    return res.status(400).json({ success: false, message: error.message });
  }

  return res.status(500).json({ success: false, message: fallback });
};

export const createEmployeeController = async (
  req: Request,
  res: Response
) => {
  try {
    const payload = createEmployeeSchema.parse(req.body);
    const result = await createEmployee(payload);

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to create employee");
  }
};

export const getAllEmployeesController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await getAllEmployees();

    return res.status(200).json({
      success: true,
      message: "Employees retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to retrieve employees");
  }
};

export const getMyEmployeeController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await getEmployeeByUserId(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Employee profile retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to retrieve employee profile");
  }
};

export const getEmployeeByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const result = await getEmployeeById(id);

    return res.status(200).json({
      success: true,
      message: "Employee retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to retrieve employee");
  }
};

export const updateEmployeeController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const payload = updateEmployeeSchema.parse(req.body);
    const result = await updateEmployee(id, payload);

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to update employee");
  }
};

export const deleteEmployeeController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const result = await deleteEmployee(id);

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to delete employee");
  }
};

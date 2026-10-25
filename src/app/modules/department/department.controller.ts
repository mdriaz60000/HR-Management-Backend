import { Request, Response } from "express";

import {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
} from "./department.service";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "./department.validation";

const handleError = (res: Response, error: any, fallback: string) => {
  console.error(error);

  if (error.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.issues,
    });
  }

  if (error.message === "Department not found") {
    return res.status(404).json({ success: false, message: error.message });
  }

  if (error.message === "Department name already exists") {
    return res.status(409).json({ success: false, message: error.message });
  }

  return res.status(500).json({ success: false, message: fallback });
};

export const createDepartmentController = async (
  req: Request,
  res: Response
) => {
  try {
    const payload = createDepartmentSchema.parse(req.body);
    const result = await createDepartment(payload);

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to create department");
  }
};

export const getAllDepartmentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await getAllDepartments();

    return res.status(200).json({
      success: true,
      message: "Departments retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to retrieve departments");
  }
};

export const getDepartmentByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    const result = await getDepartmentById(id);

    return res.status(200).json({
      success: true,
      message: "Department retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to retrieve department");
  }
};

export const updateDepartmentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    const payload = updateDepartmentSchema.parse(req.body);
    const result = await updateDepartment(id, payload);

    return res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to update department");
  }
};

export const deleteDepartmentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    const result = await deleteDepartment(id);

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully",
      data: result,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to delete department");
  }
};

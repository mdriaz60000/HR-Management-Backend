import { z } from "zod";

const employmentStatus = z.enum(["active", "inactive", "terminated"]);

export const createEmployeeSchema = z.object({
  userId: z.string().uuid().optional(),
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().max(150).optional(),
  password: z.string().min(6).max(100).optional(),
  role: z.enum(["hr", "admin", "manager", "employee"]).optional(),
  employeeCode: z.string().min(2).max(50).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
  designation: z.string().max(100).optional(),
  departmentId: z.string().uuid().optional().nullable(),
  joiningDate: z.string().optional(),
  employmentStatus: employmentStatus.optional(),
  basicSalary: z.union([z.string(), z.number()]).optional(),
});

export const updateEmployeeSchema = z.object({
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  designation: z.string().max(100).optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  joiningDate: z.string().optional().nullable(),
  employmentStatus: employmentStatus.optional(),
  basicSalary: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(2).max(100).optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

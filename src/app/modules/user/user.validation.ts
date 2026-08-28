import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(150),
  password: z.string().min(6).max(100),
  role: z.enum(["hr", "admin", "manager", "employee"]),
  isActive: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().max(150).optional(),
  password: z.string().min(6).max(100).optional(),
  role: z.enum(["hr", "admin", "manager", "employee"]).optional(),
  isActive: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
import { z } from "zod";

export const generatePayrollSchema = z.object({
  employeeId: z.string().uuid().optional(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  allowances: z.union([z.string(), z.number()]).optional(),
  notes: z.string().max(1000).optional(),
});

export const updatePayrollSchema = z.object({
  allowances: z.union([z.string(), z.number()]).optional(),
  deductions: z.union([z.string(), z.number()]).optional(),
  status: z.enum(["draft", "processed", "paid"]).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export type GeneratePayrollInput = z.infer<typeof generatePayrollSchema>;
export type UpdatePayrollInput = z.infer<typeof updatePayrollSchema>;

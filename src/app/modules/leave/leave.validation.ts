import { z } from "zod";

export const createLeaveSchema = z.object({
  type: z.enum(["casual", "sick", "annual", "unpaid"]),
  startDate: z.string().min(8),
  endDate: z.string().min(8),
  reason: z.string().max(1000).optional(),
});

export const reviewLeaveSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reviewNote: z.string().max(1000).optional(),
});

export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
export type ReviewLeaveInput = z.infer<typeof reviewLeaveSchema>;

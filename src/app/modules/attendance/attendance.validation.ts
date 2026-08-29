import { z } from "zod";

export const createAttendanceSchema = z.object({
  userId: z.string().uuid(),

  date: z.string().optional(),

  checkIn: z.string().datetime().optional(),

  checkOut: z.string().datetime().optional(),

  status: z
    .enum([
      "present",
      "absent",
      "late",
      "half_day",
    ])
    .optional(),

  note: z.string().optional(),
});

export const updateAttendanceSchema = z.object({
  checkIn: z.string().datetime().optional(),

  checkOut: z.string().datetime().optional(),

  status: z
    .enum([
      "present",
      "absent",
      "late",
      "half_day",
    ])
    .optional(),

  note: z.string().optional(),
});

export type CreateAttendanceInput =
  z.infer<typeof createAttendanceSchema>;

export type UpdateAttendanceInput =
  z.infer<typeof updateAttendanceSchema>;
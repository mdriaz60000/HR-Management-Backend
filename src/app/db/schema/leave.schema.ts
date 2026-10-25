import {
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { usersTable } from "./user.schema";

export const leaveTypeEnum = pgEnum("leave_type", [
  "casual",
  "sick",
  "annual",
  "unpaid",
]);

export const leaveStatusEnum = pgEnum("leave_status", [
  "pending",
  "approved",
  "rejected",
]);

export const leavesTable = pgTable("leaves", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
    }),

  type: leaveTypeEnum("type").notNull(),

  startDate: date("start_date").notNull(),

  endDate: date("end_date").notNull(),

  days: integer("days").notNull(),

  reason: text("reason"),

  status: leaveStatusEnum("status").notNull().default("pending"),

  reviewedBy: uuid("reviewed_by").references(() => usersTable.id, {
    onDelete: "set null",
  }),

  reviewNote: text("review_note"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

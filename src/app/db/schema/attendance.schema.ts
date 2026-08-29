import {
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  date,
  text,
} from "drizzle-orm/pg-core";

import { usersTable } from "./user.schema";

export const attendanceStatusEnum = pgEnum(
  "attendance_status",
  [
    "present",
    "absent",
    "late",
    "half_day",
  ]
);

export const attendanceTable = pgTable(
  "attendance",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),

    date: date("date")
      .notNull(),

    checkIn: timestamp("check_in"),

    checkOut: timestamp("check_out"),

    status: attendanceStatusEnum("status")
      .notNull()
      .default("present"),

    note: text("note"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  }
);
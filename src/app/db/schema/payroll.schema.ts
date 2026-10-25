import {
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { employeesTable } from "./employee.schema";

export const payrollStatusEnum = pgEnum("payroll_status", [
  "draft",
  "processed",
  "paid",
]);

export const payrollsTable = pgTable(
  "payrolls",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employeesTable.id, {
        onDelete: "cascade",
      }),

    month: integer("month").notNull(),

    year: integer("year").notNull(),

    basicSalary: decimal("basic_salary", {
      precision: 12,
      scale: 2,
    }).notNull(),

    allowances: decimal("allowances", {
      precision: 12,
      scale: 2,
    })
      .notNull()
      .default("0"),

    deductions: decimal("deductions", {
      precision: 12,
      scale: 2,
    })
      .notNull()
      .default("0"),

    netSalary: decimal("net_salary", {
      precision: 12,
      scale: 2,
    }).notNull(),

    status: payrollStatusEnum("status").notNull().default("draft"),

    paidAt: timestamp("paid_at"),

    notes: text("notes"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("payroll_employee_month_year_idx").on(
      table.employeeId,
      table.month,
      table.year
    ),
  ]
);

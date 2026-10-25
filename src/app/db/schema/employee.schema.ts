import {
  date,
  decimal,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { usersTable } from "./user.schema";
import { departmentsTable } from "./department.schema";

export const employmentStatusEnum = pgEnum(
  "employment_status",
  ["active", "inactive", "terminated"]
);

export const employeesTable = pgTable("employees", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, {
      onDelete: "cascade",
    }),

  employeeCode: varchar("employee_code", {
    length: 50,
  })
    .notNull()
    .unique(),

  phone: varchar("phone", {
    length: 20,
  }),

  address: varchar("address", {
    length: 255,
  }),

  designation: varchar("designation", {
    length: 100,
  }),

  departmentId: uuid("department_id").references(
    () => departmentsTable.id,
    {
      onDelete: "set null",
    }
  ),

  joiningDate: date("joining_date"),

  employmentStatus: employmentStatusEnum(
    "employment_status"
  )
    .notNull()
    .default("active"),

  basicSalary: decimal("basic_salary", {
    precision: 12,
    scale: 2,
  })
    .notNull()
    .default("0"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});
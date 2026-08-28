import {
  boolean,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "hr",
  "admin",
  "manager",
  "employee",
]);

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),

  email: varchar("email", { length: 150 }).notNull().unique(),

  password: varchar("password", { length: 255 }).notNull(),

  role: userRoleEnum("role").notNull(),

  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});
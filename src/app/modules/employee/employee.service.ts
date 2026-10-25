import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

import db from "../../db";
import { employeesTable } from "../../db/schema/employee.schema";
import { usersTable } from "../../db/schema/user.schema";
import { departmentsTable } from "../../db/schema/department.schema";
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "./employee.validation";

const employeeSelect = {
  id: employeesTable.id,
  userId: employeesTable.userId,
  employeeCode: employeesTable.employeeCode,
  phone: employeesTable.phone,
  address: employeesTable.address,
  designation: employeesTable.designation,
  departmentId: employeesTable.departmentId,
  departmentName: departmentsTable.name,
  joiningDate: employeesTable.joiningDate,
  employmentStatus: employeesTable.employmentStatus,
  basicSalary: employeesTable.basicSalary,
  name: usersTable.name,
  email: usersTable.email,
  role: usersTable.role,
  isActive: usersTable.isActive,
  createdAt: employeesTable.createdAt,
  updatedAt: employeesTable.updatedAt,
};

const withRelations = () =>
  db
    .select(employeeSelect)
    .from(employeesTable)
    .innerJoin(usersTable, eq(employeesTable.userId, usersTable.id))
    .leftJoin(
      departmentsTable,
      eq(employeesTable.departmentId, departmentsTable.id)
    );

export const createEmployee = async (payload: CreateEmployeeInput) => {
  let userId = payload.userId;

  if (!userId) {
    if (!payload.name || !payload.email || !payload.password) {
      throw new Error("Name, email and password are required for a new employee");
    }

    const [existingUser] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, payload.email))
      .limit(1);

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const [user] = await db
      .insert(usersTable)
      .values({
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        role: payload.role ?? "employee",
      })
      .returning({ id: usersTable.id });

    userId = user.id;
  } else {
    const [user] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    const [existingEmployee] = await db
      .select({ id: employeesTable.id })
      .from(employeesTable)
      .where(eq(employeesTable.userId, userId))
      .limit(1);

    if (existingEmployee) {
      throw new Error("Employee profile already exists for this user");
    }
  }

  const employeeCode =
    payload.employeeCode ?? `EMP-${Date.now().toString().slice(-8)}`;

  const [codeExists] = await db
    .select({ id: employeesTable.id })
    .from(employeesTable)
    .where(eq(employeesTable.employeeCode, employeeCode))
    .limit(1);

  if (codeExists) {
    throw new Error("Employee code already exists");
  }

  const [employee] = await db
    .insert(employeesTable)
    .values({
      userId,
      employeeCode,
      phone: payload.phone,
      address: payload.address,
      designation: payload.designation,
      departmentId: payload.departmentId ?? null,
      joiningDate: payload.joiningDate,
      employmentStatus: payload.employmentStatus ?? "active",
      basicSalary: payload.basicSalary != null ? String(payload.basicSalary) : "0",
    })
    .returning({ id: employeesTable.id });

  return getEmployeeById(employee.id);
};

export const getAllEmployees = async () => {
  return withRelations();
};

export const getEmployeeById = async (id: string) => {
  const [employee] = await withRelations()
    .where(eq(employeesTable.id, id))
    .limit(1);

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
};

export const getEmployeeByUserId = async (userId: string) => {
  const [employee] = await withRelations()
    .where(eq(employeesTable.userId, userId))
    .limit(1);

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
};

export const updateEmployee = async (
  id: string,
  payload: UpdateEmployeeInput
) => {
  const existing = await getEmployeeById(id);

  const [updated] = await db
    .update(employeesTable)
    .set({
      phone: payload.phone === undefined ? existing.phone : payload.phone,
      address: payload.address === undefined ? existing.address : payload.address,
      designation:
        payload.designation === undefined
          ? existing.designation
          : payload.designation,
      departmentId:
        payload.departmentId === undefined
          ? existing.departmentId
          : payload.departmentId,
      joiningDate:
        payload.joiningDate === undefined
          ? existing.joiningDate
          : payload.joiningDate,
      employmentStatus: payload.employmentStatus ?? existing.employmentStatus,
      basicSalary:
        payload.basicSalary != null
          ? String(payload.basicSalary)
          : existing.basicSalary,
      updatedAt: new Date(),
    })
    .where(eq(employeesTable.id, id))
    .returning({ id: employeesTable.id });

  if (payload.name) {
    await db
      .update(usersTable)
      .set({ name: payload.name, updatedAt: new Date() })
      .where(eq(usersTable.id, existing.userId));
  }

  return getEmployeeById(updated.id);
};

export const deleteEmployee = async (id: string) => {
  const existing = await getEmployeeById(id);

  const [deleted] = await db
    .delete(employeesTable)
    .where(eq(employeesTable.id, id))
    .returning({
      id: employeesTable.id,
      employeeCode: employeesTable.employeeCode,
    });

  await db.delete(usersTable).where(eq(usersTable.id, existing.userId));

  return deleted;
};

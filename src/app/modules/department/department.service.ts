import { eq } from "drizzle-orm";

import db from "../../db";
import { departmentsTable } from "../../db/schema/department.schema";
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "./department.validation";

export const createDepartment = async (payload: CreateDepartmentInput) => {
  const [existing] = await db
    .select({ id: departmentsTable.id })
    .from(departmentsTable)
    .where(eq(departmentsTable.name, payload.name))
    .limit(1);

  if (existing) {
    throw new Error("Department name already exists");
  }

  const [department] = await db
    .insert(departmentsTable)
    .values({
      name: payload.name,
      description: payload.description,
    })
    .returning();

  return department;
};

export const getAllDepartments = async () => {
  return db.select().from(departmentsTable);
};

export const getDepartmentById = async (id: string) => {
  const [department] = await db
    .select()
    .from(departmentsTable)
    .where(eq(departmentsTable.id, id))
    .limit(1);

  if (!department) {
    throw new Error("Department not found");
  }

  return department;
};

export const updateDepartment = async (
  id: string,
  payload: UpdateDepartmentInput
) => {
  await getDepartmentById(id);

  if (payload.name) {
    const [nameExists] = await db
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.name, payload.name))
      .limit(1);

    if (nameExists && nameExists.id !== id) {
      throw new Error("Department name already exists");
    }
  }

  const [updated] = await db
    .update(departmentsTable)
    .set({
      ...payload,
      updatedAt: new Date(),
    })
    .where(eq(departmentsTable.id, id))
    .returning();

  return updated;
};

export const deleteDepartment = async (id: string) => {
  const [deleted] = await db
    .delete(departmentsTable)
    .where(eq(departmentsTable.id, id))
    .returning();

  if (!deleted) {
    throw new Error("Department not found");
  }

  return deleted;
};

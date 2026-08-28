import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

import db from "../../db";
import { usersTable } from "../../db/schema/user.schema";

import type {
  CreateUserInput,
  UpdateUserInput,
} from "./user.validation";

// Create User
export const createUser = async (payload: CreateUserInput) => {
  // Check existing email
  const existingUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, payload.email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error("Email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const [user] = await db
    .insert(usersTable)
    .values({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
      isActive: payload.isActive ?? true,
    })
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    });

  return user;
};

// Get All Users
export const getAllUsers = async () => {
  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    })
    .from(usersTable);

  return users;
};

// Get Single User
export const getUserById = async (id: string) => {
  const [user] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Update User
export const updateUser = async (
  id: string,
  payload: UpdateUserInput
) => {
  // Check user
  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);

  if (!existingUser) {
    throw new Error("User not found");
  }

  // Check email duplication
  if (payload.email && payload.email !== existingUser.email) {
    const [emailExists] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, payload.email))
      .limit(1);

    if (emailExists) {
      throw new Error("Email already exists");
    }
  }

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (payload.name !== undefined) {
    updateData.name = payload.name;
  }

  if (payload.email !== undefined) {
    updateData.email = payload.email;
  }

  if (payload.role !== undefined) {
    updateData.role = payload.role;
  }

  if (payload.isActive !== undefined) {
    updateData.isActive = payload.isActive;
  }

  // Hash new password
  if (payload.password !== undefined) {
    updateData.password = await bcrypt.hash(payload.password, 10);
  }

  const [updatedUser] = await db
    .update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, id))
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    });

  return updatedUser;
};

// Delete User
export const deleteUser = async (id: string) => {
  const [deletedUser] = await db
    .delete(usersTable)
    .where(eq(usersTable.id, id))
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
    });

  if (!deletedUser) {
    throw new Error("User not found");
  }

  return deletedUser;
};
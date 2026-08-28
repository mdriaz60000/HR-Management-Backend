import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

import db from "../../db";
import { usersTable } from "../../db/schema/user.schema";


import type { LoginInput } from "./auth.validation";
import { generateToken } from "../../utils/jwt";

export const loginUser = async (payload: LoginInput) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, payload.email))
    .limit(1);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("User account is inactive");
  }

  const passwordMatched = await bcrypt.compare(
    payload.password,
    user.password
  );

  if (!passwordMatched) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
    token,
  };
};

export const getCurrentUser = async (userId: string) => {
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
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
import db from "../../db";
import { usersTable } from "../../db/schema/user.schema";

type TUser = {
  name: string;
  age: number;
  email: string;
};

export const createUser = async (payload: TUser) => {
  const result = await db.insert(usersTable).values(payload);

  return result;
};
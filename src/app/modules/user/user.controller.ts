import { Request, Response } from "express";
import { createUser } from "./user.service";

export const createUserController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await createUser(req.body);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error,
    });
  }
};
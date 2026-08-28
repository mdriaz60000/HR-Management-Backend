import { Router } from "express";

import {
  createUserController,
  deleteUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserController,
} from "./user.controller";

const router = Router();

// POST /api/users
router.post("/", createUserController);

// GET /api/users
router.get("/", getAllUsersController);

// GET /api/users/:id
router.get("/:id", getUserByIdController);

// PATCH /api/users/:id
router.patch("/:id", updateUserController);

// DELETE /api/users/:id
router.delete("/:id", deleteUserController);

export const userRouter = router;
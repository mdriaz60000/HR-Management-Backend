import { Router } from "express";

import {
  createUserController,
  deleteUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserController,
} from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";

const router = Router();

// POST /api/users
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  createUserController
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  getAllUsersController
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  getUserByIdController
);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  updateUserController
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteUserController
);

export const userRouter = router;
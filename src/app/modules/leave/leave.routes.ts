import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import {
  createLeaveController,
  deleteLeaveController,
  getAllLeavesController,
  getLeaveByIdController,
  getMyLeavesController,
  reviewLeaveController,
} from "./leave.controller";

const router = Router();

router.post("/", authMiddleware, createLeaveController);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "hr", "manager"),
  getAllLeavesController
);

router.get("/me", authMiddleware, getMyLeavesController);

router.get("/:id", authMiddleware, getLeaveByIdController);

router.patch(
  "/:id/review",
  authMiddleware,
  roleMiddleware("admin", "hr", "manager"),
  reviewLeaveController
);

router.delete("/:id", authMiddleware, deleteLeaveController);

export const leaveRouter = router;

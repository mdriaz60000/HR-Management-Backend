import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import {
  createDepartmentController,
  deleteDepartmentController,
  getAllDepartmentsController,
  getDepartmentByIdController,
  updateDepartmentController,
} from "./department.controller";

const router = Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  createDepartmentController
);

router.get("/", authMiddleware, getAllDepartmentsController);

router.get("/:id", authMiddleware, getDepartmentByIdController);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  updateDepartmentController
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  deleteDepartmentController
);

export const departmentRouter = router;

import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import {
  createEmployeeController,
  deleteEmployeeController,
  getAllEmployeesController,
  getEmployeeByIdController,
  getMyEmployeeController,
  updateEmployeeController,
} from "./employee.controller";

const router = Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  createEmployeeController
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "hr", "manager"),
  getAllEmployeesController
);

router.get("/me", authMiddleware, getMyEmployeeController);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "hr", "manager"),
  getEmployeeByIdController
);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  updateEmployeeController
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  deleteEmployeeController
);

export const employeeRouter = router;

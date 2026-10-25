import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import {
  deletePayrollController,
  generatePayrollController,
  getAllPayrollsController,
  getMyPayrollsController,
  getPayrollByIdController,
  updatePayrollController,
} from "./payroll.controller";

const router = Router();

router.post(
  "/generate",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  generatePayrollController
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "hr", "manager"),
  getAllPayrollsController
);

router.get("/me", authMiddleware, getMyPayrollsController);

router.get("/:id", authMiddleware, getPayrollByIdController);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  updatePayrollController
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deletePayrollController
);

export const payrollRouter = router;

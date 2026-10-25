import { Router } from "express";

import {
  checkInController,
  checkOutController,
  createAttendanceController,
  deleteAttendanceController,
  getAllAttendanceController,
  getAttendanceByIdController,
  getMyAttendanceController,
  getUserAttendanceController,
  updateAttendanceController,
} from "./attendance.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";



const router = Router();

router.post("/check-in", authMiddleware, checkInController);
router.post("/check-out", authMiddleware, checkOutController);

// HR/Admin create attendance
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  createAttendanceController
);

// HR/Admin see all attendance
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "hr", "manager"),
  getAllAttendanceController
);

router.get("/me", authMiddleware, getMyAttendanceController);

// User attendance
router.get(
  "/user/:userId",
  authMiddleware,
  getUserAttendanceController
);

// Single attendance
router.get(
  "/:id",
  authMiddleware,
  getAttendanceByIdController
);

// Update
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  updateAttendanceController
);

// Delete
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  deleteAttendanceController
);

export const attendanceRouter = router;
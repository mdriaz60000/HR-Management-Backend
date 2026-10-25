import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { getDashboardStatsController } from "./dashboard.controller";

const router = Router();

router.get("/stats", authMiddleware, getDashboardStatsController);

export const dashboardRouter = router;

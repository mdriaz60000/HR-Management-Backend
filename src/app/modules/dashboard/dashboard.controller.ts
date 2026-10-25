import { Request, Response } from "express";

import { getDashboardStats } from "./dashboard.service";

export const getDashboardStatsController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await getDashboardStats(req.user.id, req.user.role);

    return res.status(200).json({
      success: true,
      message: "Dashboard stats retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard stats",
    });
  }
};

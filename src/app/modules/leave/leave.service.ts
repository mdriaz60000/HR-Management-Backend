import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import db from "../../db";
import { leavesTable } from "../../db/schema/leave.schema";
import { usersTable } from "../../db/schema/user.schema";
import type { CreateLeaveInput, ReviewLeaveInput } from "./leave.validation";

const reviewers = alias(usersTable, "reviewers");

const leaveSelect = {
  id: leavesTable.id,
  userId: leavesTable.userId,
  employeeName: usersTable.name,
  employeeEmail: usersTable.email,
  type: leavesTable.type,
  startDate: leavesTable.startDate,
  endDate: leavesTable.endDate,
  days: leavesTable.days,
  reason: leavesTable.reason,
  status: leavesTable.status,
  reviewedBy: leavesTable.reviewedBy,
  reviewerName: reviewers.name,
  reviewNote: leavesTable.reviewNote,
  createdAt: leavesTable.createdAt,
  updatedAt: leavesTable.updatedAt,
};

const withRelations = () =>
  db
    .select(leaveSelect)
    .from(leavesTable)
    .innerJoin(usersTable, eq(leavesTable.userId, usersTable.id))
    .leftJoin(reviewers, eq(leavesTable.reviewedBy, reviewers.id));

const countDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
  return diff + 1;
};

export const createLeave = async (userId: string, payload: CreateLeaveInput) => {
  const days = countDays(payload.startDate, payload.endDate);

  if (days < 1) {
    throw new Error("End date must be after start date");
  }

  const [leave] = await db
    .insert(leavesTable)
    .values({
      userId,
      type: payload.type,
      startDate: payload.startDate,
      endDate: payload.endDate,
      days,
      reason: payload.reason,
    })
    .returning({ id: leavesTable.id });

  return getLeaveById(leave.id);
};

export const getAllLeaves = async () => {
  return withRelations().orderBy(desc(leavesTable.createdAt));
};

export const getUserLeaves = async (userId: string) => {
  return withRelations()
    .where(eq(leavesTable.userId, userId))
    .orderBy(desc(leavesTable.createdAt));
};

export const getLeaveById = async (id: string) => {
  const [leave] = await withRelations().where(eq(leavesTable.id, id)).limit(1);

  if (!leave) {
    throw new Error("Leave not found");
  }

  return leave;
};

export const reviewLeave = async (
  id: string,
  reviewerId: string,
  payload: ReviewLeaveInput
) => {
  const existing = await getLeaveById(id);

  if (existing.status !== "pending") {
    throw new Error("Leave has already been reviewed");
  }

  await db
    .update(leavesTable)
    .set({
      status: payload.status,
      reviewedBy: reviewerId,
      reviewNote: payload.reviewNote,
      updatedAt: new Date(),
    })
    .where(eq(leavesTable.id, id));

  return getLeaveById(id);
};

export const deleteLeave = async (id: string, userId: string, role: string) => {
  const existing = await getLeaveById(id);

  const isOwner = existing.userId === userId;
  const isHr = role === "admin" || role === "hr";

  if (!isOwner && !isHr) {
    throw new Error("You are not authorized");
  }

  if (existing.status !== "pending" && !isHr) {
    throw new Error("Only pending leaves can be deleted");
  }

  const [deleted] = await db
    .delete(leavesTable)
    .where(eq(leavesTable.id, id))
    .returning({ id: leavesTable.id });

  return deleted;
};

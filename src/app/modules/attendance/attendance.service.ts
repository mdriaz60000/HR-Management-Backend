import { and, desc, eq } from "drizzle-orm";

import db from "../../db";

import {
  attendanceTable,
} from "../../db/schema/attendance.schema";

import {
  usersTable,
} from "../../db/schema/user.schema";

import type {
  CreateAttendanceInput,
  UpdateAttendanceInput,
} from "./attendance.validation";

export const createAttendance = async (
  payload: CreateAttendanceInput
) => {
  // Check user
  const [user] = await db
    .select({
      id: usersTable.id,
      isActive: usersTable.isActive,
    })
    .from(usersTable)
    .where(eq(usersTable.id, payload.userId))
    .limit(1);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isActive) {
    throw new Error("User is inactive");
  }

  const attendanceDate =
    payload.date ??
    new Date().toISOString().split("T")[0];

  // Check duplicate attendance
  const [existingAttendance] = await db
    .select()
    .from(attendanceTable)
    .where(
      and(
        eq(
          attendanceTable.userId,
          payload.userId
        ),
        eq(
          attendanceTable.date,
          attendanceDate
        )
      )
    )
    .limit(1);

  if (existingAttendance) {
    throw new Error(
      "Attendance already exists for this date"
    );
  }

  const [attendance] = await db
    .insert(attendanceTable)
    .values({
      userId: payload.userId,
      date: attendanceDate,
      checkIn: payload.checkIn
        ? new Date(payload.checkIn)
        : new Date(),
      checkOut: payload.checkOut
        ? new Date(payload.checkOut)
        : null,
      status: payload.status ?? "present",
      note: payload.note,
    })
    .returning();

  return attendance;
};


export const getAllAttendance = async () => {
  const result = await db
    .select({
      id: attendanceTable.id,

      userId: attendanceTable.userId,

      employeeName: usersTable.name,

      employeeEmail: usersTable.email,

      date: attendanceTable.date,

      checkIn: attendanceTable.checkIn,

      checkOut: attendanceTable.checkOut,

      status: attendanceTable.status,

      note: attendanceTable.note,

      createdAt: attendanceTable.createdAt,
    })
    .from(attendanceTable)
    .innerJoin(
      usersTable,
      eq(
        attendanceTable.userId,
        usersTable.id
      )
    )
    .orderBy(desc(attendanceTable.date));

  return result;
};


export const getUserAttendance = async (
  userId: string
) => {
  const result = await db
    .select({
      id: attendanceTable.id,

      userId: attendanceTable.userId,

      date: attendanceTable.date,

      checkIn: attendanceTable.checkIn,

      checkOut: attendanceTable.checkOut,

      status: attendanceTable.status,

      note: attendanceTable.note,

      createdAt: attendanceTable.createdAt,
    })
    .from(attendanceTable)
    .where(
      eq(attendanceTable.userId, userId)
    )
    .orderBy(desc(attendanceTable.date));

  return result;
};

export const getAttendanceById = async (
  id: string
) => {
  const [attendance] = await db
    .select({
      id: attendanceTable.id,

      userId: attendanceTable.userId,

      employeeName: usersTable.name,

      employeeEmail: usersTable.email,

      date: attendanceTable.date,

      checkIn: attendanceTable.checkIn,

      checkOut: attendanceTable.checkOut,

      status: attendanceTable.status,

      note: attendanceTable.note,
    })
    .from(attendanceTable)
    .innerJoin(
      usersTable,
      eq(
        attendanceTable.userId,
        usersTable.id
      )
    )
    .where(
      eq(attendanceTable.id, id)
    )
    .limit(1);

  if (!attendance) {
    throw new Error("Attendance not found");
  }

  return attendance;
};

export const updateAttendance = async (
  id: string,
  payload: UpdateAttendanceInput
) => {
  const [existingAttendance] = await db
    .select()
    .from(attendanceTable)
    .where(eq(attendanceTable.id, id))
    .limit(1);

  if (!existingAttendance) {
    throw new Error("Attendance not found");
  }

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (payload.checkIn !== undefined) {
    updateData.checkIn =
      new Date(payload.checkIn);
  }

  if (payload.checkOut !== undefined) {
    updateData.checkOut =
      new Date(payload.checkOut);
  }

  if (payload.status !== undefined) {
    updateData.status = payload.status;
  }

  if (payload.note !== undefined) {
    updateData.note = payload.note;
  }

  const [updatedAttendance] = await db
    .update(attendanceTable)
    .set(updateData)
    .where(eq(attendanceTable.id, id))
    .returning();

  return updatedAttendance;
};

export const deleteAttendance = async (
  id: string
) => {
  const [deletedAttendance] = await db
    .delete(attendanceTable)
    .where(eq(attendanceTable.id, id))
    .returning();

  if (!deletedAttendance) {
    throw new Error("Attendance not found");
  }

  return deletedAttendance;
};
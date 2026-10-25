import { and, count, desc, eq, sql } from "drizzle-orm";

import db from "../../db";
import { employeesTable } from "../../db/schema/employee.schema";
import { departmentsTable } from "../../db/schema/department.schema";
import { attendanceTable } from "../../db/schema/attendance.schema";
import { leavesTable } from "../../db/schema/leave.schema";
import { usersTable } from "../../db/schema/user.schema";
import { payrollsTable } from "../../db/schema/payroll.schema";

export const getDashboardStats = async (userId: string, role: string) => {
  const today = new Date().toISOString().split("T")[0];

  if (role === "employee") {
    const [myAttendance] = await db
      .select()
      .from(attendanceTable)
      .where(
        and(eq(attendanceTable.userId, userId), eq(attendanceTable.date, today))
      )
      .limit(1);

    const [pendingLeaves] = await db
      .select({ value: count() })
      .from(leavesTable)
      .where(
        and(eq(leavesTable.userId, userId), eq(leavesTable.status, "pending"))
      );

    const [approvedLeaves] = await db
      .select({ value: count() })
      .from(leavesTable)
      .where(
        and(eq(leavesTable.userId, userId), eq(leavesTable.status, "approved"))
      );

    const recentLeaves = await db
      .select()
      .from(leavesTable)
      .where(eq(leavesTable.userId, userId))
      .orderBy(desc(leavesTable.createdAt))
      .limit(5);

    return {
      todayAttendance: myAttendance ?? null,
      pendingLeaves: Number(pendingLeaves.value),
      approvedLeaves: Number(approvedLeaves.value),
      recentLeaves,
    };
  }

  const [employeeCount] = await db
    .select({ value: count() })
    .from(employeesTable);

  const [activeEmployees] = await db
    .select({ value: count() })
    .from(employeesTable)
    .where(eq(employeesTable.employmentStatus, "active"));

  const [departmentCount] = await db
    .select({ value: count() })
    .from(departmentsTable);

  const [userCount] = await db.select({ value: count() }).from(usersTable);

  const [presentToday] = await db
    .select({ value: count() })
    .from(attendanceTable)
    .where(
      and(
        eq(attendanceTable.date, today),
        sql`${attendanceTable.status} in ('present', 'late', 'half_day')`
      )
    );

  const [pendingLeaves] = await db
    .select({ value: count() })
    .from(leavesTable)
    .where(eq(leavesTable.status, "pending"));

  const [payrollsThisMonth] = await db
    .select({ value: count() })
    .from(payrollsTable)
    .where(
      and(
        eq(payrollsTable.month, new Date().getMonth() + 1),
        eq(payrollsTable.year, new Date().getFullYear())
      )
    );

  const recentLeaves = await db
    .select({
      id: leavesTable.id,
      employeeName: usersTable.name,
      type: leavesTable.type,
      startDate: leavesTable.startDate,
      endDate: leavesTable.endDate,
      status: leavesTable.status,
    })
    .from(leavesTable)
    .innerJoin(usersTable, eq(leavesTable.userId, usersTable.id))
    .orderBy(desc(leavesTable.createdAt))
    .limit(6);

  return {
    employees: Number(employeeCount.value),
    activeEmployees: Number(activeEmployees.value),
    departments: Number(departmentCount.value),
    users: Number(userCount.value),
    presentToday: Number(presentToday.value),
    pendingLeaves: Number(pendingLeaves.value),
    payrollsThisMonth: Number(payrollsThisMonth.value),
    recentLeaves,
  };
};

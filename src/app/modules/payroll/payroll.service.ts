import { and, desc, eq, gte, lte } from "drizzle-orm";

import db from "../../db";
import { payrollsTable } from "../../db/schema/payroll.schema";
import { employeesTable } from "../../db/schema/employee.schema";
import { usersTable } from "../../db/schema/user.schema";
import { attendanceTable } from "../../db/schema/attendance.schema";
import { leavesTable } from "../../db/schema/leave.schema";
import type {
  GeneratePayrollInput,
  UpdatePayrollInput,
} from "./payroll.validation";

const payrollSelect = {
  id: payrollsTable.id,
  employeeId: payrollsTable.employeeId,
  employeeCode: employeesTable.employeeCode,
  employeeName: usersTable.name,
  userId: employeesTable.userId,
  month: payrollsTable.month,
  year: payrollsTable.year,
  basicSalary: payrollsTable.basicSalary,
  allowances: payrollsTable.allowances,
  deductions: payrollsTable.deductions,
  netSalary: payrollsTable.netSalary,
  status: payrollsTable.status,
  paidAt: payrollsTable.paidAt,
  notes: payrollsTable.notes,
  createdAt: payrollsTable.createdAt,
};

const withRelations = () =>
  db
    .select(payrollSelect)
    .from(payrollsTable)
    .innerJoin(employeesTable, eq(payrollsTable.employeeId, employeesTable.id))
    .innerJoin(usersTable, eq(employeesTable.userId, usersTable.id));

const money = (value: number) => value.toFixed(2);

const calculateDeductions = async (
  employee: { userId: string; basicSalary: string },
  month: number,
  year: number
) => {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(endDate).padStart(2, "0")}`;
  const workingDays = 22;
  const dailyRate = Number(employee.basicSalary) / workingDays;

  const absences = await db
    .select({ id: attendanceTable.id })
    .from(attendanceTable)
    .where(
      and(
        eq(attendanceTable.userId, employee.userId),
        eq(attendanceTable.status, "absent"),
        gte(attendanceTable.date, start),
        lte(attendanceTable.date, end)
      )
    );

  const unpaidLeaves = await db
    .select({ days: leavesTable.days })
    .from(leavesTable)
    .where(
      and(
        eq(leavesTable.userId, employee.userId),
        eq(leavesTable.type, "unpaid"),
        eq(leavesTable.status, "approved"),
        gte(leavesTable.startDate, start),
        lte(leavesTable.startDate, end)
      )
    );

  const unpaidDays = unpaidLeaves.reduce((sum, row) => sum + row.days, 0);
  const deductionDays = absences.length + unpaidDays;

  return Number(money(Math.max(0, dailyRate * deductionDays)));
};

const generateForEmployee = async (
  employeeId: string,
  month: number,
  year: number,
  allowances = 0,
  notes?: string
) => {
  const [employee] = await db
    .select({
      id: employeesTable.id,
      userId: employeesTable.userId,
      basicSalary: employeesTable.basicSalary,
    })
    .from(employeesTable)
    .where(eq(employeesTable.id, employeeId))
    .limit(1);

  if (!employee) {
    throw new Error("Employee not found");
  }

  const [existing] = await db
    .select({ id: payrollsTable.id })
    .from(payrollsTable)
    .where(
      and(
        eq(payrollsTable.employeeId, employeeId),
        eq(payrollsTable.month, month),
        eq(payrollsTable.year, year)
      )
    )
    .limit(1);

  if (existing) {
    throw new Error("Payroll already exists for this period");
  }

  const deductions = await calculateDeductions(employee, month, year);
  const basic = Number(employee.basicSalary);
  const net = Math.max(0, basic + allowances - deductions);

  const [payroll] = await db
    .insert(payrollsTable)
    .values({
      employeeId,
      month,
      year,
      basicSalary: money(basic),
      allowances: money(allowances),
      deductions: money(deductions),
      netSalary: money(net),
      status: "processed",
      notes,
    })
    .returning({ id: payrollsTable.id });

  return getPayrollById(payroll.id);
};

export const generatePayroll = async (payload: GeneratePayrollInput) => {
  const allowances = payload.allowances != null ? Number(payload.allowances) : 0;

  if (payload.employeeId) {
    return generateForEmployee(
      payload.employeeId,
      payload.month,
      payload.year,
      allowances,
      payload.notes
    );
  }

  const employees = await db
    .select({ id: employeesTable.id })
    .from(employeesTable)
    .where(eq(employeesTable.employmentStatus, "active"));

  const results = [];

  for (const employee of employees) {
    try {
      results.push(
        await generateForEmployee(
          employee.id,
          payload.month,
          payload.year,
          allowances,
          payload.notes
        )
      );
    } catch (error: any) {
      if (error.message !== "Payroll already exists for this period") {
        throw error;
      }
    }
  }

  return results;
};

export const getAllPayrolls = async () => {
  return withRelations().orderBy(desc(payrollsTable.year), desc(payrollsTable.month));
};

export const getMyPayrolls = async (userId: string) => {
  return withRelations()
    .where(eq(employeesTable.userId, userId))
    .orderBy(desc(payrollsTable.year), desc(payrollsTable.month));
};

export const getPayrollById = async (id: string) => {
  const [payroll] = await withRelations()
    .where(eq(payrollsTable.id, id))
    .limit(1);

  if (!payroll) {
    throw new Error("Payroll not found");
  }

  return payroll;
};

export const updatePayroll = async (id: string, payload: UpdatePayrollInput) => {
  const existing = await getPayrollById(id);

  const allowances =
    payload.allowances != null
      ? Number(payload.allowances)
      : Number(existing.allowances);
  const deductions =
    payload.deductions != null
      ? Number(payload.deductions)
      : Number(existing.deductions);
  const net = Math.max(0, Number(existing.basicSalary) + allowances - deductions);
  const status = payload.status ?? existing.status;

  await db
    .update(payrollsTable)
    .set({
      allowances: money(allowances),
      deductions: money(deductions),
      netSalary: money(net),
      status,
      paidAt: status === "paid" ? new Date() : existing.paidAt,
      notes: payload.notes === undefined ? existing.notes : payload.notes,
      updatedAt: new Date(),
    })
    .where(eq(payrollsTable.id, id));

  return getPayrollById(id);
};

export const deletePayroll = async (id: string) => {
  const [deleted] = await db
    .delete(payrollsTable)
    .where(eq(payrollsTable.id, id))
    .returning({ id: payrollsTable.id });

  if (!deleted) {
    throw new Error("Payroll not found");
  }

  return deleted;
};

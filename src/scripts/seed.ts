import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import db from "../app/db";
import { usersTable } from "../app/db/schema/user.schema";
import { departmentsTable } from "../app/db/schema/department.schema";
import { employeesTable } from "../app/db/schema/employee.schema";

const seed = async () => {
  const adminEmail = "admin@hr.local";
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const [existingAdmin] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, adminEmail))
    .limit(1);

  let adminId = existingAdmin?.id;

  if (!adminId) {
    const [admin] = await db
      .insert(usersTable)
      .values({
        name: "System Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      })
      .returning({ id: usersTable.id });

    adminId = admin.id;
    console.log("Created admin user: admin@hr.local / Admin@123");
  } else {
    console.log("Admin user already exists");
  }

  const defaultDepartments = [
    { name: "Human Resources", description: "People operations and hiring" },
    { name: "Engineering", description: "Product and software development" },
    { name: "Finance", description: "Payroll, accounts and reporting" },
  ];

  for (const department of defaultDepartments) {
    const [existing] = await db
      .select({ id: departmentsTable.id })
      .from(departmentsTable)
      .where(eq(departmentsTable.name, department.name))
      .limit(1);

    if (!existing) {
      await db.insert(departmentsTable).values(department);
      console.log(`Created department: ${department.name}`);
    }
  }

  const [adminEmployee] = await db
    .select({ id: employeesTable.id })
    .from(employeesTable)
    .where(eq(employeesTable.userId, adminId))
    .limit(1);

  if (!adminEmployee) {
    const [hr] = await db
      .select({ id: departmentsTable.id })
      .from(departmentsTable)
      .where(eq(departmentsTable.name, "Human Resources"))
      .limit(1);

    await db.insert(employeesTable).values({
      userId: adminId,
      employeeCode: "EMP-ADMIN",
      designation: "HR Director",
      departmentId: hr?.id,
      joiningDate: new Date().toISOString().split("T")[0],
      basicSalary: "80000",
    });

    console.log("Created admin employee profile");
  }

  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});

import express, { Application, Request, Response } from "express";
import cors from "cors";
import { userRouter } from "./app/modules/user/user.route";
import { authRouter } from "./app/modules/auth/auth.routes";
import { attendanceRouter } from "./app/modules/attendance/attendance.routes";
import { departmentRouter } from "./app/modules/department/department.routes";
import { employeeRouter } from "./app/modules/employee/employee.routes";
import { leaveRouter } from "./app/modules/leave/leave.routes";
import { payrollRouter } from "./app/modules/payroll/payroll.routes";
import { dashboardRouter } from "./app/modules/dashboard/dashboard.routes";

const app: Application = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/departments", departmentRouter);
app.use("/api/v1/employees", employeeRouter);
app.use("/api/v1/leaves", leaveRouter);
app.use("/api/v1/payrolls", payrollRouter);
app.use("/api/v1/dashboard", dashboardRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("HR management backend is running");
});

export default app;
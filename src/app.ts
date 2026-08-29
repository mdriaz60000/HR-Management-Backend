import express, { Application, Request, Response } from "express";
import { userRouter } from "./app/modules/user/user.route";
import cors from "cors";
import { authRouter } from "./app/modules/auth/auth.routes";
import { attendanceRouter } from "./app/modules/attendance/attendance.routes";

const app: Application = express();


app.use(express.urlencoded({ extended: true }));


app.use(express.json());
app.use(cors());



app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/attendance", attendanceRouter);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express! hr management backend');
});

export default app
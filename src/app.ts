import express, { Application, Request, Response } from "express";
import router from "./app/modules/user/user.route";

const app: Application = express();


// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());



app.use("/api/users", router);
// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express! hr management backend');
});

export default app
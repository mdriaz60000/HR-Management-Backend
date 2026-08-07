import config from "../config";
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle(config.databaseUrl);

export default db;
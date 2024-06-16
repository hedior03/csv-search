import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { usersTable } from "./schemas/users";

const sqlite = new Database("db.sqlite");

export const db = drizzle(sqlite, { schema: { usersTable } });

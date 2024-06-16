import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const usersTable = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  age: integer("age").notNull().default(0),
  country: text("country").notNull().default(""),
  occupation: text("occupation"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).$defaultFn(
    () => new Date()
  ),
});

export const usersSchema = createSelectSchema(usersTable);

export const userInsertSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
});

export type User = z.infer<typeof usersSchema>;

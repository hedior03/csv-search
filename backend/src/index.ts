import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { HonoMemoryStorage } from "@hono-storage/memory";
import csvToJson from "convert-csv-to-json";
import { userInsertSchema, usersTable } from "./db/schemas/users";
import { db } from "./db/client";
import { eq, or, like, sql } from "drizzle-orm";
import { z } from "zod";

const commaCsvToJson = csvToJson.fieldDelimiter(",");

const storage = new HonoMemoryStorage({
  key: (c, file) => `${file.originalname}-${new Date().getTime()}`,
});

const app = new Hono();
app.use("/api/*", cors());

app.get("/api/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/api/files", storage.single("file"), async (c) => {
  const file = c.var.files.file as File;

  if (!file) {
    return c.json({ message: "File is required" }, 500);
  }

  if (file.type !== "text/csv") {
    return c.json({ message: "File must be a CSV" }, 500);
  }

  let jsonContent: Record<string, string>[] = [];
  try {
    const rawCsv = Buffer.from(await file.arrayBuffer()).toString("utf-8");
    jsonContent = commaCsvToJson.csvStringToJson(rawCsv);

    const users = jsonContent
      .map((user) => {
        const parsedUser = userInsertSchema.safeParse(user);
        if (parsedUser.success) {
          return parsedUser.data;
        }
        return null;
      })
      .filter((user) => user !== null);

    const result = await db
      .insert(usersTable)
      .values([...users])
      .onConflictDoUpdate({
        target: usersTable.email,
        set: { email: sql.raw("email") },
      })
      .returning();

    return c.json({
      message: "The file was uploaded successfully",
    });
  } catch (error: any) {
    console.error(error?.message);
    return c.json({ message: "Error parsing CSV file" }, 500);
  }
});

const querySchema = z.string().min(1);

app.get("/api/users", async ({ req, res, json }) => {
  const searchTerm = querySchema.safeParse(req.query("q"));
  if (!searchTerm.success) {
    return json({ success: false, message: searchTerm.error.issues }, 500);
  }

  const result = await db
    .select()
    .from(usersTable)
    .where(
      or(
        like(usersTable.name, `%${searchTerm.data?.toLocaleLowerCase()}%`),
        like(usersTable.email, `%${searchTerm.data?.toLocaleLowerCase()}%`),
        like(usersTable.country, `%${searchTerm.data?.toLocaleLowerCase()}%`),
        like(usersTable.occupation, `%${searchTerm.data?.toLocaleLowerCase()}%`)
      )
    );

  return json({
    data: result,
  });
});

const port = Number(process.env.BACKEND_PORT) || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

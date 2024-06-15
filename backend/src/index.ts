import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { HonoMemoryStorage } from "@hono-storage/memory";
import csvToJson from "convert-csv-to-json";

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

    return c.json({
      message: "The file was uploaded successfully",
      content: jsonContent,
    });
  } catch (error) {
    return c.json({ message: "Error parsing CSV file" }, 500);
  }
});

app.get("/api/users", ({ req, res, json }) => {
  return json({
    data: [
      {
        id: 1,
        name: "John Doe",
      },
    ],
  });
});

const port = Number(process.env.BACKEND_PORT) || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

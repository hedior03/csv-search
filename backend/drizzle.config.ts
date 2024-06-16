import { defineConfig } from "drizzle-kit";
export default defineConfig({
  dialect: "sqlite",
  dbCredentials: {
    url: "file:./db.sqlite",
  },
  schema: "./src/db/schemas/*.ts",
  out: "./.drizzle",
});

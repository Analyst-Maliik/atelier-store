import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Same files Next.js reads; the first value found wins.
config({ path: [".env.local", ".env"] });

export default defineConfig({
  dialect: "postgresql",
  casing: "snake_case",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

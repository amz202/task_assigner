import {defineConfig} from "drizzle-kit";
export default defineConfig({
  schema: "./data/schema.ts",
  out: "./config/drizzle/migration",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string
  },
  verbose: true,
  strict: true,
  sch
});
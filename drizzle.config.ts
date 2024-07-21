import { defineConfig } from "drizzle-kit";
import * as process from "node:process";

export default defineConfig({
  introspect: {
    casing: "camel",
  },
  schema: "./app/drizzle/schema.server.ts",
  dialect: "sqlite",
  verbose: true,
  out: "./app/drizzle/migrations",
  strict: true,
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
});

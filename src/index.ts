import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

import { Redis } from "@upstash/redis/cloudflare";
import { Ratelimit } from "@upstash/ratelimit";
import { Index } from "@upstash/vector";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./drizzle/schema";

import authApi from "./api/auth";
import userApi from "./api/user";
import expenseApi from "./api/expense";
import { csrf } from "hono/csrf";
import { authMiddleware } from "./middleware";

import type { Context } from "./context";

export type Bindings = {
  [key in keyof CloudflareBindings]: CloudflareBindings[key];
};

const app = new Hono<Context>();

app.use(csrf({}));
app.use("*", authMiddleware);

app
  .route("/auth", authApi)
  .route("/user", userApi)
  .route("/expenses", expenseApi);

app.use(prettyJSON());
app.use("*", cors());

app.get("/", async (c) => {
  let user = c.get("user");
  console.log(user?.email);

  return c.text(`Hello Hono!  `);
});

app.notFound((c) => c.json({ message: "Route Not Found", ok: false }, 404));

export default app;

type AppType = typeof app;

export type { AppType };

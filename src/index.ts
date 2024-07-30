import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { logger } from "hono/logger";

import { csrf } from "hono/csrf";
import { bearerAuth } from "hono/bearer-auth";

import { ipRestriction } from "hono/ip-restriction";
import { cache } from "hono/cache";

import authApi from "./api/auth";
// import {
//   type RateLimitBinding,
//   cloudflareRateLimiter,
// } from "@hono-rate-limiter/cloudflare";

import expenseApi from "./api/expense";
import userApi from "./api/user";
import { authMiddleware } from "./middleware";
import { every, some } from "hono/combine";

import { compress } from "hono/compress";

import { secureHeaders } from "hono/secure-headers";
import type { Context } from "./context";
import swaggerApp from "./middlewares/swagger.middleware";
import errorHandler from "./middlewares/error.middleware";
import { timing } from "hono/timing";
import { timeout } from "hono/timeout";

import { getConnInfo } from "hono/cloudflare-workers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { showRoutes } from "hono/dev";
import { drizzle } from "drizzle-orm/d1";
import { schema } from "./drizzle";

export type Bindings = {
  [key in keyof CloudflareBindings]: CloudflareBindings[key];
};

export const app = new Hono<Context>();

const token = "honoiscool";

// const ratelimit = new Ratelimit({
//   redis: Redis.fromEnv(c.env),
//   limiter: Ratelimit.cachedFixedWindow(5, "5 s"),
//   enableProtection: true,
//   analytics: true,
// });

app
  // Middlewares
  // .get(
  //   "*",
  //   cache({
  //     cacheName: "my-app",
  //     cacheControl: "max-age=3600",
  //   })
  // )
  .use("*", timeout(5000))
  .use(
    "*",
    secureHeaders({
      xFrameOptions: false,
      xXssProtection: false,
    })
  )
  .use(csrf({}))
  // .use(compress())
  // .use(
  //   "*",
  //   some(
  //     every(
  //       ipRestriction(getConnInfo, { allowList: ["192.168.0.2"] }),
  //       bearerAuth({ token })
  //     ),
  //     // If both conditions are met, rateLimit will not execute.
  //     rateLimit()
  //   )
  // )
  .use(logger())
  .use("*", cors())
  .use(prettyJSON())
  .use(authMiddleware)
  .use("*", timing())
  // .use("*", (c, next) => {
  //   sentry({ dsn: c.env.DB, tracesSampleRate: 0.2 });
  //   next();
  // })
  // Routes
  .route("/auth", authApi)
  .route("/user", userApi)
  .route("/app", expenseApi)
  .onError(errorHandler);

app.get("/", async (c) => {
  let user = c.get("user");

  return c.text(`Expense APP - Powered by broisnees`);
});

app.get("/seed", async (c) => {
  console.log("Seeding database...");

  const categories = [
    {
      name: "income",
      subcategories: ["salary", "bonus", "other", "reimbursement"],
    },
    {
      name: "expense",
      subcategories: [
        "rent",
        "utilities",
        "groceries",
        "entertainment",
        "travelling",
        "food",
        "feul",
        "miscellaneous",
      ],
    },
    {
      name: "savings",
      subcategories: ["savings"],
    },
  ];

  const db = drizzle(c.env.DB, {
    schema: schema,
  });

  for (const category of categories) {
    const categoryRecord = await db
      .insert(schema.categories)
      .values({ name: category.name })
      .returning();

    for (const subcategory of category.subcategories) {
      await db
        .insert(schema.subCategories)
        .values({ name: subcategory, categoryId: categoryRecord[0].id })
        .returning();
    }
  }

  return c.json({ success: true }, 200);
});

// app.notFound((c) => c.json({ message: "Route Not Found", ok: false }, 404));

export default app;

type AppType = typeof app;

export type { AppType };

// setCookie(c, "access_token", data?.session.access_token, {
//   ...(data?.session.expires_at && { expires: new Date(data.session.expires_at) }),
//   httpOnly: true,
//   path: "/",
//   secure: true,
// });

// setCookie(c, "refresh_token", data?.session.refresh_token, {
//   ...(data?.session.expires_at && { expires: new Date(data.session.expires_at) }),
//   httpOnly: true,
//   path: "/",
//   secure: true,
// });

// showRoutes(app, {
//   verbose: true,
//   colorize: true,
// });

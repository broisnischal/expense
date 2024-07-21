import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

import { Redis } from "@upstash/redis/cloudflare";
import { Ratelimit } from "@upstash/ratelimit";

type Bindings = {
  [key in keyof CloudflareBindings]: CloudflareBindings[key];
};

const authorsApp = new Hono()
  .get("/", (c) => c.json({ result: "list authors" }))
  .post("/", (c) => c.json({ result: "create an author" }, 201))
  .get("/:id", (c) => c.json({ result: `get ${c.req.param("id")}` }));

const booksApp = new Hono()
  .get("/", (c) => c.json({ result: "list books" }))
  .post("/", (c) => c.json({ result: "create a book" }, 201))
  .get("/:id", (c) => c.json({ result: `get ${c.req.param("id")}` }));

const app = new Hono<{ Bindings: Bindings }>()
  .route("/authors", authorsApp)
  .route("/books", booksApp);

app.use(prettyJSON());
app.use("*", cors());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/", (c) => c.text("Pretty Blog API"));

app.get("/limit", async (c) => {
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(c.env),
    limiter: Ratelimit.cachedFixedWindow(5, "5 s"),
    enableProtection: true,
    analytics: true,
  });

  const ip = c.req.header("X-Forwarded-For") ?? c.req.header("x-real-ip");

  const identifier = ip ?? "global";

  const { success, limit, remaining, reset } = await ratelimit.limit(
    identifier
  );

  if (!ip) {
    return c.json({
      msg: "no ip",
    });
  }

  if (!success) {
    return c.json({
      msg: "ratelimit",
      identifier: identifier,
      success: success,
      ip: ip,
      limit: limit,
      remaining: remaining,
      reset: reset,
    });
  }

  return c.json({
    msg: "ratelimit success",
    ip: ip,
    limit: limit,
    success: success,
    remaining: remaining,
    reset: reset,
  });
});

app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

export default app;

type AppType = typeof app;

export type { AppType };

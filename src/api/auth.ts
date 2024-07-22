import { Hono } from "hono";
import { Bindings } from "..";

const authApi = new Hono<{ Bindings: Bindings }>()
  .get("/", (c) => {
    return c.json({ result: "Auth API" });
  })
  .post("/signup", (c) => c.json({ result: "create an author" }, 201))
  .post("/signin", (c) => c.json({ result: `signin an author` }));

export default authApi;

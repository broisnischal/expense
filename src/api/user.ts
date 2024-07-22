import { Hono } from "hono";
import { Bindings } from "..";

const userApi = new Hono<{ Bindings: Bindings }>()
  .get("/profile", (c) => c.json({ result: `Profile ` }))
  .post("/", (c) => c.json({ result: "Update profile" }, 201));

export default userApi;

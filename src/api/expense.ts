import { Hono } from "hono";
import { Bindings } from "..";

const expenseApi = new Hono<{ Bindings: Bindings }>()
  .get("/expense", (c) => c.json({ result: `My expenses ` }))
  .post("/", (c) => c.json({ result: "Update profile" }, 201));

export default expenseApi;

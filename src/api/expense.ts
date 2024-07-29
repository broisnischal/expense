import { Hono } from "hono";
import { Bindings } from "..";
import { Context } from "../context";
import { authMiddleware } from "../middleware";
import { requireUser } from "../middlewares/auth/require_user";

const expenseApi = new Hono<Context>()
  .use(requireUser)
  .get("/", (c) => {
    return c.json({ result: `My expenses test ` });
  })
  .post("/", (c) => c.json({ result: "Update profile" }, 201));

export default expenseApi;

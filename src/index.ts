import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

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
app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

export default app;

type AppType = typeof app;

export type { AppType };

import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

import { Redis } from "@upstash/redis/cloudflare";
import { Ratelimit } from "@upstash/ratelimit";

import { Pinecone } from "@pinecone-database/pinecone";

type Bindings = {
  [key in keyof CloudflareBindings]: CloudflareBindings[key];
};

const authorsApp = new Hono()
  .get("/", (c) => {
    return c.json({ result: "list authors" });
  })
  .post("/", (c) => c.json({ result: "create an author" }, 201))
  .get("/:id", (c) => c.json({ result: `get ${c.req.param("id")}` }));

const booksApp = new Hono()
  .get("/", (c) => c.json({ result: `list books ` }))
  .post("/", (c) => c.json({ result: "create a book" }, 201))
  .get("/:id", (c) => c.json({ result: `get ${c.req.param("id")}` }));

const app = new Hono<{ Bindings: Bindings }>()
  .route("/authors", authorsApp)
  .route("/books", booksApp);

app.use(prettyJSON());
app.use("*", cors());

app.get("/", async (c) => {
  // const pc = new Pinecone({
  //   apiKey: c.env.PINE_CONE_API_KEY,
  // });

  // const index = pc.index("shopapp");

  // let ress = await index.namespace("ns1").upsert([
  //   {
  //     id: "vec1",
  //     values: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
  //     metadata: { genre: "drama" },
  //   },
  //   {
  //     id: "vec2",
  //     values: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2],
  //     metadata: { genre: "action" },
  //   },
  //   {
  //     id: "vec3",
  //     values: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3],
  //     metadata: { genre: "drama" },
  //   },
  //   {
  //     id: "vec4",
  //     values: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4],
  //     metadata: { genre: "action" },
  //   },
  // ]);

  // const res = await index.namespace("ns1").query({
  //   topK: 2,
  //   vector: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3],
  //   includeValues: true,
  //   includeMetadata: true,
  //   filter: { genre: { $eq: "action" } },
  // });

  return c.text(`Hello Hono!  `);
});

app.get("/ai", async (c) => {
  let messages = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Who won the world series in 2020?" },
    {
      role: "assistant",
      content: "The Los Angeles Dodgers won the World Series in 2020.",
    },
    { role: "user", content: "Where was it played?" },
  ];

  const answer = await c.env.AI.run("@cf/meta/llama-3-8b-instruct", {
    messages: [{ role: "user", content: `What is the square root of 9?` }],
  });

  return c.json({ answer: answer });
});

// app.post("/notes", async (c) => {
//   const { text } = await c.req.json();
//   if (!text) {
//     return c.text("Missing text", 400);
//   }

//   const { success, meta, results } = await c.env.DB.prepare(
//     "INSERT INTO notes (text) VALUES (?) RETURNING *"
//   )
//     .bind(text)
//     .all();

//   const record = results.length ? results[0] : null;

//   if (!record) {
//     return c.text("Failed to create note", 500);
//   }

//   const { data } = await c.env.AI.run("@cf/baai/bge-base-en-v1.5", {
//     text: [text],
//   });
//   const values = data[0];

//   if (!values) {
//     return c.text("Failed to generate vector embedding", 500);
//   }

//   const { id } = record;
//   const inserted = await c.env.MY_INDEX.upsert([
//     {
//       id: (id as string).toString(),
//       values,
//     },
//   ]);

//   return c.json({ id, text, inserted });
// });

//! Querying with vector index
// app.get('/', async (c) => {
//   const question = c.req.query('text') || "What is the square root of 9?"

//   const embeddings = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: question })
//   const vectors = embeddings.data[0]

//   const SIMILARITY_CUTOFF = 0.75
//   const vectorQuery = await c.env.VECTOR_INDEX.query(vectors, { topK: 1 });
//   const vecIds = vectorQuery.matches
//     .filter(vec => vec.score > SIMILARITY_CUTOFF)
//     .map(vec => vec.id)

//   let notes = []
//   if (vecIds.length) {
//     const query = `SELECT * FROM notes WHERE id IN (${vecIds.join(", ")})`
//     const { results } = await c.env.DB.prepare(query).bind().all()
//     if (results) notes = results.map(vec => vec.text)
//   }

//   const contextMessage = notes.length
//     ? `Context:\n${notes.map(note => `- ${note}`).join("\n")}`
//     : ""

//   const systemPrompt = `When answering the question or responding, use the context provided, if it is provided and relevant.`

//   const { response: answer } = await c.env.AI.run(
//     '@cf/meta/llama-3-8b-instruct',
//     {
//       messages: [
//         ...(notes.length ? [{ role: 'system', content: contextMessage }] : []),
//         { role: 'system', content: systemPrompt },
//         { role: 'user', content: question }
//       ]
//     }
//   )

//   return c.text(answer);
// })

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

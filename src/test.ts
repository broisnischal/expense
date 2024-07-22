// import { Hono } from "hono";
// import { cors } from "hono/cors";
// import { prettyJSON } from "hono/pretty-json";

// import { Redis } from "@upstash/redis/cloudflare";
// import { Ratelimit } from "@upstash/ratelimit";
// import { Index } from "@upstash/vector";
// import { drizzle } from "drizzle-orm/d1";
// import * as schema from "./drizzle/schema";

// export type Bindings = {
//   [key in keyof CloudflareBindings]: CloudflareBindings[key];
// };

// const app = new Hono<{ Bindings: Bindings }>()
//   .route("/authors", authorsApp)
//   .route("/books", booksApp);

// app.use(prettyJSON());
// app.use("*", cors());

// app.get("/", async (c) => {
//   return c.text(`Hello Hono!  `);
// });

// app.get("/ai", async (c) => {
//   let messages = [
//     { role: "system", content: "You are a helpful assistant." },
//     { role: "user", content: "Who won the world series in 2020?" },
//     {
//       role: "assistant",
//       content: "The Los Angeles Dodgers won the World Series in 2020.",
//     },
//     { role: "user", content: "Where was it played?" },
//   ];

//   const answer = await c.env.AI.run("@cf/meta/llama-3-8b-instruct", {
//     messages: [{ role: "user", content: `What is the square root of 9?` }],
//   });

//   return c.json({ answer: answer });
// });

// type Metadata = {
//   title: string;
//   genre: "sci-fi" | "fantasy" | "horror" | "action";
//   category: "classic" | "modern";
// };

// app.post("/notes", async (c) => {
//   const index = new Index<Metadata>({
//     url: "https://simple-mastiff-22376-us1-vector.upstash.io",
//     token:
//       "ABgFMHNpbXBsZS1tYXN0aWZmLTIyMzc2LXVzMWFkbWluTkRBNE9EUTJZbVl0WXpObVlpMDBNRGxtTFRobE56a3RabUpoTkdFME9ESXpOREkz",
//   });

//   const { text } = await c.req.json();

//   console.log(text);

//   if (!text) {
//     return c.text("Missing text", 400);
//   }

//   const db = drizzle(c.env.DB, {
//     schema: schema,
//   });

//   const [result] = await db
//     .insert(schema.notes)
//     .values({
//       text,
//     })
//     .returning();

//   console.log(result);

//   if (!result) {
//     return c.text("Failed to create note", 500);
//   }

//   const { data, shape } = await c.env.AI.run("@cf/baai/bge-base-en-v1.5", {
//     text: [text],
//   });

//   console.log(data[0]);

//   const values = data[0];

//   if (!values) {
//     return c.text("Failed to generate vector embedding", 500);
//   }
//   console.log("here");

//   // const { id } = record;
//   // const inserted = await c.env.MY_INDEX.upsert([
//   //   {
//   //     id: (id as string).toString(),
//   //     values,
//   //   },
//   // ]);
//   try {
//     const vectorResult = await index.upsert([
//       {
//         id: result.id.toString(),
//         vector: [...data[0]],
//         metadata: {
//           category: "classic",
//           genre: "fantasy",
//           title: "my note",
//         },
//       },
//     ]);

//     console.log(vectorResult);
//   } catch (error) {
//     console.error("Error upserting vector:", error);
//     return c.text("Failed to upsert vector", 500);
//   }

//   return c.json({ text });
// });

// //! Querying with vector index
// // app.get('/', async (c) => {
// //   const question = c.req.query('text') || "What is the square root of 9?"

// //   const embeddings = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: question })
// //   const vectors = embeddings.data[0]

// //   const SIMILARITY_CUTOFF = 0.75
// //   const vectorQuery = await c.env.VECTOR_INDEX.query(vectors, { topK: 1 });
// //   const vecIds = vectorQuery.matches
// //     .filter(vec => vec.score > SIMILARITY_CUTOFF)
// //     .map(vec => vec.id)

// //   let notes = []
// //   if (vecIds.length) {
// //     const query = `SELECT * FROM notes WHERE id IN (${vecIds.join(", ")})`
// //     const { results } = await c.env.DB.prepare(query).bind().all()
// //     if (results) notes = results.map(vec => vec.text)
// //   }

// //   const contextMessage = notes.length
// //     ? `Context:\n${notes.map(note => `- ${note}`).join("\n")}`
// //     : ""

// //   const systemPrompt = `When answering the question or responding, use the context provided, if it is provided and relevant.`

// //   const { response: answer } = await c.env.AI.run(
// //     '@cf/meta/llama-3-8b-instruct',
// //     {
// //       messages: [
// //         ...(notes.length ? [{ role: 'system', content: contextMessage }] : []),
// //         { role: 'system', content: systemPrompt },
// //         { role: 'user', content: question }
// //       ]
// //     }
// //   )

// //   return c.text(answer);
// // })

// app.get("/limit", async (c) => {
//   const ratelimit = new Ratelimit({
//     redis: Redis.fromEnv(c.env),
//     limiter: Ratelimit.cachedFixedWindow(5, "5 s"),
//     enableProtection: true,
//     analytics: true,
//   });

//   const ip = c.req.header("X-Forwarded-For") ?? c.req.header("x-real-ip");

//   const identifier = ip ?? "global";

//   const { success, limit, remaining, reset } = await ratelimit.limit(
//     identifier
//   );

//   if (!ip) {
//     return c.json({
//       msg: "no ip",
//     });
//   }

//   if (!success) {
//     return c.json({
//       msg: "ratelimit",
//       identifier: identifier,
//       success: success,
//       ip: ip,
//       limit: limit,
//       remaining: remaining,
//       reset: reset,
//     });
//   }

//   return c.json({
//     msg: "ratelimit success",
//     ip: ip,
//     limit: limit,
//     success: success,
//     remaining: remaining,
//     reset: reset,
//   });
// });

// app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

// export default app;

// type AppType = typeof app;

// export type { AppType };

// type Metadata = {
//   title: string;
//   genre: "sci-fi" | "fantasy" | "horror" | "action";
//   category: "classic" | "modern";
// };

// app.post("/notes", async (c) => {
//   const index = new Index<Metadata>({
//     url: "https://brief-grizzly-19113-us1-vector.upstash.io",
//     token:
//       "ABcFMGJyaWVmLWdyaXp6bHktMTkxMTMtdXMxYWRtaW5aRE14T0RnMk9ETXROalUwTVMwMFkyUmtMV0V6TWprdFpUVTRORFExWkRrMk1HRXc=",
//     cache: false,
//   });

//   const { text } = await c.req.json();

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

//   if (!result) {
//     return c.text("Failed to create note", 500);
//   }
//   const { data, shape } = await c.env.AI.run("@cf/baai/bge-large-en-v1.5", {
//     text: [text],
//   });

//   if (!data[0]) {
//     return c.text("Failed to generate vector embedding", 500);
//   }
//   try {
//     await index.upsert([
//       {
//         id: result.id,
//         vector: data[0],
//         metadata: {
//           category: "classic",
//           genre: "fantasy",
//           title: "my note",
//         },
//       },
//     ]);
//   } catch (error) {
//     console.error("Error upserting vector:", error);
//     return c.text("Failed to upsert vector", 500);
//   }

//   return c.json({ text });
// });

// app.get("/notes", async (c) => {
//   const question = c.req.query("q") || "What is the square root of 9?";

//   if (!question) {
//     return c.text("Missing question", 400);
//   }

//   console.log(question);

//   const index = new Index<Metadata>({
//     url: "https://brief-grizzly-19113-us1-vector.upstash.io",
//     token:
//       "ABcFMGJyaWVmLWdyaXp6bHktMTkxMTMtdXMxYWRtaW5aRE14T0RnMk9ETXROalUwTVMwMFkyUmtMV0V6TWprdFpUVTRORFExWkRrMk1HRXc=",
//     cache: false,
//   });

//   const embeddings = await c.env.AI.run("@cf/baai/bge-large-en-v1.5", {
//     text: question,
//   });

//   const SIMILARITY_CUTOFF = 0.75;

//   const vectors = embeddings.data[0];

//   let vectorQuery = await index.query({
//     vector: vectors,
//     topK: 1,
//     includeVectors: true,
//     includeMetadata: true,
//   });

//   const vecIds = vectorQuery
//     .filter((vec) => vec.score > SIMILARITY_CUTOFF)
//     .map((vec) => vec.id);

//   let notes: any[] = [];

//   if (vecIds.length) {
//     const query = `SELECT * FROM notes WHERE id IN (${vecIds.join(", ")})`;
//     const { results } = await c.env.DB.prepare(query).bind().all();
//     if (results) notes = results.map((vec) => vec.text);
//   }

//   const contextMessage = notes.length
//     ? `Context:\n${notes.map((note) => `- ${note}`).join("\n")}`
//     : "";

//   console.log(notes);

//   console.log(contextMessage);

//   const systemPrompt = `When answering the question or responding, use the context provided, if it is provided use and fine tune it and if not use relevant.`;

//   // let messages = [
//   //   ...(notes.length ? [{ role: "system", content: contextMessage }] : []),
//   //   { role: "system", content: systemPrompt },
//   //   { role: "user", content: question },
//   // ];

//   const resultvalue = await c.env.AI.run("@cf/meta/llama-3-8b-instruct", {
//     messages: [
//       notes.length
//         ? { role: "system", content: contextMessage }
//         : {
//             role: "system",
//             content: `The following is a conversation with an AI assistant. `,
//           },
//       { role: "system", content: systemPrompt },
//       { role: "user", content: question },
//     ],
//   });

//   if (!resultvalue) {
//     return c.text("No response", 500);
//   }

//   console.log(resultvalue);

//   // @ts-expect-error
//   return c.text(resultvalue?.response, 200);
// });

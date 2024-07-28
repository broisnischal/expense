import { rateLimiter } from "hono-rate-limiter";

import { RedisStore } from "@hono-rate-limiter/redis";

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  keyGenerator: (c) => "<unique_key>", // Method to generate custom identifiers for clients.
  //   store: new RedisStore({
  //     client: ,
  //   }),
  // store: ... , // Redis, MemoryStore, etc. See below.
});

// Apply the rate limiting middleware to all requests.
export default limiter;

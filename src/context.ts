import { RateLimitBinding } from "@hono-rate-limiter/cloudflare";
import type { Env } from "hono";
import { JwtVariables } from "hono/jwt";
import type { User, Session } from "lucia";

type Variables = JwtVariables;

export type Bindings = {
  [key in keyof CloudflareBindings]: CloudflareBindings[key];
} & {
  RATE_LIMITER: RateLimitBinding;
};

export interface Context extends Env {
  Variables: {
    user: User | null;
    session: Session | null;
    jwt: Variables;
    rateLimit: boolean;
  };
  Bindings: Bindings;
}

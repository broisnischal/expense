import type { Env } from "hono";
import type { User, Session } from "lucia";

export type Bindings = {
  [key in keyof CloudflareBindings]: CloudflareBindings[key];
};

export interface Context extends Env {
  Variables: {
    user: User | null;
    session: Session | null;
  };
  Bindings: Bindings;
}

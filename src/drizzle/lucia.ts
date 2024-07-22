import { D1Adapter } from "@lucia-auth/adapter-sqlite";
import { Lucia } from "lucia";
import { SelectUser } from "./schema";

export function initializeLucia(D1: D1Database) {
  const adapter = new D1Adapter(D1, {
    session: "sessions",
    user: "users",
  });

  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: process.env.NODE_ENV === "production",
      },
    },
    getUserAttributes: (user) => {
      return {
        id: user.id,
        email: user.email,
      };
    },
  });
}

declare module "lucia" {
  interface Register {
    Lucia: ReturnType<typeof initializeLucia>;
    DatabaseUserAttributes: SelectUser;
  }
}

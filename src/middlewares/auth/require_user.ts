import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { initializeLucia } from "../../drizzle/lucia";

export async function requireUser(c: Context, next: Next) {
  let lucia = initializeLucia(c.env.DB);

  let sessionId = getCookie(c, lucia.sessionCookieName) ?? null;

  console.log("Session ID:", sessionId);

  if (!sessionId) {
    c.set("user", null);
    c.set("session", null);
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (session && session.fresh) {
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
      append: true,
    });
  }

  if (!session) {
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
      append: true,
    });
  }

  c.set("user", user);
  c.set("session", session);
  return next();
}

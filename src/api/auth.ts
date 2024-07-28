import { Hono } from "hono";
import { Bindings } from "..";
import { Context } from "../context";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { schema } from "../drizzle";
import { eq } from "drizzle-orm";
import { Scrypt } from "lucia";
import { initializeLucia } from "../drizzle/lucia";
import { decode, sign, verify, jwt, JwtVariables } from "hono/jwt";

const authApi = new Hono<Context>()
  .get("/", (c) => {
    const user = c.get("user");

    if (!user) {
      return c.json(
        {
          message: "User is not authorized",
          success: false,
        },
        401
      );
    }

    return c.json({ result: "Auth API" });
  })
  .post(
    "/signup",
    zValidator(
      "json",
      z.object({
        name: z.string().min(2).max(25),
        email: z.string().email(),
        password: z.string().min(2).max(25),
      })
    ),
    async (c) => {
      const { name, email, password } = c.req.valid("json");

      const db = drizzle(c.env.DB, {
        schema: schema,
      });

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email));

      if (user) {
        return c.json({ result: "user already exists" }, 409);
      }

      const hashedPassword = await new Scrypt().hash(password);

      const [result] = await db
        .insert(schema.users)
        .values({
          name,
          email,
          password: hashedPassword,
        })
        .returning();

      if (!result) {
        return c.json(
          { result: "failed to create user, An error occured" },
          500
        );
      }

      const lucia = initializeLucia(c.env.DB);

      const session = await lucia.createSession(result.id, {});

      const cookie = lucia.createSessionCookie(session.id);

      c.header("Set-Cookie", cookie.serialize(), {
        append: true,
      });

      c.set("session", session);

      let accessToken = await sign(
        {
          id: result.id,
          session: session.id,
          exp: Math.floor(Date.now() / 1000) + 60 * 5,
        },
        c.env.ACCESS_TOKEN_SECRET
      );

      return c.json(
        { success: true, session, message: "signed up", accessToken },
        201
      );
    }
  )
  .post(
    "/signin",
    zValidator(
      "json",
      z.object({
        email: z.string().email(),
        password: z.string().min(2).max(25),
      })
    ),
    async (c) => {
      const { email, password } = await c.req.valid("json");

      const db = drizzle(c.env.DB, {
        schema: schema,
      });

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email));

      if (!user) {
        return c.json({ result: "invalid email credentials" }, 401);
      }

      const isValidPassword = await new Scrypt().verify(
        user.password,
        password
      );

      if (!isValidPassword) {
        return c.json({ result: "invalid credentials" }, 401);
      }

      const lucia = initializeLucia(c.env.DB);

      const session = await lucia.createSession(user.id, {});

      const cookie = lucia.createSessionCookie(session.id);

      c.header("Set-Cookie", cookie.serialize(), {
        append: true,
      });

      return c.json({ success: true, message: "signed in" }, 200);
    }
  )
  .post("/signout", async (c) => {
    let lucia = initializeLucia(c.env.DB);

    const session = c.get("session");

    if (session) {
      await lucia.invalidateSession(session.id);
    }

    const blankCookie = lucia.createBlankSessionCookie();

    c.header("Set-Cookie", blankCookie.serialize(), {
      append: true,
    });

    return c.json({ result: "user signed out successfully" }, 201);
  });

export default authApi;

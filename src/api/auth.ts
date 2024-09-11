import { Hono } from "hono";
import { Bindings } from "..";
import { Context } from "../context";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import schema from "../drizzle/index";
import { eq } from "drizzle-orm";
import { Lucia, Scrypt } from "lucia";
import { initializeLucia } from "../drizzle/lucia";
import { decode, sign, verify, jwt, JwtVariables } from "hono/jwt";
import { bearerAuth } from "hono/bearer-auth";

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
        contact: z.string().min(2).max(25),
        password: z.string().min(2).max(25),
      })
    ),
    async (c) => {
      const { name, email, password, contact } = c.req.valid("json");

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
          contact,
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

      const {
        city,
        longitude,
        latitude,
        country,
        postalCode,
        timezone,
        colo,
        region,
        regionCode,
      } = c.req.raw.cf!;

      const ip = c.req.header("X-Forwarded-For") ?? c.req.header("x-real-ip");

      const identifier = ip ?? "global";

      await db.insert(schema.userSessions).values({
        sessionId: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt.toString(),
        ipAddress: identifier,
        timezone: timezone as string,
        region: region as string,
        city: city as string,
        longitude: longitude,
        latitude: latitude as string,
        country: country as string,
      });

      await db.insert(schema.accounts).values({
        name: "default",
        userId: session.userId,
      });

      await db.insert(schema.wallets).values({
        name: "primary",
        userId: session.userId,
      });

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
      const { email, password } = c.req.valid("json");

      const db = drizzle(c.env.DB, {
        schema: schema,
      });

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email));

      if (!user) {
        return c.json({ result: "Invalid email credentials" }, 401);
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

      // let accessToken = await sign(
      //   {
      //     id: user.id,
      //     session: session.id,
      //     exp: Math.floor(Date.now() / 1000) + 60 * 5,
      //   },
      //   c.env.ACCESS_TOKEN_SECRET
      // );

      // const ip = c.req.raw.headers.get("CF-Connecting-IP");

      return c.json({ success: true, message: "signed in", ...session }, 200);
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

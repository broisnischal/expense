import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { generateId } from "lucia";

export const account = sqliteTable("account", {
  id: integer("id").notNull().primaryKey(),
  name: text("name").notNull(),
  type: text("type", {
    enum: ["checking", "savings"],
  })
    .notNull()
    .default("checking"),
  authorId: text("authorId")
    .notNull()
    .references(() => users.id),
  balance: integer("balance").notNull().default(0),
  createdAt: text("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").notNull().primaryKey(),
  text: text("text").notNull(),
});

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export const sessions = sqliteTable("sessions", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at").notNull(),
});

export const notes = sqliteTable("notes", {
  id: integer("id").notNull().primaryKey(),
  text: text("text").notNull(),
});

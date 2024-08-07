import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateId } from "lucia";
import { UserRole } from "../enum";
import { relations } from "drizzle-orm";
import { userSessions } from "./session";
import { accounts } from "./account";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  contact: text("contact").notNull(),
  role: text("role", {
    enum: UserRole,
  })
    .notNull()
    .default("user"),
});

export const userRelations = relations(users, ({ many }) => ({
  userSessions: many(userSessions),
  accounts: many(accounts),
}));

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

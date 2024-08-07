import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateId } from "lucia";
import { users } from "./user";
import { relations, sql } from "drizzle-orm";
import { transactions } from "./transaction";

// primary, main
export const accounts = sqliteTable("accounts", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  name: text("name").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  balance: integer("balance").notNull().default(0),
  currency: text("currency", {
    enum: ["usd", "eur", "npr"],
  }).default("npr"),
  createdAt: text("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const accountsRelation = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const wallets = sqliteTable("wallets", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  name: text("name").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  balance: integer("balance").notNull().default(0),
  createdAt: text("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  currency: text("currency", {
    enum: ["usd", "eur", "npr"],
  }).default("npr"),
});

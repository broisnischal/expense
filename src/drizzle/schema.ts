import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { generateId } from "lucia";
import { Frequency } from "./enum";

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

export const userSessions = sqliteTable("user_sessions", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  sessionId: text("session_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  deviceId: text("device_id").notNull(),
  lastSeen: integer("last_seen").notNull(),
  deviceType: text("device_type", {
    enum: ["web", "android", "ios", "desktop"],
  }),
  fcmToken: text("fcm_token"),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent").notNull(),
  expiresAt: integer("expires_at").notNull(),
});

// income, expense, transfer, credit card, savings, investment, loan, mortgage, etc
export const categories = sqliteTable("categories", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  name: text("name").notNull(),
});

// income - [ salary, bonus, sales ] , expense - [ rent, utilities, groceries, ],
export const subCategories = sqliteTable("sub_categories", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  name: text("name").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
});

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

export const transactions = sqliteTable("transactions", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id),
  subCategoryId: text("sub_category_id")
    .notNull()
    .references(() => subCategories.id),
  amount: integer("amount").notNull(),
  title: text("title").notNull(),
  note: text("note"),
  description: text("description"),
});

// export const transactionTypes = sqliteTable("transaction_types", {
//   id: integer("id").notNull().primaryKey(),
//   name: text("name").notNull(),
// });

export const recurringTransactions = sqliteTable("recurring_transactions", {
  id: integer("id").notNull().primaryKey(),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id),
  subCategoryId: text("sub_category_id")
    .notNull()
    .references(() => subCategories.id),
  amount: integer("amount").notNull(),
  frequency: text("frequency", {
    enum: Frequency,
  }).notNull(),
  startDate: integer("start_date"),
  endDate: integer("end_date"),
  // nextDate: integer("next_date").notNull(),
  // lastDate: integer("last_date").notNull(),
  transactionId: text("transaction_id")
    .notNull()
    .references(() => transactions.id),
});

// export type InsertUserSession = typeof userSessions.$inferInsert;
// export type SelectUserSession = typeof userSessions.$inferSelect;

export const debts = sqliteTable("debts", {
  id: integer("id").notNull().primaryKey(),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id),
  subCategoryId: text("sub_category_id")
    .notNull()
    .references(() => subCategories.id),
  amount: integer("amount").notNull(),
  dueDate: integer("due_date").notNull(),
  type: text("type", {
    enum: ["yowe", "iowe", "credit", "loan", "other"],
  }),
  status: text("status", {
    enum: ["pending", "paid"],
  }).notNull(),
  title: text("title").notNull(),
  contact: text("contact").notNull(),
  note: text("note").notNull(),
});

// total purchases, total sales, to receive , to give, stock value, expences etc

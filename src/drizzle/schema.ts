import { relations, sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { generateId } from "lucia";
import { Frequency, NotificationType, UserRole } from "./enum";

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

export const userSessions = sqliteTable("user_sessions", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  deviceId: text("device_id"),
  lastSeen: integer("last_seen"),
  deviceType: text("device_type", {
    enum: ["web", "android", "ios", "desktop"],
  }).default("android"),
  longitude: text("longitude"),
  latitude: text("latitude"),
  country: text("country"),
  timezone: text("timezone"),
  city: text("city"),
  region: text("region"),
  fcmToken: text("fcm_token"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: text("expires_at"),
});

export const userSessionsRelation = relations(userSessions, ({ one }) => ({
  session: one(sessions, {
    fields: [userSessions.sessionId],
    references: [sessions.id],
  }),
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

// income, expense, transfer, credit card, savings, investment, loan, mortgage, etc
export const categories = sqliteTable("categories", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  name: text("name").notNull(),
});

export const categoriesRelation = relations(categories, ({ many }) => ({
  subCategories: many(subCategories),
}));

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

export const subCategoriesRelation = relations(
  subCategories,
  ({ one, many }) => ({
    category: one(categories, {
      fields: [subCategories.categoryId],
      references: [categories.id],
    }),
    transactions: many(transactions),
  })
);

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

export const transactions = sqliteTable("transactions", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id, {
      onDelete: "cascade",
    }),
  subCategoryId: text("sub_category_id")
    .notNull()
    .references(() => subCategories.id),
  amount: integer("amount").notNull(),
  title: text("title").notNull(),
  note: text("note"),
  description: text("description"),
});

export const transactionsRelation = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  subCategory: one(subCategories, {
    fields: [transactions.subCategoryId],
    references: [subCategories.id],
  }),
}));

// schema
// export const transactionTypes = sqliteTable("transaction_types", {
//   id: integer("id").notNull().primaryKey(),
//   name: text("name").notNull(),
// });

export const recurringTransactions = sqliteTable("recurring_transactions", {
  id: integer("id").notNull().primaryKey(),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id, {
      onDelete: "cascade",
    }),
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
  // transactionId: text("transaction_id")
  //   .notNull()
  //   .references(() => transactions.id),
});

export const recurringTransactionsRelation = relations(
  recurringTransactions,
  ({ one }) => ({
    account: one(accounts, {
      fields: [recurringTransactions.accountId],
      references: [accounts.id],
    }),
    subCategory: one(subCategories, {
      fields: [recurringTransactions.subCategoryId],
      references: [subCategories.id],
    }),
  })
);

// export type InsertUserSession = typeof userSessions.$inferInsert;
// export type SelectUserSession = typeof userSessions.$inferSelect;

export const debts = sqliteTable("debts", {
  id: integer("id").notNull().primaryKey(),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id, {
      onDelete: "cascade",
    }),
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

export const subscriptionTypes = sqliteTable("subscription_types", {
  id: integer("id").notNull().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
});

export const subscriptionTypesRelation = relations(
  subscriptionTypes,
  ({ many }) => ({
    subscriptions: many(subscriptions),
  })
);

// total purchases, total sales, to receive , to give, stock value, expences etc

export const subscriptions = sqliteTable("subscriptions", {
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
  status: text("status", {
    enum: ["expired", "active", "upcoming"],
  }),
  price: integer("price").notNull(),
  subscriptionTypeId: integer("subscription_type_id")
    .notNull()
    .references(() => subscriptionTypes.id, {
      onDelete: "cascade",
    }),
  // startDate: integer("start_date"),
  // endDate: integer("end_date"),
});

export const subscriptionsRelation = relations(subscriptions, ({ one }) => ({
  account: one(accounts, {
    fields: [subscriptions.accountId],
    references: [accounts.id],
  }),
  subCategory: one(subCategories, {
    fields: [subscriptions.subCategoryId],
    references: [subCategories.id],
  }),
  subscriptionType: one(subscriptionTypes, {
    fields: [subscriptions.subscriptionTypeId],
    references: [subscriptionTypes.id],
  }),
}));

export const friends = sqliteTable("friends", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  friendId: text("friend_id")
    .notNull()
    .references(() => users.id),
  status: text("status", {
    enum: ["accepted", "pending", "rejected"],
  }),
});

export const friendRelations = relations(friends, ({ one }) => ({
  user: one(users, {
    fields: [friends.userId],
    references: [users.id],
  }),
  friend: one(users, {
    fields: [friends.friendId],
    references: [users.id],
  }),
}));

export const notifications = sqliteTable("notifications", {
  id: integer("id").notNull().primaryKey(),
  text: text("text").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  type: text("type", {
    enum: NotificationType,
  }),
  relatedId: text("related_id"),
  isRead: integer("is_read").default(0).notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

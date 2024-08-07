import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accounts } from "./account";
import { subCategories } from "./category";
import { Frequency } from "../enum";

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

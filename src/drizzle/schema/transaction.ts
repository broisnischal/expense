import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accounts } from "./account";
import { subCategories } from "./category";
import { Frequency, PaymentType } from "../enum";
import { generateId } from "lucia";

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
  paymentType: text("payment_type", {
    enum: PaymentType,
  }).default("cash"),
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

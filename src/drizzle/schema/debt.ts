import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accounts } from "./account";
import { subCategories } from "./category";

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

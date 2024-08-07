import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateId } from "lucia";
import { transactions } from "./transaction";

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
  categoryId: text("category_id")
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

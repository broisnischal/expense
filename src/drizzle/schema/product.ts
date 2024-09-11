import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateId } from "lucia";

export const products = sqliteTable("products", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  currency: text("currency", {
    enum: ["usd", "eur", "npr"],
  }).default("npr"),
  createdAt: text("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export type ProductType = typeof products.$inferSelect;
export type ProductInsertType = typeof products.$inferInsert;


// export const productsRelation = relations(products, ({ many }) => ({
//   transactions: many(transactions),
// }));
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateId } from "lucia";
import { TagColorHex } from "../enum";
import { users } from "./user";
import { relations } from "drizzle-orm";

export const tag = sqliteTable("tag", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  name: text("name").notNull(),
  color: text("color", {
    enum: TagColorHex,
  }).default("#008000"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
});

export type InsertTag = typeof tag.$inferInsert;
export type SelectTag = typeof tag.$inferSelect;

export const tagRelation = relations(tag, ({ one }) => ({
  user: one(users, {
    fields: [tag.userId],
    references: [users.id],
  }),
}));

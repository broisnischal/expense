import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateId } from "lucia";
import { users } from "./user";

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

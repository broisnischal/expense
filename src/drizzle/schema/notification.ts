import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./user";
import { NotificationType } from "../enum";

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

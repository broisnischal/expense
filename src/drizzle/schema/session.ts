import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateId } from "lucia";
import { users } from "./user";

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

// export type InsertUserSession = typeof userSessions.$inferInsert;
// export type SelectUserSession = typeof userSessions.$inferSelect;

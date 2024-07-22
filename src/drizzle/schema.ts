import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const notes = sqliteTable("notes", {
  id: integer("id").notNull().primaryKey(),
  text: text("text").notNull(),
});

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey(),
    name: text("name").default("Anonymous"),
    email: text("email").notNull().unique(),
    avatar_url: text("avatar_url").default(
      "https://static-00.iconduck.com/assets.00/user-avatar-icon-1820x2048-mp3gzcbn.png"
    ),
    type: text("type", {
      enum: ["user", "admin", "nees"],
    })
      .notNull()
      .default("user"),
    provider: text("provider").notNull(),
    providerId: text("providerId").notNull(),
  },
  (table) => {
    return {
      emailIndex: uniqueIndex("emailIndex").on(table.email),
      // provider_providerId: uniqueIndex('provider_providerId').on(table.provider, table.providerId),
    };
  }
);

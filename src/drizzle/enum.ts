export const Frequency = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
] as const;

export const NotificationType = [
  "friend_request",
  "friend_request_accepted",
  "friend_request_declined",
  "split_bill",
  "transaction",
  "debt_reminder",
  "other",
  "message",
  "event",
  "reminder",
] as const;

export const UserRole = ["user", "admin", "super_admin"] as const;

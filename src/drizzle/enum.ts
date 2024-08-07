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

export const PaymentType = ["cash", "card", "check"] as const;

export const CategoryType = ["income", "expense"] as const;

export const TagColorHex = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#00FFFF",
  "#FF00FF",
  "#C0C0C0",
  "#808080",
  "#800000",
  "#008000",
] as const;

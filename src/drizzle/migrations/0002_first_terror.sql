CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`user_id` text NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'npr',
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `debts` (
	`id` integer PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`sub_category_id` text NOT NULL,
	`amount` integer NOT NULL,
	`due_date` integer NOT NULL,
	`type` text,
	`status` text NOT NULL,
	`title` text NOT NULL,
	`contact` text NOT NULL,
	`note` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `friends` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`friend_id` text NOT NULL,
	`status` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`friend_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`type` text,
	`related_id` text,
	`is_read` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `recurring_transactions` (
	`id` integer PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`sub_category_id` text NOT NULL,
	`amount` integer NOT NULL,
	`frequency` text NOT NULL,
	`start_date` integer,
	`end_date` integer,
	`transaction_id` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sub_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category_id` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subscription_types` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`image` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` integer PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`sub_category_id` text NOT NULL,
	`amount` integer NOT NULL,
	`frequency` text NOT NULL,
	`status` text,
	`price` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`user_id` text NOT NULL,
	`device_id` text NOT NULL,
	`last_seen` integer NOT NULL,
	`device_type` text,
	`fcm_token` text,
	`ip_address` text NOT NULL,
	`user_agent` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`user_id` text NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`currency` text DEFAULT 'npr',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP TABLE `account`;--> statement-breakpoint

ALTER TABLE `transactions` ADD `account_id` text NOT NULL REFERENCES accounts(id);--> statement-breakpoint
ALTER TABLE `transactions` ADD `sub_category_id` text NOT NULL REFERENCES sub_categories(id);--> statement-breakpoint
ALTER TABLE `transactions` ADD `amount` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `title` text NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `note` text;--> statement-breakpoint
ALTER TABLE `transactions` ADD `description` text;--> statement-breakpoint

ALTER TABLE `transactions` DROP COLUMN `text`;
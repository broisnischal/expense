ALTER TABLE `transactions` ADD `payment_type` text DEFAULT 'cash';--> statement-breakpoint
ALTER TABLE `accounts` DROP COLUMN `payment_type`;
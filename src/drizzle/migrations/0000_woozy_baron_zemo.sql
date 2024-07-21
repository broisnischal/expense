CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'Anonymous',
	`email` text NOT NULL,
	`avatar_url` text DEFAULT 'https://static-00.iconduck.com/assets.00/user-avatar-icon-1820x2048-mp3gzcbn.png',
	`type` text DEFAULT 'user' NOT NULL,
	`provider` text NOT NULL,
	`providerId` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `emailIndex` ON `users` (`email`);
CREATE TABLE `app_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`theme_mode` text NOT NULL,
	`notifications_enabled` integer NOT NULL,
	`premium_active` integer NOT NULL,
	`language` text DEFAULT '' NOT NULL,
	`onboarding_completed` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_settings_user_unique` ON `app_settings` (`user_id`);--> statement-breakpoint
CREATE TABLE `daily_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`card_name` text NOT NULL,
	`arcana` text NOT NULL,
	`upright_meaning` text NOT NULL,
	`draw_date` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_cards_draw_date_unique` ON `daily_cards` (`draw_date`);--> statement-breakpoint
CREATE TABLE `entity_links` (
	`id` text PRIMARY KEY NOT NULL,
	`source_entity_type` text NOT NULL,
	`source_entity_id` text NOT NULL,
	`target_entity_type` text NOT NULL,
	`target_entity_id` text NOT NULL,
	`relation_type` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `entity_links_source_idx` ON `entity_links` (`source_entity_type`,`source_entity_id`);--> statement-breakpoint
CREATE INDEX `entity_links_target_idx` ON `entity_links` (`target_entity_type`,`target_entity_id`);--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `favorites_user_entity_unique` ON `favorites` (`user_id`,`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`mood` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `journal_entries_user_created_at_idx` ON `journal_entries` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `library_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`entity_type` text NOT NULL,
	`summary` text NOT NULL,
	`spiritual_properties` text NOT NULL,
	`correspondences` text NOT NULL,
	`cleansing_method` text NOT NULL,
	`care_note` text NOT NULL,
	`is_premium` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `library_entries_slug_unique` ON `library_entries` (`slug`);--> statement-breakpoint
CREATE INDEX `library_entries_type_idx` ON `library_entries` (`entity_type`);--> statement-breakpoint
CREATE TABLE `materials` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`linked_entry_id` text,
	FOREIGN KEY (`linked_entry_id`) REFERENCES `library_entries`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `materials_slug_unique` ON `materials` (`slug`);--> statement-breakpoint
CREATE INDEX `materials_linked_entry_id_idx` ON `materials` (`linked_entry_id`);--> statement-breakpoint
CREATE TABLE `moon_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event_date` text NOT NULL,
	`phase` text NOT NULL,
	`zodiac_sign` text NOT NULL,
	`summary` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `moon_events_event_date_idx` ON `moon_events` (`event_date`);--> statement-breakpoint
CREATE TABLE `ritual_materials` (
	`ritual_id` text NOT NULL,
	`material_id` text NOT NULL,
	`quantity_label` text,
	`sort_order` integer NOT NULL,
	PRIMARY KEY(`ritual_id`, `material_id`),
	FOREIGN KEY (`ritual_id`) REFERENCES `rituals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ritual_materials_ritual_sort_idx` ON `ritual_materials` (`ritual_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `ritual_materials_material_id_idx` ON `ritual_materials` (`material_id`);--> statement-breakpoint
CREATE TABLE `ritual_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`ritual_id` text NOT NULL,
	`step_order` integer NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`ritual_id`) REFERENCES `rituals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ritual_steps_ritual_order_unique` ON `ritual_steps` (`ritual_id`,`step_order`);--> statement-breakpoint
CREATE TABLE `rituals` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`category` text NOT NULL,
	`difficulty` text NOT NULL,
	`moon_phase` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`cover_image` text NOT NULL,
	`incantation` text NOT NULL,
	`safety_note` text NOT NULL,
	`created_at` integer NOT NULL,
	`is_premium` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rituals_slug_unique` ON `rituals` (`slug`);--> statement-breakpoint
CREATE INDEX `rituals_category_idx` ON `rituals` (`category`);--> statement-breakpoint
CREATE TABLE `subscription_cache` (
	`entitlement` text PRIMARY KEY NOT NULL,
	`is_active` integer NOT NULL,
	`updated_at` text NOT NULL,
	`expires_at` text
);
--> statement-breakpoint
CREATE TABLE `tarot_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`arcana` text NOT NULL,
	`suit` text,
	`rank` integer NOT NULL,
	`upright_meaning` text NOT NULL,
	`reversed_meaning` text NOT NULL,
	`keywords` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tarot_cards_arcana_idx` ON `tarot_cards` (`arcana`);--> statement-breakpoint
CREATE INDEX `tarot_cards_suit_idx` ON `tarot_cards` (`suit`);--> statement-breakpoint
CREATE TABLE `tarot_readings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`spread_type` text NOT NULL,
	`cards_json` text NOT NULL,
	`created_at` integer NOT NULL,
	`reading_date` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tarot_readings_user_date_idx` ON `tarot_readings` (`user_id`,`reading_date`);--> statement-breakpoint
CREATE INDEX `tarot_readings_user_created_at_idx` ON `tarot_readings` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`created_at` integer NOT NULL
);

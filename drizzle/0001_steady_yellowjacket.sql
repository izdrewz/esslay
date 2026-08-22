CREATE TABLE `archive_artifacts` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`bundle_id` text NOT NULL,
	`role` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`byte_size` integer NOT NULL,
	`page_count` integer DEFAULT 1 NOT NULL,
	`comment_count` integer DEFAULT 0 NOT NULL,
	`storage_key` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`bundle_id`) REFERENCES `archive_bundles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `archive_artifacts_owner_bundle_idx` ON `archive_artifacts` (`owner_id`,`bundle_id`);--> statement-breakpoint
CREATE TABLE `archive_bundles` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`title` text NOT NULL,
	`module_code` text DEFAULT '' NOT NULL,
	`assessment_code` text DEFAULT '' NOT NULL,
	`score` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `archive_bundles_owner_updated_idx` ON `archive_bundles` (`owner_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `archive_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`artifact_id` text NOT NULL,
	`section_number` integer NOT NULL,
	`page_number` integer,
	`text_content` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`artifact_id`) REFERENCES `archive_artifacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `archive_sections_artifact_section_idx` ON `archive_sections` (`artifact_id`,`section_number`);--> statement-breakpoint
CREATE TABLE `feedback_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`bundle_id` text NOT NULL,
	`artifact_id` text NOT NULL,
	`anchor_text` text DEFAULT '' NOT NULL,
	`comment_text` text NOT NULL,
	`category` text DEFAULT 'other' NOT NULL,
	`tone` text DEFAULT 'neutral' NOT NULL,
	`location_label` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`bundle_id`) REFERENCES `archive_bundles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`artifact_id`) REFERENCES `archive_artifacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `feedback_notes_owner_bundle_idx` ON `feedback_notes` (`owner_id`,`bundle_id`);--> statement-breakpoint
CREATE INDEX `feedback_notes_owner_category_idx` ON `feedback_notes` (`owner_id`,`category`);
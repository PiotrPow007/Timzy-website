CREATE TABLE `order_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`kind` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text NOT NULL,
	`r2_key` text NOT NULL,
	`encryption_iv` text NOT NULL,
	`plaintext_hash` text NOT NULL,
	`byte_length` integer NOT NULL,
	`retention_until` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_assets_r2_key_unique` ON `order_assets` (`r2_key`);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_order_asset_kind` ON `order_assets` (`order_id`,`kind`);
--> statement-breakpoint
CREATE INDEX `idx_order_assets_retention` ON `order_assets` (`retention_until`);
